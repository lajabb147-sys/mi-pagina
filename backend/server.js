// Importar dependencias
const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Importar conexión
const conexion = require('./config/conexion');

// Crear aplicación Express
const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
// ====== AGREGA ESTA LÍNEA PARA QUE EXPRESS RECONOZCA TU CARPETA JAVA ======
app.use('/Java', express.static(path.join(__dirname, '..', 'Java')));
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos: la página original está en el directorio padre
const rootPublicPath = path.join(__dirname, '..');
app.use(express.static(rootPublicPath));

// Servir también archivos del backend (pago.html, curso.html, etc)
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.redirect('/frontend/html/index.html');
});

// ============================================
// MIDDLEWARE DE AUTENTICACIÓN
// ============================================

// Hash simple (para demo - en producción usar bcrypt)
function hashPassword(pass) {
  let hash = 0;
  for (let i = 0; i < pass.length; i++) {
    const char = pass.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

// Generar token simple
function generarToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Middleware para verificar token
async function verificarToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      estado: 'error',
      mensaje: 'Token requerido'
    });
  }

  try {
    const connection = await conexion.getConnection();
    const [sesion] = await connection.query(
      'SELECT usuario_id FROM sesiones WHERE token = ? AND fecha_expiracion > NOW()',
      [token]
    );
    connection.release();

    if (sesion.length === 0) {
      return res.status(401).json({
        estado: 'error',
        mensaje: 'Token inválido o expirado'
      });
    }

    req.usuarioId = sesion[0].usuario_id;
    next();
  } catch (error) {
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error al verificar token'
    });
  }
}

// ============================================
// ENDPOINTS DE AUTENTICACIÓN
// ============================================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    if (!email || !password) {
      return res.status(400).json({
        estado: 'error',
        mensaje: 'Email y contraseña requeridos'
      });
    }

    const connection = await conexion.getConnection();
    const [usuario] = await connection.query(
      'SELECT id, nombre, email, password FROM usuarios WHERE LOWER(email) = ? AND activo = TRUE',
      [email]
    );
    connection.release();

    if (usuario.length === 0) {
      return res.status(401).json({
        estado: 'error',
        mensaje: 'Email o contraseña incorrectos'
      });
    }

    // Verificar contraseña (hash simple)
    const passwordHash = hashPassword(password);
    if (usuario[0].password !== passwordHash) {
      return res.status(401).json({
        estado: 'error',
        mensaje: 'Email o contraseña incorrectos'
      });
    }

    // Crear sesión y token
    const token = generarToken();
    const fechaExpiracion = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

    const conn = await conexion.getConnection();
    await conn.query(
      'INSERT INTO sesiones (usuario_id, token, fecha_expiracion) VALUES (?, ?, ?)',
      [usuario[0].id, token, fechaExpiracion]
    );
    conn.release();

    res.json({
      estado: 'éxito',
      mensaje: 'Sesión iniciada correctamente',
      token: token,
      usuarioId: usuario[0].id,
      nombre: usuario[0].nombre
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error al iniciar sesión',
      detalles: error.message
    });
  }
});

// Registro
app.post('/api/auth/registro', async (req, res) => {
  try {
    const nombre = req.body.nombre?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();

    if (!nombre || !email || !password) {
      return res.status(400).json({
        estado: 'error',
        mensaje: 'Nombre, email y contraseña requeridos'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        estado: 'error',
        mensaje: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    const connection = await conexion.getConnection();
    
    // Verificar si email ya existe
    const [usuarioExistente] = await connection.query(
      'SELECT id FROM usuarios WHERE LOWER(email) = ?',
      [email]
    );

    if (usuarioExistente.length > 0) {
      connection.release();
      return res.status(400).json({
        estado: 'error',
        mensaje: 'El email ya está registrado'
      });
    }

    // Crear nuevo usuario
    const passwordHash = hashPassword(password);
    const [resultado] = await connection.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
      [nombre, email, passwordHash]
    );
    connection.release();

    res.status(201).json({
      estado: 'éxito',
      mensaje: 'Cuenta creada correctamente',
      usuarioId: resultado.insertId
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error al registrarse',
      detalles: error.message
    });
  }
});

// Verificar autenticación
app.get('/api/auth/verificar', verificarToken, async (req, res) => {
  try {
    const connection = await conexion.getConnection();
    const [usuario] = await connection.query(
      'SELECT id, nombre, email FROM usuarios WHERE id = ?',
      [req.usuarioId]
    );
    connection.release();

    if (usuario.length === 0) {
      return res.status(404).json({
        estado: 'error',
        mensaje: 'Usuario no encontrado'
      });
    }

    res.json({
      estado: 'éxito',
      datos: usuario[0]
    });
  } catch (error) {
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error al verificar autenticación'
    });
  }
});

