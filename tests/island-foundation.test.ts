import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { describe, expect, it, vi } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { loadSeed } from '../src/content/load';
import { islandContent } from '../src/content/world/island';
import { parseWorldState, validateWorld } from '../src/content/world/validate';
import { emptyWorld, manifest, validTarget } from '../src/domain/world/rules';
import { MemorySaveRepository } from '../src/persistence/memory/MemorySaveRepository';
import { MemoryWorldRepository } from '../src/persistence/memory/MemoryWorldRepository';
import { IndexedDbSaveRepository, SaveDatabase } from '../src/persistence/indexeddb/IndexedDbSaveRepository';
import { IndexedDbWorldRepository } from '../src/persistence/indexeddb/IndexedDbWorldRepository';
import { SaveApplication } from '../src/application/save/SaveApplication';
import { WorldActionApplication } from '../src/application/island/WorldActionApplication';
import { experiment } from '../src/application/island/experiment';
import { createCatalogProjector } from '../src/application/catalog';
import { projectWorld } from '../src/application/island/projection';
import { projectAtlas } from '../src/application/atlas/projection';
import route from '../docs/evidence/isolario-architecture/canonical-path.json';
import type { WorldIndex } from '../src/domain/world/types';
import type { WorldContext } from '../src/persistence/WorldRepository';
const canonical = loadSeed(), index = validateWorld(islandContent, canonical), time = '2026-10-09T12:00:00.000Z';
const all = new Set(route.steps.map(s => s.result));
const expected = (c: WorldContext) => ({ saveRevision: c.save.revision, worldRevision: c.world.revision, generation: c.generation, definitionVersion: index.content.definition.version, contentVersion: canonical.content.manifest.contentVersion });
const command = (id: string, anchor = `west_${index.manifestations.get(id)!.target.slot === 'plant' ? 'patch' : index.manifestations.get(id)!.target.slot}`) => ({ commandId: `apply_${id}`, manifestationId: id, anchorId: anchor });
let counter = 0;
const fixture = (adapter: string) => {
  const saves = adapter === 'memory' ? new MemorySaveRepository() : new IndexedDbSaveRepository(new SaveDatabase(`island_${++counter}`));
  const worlds = saves instanceof MemorySaveRepository ? new MemoryWorldRepository(saves) : new IndexedDbWorldRepository(saves.database);
  const saveApp = new SaveApplication(saves, canonical, () => time), worldApp = new WorldActionApplication(worlds, index, canonical, () => time);
  const cleanup = async () => { if (saves instanceof IndexedDbSaveRepository) await saves.database.delete(); };
  return { saves, worlds, saveApp, worldApp, cleanup };
};
async function journey(app: SaveApplication) {
  await app.start(); for (const step of route.steps) { const result = await experiment(app, step.inputs[0]!, step.inputs[1]!); expect(result.resolution.type).toBe('success'); }
  const s = await app.load(); expect(s.save.xp).toBe(2430); expect(Object.keys(s.save.discoveredElements)).toHaveLength(24); return s;
}
describe('authored world validation and pure rules', () => {
  it('has eleven reachable mappings, two spatial choices, no auto-spawn or canonical island discovery', () => {
    expect(index.manifestations.size).toBe(11); expect(emptyWorld(index, 'g').placements).toEqual({});
    for (const m of index.manifestations.values()) expect(m.target.anchorIds).toHaveLength(2);
    expect(index.manifestations.has('island')).toBe(false);
  });
  it.each(['element', 'art', 'anchor', 'zone', 'locale', 'cycle', 'nan', 'bounds', 'replacement', 'impossible', 'duplicate', 'unknown_field'])('rejects %s definitions', mutation => {
    const c = structuredClone(islandContent), m = c.manifestations[0]!;
    if (mutation === 'element') m.sourceElementId = 'nonexistent';
    if (mutation === 'art') m.artKey = 'nonexistent';
    if (mutation === 'anchor') m.target.anchorIds[0] = 'nonexistent';
    if (mutation === 'zone') m.target.zoneIds[0] = 'nonexistent';
    if (mutation === 'locale') delete c.locale[m.labelKey];
    if (mutation === 'cycle') m.requirements = [{ type: 'manifested', manifestationId: m.id, sameZone: true, sameAnchor: false }];
    if (mutation === 'nan') c.definition.zones[0]!.anchors[0]!.x = NaN;
    if (mutation === 'bounds') c.definition.zones[0]!.anchors[0]!.y = 9999;
    if (mutation === 'replacement') m.replaces = ['water'];
    if (mutation === 'impossible') c.manifestations.find(x => x.id === 'seed')!.requirements.push({ type: 'manifested', manifestationId: 'water', sameZone: true, sameAnchor: true });
    if (mutation === 'duplicate') c.assets.push(c.assets[0]!);
    if (mutation === 'unknown_field') Object.assign(m, { xp: 999 });
    expect(() => validateWorld(c, canonical)).toThrow();
  });
  it('requires actual same-zone habitat and correct predecessor anchor; guards ownership, unknown action and max instance', () => {
    const empty = emptyWorld(index, 'g');
    expect(validTarget(index, empty, all, 'creature', 'west_inhabitant')).toBe(false);
    expect(() => manifest(index, empty, new Set(), command('water'), time)).toThrow();
    expect(() => manifest(index, empty, all, { ...command('water'), manifestationId: 'missing' }, time)).toThrow();
    let s = manifest(index, empty, all, command('water'), time).state;
    expect(() => manifest(index, s, all, { ...command('water', 'east_basin'), commandId: 'second' }, time)).toThrow();
    s = manifest(index, s, all, command('soil', 'east_patch'), time).state;
    expect(validTarget(index, s, all, 'seed', 'east_patch')).toBe(false);
  });
  it('strictly validates realizable history, receipts, definitions, references and schema versions', () => {
    const s = manifest(index, emptyWorld(index, 'g'), all, command('water'), time).state;
    expect(parseWorldState(s, index, 'g')).toEqual(s);
    for (const mutate of [(v: typeof s) => { v.worldSchemaVersion = 2 as 1; }, (v: typeof s) => { v.observations[0]!.sequence = 2; },
      (v: typeof s) => { v.appliedCommands.apply_water!.payloadHash = '["creature","west_inhabitant"]'; }, (v: typeof s) => { v.placements.water!.anchorId = 'east_sky'; },
      (v: typeof s) => { v.definitionVersionSeen = 'future'; }]) {
      const raw = structuredClone(s); mutate(raw); expect(() => parseWorldState(raw, index, 'g')).toThrow();
    }
    expect(() => parseWorldState(s, index, 'foreign')).toThrow();
  });
});

