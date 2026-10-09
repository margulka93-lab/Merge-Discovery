import { writeFileSync } from 'node:fs';
import { loadSeed } from '../src/content/load';
import { validateWorld } from '../src/content/world/validate';
import { islandContent } from '../src/content/world/island';
import { SaveApplication } from '../src/application/save/SaveApplication';
import { WorldActionApplication } from '../src/application/island/WorldActionApplication';
import { experiment } from '../src/application/island/experiment';
import { MemorySaveRepository } from '../src/persistence/memory/MemorySaveRepository';
import { MemoryWorldRepository } from '../src/persistence/memory/MemoryWorldRepository';
import route from '../docs/evidence/isolario-architecture/canonical-path.json';
const canonical = loadSeed(), index = validateWorld(islandContent, canonical), saves = new MemorySaveRepository(), worlds = new MemoryWorldRepository(saves);
const clock = () => '2026-10-09T12:00:00.000Z';
const saveApp = new SaveApplication(saves, canonical, clock), worldApp = new WorldActionApplication(worlds, index, canonical, clock);
const initial = await saveApp.start();
for (const step of route.steps) {
  const attempt = await experiment(saveApp, step.inputs[0]!, step.inputs[1]!);
  if (attempt.resolution.type !== 'success' || attempt.resolution.resultElementId !== step.result || attempt.resolution.recipeId !== step.recipeId || !attempt.resolution.isNewElement) throw new Error(`Canonical route mismatch ${step.recipeId}`);
}
const discovered = await saveApp.load(), before = await saves.load();
if (discovered.save.xp !== 2430 || Object.keys(discovered.save.discoveredElements).length !== 24) throw new Error('Canonical journey mismatch');
if (Object.keys((await worldApp.load()).state.placements).length) throw new Error('Discovery auto-spawned');
for (const m of index.manifestations.values()) {
  const { context } = await worldApp.load();
  await worldApp.manifest({ commandId: `journey_${m.id}`, manifestationId: m.id, anchorId: m.target.anchorIds[0]! }, {
    saveRevision: context.save.revision, worldRevision: context.world.revision, generation: context.generation,
    definitionVersion: index.content.definition.version, contentVersion: canonical.content.manifest.contentVersion,
  });
}
const final = await worldApp.load();
await experiment(saveApp, 'life', 'movement');
if (JSON.stringify(before) !== JSON.stringify(await saves.load())) throw new Error('Manifestation/replay changed canonical save');
if (final.state.observations.length !== 11 || !final.state.placements.creature) throw new Error('World journey incomplete');
const report = { scope: 'Foundation application simulation; no island UI/human playtest', baseCommit: '8ce18be6ed1081b45f3e51255ebf690ae38cafe3',
  starters: Object.keys(initial.save.discoveredElements), newDiscoveries: 20, owned: 24, xp: discovered.save.xp, mappingsReached: 11,
  kinds: [...new Set(index.content.manifestations.map(m => m.kind))], noAutomaticSpawn: true, canonicalSaveUnchangedByWorld: true,
  knownReplayWrites: 0, canonicalContentChanged: false, worldSchemaVersion: 1, saveSchemaVersion: 1, state: final.state, canonicalSave: discovered.save,
  visualApproval: 'PENDING', humanPlaytest: 'NOT RUN - Island/Atlas tranche' };
if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report, state: undefined, canonicalSave: undefined }, null, 2));
