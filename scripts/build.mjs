#!/usr/bin/env node
import { build, context } from 'esbuild';
import { mkdir, cp } from 'node:fs/promises';
import { watch as fsWatch } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const root = resolve(__dirname, '..');
const distDir = resolve(root, 'dist');
const staticDir = resolve(root, 'extension');

const isWatch = process.argv.includes('--watch');

async function copyStatic() {
  // Copy manifest and public assets into dist
  await mkdir(distDir, { recursive: true });
  await cp(staticDir, distDir, { recursive: true });
}

function watchStatic() {
  let timer = null;
  const trigger = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        await copyStatic();
        console.log('[copy] extension → dist');
      } catch (e) {
        console.error('[copy] failed:', e);
      }
    }, 120);
  };

  try {
    const watcher = fsWatch(staticDir, { recursive: true }, (_event, filename) => {
      if (filename && !filename.toString().startsWith('.')) trigger();
    });
    watcher.on('error', (e) => console.warn('[watch] static error:', e?.message || e));
    console.log('Watching static: extension/');
  } catch (e) {
    // Fallback: non-recursive
    try {
      const watcher = fsWatch(staticDir, {}, () => trigger());
      watcher.on('error', (e2) => console.warn('[watch] static error:', e2?.message || e2));
      console.log('Watching static (non-recursive): extension/');
    } catch (e2) {
      console.warn('[watch] static disabled:', e2?.message || e2);
    }
  }
}

async function run() {
  const common = {
    bundle: true,
    sourcemap: true,
    target: 'es2020',
    outdir: distDir,
    logLevel: 'info',
    format: 'esm',
    platform: 'browser'
  };

  // Output background to dist/index.js to match manifest
  const entryPoints = {
    index: resolve(root, 'src/background/index.ts')
    // Add more entries if you add content/popup scripts, e.g.:
    // 'content/content': resolve(root, 'src/content/index.ts')
  };

  if (isWatch) {
    const ctx = await context({ ...common, entryPoints });
    await copyStatic();
    watchStatic();
    await ctx.watch();
    console.log('Watching for changes...');
  } else {
    await copyStatic();
    await build({ ...common, entryPoints });
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
