import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout, Menu } from "antd";
import LandingPage from "./pages/LandingPage/LandingPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import MainLayout from "./layouts/MainLayout";
import "./styles/global.css";

const { Header, Content, Sider } = Layout;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
