import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https:/"; // 🔹 Parte fija de la URL

const getApiUrl = async () => {
  try {
    const storedValue = await AsyncStorage.getItem("API_URL");

    if (storedValue && storedValue.trim() !== "") {
      return `${BASE_URL}/${storedValue}`; // 🔹 Concatena la parte fija con la guardada
    } else {
      return BASE_URL; // 🔹 Si no hay nada guardado, usa la base URL
    }
  } catch (error) {
    console.error("Error al obtener la URL de AsyncStorage:", error);
    return BASE_URL;
  }
};

export const savePost = async (data) => {
  try {
    const API_URL = await getApiUrl();

    console.log("URL utilizada en la petición:", API_URL); // Verifica la URL antes de enviar

    const response = await axios.post(API_URL, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error en el POST:", error);
    throw error;
  }
};