// Rutas de Cursos
const express = require('express');
const router = express.Router();
const CursoController = require('../controllers/CursoController');

// Rutas CRUD para cursos
router.get('/', CursoController.obtenerTodos);
router.get('/:id', CursoController.obtenerPorId);
router.post('/', CursoController.crear);
router.put('/:id', CursoController.actualizar);
router.delete('/:id', CursoController.eliminar);
router.put('/:id', CursoController.actualizar);
router.delete('/:id', CursoController.eliminar);

// ======================================================================
// 💳 NUEVA RUTA PARA LA PASARELA DE PAGO SIMULADO
// ======================================================================
const path = require('path'); // Requerimos path para que no dé error de rutas

router.get('/Java/pago.html', (req, res) => {
    // Salimos dos niveles ('..', '..') para ir desde 'backend/routes' hasta la raíz y luego entrar a 'Java'
    res.sendFile(path.join(__dirname, '..', '..', 'Java', 'pago.html'));
});
// ======================================================================

module.exports = router;