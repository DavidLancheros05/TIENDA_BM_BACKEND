const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Orden, Producto } = require('../models/models'); // Cambiado de 'Venta' a 'Orden' y añadido 'Producto'

const WOMPI_API_URL = 'https://sandbox.wompi.co/v1/payment_links';
const INICIO_LINK_PAGO = 'https://checkout.wompi.co/l/';
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;

console.log('🛠️ pagos.routes.js cargado correctamente');
router.get('/crear-link-pago', (req, res) => {
  res.status(200).json({ mensaje: '🟢 Ruta POST /crear-link-pago está activa. Usa POST para crear links de pago.' });
});

router.post('/crear-link-pago', async (req, res) => {
  try {
    const {
      usuarioId,
      productos, // Ahora cada item de producto debe incluir precioUnitario
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

    if (!usuarioId || !productos?.length || !amount_in_cents || !currency || !name || !description) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // Validación opcional: Verificar el precio unitario de cada producto con la DB
    // Esto es para prevenir manipulaciones de precios desde el frontend
    for (const p of productos) {
      if (typeof p.precioUnitario !== 'number' || p.precioUnitario < 0) {
        return res.status(400).json({ error: 'Cada producto debe tener un precio unitario válido.' });
      }
      // Puedes descomentar y usar esta validación si el precio unitario debe coincidir
      // exactamente con el de la DB al momento de la compra para mayor seguridad.
      // const dbProduct = await Producto.findById(p.producto);
      // if (!dbProduct || dbProduct.precio !== p.precioUnitario) {
      //     return res.status(400).json({ error: 'El precio unitario del producto no coincide con el registrado.' });
      // }
    }

    // Usamos el modelo Orden para registrar la compra provisional
    const nuevaOrden = new Orden({
      usuario: usuarioId,
      productos: productos.map(p => ({
        producto: p.producto,
        cantidad: p.cantidad,
        color: p.color,
        talla: p.talla,
        precioUnitario: p.precioUnitario // Capturamos el precio en el momento de la compra
      })),
      total,
      metodoPago: metodoPago || 'PSE',
      direccionEnvio,
      estado: 'pendiente', // Estado inicial
      fechaCreacion: new Date() // Aseguramos la fecha de creación
    });

    await nuevaOrden.save();

    const wompiPayload = {
      name,
      description,
      amount_in_cents,
      currency,
      single_use: true,
      collect_shipping: false,
      redirect_url: `${redirect_url}?ordenId=${nuevaOrden._id}`, // Mantener ordenId para consistencia
      cancel_url: `${cancel_url}?ordenId=${nuevaOrden._id}`,     // Mantener ordenId para consistencia
    };

    const response = await axios.post(WOMPI_API_URL, wompiPayload, {
      headers: {
        Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const idLink = response.data?.data?.id;
    if (!idLink) {
      return res.status(500).json({ error: 'Wompi no devolvió ID de link de pago.' });
    }

    const link_pago = `${INICIO_LINK_PAGO}${idLink}`;

    // Opcional: guardar el linkPago en la orden para seguimiento interno
    nuevaOrden.linkPago = link_pago;
    // nuevaOrden.transaccionId = idLink; // Puedes usar el ID del link de Wompi como transaccionId inicial
    await nuevaOrden.save();

    res.json({ link_pago, ordenId: nuevaOrden._id }); // Mantener ordenId para consistencia
  } catch (error) {
    console.error("❌ Error al crear link de pago o registrar orden:", error.message);
    if (error.response) console.error(error.response.data);
    res.status(500).json({ error: 'Error al crear link de pago o registrar orden' });
  }
});

module.exports = router;