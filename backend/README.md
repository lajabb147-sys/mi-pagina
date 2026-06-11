# 🎨 Zensei Art Academy - Backend

Sistema backend para la plataforma de cursos de arte Zensei Art Academy, construido con Node.js y Express.

## Estructura de carpetas

```
backend/
├── config/
│   └── conexion.js          # Configuración de conexión a MySQL
├── controllers/             # Controladores de lógica de negocio
├── routes/                  # Rutas de la API
├── models/                  # Modelos de datos
├── server.js               # Archivo principal del servidor
├── package.json            # Dependencias del proyecto
├── .env                    # Variables de entorno
├── database.sql            # Script para crear la base de datos
└── README.md               # Este archivo
```

## Requisitos previos

- **Node.js** (v14 o superior)
- **MySQL** (v5.7 o superior)
- **npm** o **yarn**

## Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar base de datos

#### Opción A: Usar el script SQL

```bash
# En MySQL Workbench o línea de comandos
mysql -u root -p < database.sql
```

#### Opción B: Crear manualmente

```sql
CREATE DATABASE zensei_academy;
USE zensei_academy;

-- Ejecuta el contenido de database.sql
```

### 3. Configurar variables de entorno

Edita el archivo `.env` con tus credenciales:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=zensei_academy
DB_PORT=3306
NODE_ENV=development
```

### 4. Iniciar el servidor

**Modo desarrollo (con Nodemon):**
```bash
npm run dev
```

**Modo producción:**
```bash
npm start
```

El servidor estará disponible en: `http://localhost:5000`

## Endpoints de la API

### Cursos

- **GET** `/api/cursos` - Obtener todos los cursos
- **GET** `/api/cursos/:id` - Obtener un curso por ID
- **POST** `/api/cursos` - Crear un nuevo curso
- **PUT** `/api/cursos/:id` - Actualizar un curso
- **DELETE** `/api/cursos/:id` - Eliminar un curso

### Usuarios

- **GET** `/api/usuarios` - Obtener todos los usuarios
- **POST** `/api/usuarios` - Registrar un nuevo usuario (próximamente)
- **GET** `/api/usuarios/:id` - Obtener un usuario por ID (próximamente)

### Prueba

- **GET** `/api/test` - Verificar que el servidor está funcionando

## Ejemplo de uso

### Obtener todos los cursos
```javascript
fetch('http://localhost:5000/api/cursos')
  .then(response => response.json())
  .then(data => console.log(data));
```

### Crear un nuevo curso
```javascript
fetch('http://localhost:5000/api/cursos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nombre: 'Ilustración Digital',
    descripcion: 'Aprende a ilustrar digitalmente',
    precio: 59.99,
    imagen: 'ilustracion_digital.jpg'
  })
})
  .then(response => response.json())
  .then(data => console.log(data));
```

## Tecnologías utilizadas

- **Express.js** - Framework web
- **MySQL2** - Cliente de MySQL con soporte para promesas
- **CORS** - Manejo de solicitudes cruzadas
- **dotenv** - Gestión de variables de entorno
- **Nodemon** - Recarga automática durante desarrollo

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto del servidor | 5000 |
| `DB_HOST` | Host de MySQL | localhost |
| `DB_USER` | Usuario de MySQL | root |
| `DB_PASSWORD` | Contraseña de MySQL | (vacía) |
| `DB_NAME` | Nombre de la base de datos | zensei_academy |
| `DB_PORT` | Puerto de MySQL | 3306 |
| `NODE_ENV` | Ambiente | development |

## Próximas mejoras

- [ ] Sistema de autenticación con JWT
- [ ] Validación de datos con Express Validator
- [ ] Controladores separados por recursos
- [ ] Manejo de errores mejorado
- [ ] Tests unitarios
- [ ] Documentación de API con Swagger
- [ ] Sistema de logs

## Solución de problemas

### Error: "Cannot find module 'express'"
```bash
npm install
```

### Error de conexión a MySQL
1. Verifica que MySQL esté corriendo
2. Comprueba las credenciales en `.env`
3. Asegúrate de que la base de datos existe

### Puerto 5000 ya está en uso
Cambia el puerto en `.env`:
```env
PORT=3001
```

## Licencia

MIT

## Contacto

Para soporte, contáctanos a través de Zensei Art Academy.
