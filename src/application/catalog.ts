import type { ContentIndex, PairKey } from "../domain/model/types";
import type { ApplicationSnapshot } from "./save/SaveApplication";
import { engineState } from "./save/projection";
import { laboratoryModel, type LabElement } from "./laboratory";
import { resolve } from "../domain/resolver/resolve";
import { pairKey } from "../domain/resolver/pair";
import { ruleMatches, selectorMatches } from "../domain/resolver/rules";
import { requirementsMet } from "../domain/progression/requirements";
import { isFailureAuthoritative } from "./updates/reconcile";

export interface CatalogElement extends LabElement {
  setId: string;
  rarityId: string;
  order: number;
  firstDiscoveredAt: string;
  possibilities: boolean;
  exhausted: boolean;
  stale: boolean;
  newPossibilities: boolean;
}
export interface CatalogSet {
  id: string;
  name: string;
  description: string;
  artKey: string;
  revealed: boolean;
  completion?: {
    discovered: number;
    total: number;
    percent: number;
    complete: boolean;
  };
  earned: boolean;
  newPossibilities: boolean;
}
export interface KnownRecipe {
  id: string;
  inputs: [CatalogElement, CatalogElement];
  result: CatalogElement;
}
export interface Experiment {
  partner: CatalogElement;
  outcome: "success" | "anomaly" | "no_reaction";
  stale: boolean;
}
export interface KnownAnomaly {
  partner: CatalogElement;
  status: string;
}
export interface ElementDetailModel {
  element: CatalogElement;
  starter: boolean;
  firstRecipe?: KnownRecipe;
  recipes: KnownRecipe[];
  usedFor: KnownRecipe[];
  anomalies: KnownAnomaly[];
  experiments: Experiment[];
}
export interface CatalogModel {
  elements: CatalogElement[];
  sets: CatalogSet[];
  recent: CatalogElement[];
  detail: (id: string) => ElementDetailModel | undefined;
}

/** Immutable content indexes built once, then a cached projection per committed snapshot.
 * Only authored candidate pairs are evaluated; no persisted/global A×B matrix.
 * DTOs contain owned names and visible Sets, never unknown partners/results.
 */
