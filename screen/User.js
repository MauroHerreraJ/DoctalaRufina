import { Text, View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ClaveModal from "../UI/ClaveModal";

function User({ navigation }) {
  const [cuenta, setCuenta] = useState("");
  const [nombreBarrio, setNombreBarrio] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isBorrarAccess, setIsBorrarAccess] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar número de cuenta
        const storedCuenta = await AsyncStorage.getItem("NumeroCuenta") || await AsyncStorage.getItem("Cuenta");
        if (storedCuenta) {
          setCuenta(storedCuenta);
        } else {
          setCuenta("No hay una cuenta guardada");
        }

        // Cargar nombre del barrio
        const storedNombreBarrio = await AsyncStorage.getItem("neighborhoodName");
        if (storedNombreBarrio) {
          setNombreBarrio(storedNombreBarrio);
        } else {
          setNombreBarrio("No hay barrio configurado");
        }

        const storedFullName = await AsyncStorage.getItem("fullName");
        if (storedFullName) {
          setNombreCompleto(storedFullName);
        } else {
          setNombreCompleto("No hay datos personales cargados");
        }
      } catch (error) {
        console.error("Error al obtener los datos:", error);
        setCuenta("Error al cargar la cuenta");
        setNombreBarrio("Error al cargar el barrio");
        setNombreCompleto("Error al cargar datos personales");
      }
    };

    loadData();
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
        <Text style={styles.screenTitle}>Datos de tu licencia</Text>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Barrio</Text>
          <Text style={styles.infoValue} numberOfLines={2} adjustsFontSizeToFit>{nombreBarrio}</Text>

          <View style={styles.divider} />

          <Text style={styles.label}>Nombre y apellido</Text>
          <Text style={styles.infoValue} numberOfLines={3} adjustsFontSizeToFit>{nombreCompleto}</Text>

          <View style={styles.divider} />

          <Text style={styles.label}>Número de cuenta</Text>
          <Text style={styles.infoValue} numberOfLines={2} adjustsFontSizeToFit>{cuenta}</Text>
        </View>
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
    alignItems: "stretch",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
    backgroundColor: "#f4f4f4",
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#120438",
    textAlign: "center",
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#120438",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E88E5",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 4,
  },
});