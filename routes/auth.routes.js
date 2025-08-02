// authRoutes.js
const express = require('express');
const router = express.Router();
const {
  registrar,
  login,
  olvidoPassword,
  resetearPassword, // ⬅️ IMPORTACIÓN FALTANTE
} = require('../controllers/authController');

const verificarToken = require('../middlewares/authMiddleware');

// Ruta para registrar (log de datos incluido)
router.post('/register', (req, res, next) => {
  console.log('📥 [authRoutes] Datos recibidos en /register:', req.body);
  next();
}, registrar);

// Ruta para login (log incluido)
router.post('/login', (req, res, next) => {
  console.log('📥 [authRoutes] Datos recibidos en /login:', req.body);
  next();
}, login);

// Ruta para solicitar restablecimiento de contraseña
router.post('/forgot-password', (req, res, next) => {
  console.log('📥 [authRoutes] Datos recibidos en /forgot-password:', req.body);
  next();
}, olvidoPassword);

// Ruta para restablecer la contraseña con token
router.post('/reset-password/:token', resetearPassword); // ✅ ESTA YA FUNCIONA

// Ruta protegida de prueba
router.get('/protegido', verificarToken, (req, res) => {
  console.log('🔐 [authRoutes] Usuario verificado en /protegido:', req.usuario);
  res.json({ msg: 'Ruta protegida accedida', usuario: req.usuario });
});

module.exports = router;
