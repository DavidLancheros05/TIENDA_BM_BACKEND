const express = require('express');
const router = express.Router();
const { Orden } = require('../models/models'); // Asegúrate de importar tu modelo Orden
const verificarToken = require('../middlewares/verificarToken'); // Middleware para verificar el token del usuario

/**
 * @route GET /api/ventas/mis-ventas
 * @desc Obtener el historial de compras de un usuario (órdenes con estado 'pagado')
 * @access Privado (requiere token de autenticación)
 */
router.get('/mis-ventas', verificarToken, async (req, res) => {
    try {
        const userId = req.usuarioId; // Obtenido del middleware verificarToken

        // Busca todas las órdenes asociadas a este usuario y que estén 'pagadas'
        const ordenes = await Orden.find({ usuario: userId, estado: 'pagado' })
            .populate('productos.producto', 'nombre imagenes precio color tallas') // Popula los detalles de los productos
            .sort({ fechaCreacion: -1 }); // Ordena de la más reciente a la más antigua

        res.status(200).json(ordenes);
    } catch (error) {
        console.error("❌ Error al obtener el historial de ventas del usuario:", error);
        res.status(500).json({ error: 'Error interno del servidor al obtener las compras.' });
    }
});

// Puedes añadir más rutas de ventas aquí si las necesitas (ej. /estadisticas-admin, /todas-las-ventas-admin)

module.exports = router; // ¡Esencial para exportar el router de Express!