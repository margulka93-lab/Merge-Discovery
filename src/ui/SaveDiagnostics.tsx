import { useEffect, useState } from 'react';
import type { ApplicationSnapshot, ImportPreview, SaveApplication } from '../application/save/SaveApplication';
import { saveErrorMessage } from '../application/save/errors';

export function SaveDiagnostics({ application, boot, onSnapshot, beginOperation }: { application: SaveApplication; boot: Promise<ApplicationSnapshot>; onSnapshot?: (snapshot: ApplicationSnapshot) => void; beginOperation?: () => (() => void) | undefined }) {
  const [snapshot, setSnapshot] = useState<ApplicationSnapshot>();
  const [error, setError] = useState('');
  const [json, setJson] = useState('');
  const [preview, setPreview] = useState<ImportPreview>();
  const [busy, setBusy] = useState(false);
  const [roundTrip, setRoundTrip] = useState(false);
  useEffect(() => {
    let active = true;
    boot.then(value => { if (active) setSnapshot(value); }, cause => { if (active) setError(saveErrorMessage(cause)); });
    return () => { active = false; };
  }, [boot]);
  const run = async (action: () => Promise<void>) => {
    const release = beginOperation?.();
    if (beginOperation && !release) return;
    setBusy(true); setError('');
    try { await action(); } catch (cause) { setError(saveErrorMessage(cause)); }
    finally { setBusy(false); release?.(); }
  };
  return <section aria-label="Diagnostica salvataggio">
    <h2>Salvataggio locale · Phase 2</h2>
    <p role="status">{snapshot ? `Salvataggio creato/caricato · schema ${snapshot.save.saveSchemaVersion} · contenuto ${snapshot.save.contentVersionSeen} · adapter ${application.repository.adapter}` : 'Caricamento salvataggio…'}</p>
    {error && <p role="alert">{error}</p>}
    {snapshot?.notices.includes('new_possibilities_available') && <p>Nuove possibilità disponibili.</p>}
    <button disabled={busy || !snapshot} onClick={() => void run(async () => {
      const exported = await application.exportSave(); setJson(exported);
      await application.previewImport(exported); setRoundTrip(true);
    })}>Esporta JSON / verifica round-trip</button>
    {roundTrip && <p role="status">Export/import validato; nessuna sovrascrittura eseguita.</p>}
    <label htmlFor="save-json">JSON del salvataggio (diagnostica)</label>
    <textarea id="save-json" value={json} onChange={e => { setJson(e.target.value); setPreview(undefined); setRoundTrip(false); }} rows={6} />
    <button disabled={busy || !json} onClick={() => void run(async () => { setPreview(await application.previewImport(json)); })}>Verifica import</button>
    {preview && <div>
      <p>Preview: {preview.discoveries} scoperte · {preview.xp} XP · schema {preview.schemaVersion}.</p>
      <p>La conferma sostituirà il progresso locale. Il precedente salvataggio valido resterà nel backup.</p>
      <button disabled={busy} onClick={() => void run(async () => { const value = await application.confirmImport(preview, true); setSnapshot(value); onSnapshot?.(value); setPreview(undefined); })}>Conferma sostituzione del progresso</button>
      <button disabled={busy} onClick={() => setPreview(undefined)}>Annulla import</button>
    </div>}
    {!snapshot && error && <div>
      <button disabled={busy} onClick={() => void run(async () => setJson(await application.exportRawRecovery()))}>Esporta dati originali per recupero</button>
      <button disabled={busy} onClick={() => void run(async () => { const value = await application.recoverBackup(true); setSnapshot(value); onSnapshot?.(value); })}>Conferma recupero del backup precedente</button>
    </div>}
  </section>;
}
