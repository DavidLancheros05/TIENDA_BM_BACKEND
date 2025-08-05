const express = require('express');
const router = express.Router();
const {
  registrar,
  login,
  olvidoPassword,
  resetearPassword,
} = require('../controllers/authController');

const verificarToken = require('../middlewares/verificarToken'); // ✅ Tu middleware actual
const Usuario = require('../models/Usuario'); // ✅ Ajusta si la ruta a tu modelo cambia

// Registro
router.post('/register', (req, res, next) => {
  console.log('📥 [authRoutes] Datos recibidos en /register:', req.body);
  next();
}, registrar);

// Login
router.post('/login', (req, res, next) => {
  console.log('📥 [authRoutes] Datos recibidos en /login:', req.body);
  next();
}, login);

// Recuperar contraseña
router.post('/forgot-password', (req, res, next) => {
  console.log('📥 [authRoutes] Datos recibidos en /forgot-password:', req.body);
  next();
}, olvidoPassword);

// Restablecer contraseña
router.post('/reset-password/:token', resetearPassword);

// ✅ Ruta nueva para validar el token al iniciar app
router.get('/validate-token', verificarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuarioId).select('-password');
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.status(200).json({ usuario });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al validar token' });
  }
});

// Ruta de prueba protegida
router.get('/protegido', verificarToken, (req, res) => {
  console.log('🔐 [authRoutes] Usuario verificado en /protegido:', req.usuario);
  res.json({ msg: 'Ruta protegida accedida', usuario: req.usuario });
});

module.exports = router;



