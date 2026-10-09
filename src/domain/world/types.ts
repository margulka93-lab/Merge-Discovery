export type WorldRequirement =
  | { type: 'owned'; elementId: string }
  | { type: 'manifested'; manifestationId: string; sameZone: boolean; sameAnchor: boolean }
  | { type: 'habitat'; tag: 'water' | 'tree'; sameZone: boolean };
export interface WorldAnchor { id: string; x: number; y: number; depth: number; tags: string[] }
export interface WorldDefinition {
  id: string; version: string; coordinateSpace: { width: number; height: number }; baseArtKey: string;
  zones: { id: string; labelKey: string; anchors: WorldAnchor[] }[];
}
export interface ManifestationDefinition {
  id: string; sourceElementId: string; worldId: string; kind: 'terrain' | 'environment' | 'living_object';
  target: { zoneIds: string[]; anchorIds: string[]; slot: string };
  requirements: WorldRequirement[]; replaces: string[]; maxInstances: number;
  labelKey: string; observationKey: string; artKey: string;
  habitatTags: ('water' | 'tree')[];
}
export interface WorldAsset {
  id: string; width: number; height: number; pivot: { x: number; y: number };
  footprint: { width: number; height: number }; layer: number;
  hitBounds: { x: number; y: number; width: number; height: number };
  placeholder: boolean;
}
export interface WorldContent { definition: WorldDefinition; manifestations: ManifestationDefinition[]; assets: WorldAsset[]; locale: Record<string, string> }
export interface WorldIndex {
  content: WorldContent; manifestations: ReadonlyMap<string, ManifestationDefinition>;
  anchors: ReadonlyMap<string, WorldAnchor & { zoneId: string }>;
}
export interface Placement {
  id: string; manifestationId: string; zoneId: string; anchorId: string;
  kind: ManifestationDefinition['kind']; variantId: string; committedAt: string;
}
export interface WorldObservation { id: string; mutationId: string; sequence: number; manifestationId: string; zoneId: string; committedAt: string }
export interface WorldState {
  worldSchemaVersion: 1; definitionVersionSeen: string; profileGeneration: string; worldId: string;
  unlockedIslandIds: string[]; placements: Record<string, Placement>; observations: WorldObservation[];
  appliedCommands: Record<string, { payloadHash: string; mutationId: string }>;
}
export interface WorldCommand { commandId: string; manifestationId: string; anchorId: string }
export type WorldErrorCode = 'invalid_definition' | 'invalid_state' | 'invalid_action' | 'unavailable' | 'occupied' | 'limit' | 'command_conflict' | 'conflict' | 'persistence_failed' | 'recovery_required';
export class WorldError extends Error {
  constructor(readonly code: WorldErrorCode, message: string, readonly cause?: unknown) { super(message); this.name = 'WorldError'; }
}
