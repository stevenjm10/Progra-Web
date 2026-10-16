import { $, endpoint, moneda, texto, solicitar } from './api.js';

let platillos = [];

function renderizar() {
  const consulta = $('buscar').value.trim().toLocaleLowerCase('es');
  const visibles = platillos.filter((p) =>
    `${p.nombre} ${p.categoria} ${p.descripcion || ''}`.toLocaleLowerCase('es').includes(consulta));
  $('tarjetas').replaceChildren();
  for (const p of visibles) {
    const tarjeta = document.createElement('article');
    tarjeta.className = 'tarjeta';
    tarjeta.append(texto('h3', p.nombre), texto('p', p.categoria),
      texto('p', p.descripcion || 'Sin descripción'), texto('p', moneda.format(p.precio), 'precio'),
      texto('p', p.disponible ? 'Disponible' : 'No disponible'));
    $('tarjetas').append(tarjeta);
  }
  $('estado').textContent = !platillos.length
    ? 'Todavía no hay platillos. Pulsa “Nuevo platillo” para registrar el primero.'
    : !visibles.length ? 'No se encontraron platillos con esa búsqueda.'
    : `${visibles.length} platillo(s)`;
}

async function cargar() {
  $('reintentar').hidden = true;
  $('estado').textContent = 'Cargando platillos...';
  try {
    platillos = await solicitar(endpoint);
    $('buscar').disabled = false;
    renderizar();
  } catch {
    $('estado').textContent = 'No se pudieron cargar los platillos. Comprueba que el servidor y PostgreSQL estén funcionando.';
    $('reintentar').hidden = false;
  }
}

// Búsqueda inmediata, sin temporizador.
$('buscar').addEventListener('input', renderizar);
$('reintentar').addEventListener('click', cargar);
cargar();
