const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

(async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });
  
  const conn = await pool.getConnection();
  const [cursos] = await conn.query('SELECT id, nombre FROM cursos');
  console.log('Cursos existentes:');
  cursos.forEach(c => console.log(`  ID: ${c.id}, Nombre: ${c.nombre}`));
  conn.release();
  await pool.end();
})();
