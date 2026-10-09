import type { SaveApplication } from '../save/SaveApplication';
import { createCatalogProjector } from '../catalog';
import { projectAtlas } from '../atlas/projection';
import { laboratoryModel, laboratoryReaction } from '../laboratory';
import { experiment } from './experiment';
import { projectWorld } from './projection';
import type { WorldActionApplication } from './WorldActionApplication';
import { WorldError } from '../../domain/world/types';

/** Small application orchestration for the feasibility route, using the existing save engine. */
export class ProofSession {
  private catalog;
  constructor(readonly save: SaveApplication, readonly world: WorldActionApplication) {
    this.catalog = createCatalogProjector(save.index);
  }
  async load() {
    // A world context is atomic across stores. Never publish knowledge from a different revision.
    const snapshot = await this.save.load(), loaded = await this.world.load();
    if (snapshot.revision !== loaded.context.save.revision) throw new WorldError('conflict', 'Il progresso è cambiato in un’altra scheda. Ricarica.');
    const catalog = this.catalog(snapshot);
    return { snapshot, catalog, model: laboratoryModel(snapshot, this.save.index),
      world: projectWorld(this.world.index, catalog, loaded.state, loaded.context.generation),
      atlas: projectAtlas(this.save.index, this.world.index, snapshot, loaded.state, loaded.context.generation),
      expected: { saveRevision: snapshot.revision, worldRevision: loaded.context.world.revision,
        generation: loaded.context.generation, definitionVersion: this.world.index.content.definition.version,
        contentVersion: this.save.index.content.manifest.contentVersion } };
  }
  async combine(a: string, b: string) {
    const result = await experiment(this.save, a, b);
    return { data: await this.load(), reaction: laboratoryReaction(result.resolution, result.snapshot, this.save.index), replay: result.replay };
  }
  async manifest(id: string, anchorId: string, expected: Awaited<ReturnType<ProofSession['load']>>['expected']) {
    await this.world.manifest({ commandId: crypto.randomUUID(), manifestationId: id, anchorId }, expected);
    return this.load();
  }
}
export type ProofData = Awaited<ReturnType<ProofSession['load']>>;
