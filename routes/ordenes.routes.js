const express = require('express');
const router = express.Router();
const { Orden } = require('../models/models');
const axios = require('axios');

// 👉 POST para crear link de pago
router.post('/crear-link-pago', async (req, res) => {
  console.log('📥 Body recibido:', req.body);

  try {
    const {
      usuarioId,
      productos,
      total,
      direccionEnvio,
      metodoPago,
      name,
      description,
      currency,
      amount_in_cents,
      redirect_url,
      cancel_url
    } = req.body;

    if (!usuarioId || !productos?.length || !total) {
      console.error('❌ Faltan datos obligatorios');
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    const nuevaOrden = new Orden({
      usuario: usuarioId,
      productos: productos.map(p => ({
        producto: p.producto,
        cantidad: p.cantidad,
        precioUnitario: 0
      })),
      total,
      metodoPago,
      direccionEnvio
    });

    await nuevaOrden.save();
    console.log('✅ Orden guardada:', nuevaOrden._id);

    const link_pago = `https://sandbox.wompi.co/checkout?amount_in_cents=${amount_in_cents}&currency=${currency}&redirect_url=${redirect_url}`;

    res.json({ link_pago });

  } catch (err) {
    console.error('❌ Error interno en crear-link-pago:', err);
    res.status(500).json({ error: 'Error interno creando link de pago' });
  }
});

// ✅ GET / para listar todas las órdenes
router.get('/', async (req, res) => {
  try {
    const ordenes = await Orden.find().populate('usuario').populate('productos.producto');
    res.json(ordenes);
  } catch (err) {
    console.error('❌ Error obteniendo órdenes:', err);
    res.status(500).json({ error: 'Error obteniendo órdenes' });
  }
});

module.exports = router;
