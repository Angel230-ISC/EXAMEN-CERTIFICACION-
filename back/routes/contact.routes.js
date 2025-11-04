const express = require("express");
const router = express.Router();
const { enviarComentario } = require("../controllers/comentarios.controller");

// Ruta para recibir los comentarios del formulario de contacto
router.post("/contacto", enviarComentario);

module.exports = router;
