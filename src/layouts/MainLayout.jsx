import { Layout, Menu, Typography } from "antd";
import { Link } from "react-router-dom";
import {
  DashboardOutlined,
  UnorderedListOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MainLayout = ({ children }) => {
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
            <Link to="/dashboard">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<UnorderedListOutlined />}>Tareas</Menu.Item>
          <Menu.Item key="3" icon={<SettingOutlined />}>Configuración</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header className="header-bar" />
        <Content className="content-container">{children}</Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;