#!/usr/bin/env node
// Simple PNG generator without external deps.
// Produces rounded-square chat bubble icons in multiple sizes.
import { mkdir, writeFile, cp } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');
const outDir = resolve(root, 'extension/icons');
const mirrorDir = resolve(root, 'assets/icons');

const SIZES = [16, 32, 48, 128, 256];

function toRGBA(hex, a = 255) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return [r, g, b, a];
}

const PURPLE = toRGBA('6A5AE0');
const WHITE = toRGBA('FFFFFF');

function makeBuffer(w, h) {
  return new Uint8ClampedArray(w * h * 4);
}

function setPixel(buf, w, x, y, rgba) {
  const i = (y * w + x) * 4;
  buf[i] = rgba[0];
  buf[i + 1] = rgba[1];
  buf[i + 2] = rgba[2];
  buf[i + 3] = rgba[3];
}

function fillRoundedRect(buf, w, h, x0, y0, x1, y1, r, color) {
  for (let y = Math.max(0, Math.floor(y0)); y < Math.min(h, Math.ceil(y1)); y++) {
    for (let x = Math.max(0, Math.floor(x0)); x < Math.min(w, Math.ceil(x1)); x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      const insideCore = px >= x0 + r && px <= x1 - r && py >= y0 && py <= y1;
      const insideCore2 = px >= x0 && px <= x1 && py >= y0 + r && py <= y1 - r;
      let inside = insideCore || insideCore2;
      if (!inside) {
        // corners
        const corners = [
          [x0 + r, y0 + r],
          [x1 - r, y0 + r],
          [x0 + r, y1 - r],
          [x1 - r, y1 - r]
        ];
        for (const [cx, cy] of corners) {
          const dx = px - cx;
          const dy = py - cy;
          if (dx * dx + dy * dy <= r * r) {
            inside = true;
            break;
          }
        }
      }
      if (inside) setPixel(buf, w, x, y, color);
    }
  }
}

function fillRect(buf, w, h, x0, y0, x1, y1, color) {
  const xs = Math.max(0, Math.floor(x0));
  const xe = Math.min(w, Math.ceil(x1));
  const ys = Math.max(0, Math.floor(y0));
  const ye = Math.min(h, Math.ceil(y1));
  for (let y = ys; y < ye; y++) {
    for (let x = xs; x < xe; x++) setPixel(buf, w, x, y, color);
  }
}

function fillTriangle(buf, w, h, ax, ay, bx, by, cx, cy, color) {
  // Barycentric fill for solid triangle
  const minX = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
  const maxX = Math.min(w - 1, Math.ceil(Math.max(ax, bx, cx)));
  const minY = Math.max(0, Math.floor(Math.min(ay, by, cy)));
  const maxY = Math.min(h - 1, Math.ceil(Math.max(ay, by, cy)));
  const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  if (area === 0) return;
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const px = x + 0.5;
      const py = y + 0.5;
      const w0 = (bx - ax) * (py - ay) - (by - ay) * (px - ax);
      const w1 = (cx - bx) * (py - by) - (cy - by) * (px - bx);
      const w2 = (ax - cx) * (py - cy) - (ay - cy) * (px - cx);
      if ((w0 >= 0 && w1 >= 0 && w2 >= 0 && area > 0) || (w0 <= 0 && w1 <= 0 && w2 <= 0 && area < 0)) {
        setPixel(buf, w, x, y, color);
      }
    }
  }
}

function encodePNG(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[(w * 4 + 1) * y] = 0; // filter type 0
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const o = (w * 4 + 1) * y + 1 + x * 4;
      raw[o] = rgba[i];
      raw[o + 1] = rgba[i + 1];
      raw[o + 2] = rgba[i + 2];
      raw[o + 3] = rgba[i + 3];
    }
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  const chunks = [];
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  chunks.push(sig);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  chunks.push(makeChunk('IHDR', ihdr));
  chunks.push(makeChunk('IDAT', idat));
  chunks.push(makeChunk('IEND', Buffer.alloc(0)));
  return Buffer.concat(chunks);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type);
  const crc = crc32(Buffer.concat([t, data]));
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc >>> 0, 0);
  return Buffer.concat([len, t, data, crcBuf]);
}

// CRC32 implementation
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function drawIcon(size) {
  const w = size;
  const h = size;
  const buf = makeBuffer(w, h);

  // Transparent background (buf already zeroed)

  // Purple rounded square with padding
  const pad = Math.round(size * 0.08);
  const x0 = pad;
  const y0 = pad;
  const x1 = size - pad;
  const y1 = size - pad;
  const radius = Math.round((x1 - x0) * 0.27);
  fillRoundedRect(buf, w, h, x0, y0, x1, y1, radius, PURPLE);

  // White chat bubble inside
  const inset = Math.round(size * 0.20);
  const bx0 = x0 + inset;
  const by0 = y0 + inset * 0.8;
  const bx1 = x1 - inset * 0.6;
  const by1 = y1 - inset * 0.9;
  const br = Math.max(2, Math.round(size * 0.12));
  fillRoundedRect(buf, w, h, bx0, by0, bx1, by1, br, WHITE);
  // Tail at bottom-left
  const tailW = Math.max(2, Math.round(size * 0.16));
  const tailH = Math.max(2, Math.round(size * 0.12));
  fillTriangle(
    buf,
    w,
    h,
    bx0 + br * 0.6,
    by1 - br * 0.4,
    bx0 + br * 0.6 + tailW,
    by1 - br * 0.4,
    bx0 + br * 0.6,
    by1 - br * 0.4 + tailH,
    WHITE
  );

  // Text lines inside bubble (purple)
  const linePadX = Math.round((bx1 - bx0) * 0.12);
  const linePadY = Math.round((by1 - by0) * 0.18);
  const lineGap = Math.max(1, Math.round((by1 - by0) * 0.16));
  const lineH = Math.max(1, Math.round((by1 - by0) * 0.12));
  for (let i = 0; i < 3; i++) {
    const ly0 = by0 + linePadY + i * (lineH + lineGap);
    const ly1 = ly0 + lineH;
    const lx0 = bx0 + linePadX;
    const lx1 = bx1 - linePadX * (i === 0 ? 0.2 : i === 1 ? 0.1 : 0); // first line shorter
    fillRoundedRect(buf, w, h, lx0, ly0, lx1, ly1, Math.max(1, Math.round(lineH / 2)), PURPLE);
  }

  return buf;
}

async function main() {
  await mkdir(outDir, { recursive: true });
  await mkdir(mirrorDir, { recursive: true });
  for (const size of SIZES) {
    const rgba = drawIcon(size);
    const png = encodePNG(size, size, rgba);
    const name = `icon-${size}.png`;
    const outPath = resolve(outDir, name);
    await writeFile(outPath, png);
    // Also mirror to assets/icons for reference
    await cp(outPath, resolve(mirrorDir, name));
    console.log('Wrote', outPath);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

