import type { ContentIndex } from '../../domain/model/types';
import { parseSave } from '../../domain/model/saveSchema';
import type { WorldCommand, WorldIndex } from '../../domain/world/types';
import { WorldError } from '../../domain/world/types';
import { emptyWorld, manifest } from '../../domain/world/rules';
import { parseWorldState } from '../../content/world/validate';
import type { WorldCommit, WorldRepository } from '../../persistence/WorldRepository';
import type { CommandLease } from './lease';
import { directLease } from './lease';
export interface WorldExpectations { saveRevision: number; worldRevision: number; generation: string; definitionVersion: string; contentVersion: string }
export class WorldActionApplication {
  constructor(readonly repository: WorldRepository, readonly index: WorldIndex, readonly canonical: ContentIndex,
    private clock = () => new Date().toISOString(), private lease: CommandLease = directLease) {}
  private async commit(request: WorldCommit) {
    try { return await this.repository.commit(request); }
    catch (cause) { if (cause instanceof WorldError) throw cause; throw new WorldError('persistence_failed', 'World was not saved; retry or export diagnostic data', cause); }
  }
  async load() {
    const context = await this.repository.context(this.index.content.definition.id);
    if (context.world.current === null && context.world.backup !== null) throw new WorldError('recovery_required', 'Current world missing; backup retained for explicit recovery');
    const state = context.world.current === null ? emptyWorld(this.index, context.generation) : parseWorldState(context.world.current, this.index, context.generation);
    return { context, state };
  }
  manifest(command: WorldCommand, expected: WorldExpectations) {
    return this.lease(async () => {
      const { context, state } = await this.load();
      if (context.generation !== expected.generation || context.save.revision !== expected.saveRevision || context.world.revision !== expected.worldRevision || expected.definitionVersion !== this.index.content.definition.version || expected.contentVersion !== this.canonical.content.manifest.contentVersion) throw new WorldError('conflict', 'Reload current knowledge and world before retry');
      const save = parseSave(context.save.current);
      if (save.contentVersionSeen !== expected.contentVersion) throw new WorldError('conflict', 'Canonical content requires reconciliation');
      const owned = new Set(Object.keys(save.discoveredElements).filter(id => this.canonical.elements.has(id)));
      const next = manifest(this.index, state, owned, command, this.clock());
      if (!next.changed) return { ...context, state, changed: false };
      const valid = parseWorldState(next.state, this.index, context.generation);
      const revision = await this.commit({ worldId: state.worldId, profileGeneration: context.generation, expectedSaveRevision: context.save.revision, expectedWorldRevision: context.world.revision, next: valid, previousValid: state });
      return { ...context, world: { revision, current: valid, backup: state }, state: valid, changed: true };
    });
  }
  recoverBackup(confirmed: boolean, expected: WorldExpectations) {
    return this.lease(async () => {
      if (!confirmed) throw new WorldError('recovery_required', 'Explicit backup confirmation required');
      const context = await this.repository.context(this.index.content.definition.id);
      if (context.generation !== expected.generation || context.save.revision !== expected.saveRevision || context.world.revision !== expected.worldRevision || expected.definitionVersion !== this.index.content.definition.version || expected.contentVersion !== this.canonical.content.manifest.contentVersion) throw new WorldError('conflict', 'Recovery context changed');
      const state = parseWorldState(context.world.backup, this.index, context.generation);
      const revision = await this.commit({ worldId: state.worldId, profileGeneration: context.generation, expectedSaveRevision: context.save.revision, expectedWorldRevision: context.world.revision, next: state, previousValid: null });
      return { state, revision };
    });
  }
}
