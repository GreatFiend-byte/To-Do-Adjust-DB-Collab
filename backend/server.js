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
const groupsCollection = db.collection('groups');



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
    console.log("Request recibida:", req.body);
    
    const { username, password } = req.body;

    if (!username || !password) {
      console.log("Faltan datos");
      return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
    }

    const userQuery = await db.collection("users").where("username", "==", username).get();

    if (userQuery.empty) {
      console.log("Usuario no encontrado");
      return res.status(400).json({ success: false, message: "Usuario no encontrado" });
    }

    const userDoc = userQuery.docs[0];
    const user = userDoc.data();
    console.log("Usuario encontrado:", user);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("Contraseña incorrecta");
      return res.status(400).json({ success: false, message: "Contraseña incorrecta" });
    }

    const token = jwt.sign({ userId: userDoc.id }, JWT_SECRET, { expiresIn: "10m" });

    console.log("Login exitoso, enviando token...");
    res.json({ success: true, message: "Inicio de sesión exitoso", token, userId: userDoc.id });
  } catch (error) {
    console.error("Error en /login:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});

app.get("/getUsers", async (req, res) => {
  try {
    const usersSnapshot = await db.collection("users").get();
    const users = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, users });
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    res.status(500).json({ success: false, message: "Error obteniendo usuarios" });
  }
});


