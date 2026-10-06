import type { ContentIndex, ContentPackage, PairKey } from '../../domain/model/types';
import { pairKey } from '../../domain/resolver/pair';

function groupPairs<T extends { inputs: [string, string] }>(records: T[]): Map<PairKey, T[]> {
  const map = new Map<PairKey, T[]>();
  for (const record of records) {
    const key = pairKey(...record.inputs);
    map.set(key, [...(map.get(key) ?? []), record]);
  }
  return map;
}
/** Called once, only after strict and semantic validation. */
export function buildIndex(content: ContentPackage): ContentIndex {
  return {
    content, elements: new Map(content.elements.map(e => [e.id, e])),
    recipesByPair: groupPairs(content.recipes), anomaliesByPair: groupPairs(content.anomalies),
    membersBySet: new Map(content.sets.map(s => [s.id, content.elements.filter(e => e.setId === s.id)])),
    rules: content.rules,
  };
}
