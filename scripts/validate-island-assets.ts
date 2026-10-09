import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
const directory = 'src/assets/island-proof';
const files = readdirSync(directory);
if (files.length !== 5 || files.some(f => !f.endsWith('.webp'))) throw new Error('Expected exactly five WebP runtime rasters');
const report = JSON.parse(readFileSync('docs/evidence/discovery-first/raster-optimization.json', 'utf8')) as { results: {name:string;sha256:string;alphaMaxError:number}[] };
let bytes = 0;
for (const file of files) {
  const buffer = readFileSync(`${directory}/${file}`); bytes += buffer.length;
  const record = report.results.find(r => file === `${r.name}.webp`);
  if (!record || record.sha256 !== createHash('sha256').update(buffer).digest('hex') || record.alphaMaxError !== 0) throw new Error(`Unverified raster ${file}`);
  if (buffer.subarray(0,4).toString() !== 'RIFF' || buffer.subarray(8,12).toString() !== 'WEBP') throw new Error(`Invalid WebP ${file}`);
}
if (bytes > 5*1024*1024) throw new Error(`Raster budget exceeded: ${bytes}`);
console.log(JSON.stringify({rasters:files.length, bytes, budget:5*1024*1024, hashAndAlphaVerified:true, pass:true}));