app.post("/addTask", async (req, res) => {
  try {
    const { userId, name, description, timeUntilFinish, remindMe, status, category } = req.body;

    // Validar campos obligatorios
    if (!userId || !name || !status) {
      return res.status(400).json({ success: false, message: "Faltan datos obligatorios" });
    }

    // Limpiar campos opcionales (remindMe, description, timeUntilFinish, category)
    const taskData = {
      userId,
      name,
      description: description || "", // Si no se proporciona, se asigna un valor vacío
      timeUntilFinish: timeUntilFinish || null, // Si no se proporciona, se asigna null
      remindMe: remindMe || false, // Si no se proporciona, se asigna false
      status,
      category: category || "", // Si no se proporciona, se asigna un valor vacío
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

app.get("/getTasks/:userId", async (req, res) => {
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

app.post("/deleteTask", async (req, res) => {
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

app.post("/updateTask", async (req, res) => {
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

// Obtener grupos de un usuario
app.get("/getUserGroups/:userId", async (req, res) => {
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

// Obtener grupos donde el usuario es miembro
app.get("/getGroupsByUser/:userId", async (req, res) => {
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

// Crear un nuevo grupo
app.post("/addGroup", async (req, res) => {
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

// Eliminar un grupo y sus subcolecciones
app.post("/deleteGroup", async (req, res) => {
  try {
    const { groupId } = req.body;

    // Referencia al grupo
    const groupRef = groupsCollection.doc(groupId);

    // Eliminar la subcolección "tasks" (si existe)
    const tasksCollectionPath = `groups/${groupId}/tasks`;
    await deleteCollection(db, tasksCollectionPath);

    // Eliminar el documento del grupo
    await groupRef.delete();

    res.json({ success: true, message: "Grupo y subcolecciones eliminados correctamente" });
  } catch (error) {
    console.error("Error al eliminar el grupo:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});

// Actualizar un grupo
app.post("/updateGroup", async (req, res) => {
  try {
    const { id, name, description } = req.body;
    await groupsCollection.doc(id).update({ name, description });
    res.json({ success: true, message: "Grupo actualizado" });
  } catch (error) {
    console.error("Error al actualizar el grupo:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});

app.post("/addTaskGroup", async (req, res) => {
  try {
    const { title, description, status, groupId, userId, assignedTo } = req.body;

    // Verificar si el usuario es el creador del grupo
    const groupDoc = await groupsCollection.doc(groupId).get();
    if (!groupDoc.exists || groupDoc.data().userId !== userId) {
      return res.status(403).json({ success: false, message: "No tienes permiso para crear tareas en este grupo" });
    }

    // Crear la tarea con un valor por defecto para assignedTo
    const taskData = {
      title,
      description,
      status,
      assignedTo: assignedTo || null, // Si no se proporciona, se asigna null
      createdAt: new Date(),
    };

    // Guardar la tarea en Firestore
    const tasksRef = db.collection("groups").doc(groupId).collection("tasks");
    const docRef = await tasksRef.add(taskData);

    res.json({ success: true, taskId: docRef.id, message: "Tarea añadida correctamente al grupo" });
  } catch (error) {
    console.error("Error añadiendo tarea al grupo:", error);
    res.status(500).json({ success: false, message: "Error añadiendo tarea al grupo" });
  }
});

app.post("/updateTaskGroup", async (req, res) => {
  try {
    const { taskId, title, description, dueDate, assignedTo, groupId, userId } = req.body;

    // Verificar si el usuario es el creador del grupo
    const groupDoc = await groupsCollection.doc(groupId).get();
    if (!groupDoc.exists || groupDoc.data().userId !== userId) {
      return res.status(403).json({ success: false, message: "No tienes permiso para editar tareas en este grupo" });
    }

    // Actualizar la tarea en Firestore
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

app.post("/deleteTaskGroup", async (req, res) => {
  try {
    const { taskId, groupId, userId } = req.body;

    // Verificar si el usuario es el creador del grupo
    const groupDoc = await groupsCollection.doc(groupId).get();
    if (!groupDoc.exists || groupDoc.data().userId !== userId) {
      return res.status(403).json({ success: false, message: "No tienes permiso para eliminar tareas en este grupo" });
    }

    // Eliminar la tarea de Firestore
    const taskRef = db.collection("groups").doc(groupId).collection("tasks").doc(taskId);
    await taskRef.delete();

    res.json({ success: true, message: "Tarea eliminada correctamente" });
  } catch (error) {
    console.error("Error eliminando la tarea:", error);
    res.status(500).json({ success: false, message: "Error eliminando la tarea" });
  }
});

app.post("/updateTaskStatus", async (req, res) => {
  try {
    const { taskId, groupId, status, userId } = req.body;

    // Verificar si el usuario es el creador del grupo
    const groupDoc = await groupsCollection.doc(groupId).get();
    if (!groupDoc.exists || groupDoc.data().userId !== userId) {
      return res.status(403).json({ success: false, message: "No tienes permiso para cambiar el estado de tareas en este grupo" });
    }

    // Actualizar el estado de la tarea en Firestore
    const taskRef = db.collection("groups").doc(groupId).collection("tasks").doc(taskId);
    await taskRef.update({ status });

    res.json({ success: true, message: "Estado de la tarea actualizado correctamente" });
  } catch (error) {
    console.error("Error actualizando el estado de la tarea:", error);
    res.status(500).json({ success: false, message: "Error actualizando el estado de la tarea" });
  }
});

app.get("/getGroupMembers/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;

    // Verificar si el grupo existe
    const groupDoc = await groupsCollection.doc(groupId).get();
    if (!groupDoc.exists) {
      return res.status(404).json({ success: false, message: "Grupo no encontrado" });
    }

    // Obtener los miembros del grupo
    const members = groupDoc.data().members;

    // Obtener los detalles de los usuarios
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

app.get("/getGroupTasks/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.query;

    console.log("groupId:", groupId);
    console.log("userId:", userId);

    if (!groupId) {
      return res.status(400).json({ success: false, message: "El ID del grupo es obligatorio" });
    }

    // Verificar si el grupo existe
    const groupDoc = await groupsCollection.doc(groupId).get();
    if (!groupDoc.exists) {
      return res.status(404).json({ success: false, message: "Grupo no encontrado" });
    }

    const groupData = groupDoc.data();
    console.log("groupData:", groupData);

    // Verificar si el usuario es miembro del grupo
    const isMember = groupData.members.includes(userId);
    const isCreator = groupData.userId === userId;

    console.log("isMember:", isMember);
    console.log("isCreator:", isCreator);

    if (!isMember && !isCreator) {
      return res.status(403).json({ success: false, message: "No tienes permiso para ver este grupo" });
    }

    // Obtener todas las tareas del grupo
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

// Obtener el creador de un grupo
app.get("/getGroupCreator/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;

    // Verificar si el grupo existe
    const groupDoc = await db.collection("groups").doc(groupId).get();
    if (!groupDoc.exists) {
      return res.status(404).json({ success: false, message: "Grupo no encontrado" });
    }

    // Obtener el ID del creador del grupo
    const creatorId = groupDoc.data().userId;

    // Devolver el ID del creador
    res.json({ success: true, creatorId });
  } catch (error) {
    console.error("Error obteniendo creador del grupo:", error);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});

// Actualizar el estado de una tarea
app.post("/updateTaskStatus", async (req, res) => {
  try {
    const { taskId, groupId, status, userId } = req.body;

    // Verificar si el usuario es el creador del grupo
    const groupDoc = await groupsCollection.doc(groupId).get();
    if (!groupDoc.exists || groupDoc.data().userId !== userId) {
      return res.status(403).json({ success: false, message: "No tienes permiso para modificar tareas en este grupo" });
    }

    // Actualizar el estado de la tarea
    const taskRef = db.collection("groups").doc(groupId).collection("tasks").doc(taskId);
    await taskRef.update({ status });

    res.json({ success: true, message: "Estado de la tarea actualizado correctamente" });
  } catch (error) {
    console.error("Error actualizando el estado de la tarea:", error);
    res.status(500).json({ success: false, message: "Error actualizando el estado de la tarea" });
  }
});

// Función para eliminar una colección recursivamente
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

    // Si no hay documentos, terminamos
    if (snapshot.size === 0) {
      resolve();
      return;
    }

    // Eliminar documentos en lote
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    // Llamada recursiva para eliminar el siguiente lote
    deleteQueryBatch(db, query, resolve, reject);
  } catch (error) {
    reject(error);
  }
};

const PORT = process.env.PORT || 3000;
console.log("JWT_SECRET:", JWT_SECRET);
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
