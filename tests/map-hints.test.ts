import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { loadSeed } from "../src/content/load";
import { buildIndex } from "../src/content/indexes/build";
import { engineState } from "../src/application/save/projection";
import {
  visibleSets,
  visibleCollections,
} from "../src/domain/visibility/project";
import { createCatalogProjector } from "../src/application/catalog";
import { createWorldProjector } from "../src/application/world";
import { createMapProjector } from "../src/application/map";
import {
  createCurrentDirectionSelector,
  projectHint,
} from "../src/application/directions";
import {
  initialHintSession,
  recordHintExperiment,
  offerHint,
  declineHint,
} from "../src/application/hintSession";
import {
  featureDisclosure,
  routeAvailable,
} from "../src/application/disclosure";
import {
  SaveApplication,
  type ApplicationSnapshot,
} from "../src/application/save/SaveApplication";
import { MemorySaveRepository } from "../src/persistence/memory/MemorySaveRepository";
import type { ResolutionResult } from "../src/domain/model/types";
import type { PlayerSave } from "../src/domain/model/save";
const seed = loadSeed();
const fixture = (name = "v1-water-cycle-near-complete"): PlayerSave =>
  JSON.parse(readFileSync(`tests/fixtures/saves/${name}.json`, "utf8"));
function snapshot(save: PlayerSave, index = seed): ApplicationSnapshot {
  const state = engineState(save, index);
  return {
    save,
    revision: 1,
    notices: [],
    newPossibilityElementIds: [],
    derived: {
      level: 1,
      sets: visibleSets(state, index),
      collections: visibleCollections(state, index),
    },
  };
}
function map(
  save = fixture("v1-completed-sets"),
  query: Parameters<ReturnType<typeof createMapProjector>>[3] = {},
  mobile = false,
  index = seed,
) {
  const snap = snapshot(save, index),
    catalog = createCatalogProjector(index)(snap),
    world = createWorldProjector(index)(snap, catalog);
  return createMapProjector(index)(snap, catalog, world, query, mobile);
}
function hint(save = fixture(), index = seed, selected = "cloud") {
  const snap = snapshot(save, index);
  return projectHint(
    snap,
    index,
    createCurrentDirectionSelector(index)(snap),
    selected,
  );
}
describe("Phase 6 disclosure and local knowledge", () => {
  it.each([14, 15])(
    "guards map and hint threshold at %i owned concepts",
    (count) => {
      const save = fixture();
      save.discoveredElements = Object.fromEntries(
        Object.entries(save.discoveredElements).slice(0, count),
      );
      const features = featureDisclosure(snapshot(save), seed);
      expect(routeAvailable("/explore/map", features)).toBe(count >= 15);
      expect(
        Boolean(hint(save, seed, Object.keys(save.discoveredElements)[0]!)),
      ).toBe(count >= 15);
    },
  );
  it("uses only learned recipes, both inputs and correct A+A/alternate semantics", () => {
    const result = map(undefined, { element: "water", depth: "1" });
    expect(result.recipes.length).toBeGreaterThan(1);
    expect(result.recipes.some((r) => r.route === "alternate")).toBe(true);
    for (const r of result.recipes) expect(r.inputs).toHaveLength(2);
    const aa = map(undefined, { element: "rain", depth: "1" });
    expect(aa.recipes.some((r) => r.inputs[0].id === r.inputs[1].id)).toBe(
      true,
    );
    const save = fixture("v1-completed-sets");
    save.discoveredRecipeIds = [];
    expect(map(save, { element: "water" }).recipes).toEqual([]);
  });
  it("limits mobile to one hop, desktop to two, and preserves explicit depth", () => {
    const one = map(undefined, { element: "forest" }, true),
      two = map(undefined, { element: "forest" });
    expect(one.depth).toBe(1);
    expect(two.depth).toBe(2);
    expect(one.nodes.length).toBeLessThan(two.nodes.length);
    expect(map(undefined, { element: "forest", depth: "3" }, true).depth).toBe(
      3,
    );
    expect(two.nodes.length).toBeLessThan(67);
  });
  it("safe fallbacks disclose neither unknown query nor hidden Set", () => {
    const result = map(fixture("v1-before-fungi"), {
      element: "mold",
      mode: "set",
      set: "fungi",
    });
    expect(JSON.stringify(result)).not.toMatch(/mold|Funghi|fungi/);
    expect(
      map(undefined, {
        element: "injected-missing-id",
        mode: "bad",
        depth: "99",
      }).mode,
    ).toBe("ancestry");
  });
  it("Set mode contains only owned members and directly connected known neighbors", () => {
    const result = map(undefined, { mode: "set", set: "fungi" });
    for (const e of result.nodes.filter((e) => e.setId !== "fungi"))
      expect(
        result.recipes.some(
          (r) =>
            [...r.inputs, r.result].some((n) => n.id === e.id) &&
            [...r.inputs, r.result].some((n) => n.setId === "fungi"),
        ),
      ).toBe(true);
  });
  it("observed anomalies show inputs/history without implying a future result", () => {
    const result = map(fixture("v1-anomaly-observed"), {
      element: "moon",
      mode: "possibilities",
    });
    expect(result.anomalies).toHaveLength(1);
    expect(Object.keys(result.anomalies[0]!)).toEqual(["inputs", "status"]);
    expect(result.anomalies[0]!.inputs.map((e) => e.id)).toEqual([
      "moon",
      "life",
    ]);
    expect(map(undefined, { element: "moon" }).anomalies).toEqual([]);
  });
  it.each(["mystery", "balanced", "collector"] as const)(
    "projects %s anonymous directions with shared Catalog counts",
    (mode) => {
      const save = fixture();
      save.settings.informationMode = mode;
      const result = map(save, { element: "cloud", mode: "possibilities" });
      const snap = snapshot(save),
        directions = createCurrentDirectionSelector(seed)(snap);
      const count = directions.byElement.get("cloud")!.length;
      expect(result.marker).toEqual(
        mode === "mystery"
          ? undefined
          : {
              label: "Possibilità non esplorate",
              count: mode === "collector" ? count : undefined,
            },
      );
      const e = createCatalogProjector(seed)(snap).detail("cloud")!.element;
      expect(e.possibilities).toBe(count > 0);
      expect(e.directionCount).toBe(mode === "collector" ? count : undefined);
    },
  );
  it("never projects secret elements, secret recipes or unrevealed hidden results", () => {
    const content = structuredClone(seed.content);
    content.elements.find((e) => e.id === "water")!.visibility = "secret";
    const index = buildIndex(content),
      result = map(undefined, { element: "water" }, false, index);
    expect(result.nodes.some((e) => e.id === "water")).toBe(false);
    expect(
      result.recipes.some(
        (r) =>
          r.result.id === "water" || r.inputs.some((e) => e.id === "water"),
      ),
    ).toBe(false);
    const secret = structuredClone(seed.content);
    secret.recipes
      .filter((r) => r.resultElementId === "rain")
      .forEach((r) => (r.discovery = "secret"));
    expect(hint(fixture(), buildIndex(secret))?.available).toBe(false);
    const hidden = fixture();
    hidden.revealedSetIds = hidden.revealedSetIds.filter(
      (id) => id !== "world",
    );
    const hc = structuredClone(seed.content);
    hc.sets.find((s) => s.id === "world")!.visibility = "hidden";
    expect(hint(hidden, buildIndex(hc))).toBeUndefined();
  });
});
describe("sanitized deterministic hints", () => {
  it("Tier 1 gives availability, Tier 2 only same/different Set, Tier 3 only a revealed family", () => {
    const result = hint()!;
    expect(Object.keys(result).sort()).toEqual([
      "available",
      "tier1",
      "tier2",
      "tier3",
    ]);
    expect(result.available).toBe(true);
    expect(result.tier2).toBe(
      "Una delle piste resta dentro il Set di questo elemento.",
    );
    expect(result.tier3).toMatch(/Set Mondo/);
    expect(JSON.stringify(result)).not.toMatch(
      /cloud|rain|Nuvola|Pioggia|recipe|partner|resultElement/,
    );
    expect(hint()).toEqual(result);
  });
  it("exhausted context stays quiet and repeated anomalies are not actionable", () => {
    expect(hint(fixture("v1-anomaly-observed"))).toEqual({
      available: false,
      tier1: "Per ora non vedo altre piste con ciò che possiedi.",
    });
    expect(hint(fixture("v1-completed-sets"), seed, "moon")?.available).toBe(
      true,
    );
    expect(hint(fixture("v1-anomaly-observed"), seed, "moon")?.available).toBe(
      false,
    );
  });
  it("counts canonical pairs once and reevaluates stale failures with the current resolver", () => {
    const save = fixture();
    save.testedPairs["cloud::cloud"] = {
      ...Object.values(save.testedPairs)[0]!,
      lastOutcome: "no_reaction",
      testedAgainstContentVersion: "old",
    };
    const snap = snapshot(save),
      project = createCurrentDirectionSelector(seed),
      result = project(snap);
    expect(
      result.byElement.get("cloud")?.filter((k) => k === "cloud::cloud"),
    ).toHaveLength(1);
    expect(project(snap)).toBe(result);
    expect(hint(save)?.available).toBe(true);
  });
  it("dormant recipes are not counted until current requirements are met", () => {
    const c = structuredClone(seed.content);
    const rain = c.recipes.find((r) => r.resultElementId === "rain")!;
    rain.requirements = [{ type: "min_level", level: 1000 }];
    rain.gateBehavior = "dormant";
    expect(hint(fixture(), buildIndex(c))?.available).toBe(false);
  });
  it("persists the existing information preferences without changing XP or save schema", async () => {
    const app = new SaveApplication(new MemorySaveRepository(), seed);
    const before = await app.start();
    const after = await app.updatePreferences({
      informationMode: "collector",
      proactiveHints: "light",
    });
    expect(after.save.xp).toBe(before.save.xp);
    expect(after.save.saveSchemaVersion).toBe(before.save.saveSchemaVersion);
    expect((await app.load()).save.settings).toMatchObject({
      informationMode: "collector",
      proactiveHints: "light",
    });
    expect(JSON.stringify(after.save)).not.toMatch(
      /consecutiveNoReaction|experimentsSinceProgress|declinedUntil/,
    );
  });
});
const failure: ResolutionResult = {
  type: "no_reaction",
  pairKey: "void::void",
  events: [],
};
const repeat: ResolutionResult = {
  type: "success",
  pairKey: "void::energy",
  recipeId: "known",
  resultElementId: "light",
  isNewElement: false,
  isNewRecipe: false,
  events: [{ type: "known_recipe_repeated", recipeId: "known" }],
};
function experiments(n: number, result = failure) {
  let s = initialHintSession;
  for (let i = 0; i < n; i++) s = recordHintExperiment(s, result);
  return s;
}
describe("session-only stall policy", () => {
  it.each([
    ["off", 100, false],
    ["light", 4, false],
    ["light", 5, true],
    ["normal", 2, false],
    ["normal", 3, true],
  ] as const)("%s at %i failures", (mode, n, expected) =>
    expect(offerHint(experiments(n), mode)).toBe(expected),
  );
  it("known repeats are not progress: normal after six/light after ten", () => {
    expect(offerHint(experiments(5, repeat), "normal")).toBe(false);
    expect(offerHint(experiments(6, repeat), "normal")).toBe(true);
    expect(offerHint(experiments(9, repeat), "light")).toBe(false);
    expect(offerHint(experiments(10, repeat), "light")).toBe(true);
  });
  it("decline suppresses the next three experiments; meaningful progress clears it", () => {
    let s = declineHint(experiments(3));
    expect(offerHint(s, "normal")).toBe(false);
    for (let i = 0; i < 2; i++) {
      s = recordHintExperiment(s, failure);
      expect(offerHint(s, "normal")).toBe(false);
    }
    s = recordHintExperiment(s, failure);
    expect(offerHint(s, "normal")).toBe(true);
    const progress = recordHintExperiment(s, repeat, true);
    expect(progress.experimentsSinceProgress).toBe(0);
    expect(progress.declinedUntil).toBe(0);
  });
  it.each([
    "element_discovered",
    "recipe_discovered",
    "anomaly_registered",
    "set_revealed",
    "collection_completed",
  ])("resets on %s", (type) => {
    const result = { ...repeat, events: [{ type }] } as ResolutionResult;
    expect(
      recordHintExperiment(experiments(10), result).experimentsSinceProgress,
    ).toBe(0);
  });
});

