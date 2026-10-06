import { describe, expect, it } from 'vitest';
import { loadSeed, rawSeed } from '../src/content/load';
import { buildIndex } from '../src/content/indexes/build';
import { validateContent } from '../src/content/validate';
import { initialState, projectEvents } from '../src/domain/progression/state';
import { requirementsMet } from '../src/domain/progression/requirements';
import { DomainInputError, resolve } from '../src/domain/resolver/resolve';
import { pairKey } from '../src/domain/resolver/pair';
import { simulateReachability } from '../src/domain/simulation/reachability';
import { visibleCollections, visibleElements, visibleSets } from '../src/domain/visibility/project';
import { setCompletion } from '../src/domain/completion/sets';
import type { ContentPackage } from '../src/domain/model/types';

const index = loadSeed();
const fresh = () => initialState(index);
const withInputs = (...ids: string[]) => ({ ...fresh(), discoveredElementIds: [...new Set([...fresh().discoveredElementIds, ...ids])] });
const mutableContent = (): ContentPackage => structuredClone(validateContent(rawSeed));

describe('canonical resolver', () => {
  it('canonicalizes A+B and A+A', () => {
    expect(pairKey('void', 'energy')).toBe('energy::void');
    expect(pairKey('energy', 'energy')).toBe('energy::energy');
    expect(resolve('void', 'energy', fresh(), index)).toEqual(resolve('energy', 'void', fresh(), index));
    for (const r of index.content.recipes) {
      const state = withInputs(...r.inputs);
      expect(resolve(...r.inputs, state, index)).toEqual(resolve(r.inputs[1], r.inputs[0], state, index));
    }
  });
  it('supports every authored A+A and rejects unauthored A+A', () => {
    for (const r of index.content.recipes.filter(r => r.inputs[0] === r.inputs[1])) {
      expect(resolve(...r.inputs, withInputs(...r.inputs), index)).toMatchObject({ type: 'success', recipeId: r.id, resultElementId: r.resultElementId });
    }
    expect(resolve('void', 'void', fresh(), index).type).toBe('no_reaction');
  });
  it('has two distinct Water recipe IDs; a new alternate grants 20 XP', () => {
    const recipes = index.content.recipes.filter(r => r.resultElementId === 'water');
    expect(recipes).toHaveLength(2); expect(new Set(recipes.map(r => r.id)).size).toBe(2);
    let state = withInputs('planet', 'comet', 'heat');
    const first = resolve('planet', 'comet', state, index);
    state = projectEvents(state, first.events);
    const second = resolve('comet', 'heat', state, index);
    expect(second).toMatchObject({ type: 'success', isNewElement: false, isNewRecipe: true });
    expect(second.events.filter(e => e.type === 'xp_granted')).toEqual([{ type: 'xp_granted', amount: 20 }]);
  });
  it('alternate as first discovery receives normal XP only', () => {
    const result = resolve('comet', 'heat', withInputs('comet', 'heat'), index);
    expect(result.events.filter(e => e.type === 'xp_granted')).toContainEqual({ type: 'xp_granted', amount: 100 });
    expect(result.events).not.toContainEqual({ type: 'xp_granted', amount: 20 });
  });
  it('recognizes repeated recipes, consumes nothing and grants zero XP', () => {
    const first = resolve('void', 'energy', fresh(), index);
    const state = projectEvents(fresh(), first.events);
    const result = resolve('energy', 'void', state, index);
    expect(result).toMatchObject({ type: 'success', isNewElement: false, isNewRecipe: false });
    expect(result.events).toContainEqual({ type: 'known_recipe_repeated', recipeId: 'void_energy_to_light' });
    expect(result.events.filter(e => e.type === 'xp_granted')).toEqual([]);
    expect(projectEvents(state, result.events).discoveredElementIds).toEqual(state.discoveredElementIds);
  });
  it('returns the unresolved lunar anomaly and never farms repeated anomaly XP', () => {
    const state = withInputs('moon', 'life');
    const result = resolve('moon', 'life', state, index);
    expect(result).toMatchObject({ type: 'anomaly', anomalyId: 'lunar_life_instability', isNewAnomaly: true });
    expect(index.content.anomalies[0]?.resolutionRecipeId).toBeUndefined();
    const repeated = resolve('life', 'moon', projectEvents(state, result.events), index);
    expect(repeated).toMatchObject({ type: 'anomaly', isNewAnomaly: false });
    expect(repeated.events.filter(e => e.type === 'xp_granted')).toEqual([]);
  });
  it('does not mutate input objects and is deterministic', () => {
    const state = fresh(); const copy = structuredClone(state); const data = structuredClone(index.content);
    expect(resolve('void', 'energy', state, index)).toEqual(resolve('void', 'energy', state, index));
    expect(state).toEqual(copy); expect(index.content).toEqual(data);
  });
  it('returns typed errors for unknown or undiscovered inputs', () => {
    expect(() => resolve('unknown', 'energy', fresh(), index)).toThrow(DomainInputError);
    expect(() => resolve('star', 'energy', fresh(), index)).toThrow(DomainInputError);
    try { resolve('star', 'energy', fresh(), index); } catch (e) { expect(e).toMatchObject({ code: 'unavailable_element', elementId: 'star' }); }
  });
  it('remembers failed unordered pairs against the content version', () => {
    const state = projectEvents(fresh(), resolve('matter', 'void', fresh(), index).events);
    expect(state.testedPairs['matter::void']).toEqual({ lastOutcome: 'no_reaction', testedAgainstContentVersion: '0.1.0' });
  });
});

