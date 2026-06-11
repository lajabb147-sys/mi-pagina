const path = require('path');
const mysql = require('mysql2/promise');
// Carga el .env asegurando la ruta hacia la raíz
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const conexion = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'zensei_academy',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

// Verificar conexión al arrancar el servidor
(async () => {
  try {
    const connection = await conexion.getConnection();
    console.log('✅ Conexión a MySQL establecida correctamente para "zensei_academy"');
    connection.release();
  } catch (error) {
    console.error('⚠️ No se pudo conectar a MySQL:', error.message);
    console.error('→ Asegúrate de que MySQL esté corriendo y que hayas creado backend/.env con las credenciales correctas.');
    console.error('→ La aplicación seguirá ejecutándose, pero las rutas que requieran la base de datos devolverán errores hasta que la conexión se establezca.');
  }
})();

module.exports = conexion;