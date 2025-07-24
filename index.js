const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar modelos
const {
  Usuario,
  Direccion,
  Imagen,
  Resena,
  Producto,
  Venta,
  Favorito,
  HistorialProducto
} = require('./models/models');

// Importar rutas (✅ nombres actualizados)
const productoRoutes = require('./routes/producto.routes.js');
const authRoutes = require('./routes/auth.routes.js');
const uploadRoutes = require('./routes/upload.routes.js'); // (Renombra el archivo si no lo has hecho aún)
const resenasRoutes = require('./routes/resenas.routes.js');
const pagosRoutes = require('./routes/pago.routes.js'); // ✅ nuevo nombre
const ventasRoutes = require('./routes/ventas.routes.js');
const ordenesRoutes = require('./routes/ordenes.routes');
const carritoRoutes = require('./routes/carrito.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas API
app.use('/api/productos', productoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/resenas', resenasRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/ventas', ventasRoutes);

// Servir archivos estáticos (imágenes u otros)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta de prueba general
app.get('/', (req, res) => {
  res.send('API Tienda de Bicis funcionando 🚴‍♂️');
});

// Ruta de prueba específica de productos
app.get('/api/productos/test', (req, res) => {
  res.json({ mensaje: 'Ruta de productos funcionando' });
});
app.use('/api/ordenes', ordenesRoutes);
app.use('/api/carrito', carritoRoutes);
// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Error al conectar a MongoDB:', error);
  });
