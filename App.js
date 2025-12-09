import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, useNavigation, CommonActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from "@expo/vector-icons"
import { Image, View, Platform, StatusBar as RNStatusBar } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useRef } from 'react';
import { Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import AllButtons from './screen/AllButtons';
import Configuration from './screen/Configuration';
import ConfigurationPersonal from './screen/ConfigurationPersonal';
import User from './screen/User';
import Welcome from './screen/Welcome';
import { getNeighborhoodConfig, validateAccessToken, checkLicenseStatus, clearAllAppData } from './util/Api';
import { Alert } from 'react-native';
import GrabarBorrar from './component/GrabarBorrar';

const Stack = createNativeStackNavigator();
const BottomTabs = createBottomTabNavigator();

function AuthorizedNavigation() {
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width;
  const [logoUrl, setLogoUrl] = useState(null);
  const [primaryColor, setPrimaryColor] = useState('#38a654');
  const [logoAspectRatio, setLogoAspectRatio] = useState(3);

  useEffect(() => {
    const loadNeighborhoodConfig = async () => {
      try {
        // Primero cargar desde AsyncStorage para mostrar rápido
        const storedLogoUrl = await AsyncStorage.getItem("logoUrl");
        const storedPrimaryColor = await AsyncStorage.getItem("primaryColor");
        
        if (storedLogoUrl) {
          setLogoUrl(storedLogoUrl);
        }
        if (storedPrimaryColor) {
          setPrimaryColor(storedPrimaryColor);
        }

        // Luego actualizar desde el servidor para obtener cambios recientes
        const codigoBarrio = await AsyncStorage.getItem("CodigoBarrio");
        if (codigoBarrio) {
          try {
            const configResponse = await getNeighborhoodConfig(codigoBarrio);
            
            if (configResponse.status === "success" && configResponse.data) {
              const neighborhood = configResponse.data;
              
              // Actualizar todos los valores en AsyncStorage
              if (neighborhood.logoUrl) {
                await AsyncStorage.setItem("logoUrl", neighborhood.logoUrl);
                setLogoUrl(neighborhood.logoUrl);
              }
              if (neighborhood.primaryColor) {
                await AsyncStorage.setItem("primaryColor", neighborhood.primaryColor);
                setPrimaryColor(neighborhood.primaryColor);
              }
              if (neighborhood.buttonColor) {
                await AsyncStorage.setItem("buttonColor", neighborhood.buttonColor);
              }
              if (neighborhood.backgroundColor) {
                await AsyncStorage.setItem("backgroundColor", neighborhood.backgroundColor);
              }
              if (neighborhood.name) {
                await AsyncStorage.setItem("neighborhoodName", neighborhood.name);
              }
              
              // Actualizar el número de teléfono
              const phoneNumber = neighborhood.smsPhoneNumber;
              if (phoneNumber && phoneNumber.trim() !== '') {
                await AsyncStorage.setItem("neighborhoodPhoneNumber", phoneNumber.trim());
              } else {
                // Mantener el valor anterior si existe
                const storedPhone = await AsyncStorage.getItem("neighborhoodPhoneNumber");
                if (!storedPhone) {
                  console.warn("⚠️ No hay número de teléfono configurado");
                }
              }
            }
          } catch (updateError) {
            // Si falla la actualización, usar los valores guardados
          }
        }
      } catch (error) {
        console.error("Error al cargar configuración del barrio:", error);
      }
    };
    loadNeighborhoodConfig();
  }, []);

  // Verificación periódica del estado de la licencia
  useEffect(() => {
    let intervalId = null;
    
    const checkLicensePeriodically = async () => {
      try {
        const licenseCode = await AsyncStorage.getItem("licenseCode");
        if (!licenseCode) {
          return;
        }
        
        const licenseStatusResult = await checkLicenseStatus(licenseCode);
        
        // 🔍 LOG TEMPORAL: Ver qué devolvió checkLicenseStatus
        console.log("═══════════════════════════════════════════════════════");
        console.log("📋 RESULTADO DE checkLicenseStatus:");
        console.log("═══════════════════════════════════════════════════════");
        console.log(JSON.stringify(licenseStatusResult, null, 2));
        console.log("═══════════════════════════════════════════════════════");
        
        // Si la licencia está cancelada (solo si explícitamente está cancelada)
        // "not_found" puede ser un error temporal de la BD, no tratarlo como cancelada
        if (licenseStatusResult.status === "cancel" || licenseStatusResult.status === "cancelled") {
          console.log("❌ Licencia cancelada (verificación periódica) - Redirigiendo a Welcome");
          console.log("📋 Razón:", licenseStatusResult.message || "Licencia cancelada");
          
          if (intervalId) {
            clearInterval(intervalId);
          }
          
          Alert.alert(
            "⚠️ Licencia Cancelada",
            "Su licencia ha sido cancelada. La aplicación se reiniciará y deberá configurarla nuevamente.",
            [
              {
                text: "OK",
                onPress: async () => {
                  await clearAllAppData();
                  
                  try {
                    let rootNavigation = navigation;
                    const parent = navigation.getParent();
                    if (parent) {
                      rootNavigation = parent;
                      const grandParent = parent.getParent();
                      if (grandParent) {
                        rootNavigation = grandParent;
                      }
                    }
                    
                    rootNavigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'Secondary' }],
                      })
                    );
                  } catch (navError) {
                    try {
                      navigation.dispatch(
                        CommonActions.reset({
                          index: 0,
                          routes: [{ name: 'Secondary' }],
                        })
                      );
                    } catch (fallbackError) {
                      console.error("❌ Error al redirigir:", fallbackError);
                    }
                  }
                }
              }
            ],
            { cancelable: false }
          );
        }
      } catch (error) {
        console.error("❌ Error en verificación periódica:", error);
      }
    };
    
    // Verificar cada 5 minutos (300000 ms)
    // Puedes ajustar este tiempo según tus necesidades
    const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos
    
    // NO ejecutar inmediatamente al montar (la BD puede no estar actualizada)
    // Solo configurar verificación periódica
    // La verificación al reiniciar la app se hace en el prepare() function
    intervalId = setInterval(checkLicensePeriodically, CHECK_INTERVAL);
    
    // Cleanup al desmontar
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  useEffect(() => {
    // Determinar el aspect ratio del logo (ancho / alto) para mantener proporción
    if (logoUrl) {
      Image.getSize(
        logoUrl,
        (width, height) => {
          if (width && height) {
            setLogoAspectRatio(width / height);
          }
        },
        (error) => {
          console.warn("No se pudo obtener el tamaño del logo remoto:", error);
        }
      );
    } else {
      const fallbackAsset = Image.resolveAssetSource(require("./assets/logorufina.png"));
      if (fallbackAsset?.width && fallbackAsset?.height) {
        setLogoAspectRatio(fallbackAsset.width / fallbackAsset.height);
      }
    }
  }, [logoUrl]);

  const scaleFactor = 1.584;
  const baseMaxLogoHeight = Math.min(screenWidth * 0.2, 62);
  const maxLogoHeight = baseMaxLogoHeight * scaleFactor;
  const maxLogoWidth = screenWidth * 0.66;
  const widthFromHeight = maxLogoHeight * logoAspectRatio;
  const adjustedWidth = Math.min(widthFromHeight, maxLogoWidth);
  const adjustedHeight = adjustedWidth / (logoAspectRatio || 1);
  const sideSpacer = Math.min(screenWidth * 0.12, 48);

  return (
    <BottomTabs.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: primaryColor, height: 135 },
        headerTintColor: "white",
        tabBarLabelStyle: { fontSize: 13, width: '100%', paddingBottom: 1 },
        headerTitleAlign: 'center',
        headerTitleContainerStyle: { flex: 1, alignItems: 'center' },
      }}>

      <BottomTabs.Screen
        name='Desit'
        component={AllButtons}
        options={{
          title: "",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='home-outline' size={size} color={color} />
          ),
          headerTitle: () => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Image
                source={logoUrl ? { uri: logoUrl } : require("./assets/logorufina.png")}
                style={{
                  height: adjustedHeight,
                  width: adjustedWidth,
                }}
                resizeMode="contain"
              />
            </View>
          ),
          headerLeft: () => <View style={{ width: sideSpacer }} />,
          headerRight: () => <View style={{ width: sideSpacer }} />,
        }} />


      <BottomTabs.Screen
        name="User"
        component={User}
        options={{
          title: "Sistema",
          tabBarIcon: ({ color, size }) => <Ionicons name='settings-outline' size={size} color={color} />
        }} />
    </BottomTabs.Navigator>
  );
}