describe('requirements and precedence foundation', () => {
  it('evaluates all six requirement variants, ANDed', () => {
    const state = { ...fresh(), xp: 250, unlockedFeatureIds: ['test_feature'], eligibleEraIds: ['life'] };
    expect(requirementsMet([
      { type: 'min_level', level: 2 }, { type: 'element_discovered', elementId: 'energy' },
      { type: 'set_revealed', setId: 'origins' }, { type: 'set_completion_at_least', setId: 'origins', percent: 40 },
      { type: 'feature_unlocked', featureId: 'test_feature' }, { type: 'era_eligible', eraId: 'life' },
    ], state, index)).toBe(true);
    expect(requirementsMet([{ type: 'min_level', level: 3 }], state, index)).toBe(false);
    expect(requirementsMet([{ type: 'set_completion_at_least', setId: 'fungi', percent: 0 }], state, index)).toBe(false);
  });
  it('explicit recipe beats matching tag rule, and tag selectors are unordered', () => {
    const c = mutableContent(); c.registries.tags = ['primitive']; c.elements.find(e => e.id === 'energy')!.tags = ['primitive'];
    c.rules.push({ id: 'test_rule', inputSelectors: [{ all: ['primitive'] }, {}], resultElementId: 'gas', priority: 1 });
    const i = buildIndex(validateContent(c));
    expect(resolve('void', 'energy', fresh(), i)).toMatchObject({ type: 'success', resultElementId: 'light' });
    expect(resolve('matter', 'energy', fresh(), i)).toMatchObject({ type: 'success', resultElementId: 'plasma' });
    expect(resolve('time', 'energy', fresh(), i)).toEqual(resolve('energy', 'time', fresh(), i));
    expect(resolve('time', 'energy', fresh(), i)).toMatchObject({ type: 'success', recipeId: 'test_rule' });
  });
  it('dormant gate has no reveal; eligible unlock trigger resolves', () => {
    const c = mutableContent(); const r = c.recipes.find(r => r.resultElementId === 'light')!;
    r.requirements = [{ type: 'min_level', level: 2 }]; r.gateBehavior = 'unlock_trigger'; r.gateFallback = 'dormant';
    c.unlocks.push({ id: 'test_reveal', target: { type: 'set', setId: 'cosmos' }, requirements: [{ type: 'element_discovered', elementId: 'light' }], revealMode: 'normal' });
    const i = buildIndex(validateContent(c));
    expect(resolve('void', 'energy', fresh(), i).events.map(e => e.type)).toEqual(['pair_tested', 'no_reaction']);
    expect(resolve('void', 'energy', { ...fresh(), xp: 250 }, i).events).toContainEqual({ type: 'set_revealed', setId: 'cosmos' });
  });
  it('anomaly resolves only when performed again after gate satisfaction', () => {
    const c = mutableContent();
    c.recipes.push({ id: 'test_lunar_resolution', kind: 'explicit', discovery: 'normal', inputs: ['moon', 'life'], resultElementId: 'light', requirements: [{ type: 'min_level', level: 2 }], gateBehavior: 'anomaly' });
    c.anomalies[0]!.resolutionRecipeId = 'test_lunar_resolution';
    const i = buildIndex(validateContent(c)); const state = withInputs('moon', 'life');
    const anomaly = resolve('moon', 'life', state, i);
    const eligible = { ...projectEvents(state, anomaly.events), xp: 250 };
    expect(eligible.discoveredElementIds).not.toContain('light');
    expect(resolve('moon', 'life', eligible, i).events).toContainEqual({ type: 'anomaly_resolved', anomalyId: 'lunar_life_instability' });
  });
  it('a linked dormant recipe never leaks its future anomaly', () => {
    const c = mutableContent();
    c.recipes.push({ id: 'test_dormant_lunar', kind: 'explicit', discovery: 'normal', inputs: ['moon', 'life'], resultElementId: 'light', requirements: [{ type: 'min_level', level: 2 }], gateBehavior: 'dormant' });
    c.anomalies[0]!.resolutionRecipeId = 'test_dormant_lunar';
    const i = buildIndex(validateContent(c));
    expect(resolve('moon', 'life', withInputs('moon', 'life'), i).events.map(e => e.type)).toEqual(['pair_tested', 'no_reaction']);
  });
  it('higher unique priority wins; invalid runtime ambiguity fails deterministically', () => {
    const c = mutableContent(); c.recipes[0]!.priority = 1;
    c.recipes.push({ ...c.recipes[0]!, id: 'test_high_priority', resultElementId: 'heat', priority: 2 });
    expect(resolve('void', 'energy', fresh(), buildIndex(validateContent(c)))).toMatchObject({ type: 'success', recipeId: 'test_high_priority', resultElementId: 'heat' });
    c.recipes.at(-1)!.priority = 1;
    expect(() => resolve('void', 'energy', fresh(), buildIndex(c))).toThrow('Ambiguous recipe');
  });
});

