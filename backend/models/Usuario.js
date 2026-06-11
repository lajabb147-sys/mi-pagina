// Modelo de Usuarios
const conexion = require('../config/conexion');

const Usuario = {
  // Obtener todos los usuarios
  obtenerTodos: async () => {
    const [usuarios] = await conexion.query(
      'SELECT id, nombre, email, fecha_registro FROM usuarios WHERE activo = TRUE'
    );
    return usuarios;
  },

  // Obtener usuario por ID
  obtenerPorId: async (id) => {
    const [usuario] = await conexion.query(
      'SELECT id, nombre, email, fecha_registro FROM usuarios WHERE id = ? AND activo = TRUE',
      [id]
    );
    return usuario.length > 0 ? usuario[0] : null;
  },

  // Obtener usuario por email
  obtenerPorEmail: async (email) => {
    const [usuario] = await conexion.query(
      'SELECT * FROM usuarios WHERE email = ? AND activo = TRUE',
      [email]
    );
    return usuario.length > 0 ? usuario[0] : null;
  },

  // Crear nuevo usuario
  crear: async (datos) => {
    const { nombre, email, password } = datos;
    const [resultado] = await conexion.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
      [nombre, email, password]
    );
    return resultado.insertId;
  },

  // Actualizar usuario
  actualizar: async (id, datos) => {
    const { nombre, email } = datos;
    const [resultado] = await conexion.query(
      'UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?',
      [nombre, email, id]
    );
    return resultado.affectedRows > 0;
  },

  // Desactivar usuario
  desactivar: async (id) => {
    const [resultado] = await conexion.query(
      'UPDATE usuarios SET activo = FALSE WHERE id = ?',
      [id]
    );
    return resultado.affectedRows > 0;
  }
};

module.exports = Usuario;