function NoAuthorizedNavigation() {

  return (
    <BottomTabs.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0d47a1' },
        headerTintColor: "white",
      }}>
      <BottomTabs.Screen
        name="Welcome"
        component={Welcome}

        options={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
          tabBarIcon: ({ color, size }) => <Ionicons name='home-outline' size={size} color={color} />
        }}
      />

      <BottomTabs.Screen
        name="Configuration"
        component={Configuration}
        options={{
          tabBarStyle: { display: 'none' },
          title: "Configuración",
          tabBarIcon: ({ color, size }) => <Ionicons name='settings-outline' size={size} color={color} />
        }} />
    </BottomTabs.Navigator>
  );}

export default function App() {

  const [fontsLoaded] = useFonts({
    "open-sans": require("./fonts/OpenSans-Regular.ttf"),
    "open-sans-bold": require("./fonts/OpenSans-Bold.ttf"),
  });

  const [appIsReady, setAppIsReady] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigationRef = useRef(null);

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        // Preload fonts or any other task
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verificar si existe el código de licencia en AsyncStorage
        const licenseCode = await AsyncStorage.getItem("licenseCode");
        
        if (licenseCode) {
          // Hay código de licencia, verificar su estado en el servidor
          console.log("🔍 Verificando estado de licencia:", licenseCode);
          
          try {
            const licenseStatusResult = await checkLicenseStatus(licenseCode);
            
            // Verificar si la licencia está cancelada
            if (licenseStatusResult.status === "cancel" || licenseStatusResult.status === "cancelled") {
              console.log("❌ Licencia cancelada - Redirigiendo a Welcome");
              await clearAllAppData();
              setIsAuthorized(false);
              
              setTimeout(() => {
                if (navigationRef.current) {
                  navigationRef.current.reset({
                    index: 0,
                    routes: [{ name: 'Secondary' }],
                  });
                }
              }, 100);
            } else if (licenseStatusResult.status === "accepted" || licenseStatusResult.isValid) {
              console.log("✅ Licencia activa");
              setIsAuthorized(true);
            } else if (licenseStatusResult.status === "not_found") {
              // "not_found" puede ser un error temporal de la BD, permitir acceso
              console.warn("⚠️ Licencia no encontrada en el servidor (puede ser error temporal)");
              console.log("ℹ️ Permitiendo acceso - Se verificará nuevamente en la próxima verificación periódica");
              setIsAuthorized(true);
            } else {
              // Otros estados desconocidos, permitir acceso por seguridad
              console.warn("⚠️ Estado de licencia desconocido:", licenseStatusResult.status);
              setIsAuthorized(true);
            }
          } catch (error) {
            console.error("❌ Error al verificar licencia:", error);
            setIsAuthorized(true);
          }
        } else {
          console.log("⚠️ No hay código de licencia - Redirigiendo a Welcome");
          setIsAuthorized(false);
        }

      } catch (e) {
        console.warn("Error al preparar la app:", e);
        // En caso de error, no autorizar para forzar configuración
        setIsAuthorized(false);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (fontsLoaded && appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, appIsReady]);

  // Efecto para actualizar la navegación cuando isAuthorized cambia después de limpiar datos
  useEffect(() => {
    // Solo actuar si la app ya está lista y la navegación está montada
    if (appIsReady && navigationRef.current) {
      // Si isAuthorized cambió a false y hay datos limpiados, redirigir a Welcome
      if (!isAuthorized) {
        // Verificar si realmente no hay datos (para evitar loops)
        AsyncStorage.getItem("Cuenta").then((cuenta) => {
          AsyncStorage.getItem("CodigoBarrio").then((codigoBarrio) => {
            AsyncStorage.getItem("NumeroCuenta").then((numeroCuenta) => {
              // Si no hay datos, redirigir a Welcome
              if (!cuenta && !codigoBarrio && !numeroCuenta) {
                console.log("🔄 Redirigiendo a Welcome porque no hay datos y isAuthorized es false");
                try {
                  navigationRef.current?.reset({
                    index: 0,
                    routes: [{ name: 'Secondary' }],
                  });
                } catch (error) {
                  console.error("❌ Error al redirigir:", error);
                }
              }
            });
          });
        });
      }
    }
  }, [isAuthorized, appIsReady]);

  if (!fontsLoaded || !appIsReady) {
    return null; // or a custom loading component
  }
  return (
    <KeyboardProvider>
      <StatusBar style='light' />
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName={isAuthorized ? "Principal" : "Secondary"}>

          <Stack.Screen
            name="Secondary"
            component={NoAuthorizedNavigation}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Principal"
            component={AuthorizedNavigation}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="GrabarBorrar"
            component={GrabarBorrar}
            options={{
              title: "Borrar",
              headerStyle: { backgroundColor: '#0d47a1' },
              headerTintColor: "white",
            }}
          />
          <Stack.Screen
            name='Welcome'
            component={Welcome}
          />
          <Stack.Screen
            name="User"
            component={User}
            options={{
              presentation: "modal",
              title: "Información del Sistema",
              headerStyle: { backgroundColor: '#0d47a1' },
              headerTintColor: "white"
            }}
          />
          <Stack.Screen
            name="Configuration"
            component={Configuration}
          />
          <Stack.Screen
            name="ConfigurationPersonal"
            component={ConfigurationPersonal}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Home"
            component={AllButtons}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </KeyboardProvider>
  );
}
