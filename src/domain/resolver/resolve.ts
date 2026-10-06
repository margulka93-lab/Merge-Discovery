import type { ContentIndex, DomainEvent, PlayerState, ResolutionResult } from '../model/types';
import { requirementsMet, levelForXp } from '../progression/requirements';
import { progressionEvents, projectEvents } from '../progression/state';
import { pairKey } from './pair';
import { ruleMatches, specificity } from './rules';

export class DomainInputError extends Error {
  constructor(public readonly code: 'unknown_element' | 'unavailable_element', public readonly elementId: string) {
    super(`${code}: ${elementId}`); this.name = 'DomainInputError';
  }
}
export class ContentDefinitionError extends Error {}

export function resolve(a: string, b: string, state: PlayerState, index: ContentIndex): ResolutionResult {
  for (const id of [a, b]) {
    if (!index.elements.has(id)) throw new DomainInputError('unknown_element', id);
    if (!state.discoveredElementIds.includes(id)) throw new DomainInputError('unavailable_element', id);
  }
  const key = pairKey(a, b);
  const recipes = index.recipesByPair.get(key) ?? [];
  const valid = recipes.filter(r => requirementsMet(r.requirements, state, index)).sort((x, y) => (y.priority ?? 0) - (x.priority ?? 0));
  if (valid.length > 1 && new Set(valid.map(r => r.priority ?? 0)).size !== valid.length) throw new ContentDefinitionError(`Ambiguous recipe: ${key}`);
  const anomaly = () => {
    const records = (index.anomaliesByPair.get(key) ?? []).filter(r => requirementsMet(r.requirements, state, index));
    if (records.length > 1) throw new ContentDefinitionError(`Ambiguous anomaly: ${key}`);
    return records[0];
  };
  const tested = (outcome: 'success' | 'anomaly' | 'no_reaction'): DomainEvent => ({ type: 'pair_tested', pairKey: key, outcome, contentVersion: index.content.manifest.contentVersion });
  const finish = (events: DomainEvent[]) => {
    const projected = projectEvents(state, events);
    events.push(...progressionEvents(projected, index));
    const level = levelForXp(projectEvents(state, events).xp, index.content.progression.levelThresholds);
    if (level > levelForXp(state.xp, index.content.progression.levelThresholds)) events.push({ type: 'level_up', level });
    if (events.some(e => ['element_discovered', 'set_revealed', 'feature_unlocked', 'era_eligible', 'anomaly_registered', 'anomaly_resolved'].includes(e.type))) events.push({ type: 'new_possibilities_available' });
    return events;
  };
  const success = (id: string, resultElementId: string): ResolutionResult => {
    const isNewElement = !state.discoveredElementIds.includes(resultElementId);
    const isNewRecipe = !state.discoveredRecipeIds.includes(id);
    const events: DomainEvent[] = [tested('success'), { type: isNewRecipe ? 'recipe_discovered' : 'known_recipe_repeated', recipeId: id }];
    if (isNewElement) events.push({ type: 'element_discovered', elementId: resultElementId });
    const rewards = index.content.progression.rewards;
    const amount = !isNewRecipe ? 0 : isNewElement ? rewards.newElementBase + rewards.rarityBonus[index.elements.get(resultElementId)!.rarity] : rewards.alternateRecipe;
    if (amount) events.push({ type: 'xp_granted', amount });
    const observed = (index.anomaliesByPair.get(key) ?? []).find(x => x.resolutionRecipeId === id && state.observedAnomalyIds.includes(x.id) && !state.resolvedAnomalyIds.includes(x.id));
    if (observed) events.push({ type: 'anomaly_resolved', anomalyId: observed.id }, { type: 'xp_granted', amount: rewards.anomalyResolved });
    return { type: 'success', pairKey: key, recipeId: id, resultElementId, isNewElement, isNewRecipe, events: finish(events) };
  };
  const anomalyResult = (): ResolutionResult | undefined => {
    const record = anomaly();
    if (!record) return;
    const isNewAnomaly = !state.observedAnomalyIds.includes(record.id);
    const events: DomainEvent[] = [tested('anomaly')];
    if (isNewAnomaly) events.push({ type: 'anomaly_registered', anomalyId: record.id }, { type: 'xp_granted', amount: index.content.progression.rewards.anomalyRegistered });
    return { type: 'anomaly', pairKey: key, anomalyId: record.id, isNewAnomaly, events: finish(events) };
  };
  if (valid[0]) return success(valid[0].id, valid[0].resultElementId);
  if (recipes.some(r => r.gateBehavior === 'anomaly' || (r.gateBehavior === 'unlock_trigger' && r.gateFallback === 'anomaly'))) {
    const result = anomalyResult(); if (result) return result;
  }
  const rules = index.rules.filter(r => ruleMatches(r, index.elements.get(a)!, index.elements.get(b)!) && requirementsMet(r.requirements, state, index))
    .sort((x, y) => y.priority - x.priority || specificity(y) - specificity(x));
  if (rules[0] && rules[1] && rules[0].priority === rules[1].priority && specificity(rules[0]) === specificity(rules[1])) throw new ContentDefinitionError(`Ambiguous rule: ${key}`);
  if (rules[0]) return success(rules[0].id, rules[0].resultElementId);
  // A dormant/normal authored pair cannot disclose a linked future anomaly.
  const result = recipes.length === 0 ? anomalyResult() : undefined;
  if (result) return result;
  return { type: 'no_reaction', pairKey: key, events: [tested('no_reaction'), { type: 'no_reaction' }] };
}
