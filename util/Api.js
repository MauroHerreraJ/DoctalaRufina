import axios from "axios";
import { Platform } from "react-native";

// 🔹 URLs para desarrollo y producción
const getBaseUrl = () => {
  if (__DEV__) {
    // En desarrollo
    if (Platform.OS === 'android') {
      // return "http://10.0.2.2:3000"; // Para emulador Android
      return "http://192.168.1.127:3000"; // Para dispositivo físico (tu IP local)
    } else {
      return "http://localhost:3000"; // Para iOS
    }
  }
  // En producción, usa tu URL de Heroku
  return "https://desit-server-staging.herokuapp.com"; // o tu URL de prod
};

// 🔹 Endpoints de la API del Neighborhood
const REGISTER_URL = `${getBaseUrl()}/api/v1/neighborhood-register`;
const PANIC_EVENT_URL = `${getBaseUrl()}/api/v1/neighborhood-event`;
const NEIGHBORHOOD_CONFIG_URL = `${getBaseUrl()}/api/v1/neighborhood/config`;

// 🔹 API FUNCTIONS

/**
 * Obtener configuración del barrio (opcional, para preview antes de registrar)
 * @param {string} neighborhoodCode - Código del barrio (ej: "BARRIO001")
 */
export const getNeighborhoodConfig = async (neighborhoodCode) => {
  try {
    const response = await axios.get(`${NEIGHBORHOOD_CONFIG_URL}/${neighborhoodCode}`);
    return response.data; // { status, data: { code, name, logoUrl, colors... } }
  } catch (error) {
    console.error("Error al obtener configuración del barrio:", error);
    throw error;
  }
};

/**
 * Registrar usuario en un barrio (crea licencia y obtiene token)
 * @param {Object} data - { neighborhoodCode: "BARRIO001", accountNumber: "0003" }
 * @returns {Object} { status, data: { accessToken, refreshToken, neighborhood, accountNumber } }
 */
export const registerNeighborhood = async (data) => {
  try {
    console.log("📤 Enviando registro a:", REGISTER_URL);
    console.log("📦 Datos enviados:", JSON.stringify(data, null, 2));
    
    const response = await axios.post(REGISTER_URL, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    console.log("✅ Respuesta del servidor:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error al registrar barrio:", error.message);
    
    if (error.response) {
      // El servidor respondió con un error
      console.error("📥 Status Code:", error.response.status);
      console.error("📥 Datos del error:", JSON.stringify(error.response.data, null, 2));
      
      const errorMessage = error.response.data.message || error.response.data.error || "Error al registrar";
      throw new Error(errorMessage);
    } else if (error.request) {
      console.error("📥 No hubo respuesta del servidor");
      throw new Error("No se pudo conectar con el servidor");
    } else {
      console.error("📥 Error al configurar la petición:", error.message);
      throw error;
    }
  }
};

/**
 * Enviar evento de pánico
 * @param {string} accessToken - Token JWT obtenido en el registro
 * @param {Object} data - Datos adicionales opcionales (location, etc.)
 * @returns {Object} { status, message, data: { eventSent, timestamp } }
 */
export const sendPanicEvent = async (accessToken, data = {}) => {
  try {
    console.log("🚨 Enviando evento de pánico a:", PANIC_EVENT_URL);
    console.log("📦 Datos del evento:", JSON.stringify(data, null, 2));
    console.log("🔑 Token (primeros 50 chars):", accessToken.substring(0, 50) + "...");
    
    const response = await axios.post(PANIC_EVENT_URL, data, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
    });
    
    console.log("✅ Respuesta del servidor:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("❌ Error al enviar evento de pánico:", error.message);
    
    if (error.response) {
      console.error("📥 Status Code:", error.response.status);
      console.error("📥 Datos del error:", JSON.stringify(error.response.data, null, 2));
      
      const errorMessage = error.response.data.message || error.response.data.error || "Error al enviar evento";
      throw new Error(errorMessage);
    } else if (error.request) {
      console.error("📥 No hubo respuesta del servidor");
      throw new Error("No se pudo conectar con el servidor");
    } else {
      console.error("📥 Error al configurar la petición:", error.message);
      throw error;
    }
  }
};