const express = require('express');
const router = express.Router();
const { Carrito } = require('../models/models');
const authMiddleware = require('../middlewares/authMiddleware');

// 🔐 Obtener carrito del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    //console.log(`🔐 Usuario autenticado: ${req.usuarioId}`);

    let carrito = await Carrito.findOne({ usuario: req.usuarioId }).populate('productos.producto');

    if (!carrito) {
      carrito = new Carrito({ usuario: req.usuarioId, productos: [] });
      await carrito.save();
    } else {
      //console.log(`📤 Carrito cargado con ${carrito.productos.length} productos`);
    }

    res.json({ carrito });
  } catch (error) {
    //console.error('❌ Error obteniendo carrito:', error);
    res.status(500).json({ message: 'Error obteniendo carrito', error });
  }
});

// 💾 Guardar o actualizar carrito
router.post('/guardar', authMiddleware, async (req, res) => {
  const { productos } = req.body;
  const usuarioId = req.usuarioId;

  //console.log(`💾 Guardando carrito para usuario ${usuarioId}`);
  //console.log('🧾 Productos recibidos:', productos);

  try {
    const carrito = await Carrito.findOneAndUpdate(
      { usuario: usuarioId },
      { $set: { productos: productos } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('productos.producto');

    //console.log('✅ Carrito guardado exitosamente');
    res.json({ carrito });
  } catch (error) {
    //console.error('❌ Error guardando carrito:', error);
    res.status(500).json({ message: 'Error guardando carrito', error });
  }
});

module.exports = router;
