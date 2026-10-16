export const $ = (id) => document.getElementById(id);
export const endpoint = '/api/platillos';
export const moneda = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' });

export function texto(tag, contenido, clase) {
  const nodo = document.createElement(tag);
  nodo.textContent = contenido;
  if (clase) nodo.className = clase;
  return nodo;
}

export async function solicitar(url, opciones = {}) {
  const respuesta = await fetch(url, opciones);
  if (!respuesta.ok) {
    let detalle = '';
    try {
      const cuerpo = await respuesta.json();
      detalle = cuerpo.detail || cuerpo.message || '';
    } catch { /* Algunos errores no incluyen JSON. */ }
    throw new Error(detalle || (respuesta.status === 404 ? 'El platillo no existe.'
      : `No se pudo completar la operación (${respuesta.status}).`));
  }
  return respuesta.status === 204 ? null : respuesta.json();
}
