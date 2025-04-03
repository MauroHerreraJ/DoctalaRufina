import { Text, View, StyleSheet, Image, TouchableOpacity } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import ClaveModal from "../UI/ClaveModal";

function User({ navigation }) {
  const [url, setUrl] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isBorrarAccess, setIsBorrarAccess] = useState(false);

  useEffect(() => {
    const loadUrl = async () => {
      try {
        const storedUrl = await AsyncStorage.getItem("API_URL");
        if (storedUrl) {
          setUrl(`https://${storedUrl}`); // 🔹 Se concatena "https://" si es necesario
        } else {
          setUrl("No hay una URL guardada");
        }
      } catch (error) {
        console.error("Error al obtener la URL:", error);
        setUrl("Error al cargar la URL");
      }
    };

    loadUrl();
  }, []);


  const Borrar = async () => {
    await AsyncStorage.removeItem("API_URL");
    console.log('borrado');
  };
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
        <Text style={styles.label}>URL Guardada:</Text>
        <Text style={styles.url}>{url}</Text>
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
  },
  url: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
});