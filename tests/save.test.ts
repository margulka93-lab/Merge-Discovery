import 'fake-indexeddb/auto';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { loadSeed } from '../src/content/load';
import { validateContent } from '../src/content/validate';
import { buildIndex } from '../src/content/indexes/build';
import { SaveApplication } from '../src/application/save/SaveApplication';
import { createSave, engineState } from '../src/application/save/projection';
import { migrateSave, migrateSaveSchema } from '../src/application/save/migrations';
import { reconcileContent, isFailureAuthoritative } from '../src/application/updates/reconcile';
import { SaveError } from '../src/domain/model/saveErrors';
import { parseSave, PRODUCT_ID, saveSchema } from '../src/domain/model/saveSchema';
import { MemorySaveRepository } from '../src/persistence/memory/MemorySaveRepository';
import { IndexedDbSaveRepository, SaveDatabase } from '../src/persistence/indexeddb/IndexedDbSaveRepository';
import type { SaveRepository } from '../src/persistence/SaveRepository';
import type { PlayerSave } from '../src/domain/model/save';
import { readFileSync } from 'node:fs';
import { resolve } from '../src/domain/resolver/resolve';

const index = loadSeed();
const firstTime = '2026-10-06T10:00:00.000Z';
const nextTime = '2026-10-06T10:01:00.000Z';
const fresh = () => createSave(index, firstTime);
let databaseCounter = 0;
const factories = {
  memory: () => new MemorySaveRepository(),
  indexeddb: () => new IndexedDbSaveRepository(new SaveDatabase(`save_contract_${++databaseCounter}`)),
};
const cleanup = async (repo: SaveRepository) => { if (repo instanceof IndexedDbSaveRepository) await repo.database.delete(); };

describe.each(Object.entries(factories))('%s repository contract', (_name, factory) => {
  it('creates, loads, exports/imports, isolates snapshots and rotates exactly one backup', async () => {
    const repo = factory();
    try {
      expect(await repo.load()).toEqual({ revision: 0, current: null, backup: null });
      const original = fresh(); const r1 = await repo.createNew(original, 0);
      original.xp = 999;
      expect(parseSave((await repo.load()).current).xp).toBe(0);
      const loaded = parseSave((await repo.load()).current); loaded.xp = 100;
      const r2 = await repo.persist(loaded, r1);
      expect((await repo.load()).backup).toEqual(fresh());
      const imported = parseSave(await repo.export()); imported.xp = 120;
      await repo.import(imported, r2);
      const slots = await repo.load();
      expect(parseSave(slots.current).xp).toBe(120); expect(parseSave(slots.backup).xp).toBe(100);
      await expect(repo.createNew(fresh(), slots.revision)).rejects.toMatchObject({ code: 'conflict' });
      await repo.clear(slots.revision);
      expect(await repo.load()).toEqual({ revision: slots.revision + 1, current: null, backup: null });
    } finally { await cleanup(repo); }
  });
  it('rejects invalid snapshots without modifying current/backup', async () => {
    const repo = factory();
    try {
      await repo.createNew(fresh(), 0); const before = await repo.load();
      await expect(repo.persist({ ...fresh(), xp: -1 }, before.revision)).rejects.toMatchObject({ code: 'invalid_save' });
      expect(await repo.load()).toEqual(before);
    } finally { await cleanup(repo); }
  });
  it('rejects stale concurrent writers, including after clear', async () => {
    const repo = factory();
    try {
      const r = await repo.createNew(fresh(), 0);
      const results = await Promise.allSettled([repo.persist({ ...fresh(), xp: 100 }, r), repo.persist({ ...fresh(), xp: 200 }, r)]);
      expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
      expect(results.find(r => r.status === 'rejected')).toMatchObject({ reason: { code: 'conflict' } });
      const slots = await repo.load(); await repo.clear(slots.revision);
      await expect(repo.persist(fresh(), r)).rejects.toMatchObject({ code: 'conflict' });
    } finally { await cleanup(repo); }
  });
});

