import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { loadSeed } from "../src/content/load";
import { buildIndex } from "../src/content/indexes/build";
import { createSave, engineState } from "../src/application/save/projection";
import { createCatalogProjector } from "../src/application/catalog";
import {
  visibleSets,
  visibleCollections,
} from "../src/domain/visibility/project";
import { levelForXp } from "../src/domain/progression/requirements";
import { setCompletion } from "../src/domain/completion/sets";
import { pairKey } from "../src/domain/resolver/pair";
import type { PlayerSave } from "../src/domain/model/save";
import type { ContentIndex } from "../src/domain/model/types";
import type { ApplicationSnapshot } from "../src/application/save/SaveApplication";
const index = loadSeed(),
  timestamp = "2026-10-06T12:00:00.000Z";
const fixture = (file = "v1-completed-sets"): PlayerSave =>
  JSON.parse(readFileSync(`tests/fixtures/saves/${file}.json`, "utf8"));
function snapshot(
  save: PlayerSave,
  content = index,
  markers: string[] = [],
): ApplicationSnapshot {
  const state = engineState(save, content);
  return {
    save,
    revision: 1,
    notices: [],
    newPossibilityElementIds: markers,
    derived: {
      level: levelForXp(save.xp, content.content.progression.levelThresholds),
      sets: visibleSets(state, content),
      collections: visibleCollections(state, content),
    },
  };
}
const model = (
  save: PlayerSave,
  content: ContentIndex = index,
  markers: string[] = [],
) => createCatalogProjector(content)(snapshot(save, content, markers));
describe("catalog knowledge boundary", () => {
  it("exposes only owned elements and projected Sets, with no locked denominator or hidden slots", () => {
    const result = model(createSave(index, timestamp));
    expect(result.elements.map((e) => e.id)).toEqual([
      "void",
      "energy",
      "matter",
      "time",
    ]);
    expect(result.sets.map((s) => s.id)).not.toContain("fungi");
    expect(
      result.sets.find((s) => s.id === "cosmos")?.completion,
    ).toBeUndefined();
    expect(result.detail("mold")).toBeUndefined();
    expect(result.detail("does-not-exist")).toBeUndefined();
    expect(JSON.stringify(result)).not.toContain("Funghi");
  });
  it("excludes unrevealed secrets from filters and the visible required denominator", () => {
    const content = structuredClone(index.content),
      element = content.elements.find((e) => e.id === "light")!;
    element.visibility = "secret";
    element.rarity = "secret";
    const altered = buildIndex(content),
      save = createSave(altered, timestamp),
      result = model(save, altered);
    expect(result.elements.some((e) => e.rarityId === "secret")).toBe(false);
    expect(result.sets.find((s) => s.id === "origins")?.completion?.total).toBe(
      model(createSave(index, timestamp)).sets.find((s) => s.id === "origins")!
        .completion!.total - 1,
    );
    expect(result.detail("light")).toBeUndefined();
  });
  it("orders recent discoveries by saved time, limits to eight, keeps markers on owned members and favorites", () => {
    const save = fixture();
    save.discoveredElements.water!.firstDiscoveredAt =
      "2026-10-07T12:00:00.000Z";
    save.favoriteElementIds = ["water"];
    const result = model(save, index, ["water", "unknown"]);
    expect(result.recent).toHaveLength(8);
    expect(result.recent[0]?.id).toBe("water");
    expect(
      result.elements.filter((e) => e.newPossibilities).map((e) => e.id),
    ).toEqual(["water"]);
    expect(
      result.sets.filter((s) => s.newPossibilities).map((s) => s.id),
    ).toEqual(["world"]);
    expect(result.detail("water")?.element.favorite).toBe(true);
  });
  it("keeps earned Set completion after an expansion without granting a second reward", () => {
    const content = structuredClone(index.content),
      save = fixture();
    content.elements.push({
      ...content.elements[0]!,
      id: "future-normal",
      starter: false,
    });
    const result = model(save, buildIndex(content)),
      origins = result.sets.find((s) => s.id === "origins")!;
    expect(origins.earned).toBe(true);
    expect(origins.completion?.complete).toBe(false);
    expect(save.xp).toBe(fixture().xp);
  });
  it("shows the actual first recipe and only discovered alternative paths", () => {
    const save = fixture(),
      producing = index.content.recipes.filter(
        (r) => r.resultElementId === "water",
      );
    expect(producing).toHaveLength(2);
    save.discoveredElements.water!.firstRecipeId = producing[1]!.id;
    save.discoveredRecipeIds = save.discoveredRecipeIds.filter(
      (id) => id !== producing[0]!.id,
    );
    let detail = model(save).detail("water")!;
    expect(detail.firstRecipe?.id).toBe(producing[1]!.id);
    expect(detail.recipes).toHaveLength(1);
    save.discoveredRecipeIds.push(producing[0]!.id);
    detail = model(save).detail("water")!;
    expect(detail.recipes).toHaveLength(2);
    expect(detail.firstRecipe?.id).toBe(producing[1]!.id);
    expect(model(save).detail("void")?.starter).toBe(true);
  });
});
describe("deterministic current possibilities and experiment memory", () => {
  it("does not disclose a newly eligible secret through a current-version failure marker", () => {
    const content = structuredClone(index.content);
    content.recipes = [
      {
        ...content.recipes.find(
          (r) => r.inputs[0] === "energy" && r.inputs[1] === "energy",
        )!,
        discovery: "secret",
      },
    ];
    const save = createSave(index, timestamp);
    save.testedPairs[pairKey("energy", "energy")] = {
      lastOutcome: "no_reaction",
      testedAgainstContentVersion: save.contentVersionSeen,
      lastTestedAt: timestamp,
    };
    const detail = model(save, buildIndex(content)).detail("energy")!;
    expect(detail.element.stale).toBe(false);
    expect(detail.element.exhausted).toBe(true);
  });
  it("counts eligible undiscovered reactions with owned inputs; completed recipes exhaust current possibilities", () => {
    const save = createSave(index, timestamp),
      before = JSON.stringify(save);
    expect(model(save).detail("energy")?.element.possibilities).toBe(true);
    expect(JSON.stringify(save)).toBe(before);
    const full = fixture("v1-anomaly-observed");
    expect(model(full).elements.every((e) => e.exhausted)).toBe(true);
  });
  it("ignores secret and dormant future recipes, including future anomaly gates", () => {
    const content = structuredClone(index.content);
    content.recipes = [
      {
        ...content.recipes.find(
          (r) => r.inputs[0] === "energy" && r.inputs[1] === "energy",
        )!,
        discovery: "secret",
      },
    ];
    expect(
      model(createSave(index, timestamp), buildIndex(content)).detail("energy")
        ?.element.exhausted,
    ).toBe(true);
    content.recipes[0]!.discovery = "normal";
    content.recipes[0]!.gateBehavior = "dormant";
    content.recipes[0]!.requirements = [{ type: "min_level", level: 999 }];
    expect(
      model(createSave(index, timestamp), buildIndex(content)).detail("energy")
        ?.element.exhausted,
    ).toBe(true);
  });
  it("uses unlocked tag rule candidates and respects resolver precedence", () => {
    const content = structuredClone(index.content);
    content.recipes = [];
    content.rules = [
      {
        id: "test-rule",
        inputSelectors: [
          { all: index.elements.get("energy")!.tags },
          { all: index.elements.get("matter")!.tags },
        ],
        resultElementId: "heat",
        priority: 1,
        requirements: [{ type: "min_level", level: 2 }],
      },
    ];
    const altered = buildIndex(content),
      save = createSave(altered, timestamp);
    expect(model(save, altered).detail("energy")?.element.exhausted).toBe(true);
    save.xp = 5000;
    expect(model(save, altered).detail("energy")?.element.possibilities).toBe(
      true,
    );
  });
  it("does not treat a stale failure as permanent exhaustion and never lists untested partners", () => {
    const save = fixture("v1-anomaly-observed"),
      key = pairKey("void", "void");
    save.testedPairs = {
      [key]: {
        lastOutcome: "no_reaction",
        testedAgainstContentVersion: "0.0.1",
        lastTestedAt: timestamp,
      },
      "unknown::void": {
        lastOutcome: "no_reaction",
        testedAgainstContentVersion: "0.0.1",
        lastTestedAt: timestamp,
      },
    };
    const detail = model(save).detail("void")!;
    expect(detail.element.exhausted).toBe(false);
    expect(detail.element.stale).toBe(true);
    expect(detail.experiments).toHaveLength(1);
    expect(detail.experiments[0]?.partner.id).toBe("void");
    expect(detail.experiments[0]?.stale).toBe(true);
  });
  it("groups saved outcomes and exposes observed anomaly status without a hidden resolution", () => {
    const save = fixture("v1-anomaly-observed");
    save.testedPairs = {
      [pairKey("moon", "life")]: {
        lastOutcome: "anomaly",
        testedAgainstContentVersion: save.contentVersionSeen,
        lastTestedAt: timestamp,
      },
      [pairKey("moon", "void")]: {
        lastOutcome: "no_reaction",
        testedAgainstContentVersion: save.contentVersionSeen,
        lastTestedAt: timestamp,
      },
      [pairKey("moon", "energy")]: {
        lastOutcome: "success",
        testedAgainstContentVersion: save.contentVersionSeen,
        lastTestedAt: timestamp,
      },
    };
    const detail = model(save).detail("moon")!;
    expect(detail.experiments.map((e) => e.outcome).sort()).toEqual([
      "anomaly",
      "no_reaction",
      "success",
    ]);
    expect(detail.anomalies).toEqual([
      expect.objectContaining({ status: "Instabile · già osservata" }),
    ]);
    expect(Object.keys(detail.anomalies[0]!)).toEqual(["partner", "status"]);
  });
  it("offers a generic revisitable status only for observed eligible non-secret resolution", () => {
    const content = structuredClone(index.content),
      save = fixture("v1-anomaly-observed");
    content.recipes.push({
      id: "test-resolution",
      kind: "explicit",
      inputs: ["moon", "life"],
      discovery: "normal",
      resultElementId: "water",
    });
    content.anomalies[0]!.resolutionRecipeId = "test-resolution";
    expect(
      model(save, buildIndex(content)).detail("moon")?.anomalies[0]?.status,
    ).toBe("Potrebbe essere rivisitata");
    content.recipes.at(-1)!.discovery = "secret";
    expect(
      model(save, buildIndex(content)).detail("moon")?.anomalies[0]?.status,
    ).toBe("Instabile · già osservata");
  });
  it("caches snapshots and details without rescanning content on filter/card render", () => {
    const project = createCatalogProjector(index),
      input = snapshot(fixture());
    expect(project(input)).toBe(project(input));
    expect(project(input).detail("water")).toBe(project(input).detail("water"));
    expect(
      setCompletion("origins", engineState(input.save, index), index).complete,
    ).toBe(true);
  });
});
