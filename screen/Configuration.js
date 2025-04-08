import { View, TextInput, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Dimensions } from "react-native";
const { height } = Dimensions.get("window");

import SaveButton from "../component/SaveButton";
import AsyncStorage from "@react-native-async-storage/async-storage";

function Configuration() {
    const [cuenta, setCodigo] = useState("");
    const navigation = useNavigation();

    // Cargar el dato guardado al iniciar la pantalla
    useEffect(() => {
        const loadData = async () => {
            try {
                const storedValue = await AsyncStorage.getItem("Cuenta");
                if (storedValue) {
                    setCodigo(storedValue);
                }
            } catch (error) {
                console.error("Error al cargar la cuenta:", error);
            }
        };
        loadData();
    }, []);

    // Guardar dato en AsyncStorage
    const saveData = async () => {
        try {
            await AsyncStorage.setItem("Cuenta", cuenta);
            console.log("Cuenta guardada:", cuenta);
            navigation.replace('Principal');
        } catch (error) {
            console.error("Error al guardar su cuenta:", error);
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
                        <View style={styles.textContainer}>
                            <TextInput
                                style={styles.textImput}
                                placeholder="Ingrese su número de cuenta"
                                placeholderTextColor="#616060"
                                onChangeText={setCodigo}
                                value={cuenta}
                            />
                            <MaterialIcons name={"vpn-key"} size={24} color="#000" style={styles.icon} />
                        </View>
                    </View>
                </View>
            </KeyboardAwareScrollView>
            <View style={styles.button}>
                <SaveButton onPress={saveData} isEnabled={cuenta.length > 0} />
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