describe('durable schema and migrations', () => {
  it('validates a new save derived from content starters with safe settings', () => {
    const save = fresh(); expect(parseSave(save)).toEqual(save);
    expect(Object.keys(save.discoveredElements)).toEqual(index.content.elements.filter(e => e.starter).map(e => e.id));
    expect(Object.values(save.discoveredElements)).toEqual(Array(4).fill({ firstDiscoveredAt: firstTime }));
    expect(save.settings).toMatchObject({ dragEnabled: false, soundEnabled: false, musicEnabled: false, reducedMotion: true });
    expect(save).not.toHaveProperty('level'); expect(save).not.toHaveProperty('eligibleEraIds');
  });
  it('refuses a content package requiring a newer save schema before creating storage', async () => {
    const c = structuredClone(index.content); c.manifest.minimumSaveSchemaVersion = 2;
    const repo = new MemorySaveRepository(); const app = new SaveApplication(repo, buildIndex(validateContent(c)));
    await expect(app.start()).rejects.toMatchObject({ code: 'unsupported_schema' });
    expect((await repo.load()).current).toBeNull();
  });
  it.each([
    { ...fresh(), extra: true }, { ...fresh(), updatedAt: 'yesterday' }, { ...fresh(), xp: 0.5 },
    { ...fresh(), settings: { ...fresh().settings, dragEnabled: 'yes' } },
    { ...fresh(), discoveredRecipeIds: ['duplicate', 'duplicate'] },
    { ...fresh(), testedPairs: { 'void::energy': { lastOutcome: 'no_reaction', testedAgainstContentVersion: '0.1.0', lastTestedAt: firstTime } } },
  ])('rejects malformed save structure', save => { expect(() => parseSave(save)).toThrow(SaveError); });
  it('rejects prototype-bearing IDs at strict boundary', () => {
    expect(() => parseSave(JSON.parse(JSON.stringify(fresh()).replace('"void":', '"constructor":')))).toThrow(SaveError);
  });
  it('migrates a strict v0 fixture into v1 and proves a multi-step pipeline with test-only v2', () => {
    const v0Schema = saveSchema.omit({ favoriteElementIds: true }).extend({ saveSchemaVersion: z.literal(0) });
    const { favoriteElementIds: _favorites, ...old } = fresh();
    const v0 = { ...old, saveSchemaVersion: 0 };
    const zeroToOne = { from: 0, validate: (raw: unknown) => v0Schema.parse(raw), migrate: (raw: unknown) => ({ ...v0Schema.parse(raw), saveSchemaVersion: 1, favoriteElementIds: [] }) };
    expect(migrateSave(v0, [zeroToOne])).toEqual(fresh());
    const fixtureV2 = saveSchema.extend({ saveSchemaVersion: z.literal(2) });
    const result = migrateSaveSchema(v0, 2, [zeroToOne, { from: 1, validate: parseSave, migrate: raw => ({ ...parseSave(raw), saveSchemaVersion: 2 }) }], raw => fixtureV2.parse(raw));
    expect(result.saveSchemaVersion).toBe(2); expect(v0.saveSchemaVersion).toBe(0);
    expect(_favorites).toEqual([]);
  });
  it('migration failure is typed, non-destructive, and future/gap versions fail', async () => {
    const raw = { ...fresh(), saveSchemaVersion: 0 }; const before = structuredClone(raw);
    expect(() => migrateSave(raw, [{ from: 0, validate: x => x, migrate: () => { throw new Error('failure'); } }])).toThrowError(expect.objectContaining({ code: 'migration_failed' }));
    expect(raw).toEqual(before);
    expect(() => migrateSave(raw)).toThrowError(expect.objectContaining({ code: 'unsupported_schema' }));
    expect(() => migrateSave({ ...fresh(), saveSchemaVersion: 2 })).toThrowError(expect.objectContaining({ code: 'unsupported_schema' }));
    const repo = new MemorySaveRepository({ revision: 4, current: raw, backup: fresh() });
    await expect(new SaveApplication(repo, index).load()).rejects.toMatchObject({ code: 'recovery_failed' });
    expect(await repo.load()).toEqual({ revision: 4, current: raw, backup: fresh() });
  });
});

