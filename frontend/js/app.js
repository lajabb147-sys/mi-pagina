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

// ======================================================================
// 🌐 SISTEMA DE TRADUCCIÓN DINÁMICA (GLOBAL)
// ======================================================================
const traducciones = {
  es: {
    tituloPasarela: "Procesar Pago",
    txtTarjeta: "Billetera Kash Nicaragua",
    txtBanco: "Transferencia LAFISE / BANPRO",
    txtMovil: "Billetera Móvil (Tigo Money / Claro Pay)",
    btnPagar: "Proceder al Pago",
    btnCancelar: "Cancelar",
    pagoExitoso: "¡Pago Completado!",
    txtExito: "Tu inscripción ha sido procesada de forma segura.",
    btnCursos: "Ir a mis Cursos",
    cursoManga: "Manga y Anime Profesional"
  },
  en: {
    tituloPasarela: "Process Payment",
    txtTarjeta: "Kash Wallet Nicaragua",
    txtBanco: "LAFISE / BANPRO Bank Transfer",
    txtMovil: "Mobile Wallet (Tigo Money / Claro Pay)",
    btnPagar: "Proceed to Pay",
    btnCancelar: "Cancel",
    pagoExitoso: "Payment Completed!",
    txtExito: "Your enrollment has been successfully processed.",
    btnCursos: "Go to my Courses",
    cursoManga: "Professional Manga & Anime"
  }
};

function cambiarIdioma(idioma) {
  localStorage.setItem('idiomaSeleccionado', idioma);
  const elementos = document.querySelectorAll('.traducible');
  elementos.forEach(el => {
    const texto = (idioma === 'en') ? el.getAttribute('data-en') : el.getAttribute('data-es');
    if (texto) el.innerText = texto;
  });
}

// ======================================================================
// LÓGICA PRINCIPAL
// ======================================================================

window.addEventListener('DOMContentLoaded', () => {
  iniciar();
  const idiomaGuardado = localStorage.getItem('idiomaSeleccionado') || 'es';
  cambiarIdioma(idiomaGuardado);
});

async function iniciar() {
  const btnRecargar = document.getElementById('btnRecargar');
  const btnAyuda = document.getElementById('btnAyuda');
  if (btnRecargar) btnRecargar.addEventListener('click', cargarCursos);
  if (btnAyuda) btnAyuda.addEventListener('click', () => mostrarAlerta('Haz clic en cualquier curso para ver su detalle.', 'info'));
  await cargarCursos();
}

function mostrarAlerta(mensaje, tipo = 'info') {
  if (!alertBox) return;
  alertBox.textContent = mensaje;
  alertBox.hidden = false;
  
  // Detección de modo claro
  const isLight = document.body.classList.contains('light-mode');

  if (tipo === 'error') {
    alertBox.style.background = 'rgba(255, 93, 120, 0.12)';
    alertBox.style.border = '1px solid rgba(255, 93, 120, 0.3)';
    alertBox.style.color = isLight ? '#8b0000' : '#ffdfe3';
  } else {
    alertBox.style.background = 'rgba(0, 229, 193, 0.12)';
    alertBox.style.border = '1px solid rgba(0, 229, 193, 0.25)';
    alertBox.style.color = isLight ? '#004d40' : '#d4f7eb';
  }
  
  setTimeout(() => { if (alertBox) alertBox.hidden = true; }, 6000);
}

async function cargarCursos() {
  if (!cursosGrid) return;
  cursosGrid.innerHTML = '<div class="curso-card placeholder">Cargando cursos...</div>';
  try {
    const response = await fetch(`${BASE_API}/cursos`);
    const data = await response.json();
    if (data.estado !== 'éxito') throw new Error(data.mensaje || 'Error');
    cursos = Array.isArray(data.datos) ? data.datos : [];
    renderCursos();
  } catch (error) {
    console.error(error);
    cursosGrid.innerHTML = '<div class="curso-card placeholder">No se pudieron cargar los cursos.</div>';
    mostrarAlerta('No se pudo cargar el catálogo. Revisa el servidor.', 'error');
  }
}

function renderCursos() {
  if (!cursosGrid) return;
  cursosGrid.innerHTML = '';
  cursos.forEach(curso => {
    const card = document.createElement('article');
    card.className = 'curso-card';
    card.innerHTML = `
      <div class="curso-cover">
        <img src="${imagenesPorCurso[curso.nombre] || '/default_curso.jpg'}" alt="${curso.nombre}">
      </div>
      <div class="curso-card-body">
        <h3>${curso.nombre}</h3>
        <p>${curso.descripcion}</p>
        <button onclick="seleccionarCurso(${curso.id})">Ver detalle</button>
        <button onclick="iniciarCompra(${curso.id})">Comprar</button>
      </div>
    `;
    cursosGrid.appendChild(card);
  });
}

window.seleccionarCurso = async function(cursoId) { /* Tu lógica de seleccionar */ };
window.iniciarCompra = async function(cursoId) { /* Tu lógica de compra */ };
function abrirCurso(cursoId) { window.location.href = `curso.html?id=${cursoId}`; }