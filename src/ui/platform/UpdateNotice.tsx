import { useEffect, useRef } from 'react';
import type { UpdateState } from '../../platform/pwa/updates';
export function UpdateNotice({ state, accept, defer }: { state: UpdateState; accept: () => void; defer: () => void }) {
  const live = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!state.available) { if (live.current) live.current.textContent = ''; return; }
    // Populate an already mounted live region, including updates found during initial boot.
    const timer = setTimeout(() => { if (live.current) live.current.textContent = 'Aggiornamento disponibile'; }, 0);
    return () => clearTimeout(timer);
  }, [state.available]);
  return <>
    <div ref={live} className="sr-only" role="status" aria-live="polite" aria-atomic="true" />
    {state.available && !state.deferred && <aside className="update-notice" aria-label="Aggiornamento disponibile">
      <p><strong>Aggiornamento disponibile</strong></p>
      <p>{state.applying ? 'Apertura della nuova versione…' : state.safe ? 'Il tuo progresso resta sul dispositivo.' : 'Puoi aggiornare dopo aver concluso l’operazione o il risultato nel Laboratorio.'}</p>
      {state.safe && <button disabled={state.applying} onClick={accept}>Aggiorna ora</button>}
      <button disabled={state.applying} onClick={defer}>Più tardi</button>
    </aside>}
  </>;
}
