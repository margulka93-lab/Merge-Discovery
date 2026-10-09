import { z } from 'zod';
const id = z.string().regex(/^[a-z][a-z0-9_]*$/), finite = z.number().finite(), positive = finite.positive();
const point = z.object({ x: finite.nonnegative(), y: finite.nonnegative() }).strict();
const size = z.object({ width: positive, height: positive }).strict();
const requirement = z.discriminatedUnion('type', [
  z.object({ type: z.literal('owned'), elementId: id }).strict(),
  z.object({ type: z.literal('manifested'), manifestationId: id, sameZone: z.boolean(), sameAnchor: z.boolean() }).strict(),
  z.object({ type: z.literal('habitat'), tag: z.enum(['water', 'tree']), sameZone: z.boolean() }).strict(),
]);
const kind = z.enum(['terrain', 'environment', 'living_object']);
export const worldContentSchema = z.object({
  definition: z.object({ id, version: z.string().min(1), coordinateSpace: size, baseArtKey: id,
    zones: z.array(z.object({ id, labelKey: z.string().min(1), anchors: z.array(z.object({ id, x: finite.nonnegative(), y: finite.nonnegative(), depth: finite, tags: z.array(id) }).strict()).min(1) }).strict()).min(1) }).strict(),
  manifestations: z.array(z.object({ id, sourceElementId: id, worldId: id, kind,
    target: z.object({ zoneIds: z.array(id).min(1), anchorIds: z.array(id).min(2), slot: id }).strict(),
    requirements: z.array(requirement), replaces: z.array(id), maxInstances: z.literal(1), labelKey: z.string().min(1), observationKey: z.string().min(1), artKey: id,
    habitatTags: z.array(z.enum(['water', 'tree'])) }).strict()).max(11),
  assets: z.array(z.object({ id, width: positive, height: positive, pivot: point, footprint: size, layer: finite,
    hitBounds: z.object({ x: finite.nonnegative(), y: finite.nonnegative(), width: positive, height: positive }).strict(), placeholder: z.boolean() }).strict()).min(1),
  locale: z.record(z.string(), z.string().min(1)),
}).strict();
export const worldStateSchema = z.object({ worldSchemaVersion: z.literal(1), definitionVersionSeen: z.string().min(1), profileGeneration: z.string().min(1), worldId: id,
  unlockedIslandIds: z.array(id).max(1),
  placements: z.record(id, z.object({ id, manifestationId: id, zoneId: id, anchorId: id, kind, variantId: id, committedAt: z.iso.datetime() }).strict()),
  observations: z.array(z.object({ id, mutationId: id, sequence: z.number().int().positive(), manifestationId: id, zoneId: id, committedAt: z.iso.datetime() }).strict()).max(11),
  appliedCommands: z.record(z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/), z.object({ payloadHash: z.string().max(512), mutationId: id }).strict()),
}).strict();
