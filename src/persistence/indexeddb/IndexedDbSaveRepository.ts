import Dexie, { type Table } from 'dexie';
import type { PlayerSave } from '../../domain/model/save';
import { SaveError } from '../../domain/model/saveErrors';
import type { SaveRepository, SaveSlots } from '../SaveRepository';
import { assertRevision, emptySlots, nextSlots } from '../snapshots';

type Row = SaveSlots & { id: 'single_player' };
export class SaveDatabase extends Dexie {
  snapshots!: Table<Row, string>;
  constructor(name = 'merge_discovery') {
    super(name);
    this.version(1).stores({ snapshots: '&id' });
  }
}
export class IndexedDbSaveRepository implements SaveRepository {
  readonly adapter = 'indexeddb' as const;
  constructor(readonly database = new SaveDatabase()) {}
  private async guarded<T>(action: () => Promise<T>): Promise<T> {
    try { return await action(); }
    catch (cause) { if (cause instanceof SaveError) throw cause; throw new SaveError('persistence_failed', 'IndexedDB operation failed', cause); }
  }
  async load(): Promise<SaveSlots> {
    return this.guarded(async () => {
      const row = await this.database.snapshots.get('single_player');
      if (!row) return emptySlots();
      if (!Number.isSafeInteger(row.revision) || row.revision < 0 || !Object.hasOwn(row, 'current') || !Object.hasOwn(row, 'backup')) throw new SaveError('recovery_failed', 'Invalid storage record');
      return { revision: row.revision, current: row.current, backup: row.backup };
    });
  }
  async createNew(snapshot: PlayerSave, expectedRevision: number) { return this.commit(snapshot, expectedRevision, true); }
  async persist(snapshot: PlayerSave, expectedRevision: number, previousValid?: PlayerSave | null) { return this.commit(snapshot, expectedRevision, false, previousValid); }
  async import(snapshot: PlayerSave, expectedRevision: number, previousValid?: PlayerSave | null) { return this.persist(snapshot, expectedRevision, previousValid); }
  async export() { return (await this.load()).current; }
  private async commit(snapshot: PlayerSave, expected: number, create = false, previousValid?: PlayerSave | null) {
    return this.guarded(() => this.database.transaction('rw', this.database.snapshots, async () => {
      const next = nextSlots(await this.load(), snapshot, expected, create, previousValid);
      await this.database.snapshots.put({ id: 'single_player', ...next });
      return next.revision;
    }));
  }
  async clear(expectedRevision: number) {
    await this.guarded(() => this.database.transaction('rw', this.database.snapshots, async () => {
      const slots = await this.load(); assertRevision(slots, expectedRevision);
      await this.database.snapshots.put({ id: 'single_player', ...emptySlots(), revision: slots.revision + 1 });
    }));
  }
}
