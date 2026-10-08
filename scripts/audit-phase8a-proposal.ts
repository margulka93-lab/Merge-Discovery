import { mkdirSync, writeFileSync } from 'node:fs';
import pack from '../docs/proposals/phase-8a/pack.json';
import review from '../docs/proposals/phase-8a/review.json';
import { rawSeed, loadSeed } from '../src/content/load';
import { validateContent } from '../src/content/validate';
import { buildIndex } from '../src/content/indexes/build';
import { pairKey } from '../src/domain/resolver/pair';
import { resolve } from '../src/domain/resolver/resolve';
import { simulateReachability } from '../src/domain/simulation/reachability';
import { reconcileContent, isFailureAuthoritative } from '../src/application/updates/reconcile';
import { createSave, engineState } from '../src/application/save/projection';
import { createCatalogProjector } from '../src/application/catalog';
import { createWorldProjector } from '../src/application/world';
import { createMapProjector } from '../src/application/map';
import type { ApplicationSnapshot } from '../src/application/save/SaveApplication';
import type { PlayerSave } from '../src/domain/model/save';
import { visibleSets, visibleCollections } from '../src/domain/visibility/project';
import { levelForXp } from '../src/domain/progression/requirements';
import { setCompletion } from '../src/domain/completion/sets';
import { parseSave } from '../src/domain/model/saveSchema';
import oldSave from '../tests/fixtures/saves/v1-completed-sets.json';

