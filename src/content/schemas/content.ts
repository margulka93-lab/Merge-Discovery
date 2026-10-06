import { z } from 'zod';

const id = z.string().regex(/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/);
const key = z.string().regex(/^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+$/);
const ids = z.array(id);
const pair = z.tuple([id, id]);
const natural = z.number().int().nonnegative();
const rarity = z.enum(['common', 'uncommon', 'rare', 'extraordinary', 'secret']);
export const requirementSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('min_level'), level: z.number().int().positive() }),
  z.strictObject({ type: z.literal('element_discovered'), elementId: id }),
  z.strictObject({ type: z.literal('set_revealed'), setId: id }),
  z.strictObject({ type: z.literal('set_completion_at_least'), setId: id, percent: z.number().min(0).max(100) }),
  z.strictObject({ type: z.literal('feature_unlocked'), featureId: id }),
  z.strictObject({ type: z.literal('era_eligible'), eraId: id }),
]);
const requirements = z.array(requirementSchema);
const selector = z.strictObject({ all: ids.optional(), any: ids.optional(), none: ids.optional() });
export const contentSchema = z.strictObject({
  manifest: z.strictObject({ contentVersion: z.string().regex(/^\d+\.\d+\.\d+$/), minimumSaveSchemaVersion: z.number().int().positive(), localeFallback: z.literal('it') }),
  elements: z.array(z.strictObject({
    id, nameKey: key, descriptionKey: key, setId: id, rarity, tags: ids, starter: z.boolean().optional(),
    completion: z.enum(['required', 'bonus', 'secret']), visibility: z.enum(['announced', 'glimpsed', 'hidden', 'secret']),
    sortOrder: natural.optional(), artKey: key,
  })),
  sets: z.array(z.strictObject({
    id, nameKey: key, descriptionKey: key, eraId: id, visibility: z.enum(['announced', 'discovery', 'hidden', 'secret']),
    completionMode: z.literal('required_elements'), accentToken: z.string().regex(/^--[a-z][a-z-]+$/), iconKey: key, sortOrder: natural,
  })),
  collections: z.array(z.strictObject({
    id, nameKey: key, descriptionKey: key, visibility: z.enum(['visible', 'hidden', 'secret']), memberElementIds: ids.nonempty(),
    chapters: z.array(z.strictObject({ id, nameKey: key, memberElementIds: ids.nonempty() })).optional(),
  })),
  recipes: z.array(z.strictObject({
    id, inputs: pair, resultElementId: id, kind: z.literal('explicit'), discovery: z.enum(['normal', 'alternate', 'secret']),
    requirements: requirements.optional(), gateBehavior: z.enum(['normal', 'dormant', 'anomaly', 'unlock_trigger']).optional(),
    gateFallback: z.enum(['dormant', 'anomaly']).optional(), priority: z.number().int().optional(),
  })),
  rules: z.array(z.strictObject({ id, inputSelectors: z.tuple([selector, selector]), resultElementId: id, priority: z.number().int(), requirements: requirements.optional(), exclusions: ids.optional() })),
  anomalies: z.array(z.strictObject({ id, inputs: pair, requirements: requirements.optional(), visibility: z.literal('archive'), category: z.enum(['mythic', 'spiritual', 'dimensional', 'unknown']), resolutionRecipeId: id.optional(), messageKey: key })),
  unlocks: z.array(z.strictObject({
    id, target: z.discriminatedUnion('type', [
      z.strictObject({ type: z.literal('set'), setId: id }),
      z.strictObject({ type: z.literal('feature'), featureId: id }),
      z.strictObject({ type: z.literal('era'), eraId: id }),
    ]), requirements, revealMode: z.enum(['silent', 'normal', 'major']),
  })),
  progression: z.strictObject({
    levelThresholds: z.array(natural).nonempty(),
    rewards: z.strictObject({ newElementBase: natural, rarityBonus: z.record(rarity, natural), alternateRecipe: natural, anomalyRegistered: natural, anomalyResolved: natural, announcedSetReveal: natural, hiddenSetReveal: natural, secretSetReveal: natural, setCompletionBase: natural, setCompletionPerElement: natural, setCompletionCap: natural }),
  }),
  visibility: z.strictObject({
    initialRevealedSetIds: ids,
    setAnnouncements: z.array(z.strictObject({ setId: id, paths: z.array(requirements).nonempty() })),
    collectionReveals: z.array(z.strictObject({ collectionId: id, paths: z.array(requirements).nonempty() })),
  }),
  locales: z.strictObject({ it: z.record(key, z.string().min(1)) }),
  registries: z.strictObject({ tags: ids, features: ids, eras: ids }),
  migrations: z.strictObject({ aliases: z.record(id, id) }),
});
