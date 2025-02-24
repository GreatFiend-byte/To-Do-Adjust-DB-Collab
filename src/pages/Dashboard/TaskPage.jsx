import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Modal, Input, DatePicker, Select, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const { Option } = Select;

const TaskPage = () => {
  const { groupId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: null,
    assignedTo: null,
    status: "Pending",
  });
  const [editingTask, setEditingTask] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]); 
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (groupId) {
      fetchTasksGroup();
      checkIfUserIsCreator();
      fetchGroupMembers(); 
    }
  }, [groupId]);

  const checkIfUserIsCreator = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/getGroupCreator/${groupId}`);
      if (response.data.success && response.data.creatorId === userId) {
        setIsCreator(true);
      }
    } catch (error) {
      console.error("Error verificando creador del grupo:", error);
    }
  };

  const fetchTasksGroup = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await axios.get(`http://localhost:3000/getGroupTasks/${groupId}`, {
        params: { userId },
      });
      if (response.data.success) {
        setTasks(response.data.tasks);
      } else {
        message.warning("No se encontraron tareas para este grupo.");
      }
    } catch (error) {
      console.error("Error cargando tareas:", error);
      message.error("Error al obtener las tareas.");
    }
  };

  const fetchGroupMembers = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/getGroupMembers/${groupId}`);
      if (response.data.success) {
        setGroupMembers(response.data.members);
      }
    } catch (error) {
      console.error("Error cargando miembros del grupo:", error);
    }
  };

  const handleAddTaskGroup = async () => {
    try {
      const response = await axios.post("http://localhost:3000/addTaskGroup", {
        ...newTask,
        groupId,
        userId,
      });
      if (response.data.success) {
        message.success("Tarea añadida");
        fetchTasksGroup();
        setIsModalVisible(false);
        setNewTask({ title: "", description: "", dueDate: null, assignedTo: null, status: "Pending" });
      }
    } catch (error) {
      message.error("Error al añadir la tarea");
    }
  };

  const handleEditTask = async () => {
    try {
      const response = await axios.post("http://localhost:3000/updateTaskGroup", {
        taskId: editingTask.id,
        title: editingTask.title,
        description: editingTask.description,
        dueDate: editingTask.dueDate,
        assignedTo: editingTask.assignedTo,
        groupId,
        userId,
      });
      if (response.data.success) {
        message.success("Tarea actualizada");
        fetchTasksGroup();
        setIsEditModalVisible(false);
        setEditingTask(null);
      }
    } catch (error) {
      message.error("Error al actualizar la tarea");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await axios.post("http://localhost:3000/deleteTaskGroup", {
        taskId,
        groupId,
        userId,
      });
      if (response.data.success) {
        message.success("Tarea eliminada");
        fetchTasksGroup();
      }
    } catch (error) {
      message.error("Error al eliminar la tarea");
    }
  };

  const handleChangeStatus = async (taskId, newStatus) => {
    try {
      const response = await axios.post("http://localhost:3000/updateTaskStatus", {
        taskId,
        groupId,
        status: newStatus,
        userId,
      });
      if (response.data.success) {
        message.success("Estado de la tarea actualizado");
        fetchTasksGroup();
      }
    } catch (error) {
      message.error("Error al actualizar el estado de la tarea");
    }
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const updatedTasks = Array.from(tasks);
    const [removed] = updatedTasks.splice(source.index, 1);
    updatedTasks.splice(destination.index, 0, removed);

    setTasks(updatedTasks);
  };

  const columns = [
    { id: "Pending", title: "Pendiente" },
    { id: "InProgress", title: "En Progreso" },
    { id: "Completed", title: "Completada" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      {isCreator && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          style={{ marginBottom: "20px" }}
        >
          Añadir Tarea
        </Button>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {columns.map((column) => (
            <div key={column.id} style={{ flex: 1, margin: "0 10px" }}>
              <h3>{column.title}</h3>
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{ background: "#f0f0f0", padding: "10px", borderRadius: "5px" }}
                  >
                    {tasks
                      .filter((task) => task.status === column.id)
                      .map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                marginBottom: "10px",
                                padding: "10px",
                                background: "#fff",
                                borderRadius: "5px",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                ...provided.draggableProps.style,
                              }}
                            >
                              <h4>{task.title}</h4>
                              <p>{task.description}</p>
                              <p>Fecha de entrega: {task.dueDate}</p>
                              <p>Asignado a: {task.assignedTo}</p>
                              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                                {isCreator && (
                                  <>
                                    <Button
                                      icon={<EditOutlined />}
                                      onClick={() => {
                                        setEditingTask(task);
                                        setIsEditModalVisible(true);
                                      }}
                                    >
                                      Editar
                                    </Button>
                                    <Button
                                      danger
                                      icon={<DeleteOutlined />}
                                      onClick={() => handleDeleteTask(task.id)}
                                    >
                                      Eliminar
                                    </Button>
                                  </>
                                )}
                                <Select
                                  defaultValue={task.status}
                                  onChange={(value) => handleChangeStatus(task.id, value)}
                                  disabled={!isCreator} // Deshabilitar si no es el creador
                                >
                                  <Option value="Pending">Pendiente</Option>
                                  <Option value="InProgress">En Progreso</Option>
                                  <Option value="Completed">Completada</Option>
                                </Select>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <Modal
        title="Nueva Tarea"
        visible={isModalVisible}
        onOk={handleAddTaskGroup}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          placeholder="Título"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        />
        <Input
          placeholder="Descripción"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          style={{ marginTop: 10 }}
        />
        <DatePicker
          placeholder="Fecha de entrega"
          style={{ marginTop: 10, width: "100%" }}
          onChange={(date) => setNewTask({ ...newTask, dueDate: date })}
        />
        <Select
          placeholder="Asignar a"
          style={{ marginTop: 10, width: "100%" }}
          onChange={(value) => setNewTask({ ...newTask, assignedTo: value })}
        >
          {groupMembers.map((member) => (
            <Option key={member.id} value={member.username}>
              {member.username}
            </Option>
          ))}
        </Select>
      </Modal>

      <Modal
        title="Editar Tarea"
        visible={isEditModalVisible}
        onOk={handleEditTask}
        onCancel={() => setIsEditModalVisible(false)}
      >
        <Input
          placeholder="Título"
          value={editingTask?.title}
          onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
        />
        <Input
          placeholder="Descripción"
          value={editingTask?.description}
          onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
          style={{ marginTop: 10 }}
        />
        <DatePicker
          placeholder="Fecha de entrega"
          style={{ marginTop: 10, width: "100%" }}
          value={editingTask?.dueDate}
          onChange={(date) => setEditingTask({ ...editingTask, dueDate: date })}
        />
        <Select
          placeholder="Asignar a"
          style={{ marginTop: 10, width: "100%" }}
          value={editingTask?.assignedTo}
          onChange={(value) => setEditingTask({ ...editingTask, assignedTo: value })}
        >
          {groupMembers.map((member) => (
            <Option key={member.id} value={member.username}>
              {member.username}
            </Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};

export default TaskPage;