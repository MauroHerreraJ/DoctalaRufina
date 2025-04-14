import { Text, View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ClaveModal from "../UI/ClaveModal";

function User({ navigation }) {
  const [cuenta, setCuenta] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isBorrarAccess, setIsBorrarAccess] = useState(false);

  useEffect(() => {
    const loadCuenta = async () => {
      try {
        const storedCuenta = await AsyncStorage.getItem("Cuenta");
        if (storedCuenta) {
          setCuenta(storedCuenta);
        } else {
          setCuenta("No hay una cuenta guardada");
        }
      } catch (error) {
        console.error("Error al obtener la cuenta:", error);
        setCuenta("Error al cargar la cuenta");
      }
    };

    loadCuenta();
  }, []);

  const openClaveModal = () => {
    setIsModalVisible(true); // Mostrar modal para ingresar la clave
  };
  const closeClaveModal = () => {
    setIsModalVisible(false); // Cerrar modal
  };
  const handleClaveSubmit = (claveIngresada) => {
    if (claveIngresada === '253614') {
      setIsBorrarAccess(true); // Si la clave es correcta, permitir acceso
      navigation.navigate('GrabarBorrar'); // Navegar a la pantalla GrabarBorrar
    } else {
      alert('Clave incorrecta'); // Si la clave es incorrecta
    }
    closeClaveModal(); // Cerrar modal
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>Número de cuenta:</Text>
        <Text style={styles.url}numberOfLines={0} adjustsFontSizeToFit={true}>{cuenta}</Text>
      </View>
      <View style={styles.imageContainer}>
        <Image source={require("../assets/logonuevo.png")}
          style={{ width: 59, height: 59 }} />
      </View>
      <TouchableOpacity style={styles.buttonUpdate} onPress={openClaveModal}>
        <Text style={styles.textImage}>Producto desarrollado por Desit SA</Text>
      </TouchableOpacity>
      <ClaveModal
        visible={isModalVisible}
        onClose={closeClaveModal}
        onSubmit={handleClaveSubmit}
      />

    </>
  );
}

export default User;

const styles = StyleSheet.create({

  textImage: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 15
  },
  imageContainer: {
    marginTop: 5,
    alignItems: "center",
    marginBottom: 20
  },
  withoutLicenseImage: {
    marginTop: 480
  },

  buttonUpdate: {
    marginTop: 5,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign:"center",
    paddingBottom:1,
    width: '100%'
  },
  url: {
    fontSize: 16,
    fontWeight: "bold",  
    textAlign: "center",
    color: "#000",        
    paddingHorizontal: 20, 
    width:"100%"
  },
});