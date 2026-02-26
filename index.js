const banco = [
  {
    id: 'sw4',
    titulo: 'Star Wars: A New Hope',
    tipo: 'pelicula',
    tags: ['star wars', 'jedi', 'espacio', 'sci-fi'],
    duracionSeg: 6,
    img: 'imgs/st2.jpg',
  },
  {
    id: 'sw5',
    titulo: 'Star Wars: The Empire Strikes Back',
    tipo: 'pelicula',
    tags: ['star wars', 'jedi', 'espacio', 'sci-fi'],
    duracionSeg: 6,
    img: 'imgs/st2.jpg',
  },
  {
    id: 'bladerunner',
    titulo: 'Blade Runner 2049',
    tipo: 'pelicula',
    tags: ['cyberpunk', 'sci-fi', 'futuro', 'neo-noir'],
    duracionSeg: 6,
    img: 'imgs/bl.jpeg',
  },
  {
    id: 'interstellar',
    titulo: 'Interstellar',
    tipo: 'pelicula',
    tags: ['espacio', 'sci-fi', 'drama', 'viaje'],
    duracionSeg: 6,
    img: 'imgs/bh.jpg',
  },
  {
    id: 'forrest_gump',
    titulo: 'Forrest Gump',
    tipo: 'pelicula',
    tags: ['drama', 'vida', 'historia', 'superacion'],
    duracionSeg: 6,
    img: 'imgs/for.webp',
  },
  {
    id: 'el_conjuro',
    titulo: 'El Conjuro',
    tipo: 'pelicula',
    tags: ['terror', 'paranormal', 'miedo', 'horror'],
    duracionSeg: 6,
    img: 'imgs/cj.jpg',
  },
  {
    id: 'anabelle',
    titulo: 'Anabelle',
    tipo: 'pelicula',
    tags: ['terror', 'paranormal', 'miedo', 'horror'],
    duracionSeg: 6,
    img: 'imgs/anabelle.jpg',
  },
  {
    id: 'el_conjuro2',
    titulo: 'El Conjuro 2',
    tipo: 'pelicula',
    tags: ['terror', 'paranormal', 'miedo', 'horror'],
    duracionSeg: 6,
    img: 'imgs/cj.jpg',
  },
  {
    id: 'mad_max_fury_road',
    titulo: 'Mad Max: Fury Road',
    tipo: 'pelicula',
    tags: ['accion', 'postapocaliptico', 'persecuciones', 'adrenalina'],
    duracionSeg: 6,
    img: 'imgs/md.jpg',
  },
  {
    id: 'breaking_bad',
    titulo: 'Breaking Bad',
    tipo: 'serie',
    tags: ['drama', 'crimen', 'antiheroe', 'narcos'],
    duracionSeg: 12,
    img: 'imgs/bk.jpg',
  },
  {
    id: 'better_call_saul',
    titulo: 'Better Call Saul',
    tipo: 'serie',
    tags: ['abogados', 'crimen', 'drama', 'spin-off'],
    duracionSeg: 12,
    img: 'imgs/saul.jpg',
  },
  {
    id: 'the_sopranos',
    titulo: 'The Sopranos',
    tipo: 'serie',
    tags: ['mafia', 'crimen', 'drama', 'familia', 'antiheroe'],
    duracionSeg: 12,
    img: 'imgs/sopranos.jpg',
  },
  {
    id: 'game_of_thrones',
    titulo: 'Game of Thrones',
    tipo: 'serie',
    tags: ['fantasia', 'politica', 'guerra', 'reinos', 'drama'],
    duracionSeg: 12,
    img: 'imgs/got.jpg',
  },
];

// Para que tu buscador siga trabajando con strings (títulos)
const baseDeDatos = banco.map((x) => x.titulo);

// ===============================
// 2) HELPERS (TU MISMO ESTILO)
// ===============================
const input = document.getElementById('inputBuscador');
const dropdown = document.getElementById('dropdown');
const lista = document.getElementById('lista');
const tituloDropdown = document.getElementById('tituloDropdown');
const badge = document.getElementById('badge');
const resultado = document.getElementById('resultado');

