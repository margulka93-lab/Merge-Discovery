import type { PlayerSave, QuarantinedReferences } from '../../domain/model/save';
import type { ContentIndex, PairKey } from '../../domain/model/types';
import { collectionUnits, newCollectionCompletions } from '../../domain/completion/collections';
import { pairKey } from '../../domain/resolver/pair';
import { resolve } from '../../domain/resolver/resolve';
import { parseSave } from '../../domain/model/saveSchema';
import { SaveError } from '../save/errors';
import { engineState } from '../save/projection';

export type SaveNotice = 'content_version_updated' | 'new_possibilities_available' | 'optional_references_quarantined';
export interface Reconciliation { save: PlayerSave; notices: SaveNotice[]; newPossibilityElementIds: string[]; changed: boolean }
export function emptyQuarantine(): QuarantinedReferences {
  return { discoveredElements: {}, discoveredRecipeIds: [], testedPairs: {}, anomalies: {}, revealedSetIds: [], completedSetIds: [], completedCollectionChapterIds: [], favoriteElementIds: [] };
}
/** Preserves removed/unknown references in exportable quarantine, outside active projections. */
function reconcileReferences(save: PlayerSave, index: ContentIndex): PlayerSave {
  const next = structuredClone(save);
  const q = next.quarantine ?? emptyQuarantine();
  const aliases = index.content.migrations.aliases;
  const mapped = (id: string) => aliases[id] ?? id;
  const discoveries = { ...q.discoveredElements };
  for (const [id, metadata] of Object.entries(next.discoveredElements)) discoveries[id] = { ...discoveries[id], ...metadata };
  next.discoveredElements = {}; q.discoveredElements = {};
  const recipeIds = new Set([...index.content.recipes, ...index.rules].map(r => r.id));
  for (const [old, metadata] of Object.entries(discoveries)) {
    const id = mapped(old);
    if (!index.elements.has(id)) { q.discoveredElements[old] = metadata; continue; }
    const candidate = { ...metadata };
    if (candidate.firstRecipeId && !recipeIds.has(candidate.firstRecipeId)) {
      q.discoveredElements[old] = metadata; delete candidate.firstRecipeId;
    }
    const previous = next.discoveredElements[id];
    if (!previous || Date.parse(candidate.firstDiscoveredAt) < Date.parse(previous.firstDiscoveredAt)) next.discoveredElements[id] = candidate;
  }
  const filterIds = (active: string[], quarantined: string[], valid: (id: string) => boolean, map = (x: string) => x) => {
    const all = [...new Set([...active, ...quarantined].map(map))];
    return [all.filter(valid), all.filter(id => !valid(id))] as [string[], string[]];
  };
  [next.discoveredRecipeIds, q.discoveredRecipeIds] = filterIds(next.discoveredRecipeIds, q.discoveredRecipeIds, id => recipeIds.has(id));
  const setIds = new Set(index.content.sets.map(s => s.id));
  [next.revealedSetIds, q.revealedSetIds] = filterIds(next.revealedSetIds, q.revealedSetIds, id => setIds.has(id));
  [next.completedSetIds, q.completedSetIds] = filterIds(next.completedSetIds, q.completedSetIds, id => setIds.has(id));
  const chapters = new Set(index.content.collections.flatMap(c => collectionUnits(c).map(ch => ch.id)));
  [next.completedCollectionChapterIds, q.completedCollectionChapterIds] = filterIds(next.completedCollectionChapterIds, q.completedCollectionChapterIds, id => chapters.has(id));
  [next.favoriteElementIds, q.favoriteElementIds] = filterIds(next.favoriteElementIds, q.favoriteElementIds, id => !!next.discoveredElements[id], mapped);
  const observed = { ...q.anomalies, ...next.anomalies }; next.anomalies = {}; q.anomalies = {};
  for (const [id, metadata] of Object.entries(observed)) {
    (index.content.anomalies.some(a => a.id === id) ? next.anomalies : q.anomalies)[id] = metadata;
  }
  const tested = { ...q.testedPairs, ...next.testedPairs }; next.testedPairs = {}; q.testedPairs = {};
  for (const [old, metadata] of Object.entries(tested)) {
    const [a, b] = old.split('::') as [string, string]; const key = pairKey(mapped(a), mapped(b));
    if (!next.discoveredElements[mapped(a)] || !next.discoveredElements[mapped(b)]) { q.testedPairs[old as PairKey] = metadata; continue; }
    if (!next.testedPairs[key] || Date.parse(next.testedPairs[key]!.lastTestedAt) < Date.parse(metadata.lastTestedAt)) next.testedPairs[key] = metadata;
  }
  const hasQuarantine = Object.values(q).some(value => Object.keys(value).length > 0);
  if (hasQuarantine) next.quarantine = q; else delete next.quarantine;
  return parseSave(next);
}
export function validateActiveReferences(save: PlayerSave, index: ContentIndex): void {
  for (const id of Object.keys(save.discoveredElements)) if (!index.elements.has(id)) throw new SaveError('invalid_save', 'Unknown active discovery');
  for (const id of save.discoveredRecipeIds) {
    const recipe = index.content.recipes.find(r => r.id === id) ?? index.rules.find(r => r.id === id);
    if (!recipe || !save.discoveredElements[recipe.resultElementId]) throw new SaveError('invalid_save', 'Recipe history without result discovery');
  }
  if (save.completedSetIds.some(id => !save.revealedSetIds.includes(id))) throw new SaveError('invalid_save', 'Completed Set not revealed');
  for (const [id, discovery] of Object.entries(save.discoveredElements)) if (discovery.firstRecipeId) {
    const recipe = index.content.recipes.find(r => r.id === discovery.firstRecipeId) ?? index.rules.find(r => r.id === discovery.firstRecipeId);
    if (!recipe || recipe.resultElementId !== id || !save.discoveredRecipeIds.includes(recipe.id)) throw new SaveError('invalid_save', 'Inconsistent first-discovery recipe');
  }
}
/** Failed metadata is historical, never silently rewritten as a current-version failure. */
export function isFailureAuthoritative(save: PlayerSave, key: PairKey, index: ContentIndex): boolean {
  const record = save.testedPairs[key];
  if (record?.lastOutcome !== 'no_reaction' || record.testedAgainstContentVersion !== index.content.manifest.contentVersion) return false;
  const [a, b] = key.split('::') as [string, string];
  if (!save.discoveredElements[a] || !save.discoveredElements[b]) return false;
  // An authored eligibility change can also invalidate a failure within one content version.
  return resolve(a, b, engineState(save, index), index).type === 'no_reaction';
}
export function reconcileContent(input: PlayerSave, index: ContentIndex): Reconciliation {
  const save = reconcileReferences(parseSave(input), index);
  validateActiveReferences(save, index);
  const notices: SaveNotice[] = [];
  if (input.contentVersionSeen !== index.content.manifest.contentVersion) notices.push('content_version_updated');
  if (save.quarantine && JSON.stringify(input.quarantine) !== JSON.stringify(save.quarantine)) notices.push('optional_references_quarantined');
  const state = engineState(save, index);
  // Compatibility backfill only. No XP, presentation event or derived reveal is persisted.
  const completed = newCollectionCompletions(state, index).map(event => event.completionId);
  save.completedCollectionChapterIds.push(...completed);
  state.completedCollectionChapterIds = [...save.completedCollectionChapterIds];
  const affected = new Set<string>();
  for (const [key, history] of Object.entries(save.testedPairs)) {
    if (history.lastOutcome !== 'no_reaction' || history.testedAgainstContentVersion === index.content.manifest.contentVersion) continue;
    const [a, b] = key.split('::') as [string, string];
    const result = resolve(a, b, state, index);
    let safe = result.type === 'anomaly' && result.isNewAnomaly;
    if (result.type === 'success' && result.isNewRecipe) {
      const target = index.elements.get(result.resultElementId)!;
      const set = index.content.sets.find(s => s.id === target.setId)!;
      const recipe = index.content.recipes.find(r => r.id === result.recipeId);
      safe = recipe?.discovery !== 'secret' && (target.visibility !== 'secret' || !!save.discoveredElements[target.id]) &&
        (target.completion !== 'secret' || !!save.discoveredElements[target.id]) &&
        ((set.visibility !== 'hidden' && set.visibility !== 'secret') || save.revealedSetIds.includes(set.id));
    }
    if (safe) { affected.add(a); affected.add(b); }
  }
  if (affected.size) notices.push('new_possibilities_available');
  save.contentVersionSeen = index.content.manifest.contentVersion;
  return { save, notices, newPossibilityElementIds: [...affected].sort(), changed: JSON.stringify(save) !== JSON.stringify(input) };
}
