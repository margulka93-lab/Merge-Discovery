import type { ContentIndex, PlayerState } from '../model/types';
import { initialState, progressionEvents, projectEvents } from '../progression/state';
import { resolve } from '../resolver/resolve';
import { pairKey } from '../resolver/pair';

export interface SimulationCheckpoint {
  depth: number; discovered: number; xp: number; revealedSetIds: string[];
}
export function simulateReachability(index: ContentIndex, options: { excludeSecrets?: boolean; revisitSettled?: boolean } = {}) {
  let state: PlayerState = initialState(index);
  state = projectEvents(state, progressionEvents(state, index));
  const depths: Record<string, number> = Object.fromEntries(state.discoveredElementIds.map(id => [id, 0]));
  const checkpoints: SimulationCheckpoint[] = [{ depth: 0, discovered: state.discoveredElementIds.length, xp: state.xp, revealedSetIds: [...state.revealedSetIds] }];
  let rounds = 0;
  const settled = new Set<string>();
  while (true) {
    const before = state;
    // Inputs are frozen per round: reported depth measures recipe layers, not file order.
    const known = new Set(before.discoveredElementIds);
    const keys = new Set([...index.recipesByPair.keys(), ...index.anomaliesByPair.keys()]);
    if (index.rules.length) for (const a of known) for (const b of known) keys.add(pairKey(a, b));
    for (const key of [...keys].sort()) {
      if (!options.revisitSettled && settled.has(key)) continue;
      const [a, b] = key.split('::') as [string, string];
      if (!known.has(a) || !known.has(b)) continue;
      const outcome = resolve(a, b, state, index);
      if (outcome.type === 'success' && options.excludeSecrets) {
        const element = index.elements.get(outcome.resultElementId)!;
        const recipe = index.content.recipes.find(r => r.id === outcome.recipeId);
        if (element.completion === 'secret' || element.visibility === 'secret' || recipe?.discovery === 'secret') continue;
      }
      if (outcome.type === 'success' && outcome.isNewElement) depths[outcome.resultElementId] = rounds + 1;
      state = projectEvents(state, outcome.events);
      // Positive requirements are monotone. With no tag rules, a pair whose every authored
      // recipe is already discovered cannot change XP, unlocks or reachability in later rounds.
      // Gated alternatives and unresolved anomaly payoffs stay live until actually resolved.
      const authored = index.recipesByPair.get(key) ?? [];
      if (!index.rules.length && authored.length && authored.every(r => state.discoveredRecipeIds.includes(r.id))) settled.add(key);
    }
    rounds++;
    const signature = (s: PlayerState) => JSON.stringify([s.xp, s.discoveredElementIds, s.discoveredRecipeIds, s.observedAnomalyIds, s.revealedSetIds, s.completedSetIds, s.completedCollectionChapterIds, s.unlockedFeatureIds, s.eligibleEraIds]);
    if (signature(before) === signature(state)) break;
    checkpoints.push({ depth: rounds, discovered: state.discoveredElementIds.length, xp: state.xp, revealedSetIds: [...state.revealedSetIds] });
  }
  return {
    starters: index.content.elements.filter(e => e.starter).length,
    totalElements: index.elements.size, reachableElements: state.discoveredElementIds.length,
    unreachableRequired: index.content.elements.filter(e => e.completion === 'required' && !state.discoveredElementIds.includes(e.id)).map(e => e.id),
    unrevealedSets: index.content.sets.filter(s => !state.revealedSetIds.includes(s.id)).map(s => s.id),
    blockedUnlocks: index.content.unlocks.filter(u => {
      switch (u.target.type) {
        case 'set': return !state.revealedSetIds.includes(u.target.setId);
        case 'feature': return !state.unlockedFeatureIds.includes(u.target.featureId);
        case 'era': return !state.eligibleEraIds.includes(u.target.eraId);
      }
    }).map(u => ({ id: u.id, requirements: u.requirements })),
    maxDependencyDepth: Math.max(...Object.values(depths)), depths, checkpoints, state,
  };
}
