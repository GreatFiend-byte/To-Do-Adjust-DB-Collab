import api from "./api";

/**
 * Obtener todas las tareas de un usuario.
 * @param {string} userId - ID del usuario.
 * @returns {Object} - Objeto con éxito y lista de tareas.
 */
export const fetchTasks = async (userId) => {
  try {
    const response = await api.get(`/getTasks/${userId}`);
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
 * Agregar una nueva tarea.
 * @param {Object} taskData - Datos de la tarea.
 * @param {string} taskData.userId - ID del usuario.
 * @param {string} taskData.name - Nombre de la tarea.
 * @param {string} taskData.description - Descripción de la tarea.
 * @param {string} taskData.timeUntilFinish - Tiempo hasta finalizar.
 * @param {string} taskData.category - Categoría de la tarea.
 * @param {string} taskData.status - Estado de la tarea.
 * @returns {Object} - Objeto con éxito y mensaje.
 */
export const addTask = async (taskData) => {
  try {
    const response = await api.post("/addTask", taskData);
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
 * Eliminar una tarea.
 * @param {string} taskId - ID de la tarea a eliminar.
 * @returns {Object} - Objeto con éxito y mensaje.
 */
export const deleteTask = async (taskId) => {
  try {
    const response = await api.post("/deleteTask", { taskId });
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
 * Actualizar una tarea.
 * @param {Object} taskData - Datos de la tarea a actualizar.
 * @param {string} taskData.id - ID de la tarea.
 * @param {string} taskData.name - Nombre de la tarea.
 * @param {string} taskData.description - Descripción de la tarea.
 * @param {string} taskData.timeUntilFinish - Tiempo hasta finalizar.
 * @param {string} taskData.category - Categoría de la tarea.
 * @param {string} taskData.status - Estado de la tarea.
 * @returns {Object} - Objeto con éxito y mensaje.
 */
export const updateTask = async (taskData) => {
  try {
    const response = await api.post("/updateTask", taskData);
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