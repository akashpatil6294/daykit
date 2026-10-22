import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

export async function checkConverterHealth(url, options = {}) {
  const timeoutMs = options.timeoutMs ?? 10000;
  const fetchFn = options.fetch ?? fetch;
  let remote = false;
  let reason = 'No converter endpoint configured';
  if (!url) {
    return { remote: false, reason };
  }
  try {
    const endpoint = new URL(url);
    if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password) {
      throw new Error('HTTPS endpoint required');
    }
    const response = await fetchFn(new URL('/healthz', endpoint), {
      signal: AbortSignal.timeout(timeoutMs),
    });
    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    remote = response.ok && data !== null && data.ok === true;
    reason = remote ? 'Converter health check passed' : 'Converter health check failed';
  } catch {
    reason = 'Converter health check failed';
  }
  return { remote, reason };
}

export async function preparePublication(options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const env = options.env ?? { ...loadEnv('production', cwd, ''), ...process.env };
  const targetDir = options.targetDir ?? path.join(cwd, '.astro');
  const checkHealth = options.checkConverterHealth ?? checkConverterHealth;
  
  // FIX: Increased timeout to 60 seconds so Render's free tier has time to wake up
  const { remote, reason } = await checkHealth(env.PUBLIC_CONVERTER_URL, { ...options, timeoutMs: 60000 });
  
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(
    path.join(targetDir, 'publication.json'),
    JSON.stringify({ remote, reason, locales: env.PUBLIC_LOCALES || 'en' }),
  );
  return { remote, reason, locales: env.PUBLIC_LOCALES || 'en' };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const { reason } = await preparePublication();
  console.log(reason);
}