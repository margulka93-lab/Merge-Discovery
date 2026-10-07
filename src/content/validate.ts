import type { ContentPackage, Requirement } from '../domain/model/types';
import { collectionUnits } from '../domain/completion/collections';
import { pairKey } from '../domain/resolver/pair';
import { ruleMatches, specificity } from '../domain/resolver/rules';
import { buildIndex } from './indexes/build';
import { contentSchema } from './schemas/content';

export class ContentValidationError extends Error {
  constructor(public readonly issues: string[]) { super(issues.join('\n')); this.name = 'ContentValidationError'; }
}
/** All v1 requirements are positive/monotone, so any two requirement lists can overlap.
 * Conservatively require unique priority, rather than pretending AND gates are exclusive. */
export function validateContent(raw: unknown): ContentPackage {
  const parsed = contentSchema.safeParse(raw);
  if (!parsed.success) throw new ContentValidationError(parsed.error.issues.map(e => `${e.path.join('.')}: ${e.message}`));
  const c: ContentPackage = parsed.data;
  const issues: string[] = [];
  const unique = (values: readonly (string | number)[], context: string) => {
    if (new Set(values).size !== values.length) issues.push(`Duplicate ${context}`);
  };
  for (const section of ['elements', 'sets', 'collections', 'recipes', 'rules', 'anomalies', 'unlocks'] as const) unique(c[section].map(x => x.id), `${section} IDs`);
  unique(c.collections.flatMap(collection => collectionUnits(collection).map(unit => unit.id)), 'Collection completion IDs');
  unique([...c.recipes, ...c.rules].map(x => x.id), 'recipe/rule IDs');
  unique(c.sets.map(s => s.sortOrder), 'Set sort positions');
  for (const [registry, ids] of Object.entries(c.registries)) unique(ids, registry);
  const elements = new Set(c.elements.map(e => e.id));
  const sets = new Set(c.sets.map(s => s.id));
  const collections = new Set(c.collections.map(s => s.id));
  const recipes = new Set(c.recipes.map(r => r.id));
  const reference = (ids: Set<string>, id: string, context: string) => { if (!ids.has(id)) issues.push(`Unknown ID ${id} in ${context}`); };
  const localization = (key: string) => { if (!Object.hasOwn(c.locales.it, key)) issues.push(`Missing localization ${key}`); };
  const checkRequirements = (requirements: Requirement[] = []) => {
    for (const r of requirements) {
      switch (r.type) {
        case 'element_discovered': reference(elements, r.elementId, 'requirement'); break;
        case 'set_revealed': case 'set_completion_at_least': reference(sets, r.setId, 'requirement'); break;
        case 'era_eligible': reference(new Set(c.registries.eras), r.eraId, 'requirement'); break;
        case 'feature_unlocked': reference(new Set(c.registries.features), r.featureId, 'requirement'); break;
        case 'min_level': if (r.level > c.progression.levelThresholds.length) issues.push(`Level requirement beyond authored curve: ${r.level}`); break;
      }
    }
  };
  for (const e of c.elements) {
    reference(sets, e.setId, e.id); localization(e.nameKey); localization(e.descriptionKey); unique(e.tags, `${e.id} tags`);
    e.tags.forEach(t => reference(new Set(c.registries.tags), t, e.id));
    if (e.starter && (e.visibility === 'secret' || e.completion === 'secret')) issues.push(`Secret starter: ${e.id}`);
  }
  for (const s of c.sets) {
    localization(s.nameKey); localization(s.descriptionKey); reference(new Set(c.registries.eras), s.eraId, s.id);
    if (!c.elements.some(e => e.setId === s.id && e.completion === 'required')) issues.push(`No required members: ${s.id}`);
  }
  for (const collection of c.collections) {
    localization(collection.nameKey); localization(collection.descriptionKey); unique(collection.memberElementIds, `${collection.id} members`);
    collection.memberElementIds.forEach(id => reference(elements, id, collection.id));
    unique((collection.chapters ?? []).map(ch => ch.id), `${collection.id} chapters`);
    for (const ch of collection.chapters ?? []) {
      localization(ch.nameKey); unique(ch.memberElementIds, `${ch.id} members`);
      ch.memberElementIds.forEach(id => reference(new Set(collection.memberElementIds), id, ch.id));
    }
  }
  for (const r of c.recipes) {
    [...r.inputs, r.resultElementId].forEach(id => reference(elements, id, r.id)); checkRequirements(r.requirements);
    if (r.gateBehavior === 'unlock_trigger' && !r.gateFallback) issues.push(`Missing authored unlock_trigger fallback: ${r.id}`);
    if ((r.gateBehavior === 'anomaly' || r.gateFallback === 'anomaly') && !c.anomalies.some(a => pairKey(...a.inputs) === pairKey(...r.inputs))) issues.push(`Missing gated anomaly: ${r.id}`);
  }
  for (const a of c.anomalies) {
    a.inputs.forEach(id => reference(elements, id, a.id)); checkRequirements(a.requirements); localization(a.messageKey);
    if (a.resolutionRecipeId) {
      reference(recipes, a.resolutionRecipeId, a.id);
      const r = c.recipes.find(r => r.id === a.resolutionRecipeId);
      if (r && pairKey(...r.inputs) !== pairKey(...a.inputs)) issues.push(`Anomaly resolution pair mismatch: ${a.id}`);
    }
  }
  for (const rule of c.rules) {
    reference(elements, rule.resultElementId, rule.id); checkRequirements(rule.requirements);
    rule.exclusions?.forEach(id => reference(elements, id, rule.id));
    for (const s of rule.inputSelectors) for (const tags of [s.all, s.any, s.none]) tags?.forEach(t => reference(new Set(c.registries.tags), t, rule.id));
  }
  for (const u of c.unlocks) {
    checkRequirements(u.requirements);
    switch (u.target.type) {
      case 'set': reference(sets, u.target.setId, u.id); break;
      case 'feature': reference(new Set(c.registries.features), u.target.featureId, u.id); break;
      case 'era': reference(new Set(c.registries.eras), u.target.eraId, u.id); break;
    }
  }
  unique(c.visibility.initialRevealedSetIds, 'initial revealed Sets');
  c.visibility.initialRevealedSetIds.forEach(id => reference(sets, id, 'initial reveal'));
  for (const p of c.visibility.setAnnouncements) {
    reference(sets, p.setId, 'announcement'); p.paths.forEach(checkRequirements);
    if (c.sets.some(s => s.id === p.setId && (s.visibility === 'hidden' || s.visibility === 'secret'))) issues.push(`Hidden Set announcement: ${p.setId}`);
  }
  for (const p of c.visibility.collectionReveals) { reference(collections, p.collectionId, 'collection reveal'); p.paths.forEach(checkRequirements); }
  for (const [alias, target] of Object.entries(c.migrations.aliases)) {
    reference(elements, target, `alias ${alias}`);
    if (elements.has(alias)) issues.push(`Alias shadows element: ${alias}`);
  }
  const thresholds = c.progression.levelThresholds;
  if (thresholds[0] !== 0 || thresholds.some((x, i) => i > 0 && x <= thresholds[i - 1]!)) issues.push('Level thresholds must start at 0 and strictly increase');
  if (!c.elements.some(e => e.starter)) issues.push('No starter elements');
  const index = buildIndex(c);
  for (const [key, records] of index.recipesByPair) {
    if (records.length > 1 && new Set(records.map(r => r.priority ?? 0)).size !== records.length) issues.push(`Ambiguous explicit pair: ${key}`);
  }
  for (const [key, records] of index.anomaliesByPair) {
    if (records.length > 1) issues.push(`Ambiguous anomaly pair: ${key}`);
    for (const a of records) for (const r of index.recipesByPair.get(key) ?? []) {
      if (a.resolutionRecipeId !== r.id && r.gateBehavior !== 'anomaly' && r.gateFallback !== 'anomaly') issues.push(`Unauthored recipe/anomaly overlap: ${key}`);
    }
  }
  // Enumerate concrete unordered input pairs, including A+A, at authoring time only.
  for (let i = 0; i < c.elements.length; i++) for (let j = i; j < c.elements.length; j++) {
    const a = c.elements[i]!; const b = c.elements[j]!;
    const matching = c.rules.filter(r => ruleMatches(r, a, b));
    for (let x = 0; x < matching.length; x++) for (let y = x + 1; y < matching.length; y++) {
      const first = matching[x]!; const second = matching[y]!;
      if (first.priority === second.priority && specificity(first) === specificity(second)) issues.push(`Ambiguous tag rules: ${first.id}/${second.id} at ${pairKey(a.id, b.id)}`);
    }
  }
  if (issues.length) throw new ContentValidationError(issues);
  return c;
}
