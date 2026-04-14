/**
 * Noiva & Dates — Otimização de Imagens
 *
 * Uso: node optimize-images.js
 *
 * Para cada imagem JPG/PNG nas pastas de seção:
 *   1. Redimensiona se ultrapassar a largura máxima da seção
 *   2. Gera versão WebP (qualidade 82) — carregamento ~30% mais rápido
 *   3. Regrava o original como JPEG progressivo (qualidade 88)
 *
 * Pastas e limites de largura:
 *   hero/        → 1400px
 *   sobre/       →  900px
 *   portfolio/   →  900px
 *   depoimentos/ →  300px (avatares)
 */

import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SECTIONS = {
  hero:        { maxWidth: 1400 },
  sobre:       { maxWidth:  900 },
  portfolio:   { maxWidth:  900 },
  depoimentos: { maxWidth:  300 },
};

const BASE       = path.join(__dirname, 'assets', 'images');
const WEBP_Q     = 82;   // qualidade WebP (0-100)
const JPEG_Q     = 88;   // qualidade JPEG progressivo (0-100)
const INPUT_EXT  = /\.(jpg|jpeg|png)$/i;

let converted = 0;
let skipped   = 0;

async function processImage(filePath, maxWidth) {
  const parsed  = path.parse(filePath);
  const webpOut = path.join(parsed.dir, `${parsed.name}.webp`);

  const meta = await sharp(filePath).metadata();

  // 1. WebP — gera se ainda não existe
  if (!existsSync(webpOut)) {
    let pipeline = sharp(filePath);
    if (meta.width > maxWidth) pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
    await pipeline.webp({ quality: WEBP_Q, effort: 5 }).toFile(webpOut);
    console.log(`  ✓ WebP  → ${path.relative(__dirname, webpOut)}`);
    converted++;
  } else {
    skipped++;
  }

  // 2. JPEG progressivo — substitui original se for JPG (PNG fica intacto)
  if (/\.(jpg|jpeg)$/i.test(filePath)) {
    const tmpOut = filePath + '.tmp';
    let pipeline = sharp(filePath);
    if (meta.width > maxWidth) pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
    await pipeline
      .jpeg({ quality: JPEG_Q, progressive: true, mozjpeg: true })
      .toFile(tmpOut);

    const origSize = (await stat(filePath)).size;
    const newSize  = (await stat(tmpOut)).size;

    if (newSize < origSize) {
      const { rename } = await import('fs/promises');
      await rename(tmpOut, filePath);
      const saving = (((origSize - newSize) / origSize) * 100).toFixed(0);
      console.log(`  ✓ JPEG  → ${path.relative(__dirname, filePath)} (-${saving}%)`);
    } else {
      const { unlink } = await import('fs/promises');
      await unlink(tmpOut); // já estava bom — descarta o tmp
    }
  }
}

async function run() {
  console.log('\n🖼  Noiva & Dates — Otimizando imagens...\n');

  for (const [section, { maxWidth }] of Object.entries(SECTIONS)) {
    const dir = path.join(BASE, section);
    if (!existsSync(dir)) continue;

    const files  = await readdir(dir);
    const images = files.filter(f => INPUT_EXT.test(f));

    if (images.length === 0) {
      console.log(`[${section}/] — nenhuma imagem encontrada ainda.`);
      continue;
    }

    console.log(`[${section}/] — ${images.length} imagem(ns) encontrada(s):`);
    for (const file of images) {
      await processImage(path.join(dir, file), maxWidth);
    }
  }

  console.log(`\n✅ Concluído — ${converted} arquivo(s) convertido(s), ${skipped} já otimizado(s).\n`);
}

run().catch(err => {
  console.error('\n❌ Erro:', err.message);
  process.exit(1);
});
