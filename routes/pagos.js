const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/pse', async (req, res) => {
  console.log("Datos recibidos:", req.body); // 👈 AQUI
  try {
    const { payment_method, nombre, email, monto } = req.body;

    if (!payment_method || !nombre || !email || !monto) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Aquí iría la lógica para crear el pago PSE...

    res.status(200).json({ mensaje: 'Pago PSE simulado con éxito' });
  } catch (error) {
    console.error('Error en el backend:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


module.exports = router;
