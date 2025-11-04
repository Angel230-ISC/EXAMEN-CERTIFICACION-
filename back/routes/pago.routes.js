const express = require("express");
const { realizarPago } = require("../controllers/pago.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const router = express.Router();

router.post("/pago", verifyToken, realizarPago);

module.exports = router;
