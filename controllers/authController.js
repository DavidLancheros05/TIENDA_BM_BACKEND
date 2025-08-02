const { Usuario } = require('../models/models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
// Registro de usuario - SIN hacer hash aquí
const registrar = async (req, res) => {
  const { correo, password, nombre } = req.body;

  if (!correo || !password || !nombre) {
    return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
  }

  try {
    const existeUsuario = await Usuario.findOne({ correo });
    if (existeUsuario) {
      return res.status(400).json({ msg: 'El correo ya está registrado' });
    }

    // Guarda password plano, middleware hará hash
    const nuevoUsuario = new Usuario({
      nombre,
      correo,
      password,
      rol: 'cliente',
    });

    await nuevoUsuario.save();
    res.status(201).json({ msg: 'Usuario registrado con éxito' });
  } catch (error) {
    console.error('❌ Error en registro:', error);
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
        _id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Restablecer contraseña con token - SIN hacer hash aquí
const resetearPassword = async (req, res) => {
  const { token } = req.params;
  const { nuevaPassword } = req.body;

  if (!nuevaPassword) {
    return res.status(400).json({ msg: 'La nueva contraseña es obligatoria' });
  }

  try {
    const usuario = await Usuario.findOne({
      tokenResetPassword: token,
      tokenResetExpira: { $gt: Date.now() }
    });

    if (!usuario) {
      return res.status(400).json({ msg: 'Token inválido o expirado' });
    }

    // Solo asigna la nueva contraseña, el middleware hará el hash
    usuario.password = nuevaPassword;
    usuario.tokenResetPassword = null;
    usuario.tokenResetExpira = null;

    await usuario.save();

    res.json({ msg: 'Contraseña restablecida correctamente' });
  } catch (error) {
    console.error('❌ Error al restablecer contraseña:', error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};

// Cambiar contraseña
const cambiarPassword = async (req, res) => {
  const { passwordActual, nuevaPassword } = req.body;
  const usuarioId = req.usuarioId; // del middleware de autenticación

  if (!passwordActual || !nuevaPassword) {
    return res.status(400).json({ msg: 'Ambas contraseñas son obligatorias' });
  }

  try {
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    const esValida = await bcrypt.compare(passwordActual, usuario.password);
    if (!esValida) {
      return res.status(400).json({ msg: 'La contraseña actual es incorrecta' });
    }

    usuario.password = await bcrypt.hash(nuevaPassword, 10);
    await usuario.save();

    res.json({ msg: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('❌ Error al cambiar contraseña:', error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};

// Solicitar reset de contraseña
const olvidoPassword = async (req, res) => {
  const { correo } = req.body;

  if (!correo) {
    return res.status(400).json({ msg: 'El correo es obligatorio' });
  }

  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(404).json({ msg: 'No existe usuario con ese correo' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    usuario.tokenResetPassword = token;
    usuario.tokenResetExpira = Date.now() + 3600000; // 1 hora
    await usuario.save();

    const link = `${process.env.FRONTEND_URL}/restablecer-password/${token}`;

    const { data, error } = await resend.emails.send({
      from: 'noreply@resend.dev',
      to: correo,
      subject: 'Restablece tu contraseña',
      html: `
        <p>Hola ${usuario.nombre},</p>
        <p>Hemos recibido una solicitud para restablecer tu contraseña. Puedes hacerlo haciendo clic en el siguiente enlace:</p>
        <a href="${link}" style="color: blue;">Restablecer contraseña</a>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si tú no solicitaste este cambio, ignora este mensaje.</p>
        <p>Gracias,<br>ColBogBike</p>
      `
    });

    if (error) {
      console.error('❌ Error al enviar el correo:', error);
      return res.status(500).json({ msg: 'No se pudo enviar el correo de recuperación' });
    }

    res.json({ msg: 'Enlace de restablecimiento enviado a tu correo' });
  } catch (error) {
    console.error('❌ Error al solicitar reset:', error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};


module.exports = {
  registrar,
  login,
  cambiarPassword,
  olvidoPassword,
  resetearPassword
};
