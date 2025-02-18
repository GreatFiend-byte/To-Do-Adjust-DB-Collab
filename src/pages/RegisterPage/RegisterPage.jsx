import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Input, Button, message } from "antd";
import axios from "axios";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleRegister = async () => {
    if (!email || !username || !password) {
      return message.error("Todos los campos son obligatorios");
    }

    if (!isValidEmail(email)) {
      return message.error("El correo electrónico no es válido");
    }

    try {
      const response = await axios.post("http://localhost:3000/register", {
        email,
        username,
        password,
      });

      if (response.data.success) {
        message.success("Registro exitoso, ahora inicia sesión");
        navigate("/login");
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error("Error en el registro");
    }
  };

  return (
    <div className="register-container">
      <Card title="Registro" style={{ width: 300 }}>
        <Input
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ marginTop: 10 }}
        />
        <Input.Password
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginTop: 10 }}
        />
        <Button type="primary" onClick={handleRegister} style={{ marginTop: 10, width: "100%" }}>
          Registrarse
        </Button>
        <Button type="default" onClick={() => navigate("/login")} style={{ marginTop: 10, width: "100%" }}>
          Ya tengo cuenta
        </Button>
      </Card>
    </div>
  );
};

export default RegisterPage;
