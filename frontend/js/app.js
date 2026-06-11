const BASE_API = 'http://localhost:3001/api';
const cursosGrid = document.getElementById('cursosGrid');
const detalleCard = document.getElementById('detalleCard');
const alertBox = document.getElementById('alertBox');
const usuarioIdElement = document.getElementById('usuario-id');

let cursos = [];
let cursoSeleccionado = null;
const usuarioId = localStorage.getItem('usuarioId') || '1';
if (usuarioIdElement) usuarioIdElement.textContent = usuarioId;

const imagenesPorCurso = {
  'Lineart Minimalista': '/minimalista_curso.jpg',
  'Realismo e Hiperrealismo': '/realismo_curso.jpg',
  'Manga y Anime Profesional': '/manga_curso.jpg',
  'Cartoon y Animación Tradicional': '/cartoon_curso.jpg'
};

window.addEventListener('DOMContentLoaded', iniciar);

async function iniciar() {
  const btnRecargar = document.getElementById('btnRecargar');
  const btnAyuda = document.getElementById('btnAyuda');

  if (btnRecargar) btnRecargar.addEventListener('click', cargarCursos);
  if (btnAyuda) btnAyuda.addEventListener('click', () => mostrarAlerta('Haz clic en cualquier curso para ver su detalle. Compra un curso o accede directamente al contenido.', 'info'));

  await cargarCursos();
}

function mostrarAlerta(mensaje, tipo = 'info') {
  if (!alertBox) return;
  alertBox.textContent = mensaje;
  alertBox.hidden = false;

  if (tipo === 'error') {
    alertBox.style.background = 'rgba(255, 93, 120, 0.12)';
    alertBox.style.border = '1px solid rgba(255, 93, 120, 0.3)';
    alertBox.style.color = '#ffdfe3';
  } else {
    alertBox.style.background = 'rgba(0, 229, 193, 0.12)';
    alertBox.style.border = '1px solid rgba(0, 229, 193, 0.25)';
    alertBox.style.color = '#d4f7eb';
  }

  setTimeout(() => { if (alertBox) alertBox.hidden = true; }, 6000);
}

async function cargarCursos() {
  if (!cursosGrid) return;
  cursosGrid.innerHTML = '<div class="curso-card placeholder">Cargando cursos...</div>';

  try {
    const response = await fetch(`${BASE_API}/cursos`);
    const data = await response.json();

    if (data.estado !== 'éxito') {
      throw new Error(data.mensaje || 'Error al obtener cursos');
    }

    cursos = Array.isArray(data.datos) ? data.datos : [];
    if (cursos.length === 0) {
      cursosGrid.innerHTML = '<div class="curso-card placeholder">No hay cursos disponibles.</div>';
      mostrarAlerta('No se encontraron cursos en el catálogo.', 'error');
      return;
    }

    renderCursos();
  } catch (error) {
    console.error(error);

    cursos = Array.isArray(window.CURSOS) ? window.CURSOS : [];
    if (cursos.length > 0) {
      mostrarAlerta('Catálogo cargado en modo estático. Verifica el servidor si deseas datos dinámicos.', 'error');
      renderCursos();
      return;
    }

    cursosGrid.innerHTML = '<div class="curso-card placeholder">No se pudieron cargar los cursos.</div>';
    mostrarAlerta('No se pudo cargar el catálogo. Revisa el servidor o la conexión a la base de datos.', 'error');
  }
}

