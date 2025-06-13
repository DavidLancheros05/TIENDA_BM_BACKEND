// authRoutes.js
const express = require('express');
const router = express.Router();
const { registrar, login } = require('../controllers/authController');
const verificarToken = require('../middlewares/authMiddleware');

// Ruta para registrar (log de datos incluido)
router.post('/register', (req, res, next) => {
  console.log('📥 [authRoutes] Datos recibidos en /register:', req.body);
  next(); // Pasa al controlador registrar
}, registrar);

// Ruta para login (también puedes loguear aquí si quieres)
router.post('/login', (req, res, next) => {
  console.log('📥 [authRoutes] Datos recibidos en /login:', req.body);
  next();
}, login);

// Ruta protegida de prueba
router.get('/protegido', verificarToken, (req, res) => {
  console.log('🔐 [authRoutes] Usuario verificado en /protegido:', req.usuario);
  res.json({ msg: 'Ruta protegida accedida', usuario: req.usuario });
});

module.exports = router;
