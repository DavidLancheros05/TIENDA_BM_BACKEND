const mongoose = require('mongoose');

// ============================================
// ✅ MODELO: Usuario
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

// ============================================
// ✅ MODELO: Dirección de envío
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

// ============================================
// ✅ MODELO: Reseña
const resenaSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  estrellas: { type: Number, min: 1, max: 5, required: true },
  comentario: String,
  fecha: { type: Date, default: Date.now }
});

// ============================================
// ✅ MODELO: Producto (IMÁGENES embebidas)
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
  imagenes: [
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

productoSchema.pre('save', function (next) {
  this.actualizadoEn = new Date();
  next();
});

productoSchema.set('toObject', { virtuals: true });
productoSchema.set('toJSON', { virtuals: true });

// ============================================
// ✅ MODELO: Favorito
const favoritoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  fecha: { type: Date, default: Date.now }
});

// ============================================
// ✅ MODELO: Historial de cambios del producto
const historialProductoSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  cambio: String,
  antes: mongoose.Schema.Types.Mixed,
  despues: mongoose.Schema.Types.Mixed,
  fechaCambio: { type: Date, default: Date.now }
});

// ============================================
// ✅ MODELO: Carrito
const productoCarritoSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true,
  },
  cantidad: {
    type: Number,
    required: true,
  },
  color: String,
  talla: String,
});

const carritoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
    unique: true,
  },
  productos: [productoCarritoSchema],
});

// ============================================
// ✅ MODELO: Orden (Ahora consolidado con campos de Venta)
const ordenSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  productos: [
    {
      producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto',
        required: true
      },
      cantidad: { type: Number, required: true },
      color: String, // Añadido para el color específico del producto en la orden
      talla: String, // Añadido para la talla específica del producto en la orden
      precioUnitario: { type: Number, required: true } // Añadido para guardar el precio en el momento de la compra
    }
  ],
  total: { type: Number, required: true },
  metodoPago: { type: String, default: 'PSE' },
  estado: {
    type: String,
    enum: ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelada', 'fallido'],
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
  linkPago: String, // Para guardar el ID del link de Wompi o el link completo
  transaccionId: String, // Para guardar el ID de la transacción de Wompi (referencia o ID de evento)
  fechaCreacion: { type: Date, default: Date.now },
  fechaPago: Date // Para registrar cuándo se confirmó el pago
});

const Orden = mongoose.model('Orden', ordenSchema);

// ============================================
// ✅ Exporta todos
const Carrito = mongoose.model('Carrito', carritoSchema);
const Usuario = mongoose.model('Usuario', usuarioSchema);
const Direccion = mongoose.model('Direccion', direccionSchema);
const Resena = mongoose.model('Resena', resenaSchema);
const Producto = mongoose.model('Producto', productoSchema);
// ELIMINADA: const Venta = mongoose.model('Venta', ventaSchema);
const Favorito = mongoose.model('Favorito', favoritoSchema);
const HistorialProducto = mongoose.model('HistorialProducto', historialProductoSchema);

module.exports = {
  Usuario,
  Direccion,
  Resena,
  Producto,
  Orden, // Ahora Orden lo abarca todo
  Carrito,
  Favorito,
  HistorialProducto,
};