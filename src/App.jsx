import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import DashboardGroupPage from "./pages/Dashboard/DashboardGroupPage";
import TaskPage from "./pages/Dashboard//TaskPage";
import MainLayout from "./layouts/MainLayout";
import "./styles/global.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={
          <MainLayout>
            <DashboardPage />
          </MainLayout>
        }
        />
        <Route
          path="/dashboard-group"
          element={
            <MainLayout>
              <DashboardGroupPage />
            </MainLayout>
          }
        />
        <Route path="/tasks/:groupId" element={<MainLayout><TaskPage /></MainLayout>} />
      </Routes>
    </Router>
  );
}
export default App;
