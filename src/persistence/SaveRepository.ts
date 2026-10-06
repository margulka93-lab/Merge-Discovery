import type { PlayerSave } from '../domain/model/save';

export interface SaveSlots { revision: number; current: unknown | null; backup: unknown | null }
/** Raw reads allow structural corruption/migration to be handled explicitly by Application. */
export interface SaveRepository {
  readonly adapter: 'memory' | 'indexeddb';
  load(): Promise<SaveSlots>;
  createNew(snapshot: PlayerSave, expectedRevision: number): Promise<number>;
  /** Optional validated predecessor supports legacy-schema backups; null preserves backup on recovery. */
  persist(snapshot: PlayerSave, expectedRevision: number, previousValid?: PlayerSave | null): Promise<number>;
  export(): Promise<unknown>;
  /** Only validated application-confirmed snapshots reach this method. */
  import(snapshot: PlayerSave, expectedRevision: number, previousValid?: PlayerSave | null): Promise<number>;
  clear(expectedRevision: number): Promise<void>;
}
