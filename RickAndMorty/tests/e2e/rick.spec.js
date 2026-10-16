import { test, expect } from '@playwright/test';

const baseApi = 'https://rickandmortyapi.com/api';
const personaje = {
  id: 1, name: 'Rick Sanchez', species: 'Human', status: 'Alive', gender: 'Male',
  image: `${baseApi}/character/avatar/1.jpeg`, origin: { name: 'Earth' },
  location: { name: 'Earth', url: `${baseApi}/location/1` }, episode: [`${baseApi}/episode/1`]
};

async function simular(page) {
  const consultas = [];
  await page.route(`${baseApi}/**`, async route => {
    const url = new URL(route.request().url());
    consultas.push({ ruta: url.pathname, nombre: url.searchParams.get('name') });
    if (url.pathname.includes('/avatar/')) {
      await route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#ddd"/></svg>' }); return;
    }
    if (url.searchParams.get('name') === 'no-existe') { await route.fulfill({ status: 404, json: {} }); return; }
    let resultado;
    if (url.pathname === '/api/character') resultado = { info: { count: 1, pages: 2 }, results: [personaje] };
    else if (url.pathname === '/api/character/1') resultado = personaje;
    else if (url.pathname === '/api/location/1') resultado = { name: 'Earth', dimension: 'C-137' };
    else if (url.pathname === '/api/episode/1') resultado = { episode: 'S01E01', name: 'Pilot', air_date: 'December 2, 2013' };
    else resultado = { info: { count: 50 }, results: [] };
    await route.fulfill({ json: resultado });
  });
  return consultas;
}

test('tres recursos, tarjetas con imagen, detalle y cierre con Escape', async ({ page }) => {
  const consultas = await simular(page);
  await page.goto('/');
  await expect(page.locator('#resumen')).toContainText('episodios');
  await page.getByRole('button', { name: 'Ver detalles de Rick Sanchez' }).click();
  await expect(page.locator('#detalle')).toBeVisible();
  await expect(page.locator('#contenido-detalle')).toContainText('S01E01');
  await expect(page.locator('#contenido-detalle')).toContainText('C-137');
  await expect(page.locator('#contenido-detalle img')).toBeVisible();
  expect(consultas.some(q => q.ruta === '/api/character')).toBe(true);
  expect(consultas.some(q => q.ruta === '/api/location')).toBe(true);
  expect(consultas.some(q => q.ruta === '/api/episode')).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.locator('#detalle')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Ver detalles de Rick Sanchez' })).toBeFocused();
  await page.setViewportSize({ width: 375, height: 850 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('debounce de 4000 ms, reinicio por tecla, spinner y ausencia de resultados', async ({ page }) => {
  await page.clock.install();
  const consultas = await simular(page);
  await page.goto('/');
  await expect(page.locator('.personaje')).toHaveCount(1);
  await page.locator('#buscar-personaje').fill('Rick');
  await expect(page.locator('#spinner')).toBeVisible();
  await page.clock.runFor(2500);
  expect(consultas.some(q => q.nombre === 'Rick')).toBe(false);
  await page.locator('#buscar-personaje').fill('Morty');
  await page.clock.runFor(3999);
  expect(consultas.some(q => q.nombre === 'Morty')).toBe(false);
  await page.clock.runFor(1);
  await expect(page.locator('.personaje')).toHaveCount(1);
  expect(consultas.some(q => q.nombre === 'Morty')).toBe(true);
  expect(consultas.some(q => q.nombre === 'Rick')).toBe(false);
  await expect(page.locator('#spinner')).toBeHidden();
  await page.locator('#buscar-personaje').fill('no-existe');
  await page.clock.runFor(4000);
  await expect(page.locator('#estado-personajes')).toContainText('No hay personajes');
  await expect(page.locator('.personaje')).toHaveCount(0);
});

test('paginación y recuperación de un error de API', async ({ page }) => {
  await simular(page);
  let falla = true;
  await page.route(`${baseApi}/character?*`, async route => {
    if (falla) await route.fulfill({ status: 503, json: {} });
    else await route.fallback();
  });
  await page.goto('/');
  await expect(page.locator('#reintentar')).toBeVisible();
  falla = false;
  await page.locator('#reintentar').click();
  await expect(page.locator('.personaje')).toHaveCount(1);
  await page.locator('#siguiente').click();
  await expect(page.locator('#pagina')).toHaveText('Página 2 de 2');
  await page.locator('#anterior').click();
  await expect(page.locator('#pagina')).toHaveText('Página 1 de 2');
});

test('API real: imagen y detalles de personaje, ubicación y episodio', async ({ page }) => {
  test.skip(process.env.LIVE_API !== '1', 'Se ejecuta con npm run test:live; necesita internet.');
  await page.goto('/');
  await expect(page.locator('#resumen')).toContainText('episodios', { timeout: 30000 });
  await page.locator('.personaje').first().click();
  await expect(page.locator('#contenido-detalle')).toContainText('Primer episodio:', { timeout: 30000 });
  await expect(page.locator('#error-detalle')).toBeEmpty();
  await expect.poll(() => page.locator('#contenido-detalle img').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
});
