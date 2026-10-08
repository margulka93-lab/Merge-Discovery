import Dexie, { type Table } from 'dexie';
import type { ContentPackRepository, PackSnapshot } from '../ContentPackRepository';
import { PackError } from '../../content/packs/model';
type Row = PackSnapshot & { id: 'active' };
/** A separate adapter preserves the shipped save DB schema. Definitions, bytes and both
 * active/previous composition pointers are one IndexedDB atomic transaction. */
export class ContentPackDatabase extends Dexie {
  compositions!: Table<Row, string>;
  constructor(name = 'merge_discovery_content') { super(name); this.version(1).stores({ compositions: '&id' }); }
}
export class IndexedDbContentPackRepository implements ContentPackRepository {
  constructor(readonly database = new ContentPackDatabase()) {}
  async load(): Promise<PackSnapshot> {
    const row = await this.database.compositions.get('active');
    if (!row) return { revision: 0, packs: [] };
    if (!Number.isSafeInteger(row.revision) || row.revision < 0 || !Array.isArray(row.packs)) throw new PackError(['Snapshot contenuti danneggiato: dati precedenti conservati.']);
    return { revision: row.revision, packs: row.packs, previous: row.previous };
  }
  async activate(packs: PackSnapshot['packs'], expected: number) {
    return this.database.transaction('rw', this.database.compositions, async () => {
      const old = await this.load();
      if (old.revision !== expected) throw new PackError(['I contenuti sono cambiati in un’altra scheda. Ricarica e ripeti l’anteprima.']);
      const next: PackSnapshot = { revision: old.revision + 1, packs: structuredClone(packs), previous: old.packs };
      await this.database.compositions.put({ ...next, id: 'active' }); return next;
    });
  }
}
