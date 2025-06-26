// controllers/producto.controller.js
const { Producto, Resena } = require('../models/models');

// Crear producto
const crearProducto = async (req, res) => {
  try {
    const nuevoProducto = new Producto(req.body);
    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error('❌ Error creando producto:', error);
    res.status(500).json({ msg: 'Error al crear el producto', error: error.message });
  }
};

// Obtener productos con filtros
const obtenerProductos = async (req, res) => {
  try {
    const filter = {};
    if (req.query.tipoProducto?.trim()) {
      filter.tipoProducto = req.query.tipoProducto.trim();
    }

    const productos = await Producto.find(filter);
    res.json(productos);
  } catch (error) {
    console.error('🔴 Error obteniendo productos:', error);
    res.status(500).json({ msg: error.message });
  }
};

// Obtener producto por ID
const obtenerProductoPorId = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el producto' });
  }
};

// Editar producto
const actualizarProducto = async (req, res) => {
  try {
    const productoActualizado = await Producto.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!productoActualizado)
      return res.status(404).json({ msg: 'Producto no encontrado' });

    res.json(productoActualizado);
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ msg: 'Error actualizando producto' });
  }
};

// Eliminar producto
const eliminarProducto = async (req, res) => {
  try {
    const productoEliminado = await Producto.findByIdAndDelete(req.params.id);
    if (!productoEliminado)
      return res.status(404).json({ msg: 'Producto no encontrado' });
    res.json({ msg: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ msg: 'Error eliminando producto' });
  }
};

// Crear reseña
const agregarResena = async (req, res) => {
  const { estrellas, comentario } = req.body;

  if (estrellas < 1 || estrellas > 5)
    return res.status(400).json({ error: 'Puntaje inválido' });

  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    const nuevaResena = new Resena({
      usuario: req.usuario.id,
      producto: req.params.id,
      estrellas,
      comentario
    });

    await nuevaResena.save();

    const resenas = await Resena.find({ producto: req.params.id });
    const promedio = resenas.reduce((acc, r) => acc + r.estrellas, 0) / resenas.length;

    producto.promedioEstrellas = promedio;
    await producto.save();

    res.json({ mensaje: 'Reseña guardada y promedio actualizado' });
  } catch (error) {
    console.error('[❌ ERROR INTERNO]:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto,
  agregarResena
};
