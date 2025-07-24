const express = require('express');
const router = express.Router();
const { Carrito } = require('../models/models');
const authMiddleware = require('../middlewares/authMiddleware');

// ➕ Agregar un producto al carrito (opcional si usas sincronización completa)
router.post('/', authMiddleware, async (req, res) => {
  const { productoId, cantidad } = req.body;
  const usuarioId = req.usuarioId;

  let carrito = await Carrito.findOne({ usuario: usuarioId });

  if (!carrito) {
    carrito = new Carrito({ usuario: usuarioId, productos: [] });
  }

  // Si ya existe, suma cantidades
  const index = carrito.productos.findIndex(p => p.producto.toString() === productoId);
  if (index >= 0) {
    carrito.productos[index].cantidad += cantidad;
  } else {
    carrito.productos.push({ producto: productoId, cantidad });
  }

  await carrito.save();
  res.json({ carrito });
});

// ✅ Obtener carrito actual del usuario
router.get('/', authMiddleware, async (req, res) => {
  let carrito = await Carrito.findOne({ usuario: req.usuarioId }).populate('productos.producto');

  if (!carrito) {
    carrito = new Carrito({ usuario: req.usuarioId, productos: [] });
    await carrito.save();
  }

  res.json(carrito);
});

// 🔄 Guardar (sincronizar) TODO el carrito
router.post('/guardar', authMiddleware, async (req, res) => {
  const { productos } = req.body;
  const usuarioId = req.usuarioId;

  try {
    // 🔒 Solo productos con ID válido y cantidad positiva
    const productosFiltrados = productos.filter(
      p => p.producto && p.cantidad > 0
    );

    const carrito = await Carrito.findOneAndUpdate(
      { usuario: usuarioId },
      { $set: { productos: productosFiltrados } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('productos.producto');

    res.json({ carrito });
  } catch (error) {
    console.error('❌ Error guardando carrito:', error);
    res.status(500).json({ message: 'Error guardando carrito', error });
  }
});

// 🗑️ Vaciar carrito
router.delete('/', authMiddleware, async (req, res) => {
  await Carrito.deleteOne({ usuario: req.usuarioId });
  res.json({ mensaje: 'Carrito eliminado' });
});

module.exports = router;
