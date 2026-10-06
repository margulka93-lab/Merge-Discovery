import { z } from 'zod';
import type { PlayerSave } from './save';
import { SaveError } from './saveErrors';

export const SAVE_SCHEMA_VERSION = 1;
export const PRODUCT_ID = 'merge_discovery';
const id = z.string().regex(/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/).refine(x => !['constructor', 'prototype', '__proto__'].includes(x));
const version = z.string().regex(/^\d+\.\d+\.\d+$/);
const timestamp = z.iso.datetime({ offset: true });
const ids = z.array(id).refine(x => new Set(x).size === x.length, 'Duplicate IDs');
const pair = z.string().regex(/^[a-z][a-z0-9_]*::[a-z][a-z0-9_]*$/).refine(x => {
  const [a, b] = x.split('::'); return !!a && !!b && id.safeParse(a).success && id.safeParse(b).success && a <= b;
}, 'Noncanonical pair');
const discovery = z.strictObject({ firstDiscoveredAt: timestamp, firstRecipeId: id.optional() });
const anomaly = z.strictObject({ firstObservedAt: timestamp, resolvedAt: timestamp.optional() });
const tested = z.strictObject({ lastOutcome: z.enum(['success', 'no_reaction', 'anomaly']), testedAgainstContentVersion: version, lastTestedAt: timestamp });
const facts = {
  discoveredElements: z.record(id, discovery), discoveredRecipeIds: ids,
  testedPairs: z.record(pair, tested), anomalies: z.record(id, anomaly),
  revealedSetIds: ids, completedSetIds: ids, completedCollectionChapterIds: ids, favoriteElementIds: ids,
};
export const saveSchema = z.strictObject({
  saveSchemaVersion: z.literal(SAVE_SCHEMA_VERSION), contentVersionSeen: version,
  createdAt: timestamp, updatedAt: timestamp, xp: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  ...facts,
  settings: z.strictObject({
    informationMode: z.enum(['mystery', 'balanced', 'collector']), proactiveHints: z.enum(['off', 'light', 'normal']),
    reducedMotion: z.boolean(), highContrast: z.boolean(), textScale: z.enum(['default', 'large', 'extra_large']),
    soundEnabled: z.boolean(), musicEnabled: z.boolean(), dragEnabled: z.boolean(),
  }),
  quarantine: z.strictObject(facts).optional(),
});
export function parseSave(raw: unknown): PlayerSave {
  const parsed = saveSchema.safeParse(raw);
  if (!parsed.success) throw new SaveError('invalid_save', 'Invalid save structure', parsed.error);
  return parsed.data;
}
export const exportSchema = z.strictObject({
  product: z.literal(PRODUCT_ID), saveSchemaVersion: z.number().int().nonnegative(),
  contentVersionSeen: version, payload: z.unknown(),
}).refine(x => x.payload !== undefined, 'Missing save payload');
