const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registrar = async (req, res) => {

    console.log('Login recibido:', req.body); // <== Agrega esto
  const { nombre, correo, contraseña, rol } = req.body;

  try {
    const existe = await Usuario.findOne({ correo });
    if (existe) return res.status(400).json({ msg: 'Correo ya registrado' });

    const hash = await bcrypt.hash(contraseña, 10);

    const nuevoUsuario = new Usuario({
      nombre,
      correo,
      contraseña: hash,
      rol
    });

    await nuevoUsuario.save();

    res.status(201).json({ msg: 'Usuario registrado correctamente' });
  } catch (err) {
    res.status(500).json({ msg: 'Error en el servidor', error: err });
  }
};

const login = async (req, res) => {
  const { correo, password } = req.body;  // <-- aquí cambiaste "contraseña" por "password"

  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) return res.status(400).json({ msg: 'Usuario no encontrado' });

    const valido = await bcrypt.compare(password, usuario.contraseña);
    if (!valido) return res.status(400).json({ msg: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: usuario._id, rol: usuario.rol }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ msg: 'Error en el servidor', error: err.message });
  }
};

module.exports = { registrar, login };
