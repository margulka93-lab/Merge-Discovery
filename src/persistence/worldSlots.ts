import { worldStateSchema } from '../content/world/schema';
import { WorldError } from '../domain/world/types';
import type { WorldCommit, WorldContext, WorldRow, WorldSlots } from './WorldRepository';
export function emptyWorldSlots(): WorldSlots { return { revision: 0, current: null, backup: null }; }
export function activeSlots(row: WorldRow | undefined, generation: string): WorldSlots {
  if (!row || row.generation !== generation) return emptyWorldSlots();
  if (!Number.isSafeInteger(row.revision) || row.revision < 0 || !Object.hasOwn(row, 'current') || !Object.hasOwn(row, 'backup')) throw new WorldError('recovery_required', 'Invalid world storage record');
  return { revision: row.revision, current: structuredClone(row.current), backup: structuredClone(row.backup) };
}
export function nextWorldRow(context: WorldContext, row: WorldRow | undefined, request: WorldCommit): WorldRow {
  const { generation, save, world } = context;
  if (generation !== request.profileGeneration || save.revision !== request.expectedSaveRevision || world.revision !== request.expectedWorldRevision || save.current === null) throw new WorldError('conflict', 'Save, generation or world changed');
  const parsed = worldStateSchema.safeParse(request.next);
  if (!parsed.success || request.next.worldId !== request.worldId || request.next.profileGeneration !== generation) throw new WorldError('invalid_state', 'Invalid world commit', parsed.error);
  const prior = request.previousValid === null ? null : worldStateSchema.safeParse(request.previousValid ?? world.current);
  const retired = row && row.generation !== generation ? { generation: row.generation, slots: { revision: row.revision, current: row.current, backup: row.backup } } : row?.retired;
  return { id: request.worldId, generation, revision: world.revision + 1, current: structuredClone(parsed.data),
    backup: prior?.success ? structuredClone(prior.data) : structuredClone(world.backup), ...(retired ? { retired: structuredClone(retired) } : {}) };
}
