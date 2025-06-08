const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  precio: { type: Number, required: true }, // precio final
  precioOriginal: { type: Number }, // si hay descuento
  descuento: { type: Number }, // porcentaje opcional
  categoria: { type: String, required: true },
  tipoProducto: { type: String, required: true }, // corregido y agregado enum
  imagen: { type: String }, // URL o nombre archivo
  marca: { type: String },
  colores: [{ type: String }], // array de colores disponibles
  tallas: [{ type: String }], // array de tallas disponibles
  creadoEn: { type: Date, default: Date.now },
  actualizadoEn: { type: Date, default: Date.now }  // nuevo campo para fecha actualización
});

// Middleware para actualizar 'actualizadoEn' cada vez que se guarda el documento
productoSchema.pre('save', function(next) {
  this.actualizadoEn = new Date();
  next();
});

const Producto = mongoose.model('Producto', productoSchema);

module.exports = Producto;