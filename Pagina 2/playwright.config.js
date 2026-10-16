import { defineConfig } from '@playwright/test';

const port = process.env.E2E_PORT || '8091';
if (!/^\d+$/.test(port)) throw new Error('E2E_PORT debe ser numérico.');

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  expect: { timeout: 15000 },
  workers: 1,
  fullyParallel: false,
  outputDir: 'artifacts/resultados',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'artifacts/reporte-html', open: 'never' }],
    ['json', { outputFile: 'artifacts/resultados.json' }]
  ],
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    browserName: 'chromium',
    channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge',
    headless: true,
    viewport: { width: 1280, height: 850 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'npm run start',
    url: `http://127.0.0.1:${port}/`,
    timeout: 120000,
    reuseExistingServer: false,
    env: { PORT: port },
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 }
  }
});
