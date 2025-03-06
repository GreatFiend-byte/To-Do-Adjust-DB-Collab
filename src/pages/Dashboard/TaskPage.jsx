import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Modal, Input, Select, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  fetchTasksGroup,
  addTaskGroup,
  updateTaskGroup,
  deleteTaskGroup,
  updateTaskStatus,
  fetchGroupMembers,
  checkIfUserIsCreator,
} from "../../service/taskGroupService";

const { Option } = Select;

const TaskPage = () => {
  const { groupId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "", // Ahora es una cadena
    assignedTo: null,
    status: "Pending",
  });
  const [editingTask, setEditingTask] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (groupId) {
      loadTasks();
      checkIfCreator();
      loadGroupMembers();
    }
  }, [groupId]);

  const loadTasks = async () => {
    const result = await fetchTasksGroup(groupId, userId);
    if (result.success) {
      setTasks(result.tasks); // No se necesita conversión a moment
    } else {
      message.error(result.message);
    }
  };

  const checkIfCreator = async () => {
    const result = await checkIfUserIsCreator(groupId);
    if (result.success && result.creatorId === userId) {
      setIsCreator(true);
    }
  };

  const loadGroupMembers = async () => {
    const result = await fetchGroupMembers(groupId);
    if (result.success) {
      setGroupMembers(result.members);
    } else {
      message.error(result.message);
    }
  };

  const handleAddTaskGroup = async () => {
    const result = await addTaskGroup(newTask, groupId, userId);
    if (result.success) {
      message.success(result.message);
      loadTasks();
      setIsModalVisible(false);
      setNewTask({ title: "", description: "", dueDate: "", assignedTo: null, status: "Pending" });
    } else {
      message.error(result.message);
    }
  };

  const handleEditTask = async () => {
    if (!editingTask?.id) {
      message.error("ID de tarea inválido");
      return;
    }

    const taskData = {
      ...editingTask,
      taskId: String(editingTask.id), // Asegúrate de que taskId sea una cadena
    };

    const result = await updateTaskGroup(taskData, groupId, userId);
    if (result.success) {
      message.success(result.message);
      loadTasks();
      setIsEditModalVisible(false);
      setEditingTask({
        taskId: "", // Limpia el taskId al cerrar el modal
        title: "",
        description: "",
        dueDate: "",
        assignedTo: null,
      });
    } else {
      message.error(result.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const result = await deleteTaskGroup(taskId, groupId, userId);
    if (result.success) {
      message.success(result.message);
      loadTasks();
    } else {
      message.error(result.message);
    }
  };

  const handleChangeStatus = async (taskId, newStatus) => {
    const result = await updateTaskStatus(taskId, groupId, newStatus, userId);
    if (result.success) {
      message.success(result.message);
      loadTasks();
    } else {
      message.error(result.message);
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
        <Input
          placeholder="Fecha de entrega (YYYY-MM-DD)"
          value={newTask.dueDate}
          onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
          style={{ marginTop: 10 }}
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
        <input type="hidden" value={editingTask?.id || ""} />
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
        <Input
          placeholder="Fecha de entrega (YYYY-MM-DD)"
          value={editingTask?.dueDate}
          onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
          style={{ marginTop: 10 }}
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