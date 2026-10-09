import 'fake-indexeddb/auto';
import { describe, it, expect, vi } from 'vitest';
import { loadSeed } from '../src/content/load';
import { validateWorld } from '../src/content/world/validate';
import { islandContent } from '../src/content/world/island';
import { MemorySaveRepository } from '../src/persistence/memory/MemorySaveRepository';
import { MemoryWorldRepository } from '../src/persistence/memory/MemoryWorldRepository';
import { SaveApplication } from '../src/application/save/SaveApplication';
import { WorldActionApplication } from '../src/application/island/WorldActionApplication';
import { ProofSession } from '../src/application/island/ProofSession';
import { scenePoints, sceneSprites } from '../src/application/island/scenePresentation';
import route from '../docs/evidence/isolario-architecture/canonical-path.json';
const fixture = async () => {
  const seed = loadSeed(), saves = new MemorySaveRepository(), worlds = new MemoryWorldRepository(saves);
  const save = new SaveApplication(saves, seed), world = new WorldActionApplication(worlds, validateWorld(islandContent, seed), seed);
  await save.start(); return { saves, worlds, save, world, session: new ProofSession(save, world) };
};
describe('concept proof orchestration', () => {
  it('discovers, intentionally manifests, documents and replays without farming XP or world writes', async () => {
    const { session, saves } = await fixture();
    expect((await session.load()).atlas).toBeUndefined();
    const discovery = await session.combine('void', 'energy');
    expect(discovery.data.world.entities).toEqual([]);
    const manifest = await session.manifest('light', 'east_sky', discovery.data.expected);
    expect(manifest.world.observations).toHaveLength(1);
    expect(manifest.world.entities[0]?.zone).toBe('Riva orientale');
    const before = await saves.load(), replay = await session.combine('energy', 'void');
    expect(replay.replay).toBe(true); expect(await saves.load()).toEqual(before);
    expect(replay.data.world.observations).toHaveLength(1);
  });
  it('never presents an unsaved scene when discovery succeeds but world storage fails; manual retry works', async () => {
    const { session, worlds } = await fixture(), d = await session.combine('void', 'energy');
    const failure = vi.spyOn(worlds, 'commit').mockRejectedValueOnce(new Error('quota'));
    await expect(session.manifest('light', 'west_sky', d.data.expected)).rejects.toThrow();
    const loaded = await session.load(); expect(loaded.world.entities).toEqual([]); expect(loaded.snapshot.save.xp).toBe(100);
    failure.mockRestore(); expect((await session.manifest('light', 'west_sky', loaded.expected)).world.observations).toHaveLength(1);
  });
  it('documents three mutation kinds and growth with no additional content', async () => {
    const { session } = await fixture();
    for (const step of route.steps) await session.combine(step.inputs[0]!, step.inputs[1]!);
    for (const [id, anchor] of [['soil','west_patch'],['water','west_basin'],['seed','west_patch'],['sprout','west_patch'],['tree','west_patch'],['creature','west_inhabitant']]) {
      const d = await session.load(); await session.manifest(id!, anchor!, d.expected);
    }
    const d = await session.load(); expect(d.snapshot.save.xp).toBe(2430);
    expect(d.world.entities.map(e => e.elementId)).toEqual(expect.arrayContaining(['soil','water','tree','creature']));
    expect(d.world.entities.some(e => ['seed','sprout'].includes(e.elementId))).toBe(false);
    expect(d.atlas?.chronicle).toHaveLength(6);
  });
  it('rejects stale revision and profile generation; no foreign chronicle is published', async () => {
    const { session, saves } = await fixture(), d = await session.combine('void', 'energy');
    await session.combine('energy','energy'); await expect(session.manifest('light','west_sky',d.data.expected)).rejects.toThrow();
    const fresh = await session.load(); await session.manifest('light','west_sky',fresh.expected);
    const row = await saves.load(); await saves.import((await session.load()).snapshot.save, row.revision);
    expect((await session.load()).world.entities).toEqual([]);
  });
  it('refuses an incoherent cross-tab knowledge/world projection', async () => {
    const { session, world } = await fixture();
    const load = world.load.bind(world); vi.spyOn(world,'load').mockImplementation(async () => {
      const d = await load(); return { ...d, context: { ...d.context, save: { ...d.context.save, revision: d.context.save.revision + 1 } } };
    });
    await expect(session.load()).rejects.toThrow('altra scheda');
  });
  it('registers every current anchor and sprite within the painted coordinate frame', () => {
    for (const zone of islandContent.definition.zones) for (const anchor of zone.anchors) {
      const p = scenePoints[anchor.id]!; expect(p.x).toBeGreaterThan(0); expect(p.x).toBeLessThan(1000); expect(p.y).toBeGreaterThan(0); expect(p.y).toBeLessThan(667);
    }
    for (const m of islandContent.manifestations) { const s = sceneSprites[m.artKey]!; expect(s.pivotX).toBeLessThan(s.width); expect(s.pivotY).toBeLessThan(s.height); }
  });
});
