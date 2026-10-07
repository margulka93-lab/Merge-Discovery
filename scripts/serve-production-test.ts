import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
/** Test-only production asset server. The application has no fixture/update backdoor. */
let release = 0;
const root = resolve('dist');
const types: Record<string,string> = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.png':'image/png', '.json':'application/json', '.webmanifest':'application/manifest+json' };
createServer((request,response) => {
  const url = new URL(request.url!, 'http://127.0.0.1');
  if (url.pathname === '/__test/release' && request.method === 'POST') { release++; response.end(String(release)); return; }
  let file = resolve(root, '.' + decodeURIComponent(url.pathname));
  if (file !== root && !file.startsWith(root + sep)) { response.writeHead(404).end(); return; }
  if (!extname(file)) file = resolve(root,'index.html');
  if (!existsSync(file)) { response.writeHead(404).end(); return; }
  response.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream');
  response.setHeader('Cache-Control','no-store');
  let body: string | Buffer = readFileSync(file);
  // Change both worker bytes and cache version; all served assets remain the real production build.
  if (url.pathname === '/sw.js' && release) body = body.toString().replace(/const BUILD = "([^"]+)";/, `const BUILD = "$1-test-release-${release}";`);
  response.end(body);
}).listen(5179,'127.0.0.1', () => console.log('Production test preview http://127.0.0.1:5179'));
