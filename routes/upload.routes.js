// routes/upload.routes.js
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const router = express.Router();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Multer Storage Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'tienda_bicis',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage });

router.post('/', upload.single('file'), (req, res) => {
  console.log('👉 req.file:', req.file);
  console.log('👉 req.body:', req.body);

  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió archivo' });
  }

  // 👇 Siempre usa la propiedad correcta
  res.json({ url: req.file.url });
});

module.exports = router;
