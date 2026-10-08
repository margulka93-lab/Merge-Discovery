import type { ContentPack } from '../../content/packs/model';
export interface ArtworkSource { key: string; bytes: Uint8Array; mime: string }
export function artworkSources(packs: ContentPack[]): ArtworkSource[] {
  return packs.flatMap(pack => Object.entries(pack.assets).map(([key, bytes]) => ({ key, bytes, mime: pack.manifest.assets[key]!.mime })));
}
