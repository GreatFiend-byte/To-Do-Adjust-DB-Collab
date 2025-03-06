const express = require("express");
const admin = require("firebase-admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));


const JWT_SECRET = crypto.randomBytes(32).toString("hex");

const serviceAccount = require("./firebase-config.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const usersCollection = db.collection("users");
const groupsCollection = db.collection("groups"); 

app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Correo electrónico inválido" });
    }

    // Verificar si el usuario ya existe
    const existingUser = await usersCollection.where("username", "==", username).get();
    if (!existingUser.empty) {
      return res.status(400).json({ success: false, message: "El usuario ya existe" });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Guardar el usuario en Firestore
    await usersCollection.add({ username, email, password: hashedPassword,  role: "user", });

    res.json({ success: true, message: "Usuario registrado exitosamente" });
  } catch (error) {
    console.error("Error en el registro:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});

app.post("/api/updateUserRole", async (req, res) => {
  try {
    const { userId, newRole, adminId } = req.body;

    // Verificar si el usuario que hace la solicitud es admin
    const adminDoc = await usersCollection.doc(adminId).get();
    if (!adminDoc.exists || adminDoc.data().role !== "admin") {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    // Actualizar el rol del usuario
    await usersCollection.doc(userId).update({ role: newRole });

    res.json({ success: true, message: "Rol de usuario actualizado" });
  } catch (error) {
    console.error("Error actualizando rol:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});

app.post("/api/login", async (req, res) => {
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

    const token = jwt.sign({ userId: userDoc.id }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ success: true, message: "Inicio de sesión exitoso", token, userId: userDoc.id, role: user.role, 

    });
  } catch (error) {
    console.error("Error en el inicio de sesión:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});

app.get("/api/getUsers", async (req, res) => {
  try {
    const usersSnapshot = await usersCollection.get();
    const users = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, users });
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    res.status(500).json({ success: false, message: "Error obteniendo usuarios" });
  }
});


app.post("/api/addTask", async (req, res) => {
  try {
    const { userId, name, description, timeUntilFinish, remindMe, status, category } = req.body;

    // Validar campos obligatorios
    if (!userId || !name || !status) {
      return res.status(400).json({ success: false, message: "Faltan datos obligatorios" });
    }

    const taskData = {
      userId,
      name,
      description: description || "",
      timeUntilFinish: timeUntilFinish || null,
      remindMe: remindMe || false,
      status,
      category: category || "",
      createdAt: new Date()
    };

    // Guardar la tarea en Firestore
    const taskRef = await db.collection("tasks").add(taskData);

    res.json({ success: true, message: "Tarea agregada", taskId: taskRef.id });
  } catch (error) {
    console.error("Error en /addTask:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});

app.get("/api/getTasks/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const tasksSnapshot = await db.collection("tasks").where("userId", "==", userId).get();
    
    const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    res.json({ success: true, tasks });
  } catch (error) {
    console.error("Error en /getTasks:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});

app.post("/api/deleteTask", async (req, res) => {
  try {
    const { taskId } = req.body; // Recibir el ID de la tarea a eliminar

    if (!taskId) {
      return res.status(400).json({ success: false, message: "El ID de la tarea es obligatorio" });
    }

    const taskRef = db.collection("tasks").doc(taskId);
    const taskDoc = await taskRef.get();

    if (!taskDoc.exists) {
      return res.status(404).json({ success: false, message: "Tarea no encontrada" });
    }

    await taskRef.delete();

    res.json({ success: true, message: "Tarea eliminada correctamente" });
  } catch (error) {
    console.error("Error en /deleteTask:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});

app.post("/api/updateTask", async (req, res) => {
  try {
    const { id, name, description, timeUntilFinish, remindMe, status, category } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "ID de tarea requerido" });
    }

    const taskRef = db.collection("tasks").doc(id);
    await taskRef.update({ name, description, timeUntilFinish, remindMe, status, category });

    res.json({ success: true, message: "Tarea actualizada correctamente" });
  } catch (error) {
    console.error("Error en /updateTask:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});


app.get("/api/getUserGroups/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await groupsCollection.where("userId", "==", userId).get();
    const groups = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, groups });
  } catch (error) {
    console.error("Error al obtener grupos:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});


app.get("/api/getGroupsByUser/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await groupsCollection.where("members", "array-contains", userId).get();
    const groups = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, groups });
  } catch (error) {
    console.error("Error al obtener grupos:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});


app.post("/api/addGroup", async (req, res) => {
  try {
    const { name, description, userId, members } = req.body;
    const newGroup = { name, description, userId, members, status: "Active" };
    const groupRef = await groupsCollection.add(newGroup);
    res.json({ success: true, groupId: groupRef.id });
  } catch (error) {
    console.error("Error al añadir el grupo:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});


app.post("/api/deleteGroup", async (req, res) => {
  try {
    const { groupId } = req.body;


    const groupRef = groupsCollection.doc(groupId);

   
    const tasksCollectionPath = `groups/${groupId}/tasks`;
    await deleteCollection(db, tasksCollectionPath);

    
    await groupRef.delete();

    res.json({ success: true, message: "Grupo y subcolecciones eliminados correctamente" });
  } catch (error) {
    console.error("Error al eliminar el grupo:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});


app.post("/api/updateGroup", async (req, res) => {
  try {
    const { id, name, description } = req.body;
    await groupsCollection.doc(id).update({ name, description });
    res.json({ success: true, message: "Grupo actualizado" });
  } catch (error) {
    console.error("Error al actualizar el grupo:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});

app.post("/api/addTaskGroup", async (req, res) => {
  try {
    const { title, description, status, groupId, userId, assignedTo } = req.body;

    
    const groupDoc = await groupsCollection.doc(groupId).get();
    if (!groupDoc.exists || groupDoc.data().userId !== userId) {
      return res.status(403).json({ success: false, message: "No tienes permiso para crear tareas en este grupo" });
    }

    
    const taskData = {
      title,
      description,
      status,
      assignedTo: assignedTo || null, 
      createdAt: new Date(),
    };

 
    const tasksRef = db.collection("groups").doc(groupId).collection("tasks");
    const docRef = await tasksRef.add(taskData);

    res.json({ success: true, taskId: docRef.id, message: "Tarea añadida correctamente al grupo" });
  } catch (error) {
    console.error("Error añadiendo tarea al grupo:", error);
    res.status(500).json({ success: false, message: "Error añadiendo tarea al grupo" });
  }
});

app.post("/api/updateTaskGroup", async (req, res) => {
  try {
    const { taskId, title, description, dueDate, assignedTo, groupId, userId } = req.body;

    console.log("Datos recibidos:", { taskId, title, description, dueDate, assignedTo, groupId, userId }); // Verificar los datos recibidos

    // Verificar que taskId no sea undefined, null o una cadena vacía
    if (!taskId || typeof taskId !== "string" || taskId.trim() === "") {
      return res.status(400).json({ success: false, message: "ID de tarea inválido" });
    }

    const groupDoc = await groupsCollection.doc(groupId).get();
    if (!groupDoc.exists || groupDoc.data().userId !== userId) {
      return res.status(403).json({ success: false, message: "No tienes permiso para editar tareas en este grupo" });
    }

    // Actualizar solo los campos necesarios
    const taskRef = db.collection("groups").doc(groupId).collection("tasks").doc(taskId);
    await taskRef.update({
      title,
      description,
      dueDate,
      assignedTo,
    });

    res.json({ success: true, message: "Tarea actualizada correctamente" });
  } catch (error) {
    console.error("Error actualizando la tarea:", error);
    res.status(500).json({ success: false, message: "Error actualizando la tarea" });
  }
});

app.post("/api/deleteTaskGroup", async (req, res) => {
  try {
    const { taskId, groupId, userId } = req.body;

    
    const groupDoc = await groupsCollection.doc(groupId).get();
    if (!groupDoc.exists || groupDoc.data().userId !== userId) {
      return res.status(403).json({ success: false, message: "No tienes permiso para eliminar tareas en este grupo" });
    }

    
    const taskRef = db.collection("groups").doc(groupId).collection("tasks").doc(taskId);
    await taskRef.delete();

    res.json({ success: true, message: "Tarea eliminada correctamente" });
  } catch (error) {
    console.error("Error eliminando la tarea:", error);
    res.status(500).json({ success: false, message: "Error eliminando la tarea" });
  }
});

app.post("/api/updateTaskStatus", async (req, res) => {
  try {
    const { taskId, groupId, status, userId } = req.body;

    
    const groupDoc = await groupsCollection.doc(groupId).get();
    if (!groupDoc.exists || groupDoc.data().userId !== userId) {
      return res.status(403).json({ success: false, message: "No tienes permiso para cambiar el estado de tareas en este grupo" });
    }

    
    const taskRef = db.collection("groups").doc(groupId).collection("tasks").doc(taskId);
    await taskRef.update({ status });

    res.json({ success: true, message: "Estado de la tarea actualizado correctamente" });
  } catch (error) {
    console.error("Error actualizando el estado de la tarea:", error);
    res.status(500).json({ success: false, message: "Error actualizando el estado de la tarea" });
  }
});

app.get("/api/getGroupMembers/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;

    
    const groupDoc = await groupsCollection.doc(groupId).get();
    if (!groupDoc.exists) {
      return res.status(404).json({ success: false, message: "Grupo no encontrado" });
    }

    
    const members = groupDoc.data().members;

    
    const users = [];
    for (const memberId of members) {
      const userDoc = await usersCollection.doc(memberId).get();
      if (userDoc.exists) {
        users.push({ id: userDoc.id, ...userDoc.data() });
      }
    }

    res.json({ success: true, members: users });
  } catch (error) {
    console.error("Error obteniendo miembros del grupo:", error);
    res.status(500).json({ success: false, message: "Error obteniendo miembros del grupo" });
  }
});

app.get("/api/getGroupTasks/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.query;

    console.log("groupId:", groupId);
    console.log("userId:", userId);

    if (!groupId) {
      return res.status(400).json({ success: false, message: "El ID del grupo es obligatorio" });
    }

   
    const groupDoc = await groupsCollection.doc(groupId).get();
    if (!groupDoc.exists) {
      return res.status(404).json({ success: false, message: "Grupo no encontrado" });
    }

    const groupData = groupDoc.data();
    console.log("groupData:", groupData);

    
    const isMember = groupData.members.includes(userId);
    const isCreator = groupData.userId === userId;

    console.log("isMember:", isMember);
    console.log("isCreator:", isCreator);

    if (!isMember && !isCreator) {
      return res.status(403).json({ success: false, message: "No tienes permiso para ver este grupo" });
    }

  
    const tasksRef = db.collection("groups").doc(groupId).collection("tasks");
    const snapshot = await tasksRef.get();

    if (snapshot.empty) {
      return res.json({ success: true, tasks: [], message: "No hay tareas en este grupo" });
    }

    let tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
   


    res.json({ success: true, tasks });
  } catch (error) {
    console.error("Error obteniendo tareas del grupo:", error);
    res.status(500).json({ success: false, message: "Error obteniendo tareas del grupo" });
  }
});


app.get("/api/getGroupCreator/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;

    
    const groupDoc = await db.collection("groups").doc(groupId).get();
    if (!groupDoc.exists) {
      return res.status(404).json({ success: false, message: "Grupo no encontrado" });
    }

    
    const creatorId = groupDoc.data().userId;

    
    res.json({ success: true, creatorId });
  } catch (error) {
    console.error("Error obteniendo creador del grupo:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});


app.post("/api/updateTaskStatus", async (req, res) => {
  try {
    const { taskId, groupId, status, userId } = req.body;

    
    const groupDoc = await groupsCollection.doc(groupId).get();
    if (!groupDoc.exists || groupDoc.data().userId !== userId) {
      return res.status(403).json({ success: false, message: "No tienes permiso para modificar tareas en este grupo" });
    }


    const taskRef = db.collection("groups").doc(groupId).collection("tasks").doc(taskId);
    await taskRef.update({ status });

    res.json({ success: true, message: "Estado de la tarea actualizado correctamente" });
  } catch (error) {
    console.error("Error actualizando el estado de la tarea:", error);
    res.status(500).json({ success: false, message: "Error actualizando el estado de la tarea" });
  }
});


const deleteCollection = async (db, collectionPath, batchSize = 100) => {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve, reject);
  });
};

const deleteQueryBatch = async (db, query, resolve, reject) => {
  try {
    const snapshot = await query.get();

    
    if (snapshot.size === 0) {
      resolve();
      return;
    }

    
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    
    deleteQueryBatch(db, query, resolve, reject);
  } catch (error) {
    reject(error);
  }
};

// Editar la información de un usuario
app.post("/api/editUser", async (req, res) => {
  try {
    const { userId, username, email, password, adminId } = req.body;

    // Verificar si el usuario que hace la solicitud es admin
    const adminDoc = await usersCollection.doc(adminId).get();
    if (!adminDoc.exists || adminDoc.data().role !== "admin") {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    // Actualizar los datos del usuario
    const userData = { username, email };
    if (password) {
      // Hashear la nueva contraseña si se proporciona
      const hashedPassword = await bcrypt.hash(password, 10);
      userData.password = hashedPassword;
    }

    await usersCollection.doc(userId).update(userData);

    res.json({ success: true, message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error editando usuario:", error);
    res.status(500).json({ success: false, message: "Error editando usuario" });
  }
});

app.post("/api/deleteUser", async (req, res) => {
  try {
    const { userId, adminId } = req.body;

    const adminDoc = await usersCollection.doc(adminId).get();
    if (!adminDoc.exists || adminDoc.data().role !== "admin") {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    await usersCollection.doc(userId).delete();

    res.json({ success: true, message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    res.status(500).json({ success: false, message: "Error eliminando usuario" });
  }
});



app.post("/api/addUser", async (req, res) => {
  try {
    const { username, email, password, role, adminId } = req.body;

    // Verificar si el usuario que hace la solicitud es admin
    const adminDoc = await usersCollection.doc(adminId).get();
    if (!adminDoc.exists || adminDoc.data().role !== "admin") {
      return res.status(403).json({ success: false, message: "No autorizado" });
    }

    // Verificar si el usuario ya existe
    const userQuery = await usersCollection.where("email", "==", email).get();
    if (!userQuery.empty) {
      return res.status(400).json({ success: false, message: "El usuario ya existe" });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10); // 10 es el número de rondas de hashing

    // Crear un nuevo usuario en Firestore
    const newUserRef = await usersCollection.add({
      username,
      email,
      password: hashedPassword, // Guardar la contraseña hasheada
      role,
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, message: "Usuario creado correctamente", userId: newUserRef.id });
  } catch (error) {
    console.error("Error creando usuario:", error);
    res.status(500).json({ success: false, message: "Error creando usuario" });
  }
});


const PORT = process.env.PORT || 3000;
console.log("JWT_SECRET:", JWT_SECRET);
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
