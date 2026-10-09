import { WorldError } from '../../domain/world/types';
import type { WorldCommit, WorldRepository } from '../WorldRepository';
import { emptySlots } from '../snapshots';
import { activeSlots, nextWorldRow } from '../worldSlots';
import type { SaveDatabase } from './IndexedDbSaveRepository';
export class IndexedDbWorldRepository implements WorldRepository {
  constructor(readonly database: SaveDatabase) {}
  private async guarded<T>(action: () => Promise<T>): Promise<T> {
    try { return await action(); } catch (cause) { if (cause instanceof WorldError) throw cause; throw new WorldError('persistence_failed', 'World storage unavailable; retry or export diagnostic data', cause); }
  }
  private async readContext(worldId: string) {
    let meta = await this.database.profile_meta.get('single_player');
    if (!meta) { meta = { id: 'single_player', generation: crypto.randomUUID() }; await this.database.profile_meta.put(meta); }
    if (typeof meta.generation !== 'string' || !meta.generation.length || meta.generation.length > 128) throw new WorldError('recovery_required', 'Invalid profile metadata; preserve and export raw storage');
    const row = await this.database.world_snapshots.get(worldId), save = await this.database.snapshots.get('single_player') ?? emptySlots();
    if (!Number.isSafeInteger(save.revision) || save.revision < 0 || !Object.hasOwn(save, 'current') || !Object.hasOwn(save, 'backup')) throw new WorldError('recovery_required', 'Invalid canonical storage record');
    return { generation: meta.generation, save: { revision: save.revision, current: save.current, backup: save.backup }, world: activeSlots(row, meta.generation) };
  }
  context(worldId: string) {
    return this.guarded(() => this.database.transaction('rw', this.database.snapshots, this.database.profile_meta, this.database.world_snapshots, () => this.readContext(worldId)));
  }
  commit(request: WorldCommit) {
    return this.guarded(() => this.database.transaction('rw', this.database.snapshots, this.database.profile_meta, this.database.world_snapshots, async () => {
      const context = await this.readContext(request.worldId), row = await this.database.world_snapshots.get(request.worldId);
      const next = nextWorldRow(context, row, request); await this.database.world_snapshots.put(next); return next.revision;
    }));
  }
  exportRaw(worldId: string) { return this.guarded(async () => await this.database.world_snapshots.get(worldId) ?? null); }
}
