import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ApplicationSnapshot } from '../application/save/SaveApplication';

/** Optional world failures never block discovery. Only a committed, coherent safe projection supplies the cue. */
export function WorldEntry({ snapshot, busy }: { snapshot: ApplicationSnapshot; busy: boolean }) {
  const [result, setResult] = useState<{ snapshot: ApplicationSnapshot; available: boolean }>();
  useEffect(() => {
    let active = true;
    void import('./islandRuntime').then(async ({ islandRuntime }) => {
      const data = await islandRuntime().session.load();
      if (active) setResult({ snapshot, available: data.snapshot.revision === snapshot.revision && data.world.actions.length > 0 });
    }).catch(() => { if (active) setResult({ snapshot, available: false }); });
    return () => { active = false; };
  }, [snapshot]);
  return <Link className="world-entry" to="/island" aria-disabled={busy} onClick={e => { if (busy) e.preventDefault(); }}><span>Mondo</span>{result?.snapshot === snapshot && result.available && <small>Nuova possibilità nel Mondo</small>}</Link>;
}
