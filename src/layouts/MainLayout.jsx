import { Layout, Menu, Typography, Dropdown, Button } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { DashboardOutlined, UnorderedListOutlined, UserSwitchOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("Usuario");
  const [userRole, setUserRole] = useState("user"); // Estado para almacenar el rol del usuario

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role"); // Obtener el rol del usuario
    if (storedUser) {
      setUsername(storedUser);
    }
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role"); // Eliminar el rol al cerrar sesión
    navigate("/login");
  };

  const menu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Cerrar sesión
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider theme="dark" collapsible>
        <div className="logo">
          <Title level={3} style={{ color: "white", padding: "16px", textAlign: "center" }}>
            Task Manager
          </Title>
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
          <Menu.Item key="1" icon={<DashboardOutlined />}>
            <Link to="/dashboard">Tareas</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<UnorderedListOutlined />}>
            <Link to="/dashboard-group">Grupo de Tareas</Link>
          </Menu.Item>
          {/* Mostrar la opción "Usuarios" solo si el usuario es admin */}
          {userRole === "admin" && (
            <Menu.Item key="3" icon={<UserSwitchOutlined />}>
              <Link to="/admin">Usuarios</Link>
            </Menu.Item>
          )}
        </Menu>
      </Sider>
      <Layout>
        <Header className="header-bar" style={{ display: "flex", justifyContent: "flex-end", paddingRight: "20px" }}>
          <Dropdown overlay={menu} placement="bottomRight">
            <Button icon={<UserOutlined />}>{username}</Button>
          </Dropdown>
        </Header>
        <Content className="content-container">{children}</Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;