import { test, expect } from '@playwright/test';

const baseApi = 'https://rickandmortyapi.com/api';
const character = {
  id: 1, name: 'Rick Sanchez', species: 'Human', status: 'Alive', gender: 'Male',
  image: `${baseApi}/character/avatar/1.jpeg`, origin: { name: 'Earth' },
  location: { name: 'Earth', url: `${baseApi}/location/1` }, episode: [`${baseApi}/episode/1`]
};

async function mockApi(page) {
  const requests = [];
  await page.route(`${baseApi}/**`, async route => {
    const url = new URL(route.request().url());
    requests.push({ path: url.pathname, name: url.searchParams.get('name') });
    if (url.pathname.includes('/avatar/')) {
      await route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#ddd"/></svg>' }); return;
    }
    if (url.searchParams.get('name') === 'no-existe') { await route.fulfill({ status: 404, json: {} }); return; }
    let result;
    if (url.pathname === '/api/character') result = { info: { count: 1, pages: 2 }, results: [character] };
    else if (url.pathname === '/api/character/1') result = character;
    else if (url.pathname === '/api/location/1') result = { name: 'Earth', dimension: 'C-137' };
    else if (url.pathname === '/api/episode/1') result = { episode: 'S01E01', name: 'Pilot', air_date: 'December 2, 2013' };
    else result = { info: { count: 50 }, results: [] };
    await route.fulfill({ json: result });
  });
  return requests;
}

test('three resources, image cards, details and Escape dismissal', async ({ page }) => {
  const requests = await mockApi(page);
  await page.goto('/');
  await expect(page.locator('#summary')).toContainText('episodios');
  await page.getByRole('button', { name: 'Ver detalles de Rick Sanchez' }).click();
  await expect(page.locator('#details')).toBeVisible();
  await expect(page.locator('#details-content')).toContainText('S01E01');
  await expect(page.locator('#details-content')).toContainText('C-137');
  await expect(page.locator('#details-content img')).toBeVisible();
  expect(requests.some(q => q.path === '/api/character')).toBe(true);
  expect(requests.some(q => q.path === '/api/location')).toBe(true);
  expect(requests.some(q => q.path === '/api/episode')).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.locator('#details')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Ver detalles de Rick Sanchez' })).toBeFocused();
  await page.setViewportSize({ width: 375, height: 850 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('4000 ms debounce, keystroke reset, spinner and empty results', async ({ page }) => {
  await page.clock.install();
  const requests = await mockApi(page);
  await page.goto('/');
  await expect(page.locator('.character')).toHaveCount(1);
  await page.locator('#character-search').fill('Rick');
  await expect(page.locator('#spinner')).toBeVisible();
  await page.clock.runFor(2500);
  expect(requests.some(q => q.name === 'Rick')).toBe(false);
  await page.locator('#character-search').fill('Morty');
  await page.clock.runFor(3999);
  expect(requests.some(q => q.name === 'Morty')).toBe(false);
  await page.clock.runFor(1);
  await expect(page.locator('.character')).toHaveCount(1);
  expect(requests.some(q => q.name === 'Morty')).toBe(true);
  expect(requests.some(q => q.name === 'Rick')).toBe(false);
  await expect(page.locator('#spinner')).toBeHidden();
  await page.locator('#character-search').fill('no-existe');
  await page.clock.runFor(4000);
  await expect(page.locator('#character-status')).toContainText('No hay personajes');
  await expect(page.locator('.character')).toHaveCount(0);
});

test('pagination and API error recovery', async ({ page }) => {
  await mockApi(page);
  let shouldFail = true;
  await page.route(`${baseApi}/character?*`, async route => {
    if (shouldFail) await route.fulfill({ status: 503, json: {} });
    else await route.fallback();
  });
  await page.goto('/');
  await expect(page.locator('#retry')).toBeVisible();
  shouldFail = false;
  await page.locator('#retry').click();
  await expect(page.locator('.character')).toHaveCount(1);
  await page.locator('#next').click();
  await expect(page.locator('#page-number')).toHaveText('Página 2 de 2');
  await page.locator('#previous').click();
  await expect(page.locator('#page-number')).toHaveText('Página 1 de 2');
});

test('live API: character image, location and episode details', async ({ page }) => {
  test.skip(process.env.LIVE_API !== '1', 'Run with npm run test:live; requires internet.');
  await page.goto('/');
  await expect(page.locator('#summary')).toContainText('episodios', { timeout: 30000 });
  await page.locator('.character').first().click();
  await expect(page.locator('#details-content')).toContainText('Primer episodio:', { timeout: 30000 });
  await expect(page.locator('#details-error')).toBeEmpty();
  await expect.poll(() => page.locator('#details-content img').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
});
