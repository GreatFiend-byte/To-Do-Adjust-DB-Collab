import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Input, Button, message } from "antd";
import { loginService } from "../../service/authService";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

const handleLogin = async () => {
  if (!username || !password) {
    return message.error("Todos los campos son obligatorios");
  }

  const result = await loginService(username, password);

  if (result.success) {
    message.success(result.message);
    setTimeout(() => {
      navigate("/dashboard");
    }, 1000);
  } else {
    message.error(result.message);
  }
};
  

  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("role");



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
