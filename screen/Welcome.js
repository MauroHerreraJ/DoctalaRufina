import { View, Text, Image, StyleSheet, Platform, ImageBackground, Pressable, ScrollView } from "react-native";
import { useState } from "react";
import { Dimensions } from "react-native";

const { height } = Dimensions.get("window");

function Welcome({ navigation }) {

    function pressHandler() {
        navigation.navigate("Configuration");
    }
    const [isChecked, setIsChecked] = useState(false); // Estado del checkbox

    function toggleCheckbox() {
        setIsChecked((prevState) => !prevState); // Alterna entre seleccionado y no seleccionado
    }


    return (
        <>
            <ImageBackground
                source={require('../assets/126353.jpg')}
                resizeMode="cover"
                style={styles.rootScreen}>

                <View style={styles.imageContainer}>
                    <Image source={require("../assets/logonuevo.png")}
                        style={{ width: 70, height: 70 }} />
                </View>
                <View>
                    <Text style={styles.textImage}>Desit SA</Text>
                </View>

                <ScrollView style={styles.listContainer} contentContainerStyle={{ paddingBottom: 20 }}>
                    <Text style={styles.textTitle}>Términos y condiciones de uso</Text>
                    <Text style={styles.politicText}>
                        Es necesario, para la configuración y uso de esta aplicación, que lea y acepte los términos y condiciones que a continuación se detallan:
                    </Text>
                    <Text style={styles.textTitle}>
                        Pulsador de Pánico
                    </Text>
                    <Text style={styles.politicText}>
                        Es una aplicación destinada al envío de mensajes de emergencia hacia la central de monitoreo
                        instalada en su barrio, urbanización, ciudad, etc., haciendo uso de los recursos de seguridad con los que cuenta su entorno de aplicación para la atención y/o resolución del evento.
                    </Text>
                    <Text style={styles.textTitle}>
                        Condiciones previas para el correcto funcionamiento
                    </Text>
                    <Text style={styles.politicText}>
                        Para hacer uso de la APP de emergencia, usted deberá contar con el permiso del organismo que previamente haya instalado el Sistema de Monitoreo de Desit SA. Esta aplicación funciona en conjunto con dicho sistema.
                    </Text>
                    <Text style={styles.textTitle}>
                        Configuración inicial
                    </Text>
                    <Text style={styles.politicText}>
                        Para comenzar a utilizar la aplicación deberá completar el proceso de registro en dos pasos, con datos provistos por el organismo de control del barrio: primero, el código del barrio y el número de cuenta; luego, sus datos personales (nombre y apellido, referencia de la propiedad y teléfono de contacto).
                        Al completar el registro, el servidor generará automáticamente una licencia de uso única para este dispositivo. Esa licencia quedará asociada a su cuenta y podrá consultarse en la sección Sistema de la aplicación.
                        Una vez finalizada la configuración, la aplicación quedará lista para su uso.
                        Nota: Los datos con los que configuró el envío de eventos hacia la central son únicos por cada aplicación individual.
                    </Text>
                    <Text style={styles.textTitle}>

                        Uso y cuidados
                    </Text>
                    <Text style={styles.politicText}>
                        Para utilizar la aplicación ante una situación de emergencia usted simplemente deberá abrirla y mantener presionado durante 1 (un) segundo el botón de aviso del evento que quiera comunicar. La aplicación no tiene límite de eventos que pueden ser enviados.
                        Al enviar un evento a la central de monitoreo se dará aviso que desde su smartphone existe una emergencia de acuerdo a la naturaleza del botón que pulsó dentro de los disponibles en su APP. El pulsador NO ENVÍA información sobre su posición mediante el uso de GPS.
                        Contamos con su entendimiento y compromiso de utilizar solo en casos de emergencia los botones de emergencia, como así también instruir de forma correcta al resto de los miembros de su familia en especial a los más jóvenes.
                        Nota: Para poder enviar eventos de forma correcta usted deberá contar con disponibilidad de servicio de internet y/o paquete de datos, ya que cada evento se envía mediante un mensaje vía Internet.
                    </Text>
                    <Text style={styles.textTitle}>
                        Formas de envío de alerta
                    </Text>
                    <Text style={styles.politicText}>
                        La aplicación envía la alerta principalmente vía Internet. Si no hay conexión disponible, puede ofrecer el envío del evento mediante SMS como alternativa.
                    </Text>

                    <Text style={styles.textTitle}>

                        Costos
                    </Text>
                    <Text style={styles.politicText}>
                        El envío de eventos por IP (internet) corre por parte del servicio de telefonía y/o paquete de datos que usted tenga contratado por lo que cada evento enviado tendrá el costo de la tarifa vigente de su proveedor.

                    </Text>
                    <Text style={styles.textTitle}>

                        Responsabilidades
                    </Text>
                    <Text style={styles.politicText}>
                        Desit SA no se hace responsable por fallas en envíos de eventos ocasionadas por causas ajenas al propio funcionamiento de la APP.

                    </Text>
                    <Text style={styles.textTitle}>

                        Política de privacidad
                    </Text>

                    <Text style={styles.politicText}>
                        La presente Política de Privacidad establece los términos en que Desit SA usa y protege la información proporcionada por los usuarios al utilizar Docta Pánico. Desit SA está comprometido con la seguridad de los datos de sus usuarios.
                        Esta Política de Privacidad puede actualizarse. Le recomendamos revisar estos términos después de cada actualización de la aplicación.
                    </Text>
                    <Text style={styles.textTitle}>

                        Información recogida
                    </Text>
                    <Text style={styles.politicText}>
                        Durante el registro y uso de la aplicación, se recopilan y procesan los siguientes datos: código del barrio, número de cuenta, nombre y apellido, referencia de la propiedad, teléfono de contacto, código de licencia y tokens de autenticación necesarios para el funcionamiento del servicio.
                        Parte de esta información se almacena localmente en su dispositivo y parte se transmite al servidor de Desit SA para gestionar la licencia, validar el acceso y procesar eventos de emergencia.
                        La aplicación también puede registrar información técnica anónima sobre errores de funcionamiento, con el fin de mejorar la estabilidad del servicio.
                    </Text>
                    <Text style={styles.textTitle}>

                        Uso de la información recogida
                    </Text>
                    <Text style={styles.politicText}>
                        Los datos personales se utilizan exclusivamente para: registrar y validar la licencia de uso, permitir el envío de eventos de pánico a la central de monitoreo del barrio, administrar la cuenta del usuario y brindar soporte técnico del servicio.
                        Desit SA no utiliza estos datos con fines publicitarios ni los comercializa.
                    </Text>
                    <Text style={styles.textTitle}>
                        Divulgación a terceros

                    </Text>
                    <Text style={styles.politicText}>
                        Los datos se almacenan en los servidores de Desit SA y no se comparten con terceros ajenos al servicio de monitoreo contratado por el organismo del barrio, salvo obligación legal.
                        Para el monitoreo de errores técnicos, la aplicación puede utilizar servicios de diagnóstico que reciben información técnica del dispositivo y del error, sin incluir datos personales del usuario en los reportes enviados.
                    </Text>
                    <Text style={styles.textTitle}>

                        Control de su información personal
                    </Text>
                    <Text style={styles.politicText}>
                        Usted puede solicitar la eliminación de su licencia y datos asociados desde la sección Sistema de la aplicación, lo que eliminará su cuenta en el servidor y los datos guardados en el dispositivo.
                        Los números de teléfono y demás datos ingresados solo se utilizan para el funcionamiento del sistema de alertas y la gestión de la licencia. El usuario acepta estas condiciones al realizar la configuración de la aplicación en su smartphone.
                    </Text>
                    <Text style={styles.textTitle}>
                        Desit SA Se reserva el derecho de cambiar los términos de la presente Política de Privacidad en cualquier momento
                    </Text>
                </ScrollView>
                <View style={styles.container}>
                    <Pressable
                        onPress={toggleCheckbox}
                        style={[styles.checkbox, isChecked && styles.checked]}
                    >
                        {isChecked && <Text style={styles.checkmark}>✓</Text>}
                    </Pressable>
                    <Text style={styles.label}>Aceptar términos y condiciones</Text>
                </View>


                <View style={styles.buttonContainer}>
                    <Pressable
                        onPress={isChecked ? pressHandler : null} // Solo habilita onPress si isChecked es true
                        style={[
                            styles.button,
                            !isChecked && styles.buttonDisabled, // Aplica estilo deshabilitado si isChecked es false
                        ]}
                    >
                        <Text style={styles.textButton}>CONTINUAR</Text>
                    </Pressable>
                </View>


            </ImageBackground>
        </>
    )
}


