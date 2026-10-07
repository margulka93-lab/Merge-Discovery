import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';
export function measureBundle(directory = 'dist') {
  const files = readdirSync(join(directory, 'assets')).filter(f => f.endsWith('.js')).map(file => {
    const bytes = readFileSync(join(directory, 'assets', file));
    return { file, bytes: bytes.length, gzipBytes: gzipSync(bytes).length };
  });
  const html = readFileSync(join(directory, 'index.html'), 'utf8');
  const entry = files.find(f => html.includes(f.file))!;
  return { entry, largestChunk: [...files].sort((a,b) => b.bytes-a.bytes)[0], totalJsBytes: files.reduce((sum,f) => sum+f.bytes,0), totalGzipBytes: files.reduce((sum,f) => sum+f.gzipBytes,0), chunks: files };
}
if (process.argv[1]?.endsWith('measure-bundle.ts')) {
  const report = measureBundle();
  if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
// Recursion shared only by the build-time platform integration.
export function staticFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(e => e.isDirectory() ? staticFiles(join(directory,e.name)) : [join(directory,e.name)]);
}
export function assetPath(directory: string, file: string) { return '/' + relative(directory,file).replaceAll('\\','/'); }
