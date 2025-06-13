// routes/resenas.routes.js
const express = require('express');
const router = express.Router();

const { obtenerResenasPorProducto } = require('../controllers/resena.controller');

// GET /api/resenas/:productoId
router.get('/:productoId', obtenerResenasPorProducto);

module.exports = router;
