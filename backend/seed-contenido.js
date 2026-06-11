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

async function poblarContenido() {
  const conn = await pool.getConnection();

  try {
    console.log('📚 Agregando contenido de ejemplo a los cursos...\n');

    // Definir contenido para cada curso (solo los que existen: 1 y 3)
    const contenidoCursos = {
      1: { // Lineart Minimalista - ID 1
        nombre: 'Lineart Minimalista',
        modulos: [
          {
            numero: 1,
            titulo: 'Módulo 1 - Técnicas Generales',
            lecciones: [
              {
                numero: 1,
                titulo: 'Cómo sujetar el lápiz',
                descripcion: 'Aprende los diferentes agarres del lápiz para máximo control.',
                niveles: [
                  { numero: 1, titulo: 'Nivel 1', descripcion: 'Agarre tradicional' },
                  { numero: 2, titulo: 'Nivel 2', descripcion: 'Agarre lateral' },
                  { numero: 3, titulo: 'Nivel 3', descripcion: 'Agarre dinámico' }
                ]
              },
              {
                numero: 2,
                titulo: 'Control del trazo',
                descripcion: 'Domina la presión y velocidad para líneas perfectas.',
                niveles: [
                  { numero: 1, titulo: 'Básico', descripcion: 'Líneas rectas y curvas' },
                  { numero: 2, titulo: 'Intermedio', descripcion: 'Variación de grosor' }
                ]
              }
            ]
          },
          {
            numero: 2,
            titulo: 'Módulo 2 - Materiales',
            lecciones: [
              {
                numero: 1,
                titulo: 'Lápices y Grados',
                descripcion: 'Entender los diferentes grados de dureza.',
                niveles: [
                  { numero: 1, titulo: 'Introducción', descripcion: 'HB, 2B, 4B' }
                ]
              }
            ]
          },
          {
            numero: 3,
            titulo: 'Módulo 3 - Fundamentos',
            lecciones: [
              {
                numero: 1,
                titulo: 'Formas Básicas',
                descripcion: 'Dominando círculos, cuadrados y triángulos.',
                niveles: [
                  { numero: 1, titulo: 'Paso 1', descripcion: 'Formas simples' },
                  { numero: 2, titulo: 'Paso 2', descripcion: 'Composición' }
                ]
              }
            ]
          },
          {
            numero: 4,
            titulo: 'Módulo 4 - Proyecto Guiado',
            lecciones: [
              {
                numero: 1,
                titulo: 'Ilustración Simple',
                descripcion: 'Crea tu primer dibujo lineal completo.',
                niveles: [
                  { numero: 1, titulo: 'Boceto', descripcion: 'Estructura base' }
                ]
              }
            ]
          },
          {
            numero: 5,
            titulo: 'Módulo 5 - Proyecto Final',
            lecciones: [
              {
                numero: 1,
                titulo: 'Tu Obra Maestra',
                descripcion: 'Crea una ilustración minimalista original.',
                niveles: [
                  { numero: 1, titulo: 'Concepto', descripcion: 'Ideación' }
                ]
              }
            ]
          }
        ]
      },
      3: { // Manga y Anime Profesional - ID 3
        nombre: 'Manga y Anime Profesional',
        modulos: [
          {
            numero: 1,
            titulo: 'Módulo 1 - Fundamentos Manga',
            lecciones: [
              {
                numero: 1,
                titulo: 'Anatomía Manga',
                descripcion: 'Proporciones específicas del estilo manga.',
                niveles: [
                  { numero: 1, titulo: 'Cabeza', descripcion: 'Estructura básica' }
                ]
              }
            ]
          },
          {
            numero: 2,
            titulo: 'Módulo 2 - Expresiones',
            lecciones: [
              {
                numero: 1,
                titulo: 'Ojos Expresivos',
                descripcion: 'El alma del manga está en los ojos.',
                niveles: [
                  { numero: 1, titulo: 'Estilos', descripcion: 'Diferentes tipos de ojos' }
                ]
              }
            ]
          },
          {
            numero: 3,
            titulo: 'Módulo 3 - Diseño de Personajes',
            lecciones: [
              {
                numero: 1,
                titulo: 'Personalidad en el Diseño',
                descripcion: 'Crea personajes únicos y memorables.',
                niveles: [
                  { numero: 1, titulo: 'Concepto', descripcion: 'Brainstorming' }
                ]
              }
            ]
          },
          {
            numero: 4,
            titulo: 'Módulo 4 - Composición de Viñetas',
            lecciones: [
              {
                numero: 1,
                titulo: 'Estructura de Paneles',
                descripcion: 'Aprende a contar historias con viñetas.',
                niveles: [
                  { numero: 1, titulo: 'Layouts', descripcion: 'Distribución' }
                ]
              }
            ]
          },
          {
            numero: 5,
            titulo: 'Módulo 5 - Proyecto Final',
            lecciones: [
              {
                numero: 1,
                titulo: 'Tu Manga Corto',
                descripcion: 'Crea una corta historia manga original.',
                niveles: [
                  { numero: 1, titulo: 'Escritura', descripcion: 'Trama' }
                ]
              }
            ]
          }
        ]
      }
    };

    // Agregar contenido para cada curso
    for (const cursoId in contenidoCursos) {
      const curso = contenidoCursos[cursoId];
      console.log(`\n📖 Procesando: ${curso.nombre}`);

      for (const modulo of curso.modulos) {
        // Insertar o actualizar módulo
        try {
          await conn.query(
            'INSERT INTO modulos (curso_id, numero_modulo, titulo, descripcion) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE titulo = VALUES(titulo)',
            [cursoId, modulo.numero, modulo.titulo, `Contenido del ${modulo.titulo}`]
          );
          console.log(`  ✓ ${modulo.titulo}`);

          // Obtener ID del módulo
          const [moduloResult] = await conn.query(
            'SELECT id FROM modulos WHERE curso_id = ? AND numero_modulo = ?',
            [cursoId, modulo.numero]
          );
          const moduloId = moduloResult[0].id;

          // Insertar lecciones
          for (const leccion of modulo.lecciones) {
            try {
              await conn.query(
                'INSERT INTO lecciones (modulo_id, numero_leccion, titulo, descripcion) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE titulo = VALUES(titulo)',
                [moduloId, leccion.numero, leccion.titulo, leccion.descripcion]
              );

              // Obtener ID de la lección
              const [leccionResult] = await conn.query(
                'SELECT id FROM lecciones WHERE modulo_id = ? AND numero_leccion = ?',
                [moduloId, leccion.numero]
              );
              const leccionId = leccionResult[0].id;

              // Insertar niveles
              for (const nivel of leccion.niveles) {
                try {
                  await conn.query(
                    'INSERT INTO niveles (leccion_id, numero_nivel, titulo, descripcion) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE titulo = VALUES(titulo)',
                    [leccionId, nivel.numero, nivel.titulo, nivel.descripcion]
                  );
                } catch (e) {
                  if (e.code !== 'ER_DUP_ENTRY') throw e;
                }
              }
            } catch (e) {
              if (e.code !== 'ER_DUP_ENTRY') throw e;
            }
          }
        } catch (e) {
          if (e.code !== 'ER_DUP_ENTRY') throw e;
        }
      }
    }

    console.log('\n✅ CONTENIDO AGREGADO EXITOSAMENTE');
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    conn.release();
    await pool.end();
  }
}

poblarContenido().catch(console.error);
