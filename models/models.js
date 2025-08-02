const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['cliente', 'vendedor', 'admin'], default: 'cliente' },
  activo: { type: Boolean, default: true },
  tokenResetPassword: String,
  tokenResetExpira: Date,
  fechaRegistro: { type: Date, default: Date.now }
});

// Middleware para hashear la contraseña antes de guardar, solo si se modificó
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Ocultar password en JSON
usuarioSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret._id = ret._id || ret.id;
    delete ret.id;
    delete ret.password;
  }
});
// ======================
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

// ======================
// ✅ MODELO: Reseña
const resenaSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  estrellas: { type: Number, min: 1, max: 5, required: true },
  comentario: String,
  fecha: { type: Date, default: Date.now }
});

// ======================
// ✅ MODELO: Producto
const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  slug: String,
  descripcion: { type: String, required: true },
  precio: { type: Number, required: true },
  precioOriginal: Number,
  descuento: {
    porcentaje: Number,
    desde: Date,
    hasta: Date
  },
  categoria: { type: String, required: true, index: true },
  tipoProducto: { type: String, required: true },
  marca: String,
  colores: [String],
  tallas: [String],
  variantes: [
    {
      color: String,
      talla: String,
      stock: Number
    }
  ],
  imagenes: [
    {
      url: { type: String, required: true },
      esPrincipal: { type: Boolean, default: false },
      etiqueta: String
    }
  ],
  promedioEstrellas: { type: Number, default: 0 },
  vendedor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', index: true },
  creadoEn: { type: Date, default: Date.now },
  actualizadoEn: { type: Date, default: Date.now },
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  actualizadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  tags: [String]
});

// 🔄 Actualizar fecha de modificación
productoSchema.pre('save', function (next) {
  this.actualizadoEn = new Date();
  next();
});

// 💲 Precio con descuento
productoSchema.virtual('precioConDescuento').get(function () {
  const hoy = new Date();
  if (this.descuento?.porcentaje && hoy >= this.descuento.desde && hoy <= this.descuento.hasta) {
    return this.precio * (1 - this.descuento.porcentaje / 100);
  }
  return this.precio;
});

// 📦 Indexación para búsqueda
productoSchema.index({ nombre: 'text', descripcion: 'text', tags: 'text' });
productoSchema.set('toObject', { virtuals: true });
productoSchema.set('toJSON', { virtuals: true });

// ======================
// ✅ MODELO: Favorito
const favoritoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  fecha: { type: Date, default: Date.now }
});

// ======================
// ✅ MODELO: Historial de cambios
const historialProductoSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  cambio: String,
  antes: mongoose.Schema.Types.Mixed,
  despues: mongoose.Schema.Types.Mixed,
  fechaCambio: { type: Date, default: Date.now }
});

// ======================
// ✅ MODELO: Carrito
const productoCarritoSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  cantidad: { type: Number, required: true },
  color: String,
  talla: String
});

const carritoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, unique: true },
  productos: [productoCarritoSchema]
});

// ======================
// ✅ MODELO: Orden
const ordenSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  productos: [
    {
      producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
      cantidad: { type: Number, required: true },
      color: String,
      talla: String,
      precioUnitario: { type: Number, required: true }
    }
  ],
  total: { type: Number, required: true },
  metodoPago: { type: String, default: 'PSE' },
  estado: {
    type: String,
    enum: ['pendiente', 'pagado', 'enviado', 'en camino', 'entregado', 'cancelada', 'fallido'],
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
  seguimiento: [
    {
      estado: {
        type: String,
        enum: ['pendiente', 'pagado', 'enviado', 'en camino', 'entregado', 'cancelada', 'fallido']
      },
      fecha: { type: Date, default: Date.now },
      comentario: String
    }
  ],
  numeroSeguimiento: String,
  linkPago: String,
  transaccionId: String,
  fechaCreacion: { type: Date, default: Date.now },
  fechaPago: Date
});

// ======================
// ✅ Exportar todos los modelos
const Usuario = mongoose.model('Usuario', usuarioSchema);
const Direccion = mongoose.model('Direccion', direccionSchema);
const Resena = mongoose.model('Resena', resenaSchema);
const Producto = mongoose.model('Producto', productoSchema);
const Favorito = mongoose.model('Favorito', favoritoSchema);
const HistorialProducto = mongoose.model('HistorialProducto', historialProductoSchema);
const Carrito = mongoose.model('Carrito', carritoSchema);
const Orden = mongoose.model('Orden', ordenSchema);

module.exports = {
  Usuario,
  Direccion,
  Resena,
  Producto,
  Favorito,
  HistorialProducto,
  Carrito,
  Orden
};
