const express = require("express");
const cors = require("cors");
const path = require("path");

// Importar rutas
const authRoutes = require("./routes/auth.routes");
const examRoutes = require("./routes/examen.routes");
const contactRoutes = require("./routes/contact.routes");
const pagoRoutes = require("./routes/pago.routes");

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares básicos ---
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ para recibir datos de formularios

// --- Configuración de CORS ---
const ALLOWED_ORIGINS = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS: " + origin));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    optionsSuccessStatus: 200,
  })
);

// --- Servir certificados PDF ---
app.use("/certificados", express.static(path.join(__dirname, "certificados")));

// --- Servir imágenes (por si usas logos o firmas desde el front) ---
app.use("/images", express.static(path.join(__dirname, "images"))); // ✅ nuevo

// --- Montar rutas principales ---
app.use("/api", authRoutes);          // Login / Logout / Profile
app.use("/api", pagoRoutes);          // Pago 💳
app.use("/api/examen", examRoutes);   // Examen: start / submit
app.use("/api", contactRoutes);       // Contacto 📨

// --- Ruta de salud opcional ---
app.get("/health", (_req, res) => res.json({ ok: true }));

// --- Iniciar servidor ---
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});

console.log("💻 Servidor CodeVerse iniciado correctamente");
