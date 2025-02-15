import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Input, Button } from "antd";

const users = [{ username: "marco", password: "marc321" }];

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    const user = users.find(
      (user) => user.username === username && user.password === password
    );
    if (user) {
      navigate("/dashboard");
    } else {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <div className="login-container">
      <Card title="Iniciar Sesión" style={{ width: 300 }}>
        <Input placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} />
        <Input.Password placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} style={{ marginTop: 10 }} />
        <Button type="primary" onClick={handleLogin} style={{ marginTop: 10, width: "100%" }}>Ingresar</Button>
      </Card>
    </div>
  );
};

export default LoginPage;