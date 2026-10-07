import type { ContentIndex } from "../domain/model/types";
import type { ApplicationSnapshot } from "./save/SaveApplication";
import type { CatalogModel, CatalogElement, KnownRecipe } from "./catalog";
import type { WorldModel } from "./world";
import { createCurrentDirectionSelector } from "./directions";
export type MapMode = "ancestry" | "possibilities" | "set";
export interface MapRecipe extends KnownRecipe {
  route: "normal" | "alternate";
}
export interface MapModel {
  focus?: CatalogElement;
  mode: MapMode;
  depth: number;
  setId?: string;
  nodes: CatalogElement[];
  recipes: MapRecipe[];
  anomalies: { inputs: [CatalogElement, CatalogElement]; status: string }[];
  producing: MapRecipe[];
  using: MapRecipe[];
  alternatives: MapRecipe[];
  sets: { id: string; name: string }[];
  marker?: { label: string; count?: number };
}
export function createMapProjector(index: ContentIndex) {
  const directions = createCurrentDirectionSelector(index);
  const recipeDefinitions = new Map(
    index.content.recipes.map((r) => [r.id, r]),
  );
  const cache = new WeakMap<
    ApplicationSnapshot,
    {
      nodes: Map<string, CatalogElement>;
      recipes: MapRecipe[];
      producing: Map<string, MapRecipe[]>;
      using: Map<string, MapRecipe[]>;
    }
  >();
  return (
    snapshot: ApplicationSnapshot,
    catalog: CatalogModel,
    world: WorldModel,
    query: {
      element?: string | null;
      mode?: string | null;
      set?: string | null;
      depth?: string | null;
    },
    mobile: boolean,
  ): MapModel => {
    if (Object.keys(snapshot.save.discoveredElements).length < 15)
      return {
        mode: "ancestry",
        depth: mobile ? 1 : 2,
        nodes: [],
        recipes: [],
        anomalies: [],
        producing: [],
        using: [],
        alternatives: [],
        sets: [],
      };
    const current = directions(snapshot);
    let graph = cache.get(snapshot);
    if (!graph) {
      const nodes = new Map(
        catalog.elements
          .filter((e) => current.visibleElement(e.id))
          .map((e) => [e.id, e]),
      );
      const recipes: MapRecipe[] = catalog.knownRecipes
        .filter(
          (r) =>
            recipeDefinitions.get(r.id)?.discovery !== "secret" &&
            [...r.inputs, r.result].every((e) => nodes.has(e.id)),
        )
        .map((r) => ({
          ...r,
          route:
            recipeDefinitions.get(r.id)?.discovery === "alternate"
              ? "alternate"
              : "normal",
        }));
      const producing = new Map<string, MapRecipe[]>(),
        using = new Map<string, MapRecipe[]>();
      for (const r of recipes) {
        producing.set(r.result.id, [...(producing.get(r.result.id) ?? []), r]);
        for (const id of new Set(r.inputs.map((e) => e.id)))
          using.set(id, [...(using.get(id) ?? []), r]);
      }
      graph = { nodes, recipes, producing, using };
      cache.set(snapshot, graph);
    }
    let focus =
      graph.nodes.get(query.element ?? "") ??
      catalog.recent.find((e) => graph!.nodes.has(e.id)) ??
      graph.nodes.values().next().value;
    const mode: MapMode =
      query.mode === "possibilities" || query.mode === "set"
        ? query.mode
        : "ancestry";
    const depth =
      query.depth && ["1", "2", "3"].includes(query.depth)
        ? Number(query.depth)
        : mobile
          ? 1
          : 2;
    const sets = catalog.sets
      .filter((s) => s.revealed)
      .map((s) => ({ id: s.id, name: s.name }));
    const setId =
      sets.find((s) => s.id === query.set)?.id ??
      sets.find((s) => s.id === focus?.setId)?.id ??
      sets[0]?.id;
    if (mode === "set" && focus?.setId !== setId)
      focus = [...graph.nodes.values()].find((e) => e.setId === setId);
    const selectedRecipes = new Set<MapRecipe>(),
      selectedNodes = new Set<string>();
    if (focus) selectedNodes.add(focus.id);
    const add = (r: MapRecipe) => {
      selectedRecipes.add(r);
      for (const e of [...r.inputs, r.result]) selectedNodes.add(e.id);
    };
    if (mode === "ancestry" && focus) {
      let frontier = [focus.id];
      const visited = new Set<string>();
      for (let level = 0; level < depth; level++) {
        const next: string[] = [];
        for (const id of frontier) {
          if (visited.has(id)) continue;
          visited.add(id);
          for (const r of graph.producing.get(id) ?? []) {
            add(r);
            next.push(...r.inputs.map((e) => e.id));
          }
        }
        frontier = next;
      }
    } else if (mode === "possibilities" && focus) {
      for (const r of graph.using.get(focus.id) ?? []) add(r);
    } else if (mode === "set") {
      selectedNodes.clear();
      for (const e of graph.nodes.values())
        if (e.setId === setId) selectedNodes.add(e.id);
      for (const r of graph.recipes)
        if ([...r.inputs, r.result].some((e) => e.setId === setId)) add(r);
      if (focus && !selectedNodes.has(focus.id)) selectedNodes.add(focus.id);
    }
    const anomalies = world.anomalies
      .filter(
        (a) =>
          a.inputs.every((e) => graph!.nodes.has(e.id)) &&
          (mode === "set"
            ? a.inputs.some((e) => e.setId === setId)
            : a.inputs.some((e) => e.id === focus?.id)),
      )
      .map((a) => ({ inputs: a.inputs, status: a.status }));
    for (const a of anomalies)
      for (const e of a.inputs) selectedNodes.add(e.id);
    const count = focus ? (current.byElement.get(focus.id)?.length ?? 0) : 0;
    return {
      focus,
      mode,
      depth,
      setId,
      sets,
      nodes: [...selectedNodes].map((id) => graph!.nodes.get(id)!),
      recipes: [...selectedRecipes],
      anomalies,
      producing: focus ? (graph.producing.get(focus.id) ?? []) : [],
      using: focus ? (graph.using.get(focus.id) ?? []) : [],
      alternatives: focus
        ? (graph.producing.get(focus.id) ?? []).filter(
            (r) => r.route === "alternate",
          )
        : [],
      marker:
        mode === "possibilities" &&
        count > 0 &&
        snapshot.save.settings.informationMode !== "mystery"
          ? {
              label: "Possibilità non esplorate",
              count:
                snapshot.save.settings.informationMode === "collector"
                  ? count
                  : undefined,
            }
          : undefined,
    };
  };
}
