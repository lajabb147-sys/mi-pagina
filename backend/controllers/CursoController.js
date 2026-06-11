// Controlador de Cursos
const Curso = require('../models/Curso');

const CursoController = {
  // Obtener todos los cursos
  obtenerTodos: async (req, res) => {
    try {
      const cursos = await Curso.obtenerTodos();
      res.json({
        estado: 'éxito',
        datos: cursos
      });
    } catch (error) {
      console.error('Error al obtener cursos:', error);
      res.status(500).json({
        estado: 'error',
        mensaje: 'Error al obtener cursos',
        detalles: error.message
      });
    }
  },

  // Obtener curso por ID
  obtenerPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const curso = await Curso.obtenerPorId(id);

      if (!curso) {
        return res.status(404).json({
          estado: 'error',
          mensaje: 'Curso no encontrado'
        });
      }

      res.json({
        estado: 'éxito',
        datos: curso
      });
    } catch (error) {
      console.error('Error al obtener curso:', error);
      res.status(500).json({
        estado: 'error',
        mensaje: 'Error al obtener curso',
        detalles: error.message
      });
    }
  },

  // Crear nuevo curso
  crear: async (req, res) => {
    try {
      const { nombre, descripcion, precio, imagen } = req.body;

      if (!nombre || !descripcion || !precio) {
        return res.status(400).json({
          estado: 'error',
          mensaje: 'Faltan datos requeridos (nombre, descripcion, precio)'
        });
      }

      const id = await Curso.crear({
        nombre,
        descripcion,
        precio,
        imagen
      });

      res.status(201).json({
        estado: 'éxito',
        mensaje: 'Curso creado correctamente',
        id: id
      });
    } catch (error) {
      console.error('Error al crear curso:', error);
      res.status(500).json({
        estado: 'error',
        mensaje: 'Error al crear curso',
        detalles: error.message
      });
    }
  },

  // Actualizar curso
  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, descripcion, precio, imagen } = req.body;

      const actualizado = await Curso.actualizar(id, {
        nombre,
        descripcion,
        precio,
        imagen
      });

      if (!actualizado) {
        return res.status(404).json({
          estado: 'error',
          mensaje: 'Curso no encontrado'
        });
      }

      res.json({
        estado: 'éxito',
        mensaje: 'Curso actualizado correctamente'
      });
    } catch (error) {
      console.error('Error al actualizar curso:', error);
      res.status(500).json({
        estado: 'error',
        mensaje: 'Error al actualizar curso',
        detalles: error.message
      });
    }
  },

  // Eliminar curso
  eliminar: async (req, res) => {
    try {
      const { id } = req.params;

      const eliminado = await Curso.eliminar(id);

      if (!eliminado) {
        return res.status(404).json({
          estado: 'error',
          mensaje: 'Curso no encontrado'
        });
      }

      res.json({
        estado: 'éxito',
        mensaje: 'Curso eliminado correctamente'
      });
    } catch (error) {
      console.error('Error al eliminar curso:', error);
      res.status(500).json({
        estado: 'error',
        mensaje: 'Error al eliminar curso',
        detalles: error.message
      });
    }
  }
};

module.exports = CursoController;
