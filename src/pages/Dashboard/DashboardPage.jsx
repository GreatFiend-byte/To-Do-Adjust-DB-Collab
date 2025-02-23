import { useEffect, useState } from "react";
import { Table, Button, Modal, Input, Select, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";

const DashboardPage = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    timeUntilFinish: "",
    category: "",
    status: "In Progress",
  });
  const [editingTask, setEditingTask] = useState(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId) {
      fetchTasks();
    }
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/getTasks/${userId}`);
      if (response.data.success) {
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.error("Error cargando tareas:", error);
    }
  };

  const handleAddTask = async () => {
    try {
      const response = await axios.post("http://localhost:3000/addTask", { ...newTask, userId });
      if (response.data.success) {
        message.success("Tarea añadida");
        fetchTasks();
        setIsModalVisible(false);
        setNewTask({ name: "", description: "", timeUntilFinish: "", category: "", status: "In Progress" });
      }
    } catch (error) {
      message.error("Error al añadir la tarea");
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await axios.post("http://localhost:3000/deleteTask", { taskId });

      if (response.data.success) {
        message.success("Tarea eliminada");
        fetchTasks();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("Error al eliminar la tarea");
    }
  };

  const handleEditTask = async () => {
    if (!editingTask || !editingTask.id) return;

    try {
      const response = await axios.post("http://localhost:3000/updateTask", editingTask);
      if (response.data.success) {
        message.success("Tarea actualizada");
        fetchTasks();
        setIsEditModalVisible(false);
        setEditingTask(null);
      }
    } catch (error) {
      message.error("Error al actualizar la tarea");
    }
  };

  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Descripción",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Categoría",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Tiempo restante",
      dataIndex: "timeUntilFinish",
      key: "timeUntilFinish",
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Operaciones",
      key: "actions",
      render: (_, record) => (
        <>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingTask(record);
              setIsEditModalVisible(true);
            }}
            style={{ marginRight: 10 }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDeleteTask(record.id)}
          />
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsModalVisible(true)}
        style={{ marginBottom: "20px" }}
      >
        Crear Nuevo
      </Button>

      <Table columns={columns} dataSource={tasks} rowKey="id" />

      <Modal title="Nueva Tarea" open={isModalVisible} onOk={handleAddTask} onCancel={() => setIsModalVisible(false)}>
        <Input placeholder="Nombre" onChange={e => setNewTask({ ...newTask, name: e.target.value })} />
        <Input placeholder="Descripción" onChange={e => setNewTask({ ...newTask, description: e.target.value })} style={{ marginTop: 10 }} />
        <Input placeholder="Tiempo hasta finalizar" onChange={e => setNewTask({ ...newTask, timeUntilFinish: e.target.value })} style={{ marginTop: 10 }} />
        <Input placeholder="Categoría" onChange={e => setNewTask({ ...newTask, category: e.target.value })} style={{ marginTop: 10 }} />
        <Select defaultValue="In Progress" onChange={value => setNewTask({ ...newTask, status: value })} style={{ width: "100%", marginTop: 10 }}>
          <Select.Option value="In Progress">En Progreso</Select.Option>
          <Select.Option value="Done">Completada</Select.Option>
          <Select.Option value="Paused">Pausada</Select.Option>
          <Select.Option value="Revision">En Revisión</Select.Option>
        </Select>
      </Modal>

      <Modal title="Editar Tarea" open={isEditModalVisible} onOk={handleEditTask} onCancel={() => setIsEditModalVisible(false)}>
        <Input
          placeholder="Nombre"
          value={editingTask?.name}
          onChange={e => setEditingTask({ ...editingTask, name: e.target.value })}
        />
        <Input
          placeholder="Descripción"
          value={editingTask?.description}
          onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
          style={{ marginTop: 10 }}
        />
        <Input
          placeholder="Tiempo hasta finalizar"
          value={editingTask?.timeUntilFinish}
          onChange={e => setEditingTask({ ...editingTask, timeUntilFinish: e.target.value })}
          style={{ marginTop: 10 }}
        />
        <Input
          placeholder="Categoría"
          value={editingTask?.category}
          onChange={e => setEditingTask({ ...editingTask, category: e.target.value })}
          style={{ marginTop: 10 }}
        />
        <Select
          value={editingTask?.status}
          onChange={value => setEditingTask({ ...editingTask, status: value })}
          style={{ width: "100%", marginTop: 10 }}
        >
          <Select.Option value="In Progress">En Progreso</Select.Option>
          <Select.Option value="Done">Completada</Select.Option>
          <Select.Option value="Paused">Pausada</Select.Option>
          <Select.Option value="Revision">En Revisión</Select.Option>
        </Select>
      </Modal>
    </div>
  );
};

export default DashboardPage;
