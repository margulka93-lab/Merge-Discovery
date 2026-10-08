import { unzipSync, zipSync, strFromU8, strToU8 } from 'fflate';
import { PACK_LIMITS, PackError, packManifestSchema, packPatchSchema, digest, type ContentPack } from './model';
import type { ContentPackage } from '../../domain/model/types';
const modules = ['elements','recipes','sets','collections','anomalies','unlocks','rules','registries','progression','visibility','migrations'] as const;
export function safeArchivePath(path: string) {
  return path.length <= 160 && !path.startsWith('/') && !path.includes('\\') && !path.includes(':') && !path.includes('\0') && !path.split('/').some(s => ['.', '..', '', '__proto__', 'constructor', 'prototype'].includes(s));
}
/** Inspect the central directory BEFORE inflation: duplicate entries, encrypted/ZIP64 archives
 * and expansion bombs cannot be hidden by object-based unzip APIs. */
function inspectZip(bytes: Uint8Array) {
  if (bytes.length > PACK_LIMITS.zipBytes || bytes.length < 22) throw new PackError(['ZIP troppo grande o incompleto.']);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) if (view.getUint32(i, true) === 0x06054b50 && i + 22 + view.getUint16(i + 20, true) === bytes.length) { end = i; break; }
  if (end < 0 || view.getUint16(end + 4, true) || view.getUint16(end + 6, true)) throw new PackError(['ZIP non supportato.']);
  const count = view.getUint16(end + 10, true), size = view.getUint32(end + 12, true), start = view.getUint32(end + 16, true);
  if (count > PACK_LIMITS.entries || count !== view.getUint16(end + 8, true) || start + size !== end) throw new PackError(['Directory ZIP non valida.']);
  let offset = start, expanded = 0; const names = new Set<string>(), entries = new Map<string, { size: number; crc: number }>();
  for (let i = 0; i < count; i++) {
    if (offset + 46 > end || view.getUint32(offset, true) !== 0x02014b50) throw new PackError(['Voce ZIP non valida.']);
    const length = view.getUint16(offset + 28, true), extra = view.getUint16(offset + 30, true), comment = view.getUint16(offset + 32, true);
    const name = new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(offset + 46, offset + 46 + length));
    const directory = name.endsWith('/');
    if (!safeArchivePath(directory ? name.slice(0,-1) : name) || names.has(name) || view.getUint16(offset + 8, true) & 1 || ![0,8].includes(view.getUint16(offset + 10, true))) throw new PackError([`Percorso, duplicato o compressione ZIP non consentiti: ${name}`]);
    const uncompressed = view.getUint32(offset + 24, true); expanded += uncompressed;
    if (uncompressed > PACK_LIMITS.jsonBytes || expanded > PACK_LIMITS.totalBytes) throw new PackError(['Espansione ZIP oltre i limiti.']);
    const local = view.getUint32(offset + 42, true), compressed = view.getUint32(offset + 20, true);
    if (local + 30 > start || view.getUint32(local,true) !== 0x04034b50) throw new PackError(['Header locale ZIP non valido.']);
    const localLength = view.getUint16(local + 26,true), localExtra = view.getUint16(local + 28,true);
    const localName = new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(local + 30,local + 30 + localLength));
    if (localName !== name || local + 30 + localLength + localExtra + compressed > start || view.getUint16(local + 8,true) !== view.getUint16(offset + 10,true) || view.getUint16(local + 6,true) !== view.getUint16(offset + 8,true) || (directory && uncompressed !== 0)) throw new PackError(['Header locale e directory ZIP incoerenti.']);
    entries.set(name, { size: uncompressed, crc: view.getUint32(offset + 16,true) });
    names.add(name); offset += 46 + length + extra + comment;
  }
  if (offset !== end) throw new PackError(['Directory ZIP incoerente.']);
  return entries;
}
function crc32(bytes: Uint8Array) {
  let crc = -1;
  for (const byte of bytes) { crc ^= byte; for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0); }
  return (crc ^ -1) >>> 0;
}
const json = (bytes: Uint8Array | undefined, name: string): unknown => {
  if (!bytes || bytes.length > PACK_LIMITS.jsonBytes) throw new PackError([`File JSON mancante o troppo grande: ${name}`]);
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); } catch { throw new PackError([`JSON non valido: ${name}`]); }
};
export function imageDimensions(bytes: Uint8Array, mime: string): { width: number; height: number } {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (mime === 'image/png' && bytes.length >= 33 && bytes.slice(0,8).every((b,i) => b === [137,80,78,71,13,10,26,10][i]) && strFromU8(bytes.slice(12,16)) === 'IHDR') return { width: view.getUint32(16), height: view.getUint32(20) };
  if (mime === 'image/webp' && bytes.length >= 30 && strFromU8(bytes.slice(0,4)) === 'RIFF' && strFromU8(bytes.slice(8,12)) === 'WEBP') {
    const kind = strFromU8(bytes.slice(12,16));
    if (kind === 'VP8X') return { width: 1 + bytes[24]! + (bytes[25]! << 8) + (bytes[26]! << 16), height: 1 + bytes[27]! + (bytes[28]! << 8) + (bytes[29]! << 16) };
    if (kind === 'VP8L' && bytes[20] === 47) return { width: 1 + bytes[21]! + ((bytes[22]! & 63) << 8), height: 1 + (bytes[22]! >> 6) + (bytes[23]! << 2) + ((bytes[24]! & 15) << 10) };
    if (kind === 'VP8 ' && bytes[23] === 157 && bytes[24] === 1 && bytes[25] === 42) return { width: view.getUint16(26,true) & 16383, height: view.getUint16(28,true) & 16383 };
  }
  throw new PackError(['Immagine non valida: sono ammessi solo PNG/WebP decodificabili.']);
}
export async function readPack(bytes: Uint8Array): Promise<ContentPack> {
  const entries = inspectZip(bytes);
  let files: Record<string, Uint8Array>;
  try { files = unzipSync(bytes); } catch { throw new PackError(['ZIP danneggiato.']); }
  for (const [name, metadata] of entries) {
    if (!files[name] || files[name]!.length !== metadata.size || crc32(files[name]!) !== metadata.crc) throw new PackError([`Checksum ZIP errato: ${name}`]);
    if (name.endsWith('/')) delete files[name];
  }
  const manifest = packManifestSchema.parse(json(files['manifest.json'], 'manifest.json'));
  const raw: Record<string, unknown> = {};
  for (const section of modules) if (files[`data/${section}.json`]) raw[section] = json(files[`data/${section}.json`], section);
  if (files['locales/it.json']) raw.locales = { it: json(files['locales/it.json'], 'it') };
  const patch = packPatchSchema.parse(raw);
  const expected = new Set(['manifest.json', ...modules.map(s => `data/${s}.json`), 'locales/it.json', ...Object.values(manifest.assets).map(a => a.path)]);
  const paths = new Set<string>(); const assets: ContentPack['assets'] = {};
  for (const [key, spec] of Object.entries(manifest.assets)) {
    if (paths.has(spec.path)) throw new PackError(['Un asset deve avere un artKey univoco.']); paths.add(spec.path);
    const asset = files[spec.path];
    if (!asset || asset.length > PACK_LIMITS.imageBytes || await digest(asset) !== spec.sha256) throw new PackError([`Asset mancante, troppo grande o checksum errato: ${key}`]);
    const dimensions = imageDimensions(asset, spec.mime);
    if (dimensions.width !== spec.width || dimensions.height !== spec.height) throw new PackError([`Dimensioni immagine incoerenti: ${key}`]);
    assets[key] = asset;
  }
  if ([...entries.keys()].some(path => !path.endsWith('/') && !expected.has(path))) throw new PackError(['File non dichiarati: il pacchetto non può contenere codice, SVG o risorse remote.']);
  return { manifest, patch, assets };
}
export async function writePack(pack: ContentPack): Promise<Uint8Array> {
  const files: Record<string, Uint8Array> = { 'manifest.json': strToU8(JSON.stringify(pack.manifest, null, 2)) };
  for (const key of modules) if (pack.patch[key] !== undefined) files[`data/${key}.json`] = strToU8(JSON.stringify(pack.patch[key], null, 2));
  if (pack.patch.locales) files['locales/it.json'] = strToU8(JSON.stringify(pack.patch.locales.it, null, 2));
  for (const [key, spec] of Object.entries(pack.manifest.assets)) {
    if (!pack.assets[key]) throw new PackError([`Asset mancante: ${key}`]); files[spec.path] = pack.assets[key]!;
  }
  const bytes = zipSync(files); await readPack(bytes); return bytes;
}
export const patchFrom = (raw: Partial<ContentPackage>) => packPatchSchema.parse(raw);
