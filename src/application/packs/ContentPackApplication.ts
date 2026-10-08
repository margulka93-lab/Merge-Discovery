import type { ContentPackage } from '../../domain/model/types';
import type { ContentPackRepository, PackSnapshot } from '../../persistence/ContentPackRepository';
import type { SaveRepository } from '../../persistence/SaveRepository';
import { parseSave } from '../../domain/model/saveSchema';
import { readPack, writePack } from '../../content/packs/archive';
import { composePacks } from '../../content/packs/compose';
import { PackError } from '../../content/packs/model';
import { reconcileContent } from '../updates/reconcile';
import { previewPack } from './preview';
import { directLease, type CommandLease } from '../save/SaveApplication';
import type { AuthorDraftRepository } from '../../persistence/AuthorDraftRepository';
export type PackPreview = ReturnType<typeof previewPack>;
export interface PreparedPack { report: PackPreview['report'] }
export type { PackSnapshot } from '../../persistence/ContentPackRepository';
export { PACK_LIMITS } from '../../content/packs/model';
export class ContentPackApplication {
  private previews = new WeakMap<PreparedPack, { preview: PackPreview; contentRevision: number; saveRevision: number }>();
  private studioApplication?: Promise<import('./ContentStudioApplication').ContentStudioApplication>;
  constructor(private seed: ContentPackage, private repository: ContentPackRepository, private saveRepository: SaveRepository,
    private verifyImage: (bytes: Uint8Array, mime: string) => Promise<void> = async () => {},
    private lease: CommandLease = directLease,
    private simulate: (...args: Parameters<typeof previewPack>) => Promise<PackPreview> = async (...args) => previewPack(...args),
    private drafts?:AuthorDraftRepository) {}
  async preview(bytes: Uint8Array): Promise<PreparedPack> {
    const candidate = await readPack(bytes), installed = await this.repository.load(), save = await this.saveRepository.load();
    for (const [key, data] of Object.entries(candidate.assets)) await this.verifyImage(data, candidate.manifest.assets[key]!.mime);
    const preview = await this.simulate(this.seed, installed.packs, candidate, save.current === null ? undefined : parseSave(save.current));
    const prepared: PreparedPack = { report: structuredClone(preview.report) };
    this.previews.set(prepared, { preview, contentRevision: installed.revision, saveRevision: save.revision });
    return prepared;
  }
  async install(prepared: PreparedPack) {
    return this.lease(async () => {
    const staged = this.previews.get(prepared);
    if (!staged) throw new PackError(['Anteprima scaduta. Valida nuovamente il pacchetto.']);
    const save = await this.saveRepository.load();
    if (save.revision !== staged.saveRevision) throw new PackError(['Il progresso è cambiato. Ricalcola l’anteprima prima di installare.']);
    // PlayerSave is not written: reconciliation happens on the next safe boot, with no rewards.
    const committed = await this.repository.activate(staged.preview.packs, staged.contentRevision);
    this.previews.delete(prepared); return committed;
    });
  }
  async load() { return this.repository.load(); }
  async sample() { const { samplePack } = await import('../../content/packs/sample'); return writePack(await samplePack()); }
  studio() {
    this.studioApplication ??= import('./ContentStudioApplication').then(({ContentStudioApplication}) => new ContentStudioApplication(this,this.seed,this.repository,this.drafts,this.verifyImage));
    return this.studioApplication;
  }
  async export(packId: string) {
    const pack = (await this.repository.load()).packs.find(p => p.manifest.packId === packId);
    if (!pack) throw new PackError(['Pacchetto non installato.']); return writePack(pack);
  }
  private async activateOlder(packs: PackSnapshot['packs'], revision: number) {
    const composed = composePacks(this.seed, packs), slots = await this.saveRepository.load();
    if (slots.current !== null) {
      const old = parseSave(slots.current), reconciled = reconcileContent(old, composed.index);
      // Reject deactivation that would quarantine progress, history, earned completion or art-owned sets.
      if (JSON.stringify(reconciled.save.quarantine) !== JSON.stringify(old.quarantine) || Object.keys(reconciled.save.discoveredElements).length !== Object.keys(old.discoveredElements).length) throw new PackError(['Il salvataggio usa questi contenuti: disattivazione/rollback non sicuri.']);
    }
    return this.repository.activate(packs, revision);
  }
  async rollback() {
    return this.lease(async () => {
    const snapshot = await this.repository.load(); if (!snapshot.previous) throw new PackError(['Nessuno snapshot precedente.']);
    return this.activateOlder(snapshot.previous, snapshot.revision);
    });
  }
  async disable(packId: string) {
    return this.lease(async () => {
    const snapshot = await this.repository.load();
    return this.activateOlder(snapshot.packs.filter(p => p.manifest.packId !== packId), snapshot.revision);
    });
  }
}
