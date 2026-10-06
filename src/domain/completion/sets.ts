import type { ContentIndex, PlayerState } from '../model/types';

export function setCompletion(setId: string, state: PlayerState, index: ContentIndex) {
  const members = (index.membersBySet.get(setId) ?? []).filter(e =>
    e.completion === 'required' && (e.visibility !== 'secret' || state.discoveredElementIds.includes(e.id)),
  );
  const discovered = members.filter(e => state.discoveredElementIds.includes(e.id)).length;
  const total = members.length;
  return { discovered, total, percent: total ? discovered / total * 100 : 0, complete: total > 0 && discovered === total };
}
