const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log('\n🔍 DIAGNÓSTICO DE CONEXIÓN ZENSEI ART ACADEMY\n');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('📋 Configuración cargada desde .env:');
console.log(`   DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
console.log(`   DB_USER: ${process.env.DB_USER || 'zensei'}`);
console.log(`   DB_PASSWORD: ${process.env.DB_PASSWORD ? '***' : '(vacío)'}`);
console.log(`   DB_NAME: ${process.env.DB_NAME || 'zensei_academy'}`);
console.log(`   DB_PORT: ${process.env.DB_PORT || 3306}\n`);

(async () => {
  try {
    console.log('1️⃣  Intentando conectar al servidor MySQL...');
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'zensei',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 1,
      queueLimit: 0
    });

    const connection = await pool.getConnection();
    console.log('   ✅ Conexión al servidor MySQL: OK\n');

    console.log('2️⃣  Buscando bases de datos disponibles...');
    const [databases] = await connection.query('SHOW DATABASES');
    const dbNames = databases.map(db => db.Database);
    console.log(`   Bases de datos encontradas: ${dbNames.join(', ')}\n`);

    const targetDB = process.env.DB_NAME || 'zensei_academy';
    if (!dbNames.includes(targetDB)) {
      console.log(`   ⚠️  PROBLEMA: La base de datos "${targetDB}" NO existe.\n`);
      return;
    }

    console.log(`3️⃣  Intentando conectar directamente a la base de datos "${targetDB}"...`);
    const pool2 = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'zensei',
      password: process.env.DB_PASSWORD || '',
      database: targetDB,
      port: process.env.DB_PORT || 3306,
    });

    const conn2 = await pool2.getConnection();
    console.log(`   ✅ Conexión a ${targetDB}: OK\n`);

    console.log('4️⃣  Verificando tablas de la academia...');
    const [tables] = await conn2.query('SHOW TABLES');
    const tableNames = tables.map(t => t[Object.keys(t)[0]]);
    console.log(`   Tablas encontradas: ${tableNames.join(', ')}\n`);

    console.log('5️⃣  Verificando datos de los cursos...');
    const [cursos] = await conn2.query('SELECT COUNT(*) as cantidad FROM cursos');
    console.log(`   Registros en la tabla "cursos": ${cursos[0].cantidad}\n`);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ CONEXIÓN COMPLETA Y FUNCIONAL');
    console.log('El ecosistema de la base de datos está listo.');
    console.log('═══════════════════════════════════════════════════════════\n');

    conn2.release();
    await pool2.end();
    connection.release();
    await pool.end();

  } catch (error) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`\n❌ ERROR EN EL DIAGNÓSTICO: ${error.message}\n`);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('PROBLEMA: El usuario o contraseña proporcionados no coinciden con MySQL.');
      console.log('SOLUCIÓN: Revisa que hayas creado el usuario con el script SQL en Workbench.\n');
    }
    console.log('═══════════════════════════════════════════════════════════\n');
  }
})();