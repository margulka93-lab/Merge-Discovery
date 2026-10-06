import type { PlayerSave } from '../../domain/model/save';
import type { SaveRepository, SaveSlots } from '../SaveRepository';
import { assertRevision, emptySlots, nextSlots } from '../snapshots';

export class MemorySaveRepository implements SaveRepository {
  readonly adapter = 'memory' as const;
  private slots: SaveSlots;
  /** Raw fixtures deliberately support corruption/recovery tests. */
  constructor(slots: SaveSlots = emptySlots()) { this.slots = structuredClone(slots); }
  async load() { return structuredClone(this.slots); }
  async createNew(snapshot: PlayerSave, expectedRevision: number) { return this.commit(snapshot, expectedRevision, true); }
  async persist(snapshot: PlayerSave, expectedRevision: number, previousValid?: PlayerSave | null) { return this.commit(snapshot, expectedRevision, false, previousValid); }
  async import(snapshot: PlayerSave, expectedRevision: number, previousValid?: PlayerSave | null) { return this.persist(snapshot, expectedRevision, previousValid); }
  async export() { return structuredClone(this.slots.current); }
  private commit(snapshot: PlayerSave, expected: number, create = false, previousValid?: PlayerSave | null) {
    const next = nextSlots(this.slots, snapshot, expected, create, previousValid);
    this.slots = next;
    return next.revision;
  }
  async clear(expectedRevision: number) {
    assertRevision(this.slots, expectedRevision);
    this.slots = { ...emptySlots(), revision: this.slots.revision + 1 };
  }
}
