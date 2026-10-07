import type { ContentIndex } from "../domain/model/types";
import type { ApplicationSnapshot } from "./save/SaveApplication";
import type { CatalogElement, CatalogModel } from "./catalog";
import {
  collectionUnits,
  collectionProgress,
  eligibleCollectionMembers,
} from "../domain/completion/collections";
import { engineState } from "./save/projection";
import { resolve } from "../domain/resolver/resolve";

export interface ThematicCollection {
  id: string;
  name: string;
  description: string;
  discovered: number;
  total: number;
  percent: number;
  complete: boolean;
  earned: boolean;
  members: CatalogElement[];
  missing: number;
  chapters: {
    id: string;
    name: string;
    discovered: number;
    total: number;
    percent: number;
    earned: boolean;
  }[];
}
export interface ObservedAnomaly {
  id: string;
  inputs: [CatalogElement, CatalogElement];
  firstObservedAt: string;
  status: "Instabile" | "Inerte" | "Riesaminabile" | "Risolta";
  result?: CatalogElement;
}
export interface WorldModel {
  collections: ThematicCollection[];
  anomalies: ObservedAnomaly[];
}

/** Content maps once, snapshot projection once; only safe member/result DTOs leave this layer. */
export function createWorldProjector(index: ContentIndex) {
  const collections = new Map(index.content.collections.map((c) => [c.id, c]));
  const anomalies = new Map(index.content.anomalies.map((a) => [a.id, a]));
  const recipes = new Map(index.content.recipes.map((r) => [r.id, r]));
  const sets = new Map(index.content.sets.map((s) => [s.id, s]));
  const cache = new WeakMap<ApplicationSnapshot, WorldModel>();
  return (snapshot: ApplicationSnapshot, catalog: CatalogModel): WorldModel => {
    const cached = cache.get(snapshot);
    if (cached) return cached;
    const state = engineState(snapshot.save, index),
      known = new Map(catalog.elements.map((e) => [e.id, e]));
    const text = (key: string) => index.content.locales.it[key] ?? "";
    const visibleCollections = snapshot.derived.collections
      .map((visible) => {
        const definition = collections.get(visible.id)!;
        const eligible = eligibleCollectionMembers(
          definition.memberElementIds,
          state,
          index,
        );
        const members = eligible.flatMap((id) =>
          known.has(id) ? [known.get(id)!] : [],
        );
        const units = collectionUnits(definition);
        return {
          id: definition.id,
          name: text(definition.nameKey),
          description: text(definition.descriptionKey),
          ...collectionProgress(definition.memberElementIds, state, index),
          members,
          missing: eligible.length - members.length,
          earned: units.every((unit) =>
            snapshot.save.completedCollectionChapterIds.includes(unit.id),
          ),
          chapters: definition.chapters?.length
            ? units.map((unit) => ({
                id: unit.id,
                name: text(unit.nameKey),
                ...collectionProgress(unit.memberElementIds, state, index),
                earned: snapshot.save.completedCollectionChapterIds.includes(
                  unit.id,
                ),
              }))
            : [],
        };
      })
      .sort(
        (a, b) =>
          Number(a.earned) - Number(b.earned) ||
          b.percent - a.percent ||
          a.name.localeCompare(b.name, "it"),
      );
    const observed = Object.entries(snapshot.save.anomalies)
      .flatMap(([id, record]): ObservedAnomaly[] => {
        const definition = anomalies.get(id);
        if (!definition) return [];
        const a = known.get(definition.inputs[0]),
          b = known.get(definition.inputs[1]);
        if (!a || !b) return [];
        const recipe = definition.resolutionRecipeId
          ? recipes.get(definition.resolutionRecipeId)
          : undefined;
        if (record.resolvedAt) {
          const result =
            recipe && snapshot.save.discoveredRecipeIds.includes(recipe.id)
              ? known.get(recipe.resultElementId)
              : undefined;
          return [
            {
              id,
              inputs: [a, b],
              firstObservedAt: record.firstObservedAt,
              status: "Risolta",
              ...(result ? { result } : {}),
            },
          ];
        }
        const resolution = resolve(a.id, b.id, state, index);
        let revisitable = false;
        if (
          recipe &&
          resolution.type === "success" &&
          resolution.recipeId === recipe.id &&
          recipe.discovery !== "secret"
        ) {
          const target = index.elements.get(recipe.resultElementId)!,
            set = sets.get(target.setId)!;
          revisitable =
            (!!snapshot.save.discoveredElements[target.id] ||
              (target.visibility !== "secret" &&
                target.completion !== "secret")) &&
            (snapshot.save.revealedSetIds.includes(set.id) ||
              !["hidden", "secret"].includes(set.visibility));
        }
        return [
          {
            id,
            inputs: [a, b],
            firstObservedAt: record.firstObservedAt,
            status: revisitable
              ? "Riesaminabile"
              : resolution.type === "anomaly" && resolution.anomalyId === id
                ? "Instabile"
                : "Inerte",
          },
        ];
      })
      .sort(
        (a, b) =>
          Date.parse(b.firstObservedAt) - Date.parse(a.firstObservedAt) ||
          a.id.localeCompare(b.id),
      );
    const model = { collections: visibleCollections, anomalies: observed };
    cache.set(snapshot, model);
    return model;
  };
}
