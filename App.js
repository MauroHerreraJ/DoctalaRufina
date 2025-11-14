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
        const storedLogoUrl = await AsyncStorage.getItem("logoUrl");
        const storedPrimaryColor = await AsyncStorage.getItem("primaryColor");
        
        if (storedLogoUrl) {
          setLogoUrl(storedLogoUrl);
        }
        if (storedPrimaryColor) {
          setPrimaryColor(storedPrimaryColor);
        }
      } catch (error) {
        console.error("Error al cargar configuración del barrio:", error);
      }
    };
    loadNeighborhoodConfig();
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

  const scaleFactor = 1.44;
  const baseMaxLogoHeight = Math.min(screenWidth * 0.18, 56);
  const maxLogoHeight = baseMaxLogoHeight * scaleFactor;
  const maxLogoWidth = screenWidth * 0.6;
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

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        // Preload fonts or any other task
        await new Promise(resolve => setTimeout(resolve, 2000));
        const data = await AsyncStorage.getItem("Cuenta");
        if (data !== null) {
          setIsAuthorized(true); // Usuario ya configurado
        }

      } catch (e) {
        console.warn(e);
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
