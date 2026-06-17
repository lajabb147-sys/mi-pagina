const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const conexion = require('./config/conexion');
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- CONFIGURACIÓN DE RUTAS ---
// Servimos la carpeta 'Java' para que las imágenes sean accesibles
app.use('/Java', express.static(path.join(__dirname, 'Java')));
// Servir el resto de archivos estáticos (index.html, estilos, etc.)
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- API DE CURSOS (Consulta limpia) ---
app.get('/api/cursos', async (req, res) => {
    try {
        const connection = await conexion.getConnection();
        const [results] = await connection.query('SELECT * FROM cursos');
        connection.release();
        res.json({ estado: 'éxito', datos: results });
    } catch (error) {
        console.error("Error al obtener cursos:", error);
        res.status(500).json({ estado: 'error', mensaje: error.message });
    }
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