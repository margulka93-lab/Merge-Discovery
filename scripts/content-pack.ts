import { readFileSync, writeFileSync } from 'node:fs';
import { rawSeed } from '../src/content/load';
import { validateContent } from '../src/content/validate';
import { readPack, writePack } from '../src/content/packs/archive';
import { samplePack } from '../src/content/packs/sample';
import { previewPack } from '../src/application/packs/preview';
const [mode, file, ...dependencies] = process.argv.slice(2);
try {
  if (!file) throw new Error('Uso: npm run validate:pack -- pack.zip [dependency.zip ...] / npm run sample:pack -- output.zip');
  if (mode === 'sample') { writeFileSync(file, await writePack(await samplePack())); console.log(`Sample proposto esportato: ${file}`); }
  else {
    const pack = await readPack(new Uint8Array(readFileSync(file))), installed = await Promise.all(dependencies.map(async path => readPack(new Uint8Array(readFileSync(path)))));
    const { report } = previewPack(validateContent(rawSeed), installed, pack);
    console.log(JSON.stringify({ mode, ...report },null,2));
  }
} catch (cause) { console.error(cause instanceof Error ? cause.message : cause); process.exitCode = 1; }
