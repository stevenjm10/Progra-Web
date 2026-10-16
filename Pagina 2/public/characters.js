const $ = (id) => document.getElementById(id);
const API = 'https://rickandmortyapi.com/api';
let debounceTimer;
let requestController;
let version = 0;
let pageNumber = 1;
let totalPages = 1;
let loading = false;
let detailController;
let currentCharacter;

function createText(tag, content) {
  const node = document.createElement(tag);
  node.textContent = content;
  return node;
}

async function fetchData(url, signal, allowEmpty = false) {
  const response = await fetch(url, { signal });
  if (response.status === 404 && allowEmpty) return { info: { pages: 1 }, results: [] };
  if (!response.ok) throw new Error(`La API respondió con el estado ${response.status}.`);
  return response.json();
}

function setStatus(content, isLoading) {
  loading = isLoading;
  $('character-status').textContent = content;
  $('spinner').hidden = !isLoading;
  $('characters').setAttribute('aria-busy', String(isLoading));
  $('previous').disabled = isLoading || pageNumber <= 1;
  $('next').disabled = isLoading || pageNumber >= totalPages;
}

function createImage(character) {
  const img = document.createElement('img');
  img.src = character.image;
  img.alt = character.name;
  img.loading = 'lazy';
  img.addEventListener('error', () => img.replaceWith(createText('p', 'Imagen no disponible.')), { once: true });
  return img;
}

function render(characters) {
  $('characters').replaceChildren();
  for (const character of characters) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'card character';
    card.setAttribute('aria-label', `Ver detalles de ${character.name}`);
    card.append(createImage(character), createText('h3', character.name),
      createText('p', `${character.species} · ${character.status}`));
    card.addEventListener('click', () => openDetails(character));
    $('characters').append(card);
  }
}

async function load(number = 1) {
  clearTimeout(debounceTimer);
  requestController?.abort();
  requestController = new AbortController();
  const requestVersion = ++version;
  pageNumber = number;
  $('retry').hidden = true;
  setStatus('Cargando personajes...', true);
  $('characters').replaceChildren();
  const url = new URL(`${API}/character`);
  url.searchParams.set('page', number);
  const name = $('character-search').value.trim();
  if (name) url.searchParams.set('name', name);
  try {
    const data = await fetchData(url, requestController.signal, true);
    if (requestVersion !== version) return;
    totalPages = data.info.pages || 1;
    render(data.results);
    $('page-number').textContent = `Página ${pageNumber} de ${totalPages}`;
    setStatus(data.results.length ? 'Selecciona una tarjeta para ver los detalles.' : 'No hay personajes con ese nombre.', false);
  } catch (error) {
    if (error.name === 'AbortError' || requestVersion !== version) return;
    totalPages = pageNumber;
    setStatus('No se pudo consultar la API. Revisa tu conexión a internet y vuelve a intentar.', false);
    $('retry').hidden = false;
  }
}

$('character-search').addEventListener('input', () => {
  clearTimeout(debounceTimer);
  requestController?.abort();
  ++version;
  $('characters').replaceChildren();
  $('retry').hidden = true;
  setStatus('Esperando 4 segundos desde la última tecla...', true);
  // Debounce: every keystroke resets the four-second timer.
  debounceTimer = setTimeout(() => load(1), 4000);
});
$('previous').addEventListener('click', () => { if (!loading && pageNumber > 1) load(pageNumber - 1); });
$('next').addEventListener('click', () => { if (!loading && pageNumber < totalPages) load(pageNumber + 1); });
$('retry').addEventListener('click', () => load(pageNumber));

async function openDetails(character) {
  currentCharacter = character;
  detailController?.abort();
  const control = new AbortController();
  detailController = control;
  $('details-title').textContent = character.name;
  $('details-content').replaceChildren(createImage(character), createText('p', 'Cargando detalles...'));
  $('details-error').textContent = '';
  $('retry-details').hidden = true;
  if (!$('details').open) $('details').showModal();
  try {
    // The list response already includes the complete character data.
    const fullCharacter = character;
    // Fetch location and episode resources in addition to characters.
    const requests = [
      fullCharacter.location.url ? fetchData(fullCharacter.location.url, control.signal) : Promise.resolve(null),
      fullCharacter.episode[0] ? fetchData(fullCharacter.episode[0], control.signal) : Promise.resolve(null)
    ];
    const [locationResult, episodeResult] = await Promise.allSettled(requests);
    if (control.signal.aborted || !$('details').open) return;
    const location = locationResult.status === 'fulfilled' ? locationResult.value : null;
    const episode = episodeResult.status === 'fulfilled' ? episodeResult.value : null;
    $('details-content').replaceChildren(createImage(fullCharacter),
      createText('p', `Especie: ${fullCharacter.species}`), createText('p', `Estado: ${fullCharacter.status}`),
      createText('p', `Género: ${fullCharacter.gender}`), createText('p', `Origen: ${fullCharacter.origin.name}`),
      createText('p', `Ubicación: ${location?.name || fullCharacter.location.name}`),
      createText('p', `Dimensión: ${location?.dimension || 'Desconocida'}`),
      createText('p', `Primer episodio: ${episode ? `${episode.episode} — ${episode.name}` : 'No disponible'}`),
      createText('p', `Emisión: ${episode?.air_date || 'No disponible'}`),
      createText('p', `Aparece en ${fullCharacter.episode.length} episodio(s).`));
    if (locationResult.status === 'rejected' || episodeResult.status === 'rejected') {
      $('details-error').textContent = 'Algunos detalles no se pudieron cargar.';
      $('retry-details').hidden = false;
    }
  } catch (error) {
    if (error.name === 'AbortError' || control.signal.aborted) return;
    $('details-content').replaceChildren(createImage(character));
    $('details-error').textContent = 'No se pudieron cargar los detalles. Intenta nuevamente.';
    $('retry-details').hidden = false;
  }
}
$('close').addEventListener('click', () => $('details').close());
$('details').addEventListener('close', () => detailController?.abort());
$('retry-details').addEventListener('click', () => openDetails(currentCharacter));

async function loadSummary() {
  // Load resource counts so all three endpoints are used before opening a card.
  const results = await Promise.allSettled([
    fetchData(`${API}/location`), fetchData(`${API}/episode`)
  ]);
  const parts = [];
  if (results[0].status === 'fulfilled') parts.push(`${results[0].value.info.count} ubicaciones`);
  if (results[1].status === 'fulfilled') parts.push(`${results[1].value.info.count} episodios`);
  $('summary').textContent = parts.join(' · ');
}
load();
loadSummary();
