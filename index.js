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

// Importar rutas
const productoRoutes = require('./routes/productoRoutes');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const resenasRoutes = require('./routes/resenas.routes');
const pagosRoutes = require('./routes/pagos.routes'); // ✅ ya está aquí, no repetir
const ventasRoutes = require('./routes/ventas.routes');

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
app.use('/api/pagos', pagosRoutes); // ✅ Ruta de pagos
app.use('/api/ventas', ventasRoutes);
// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API Tienda de Bicis funcionando 🚴‍♂️');
});

// Ruta de test productos
app.get('/api/productos/test', (req, res) => {
  res.json({ mensaje: 'Ruta de productos funcionando' });
});

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
