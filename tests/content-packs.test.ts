import 'fake-indexeddb/auto';
import { describe, expect, it, vi } from 'vitest';
import { zipSync, strToU8, unzipSync } from 'fflate';
import { readFileSync } from 'node:fs';
import { rawSeed, loadSeed } from '../src/content/load';
import { validateContent } from '../src/content/validate';
import { readPack, writePack, safeArchivePath } from '../src/content/packs/archive';
import { composePacks } from '../src/content/packs/compose';
import { samplePack } from '../src/content/packs/sample';
import { previewPack } from '../src/application/packs/preview';
import { ContentPackApplication } from '../src/application/packs/ContentPackApplication';
import { SaveApplication } from '../src/application/save/SaveApplication';
import { MemorySaveRepository } from '../src/persistence/memory/MemorySaveRepository';
import { ContentPackDatabase, IndexedDbContentPackRepository } from '../src/persistence/indexeddb/IndexedDbContentPackRepository';
import { createSave } from '../src/application/save/projection';
import { isFailureAuthoritative } from '../src/application/updates/reconcile';
import { createCatalogProjector } from '../src/application/catalog';
import { createWorldProjector } from '../src/application/world';
import type { ContentPack } from '../src/content/packs/model';
import { epochLease } from '../src/platform/content/lease';
import { simulateReachability } from '../src/domain/simulation/reachability';
const seed = validateContent(rawSeed), clock = () => '2026-10-08T12:00:00.000Z';
let dbCount = 0;
async function setup() {
  const packs = new IndexedDbContentPackRepository(new ContentPackDatabase(`packs_${++dbCount}`));
  const saves = new MemorySaveRepository(), game = new SaveApplication(saves,loadSeed(),clock); await game.start();
  return { packs, saves, game, importer: new ContentPackApplication(seed,packs,saves) };
}
async function edited(change: (pack: ContentPack) => void) { const pack = await samplePack(); change(pack); return pack; }
describe('runtime content packs', () => {
  it('round-trips a ZIP with canonical modules, locale, checksum and art, composing without seed mutations', async () => {
    const before = JSON.stringify(rawSeed), pack = await readPack(await writePack(await samplePack()));
    const { index, assets } = composePacks(seed,[pack]);
    expect(index.elements.size).toBe(68); expect(assets.size).toBe(1); expect(JSON.stringify(rawSeed)).toBe(before);
    const report = previewPack(seed,[],pack).report;
    expect([report.reachable,report.total]).toEqual([68,68]); expect(report.canonicalApproval).toContain('PENDING');
    expect(report.completedCollections).toContain('studio_sample_collection'); expect(report.ingredientUse.length).toBeGreaterThan(0);
  });
  it('atomically installs bytes/manifest/composition, persists on reopening and never writes PlayerSave at install', async () => {
    const { importer,packs,saves } = await setup(), before = await saves.load();
    const token = await importer.preview(await writePack(await samplePack())); await importer.install(token);
    expect(await saves.load()).toEqual(before);
    const name = packs.database.name; packs.database.close();
    const reopened = new IndexedDbContentPackRepository(new ContentPackDatabase(name)), stored = await reopened.load();
    expect(stored.revision).toBe(1); expect(stored.previous).toEqual([]); expect(stored.packs[0]!.assets['studio_sample.spark']).toEqual((await samplePack()).assets['studio_sample.spark']);
    const game = new SaveApplication(saves,composePacks(seed,stored.packs).index,clock), boot = await game.start();
    expect(boot.save.discoveredElements).toEqual((before.current as ReturnType<typeof createSave>).discoveredElements); expect(boot.save.xp).toBe(0);
    expect(boot.save.contentVersionSeen).toBe('0.3.0');
    await reopened.database.delete();
  });
  it('makes a previous failed A+A pair stale; discovers normally and projects new Set/Collection only at permitted visibility', async () => {
    const { importer,packs,saves,game } = await setup(); await game.combine('void','void');
    const old = (await game.load()).save;
    expect(isFailureAuthoritative(old,'void::void',game.index)).toBe(true);
    await importer.install(await importer.preview(await writePack(await samplePack())));
    const next = new SaveApplication(saves,composePacks(seed,(await packs.load()).packs).index,clock), boot = await next.start();
    expect(isFailureAuthoritative(boot.save,'void::void',next.index)).toBe(false);
    const catalogProjector = createCatalogProjector(next.index), worldProjector = createWorldProjector(next.index);
    expect(JSON.stringify(catalogProjector(boot))).not.toContain('Scintilla di prova');
    const result = await next.combine('void','void'); expect(result.resolution.type).toBe('success');
    expect(result.snapshot.save.discoveredElements.studio_sample_spark).toBeDefined();
    const catalog = catalogProjector(result.snapshot), world = worldProjector(result.snapshot,catalog);
    expect(JSON.stringify(catalog)).toContain('Scintilla di prova'); expect(JSON.stringify(world)).toContain('Taccuino di prova');
    await expect(importer.disable('studio_sample')).rejects.toThrow(/salvataggio usa/);
    await expect(importer.rollback()).rejects.toThrow(/salvataggio usa/);
    await packs.database.delete();
  });
  it('allows rollback before progress uses the pack and leaves save slots unchanged', async () => {
    const { importer,packs,saves } = await setup(), before = await saves.load();
    await importer.install(await importer.preview(await writePack(await samplePack()))); await importer.rollback();
    expect((await packs.load()).packs).toEqual([]); expect(await saves.load()).toEqual(before); await packs.database.delete();
  });
  it('rejects fake/stale previews and concurrent composition changes', async () => {
    const { importer,packs,game } = await setup();
    const token = await importer.preview(await writePack(await samplePack()));
    await expect(importer.install({ report: token.report })).rejects.toThrow(/scaduta/);
    await game.combine('energy','energy'); await expect(importer.install(token)).rejects.toThrow(/progresso è cambiato/);
    const other = await importer.preview(await writePack(await samplePack())); await packs.activate([],0);
    await expect(importer.install(other)).rejects.toThrow(/altra scheda/); await packs.database.delete();
  });
  it('rolls back the complete IndexedDB transaction on abort/storage quota failure', async () => {
    const { importer,packs,saves } = await setup(), before = await packs.load(), save = await saves.load();
    const token = await importer.preview(await writePack(await samplePack()));
    const fail = () => { throw new DOMException('No space','QuotaExceededError'); }; packs.database.compositions.hook('creating').subscribe(fail);
    await expect(importer.install(token)).rejects.toThrow();
    packs.database.compositions.hook('creating').unsubscribe(fail); expect(await packs.load()).toEqual(before); expect(await saves.load()).toEqual(save);
    await importer.install(token); expect((await packs.load()).revision).toBe(1); await packs.database.delete();
  });
  it('browser decoder failure blocks installation without changes', async () => {
    const { packs,saves } = await setup(), decoder = vi.fn().mockRejectedValue(new Error('decode'));
    const app = new ContentPackApplication(seed,packs,saves,decoder);
    await expect(app.preview(await writePack(await samplePack()))).rejects.toThrow('decode');
    expect((await packs.load()).revision).toBe(0); await packs.database.delete();
  });
  it('exports a complete installed ZIP and safely updates only pack-owned definitions', async () => {
    const { importer,packs } = await setup(); await importer.install(await importer.preview(await writePack(await samplePack())));
    expect((await readPack(await importer.export('studio_sample'))).manifest.assets).toEqual((await samplePack()).manifest.assets);
    const update = await edited(p => { p.manifest.version = '1.1.0'; p.manifest.contentVersion = '0.4.0'; p.patch.locales!.it['studio_sample.spark.name'] = 'Scintilla aggiornata'; });
    await importer.install(await importer.preview(await writePack(update)));
    expect((await packs.load()).previous![0]!.manifest.version).toBe('1.0.0');
    update.manifest.version = '1.2.0'; update.manifest.contentVersion = '0.5.0'; update.patch.recipes = [];
    await expect(importer.preview(await writePack(update))).rejects.toThrow(/Rimozione/); await packs.database.delete();
  });
  it('validates the 51 proposals from PR #12 as a sandbox fixture, 118/118, with no canon approval', async () => {
    const pack = await readPack(new Uint8Array(readFileSync('tests/fixtures/phase-8a-proposed.zip')));
    const report = previewPack(seed,[],pack).report;
    expect([report.addedElements,report.addedRecipes,report.reachable,report.total,report.depth]).toEqual([51,51,118,118,12]);
    expect(report.reviewStatus).toBe('proposed'); expect(report.canonicalApproval).toContain('PENDING'); expect(rawSeed.elements).toHaveLength(67);
    const index = composePacks(seed,[pack]).index;
    expect(simulateReachability(index)).toEqual(simulateReachability(index,{revisitSettled:true}));
  });
  it('discovers an imported alternative for an owned result, while repetition never farms XP', async () => {
    const { importer,packs,saves,game } = await setup(); await game.combine('void','energy');
    const pack = await edited(p => { p.patch.recipes!.push({ id:'studio_sample_light_alternate',inputs:['void','matter'],resultElementId:'light',kind:'explicit',discovery:'alternate' }); });
    await importer.install(await importer.preview(await writePack(pack)));
    const next = new SaveApplication(saves,composePacks(seed,(await packs.load()).packs).index,clock);
    const result = await next.combine('matter','void'); expect(result.resolution.type).toBe('success');
    if (result.resolution.type === 'success') { expect(result.resolution.isNewRecipe).toBe(true); expect(result.resolution.isNewElement).toBe(false); }
    const repeated = await next.combine('void','matter'); expect(repeated.snapshot.save.xp).toBe(result.snapshot.save.xp); await packs.database.delete();
  });
  it('coordinates stale save commands with the composition epoch without rewriting earlier progress', async () => {
    const { packs,saves } = await setup(), old = new SaveApplication(saves,loadSeed(),clock,[],epochLease(packs,0));
    await old.load(); const before = await saves.load(); await packs.activate([await samplePack()],0);
    await expect(old.combine('energy','energy')).rejects.toThrow(/epoch changed/); expect(await saves.load()).toEqual(before); await packs.database.delete();
  });
  it('orders dependency compositions deterministically, blocks unsafe deactivation and version downgrades', async () => {
    const first = await samplePack(), second: ContentPack = { manifest:{...first.manifest,packId:'second_pack',namespace:'second_pack',contentVersion:'0.4.0',assets:{},dependencies:[{packId:first.manifest.packId,version:first.manifest.version}]},patch:{},assets:{} };
    expect(composePacks(seed,[second,first]).index.content).toEqual(composePacks(seed,[first,second]).index.content);
    const { importer,packs } = await setup(); await importer.install(await importer.preview(await writePack(first))); await importer.install(await importer.preview(await writePack(second)));
    const before = await packs.load(); await expect(importer.disable(first.manifest.packId)).rejects.toThrow(/Dipendenza/); expect(await packs.load()).toEqual(before);
    await expect(importer.preview(await writePack(first))).rejects.toThrow(/versione/); await packs.database.delete();
  });
  it('settled-pair optimization preserves later gated alternatives and authored anomaly payoff', async () => {
    const alternative = await edited(p => {
      p.patch.recipes![0]!.priority = 0;
      p.patch.recipes!.push({id:'studio_sample_later',inputs:['void','void'],resultElementId:'light',kind:'explicit',discovery:'alternate',priority:1,requirements:[{type:'min_level',level:4}],gateBehavior:'dormant'});
    });
    const gatedIndex = composePacks(seed,[alternative]).index, fast = simulateReachability(gatedIndex);
    expect(fast).toEqual(simulateReachability(gatedIndex,{revisitSettled:true})); expect(fast.state.discoveredRecipeIds).toContain('studio_sample_later');
    const anomaly = await edited(p => {
      p.patch.recipes![0]!.requirements = [{type:'min_level',level:4}]; p.patch.recipes![0]!.gateBehavior = 'anomaly';
      p.patch.anomalies = [{id:'studio_sample_anomaly',inputs:['void','void'],visibility:'archive',category:'unknown',resolutionRecipeId:p.patch.recipes![0]!.id,messageKey:'studio_sample.anomaly.message'}]; p.patch.locales!.it['studio_sample.anomaly.message'] = 'Anomalia di prova.';
    });
    const anomalyIndex = composePacks(seed,[anomaly]).index, result = simulateReachability(anomalyIndex);
    expect(result).toEqual(simulateReachability(anomalyIndex,{revisitSettled:true})); expect(result.state.resolvedAnomalyIds).toContain('studio_sample_anomaly');
  });
});
describe('pack rejection and deterministic composition', () => {
  it.each(['../manifest.json','/manifest.json','art/../evil.png','C:/x','art\\x','a//b'])('rejects unsafe path %s', path => expect(safeArchivePath(path)).toBe(false));
  it('rejects malformed archive, unsupported schemas, scripts, image corruption and undeclared files', async () => {
    await expect(readPack(new Uint8Array([1,2,3]))).rejects.toThrow(/ZIP/);
    const valid = unzipSync(await writePack(await samplePack()));
    await expect(readPack(zipSync({ ...valid, 'art/script.svg': strToU8('<svg onload="alert(1)"/>') }))).rejects.toThrow(/File non dichiarati/);
    const raw = JSON.parse(new TextDecoder().decode(valid['manifest.json'])); raw.schemaVersion = 999;
    await expect(readPack(zipSync({ ...valid, 'manifest.json': strToU8(JSON.stringify(raw)) }))).rejects.toThrow();
    valid['art/spark.png']![50] = valid['art/spark.png']![50]! ^ 1;
    await expect(readPack(zipSync(valid))).rejects.toThrow(/checksum/);
  });
  it('checks central sizes before inflate, duplicate paths and CRC for JSON', async () => {
    const bytes = await writePack(await samplePack()), central = bytes.findIndex((_,i) => bytes[i] === 80 && bytes[i+1] === 75 && bytes[i+2] === 1 && bytes[i+3] === 2);
    const forged = bytes.slice(); new DataView(forged.buffer).setUint32(central+24,99_000_000,true);
    await expect(readPack(forged)).rejects.toThrow(/Espansione/);
    const crc = bytes.slice(); crc[central+16] = crc[central+16]! ^ 1; await expect(readPack(crc)).rejects.toThrow(/Checksum ZIP/);
    const files = unzipSync(bytes); files['../evil'] = strToU8('evil'); await expect(readPack(zipSync(files))).rejects.toThrow(/Percorso/);
  });
  it('rejects locked IDs, ambiguous unordered pairs, circular/missing deps, unreachable required and gated cycles', async () => {
    const locked = await edited(p => { p.patch.elements![0]!.id = 'water'; }), ambiguous = await edited(p => { p.patch.recipes![0]!.inputs = ['energy','energy']; });
    const missing = await edited(p => { p.manifest.dependencies = [{ packId: 'absent',version:'1.0.0' }]; }), cycle = await edited(p => { p.manifest.dependencies = [{ packId: p.manifest.packId,version:p.manifest.version }]; });
    const unreachable = await edited(p => { p.patch.recipes = []; }), gated = await edited(p => { p.patch.recipes![0]!.requirements = [{type:'element_discovered',elementId:'studio_sample_spark'}]; });
    expect(() => composePacks(seed,[locked])).toThrow(/Collisione/); expect(() => composePacks(seed,[ambiguous])).toThrow(/Override PairKey/);
    expect(() => composePacks(seed,[missing])).toThrow(/mancante/); expect(() => composePacks(seed,[cycle])).toThrow(/circolare/);
    expect(() => previewPack(seed,[],unreachable)).toThrow(/irraggiungibile/); expect(() => previewPack(seed,[],gated)).toThrow(/irraggiungibile/);
  });
});