// Authoring preflight only: this proposal is deliberately not imported by runtime.
const seed = loadSeed();
const index = buildIndex(validateContent({
  ...rawSeed,
  manifest: { ...rawSeed.manifest, ...pack.manifest },
  elements: [...rawSeed.elements, ...pack.elements],
  sets: [...rawSeed.sets, ...pack.sets],
  recipes: [...rawSeed.recipes, ...pack.recipes],
  anomalies: [...rawSeed.anomalies, ...pack.anomalies],
  unlocks: [...rawSeed.unlocks, ...pack.unlocks],
  visibility: { ...rawSeed.visibility, setAnnouncements: [...rawSeed.visibility.setAnnouncements, ...pack.setAnnouncements] },
  registries: { ...rawSeed.registries, tags: [...new Set([...rawSeed.registries.tags, ...pack.registries.tags])] },
  locales: { it: { ...rawSeed.locales.it, ...pack.locales.it } },
}));
for (const element of seed.content.elements) {
  if (JSON.stringify(element) !== JSON.stringify(index.elements.get(element.id))) throw Error(`Seed element changed: ${element.id}`);
}
for (const recipe of seed.content.recipes) {
  if (JSON.stringify(recipe) !== JSON.stringify(index.content.recipes.find(r => r.id === recipe.id))) throw Error(`Seed recipe changed: ${recipe.id}`);
}
for (const recipe of pack.recipes) {
  if (seed.recipesByPair.has(pairKey(recipe.inputs[0]!, recipe.inputs[1]!))) throw Error(`Seed pair collision: ${recipe.id}`);
  if (!review.candidates.some(c => c.recipeId === recipe.id && c.approval === 'PENDING')) throw Error(`Missing review entry: ${recipe.id}`);
}
const result = simulateReachability(index, { excludeSecrets: true });
if (result.reachableElements !== result.totalElements || result.unreachableRequired.length || result.unrevealedSets.length || result.blockedUnlocks.length) throw Error('Proposal not fully reachable');
for (const recipe of pack.recipes) {
  const ab = resolve(recipe.inputs[0]!, recipe.inputs[1]!, result.state, index);
  const ba = resolve(recipe.inputs[1]!, recipe.inputs[0]!, result.state, index);
  if (JSON.stringify(ab) !== JSON.stringify(ba) || ab.type !== 'success' || ab.resultElementId !== recipe.resultElementId) throw Error(`Nondeterministic pair: ${recipe.id}`);
}
const previous = parseSave(oldSave), reconciled = reconcileContent(previous, index).save;
if (previous.xp !== reconciled.xp || JSON.stringify(previous.discoveredElements) !== JSON.stringify(reconciled.discoveredElements) || JSON.stringify(previous.completedSetIds) !== JSON.stringify(reconciled.completedSetIds)) throw Error('Old-save progress changed during preflight');
for (const set of seed.content.sets) {
  if (JSON.stringify(setCompletion(set.id, engineState(previous, seed), seed)) !== JSON.stringify(setCompletion(set.id, engineState(reconciled, index), index))) throw Error(`Old completion denominator changed: ${set.id}`);
}
const snapshot = (save: PlayerSave): ApplicationSnapshot => {
  const state = engineState(save, index);
  return { save, revision: 1, notices: [], newPossibilityElementIds: [], derived: { level: levelForXp(save.xp, index.content.progression.levelThresholds), sets: visibleSets(state, index), collections: visibleCollections(state, index) } };
};
const catalog = createCatalogProjector(index), world = createWorldProjector(index), map = createMapProjector(index);
const fresh = snapshot(createSave(index, previous.createdAt)), freshCatalog = catalog(fresh);
if (freshCatalog.elements.length !== 4 || freshCatalog.sets.some(s => ['animals', 'fungi'].includes(s.id)) || freshCatalog.detail('wolf')) throw Error('Fresh knowledge leak');
const fullOld = snapshot(reconciled), oldCatalog = catalog(fullOld), oldWorld = world(fullOld, oldCatalog);
if (oldCatalog.sets.find(s => s.id === 'animals')?.completion !== undefined || oldCatalog.detail('fish') || oldCatalog.detail('wolf')) throw Error('Announced Animal count or detail leak');
const oldMap = map(fullOld, oldCatalog, oldWorld, { element: 'wolf', set: 'animals', mode: 'set' }, true);
if (oldMap.nodes.some(e => pack.elements.some(p => p.id === e.id)) || oldWorld.anomalies.some(a => a.id === 'wolf_moon_instability')) throw Error('Unknown graph or Archive leak');
const tested = structuredClone(previous);
tested.testedPairs['creature::ocean'] = { lastOutcome: 'no_reaction', testedAgainstContentVersion: '0.1.0', lastTestedAt: previous.updatedAt };
const changed = reconcileContent(tested, index);
if (isFailureAuthoritative(changed.save, 'creature::ocean', index) || !changed.newPossibilityElementIds.includes('creature') || changed.save.discoveredElements.fish) throw Error('Stale failure did not reactivate safely');
if (resolve('mammal', 'mammal', result.state, index).type !== 'no_reaction') throw Error('Unauthored A+A accepted');
const rejected = review.rejected.map(c => ({ ...c, existingOutcome: index.recipesByPair.get(pairKey(c.inputs[0]!, c.inputs[1]!))?.[0]?.resultElementId }));
if (rejected.some(c => !c.existingOutcome)) throw Error('Unsubstantiated rejection');
const report = {
  status: 'DRY_RUN_ONLY_GAME_REMAINS_67', approval: 'PENDING', blockedBy: 'CODEX_LONG_RUN stop condition: candidate pair collision; human direction required',
  proposedContentVersion: pack.manifest.contentVersion, proposalElements: pack.elements.length, proposalRecipes: pack.recipes.length,
  proposedReachability: { reachable: result.reachableElements, total: result.totalElements, maxDepth: result.maxDependencyDepth, blockedUnlocks: result.blockedUnlocks, checkpoints: result.checkpoints, depths: result.depths },
  proposedSetSizes: Object.fromEntries(index.content.sets.map(s => [s.id, index.membersBySet.get(s.id)?.length])),
  seedElementsUnchanged: 67, seedRecipesUnchanged: 64, seededAnomalyUnchanged: true, oldSaveDryRun: 'PASS, no discovery/XP/completion auto-award',
  oldCompletionDenominators: '6/6 unchanged', staleFailedPair: 'reactivates without auto-discovery', safeKnowledge: 'fresh/announced Animal Set/unknown detail/Map/Archive PASS', unauthoredSelfPair: 'no reaction',
  unorderedPairs: `${pack.recipes.length}/${pack.recipes.length} PASS`, rejected,
};
mkdirSync('docs/evidence/phase-8a', { recursive: true });
writeFileSync('docs/evidence/phase-8a/proposal-preflight.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
