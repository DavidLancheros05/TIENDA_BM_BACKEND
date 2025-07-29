// controllers/carrito.controller.js
import Carrito from '../models/Carrito.js';
import Producto from '../models/Producto.js';

// 🔄 Obtener el carrito con detalles de producto
export const obtenerCarrito = async (req, res) => {
  try {
    const carrito = await Carrito.findOne({ usuario: req.usuario.id }).populate('productos.producto');
    if (!carrito) return res.json({ productos: [] });
    res.json(carrito);
  } catch (error) {
    console.error('❌ Error al obtener carrito:', error);
    res.status(500).json({ mensaje: 'Error al obtener carrito' });
  }
};

// 💾 Guardar o actualizar carrito
export const guardarCarrito = async (req, res) => {
  try {
    const { productos } = req.body;

    const carritoExistente = await Carrito.findOne({ usuario: req.usuario.id });

    if (carritoExistente) {
      carritoExistente.productos = productos;
      await carritoExistente.save();
    } else {
      await Carrito.create({
        usuario: req.usuario.id,
        productos,
      });
    }

    res.json({ mensaje: 'Carrito guardado correctamente' });
  } catch (error) {
    console.error('❌ Error al guardar carrito:', error);
    res.status(500).json({ mensaje: 'Error al guardar carrito' });
  }
};
