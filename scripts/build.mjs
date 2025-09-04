#!/usr/bin/env node
import { build, context } from 'esbuild';
import { mkdir, cp } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const root = resolve(__dirname, '..');
const distDir = resolve(root, 'dist');

const isWatch = process.argv.includes('--watch');

async function copyStatic() {
  // Copy manifest and public assets into dist
  await mkdir(distDir, { recursive: true });
  await cp(resolve(root, 'extension'), distDir, { recursive: true });
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
