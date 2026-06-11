# Conexión Login con Backend

## 📝 Configuración realizada

Tu formulario de login en `java/index.html` ahora está conectado con el backend Node.js.

### ✅ Cambios implementados:

1. **HTML actualizado:**
   - Input para email: `<input type="email" name="email">`
   - Input para contraseña: `<input type="password" name="password">`
   - Formulario con ID: `id="loginForm"`

2. **JavaScript integrado:**
   - Verifica si hay sesión activa al cargar la página
   - Envía credenciales a `/api/auth/login` (POST)
   - Guarda token, usuarioId y nombre en localStorage
   - Redirige a página principal si login es exitoso

3. **Flujo de autenticación:**
   ```
   Usuario escribe email/contraseña
         ↓
   Click "Entrar"
         ↓
   POST /api/auth/login
         ↓
   Backend verifica en MySQL
         ↓
   Si es correcto: devuelve token + datos
         ↓
   Guarda token en localStorage
         ↓
   Redirige a ../index.html (página principal)
   ```

## 🔧 Credenciales de prueba:

- **Email:** demo@zensei.com
- **Contraseña:** demo123

## 📍 URLs importantes:

- **Login:** http://localhost:3001/java/index.html
- **Página principal:** http://localhost:3001/index.html
- **API Login endpoint:** POST http://localhost:3001/api/auth/login

## 💾 Datos guardados en localStorage:

- `token` - Token de sesión para autenticación
- `usuarioId` - ID del usuario en la BD
- `usuarioLogueado` - Nombre del usuario
- `recordarSesion` - Preferencia de recordar sesión (si está marcado)

## 🔒 Backend (Node.js + MySQL)

El servidor está corriendo en puerto 3001 con:
- Tabla `usuarios` con email y contraseña hasheada
- Tabla `sesiones` para tokens
- Endpoint `/api/auth/login` para autenticación
- Endpoint `/api/auth/logout` para cerrar sesión

## ⚙️ Próximos pasos:

1. Crear función de registro (similar a login)
2. Implementar "Olvidé mi contraseña"
3. Agregar validación de email
4. Usar bcrypt para hash seguro de contraseñas (en producción)
