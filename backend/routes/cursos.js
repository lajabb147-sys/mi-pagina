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

module.exports = router;
