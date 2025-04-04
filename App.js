import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from "@expo/vector-icons"
import { Image } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AllButtons from './screen/AllButtons';
import Configuration from './screen/Configuration';
import User from './screen/User';
import welcome from './screen/Welcome';
import GrabarBorrar from './component/GrabarBorrar';

const Stack = createNativeStackNavigator();
const BottomTabs = createBottomTabNavigator();

function AuthorizedNavigation() {
  return (
    <BottomTabs.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0d47a1', height: 120 },
        headerTintColor: "white",
      }}>

      <BottomTabs.Screen
        name='Desit'
        component={AllButtons}
        options={{
          title: "DoctaPánico",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
          <Ionicons name='home-outline' size={size} color={color} />
        ),
        
          headerLeft: () => (
            <Image
              source={require("./assets/logonuevo.png")}
              style={{ width: 40, height: 40, marginLeft: 110 }}
            />
          ),
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
        component={welcome}

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
  );
}

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
    <>
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
            component={welcome}
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
            name="Home"
            component={AllButtons}
          />
        </Stack.Navigator>
      </NavigationContainer>

    </>
  );
}
