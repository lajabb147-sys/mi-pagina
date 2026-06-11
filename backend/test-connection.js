const conexion = require('./config/conexion');

(async () => {
  try {
    const [rows] = await conexion.query('SELECT 1 AS result');
    console.log('✅ Consulta de prueba exitosa:', rows);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en la prueba de conexión:', err.message);
    process.exit(1);
  }
})();

// Uso: copiar backend/.env.example -> backend/.env y llenar credenciales, luego ejecutar:
//    node backend/test-connection.js
