import { View, TextInput, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Dimensions } from "react-native";
const { height,width } = Dimensions.get("window");

import SaveButton from "../component/SaveButton";
import AsyncStorage from "@react-native-async-storage/async-storage";

function Configuration() {
    const [codigo, setCodigo] = useState("");
    const navigation = useNavigation();
    

    // Cargar el dato guardado al iniciar la pantalla
    useEffect(() => {
        const loadData = async () => {
            try {
                const storedValue = await AsyncStorage.getItem("API_URL");
                if (storedValue) {
                    setCodigo(storedValue);
                }
            } catch (error) {
                console.error("Error al cargar el código:", error);
            }
        };
        loadData();
    }, []);

    // Guardar dato en AsyncStorage
    const saveData = async () => {
        try {
            await AsyncStorage.setItem("API_URL", codigo);
            console.log("Código guardado:", codigo);
            navigation.replace('Principal');
        } catch (error) {
            console.error("Error al guardar el código:", error);
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
                                placeholder="Ingrese su código"
                                placeholderTextColor="#616060"
                                onChangeText={setCodigo}
                                value={codigo}
                            />
                            <MaterialIcons name={"vpn-key"} size={24} color="#000" style={styles.icon} />
                        </View>
                    </View>
                </View>
            </KeyboardAwareScrollView>
            <View style={styles.button}>
                <SaveButton onPress={saveData} isEnabled={codigo.length > 0} />
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
    containerActivity: {
        flex: 1,
        justifyContent: 'center',
    },
    button2: {
        marginTop: 10,
        width: 189,
        height: 100,
        marginLeft: 215,
    },
    buttonContainer1: {
        marginTop: 10,
        marginLeft: 150,
        alignItems: "center",
    },
    button1: {
        padding: 10,
        width: "90%",
        height: 45,
        margin: 8,
        borderRadius: 8,
        overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
        backgroundColor: '#009CDE',
        elevation: 4,
        shadowColor: 'black',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        alignItems: "center",
        opacity: 0.9
    },
    textButton: {
        color: "white",
        fontSize: 15,
        width: "100%",
        textAlign: "center",
    },
    iconContainer: {
        flexDirection: "row",
        alignItems: "stretch"
    },
    icon2: {
        marginLeft: 10
    },
    title: {
        marginTop: 10,
        marginLeft: 21,
    },
    titleText: {
        fontSize: 17,
        fontFamily: "open-sans-bold",
    }
})