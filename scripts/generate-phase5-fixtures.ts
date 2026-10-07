import { writeFileSync } from "node:fs";
import { loadSeed } from "../src/content/load";
import { SaveApplication } from "../src/application/save/SaveApplication";
import { MemorySaveRepository } from "../src/persistence/memory/MemorySaveRepository";

// Evidence fixtures are obtained through actual application transactions, never injected unlocks.
const index = loadSeed();
for (const [name, excluded] of [
  ["v1-water-cycle-near-complete", new Set(["rain"])],
  [
    "v1-before-fungi",
    new Set(
      index.content.elements
        .filter((e) => e.setId === "fungi")
        .map((e) => e.id),
    ),
  ],
] as const) {
  let minute = 0;
  const application = new SaveApplication(
    new MemorySaveRepository(),
    index,
    () => new Date(Date.UTC(2026, 9, 7, 10, minute++)).toISOString(),
  );
  let snapshot = await application.start();
  while (true) {
    const before = Object.keys(snapshot.save.discoveredElements).length;
    for (const recipe of index.content.recipes) {
      if (
        excluded.has(recipe.resultElementId) ||
        snapshot.save.discoveredRecipeIds.includes(recipe.id) ||
        !recipe.inputs.every((id) => snapshot.save.discoveredElements[id])
      )
        continue;
      snapshot = (await application.combine(...recipe.inputs)).snapshot;
    }
    if (Object.keys(snapshot.save.discoveredElements).length === before) break;
  }
  writeFileSync(
    `tests/fixtures/saves/${name}.json`,
    JSON.stringify(snapshot.save, null, 2) + "\n",
  );
}