describe.each(['memory', 'indexeddb'])('%s world/save atomic contract', adapter => {
  it('executes real 20-discovery journey + eleven manual manifestations + creature habitat, reload and replay without XP/writes', async () => {
    const f = fixture(adapter);
    try {
      await journey(f.saveApp); const before = await f.saves.load();
      expect((await f.worldApp.load()).state.observations).toHaveLength(0);
      for (const m of index.manifestations.values()) {
        const { context } = await f.worldApp.load(); const result = await f.worldApp.manifest(command(m.id), expected(context)); expect(result.changed).toBe(true);
      }
      const loaded = await f.worldApp.load(); expect(loaded.state.observations).toHaveLength(11); expect(loaded.state.placements.creature).toBeDefined();
      expect(await f.saves.load()).toEqual(before);
      const replay = await f.worldApp.manifest(command('water'), expected(loaded.context)); expect(replay.changed).toBe(false);
      const noop = await f.worldApp.manifest({ ...command('water'), commandId: 'new_identity_same_placement' }, expected(loaded.context)); expect(noop.changed).toBe(false);
      const repeat = await experiment(f.saveApp, 'movement', 'life'); expect(repeat.replay).toBe(true); expect(await f.saves.load()).toEqual(before);
      expect((await f.worlds.context('first_island')).world.revision).toBe(11);
      const atlas = projectAtlas(canonical, index, await f.saveApp.load(), loaded.state, loaded.context.generation);
      expect(atlas!.chronicle).toHaveLength(11); expect(atlas!.locations.some(e => e.elementId === 'creature')).toBe(true);
    } finally { await f.cleanup(); }
  });
  it('CAS rejects competing worlds, stale save revision, generation and conflicting command payload', async () => {
    const f = fixture(adapter);
    try {
      await journey(f.saveApp); const loaded = await f.worldApp.load(), e = expected(loaded.context);
      const results = await Promise.allSettled([f.worldApp.manifest(command('water'), e), f.worldApp.manifest(command('soil'), e)]);
      expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1); expect(results.find(r => r.status === 'rejected')).toMatchObject({ reason: { code: 'conflict' } });
      await expect(f.worldApp.manifest(command('light'), e)).rejects.toMatchObject({ code: 'conflict' });
      const current = await f.worldApp.load(); const receipt = Object.keys(current.state.appliedCommands)[0]!;
      await expect(f.worldApp.manifest(command('light'), { ...expected(current.context), definitionVersion: 'future' })).rejects.toMatchObject({ code: 'conflict' });
      await expect(f.worldApp.manifest(command('light'), { ...expected(current.context), contentVersion: 'future' })).rejects.toMatchObject({ code: 'conflict' });
      await expect(f.worldApp.manifest({ ...command('light'), commandId: receipt }, expected(current.context))).rejects.toMatchObject({ code: 'command_conflict' });
      await f.saveApp.updatePreferences({ soundEnabled: true });
      await expect(f.worldApp.manifest(command('light'), expected(current.context))).rejects.toMatchObject({ code: 'conflict' });
    } finally { await f.cleanup(); }
  });
  it('import and reset rotate generation atomically, preserve bounded old world diagnostic; preferences/recovery keep generation', async () => {
    const f = fixture(adapter);
    try {
      await journey(f.saveApp); let loaded = await f.worldApp.load();
      await f.worldApp.manifest(command('water'), expected(loaded.context)); loaded = await f.worldApp.load();
      const oldGeneration = loaded.context.generation;
      const invalid = { ...(await f.saveApp.load()).save, xp: -1 };
      const stable = await f.saves.load(); await expect(f.saves.import(invalid, stable.revision)).rejects.toThrow();
      expect((await f.worldApp.load()).context.generation).toBe(oldGeneration); expect(await f.saves.load()).toEqual(stable);
      await f.saveApp.updatePreferences({ favoriteElementId: 'water' }); expect((await f.worldApp.load()).context.generation).toBe(oldGeneration);
      const exported = await f.saveApp.exportSave(); expect(JSON.parse(exported).payload).not.toHaveProperty('profileGeneration'); expect(JSON.parse(exported).saveSchemaVersion).toBe(1);
      const preview = await f.saveApp.previewImport(exported);
      await expect(f.saveApp.confirmImport(preview, false)).rejects.toMatchObject({ code: 'confirmation_required' }); expect((await f.worldApp.load()).context.generation).toBe(oldGeneration);
      await f.saveApp.confirmImport(preview, true);
      const imported = await f.worldApp.load(); expect(imported.context.generation).not.toBe(oldGeneration); expect(imported.state.placements).toEqual({});
      await expect(f.worldApp.manifest(command('soil'), expected(loaded.context))).rejects.toMatchObject({ code: 'conflict' });
      await f.worldApp.manifest(command('light'), expected(imported.context)); expect(await f.worlds.exportRaw('first_island')).toMatchObject({ retired: { generation: oldGeneration } });
      await f.saveApp.recoverBackup(true); expect((await f.worldApp.load()).context.generation).toBe(imported.context.generation);
      await f.saveApp.clear(true); const afterClear = await f.worlds.context('first_island'); expect(afterClear.generation).not.toBe(imported.context.generation);
      await f.saveApp.start(); expect((await f.worldApp.load()).state.placements).toEqual({});
    } finally { await f.cleanup(); }
  });
  it('failed world write after discovery leaves canonical save committed; retry creates one observation, no duplicate XP', async () => {
    const f = fixture(adapter);
    try {
      await f.saveApp.start(); await experiment(f.saveApp, 'void', 'energy'); const save = await f.saves.load(), loaded = await f.worldApp.load();
      const write = vi.spyOn(f.worlds, 'commit').mockRejectedValueOnce(new Error('quota'));
      await expect(f.worldApp.manifest(command('light'), expected(loaded.context))).rejects.toMatchObject({ code: 'persistence_failed', cause: { message: 'quota' } });
      expect(await f.saves.load()).toEqual(save); expect((await f.worldApp.load()).state.placements).toEqual({});
      await f.worldApp.manifest(command('light'), expected(loaded.context)); expect((await f.worldApp.load()).state.observations).toHaveLength(1);
      expect(await f.saves.load()).toEqual(save); write.mockRestore();
    } finally { await f.cleanup(); }
  });
  it.each(['shape', 'missing'])('retains %s raw/current and valid backup; explicit world recovery succeeds without promoting corruption', async corruption => {
    const f = fixture(adapter);
    try {
      await journey(f.saveApp);
      await f.worldApp.manifest(command('water'), expected((await f.worldApp.load()).context));
      await f.worldApp.manifest(command('soil'), expected((await f.worldApp.load()).context));
      const corrupt = corruption === 'missing' ? null : { corrupt: true };
      if (f.worlds instanceof MemoryWorldRepository) f.worlds.rows.get('first_island')!.current = corrupt;
      else await f.worlds.database.world_snapshots.update('first_island', { current: corrupt });
      const raw = await f.worlds.exportRaw('first_island'); await expect(f.worldApp.load()).rejects.toMatchObject({ code: corruption === 'missing' ? 'recovery_required' : 'invalid_state' }); expect(await f.worlds.exportRaw('first_island')).toEqual(raw);
      const c = await f.worlds.context('first_island'); await expect(f.worldApp.recoverBackup(false, expected(c))).rejects.toMatchObject({ code: 'recovery_required' });
      await f.worldApp.recoverBackup(true, expected(c)); expect((await f.worldApp.load()).state.placements.water).toBeDefined(); expect((await f.worldApp.load()).state.placements.soil).toBeUndefined();
      expect((await f.worlds.context('first_island')).world.backup).not.toEqual({ corrupt: true });
    } finally { await f.cleanup(); }
  });
});

