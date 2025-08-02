  // controllers/producto.controller.js
  const { Producto, Resena } = require('../models/models');



  const crearProducto = async (req, res) => {
    try {
      console.log("🟢 BODY recibido:", req.body);

      // Ya no hay normalizar
      const nuevoProducto = new Producto(req.body);
      const productoGuardado = await nuevoProducto.save();

      res.status(201).json(productoGuardado);
    } catch (error) {
      console.error("❌ Error creando producto:", error);
      res.status(500).json({ message: error.message, stack: error.stack });
    }
  };

  // Obtener productos
  const obtenerProductos = async (req, res) => {
    try {
      const filter = {};
      if (req.query.tipoProducto?.trim()) {
        filter.tipoProducto = req.query.tipoProducto.trim();
      }

      const productos = await Producto.find(filter).lean();

      if (req.query.admin === 'true') {
        return res.json(productos);
      }

      const productosConImagen = productos.map(p => {
        const principal = p.imagenes?.find(img => img.esPrincipal);
        return {
          ...p,
          imagen: principal ? principal.url : (p.imagenes?.[0]?.url || '')
        };
      });

      res.json(productosConImagen);
    } catch (error) {
      console.error('❌ Error obteniendo productos:', error);
      res.status(500).json({ msg: 'Error al obtener productos', error: error.message });
    }
  };

  // Obtener producto por ID
  const obtenerProductoPorId = async (req, res) => {
    try {
      const producto = await Producto.findById(req.params.id);
      if (!producto) {
        return res.status(404).json({ mensaje: 'Producto no encontrado' });
      }
      res.json(producto);
    } catch (error) {
      console.error('❌ Error obteniendo producto:', error);
      res.status(500).json({ mensaje: 'Error al obtener producto', error: error.message });
    }
  };

  // Actualizar producto
  const actualizarProducto = async (req, res) => {
    try {
      let { imagenes, ...resto } = req.body;
      const productoActualizado = await Producto.findByIdAndUpdate(
        req.params.id,
        { $set: { ...resto, imagenes } },
        { new: true }
      );
      if (!productoActualizado) {
        return res.status(404).json({ msg: 'Producto no encontrado' });
      }
      res.json(productoActualizado);
    } catch (error) {
      console.error('❌ Error actualizando producto:', error);
      res.status(500).json({ msg: 'Error al actualizar producto', error: error.message });
    }
  };

  // Eliminar producto
  const eliminarProducto = async (req, res) => {
    try {
      const productoEliminado = await Producto.findByIdAndDelete(req.params.id);
      if (!productoEliminado) {
        return res.status(404).json({ msg: 'Producto no encontrado' });
      }
      res.json({ msg: 'Producto eliminado correctamente' });
    } catch (error) {
      console.error('❌ Error eliminando producto:', error);
      res.status(500).json({ msg: 'Error al eliminar producto', error: error.message });
    }
  };

  // Agregar reseña
  const agregarResena = async (req, res) => {
    const { estrellas, comentario } = req.body;

    if (estrellas < 1 || estrellas > 5) {
      return res.status(400).json({ error: 'Puntaje inválido: 1-5.' });
    }

    try {
      const producto = await Producto.findById(req.params.id);
      if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

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
      console.error('❌ Error agregando reseña:', error);
      res.status(500).json({ error: 'Error interno', detalle: error.message });
    }
  };


  const actualizarVariantes = async (req, res) => {
    try {
      const producto = await Producto.findById(req.params.id);
      if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });

      const { variantes } = req.body;

      if (!Array.isArray(variantes)) {
        return res.status(400).json({ mensaje: 'Las variantes deben ser un arreglo' });
      }

      const variantesValidadas = variantes.map(v => ({
        color: v.color,
        talla: v.talla,
        stock: v.stock ?? 0
      }));

      producto.variantes = variantesValidadas;

      await producto.save();
      res.json({ mensaje: 'Variantes actualizadas con éxito', producto });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: 'Error actualizando variantes' });
    }
  };


  module.exports = {
    crearProducto,
    obtenerProductos,
    obtenerProductoPorId,
    actualizarProducto,
    eliminarProducto,
    agregarResena,
      actualizarVariantes // 👈 añade esta
  };