// Logout
app.post('/api/auth/logout', verificarToken, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const connection = await conexion.getConnection();
    await connection.query('DELETE FROM sesiones WHERE token = ?', [token]);
    connection.release();

    res.json({
      estado: 'éxito',
      mensaje: 'Sesión cerrada'
    });
  } catch (error) {
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error al cerrar sesión'
    });
  }
});

// Puerto
const BASE_PORT = Number(process.env.PORT) || 3001;
let currentPort = BASE_PORT;

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ 
    mensaje: 'Servidor de Zensei Art Academy funcionando correctamente',
    versión: '1.0.0'
  });
});

// Ruta para obtener todos los cursos
app.get('/api/cursos', async (req, res) => {
  try {
    const connection = await conexion.getConnection();
    const [cursos] = await connection.query('SELECT * FROM cursos');
    connection.release();
    
    res.json({
      estado: 'éxito',
      datos: cursos
    });
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error al obtener cursos',
      detalles: error.message
    });
  }
});

// Ruta para obtener un curso por ID
app.get('/api/cursos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await conexion.getConnection();
    const [curso] = await connection.query('SELECT * FROM cursos WHERE id = ?', [id]);
    connection.release();
    
    if (curso.length === 0) {
      return res.status(404).json({
        estado: 'error',
        mensaje: 'Curso no encontrado'
      });
    }
    
    res.json({
      estado: 'éxito',
      datos: curso[0]
    });
  } catch (error) {
    console.error('Error al obtener curso:', error);
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error al obtener curso',
      detalles: error.message
    });
  }
});

// Ruta para crear un nuevo curso
app.post('/api/cursos', async (req, res) => {
  try {
    const { nombre, descripcion, precio, imagen } = req.body;
    
    if (!nombre || !descripcion || !precio) {
      return res.status(400).json({
        estado: 'error',
        mensaje: 'Faltan datos requeridos'
      });
    }
    
    const connection = await conexion.getConnection();
    const [resultado] = await connection.query(
      'INSERT INTO cursos (nombre, descripcion, precio, imagen) VALUES (?, ?, ?, ?)',
      [nombre, descripcion, precio, imagen || null]
    );
    connection.release();
    
    res.status(201).json({
      estado: 'éxito',
      mensaje: 'Curso creado correctamente',
      id: resultado.insertId
    });
  } catch (error) {
    console.error('Error al crear curso:', error);
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error al crear curso',
      detalles: error.message
    });
  }
});

// Ruta para actualizar un curso
app.put('/api/cursos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, imagen } = req.body;
    
    const connection = await conexion.getConnection();
    const [resultado] = await connection.query(
      'UPDATE cursos SET nombre = ?, descripcion = ?, precio = ?, imagen = ? WHERE id = ?',
      [nombre, descripcion, precio, imagen || null, id]
    );
    connection.release();
    
    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        estado: 'error',
        mensaje: 'Curso no encontrado'
      });
    }
    
    res.json({
      estado: 'éxito',
      mensaje: 'Curso actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar curso:', error);
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error al actualizar curso',
      detalles: error.message
    });
  }
});

// Ruta para eliminar un curso
app.delete('/api/cursos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const connection = await conexion.getConnection();
    const [resultado] = await connection.query('DELETE FROM cursos WHERE id = ?', [id]);
    connection.release();
    
    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        estado: 'error',
        mensaje: 'Curso no encontrado'
      });
    }
    
    res.json({
      estado: 'éxito',
      mensaje: 'Curso eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar curso:', error);
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error al eliminar curso',
      detalles: error.message
    });
  }
});

// Ruta para obtener usuarios registrados
app.get('/api/usuarios', async (req, res) => {
  try {
    const connection = await conexion.getConnection();
    const [usuarios] = await connection.query('SELECT id, nombre, email, fecha_registro FROM usuarios');
    connection.release();
    
    res.json({
      estado: 'éxito',
      datos: usuarios
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error al obtener usuarios',
      detalles: error.message
    });
  }
});

// ============================================
// NUEVOS ENDPOINTS: PLATAFORMA DE CURSOS
// ============================================

// Verificar acceso a curso (si está pagado)
app.get('/api/acceso-curso/:usuarioId/:cursoId', async (req, res) => {
  // Eliminado el flujo de pago: todos los cursos son accesibles directamente.
  // Esto simplifica la plataforma para que no exista un proceso de compra.
  res.json({
    estado: 'éxito',
    acceso: true,
    pagado: true
  });
});

// Comprar curso (simular pago)
app.post('/api/comprar-curso', async (req, res) => {
  // Pago eliminado: respondemos éxito sin realizar transacción.
  // Mantener el endpoint por compatibilidad, pero no realiza cambios en la DB.
  res.json({
    estado: 'éxito',
    mensaje: 'Pago eliminado: acceso concedido automáticamente',
    acceso: true
  });
});

