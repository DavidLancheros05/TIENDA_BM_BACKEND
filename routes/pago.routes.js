const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Orden } = require('../models/models');

const WOMPI_API_URL = 'https://production.wompi.co/v1/payment_links';
const INICIO_LINK_PAGO = 'https://checkout.wompi.co/l/';
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;

router.post('/crear-link-pago', async (req, res) => {
  console.log("📥 [POST] /crear-link-pago llamado");
  console.log("📦 Body recibido:", JSON.stringify(req.body, null, 2));
  console.log("🔑 Clave WOMPI (primeros 8):", WOMPI_PRIVATE_KEY?.substring(0, 8));

  try {
    const {
      usuarioId,
      productos,
      total,
      metodoPago,
      direccionEnvio,
      name,
      description,
      amount_in_cents,
      currency,
      redirect_url,
      cancel_url,
    } = req.body;

    if (!usuarioId || !productos || productos.length === 0 || !amount_in_cents || !currency || !name || !description) {
      console.error("⚠️ Faltan datos para crear link");
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    console.log(`✅ Monto: ${amount_in_cents} | Total original: ${total}`);

    const nuevaOrden = new Orden({
      usuario: usuarioId,
      productos: productos.map(p => ({
        producto: p.producto,
        cantidad: p.cantidad,
        precioUnitario: 0
      })),
      total,
      metodoPago: metodoPago || 'PSE',
      direccionEnvio,
      estado: 'pendiente'
    });

    await nuevaOrden.save();
    console.log("✅ Orden guardada:", nuevaOrden._id);

    const wompiPayload = {
      name,
      description,
      amount_in_cents,
      currency,
      single_use: true,
      collect_shipping: false,
      redirect_url: `${redirect_url}?ordenId=${nuevaOrden._id}`,
      cancel_url: `${cancel_url}?ordenId=${nuevaOrden._id}`,
    };

    console.log("📡 Payload a Wompi:", JSON.stringify(wompiPayload, null, 2));

    const response = await axios.post(WOMPI_API_URL, wompiPayload, {
      headers: {
        Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const idLink = response.data?.data?.id;
    if (!idLink) {
      console.error("❌ Wompi no devolvió ID");
      return res.status(500).json({ error: 'Wompi no devolvió ID' });
    }

    const link_pago = `${INICIO_LINK_PAGO}${idLink}`;
    console.log("✅ Link generado:", link_pago);

    res.json({ link_pago, ordenId: nuevaOrden._id });
  } catch (error) {
    console.error("❌ Error general:", error.message);
    if (error.response) {
      console.error("📡 Wompi:", JSON.stringify(error.response.data, null, 2));
    }
    res.status(500).json({ error: "Error al crear link o registrar orden" });
  }
});

module.exports = router;
