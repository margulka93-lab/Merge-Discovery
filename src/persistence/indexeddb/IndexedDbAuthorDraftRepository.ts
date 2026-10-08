import Dexie, { type Table } from 'dexie';
import type { ContentPack } from '../../content/packs/model';
import type { AuthorDraftRepository } from '../AuthorDraftRepository';
export class AuthorDraftDatabase extends Dexie {
  drafts!: Table<{id:string;draft:ContentPack},string>;
  constructor(name = 'merge_discovery_authoring') { super(name); this.version(1).stores({drafts:'&id'}); }
}
export class IndexedDbAuthorDraftRepository implements AuthorDraftRepository {
  constructor(readonly database = new AuthorDraftDatabase()) {}
  async load() { return (await this.database.drafts.get('current'))?.draft; }
  async save(draft: ContentPack) { await this.database.drafts.put({id:'current',draft:structuredClone(draft)}); }
}
