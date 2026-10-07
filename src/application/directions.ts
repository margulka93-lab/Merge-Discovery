import type { ContentIndex, PairKey } from "../domain/model/types";
import { pairKey } from "../domain/resolver/pair";
import { resolve } from "../domain/resolver/resolve";
import { selectorMatches } from "../domain/resolver/rules";
import { requirementsMet } from "../domain/progression/requirements";
import { engineState } from "./save/projection";
import type { ApplicationSnapshot } from "./save/SaveApplication";

/** Internal application candidates. Never hand these pair keys/partners to React. */
export function createCurrentDirectionSelector(index: ContentIndex) {
  const sets = new Map(index.content.sets.map((s) => [s.id, s]));
  const recipes = new Map(index.content.recipes.map((r) => [r.id, r]));
  const authored = [
    ...new Set([
      ...index.recipesByPair.keys(),
      ...index.anomaliesByPair.keys(),
    ]),
  ];
  const cache = new WeakMap<ApplicationSnapshot, ReturnType<typeof project>>();
  function project(snapshot: ApplicationSnapshot) {
    const { save } = snapshot,
      state = engineState(save, index);
    const owned = new Set(state.discoveredElementIds);
    const visibleElement = (id: string) => {
      const e = index.elements.get(id);
      return Boolean(
        e &&
        e.visibility !== "secret" &&
        e.completion !== "secret" &&
        e.rarity !== "secret" &&
        (save.revealedSetIds.includes(e.setId) ||
          !["hidden", "secret"].includes(sets.get(e.setId)!.visibility)),
      );
    };
    const safeSuccess = (recipeId: string, resultId: string) =>
      recipes.get(recipeId)?.discovery !== "secret" && visibleElement(resultId);
    const pairs = new Set(authored);
    for (const rule of index.rules) {
      if (!requirementsMet(rule.requirements, state, index)) continue;
      const pools = rule.inputSelectors.map((selector) =>
        state.discoveredElementIds.filter(
          (id) =>
            !rule.exclusions?.includes(id) &&
            selectorMatches(selector, index.elements.get(id)!),
        ),
      );
      for (const a of pools[0]!)
        for (const b of pools[1]!) pairs.add(pairKey(a, b));
    }
    const byElement = new Map<string, PairKey[]>(),
      reactivePairs = new Set<PairKey>();
    for (const key of [...pairs].sort()) {
      const [a, b] = key.split("::") as [string, string];
      if (
        !owned.has(a) ||
        !owned.has(b) ||
        !visibleElement(a) ||
        !visibleElement(b)
      )
        continue;
      const result = resolve(a, b, state, index);
      const safe =
        result.type === "success"
          ? safeSuccess(result.recipeId, result.resultElementId)
          : result.type === "anomaly" &&
            !(index.recipesByPair.get(key) ?? []).some(
              (r) =>
                r.discovery === "secret" || !visibleElement(r.resultElementId),
            );
      if (!safe) continue;
      reactivePairs.add(key);
      if (
        result.type === "success"
          ? !result.isNewRecipe
          : result.type !== "anomaly" || !result.isNewAnomaly
      )
        continue;
      for (const id of new Set([a, b]))
        byElement.set(id, [...(byElement.get(id) ?? []), key]);
    }
    return { byElement, reactivePairs, safeSuccess, visibleElement };
  }
  return (snapshot: ApplicationSnapshot) => {
    let value = cache.get(snapshot);
    if (!value) {
      value = project(snapshot);
      cache.set(snapshot, value);
    }
    return value;
  };
}
export interface HintModel {
  available: boolean;
  tier1: string;
  tier2?: string;
  tier3?: string;
}
export function projectHint(
  snapshot: ApplicationSnapshot,
  index: ContentIndex,
  current: ReturnType<ReturnType<typeof createCurrentDirectionSelector>>,
  selected?: string,
): HintModel | undefined {
  if (
    Object.keys(snapshot.save.discoveredElements).length < 15 ||
    !selected ||
    !snapshot.save.discoveredElements[selected] ||
    !current.visibleElement(selected)
  )
    return undefined;
  const key = current.byElement.get(selected)?.[0];
  if (!key)
    return {
      available: false,
      tier1: "Per ora non vedo altre piste con ciò che possiedi.",
    };
  const inputs = key.split("::"),
    partner = index.elements.get(
      inputs[0] === selected ? inputs[1]! : inputs[0]!,
    )!;
  const same = partner.setId === index.elements.get(selected)!.setId;
  const set = index.content.sets.find((s) => s.id === partner.setId)!;
  return {
    available: true,
    tier1: "Ha ancora reazioni da scoprire con elementi che conosci.",
    tier2: same
      ? "Una delle piste resta dentro il Set di questo elemento."
      : "Una delle piste porta verso un elemento di un altro Set che conosci.",
    tier3: snapshot.save.revealedSetIds.includes(set.id)
      ? `Una delle reazioni mancanti coinvolge un elemento del Set ${index.content.locales.it[set.nameKey]}.`
      : undefined,
  };
}
