const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'zensei_academy',
  port: process.env.DB_PORT || 3306
});

async function setupDatabase() {
  const conn = await pool.getConnection();

  try {
    console.log('🔧 Configurando la base de datos...\n');

    // 0. Asegurar que los cursos principales existan sin eliminar ninguno de los cursos actuales
    const cursosPorDefecto = [
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

    for (const curso of cursosPorDefecto) {
      const [cursoExistente] = await conn.query(
        'SELECT id FROM cursos WHERE nombre = ?',
        [curso.nombre]
      );

      if (cursoExistente.length === 0) {
        await conn.query(
          'INSERT INTO cursos (nombre, descripcion, precio, imagen) VALUES (?, ?, ?, ?)',
          [curso.nombre, curso.descripcion, curso.precio, curso.imagen]
        );
        console.log(`✅ Curso agregado: ${curso.nombre}`);
      } else {
        console.log(`✓ Curso ya existe: ${curso.nombre}`);
      }
    }

    // 1. Agregar columna pagado a inscripciones si no existe
    try {
      await conn.query(`
        ALTER TABLE inscripciones 
        ADD COLUMN pagado BOOLEAN DEFAULT FALSE
      `);
      console.log('✅ Columna "pagado" agregada a inscripciones');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('✓ Columna "pagado" ya existe en inscripciones');
      } else {
        throw e;
      }
    }

    // 2. Crear tabla modulos si no existe
    await conn.query(`
      CREATE TABLE IF NOT EXISTS modulos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        curso_id INT NOT NULL,
        numero_modulo INT NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
        UNIQUE KEY unique_modulo (curso_id, numero_modulo)
      )
    `);
    console.log('✅ Tabla "modulos" lista');

    // 3. Crear tabla lecciones si no existe
    await conn.query(`
      CREATE TABLE IF NOT EXISTS lecciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        modulo_id INT NOT NULL,
        numero_leccion INT NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        imagen_url VARCHAR(500),
        contenido_html LONGTEXT,
        FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE,
        UNIQUE KEY unique_leccion (modulo_id, numero_leccion)
      )
    `);
    console.log('✅ Tabla "lecciones" lista');

    // 4. Crear tabla niveles si no existe
    await conn.query(`
      CREATE TABLE IF NOT EXISTS niveles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        leccion_id INT NOT NULL,
        numero_nivel INT NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        ejercicio_html LONGTEXT,
        FOREIGN KEY (leccion_id) REFERENCES lecciones(id) ON DELETE CASCADE,
        UNIQUE KEY unique_nivel (leccion_id, numero_nivel)
      )
    `);
    console.log('✅ Tabla "niveles" lista');

    // 5. Crear tabla progreso_curso si no existe
    await conn.query(`
      CREATE TABLE IF NOT EXISTS progreso_curso (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        curso_id INT NOT NULL,
        modulo_actual INT DEFAULT 1,
        leccion_actual INT DEFAULT 1,
        nivel_actual INT DEFAULT 1,
        porcentaje DECIMAL(5,2) DEFAULT 0,
        fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
        UNIQUE KEY unique_progreso (usuario_id, curso_id)
      )
    `);
    console.log('✅ Tabla "progreso_curso" lista');

    // 6. Crear tabla certificados si no existe
    await conn.query(`
      CREATE TABLE IF NOT EXISTS certificados (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        curso_id INT NOT NULL,
        fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        codigo_certificado VARCHAR(255) UNIQUE NOT NULL,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
        UNIQUE KEY unique_cert (usuario_id, curso_id)
      )
    `);
    console.log('✅ Tabla "certificados" lista');

    // 7. Insertar módulos para cursos existentes si no existen
    const [cursos] = await conn.query('SELECT id FROM cursos');
    
    for (const curso of cursos) {
      const cursoId = curso.id;
      // Insertar 5 módulos por defecto
      for (let i = 1; i <= 5; i++) {
        try {
          await conn.query(`
            INSERT INTO modulos (curso_id, numero_modulo, titulo, descripcion)
            VALUES (?, ?, ?, ?)
          `, [
            cursoId,
            i,
            `Módulo ${i}`,
            `Contenido del módulo ${i}`
          ]);
        } catch (e) {
          if (e.code !== 'ER_DUP_ENTRY') throw e;
        }
      }
    }
    console.log('✅ Módulos agregados a cursos');

    console.log('\n✅ BASE DE DATOS CONFIGURADA EXITOSAMENTE');
    console.log('');
  } catch (error) {
    console.error('❌ Error en setup:', error.message);
    throw error;
  } finally {
    conn.release();
    await pool.end();
  }
}

setupDatabase().catch(console.error);