it("withholds the map DTO itself before feature disclosure", () => {
  const fresh = JSON.parse(
    readFileSync("tests/fixtures/saves/v1-fresh.json", "utf8"),
  );
  const result = map(fresh, { element: "mold", mode: "set", set: "fungi" });
  expect(result.nodes).toEqual([]);
  expect(result.sets).toEqual([]);
  expect(result.focus).toBeUndefined();
});
it("Tier 2 cross-Set and Tier 3 safe lower fallback use only revealed families", () => {
  const c = structuredClone(seed.content);
  c.recipes.find((r) => r.resultElementId === "rain")!.inputs = [
    "cloud",
    "matter",
  ];
  const result = hint(fixture(), buildIndex(c))!;
  expect(result.tier2).toContain("altro Set che conosci");
  expect(result.tier3).toContain("Set Origini");
  const save = fixture();
  save.revealedSetIds = save.revealedSetIds.filter((id) => id !== "origins");
  expect(hint(save, buildIndex(c))?.tier3).toBeUndefined();
});

it("does not count a gated anomaly backed by a future secret result", () => {
  const c = structuredClone(seed.content);
  c.elements.find((e) => e.id === "mold")!.visibility = "secret";
  c.recipes.push({
    id: "synthetic-secret-anomaly",
    inputs: ["moon", "life"],
    resultElementId: "mold",
    kind: "explicit",
    discovery: "normal",
    gateBehavior: "anomaly",
    requirements: [{ type: "min_level", level: 999 }],
  });
  expect(
    hint(fixture("v1-completed-sets"), buildIndex(c), "moon")?.available,
  ).toBe(false);
});
