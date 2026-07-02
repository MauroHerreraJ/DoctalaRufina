import { View, StyleSheet, ImageBackground, Vibration, TouchableOpacity, Image, Animated, BackHandler, Dimensions, Platform } from "react-native";
import React, { useState, useRef, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Importar AsyncStorage
import * as SMS from 'expo-sms';
import { Alert } from 'react-native';
import * as Linking from 'expo-linking';
import { sendPanicEvent } from "../util/Api";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const AllButtons = () => {
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [progressColor, setProgressColor] = useState("#0d47a1"); // Color por defecto
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Cargar color de la barra de progreso del barrio
  useEffect(() => {
    const loadColors = async () => {
      try {
        const storedPrimaryColor = await AsyncStorage.getItem("primaryColor");
        
        if (storedPrimaryColor) {
          setProgressColor(storedPrimaryColor);
        }
      } catch (error) {
      }
    };
    loadColors();
  }, []);

  const handlePressIn = () => {
    setShowProgressBar(true);
    animatedValue.setValue(0);

    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 900,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        enviarEvento("ALARM");
        setShowProgressBar(false);
      }
    });
  };

  const handlePressOut = () => {
    animatedValue.stopAnimation();
    setShowProgressBar(false);
  };

  const barWidth = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const enviarEvento = async (eventType) => {
    Vibration.vibrate(500);
  
    // Obtener token y datos de la cuenta
    const accessToken = await AsyncStorage.getItem("accessToken");
    const numeroCuenta = await AsyncStorage.getItem("NumeroCuenta");
    const codigoBarrio = await AsyncStorage.getItem("CodigoBarrio");
    // Obtener el número de teléfono del barrio desde AsyncStorage
    const numeroDestino = await AsyncStorage.getItem("neighborhoodPhoneNumber");
  
    // Verificar que la app esté configurada
    if (!accessToken || !numeroCuenta) {
      Alert.alert(
        'Error de Configuración',
        'La aplicación no está configurada. Por favor, ingresa tu código de barrio y número de cuenta.',
        [{ text: 'OK' }]
      );
      return;
    }
  
    try {
      // Enviar evento usando la API del neighborhood (con JWT)
      const result = await sendPanicEvent(accessToken, {
        eventType: "PANIC",
        timestamp: new Date().toISOString(),
        // Puedes agregar más datos aquí (ubicación, etc.)
      });
      
      // Minimizar/cerrar la app inmediatamente sin mostrar alerta
      // Esto es importante para seguridad: ocultar la app del atacante
      if (Platform.OS === 'android') {
        BackHandler.exitApp();
      } else {
        // iOS no permite cerrar apps. Ver APP_STORE_REVIEW_NOTES.md para el revisor.
        try {
          // Método más efectivo: abrir Settings (minimiza la app actual)
          Linking.openURL('app-settings:').catch(() => {
            // Fallback 1: Intentar abrir tel: (abre el marcador, minimiza la app)
            setTimeout(() => {
              Linking.openURL('tel:').catch(() => {
                // Fallback 2: Intentar abrir mailto: (abre Mail, minimiza la app)
                setTimeout(() => {
                  Linking.openURL('mailto:').catch(() => {
                  });
                }, 50);
              });
            }, 100);
          });
        } catch (error) {
        }
      }
  
    } catch (error) {
    
      // Verificar si existe el número de teléfono del barrio
      if (!numeroDestino) {
        Alert.alert(
          '❌ Error de Configuración',
          'No se pudo enviar el evento por Internet y no se encontró el número de teléfono del barrio configurado.\n\nPor favor, contacta al administrador del barrio para configurar el número de teléfono.',
          [{ text: 'OK' }]
        );
        return;
      }
    
      // Fallback: SMS
      const mensaje = `EVT;${numeroCuenta};107;0`;
    
      const isAvailable = await SMS.isAvailableAsync();
    
      if (isAvailable) {
        Alert.alert(
          '⚠️ Aviso',
          'No se pudo enviar el evento por Internet. Se abrirá la aplicación de mensajes para enviarlo manualmente. ¿Deseas continuar?',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
            },
            {
              text: 'Aceptar',
              onPress: async () => {
                const { result } = await SMS.sendSMSAsync([numeroDestino], mensaje);
                if (result === 'sent') {
                  // No mostrar alerta para no alertar al atacante
                  // Minimizar la app inmediatamente
                  if (Platform.OS === 'android') {
                    BackHandler.exitApp();
                  } else {
                    // En iOS, intentar minimizar la app inmediatamente
                    try {
                      Linking.openURL('app-settings:').catch(() => {
                        setTimeout(() => {
                          Linking.openURL('tel:').catch(() => {
                            setTimeout(() => {
                              Linking.openURL('mailto:').catch(() => {
                              });
                            }, 50);
                          });
                        }, 100);
                      });
                    } catch (error) {
                    }
                  }
                }
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert(
          'Error', 
          'No se pudo enviar la alerta por Internet y la función de SMS no está disponible en este dispositivo.\n\nPor favor verifica tu conexión.'
        );
      }
    }
  };
  
  
  return (
    <ImageBackground
      source={require('../assets/126353.jpg')}
      resizeMode="cover"
      style={styles.rootScreen}>
      <View style={styles.container}>
        <TouchableOpacity 
          onPressIn={handlePressIn} 
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <Image
            source={require('../assets/botonpanico.png')}
            style={{ width: width * 0.7, height: width * 0.7 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      {showProgressBar && (
        <View style={styles.progressBarContainer}>
          <Animated.View style={{ width: barWidth }}>
            <LinearGradient
              colors={[progressColor, progressColor]}
              style={styles.progressBar}
            />
          </Animated.View>
        </View>
      )}
    </ImageBackground>
  );
};
export default AllButtons;
const styles = StyleSheet.create({
  rootScreen: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: 15,
    backgroundColor: "#e0e0e0",
    overflow: "hidden",
  },
  progressBar: {
    width: "100%",
    height: "100%",
  },
});
