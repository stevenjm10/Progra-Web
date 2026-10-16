const $ = (id) => document.getElementById(id);
const API = 'https://rickandmortyapi.com/api';
let temporizador;
let peticion;
let version = 0;
let pagina = 1;
let paginas = 1;
let buscando = false;
let peticionDetalle;
let personajeActual;

function texto(tag, contenido) {
  const nodo = document.createElement(tag);
  nodo.textContent = contenido;
  return nodo;
}

async function obtener(url, signal, permitirVacio = false) {
  const respuesta = await fetch(url, { signal });
  if (respuesta.status === 404 && permitirVacio) return { info: { pages: 1 }, results: [] };
  if (!respuesta.ok) throw new Error(`La API respondió con el estado ${respuesta.status}.`);
  return respuesta.json();
}

function estado(contenido, cargando) {
  buscando = cargando;
  $('estado-personajes').textContent = contenido;
  $('spinner').hidden = !cargando;
  $('personajes').setAttribute('aria-busy', String(cargando));
  $('anterior').disabled = cargando || pagina <= 1;
  $('siguiente').disabled = cargando || pagina >= paginas;
}

function imagen(personaje) {
  const img = document.createElement('img');
  img.src = personaje.image;
  img.alt = personaje.name;
  img.loading = 'lazy';
  img.addEventListener('error', () => img.replaceWith(texto('p', 'Imagen no disponible.')), { once: true });
  return img;
}

function renderizar(personajes) {
  $('personajes').replaceChildren();
  for (const personaje of personajes) {
    const tarjeta = document.createElement('button');
    tarjeta.type = 'button';
    tarjeta.className = 'tarjeta personaje';
    tarjeta.setAttribute('aria-label', `Ver detalles de ${personaje.name}`);
    tarjeta.append(imagen(personaje), texto('h3', personaje.name),
      texto('p', `${personaje.species} · ${personaje.status}`));
    tarjeta.addEventListener('click', () => abrirDetalle(personaje));
    $('personajes').append(tarjeta);
  }
}

async function cargar(numero = 1) {
  clearTimeout(temporizador);
  peticion?.abort();
  peticion = new AbortController();
  const actual = ++version;
  pagina = numero;
  $('reintentar').hidden = true;
  estado('Cargando personajes...', true);
  $('personajes').replaceChildren();
  const url = new URL(`${API}/character`);
  url.searchParams.set('page', numero);
  const nombre = $('buscar-personaje').value.trim();
  if (nombre) url.searchParams.set('name', nombre);
  try {
    const datos = await obtener(url, peticion.signal, true);
    if (actual !== version) return;
    paginas = datos.info.pages || 1;
    renderizar(datos.results);
    $('pagina').textContent = `Página ${pagina} de ${paginas}`;
    estado(datos.results.length ? 'Selecciona una tarjeta para ver los detalles.' : 'No hay personajes con ese nombre.', false);
  } catch (error) {
    if (error.name === 'AbortError' || actual !== version) return;
    paginas = pagina;
    estado('No se pudo consultar la API. Revisa tu conexión a internet y vuelve a intentar.', false);
    $('reintentar').hidden = false;
  }
}

$('buscar-personaje').addEventListener('input', () => {
  clearTimeout(temporizador);
  peticion?.abort();
  ++version;
  $('personajes').replaceChildren();
  $('reintentar').hidden = true;
  estado('Esperando 4 segundos desde la última tecla...', true);
  // Debounce: cada nueva pulsación reinicia los cuatro segundos.
  temporizador = setTimeout(() => cargar(1), 4000);
});
$('anterior').addEventListener('click', () => { if (!buscando && pagina > 1) cargar(pagina - 1); });
$('siguiente').addEventListener('click', () => { if (!buscando && pagina < paginas) cargar(pagina + 1); });
$('reintentar').addEventListener('click', () => cargar(pagina));

async function abrirDetalle(personaje) {
  personajeActual = personaje;
  peticionDetalle?.abort();
  const control = new AbortController();
  peticionDetalle = control;
  $('titulo-detalle').textContent = personaje.name;
  $('contenido-detalle').replaceChildren(imagen(personaje), texto('p', 'Cargando detalles...'));
  $('error-detalle').textContent = '';
  $('reintentar-detalle').hidden = true;
  if (!$('detalle').open) $('detalle').showModal();
  try {
    const completo = await obtener(`${API}/character/${personaje.id}`, control.signal);
    // Además de personajes, se consumen los recursos de ubicaciones y episodios.
    const consultas = [
      completo.location.url ? obtener(completo.location.url, control.signal) : Promise.resolve(null),
      completo.episode[0] ? obtener(completo.episode[0], control.signal) : Promise.resolve(null)
    ];
    const [ubicacion, episodio] = await Promise.allSettled(consultas);
    if (control.signal.aborted || !$('detalle').open) return;
    const lugar = ubicacion.status === 'fulfilled' ? ubicacion.value : null;
    const capitulo = episodio.status === 'fulfilled' ? episodio.value : null;
    $('contenido-detalle').replaceChildren(imagen(completo),
      texto('p', `Especie: ${completo.species}`), texto('p', `Estado: ${completo.status}`),
      texto('p', `Género: ${completo.gender}`), texto('p', `Origen: ${completo.origin.name}`),
      texto('p', `Ubicación: ${lugar?.name || completo.location.name}`),
      texto('p', `Dimensión: ${lugar?.dimension || 'Desconocida'}`),
      texto('p', `Primer episodio: ${capitulo ? `${capitulo.episode} — ${capitulo.name}` : 'No disponible'}`),
      texto('p', `Emisión: ${capitulo?.air_date || 'No disponible'}`),
      texto('p', `Aparece en ${completo.episode.length} episodio(s).`));
    if (ubicacion.status === 'rejected' || episodio.status === 'rejected') {
      $('error-detalle').textContent = 'Algunos detalles no se pudieron cargar.';
      $('reintentar-detalle').hidden = false;
    }
  } catch (error) {
    if (error.name === 'AbortError' || control.signal.aborted) return;
    $('contenido-detalle').replaceChildren(imagen(personaje));
    $('error-detalle').textContent = 'No se pudieron cargar los detalles. Intenta nuevamente.';
    $('reintentar-detalle').hidden = false;
  }
}
$('cerrar').addEventListener('click', () => $('detalle').close());
$('detalle').addEventListener('close', () => peticionDetalle?.abort());
$('reintentar-detalle').addEventListener('click', () => abrirDetalle(personajeActual));

async function resumen() {
  // Estas consultas usan los tres endpoints principales incluso antes de abrir una tarjeta.
  const resultados = await Promise.allSettled([
    obtener(`${API}/location`), obtener(`${API}/episode`)
  ]);
  const partes = [];
  if (resultados[0].status === 'fulfilled') partes.push(`${resultados[0].value.info.count} ubicaciones`);
  if (resultados[1].status === 'fulfilled') partes.push(`${resultados[1].value.info.count} episodios`);
  $('resumen').textContent = partes.join(' · ');
}
cargar();
resumen();
