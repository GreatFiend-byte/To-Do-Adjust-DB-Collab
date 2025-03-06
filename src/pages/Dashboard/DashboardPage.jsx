import { useEffect, useState } from "react";
import { Table, Button, Modal, Input, Select, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { fetchTasks, addTask, deleteTask, updateTask } from "../../service/taskService";

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
      loadTasks();
    }
  }, [userId]);

  const loadTasks = async () => {
    const result = await fetchTasks(userId);
    if (result.success) {
      setTasks(result.tasks);
    } else {
      message.error(result.message);
    }
  };

  const handleAddTask = async () => {
    const result = await addTask({ ...newTask, userId });
    if (result.success) {
      message.success(result.message);
      loadTasks();
      setIsModalVisible(false);
      setNewTask({ name: "", description: "", timeUntilFinish: "", category: "", status: "In Progress" });
    } else {
      message.error(result.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const result = await deleteTask(taskId);
    if (result.success) {
      message.success(result.message);
      loadTasks();
    } else {
      message.error(result.message);
    }
  };

  const handleEditTask = async () => {
    if (!editingTask || !editingTask.id) return;

    const result = await updateTask(editingTask);
    if (result.success) {
      message.success(result.message);
      loadTasks();
      setIsEditModalVisible(false);
      setEditingTask(null);
    } else {
      message.error(result.message);
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