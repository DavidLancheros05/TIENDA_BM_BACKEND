const express = require('express');
const router = express.Router();

const verificarToken = require('../middlewares/verificarToken');

const {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto,
  agregarResena,
  actualizarVariantes, // 👈 AGREGA ESTO
} = require('../controllers/producto.controller');

// CRUD Productos
router.post('/', crearProducto);
router.get('/', obtenerProductos);
router.get('/:id', obtenerProductoPorId);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);
router.post('/:id/variantes', verificarToken, actualizarVariantes);
// Reseñas (requiere token)
router.post('/:id/resena', verificarToken, agregarResena);

module.exports = router;
