const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const conexion = require('./config/conexion');

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- CONFIGURACIÓN DE RUTAS FIJAS ---
// Esto resuelve el error 404 de tus imágenes en la carpeta 'Java'
app.use('/Java', express.static(path.join(__dirname, 'Java')));

// Servir archivos estáticos (CSS, JS, HTML) desde la raíz
app.use(express.static(__dirname));

// Ruta principal: carga el index.html directamente sin redirecciones infinitas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================
// LÓGICA DE NEGOCIO Y API (Mantenida intacta)
// ============================================

function hashPassword(pass) {
    let hash = 0;
    for (let i = 0; i < pass.length; i++) {
        const char = pass.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
}

function generarToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

async function verificarToken(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ estado: 'error', mensaje: 'Token requerido' });
    try {
        const connection = await conexion.getConnection();
        const [sesion] = await connection.query('SELECT usuario_id FROM sesiones WHERE token = ? AND fecha_expiracion > NOW()', [token]);
        connection.release();
        if (sesion.length === 0) return res.status(401).json({ estado: 'error', mensaje: 'Token inválido o expirado' });
        req.usuarioId = sesion[0].usuario_id;
        next();
    } catch (error) {
        res.status(500).json({ estado: 'error', mensaje: 'Error al verificar token' });
    }
}

// ENDPOINTS DE AUTENTICACIÓN
app.post('/api/auth/login', async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const password = req.body.password?.trim();
        const connection = await conexion.getConnection();
        const [usuario] = await connection.query('SELECT id, nombre, email, password FROM usuarios WHERE LOWER(email) = ? AND activo = TRUE', [email]);
        connection.release();
        if (usuario.length === 0 || usuario[0].password !== hashPassword(password)) {
            return res.status(401).json({ estado: 'error', mensaje: 'Email o contraseña incorrectos' });
        }
        const token = generarToken();
        const fechaExpiracion = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const conn = await conexion.getConnection();
        await conn.query('INSERT INTO sesiones (usuario_id, token, fecha_expiracion) VALUES (?, ?, ?)', [usuario[0].id, token, fechaExpiracion]);
        conn.release();
        res.json({ estado: 'éxito', token, usuarioId: usuario[0].id, nombre: usuario[0].nombre });
    } catch (error) {
        res.status(500).json({ estado: 'error', mensaje: 'Error al iniciar sesión' });
    }
});

// (Aquí continúa todo tu código de cursos, progreso, certificados, inscripciones, etc.)
// ... (He mantenido toda tu lógica inferior, solo pégalo tal cual desde aquí)

// ... [PEGA AQUÍ EL RESTO DE TUS ENDPOINTS DE CURSOS, PROGRESO, ETC] ...

// Ruta final de inscripción
app.post('/api/inscripciones', async (req, res) => {
    const { correo, curso, metodo } = req.body;
    try {
        const connection = await conexion.getConnection();
        await connection.query('INSERT INTO inscripciones (correo_usuario, curso_nombre, metodo_pago, fecha_inscripcion) VALUES (?, ?, ?, NOW())', [correo, curso, metodo]);
        connection.release();
        res.json({ estado: 'éxito', mensaje: 'Inscripción simulada registrada correctamente' });
    } catch (error) {
        res.status(500).json({ estado: 'error', mensaje: 'No se pudo guardar la inscripción' });
    }
});

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ estado: 'error', mensaje: 'Ruta no encontrada' });
});

// Iniciar servidor
const BASE_PORT = Number(process.env.PORT) || 3001;
let currentPort = BASE_PORT;

function startServer(port) {
    const server = app.listen(port, () => console.log(`Servidor corriendo en http://localhost:${port}`));
    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            currentPort += 1;
            startServer(currentPort);
        } else {
            process.exit(1);
        }
    });
}
startServer(currentPort);