describe('shipped v1 container migration', () => {
  it('aborts an IndexedDB import if generation write fails; no half-switch or canonical slot change', async () => {
    const f = fixture('indexeddb');
    try {
      await journey(f.saveApp); const loaded = await f.worldApp.load(), before = await f.saves.load();
      if (!(f.saves instanceof IndexedDbSaveRepository)) throw new Error('Expected IndexedDB');
      const fault = vi.spyOn(f.saves.database.profile_meta, 'put').mockRejectedValueOnce(new Error('quota'));
      await expect(f.saves.import((await f.saveApp.load()).save, before.revision)).rejects.toMatchObject({ code: 'persistence_failed' }); fault.mockRestore();
      expect(await f.saves.load()).toEqual(before); expect((await f.worldApp.load()).context.generation).toBe(loaded.context.generation);
    } finally { await f.cleanup(); }
  });
  it('rolls back placement, observation and receipt together if world transaction aborts after put', async () => {
    const f = fixture('indexeddb');
    try {
      await journey(f.saveApp); const loaded = await f.worldApp.load(), before = await f.saves.load();
      if (!(f.worlds instanceof IndexedDbWorldRepository)) throw new Error('Expected IndexedDB');
      const table = f.worlds.database.world_snapshots, original = table.put.bind(table);
      const fault = vi.spyOn(table, 'put').mockImplementationOnce(row => original(row).then(() => { throw new Error('crash before transaction complete'); }));
      await expect(f.worldApp.manifest(command('water'), expected(loaded.context))).rejects.toMatchObject({ code: 'persistence_failed' }); fault.mockRestore();
      expect((await f.worldApp.load()).state.placements).toEqual({}); expect(await f.saves.load()).toEqual(before);
      await f.worldApp.manifest(command('water'), expected(loaded.context)); expect((await f.worldApp.load()).state.observations).toHaveLength(1);
    } finally { await f.cleanup(); }
  });
  it('reports blocked upgrade without destructive reset; closes only after the old connection permits upgrade', async () => {
    const name = `blocked_${++counter}`;
    const old = await new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open(name, 10); r.onupgradeneeded = () => r.result.createObjectStore('snapshots', { keyPath: 'id' }); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error);
    });
    old.onversionchange = () => undefined;
    const db = new SaveDatabase(name);
    let notify: () => void = () => undefined;
    const blocked = new Promise<void>(resolve => { notify = resolve; }); db.on('blocked', () => { notify(); });
    const opened = db.open(); await blocked; expect(db.upgradeBlocked).toBe(true); old.close(); await opened;
    expect(await db.snapshots.count()).toBe(0); expect(db.verno).toBe(2); await db.delete();
  });
  it.each(readdirSync('tests/fixtures/saves').filter(f => f.endsWith('.json')))('preserves %s current and backup byte-for-byte on v1→v2, without changing PlayerSave', async file => {
    const name = `migration_${++counter}`, raw = JSON.parse(readFileSync(`tests/fixtures/saves/${file}`, 'utf8'));
    const old = new Dexie(name); old.version(1).stores({ snapshots: '&id' });
    const row = { id: 'single_player', revision: 8, current: raw, backup: raw };
    await old.table('snapshots').put(row); old.close();
    const db = new SaveDatabase(name);
    try {
      await db.open(); expect(JSON.stringify(await db.snapshots.get('single_player'))).toBe(JSON.stringify(row));
      expect(await db.profile_meta.count()).toBe(0);
      const w = new IndexedDbWorldRepository(db); const c = await w.context('first_island');
      expect(c.world.current).toBeNull(); expect(JSON.stringify(await db.snapshots.get('single_player'))).toBe(JSON.stringify(row));
      expect((await w.context('first_island')).generation).toBe(c.generation);
    } finally { await db.delete(); }
  });
});

