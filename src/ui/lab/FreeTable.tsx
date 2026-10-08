import { useEffect, useRef, useState } from 'react';
import type { LabElement, LabReaction } from '../../application/laboratory';
import { ElementArt } from '../components/ElementArt';

export interface TableFigure { key: number; elementId: string; x: number; y: number; tone?: LabReaction['kind'] }
export interface LibraryDrag { elementId: string; x: number; y: number; pointerId: number }
export const clampTable = (n: number) => Math.min(84, Math.max(16, n));

/** Figures and gestures are local presentation. Every outcome comes from the application command. */
export function FreeTable({ elements, busy, figures, selected, setSelected, setFigures, add, combine, reaction,
  externalDrag, endExternalDrag, beginInteraction }: {
  elements: LabElement[]; busy: boolean; figures: TableFigure[]; selected: number[];
  setSelected: (change: number[] | ((old: number[]) => number[])) => void;
  setFigures: (change: (old: TableFigure[]) => TableFigure[]) => void;
  add: (id: string, x?: number, y?: number, tone?: LabReaction['kind']) => number;
  combine: (a: string, b: string, force?: boolean) => Promise<LabReaction | undefined>;
  reaction?: LabReaction; externalDrag?: LibraryDrag; endExternalDrag: (moved: boolean) => void;
  beginInteraction?: () => (() => void) | undefined;
}) {
  const canvas = useRef<HTMLDivElement>(null);
  const [ghost, setGhost] = useState<{ x: number; y: number }>();
  const [collision, setCollision] = useState<number>();
  const [pulse, setPulse] = useState<{ x: number; y: number; kind: string; key: number }>();
  const dragging = useRef<{ key: number; pointerId: number; x: number; y: number; moved: boolean; origin: { x: number; y: number }; release?: () => void } | undefined>(undefined);
  const suppressClick = useRef(false);
  const lock = useRef(false);
  const latest = useRef({ figures, elements, busy, combine, externalDrag, endExternalDrag, add, setFigures, setSelected });
  useEffect(() => { latest.current = { figures, elements, busy, combine, externalDrag, endExternalDrag, add, setFigures, setSelected }; });
  useEffect(() => () => dragging.current?.release?.(), []);
  const point = (x: number, y: number) => {
    const rect = canvas.current!.getBoundingClientRect();
    return { x: clampTable((x - rect.left) / rect.width * 100), y: clampTable((y - rect.top) / rect.height * 100) };
  };
  const targetAt = (p: { x: number; y: number }, except?: number) => {
    const rect = canvas.current!.getBoundingClientRect();
    return [...latest.current.figures].reverse().find(f => f.key !== except && Math.hypot((f.x - p.x) * rect.width / 100, (f.y - p.y) * rect.height / 100) < 48);
  };
  const attempt = async (a: TableFigure, b: TableFigure, force = false) => {
    if (lock.current || latest.current.busy) return;
    lock.current = true;
    const returnFocus = canvas.current?.contains(document.activeElement);
    try {
      const outcome = await latest.current.combine(a.elementId, b.elementId, force);
      if (!outcome) return;
      setPulse({ x: b.x, y: b.y, kind: outcome.remembered ? 'known' : outcome.kind, key: performance.now() });
      if (outcome.element) {
        // Only visual copies fuse. The library and durable discoveries are never consumed.
        latest.current.setFigures(old => old.filter(f => f.key !== a.key && f.key !== b.key));
        const key = latest.current.add(outcome.element.id, b.x, b.y, outcome.kind);
        latest.current.setSelected([key]);
        if (returnFocus) requestAnimationFrame(() => canvas.current?.querySelector<HTMLButtonElement>(`[data-figure="${key}"]`)?.focus({ preventScroll: true }));
      }
    } finally { lock.current = false; setCollision(undefined); }
  };
  useEffect(() => {
    const inside = (x: number, y: number) => {
      const r = canvas.current!.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };
    const move = (event: PointerEvent) => {
      const from = latest.current.externalDrag;
      if (from && event.pointerId === from.pointerId) {
        if (Math.hypot(event.clientX - from.x, event.clientY - from.y) < 8) return;
        setGhost({ x: event.clientX, y: event.clientY });
        setCollision(inside(event.clientX, event.clientY) ? targetAt(point(event.clientX, event.clientY))?.key : undefined);
        return;
      }
      const drag = dragging.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 8 && !drag.moved) return;
      drag.moved = true;
      const p = point(event.clientX, event.clientY);
      latest.current.setFigures(old => old.map(f => f.key === drag.key ? { ...f, ...p } : f));
      setCollision(inside(event.clientX, event.clientY) ? targetAt(p, drag.key)?.key : undefined);
    };
    const finish = (event: PointerEvent) => {
      const { externalDrag: from } = latest.current;
      if (from && event.pointerId === from.pointerId) {
        const moved = Math.hypot(event.clientX - from.x, event.clientY - from.y) >= 8;
        latest.current.endExternalDrag(moved); setGhost(undefined);
        if (event.type !== 'pointercancel' && moved && inside(event.clientX, event.clientY) && !latest.current.busy) {
          const p = point(event.clientX, event.clientY), b = targetAt(p);
          if (b) void attempt({ key: -1, elementId: from.elementId, ...p }, b);
          else latest.current.add(from.elementId, p.x, p.y);
        }
        setCollision(undefined); return;
      }
      const drag = dragging.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      dragging.current = undefined; drag.release?.(); suppressClick.current = drag.moved;
      setCollision(undefined);
      const a = latest.current.figures.find(f => f.key === drag.key);
      if (!a || !drag.moved) return;
      const b = inside(event.clientX, event.clientY) ? targetAt(point(event.clientX, event.clientY), a.key) : undefined;
      if (event.type === 'pointercancel' || b) latest.current.setFigures(old => old.map(f => f.key === a.key ? { ...f, ...drag.origin } : f));
      if (event.type !== 'pointercancel' && b) void attempt(a, b);
    };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', finish); window.addEventListener('pointercancel', finish);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', finish); window.removeEventListener('pointercancel', finish); };
  });
  const duplicate = (f: TableFigure) => {
    const width = canvas.current?.clientWidth ?? 360;
    add(f.elementId, clampTable(f.x + (f.x > 50 ? -1 : 1) * 10400 / width), clampTable(f.y + 8));
  };
  const chosen = figures.filter(f => selected.includes(f.key));
  return <section className="free-table" aria-label="Tavolo libero">
    <div className="table-actions">
      {chosen.length === 2 && <button disabled={busy} onClick={() => void attempt(chosen[0]!, chosen[1]!)}>Combina figure</button>}
      <details><summary aria-label="Opzioni tavolo">•••</summary><div className="table-context">
        <button disabled={busy || !chosen.length} onClick={() => chosen.forEach(duplicate)}>Duplica</button>
        <button disabled={busy || !chosen.length} onClick={() => { setFigures(old => old.filter(f => !selected.includes(f.key))); setSelected([]); }}>Rimuovi figure</button>
        <button disabled={busy || !figures.length} onClick={() => { setFigures(() => []); setSelected([]); }}>Pulisci tavolo</button>
        <details><summary>Come giocare</summary><p>Trascina dalla biblioteca sopra una figura. Oppure tocca due elementi e usa Combina figure. Doppio clic duplica; frecce spostano, Canc rimuove, Esc deseleziona.</p></details>
      </div></details>
    </div>
    <div ref={canvas} className="table-canvas" aria-label="Superficie degli esperimenti">
      <div className="table-sigil" aria-hidden="true" />
      {!figures.length && <p className="table-empty">Da cosa iniziamo?<span>Porta qui un elemento.</span></p>}
      {pulse && <div key={pulse.key} className={`table-pulse ${pulse.kind}`} aria-hidden="true" style={{ left: `${pulse.x}%`, top: `${pulse.y}%` }} />}
      {figures.slice(-100).map(f => {
        const e = elements.find(e => e.id === f.elementId); if (!e) return null;
        return <button key={f.key} data-figure={f.key} data-element={e.id} className={`table-figure ${selected.includes(f.key) ? 'chosen' : ''} ${collision === f.key ? 'collision' : ''} born-${f.tone ?? 'copy'}`}
          style={{ left: `calc(${f.x}% - 44px)`, top: `calc(${f.y}% - 47px)` }} disabled={busy}
          aria-label={`${e.name}, figura ${f.key}`} aria-pressed={selected.includes(f.key)}
          onPointerDown={event => {
            if (event.button !== 0 || busy || dragging.current) return;
            const release = beginInteraction?.(); if (beginInteraction && !release) return;
            suppressClick.current = false; event.currentTarget.setPointerCapture(event.pointerId);
            dragging.current = { key: f.key, pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: false, origin: { x: f.x, y: f.y }, release };
          }}
          onClick={() => { if (suppressClick.current) { suppressClick.current = false; return; } setSelected(old => old.includes(f.key) ? old.filter(k => k !== f.key) : [...old.slice(-1), f.key]); }}
          onDoubleClick={() => duplicate(f)}
          onKeyDown={event => {
            const step = event.shiftKey ? 10 : 3;
            const delta = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key];
            if (delta) { event.preventDefault(); setFigures(old => old.map(n => n.key === f.key ? { ...n, x: clampTable(n.x + delta[0]!), y: clampTable(n.y + delta[1]!) } : n)); }
            if (event.key === 'Delete') { setFigures(old => old.filter(n => n.key !== f.key)); setSelected(old => old.filter(k => k !== f.key)); }
            if (event.key === 'Escape') setSelected([]);
          }}><ElementArt artKey={e.artKey} /><strong>{e.name}</strong></button>;
      })}
      <div className={`table-outcome ${reaction?.kind ?? ''}`} aria-live="off">
        {reaction && <><span>{reaction.kind === 'known' ? 'Reazione conosciuta' : reaction.title}</span>{reaction.element && <strong>{reaction.element.name}</strong>}
          {!!reaction.setReveals.length && <small>Nuovo Set: {reaction.setReveals.join(', ')}</small>}
          {reaction.collectionCallouts?.map(c => <small key={c.id}>{c.kind === 'completed' ? 'Collezione completata' : 'Nuova collezione'}: {c.name}</small>)}
        </>}
      </div>
    </div>
    {figures.length > 100 && <p role="status">Oltre 100 figure: le più vecchie sono sospese. Pulisci senza perdere scoperte.</p>}
    {ghost && externalDrag && <div className="table-ghost" aria-hidden="true" style={{ left: ghost.x, top: ghost.y }}><ElementArt artKey={elements.find(e => e.id === externalDrag.elementId)?.artKey ?? ''} /></div>}
  </section>;
}
