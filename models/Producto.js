const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  precio: { type: Number, required: true },
  categoria: { type: String, required: true },
  imagen: { type: String }, // URL o nombre archivo
  creadoEn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Producto', productoSchema);
