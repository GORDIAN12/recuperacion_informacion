// index.js
// Ahora consume películas desde MySQL por medio de /api/peliculas
// Mantiene tu lógica original de buscador y renderizado

let banco = [];
let baseDeDatos = [];

const input = document.getElementById('inputBuscador');
const dropdown = document.getElementById('dropdown');
const lista = document.getElementById('lista');
const tituloDropdown = document.getElementById('tituloDropdown');
const badge = document.getElementById('badge');
const resultado = document.getElementById('resultado');

let sugerenciasActuales = [];
let indiceActivo = -1;

// ==========================================
// UTILIDADES
// ==========================================
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

  const antes = textoOriginal.slice(0, idx);
  const match = textoOriginal.slice(idx, idx + queryOriginal.length);
  const despues = textoOriginal.slice(idx + queryOriginal.length);

  return `${escapeHtml(antes)}<mark>${escapeHtml(match)}</mark>${escapeHtml(despues)}`;
}

function mostrarEstado(mensaje, claseCss = '') {
  if (!resultado) return;
  resultado.className = `caja-mensaje ${claseCss}`.trim();
  resultado.innerHTML = mensaje;
}

function mostrarDropdown() {
  dropdown?.classList.add('mostrar');
}

function ocultarDropdown() {
  dropdown?.classList.remove('mostrar');
  lista.innerHTML = '';
  sugerenciasActuales = [];
  indiceActivo = -1;
}

function setActivo(i) {
  const items = lista.querySelectorAll('li');
  items.forEach(li => li.classList.remove('activo'));

  if (items[i]) items[i].classList.add('activo');
  indiceActivo = i;
}

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

  const m = a.length;
  const n = b.length;

  const dp = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[m][n];
}

// ==========================================
// API
// ==========================================
async function cargarPeliculas() {
  try {
    const resp = await fetch('/api/peliculas');
    banco = await resp.json();

    // Convertir tags string -> array si viene desde MySQL
    banco = banco.map(item => ({
      ...item,
      tags: typeof item.tags === 'string'
        ? item.tags.split(',').map(t => t.trim())
        : []
    }));

    baseDeDatos = banco.map(x => x.titulo);

    renderInicio();
    mostrarEstado('Catálogo cargado correctamente.', 'texto-correcto');

  } catch (error) {
    console.error(error);
    mostrarEstado('Error al cargar catálogo desde la base de datos.', 'texto-error');
  }
}

// ==========================================
// BUSCADOR
// ==========================================
function renderCoincidencias(textoOriginal) {
  const texto = (textoOriginal || '').trim().replace(/\s+/g, ' ');

  if (!texto) {
    mostrarEstado('');
    ocultarDropdown();
    return;
  }

  if (esLexicamenteInvalido(texto)) {
    mostrarEstado('Error léxico: caracteres inválidos.', 'texto-error');
    ocultarDropdown();
    return;
  }

  if (esSintacticamenteInvalido(texto)) {
    mostrarEstado('Error sintáctico: formato inválido.', 'texto-error');
    ocultarDropdown();
    return;
  }

  const exacta = baseDeDatos.find(x => normalizar(x) === normalizar(texto));

  if (exacta) {
    mostrarEstado(`Correcto: "<strong>${escapeHtml(exacta)}</strong>" encontrada.`, 'texto-correcto');
    ocultarDropdown();
    abrirPanelPorTitulo(exacta);
    return;
  }

  const qN = normalizar(texto);

  let sugerencias = baseDeDatos
    .filter(x => normalizar(x).startsWith(qN))
    .slice(0, 8);

  let modo = 'prefijo';

  if (sugerencias.length === 0) {
    sugerencias = baseDeDatos
      .filter(x => normalizar(x).includes(qN))
      .slice(0, 8);

    modo = 'contiene';
  }

  if (sugerencias.length > 0) {
    sugerenciasActuales = sugerencias;
    lista.innerHTML = '';

    tituloDropdown.textContent =
      modo === 'prefijo'
        ? 'Coincidencias'
        : 'Coincidencias (contiene)';

    badge.textContent = sugerencias.length;

    sugerencias.forEach((sug, idx) => {
      const li = document.createElement('li');
      li.className = 'item';
      li.innerHTML = `<span class="label">${resaltarCoincidencia(sug, texto)}</span>`;

      li.addEventListener('mouseenter', () => setActivo(idx));
      li.addEventListener('mousedown', e => {
        e.preventDefault();
        seleccionar(idx);
      });

      lista.appendChild(li);
    });

    mostrarDropdown();

    if (indiceActivo === -1) setActivo(0);

    mostrarEstado(`Buscando: "<strong>${escapeHtml(texto)}</strong>"...`, 'texto-advertencia');
    return;
  }

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
    mostrarEstado(`No encontré coincidencias. ¿Quisiste decir "<strong>${escapeHtml(mejor)}</strong>"?`, 'texto-advertencia');
  } else {
    mostrarEstado(`Error semántico: "<strong>${escapeHtml(texto)}</strong>" no existe en el catálogo.`, 'texto-error');
  }

  ocultarDropdown();
}

