import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Input, Button, message } from "antd";
import axios from "axios";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      return message.error("Todos los campos son obligatorios");
    }

    try {
      const response = await axios.post("http://localhost:3000/login", { username, password });

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        message.success("Inicio de sesión exitoso");
        navigate("/dashboard");
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      message.error("Error en el inicio de sesión");
    }
  };

  return (
    <div className="login-container">
      <Card title="Iniciar Sesión" style={{ width: 300 }}>
        <Input
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input.Password
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginTop: 10 }}
        />
        <Button type="primary" onClick={handleLogin} style={{ marginTop: 10, width: "100%" }}>
          Ingresar
        </Button>
        <Button type="default" onClick={() => navigate("/register")} style={{ marginTop: 10, width: "100%" }}>
          Registrarse
        </Button>
      </Card>
    </div>
  );
};

export default LoginPage;
