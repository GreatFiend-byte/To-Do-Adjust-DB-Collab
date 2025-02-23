import { useEffect, useState } from "react";
import { Table, Button, Modal, Input, message, Checkbox, List } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DashboardGroupPage = () => {
  const [groups, setGroups] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    status: "Active",
    members: [], // Lista de IDs de usuarios seleccionados
  });
  const [editingGroup, setEditingGroup] = useState(null);
  const [users, setUsers] = useState([]); // Lista de todos los usuarios
  const [searchQuery, setSearchQuery] = useState(""); // Buscador de usuarios
  const [selectedUsers, setSelectedUsers] = useState([]); // Usuarios seleccionados
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId) {
      fetchGroups();
      fetchUsers(); // Obtener la lista de usuarios al cargar el componente
    }
  }, [userId]);

  // Obtener la lista de grupos del usuario (creados y como miembro)
  const fetchGroups = async () => {
    try {
      // Obtener grupos creados por el usuario
      const createdGroupsResponse = await axios.get(`http://localhost:3000/getUserGroups/${userId}`);
      const createdGroups = createdGroupsResponse.data.success ? createdGroupsResponse.data.groups : [];

      // Obtener grupos donde el usuario es miembro
      const memberGroupsResponse = await axios.get(`http://localhost:3000/getGroupsByUser/${userId}`);
      const memberGroups = memberGroupsResponse.data.success ? memberGroupsResponse.data.groups : [];

      // Combinar y eliminar duplicados
      const allGroups = [...createdGroups, ...memberGroups];
      const uniqueGroups = Array.from(new Set(allGroups.map((group) => group.id))).map((id) =>
        allGroups.find((group) => group.id === id)
      );

      setGroups(uniqueGroups);
    } catch (error) {
      console.error("Error cargando grupos:", error);
    }
  };

  // Obtener la lista de usuarios
  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/getUsers");
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  // Filtrar usuarios basado en la búsqueda
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Manejar la selección de usuarios
  const handleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // Abrir el modal para seleccionar usuarios
  const openUserSelectionModal = () => {
    setIsUserModalVisible(true);
  };

  // Cerrar el modal de selección de usuarios
  const closeUserSelectionModal = () => {
    setIsUserModalVisible(false);
    setSearchQuery(""); // Limpiar la búsqueda
  };

  // Guardar los usuarios seleccionados y cerrar el modal
  const saveSelectedUsers = () => {
    setNewGroup({ ...newGroup, members: selectedUsers });
    closeUserSelectionModal();
  };

  // Crear un nuevo grupo
  const handleAddGroup = async () => {
    try {
      const response = await axios.post("http://localhost:3000/addGroup", {
        ...newGroup,
        userId,
      });
      if (response.data.success) {
        message.success("Grupo añadido");
        fetchGroups();
        setIsModalVisible(false);
        setNewGroup({ name: "", description: "", status: "Active", members: [] });
        setSelectedUsers([]); // Limpiar la selección de usuarios
      }
    } catch (error) {
      message.error("Error al añadir el grupo");
    }
  };

  // Eliminar un grupo
  const handleDeleteGroup = async (groupId) => {
    try {
      const response = await axios.post("http://localhost:3000/deleteGroup", { groupId });
      if (response.data.success) {
        message.success("Grupo eliminado");
        fetchGroups();
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("Error al eliminar el grupo");
    }
  };

  // Editar un grupo
  const handleEditGroup = async () => {
    if (!editingGroup || !editingGroup.id) return;

    try {
      const response = await axios.post("http://localhost:3000/updateGroup", editingGroup);
      if (response.data.success) {
        message.success("Grupo actualizado");
        fetchGroups();
        setIsEditModalVisible(false);
        setEditingGroup(null);
      }
    } catch (error) {
      message.error("Error al actualizar el grupo");
    }
  };

  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <a onClick={() => navigate(`/tasks/${record.id}`)} style={{ cursor: "pointer" }}>
          {text}
        </a>
      ),
    },
    {
      title: "Descripción",
      dataIndex: "description",
      key: "description",
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
              setEditingGroup(record);
              setIsEditModalVisible(true);
            }}
            style={{ marginRight: 10 }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDeleteGroup(record.id)}
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
        Crear Nuevo Grupo
      </Button>

      <Table columns={columns} dataSource={groups} rowKey="id" />

      {/* Modal para crear un nuevo grupo */}
      <Modal
        title="Nuevo Grupo"
        visible={isModalVisible}
        onOk={handleAddGroup}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          placeholder="Nombre"
          onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
        />
        <Input
          placeholder="Descripción"
          onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
          style={{ marginTop: 10 }}
        />
        <Button
          type="primary"
          onClick={openUserSelectionModal}
          style={{ marginTop: 10 }}
        >
          Seleccionar Usuarios
        </Button>
      </Modal>

      {/* Modal para seleccionar usuarios */}
      <Modal
        title="Seleccionar Usuarios"
        visible={isUserModalVisible}
        onOk={saveSelectedUsers}
        onCancel={closeUserSelectionModal}
      >
        <Input
          placeholder="Buscar usuarios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <List
          dataSource={filteredUsers}
          renderItem={(user) => (
            <List.Item>
              <Checkbox
                checked={selectedUsers.includes(user.id)}
                onChange={() => handleUserSelection(user.id)}
              >
                {user.username}
              </Checkbox>
            </List.Item>
          )}
        />
      </Modal>

      {/* Modal para editar un grupo */}
      <Modal
        title="Editar Grupo"
        visible={isEditModalVisible}
        onOk={handleEditGroup}
        onCancel={() => setIsEditModalVisible(false)}
      >
        <Input
          placeholder="Nombre"
          value={editingGroup?.name}
          onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
        />
        <Input
          placeholder="Descripción"
          value={editingGroup?.description}
          onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
          style={{ marginTop: 10 }}
        />
      </Modal>
    </div>
  );
};

export default DashboardGroupPage;