function seleccionar(i) {
  const val = sugerenciasActuales[i];
  if (!val) return;

  input.value = val;
  ocultarDropdown();

  mostrarEstado(`Correcto: "<strong>${escapeHtml(val)}</strong>" encontrada.`, 'texto-correcto');

  abrirPanelPorTitulo(val);
}

function abrirPanelPorTitulo(titulo) {
  const item = banco.find(x => normalizar(x.titulo) === normalizar(titulo));
  if (!item) return;

  window.location.href = `reproductor.html?id=${item.id}`;
}

// ==========================================
// EVENTOS INPUT
// ==========================================
if (input) {
  input.addEventListener('input', e => {
    renderCoincidencias(e.target.value);
  });

  input.addEventListener('keydown', e => {
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
      ocultarDropdown();
    }
  });

  input.addEventListener('focus', () => {
    if (input.value.trim()) {
      renderCoincidencias(input.value);
    }
  });
}

document.addEventListener('mousedown', e => {
  if (!e.target.closest('.campo-entrada')) {
    ocultarDropdown();
  }
});

// ==========================================
// RENDER HOME
// ==========================================
function renderInicio() {
  const contenedorPrincipal = document.getElementById('contenedorPrincipal');
  if (!contenedorPrincipal) return;

  contenedorPrincipal.innerHTML = '';

  // Recomendaciones
  const idsRecomendados = JSON.parse(
    localStorage.getItem('recomendacionesUsuario') || '[]'
  );

  if (idsRecomendados.length > 0) {
    const peliculasRecomendadas = idsRecomendados
      .map(id => banco.find(p => p.id == id))
      .filter(Boolean);

    if (peliculasRecomendadas.length > 0) {
      contenedorPrincipal.insertAdjacentHTML('beforeend', `
        <div class="fila-catalogo">
          <h3 class="titulo-fila" style="color:white;">Recomendados para usted</h3>
          <div class="slider-peliculas">
            ${peliculasRecomendadas.map(p => `
              <img src="${p.imagen}" class="item-slider"
              onclick="window.location.href='reproductor.html?id=${p.id}'">
            `).join('')}
          </div>
        </div>
      `);
    }
  }

  // Géneros
  const generosUnicos = [...new Set(banco.map(item => item.genero))];

  generosUnicos.forEach(generoActual => {
    const peliculasDelGenero = banco.filter(
      item => item.genero === generoActual
    );

    contenedorPrincipal.insertAdjacentHTML('beforeend', `
      <div class="fila-catalogo">
        <h3 class="titulo-fila">${generoActual}</h3>
        <div class="slider-peliculas">
          ${peliculasDelGenero.map(p => `
            <img src="${p.imagen}" class="item-slider"
            onclick="window.location.href='reproductor.html?id=${p.id}'">
          `).join('')}
        </div>
      </div>
    `);
  });
}

// ==========================================
// INICIO
// ==========================================
document.addEventListener('DOMContentLoaded', cargarPeliculas);