describe('safe projections and resolver boundary', () => {
  it('excludes future mappings/art/names/counts, Atlas gate, foreign generation and orphan habitat after canonical recovery', async () => {
    const f = fixture('memory');
    try {
      const fresh = await f.saveApp.start(), loaded = await f.worldApp.load(), catalog = createCatalogProjector(canonical);
      expect(projectWorld(index, catalog(fresh), loaded.state, loaded.context.generation)).toEqual({ entities: [], actions: [], observations: [] });
      expect(projectAtlas(canonical, index, fresh, loaded.state, loaded.context.generation)).toBeUndefined();
      const snapshot = await journey(f.saveApp); let state = emptyWorld(index, loaded.context.generation);
      for (const m of index.manifestations.values()) state = manifest(index, state, all, command(m.id), time).state;
      const reduced = structuredClone(snapshot); delete reduced.save.discoveredElements.water;
      const safe = projectWorld(index, catalog(reduced), state, loaded.context.generation);
      expect(safe.entities.some(e => ['water', 'creature'].includes(e.elementId))).toBe(false); expect(safe.observations.some(o => o.text.includes('bacino'))).toBe(false);
      expect(projectWorld(index, catalog(snapshot), state, 'foreign')).toEqual({ entities: [], actions: [], observations: [] });
      const hidden = structuredClone(islandContent); hidden.manifestations[0]!.sourceElementId = 'mold';
      const hiddenIndex: WorldIndex = validateWorld(hidden, canonical);
      expect(JSON.stringify(projectWorld(hiddenIndex, catalog(fresh), emptyWorld(hiddenIndex, 'g'), 'g'))).not.toContain('light');
    } finally { await f.cleanup(); }
  });
  it('new alternate, A+A, anomaly and no reaction still use SaveApplication, while current known recipe alone replays', async () => {
    const f = fixture('memory');
    try {
      await journey(f.saveApp); const before = (await f.saveApp.load()).save.xp;
      const alt = await experiment(f.saveApp, 'heat', 'comet'); expect(alt.replay).toBe(false); expect(alt.snapshot.save.xp).toBeGreaterThan(before);
      expect((await experiment(f.saveApp, 'heat', 'comet')).replay).toBe(true);
      expect((await experiment(f.saveApp, 'energy', 'energy')).replay).toBe(true);
      await experiment(f.saveApp, 'planet', 'cosmic_dust'); const a = await experiment(f.saveApp, 'moon', 'life'); expect(a.resolution.type).toBe('anomaly'); expect(a.replay).toBe(false);
      const no = await experiment(f.saveApp, 'void', 'void'); expect(no.resolution.type).toBe('no_reaction'); expect(no.replay).toBe(false);
    } finally { await f.cleanup(); }
  });
});
