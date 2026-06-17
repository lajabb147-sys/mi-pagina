function qs(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function crearTarjetaCurso(curso) {
  const card = document.createElement('article');
  card.style.border = '1px solid rgba(255,255,255,0.08)';
  card.style.borderRadius = '18px';
  card.style.padding = '16px';
  card.style.background = 'rgba(255,255,255,0.03)';
  card.style.display = 'grid';
  card.style.gap = '10px';
  card.style.alignItems = 'start';

  const imagen = document.createElement('img');
  imagen.src = curso.imagen || '/default_curso.jpg';
  imagen.alt = curso.nombre || 'Curso';
  imagen.style.width = '100%';
  imagen.style.height = '140px';
  imagen.style.objectFit = 'cover';
  imagen.style.borderRadius = '14px';
  card.appendChild(imagen);

  const titulo = document.createElement('h3');
  titulo.textContent = curso.nombre || 'Curso sin nombre';
  titulo.style.margin = '0';
  card.appendChild(titulo);

  const descripcion = document.createElement('p');
  descripcion.textContent = curso.descripcion || 'Descripción no disponible.';
  descripcion.style.margin = '0';
  descripcion.style.color = '#b7c0d6';
  descripcion.style.fontSize = '0.95rem';
  card.appendChild(descripcion);

  const boton = document.createElement('button');
  boton.type = 'button';
  boton.textContent = 'Ver este curso';
  boton.style.padding = '10px 14px';
  boton.style.border = 'none';
  boton.style.borderRadius = '12px';
  boton.style.cursor = 'pointer';
  boton.style.background = '#00ffcc';
  boton.style.color = '#0f0f1a';
  boton.addEventListener('click', () => {
    window.location.href = `curso.html?id=${curso.id}`;
  });
  card.appendChild(boton);

  return card;
}

function renderCurso(curso) {
  const cont = document.getElementById('cursoDetalle');
  if (!cont) return;

  const precio = Number(curso.precio || 0).toFixed(2);
  const imagenSrc = curso.imagen || '/default_curso.jpg';

  cont.innerHTML = `
    <div style="display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start;">
      <img src="${imagenSrc}" alt="${curso.nombre}" style="width:320px;max-width:100%;height:220px;object-fit:cover;border-radius:16px;">
      <div style="flex:1;min-width:240px;">
        <h2>${curso.nombre || 'Curso sin nombre'}</h2>
        <p style="color:var(--muted);margin:12px 0 14px;">${curso.descripcion || 'Descripción no disponible.'}</p>
        <div style="margin:12px 0;font-weight:700;font-size:1.25rem;">Precio: $${precio}</div>
        <div style="margin-top:6px;">${curso.contenido || 'El contenido de este curso será actualizado pronto.'}</div>
        <div style="margin-top:18px;display:flex;gap:12px;flex-wrap:wrap;">
          <button type="button" onclick="window.location.href='index.html'" style="padding:12px 18px;border:none;border-radius:14px;background:#1f1c2e;color:#fff;cursor:pointer;">Volver al catálogo</button>
          <button type="button" onclick="window.location.href='index.html?id=${curso.id}'" style="padding:12px 18px;border:none;border-radius:14px;background:#00ffcc;color:#0f0f1a;cursor:pointer;">Ver otro curso</button>
        </div>
      </div>
    </div>
  `;

  const titulo = document.getElementById('cursoNombre');
  if (titulo) titulo.textContent = curso.nombre || 'Curso';
  const sub = document.getElementById('cursoSub');
  if (sub) sub.textContent = curso.descripcion || 'Descripción no disponible.';
}

function renderOtrosCursos(cursoActualId) {
  const otrosCursosList = document.getElementById('otrosCursosList');
  if (!otrosCursosList) return;

  const cursos = Array.isArray(window.CURSOS) ? window.CURSOS : [];
  const otros = cursos.filter(c => Number(c.id) !== Number(cursoActualId));

  if (otros.length === 0) {
    otrosCursosList.innerHTML = '<div style="color:#c6cadf;padding:16px;background:rgba(255,255,255,0.03);border-radius:16px;">No hay otros cursos disponibles.</div>';
    return;
  }

  otrosCursosList.innerHTML = '';
  otros.forEach(curso => {
    otrosCursosList.appendChild(crearTarjetaCurso(curso));
  });
}

(function init() {
  const id = Number(qs('id')) || 0;
  const cursos = Array.isArray(window.CURSOS) ? window.CURSOS : [];
  const curso = cursos.find(c => Number(c.id) === Number(id));
  const otrosCursosList = document.getElementById('otrosCursosList');

  if (!curso) {
    const cont = document.getElementById('cursoDetalle');
    if (cont) cont.innerHTML = '<div class="detalle-empty">Curso no encontrado. Selecciona otro curso desde el catálogo.</div>';
    if (otrosCursosList) {
      otrosCursosList.innerHTML = '';
      cursos.forEach(c => otrosCursosList.appendChild(crearTarjetaCurso(c)));
    }
    return;
  }

  renderCurso(curso);
  if (otrosCursosList) renderOtrosCursos(curso.id);
})();

// --- NOTIFICACIÓN FLOTANTE AL COMPRAR ---
function mostrarNotificacion(mensaje) {
    const notificacion = document.createElement('div');
    notificacion.innerText = mensaje;
    notificacion.style.position = 'fixed';
    notificacion.style.bottom = '20px';
    notificacion.style.right = '20px';
    notificacion.style.background = '#00ffcc';
    notificacion.style.color = '#0f0f1a';
    notificacion.style.padding = '15px 25px';
    notificacion.style.borderRadius = '10px';
    notificacion.style.fontWeight = 'bold';
    notificacion.style.zIndex = '99999';
    notificacion.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    notificacion.style.transition = 'all 0.3s ease';
    
    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.remove();
    }, 3000);
}

document.addEventListener('click', (e) => {
    if (e.target.textContent === 'Ver este curso') {
        mostrarNotificacion('¡Iniciando proceso de inscripción!');
    }
});