export function createCatalogProjector(index: ContentIndex) {
  const setsById = new Map(index.content.sets.map((s) => [s.id, s]));
  const recipesById = new Map(index.content.recipes.map((r) => [r.id, r]));
  const rulesById = new Map(index.rules.map((r) => [r.id, r]));
  const candidates = new Set([
    ...index.recipesByPair.keys(),
    ...index.anomaliesByPair.keys(),
  ]);
  const cache = new WeakMap<ApplicationSnapshot, CatalogModel>();
  return (snapshot: ApplicationSnapshot): CatalogModel => {
    const cached = cache.get(snapshot);
    if (cached) return cached;
    const { save } = snapshot,
      state = engineState(save, index);
    const owned = new Set(state.discoveredElementIds),
      possible = new Set<string>();
    const eligiblePairs = new Set(candidates),
      safelyChangedPairs = new Set<PairKey>();
    // Tag rules generate only matching candidates, and only when their domain is unlocked.
    // With the canonical seed this path is empty; it does not allocate an all-pairs matrix.
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
        for (const b of pools[1]!) eligiblePairs.add(pairKey(a, b));
    }
    const safeSuccess = (recipeId: string, resultId: string) => {
      const target = index.elements.get(resultId)!,
        set = setsById.get(target.setId)!;
      return (
        recipesById.get(recipeId)?.discovery !== "secret" &&
        (owned.has(resultId) ||
          (target.visibility !== "secret" && target.completion !== "secret")) &&
        (save.revealedSetIds.includes(set.id) ||
          !["hidden", "secret"].includes(set.visibility))
      );
    };
    for (const key of eligiblePairs) {
      const [a, b] = key.split("::") as [string, string];
      if (!owned.has(a) || !owned.has(b)) continue;
      const result = resolve(a, b, state, index);
      const safeCurrentReaction =
        result.type === "success"
          ? safeSuccess(result.recipeId, result.resultElementId)
          : result.type === "anomaly" &&
            !(index.recipesByPair.get(key) ?? []).some(
              (r) => r.discovery === "secret",
            );
      if (safeCurrentReaction) safelyChangedPairs.add(key);
      const available =
        result.type === "success"
          ? safeSuccess(result.recipeId, result.resultElementId) &&
            (result.isNewRecipe ||
              result.isNewElement ||
              result.events.some((e) => e.type === "anomaly_resolved"))
          : result.type === "anomaly" &&
            result.isNewAnomaly &&
            !(index.recipesByPair.get(key) ?? []).some(
              (r) => r.discovery === "secret",
            );
      if (available) {
        possible.add(a);
        possible.add(b);
      }
    }
    const staleIds = new Set<string>();
    const history = new Map<
      string,
      { partnerId: string; outcome: Experiment["outcome"]; stale: boolean }[]
    >();
    for (const [rawKey, record] of Object.entries(save.testedPairs)) {
      const key = rawKey as PairKey,
        [a, b] = key.split("::") as [string, string];
      if (!owned.has(a) || !owned.has(b)) continue;
      const stale =
        record.lastOutcome === "no_reaction" &&
        !isFailureAuthoritative(save, key, index) &&
        (record.testedAgainstContentVersion !==
          index.content.manifest.contentVersion ||
          safelyChangedPairs.has(key));
      if (stale) {
        staleIds.add(a);
        staleIds.add(b);
      }
      for (const [id, partnerId] of a === b
        ? [[a, b]]
        : [
            [a, b],
            [b, a],
          ]) {
        const entries = history.get(id!) ?? [];
        entries.push({
          partnerId: partnerId!,
          outcome: record.lastOutcome,
          stale,
        });
        history.set(id!, entries);
      }
    }
    const fresh = new Set(snapshot.newPossibilityElementIds),
      favorites = new Set(save.favoriteElementIds);
    const elements = laboratoryModel(snapshot, index).elements.map(
      (element, order): CatalogElement => {
        const definition = index.elements.get(element.id)!;
        return {
          ...element,
          favorite: favorites.has(element.id),
          setId: definition.setId,
          rarityId: definition.rarity,
          order: definition.sortOrder ?? order,
          firstDiscoveredAt:
            save.discoveredElements[element.id]!.firstDiscoveredAt,
          possibilities: possible.has(element.id),
          exhausted: !possible.has(element.id) && !staleIds.has(element.id),
          stale: staleIds.has(element.id),
          newPossibilities: fresh.has(element.id),
        };
      },
    );
    const byId = new Map(elements.map((e) => [e.id, e]));
    const text = (key: string) => index.content.locales.it[key] ?? "";
    const sets = snapshot.derived.sets.map((visible): CatalogSet => {
      const set = setsById.get(visible.id)!;
      return {
        id: set.id,
        name: text(set.nameKey),
        description: visible.revealed ? text(set.descriptionKey) : "",
        artKey: set.iconKey,
        revealed: visible.revealed,
        completion: visible.completion,
        earned: save.completedSetIds.includes(set.id),
        newPossibilities: elements.some(
          (e) => e.setId === set.id && e.newPossibilities,
        ),
      };
    });
    const knownRecipes: KnownRecipe[] = [],
      knownRecipeKeys = new Set<string>();
    const addRecipe = (
      id: string,
      inputs: [string, string],
      resultId: string,
    ) => {
      const a = byId.get(inputs[0]),
        b = byId.get(inputs[1]),
        result = byId.get(resultId);
      const key = `${id}:${pairKey(...inputs)}`;
      if (a && b && result && !knownRecipeKeys.has(key)) {
        knownRecipeKeys.add(key);
        knownRecipes.push({ id, inputs: [a, b], result });
      }
    };
    for (const id of save.discoveredRecipeIds) {
      const recipe = recipesById.get(id);
      if (recipe) addRecipe(id, recipe.inputs, recipe.resultElementId);
      else {
        const rule = rulesById.get(id);
        if (!rule) continue;
        // A rule ID is not proof that every matching pair was tried: show saved successes only.
        for (const [key, record] of Object.entries(save.testedPairs)) {
          const inputs = key.split("::") as [string, string];
          if (
            record.lastOutcome === "success" &&
            byId.has(inputs[0]) &&
            byId.has(inputs[1]) &&
            ruleMatches(
              rule,
              index.elements.get(inputs[0])!,
              index.elements.get(inputs[1])!,
            )
          ) {
            const outcome = resolve(...inputs, state, index);
            if (outcome.type === "success" && outcome.recipeId === id)
              addRecipe(id, inputs, rule.resultElementId);
          }
        }
      }
    }
    const producing = new Map<string, KnownRecipe[]>(),
      using = new Map<string, KnownRecipe[]>();
    for (const recipe of knownRecipes) {
      const outputs = producing.get(recipe.result.id) ?? [];
      outputs.push(recipe);
      producing.set(recipe.result.id, outputs);
      for (const id of new Set(recipe.inputs.map((e) => e.id))) {
        const inputs = using.get(id) ?? [];
        inputs.push(recipe);
        using.set(id, inputs);
      }
    }
    const details = new Map<string, ElementDetailModel>();
    const model: CatalogModel = {
      elements,
      sets,
      recent: [...elements]
        .sort(
          (a, b) =>
            Date.parse(b.firstDiscoveredAt) - Date.parse(a.firstDiscoveredAt) ||
            a.order - b.order,
        )
        .slice(0, 8),
      detail: (id) => {
        const element = byId.get(id);
        if (!element) return undefined;
        const cachedDetail = details.get(id);
        if (cachedDetail) return cachedDetail;
        const recipes = producing.get(id) ?? [],
          firstId = save.discoveredElements[id]?.firstRecipeId;
        const anomalies = index.content.anomalies.flatMap((a) => {
          if (
            !save.anomalies[a.id] ||
            !a.inputs.includes(id) ||
            !a.inputs.every((input) => byId.has(input))
          )
            return [];
          const partner = byId.get(
            a.inputs[0] === id ? a.inputs[1] : a.inputs[0],
          )!;
          const outcome = resolve(...a.inputs, state, index);
          const revisitable =
            outcome.type === "success" &&
            safeSuccess(outcome.recipeId, outcome.resultElementId);
          return [
            {
              partner,
              status: save.anomalies[a.id]?.resolvedAt
                ? "Risolta"
                : revisitable
                  ? "Potrebbe essere rivisitata"
                  : "Instabile · già osservata",
            },
          ];
        });
        const value = {
          element,
          starter: Boolean(index.elements.get(id)?.starter),
          firstRecipe: recipes.find((r) => r.id === firstId),
          recipes,
          usedFor: using.get(id) ?? [],
          anomalies,
          experiments: (history.get(id) ?? []).map((e) => ({
            ...e,
            partner: byId.get(e.partnerId)!,
          })),
        };
        details.set(id, value);
        return value;
      },
    };
    cache.set(snapshot, model);
    return model;
  };
}
