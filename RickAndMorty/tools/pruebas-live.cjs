const path = require('node:path');
const { spawn } = require('node:child_process');
const cli = path.resolve(__dirname, '../node_modules/@playwright/test/cli.js');
const child = spawn(process.execPath, [cli, 'test', 'tests/e2e'], {
  stdio: 'inherit', windowsHide: true, env: { ...process.env, LIVE_API: '1' }
});
child.on('exit', code => { process.exitCode = code ?? 1; });
