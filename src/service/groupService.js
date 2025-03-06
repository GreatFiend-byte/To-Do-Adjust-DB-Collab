import api from "./api";

/**
 * Obtener todos los grupos de un usuario (creados y en los que es miembro).
 * @param {string} userId - ID del usuario.
 * @returns {Object} - Objeto con éxito y lista de grupos.
 */
export const fetchGroups = async (userId) => {
  try {
    const createdGroupsResponse = await api.get(`/getUserGroups/${userId}`);
    const createdGroups = createdGroupsResponse.data.success ? createdGroupsResponse.data.groups : [];

    const memberGroupsResponse = await api.get(`/getGroupsByUser/${userId}`);
    const memberGroups = memberGroupsResponse.data.success ? memberGroupsResponse.data.groups : [];

    // Combinar y eliminar duplicados
    const allGroups = [...createdGroups, ...memberGroups];
    const uniqueGroups = Array.from(new Set(allGroups.map((group) => group.id))).map((id) =>
      allGroups.find((group) => group.id === id)
    );

    return { success: true, groups: uniqueGroups };
  } catch (error) {
    console.error("Error cargando grupos:", error);
    return { success: false, message: "Error cargando grupos" };
  }
};

/**
 * Obtener todos los usuarios.
 * @returns {Object} - Objeto con éxito y lista de usuarios.
 */
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

/**
 * Agregar un nuevo grupo.
 * @param {Object} groupData - Datos del grupo.
 * @param {string} groupData.name - Nombre del grupo.
 * @param {string} groupData.description - Descripción del grupo.
 * @param {string} groupData.userId - ID del usuario creador.
 * @param {Array} groupData.members - IDs de los miembros del grupo.
 * @returns {Object} - Objeto con éxito y mensaje.
 */
export const addGroup = async (groupData) => {
  try {
    const response = await api.post("/addGroup", groupData);
    if (response.data.success) {
      return { success: true, message: "Grupo añadido", groupId: response.data.groupId };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("Error añadiendo grupo:", error);
    return { success: false, message: "Error añadiendo grupo" };
  }
};

/**
 * Eliminar un grupo.
 * @param {string} groupId - ID del grupo a eliminar.
 * @returns {Object} - Objeto con éxito y mensaje.
 */
export const deleteGroup = async (groupId) => {
  try {
    const response = await api.post("/deleteGroup", { groupId });
    if (response.data.success) {
      return { success: true, message: "Grupo eliminado" };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("Error eliminando grupo:", error);
    return { success: false, message: "Error eliminando grupo" };
  }
};

/**
 * Actualizar un grupo.
 * @param {Object} groupData - Datos del grupo a actualizar.
 * @param {string} groupData.id - ID del grupo.
 * @param {string} groupData.name - Nombre del grupo.
 * @param {string} groupData.description - Descripción del grupo.
 * @returns {Object} - Objeto con éxito y mensaje.
 */
export const updateGroup = async (groupData) => {
  try {
    const response = await api.post("/updateGroup", groupData);
    if (response.data.success) {
      return { success: true, message: "Grupo actualizado" };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("Error actualizando grupo:", error);
    return { success: false, message: "Error actualizando grupo" };
  }
};