async function discoverAll(app: SaveApplication) {
  let snapshot = await app.start();
  let changed = true;
  while (changed) {
    changed = false;
    for (const recipe of index.content.recipes) {
      if (snapshot.save.discoveredRecipeIds.includes(recipe.id) || recipe.inputs.some(id => !snapshot.save.discoveredElements[id])) continue;
      snapshot = (await app.combine(...recipe.inputs)).snapshot; changed = true;
    }
  }
  return snapshot;
}

describe('application combine transaction', () => {
  it('persists discovery, recipe, XP, pair/version/time atomically and keeps first metadata on repeat', async () => {
    const repo = new MemorySaveRepository(); let time = firstTime;
    const app = new SaveApplication(repo, index, () => time); const initial = await app.start();
    time = nextTime;
    const { resolution, snapshot } = await app.combine('void', 'energy');
    expect(resolution.type).toBe('success'); expect(snapshot.save.xp).toBe(100);
    expect(snapshot.save.discoveredElements.light).toEqual({ firstDiscoveredAt: nextTime, firstRecipeId: 'void_energy_to_light' });
    expect(snapshot.save.discoveredRecipeIds).toContain('void_energy_to_light');
    expect(snapshot.save.testedPairs['energy::void']).toEqual({ lastOutcome: 'success', testedAgainstContentVersion: '0.1.0', lastTestedAt: nextTime });
    expect((await repo.load()).backup).toEqual(initial.save);
    time = '2026-10-06T10:02:00.000Z';
    const repeated = await app.combine('energy', 'void');
    expect(repeated.snapshot.save.xp).toBe(100); expect(repeated.snapshot.save.discoveredElements.light).toEqual(snapshot.save.discoveredElements.light);
    expect(repeated.snapshot.save.testedPairs['energy::void']?.lastTestedAt).toBe(time);
    expect((await app.load()).save).toEqual(repeated.snapshot.save);
  });
  it('persists all seed discoveries, Set reveal/completion, alternate XP and anomaly history', async () => {
    const repo = new MemorySaveRepository(); const app = new SaveApplication(repo, index, () => firstTime);
    let snapshot = await discoverAll(app);
    expect(Object.keys(snapshot.save.discoveredElements)).toHaveLength(67); expect(snapshot.save.completedSetIds).toHaveLength(6);
    expect(snapshot.save.revealedSetIds).toContain('fungi');
    const waterRecipes = index.content.recipes.filter(r => r.resultElementId === 'water');
    expect(waterRecipes.every(r => snapshot.save.discoveredRecipeIds.includes(r.id))).toBe(true);
    const before = snapshot.save.xp; snapshot = (await app.combine('moon', 'life')).snapshot;
    expect(snapshot.save.xp).toBe(before + 30);
    expect(snapshot.save.anomalies.lunar_life_instability).toEqual({ firstObservedAt: firstTime });
    const repeated = await app.combine('life', 'moon'); expect(repeated.snapshot.save.xp).toBe(before + 30);
    expect((await app.load()).save).toEqual(repeated.snapshot.save);
  });
  it('a new alternate route to already known Water grants exactly 20 XP', async () => {
    const repo = new MemorySaveRepository(); const app = new SaveApplication(repo, index, () => firstTime);
    await app.start();
    for (const inputs of [['matter', 'time'], ['void', 'time'], ['energy', 'energy'], ['cosmic_dust', 'space'], ['comet', 'heat']] as [string, string][]) await app.combine(...inputs);
    for (const inputs of [['energy', 'matter'], ['matter', 'space'], ['plasma', 'gravity'], ['star', 'cosmic_dust']] as [string, string][]) await app.combine(...inputs);
    const before = await app.load(); const result = await app.combine('planet', 'comet');
    expect(result.resolution).toMatchObject({ type: 'success', isNewElement: false, isNewRecipe: true });
    expect(result.snapshot.save.xp - before.save.xp).toBe(20);
    expect(result.snapshot.save.discoveredElements.water).toEqual(before.save.discoveredElements.water);
  });
  it('persists no-reaction history, rejects invalid input without writes, and serializes overlapping actions', async () => {
    const repo = new MemorySaveRepository(); const app = new SaveApplication(repo, index, () => firstTime);
    await app.start(); await app.combine('void', 'matter');
    expect((await app.load()).save.testedPairs['matter::void']).toEqual({ lastOutcome: 'no_reaction', testedAgainstContentVersion: '0.1.0', lastTestedAt: firstTime });
    const before = await repo.load(); await expect(app.combine('star', 'energy')).rejects.toMatchObject({ code: 'unavailable_element' });
    expect(await repo.load()).toEqual(before);
    await Promise.all([app.combine('void', 'energy'), app.combine('energy', 'energy')]);
    const save = (await app.load()).save; expect(save.discoveredElements.light).toBeTruthy(); expect(save.discoveredElements.heat).toBeTruthy(); expect(save.xp).toBe(200);
  });
});

