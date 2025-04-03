import { StyleSheet,Platform } from "react-native";
import { GlobalStyles } from "./Colors";

export const styles1=StyleSheet.create({
    buttonContainer: {
        padding: 16,
        margin:8, 
        borderRadius: 8,
        paddingVertical:40,
        paddingHorizontal:60,
        overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
        backgroundColor: GlobalStyles.colors.colorbuttonI,
        elevation: 4,
        shadowColor: 'black',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        alignItems: "center"
    },
})


export const styles2=StyleSheet.create({
    buttonContainer: {
        padding: 16,
        margin:8, 
        borderRadius: 8,
        paddingVertical:40,
        paddingHorizontal:50,
        overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
        backgroundColor: GlobalStyles.colors.botonI,
        elevation: 4,
        shadowColor: 'black',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        alignItems: "center"
    },
})