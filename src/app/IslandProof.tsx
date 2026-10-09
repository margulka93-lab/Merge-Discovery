import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { islandRuntime } from './islandRuntime';
import type { ProofData } from '../application/island/ProofSession';
import type { LabReaction } from '../application/laboratory';
import { WorldScene } from '../ui/island/WorldScene';
import { ProofDialog } from '../ui/island/ProofDialog';
import { ElementArt } from '../ui/components/ElementArt';
import { UpdateNotice } from '../ui/platform/UpdateNotice';
import { updates } from '../platform/pwa/updates';
import '../styles/island-proof.css';

export function IslandProof() {
  const { session, boot } = islandRuntime();
  const [data, setData] = useState<ProofData>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const mutex = useRef(false);
  const [slots, setSlots] = useState<[string?, string?]>([]);
  const [panel, setPanel] = useState<'library' | 'world' | 'atlas'>();
  const [query, setQuery] = useState('');
  const [actionId, setActionId] = useState<string>();
  const [shore, setShore] = useState<'west' | 'east'>('west');
  const [reaction, setReaction] = useState<LabReaction>();
  const [message, setMessage] = useState('');
  const update = useSyncExternalStore(updates.subscribe, updates.getSnapshot);
  const combineButton = useRef<HTMLButtonElement>(null);
  useEffect(() => { let active = true; void boot.then(() => session.load()).then(d => { if (active) setData(d); }, e => { if (active) setError(String(e)); }); return () => { active = false; updates.setReveal(false); }; }, [boot, session]);
  const dismiss = () => { setReaction(undefined); updates.setReveal(false); };
  async function operate(work: () => Promise<void>) {
    if (mutex.current) return;
    const release = updates.beginOperation(); if (!release) return;
    mutex.current = true; setBusy(true); setError('');
    try { await work(); }
    catch { setError('L’operazione non è stata confermata. Le scoperte già salvate restano disponibili; ricarica prima di riprovare.'); }
    finally { mutex.current = false; setBusy(false); release(); }
  }
  function select(id: string) {
    if (busy) return;
    dismiss(); setSlots(current => !current[0] ? [id] : !current[1] ? [current[0], id] : [id]);
    setActionId(undefined); setPanel('library');
  }
  async function combine() {
    if (!slots[0] || !slots[1]) return;
    const [a, b] = slots as [string, string];
    await operate(async () => {
      const result = await session.combine(a, b);
      setData(result.data); setReaction(result.reaction); setPanel(undefined);
      updates.setReveal(!result.replay && ['new', 'alternate', 'anomaly'].includes(result.reaction.kind));
      setMessage(result.reaction.announcement); combineButton.current?.focus();
    });
  }
  async function manifest(anchor: string) {
    if (!data || !actionId) return;
    await operate(async () => {
      const next = await session.manifest(actionId, anchor, data.expected);
      setData(next); setMessage(next.world.observations.at(-1)?.text ?? 'Trasformazione salvata.');
      setShore(anchor.startsWith('east') ? 'east' : 'west'); setActionId(undefined); dismiss();
    });
  }
  if (!data) return <main className="proof-loading"><h1>Isolario</h1><p role="status">{error || 'Apertura dell’isola…'}</p>{error && <button onClick={() => void operate(async () => setData(await session.load()))}>Ricarica progresso</button>}<Link to="/">Scopri</Link></main>;
  const action = data.world.actions.find(a => a.id === actionId);
  const elements = data.catalog.elements;
  const resultAction = data.world.actions.find(a => a.elementId === reaction?.element?.id);
  const slotName = (id?: string) => elements.find(e => e.id === id)?.name;
  const preference = data.snapshot.save.settings;
  return <main className={`island-proof ${preference.reducedMotion ? 'reduce-motion' : ''} ${preference.highContrast ? 'high-contrast' : ''}`} style={{ fontSize: preference.textScale === 'extra_large' ? '150%' : preference.textScale === 'large' ? '125%' : undefined }}>
    <header className="proof-header"><div><span className="proof-eyebrow">CONCEPT PROOF · ARTE DI PROVA</span><h1>Isolario <span>Atlante Vivente</span></h1></div><Link to="/" aria-disabled={busy || update.applying} onClick={e => { if (busy || update.applying) e.preventDefault(); }}>Scopri</Link></header>
    <WorldScene world={data.world} action={busy ? undefined : action} shore={shore} selectEntity={select} manifest={anchor => void manifest(anchor)} />
    <nav className="proof-shores" aria-label="Vista della riva"><button aria-pressed={shore === 'west'} onClick={() => setShore('west')}>Ovest</button><button aria-pressed={shore === 'east'} onClick={() => setShore('east')}>Est</button></nav>
    <div className="proof-feedback" role="status" aria-live="polite">{message}</div>
    {error && <aside className="proof-error" role="alert"><p>{error}</p><button disabled={busy} onClick={() => void operate(async () => { setData(await session.load()); setActionId(undefined); })}>Ricarica progresso</button></aside>}
    {reaction && <aside className={`proof-result result-${reaction.kind}`} aria-label="Risultato esperimento"><button className="proof-close" aria-label="Chiudi risultato" onClick={dismiss}>×</button><span>{reaction.title}</span><strong>{reaction.element?.name ?? reaction.message}</strong>{resultAction && <button disabled={busy} onClick={() => { setActionId(resultAction.id); dismiss(); }}>Manifesta</button>}</aside>}
    {action && <button className="proof-cancel" onClick={() => setActionId(undefined)}>Annulla manifestazione</button>}
    <footer className="proof-dock">
      <nav aria-label="Strumenti dell’isola"><button className="proof-gold" disabled={busy} onClick={() => setPanel('world')}>Luoghi</button>{data.atlas && <button disabled={busy} onClick={() => setPanel('atlas')}>Atlante</button>}<button ref={combineButton} disabled={busy} onClick={() => setPanel('library')}>Esperimento</button></nav>
    </footer>
    <UpdateNotice state={update} accept={updates.accept} defer={updates.defer} />
    {panel && <ProofDialog title={panel === 'library' ? 'Essenze conosciute' : panel === 'world' ? 'Luoghi e trasformazioni' : 'Atlante Vivente'} close={() => setPanel(undefined)}>
      {panel === 'library' && <><p>Esperimento contestuale facoltativo. La Scoperta resta nella schermata Scopri.</p><label>Cerca essenze<input type="search" value={query} onChange={e => setQuery(e.target.value)} /></label><div className="proof-essences">{elements.filter(e => e.name.toLocaleLowerCase('it').includes(query.toLocaleLowerCase('it'))).map(e => <button key={e.id} data-essence={e.id} disabled={busy} aria-pressed={slots.includes(e.id)} onClick={() => select(e.id)}><ElementArt artKey={e.artKey} /><span>{e.name}</span></button>)}</div><p aria-live="polite">{slotName(slots[0]) ?? '…'} + {slotName(slots[1]) ?? '…'}</p><button className="proof-gold" disabled={busy || !slots[0] || !slots[1]} onClick={() => void combine()}>Combina essenze</button></>}
      {panel === 'world' && <><h3>Azioni disponibili</h3>{data.world.actions.length === 0 && <p>Nessuna trasformazione disponibile con le essenze attuali.</p>}<div className="proof-action-list">{data.world.actions.map(a => <button key={a.id} onClick={() => { dismiss(); setActionId(a.id); setPanel(undefined); }}>{a.name}</button>)}</div><h3>Presenze sull’isola</h3>{data.world.entities.length === 0 && <p>Le scoperte non trasformano automaticamente il paesaggio.</p>}{data.world.entities.map(e => <p key={e.id}><button onClick={() => { select(e.elementId); }}>{e.name} · {e.zone}</button></p>)}<h3>Taccuino</h3>{data.world.observations.map(o => <p key={o.id}>{o.text} <small>{o.zone}</small></p>)}</>}
      {panel === 'atlas' && data.atlas && <><div className="proof-book"><section><h3>Il paesaggio ricorda</h3>{data.atlas.chronicle.length === 0 && <p>La cronaca inizierà con la tua prima manifestazione.</p>}<ol>{data.atlas.chronicle.map(o => <li key={o.id}><strong>{o.text}</strong><small>{o.zone} · {new Date(o.committedAt).toLocaleDateString('it')}</small></li>)}</ol></section><section><h3>Conoscenza acquisita</h3>{data.atlas.knowledge.recent.slice(0, 6).map(e => { const detail = data.atlas!.knowledge.detail(e.id); return <article key={e.id}><ElementArt artKey={e.artKey} /><div><h4>{e.name}</h4><p>{e.description}</p>{detail?.firstRecipe && <small>{detail.firstRecipe.inputs.map(i => i.name).join(' + ')} → {e.name}</small>}</div></article>; })}<p>Questa prima pagina raccoglie le ultime sei scoperte.</p></section></div></>}
    </ProofDialog>}
  </main>;
}
