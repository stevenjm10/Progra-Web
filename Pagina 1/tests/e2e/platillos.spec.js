import { test, expect } from '@playwright/test';

test('inicio, tarjetas de texto, búsqueda inmediata y botones de regreso', async ({ page }) => {
  const errores = [];
  page.on('pageerror', e => errores.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Platillos del restaurante' })).toBeVisible();
  await expect(page.locator('#buscar')).toBeEnabled();
  await expect(page.locator('#tarjetas img, #tarjetas button, #tarjetas a')).toHaveCount(0);
  await expect(page.locator('details, form, table')).toHaveCount(0);
  await page.locator('#buscar').fill('platillo-que-no-existe-123456');
  await expect(page.locator('#tarjetas article')).toHaveCount(0);
  await expect(page.locator('#estado')).toContainText('No se encontraron');
  await page.getByRole('link', { name: 'Lista de platillos', exact: true }).click();
  await expect(page).toHaveURL(/lista-platillos.html$/);
  await page.getByRole('link', { name: 'Regresar', exact: true }).click();
  await page.getByRole('link', { name: 'Nuevo platillo', exact: true }).click();
  await expect(page).toHaveURL(/nuevo-platillo.html$/);
  await page.getByRole('link', { name: 'Regresar', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Platillos del restaurante' })).toBeVisible();
  await page.setViewportSize({ width: 375, height: 850 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errores).toEqual([]);
});

test('CRUD completo desde la UI con persistencia real y limpieza del registro temporal', async ({ page, request }) => {
  const nombre = `E2E-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  try {
    await page.goto('/nuevo-platillo.html');
    await page.getByLabel('Nombre', { exact: true }).fill(nombre);
    await page.getByLabel('Categoría', { exact: true }).fill('Prueba temporal');
    await page.getByLabel('Descripción', { exact: true }).fill('Se elimina al terminar la prueba.');
    await page.getByLabel('Precio ($)', { exact: true }).fill('4.50');
    await page.getByRole('button', { name: 'Guardar platillo', exact: true }).click();
    await expect(page).toHaveURL(/lista-platillos.html$/);
    await page.reload();
    let fila = page.getByRole('row').filter({ has: page.getByRole('cell', { name: nombre, exact: true }) });
    await expect(fila).toHaveCount(1);
    await fila.getByRole('link', { name: `Editar ${nombre}`, exact: true }).click();
    await expect(page.getByLabel('Nombre', { exact: true })).toHaveValue(nombre);
    await page.getByLabel('Precio ($)', { exact: true }).fill('5.25');
    await page.getByRole('button', { name: 'Guardar cambios', exact: true }).click();
    await expect(page).toHaveURL(/lista-platillos.html$/);
    await page.reload();
    fila = page.getByRole('row').filter({ has: page.getByRole('cell', { name: nombre, exact: true }) });
    await expect(fila).toContainText(/5[,.]25/);
    await page.goto('/');
    await expect(page.locator('#buscar')).toBeEnabled();
    await page.locator('#buscar').fill(nombre);
    await expect(page.locator('#tarjetas article')).toHaveCount(1);
    await page.getByRole('link', { name: 'Lista de platillos', exact: true }).click();
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: `Eliminar ${nombre}`, exact: true }).click();
    await expect(page.getByRole('cell', { name: nombre, exact: true })).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole('cell', { name: nombre, exact: true })).toHaveCount(0);
  } finally {
    const respuesta = await request.get('/api/platillos');
    if (respuesta.ok()) {
      for (const platillo of (await respuesta.json()).filter(p => p.nombre === nombre)) {
        const borrado = await request.delete(`/api/platillos/${platillo.id}`);
        expect(borrado.ok(), 'No se pudo eliminar el registro temporal').toBe(true);
      }
    } else throw new Error('No se pudo comprobar la limpieza del platillo temporal.');
  }
});

test('editar un ID inexistente no permite crear ni sobrescribir otro platillo', async ({ page }) => {
  await page.goto('/nuevo-platillo.html?id=9223372036854775807');
  await expect(page.locator('#mensaje')).toContainText('no existe');
  await expect(page.locator('#guardar')).toBeDisabled();
  await page.getByRole('link', { name: 'Regresar', exact: true }).click();
  await expect(page).toHaveURL(/lista-platillos.html$/);
});
