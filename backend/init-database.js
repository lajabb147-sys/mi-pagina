const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function initDatabase() {
  console.log('🔧 Iniciando conexión a MySQL...\n');

  // Crear conexión sin especificar base de datos primero
  let conn;
  try {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });
    console.log('✅ Conexión a MySQL establecida');
  } catch (error) {
    console.error('❌ Error de conexión a MySQL:', error.message);
    console.error('📝 Verifica:');
    console.error('   - MySQL está corriendo');
    console.error('   - Usuario: ' + (process.env.DB_USER || 'root'));
    console.error('   - Host: ' + (process.env.DB_HOST || 'localhost'));
    console.error('   - Puerto: ' + (process.env.DB_PORT || 3306));
    process.exit(1);
  }

  try {
    // 1. Crear base de datos si no existe
    const dbName = process.env.DB_NAME || 'zensei_academy';
    console.log(`\n📦 Creando base de datos "${dbName}"...`);
    await conn.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Base de datos "${dbName}" lista`);

    // 2. Seleccionar la base de datos
    await conn.query(`USE ${dbName}`);
    console.log(`✅ Base de datos seleccionada\n`);

    // 3. Crear tabla usuarios
    console.log('👥 Creando tabla usuarios...');
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
    console.log('✅ Tabla usuarios lista');

    // 4. Crear tabla sesiones
    console.log('🔐 Creando tabla sesiones...');
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
    console.log('✅ Tabla sesiones lista');

    // 5. Crear tabla cursos
    console.log('📚 Creando tabla cursos...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS cursos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT NOT NULL,
        precio DECIMAL(10, 2) NOT NULL,
        imagen VARCHAR(255),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        activo BOOLEAN DEFAULT TRUE
      )
    `);
    console.log('✅ Tabla cursos lista');

    // 6. Crear tabla inscripciones
    console.log('📝 Creando tabla inscripciones...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS inscripciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        curso_id INT NOT NULL,
        fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        pagado BOOLEAN DEFAULT FALSE,
        estado ENUM('activo', 'completado', 'cancelado') DEFAULT 'activo',
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
        UNIQUE KEY unique_inscripcion (usuario_id, curso_id)
      )
    `);
    console.log('✅ Tabla inscripciones lista');

    // 7. Insertar los 4 cursos por defecto si no existen
    console.log('\n🎨 Insertando cursos por defecto...');
    const cursos = [
      {
        nombre: 'Lineart Minimalista',
        descripcion: 'El poder de la simplicidad. Aprende a definir figuras completas, rostros y conceptos usando trazos puros, limpios y continuos.',
        precio: 25.00,
        imagen: 'minimalista_curso.jpg'
      },
      {
        nombre: 'Realismo e Hiperrealismo',
        descripcion: 'Domina el arte de capturar la realidad. Técnicas avanzadas de sombreado, volumen y texturas extremas que imitan una fotografía.',
        precio: 49.99,
        imagen: 'realismo_curso.jpg'
      },
      {
        nombre: 'Manga y Anime Profesional',
        descripcion: 'Diseño de personajes con fisonomía japonesa, expresiones impactantes, ojos expresivos y estructura dinámica de viñetas.',
        precio: 39.99,
        imagen: 'manga_curso.jpg'
      },
      {
        nombre: 'Cartoon y Animación Tradicional',
        descripcion: 'Dale vida y fluidez a tus ideas. Domina las formas geométricas básicas, la exageración de rasgos y la expresividad de caricaturas.',
        precio: 29.99,
        imagen: 'cartoon_curso.jpg'
      }
    ];

    for (const curso of cursos) {
      const [existente] = await conn.query(
        'SELECT id FROM cursos WHERE nombre = ?',
        [curso.nombre]
      );
      if (existente.length === 0) {
        await conn.query(
          'INSERT INTO cursos (nombre, descripcion, precio, imagen) VALUES (?, ?, ?, ?)',
          [curso.nombre, curso.descripcion, curso.precio, curso.imagen]
        );
        console.log(`  ✅ ${curso.nombre}`);
      } else {
        console.log(`  ✓ ${curso.nombre} (ya existe)`);
      }
    }

    // 8. Verificar usuarios existentes
    console.log('\n👤 Verificando usuarios registrados...');
    const [usuarios] = await conn.query('SELECT id, nombre, email FROM usuarios');
    if (usuarios.length === 0) {
      console.log('  ℹ️  No hay usuarios registrados aún');
    } else {
      console.log(`  ✓ Total de usuarios: ${usuarios.length}`);
      usuarios.forEach(u => {
        console.log(`    - ${u.nombre} (${u.email})`);
      });
    }

    // 9. Verificar cursos en base de datos
    console.log('\n📚 Verificando cursos en la base de datos...');
    const [cursosDB] = await conn.query('SELECT id, nombre, precio FROM cursos ORDER BY id');
    if (cursosDB.length === 0) {
      console.log('  ⚠️  No hay cursos en la base de datos');
    } else {
      console.log(`  ✓ Total de cursos: ${cursosDB.length}`);
      cursosDB.forEach(c => {
        console.log(`    - ID ${c.id}: ${c.nombre} ($${c.precio})`);
      });
    }

    console.log('\n✅ BASE DE DATOS INICIALIZADA CORRECTAMENTE\n');
    console.log('📋 RESUMEN:');
    console.log('  ✓ Conexión MySQL: ACTIVA');
    console.log(`  ✓ Base de datos: ${dbName}`);
    console.log('  ✓ Tablas: usuarios, sesiones, cursos, inscripciones');
    console.log(`  ✓ Cursos disponibles: 4`);
    console.log(`  ✓ Usuarios registrados: ${usuarios.length}`);
    console.log('\n🚀 El backend puede iniciarse: node server.js\n');

    await conn.end();

  } catch (error) {
    console.error('\n❌ Error durante la inicialización:', error.message);
    process.exit(1);
  }
}

initDatabase().catch(console.error);
