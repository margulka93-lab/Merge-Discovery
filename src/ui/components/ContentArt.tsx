import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { ArtworkSource } from '../../application/packs/artwork';
const ArtContext = createContext<ReadonlyMap<string, string>>(new Map());
export function ContentArtProvider({ artwork, children }: { artwork: ArtworkSource[]; children: ReactNode }) {
  const [urls, setUrls] = useState<ReadonlyMap<string, string>>(new Map());
  useEffect(() => {
    const current = new Map<string, string>();
    for (const { key, bytes, mime } of artwork) current.set(key, URL.createObjectURL(new Blob([new Uint8Array(bytes).buffer], { type: mime })));
    let alive = true;
    queueMicrotask(() => { if (alive) setUrls(current); });
    return () => { alive = false; for (const url of current.values()) URL.revokeObjectURL(url); };
  }, [artwork]);
  return <ArtContext value={urls}>{children}</ArtContext>;
}
export const useContentArt = (key: string) => useContext(ArtContext).get(key);
