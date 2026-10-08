import 'fake-indexeddb/auto';
import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { rawSeed, loadSeed } from '../src/content/load';
import { validateContent } from '../src/content/validate';
import { ContentPackApplication } from '../src/application/packs/ContentPackApplication';
import { SaveApplication } from '../src/application/save/SaveApplication';
import { MemorySaveRepository } from '../src/persistence/memory/MemorySaveRepository';
import { IndexedDbContentPackRepository, ContentPackDatabase } from '../src/persistence/indexeddb/IndexedDbContentPackRepository';
import { IndexedDbAuthorDraftRepository, AuthorDraftDatabase } from '../src/persistence/indexeddb/IndexedDbAuthorDraftRepository';
import { newDraft, upsertDraft, authorPath, pairCollisions } from '../src/application/packs/authoring';
import { readPack } from '../src/content/packs/archive';
import { samplePack } from '../src/content/packs/sample';
let count = 0;
async function setup(decoder = vi.fn().mockResolvedValue(undefined)) {
  const n = ++count, packs = new IndexedDbContentPackRepository(new ContentPackDatabase(`studio_packs_${n}`));
  const drafts = new IndexedDbAuthorDraftRepository(new AuthorDraftDatabase(`studio_drafts_${n}`)), saves = new MemorySaveRepository();
  const game = new SaveApplication(saves,loadSeed()); await game.start();
  const importer = new ContentPackApplication(validateContent(rawSeed),packs,saves,decoder,undefined,undefined,drafts);
  return { studio:await importer.studio(), importer, game, packs, drafts, saves, decoder,
    close:async()=>{await packs.database.delete();await drafts.database.delete();} };
}
describe('visual Content Studio application boundary', () => {
  it('persists an incomplete draft across reopening without activating it or changing gameplay progress', async () => {
    const env = await setup(), before = await env.saves.load();
    const draft = await env.studio.blank(); draft.manifest.title = 'Bozza incompleta'; draft.patch.recipes = [{id:'my_pack_bad',inputs:['missing','void'],resultElementId:'missing',kind:'explicit',discovery:'normal'}];
    await env.studio.saveDraft(draft); env.drafts.database.close();
    const reopened = new IndexedDbAuthorDraftRepository(new AuthorDraftDatabase(env.drafts.database.name));
    expect(await reopened.load()).toEqual(draft); await expect(env.studio.preview(draft)).rejects.toThrow();
    expect((await env.packs.load()).revision).toBe(0); expect(await env.saves.load()).toEqual(before);
    await reopened.database.delete(); await env.close();
  });
  it('isolates queued draft snapshots from later caller mutation and recovers from a failed draft write', async () => {
    const env = await setup(), draft = await env.studio.blank();
    const save = vi.spyOn(env.drafts,'save').mockRejectedValueOnce(new Error('quota'));
    await expect(env.studio.saveDraft(draft)).rejects.toThrow('quota'); save.mockRestore();
    const write = env.studio.saveDraft(draft); draft.manifest.title = 'Uncommitted mutation';
    expect((await env.studio.loadDraft()).manifest.title).toBe('Il mio pacchetto'); await write;
    expect(await env.importer.studio()).toBe(env.studio); await env.close();
  });
  it('assigns a raster to one proposed element without overwriting another element sharing its old artKey', async () => {
    const env = await setup(), pack = await env.studio.import(new Uint8Array(readFileSync('tests/fixtures/phase-8a-proposed.zip')));
    const fish = pack.patch.elements!.find(e=>e.id==='fish')!, shark = pack.patch.elements!.find(e=>e.id==='shark')!;
    expect(fish.artKey).toBe(shark.artKey);
    const image = new Uint8Array(readFileSync('public/icons/icon-192.png'));
    const changed = await env.studio.imageForItem(pack,'elements','fish',image); image.fill(0);
    expect(changed.patch.elements!.find(e=>e.id==='fish')!.artKey).toBe('phase_8a.elements.fish');
    expect(changed.patch.elements!.find(e=>e.id==='shark')!.artKey).toBe(shark.artKey);
    expect(pack.assets).toEqual({}); expect(changed.assets['phase_8a.elements.fish']![0]).toBe(137);
    expect(changed.patch.recipes).toEqual(pack.patch.recipes); expect(env.decoder).toHaveBeenCalledOnce();
    const exported = await readPack(await env.studio.export(changed)); expect(exported.manifest.reviewStatus).toBe('proposed');
    expect((await env.studio.preview(exported)).report.reachable).toBe(118); await env.close();
  });
  it('rejects corrupt images and assignment to read-only canonical definitions without any draft mutation', async () => {
    const env = await setup(), draft = await env.studio.blank(), before = structuredClone(draft);
    await expect(env.studio.imageForItem(draft,'elements','water',new Uint8Array([1]))).rejects.toThrow(/appartenente/);
    await expect(env.studio.image(draft,'my_pack.bad',new Uint8Array([1,2]))).rejects.toThrow();
    expect(draft).toEqual(before); expect((await env.packs.load()).revision).toBe(0); await env.close();
  });
  it('prepares an owned version update, retains progress on install, and invalidates a preview after gameplay changes', async () => {
    const env = await setup(); await env.importer.install(await env.importer.preview(await env.studio.export(await samplePack())));
    const update = await env.studio.editInstalled('studio_sample'); expect(update.manifest.version).toBe('1.0.1'); expect(update.manifest.contentVersion).toBe('0.3.1');
    const token = await env.studio.preview(update); await env.game.combine('energy','energy');
    await expect(env.importer.install(token)).rejects.toThrow(/progresso è cambiato/);
    const before = await env.saves.load(); await env.importer.install(await env.studio.preview(update));
    expect(await env.saves.load()).toEqual(before); await env.close();
  });
  it('requires explicit editing for duplicate draft IDs and reports unordered canonical pair collisions and dependency cycles', async () => {
    const draft = newDraft('0.1.0'), recipe = {id:'my_pack_cycle',inputs:['my_pack_target','void'] as [string,string],resultElementId:'my_pack_target',kind:'explicit' as const,discovery:'normal' as const};
    const changed = upsertDraft(draft,'recipes',recipe);
    expect(()=>upsertDraft(changed,'recipes',recipe)).toThrow(/Usa Modifica/);
    expect(upsertDraft(changed,'recipes',recipe,recipe.id).patch.recipes).toHaveLength(1);
    expect(pairCollisions(loadSeed(),changed,'matter','time')).toEqual(pairCollisions(loadSeed(),changed,'time','matter'));
    expect(authorPath(loadSeed(),changed,'my_pack_target').some(node=>node.cycle)).toBe(true);
    expect(draft.patch.recipes).toEqual([]);
  });
});