// Obtener progreso del usuario en un curso
app.get('/api/progreso/:usuarioId/:cursoId', async (req, res) => {
  try {
    const { usuarioId, cursoId } = req.params;
    const connection = await conexion.getConnection();
    const [progreso] = await connection.query(
      'SELECT * FROM progreso_curso WHERE usuario_id = ? AND curso_id = ?',
      [usuarioId, cursoId]
    );
    connection.release();
    
    if (progreso.length === 0) {
      const [insertResult] = await connection.query(
        'INSERT INTO progreso_curso (usuario_id, curso_id, modulo_actual, leccion_actual, nivel_actual, porcentaje) VALUES (?, ?, 1, 1, 1, 0)',
        [usuarioId, cursoId]
      );

      const [nuevoProgreso] = await connection.query(
        'SELECT * FROM progreso_curso WHERE id = ?',
        [insertResult.insertId]
      );
      connection.release();

      return res.json({
        estado: 'éxito',
        datos: nuevoProgreso[0]
      });
    }

    connection.release();
    res.json({
      estado: 'éxito',
      datos: progreso[0]
    });
  } catch (error) {
    console.error('Error al obtener progreso:', error);
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error al obtener progreso',
      detalles: error.message
    });
  }
});

// Actualizar progreso del usuario
app.put('/api/progreso', async (req, res) => {
  try {
    const { usuarioId, cursoId, moduloActual, leccionActual, nivelActual, porcentaje } = req.body;
    
    if (!usuarioId || !cursoId) {
      return res.status(400).json({
        estado: 'error',
        mensaje: 'Faltan datos requeridos'
      });
    }
    
    const connection = await conexion.getConnection();
    const [resultado] = await connection.query(
      'UPDATE progreso_curso SET modulo_actual = ?, leccion_actual = ?, nivel_actual = ?, porcentaje = ? WHERE usuario_id = ? AND curso_id = ?',
      [moduloActual || 1, leccionActual || 1, nivelActual || 1, porcentaje || 0, usuarioId, cursoId]
    );
    connection.release();
    
    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        estado: 'error',
        mensaje: 'Progreso no encontrado'
      });
    }
    
    res.json({
      estado: 'éxito',
      mensaje: 'Progreso actualizado'
    });
  } catch (error) {
    console.error('Error al actualizar progreso:', error);
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error al actualizar progreso',
      detalles: error.message
    });
  }
});

// Obtener módulos de un curso
app.get('/api/modulos/:cursoId', async (req, res) => {
  try {
    const { cursoId } = req.params;
    const connection = await conexion.getConnection();
    const [modulos] = await connection.query(
      'SELECT * FROM modulos WHERE curso_id = ? ORDER BY numero_modulo',
      [cursoId]
    );
    connection.release();
    
    res.json({
      estado: 'éxito',
      datos: modulos
    });
  } catch (error) {
    console.error('Error al obtener módulos:', error);
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error al obtener módulos',
      detalles: error.message
    });
  }
});

// Obtener lecciones de un módulo
app.get('/api/lecciones/:moduloId', async (req, res) => {
  try {
    const { moduloId } = req.params;
    const connection = await conexion.getConnection();
    const [lecciones] = await connection.query(
      'SELECT * FROM lecciones WHERE modulo_id = ? ORDER BY numero_leccion',
      [moduloId]
    );
    connection.release();
    
    res.json({
      estado: 'éxito',
      datos: lecciones
    });
  } catch (error) {
    console.error('Error al obtener lecciones:', error);
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error al obtener lecciones',
      detalles: error.message
    });
  }
});

// Obtener niveles de una lección
app.get('/api/niveles/:leccionId', async (req, res) => {
  try {
    const { leccionId } = req.params;
    const connection = await conexion.getConnection();
    const [niveles] = await connection.query(
      'SELECT * FROM niveles WHERE leccion_id = ? ORDER BY numero_nivel',
      [leccionId]
    );
    connection.release();
    
    res.json({
      estado: 'éxito',
      datos: niveles
    });
  } catch (error) {
    console.error('Error al obtener niveles:', error);
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error al obtener niveles',
      detalles: error.message
    });
  }
});

