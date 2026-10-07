import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { loadSeed } from "../src/content/load";
import { buildIndex } from "../src/content/indexes/build";
import { validateContent } from "../src/content/validate";
import {
  initialState,
  projectEvents,
  progressionEvents,
} from "../src/domain/progression/state";
import {
  collectionProgress,
  collectionVisible,
  newCollectionCompletions,
} from "../src/domain/completion/collections";
import {
  visibleSets,
  visibleCollections,
} from "../src/domain/visibility/project";
import { resolve } from "../src/domain/resolver/resolve";
import { createSave, engineState } from "../src/application/save/projection";
import { createCatalogProjector } from "../src/application/catalog";
import { createWorldProjector } from "../src/application/world";
import {
  featureDisclosure,
  routeAvailable,
} from "../src/application/disclosure";
import {
  laboratoryModel,
  laboratoryReaction,
} from "../src/application/laboratory";
import {
  SaveApplication,
  type ApplicationSnapshot,
} from "../src/application/save/SaveApplication";
import { MemorySaveRepository } from "../src/persistence/memory/MemorySaveRepository";
import type { PlayerSave } from "../src/domain/model/save";
import type { ContentIndex } from "../src/domain/model/types";
const index = loadSeed(),
  time = "2026-10-07T12:00:00.000Z";
const fixture = (name: string): PlayerSave =>
  JSON.parse(readFileSync(`tests/fixtures/saves/${name}.json`, "utf8"));