function renderCursos() {
  if (!cursosGrid) return;
  cursosGrid.innerHTML = '';

  if (!Array.isArray(cursos) || cursos.length === 0) {
    cursosGrid.innerHTML = '<div class="curso-card placeholder">No hay cursos para mostrar.</div>';
    return;
  }

  cursos.forEach(curso => {
    const card = document.createElement('article');
    card.className = 'curso-card';

    const precio = Number(curso.precio || 0).toFixed(2);
    const tieneImagen = imagenesPorCurso[curso.nombre] || '../default_curso.jpg';
    const cursoId = curso.id;

    card.innerHTML = `
      <div class="curso-cover">
        <img src="${tieneImagen}" alt="${curso.nombre}" loading="lazy">
        <span class="curso-status">${curso.nombre && curso.nombre.includes('Cartoon') ? 'Nuevo' : 'Popular'}</span>
      </div>
      <div class="curso-card-body">
        <h3>${curso.nombre || 'Curso sin nombre'}</h3>
        <p>${curso.descripcion || 'Descripción no disponible.'}</p>
        <div class="curso-meta">
          <span class="curso-precio">$${precio}</span>
          <span>${curso.id > 0 ? 'Curso #' + curso.id : ''}</span>
        </div>
        <div class="curso-accion">
          <button type="button" onclick="seleccionarCurso(${cursoId})">Ver detalle</button>
          <button type="button" class="secondary" onclick="iniciarCompra(${cursoId})">Comprar</button>
        </div>
      </div>
    `;

    cursosGrid.appendChild(card);
  });
}

window.seleccionarCurso = async function(cursoId) {
  try {
    const response = await fetch(`${BASE_API}/cursos/${cursoId}`);
    const data = await response.json();

    if (data.estado !== 'éxito') {
      throw new Error(data.mensaje || 'No se encontró el curso');
    }

    cursoSeleccionado = data.datos;
    const tieneAcceso = await verificarAcceso(cursoSeleccionado.id);
    mostrarDetalle(cursoSeleccionado, tieneAcceso);
  } catch (error) {
    console.error(error);
    mostrarAlerta('No se pudo obtener el detalle del curso. Selecciona otro curso o recarga la página.', 'error');
  }
};

async function verificarAcceso(cursoId) {
  try {
    const response = await fetch(`${BASE_API}/acceso-curso/${usuarioId}/${cursoId}`);
    const data = await response.json();
    return data && data.acceso === true;
  } catch (error) {
    console.error('Error verificando acceso:', error);
    return false;
  }
}

function mostrarDetalle(curso, tieneAcceso = false) {
  if (!detalleCard) return;

  const precio = Number(curso.precio || 0).toFixed(2);
  const imagen = imagenesPorCurso[curso.nombre] || '../default_curso.jpg';

  detalleCard.innerHTML = `
    <div class="detalle-card-body">
      <div class="detalle-imagen">
        <img src="${imagen}" alt="${curso.nombre}" loading="lazy">
      </div>
      <div class="detalle-contenido">
        <h3>${curso.nombre || 'Curso sin nombre'}</h3>
        <p>${curso.descripcion || 'Descripción no disponible.'}</p>
        <div class="detalle-meta">
          <span class="curso-precio">Precio: $${precio}</span>
          <span>Curso #${curso.id || 'N/A'}</span>
        </div>
        <div class="detalle-acciones">
          <button type="button" onclick="abrirCurso(${curso.id})">${tieneAcceso ? 'Abrir curso' : 'Ver curso'}</button>
          ${tieneAcceso ? '' : `<button type="button" class="secondary" onclick="iniciarCompra(${curso.id})">Comprar</button>`}
        </div>
      </div>
    </div>
  `;
}

window.iniciarCompra = async function(cursoId) {
  try {
    const response = await fetch(`${BASE_API}/comprar-curso`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ usuarioId, cursoId })
    });

    const data = await response.json();
    if (data.estado !== 'éxito') {
      throw new Error(data.mensaje || 'Error al comprar curso');
    }

    mostrarAlerta('Acceso concedido. Ahora puedes abrir el curso.', 'info');
    abrirCurso(cursoId);
  } catch (error) {
    console.error(error);
    mostrarAlerta('No se pudo completar la compra. Intenta de nuevo más tarde.', 'error');
  }
};

function abrirCurso(cursoId) {
  window.location.href = `curso.html?id=${cursoId}`;
}
