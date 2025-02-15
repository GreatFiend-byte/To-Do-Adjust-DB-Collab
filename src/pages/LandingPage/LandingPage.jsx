import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="landing-container">
      <h1>Bienvenido a Task Manager</h1>
      <Button type="primary" onClick={() => navigate("/login")}>Iniciar Sesión</Button>
    </div>
  );
};

export default LandingPage;