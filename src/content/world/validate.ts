import type { ContentIndex } from '../../domain/model/types';
import type { WorldIndex, WorldState } from '../../domain/world/types';
import { WorldError } from '../../domain/world/types';
import { worldContentSchema, worldStateSchema } from './schema';
import { emptyWorld, manifest, validTarget } from '../../domain/world/rules';

export function validateWorld(raw: unknown, canonical: ContentIndex): WorldIndex {
  const parsed = worldContentSchema.safeParse(raw);
  if (!parsed.success) throw new WorldError('invalid_definition', 'Invalid world schema', parsed.error);
  const content = parsed.data;
  const fail = (message: string): never => { throw new WorldError('invalid_definition', message); };
  const unique = (ids: string[]) => { if (new Set(ids).size !== ids.length) fail('Duplicate identity'); };
  unique(content.definition.zones.map(z => z.id)); unique(content.assets.map(a => a.id)); unique(content.manifestations.map(m => m.id));
  const anchors = new Map(content.definition.zones.flatMap(z => z.anchors.map(a => [a.id, { ...a, zoneId: z.id }] as const)));
  unique(content.definition.zones.flatMap(z => z.anchors.map(a => a.id)));
  const manifestations = new Map(content.manifestations.map(m => [m.id, m]));
  const assets = new Map(content.assets.map(a => [a.id, a]));
  if (!assets.has(content.definition.baseArtKey)) fail('Missing base art');
  for (const a of assets.values()) {
    if (a.pivot.x > a.width || a.pivot.y > a.height || a.hitBounds.x + a.hitBounds.width > a.width || a.hitBounds.y + a.hitBounds.height > a.height) fail('Invalid asset bounds');
  }
  for (const z of content.definition.zones) {
    if (!Object.hasOwn(content.locale, z.labelKey)) fail('Missing zone locale');
    for (const a of z.anchors) if (a.x > content.definition.coordinateSpace.width || a.y > content.definition.coordinateSpace.height) fail('Anchor outside scene');
  }
  for (const m of manifestations.values()) {
    if (!canonical.elements.has(m.sourceElementId) || !assets.has(m.artKey) || m.worldId !== content.definition.id || !Object.hasOwn(content.locale, m.labelKey) || !Object.hasOwn(content.locale, m.observationKey)) fail('Invalid manifestation reference');
    unique(m.target.anchorIds); unique(m.target.zoneIds); unique(m.replaces);
    for (const zone of m.target.zoneIds) if (!content.definition.zones.some(z => z.id === zone)) fail('Unknown zone');
    for (const id of m.target.anchorIds) { const a = anchors.get(id); if (!a || !m.target.zoneIds.includes(a.zoneId)) fail('Invalid target'); }
    for (const id of m.replaces) {
      const predecessor = manifestations.get(id);
      if (!predecessor || predecessor.target.slot !== m.target.slot || !m.requirements.some(r => r.type === 'manifested' && r.manifestationId === id && r.sameAnchor)) fail('Ambiguous replacement');
    }
    for (const r of m.requirements) {
      if (r.type === 'owned' && !canonical.elements.has(r.elementId)) fail('Unknown owned requirement');
      if (r.type === 'manifested' && !manifestations.has(r.manifestationId)) fail('Unknown manifestation requirement');
      if (r.type === 'habitat' && !content.manifestations.some(p => p.habitatTags.includes(r.tag))) fail('Unknown habitat');
    }
  }
  // Edges include derived habitat providers; cycles fail even if all essences are owned.
  const visit = (id: string, path: Set<string>, done: Set<string>) => {
    if (path.has(id)) fail('Prerequisite cycle'); if (done.has(id)) return;
    const next = new Set(path).add(id), m = manifestations.get(id)!;
    for (const r of m.requirements) {
      if (r.type === 'manifested') visit(r.manifestationId, next, done);
      if (r.type === 'habitat') for (const p of manifestations.values()) if (p.habitatTags.includes(r.tag)) visit(p.id, next, done);
    }
    done.add(id);
  };
  const done = new Set<string>(); for (const id of manifestations.keys()) visit(id, new Set(), done);
  const index: WorldIndex = { content, anchors, manifestations };
  // Bounded state search, not a greedy ordering: prove every authored mapping can occur.
  const owned = new Set(canonical.elements.keys()), reached = new Set<string>(), seen = new Set<string>();
  const queue = [emptyWorld(index, 'validation')];
  while (queue.length) {
    const state = queue.pop()!;
    for (const m of manifestations.values()) for (const a of m.target.anchorIds) {
      if (!validTarget(index, state, owned, m.id, a)) continue;
      reached.add(m.id);
      const next = manifest(index, state, owned, { commandId: `check_${state.observations.length}`, manifestationId: m.id, anchorId: a }, '2026-10-09T00:00:00.000Z').state;
      const key = JSON.stringify(Object.values(next.placements).map(p => [p.manifestationId, p.anchorId]).sort());
      if (!seen.has(key)) { seen.add(key); queue.push(next); }
    }
    if (reached.size === manifestations.size) break;
    if (seen.size > 50000) fail('World search budget exceeded');
  }
  if (reached.size !== manifestations.size) fail('Impossible manifestation mapping');
  return index;
}

