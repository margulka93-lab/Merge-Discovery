import type { ContentIndex, ResolutionResult } from '../../domain/model/types';
import type { PlayerSave } from '../../domain/model/save';
import { exportSchema, PRODUCT_ID, SAVE_SCHEMA_VERSION } from '../../domain/model/saveSchema';
import { resolve } from '../../domain/resolver/resolve';
import { levelForXp } from '../../domain/progression/requirements';
import { visibleCollections, visibleSets } from '../../domain/visibility/project';
import type { SaveRepository, SaveSlots } from '../../persistence/SaveRepository';
import { reconcileContent, type SaveNotice, validateActiveReferences } from '../updates/reconcile';
import { SaveError } from './errors';
import { migrateSave, type SaveMigration } from './migrations';
import { createSave, engineState, projectResolution } from './projection';

export interface ApplicationSnapshot {
  save: PlayerSave; revision: number; notices: SaveNotice[]; newPossibilityElementIds: string[];
  derived: { level: number; sets: ReturnType<typeof visibleSets>; collections: ReturnType<typeof visibleCollections> };
}
export interface ImportPreview {
  readonly schemaVersion: number; readonly contentVersion: string;
  readonly discoveries: number; readonly xp: number; readonly notices: readonly SaveNotice[];
}
export class SaveApplication {
  private tail: Promise<unknown> = Promise.resolve();
  private previews = new WeakMap<ImportPreview, { save: PlayerSave; revision: number; previousValid: PlayerSave | null; notices: SaveNotice[]; newPossibilityElementIds: string[] }>();
  constructor(readonly repository: SaveRepository, readonly index: ContentIndex,
    private readonly clock: () => string = () => new Date().toISOString(),
    private readonly migrations: readonly SaveMigration[] = []) {}

