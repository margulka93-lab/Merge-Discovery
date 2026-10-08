import { z } from 'zod';
import { contentSchema } from '../schemas/content';
import type { ContentPackage } from '../../domain/model/types';
const version = z.string().regex(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/).refine(v => v.split('.').every(n => Number.isSafeInteger(Number(n))), 'Versione fuori intervallo.');
const packId = z.string().regex(/^[a-z][a-z0-9_]{1,63}$/);
export const packManifestSchema = z.strictObject({
  schemaVersion: z.literal(1), packId, namespace: packId, version, contentVersion: version,
  minimumSaveSchemaVersion: z.literal(1), title: z.string().min(1).max(100),
  reviewStatus: z.enum(['proposed', 'author']),
  dependencies: z.array(z.strictObject({ packId, version })).max(32),
  assets: z.record(z.string().regex(/^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+$/), z.strictObject({
    path: z.string().regex(/^art\/[a-zA-Z0-9_/-]+\.(png|webp)$/),
    mime: z.enum(['image/png', 'image/webp']), sha256: z.string().regex(/^[0-9a-f]{64}$/),
    width: z.number().int().min(1).max(2048), height: z.number().int().min(1).max(2048),
  })),
});
export type PackManifest = z.infer<typeof packManifestSchema>;
export const packPatchSchema = contentSchema.partial();
export interface ContentPack { manifest: PackManifest; patch: Partial<ContentPackage>; assets: Record<string, Uint8Array> }
export class PackError extends Error {
  constructor(public issues: string[]) { super(issues.join('\n')); this.name = 'PackError'; }
}
export const PACK_LIMITS = { zipBytes: 16 * 1024 * 1024, totalBytes: 32 * 1024 * 1024, jsonBytes: 4 * 1024 * 1024, imageBytes: 2 * 1024 * 1024, entries: 256 };
export async function digest(bytes: Uint8Array) {
  const hash = await crypto.subtle.digest('SHA-256', new Uint8Array(bytes).buffer);
  return [...new Uint8Array(hash)].map(n => n.toString(16).padStart(2, '0')).join('');
}
