const fs = require("fs");
const path = require("path");

// Ruta al archivo JSON donde se guardan los comentarios
const comentariosPath = path.join(__dirname, "../modelo/comentarios.json");

// --- Leer los comentarios existentes o crear el archivo si no existe ---
function loadComentarios() {
  try {
    if (!fs.existsSync(comentariosPath)) {
      fs.writeFileSync(comentariosPath, "[]", "utf8");
    }
    const data = fs.readFileSync(comentariosPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("[ERROR] No se pudieron leer los comentarios:", error);
    return [];
  }
}

// --- Guardar comentarios actualizados ---
function saveComentarios(data) {
  try {
    fs.writeFileSync(comentariosPath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("[ERROR] No se pudieron guardar los comentarios:", error);
  }
}

// --- Controlador principal: recibe y guarda el comentario ---
exports.enviarComentario = (req, res) => {
  const { nombre, correo, mensaje } = req.body;

  if (!nombre || !correo || !mensaje) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const comentarios = loadComentarios();

  const nuevoComentario = {
    id: comentarios.length + 1,
    nombre,
    correo,
    mensaje,
    fecha: new Date().toLocaleString(),
  };

  comentarios.push(nuevoComentario);
  saveComentarios(comentarios);

  console.log("[COMENTARIO NUEVO] 📬", nuevoComentario);

  res.json({ success: true, message: "Mensaje enviado correctamente" });
};
