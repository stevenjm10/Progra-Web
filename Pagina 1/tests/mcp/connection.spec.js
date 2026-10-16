import { test, expect } from '@playwright/test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import fs from 'node:fs';
import path from 'node:path';

test('real MCP connection and UI validation through its tools', async ({ baseURL }, testInfo) => {
  test.setTimeout(120000);
  const project = JSON.parse(fs.readFileSync('package.json', 'utf8')).name;
  const isDishesProject = project === 'restaurant-dishes';
  const transport = new StdioClientTransport({
    command: process.execPath, args: [path.resolve('tools/playwright-mcp.cjs')], cwd: process.cwd(), stderr: 'pipe'
  });
  const client = new Client({ name: `ui-validator-${project}`, version: '1.0.0' });
  const evidence = [];
  let connected = false;
  let runCode;
  async function callTool(name, args) {
    const result = await client.callTool({ name, arguments: args }, undefined, { timeout: 60000 });
    const output = result.content.filter(c => c.type === 'text').map(c => c.text).join('\n');
    evidence.push({ tool: name, result: output });
    expect(result.isError, output).not.toBe(true);
    return output;
  }
  try {
    await client.connect(transport);
    connected = true;
    const { tools } = await client.listTools();
    runCode = tools.find(t => t.name === 'browser_run_code' || t.name === 'browser_run_code_unsafe');
    expect(runCode, 'The Playwright execution tool is unavailable').toBeTruthy();
    await callTool('browser_navigate', { url: baseURL });
    if (isDishesProject) {
      await callTool(runCode.name, { code: `async (page) => {
        await page.locator('#search').waitFor({ state: 'visible' });
        await page.waitForFunction(() => !document.getElementById('search').disabled);
        if (await page.locator('#cards img, #cards button, #cards a').count()) throw new Error('Unexpected interactive cards or images');
        await page.getByRole('link', { name: 'Lista de platillos', exact: true }).click();
        await page.waitForURL('**/dish-list.html');
        await page.getByRole('link', { name: 'Regresar', exact: true }).click();
        await page.getByRole('link', { name: 'Nuevo platillo', exact: true }).click();
        await page.waitForURL('**/dish-form.html');
        await page.getByLabel('Nombre', { exact: true }).fill('Unsaved MCP check');
        await page.getByRole('link', { name: 'Regresar', exact: true }).click();
        await page.waitForFunction(() => !document.getElementById('search').disabled);
        return { title: await page.title(), cards: await page.locator('#cards article').count(), navigation: 'passed', dataChanged: false };
      }` });
    } else {
      await callTool(runCode.name, { code: `async (page) => {
        await page.locator('.character').first().waitFor({ timeout: 30000 });
        await page.locator('.character').first().click();
        let retries = 0;
        for (let attempt = 0; attempt < 3; attempt++) {
          await page.waitForFunction(() => document.getElementById('details-content').textContent.includes('Primer episodio:') || document.getElementById('details-error').textContent, null, { timeout: 30000 });
          const error = await page.locator('#details-error').innerText();
          if (!error) break;
          if (attempt === 2) throw new Error('Live API: ' + error);
          await page.getByRole('button', { name: 'Reintentar detalles', exact: true }).click();
          retries++;
        }
        const detail = await page.locator('#details-content').innerText();
        await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
        const requests = [];
        const onRequest = request => { if (request.url().includes('/api/character?') && new URL(request.url()).searchParams.get('name') === 'Morty') requests.push(Date.now()); };
        page.on('request', onRequest);
        try {
          const startTime = Date.now();
          await page.locator('#character-search').fill('Morty');
          if (!await page.locator('#spinner').isVisible()) throw new Error('The spinner is not visible');
          await page.waitForFunction(() => document.getElementById('spinner').hidden, null, { timeout: 30000 });
          if (!requests.length || requests[0] - startTime < 3900) throw new Error('The four-second delay was not respected');
          if (!await page.locator('.character').count()) throw new Error('No results for Morty');
          return { detail, elapsedMs: requests[0] - startTime, cards: await page.locator('.character').count(), api: 'real', detailRetries: retries };
        } finally { page.off('request', onRequest); }
      }` });
    }
    const screenshot = testInfo.outputPath('mcp-page.png');
    await callTool(runCode.name, { code: `async (page) => { await page.screenshot({ path: ${JSON.stringify(screenshot)}, fullPage: true }); return 'Screenshot saved'; }` });
    await testInfo.attach('mcp-screenshot', { path: screenshot, contentType: 'image/png' });
    await callTool('browser_snapshot', {});
  } finally {
    if (connected && runCode && testInfo.status !== testInfo.expectedStatus) {
      try {
        const snapshot = await client.callTool({ name: 'browser_snapshot', arguments: {} });
        evidence.push({ tool: 'browser_snapshot', result: snapshot.content });
        const screenshot = testInfo.outputPath('mcp-error.png');
        const result = await client.callTool({ name: runCode.name, arguments: { code: `async (page) => { await page.screenshot({ path: ${JSON.stringify(screenshot)}, fullPage: true }); }` } });
        if (!result.isError && fs.existsSync(screenshot)) await testInfo.attach('mcp-error-screenshot', { path: screenshot, contentType: 'image/png' });
      } catch (error) { evidence.push({ screenshotError: error.message }); }
    }
    await testInfo.attach('mcp-calls', { body: JSON.stringify(evidence, null, 2), contentType: 'application/json' });
    await client.close();
    await transport.close();
  }
});