// Panel
const panel = document.getElementById('panel');
const mediaImg = document.getElementById('mediaImg');
const mediaTitulo = document.getElementById('mediaTitulo');
const mediaMeta = document.getElementById('mediaMeta');
const btnIniciar = document.getElementById('btnIniciar');
const barraFill = document.getElementById('barraFill');
const tiempoTxt = document.getElementById('tiempoTxt');
const relacionadoBox = document.getElementById('relacionado');

// estado dropdown
let sugerenciasActuales = [];
let indiceActivo = -1;

// estado “media”
let seleccionActual = null;
let timerId = null;
let inicio = 0;
let duracionSeg = 10;
let yaTermino = false;
let yaCalifico = false;

function normalizar(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function escapeHtml(str) {
  return (str || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function resaltarCoincidencia(textoOriginal, queryOriginal) {
  const txtN = normalizar(textoOriginal);
  const qN = normalizar(queryOriginal);

  if (!qN) return escapeHtml(textoOriginal);

  const idx = txtN.indexOf(qN);
  if (idx === -1) return escapeHtml(textoOriginal);

  // OJO: usamos el slice sobre el original. En la práctica funciona bien.
  const antes = textoOriginal.slice(0, idx);
  const match = textoOriginal.slice(idx, idx + queryOriginal.length);
  const despues = textoOriginal.slice(idx + queryOriginal.length);

  return `${escapeHtml(antes)}<mark>${escapeHtml(match)}</mark>${escapeHtml(despues)}`;
}

function mostrarEstado(mensaje, claseCss) {
  resultado.className = `caja-mensaje ${claseCss || ''}`.trim();
  resultado.innerHTML = mensaje || '';
}

function mostrarDropdown() {
  dropdown.classList.add('mostrar');
}

function ocultarDropdown() {
  dropdown.classList.remove('mostrar');
  lista.innerHTML = '';
  sugerenciasActuales = [];
  indiceActivo = -1;
}

function setActivo(i) {
  const items = lista.querySelectorAll('li');
  items.forEach((li) => li.classList.remove('activo'));
  if (items[i]) items[i].classList.add('activo');
  indiceActivo = i;
}

function esLexicamenteInvalido(texto) {
  // solo letras/números/espacios/acentos/ñ
  return /[^a-zA-Z0-9 áéíóúÁÉÍÓÚñÑ]/.test(texto);
}

function esSintacticamenteInvalido(texto) {
  // reglas: no empezar con número, no solo números, max 3 palabras
  if (/^\d/.test(texto)) return true;
  if (/^\d+$/.test(texto)) return true;
  const palabras = texto.split(' ').filter(Boolean);
  if (palabras.length > 3) return true;
  return false;
}

// Levenshtein (para sugerir “quisiste decir”)
function levenshtein(a, b) {
  a = normalizar(a);
  b = normalizar(b);
  const m = a.length,
    n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[m][n];
}

// ===============================
// 3) RENDER SUGERENCIAS (BUSCADOR)
// ===============================
function renderCoincidencias(textoOriginal) {
  const texto = (textoOriginal || '').trim().replace(/\s+/g, ' ');

  if (!texto) {
    mostrarEstado('', '');
    ocultarDropdown();
    panel.style.display = 'none'; // opcional: oculta panel si borras
    return;
  }

  // Léxico
  if (esLexicamenteInvalido(texto)) {
    mostrarEstado('Error léxico: caracteres inválidos.', 'texto-error');
    ocultarDropdown();
    return;
  }

  // Sintaxis
  if (esSintacticamenteInvalido(texto)) {
    mostrarEstado(
      'Error sintáctico: formato inválido (máx 3 palabras, no iniciar con número).',
      'texto-error',
    );
    ocultarDropdown();
    return;
  }

  // Exacta
  const exacta = baseDeDatos.find((x) => normalizar(x) === normalizar(texto));
  if (exacta) {
    mostrarEstado(
      `Correcto: "<strong>${escapeHtml(exacta)}</strong>" encontrada.`,
      'texto-correcto',
    );
    ocultarDropdown();
    abrirPanelPorTitulo(exacta);
    return;
  }

  const qN = normalizar(texto);

  // 1) prefijo
  let sugerencias = baseDeDatos
    .filter((x) => normalizar(x).startsWith(qN))
    .slice(0, 8);

  let modo = 'prefijo';

  // 2) contiene
  if (sugerencias.length === 0) {
    sugerencias = baseDeDatos
      .filter((x) => normalizar(x).includes(qN))
      .slice(0, 8);
    modo = 'contiene';
  }

  // si hay sugerencias
  if (sugerencias.length > 0) {
    sugerenciasActuales = sugerencias;
    lista.innerHTML = '';

    tituloDropdown.textContent =
      modo === 'prefijo' ? 'Coincidencias' : 'Coincidencias (contiene)';
    badge.textContent = String(sugerencias.length);

    sugerencias.forEach((sug, idx) => {
      const li = document.createElement('li');
      li.className = 'item';
      li.setAttribute('role', 'option');
      li.innerHTML = `<span class="label">${resaltarCoincidencia(sug, texto)}</span>`;

      li.addEventListener('mouseenter', () => setActivo(idx));

      li.addEventListener('mousedown', (e) => {
        e.preventDefault();
        seleccionar(idx);
      });

      lista.appendChild(li);
    });

    mostrarDropdown();
    if (indiceActivo === -1) setActivo(0);

    mostrarEstado(
      `Buscando: "<strong>${escapeHtml(texto)}</strong>"...`,
      'texto-advertencia',
    );
    return;
  }

  // Semántico: “quisiste decir”
  let mejor = null;
  let mejorDist = Infinity;
  for (const item of baseDeDatos) {
    const d = levenshtein(texto, item);
    if (d < mejorDist) {
      mejorDist = d;
      mejor = item;
    }
  }

  if (mejor && mejorDist <= 2) {
    mostrarEstado(
      `No encontré coincidencias. ¿Quisiste decir "<strong>${escapeHtml(mejor)}</strong>"?`,
      'texto-advertencia',
    );
  } else {
    mostrarEstado(
      `Error semántico: "<strong>${escapeHtml(texto)}</strong>" no tiene significado en el banco.`,
      'texto-error',
    );
  }

  ocultarDropdown();
}

function seleccionar(i) {
  const val = sugerenciasActuales[i];
  if (!val) return;

  input.value = val;
  ocultarDropdown();
  mostrarEstado(
    `Correcto: "<strong>${escapeHtml(val)}</strong>" encontrada.`,
    'texto-correcto',
  );

  abrirPanelPorTitulo(val);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function detenerTimer() {
  if (timerId) clearInterval(timerId);
  timerId = null;
}

function abrirPanelPorTitulo(titulo) {
  const item = banco.find((x) => normalizar(x.titulo) === normalizar(titulo));
  if (!item) return;

  seleccionActual = item;
  yaTermino = false;
  yaCalifico = false;

  relacionadoBox.innerHTML = ''; // relacionado vacío al seleccionar
  barraFill.style.width = '0%';
  tiempoTxt.textContent = '';

  panel.style.display = 'block';

  mediaImg.src = item.img || '';
  mediaImg.style.display = item.img ? 'block' : 'none';
  mediaTitulo.textContent = item.titulo;
  mediaMeta.textContent = `${item.tipo.toUpperCase()} · tags: ${item.tags.join(', ')}`;
}

function iniciarTimer() {
  if (!seleccionActual) return;

  detenerTimer();
  yaTermino = false;
  yaCalifico = false;

  // tiempo fijo del sistema
  duracionSeg = seleccionActual.duracionSeg ?? 10; // fallback

  inicio = Date.now();
  panelFinal.innerHTML = '';
  relacionadoBox.innerHTML = ''; // vacío mientras se reproduce

  timerId = setInterval(() => {
    const transcurrido = (Date.now() - inicio) / 1000;
    const progreso = Math.min(transcurrido / duracionSeg, 1);

    barraFill.style.width = `${Math.round(progreso * 100)}%`;
    tiempoTxt.textContent = `Tiempo: ${Math.min(transcurrido, duracionSeg).toFixed(1)} / ${duracionSeg}s`;

    if (progreso >= 1) {
      detenerTimer();
      finalizarConsumo();
    }
  }, 100);
}

function finalizarConsumo() {
  yaTermino = true;

  panelFinal.innerHTML = `
    <strong>Te gusto lo que viste:</strong>
    <div class="calif">
      <button class="btnLike" data-like="1">Like</button>
      <button class="btnLike" data-like="0">Dislike</button>
    </div>
    <p id="respuestaLike" class="respuestaLike"></p>
  `;

  const respuestaLike = document.getElementById('respuestaLike');

  // Like / Dislike
  panelFinal.querySelectorAll('.btnLike').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!yaTermino) return;
      yaCalifico = true;

      const like = btn.dataset.like === '1';
      respuestaLike.textContent = like
        ? 'Te recomendamos esto: '
        : 'No hay recomendaciones por el momento';

      if (like) mostrarRelacionado(seleccionActual);
      else ocultarRelacionado();
    });
  });
}

