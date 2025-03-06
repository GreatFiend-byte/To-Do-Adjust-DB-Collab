import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; // Cambia Redirect por Navigate
import LandingPage from "./pages/LandingPage/LandingPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import DashboardGroupPage from "./pages/Dashboard/DashboardGroupPage";
import TaskPage from "./pages/Dashboard/TaskPage";
import AdminPage from "./pages/Dashboard/AdminPage";
import MainLayout from "./layouts/MainLayout";
import "./styles/global.css";


const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard-group"
          element={
            <PrivateRoute>
              <MainLayout>
                <DashboardGroupPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/tasks/:groupId"
          element={
            <PrivateRoute>
              <MainLayout>
                <TaskPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <MainLayout>
                <AdminPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;