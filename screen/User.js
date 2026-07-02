import { Text, View, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';

import ClaveModal from "../UI/ClaveModal";
import DeleteLicenseModal from "../UI/DeleteLicenseModal";
import {
  clearAllAppData,
  deleteAccount,
  maskLicenseCode,
} from "../util/Api";

function User({ navigation }) {
  const [cuenta, setCuenta] = useState("");
  const [nombreBarrio, setNombreBarrio] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [licenseCode, setLicenseCode] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeletingLicense, setIsDeletingLicense] = useState(false);
  const [isBorrarAccess, setIsBorrarAccess] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedCuenta = await AsyncStorage.getItem("NumeroCuenta") || await AsyncStorage.getItem("Cuenta");
        if (storedCuenta) {
          setCuenta(storedCuenta);
        } else {
          setCuenta("No hay una cuenta guardada");
        }

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

        const storedLicenseCode = await AsyncStorage.getItem("licenseCode");
        if (storedLicenseCode) {
          setLicenseCode(storedLicenseCode);
        }
      } catch (error) {
        setCuenta("Error al cargar la cuenta");
        setNombreBarrio("Error al cargar el barrio");
        setNombreCompleto("Error al cargar datos personales");
      }
    };

    loadData();
  }, []);

  const navigateToWelcome = () => {
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
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Secondary' }],
        })
      );
    }
  };

  const openClaveModal = () => {
    setIsModalVisible(true);
  };

  const closeClaveModal = () => {
    setIsModalVisible(false);
  };

  const handleClaveSubmit = (claveIngresada) => {
    if (claveIngresada === '253614') {
      setIsBorrarAccess(true);
      navigation.navigate('GrabarBorrar');
    } else {
      alert('Clave incorrecta');
    }
    closeClaveModal();
  };

  const openDeleteLicenseFlow = () => {
    if (!licenseCode?.trim()) {
      Alert.alert(
        "Error",
        "No se encontró el código de licencia en este dispositivo."
      );
      return;
    }

    Alert.alert(
      "Eliminar licencia",
      "Está a punto de eliminar su licencia y los datos asociados en el servidor. Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Continuar",
          style: "destructive",
          onPress: () => setIsDeleteModalVisible(true),
        },
      ]
    );
  };

  const closeDeleteModal = () => {
    if (!isDeletingLicense) {
      setIsDeleteModalVisible(false);
    }
  };

  const handleConfirmDeleteLicense = async () => {
    if (!licenseCode?.trim()) {
      Alert.alert(
        "Error",
        "No se encontró el código de licencia en este dispositivo."
      );
      return;
    }

    setIsDeletingLicense(true);

    try {
      await deleteAccount(licenseCode);
      const success = await clearAllAppData();

      if (!success) {
        Alert.alert(
          "Advertencia",
          "La cuenta fue eliminada en el servidor, pero hubo un problema al limpiar los datos locales. Por favor, reinicie la aplicación."
        );
        return;
      }

      setIsDeleteModalVisible(false);
      setLicenseCode("");
      navigateToWelcome();
    } catch (error) {
      Alert.alert(
        "No se pudo eliminar",
        error.userMessage || "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
        [{ text: "Cerrar" }]
      );
    } finally {
      setIsDeletingLicense(false);
    }
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

          <View style={styles.divider} />

          <Text style={styles.label}>Código</Text>
          <Text style={styles.infoValue} numberOfLines={1} adjustsFontSizeToFit>
            {licenseCode ? maskLicenseCode(licenseCode) : "No disponible"}
          </Text>
        </View>
      </View>
      <View style={styles.imageContainer}>
        <Image source={require("../assets/logonuevo.png")}
          style={{ width: 59, height: 59 }} />
      </View>
      {licenseCode ? (
        <TouchableOpacity style={styles.deleteLicenseButton} onPress={openDeleteLicenseFlow}>
          <Text style={styles.deleteLicenseButtonText}>Eliminar licencia</Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity style={styles.buttonUpdate} onPress={openClaveModal}>
        <Text style={styles.textImage}>Producto desarrollado por Desit SA</Text>
      </TouchableOpacity>
      <ClaveModal
        visible={isModalVisible}
        onClose={closeClaveModal}
        onSubmit={handleClaveSubmit}
      />
      <DeleteLicenseModal
        visible={isDeleteModalVisible}
        onClose={closeDeleteModal}
        licenseCode={licenseCode}
        onConfirmDelete={handleConfirmDeleteLicense}
        isDeleting={isDeletingLicense}
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
  deleteLicenseButton: {
    marginHorizontal: 24,
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#c62828",
    alignItems: "center",
  },
  deleteLicenseButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
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
