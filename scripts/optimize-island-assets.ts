import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Technical re-encoding only: no generated art, cropping, new lighting, or changed registration.
const originalCommit = '6112afc38507eb418bcd15a81be94db1e4a683a7';
const directory = 'src/assets/island-proof';
const evidence = 'docs/evidence/discovery-first';
mkdirSync(evidence, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
const results = [];
try {
  for (const name of ['base', 'soil', 'water', 'tree', 'creature']) {
    const source = execFileSync('git', ['show', `${originalCommit}:${directory}/${name}.png`], { maxBuffer: 16 * 1024 * 1024 });
    const encoded = await page.evaluate(async ({ source, maxWidth }) => {
      const image = new Image(); image.src = source; await image.decode();
      const width = Math.min(maxWidth, image.width), height = Math.round(image.height * width / image.width);
      const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d')!; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(image, 0, 0, width, height);
      const webp = canvas.toDataURL('image/webp', .92);
      if (!webp.startsWith('data:image/webp;')) throw new Error('WebP encoding unsupported');
      const optimized = new Image(); optimized.src = webp; await optimized.decode();
      const originalPixels = ctx.getImageData(0, 0, width, height).data;
      ctx.clearRect(0, 0, width, height); ctx.drawImage(optimized, 0, 0);
      const decodedPixels = ctx.getImageData(0, 0, width, height).data;
      let alphaMaxError = 0, transparentPixels = 0, translucentPixels = 0, rgbSquared = 0, rgbSamples = 0;
      for (let i = 0; i < originalPixels.length; i += 4) {
        const alpha = originalPixels[i + 3]!;
        alphaMaxError = Math.max(alphaMaxError, Math.abs(alpha - decodedPixels[i + 3]!));
        if (decodedPixels[i + 3] === 0) transparentPixels++;
        else if (decodedPixels[i + 3]! < 255) translucentPixels++;
        if (alpha > 0) for (let c = 0; c < 3; c++) { rgbSquared += (originalPixels[i+c]! - decodedPixels[i+c]!) ** 2; rgbSamples++; }
      }
      // Compare exactly the same resized source and decoded WebP on navy and warm backgrounds.
      const comparison = document.createElement('canvas'); comparison.width = 1200; comparison.height = 640;
      const out = comparison.getContext('2d')!;
      for (const [row, background] of ['#081321', '#ddc799'].entries()) for (const [column, art] of [image, optimized].entries()) {
        out.fillStyle = background; out.fillRect(column * 600, row * 320, 600, 320);
        const scale = Math.min(570 / art.width, 280 / art.height);
        out.drawImage(art, column*600+(600-art.width*scale)/2, row*320+30, art.width*scale, art.height*scale);
        out.fillStyle = row ? '#081321' : '#f3ead7'; out.font = '16px system-ui';
        out.fillText(column ? 'WebP .92' : 'PNG originale', column*600+16, row*320+22);
      }
      return { webp: webp.split(',')[1]!, comparison: comparison.toDataURL('image/png').split(',')[1]!,
        sourceWidth:image.width, sourceHeight:image.height, width, height, alphaMaxError, transparentPixels, translucentPixels,
        rgbRMSE:Math.sqrt(rgbSquared/rgbSamples) };
    }, { source: `data:image/png;base64,${source.toString('base64')}`, maxWidth: name === 'base' ? 1536 : 768 });
    const output = Buffer.from(encoded.webp, 'base64');
    writeFileSync(`${directory}/${name}.webp`, output);
    writeFileSync(`${evidence}/asset-comparison-${name}.png`, Buffer.from(encoded.comparison, 'base64'));
    const metrics = { ...encoded, webp: undefined, comparison: undefined };
    results.push({ name, sourceBytes:source.length, bytes:output.length, sha256:createHash('sha256').update(output).digest('hex'), ...metrics });
  }
} finally { await browser.close(); }
const sourceBytes = results.reduce((n,r)=>n+r.sourceBytes,0), bytes = results.reduce((n,r)=>n+r.bytes,0);
const report = { originalCommit, encoder:'Chromium Canvas WebP quality .92; alpha lossless at resized resolution', results,
  sourceBytes, bytes, reductionPercent:100*(1-bytes/sourceBytes), budget:5*1024*1024, pass:bytes<=5*1024*1024,
  originalDecodedBytes:results.reduce((n,r)=>n+r.sourceWidth*r.sourceHeight*4,0), decodedBytes:results.reduce((n,r)=>n+r.width*r.height*4,0) };
writeFileSync(`${evidence}/raster-optimization.json`, JSON.stringify(report,null,2));
if (!report.pass || results.some(r=>r.alphaMaxError > 0)) throw new Error('Raster budget/alpha regression');
console.log(JSON.stringify(report,null,2));
