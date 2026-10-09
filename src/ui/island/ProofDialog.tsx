import { useEffect, useRef } from 'react';
/** Native modal supplies focus trapping, inert background, Escape, and focus return. */
export function ProofDialog({ title, close, children }: { title: string; close: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnTarget = useRef(document.activeElement as HTMLElement | null);
  useEffect(() => { const dialog = ref.current!; const trigger = returnTarget.current;
    if (!dialog.open) dialog.showModal();
    return () => { dialog.close(); if (trigger?.isConnected) trigger.focus({ preventScroll: true }); };
  }, []);
  return <dialog ref={ref} className="proof-dialog" aria-labelledby="proof-dialog-title" onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } }} onCancel={e => { e.preventDefault(); close(); }}>
    <header><h2 id="proof-dialog-title">{title}</h2><button autoFocus onClick={close} aria-label="Ferma la consultazione">Chiudi</button></header>
    <div className="proof-dialog-body">{children}</div>
  </dialog>;
}
