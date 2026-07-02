import { View, TextInput, Text, Alert, ActivityIndicator, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { KeyboardAwareScrollView, KeyboardStickyView } from "react-native-keyboard-controller";
import AsyncStorage from "@react-native-async-storage/async-storage";

import SaveButton from "../component/SaveButton";
import { registerNeighborhood, getLicenseByToken } from "../util/Api";

const { height } = Dimensions.get("window");

function ConfigurationPersonal() {
  const navigation = useNavigation();
  const route = useRoute();
  const { codigoBarrio, numeroCuenta } = route.params || {};

  const [fullName, setFullName] = useState("");
  const [manzana, setManzana] = useState("");
  const [lote, setLote] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!codigoBarrio || !numeroCuenta) {
      Alert.alert(
        "Error de configuración",
        "No se encontró información del barrio. Por favor, reinicia el proceso.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }
  }, [codigoBarrio, numeroCuenta, navigation]);

  if (!codigoBarrio || !numeroCuenta) {
    return null;
  }

  const savePersonalData = async () => {
    if (!fullName.trim() || !manzana.trim() || !lote.trim() || !phoneNumber.trim()) {
      Alert.alert("Campos incompletos", "Por favor, completa todos los datos personales.");
      return;
    }

    const propertyReference = `Manzana ${manzana.trim()} - Lote ${lote.trim()}`;

    setIsLoading(true);
    try {
      const response = await registerNeighborhood({
        neighborhoodCode: codigoBarrio,
        accountNumber: numeroCuenta,
        fullName: fullName.trim(),
        propertyReference,
        phoneNumber: phoneNumber.trim(),
      });

      if (response.status === "success" && response.data) {
        // 🔍 LOG TEMPORAL: Mostrar respuesta completa del servidor
        
        // Guardar tokens
        await AsyncStorage.setItem("accessToken", response.data.accessToken);
        await AsyncStorage.setItem("refreshToken", response.data.refreshToken);

        // Guardar datos básicos
        await AsyncStorage.setItem("CodigoBarrio", codigoBarrio);
        await AsyncStorage.setItem("NumeroCuenta", numeroCuenta);
        await AsyncStorage.setItem("Cuenta", numeroCuenta);
        
        // Guardar configuración del barrio
        await AsyncStorage.setItem("neighborhoodName", response.data.neighborhood.name);
        await AsyncStorage.setItem("logoUrl", response.data.neighborhood.logoUrl);
        await AsyncStorage.setItem("primaryColor", response.data.neighborhood.primaryColor);
        await AsyncStorage.setItem("buttonColor", response.data.neighborhood.buttonColor);

        if (response.data.neighborhood.backgroundColor) {
          await AsyncStorage.setItem("backgroundColor", response.data.neighborhood.backgroundColor);
        }

        // Buscar código de licencia en la respuesta
        let licenseCode = null;
        
        if (response.data.licenseCreated?.code) {
          licenseCode = response.data.licenseCreated.code;
        } else if (response.data.licenseCode) {
          licenseCode = response.data.licenseCode;
        } else if (response.data.code) {
          licenseCode = response.data.code;
        } else if (response.data.license?.code) {
          licenseCode = response.data.license.code;
        } else if (response.data.data?.licenseCode) {
          licenseCode = response.data.data.licenseCode;
        } else if (response.data.data?.code) {
          licenseCode = response.data.data.code;
        } else if (response.data.license && typeof response.data.license === 'object') {
          licenseCode = response.data.license.code || response.data.license.licenseCode || response.data.license.id;
        }
        
        // Guardar el código de licencia si se encontró
        if (licenseCode) {
          await AsyncStorage.setItem("licenseCode", licenseCode);
        } else {
          Alert.alert(
            "⚠️ Error al guardar código de licencia",
            "No se pudo obtener el código de licencia del servidor. La aplicación puede no funcionar correctamente al reiniciar.",
            [{ text: "OK" }]
          );
        }

        // Guardar número de teléfono del barrio
        const phoneNumber = response.data.neighborhood.smsPhoneNumber || 
                           response.data.neighborhood.phoneNumber || 
                           response.data.neighborhood.phone || 
                           response.data.neighborhood.telefono ||
                           response.data.neighborhood.phone_number;
        
        if (phoneNumber) {
          await AsyncStorage.setItem("neighborhoodPhoneNumber", phoneNumber);
        }

        await AsyncStorage.setItem("fullName", fullName.trim());
        await AsyncStorage.setItem("propertyReference", propertyReference);
        await AsyncStorage.setItem("phoneNumber", phoneNumber.trim());
        Alert.alert(
          "Datos guardados",
          `¡Bienvenido/a ${fullName.trim()}!`,
          [{ text: "OK", onPress: () => navigation.replace("Principal") }]
        );
      } else {
        Alert.alert("Error", "Respuesta inválida del servidor.");
      }
    } catch (error) {
      const errorMessage = error.message || "Error desconocido";

      if (errorMessage.includes("not found") || errorMessage.includes("no encontrado")) {
        Alert.alert(
          "❌ Error",
          "El número de cuenta no existe en este barrio.\n\nPor favor verifica la información ingresada."
        );
      } else if (errorMessage.includes("already") || errorMessage.includes("ya está")) {
        Alert.alert("Error", "Este número de cuenta ya está asignado a otro dispositivo.");
      } else if (errorMessage.includes("conectar") || errorMessage.includes("Network")) {
        Alert.alert(
          "Error de Conexión",
          "No se pudo conectar con el servidor.\n\nVerifica tu conexión a internet."
        );
      } else {
        Alert.alert("Error", errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.headerBackButton} onPress={() => navigation.goBack()}>
            <Text style={styles.headerBackButtonText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Datos personales</Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>
      <KeyboardAwareScrollView>
        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre y Apellido</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ej: Juan Pérez"
              placeholderTextColor="#616060"
              onChangeText={setFullName}
              value={fullName}
            />

            <View style={styles.row}>
              <View style={[styles.rowField, styles.rowFieldLeft]}>
                <Text style={styles.label}>Manzana</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej: 5"
                  placeholderTextColor="#616060"
                  onChangeText={setManzana}
                  value={manzana}
                />
              </View>
              <View style={styles.rowField}>
                <Text style={styles.label}>Lote</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej: 12"
                  placeholderTextColor="#616060"
                  onChangeText={setLote}
                  value={lote}
                />
              </View>
            </View>

            <Text style={styles.label}>Número de teléfono</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ej: +5493515551234"
              placeholderTextColor="#616060"
              onChangeText={setPhoneNumber}
              value={phoneNumber}
              keyboardType="phone-pad"
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
      <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
        <View style={styles.button}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#0d47a1" />
          ) : (
            <SaveButton
              onPress={savePersonalData}
              isEnabled={
                fullName.trim().length > 0 &&
                manzana.trim().length > 0 &&
                lote.trim().length > 0 &&
                phoneNumber.trim().length > 0
              }
            />
          )}
        </View>
      </KeyboardStickyView>
    </>
  );
}

export default ConfigurationPersonal;

const styles = StyleSheet.create({
  headerSafeArea: {
    backgroundColor: "#0d47a1",
  },
  headerContainer: {
    backgroundColor: "#0d47a1",
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerBackButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },
  headerBackButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 80,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  inputContainer: {
    padding: 20,
    marginTop: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#120438",
    marginBottom: 8,
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ffffff",
    backgroundColor: "#ffffff",
    borderRadius: 6,
    padding: 12,
    color: "#120438",
  },
  row: {
    flexDirection: "row",
  },
  rowField: {
    flex: 1,
  },
  rowFieldLeft: {
    marginRight: 12,
  },
  button: {
    marginTop: 10,
    marginBottom: height * 0.05,
    alignItems: "center",
  },
});

