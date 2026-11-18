// Builds the site twice (published only, then with drafts) and serves both for Playwright.
// The drafts server starts first; the main server, which Playwright waits for, starts once
// the drafts server answers, so both are ready when the tests begin.
import { spawn, spawnSync } from 'node:child_process';

const astro = 'node_modules/.bin/astro';
const drafts = { ...process.env, SHOW_DRAFTS: 'true' };
const servers = [];

for (const env of [process.env, drafts]) {
  const build = spawnSync(astro, ['build'], { env, stdio: 'inherit' });
  if (build.status !== 0) process.exit(build.status ?? 1);
}

function serve(port, env) {
  const server = spawn(astro, ['preview', '--port', String(port), '--ignore-lock'], {
    env,
    stdio: 'inherit',
  });
  server.on('exit', (code) => code && process.exit(code));
  servers.push(server);
}

async function waitFor(url, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // not listening yet
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`${url} did not start within ${timeoutMs / 1000} s`);
}

const stop = () => {
  servers.forEach((server) => server.kill());
  process.exit(0);
};
process.on('SIGTERM', stop);
process.on('SIGINT', stop);

serve(4322, drafts);
await waitFor('http://localhost:4322/');
serve(4321, process.env);
