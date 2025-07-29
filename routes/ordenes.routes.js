const express = require('express');
const router = express.Router();
const { Orden } = require('../models/models'); // Importa tu modelo Orden
const verificarToken = require('../middlewares/verificarToken'); // Middleware para verificar el token del usuario

// 📌 Ruta para obtener una orden por su ID
router.get('/:id', verificarToken, async (req, res) => {
    try {
        const ordenId = req.params.id;
        const userId = req.usuarioId; // Obtiene el ID de usuario del token

        // Busca por ID de orden Y ID de usuario para asegurar que el usuario es el dueño de la orden
        const orden = await Orden.findOne({ _id: ordenId, usuario: userId })
                                .populate('productos.producto', 'nombre imagenes precio'); // Popula los detalles del producto

        if (!orden) {
            return res.status(404).json({ message: 'Orden no encontrada o no pertenece al usuario.' });
        }

        res.json(orden);
    } catch (error) {
        console.error("❌ Error al obtener la orden por ID:", error);
        // Maneja CastError para IDs inválidos (ej. ID mal formado)
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de orden inválido.' });
        }
        res.status(500).json({ error: 'Error interno del servidor al obtener la orden.' });
    }
});

// Opcional: Puedes mover tu ruta existente 'mis-ventas' (ahora 'mis-ordenes') aquí también:
// router.get('/mis-ordenes', verificarToken, async (req, res) => {
//     try {
//         const userId = req.usuarioId;
//         const ordenes = await Orden.find({ usuario: userId, estado: 'pagado' })
//             .populate('productos.producto', 'nombre imagenes precio color tallas')
//             .sort({ fechaCreacion: -1 });
//         res.json(ordenes);
//     } catch (error) {
//         console.error("❌ Error en /api/ordenes/mis-ordenes:", error);
//         res.status(500).json({ error: 'Error interno del servidor al obtener las compras.' });
//     }
// });

module.exports = router; // <-- ¡Este es el ÚNICO module.exports para este archivo!