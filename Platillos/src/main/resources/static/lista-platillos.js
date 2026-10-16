import { $, endpoint, moneda, texto, solicitar } from './api.js';

let platillos = [];
let ocupado = false;

function renderizar() {
  $('filas').replaceChildren();
  for (const p of platillos) {
    const fila = document.createElement('tr');
    fila.append(texto('td', p.nombre), texto('td', p.categoria), texto('td', moneda.format(p.precio)),
      texto('td', p.disponible ? 'Sí' : 'No'));
    const operaciones = document.createElement('td');
    const editar = texto('a', 'Editar', 'boton');
    editar.href = `/nuevo-platillo.html?id=${encodeURIComponent(p.id)}`;
    editar.setAttribute('aria-label', `Editar ${p.nombre}`);
    const eliminar = texto('button', 'Eliminar');
    eliminar.type = 'button';
    eliminar.disabled = ocupado;
    eliminar.setAttribute('aria-label', `Eliminar ${p.nombre}`);
    eliminar.addEventListener('click', () => eliminarPlatillo(p));
    operaciones.append(editar, eliminar);
    fila.append(operaciones);
    $('filas').append(fila);
  }
  $('estado').textContent = platillos.length ? `${platillos.length} platillo(s) registrado(s).` : 'No hay platillos registrados.';
}

async function cargar() {
  $('reintentar').hidden = true;
  $('estado').textContent = 'Cargando platillos...';
  try {
    platillos = await solicitar(endpoint);
    renderizar();
  } catch {
    $('estado').textContent = 'No se pudo cargar la lista. Comprueba el servidor y PostgreSQL.';
    $('reintentar').hidden = false;
  }
}

async function eliminarPlatillo(p) {
  if (ocupado || !window.confirm(`¿Eliminar el platillo “${p.nombre}”?`)) return;
  ocupado = true;
  renderizar();
  $('mensaje').className = '';
  $('mensaje').textContent = 'Eliminando...';
  try {
    await solicitar(`${endpoint}/${p.id}`, { method: 'DELETE' });
    platillos = platillos.filter((item) => item.id !== p.id);
    $('mensaje').textContent = 'Platillo eliminado.';
  } catch (error) {
    $('mensaje').textContent = error.message;
    $('mensaje').className = 'error';
  } finally {
    ocupado = false;
    renderizar();
  }
}

$('reintentar').addEventListener('click', cargar);
cargar();
