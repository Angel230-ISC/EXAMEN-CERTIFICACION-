const express = require("express");
const { verifyToken } = require("../middleware/auth.middleware");
const {
  startExam,
  submitExam,
  getTiempoRestante
} = require("../controllers/examen.controller");

const router = express.Router();

router.post("/start", verifyToken, startExam);
router.post("/submit", verifyToken, submitExam);
router.get("/time", verifyToken, getTiempoRestante); // 🔹 nueva ruta

module.exports = router;
