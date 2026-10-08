import { useEffect, useRef, useState } from 'react';
import type { LabElement, LabReaction } from '../../application/laboratory';
import { ElementArt } from '../components/ElementArt';
export interface TableFigure { key: number; elementId: string; x: number; y: number }
export interface LibraryDrag { elementId: string; x: number; y: number; pointerId: number }
const clamp = (n: number) => Math.min(84, Math.max(16, n));
export function FreeTable({ elements, busy, figures, setFigures, add, combine, externalDrag, endExternalDrag }: {
  elements: LabElement[]; busy: boolean; figures: TableFigure[];
  setFigures: (change: (old: TableFigure[]) => TableFigure[]) => void;
  add: (id: string, x?: number, y?: number) => void;
  combine: (a: string, b: string, force?: boolean) => Promise<LabReaction | undefined>;
  externalDrag?: LibraryDrag; endExternalDrag: (moved: boolean) => void;
}) {
  const canvas = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [ghost, setGhost] = useState<{ x: number; y: number }>();
  const dragPoint = useRef<{ x: number; y: number } | undefined>(undefined);
  const [collision, setCollision] = useState<number>();
  const dragging = useRef<{ key: number; pointerId: number; x: number; y: number; moved: boolean; origin: { x: number; y: number } } | undefined>(undefined);
  const lock = useRef(false);
  const clicks = useRef({ key: -1, count: 0, at: 0 });
  const latest = useRef({ figures, elements, busy, combine, externalDrag, endExternalDrag, add, setFigures });
  useEffect(() => { latest.current = { figures, elements, busy, combine, externalDrag, endExternalDrag, add, setFigures }; });
  const point = (x: number, y: number) => {
    const rect = canvas.current!.getBoundingClientRect();
    return { x: clamp((x - rect.left) / rect.width * 100), y: clamp((y - rect.top) / rect.height * 100) };
  };
  const attempt = async (a: TableFigure, b: TableFigure, force = false) => {
    if (lock.current || latest.current.busy) return;
    lock.current = true;
    try {
      const outcome = await latest.current.combine(a.elementId, b.elementId, force);
      if (outcome?.element && !outcome.remembered) latest.current.add(outcome.element.id, clamp((a.x + b.x) / 2), clamp((a.y + b.y) / 2 + ((a.y + b.y) / 2 > 50 ? -32 : 32)));
    } finally { lock.current = false; setCollision(undefined); }
  };
  useEffect(() => {
    const move = (event: PointerEvent) => {
      const { externalDrag: from, figures: current } = latest.current;
      if (from && event.pointerId === from.pointerId) { dragPoint.current = { x: event.clientX, y: event.clientY }; setGhost(dragPoint.current); return; }
      const drag = dragging.current;
      if (!drag || event.pointerId !== drag.pointerId) return;
      if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 6 && !drag.moved) return;
      drag.moved = true;
      const p = point(event.clientX, event.clientY);
      latest.current.setFigures(old => old.map(f => f.key === drag.key ? { ...f, ...p } : f));
      const rect = canvas.current!.getBoundingClientRect();
      setCollision(current.find(f => f.key !== drag.key && Math.hypot((f.x - p.x) * rect.width / 100, (f.y - p.y) * rect.height / 100) < 50)?.key);
    };
    const finish = (event: PointerEvent) => {
      const { externalDrag: from, figures: current } = latest.current;
      if (from && event.pointerId === from.pointerId) {
        const moved = Math.hypot(event.clientX - from.x, event.clientY - from.y) >= 6;
        const r = canvas.current!.getBoundingClientRect();
        if (event.type !== 'pointercancel' && moved && event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom && !latest.current.busy) {
          const p = point(event.clientX, event.clientY); latest.current.add(from.elementId, p.x, p.y);
        }
        latest.current.endExternalDrag(moved); dragPoint.current = undefined; setGhost(undefined); return;
      }
      const drag = dragging.current; if (drag && event.pointerId !== drag.pointerId) return; dragging.current = undefined;
      setCollision(undefined);
      if (!drag?.moved || event.type === 'pointercancel') return;
      const a = current.find(f => f.key === drag.key); if (!a) return;
      const p = point(event.clientX, event.clientY), r = canvas.current!.getBoundingClientRect();
      const b = current.find(f => f.key !== a.key && Math.hypot((f.x - p.x) * r.width / 100, (f.y - p.y) * r.height / 100) < 50);
      if (b) { latest.current.setFigures(old => old.map(f => f.key === a.key ? { ...f, ...drag.origin } : f)); void attempt({ ...a, ...p }, b); }
    };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', finish); window.addEventListener('pointercancel', finish);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', finish); window.removeEventListener('pointercancel', finish); };
  });
  useEffect(() => {
    const scroll = window.setInterval(() => {
      if (!latest.current.externalDrag || !dragPoint.current) return;
      const y = dragPoint.current.y;
      const amount = y < 80 ? -20 : y > window.innerHeight - 80 ? 20 : 0;
      if (amount) window.scrollBy(0, amount);
    }, 16);
    return () => window.clearInterval(scroll);
  }, []);
  const duplicate = (f: TableFigure) => {
    const width = canvas.current?.clientWidth ?? 360;
    add(f.elementId, clamp(f.x + (f.x > 50 ? -1 : 1) * 10400 / width), clamp(f.y + 5));
  };
  const chosen = figures.filter(f => selected.includes(f.key));
  return <section className="free-table" aria-label="Tavolo libero">
    <p className="table-help">Aggiungi dalla biblioteca. Sovrapponi due figure per sperimentare, oppure selezionale e premi Combina figure. Doppio clic o Duplica crea una copia.</p>
    <div className="table-tools">
      <button disabled={busy || !chosen.length} onClick={() => chosen.forEach(duplicate)}>Duplica</button>
      <button disabled={busy || chosen.length !== 2} onClick={() => void attempt(chosen[0]!, chosen[1]!)}>Combina figure</button>
      <button disabled={busy || chosen.length !== 2} onClick={() => void attempt(chosen[0]!, chosen[1]!, true)}>Ripeti figure comunque</button>
      <button disabled={busy || !chosen.length} onClick={() => { setFigures(old => old.filter(f => !selected.includes(f.key))); setSelected([]); }}>Rimuovi figure</button>
      <button disabled={busy || !figures.length} onClick={() => { setFigures(() => []); setSelected([]); }}>Pulisci tavolo</button>
    </div>
    <div ref={canvas} className="table-canvas">
      <div className="table-sigil" aria-hidden="true" />
      {!figures.length && <p className="table-empty">Il tavolo è pronto. Tocca un elemento della biblioteca o trascinalo qui.</p>}
      {figures.slice(-100).map(f => {
        const e = elements.find(e => e.id === f.elementId); if (!e) return null;
        return <button key={f.key} className={`table-figure ${selected.includes(f.key) ? 'chosen' : ''} ${collision === f.key ? 'collision' : ''}`}
          style={{ left: `calc(${f.x}% - 44px)`, top: `calc(${f.y}% - 47px)` }} disabled={busy}
          aria-label={`${e.name}, figura ${f.key}`} aria-pressed={selected.includes(f.key)}
          onPointerDown={event => { if (event.button !== 0 || busy) return; event.currentTarget.setPointerCapture(event.pointerId); dragging.current = { key: f.key, pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: false, origin: { x: f.x, y: f.y } }; }}
          onClick={event => {
            const now = performance.now();
            clicks.current = { key: f.key, at: now, count: event.detail > 0 && clicks.current.key === f.key && now - clicks.current.at < 600 ? clicks.current.count + 1 : 1 };
            setSelected(old => old.includes(f.key) ? old.filter(k => k !== f.key) : [...old.slice(-1), f.key]);
          }}
          onDoubleClick={() => { if (clicks.current.key === f.key && clicks.current.count >= 2) duplicate(f); }}
          onKeyDown={event => {
            const step = event.shiftKey ? 10 : 3;
            const delta = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key];
            if (delta) { event.preventDefault(); setFigures(old => old.map(n => n.key === f.key ? { ...n, x: clamp(n.x + delta[0]!), y: clamp(n.y + delta[1]!) } : n)); }
            if (event.key === 'Delete') setFigures(old => old.filter(n => n.key !== f.key));
            if (event.key === 'Escape') setSelected([]);
          }}><ElementArt artKey={e.artKey} /><strong>{e.name}</strong></button>;
      })}
    </div>
    {figures.length > 100 && <p role="status">Sei oltre 100 figure: le più vecchie sono sospese per mantenere fluido il tavolo. Puoi pulirlo senza perdere scoperte.</p>}
    {ghost && externalDrag && <div className="table-ghost" aria-hidden="true" style={{ left: ghost.x, top: ghost.y }}><ElementArt artKey={elements.find(e => e.id === externalDrag.elementId)?.artKey ?? ''} /></div>}
  </section>;
}
