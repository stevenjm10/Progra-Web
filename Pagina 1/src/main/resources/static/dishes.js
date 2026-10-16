import { $, endpoint, currency, createText, request } from './api.js';

let dishes = [];

function render() {
  const query = $('search').value.trim().toLocaleLowerCase('es');
  const visibleDishes = dishes.filter((p) =>
    `${p.name} ${p.category} ${p.description || ''}`.toLocaleLowerCase('es').includes(query));
  $('cards').replaceChildren();
  for (const p of visibleDishes) {
    const card = document.createElement('article');
    card.className = 'card';
    card.append(createText('h3', p.name), createText('p', p.category),
      createText('p', p.description || 'Sin descripción'), createText('p', currency.format(p.price), 'price'),
      createText('p', p.available ? 'Disponible' : 'No disponible'));
    $('cards').append(card);
  }
  $('status').textContent = !dishes.length
    ? 'Todavía no hay platillos. Pulsa “Nuevo platillo” para registrar el primero.'
    : !visibleDishes.length ? 'No se encontraron platillos con esa búsqueda.'
    : `${visibleDishes.length} platillo(s)`;
}

async function load() {
  $('retry').hidden = true;
  $('status').textContent = 'Cargando platillos...';
  try {
    dishes = await request(endpoint);
    $('search').disabled = false;
    render();
  } catch {
    $('status').textContent = 'No se pudieron cargar los platillos. Comprueba que el servidor y PostgreSQL estén funcionando.';
    $('retry').hidden = false;
  }
}

// Filter immediately without a debounce timer.
$('search').addEventListener('input', render);
$('retry').addEventListener('click', load);
load();
