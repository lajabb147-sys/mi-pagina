// Modelo de Cursos
const conexion = require('../config/conexion');

const Curso = {
  // Obtener todos los cursos
  obtenerTodos: async () => {
    const [cursos] = await conexion.query('SELECT * FROM cursos WHERE activo = TRUE');
    return cursos;
  },

  // Obtener curso por ID
  obtenerPorId: async (id) => {
    const [curso] = await conexion.query('SELECT * FROM cursos WHERE id = ?', [id]);
    return curso.length > 0 ? curso[0] : null;
  },

  // Crear nuevo curso
  crear: async (datos) => {
    const { nombre, descripcion, precio, imagen } = datos;
    const [resultado] = await conexion.query(
      'INSERT INTO cursos (nombre, descripcion, precio, imagen) VALUES (?, ?, ?, ?)',
      [nombre, descripcion, precio, imagen || null]
    );
    return resultado.insertId;
  },

  // Actualizar curso
  actualizar: async (id, datos) => {
    const { nombre, descripcion, precio, imagen } = datos;
    const [resultado] = await conexion.query(
      'UPDATE cursos SET nombre = ?, descripcion = ?, precio = ?, imagen = ? WHERE id = ?',
      [nombre, descripcion, precio, imagen || null, id]
    );
    return resultado.affectedRows > 0;
  },

  // Eliminar curso
  eliminar: async (id) => {
    const [resultado] = await conexion.query('DELETE FROM cursos WHERE id = ?', [id]);
    return resultado.affectedRows > 0;
  }
};

module.exports = Curso;
