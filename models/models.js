const mongoose = require('mongoose');

//
// ============================================
// ✅ MODELO: Usuario
//
const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['cliente', 'vendedor', 'admin'], default: 'cliente' },
  fechaRegistro: { type: Date, default: Date.now }
});

usuarioSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret._id = ret._id || ret.id;
    delete ret.id;
  }
});

//
// ============================================
// ✅ MODELO: Dirección de envío
//
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

//
// ============================================
// ✅ MODELO: Reseña
//
const resenaSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  estrellas: { type: Number, min: 1, max: 5, required: true },
  comentario: String,
  fecha: { type: Date, default: Date.now }
});

//
// ============================================
// ✅ MODELO: Producto (IMÁGENES embebidas)
//
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
  marca: String,
  colores: [{ type: String }],
  tallas: [{ type: String }],
  variantes: [{
    color: String,
    talla: String,
    stock: Number
  }],
  imagenes: [ // ✅ AHORA ES EMBEBIDO
    {
      url: { type: String, required: true },
      esPrincipal: { type: Boolean, default: false },
      etiqueta: String
    }
  ],
  promedioEstrellas: { type: Number, default: 0 },
  vendedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  creadoEn: { type: Date, default: Date.now },
  actualizadoEn: { type: Date, default: Date.now }
});

// ✅ Hook para timestamp
productoSchema.pre('save', function (next) {
  this.actualizadoEn = new Date();
  next();
});

productoSchema.set('toObject', { virtuals: true });
productoSchema.set('toJSON', { virtuals: true });

//
// ============================================
// ✅ MODELO: Orden
//
const ordenSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  productos: [
    {
      producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
      cantidad: Number,
      precioUnitario: Number
    }
  ],
  total: Number,
  metodoPago: { type: String, default: 'PSE' },
  estado: {
    type: String,
    enum: ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelada'],
    default: 'pendiente'
  },
  direccionEnvio: {
    nombreCompleto: String,
    correo: String,
    telefono: String,
    direccionLinea1: String,
    ciudad: String,
    departamento: String,
    pais: String
  },
  linkPago: String,
  transaccionId: String,
  fechaCreacion: { type: Date, default: Date.now },
  fechaPago: Date
});

//
// ============================================
// ✅ MODELO: Favorito
//
const favoritoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  fecha: { type: Date, default: Date.now }
});

//
// ============================================
// ✅ MODELO: Historial de cambios del producto
//
const historialProductoSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  cambio: String,
  antes: mongoose.Schema.Types.Mixed,
  despues: mongoose.Schema.Types.Mixed,
  fechaCambio: { type: Date, default: Date.now }
});

//
// ============================================
// ✅ MODELO: Carrito
//
const carritoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  productos: [
    {
      producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
      cantidad: Number
    }
  ]
});

//
// ============================================
// ✅ Exporta todos
//
const Carrito = mongoose.model('Carrito', carritoSchema);
const Usuario = mongoose.model('Usuario', usuarioSchema);
const Direccion = mongoose.model('Direccion', direccionSchema);
const Resena = mongoose.model('Resena', resenaSchema);
const Producto = mongoose.model('Producto', productoSchema);
const Orden = mongoose.model('Orden', ordenSchema);
const Favorito = mongoose.model('Favorito', favoritoSchema);
const HistorialProducto = mongoose.model('HistorialProducto', historialProductoSchema);

module.exports = {
  Usuario,
  Direccion,
  Resena,
  Producto,
  Orden,
  Carrito,
  Favorito,
  HistorialProducto
};