// Generar certificado (si completó el curso)
app.post('/api/certificado', async (req, res) => {
  try {
    const { usuarioId, cursoId } = req.body;
    
    if (!usuarioId || !cursoId) {
      return res.status(400).json({
        estado: 'error',
        mensaje: 'Faltan datos requeridos'
      });
    }
    
    const connection = await conexion.getConnection();
    
    // Verificar que completó el curso (100% progreso)
    const [progreso] = await connection.query(
      'SELECT porcentaje FROM progreso_curso WHERE usuario_id = ? AND curso_id = ?',
      [usuarioId, cursoId]
    );
    
    if (progreso.length === 0 || progreso[0].porcentaje < 100) {
      connection.release();
      return res.status(400).json({
        estado: 'error',
        mensaje: 'El usuario no ha completado el curso (debe estar 100% completado)'
      });
    }
    
    // Generar código único
    const codigo = `ZENSEI-${cursoId}-${usuarioId}-${Date.now()}`;
    
    // Buscar si ya existe certificado
    const [existente] = await connection.query(
      'SELECT * FROM certificados WHERE usuario_id = ? AND curso_id = ?',
      [usuarioId, cursoId]
    );
    
    if (existente.length > 0) {
      connection.release();
      return res.json({
        estado: 'éxito',
        datos: existente[0],
        mensaje: 'Certificado ya existe'
      });
    }
    
    // Crear nuevo certificado
    const [resultado] = await connection.query(
      'INSERT INTO certificados (usuario_id, curso_id, codigo_certificado) VALUES (?, ?, ?)',
      [usuarioId, cursoId, codigo]
    );
    
    connection.release();
    
    res.json({
      estado: 'éxito',
      mensaje: 'Certificado generado correctamente',
      id: resultado.insertId,
      codigo_certificado: codigo
    });
  } catch (error) {
    console.error('Error al generar certificado:', error);
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error al generar certificado',
      detalles: error.message
    });
  }
});

// Obtener certificado por código
app.get('/api/certificado/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const connection = await conexion.getConnection();
    const [certificado] = await connection.query(
      'SELECT c.*, u.nombre as usuario_nombre, cu.nombre as curso_nombre FROM certificados c JOIN usuarios u ON c.usuario_id = u.id JOIN cursos cu ON c.curso_id = cu.id WHERE c.codigo_certificado = ?',
      [codigo]
    );
    connection.release();
    
    if (certificado.length === 0) {
      return res.status(404).json({
        estado: 'error',
        mensaje: 'Certificado no encontrado'
      });
    }
    
    res.json({
      estado: 'éxito',
      datos: certificado[0]
    });
  } catch (error) {
    console.error('Error al obtener certificado:', error);
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error al obtener certificado',
      detalles: error.message
    });
  }
});

// Ruta administrativa para restaurar los cursos faltantes sin eliminar datos existentes
app.post('/api/admin/restaurar-cursos', async (req, res) => {
  try {
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

    const connection = await conexion.getConnection();
    const restaurados = [];

    for (const curso of cursosPorDefecto) {
      const [existente] = await connection.query(
        'SELECT id FROM cursos WHERE nombre = ?',
        [curso.nombre]
      );

      if (existente.length === 0) {
        const [resultado] = await connection.query(
          'INSERT INTO cursos (nombre, descripcion, precio, imagen) VALUES (?, ?, ?, ?)',
          [curso.nombre, curso.descripcion, curso.precio, curso.imagen]
        );
        restaurados.push({ id: resultado.insertId, nombre: curso.nombre });
      }
    }

    const [cursos] = await connection.query('SELECT * FROM cursos ORDER BY id');
    connection.release();

    res.json({
      estado: 'éxito',
      restaurados,
      cursos
    });
  } catch (error) {
    console.error('Error al restaurar cursos:', error);
    res.status(500).json({
      estado: 'error',
      mensaje: 'Error al restaurar cursos',
      detalles: error.message
    });
  }
});

// ======================================================================
// 💳 RUTA DIRECTA PARA ENTRAR A LA PASARELA DE PAGO (ZENSEI ART ACADEMY)
// ======================================================================
app.get('/Java/pago.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'pago.html'));
});
// ======================================================================
// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    estado: 'error',
    mensaje: 'Ruta no encontrada'
  });
});

// Iniciar servidor con fallback cuando el puerto está ocupado
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`
  ╔════════════════════════════════════════╗
  ║  🎨 ZENSEI ART ACADEMY - BACKEND 🎨  ║
  ║  Servidor corriendo en puerto ${port}      ║
  ║  URL: http://localhost:${port}          ║
  ╚════════════════════════════════════════╝
  `);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.warn(`⚠️ El puerto ${port} ya está en uso.`);
      if (port === BASE_PORT) {
        currentPort += 1;
        console.log(`Intentando con el siguiente puerto disponible: ${currentPort}`);
        startServer(currentPort);
      } else {
        console.error(`❌ No se pudo iniciar el servidor. El puerto ${port} está ocupado.`);
        process.exit(1);
      }
    } else {
      console.error('❌ Error al iniciar el servidor:', error.message);
      process.exit(1);
    }
  });
}

startServer(currentPort);
