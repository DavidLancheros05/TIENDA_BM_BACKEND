const express = require('express');
const router = express.Router();
const { Carrito } = require('../models/models');
const authMiddleware = require('../middlewares/authMiddleware');

// ✅ Obtener carrito actual (poblado)
router.get('/', authMiddleware, async (req, res) => {
  let carrito = await Carrito.findOne({ usuario: req.usuarioId }).populate('productos.producto');

  if (!carrito) {
    // ⚡ Solo se crea uno vacío si es la primera vez
    carrito = new Carrito({ usuario: req.usuarioId, productos: [] });
    await carrito.save();
  }

  res.json({ carrito });
});

// 🔄 Guardar (sincronizar) TODO el carrito
router.post('/guardar', authMiddleware, async (req, res) => {
  const { productos } = req.body;
  const usuarioId = req.usuarioId;

  try {
    // ❗️ Si vienen productos, se actualiza; si no, no borra nada
    const carrito = await Carrito.findOneAndUpdate(
      { usuario: usuarioId },
      { $set: { productos: productos } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('productos.producto');

    res.json({ carrito });
  } catch (error) {
    console.error('❌ Error guardando carrito:', error);
    res.status(500).json({ message: 'Error guardando carrito', error });
  }
});

module.exports = router;
