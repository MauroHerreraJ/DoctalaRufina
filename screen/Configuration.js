import { View, TextInput, Platform, Text, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Dimensions } from "react-native";
const { height } = Dimensions.get("window");

import SaveButton from "../component/SaveButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerNeighborhood } from "../util/Api";

function Configuration() {
    const [codigoBarrio, setCodigoBarrio] = useState("");
    const [numeroCuenta, setNumeroCuenta] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();

    // Cargar los datos guardados al iniciar la pantalla
    useEffect(() => {
        const loadData = async () => {
            try {
                const storedCodigoBarrio = await AsyncStorage.getItem("CodigoBarrio");
                const storedNumeroCuenta = await AsyncStorage.getItem("NumeroCuenta");
                if (storedCodigoBarrio) {
                    setCodigoBarrio(storedCodigoBarrio);
                }
                if (storedNumeroCuenta) {
                    setNumeroCuenta(storedNumeroCuenta);
                }
            } catch (error) {
                console.error("Error al cargar los datos:", error);
            }
        };
        loadData();
    }, []);

    // Guardar datos y registrar en el servidor
    const saveData = async () => {
        if (!codigoBarrio.trim() || !numeroCuenta.trim()) {
            Alert.alert("Error", "Por favor complete todos los campos");
            return;
        }

        setIsLoading(true);
        try {
            // Hacer POST al servidor
            const response = await registerNeighborhood({
                neighborhoodCode: codigoBarrio.trim(),
                accountNumber: numeroCuenta.trim()
            });

            if (response.status === "success" && response.data) {
                // Guardar tokens
                await AsyncStorage.setItem("accessToken", response.data.accessToken);
                await AsyncStorage.setItem("refreshToken", response.data.refreshToken);
                
                // Guardar información del barrio
                await AsyncStorage.setItem("CodigoBarrio", codigoBarrio.trim());
                await AsyncStorage.setItem("NumeroCuenta", numeroCuenta.trim());
                await AsyncStorage.setItem("Cuenta", numeroCuenta.trim()); // Mantener compatibilidad
                await AsyncStorage.setItem("neighborhoodName", response.data.neighborhood.name);
                await AsyncStorage.setItem("logoUrl", response.data.neighborhood.logoUrl);
                await AsyncStorage.setItem("primaryColor", response.data.neighborhood.primaryColor);
                await AsyncStorage.setItem("buttonColor", response.data.neighborhood.buttonColor);
                
                // Guardar backgroundColor si está disponible
                if (response.data.neighborhood.backgroundColor) {
                    await AsyncStorage.setItem("backgroundColor", response.data.neighborhood.backgroundColor);
                }

                console.log("Configuración guardada exitosamente");
                Alert.alert(
                    "Éxito", 
                    `Bienvenido a ${response.data.neighborhood.name}`,
                    [{ text: "OK", onPress: () => navigation.replace('Principal') }]
                );
            } else {
                Alert.alert("Error", "Respuesta inválida del servidor");
            }
        } catch (error) {
            console.error("Error al guardar configuración:", error);
            
            // Manejo de errores específicos
            const errorMessage = error.message || "Error desconocido";
            
            if (errorMessage.includes("not found") || errorMessage.includes("no encontrado")) {
                Alert.alert(
                    "❌ Error", 
                    "El número de cuenta no existe en este barrio.\n\nPor favor verifica:\n• Código del barrio correcto\n• Número de cuenta válido"
                );
            } else if (errorMessage.includes("already") || errorMessage.includes("ya está")) {
                Alert.alert("Error", "Este número de cuenta ya está asignado a otro dispositivo");
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
            <KeyboardAwareScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                enableOnAndroid={true}
                extraHeight={150}
            >
                <View style={styles.imputContainer}>
                    <View>
                        <Text style={styles.label}>Código del Barrio</Text>
                        <View style={styles.textContainer}>
                            <TextInput
                                style={styles.textImput}
                                placeholder="Ej: BARRIO001"
                                placeholderTextColor="#616060"
                                onChangeText={setCodigoBarrio}
                                value={codigoBarrio}
                                autoCapitalize="characters"
                                editable={!isLoading}
                            />
                            <MaterialIcons name={"location-city"} size={24} color="#000" style={styles.icon} />
                        </View>

                        <Text style={styles.label}>Número de Cuenta</Text>
                        <View style={styles.textContainer}>
                            <TextInput
                                style={styles.textImput}
                                placeholder="Ej: 0003"
                                placeholderTextColor="#616060"
                                onChangeText={setNumeroCuenta}
                                value={numeroCuenta}
                                keyboardType="numeric"
                                editable={!isLoading}
                            />
                            <MaterialIcons name={"vpn-key"} size={24} color="#000" style={styles.icon} />
                        </View>
                    </View>
                </View>
            </KeyboardAwareScrollView>
            <View style={styles.button}>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#0d47a1" />
                ) : (
                    <SaveButton 
                        onPress={saveData} 
                        isEnabled={codigoBarrio.length > 0 && numeroCuenta.length > 0} 
                    />
                )}
            </View>
        </>
    );
}

export default Configuration;

const styles = StyleSheet.create({

    button: {
        marginTop: 10,
        marginBottom: height * 0.05,  // Ajuste dinámico basado en la altura de la pantalla
        alignItems: "center",
    },
    imputContainer: {
        padding: 20,
        marginTop: 5
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#120438",
        marginBottom: 8,
        marginTop: 10,
    },
    textContainer: {
        marginTop: 3,
        marginBottom: 15,
        flexDirection: "row",
        alignItems: "center",
        borderColor: "#ffffff",
        backgroundColor: "#ffffff",
        borderRadius: 6,
    },
    textImput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ffffff",
        backgroundColor: "#ffffff",
        width: "100%",
        padding: 12,
        color: "#120438",
        borderRadius: 6,
    },
    icon: {
        marginRight: 10,
    },
})