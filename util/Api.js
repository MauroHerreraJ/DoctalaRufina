import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔹 URLs para desarrollo y producción
const DEVELOP_URL = "https://desit-server-3e06b7680f25.herokuapp.com";

const getBaseUrl = () => {
  return DEVELOP_URL;
};

// 🔹 Endpoints de la API del Neighborhood
const REGISTER_URL = `${getBaseUrl()}/api/v1/neighborhood-register`;
const PANIC_EVENT_URL = `${getBaseUrl()}/api/v1/neighborhood-event`;
const NEIGHBORHOOD_CONFIG_URL = `${getBaseUrl()}/api/v1/neighborhood/config`;
const VALIDATE_ACCOUNT_URL = `${getBaseUrl()}/api/v1/neighborhood-account-number/check-availability`;
const LICENSE_STATUS_URL = `${getBaseUrl()}/api/v1/neighborhood-license/code`;
const GET_LICENSE_BY_TOKEN_URL = `${getBaseUrl()}/api/v1/neighborhood-license/me`;
const DELETE_ACCOUNT_URL = `${getBaseUrl()}/api/v1/neighborhood-register/delete-account`;

// 🔹 API FUNCTIONS

/**
 * Obtener configuración del barrio (opcional, para preview antes de registrar)
 * @param {string} neighborhoodCode - Código del barrio (ej: "BARRIO001")
 */
export const getNeighborhoodConfig = async (neighborhoodCode) => {
  try {
    const response = await axios.get(`${NEIGHBORHOOD_CONFIG_URL}/${neighborhoodCode}`);
    return response.data;
  } catch (error) {
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
    const response = await axios.post(REGISTER_URL, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    return response.data;
  } catch (error) {
    
    if (error.response) {
      // El servidor respondió con un error
      
      const errorMessage = error.response.data.message || error.response.data.error || "Error al registrar";
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error("No se pudo conectar con el servidor");
    } else {
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
    const response = await axios.get(url);
    
    return response.data; // { status, data: { exists, available } }
  } catch (error) {
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
      return true;
    }
    
    // Si es 401 o 403, el token es inválido o la licencia fue eliminada
    if (response.status === 401 || response.status === 403) {
      return false;
    }
    
    // Para otros códigos, asumir inválido por seguridad
    return false;
  } catch (error) {
    
    // Si hay un error de red (sin respuesta del servidor), asumimos que el token podría ser válido
    // para no bloquear al usuario si hay problemas de conexión temporal
    if (error.request && !error.response) {
      return true; // En caso de error de conexión, permitir continuar
    }
    
    // Si el servidor responde con 401 o 403, el token es inválido
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      return false;
    }
    
    // Para otros errores de servidor (500, etc.), asumir válido para no bloquear
    // pero loguear el error para debugging
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
      return {
        status: "no_license_code",
        isValid: false,
        message: "No se encontró el código de licencia"
      };
    }
    
    // Obtener token de AsyncStorage para autenticación
    const accessToken = await AsyncStorage.getItem("accessToken");
    
    const headers = {
      "Content-Type": "application/json",
    };
    
    // Agregar token si existe
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
    
    // Intentar primero con path parameter (formato estándar)
    const encodedCode = encodeURIComponent(licenseCode);
    const url = `${LICENSE_STATUS_URL}/${encodedCode}`;
    
    let response;
    try {
      response = await axios.get(url, {
        headers,
        validateStatus: (status) => status < 500,
        timeout: 10000,
      });
    } catch (error) {
      throw error;
    }
    
    if (response.status === 200) {
      const responseData = response.data;
      
      let licenseStatus = null;
      
      // Intentar diferentes estructuras de respuesta
      if (responseData.status === "success" && responseData.data && responseData.data.status) {
        // Estructura: { status: "success", data: { status: "accepted" } }
        licenseStatus = responseData.data.status;
      } else if (responseData.status) {
        // Estructura: { status: "accepted", ... } (directo)
        licenseStatus = responseData.status;
      } else if (responseData.data && responseData.data.status) {
        // Estructura: { data: { status: "accepted" } }
        licenseStatus = responseData.data.status;
      }
      
      if (!licenseStatus) {
        return {
          status: "unknown",
          isValid: false,
          message: "No se pudo determinar el estado de la licencia"
        };
      }
      
      
      if (licenseStatus === "cancel" || licenseStatus === "cancelled") {
        return {
          status: "cancel",
          isValid: false,
          message: "La licencia ha sido cancelada"
        };
      }
      
      if (licenseStatus === "accepted" || licenseStatus === "active" || licenseStatus === "valid") {
        return {
          status: licenseStatus,
          isValid: true,
          message: "Licencia activa"
        };
      }
      
      return {
        status: licenseStatus,
        isValid: true,
        message: `Estado desconocido: ${licenseStatus}`
      };
    }
    
    if (response.status === 404) {
      return {
        status: "not_found",
        isValid: false,
        message: "Licencia no encontrada"
      };
    }
    
    return {
      status: "error",
      isValid: false,
      message: `Error al verificar estado (HTTP ${response.status})`
    };
    
  } catch (error) {
    // Si el servidor responde con 404 (licencia no existe)
    if (error.response && error.response.status === 404) {
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
    
    const response = await axios.post(PANIC_EVENT_URL, data, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
    });
    
    return response.data;
  } catch (error) {
    
    if (error.response) {
      
      const errorMessage = error.response.data.message || error.response.data.error || "Error al enviar evento";
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error("No se pudo conectar con el servidor");
    } else {
      throw error;
    }
  }
};

