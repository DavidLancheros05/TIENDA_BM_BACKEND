const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const productoRoutes = require('./routes/producto.routes.js');
const authRoutes = require('./routes/auth.routes.js');
const uploadRoutes = require('./routes/upload.routes.js');
const resenasRoutes = require('./routes/resenas.routes.js');
const pagosRoutes = require('./routes/pagos.routes.js');

const carritoRoutes = require('./routes/carrito.routes.js');
const webhookRoutes = require('./routes/webhooks.routes');
const ordenesRoutes = require('./routes/ordenes.routes'); // <-- Añade esta línea
const ventasRoutes = require('./routes/ventas.routes'); // Mantén esta si 'mis-ventas' sigue ahí, si no, elimínala

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Rutas principales
app.use('/api/productos', productoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/resenas', resenasRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/webhooks', webhookRoutes); // <-- Añade esta línea
app.use('/api/ordenes', ordenesRoutes); // <-- Añade esta línea


// Servir archivos estáticos desde /uploads
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
