import { useEffect, useState } from 'react';
import { PACK_LIMITS, type ContentPackApplication, type PreparedPack, type PackSnapshot } from '../../application/packs/ContentPackApplication';
import './content.css';
export function downloadBytes(bytes: Uint8Array, name: string, type = 'application/zip') {
  const url = URL.createObjectURL(new Blob([new Uint8Array(bytes).buffer], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export const authorError = (cause: unknown) => cause instanceof Error ? cause.message : 'Operazione non riuscita; contenuti e progresso precedenti conservati.';
export function PackReport({ prepared }: { prepared: PreparedPack }) {
  const r = prepared.report;
  return <section className="pack-report" aria-label="Anteprima pacchetto">
    <h3>{r.packId} · {r.version}</h3>
    <p>{r.addedElements} elementi e {r.addedRecipes} ricette aggiunti · {r.updated.length} definizioni aggiornate · nessuna rimozione.</p>
    <p><strong>{r.reachable}/{r.total} raggiungibili</strong> · profondità {r.depth} · contenuto {r.contentVersion}.</p>
    <p>XP, scoperte e ricette conosciute conservati. Le nuove scoperte richiedono ancora esperimenti.</p>
    <p>{r.canonicalApproval}. Un risultato raggiungibile non certifica intuitività o qualità delle ricette.</p>
    {r.warnings.length > 0 && <ul>{r.warnings.map(w => <li key={w}>{w}</li>)}</ul>}
    <details><summary>Percorso, colli di bottiglia e terminali</summary>
      <p>Terminali: {r.terminal.join(', ') || 'nessuno'}</p>
      <p>Catene lunghe: {r.longChains.map(c => `${c.id} (${c.depth})`).join(', ') || 'nessuna'}</p>
      <p>Ingredienti più usati: {r.ingredientUse.map(c => `${c.id} (${c.uses})`).join(', ')}</p>
      <p>Risultati con alternative: {r.alternateResults.join(', ') || 'nessuno'}</p>
      <ol>{r.checkpoints.map((c,i) => <li key={i}>Passaggio {c.depth}: {c.discovered} scoperte · {c.xp} XP · Set rivelati: {c.revealedSetIds.join(', ')}</li>)}</ol>
    </details>
    <button onClick={() => downloadBytes(new TextEncoder().encode(JSON.stringify(r,null,2)),`${r.packId}-report.json`,'application/json')}>Esporta report</button>
  </section>;
}
export function ContentImportPanel({ application, busy, beginOperation, safe }: {
  application: ContentPackApplication; busy: boolean; beginOperation: () => (() => void) | undefined; safe: () => boolean;
}) {
  const [installed, setInstalled] = useState<PackSnapshot>(), [prepared, setPrepared] = useState<PreparedPack>();
  const [working, setWorking] = useState(false), [error, setError] = useState('');
  useEffect(() => { let alive = true; void application.load().then(value => { if (alive) setInstalled(value); }, cause => { if (alive) setError(authorError(cause)); }); return () => { alive = false; }; }, [application]);
  const run = async (action: () => Promise<void>, activate = false) => {
    if (working || busy) return;
    if (activate && (!safe() || !navigator.locks)) { setError('Termina prima la reazione corrente. L’attivazione richiede un browser con Web Locks.'); return; }
    const release = beginOperation(); if (!release) return;
    setWorking(true); setError('');
    try { await action(); } catch (cause) { setError(authorError(cause)); } finally { setWorking(false); release(); }
  };
  const disabled = working || busy;
  return <section className="content-author" aria-label="Pacchetti di contenuti" aria-busy={working}>
    <h3>Pacchetti di contenuti</h3>
    <p>Installazione locale su questo browser. Il ZIP aggiunge definizioni e immagini; non importa una partita e non pubblica contenuti per altri dispositivi.</p>
    <label>Pacchetto ZIP<input type="file" accept=".zip,application/zip" disabled={disabled} onChange={e => {
      const file = e.target.files?.[0]; setPrepared(undefined); if (!file) return;
      void run(async () => { if (file.size > PACK_LIMITS.zipBytes) throw new Error('ZIP oltre 16 MiB.'); setPrepared(await application.preview(new Uint8Array(await file.arrayBuffer()))); });
    }} /></label>
    <button disabled={disabled} onClick={() => void run(async () => downloadBytes(await application.sample(),'studio-sample.zip'))}>Scarica pacchetto di esempio</button>
    {error && <p role="alert" className="author-error">{error}</p>}
    {prepared && <><PackReport prepared={prepared} /><button className="combine-button" disabled={disabled} onClick={() => void run(async () => { await application.install(prepared); window.location.reload(); },true)}>Installa pacchetto e riavvia</button></>}
    <h4>Installati</h4>
    {installed?.packs.length ? <ul>{installed.packs.map(pack => <li key={pack.manifest.packId}>
      <strong>{pack.manifest.title}</strong> · {pack.manifest.version} · {pack.manifest.reviewStatus}
      <p>Dipendenze: {pack.manifest.dependencies.map(d => `${d.packId} ${d.version}`).join(', ') || 'nessuna'}</p>
      <button disabled={disabled} onClick={() => void run(async () => downloadBytes(await application.export(pack.manifest.packId),`${pack.manifest.packId}.zip`))}>Esporta {pack.manifest.packId}</button>
      <button disabled={disabled} onClick={() => void run(async () => { await application.disable(pack.manifest.packId); window.location.reload(); },true)}>Disattiva {pack.manifest.packId}</button>
    </li>)}</ul> : <p>Nessun pacchetto installato. Seed canonico attivo.</p>}
    {installed?.previous && <button disabled={disabled} onClick={() => void run(async () => { await application.rollback(); window.location.reload(); },true)}>Ripristina composizione precedente</button>}
    <p>Disattivazione e rollback sono bloccati quando eliminerebbero progresso o dipendenze. Le modifiche al seed shipped richiedono una migrazione dedicata.</p>
  </section>;
}
