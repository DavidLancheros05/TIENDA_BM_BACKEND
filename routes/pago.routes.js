const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Orden } = require('../models/models'); // ✅ Usa Orden, NO Venta

//const WOMPI_API_URL = 'https://sandbox.wompi.co/v1/payment_links';
const WOMPI_API_URL = 'https://production.wompi.co/v1/payment_links';


const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;
const INICIO_LINK_PAGO = 'https://checkout.wompi.co/l/';

// ✅ Obtener detalles de una orden
router.get('/detalle-orden/:id', async (req, res) => {
  try {
    const orden = await Orden.findById(req.params.id).populate('productos.producto');

    if (!orden) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    res.json({
      total: orden.total,
      productos: orden.productos.map(p => ({
        nombre: p.producto.nombre,
        cantidad: p.cantidad,
        precioUnitario: p.precioUnitario
      }))
    });
  } catch (err) {
    console.error("❌ Error buscando orden:", err.message);
    res.status(500).json({ error: "Error al obtener detalles de la orden" });
  }
});

// 📌 RUTA PARA CREAR LINK DE PAGO Y GUARDAR ORDEN
router.post('/crear-link-pago', async (req, res) => {
  console.log("📥 [POST] /crear-link-pago llamado");
  console.log("📦 Datos recibidos del frontend:", req.body);

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

    // ✅ Validación
    if (!usuarioId || !productos || productos.length === 0 || !amount_in_cents || !currency || !name || !description) {
      console.error("⚠️ Datos incompletos para crear el link");
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // 1️⃣ Crear y guardar ORDEN
    const nuevaOrden = new Orden({
      usuario: usuarioId,
      productos: productos.map(p => ({
        producto: p.producto,
        cantidad: p.cantidad,
        precioUnitario: 0 // Pon aquí el precio unitario real si lo tienes
      })),
      total,
      metodoPago: metodoPago || 'PSE',
      direccionEnvio: direccionEnvio,
      estado: 'pendiente'
    });

    await nuevaOrden.save();
    console.log("✅ Orden guardada en DB con ID:", nuevaOrden._id);

    // 2️⃣ Crear link de pago Wompi
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

    console.log("📤 Enviando payload a Wompi:", wompiPayload);

    const response = await axios.post(WOMPI_API_URL, wompiPayload, {
      headers: {
        Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const idLink = response.data?.data?.id;

    if (!idLink) {
      console.error("❌ No se recibió ID del link de pago");
      return res.status(500).json({ error: 'No se generó ID de link de pago' });
    }

    const link_pago = `${INICIO_LINK_PAGO}${idLink}`;
    console.log("🔗 Link de pago generado:", link_pago);

    return res.status(200).json({ link_pago, ordenId: nuevaOrden._id });

  } catch (error) {
    console.error("❌ Error general en crear-link-pago:");
    if (error.response) {
      console.error("📡 Error Wompi:", error.response.data);
    } else {
      console.error("💥 Error inesperado:", error.message);
    }
    return res.status(500).json({ error: 'Error al crear link de pago o registrar orden.' });
  }
});

// ❌ Marcar orden como cancelada
router.post('/cancelar-orden', async (req, res) => {
  const { ordenId } = req.body;

  if (!ordenId) {
    return res.status(400).json({ error: "Falta el ID de la orden" });
  }

  try {
    const orden = await Orden.findById(ordenId);

    if (!orden) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    if (orden.estado === 'cancelada') {
      return res.status(200).json({ mensaje: "La orden ya estaba cancelada." });
    }

    orden.estado = 'cancelada';
    await orden.save();

    return res.status(200).json({ mensaje: "Orden cancelada exitosamente." });
  } catch (error) {
    console.error("❌ Error cancelando la orden:", error.message);
    return res.status(500).json({ error: "Error al cancelar la orden" });
  }
});

// 📌 Confirmar orden como pagada
router.post('/confirmar-orden', async (req, res) => {
  console.log("📥 [POST] /confirmar-orden llamado");
  console.log("📦 Body recibido:", req.body);

  const { ordenId } = req.body;

  if (!ordenId) {
    console.error("⚠️ No se recibió ordenId");
    return res.status(400).json({ error: "Falta el ID de la orden" });
  }

  try {
    const orden = await Orden.findById(ordenId);

    if (!orden) {
      console.error("❌ Orden no encontrada con ese ID");
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    if (orden.estado === 'pagado') {
      return res.status(200).json({ mensaje: "La orden ya estaba marcada como pagada." });
    }

    orden.estado = 'pagado';
    await orden.save();
    console.log("💾 Estado actualizado a 'pagado' en orden:", orden._id);

    return res.status(200).json({ mensaje: "Orden confirmada como pagada." });

  } catch (error) {
    console.error("❌ Error confirmando la orden:", error.message);
    return res.status(500).json({ error: "Error al confirmar la orden" });
  }
});

module.exports = router;
