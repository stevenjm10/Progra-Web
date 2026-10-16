import { $, endpoint, solicitar } from './api.js';

const id = new URLSearchParams(window.location.search).get('id');
let ocupado = false;
let preparado = false;

function mensaje(contenido, error = false) {
  $('mensaje').textContent = contenido;
  $('mensaje').className = error ? 'error' : '';
}

function bloquear(valor) {
  for (const control of $('formulario').elements) control.disabled = valor;
}

async function iniciar() {
  if (id === null) {
    preparado = true;
    bloquear(false);
    return;
  }
  $('titulo-formulario').textContent = 'Editar platillo';
  document.title = 'Editar platillo';
  $('guardar').textContent = 'Guardar cambios';
  $('regresar').href = '/lista-platillos.html';
  bloquear(true);
  $('reintentar').hidden = true;
  if (!/^[1-9]\d*$/.test(id)) { mensaje('El ID del platillo no es válido.', true); return; }
  mensaje('Cargando platillo...');
  try {
    const p = await solicitar(`${endpoint}/${id}`);
    for (const campo of ['nombre', 'categoria', 'descripcion', 'precio']) $(campo).value = p[campo] ?? '';
    $('disponible').checked = p.disponible;
    preparado = true;
    bloquear(false);
    mensaje('');
  } catch (error) {
    mensaje(error.message, true);
    $('reintentar').hidden = false;
  }
}

$('formulario').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (ocupado || !preparado) return;
  const datos = {
    nombre: $('nombre').value.trim(), categoria: $('categoria').value.trim(),
    descripcion: $('descripcion').value.trim(), precio: Number($('precio').value),
    disponible: $('disponible').checked
  };
  ocupado = true;
  bloquear(true);
  mensaje('Guardando...');
  try {
    await solicitar(id === null ? endpoint : `${endpoint}/${id}`, {
      method: id === null ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos)
    });
    window.location.assign('/lista-platillos.html');
  } catch (error) {
    mensaje(error.message, true);
    ocupado = false;
    bloquear(false);
  }
});
$('reintentar').addEventListener('click', iniciar);
iniciar();
