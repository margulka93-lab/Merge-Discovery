import type { WorldState } from '../domain/world/types';
import type { SaveSlots } from './SaveRepository';
export interface WorldSlots { revision: number; current: unknown | null; backup: unknown | null }
export interface WorldContext { generation: string; save: SaveSlots; world: WorldSlots }
export interface WorldCommit {
  worldId: string; profileGeneration: string; expectedSaveRevision: number; expectedWorldRevision: number;
  next: WorldState; previousValid?: WorldState | null;
}
/** Reads and writes are coherent across save/profile/world; raw recovery is never auto-reset. */
export interface WorldRepository {
  context(worldId: string): Promise<WorldContext>;
  commit(request: WorldCommit): Promise<number>;
  /** Diagnostic ONLY: not a portable full-game export. Includes bounded retired generation. */
  exportRaw(worldId: string): Promise<unknown>;
}
export interface WorldRow extends WorldSlots { id: string; generation: string; retired?: { generation: string; slots: WorldSlots } }
