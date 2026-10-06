import type { ContentIndex, PlayerState } from '../model/types';
import { setCompletion } from '../completion/sets';
import { requirementsMet } from '../progression/requirements';

export function visibleSets(state: PlayerState, index: ContentIndex) {
  return index.content.sets.filter(set => state.revealedSetIds.includes(set.id) ||
    (set.visibility !== 'hidden' && set.visibility !== 'secret' && index.content.visibility.setAnnouncements.some(p => p.setId === set.id && p.paths.some(path => requirementsMet(path, state, index)))),
  ).map(set => ({
    id: set.id, nameKey: set.nameKey, revealed: state.revealedSetIds.includes(set.id),
    // No count is exposed for an unrevealed Set.
    ...(state.revealedSetIds.includes(set.id) ? { completion: setCompletion(set.id, state, index) } : {}),
  }));
}
/** Shared safe knowledge boundary for future search/graph consumers. */
export function visibleElements(state: PlayerState, index: ContentIndex) {
  return index.content.elements.filter(e => state.discoveredElementIds.includes(e.id) ||
    (state.revealedSetIds.includes(e.setId) && e.visibility === 'announced' && e.completion !== 'secret'));
}
export function visibleCollections(state: PlayerState, index: ContentIndex) {
  return index.content.collections.filter(c => index.content.visibility.collectionReveals.some(p =>
    p.collectionId === c.id && p.paths.some(path => requirementsMet(path, state, index)),
  )).map(c => {
    const members = c.memberElementIds.filter(id => {
      const e = index.elements.get(id)!;
      return (e.visibility !== 'secret' && e.completion !== 'secret' && state.revealedSetIds.includes(e.setId)) || state.discoveredElementIds.includes(id);
    });
    return { id: c.id, nameKey: c.nameKey, total: members.length, discovered: members.filter(id => state.discoveredElementIds.includes(id)).length };
  });
}
