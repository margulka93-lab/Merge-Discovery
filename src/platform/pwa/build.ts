import type { Plugin } from 'vite';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { staticFiles, assetPath } from '../../../scripts/measure-bundle';
/** Small post-build integration: exact generated assets, all lazy chunks deliberately precached. */
export function pwaBuild(): Plugin {
  let outDir: string;
  return { name: 'merge-discovery-pwa', apply: 'build',
    configResolved(config) { outDir = resolve(config.root, config.build.outDir); },
    closeBundle() {
      const files = staticFiles(outDir).filter(f => !['/sw.js','/pwa-artifacts.json'].includes(assetPath(outDir,f)) && !f.endsWith('.map')).sort();
      const hash = createHash('sha256'); for (const file of files) { hash.update(assetPath(outDir,file)); hash.update(readFileSync(file)); }
      const build = hash.digest('hex').slice(0,16), assets = files.map(file => assetPath(outDir,file));
      const template = readFileSync('src/platform/pwa/worker.js','utf8');
      writeFileSync(resolve(outDir,'sw.js'),template.replace('__BUILD__',JSON.stringify(build)).replace('__ASSETS__',JSON.stringify(assets)));
      writeFileSync(resolve(outDir,'pwa-artifacts.json'), JSON.stringify({ build, assets, strategy: 'explicit-build-precache', runtimeCache: false },null,2));
    },
  };
}
