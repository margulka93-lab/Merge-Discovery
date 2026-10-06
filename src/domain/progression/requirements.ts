import type { ContentIndex, PlayerState, Requirement } from '../model/types';
import { setCompletion } from '../completion/sets';

export function levelForXp(xp: number, thresholds: readonly number[]): number {
  return Math.max(1, thresholds.filter(t => t <= xp).length);
}
export function requirementsMet(requirements: readonly Requirement[] = [], state: PlayerState, index: ContentIndex): boolean {
  return requirements.every(r => {
    switch (r.type) {
      case 'min_level': return levelForXp(state.xp, index.content.progression.levelThresholds) >= r.level;
      case 'element_discovered': return state.discoveredElementIds.includes(r.elementId);
      case 'set_revealed': return state.revealedSetIds.includes(r.setId);
      case 'set_completion_at_least': return state.revealedSetIds.includes(r.setId) && setCompletion(r.setId, state, index).percent >= r.percent;
      case 'feature_unlocked': return state.unlockedFeatureIds.includes(r.featureId);
      case 'era_eligible': return state.eligibleEraIds.includes(r.eraId);
    }
  });
}
