import { useEffect, useState } from "react";
import { Table, Select, Button, Modal, Input, message } from "antd";
import { fetchUsers, updateUserRole, editUser, deleteUser, addUser } from "../../service/adminUserService";

const { Option } = Select;

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddUserModalVisible, setIsAddUserModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "", role: "user" });
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    if (userRole !== "admin") {
      message.error("No tienes permiso para acceder a esta página");
      window.location.href = "/dashboard";
    } else {
      loadUsers();
    }
  }, [userRole]);

  const loadUsers = async () => {
    const result = await fetchUsers();
    if (result.success) {
      setUsers(result.users);
    } else {
      message.error(result.message);
    }
  };

  const handleUpdateRole = async (Id, newRole) => {
    const result = await updateUserRole(Id, newRole, userId);
    if (result.success) {
      message.success(result.message);
      loadUsers();
    } else {
      message.error(result.message);
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    const result = await editUser(editingUser.id, editingUser, userId);
    if (result.success) {
      message.success(result.message);
      setIsModalVisible(false);
      loadUsers();
    } else {
      message.error(result.message);
    }
  };

  const handleDeleteUser = async (Id) => {
    const result = await deleteUser(Id, userId);
    if (result.success) {
      message.success(result.message);
      loadUsers();
    } else {
      message.error(result.message);
    }
  };

  const handleAddUser = async () => {
    const result = await addUser(newUser, userId);
    if (result.success) {
      message.success(result.message);
      setIsAddUserModalVisible(false);
      setNewUser({ username: "", email: "", password: "", role: "user" });
      loadUsers();
    } else {
      message.error(result.message);
    }
  };

  const columns = [
    {
      title: "Nombre",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Rol",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, user) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Select
            defaultValue={user.role}
            onChange={(value) => handleUpdateRole(user.id, value)}
          >
            <Option value="user">Usuario</Option>
            <Option value="admin">Admin</Option>
          </Select>
          <Button
            type="primary"
            onClick={() => {
              setEditingUser({ ...user, password: "" }); // Inicializar la contraseña como vacía
              setIsModalVisible(true);
            }}
          >
            Editar
          </Button>
          <Button
            danger
            onClick={() => handleDeleteUser(user.id)}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h1>Panel de Administración</h1>
      <Button
        type="primary"
        onClick={() => setIsAddUserModalVisible(true)}
        style={{ marginBottom: "20px" }}
      >
        Agregar Usuario
      </Button>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      {/* Modal para editar usuario */}
      <Modal
        title="Editar Usuario"
        visible={isModalVisible}
        onOk={handleEditUser}
        onCancel={() => setIsModalVisible(false)}
      >
        <input type="hidden" value={editingUser?.id || ""} />
        <Input
          placeholder="Nombre"
          value={editingUser?.username}
          onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
        />
        <Input
          placeholder="Email"
          value={editingUser?.email}
          onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
          style={{ marginTop: 10 }}
        />
        <Input
          placeholder="Nueva Contraseña"
          type="password"
          value={editingUser?.password}
          onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
          style={{ marginTop: 10 }}
        />
      </Modal>

      {/* Modal para agregar usuario */}
      <Modal
        title="Agregar Usuario"
        visible={isAddUserModalVisible}
        onOk={handleAddUser}
        onCancel={() => setIsAddUserModalVisible(false)}
      >
        <Input
          placeholder="Nombre"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
        />
        <Input
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          style={{ marginTop: 10 }}
        />
        <Input
          placeholder="Contraseña"
          type="password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          style={{ marginTop: 10 }}
        />
        <Select
          placeholder="Rol"
          value={newUser.role}
          onChange={(value) => setNewUser({ ...newUser, role: value })}
          style={{ marginTop: 10, width: "100%" }}
        >
          <Option value="user">Usuario</Option>
          <Option value="admin">Admin</Option>
        </Select>
      </Modal>
    </div>
  );
};

export default AdminPage;