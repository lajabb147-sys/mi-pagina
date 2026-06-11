const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function setupAuth() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'zensei_academy',
    port: process.env.DB_PORT || 3306
  });

  const conn = await pool.getConnection();

  try {
    console.log('🔐 Configurando autenticación...\n');

    // 1. Crear tabla usuarios mejorada
    await conn.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        activo BOOLEAN DEFAULT TRUE
      )
    `);
    console.log('✅ Tabla "usuarios" lista');

    // 2. Crear tabla sesiones
    await conn.query(`
      CREATE TABLE IF NOT EXISTS sesiones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_expiracion DATETIME NOT NULL,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabla "sesiones" lista');

    // 3. Crear usuario de prueba si no existe
    const [usuarioExistente] = await conn.query(
      'SELECT id FROM usuarios WHERE email = ?',
      ['demo@zensei.com']
    );

    if (usuarioExistente.length === 0) {
      // Hash simple para demo (en producción usar bcrypt)
      const hashSimple = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
      };

      await conn.query(
        'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
        ['Usuario Demo', 'demo@zensei.com', hashSimple('demo123')]
      );
      console.log('✅ Usuario demo creado: demo@zensei.com / demo123');
    } else {
      console.log('✓ Usuario demo ya existe');
    }

    console.log('\n✅ AUTENTICACIÓN CONFIGURADA EXITOSAMENTE');

  } catch (error) {
    console.error('❌ Error en setup:', error.message);
    throw error;
  } finally {
    conn.release();
    await pool.end();
  }
}

setupAuth().catch(console.error);
