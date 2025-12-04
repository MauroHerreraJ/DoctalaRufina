import { View, TextInput, Text, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { KeyboardAwareScrollView, KeyboardStickyView } from "react-native-keyboard-controller";
import { Dimensions } from "react-native";
const { height } = Dimensions.get("window");

import SaveButton from "../component/SaveButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getNeighborhoodConfig, validateAccountNumber } from "../util/Api";

function Configuration() {
    const [codigoBarrio, setCodigoBarrio] = useState("");
    const [numeroCuenta, setNumeroCuenta] = useState("");
    const [isValidating, setIsValidating] = useState(false);
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

    // Validar los datos con la API
    const validateData = async () => {
        const codigoBarrioTrimmed = codigoBarrio.trim();
        const numeroCuentaTrimmed = numeroCuenta.trim();

        // Validar que los campos no estén vacíos
        if (!codigoBarrioTrimmed) {
            Alert.alert("Dato inválido", "El código del barrio no puede estar vacío");
            return false;
        }

        if (!numeroCuentaTrimmed) {
            Alert.alert("Dato inválido", "El número de cuenta no puede estar vacío");
            return false;
        }

        // Validar formato básico del código del barrio
        if (codigoBarrioTrimmed.length < 3) {
            Alert.alert("Dato inválido", "El código del barrio debe tener al menos 3 caracteres");
            return false;
        }

        if (!/^[A-Za-z0-9]+$/.test(codigoBarrioTrimmed)) {
            Alert.alert("Dato inválido", "El código del barrio solo puede contener letras y números");
            return false;
        }

        // Validar formato básico del número de cuenta
        if (!/^\d+$/.test(numeroCuentaTrimmed)) {
            Alert.alert("Dato inválido", "El número de cuenta solo puede contener números");
            return false;
        }

        // Validar con la API
        setIsValidating(true);
        try {
            // Paso 1: Verificar que el código de barrio existe
            const configResponse = await getNeighborhoodConfig(codigoBarrioTrimmed);
            
            if (configResponse.status !== "success" || !configResponse.data) {
                Alert.alert("Dato inválido", "El código del barrio no existe o no está disponible");
                setIsValidating(false);
                return false;
            }

            // Paso 2: Verificar que el número de cuenta existe en este barrio
            try {
                const accountValidation = await validateAccountNumber(codigoBarrioTrimmed, numeroCuentaTrimmed);
                
                if (accountValidation.status !== "success") {
                    Alert.alert("Error de validación", "No se pudo validar el número de cuenta. Por favor, intenta nuevamente.");
                    setIsValidating(false);
                    return false;
                }

                const { exists, available } = accountValidation.data || {};
                
                if (!exists) {
                    Alert.alert("Dato inválido", "El número de cuenta no existe en este barrio");
                    setIsValidating(false);
                    return false;
                }

                if (!available) {
                    Alert.alert("Dato inválido", "Este número de cuenta ya está asignado a otro dispositivo");
                    setIsValidating(false);
                    return false;
                }

                // Si llegamos aquí, el número de cuenta existe y está disponible
                setIsValidating(false);
                return true;
            } catch (accountError) {
                setIsValidating(false);
                console.error("Error validando número de cuenta:", accountError);
                
                if (accountError.response) {
                    // El servidor respondió con un error
                    if (accountError.response.status === 404) {
                        Alert.alert("Dato inválido", "El número de cuenta no existe en este barrio");
                    } else {
                        Alert.alert("Error de validación", "No se pudo validar el número de cuenta. Por favor, intenta nuevamente.");
                    }
                } else if (accountError.request) {
                    Alert.alert("Error de conexión", "No se pudo conectar con el servidor. Verifica tu conexión a internet.");
                } else {
                    Alert.alert("Error", "Ocurrió un error al validar el número de cuenta. Por favor, intenta nuevamente.");
                }
                return false;
            }
        } catch (error) {
            setIsValidating(false);
            console.error("Error validando datos:", error);
            
            if (error.response) {
                // El servidor respondió con un error
                if (error.response.status === 404) {
                    Alert.alert("Dato inválido", "El código del barrio no existe");
                } else {
                    Alert.alert("Error de validación", "No se pudo validar el código del barrio. Por favor, intenta nuevamente.");
                }
            } else if (error.request) {
                Alert.alert("Error de conexión", "No se pudo conectar con el servidor. Verifica tu conexión a internet.");
            } else {
                Alert.alert("Error", "Ocurrió un error al validar los datos. Por favor, intenta nuevamente.");
            }
            return false;
        }
    };

    // Continuar hacia la pantalla de datos personales
    const saveData = async () => {
        const isValid = await validateData();
        if (!isValid) {
            return;
        }

        navigation.navigate("ConfigurationPersonal", {
            codigoBarrio: codigoBarrio.trim(),
            numeroCuenta: numeroCuenta.trim(),
        });
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
                                placeholderTextColor="#616060"
                                onChangeText={setCodigoBarrio}
                                value={codigoBarrio}
                                autoCapitalize="characters"
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
                            />
                            <MaterialIcons name={"vpn-key"} size={24} color="#000" style={styles.icon} />
                        </View>
                    </View>
                </View>
            </KeyboardAwareScrollView>
            <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
                <View style={styles.button}>
                    {isValidating ? (
                        <ActivityIndicator size="large" color="#0d47a1" />
                    ) : (
                        <SaveButton 
                            onPress={saveData} 
                            isEnabled={codigoBarrio.length > 0 && numeroCuenta.length > 0 && !isValidating} 
                            label="Continuar"
                        />
                    )}
                </View>
            </KeyboardStickyView>
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