  private serial<T>(action: () => Promise<T>): Promise<T> {
    const result = this.tail.then(action); this.tail = result.catch(() => undefined); return result;
  }
  private normalized(raw: unknown) {
    if (this.index.content.manifest.minimumSaveSchemaVersion > SAVE_SCHEMA_VERSION) throw new SaveError('unsupported_schema', 'Content requires a newer save schema');
    const previousValidSave = migrateSave(raw, this.migrations);
    return { ...reconcileContent(previousValidSave, this.index), previousValidSave };
  }
  private previousValid(raw: unknown): PlayerSave | null {
    try { return this.normalized(raw).previousValidSave; }
    catch { return null; }
  }
  private snapshot(save: PlayerSave, revision: number, notices: SaveNotice[] = [], newPossibilityElementIds: string[] = []): ApplicationSnapshot {
    const state = engineState(save, this.index);
    return { save: structuredClone(save), revision, notices: [...notices], newPossibilityElementIds: [...newPossibilityElementIds], derived: {
      level: levelForXp(save.xp, this.index.content.progression.levelThresholds), sets: visibleSets(state, this.index), collections: visibleCollections(state, this.index),
    } };
  }
  private async loaded(slots: SaveSlots): Promise<ApplicationSnapshot> {
    if (slots.current === null) throw new SaveError(slots.backup === null ? 'not_found' : 'recovery_failed', 'Current save missing');
    let normalized: ReturnType<SaveApplication['normalized']>;
    try { normalized = this.normalized(slots.current); }
    catch (cause) { throw new SaveError('recovery_failed', 'Current save cannot be read; raw data and backup retained', cause); }
    let revision = slots.revision;
    if (normalized.changed || JSON.stringify(slots.current) !== JSON.stringify(normalized.save)) {
      normalized.save.updatedAt = this.clock();
      revision = await this.repository.persist(normalized.save, revision, normalized.previousValidSave);
    }
    return this.snapshot(normalized.save, revision, normalized.notices, normalized.newPossibilityElementIds);
  }
  load(): Promise<ApplicationSnapshot> { return this.serial(async () => this.loaded(await this.repository.load())); }
  /** Creates only when both slots are absent; never resets corruption implicitly. */
  start(): Promise<ApplicationSnapshot> {
    return this.serial(async () => {
      const slots = await this.repository.load();
      if (slots.current !== null || slots.backup !== null) return this.loaded(slots);
      const save = createSave(this.index, this.clock());
      let revision: number;
      try { revision = await this.repository.createNew(save, slots.revision); }
      catch (error) {
        if (error instanceof SaveError && error.code === 'conflict') return this.loaded(await this.repository.load());
        throw error;
      }
      return this.snapshot(save, revision);
    });
  }
  combine(a: string, b: string): Promise<{ resolution: ResolutionResult; snapshot: ApplicationSnapshot }> {
    return this.serial(async () => {
      const slots = await this.repository.load();
      if (slots.current === null) throw new SaveError('not_found', 'No current save');
      // One write for reconciliation + reaction together: no intermediate combine snapshot.
      const normalized = this.normalized(slots.current);
      const resolution = resolve(a, b, engineState(normalized.save, this.index), this.index);
      const save = projectResolution(normalized.save, resolution, this.clock(), this.index);
      validateActiveReferences(save, this.index);
      const revision = await this.repository.persist(save, slots.revision, normalized.previousValidSave);
      return { resolution, snapshot: this.snapshot(save, revision, normalized.notices, normalized.newPossibilityElementIds) };
    });
  }
  exportSave(): Promise<string> {
    return this.serial(async () => {
      const current = await this.repository.export();
      if (current === null) throw new SaveError('not_found', 'No save to export');
      const { save } = this.normalized(current);
      return JSON.stringify({ product: PRODUCT_ID, saveSchemaVersion: save.saveSchemaVersion, contentVersionSeen: save.contentVersionSeen, payload: save }, null, 2);
    });
  }
  previewImport(json: string): Promise<ImportPreview> {
    return this.serial(async () => {
      let raw: unknown;
      try { raw = JSON.parse(json); } catch (cause) { throw new SaveError('invalid_json', 'Invalid JSON', cause); }
      const parsed = exportSchema.safeParse(raw);
      if (!parsed.success) throw new SaveError('invalid_export', 'Invalid product export', parsed.error);
      const envelope = parsed.data;
      const payload = envelope.payload;
      if (!payload || typeof payload !== 'object' || !('saveSchemaVersion' in payload) || !('contentVersionSeen' in payload) ||
        payload.saveSchemaVersion !== envelope.saveSchemaVersion || payload.contentVersionSeen !== envelope.contentVersionSeen) throw new SaveError('invalid_export', 'Envelope/payload version mismatch');
      const { save, notices, newPossibilityElementIds } = this.normalized(payload);
      const slots = await this.repository.load();
      const preview: ImportPreview = Object.freeze({ schemaVersion: save.saveSchemaVersion, contentVersion: save.contentVersionSeen,
        discoveries: Object.keys(save.discoveredElements).length, xp: save.xp, notices: Object.freeze([...notices]) });
      this.previews.set(preview, { save, revision: slots.revision, previousValid: this.previousValid(slots.current), notices, newPossibilityElementIds });
      return preview;
    });
  }
  confirmImport(preview: ImportPreview, confirmed: boolean): Promise<ApplicationSnapshot> {
    return this.serial(async () => {
      const pending = this.previews.get(preview);
      if (!confirmed || !pending) throw new SaveError('confirmation_required', 'Import requires a genuine preview and explicit confirmation');
      const save = { ...pending.save, updatedAt: this.clock() };
      const revision = await this.repository.import(save, pending.revision, pending.previousValid);
      this.previews.delete(preview);
      return this.snapshot(save, revision, pending.notices, pending.newPossibilityElementIds);
    });
  }
  recoverBackup(confirmed: boolean): Promise<ApplicationSnapshot> {
    return this.serial(async () => {
      if (!confirmed) throw new SaveError('confirmation_required', 'Backup replacement requires confirmation');
      const slots = await this.repository.load();
      let save: PlayerSave;
      try { save = this.normalized(slots.backup).save; }
      catch (cause) { throw new SaveError('recovery_failed', 'No valid previous backup', cause); }
      save.updatedAt = this.clock();
      const revision = await this.repository.persist(save, slots.revision, this.previousValid(slots.current));
      return this.snapshot(save, revision);
    });
  }
  exportRawRecovery(): Promise<string> {
    return this.serial(async () => JSON.stringify({ product: PRODUCT_ID, recoveryData: await this.repository.load() }, null, 2));
  }
  clear(confirmed: boolean): Promise<void> {
    return this.serial(async () => {
      if (!confirmed) throw new SaveError('confirmation_required', 'Clear requires explicit confirmation');
      const slots = await this.repository.load(); await this.repository.clear(slots.revision);
    });
  }
}
