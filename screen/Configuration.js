import { View, TextInput, Text, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Dimensions } from "react-native";
const { height } = Dimensions.get("window");

import SaveButton from "../component/SaveButton";
import AsyncStorage from "@react-native-async-storage/async-storage";

function Configuration() {
    const [codigoBarrio, setCodigoBarrio] = useState("");
    const [numeroCuenta, setNumeroCuenta] = useState("");
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

    // Continuar hacia la pantalla de datos personales
    const saveData = () => {
        if (!codigoBarrio.trim() || !numeroCuenta.trim()) {
            Alert.alert("Error", "Por favor complete todos los campos");
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
                                placeholder="Ej: BARRIO001"
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
            <View style={styles.button}>
                <SaveButton 
                    onPress={saveData} 
                    isEnabled={codigoBarrio.length > 0 && numeroCuenta.length > 0} 
                    label="Continuar"
                />
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