function snapshot(save: PlayerSave, content = index): ApplicationSnapshot {
  const state = engineState(save, content);
  return {
    save,
    revision: 1,
    notices: [],
    newPossibilityElementIds: [],
    derived: {
      level: 1,
      sets: visibleSets(state, content),
      collections: visibleCollections(state, content),
    },
  };
}
function world(save: PlayerSave, content = index) {
  const s = snapshot(save, content);
  return createWorldProjector(content)(s, createCatalogProjector(content)(s));
}
async function application(name: string, content = index) {
  const repo = new MemorySaveRepository();
  await repo.createNew(fixture(name), 0);
  return new SaveApplication(repo, content, () => time);
}
describe("shared progressive disclosure", () => {
  it("guards all undisclosed features, allows owned sheets, and agrees with navigation", () => {
    const s = snapshot(createSave(index, time)),
      f = featureDisclosure(s, index);
    for (const route of [
      "/collection",
      "/sets",
      "/sets/fungi",
      "/collections",
      "/collections/water_cycle",
      "/anomalies",
      "/explore/anomalies",
      "/explore/map",
      "/explore",
    ])
      expect(routeAvailable(route, f), route).toBe(false);
    expect(routeAvailable("/elements/void", f)).toBe(true);
    expect(laboratoryModel(s, index).destinations.map((d) => d.id)).toEqual([
      "lab",
      "settings",
    ]);
    const all = snapshot(fixture("v1-anomaly-observed"));
    expect(featureDisclosure(all, index)).toEqual({
      collection: true,
      sets: true,
      anomalies: true,
      map: true,
    });
    expect(laboratoryModel(all, index).destinations.map((d) => d.id)).toContain(
      "anomalies",
    );
  });
  it("counts three actual new discoveries, excluding four starters", () => {
    const save = createSave(index, time);
    for (const id of ["light", "heat"])
      save.discoveredElements[id] = { firstDiscoveredAt: time };
    expect(featureDisclosure(snapshot(save), index).collection).toBe(false);
    save.discoveredElements.plasma = { firstDiscoveredAt: time };
    expect(featureDisclosure(snapshot(save), index).collection).toBe(true);
  });
});
describe("thematic visibility and completion", () => {
  it.each([
    ["water_cycle", "steam"],
    ["water_cycle", "cloud"],
    ["children_of_stars", "star"],
    ["rocky_world", "rock"],
    ["green_everywhere", "seed"],
    ["green_everywhere", "moss"],
  ])("reveals %s only via authored %s path", (id, trigger) => {
    const state = initialState(index);
    expect(collectionVisible(id, state, index)).toBe(false);
    expect(
      collectionVisible(
        id,
        {
          ...state,
          discoveredElementIds: [...state.discoveredElementIds, trigger],
        },
        index,
      ),
    ).toBe(true);
  });
  it("exposes no unrevealed collection or unknown identity, and sorts near-complete before earned", () => {
    expect(world(createSave(index, time)).collections).toEqual([]);
    const result = world(fixture("v1-water-cycle-near-complete"));
    const cycle = result.collections.find((c) => c.id === "water_cycle")!;
    expect(cycle).toMatchObject({
      discovered: 4,
      total: 5,
      percent: 80,
      missing: 1,
      earned: false,
    });
    expect(JSON.stringify(cycle)).not.toContain("rain");
    expect(result.collections[0]!.earned).toBe(false);
    expect(result.collections.at(-1)?.earned).toBe(true);
  });
  it("excludes inactive, unrevealed hidden-Set and secret members from denominators and DTOs", () => {
    const content = structuredClone(index.content);
    content.collections[0]!.memberElementIds.push(
      "mold",
      "secret_fixture",
      "retired_fixture",
    );
    const secret = {
      ...content.elements.find((e) => e.id === "rain")!,
      id: "secret_fixture",
      visibility: "secret" as const,
      completion: "secret" as const,
    };
    content.elements.push(secret);
    const changed = buildIndex(content),
      save = fixture("v1-water-cycle-near-complete");
    delete save.discoveredElements.mold;
    save.revealedSetIds = save.revealedSetIds.filter((id) => id !== "fungi");
    const cycle = world(save, changed).collections.find(
      (c) => c.id === "water_cycle",
    )!;
    expect(cycle.total).toBe(5);
    expect(cycle.missing).toBe(1);
    expect(JSON.stringify(cycle)).not.toMatch(
      /mold|secret_fixture|retired_fixture|Funghi/,
    );
    save.discoveredElements.secret_fixture = { firstDiscoveredAt: time };
    expect(
      world(save, changed).collections.find((c) => c.id === "water_cycle")
        ?.total,
    ).toBe(5);
  });
  it("emits one base-ID event, persists atomically, and repeats grant no completion or XP", async () => {
    const app = await application("v1-water-cycle-near-complete"),
      before = await app.start();
    const recipe = index.content.recipes.find(
      (r) => r.resultElementId === "rain",
    )!;
    const first = await app.combine(...recipe.inputs);
    expect(
      first.resolution.events.filter((e) => e.type === "collection_completed"),
    ).toEqual([
      {
        type: "collection_completed",
        collectionId: "water_cycle",
        completionId: "water_cycle",
      },
    ]);
    expect(first.snapshot.save.completedCollectionChapterIds).toContain(
      "water_cycle",
    );
    expect((await app.load()).save).toEqual(first.snapshot.save);
    const repeated = await app.combine(...recipe.inputs);
    expect(
      repeated.resolution.events.filter(
        (e) => e.type === "collection_completed" || e.type === "xp_granted",
      ),
    ).toEqual([]);
    expect(repeated.snapshot.save.xp).toBe(first.snapshot.save.xp);
    const withoutCollection = structuredClone(index.content);
    withoutCollection.collections = [];
    withoutCollection.visibility.collectionReveals = [];
    const comparison = resolve(
      ...recipe.inputs,
      engineState(before.save, index),
      buildIndex(withoutCollection),
    );
    expect(
      first.resolution.events.filter((e) => e.type === "xp_granted"),
    ).toEqual(comparison.events.filter((e) => e.type === "xp_granted"));
    expect(
      laboratoryReaction(first.resolution, first.snapshot, index, before)
        .collectionCallouts,
    ).toContainEqual(
      expect.objectContaining({ id: "water_cycle", kind: "completed" }),
    );
  });
  it("keeps the earned badge when the same base Collection expands", () => {
    const content = structuredClone(index.content),
      save = fixture("v1-water-cycle-near-complete");
    save.completedCollectionChapterIds.push("water_cycle");
    content.collections[0]!.memberElementIds.push("void");
    expect(
      world(save, buildIndex(content)).collections.find(
        (c) => c.id === "water_cycle",
      ),
    ).toMatchObject({ earned: true, complete: false });
  });
  it("uses authored chapter IDs and emits each once without rewards", () => {
    const content = structuredClone(index.content),
      collection = content.collections[0]!;
    collection.chapters = [
      {
        id: "cycle_first",
        nameKey: collection.nameKey,
        memberElementIds: ["water", "steam"],
      },
    ];
    const changed = buildIndex(content),
      state = engineState(fixture("v1-water-cycle-near-complete"), changed);
    const events = newCollectionCompletions(state, changed).filter(
      (e) => e.collectionId === collection.id,
    );
    expect(events).toEqual([
      {
        type: "collection_completed",
        collectionId: "water_cycle",
        completionId: "cycle_first",
      },
    ]);
    expect(
      newCollectionCompletions(projectEvents(state, events), changed).filter(
        (e) => e.collectionId === collection.id,
      ),
    ).toEqual([]);
    expect(projectEvents(state, events).xp).toBe(state.xp);
  });
  it("backfills old complete visible saves without XP, new reveals or load celebrations", async () => {
    const old = fixture("v1-completed-sets"),
      app = await application("v1-completed-sets");
    const loaded = await app.start();
    expect(loaded.save.completedCollectionChapterIds).toHaveLength(4);
    expect(loaded.save.xp).toBe(old.xp);
    expect(loaded.save.revealedSetIds).toEqual(old.revealedSetIds);
    const again = await app.load();
    expect(again.revision).toBe(loaded.revision);
    const repeated = await app.combine("water", "heat");
    expect(
      repeated.resolution.events.filter(
        (e) => e.type === "collection_completed",
      ),
    ).toEqual([]);
    expect(
      laboratoryReaction(repeated.resolution, repeated.snapshot, index, loaded)
        .collectionCallouts,
    ).toEqual([]);
  });
  it("does not complete an unrevealed or zero-member unit and rejects durable ID collisions", () => {
    const state = initialState(index);
    expect(newCollectionCompletions(state, index)).toEqual([]);
    expect(collectionProgress([], state, index).complete).toBe(false);
    const content = structuredClone(index.content);
    content.collections[1]!.chapters = [
      {
        id: content.collections[0]!.id,
        nameKey: content.collections[1]!.nameKey,
        memberElementIds: ["star"],
      },
    ];
    expect(() => validateContent(content)).toThrow();
  });
});
describe("safe observed anomaly projection", () => {
  const anomalyId = "lunar_life_instability";
  function synthetic(secret = false): ContentIndex {
    const content = structuredClone(index.content);
    content.recipes.push({
      ...content.recipes[0]!,
      id: "moon_life_fixture",
      inputs: ["moon", "life"],
      resultElementId: "rain",
      discovery: secret ? "secret" : "normal",
      requirements: [],
    });
    content.anomalies[0]!.resolutionRecipeId = "moon_life_fixture";
    return buildIndex(content);
  }
  it("lists only observed pairs, known inputs/date/status, with no resolution metadata", () => {
    expect(world(fixture("v1-completed-sets")).anomalies).toEqual([]);
    const a = world(fixture("v1-anomaly-observed")).anomalies[0]!;
    expect(a.status).toBe("Instabile");
    expect(a.inputs.map((e) => e.id)).toEqual(["moon", "life"]);
    expect(a).not.toHaveProperty("result");
    expect(JSON.stringify(a)).not.toMatch(
      /mythic|requirements|resolutionRecipe/,
    );
  });
  it("projects eligible non-secret resolution as Riesaminabile without result spoilers", () => {
    const content = synthetic(),
      save = fixture("v1-anomaly-observed");
    delete save.discoveredElements.rain;
    const a = world(save, content).anomalies[0]!;
    expect(a.status).toBe("Riesaminabile");
    expect(a).not.toHaveProperty("result");
    expect(JSON.stringify(a)).not.toMatch(/rain|Pioggia|moon_life_fixture/);
  });
  it("does not announce a secret resolution and handles an inactive pair as Inerte", () => {
    expect(
      world(fixture("v1-anomaly-observed"), synthetic(true)).anomalies[0]!
        .status,
    ).toBe("Inerte");
    const content = structuredClone(index.content);
    content.anomalies[0]!.requirements = [
      { type: "element_discovered", elementId: "rain" },
    ];
    const save = fixture("v1-anomaly-observed");
    delete save.discoveredElements.rain;
    expect(world(save, buildIndex(content)).anomalies[0]!.status).toBe(
      "Inerte",
    );
  });
  it("exposes result only after recorded resolution, known recipe and owned result", async () => {
    const content = synthetic(),
      save = fixture("v1-anomaly-observed");
    save.anomalies[anomalyId]!.resolvedAt = time;
    expect(world(save, content).anomalies[0]!).toMatchObject({
      status: "Risolta",
    });
    expect(world(save, content).anomalies[0]!).not.toHaveProperty("result");
    save.discoveredRecipeIds.push("moon_life_fixture");
    expect(world(save, content).anomalies[0]!.result?.id).toBe("rain");
    delete save.discoveredElements.rain;
    expect(world(save, content).anomalies[0]!).not.toHaveProperty("result");
    const app = await application("v1-anomaly-observed", content);
    await app.start();
    const transaction = await app.combine("moon", "life");
    expect(
      world(transaction.snapshot.save, content).anomalies[0],
    ).toMatchObject({ status: "Risolta", result: { id: "rain" } });
  });
});
describe("composed reveal presentation", () => {
  it("gives a normal Set reveal priority over Collection and announces both once", () => {
    const before = initialState(index);
    before.discoveredElementIds.push("plasma", "gravity");
    const result = resolve("plasma", "gravity", before, index),
      after = projectEvents(before, result.events);
    const save = createSave(index, time);
    save.discoveredElements = Object.fromEntries(
      after.discoveredElementIds.map((id) => [id, { firstDiscoveredAt: time }]),
    );
    save.revealedSetIds = after.revealedSetIds;
    const reaction = laboratoryReaction(
      result,
      snapshot(save),
      index,
      snapshot(createSave(index, time)),
    );
    expect(reaction.emphasis).toBe("set");
    expect(reaction.setRevealDetails?.[0]!.kind).toBe("normal");
    expect(reaction.collectionCallouts).toContainEqual(
      expect.objectContaining({ id: "children_of_stars", kind: "revealed" }),
    );
    expect(reaction.announcement.match(/Nuovo set:/g)).toHaveLength(1);
  });
  it("detects hidden Funghi via authored metadata and leaves reduced motion textual hierarchy intact", async () => {
    const app = await application("v1-before-fungi"),
      before = await app.start();
    const transaction = await app.combine("life", "humidity");
    const reaction = laboratoryReaction(
      transaction.resolution,
      transaction.snapshot,
      index,
      before,
    );
    expect(reaction.emphasis).toBe("hidden-set");
    expect(reaction.setRevealDetails).toContainEqual(
      expect.objectContaining({
        id: "fungi",
        kind: "hidden",
        accent: "--accent-fungi",
      }),
    );
    expect(transaction.snapshot.save.settings.reducedMotion).toBe(true);
    expect(reaction.announcement).toContain("nascosto: Funghi");
    const content = structuredClone(index.content);
    content.locales.it["sets.fungi.name"] = "Un nome diverso";
    expect(
      laboratoryReaction(
        transaction.resolution,
        transaction.snapshot,
        buildIndex(content),
        before,
      ).emphasis,
    ).toBe("hidden-set");
  });
  it("composes simultaneous completions without duplicated IDs and assigns lighter emphasis", () => {
    const save = fixture("v1-completed-sets"),
      s = snapshot(save);
    const result = resolve("water", "heat", engineState(save, index), index);
    result.events = progressionEvents(engineState(save, index), index).filter(
      (e) => e.type === "collection_completed",
    );
    const reaction = laboratoryReaction(result, s, index, s);
    expect(reaction.emphasis).toBe("collection");
    expect(reaction.collectionCallouts).toHaveLength(4);
    expect(new Set(reaction.collectionCallouts?.map((c) => c.id)).size).toBe(4);
  });
});
