import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from "@expo/vector-icons"
import { Image, View, Platform, StatusBar as RNStatusBar } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import AllButtons from './screen/AllButtons';
import Configuration from './screen/Configuration';
import ConfigurationPersonal from './screen/ConfigurationPersonal';
import User from './screen/User';
import Welcome from './screen/Welcome';
import { getNeighborhoodConfig, validateAccessToken, checkLicenseStatus } from './util/Api';
import { Alert } from 'react-native';
import GrabarBorrar from './component/GrabarBorrar';

const Stack = createNativeStackNavigator();
const BottomTabs = createBottomTabNavigator();

function AuthorizedNavigation() {
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
            console.log("🔄 Actualizando configuración del barrio desde el servidor...");
            const configResponse = await getNeighborhoodConfig(codigoBarrio);
            
            if (configResponse.status === "success" && configResponse.data) {
              const neighborhood = configResponse.data;
              
              console.log("📋 Configuración del barrio recibida:", JSON.stringify(neighborhood, null, 2));
              console.log("🔍 Campos disponibles en neighborhood:", Object.keys(neighborhood));
              
              // Verificar específicamente si smsPhoneNumber está presente (incluso si es null)
              if ('smsPhoneNumber' in neighborhood) {
                console.log("✅ Campo 'smsPhoneNumber' está presente en la respuesta");
                console.log("📞 Valor de smsPhoneNumber:", neighborhood.smsPhoneNumber);
              } else {
                console.error("❌ Campo 'smsPhoneNumber' NO está presente en la respuesta del servidor");
                console.error("❌ Según la documentación, este campo siempre debería estar presente");
              }
              
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
              // Según la documentación, smsPhoneNumber siempre estará presente (incluso si es null)
              const phoneNumber = neighborhood.smsPhoneNumber;
              
              if (phoneNumber && phoneNumber.trim() !== '') {
                await AsyncStorage.setItem("neighborhoodPhoneNumber", phoneNumber.trim());
                console.log("✅ Número de teléfono actualizado desde servidor:", phoneNumber.trim());
              } else if (phoneNumber === null || phoneNumber === undefined) {
                console.warn("⚠️ Campo 'smsPhoneNumber' es null o undefined en el servidor");
                // Verificar si existe en AsyncStorage para mantener el valor anterior
                const storedPhone = await AsyncStorage.getItem("neighborhoodPhoneNumber");
                if (storedPhone) {
                  console.log("ℹ️ Manteniendo número de teléfono guardado anteriormente:", storedPhone);
                } else {
                  console.error("❌ No hay número de teléfono configurado en el servidor ni guardado localmente");
                }
              } else {
                console.warn("⚠️ Campo 'smsPhoneNumber' está vacío o inválido:", phoneNumber);
                // Verificar si existe en AsyncStorage
                const storedPhone = await AsyncStorage.getItem("neighborhoodPhoneNumber");
                if (storedPhone) {
                  console.log("ℹ️ Manteniendo número de teléfono guardado anteriormente:", storedPhone);
                }
              }
              
              console.log("✅ Configuración del barrio actualizada correctamente");
            }
          } catch (updateError) {
            // Si falla la actualización, usar los valores guardados
            console.warn("⚠️ No se pudo actualizar la configuración del servidor, usando valores guardados:", updateError.message);
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
          console.log("⚠️ No hay código de licencia, cancelando verificación periódica");
          return;
        }
        
        console.log("🔄 Verificación periódica del estado de licencia...");
        const licenseStatusResult = await checkLicenseStatus(licenseCode);
        
        // Si la licencia está cancelada
        if (licenseStatusResult.status === "cancel" || !licenseStatusResult.isValid) {
          console.log("❌ Licencia cancelada detectada en verificación periódica");
          
          // Limpiar el intervalo
          if (intervalId) {
            clearInterval(intervalId);
          }
          
          // Mostrar alerta al usuario
          Alert.alert(
            "⚠️ Licencia Cancelada",
            "Su licencia ha sido cancelada. La aplicación se reiniciará y deberá configurarla nuevamente.",
            [
              {
                text: "OK",
                onPress: async () => {
                  // Limpiar todos los datos
                  await clearAllAppData();
                  // Forzar recarga de la app - el usuario necesitará cerrar y reabrir
                  console.log("🧹 Datos limpiados. Por favor, cierre y vuelva a abrir la aplicación.");
                }
              }
            ],
            { cancelable: false }
          );
        } else if (licenseStatusResult.isValid) {
          console.log("✅ Licencia activa (verificación periódica)");
        }
      } catch (error) {
        console.error("❌ Error en verificación periódica de licencia:", error);
      }
    };
    
    // Verificar cada 5 minutos (300000 ms)
    // Puedes ajustar este tiempo según tus necesidades
    const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos
    
    // Ejecutar verificación inmediatamente al montar
    checkLicensePeriodically();
    
    // Configurar verificación periódica
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

