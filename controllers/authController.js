const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Registro de usuario
const registrar = async (req, res) => {
  const { correo, password } = req.body;

  try {
    const existeUsuario = await Usuario.findOne({ correo });
    if (existeUsuario) {
      return res.status(400).json({ msg: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = new Usuario({
      correo,
      password: hashedPassword,
      rol: 'cliente', // por defecto
    });

    await nuevoUsuario.save();

    res.status(201).json({ msg: 'Usuario registrado con éxito' });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Login (ya lo tienes)
const login = async (req, res) => {
  const { correo, password } = req.body;
console.log('Datos recibidos en login:', req.body); // 👈
  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(400).json({ msg: 'Usuario no encontrado' });
    }

     console.log('Usuario encontrado:', usuario); // 👈 Agrega esto

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(400).json({ msg: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: usuario._id, rol: usuario.rol }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({
      token,
      user: {
        id: usuario._id,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });
  }catch (error) {
  console.error('Error en login:', error); // 👈 esto es clave
  res.status(500).json({ msg: 'Error en el servidor' });
}
};

module.exports = {
  registrar,
  login,
};
