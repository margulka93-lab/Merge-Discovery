import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { measureBundle, staticFiles, assetPath } from './measure-bundle';
const manifest = JSON.parse(readFileSync('dist/manifest.webmanifest', 'utf8'));
assert.equal(manifest.name, 'Merge Discovery');
for (const key of ['short_name', 'start_url', 'scope', 'display', 'theme_color', 'background_color', 'lang', 'dir']) assert.ok(manifest[key], key);
assert.equal(manifest.display, 'standalone'); assert.equal(manifest.start_url, '/');
for (const size of [192, 512]) {
  const icon = manifest.icons.find((icon: { sizes: string; purpose: string }) => icon.sizes === `${size}x${size}` && icon.purpose === 'any');
  assert.ok(icon); assert.ok(existsSync(`dist${icon.src}`));
  const png = readFileSync(`dist${icon.src}`); assert.equal(png.readUInt32BE(16), size); assert.equal(png.readUInt32BE(20), size);
}
assert.ok(manifest.icons.some((icon: { purpose: string }) => icon.purpose === 'maskable'));
for (const icon of manifest.icons) {
  assert.equal(icon.type,'image/png');
  assert.ok(icon.src.startsWith('/icons/') && !icon.src.includes('..'));
  const dimensions = /^(192|512)x(192|512)$/.exec(icon.sizes);
  assert.ok(dimensions);
  assert.equal(dimensions[1],dimensions[2]);
  const png = readFileSync(`dist${icon.src}`);
  assert.equal(png.readUInt32BE(16),Number(dimensions[1]));
  assert.equal(png.readUInt32BE(20),Number(dimensions[2]));
}
const artifact = JSON.parse(readFileSync('dist/pwa-artifacts.json', 'utf8'));
const expected = staticFiles('dist').map(f => assetPath('dist',f)).filter(f => !['/sw.js','/pwa-artifacts.json'].includes(f) && !f.endsWith('.map')).sort();
assert.deepEqual(artifact.assets, expected);
assert.ok(artifact.assets.every((path: string) => path.startsWith('/') && !path.includes('://') && !/save|export|fixture|github|node_modules/.test(path)));
assert.equal(artifact.runtimeCache, false);
const worker = readFileSync('dist/sw.js', 'utf8');
assert.ok(!worker.includes('__BUILD__') && !worker.includes('__ASSETS__'));
const bundle = measureBundle();
assert.ok(bundle.entry.bytes < 500_000, 'Entry budget 500 kB');
assert.ok(bundle.chunks.every(c => c.bytes < 500_000), 'Chunk budget 500 kB');
assert.ok(bundle.chunks.some(c => c.file.startsWith('DiscoveryMap-')));
assert.ok(bundle.chunks.some(c => c.file.startsWith('SettingsPanel-')));
const islandRasters = artifact.assets.filter((path: string) => /^\/assets\/(base|soil|water|tree|creature)-[^/]+\.webp$/.test(path));
assert.equal(islandRasters.length, 5, 'All five optimized island rasters are atomically precached');
const rasterBytes = islandRasters.reduce((sum: number, path: string) => sum + readFileSync(`dist${path}`).length, 0);
assert.ok(rasterBytes <= 5*1024*1024, 'Production island raster budget 5 MiB');
console.log(`Production island precache: PASS (${rasterBytes} B, five WebP rasters).`);
console.log(`PWA manifest/icons/exact precache/no runtime cache/chunk budgets: PASS (${artifact.assets.length} assets, ${bundle.chunks.length} JS chunks).`);
