import type { ContentIndex, PlayerState } from '../model/types';
import { collectionVisible, collectionProgress } from '../completion/collections';
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
  return index.content.collections.filter(c => collectionVisible(c.id, state, index)).map(c => ({
    id: c.id, nameKey: c.nameKey, ...collectionProgress(c.memberElementIds, state, index),
  }));
}