describe('atomic backup and recovery', () => {
  it('retains migrated legacy progress as a valid previous snapshot during content reconciliation', async () => {
    const legacySchema = saveSchema.extend({ saveSchemaVersion: z.literal(0) });
    const legacy = { ...fresh(), saveSchemaVersion: 0, contentVersionSeen: '0.0.1', xp: 12 };
    const migration = { from: 0, validate: (x: unknown) => legacySchema.parse(x), migrate: (x: unknown) => ({ ...legacySchema.parse(x), saveSchemaVersion: 1 }) };
    const repo = new MemorySaveRepository({ revision: 1, current: legacy, backup: fresh() });
    const app = new SaveApplication(repo, index, () => nextTime, [migration]);
    await app.load(); const previous = parseSave((await repo.load()).backup);
    expect(previous.saveSchemaVersion).toBe(1); expect(previous.contentVersionSeen).toBe('0.0.1'); expect(previous.xp).toBe(12);
    expect(previous.discoveredElements).toEqual(legacy.discoveredElements); expect(previous.updatedAt).toBe(firstTime);
  });
  it('confirmed import over semantically corrupt current preserves the valid backup', async () => {
    const broken = { ...fresh(), discoveredRecipeIds: ['void_energy_to_light'] };
    const repo = new MemorySaveRepository({ revision: 3, current: broken, backup: fresh() });
    const app = new SaveApplication(repo, index, () => nextTime);
    await expect(app.load()).rejects.toMatchObject({ code: 'recovery_failed' });
    const preview = await app.previewImport(wrapped(fresh())); await app.confirmImport(preview, true);
    expect((await repo.load()).backup).toEqual(fresh());
  });
  it('IndexedDB snapshots survive closing/reopening the database', async () => {
    const repo = factories.indexeddb(); const app = new SaveApplication(repo, index, () => firstTime);
    await app.start(); const committed = (await app.combine('void', 'energy')).snapshot;
    const name = repo.database.name; repo.database.close();
    const reopened = new IndexedDbSaveRepository(new SaveDatabase(name));
    try {
      expect((await new SaveApplication(reopened, index).load()).save).toEqual(committed.save);
      expect(parseSave((await reopened.load()).backup).discoveredElements.light).toBeUndefined();
    } finally { await cleanup(reopened); }
  });
  it('two IndexedDB connections cannot lose progress via stale revisions', async () => {
    const first = factories.indexeddb(); const second = new IndexedDbSaveRepository(new SaveDatabase(first.database.name));
    try {
      const revision = await first.createNew(fresh(), 0);
      const outcomes = await Promise.allSettled([first.persist({ ...fresh(), xp: 10 }, revision), second.persist({ ...fresh(), xp: 20 }, revision)]);
      expect(outcomes.filter(x => x.status === 'fulfilled')).toHaveLength(1);
      expect(outcomes.find(x => x.status === 'rejected')).toMatchObject({ reason: { code: 'conflict' } });
    } finally { second.database.close(); await cleanup(first); }
  });
  it('a failed application persist publishes no result or half-updated snapshot', async () => {
    const repo = new MemorySaveRepository(); const app = new SaveApplication(repo, index, () => firstTime); await app.start();
    const before = await repo.load();
    const failure = vi.spyOn(repo, 'persist').mockRejectedValueOnce(new SaveError('persistence_failed', 'fixture write failure'));
    await expect(app.combine('void', 'energy')).rejects.toMatchObject({ code: 'persistence_failed' });
    expect(await repo.load()).toEqual(before); failure.mockRestore();
    expect((await app.combine('void', 'energy')).snapshot.save.xp).toBe(100);
  });
  it('rolls back even after an IndexedDB put has executed inside the transaction', async () => {
    const repo = factories.indexeddb(); const app = new SaveApplication(repo, index, () => firstTime);
    try {
      await app.start(); const before = await repo.load();
      const original = repo.database.snapshots.put.bind(repo.database.snapshots);
      const spy = vi.spyOn(repo.database.snapshots, 'put').mockImplementationOnce((...args) => original(...args).then(() => { throw new Error('Simulated crash after put'); }));
      await expect(app.combine('void', 'energy')).rejects.toMatchObject({ code: 'persistence_failed' });
      spy.mockRestore(); expect(await repo.load()).toEqual(before);
    } finally { await cleanup(repo); }
  });
  it('recovers previous valid backup without promoting corrupt current or auto-resetting', async () => {
    const repo = new MemorySaveRepository({ revision: 8, current: { broken: true }, backup: fresh() });
    const app = new SaveApplication(repo, index, () => nextTime); const before = await repo.load();
    await expect(app.start()).rejects.toMatchObject({ code: 'recovery_failed' }); expect(await repo.load()).toEqual(before);
    await expect(app.recoverBackup(false)).rejects.toMatchObject({ code: 'confirmation_required' });
    expect(JSON.parse(await app.exportRawRecovery()).recoveryData.current).toEqual({ broken: true });
    const result = await app.recoverBackup(true); expect(result.save.xp).toBe(0);
    expect((await repo.load()).backup).toEqual(fresh());
    const bad = new SaveApplication(new MemorySaveRepository({ revision: 1, current: {}, backup: {} }), index);
    await expect(bad.recoverBackup(true)).rejects.toMatchObject({ code: 'recovery_failed' });
  });
});

