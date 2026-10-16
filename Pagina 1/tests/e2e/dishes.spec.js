import { test, expect } from '@playwright/test';

test('home, text cards, instant search and return buttons', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Platillos del restaurante' })).toBeVisible();
  await expect(page.locator('#search')).toBeEnabled();
  await expect(page.locator('#cards img, #cards button, #cards a')).toHaveCount(0);
  await expect(page.locator('details, form, table')).toHaveCount(0);
  await page.locator('#search').fill('platillo-que-no-existe-123456');
  await expect(page.locator('#cards article')).toHaveCount(0);
  await expect(page.locator('#status')).toContainText('No se encontraron');
  await page.getByRole('link', { name: 'Lista de platillos', exact: true }).click();
  await expect(page).toHaveURL(/dish-list.html$/);
  await page.getByRole('link', { name: 'Regresar', exact: true }).click();
  await page.getByRole('link', { name: 'Nuevo platillo', exact: true }).click();
  await expect(page).toHaveURL(/dish-form.html$/);
  await page.getByRole('link', { name: 'Regresar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Platillos del restaurante' })).toBeVisible();
  await page.setViewportSize({ width: 375, height: 850 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('full UI CRUD with real persistence and temporary record cleanup', async ({ page, request }) => {
  const name = `E2E-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  try {
    await page.goto('/dish-form.html');
    await page.getByLabel('Nombre', { exact: true }).fill(name);
    await page.getByLabel('Categoría', { exact: true }).fill('Prueba temporal');
    await page.getByLabel('Descripción', { exact: true }).fill('Se elimina al terminar la prueba.');
    await page.getByLabel('Precio ($)', { exact: true }).fill('4.50');
    await page.getByRole('button', { name: 'Guardar platillo', exact: true }).click();
    await expect(page).toHaveURL(/dish-list.html$/);
    await page.reload();
    let row = page.getByRole('row').filter({ has: page.getByRole('cell', { name: name, exact: true }) });
    await expect(row).toHaveCount(1);
    await row.getByRole('link', { name: `Editar ${name}`, exact: true }).click();
    await expect(page.getByLabel('Nombre', { exact: true })).toHaveValue(name);
    await page.getByLabel('Precio ($)', { exact: true }).fill('5.25');
    await page.getByRole('button', { name: 'Guardar cambios', exact: true }).click();
    await expect(page).toHaveURL(/dish-list.html$/);
    await page.reload();
    row = page.getByRole('row').filter({ has: page.getByRole('cell', { name: name, exact: true }) });
    await expect(row).toContainText(/5[,.]25/);
    await page.goto('/');
    await expect(page.locator('#search')).toBeEnabled();
    await page.locator('#search').fill(name);
    await expect(page.locator('#cards article')).toHaveCount(1);
    await page.getByRole('link', { name: 'Lista de platillos', exact: true }).click();
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: `Eliminar ${name}`, exact: true }).click();
    await expect(page.getByRole('cell', { name: name, exact: true })).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole('cell', { name: name, exact: true })).toHaveCount(0);
  } finally {
    const response = await request.get('/api/dishes');
    if (response.ok()) {
      for (const dish of (await response.json()).filter(p => p.name === name)) {
        const deleted = await request.delete(`/api/dishes/${dish.id}`);
        expect(deleted.ok(), 'Could not delete the temporary record').toBe(true);
      }
    } else throw new Error('Could not verify temporary dish cleanup.');
  }
});

test('editing a missing ID cannot create or overwrite a dish', async ({ page }) => {
  await page.goto('/dish-form.html?id=9223372036854775807');
  await expect(page.locator('#message')).toContainText('no existe');
  await expect(page.locator('#save')).toBeDisabled();
  await page.getByRole('link', { name: 'Regresar', exact: true }).click();
  await expect(page).toHaveURL(/dish-list.html$/);
});
