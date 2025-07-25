// routes/upload.routes.js
const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/'); // Asegúrate de que la carpeta exista
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

// ✅ SIN /api aquí, la ruta real es /api/upload por el index.js
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió archivo' });
  }

  res.json({
    url: `/uploads/${req.file.filename}`, // Ruta relativa
  });
});

module.exports = router;