function wrapped(save: PlayerSave) { return JSON.stringify({ product: PRODUCT_ID, saveSchemaVersion: save.saveSchemaVersion, contentVersionSeen: save.contentVersionSeen, payload: save }); }
describe('reconciliation and confirmed import/export', () => {
  it('refreshes old failed-pair knowledge without auto-discovery and retains old progress/history', async () => {
    const content = structuredClone(index.content); content.manifest.contentVersion = '0.0.1';
    content.recipes = content.recipes.filter(r => r.id !== 'void_energy_to_light');
    const oldIndex = buildIndex(validateContent(content));
    expect(resolve('void', 'energy', engineState(fresh(), oldIndex), oldIndex).type).toBe('no_reaction');
    const old = fresh(); old.contentVersionSeen = '0.0.1'; old.xp = 40;
    old.testedPairs['energy::void'] = { lastOutcome: 'no_reaction', testedAgainstContentVersion: '0.0.1', lastTestedAt: firstTime };
    const repo = new MemorySaveRepository({ revision: 1, current: old, backup: null });
    const app = new SaveApplication(repo, index, () => nextTime); const result = await app.load();
    expect(result.notices).toContain('new_possibilities_available'); expect(result.notices).toContain('content_version_updated');
    expect(result.newPossibilityElementIds).toEqual(['energy', 'void']); expect(result.save.xp).toBe(40);
    expect(result.save.discoveredElements).toEqual(old.discoveredElements); expect(result.save.discoveredElements.light).toBeUndefined();
    expect(result.save.testedPairs['energy::void']).toEqual(old.testedPairs['energy::void']);
    expect(isFailureAuthoritative(result.save, 'energy::void', index)).toBe(false);
    expect((await repo.load()).backup).toEqual(old);
  });
  it('does not leak an eligible secret/hidden target via notices or known input markers', () => {
    for (const hidden of ['secret', 'hidden'] as const) {
      const content = structuredClone(index.content);
      if (hidden === 'secret') { content.recipes[0]!.discovery = 'secret'; content.elements.find(e => e.id === 'light')!.visibility = 'secret'; }
      else { content.sets.find(s => s.id === 'origins')!.visibility = 'hidden'; content.visibility.setAnnouncements = content.visibility.setAnnouncements.filter(p => p.setId !== 'origins'); }
      const modified = buildIndex(validateContent(content)); const old = fresh(); old.revealedSetIds = []; old.contentVersionSeen = '0.0.1';
      old.testedPairs['energy::void'] = { lastOutcome: 'no_reaction', testedAgainstContentVersion: '0.0.1', lastTestedAt: firstTime };
      const result = reconcileContent(old, modified);
      expect(result.notices).not.toContain('new_possibilities_available'); expect(result.newPossibilityElementIds).toEqual([]);
      expect(result.save.discoveredElements.light).toBeUndefined();
    }
  });
  it('a newly eligible same-version gate does not make failed metadata permanent', () => {
    const c = structuredClone(index.content); c.recipes[0]!.requirements = [{ type: 'min_level', level: 2 }];
    const gated = buildIndex(validateContent(c)); const save = fresh();
    save.testedPairs['energy::void'] = { lastOutcome: 'no_reaction', testedAgainstContentVersion: '0.1.0', lastTestedAt: firstTime };
    expect(isFailureAuthoritative(save, 'energy::void', gated)).toBe(true);
    save.xp = 250; expect(isFailureAuthoritative(save, 'energy::void', gated)).toBe(false);
  });
  it('applies authored element aliases and preserves historical recipe metadata in quarantine across loads', () => {
    const c = structuredClone(index.content); c.migrations.aliases.old_void = 'void';
    const aliased = buildIndex(validateContent(c)); const save = fresh();
    delete save.discoveredElements.void; save.discoveredElements.old_void = { firstDiscoveredAt: firstTime, firstRecipeId: 'retired_recipe' };
    save.favoriteElementIds = ['old_void']; save.testedPairs['energy::old_void'] = { lastOutcome: 'no_reaction', testedAgainstContentVersion: '0.0.1', lastTestedAt: firstTime };
    const result = reconcileContent(save, aliased);
    expect(result.save.discoveredElements.void).toEqual({ firstDiscoveredAt: firstTime });
    expect(result.save.favoriteElementIds).toEqual(['void']); expect(result.save.testedPairs['energy::void']).toBeTruthy();
    const second = reconcileContent(result.save, aliased);
    expect(second.save.quarantine?.discoveredElements.old_void?.firstRecipeId).toBe('retired_recipe');
  });
  it('quarantines optional/retired references while preserving recognized progress and exportable metadata', async () => {
    const save = fresh(); save.favoriteElementIds = ['void', 'retired']; save.discoveredRecipeIds = ['retired_recipe'];
    save.discoveredElements.retired = { firstDiscoveredAt: firstTime }; save.anomalies.retired_anomaly = { firstObservedAt: firstTime };
    save.revealedSetIds.push('retired_set'); save.completedSetIds.push('retired_set'); save.completedCollectionChapterIds = ['retired_chapter'];
    const result = reconcileContent(save, index); expect(result.save.xp).toBe(save.xp); expect(result.save.favoriteElementIds).toEqual(['void']);
    expect(result.save.quarantine?.discoveredElements.retired).toEqual(save.discoveredElements.retired);
    expect(result.save.quarantine?.discoveredRecipeIds).toContain('retired_recipe');
    expect(engineState(result.save, index).discoveredElementIds).not.toContain('retired');
    const repo = new MemorySaveRepository(); const app = new SaveApplication(repo, index, () => firstTime); await app.start();
    const preview = await app.previewImport(wrapped(save)); expect(preview.discoveries).toBe(4);
    await app.confirmImport(preview, true);
    expect(JSON.parse(await app.exportSave()).payload.quarantine.discoveredElements.retired).toEqual(save.discoveredElements.retired);
  });
  it('exports UTF-8 JSON; preview does not overwrite; confirmation consumes a genuine preview', async () => {
    const repo = new MemorySaveRepository(); const app = new SaveApplication(repo, index, () => firstTime); await app.start();
    const exported = await app.exportSave(); const before = await repo.load(); const preview = await app.previewImport(exported);
    expect(await repo.load()).toEqual(before); expect(preview).toMatchObject({ discoveries: 4, xp: 0, schemaVersion: 1 });
    await expect(app.confirmImport(preview, false)).rejects.toMatchObject({ code: 'confirmation_required' });
    await expect(app.confirmImport({ ...preview }, true)).rejects.toMatchObject({ code: 'confirmation_required' });
    const result = await app.confirmImport(preview, true); expect(result.save).toEqual(fresh());
    expect((await repo.load()).backup).toEqual(before.current);
    await expect(app.confirmImport(preview, true)).rejects.toMatchObject({ code: 'confirmation_required' });
  });
  it('rejects malformed JSON, wrong product, invalid payload and version mismatch without writes', async () => {
    const repo = new MemorySaveRepository(); const app = new SaveApplication(repo, index); await app.start(); const before = await repo.load();
    for (const input of ['{bad', '{}', wrapped({ ...fresh(), xp: -10 }), JSON.stringify({ ...JSON.parse(wrapped(fresh())), product: 'another_game' }), JSON.stringify({ ...JSON.parse(wrapped(fresh())), contentVersionSeen: '0.0.1' })]) {
      await expect(app.previewImport(input)).rejects.toBeInstanceOf(SaveError);
    }
    expect(await repo.load()).toEqual(before);
  });
  it('a stale preview cannot overwrite progress created after the preview', async () => {
    const repo = new MemorySaveRepository(); const app = new SaveApplication(repo, index); await app.start();
    const preview = await app.previewImport(await app.exportSave()); await app.combine('void', 'energy');
    await expect(app.confirmImport(preview, true)).rejects.toMatchObject({ code: 'conflict' });
    expect((await app.load()).save.discoveredElements.light).toBeTruthy();
    await expect(app.clear(false)).rejects.toMatchObject({ code: 'confirmation_required' });
  });
});

describe('released v1 save compatibility fixtures', () => {
  it.each(['fresh', 'early', 'completed-sets', 'anomaly-observed', 'pre-content-update'])('loads v1-%s without losing recognized durable facts', async name => {
    const raw = JSON.parse(readFileSync(new URL(`./fixtures/saves/v1-${name}.json`, import.meta.url), 'utf8'));
    const parsed = parseSave(raw); const repository = new MemorySaveRepository({ revision: 1, current: parsed, backup: null });
    const result = await new SaveApplication(repository, index, () => nextTime).load();
    expect(result.save.discoveredElements).toEqual(parsed.discoveredElements); expect(result.save.xp).toBe(parsed.xp);
    expect(result.save.anomalies).toEqual(parsed.anomalies); expect(result.save.completedSetIds).toEqual(parsed.completedSetIds);
  });
});
