export const $ = (id) => document.getElementById(id);
export const endpoint = '/api/dishes';
export const currency = new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' });

export function createText(tag, content, className) {
  const node = document.createElement(tag);
  node.textContent = content;
  if (className) node.className = className;
  return node;
}

export async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.json();
      detail = body.detail || body.message || '';
    } catch { /* Some error responses do not contain JSON. */ }
    throw new Error(detail || (response.status === 404 ? 'El platillo no existe.'
      : `No se pudo completar la operación (${response.status}).`));
  }
  return response.status === 204 ? null : response.json();
}
