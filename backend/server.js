const express = require("express");
const admin = require("firebase-admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const crypto = require("crypto");


const app = express();
app.use(express.json());
app.use(cors());
const JWT_SECRET="aXdlbI5KwLJx1zPv0yXZtR0AeFGRHzJ5mWV2wz+6AQk="


const serviceAccount = require("./firebase-config.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const usersCollection = db.collection("users");

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Correo electrónico inválido" });
    }

    const existingUser = await usersCollection.where("email", "==", email).get();
    if (!existingUser.empty) {
      return res.status(400).json({ success: false, message: "El usuario ya existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await usersCollection.add({ username, email, password: hashedPassword });

    res.json({ success: true, message: "Usuario registrado exitosamente" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
    }

    const userQuery = await usersCollection.where("username", "==", username).get();
    if (userQuery.empty) {
      return res.status(400).json({ success: false, message: "Usuario no encontrado" });
    }

    const userDoc = userQuery.docs[0];
    const user = userDoc.data();
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Contraseña incorrecta" });
    }

    const token = jwt.sign({ userId: userDoc.id }, JWT_SECRET, { expiresIn: "10m" });

    res.json({ success: true, message: "Inicio de sesión exitoso", token });
  } catch (error) {
    console.error("Error en /login:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});

const PORT = process.env.PORT || 3000;
console.log("JWT_SECRET:", JWT_SECRET);
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