/**
 * Limpiar todos los datos de la app de forma segura
 * Se usa cuando la licencia es cancelada
 */
const clearAllAppData = async () => {
  try {
    console.log("🧹 Iniciando limpieza de AsyncStorage...");
    
    const keysToRemove = [
      "Cuenta",
      "accessToken",
      "refreshToken",
      "licenseCode",
      "CodigoBarrio",
      "NumeroCuenta",
      "neighborhoodName",
      "logoUrl",
      "primaryColor",
      "buttonColor",
      "backgroundColor",
      "neighborhoodPhoneNumber",
      "fullName",
      "propertyReference",
      "phoneNumber"
    ];
    
    // Intentar borrar con multiRemove primero (más eficiente)
    try {
      await AsyncStorage.multiRemove(keysToRemove);
      console.log("✅ Datos borrados correctamente con multiRemove");
    } catch (multiRemoveError) {
      console.warn("⚠️ multiRemove falló, borrando individualmente:", multiRemoveError);
      
      // Si multiRemove falla, borrar individualmente
      for (const key of keysToRemove) {
        try {
          await AsyncStorage.removeItem(key);
        } catch (individualError) {
          console.error(`❌ Error al borrar ${key}:`, individualError);
        }
      }
    }
    
    // Verificar que el accessToken se borró correctamente
    const remainingToken = await AsyncStorage.getItem("accessToken");
    if (remainingToken) {
      console.error("❌ ADVERTENCIA: accessToken aún existe, intentando borrar de nuevo...");
      await AsyncStorage.removeItem("accessToken");
    }
    
    console.log("✅ Limpieza de AsyncStorage completada");
    return true;
  } catch (error) {
    console.error("❌ Error crítico al limpiar AsyncStorage:", error);
    
    // Intentar limpiar lo más crítico al menos
    try {
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
      await AsyncStorage.removeItem("Cuenta");
    } catch (criticalError) {
      console.error("❌ Error crítico al limpiar datos esenciales:", criticalError);
    }
    
    return false;
  }
};

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

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        // Preload fonts or any other task
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verificar si existe la cuenta y el token
        const cuenta = await AsyncStorage.getItem("Cuenta");
        const accessToken = await AsyncStorage.getItem("accessToken");
        
        if (cuenta !== null && accessToken) {
          // Obtener el código de licencia desde AsyncStorage
          const licenseCode = await AsyncStorage.getItem("licenseCode");
          
          if (!licenseCode) {
            console.warn("⚠️ No se encontró el código de licencia en AsyncStorage");
            console.log("ℹ️ La app funcionará pero no se podrá verificar el estado de la licencia");
            // Por ahora, permitir acceso si no hay código (para compatibilidad)
            setIsAuthorized(true);
          } else {
            // Verificar el estado de la licencia en el servidor
            console.log("🔍 Verificando estado de licencia en el servidor...");
            const licenseStatusResult = await checkLicenseStatus(licenseCode);
            
            // Verificar si la licencia está cancelada
            if (licenseStatusResult.status === "cancel" || !licenseStatusResult.isValid) {
            // La licencia está cancelada o no es válida
            console.log("❌ Licencia cancelada o inválida, limpiando datos...");
            console.log("📋 Detalles:", licenseStatusResult.message || licenseStatusResult.status);
            
            // Limpiar todos los datos de la app
            const cleanupSuccess = await clearAllAppData();
            
            if (cleanupSuccess) {
              console.log("🧹 Datos limpiados correctamente, redirigiendo a pantalla de configuración");
            } else {
              console.warn("⚠️ Hubo problemas al limpiar algunos datos");
            }
            
              setIsAuthorized(false);
            } else if (licenseStatusResult.isValid) {
              // La licencia está activa
              console.log("✅ Licencia activa, usuario autorizado");
              setIsAuthorized(true);
            } else {
              // Error de conexión u otro problema, pero asumimos válido para no bloquear
              console.warn("⚠️ No se pudo verificar el estado de la licencia:", licenseStatusResult.message);
              console.log("ℹ️ Permitiendo acceso por defecto (error de conexión)");
              setIsAuthorized(true);
            }
          }
        } else {
          // No hay cuenta configurada
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

  if (!fontsLoaded || !appIsReady) {
    return null; // or a custom loading component
  }
  return (
    <KeyboardProvider>
      <StatusBar style='light' />
      <NavigationContainer>
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