export function parseWorldState(raw: unknown, index: WorldIndex, generation: string): WorldState {
  const parsed = worldStateSchema.safeParse(raw);
  if (!parsed.success) throw new WorldError('invalid_state', 'Invalid world snapshot', parsed.error);
  const s = parsed.data, d = index.content.definition;
  const fail = (): never => { throw new WorldError('invalid_state', 'Invalid world references or history'); };
  if (s.worldId !== d.id || s.definitionVersionSeen !== d.version || s.profileGeneration !== generation || s.unlockedIslandIds.length !== 1 || s.unlockedIslandIds[0] !== d.id) fail();
  const slots = new Set<string>();
  for (const [id, p] of Object.entries(s.placements)) {
    const m = index.manifestations.get(p.manifestationId), a = index.anchors.get(p.anchorId);
    if (!m || !a || id !== p.id || p.id !== m.id || p.zoneId !== a.zoneId || !m.target.anchorIds.includes(a.id) || p.kind !== m.kind || p.variantId !== m.artKey) fail();
    const slot = `${p.anchorId}:${m!.target.slot}`; if (slots.has(slot)) fail(); slots.add(slot);
  }
  const ids = new Set<string>();
  for (const [i, o] of s.observations.entries()) {
    if (o.sequence !== i + 1 || o.id !== o.mutationId || ids.has(o.id) || !index.manifestations.has(o.manifestationId) || !d.zones.some(z => z.id === o.zoneId)) fail(); ids.add(o.id);
  }
  if (Object.keys(s.appliedCommands).length !== s.observations.length) fail();
  const mutations = new Set<string>();
  for (const r of Object.values(s.appliedCommands)) {
    if (!ids.has(r.mutationId) || mutations.has(r.mutationId)) fail(); mutations.add(r.mutationId);
  }
  for (const p of Object.values(s.placements)) if (!s.observations.some(o => o.manifestationId === p.manifestationId && o.zoneId === p.zoneId && o.committedAt === p.committedAt)) fail();
  // Verify the journal and receipts describe a realizable authored history, including anchor.
  let reconstructed = emptyWorld(index, generation);
  const allOwned = new Set([...index.manifestations.values()].flatMap(m => [m.sourceElementId, ...m.requirements.filter(r => r.type === 'owned').map(r => r.elementId)]));
  for (const o of s.observations) {
    const receipt = Object.entries(s.appliedCommands).find(([, r]) => r.mutationId === o.mutationId);
    if (!receipt) fail();
    let payload: unknown;
    try { payload = JSON.parse(receipt![1].payloadHash); } catch { fail(); }
    if (!Array.isArray(payload) || payload.length !== 2 || payload[0] !== o.manifestationId || typeof payload[1] !== 'string' || index.anchors.get(payload[1])?.zoneId !== o.zoneId) fail();
    try { reconstructed = manifest(index, reconstructed, allOwned, { commandId: receipt![0], manifestationId: o.manifestationId, anchorId: (payload as string[])[1]! }, o.committedAt).state; }
    catch { fail(); }
  }
  if (JSON.stringify(reconstructed.observations) !== JSON.stringify(s.observations) || Object.keys(reconstructed.placements).length !== Object.keys(s.placements).length) fail();
  for (const [id, p] of Object.entries(reconstructed.placements)) if (JSON.stringify(p) !== JSON.stringify(s.placements[id])) fail();
  return s;
}
