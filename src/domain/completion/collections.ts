import type {
  CollectionDefinition,
  ContentIndex,
  PlayerState,
} from "../model/types";
import { requirementsMet } from "../progression/requirements";

/** Visibility and eligible members are shared by counts, completion and UI projections. */
export function collectionVisible(
  id: string,
  state: PlayerState,
  index: ContentIndex,
): boolean {
  return index.content.visibility.collectionReveals.some(
    (rule) =>
      rule.collectionId === id &&
      rule.paths.some((path) => requirementsMet(path, state, index)),
  );
}
export function eligibleCollectionMembers(
  ids: readonly string[],
  state: PlayerState,
  index: ContentIndex,
): string[] {
  return ids.filter((id) => {
    const element = index.elements.get(id);
    return (
      !!element &&
      element.visibility !== "secret" &&
      element.completion !== "secret" &&
      (state.discoveredElementIds.includes(id) ||
        state.revealedSetIds.includes(element.setId))
    );
  });
}
export function collectionUnits(collection: CollectionDefinition) {
  return collection.chapters?.length
    ? collection.chapters
    : [
        {
          id: collection.id,
          nameKey: collection.nameKey,
          memberElementIds: collection.memberElementIds,
        },
      ];
}
export function collectionProgress(
  memberIds: readonly string[],
  state: PlayerState,
  index: ContentIndex,
) {
  const members = eligibleCollectionMembers(memberIds, state, index);
  const discovered = members.filter((id) =>
      state.discoveredElementIds.includes(id),
    ).length,
    total = members.length;
  return {
    discovered,
    total,
    percent: total ? (discovered / total) * 100 : 0,
    complete: total > 0 && discovered === total,
  };
}
/** No rewards: completion is a once-earned durable fact, not a progression gate. */
export function newCollectionCompletions(
  state: PlayerState,
  index: ContentIndex,
) {
  return index.content.collections.flatMap((collection) => {
    if (!collectionVisible(collection.id, state, index)) return [];
    return collectionUnits(collection)
      .filter(
        (unit) =>
          !state.completedCollectionChapterIds.includes(unit.id) &&
          collectionProgress(unit.memberElementIds, state, index).complete,
      )
      .map((unit) => ({
        type: "collection_completed" as const,
        collectionId: collection.id,
        completionId: unit.id,
      }));
  });
}
