const path = require('node:path');
const { spawn } = require('node:child_process');

// Use the locally installed MCP server without downloading it when starting the agent.
const cli = path.resolve(__dirname, '../node_modules/@playwright/mcp/cli.js');
const child = spawn(process.execPath, [
  cli, '--browser', process.env.PLAYWRIGHT_CHANNEL || 'msedge',
  '--headless', '--isolated', '--output-dir', path.resolve(__dirname, '../artifacts/mcp')
], { stdio: 'inherit', windowsHide: true });
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
