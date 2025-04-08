import axios from "axios";

const API_URL = "https://desit-larufina.selfip.com:45080/panic"; // 🔹 Parte fija de la URL


export const savePost = async (data) => {
  try {
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