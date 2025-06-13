// controllers/resena.controller.js
const { Resena, Usuario } = require('../models/models');

const obtenerResenasPorProducto = async (req, res) => {
  const { productoId } = req.params;
  try {
    const resenas = await Resena.find({ producto: productoId }).populate('usuario', 'nombre');
    const resenasConNombre = resenas.map(r => ({
      estrellas: r.estrellas,
      comentario: r.comentario,
      fecha: r.createdAt,
      nombreUsuario: r.usuario?.nombre || 'Anónimo'
    }));
    res.json(resenasConNombre);
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({ error: 'Error al obtener reseñas' });
  }
};

module.exports = {
  obtenerResenasPorProducto
};
