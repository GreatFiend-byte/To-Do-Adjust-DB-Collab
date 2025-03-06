import { useEffect, useState } from "react";
import { Table, Button, Modal, Input, message, Checkbox, List } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { fetchGroups, fetchUsers, addGroup, deleteGroup, updateGroup } from "../../service/groupService";

const DashboardGroupPage = () => {
  const [groups, setGroups] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    status: "Active",
    members: [],
  });
  const [editingGroup, setEditingGroup] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId) {
      loadGroups();
      loadUsers();
    }
  }, [userId]);

  const loadGroups = async () => {
    const result = await fetchGroups(userId);
    if (result.success) {
      setGroups(result.groups);
    } else {
      message.error(result.message);
    }
  };

  const loadUsers = async () => {
    const result = await fetchUsers();
    if (result.success) {
      setUsers(result.users);
    } else {
      message.error(result.message);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const openUserSelectionModal = () => {
    setIsUserModalVisible(true);
  };

  const closeUserSelectionModal = () => {
    setIsUserModalVisible(false);
    setSearchQuery("");
  };

  const saveSelectedUsers = () => {
    setNewGroup({ ...newGroup, members: selectedUsers });
    closeUserSelectionModal();
  };

  const handleAddGroup = async () => {
    const result = await addGroup({ ...newGroup, userId });
    if (result.success) {
      message.success(result.message);
      loadGroups();
      setIsModalVisible(false);
      setNewGroup({ name: "", description: "", status: "Active", members: [] });
      setSelectedUsers([]);
    } else {
      message.error(result.message);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    const result = await deleteGroup(groupId);
    if (result.success) {
      message.success(result.message);
      loadGroups();
    } else {
      message.error(result.message);
    }
  };

  const handleEditGroup = async () => {
    if (!editingGroup || !editingGroup.id) return;

    const result = await updateGroup(editingGroup);
    if (result.success) {
      message.success(result.message);
      loadGroups();
      setIsEditModalVisible(false);
      setEditingGroup(null);
    } else {
      message.error(result.message);
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

      {/* Modal para editar grupo */}
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