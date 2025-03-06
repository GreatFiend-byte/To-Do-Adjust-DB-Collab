import api from "./api";



export const registerService = async (email, username, password) => {
  try {
    const response = await api.post("/register", {
      email,
      username,
      password,
    });

    if (response.data.success) {
      return { success: true, message: "Registro exitoso, ahora inicia sesión" };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("Error en el registro:", error);
    return { success: false, message: "Error en el registro" };
  }   
};

export const loginService = async (username, password) => {
  try {
    const response = await api.post("/login", {
      username,
      password,
    });

    if (response.data.success) {
      // Guardar el token y el userId en localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.userId);
      localStorage.setItem("role", response.data.role);
      return { success: true, message: "Inicio de sesión exitoso" };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("Error en el inicio de sesión:", error);
    return { success: false, message: "Error en el inicio de sesión" };
  }
};

export const logoutService = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
};

/**
 * Servicio para verificar si el usuario está autenticado.
 * @returns {boolean} - `true` si el usuario está autenticado, `false` en caso contrario.
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};