// EJEMPLOS DE REQUESTS PARA LA API
// Copiar y pegar en la consola del navegador (F12)

// ═══════════════════════════════════════════════════════════════
// PRUEBAS RÁPIDAS
// ═══════════════════════════════════════════════════════════════

// 1. Verificar que el servidor está funcionando
fetch('http://localhost:5000/api/test')
  .then(res => res.json())
  .then(data => console.log('✅ Servidor activo:', data));

// 2. Obtener todos los cursos
fetch('http://localhost:5000/api/cursos')
  .then(res => res.json())
  .then(data => console.log('📚 Cursos:', data));

// 3. Obtener un curso específico (ID 1)
fetch('http://localhost:5000/api/cursos/1')
  .then(res => res.json())
  .then(data => console.log('📖 Curso 1:', data));

// ═══════════════════════════════════════════════════════════════
// CREAR NUEVO CURSO
// ═══════════════════════════════════════════════════════════════

fetch('http://localhost:5000/api/cursos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nombre: 'Ilustración Digital Profesional',
    descripcion: 'Aprende a crear ilustraciones digitales de nivel profesional con técnicas avanzadas',
    precio: 79.99,
    imagen: 'ilustracion_profesional.jpg'
  })
})
  .then(res => res.json())
  .then(data => console.log('✨ Curso creado:', data));

// ═══════════════════════════════════════════════════════════════
// ACTUALIZAR UN CURSO
// ═══════════════════════════════════════════════════════════════

fetch('http://localhost:5000/api/cursos/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nombre: 'Lineart Minimalista - Actualizado',
    descripcion: 'El poder de la simplicidad. Aprende a definir figuras',
    precio: 29.99,
    imagen: 'lineart_minimalista_v2.jpg'
  })
})
  .then(res => res.json())
  .then(data => console.log('🔄 Curso actualizado:', data));

// ═══════════════════════════════════════════════════════════════
// ELIMINAR UN CURSO
// ═══════════════════════════════════════════════════════════════

fetch('http://localhost:5000/api/cursos/4', {
  method: 'DELETE'
})
  .then(res => res.json())
  .then(data => console.log('🗑️ Curso eliminado:', data));

// ═══════════════════════════════════════════════════════════════
// OBTENER USUARIOS
// ═══════════════════════════════════════════════════════════════

fetch('http://localhost:5000/api/usuarios')
  .then(res => res.json())
  .then(data => console.log('👥 Usuarios:', data));

// ═══════════════════════════════════════════════════════════════
// EJEMPLOS EN JAVASCRIPT CON FUNCIONES
// ═══════════════════════════════════════════════════════════════

const API = 'http://localhost:5000/api';

// Función para obtener todos los cursos
async function obtenerCursos() {
  try {
    const res = await fetch(`${API}/cursos`);
    const data = await res.json();
    console.log('Cursos:', data.datos);
    return data.datos;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Función para crear un curso
async function crearCurso(nombre, descripcion, precio, imagen = null) {
  try {
    const res = await fetch(`${API}/cursos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, descripcion, precio, imagen })
    });
    const data = await res.json();
    console.log('Curso creado:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Función para actualizar un curso
async function actualizarCurso(id, nombre, descripcion, precio, imagen = null) {
  try {
    const res = await fetch(`${API}/cursos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, descripcion, precio, imagen })
    });
    const data = await res.json();
    console.log('Curso actualizado:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Función para eliminar un curso
async function eliminarCurso(id) {
  try {
    const res = await fetch(`${API}/cursos/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    console.log('Curso eliminado:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// ═══════════════════════════════════════════════════════════════
// CÓMO USAR LAS FUNCIONES
// ═══════════════════════════════════════════════════════════════

// Obtener cursos
// obtenerCursos();

// Crear un nuevo curso
// crearCurso('Mi nuevo curso', 'Descripción del curso', 49.99, 'imagen.jpg');

// Actualizar un curso (ID 1)
// actualizarCurso(1, 'Nombre actualizado', 'Nueva descripción', 59.99);

// Eliminar un curso (ID 1)
// eliminarCurso(1);

// ═══════════════════════════════════════════════════════════════
// EJEMPLO COMPLETO CON PROMESAS
// ═══════════════════════════════════════════════════════════════

Promise.all([
  fetch(`${API}/cursos`).then(r => r.json()),
  fetch(`${API}/usuarios`).then(r => r.json())
])
  .then(([cursos, usuarios]) => {
    console.log('Cursos disponibles:', cursos.datos);
    console.log('Usuarios registrados:', usuarios.datos);
  })
  .catch(error => console.error('Error:', error));

// ═══════════════════════════════════════════════════════════════
// MANEJO DE ERRORES
// ═══════════════════════════════════════════════════════════════

async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    
    if (data.estado === 'error') {
      throw new Error(data.mensaje);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// Usar safeFetch
// safeFetch(`${API}/cursos`)
//   .then(data => console.log('✅ Éxito:', data))
//   .catch(error => console.error('❌ Error capturado'));

// ═══════════════════════════════════════════════════════════════
// TIPS ÚTILES
// ═══════════════════════════════════════════════════════════════

/*
1. Abre la Consola del Navegador (F12)
2. Ve a la pestaña "Console"
3. Copia y pega uno de estos ejemplos
4. Presiona Enter

Para agregar a tu HTML:
<script>
  const API = 'http://localhost:5000/api';
  
  async function cargarCursos() {
    const res = await fetch(`${API}/cursos`);
    const data = await res.json();
    console.log(data.datos);
  }
  
  // Llamar cuando cargue la página
  document.addEventListener('DOMContentLoaded', cargarCursos);
</script>
*/
