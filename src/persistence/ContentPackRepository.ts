import type { ContentPack } from '../content/packs/model';
export interface PackSnapshot { revision: number; packs: ContentPack[]; previous?: ContentPack[] }
export interface ContentPackRepository {
  load(): Promise<PackSnapshot>;
  activate(packs: ContentPack[], expectedRevision: number): Promise<PackSnapshot>;
}
