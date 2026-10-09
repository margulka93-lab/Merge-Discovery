import type { CatalogModel } from '../catalog';
import type { WorldIndex, WorldState } from '../../domain/world/types';
import { legitimatePlacements, validTarget } from '../../domain/world/rules';
export interface SafeWorldProjection {
  entities: { id: string; elementId: string; name: string; artKey: string; anchorId: string; zone: string; x: number; y: number; depth: number }[];
  actions: { id: string; elementId: string; name: string; targets: { id: string; zone: string; x: number; y: number }[] }[];
  observations: { id: string; sequence: number; text: string; zone: string; committedAt: string }[];
}
/** No raw mapping/requirements reach UI. Current owned catalog is the only knowledge input. */
export function projectWorld(index: WorldIndex, catalog: CatalogModel, state: WorldState, generation: string): SafeWorldProjection {
  const empty: SafeWorldProjection = { entities: [], actions: [], observations: [] };
  if (state.profileGeneration !== generation || state.definitionVersionSeen !== index.content.definition.version || state.worldId !== index.content.definition.id) return empty;
  const owned = new Map(catalog.elements.map(e => [e.id, e]));
  const placements = legitimatePlacements(index, state, new Set(owned.keys()));
  const zoneName = (id: string) => index.content.locale[index.content.definition.zones.find(z => z.id === id)?.labelKey ?? ''] ?? '';
  const entities = placements.map(p => {
    const m = index.manifestations.get(p.manifestationId)!, a = index.anchors.get(p.anchorId)!;
    return { id: p.id, elementId: m.sourceElementId, name: owned.get(m.sourceElementId)!.name, artKey: m.artKey, anchorId: a.id, zone: zoneName(a.zoneId), x: a.x, y: a.y, depth: a.depth };
  }).sort((a, b) => a.depth - b.depth || a.id.localeCompare(b.id));
  const actions = [...index.manifestations.values()].filter(m => owned.has(m.sourceElementId)).map(m => ({ id: m.id, elementId: m.sourceElementId, name: index.content.locale[m.labelKey]!,
    targets: m.target.anchorIds.filter(id => validTarget(index, state, new Set(owned.keys()), m.id, id)).map(id => { const a = index.anchors.get(id)!; return { id, zone: zoneName(a.zoneId), x: a.x, y: a.y }; }),
  })).filter(a => a.targets.length);
  const observations = state.observations.filter(o => owned.has(index.manifestations.get(o.manifestationId)?.sourceElementId ?? '') && !!zoneName(o.zoneId)).map(o => ({ id: o.id, sequence: o.sequence, text: index.content.locale[index.manifestations.get(o.manifestationId)!.observationKey]!, zone: zoneName(o.zoneId), committedAt: o.committedAt }));
  return { entities, actions, observations };
}
