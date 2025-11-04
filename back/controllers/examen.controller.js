const fs = require("fs");
const path = require("path");
const usersPath = path.join(__dirname, "../modelo/users.json");

// --- Funciones auxiliares ---
function loadUsers() {
  return JSON.parse(fs.readFileSync(usersPath));
}

function saveUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

// --- Iniciar examen ---
exports.startExam = (req, res) => {
  const userId = req.userId;
  const users = loadUsers();
  const user = users.find(u => u.cuenta === userId);

  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

  if (!user.pagoHecho)
    return res.status(403).json({ error: "Debes realizar el pago antes de iniciar el examen." });

  if (user.examenHecho)
    return res.status(403).json({ error: "Ya realizaste el examen. Solo se puede una vez." });

  const preguntas = require("../modelo/preguntas.json");
  const seleccionadas = preguntas.sort(() => Math.random() - 0.5).slice(0, 8);

  const examen = seleccionadas.map(p => ({
    id: p.id,
    pregunta: p.pregunta,
    opciones: p.opciones.sort(() => Math.random() - 0.5)
  }));

  // 🔹 Agregar inicio y duración del examen
  const ahora = Date.now();
  const duracionExamen = 120000; // 2 minutos en milisegundos
  user.inicioExamen = ahora;
  user.duracionExamen = duracionExamen;

  saveUsers(users);

  res.json({
    examen,
    tiempoRestante: duracionExamen / 1000 // segundos
  });
};

// --- Consultar tiempo restante ---
exports.getTiempoRestante = (req, res) => {
  const userId = req.userId;
  const users = loadUsers();
  const user = users.find(u => u.cuenta === userId);

  if (!user || !user.inicioExamen) {
    return res.status(404).json({ error: "Examen no iniciado." });
  }

  const ahora = Date.now();
  const tiempoPasado = ahora - user.inicioExamen;
  const tiempoRestante = Math.max(0, (user.duracionExamen || 120000) - tiempoPasado);

  res.json({
    tiempoRestante: Math.floor(tiempoRestante / 1000) // en segundos
  });
};

// --- Enviar examen ---
exports.submitExam = (req, res) => {
  const userId = req.userId;
  const { respuestas } = req.body;

  const preguntas = require("../modelo/preguntas.json");
  const users = loadUsers();
  const user = users.find(u => u.cuenta === userId);

  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
  if (user.examenHecho)
    return res.status(403).json({ error: "Ya realizaste el examen anteriormente." });

  // 🔹 Verificar si el tiempo ya terminó
  const ahora = Date.now();
  const tiempoPasado = ahora - (user.inicioExamen || 0);
  if (tiempoPasado > (user.duracionExamen || 120000)) {
    user.examenHecho = true;
    user.aprobado = false;
    saveUsers(users);
    return res.status(403).json({ error: "El tiempo del examen ha expirado." });
  }

  let correctas = 0;

  respuestas.forEach(r => {
    const pregunta = preguntas.find(p => p.id === r.id);
    if (
      pregunta &&
      pregunta.correcta.trim().toLowerCase() === r.respuesta.trim().toLowerCase()
    ) {
      correctas++;
    }
  });

  const calificacion = (correctas / 8) * 100;
  const aprobado = calificacion >= 70;

  user.examenHecho = true;
  user.aprobado = aprobado;

  let certificadoPath = null;

  if (aprobado) {
    const { createCertificate } = require("../utils/pdfGenerator");
    const fullPath = createCertificate(user.nombre, calificacion);
    certificadoPath = "certificados/" + path.basename(fullPath);
  }

  saveUsers(users);

  res.json({
    calificacion,
    aprobado,
    certificado: certificadoPath
  });
};
