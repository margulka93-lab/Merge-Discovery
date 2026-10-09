import type { ContentIndex } from '../../domain/model/types';
import type { WorldIndex, WorldState } from '../../domain/world/types';
import { createCatalogProjector } from '../catalog';
import { featureDisclosure } from '../disclosure';
import type { ApplicationSnapshot } from '../save/SaveApplication';
import { projectWorld } from '../island/projection';
/** Foundation DTO only; no book UI or new taxonomy. Gate remains existing disclosure. */
export function projectAtlas(canonical: ContentIndex, index: WorldIndex, snapshot: ApplicationSnapshot, state: WorldState, generation: string) {
  if (!featureDisclosure(snapshot, canonical).collection) return undefined;
  const catalog = createCatalogProjector(canonical)(snapshot), world = projectWorld(index, catalog, state, generation);
  return { knowledge: catalog, chronicle: world.observations, locations: world.entities };
}
