const express = require('express');
const router = express.Router();

const verificarToken = require('../middlewares/verificarToken');
const verificarAdmin = require('../middlewares/adminMiddleware');

const {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto,
  agregarResena
} = require('../controllers/producto.controller');

// CRUD productos
router.post('/', crearProducto);
router.get('/', obtenerProductos);
router.get('/:id', obtenerProductoPorId);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);

// Reseñas
router.post('/:id/resena', verificarToken, agregarResena);

module.exports = router;
