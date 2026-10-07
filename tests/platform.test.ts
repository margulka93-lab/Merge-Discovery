import { describe, it, expect, vi } from 'vitest';
import { UpdateCoordinator } from '../src/platform/pwa/updates';
import { AudioEngine } from '../src/platform/audio/AudioEngine';
import { reactionPresentation } from '../src/application/presentation';
import { loadSeed } from '../src/content/load';
import { SaveApplication } from '../src/application/save/SaveApplication';
import { MemorySaveRepository } from '../src/persistence/memory/MemorySaveRepository';
import { laboratoryReaction } from '../src/application/laboratory';
describe('update coordination', () => {
  it('keeps nested combine/import/recovery operations and major reveals safe, applies once', () => {
    const reload = vi.fn(), postMessage = vi.fn(), updates = new UpdateCoordinator(reload);
    const release = updates.beginOperation()!, second = updates.beginOperation()!;
    updates.offer({ postMessage }); expect(updates.accept()).toBe(false);
    updates.setReveal(true); release(); release(); second(); expect(updates.accept()).toBe(false);
    updates.defer(); expect(updates.getSnapshot().deferred).toBe(true);
    updates.setReveal(false); updates.show(); expect(updates.accept()).toBe(true);
    expect(updates.beginOperation()).toBeUndefined(); expect(updates.accept()).toBe(false);
    updates.controllerChanged(); updates.controllerChanged(); expect(postMessage).toHaveBeenCalledTimes(1); expect(reload).toHaveBeenCalledTimes(1);
  });
  it('does not reload on first activation or an update accepted in another tab', () => {
    const reload = vi.fn(), updates = new UpdateCoordinator(reload);
    updates.controllerChanged(); expect(reload).not.toHaveBeenCalled();
  });
  it('a redundant/failed worker message releases the applying lock and preserves gameplay', () => {
    const updates = new UpdateCoordinator(vi.fn());
    updates.offer({ postMessage: () => { throw new Error('Worker became redundant'); } });
    expect(updates.accept()).toBe(false); expect(updates.getSnapshot().applying).toBe(false);
    expect(updates.beginOperation()).toBeTypeOf('function');
  });
  it('reload boundary neither duplicates XP nor loses the committed discovery or preferences', async () => {
    const repo = new MemorySaveRepository(), content = loadSeed(), app = new SaveApplication(repo, content);
    const previous = await app.start(), updates = new UpdateCoordinator(vi.fn());
    const release = updates.beginOperation()!; updates.offer({ postMessage: vi.fn() });
    const transaction = await app.combine('energy','energy');
    const presentation = reactionPresentation(laboratoryReaction(transaction.resolution,transaction.snapshot,app.index,previous));
    updates.setReveal(presentation.acknowledgement); release(); expect(updates.accept()).toBe(false);
    const committed = await repo.load(); updates.setReveal(false); expect(updates.accept()).toBe(true);
    updates.controllerChanged(); const reopened = await new SaveApplication(repo,content).start();
    expect(reopened.save.xp).toBe(transaction.snapshot.save.xp);
    expect(reopened.save.discoveredElements).toEqual(transaction.snapshot.save.discoveredElements);
    expect(await repo.load()).toEqual(committed);
  });
});
describe('optional audio and persisted existing preferences', () => {
  it('creates no context while silent or before a user gesture', async () => {
    const create = vi.fn(), audio = new AudioEngine(create);
    await audio.play('discover_new',true); audio.userGesture(); await audio.play('discover_new',false); expect(create).not.toHaveBeenCalled();
  });
  it('swallows blocked/missing WebAudio and throttles UI selection', async () => {
    const create = vi.fn(() => { throw new Error('blocked'); }), audio = new AudioEngine(create, () => 100);
    audio.userGesture(); await expect(audio.play('ui_select',true)).resolves.toBeUndefined(); await audio.play('ui_select',true); expect(create).toHaveBeenCalledTimes(1);
  });
  it('commits existing sound/music fields without changing the save schema or progression', async () => {
    const app = new SaveApplication(new MemorySaveRepository(),loadSeed()), before = await app.start();
    expect(before.save.settings.soundEnabled).toBe(false); expect(before.save.settings.musicEnabled).toBe(false);
    const after = await app.updatePreferences({ soundEnabled: true, musicEnabled: true });
    expect(after.save.settings.soundEnabled).toBe(true); expect(after.save.settings.musicEnabled).toBe(true);
    expect(after.save.saveSchemaVersion).toBe(before.save.saveSchemaVersion); expect(after.save.xp).toBe(before.save.xp);
  });
});
