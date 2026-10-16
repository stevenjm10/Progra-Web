import { test, expect } from '@playwright/test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import fs from 'node:fs';
import path from 'node:path';

test('conexión MCP real y validación UI a través de sus herramientas', async ({ baseURL }, testInfo) => {
  test.setTimeout(120000);
  const proyecto = JSON.parse(fs.readFileSync('package.json', 'utf8')).name;
  const esPlatillos = proyecto === 'platillos-restaurante';
  const transporte = new StdioClientTransport({
    command: process.execPath, args: [path.resolve('tools/playwright-mcp.cjs')], cwd: process.cwd(), stderr: 'pipe'
  });
  const cliente = new Client({ name: `validador-ui-${proyecto}`, version: '1.0.0' });
  const evidencia = [];
  let conectado = false;
  let ejecutar;
  async function llamar(name, args) {
    const resultado = await cliente.callTool({ name, arguments: args }, undefined, { timeout: 60000 });
    const salida = resultado.content.filter(c => c.type === 'text').map(c => c.text).join('\n');
    evidencia.push({ herramienta: name, resultado: salida });
    expect(resultado.isError, salida).not.toBe(true);
    return salida;
  }
  try {
    await cliente.connect(transporte);
    conectado = true;
    const { tools } = await cliente.listTools();
    ejecutar = tools.find(t => t.name === 'browser_run_code' || t.name === 'browser_run_code_unsafe');
    expect(ejecutar, 'No está disponible la herramienta de ejecución de Playwright').toBeTruthy();
    await llamar('browser_navigate', { url: baseURL });
    if (esPlatillos) {
      await llamar(ejecutar.name, { code: `async (page) => {
        await page.locator('#buscar').waitFor({ state: 'visible' });
        await page.waitForFunction(() => !document.getElementById('buscar').disabled);
        if (await page.locator('#tarjetas img, #tarjetas button, #tarjetas a').count()) throw new Error('Tarjetas interactivas o con imágenes');
        await page.getByRole('link', { name: 'Lista de platillos', exact: true }).click();
        await page.waitForURL('**/lista-platillos.html');
        await page.getByRole('link', { name: 'Regresar', exact: true }).click();
        await page.getByRole('link', { name: 'Nuevo platillo', exact: true }).click();
        await page.waitForURL('**/nuevo-platillo.html');
        await page.getByLabel('Nombre', { exact: true }).fill('Comprobación MCP sin guardar');
        await page.getByRole('link', { name: 'Regresar', exact: true }).click();
        await page.waitForFunction(() => !document.getElementById('buscar').disabled);
        return { titulo: await page.title(), tarjetas: await page.locator('#tarjetas article').count(), navegacion: 'correcta', datosModificados: false };
      }` });
    } else {
      await llamar(ejecutar.name, { code: `async (page) => {
        await page.locator('.personaje').first().waitFor({ timeout: 30000 });
        await page.locator('.personaje').first().click();
        let reintentos = 0;
        for (let intento = 0; intento < 3; intento++) {
          await page.waitForFunction(() => document.getElementById('contenido-detalle').textContent.includes('Primer episodio:') || document.getElementById('error-detalle').textContent, null, { timeout: 30000 });
          const error = await page.locator('#error-detalle').innerText();
          if (!error) break;
          if (intento === 2) throw new Error('API real: ' + error);
          await page.getByRole('button', { name: 'Reintentar detalles', exact: true }).click();
          reintentos++;
        }
        const detalle = await page.locator('#contenido-detalle').innerText();
        await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
        const consultas = [];
        const escuchar = request => { if (request.url().includes('/api/character?') && new URL(request.url()).searchParams.get('name') === 'Morty') consultas.push(Date.now()); };
        page.on('request', escuchar);
        try {
          const inicio = Date.now();
          await page.locator('#buscar-personaje').fill('Morty');
          if (!await page.locator('#spinner').isVisible()) throw new Error('No aparece el spinner');
          await page.waitForFunction(() => document.getElementById('spinner').hidden, null, { timeout: 30000 });
          if (!consultas.length || consultas[0] - inicio < 3900) throw new Error('No se respetan los cuatro segundos');
          if (!await page.locator('.personaje').count()) throw new Error('No hay resultados para Morty');
          return { detalle, esperaMs: consultas[0] - inicio, tarjetas: await page.locator('.personaje').count(), api: 'real', reintentosDetalle: reintentos };
        } finally { page.off('request', escuchar); }
      }` });
    }
    const captura = testInfo.outputPath('mcp-pagina.png');
    await llamar(ejecutar.name, { code: `async (page) => { await page.screenshot({ path: ${JSON.stringify(captura)}, fullPage: true }); return 'Captura guardada'; }` });
    await testInfo.attach('captura-mcp', { path: captura, contentType: 'image/png' });
    await llamar('browser_snapshot', {});
  } finally {
    if (conectado && ejecutar && testInfo.status !== testInfo.expectedStatus) {
      try {
        const instantanea = await cliente.callTool({ name: 'browser_snapshot', arguments: {} });
        evidencia.push({ herramienta: 'browser_snapshot', resultado: instantanea.content });
        const captura = testInfo.outputPath('mcp-error.png');
        const resultado = await cliente.callTool({ name: ejecutar.name, arguments: { code: `async (page) => { await page.screenshot({ path: ${JSON.stringify(captura)}, fullPage: true }); }` } });
        if (!resultado.isError && fs.existsSync(captura)) await testInfo.attach('captura-error-mcp', { path: captura, contentType: 'image/png' });
      } catch (error) { evidencia.push({ capturaError: error.message }); }
    }
    await testInfo.attach('llamadas-mcp', { body: JSON.stringify(evidencia, null, 2), contentType: 'application/json' });
    await cliente.close();
    await transporte.close();
  }
});
