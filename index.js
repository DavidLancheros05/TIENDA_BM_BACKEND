const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const productoRoutes = require('./routes/productoRoutes');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); // Importar rutas de uploads
const path = require('path');
const resenasRoutes = require('./routes/resenas.routes');

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

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas

app.use('/api/resenas', resenasRoutes);


app.use('/api/productos', productoRoutes);
const paymentsRoutes = require('./routes/payments');
app.use('/api/payu', paymentsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadRoutes);   // <-- Aquí montas la ruta upload

// Servir archivos estáticos de uploads para poder acceder a las imágenes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/productos/test', (req, res) => {
  res.json({ mensaje: 'Ruta de productos funcionando' });
});



// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API Tienda de Bicis funcionando 🚴‍♂️');
});

// Conexión a MongoDB y levantar servidor
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error al conectar a MongoDB:', error);
  });


