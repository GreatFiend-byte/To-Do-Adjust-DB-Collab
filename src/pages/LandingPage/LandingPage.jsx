import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <motion.div 
        className="content"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1>Bienvenido a <span className="highlight">Task Manager</span></h1>
        <p>Organiza tus tareas de manera eficiente y alcanza tus objetivos.</p>
        <div className="buttons">
          <Button type="primary" size="large" onClick={() => navigate("/login")}>
            Iniciar Sesión
          </Button>
          <Button size="large" onClick={() => navigate("/register")}>
            Registrarse
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
