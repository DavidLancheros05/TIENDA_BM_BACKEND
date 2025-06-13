// productoRoutes.js
const express = require('express');
const router = express.Router();

const verificarToken = require('../middlewares/verificarToken'); // Middleware para validar JWT
const verificarAdmin = require('../middlewares/adminMiddleware'); // Middleware para validar rol admin
const { Producto, Resena } = require('../models/models');

// Ruta GET principal para obtener productos
router.get('/', async (req, res) => {
  try {
    console.log('🟡 Filtros recibidos:', req.query);

    const filter = {};

    // ✅ Solo filtramos por tipoProducto si viene en la query
    if (req.query.tipoProducto && req.query.tipoProducto.trim() !== '') {
      filter.tipoProducto = req.query.tipoProducto.trim();
    }

    console.log('🟢 Aplicando filtros a la consulta:', filter);

    const productos = await Producto.find(filter);
    console.log('🟢 Productos encontrados:', productos.length);
    //console.log('🟢 Productos encontrados:', productos);
    res.json(productos);
  } catch (error) {
    console.error('🔴 Error en GET /api/productos:', error);
    res.status(500).json({ msg: error.message });
  }
});

//incluir reseña

router.post('/:id/resena', verificarToken, async (req, res) => {
  // 🟨 LOGS ANTES DEL TRY
  console.log('[🔐 Middleware] Usuario:', req.usuario);
  console.log('[📥 Body]', req.body);

  const { estrellas, comentario } = req.body;

  if (estrellas < 1 || estrellas > 5) {
    console.warn('⚠️ [DEBUG] Puntaje fuera de rango');
    return res.status(400).json({ error: 'Puntaje inválido' });
  }

  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      console.warn('⚠️ [DEBUG] Producto no encontrado:', req.params.id);
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    console.log('✅ [DEBUG] Producto encontrado:', producto.nombre);

    const nuevaResena = new Resena({
      usuario: req.usuario.id,  // <- asegúrate de que `req.usuario` tenga `_id`
      producto: req.params.id,
      estrellas,
      comentario
    });

    await nuevaResena.save();
    console.log('🟢 [DEBUG] Reseña guardada:', nuevaResena);

    const resenas = await Resena.find({ producto: req.params.id });
    const totalEstrellas = resenas.reduce((acc, r) => acc + r.estrellas, 0);
    const promedio = resenas.length > 0 ? totalEstrellas / resenas.length : 0;

    console.log(`📊 [DEBUG] Promedio actualizado: ${promedio} basado en ${resenas.length} reseñas`);

    producto.promedioEstrellas = promedio;
    await producto.save();
    console.log('🟢 [DEBUG] Producto actualizado con nuevo promedio');

    res.json({ mensaje: 'Reseña guardada y promedio actualizado' });

  } catch (error) {
    // 🟥 LOG DENTRO DEL CATCH
    console.error('[❌ ERROR INTERNO]:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});






// Obtener producto por ID
router.get('/:id', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el producto' });
  }
});
// PUT editar producto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  console.log('Datos para actualizar:', updateData);

  try {
    // Usa $set explícito para evitar problemas
    const productoActualizado = await Producto.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!productoActualizado)
      return res.status(404).json({ msg: 'Producto no encontrado' });

    res.json(productoActualizado);
  } catch (error) {
    console.error('Error actualizando producto:', error);
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



