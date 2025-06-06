// authRoutes.js
const express = require('express');
const router = express.Router();
const { registrar, login } = require('../controllers/authController');
const verificarToken = require('../middlewares/authMiddleware');

router.post('/registro', registrar);
router.post('/login', login);

// Ruta protegida de prueba
router.get('/protegido', verificarToken, (req, res) => {
  res.json({ msg: 'Ruta protegida accedida', usuario: req.usuario });
});

module.exports = router;
