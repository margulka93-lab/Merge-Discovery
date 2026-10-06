import type { ContentIndex, DomainEvent, PlayerState } from '../model/types';
import { setCompletion } from '../completion/sets';
import { requirementsMet } from './requirements';

export function initialState(index: ContentIndex): PlayerState {
  return {
    xp: 0, discoveredElementIds: index.content.elements.filter(e => e.starter).map(e => e.id),
    discoveredRecipeIds: [], observedAnomalyIds: [], resolvedAnomalyIds: [],
    revealedSetIds: [...index.content.visibility.initialRevealedSetIds], completedSetIds: [],
    unlockedFeatureIds: [], eligibleEraIds: [], testedPairs: {},
  };
}
function add(ids: string[], id: string): string[] { return ids.includes(id) ? ids : [...ids, id]; }
/** Pure event projection for engine tests/simulation; timestamps/storage belong to Phase 2. */
export function projectEvents(state: PlayerState, events: readonly DomainEvent[]): PlayerState {
  const next = { ...state };
  for (const event of events) {
    switch (event.type) {
      case 'pair_tested': next.testedPairs = { ...next.testedPairs, [event.pairKey]: { lastOutcome: event.outcome, testedAgainstContentVersion: event.contentVersion } }; break;
      case 'recipe_discovered': next.discoveredRecipeIds = add(next.discoveredRecipeIds, event.recipeId); break;
      case 'element_discovered': next.discoveredElementIds = add(next.discoveredElementIds, event.elementId); break;
      case 'xp_granted': next.xp += event.amount; break;
      case 'anomaly_registered': next.observedAnomalyIds = add(next.observedAnomalyIds, event.anomalyId); break;
      case 'anomaly_resolved': next.resolvedAnomalyIds = add(next.resolvedAnomalyIds, event.anomalyId); break;
      case 'set_revealed': next.revealedSetIds = add(next.revealedSetIds, event.setId); break;
      case 'set_completed': next.completedSetIds = add(next.completedSetIds, event.setId); break;
      case 'feature_unlocked': next.unlockedFeatureIds = add(next.unlockedFeatureIds, event.featureId); break;
      case 'era_eligible': next.eligibleEraIds = add(next.eligibleEraIds, event.eraId); break;
    }
  }
  return next;
}
/** Reach a fixed point so chained reveals never depend on source file order. */
export function progressionEvents(state: PlayerState, index: ContentIndex): DomainEvent[] {
  let next = state;
  const events: DomainEvent[] = [];
  const emit = (event: DomainEvent) => { events.push(event); next = projectEvents(next, [event]); };
  let changed = true;
  while (changed) {
    changed = false;
    for (const rule of index.content.unlocks) {
      if (!requirementsMet(rule.requirements, next, index)) continue;
      const target = rule.target;
      if (target.type === 'set' && !next.revealedSetIds.includes(target.setId)) {
        emit({ type: 'set_revealed', setId: target.setId });
        const set = index.content.sets.find(s => s.id === target.setId)!;
        const rewards = index.content.progression.rewards;
        const amount = set.visibility === 'secret' ? rewards.secretSetReveal : set.visibility === 'hidden' ? rewards.hiddenSetReveal : rewards.announcedSetReveal;
        emit({ type: 'xp_granted', amount });
        changed = true;
      } else if (target.type === 'feature' && !next.unlockedFeatureIds.includes(target.featureId)) {
        emit({ type: 'feature_unlocked', featureId: target.featureId }); changed = true;
      } else if (target.type === 'era' && !next.eligibleEraIds.includes(target.eraId)) {
        emit({ type: 'era_eligible', eraId: target.eraId }); changed = true;
      }
    }
    for (const setId of next.revealedSetIds) {
      if (!next.completedSetIds.includes(setId) && setCompletion(setId, next, index).complete) {
        emit({ type: 'set_completed', setId });
        const rewards = index.content.progression.rewards;
        emit({ type: 'xp_granted', amount: Math.min(rewards.setCompletionCap, rewards.setCompletionBase + rewards.setCompletionPerElement * setCompletion(setId, next, index).total) });
        changed = true;
      }
    }
  }
  return events;
}
