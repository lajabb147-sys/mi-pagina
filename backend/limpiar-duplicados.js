const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

(async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'zensei_academy',
    port: process.env.DB_PORT || 3306
  });

  const conn = await pool.getConnection();
  
  try {
    // Ver los cursos actuales
    console.log('📋 Cursos actuales en BD:');
    const [cursos] = await conn.query('SELECT id, nombre FROM cursos ORDER BY id');
    console.log(cursos);
    
    // Eliminar los IDs duplicados (6, 7, 8) dejando solo 1, 3, 4, 5
    console.log('\n🗑️  Eliminando duplicados (IDs 6, 7, 8)...');
    const [resultado] = await conn.query('DELETE FROM cursos WHERE id IN (6, 7, 8)');
    console.log(`Eliminados: ${resultado.affectedRows} registros`);
    
    // Verificar resultado
    const [cursosLimpios] = await conn.query('SELECT id, nombre FROM cursos ORDER BY id');
    console.log('\n✅ Cursos finales después de limpiar:');
    console.log(cursosLimpios);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    conn.release();
    await pool.end();
  }
})();
