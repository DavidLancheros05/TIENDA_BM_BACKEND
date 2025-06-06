const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');

// DATOS DE PRUEBA DE PAYU (puedes reemplazarlos por los tuyos reales)
const apiKey = '4Vj8eK4rloUd272L48hsrarnUA'; // Sandbox de ejemplo
const apiLogin = 'pRRXKOl8ikMmt9u';            // Sandbox de ejemplo
const merchantId = '508029';                   // Sandbox
const accountId = '512321';                    // Sandbox

router.post('/crear-transaccion', async (req, res) => {
  console.log('Body recibido:', req.body); // <---- para verificar qué recibes
  const { valor, descripcion, nombreComprador, emailComprador } = req.body;

  const referencia = `pedido-${Date.now()}`;
  const moneda = 'COP';

  const firma = crypto
    .createHash('md5')
    .update(`${apiKey}~${merchantId}~${referencia}~${valor}~${moneda}`)
    .digest('hex');

  const payload = {
    language: 'es',
    command: 'SUBMIT_TRANSACTION',
    merchant: {
      apiKey,
      apiLogin,
    },
    transaction: {
      order: {
        accountId,
        referenceCode: referencia,
        description: descripcion,
        language: 'es',
        signature: firma,
        notifyUrl: 'http://localhost:5000/api/payu/notificacion',
        additionalValues: {
          TX_VALUE: {
            value: parseFloat(valor),
            currency: moneda,
          },
        },
        buyer: {
          fullName: nombreComprador,
          emailAddress: emailComprador,
        },
      },
      "payer": {
      "fullName": "David",
      "emailAddress": "david@email.com"
    },
    "creditCard": {
      "number": "4111111111111111",
      "securityCode": "123",
      "expirationDate": "2030/12",
      "name": "David"
    },
    "type": "AUTHORIZATION_AND_CAPTURE",
    "paymentMethod": "VISA",
    "paymentCountry": "CO",
    "deviceSessionId": "session12345",
    "ipAddress": "127.0.0.1",
    "cookie": "pt1t38347bs6jc9ruv2ecpv7o2",
    "userAgent": "Mozilla/5.0"
  },
    test: true,
  };

try {
  const respuesta = await axios.post(
    'https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi',
    payload,
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  console.log('✅ Respuesta de PayU:', JSON.stringify(respuesta.data, null, 2)); // <---- Aquí ves lo que verías en Postman

  res.json(respuesta.data); // también puedes devolverlo al frontend si quieres
} catch (error) {
  console.error('❌ Error al crear transacción PayU:', error.message);
  res.status(500).json({ error: 'No se pudo procesar la transacción' });
}
});


module.exports = router;
