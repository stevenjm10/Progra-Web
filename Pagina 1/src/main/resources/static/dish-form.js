import { $, endpoint, request } from './api.js';

const id = new URLSearchParams(window.location.search).get('id');
let busy = false;
let ready = false;

function showMessage(content, error = false) {
  $('message').textContent = content;
  $('message').className = error ? 'error' : '';
}

function setDisabled(value) {
  for (const control of $('dish-form').elements) control.disabled = value;
}

async function initialize() {
  if (id === null) {
    ready = true;
    setDisabled(false);
    return;
  }
  $('form-title').textContent = 'Editar platillo';
  document.title = 'Editar platillo';
  $('save').textContent = 'Guardar cambios';
  $('back').href = '/dish-list.html';
  setDisabled(true);
  $('retry').hidden = true;
  if (!/^[1-9]\d*$/.test(id)) { showMessage('El ID del platillo no es válido.', true); return; }
  showMessage('Cargando platillo...');
  try {
    const p = await request(`${endpoint}/${id}`);
    for (const field of ['name', 'category', 'description', 'price']) $(field).value = p[field] ?? '';
    $('available').checked = p.available;
    ready = true;
    setDisabled(false);
    showMessage('');
  } catch (error) {
    showMessage(error.message, true);
    $('retry').hidden = false;
  }
}

$('dish-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (busy || !ready) return;
  const data = {
    name: $('name').value.trim(), category: $('category').value.trim(),
    description: $('description').value.trim(), price: Number($('price').value),
    available: $('available').checked
  };
  busy = true;
  setDisabled(true);
  showMessage('Guardando...');
  try {
    await request(id === null ? endpoint : `${endpoint}/${id}`, {
      method: id === null ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    });
    window.location.assign('/dish-list.html');
  } catch (error) {
    showMessage(error.message, true);
    busy = false;
    setDisabled(false);
  }
});
$('retry').addEventListener('click', initialize);
initialize();
