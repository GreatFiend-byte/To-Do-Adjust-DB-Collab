import { useEffect, useState } from "react";
import { Card, Button, Modal, Input, Select, message } from "antd";
import axios from "axios";

const DashboardPage = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    timeUntilFinish: "",
    remindMe: false,
    status: "In Progress",
    category: ""
  });

  const userId = localStorage.getItem("userId"); // Obtener el userId almacenado

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
        setNewTask({ name: "", description: "", timeUntilFinish: "", remindMe: false, status: "In Progress", category: "" });
      }
    } catch (error) {
      message.error("Error al añadir la tarea");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {tasks.map(task => (
        <Card key={task.id} title={task.name} style={{ marginBottom: "10px" }}>
          <p>Status: {task.status}</p>
        </Card>
      ))}

      <Button 
        type="primary" 
        style={{ position: "fixed", bottom: "20px", right: "20px" }}
        onClick={() => setIsModalVisible(true)}
      >
        + Agregar Tarea
      </Button>

      <Modal title="Nueva Tarea" visible={isModalVisible} onOk={handleAddTask} onCancel={() => setIsModalVisible(false)}>
        <Input placeholder="Nombre de la tarea" onChange={e => setNewTask({ ...newTask, name: e.target.value })} />
        <Input placeholder="Descripción" onChange={e => setNewTask({ ...newTask, description: e.target.value })} style={{ marginTop: 10 }} />
        <Input placeholder="Tiempo hasta finalizar" onChange={e => setNewTask({ ...newTask, timeUntilFinish: e.target.value })} style={{ marginTop: 10 }} />
        <Select defaultValue="In Progress" onChange={value => setNewTask({ ...newTask, status: value })} style={{ width: "100%", marginTop: 10 }}>
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
