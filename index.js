// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const productoRoutes = require('./routes/producto.routes.js');
const authRoutes = require('./routes/auth.routes.js');
const uploadRoutes = require('./routes/upload.routes.js'); // ⏪ correcto
const resenasRoutes = require('./routes/resenas.routes.js');
const pagosRoutes = require('./routes/pago.routes.js');
const ventasRoutes = require('./routes/ventas.routes.js');
const ordenesRoutes = require('./routes/ordenes.routes.js');
const carritoRoutes = require('./routes/carrito.routes.js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Rutas principales
app.use('/api/productos', productoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes); // ⏪ se suma a router.post('/')
app.use('/api/resenas', resenasRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/ordenes', ordenesRoutes);
app.use('/api/carrito', carritoRoutes);

// Servir carpeta de archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('✅ API Tienda Bicis funcionando 🚴‍♀️');
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Error al conectar a MongoDB:', error);
  });
