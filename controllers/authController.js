const { Usuario } = require('../models/models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registro de usuario
const registrar = async (req, res) => {

  console.log('✅ [authController] Datos recibidos en registrar:', req.body);
  
  const { correo, password, nombre } = req.body;

  if (!correo || !password || !nombre) {
    return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
  }

  try {
    const existeUsuario = await Usuario.findOne({ correo });
    if (existeUsuario) {
      return res.status(400).json({ msg: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = new Usuario({
      nombre,
      correo,
      password: hashedPassword,
      rol: 'cliente',
    });

    await nuevoUsuario.save();

    res.status(201).json({ msg: 'Usuario registrado con éxito' });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Login
const login = async (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ msg: 'Correo y contraseña son obligatorios' });
  }

  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(400).json({ msg: 'Usuario no encontrado' });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(400).json({ msg: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      {
        id: usuario._id,
        rol: usuario.rol,
        nombre: usuario.nombre,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

module.exports = {
  registrar,
  login,
};
