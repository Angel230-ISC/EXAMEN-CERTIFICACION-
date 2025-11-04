const express = require("express");
const { verifyToken } = require("../middleware/auth.middleware");
const { startExam, submitExam } = require("../controllers/examen.controller");

const router = express.Router();

router.post("/start", verifyToken, startExam);
router.post("/submit", verifyToken, submitExam);

module.exports = router;
