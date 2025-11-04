// Importa el array de usuarios desde el archivo JSON (se carga una sola vez al iniciar)
const fs = require("fs");
const path = require("path");
const usersPath = path.join(__dirname, "../modelo/users.json");
const users = require("../modelo/users.json");
const { createSession, deleteSession } = require("../middleware/auth.middleware");

// Función controladora para manejar el login
exports.login = (req, res) => {
  const { cuenta } = req.body || {};
  const contrasena = req.body?.contrasena ?? req.body?.["contraseña"];

  if (!cuenta || !contrasena) {
    return res.status(400).json({
      error: "Faltan campos obligatorios: 'cuenta' y 'contrasena'.",
      ejemplo: { cuenta: "gina", contrasena: "1234" }
    });
  }

  const match = users.find(u => u.cuenta === cuenta && u.contrasena === contrasena);

  if (!match) {
    return res.status(401).json({ error: "Credenciales inválidas." });
  }

  const token = createSession(match.cuenta);
  console.log(`[LOGIN] Usuario: ${match.cuenta} | Token: ${token} | Procede el login`);

  return res.status(200).json({
    mensaje: "Acceso permitido",
    usuario: { cuenta: match.cuenta },
    token: token
  });
};

// ✅ --- Logout corregido (solo esta parte fue modificada) ---
exports.logout = (req, res) => {
  const token = req.token;
  const userId = req.userId;

  console.log(`[LOGOUT] Usuario en sesión: ${userId} | Token: ${token} | Procede el logout`);

  const deleted = deleteSession(token);

  if (!deleted) {
    return res.status(404).json({ error: "Sesión no encontrada" });
  }

  try {
    // Leer el archivo de usuarios actualizado
    const usersData = JSON.parse(fs.readFileSync(usersPath, "utf8"));

    // Buscar usuario correspondiente
    const userIndex = usersData.findIndex(u => u.cuenta === userId?.trim());

    if (userIndex === -1) {
      console.warn(`[LOGOUT] Usuario ${userId} no encontrado en users.json`);
      return res.status(404).json({ error: "Usuario no encontrado en users.json" });
    }

    // Reiniciar valores
    /*usersData[userIndex].pagoHecho = false;
    usersData[userIndex].examenHecho = false;
    usersData[userIndex].aprobado = false;

    // Guardar cambios en el archivo
    fs.writeFileSync(usersPath, JSON.stringify(usersData, null, 2), "utf8");
    console.log(`[LOGOUT] Valores de ${userId} reiniciados en users.json`);*/

    return res.status(200).json({
      mensaje: "Sesión cerrada correctamente y progreso reiniciado"
    });
  } catch (err) {
    console.error("❌ Error al actualizar users.json:", err);
    return res.status(500).json({ error: "Error al actualizar los datos del usuario" });
  }
};
// ✅ --- Fin de la modificación ---

// Función controladora para obtener el perfil del usuario autenticado
exports.getProfile = (req, res) => {
  const userId = req.userId;
  const user = users.find(u => u.cuenta === userId);

  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  return res.status(200).json({
    usuario: { cuenta: user.cuenta }
  });
};

