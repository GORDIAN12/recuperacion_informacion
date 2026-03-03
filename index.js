// ===============================
// 1) BASE DE DATOS
// ===============================
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

const baseDeDatos = banco.map((x) => x.titulo);

// ===============================
// 2) ELEMENTOS DOM
// ===============================
const input = document.getElementById('inputBuscador');
const dropdown = document.getElementById('dropdown');
const lista = document.getElementById('lista');
const tituloDropdown = document.getElementById('tituloDropdown');
const badge = document.getElementById('badge');
const resultado = document.getElementById('resultado');
const tipoAnalisis = document.getElementById('tipoAnalisis');

// ===============================
// 3) ESTADO
// ===============================
let sugerenciasActuales = [];
let indiceActivo = -1;

// ===============================
// 4) UTILIDADES
// ===============================
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

function setTipoAnalisis(label, nivel) {
  if (!tipoAnalisis) return;

  tipoAnalisis.textContent = label;
  tipoAnalisis.className = 'pill';

  if (nivel === 'ok') tipoAnalisis.classList.add('pill-ok');
  else if (nivel === 'warn') tipoAnalisis.classList.add('pill-warn');
  else if (nivel === 'err') tipoAnalisis.classList.add('pill-err');
  else tipoAnalisis.classList.add('pill-neutral');
}

function mostrarEstado(mensaje, claseCss) {
  if (!resultado) return;
  resultado.className = `caja-mensaje ${claseCss || ''}`.trim();
  resultado.innerHTML = mensaje || '';
}

function mostrarDropdown() {
  if (dropdown) dropdown.classList.add('mostrar');
}

function ocultarDropdown() {
  if (!dropdown) return;
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

// ===============================
// 5) VALIDACIONES
// ===============================
function esLexicamenteInvalido(texto) {
  return /[^a-zA-Z0-9 áéíóúÁÉÍÓÚñÑ]/.test(texto);
}

function esSintacticamenteInvalido(texto) {
  if (/^\d/.test(texto)) return true;
  if (/^\d+$/.test(texto)) return true;
  const palabras = texto.split(' ').filter(Boolean);
  if (palabras.length > 3) return true;
  return false;
}

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
// 6) MOTOR DEL BUSCADOR
// ===============================
function renderCoincidencias(textoOriginal) {
  const texto = (textoOriginal || '').trim().replace(/\s+/g, ' ');

  if (!texto) {
    setTipoAnalisis('—', 'neutral');
    mostrarEstado('', '');
    ocultarDropdown();
    return;
  }

  if (esLexicamenteInvalido(texto)) {
    setTipoAnalisis('Error léxico', 'err');
    mostrarEstado('Error léxico: caracteres inválidos.', 'texto-error');
    ocultarDropdown();
    return;
  }

  if (esSintacticamenteInvalido(texto)) {
    setTipoAnalisis('Error sintáctico', 'err');
    mostrarEstado('Error sintáctico: formato inválido.', 'texto-error');
    ocultarDropdown();
    return;
  }

  const exacta = baseDeDatos.find((x) => normalizar(x) === normalizar(texto));
  if (exacta) {
    setTipoAnalisis('Correcto', 'ok');
    mostrarEstado(
      `Correcto: "<strong>${escapeHtml(exacta)}</strong>" encontrada.`,
      'texto-correcto',
    );
    ocultarDropdown();
    return;
  }

  const qN = normalizar(texto);

  let sugerencias = baseDeDatos
    .filter((x) => normalizar(x).startsWith(qN))
    .slice(0, 8);

  if (sugerencias.length === 0) {
    sugerencias = baseDeDatos
      .filter((x) => normalizar(x).includes(qN))
      .slice(0, 8);
  }

  if (sugerencias.length > 0) {
    setTipoAnalisis('Buscando…', 'warn');

    sugerenciasActuales = sugerencias;
    lista.innerHTML = '';
    badge.textContent = sugerencias.length;

    sugerencias.forEach((sug, idx) => {
      const li = document.createElement('li');
      li.className = 'item';
      li.innerHTML = sug;
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

  let mejor = null,
    mejorDist = Infinity;
  for (const item of baseDeDatos) {
    const d = levenshtein(texto, item);
    if (d < mejorDist) {
      mejorDist = d;
      mejor = item;
    }
  }

  if (mejor && mejorDist <= 2) {
    setTipoAnalisis('Casi', 'warn');
    mostrarEstado(
      `¿Quisiste decir "<strong>${escapeHtml(mejor)}</strong>"?`,
      'texto-advertencia',
    );
  } else {
    setTipoAnalisis('Error semántico', 'err');
    mostrarEstado(
      `Error semántico: "<strong>${escapeHtml(texto)}</strong>" no existe.`,
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
  setTipoAnalisis('Correcto', 'ok');
  mostrarEstado(
    `Correcto: "<strong>${escapeHtml(val)}</strong>" encontrada.`,
    'texto-correcto',
  );
}

// ===============================
// 7) EVENTOS
// ===============================
if (input) {
  input.addEventListener('input', (e) => {
    renderCoincidencias(e.target.value);
  });

  input.addEventListener('keydown', (e) => {
    if (!dropdown.classList.contains('mostrar')) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActivo(Math.min(indiceActivo + 1, sugerenciasActuales.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActivo(Math.max(indiceActivo - 1, 0));
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
}
