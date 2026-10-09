import type { WorldCommand, WorldIndex, WorldState } from './types';
import { WorldError } from './types';

export function emptyWorld(index: WorldIndex, generation: string): WorldState {
  const d = index.content.definition;
  return { worldSchemaVersion: 1, definitionVersionSeen: d.version, profileGeneration: generation, worldId: d.id,
    unlockedIslandIds: [d.id], placements: {}, observations: [], appliedCommands: {} };
}
/** Current ownership/references gate every derived habitat, including backup recovery. Raw stays intact. */
export function legitimatePlacements(index: WorldIndex, state: WorldState, owned: ReadonlySet<string>) {
  let placements = Object.values(state.placements).filter(p => {
    const m = index.manifestations.get(p.manifestationId), a = index.anchors.get(p.anchorId);
    return m && a && owned.has(m.sourceElementId) && a.zoneId === p.zoneId && m.target.anchorIds.includes(a.id);
  });
  const history = state.observations.filter(o => owned.has(index.manifestations.get(o.manifestationId)?.sourceElementId ?? ''));
  let changed = true;
  while (changed) {
    const next = placements.filter(p => index.manifestations.get(p.manifestationId)!.requirements.every(r =>
      r.type === 'owned' ? owned.has(r.elementId) : r.type === 'habitat' ? placements.some(other => (!r.sameZone || other.zoneId === p.zoneId) && index.manifestations.get(other.manifestationId)?.habitatTags.includes(r.tag)) :
        history.some(o => o.manifestationId === r.manifestationId && (!r.sameZone || o.zoneId === p.zoneId))));
    changed = next.length !== placements.length; placements = next;
  }
  return placements;
}
export function validTarget(index: WorldIndex, state: WorldState, owned: ReadonlySet<string>, manifestationId: string, anchorId: string): boolean {
  const m = index.manifestations.get(manifestationId), a = index.anchors.get(anchorId);
  if (!m || !a || !owned.has(m.sourceElementId) || !m.target.zoneIds.includes(a.zoneId) || !m.target.anchorIds.includes(anchorId)) return false;
  const placements = Object.values(state.placements);
  if (placements.filter(p => p.manifestationId === m.id).length >= m.maxInstances) return false;
  if (placements.some(p => p.anchorId === anchorId && index.manifestations.get(p.manifestationId)?.target.slot === m.target.slot && !m.replaces.includes(p.manifestationId))) return false;
  return m.requirements.every(r => r.type === 'owned' ? owned.has(r.elementId) : legitimatePlacements(index, state, owned).some(p => {
    if (r.sameZone && p.zoneId !== a.zoneId) return false;
    if (r.type === 'manifested') return p.manifestationId === r.manifestationId && (!r.sameAnchor || p.anchorId === anchorId);
    return index.manifestations.get(p.manifestationId)?.habitatTags.includes(r.tag);
  }));
}
/** Deterministic monotone authored transformations. Never touches canonical knowledge or XP. */
export function manifest(index: WorldIndex, state: WorldState, owned: ReadonlySet<string>, command: WorldCommand, timestamp: string): { state: WorldState; changed: boolean } {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(command.commandId)) throw new WorldError('invalid_action', 'Invalid command identity');
  const payloadHash = JSON.stringify([command.manifestationId, command.anchorId]);
  const receipt = Object.hasOwn(state.appliedCommands, command.commandId) ? state.appliedCommands[command.commandId] : undefined;
  if (receipt) {
    if (receipt.payloadHash !== payloadHash) throw new WorldError('command_conflict', 'Command identity reused with different payload');
    return { state, changed: false };
  }
  const m = index.manifestations.get(command.manifestationId);
  const anchor = index.anchors.get(command.anchorId);
  if (!m || !anchor) throw new WorldError('invalid_action', 'Unknown action or location');
  if (!owned.has(m.sourceElementId)) throw new WorldError('unavailable', 'Essence not owned');
  if (Object.values(state.placements).some(p => p.manifestationId === m.id && p.anchorId === anchor.id)) return { state, changed: false };
  if (!validTarget(index, state, owned, m.id, anchor.id)) throw new WorldError('unavailable', 'Action unavailable at this location');
  const next = structuredClone(state);
  for (const [id, p] of Object.entries(next.placements)) {
    if (p.anchorId === anchor.id && m.replaces.includes(p.manifestationId)) delete next.placements[id];
  }
  const sequence = next.observations.length + 1, mutationId = `mutation_${sequence}`;
  next.placements[m.id] = { id: m.id, manifestationId: m.id, zoneId: anchor.zoneId, anchorId: anchor.id, kind: m.kind, variantId: m.artKey, committedAt: timestamp };
  next.observations.push({ id: mutationId, mutationId, sequence, manifestationId: m.id, zoneId: anchor.zoneId, committedAt: timestamp });
  next.appliedCommands[command.commandId] = { payloadHash, mutationId };
  return { state: next, changed: true };
}
