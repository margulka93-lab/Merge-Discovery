import type { ContentIndex, PlayerState, ResolutionResult } from '../../domain/model/types';
import type { PlayerSave, PlayerSettings } from '../../domain/model/save';
import { initialState, projectEvents } from '../../domain/progression/state';
import { requirementsMet } from '../../domain/progression/requirements';
import { parseSave, SAVE_SCHEMA_VERSION } from '../../domain/model/saveSchema';
import { SaveError } from './errors';

export const defaultSettings: PlayerSettings = {
  informationMode: 'balanced', proactiveHints: 'off', reducedMotion: true, highContrast: false,
  textScale: 'default', soundEnabled: false, musicEnabled: false, dragEnabled: false,
};
export function createSave(index: ContentIndex, timestamp: string): PlayerSave {
  if (index.content.manifest.minimumSaveSchemaVersion > SAVE_SCHEMA_VERSION) throw new SaveError('unsupported_schema', 'Content requires a newer save schema');
  return parseSave({
    saveSchemaVersion: SAVE_SCHEMA_VERSION, contentVersionSeen: index.content.manifest.contentVersion,
    createdAt: timestamp, updatedAt: timestamp, xp: 0,
    discoveredElements: Object.fromEntries(index.content.elements.filter(e => e.starter).map(e => [e.id, { firstDiscoveredAt: timestamp }])),
    discoveredRecipeIds: [], testedPairs: {}, anomalies: {},
    revealedSetIds: [...index.content.visibility.initialRevealedSetIds], completedSetIds: [],
    completedCollectionChapterIds: [], favoriteElementIds: [], settings: { ...defaultSettings },
  });
}
export function engineState(save: PlayerSave, index: ContentIndex): PlayerState {
  const state: PlayerState = {
    ...initialState(index), xp: save.xp, discoveredElementIds: Object.keys(save.discoveredElements),
    discoveredRecipeIds: [...save.discoveredRecipeIds],
    observedAnomalyIds: Object.keys(save.anomalies), resolvedAnomalyIds: Object.entries(save.anomalies).filter(([, a]) => a.resolvedAt).map(([id]) => id),
    revealedSetIds: [...save.revealedSetIds], completedSetIds: [...save.completedSetIds], completedCollectionChapterIds: [...save.completedCollectionChapterIds],
    testedPairs: Object.fromEntries(Object.entries(save.testedPairs).map(([key, value]) => [key, { lastOutcome: value.lastOutcome, testedAgainstContentVersion: value.testedAgainstContentVersion }])),
  };
  // Feature/Era eligibility is derived from current content, never a second durable truth.
  let changed = true;
  while (changed) {
    changed = false;
    for (const rule of index.content.unlocks) {
      if (!requirementsMet(rule.requirements, state, index)) continue;
      if (rule.target.type === 'feature' && !state.unlockedFeatureIds.includes(rule.target.featureId)) {
        state.unlockedFeatureIds.push(rule.target.featureId); changed = true;
      } else if (rule.target.type === 'era' && !state.eligibleEraIds.includes(rule.target.eraId)) {
        state.eligibleEraIds.push(rule.target.eraId); changed = true;
      }
    }
  }
  return state;
}
export function projectResolution(save: PlayerSave, result: ResolutionResult, timestamp: string, index: ContentIndex): PlayerSave {
  const next = structuredClone(save);
  const state = projectEvents(engineState(save, index), result.events);
  next.xp = state.xp; next.discoveredRecipeIds = state.discoveredRecipeIds;
  next.revealedSetIds = state.revealedSetIds; next.completedSetIds = state.completedSetIds;
  next.completedCollectionChapterIds = state.completedCollectionChapterIds;
  next.updatedAt = timestamp;
  for (const event of result.events) {
    if (event.type === 'pair_tested') next.testedPairs[event.pairKey] = { lastOutcome: event.outcome, testedAgainstContentVersion: event.contentVersion, lastTestedAt: timestamp };
    else if (event.type === 'element_discovered' && !next.discoveredElements[event.elementId]) next.discoveredElements[event.elementId] = {
      firstDiscoveredAt: timestamp, ...(result.type === 'success' ? { firstRecipeId: result.recipeId } : {}),
    };
    else if (event.type === 'anomaly_registered' && !next.anomalies[event.anomalyId]) next.anomalies[event.anomalyId] = { firstObservedAt: timestamp };
    else if (event.type === 'anomaly_resolved') {
      const anomaly = next.anomalies[event.anomalyId];
      if (!anomaly) throw new SaveError('invalid_save', 'Cannot resolve an unobserved anomaly');
      anomaly.resolvedAt ??= timestamp;
    }
  }
  return parseSave(next);
}