describe('visibility, completion and simulation', () => {
  it('Funghi and its count/elements stay absent until Mold, then reveal once', () => {
    const state = withInputs('life', 'humidity');
    expect(visibleSets(state, index).map(s => s.id)).not.toContain('fungi');
    expect(visibleElements(state, index).some(e => e.setId === 'fungi')).toBe(false);
    const result = resolve('life', 'humidity', state, index);
    expect(result.events).toContainEqual({ type: 'set_revealed', setId: 'fungi' });
    const next = projectEvents(state, result.events);
    expect(visibleSets(next, index).find(s => s.id === 'fungi')?.completion).toMatchObject({ discovered: 1, total: 5 });
    expect(resolve('life', 'humidity', next, index).events.some(e => e.type === 'set_revealed')).toBe(false);
  });
  it('announces Mondo after Cosmo and Piante after Vita, with no unrevealed denominator', () => {
    expect(visibleSets(fresh(), index).map(s => s.id)).toEqual(['origins', 'cosmos']);
    const sets = visibleSets({ ...fresh(), revealedSetIds: ['origins', 'cosmos', 'life'] }, index);
    expect(sets.find(s => s.id === 'world')).toEqual({ id: 'world', nameKey: 'sets.world.name', revealed: false });
    expect(sets.find(s => s.id === 'plants')?.revealed).toBe(false);
  });
  it('Collection reveal paths preserve both alternatives', () => {
    expect(visibleCollections(fresh(), index)).toEqual([]);
    for (const id of ['steam', 'cloud']) expect(visibleCollections(withInputs(id), index).map(c => c.id)).toContain('water_cycle');
    for (const id of ['seed', 'moss']) expect(visibleCollections(withInputs(id), index).map(c => c.id)).toContain('green_everywhere');
  });
  it('bonus and secret members never reduce required completion', () => {
    const c = mutableContent(); c.elements.push({ ...c.elements[0]!, id: 'test_secret', starter: false, completion: 'secret', visibility: 'secret' });
    const i = buildIndex(validateContent(c));
    const state = { ...fresh(), discoveredElementIds: c.elements.filter(e => e.setId === 'origins' && e.id !== 'test_secret').map(e => e.id) };
    expect(setCompletion('origins', state, i)).toMatchObject({ total: 10, complete: true });
    expect(setCompletion('origins', { ...state, discoveredElementIds: [...state.discoveredElementIds, 'test_secret'] }, i).complete).toBe(true);
  });
  it('reaches 67/67 from 4 starters in 11 layers with all 6 Sets and anomaly', () => {
    const result = simulateReachability(index);
    expect(result).toMatchObject({ starters: 4, totalElements: 67, reachableElements: 67, maxDependencyDepth: 11, unreachableRequired: [], unrevealedSets: [], blockedUnlocks: [] });
    expect(result.state.observedAnomalyIds).toEqual(['lunar_life_instability']);
    expect(result.state.completedSetIds).toHaveLength(6);
    expect(result.checkpoints[0]?.discovered).toBe(4);
    expect(simulateReachability(index, { excludeSecrets: true }).reachableElements).toBe(67);
  });
  it('reports a self-gated reveal/feature cycle instead of assuming all unlocked', () => {
    const c = mutableContent(); c.registries.features = ['test_feature'];
    c.unlocks.push({ id: 'cycle', target: { type: 'feature', featureId: 'test_feature' }, requirements: [{ type: 'feature_unlocked', featureId: 'test_feature' }], revealMode: 'silent' });
    const result = simulateReachability(buildIndex(validateContent(c)));
    expect(result.blockedUnlocks.map(u => u.id)).toContain('cycle');
  });
});
