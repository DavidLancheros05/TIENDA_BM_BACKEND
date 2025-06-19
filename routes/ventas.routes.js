const express = require('express');
const router = express.Router();
const { Venta } = require('../models/models');

// 📌 POST /api/ventas/registrar
// Registra una nueva venta
router.post('/registrar', async (req, res) => {
  try {
    const { usuarioId, productos, total, metodoPago = 'PSE' } = req.body;

    if (!usuarioId || !Array.isArray(productos) || productos.length === 0 || !total) {
      return res.status(400).json({ error: 'Faltan datos requeridos para registrar la venta.' });
    }

    const venta = new Venta({
      usuario: usuarioId,
      productos,
      total,
      metodoPago,
      estado: 'completada', // Puedes cambiar a 'pendiente' si deseas validar después
      fechaVenta: new Date()
    });

    await venta.save();
    res.status(201).json({ message: '✅ Venta registrada correctamente', venta });
  } catch (error) {
    console.error('❌ Error al registrar venta:', error);
    res.status(500).json({ error: 'Error interno al registrar venta.' });
  }
});

module.exports = router;
