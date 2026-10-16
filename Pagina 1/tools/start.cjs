const path = require('node:path');
const fs = require('node:fs');
const { spawn } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const port = process.env.PORT || '8080';
if (!/^\d+$/.test(port)) throw new Error('PORT must be numeric.');
const env = { ...process.env };
env.SERVER_PORT = port;
if (process.platform === 'win32' && (!env.JAVA_HOME || !fs.existsSync(path.join(env.JAVA_HOME, 'bin/java.exe')))) {
  const localJava = 'C:/Program Files/Java/jdk-17';
  if (fs.existsSync(path.join(localJava, 'bin/java.exe'))) env.JAVA_HOME = localJava;
}
const windows = process.platform === 'win32';
const command = windows ? (process.env.ComSpec || 'cmd.exe') : './mvnw';
const args = windows
  ? ['/d', '/c', 'mvnw.cmd', 'spring-boot:run']
  : ['spring-boot:run'];
const child = spawn(command, args, { cwd: root, env, stdio: 'inherit', windowsHide: true });
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  if (windows && child.pid) spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], { windowsHide: true, stdio: 'ignore' });
  else child.kill(signal);
});