function ocultarRelacionado() {
  relacionadoBox.innerHTML = `<p><strong>Relacionado:</strong> (no se muestran recomendaciones para esta calificación)</p>`;
}

function compartirTags(a, b) {
  const A = new Set(a.tags.map(normalizar));
  return b.tags.some((t) => A.has(normalizar(t)));
}

function mostrarRelacionado(item) {
  if (!yaCalifico) return;

  const bucket = bucketTiempo(item.duracionSeg ?? 10);

  const relacionados = banco
    .filter((x) => x.id !== item.id)
    // 1) misma categoría de duración
    .filter((x) => bucketTiempo(x.duracionSeg ?? 10) === bucket)
    // 2) orden por tags similares
    .map((x) => ({
      item: x,
      score:
        (compartirTags(item, x) ? 3 : 0) +
        (x.tipo === item.tipo ? 1 : 0) +
        (normalizar(item.titulo).includes('star wars') &&
        normalizar(x.titulo).includes('star wars')
          ? 2
          : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.item);

  if (!relacionados.length) {
    relacionadoBox.innerHTML = `<p><strong>Relacionado:</strong> (sin sugerencias para ${escapeHtml(bucket)})</p>`;
    return;
  }

  relacionadoBox.innerHTML = `
    <p><strong>Relacionado:</strong> (preferencia: ${escapeHtml(bucket)})</p>
    <ul class="relList">
      ${relacionados
        .map(
          (r) =>
            `<li class="relItem">${escapeHtml(r.titulo)} <em>(${r.tipo})</em></li>`,
        )
        .join('')}
    </ul>
  `;
}

input.addEventListener('input', (e) => {
  renderCoincidencias(e.target.value);
});

input.addEventListener('keydown', (e) => {
  if (!dropdown.classList.contains('mostrar')) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    const next = Math.min(indiceActivo + 1, sugerenciasActuales.length - 1);
    setActivo(next);
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault();
    const prev = Math.max(indiceActivo - 1, 0);
    setActivo(prev);
  }

  if (e.key === 'Enter') {
    e.preventDefault();
    if (indiceActivo >= 0) seleccionar(indiceActivo);
  }

  if (e.key === 'Escape') {
    e.preventDefault();
    ocultarDropdown();
  }
});

input.addEventListener('focus', () => {
  if (input.value.trim()) renderCoincidencias(input.value);
});

document.addEventListener('mousedown', (e) => {
  if (!e.target.closest('.campo-entrada')) {
    ocultarDropdown();
  }
});

// botón iniciar timer
btnIniciar.addEventListener('click', iniciarTimer);

function bucketTiempo(seg) {
  if (seg <= 6) return 'corta';
  if (seg <= 10) return 'mediana';
  return 'larga';
}