import { performance } from "node:perf_hooks";
import { loadSeed } from "../src/content/load";
import { buildIndex } from "../src/content/indexes/build";
import { createSave, engineState } from "../src/application/save/projection";
import { createCatalogProjector } from "../src/application/catalog";
import {
  visibleSets,
  visibleCollections,
} from "../src/domain/visibility/project";
import type { ApplicationSnapshot } from "../src/application/save/SaveApplication";

// Synthetic in-memory fixture only: canonical files and durable saves are never touched.
const content = structuredClone(loadSeed().content);
for (let n = content.elements.length; n < 1000; n++) {
  const id = `profile-${n}`;
  content.elements.push({
    ...content.elements[0]!,
    id,
    starter: false,
    visibility: "hidden",
    nameKey: `profile.${n}`,
  });
  content.locales.it[`profile.${n}`] = `Elemento ${n}`;
}
const index = buildIndex(content),
  save = createSave(index, "2026-10-06T12:00:00.000Z");
save.discoveredElements = Object.fromEntries(
  content.elements.map((e) => [e.id, { firstDiscoveredAt: save.createdAt }]),
);
save.revealedSetIds = content.sets.map((s) => s.id);
const state = engineState(save, index);
const snapshot: ApplicationSnapshot = {
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
const project = createCatalogProjector(index),
  started = performance.now(),
  model = project(snapshot),
  projected = performance.now();
for (let n = 0; n < 1000; n++) {
  if (project(snapshot) !== model) throw new Error("Snapshot cache missed");
  model.detail(`profile-${n}`);
}
const finished = performance.now();
if (model.elements.length !== 1000 || finished - started > 5000)
  throw new Error("Catalog scalability smoke check failed");
console.log(
  JSON.stringify(
    {
      elements: model.elements.length,
      authoredRecipes: content.recipes.length,
      projectionMs: +(projected - started).toFixed(2),
      cachedProjectionsAndDetailsMs: +(finished - projected).toFixed(2),
      fullPairMatrix: false,
    },
    null,
    2,
  ),
);
