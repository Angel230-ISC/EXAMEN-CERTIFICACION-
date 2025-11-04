const mensajes = [];

exports.enviarMensaje = (req, res) => {
  const { nombre, correo, mensaje } = req.body;
  if (!nombre || !correo || !mensaje) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }

  mensajes.push({ nombre, correo, mensaje });
  console.log("Mensajes recibidos:", mensajes);

  res.status(200).json({ mensaje: "Mensaje enviado correctamente." });
};
