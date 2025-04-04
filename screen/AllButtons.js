import { View, StyleSheet, ImageBackground, Vibration, TouchableOpacity, Image, Animated, BackHandler, Dimensions } from "react-native";
import React, { useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Importar AsyncStorage
import { savePost } from "../util/Api";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const AllButtons = () => {
  const [showProgressBar, setShowProgressBar] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

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
    try {
      // Obtener el número almacenado en AsyncStorage
      const numeroAlmacenado = await AsyncStorage.getItem("Cuenta");
      const cuenta = numeroAlmacenado ? numeroAlmacenado : "0"; // Si no hay número, usa "0"

      // Reemplazar el signo de interrogación en la trama
      const tramaReemplazada = `EVT;${cuenta};107;0`;
      console.log(tramaReemplazada)

      const result = await savePost({
        trama: tramaReemplazada,
        protocolo: "BSAS"
      });
      console.log(tramaReemplazada)

      console.log(`${eventType} enviado`, result);
      BackHandler.exitApp();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/126353.jpg')}
      resizeMode="cover"
      style={styles.rootScreen}>
      <View style={styles.container}>
        <TouchableOpacity onPressIn={handlePressIn} onPressOut={handlePressOut}>
          <Image
            source={require('../assets/botonpanico.png')}
            style={[styles.buttonImage, { width: width * 0.9, height: width * 0.9 }]}
          />
        </TouchableOpacity>
      </View>
      {showProgressBar && (
        <View style={styles.progressBarContainer}>
          <Animated.View style={{ width: barWidth }}>
            <LinearGradient
              colors={["#0d47a1", "#0d47a1"]}
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
  buttonImage: {
    alignItems: "center",
    borderRadius: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarContainer: {
    width: "100%",
    height: 15,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 10,
  },
  progressBar: {
    height: "100%",
    borderRadius: 8,
  },
});
