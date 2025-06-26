const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configuración multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // guarda con extensión original
  }
});

const upload = multer({ storage });

// Ruta POST para subir imagen
router.post('/subir-imagen', upload.single('imagen'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ mensaje: 'No se subió ningún archivo' });
  }
  res.json({ url: `/uploads/${req.file.filename}` });
});

module.exports = router;
