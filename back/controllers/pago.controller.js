const fs = require("fs");
const path = require("path");
const usersPath = path.join(__dirname, "../modelo/users.json");

function loadUsers() {
  return JSON.parse(fs.readFileSync(usersPath, "utf8"));
}

function saveUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), "utf8");
}

exports.realizarPago = (req, res) => {
  const userId = req.userId;
  const users = loadUsers();
  const user = users.find(u => u.cuenta === userId);

  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

  if (user.pagoHecho) {
    return res.status(400).json({ error: "El pago ya fue realizado." });
  }

  user.pagoHecho = true;
  saveUsers(users);

  console.log(`[PAGO] ${user.nombre} realizó el pago.`);
  res.json({ mensaje: "Pago registrado exitosamente." });
};
