import { View, StyleSheet, ImageBackground, Vibration, TouchableOpacity, Image, Animated, BackHandler, Dimensions } from "react-native";
import React, { useState, useRef, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Importar AsyncStorage
import * as SMS from 'expo-sms';
import { Alert } from 'react-native';
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
        console.error("Error al cargar colores:", error);
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
  
    console.log("🚨 Iniciando envío de evento de pánico...");
    console.log("📋 Cuenta:", numeroCuenta);
    console.log("🏘️ Barrio:", codigoBarrio);
  
    // Verificar que la app esté configurada
    if (!accessToken || !numeroCuenta) {
      console.log("❌ App no configurada correctamente");
      Alert.alert(
        'Error de Configuración',
        'La aplicación no está configurada. Por favor, ingresa tu código de barrio y número de cuenta.',
        [{ text: 'OK' }]
      );
      return;
    }
  
    try {
      // Enviar evento usando la API del neighborhood (con JWT)
      console.log("✅ Enviando evento por API del barrio...");
      const result = await sendPanicEvent(accessToken, {
        eventType: "PANIC",
        timestamp: new Date().toISOString(),
        // Puedes agregar más datos aquí (ubicación, etc.)
      });
      
      console.log("🎉 Evento enviado correctamente:", result);
      // Cerrar la app inmediatamente sin mostrar alerta
      BackHandler.exitApp();
  
    } catch (error) {
      console.error("❌ Error al enviar evento:", error);
    
      // Fallback: SMS
      const numeroDestino = '3512260271';
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
                  Alert.alert('SMS enviado correctamente');
                  BackHandler.exitApp();
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
