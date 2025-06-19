const mongoose = require('mongoose');

// ✅ MODELO: Usuario
const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['cliente', 'vendedor', 'admin'], default: 'cliente' },
  fechaRegistro: { type: Date, default: Date.now }
});

// ✅ MODELO: Direccion
const direccionSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  nombre: String,
  direccion: String,
  ciudad: String,
  departamento: String,
  codigoPostal: String,
  telefono: String,
  esPrincipal: { type: Boolean, default: false }
});

// ✅ MODELO: Imagen (opcional si se quiere separarlas)
const imagenSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  url: { type: String, required: true },
  esPrincipal: { type: Boolean, default: false },
  etiqueta: String
});

// ✅ MODELO: Resena
const resenaSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  estrellas: { type: Number, min: 1, max: 5, required: true },
  comentario: String,
  fecha: { type: Date, default: Date.now }
});

// ✅ MODELO: Producto
const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  precio: { type: Number, required: true },
  precioOriginal: Number,
  descuento: {
    porcentaje: Number,
    desde: Date,
    hasta: Date
  },
  categoria: { type: String, required: true },
  tipoProducto: { type: String, required: true },
  imagenes: [{ type: String }],
  imagenDestacada: String,
  marca: String,
  colores: [{ type: String }],
  tallas: [{ type: String }],
  variantes: [{
    color: String,
    talla: String,
    stock: Number
  }],
  promedioEstrellas: { type: Number, default: 0 },
  vendedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  creadoEn: { type: Date, default: Date.now },
  actualizadoEn: { type: Date, default: Date.now }
});
productoSchema.pre('save', function (next) {
  this.actualizadoEn = new Date();
  next();
});

// ✅ MODELO: Venta
const ventaSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  productos: [{
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
    cantidad: Number,
    precioUnitario: Number
  }],
  total: Number,
  metodoPago: String,
  estado: { 
  type: String, 
  enum: ['pendiente', 'pagado', 'completada', 'cancelada'], 
  default: 'pendiente' 
},
  fechaVenta: { type: Date, default: Date.now }
});

// ✅ MODELO: Favorito
const favoritoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  fecha: { type: Date, default: Date.now }
});

// ✅ MODELO: HistorialProducto
const historialProductoSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  cambio: String,
  antes: mongoose.Schema.Types.Mixed,
  despues: mongoose.Schema.Types.Mixed,
  fechaCambio: { type: Date, default: Date.now }
});


const Usuario = mongoose.model('Usuario', usuarioSchema);
const Direccion = mongoose.model('Direccion', direccionSchema);
const Imagen = mongoose.model('Imagen', imagenSchema);
const Resena = mongoose.model('Resena', resenaSchema);
const Producto = mongoose.model('Producto', productoSchema);
const Venta = mongoose.model('Venta', ventaSchema);
const Favorito = mongoose.model('Favorito', favoritoSchema);
const HistorialProducto = mongoose.model('HistorialProducto', historialProductoSchema);

module.exports = {
  Usuario,
  Direccion,
  Imagen,
  Resena,
  Producto,
  Venta,
  Favorito,
  HistorialProducto
};