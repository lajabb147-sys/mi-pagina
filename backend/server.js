const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const conexion = require('./config/conexion');
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- ARCHIVOS ESTÁTICOS ---
app.use(express.static(__dirname));
app.use('/Java', express.static(path.join(__dirname, 'Java')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- FUNCIONES DE SEGURIDAD ---
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

// --- API DE AUTENTICACIÓN ---
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
        const conn = await conexion.getConnection();
        await conn.query('INSERT INTO sesiones (usuario_id, token, fecha_expiracion) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))', [usuario[0].id, token]);
        conn.release();
        res.json({ estado: 'éxito', token, usuarioId: usuario[0].id, nombre: usuario[0].nombre });
    } catch (error) {
        res.status(500).json({ estado: 'error', mensaje: 'Error al iniciar sesión' });
    }
});

/// --- API DE CURSOS (Simplificada para descartar errores) ---
app.get('/api/cursos', (req, res) => {
    // Intentamos hacer la consulta a la BD
    conexion.getConnection()
        .then(connection => {
            return connection.query('SELECT * FROM cursos')
                .then(([results]) => {
                    connection.release();
                    res.json({ estado: 'éxito', datos: results });
                });
        })
        .catch(error => {
            console.error("Error BD:", error);
            res.status(500).json({ estado: 'error', mensaje: error.message });
        });
});

// --- API DE INSCRIPCIONES ---
app.post('/api/inscripciones', async (req, res) => {
    const { correo, curso, metodo } = req.body;
    try {
        const connection = await conexion.getConnection();
        await connection.query('INSERT INTO inscripciones (correo_usuario, curso_nombre, metodo_pago, fecha_inscripcion) VALUES (?, ?, ?, NOW())', [correo, curso, metodo]);
        connection.release();
        res.json({ estado: 'éxito', mensaje: 'Inscripción registrada' });
    } catch (error) {
        res.status(500).json({ estado: 'error', mensaje: 'No se pudo guardar la inscripción' });
    }
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor completo corriendo en http://localhost:${PORT}`);
});