/**
 * Obtener información de la licencia del usuario autenticado usando el accessToken
 * Requiere token para acceder a la colección "neighborhoodlicenses" en la BD
 * @param {string} accessToken - Token JWT del usuario
 * @returns {Object} { licenseCode, status, accountNumber } o null si hay error
 */
export const getLicenseByToken = async (accessToken) => {
  try {
    if (!accessToken) {
      return null;
    }
    
    
    const response = await axios.get(GET_LICENSE_BY_TOKEN_URL, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      validateStatus: (status) => status < 500,
      timeout: 10000,
    });
    
    if (response.status === 200) {
      const responseData = response.data;
      
      if (responseData.status === "success" && responseData.data) {
        const licenseCode = responseData.data.code || responseData.data.licenseCode;
        if (licenseCode) {
          return {
            licenseCode,
            status: responseData.data.status,
            accountNumber: responseData.data.accountNumber,
          };
        }
      }
      
      return null;
    } else if (response.status === 401 || response.status === 403) {
      return null;
    } else if (response.status === 404) {
      return null;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

/**
 * Enmascarar código de licencia para mostrar en pantalla (ej: ****-****-****-f22b)
 * @param {string} licenseCode
 */
export const maskLicenseCode = (licenseCode) => {
  if (!licenseCode) {
    return "No disponible";
  }

  const trimmed = licenseCode.trim();
  const parts = trimmed.split("-");

  if (parts.length > 1) {
    const last = parts[parts.length - 1];
    return `${parts.slice(0, -1).map(() => "****").join("-")}-${last}`;
  }

  if (trimmed.length <= 4) {
    return trimmed;
  }

  return `${"*".repeat(trimmed.length - 4)}${trimmed.slice(-4)}`;
};

/**
 * Eliminar cuenta y licencia en el servidor
 * @param {string} licenseCode
 * @returns {Promise<Object>} Respuesta del servidor en caso de éxito
 */
export const deleteAccount = async (licenseCode) => {
  if (!licenseCode?.trim()) {
    const error = new Error("licenseCode is required");
    error.userMessage = "No se encontró el código de licencia en este dispositivo.";
    throw error;
  }

  try {
    const response = await axios.delete(DELETE_ACCOUNT_URL, {
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        licenseCode: licenseCode.trim(),
      },
      timeout: 30000,
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const serverMessage = error.response.data?.message;
      let userMessage;

      switch (status) {
        case 404:
          userMessage = serverMessage || "Licencia no encontrada";
          break;
        case 403:
          userMessage =
            "Esta cuenta no puede ser eliminada automáticamente. Por favor, contacta con el administrador del barrio.";
          break;
        case 409:
          userMessage =
            "Hubo un conflicto al procesar tu solicitud. Por favor, reinicia la aplicación e intenta de nuevo";
          break;
        case 500:
          userMessage =
            "Lo sentimos, hubo un problema técnico. Por favor, intenta de nuevo en unos minutos.";
          break;
        case 400:
          userMessage = serverMessage || "Falta el código de licencia";
          break;
        default:
          userMessage =
            serverMessage || "No se pudo eliminar la cuenta. Por favor, intenta de nuevo.";
      }

      const apiError = new Error(userMessage);
      apiError.userMessage = userMessage;
      apiError.status = status;
      throw apiError;
    }

    if (error.request) {
      const networkError = new Error("connection_error");
      networkError.userMessage =
        "No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.";
      throw networkError;
    }

    throw error;
  }
};

/**
 * Limpiar todos los datos de la app de forma segura
 * Se usa cuando la licencia es cancelada o cuando el usuario quiere borrar todos los datos
 * @returns {Promise<boolean>} true si se limpió correctamente, false si hubo errores
 */
export const clearAllAppData = async () => {
  try {
    
    const keysToRemove = [
      "Cuenta",
      "accessToken",
      "refreshToken",
      "licenseCode",
      "CodigoBarrio",
      "NumeroCuenta",
      "neighborhoodName",
      "logoUrl",
      "primaryColor",
      "buttonColor",
      "backgroundColor",
      "neighborhoodPhoneNumber",
      "fullName",
      "propertyReference",
      "phoneNumber"
    ];
    
    // Intentar borrar con multiRemove primero (más eficiente)
    try {
      await AsyncStorage.multiRemove(keysToRemove);
    } catch (multiRemoveError) {
      
      // Si multiRemove falla, borrar individualmente
      for (const key of keysToRemove) {
        try {
          await AsyncStorage.removeItem(key);
        } catch (individualError) {
        }
      }
    }
    
    // Verificar que el accessToken se borró correctamente
    const remainingToken = await AsyncStorage.getItem("accessToken");
    if (remainingToken) {
      await AsyncStorage.removeItem("accessToken");
    }
    
    return true;
  } catch (error) {
    
    // Intentar limpiar lo más crítico al menos
    try {
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
      await AsyncStorage.removeItem("Cuenta");
    } catch (criticalError) {
    }
    
    return false;
  }
};