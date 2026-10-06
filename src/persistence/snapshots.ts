import type { PlayerSave } from '../domain/model/save';
import { parseSave, saveSchema } from '../domain/model/saveSchema';
import { SaveError } from '../domain/model/saveErrors';
import type { SaveSlots } from './SaveRepository';

export function emptySlots(): SaveSlots { return { revision: 0, current: null, backup: null }; }
export function assertRevision(slots: SaveSlots, expected: number) {
  if (slots.revision !== expected) throw new SaveError('conflict', 'Snapshot changed');
}
export function nextSlots(slots: SaveSlots, snapshot: PlayerSave, expected: number, create = false, previousValid?: PlayerSave | null): SaveSlots {
  assertRevision(slots, expected);
  if (create && (slots.current !== null || slots.backup !== null)) throw new SaveError('conflict', 'Save already exists; explicit replacement required');
  const current = parseSave(snapshot);
  // Never promote structurally corrupt current data into the successful backup slot.
  const previous = previousValid === null ? { success: false as const } : previousValid ? { success: true as const, data: parseSave(previousValid) } : saveSchema.safeParse(slots.current);
  return { revision: slots.revision + 1, current, backup: previous.success ? previous.data : structuredClone(slots.backup) };
}
