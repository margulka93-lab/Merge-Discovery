import type { ContentPack } from '../content/packs/model';
/** Author work-in-progress never belongs to PlayerSave or the active composition. */
export interface AuthorDraftRepository { load(): Promise<ContentPack | undefined>; save(draft: ContentPack): Promise<void> }