export default Welcome;

const styles = StyleSheet.create({

    text: {
        padding: 16,
        fontSize: 30,
        color: "white",
        textAlign: "center",
        marginTop: 80
    },
    buttonContainer: {
        marginTop: 10,
        marginBottom: height * 0.05,  // Ajuste dinámico basado en la altura de la pantalla
        alignItems: "center",
    },
    button: {
        padding: 16,
        margin: 8,
        borderRadius: 8,
        paddingVertical: 18,
        paddingHorizontal: 50,
        overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
        backgroundColor: '#0d47a1',
        elevation: 4,
        shadowColor: 'black',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        alignItems: "center"

    },
    textButton: {
        color: "white",
        fontSize: 20
    },
    rootScreen: {
        flex: 1
    },
    imageContainer: {
        alignItems: "center",
        marginTop: 80,
        marginBottom: 5
    },
    textImage: {
        textAlign: "center",
        fontSize: 14,
        color: "white",
        marginBottom: 10
    },
    politicText: {
        fontSize: 14,
        color: "white",
        textAlign: 'justify',
        marginTop: 0
    },

    container: {
        flexDirection: "row",
        alignItems: "center",
        margin: 10,
    },
    checkbox: {
        width: 30,
        height: 30,
        borderWidth: 2,
        borderColor: "#0d47a1",
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    checked: {
        backgroundColor: "#0d47a1",
    },
    checkmark: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    label: {
        fontSize: 16,
        color: "white",
    },
    listContainer: {
        flex: 1,
        padding: 10
    },
    textTitle: {
        padding: 1,
        fontSize: 14,
        color: "white",
        marginTop: 15,
        textAlign: 'justify',
        fontWeight: "bold",
    },
    buttonDisabled: {
        backgroundColor: "#ccc", // Color de fondo más tenue
        opacity: 0.5,           // Reduce la opacidad
    },

})

