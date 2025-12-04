import axios from "axios";
import { Platform } from "react-native";

// 🔹 URLs para desarrollo y producción
const DEVELOP_URL = "https://desit-server-staging-a51a84ceec47.herokuapp.com";

const getBaseUrl = () => {
  return DEVELOP_URL;
};

// 🔹 Endpoints de la API del Neighborhood
const REGISTER_URL = `${getBaseUrl()}/api/v1/neighborhood-register`;
const PANIC_EVENT_URL = `${getBaseUrl()}/api/v1/neighborhood-event`;
const NEIGHBORHOOD_CONFIG_URL = `${getBaseUrl()}/api/v1/neighborhood/config`;
const VALIDATE_ACCOUNT_URL = `${getBaseUrl()}/api/v1/neighborhood-account-number/check-availability`;
const LICENSE_STATUS_URL = `${getBaseUrl()}/api/v1/neighborhood-license/code`;

// 🔹 API FUNCTIONS

/**
 * Obtener configuración del barrio (opcional, para preview antes de registrar)
 * @param {string} neighborhoodCode - Código del barrio (ej: "BARRIO001")
 */
export const getNeighborhoodConfig = async (neighborhoodCode) => {
  try {
    console.log("📡 Llamando a:", `${NEIGHBORHOOD_CONFIG_URL}/${neighborhoodCode}`);
    const response = await axios.get(`${NEIGHBORHOOD_CONFIG_URL}/${neighborhoodCode}`);
    
    // Log completo de la respuesta para debugging
    console.log("📥 Respuesta completa del servidor:", JSON.stringify(response.data, null, 2));
    
    // Verificar estructura de la respuesta
    if (response.data && response.data.data) {
      console.log("🔍 Campos en response.data.data:", Object.keys(response.data.data));
      console.log("📞 ¿smsPhoneNumber presente?:", 'smsPhoneNumber' in response.data.data);
      console.log("📞 Valor de smsPhoneNumber:", response.data.data.smsPhoneNumber);
    }
    
    return response.data; // { status, data: { code, name, logoUrl, colors... } }
  } catch (error) {
    console.error("❌ Error al obtener configuración del barrio:", error);
    if (error.response) {
      console.error("📥 Status:", error.response.status);
      console.error("📥 Data:", JSON.stringify(error.response.data, null, 2));
    }
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
 * Validar si un número de cuenta existe en un barrio (sin crear registro)
 * @param {string} neighborhoodCode - Código del barrio (ej: "BARRIO001")
 * @param {string} accountNumber - Número de cuenta a validar (ej: "0003")
 * @returns {Object} { status: "success", data: { exists: true/false, available: true/false } }
 */
export const validateAccountNumber = async (neighborhoodCode, accountNumber) => {
  try {
    const url = `${VALIDATE_ACCOUNT_URL}/${neighborhoodCode}?numberId=${accountNumber}`;
    console.log("📡 Validando número de cuenta:", url);
    const response = await axios.get(url);
    
    console.log("📥 Respuesta de validación:", JSON.stringify(response.data, null, 2));
    return response.data; // { status, data: { exists, available } }
  } catch (error) {
    console.error("❌ Error al validar número de cuenta:", error);
    if (error.response) {
      console.error("📥 Status:", error.response.status);
      console.error("📥 Data:", JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
};

/**
 * Validar si el token de acceso (licencia) sigue siendo válido
 * Intenta hacer una llamada al servidor para verificar si el token es válido
 * @param {string} accessToken - Token JWT a validar
 * @returns {boolean} true si el token es válido, false si fue revocado o es inválido
 */
export const validateAccessToken = async (accessToken) => {
  try {
    // Intentar hacer una llamada GET al endpoint de eventos con un payload mínimo
    // para validar el token sin crear un evento real
    // Si el token es inválido, el servidor devolverá 401 o 403
    const response = await axios.post(
      PANIC_EVENT_URL,
      { validateOnly: true }, // Flag para indicar que solo es validación
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        validateStatus: (status) => status < 500, // No lanzar excepción para 401/403
      }
    );
    
    // Si la respuesta es 200-299, el token es válido
    if (response.status >= 200 && response.status < 300) {
      console.log("✅ Token válido - Licencia activa");
      return true;
    }
    
    // Si es 401 o 403, el token es inválido o la licencia fue eliminada
    if (response.status === 401 || response.status === 403) {
      console.log("❌ Token inválido o licencia eliminada (status:", response.status, ")");
      return false;
    }
    
    // Para otros códigos, asumir inválido por seguridad
    console.warn("⚠️ Respuesta inesperada al validar token:", response.status);
    return false;
  } catch (error) {
    console.error("❌ Error al validar token:", error);
    
    // Si hay un error de red (sin respuesta del servidor), asumimos que el token podría ser válido
    // para no bloquear al usuario si hay problemas de conexión temporal
    if (error.request && !error.response) {
      console.warn("⚠️ Error de conexión al validar token, asumiendo válido para no bloquear usuario");
      return true; // En caso de error de conexión, permitir continuar
    }
    
    // Si el servidor responde con 401 o 403, el token es inválido
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log("❌ Token inválido o licencia eliminada (error response:", error.response.status, ")");
      return false;
    }
    
    // Para otros errores de servidor (500, etc.), asumir válido para no bloquear
    // pero loguear el error para debugging
    console.warn("⚠️ Error del servidor al validar token, asumiendo válido. Status:", error.response?.status);
    return true;
  }
};

/**
 * Verificar el estado de la licencia desde el servidor
 * @param {string} licenseCode - Código de la licencia (ej: "bfd26a33-b15d4469-9196398e-e1f5f22b")
 * @returns {Object} { status: string, isValid: boolean, message?: string }
 *   - status: Estado de la licencia ("accepted", "cancel", etc.)
 *   - isValid: true si la licencia está activa, false si está cancelada
 *   - message: Mensaje descriptivo opcional
 */
export const checkLicenseStatus = async (licenseCode) => {
  try {
    if (!licenseCode) {
      console.error("❌ No se proporcionó el código de licencia");
      return {
        status: "no_license_code",
        isValid: false,
        message: "No se encontró el código de licencia"
      };
    }
    
    console.log("🔍 Verificando estado de licencia en el servidor...");
    console.log("📋 Código de licencia:", licenseCode);
    
    const url = `${LICENSE_STATUS_URL}/${licenseCode}`;
    console.log("📡 URL de verificación:", url);
    
    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
      },
      validateStatus: (status) => status < 500, // No lanzar excepción para errores del cliente
      timeout: 10000, // 10 segundos de timeout
    });
    
    // Si la respuesta es exitosa (200)
    if (response.status === 200) {
      const responseData = response.data;
      
      // Log completo de la respuesta para debugging
      console.log("📥 Respuesta completa del servidor:", JSON.stringify(responseData, null, 2));
      
      // Formato esperado: { status: "success", data: { code, status: "cancel", accountNumber } }
      let licenseStatus = null;
      
      if (responseData.status === "success" && responseData.data) {
        licenseStatus = responseData.data.status;
        console.log("📋 Estado de licencia encontrado:", licenseStatus);
        console.log("📋 Código de licencia:", responseData.data.code);
        console.log("📋 Número de cuenta:", responseData.data.accountNumber);
      } else {
        console.warn("⚠️ Formato de respuesta inesperado");
        return {
          status: "unknown",
          isValid: false,
          message: "Formato de respuesta inesperado del servidor"
        };
      }
      
      if (!licenseStatus) {
        console.warn("⚠️ No se encontró el campo 'status' en la respuesta de la licencia");
        return {
          status: "unknown",
          isValid: false,
          message: "No se pudo determinar el estado de la licencia"
        };
      }
      
      // Si el estado es "cancel", la licencia está cancelada
      if (licenseStatus === "cancel" || licenseStatus === "cancelled") {
        console.log("❌ Licencia cancelada detectada - status:", licenseStatus);
        return {
          status: "cancel",
          isValid: false,
          message: "La licencia ha sido cancelada"
        };
      }
      
      // Si el estado es "accepted" o similar, la licencia está activa
      if (licenseStatus === "accepted" || licenseStatus === "active" || licenseStatus === "valid") {
        console.log("✅ Licencia activa - status:", licenseStatus);
        return {
          status: licenseStatus,
          isValid: true,
          message: "Licencia activa"
        };
      }
      
      // Para otros estados, considerar como válido pero loguear
      console.warn("⚠️ Estado de licencia desconocido:", licenseStatus);
      return {
        status: licenseStatus,
        isValid: true, // Por seguridad, asumir válido para otros estados
        message: `Estado desconocido: ${licenseStatus}`
      };
    }
    
    // Si es 404, la licencia no existe
    if (response.status === 404) {
      console.log("❌ Licencia no encontrada (404)");
      return {
        status: "not_found",
        isValid: false,
        message: "Licencia no encontrada"
      };
    }
    
    // Para otros códigos, asumir error
    console.warn("⚠️ Respuesta inesperada al verificar estado de licencia:", response.status);
    return {
      status: "error",
      isValid: false, // Por seguridad, bloquear si hay error inesperado
      message: `Error al verificar estado (HTTP ${response.status})`
    };
    
  } catch (error) {
    console.error("❌ Error al verificar estado de licencia:", error);
    
    // Si el servidor responde con 404 (licencia no existe)
    if (error.response && error.response.status === 404) {
      console.error("❌ Licencia no encontrada (404)");
      return {
        status: "not_found",
        isValid: false,
        message: "Licencia no encontrada en el servidor"
      };
    }
    
    // Si el servidor responde con 401 o 403
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      return {
        status: "unauthorized",
        isValid: false,
        message: "Token inválido o sin autorización"
      };
    }
    
    // Si hay un error de red (sin respuesta del servidor)
    if (error.request && !error.response) {
      console.warn("⚠️ Error de conexión al verificar estado de licencia");
      return {
        status: "connection_error",
        isValid: true, // Permitir acceso temporal si hay error de conexión
        message: "Error de conexión al verificar estado"
      };
    }
    
    // Para otros errores del servidor, no permitir acceso por seguridad
    return {
      status: "error",
      isValid: false, // Bloquear por seguridad
      message: error.message || "Error al verificar estado de licencia"
    };
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