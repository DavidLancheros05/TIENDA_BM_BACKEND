const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Venta } = require('../models/models');

const WOMPI_API_URL = 'https://sandbox.wompi.co/v1/payment_links';
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;
const INICIO_LINK_PAGO = 'https://checkout.wompi.co/l/';

// ✅ Obtener detalles de una venta (total, productos, etc.)
router.get('/detalle-venta/:id', async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id).populate('productos.producto');
    
    if (!venta) {
      return res.status(404).json({ error: "Venta no encontrada" });
    }

    // 🧾 Puedes retornar más campos si quieres
    res.json({
      total: venta.total,
      productos: venta.productos.map(p => ({
        nombre: p.producto.nombre,
        cantidad: p.cantidad,
        precioUnitario: p.precioUnitario
      }))
    });
  } catch (err) {
    console.error("❌ Error buscando venta:", err.message);
    res.status(500).json({ error: "Error al obtener detalles de la venta" });
  }
});

// 📌 RUTA PARA CREAR LINK DE PAGO Y GUARDAR LA VENTA
router.post('/crear-link-pago', async (req, res) => {
  console.log("📥 [POST] /crear-link-pago llamado");
  console.log("📦 Datos recibidos del frontend:", req.body);

  try {
    const {
      usuarioId,
      productos,
      total,
      metodoPago,
      name,
      description,
      amount_in_cents,
      currency,
      redirect_url,
      cancel_url,
    } = req.body;

    // 🧪 Validación rápida
    if (!usuarioId || !productos || productos.length === 0 || !amount_in_cents || !currency || !name || !description) {
      console.error("⚠️ Datos incompletos para crear el link");
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // 1️⃣ Registrar venta
    const venta = new Venta({
      usuario: usuarioId,
      productos,
      total,
      metodoPago: metodoPago || 'PSE',
      estado: 'pendiente',
      fechaVenta: new Date(),
    });

    await venta.save();
    console.log("✅ Venta registrada en DB con ID:", venta._id);

    // 2️⃣ Crear el link de pago en Wompi
    const wompiPayload = {
      name,
      description,
      amount_in_cents,
      currency,
      single_use: true,
      collect_shipping: false,
      redirect_url: `${redirect_url}?ventaId=${venta._id}`,
      cancel_url: `${cancel_url}?ventaId=${venta._id}`,
    };

    console.log("📤 Enviando a Wompi:", wompiPayload);

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

    return res.status(200).json({ link_pago, ventaId: venta._id });

  } catch (error) {
    console.error("❌ Error general en crear-link-pago:");
    if (error.response) {
      console.error("📡 Error Wompi:", error.response.data);
    } else {
      console.error("💥 Error inesperado:", error.message);
    }
    return res.status(500).json({ error: 'Error al crear link de pago o registrar venta.' });
  }
});

// ❌ Marcar venta como cancelada
router.post('/cancelar-venta', async (req, res) => {
  const { ventaId } = req.body;

  if (!ventaId) {
    return res.status(400).json({ error: "Falta el ID de la venta" });
  }

  try {
    const venta = await Venta.findById(ventaId);

    if (!venta) {
      return res.status(404).json({ error: "Venta no encontrada" });
    }

    if (venta.estado === 'cancelada') {
      return res.status(200).json({ mensaje: "La venta ya estaba cancelada." });
    }

    venta.estado = 'cancelada';
    await venta.save();

    return res.status(200).json({ mensaje: "Venta cancelada exitosamente." });
  } catch (error) {
    console.error("❌ Error cancelando la venta:", error.message);
    return res.status(500).json({ error: "Error al cancelar la venta" });
  }
});

// 📌 RUTA PARA CONFIRMAR VENTA DESPUÉS DEL PAGO
router.post('/confirmar-venta', async (req, res) => {
  console.log("📥 [POST] /confirmar-venta llamado");
  console.log("📦 Body recibido:", req.body);

  const { ventaId } = req.body;

  if (!ventaId) {
    console.error("⚠️ No se recibió ventaId en la petición");
    return res.status(400).json({ error: "Falta el ID de la venta" });
  }

  try {
    console.log("🔍 Buscando venta con ID:", ventaId);
    const venta = await Venta.findById(ventaId);

    if (!venta) {
      console.error("❌ Venta no encontrada con ese ID");
      return res.status(404).json({ error: "Venta no encontrada" });
    }

    console.log("📄 Venta encontrada:", venta);

    if (venta.estado === 'pagado') {
      console.log("ℹ️ Venta ya estaba marcada como pagada");
      return res.status(200).json({ mensaje: "✅ La venta ya estaba marcada como pagada." });
    }

    venta.estado = 'pagado';
    await venta.save();
    console.log("💾 Estado actualizado a 'pagado' en venta:", venta._id);

    return res.status(200).json({ mensaje: "✅ Venta confirmada como pagada." });

  } catch (error) {
    console.error("❌ Error confirmando la venta:", error.message);
    return res.status(500).json({ error: "Error al confirmar la venta" });
  }
});

module.exports = router;
