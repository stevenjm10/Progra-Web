import { $, endpoint, currency, createText, request } from './api.js';

let dishes = [];
let busy = false;

function render() {
  $('rows').replaceChildren();
  for (const p of dishes) {
    const row = document.createElement('tr');
    row.append(createText('td', p.name), createText('td', p.category), createText('td', currency.format(p.price)),
      createText('td', p.available ? 'Sí' : 'No'));
    const actions = document.createElement('td');
    const edit = createText('a', 'Editar', 'button');
    edit.href = `/dish-form.html?id=${encodeURIComponent(p.id)}`;
    edit.setAttribute('aria-label', `Editar ${p.name}`);
    const deleteButton = createText('button', 'Eliminar');
    deleteButton.type = 'button';
    deleteButton.disabled = busy;
    deleteButton.setAttribute('aria-label', `Eliminar ${p.name}`);
    deleteButton.addEventListener('click', () => deleteDish(p));
    actions.append(edit, deleteButton);
    row.append(actions);
    $('rows').append(row);
  }
  $('status').textContent = dishes.length ? `${dishes.length} platillo(s) registrado(s).` : 'No hay platillos registrados.';
}

async function load() {
  $('retry').hidden = true;
  $('status').textContent = 'Cargando platillos...';
  try {
    dishes = await request(endpoint);
    render();
  } catch {
    $('status').textContent = 'No se pudo cargar la lista. Comprueba el servidor y PostgreSQL.';
    $('retry').hidden = false;
  }
}

async function deleteDish(p) {
  if (busy || !window.confirm(`¿Eliminar el platillo “${p.name}”?`)) return;
  busy = true;
  render();
  $('message').className = '';
  $('message').textContent = 'Eliminando...';
  try {
    await request(`${endpoint}/${p.id}`, { method: 'DELETE' });
    dishes = dishes.filter((item) => item.id !== p.id);
    $('message').textContent = 'Platillo eliminado.';
  } catch (error) {
    $('message').textContent = error.message;
    $('message').className = 'error';
  } finally {
    busy = false;
    render();
  }
}

$('retry').addEventListener('click', load);
load();
