import api from "./api";

export const fetchUsers = async () => {
  try {
    const response = await api.get("/getUsers");
    if (response.data.success) {
      return { success: true, users: response.data.users };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("Error cargando usuarios:", error);
    return { success: false, message: "Error cargando usuarios" };
  }
};

export const updateUserRole = async (userId, newRole, adminId) => {
  try {
    const response = await api.post("/updateUserRole", {
      userId,
      newRole,
      adminId,
    });

    if (response.data.success) {
      return { success: true, message: response.data.message };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("Error actualizando rol:", error);
    return { success: false, message: "Error actualizando rol" };
  }
};

export const editUser = async (userId, userData, adminId) => {
  try {
    const response = await api.post("/editUser", {
      userId,
      ...userData,
      adminId,
    });

    if (response.data.success) {
      return { success: true, message: response.data.message };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("Error editando usuario:", error);
    return { success: false, message: "Error editando usuario" };
  }
};

export const deleteUser = async (userId, adminId) => {
  try {
    const response = await api.post("/deleteUser", {
      userId,
      adminId,
    });

    if (response.data.success) {
      return { success: true, message: response.data.message };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    return { success: false, message: "Error eliminando usuario" };
  }
};

// Función para agregar un nuevo usuario
export const addUser = async (userData, adminId) => {
  try {
    const response = await api.post("/addUser", {
      ...userData,
      adminId,
    });

    if (response.data.success) {
      return { success: true, message: response.data.message };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("Error agregando usuario:", error);
    return { success: false, message: "Error agregando usuario" };
  }
};