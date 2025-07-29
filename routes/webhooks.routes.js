const express = require('express');
const router = express.Router();
const { Orden } = require('../models/models'); // Importa tu modelo Orden

// Endpoint para recibir webhooks de Wompi
router.post('/wompi-webhook', async (req, res) => {
    console.log('🔔 Webhook de Wompi recibido:', JSON.stringify(req.body, null, 2));

    const event = req.body.event; // Tipo de evento (ej. 'transaction.updated')
    const data = req.body.data;   // Contiene los datos de la transacción

    if (event === 'transaction.updated') {
        const transaction = data.transaction;
        const wompiOrderId = transaction.id;       // ID de la transacción de Wompi
        const wompiReference = transaction.reference; // La referencia que enviaste (tu _id de Orden)
        const newStatus = transaction.status;      // Estado de la transacción en Wompi (APPROVED, DECLINED, PENDING, etc.)

        console.log(`🔍 Webhook: Transacción ${wompiOrderId} con referencia ${wompiReference} actualizada a estado: ${newStatus}`);

        try {
            // Busca la orden en tu base de datos usando la referencia (que es tu _id de Orden)
            const orden = await Orden.findById(wompiReference);

            if (!orden) {
                console.warn(`⚠️ Webhook: Orden con ID ${wompiReference} no encontrada en la DB.`);
                return res.status(404).json({ message: 'Orden no encontrada.' });
            }

            let estadoActualizado = orden.estado; // Mantener el estado actual por defecto

            if (newStatus === 'APPROVED') {
                estadoActualizado = 'pagado';
                orden.fechaPago = new Date(); // Registra la fecha de pago
                orden.transaccionId = wompiOrderId; // Guarda el ID de transacción de Wompi
                console.log(`✅ Webhook: Orden ${wompiReference} actualizada a 'pagado'.`);
                // Aquí podrías añadir lógica para:
                // - Vaciar el carrito del usuario (si no lo hiciste en PagoExitoso)
                // - Enviar email de confirmación
                // - Actualizar stock de productos
            } else if (newStatus === 'DECLINED' || newStatus === 'VOIDED' || newStatus === 'ERROR') {
                estadoActualizado = 'fallido';
                console.log(`❌ Webhook: Orden ${wompiReference} actualizada a 'fallido'. Estado Wompi: ${newStatus}`);
            } else if (newStatus === 'PENDING') {
                estadoActualizado = 'pendiente'; // O mantener como 'pendiente'
                console.log(`⏳ Webhook: Orden ${wompiReference} sigue 'pendiente'.`);
            }

            if (orden.estado !== estadoActualizado) {
                orden.estado = estadoActualizado;
                await orden.save();
                console.log(`💾 Webhook: Estado de la Orden ${wompiReference} guardado como '${estadoActualizado}'.`);
            } else {
                console.log(`ℹ️ Webhook: Estado de la Orden ${wompiReference} ya estaba '${estadoActualizado}'. No se necesita actualizar.`);
            }

            res.status(200).json({ message: 'Webhook recibido y procesado.' });

        } catch (error) {
            console.error('❌ Error procesando webhook de Wompi:', error.message);
            res.status(500).json({ error: 'Error interno del servidor.' });
        }
    } else {
        console.log(`ℹ️ Webhook: Evento ${event} no procesado.`);
        res.status(200).json({ message: 'Tipo de evento no manejado.' });
    }
});

module.exports = router; // <-- ¡Este es el ÚNICO module.exports para este archivo!