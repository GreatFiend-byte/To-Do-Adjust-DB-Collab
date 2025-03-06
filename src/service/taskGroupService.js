import api from "./api"; // Importamos la instancia configurada de axios


/**
 * Obtener todas las tareas de un grupo.
 * @param {string} groupId - ID del grupo.
 * @param {string} userId - ID del usuario.
 * @returns {Object} - Objeto con éxito y lista de tareas.
 */
export const fetchTasksGroup = async (groupId, userId) => {
  try {
    const response = await api.get(`/getGroupTasks/${groupId}`, {
      params: { userId },
    });
    if (response.data.success) {
      return { success: true, tasks: response.data.tasks };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("Error cargando tareas:", error);
    return { success: false, message: "Error cargando tareas" };
  }
};

/**
 * Agregar una nueva tarea a un grupo.
 * @param {Object} taskData - Datos de la tarea.
 * @param {string} taskData.title - Título de la tarea.
 * @param {string} taskData.description - Descripción de la tarea.
 * @param {string} taskData.dueDate - Fecha de vencimiento de la tarea.
 * @param {string} taskData.assignedTo - ID del usuario asignado.
 * @param {string} taskData.status - Estado de la tarea.
 * @param {string} groupId - ID del grupo.
 * @param {string} userId - ID del usuario creador.
 * @returns {Object} - Objeto con éxito y mensaje.
 */
export const addTaskGroup = async (taskData, groupId, userId) => {
  try {
    const response = await api.post("/addTaskGroup", {
      ...taskData,
      groupId,
      userId,
    });
    if (response.data.success) {
      return { success: true, message: "Tarea añadida", taskId: response.data.taskId };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("Error añadiendo tarea:", error);
    return { success: false, message: "Error añadiendo tarea" };
  }
};

/**
 * Actualizar una tarea de un grupo.
 * @param {Object} taskData - Datos de la tarea a actualizar.
 * @param {string} taskData.taskId - ID de la tarea.
 * @param {string} taskData.title - Título de la tarea.
 * @param {string} taskData.description - Descripción de la tarea.
 * @param {string} taskData.dueDate - Fecha de vencimiento de la tarea.
 * @param {string} taskData.assignedTo - ID del usuario asignado.
 * @param {string} groupId - ID del grupo.
 * @param {string} userId - ID del usuario.
 * @returns {Object} - Objeto con éxito y mensaje.
 */
export const updateTaskGroup = async (taskData, groupId, userId) => {
  try {
    console.log("Datos enviados:", { ...taskData, groupId, userId });
    const response = await api.post("/updateTaskGroup", {
      ...taskData,
      groupId,
      userId,
    });
    if (response.data.success) {
      return { success: true, message: "Tarea actualizada" };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("Error actualizando tarea:", error);
    return { success: false, message: "Error actualizando tarea" };
  }
};

/**
 * Eliminar una tarea de un grupo.
 * @param {string} taskId - ID de la tarea.
 * @param {string} groupId - ID del grupo.
 * @param {string} userId - ID del usuario.
 * @returns {Object} - Objeto con éxito y mensaje.
 */
export const deleteTaskGroup = async (taskId, groupId, userId) => {
  try {
    const response = await api.post("/deleteTaskGroup", {
      taskId,
      groupId,
      userId,
    });
    if (response.data.success) {
      return { success: true, message: "Tarea eliminada" };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("Error eliminando tarea:", error);
    return { success: false, message: "Error eliminando tarea" };
  }
};

/**
 * Cambiar el estado de una tarea.
 * @param {string} taskId - ID de la tarea.
 * @param {string} groupId - ID del grupo.
 * @param {string} status - Nuevo estado de la tarea.
 * @param {string} userId - ID del usuario.
 * @returns {Object} - Objeto con éxito y mensaje.
 */
export const updateTaskStatus = async (taskId, groupId, status, userId) => {
  try {
    const response = await api.post("/updateTaskStatus", {
      taskId,
      groupId,
      status,
      userId,
    });
    if (response.data.success) {
      return { success: true, message: "Estado de la tarea actualizado" };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("Error actualizando estado de la tarea:", error);
    return { success: false, message: "Error actualizando estado de la tarea" };
  }
};

/**
 * Obtener los miembros de un grupo.
 * @param {string} groupId - ID del grupo.
 * @returns {Object} - Objeto con éxito y lista de miembros.
 */
export const fetchGroupMembers = async (groupId) => {
  try {
    const response = await api.get(`/getGroupMembers/${groupId}`);
    if (response.data.success) {
      return { success: true, members: response.data.members };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("Error cargando miembros del grupo:", error);
    return { success: false, message: "Error cargando miembros del grupo" };
  }
};

/**
 * Verificar si el usuario es el creador del grupo.
 * @param {string} groupId - ID del grupo.
 * @returns {Object} - Objeto con éxito y ID del creador.
 */
export const checkIfUserIsCreator = async (groupId) => {
  try {
    const response = await api.get(`/getGroupCreator/${groupId}`);
    if (response.data.success) {
      return { success: true, creatorId: response.data.creatorId };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("Error verificando creador del grupo:", error);
    return { success: false, message: "Error verificando creador del grupo" };
  }
};