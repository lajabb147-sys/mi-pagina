# 📖 Instrucciones - Backend con Node.js

¡Hola Jhoan! Aquí tienes tu base de datos y backend completo para Zensei Art Academy.

## 📁 Estructura creada

```
Proyecto_Estructura_Jhoan/
├── index.html (Tu página principal)
├── estilos.css
└── backend/
    ├── config/
    │   └── conexion.js          ← Conexión a la BD
    ├── controllers/
    │   └── CursoController.js   ← Lógica de cursos
    ├── models/
    │   ├── Curso.js             ← Modelo de cursos
    │   └── Usuario.js           ← Modelo de usuarios
    ├── routes/
    │   └── cursos.js            ← Rutas de API
    ├── server.js                ← Servidor principal ⭐
    ├── package.json             ← Dependencias
    ├── .env                     ← Variables de entorno
    ├── .gitignore               ← Archivos a ignorar
    ├── database.sql             ← Script de BD
    ├── ejemplo-frontend.html    ← Ejemplo de uso
    └── README.md                ← Documentación
```

## ⚙️ Paso 1: Instalar MySQL

1. Descarga MySQL desde: https://www.mysql.com/downloads/
2. Instálalo en tu computadora
3. Anota la contraseña que estableciste

## 📦 Paso 2: Instalar Node.js

1. Descarga Node.js desde: https://nodejs.org/
2. Instálalo (elige la versión LTS)
3. Verifica la instalación abriendo una terminal y ejecuta:
   ```
   node --version
   npm --version
   ```

## 🗄️ Paso 3: Crear la base de datos

### Opción A: Con MySQL Workbench (más fácil)

1. Abre MySQL Workbench
2. Copia el contenido de `backend/database.sql`
3. Pégalo en MySQL Workbench
4. Presiona `Ctrl + Enter` para ejecutar

### Opción B: Con terminal

1. Abre la terminal (PowerShell en Windows)
2. Ve a la carpeta del proyecto:
   ```
   cd "C:\Users\tu_usuario\OneDrive\Pictures\Desktop\Proyecto_Estructura_Jhoan\backend"
   ```
3. Ejecuta:
   ```
   mysql -u root -p < database.sql
   ```
4. Ingresa tu contraseña de MySQL

## 🔧 Paso 4: Configurar las variables de entorno

1. Abre el archivo `backend/.env`
2. Completa tus credenciales:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_contraseña_de_mysql
   DB_NAME=zensei_academy
   DB_PORT=3306
   NODE_ENV=development
   ```

## 📥 Paso 5: Instalar dependencias

1. Abre la terminal en la carpeta `backend/`
2. Ejecuta:
   ```
   npm install
   ```

Este comando instalará todas las librerías necesarias en la carpeta `node_modules/`

## ▶️ Paso 6: Iniciar el servidor

En la carpeta `backend/`, ejecuta uno de estos comandos:

**Modo desarrollo (con recarga automática):**
```
npm run dev
```

**Modo producción:**
```
npm start
```

Si todo está bien, verás esto:
```
╔════════════════════════════════════════╗
║  🎨 ZENSEI ART ACADEMY - BACKEND 🎨  ║
║  Servidor corriendo en puerto 5000      ║
║  URL: http://localhost:5000            ║
╚════════════════════════════════════════╝
```

## 🧪 Paso 7: Probar la API

Abre tu navegador y visita:
- **Prueba rápida:** http://localhost:5000/api/test
- **Ver cursos:** http://localhost:5000/api/cursos
- **Ver usuarios:** http://localhost:5000/api/usuarios

## 🌐 Paso 8: Usar el ejemplo del frontend

1. Abre `backend/ejemplo-frontend.html` en tu navegador
2. Verás los cursos que cargaron de la base de datos
3. Puedes crear, ver y eliminar cursos desde ahí

## 📡 Endpoints disponibles

### Cursos
```
GET    /api/cursos              - Obtener todos los cursos
GET    /api/cursos/:id          - Obtener un curso específico
POST   /api/cursos              - Crear un nuevo curso
PUT    /api/cursos/:id          - Actualizar un curso
DELETE /api/cursos/:id          - Eliminar un curso
```

### Usuarios
```
GET    /api/usuarios            - Obtener todos los usuarios
```

## 📝 Ejemplo: Crear un curso con JavaScript

```javascript
const nuevosCurso = {
  nombre: "Ilustración Digital",
  descripcion: "Aprende a ilustrar digitalmente",
  precio: 59.99,
  imagen: "ilustracion.jpg"
};

fetch('http://localhost:5000/api/cursos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(nuevosCurso)
})
.then(response => response.json())
.then(data => console.log(data));
```

## ✅ Verificación: ¿Todo funciona?

1. ✓ MySQL está corriendo
2. ✓ Ejecutaste `npm install` en la carpeta `backend/`
3. ✓ El servidor está activo (`npm run dev`)
4. ✓ Puedes acceder a http://localhost:5000/api/test
5. ✓ Puedes ver http://localhost:5000/api/cursos

Si todo esto funciona, ¡estás listo! 🎉

## 🆘 Solución de problemas

### Error: "Cannot find module 'express'"
```bash
npm install
```

### Error: "connect ECONNREFUSED 127.0.0.1:3306"
- MySQL no está corriendo
- Verifica las credenciales en `.env`
- Abre Services (Windows) y activa MySQL

### Error: "ER_ACCESS_DENIED_FOR_USER"
- La contraseña en `.env` es incorrecta
- Actualiza `DB_PASSWORD` en `.env`

### Error: "Port 5000 already in use"
- Otro programa usa el puerto 5000
- Cambia en `.env`: `PORT=3001`

## 📚 Próximas funcionalidades

Puedes agregar:
- ✨ Autenticación de usuarios (login/registro)
- 📸 Subida de imágenes
- 💳 Sistema de pagos
- ⭐ Sistema de reseñas
- 📧 Confirmación por email

## 📞 Archivos importantes

- **server.js** - El corazón del backend
- **conexion.js** - Comunica con la base de datos
- **package.json** - Lista de programas que necesitas
- **.env** - Tu configuración secreta

¡Cualquier pregunta, avísame! 🚀
