const express = require('express');
const router = express.Router();
const { Orden } = require('../models/models');
const verificarToken = require('../middlewares/verificarToken');

// ✅ Obtener TODAS las órdenes del usuario autenticado
router.get('/', verificarToken, async (req, res) => {
  try {
    const userId = req.usuarioId;

    const ordenes = await Orden.find({ usuario: userId })
      .populate('productos.producto', 'nombre imagenes precio')
      .sort({ fechaCreacion: -1 });

    res.json(ordenes);
  } catch (error) {
    console.error('❌ Error al obtener órdenes:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor al obtener órdenes.' });
  }
});

// ✅ Obtener solo órdenes con estado "pagado" (opcional)
router.get('/mis-ordenes', verificarToken, async (req, res) => {
  try {
    const userId = req.usuarioId;

    const ordenes = await Orden.find({ usuario: userId, estado: 'pagado' })
      .populate('productos.producto', 'nombre imagenes precio')
      .sort({ fechaCreacion: -1 });

    res.json(ordenes);
  } catch (error) {
    console.error('❌ Error en /api/ordenes/mis-ordenes:', error);
    res.status(500).json({ mensaje: 'Error interno al obtener órdenes pagadas.' });
  }
});

// ✅ Obtener UNA orden por ID (ya lo tenías)
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const ordenId = req.params.id;
    const userId = req.usuarioId;

    const orden = await Orden.findOne({ _id: ordenId, usuario: userId })
      .populate('productos.producto', 'nombre imagenes precio');

    if (!orden) {
      return res.status(404).json({ message: 'Orden no encontrada o no pertenece al usuario.' });
    }

    res.json(orden);
  } catch (error) {
    console.error('❌ Error al obtener la orden por ID:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID de orden inválido.' });
    }
    res.status(500).json({ message: 'Error interno del servidor al obtener la orden.' });
  }
});

module.exports = router;
