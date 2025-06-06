// productoRoutes.js
const express = require('express');
const router = express.Router();

const Producto = require('../models/Producto'); // Modelo de Producto
const verificarToken = require('../middlewares/verificarToken'); // Middleware para validar JWT
const verificarAdmin = require('../middlewares/adminMiddleware'); // Middleware para validar rol admin

// Crear producto (solo admin)
router.post('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const nuevoProducto = new Producto(req.body);
    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
});

// Obtener todos los productos (abierto para todos)
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});

// PUT editar producto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, precio } = req.body;
  try {
    const productoActualizado = await Producto.findByIdAndUpdate(id, { nombre, precio }, { new: true });
    if (!productoActualizado) return res.status(404).json({ msg: 'Producto no encontrado' });
    res.json(productoActualizado);
  } catch (error) {
    res.status(500).json({ msg: 'Error actualizando producto' });
  }
});

// DELETE eliminar producto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const productoEliminado = await Producto.findByIdAndDelete(id);
    if (!productoEliminado) return res.status(404).json({ msg: 'Producto no encontrado' });
    res.json({ msg: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ msg: 'Error eliminando producto' });
  }
});

module.exports = router;
