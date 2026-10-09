import type { WorldCommit, WorldRepository, WorldRow } from '../WorldRepository';
import { activeSlots, nextWorldRow } from '../worldSlots';
import type { MemorySaveRepository } from './MemorySaveRepository';
export class MemoryWorldRepository implements WorldRepository {
  readonly rows = new Map<string, WorldRow>();
  constructor(readonly saves: MemorySaveRepository) {}
  async context(worldId: string) {
    const profile = this.saves.readProfile();
    return { ...profile, world: activeSlots(this.rows.get(worldId), profile.generation) };
  }
  async commit(request: WorldCommit) {
    const profile = this.saves.readProfile(), row = this.rows.get(request.worldId);
    const next = nextWorldRow({ ...profile, world: activeSlots(row, profile.generation) }, row, request);
    this.rows.set(request.worldId, next); return next.revision;
  }
  async exportRaw(worldId: string) { return structuredClone(this.rows.get(worldId) ?? null); }
}
