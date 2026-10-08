import { useEffect, useRef, useState, type CSSProperties } from "react";
import type {
  LabElement,
  LabModel,
  LabReaction,
} from "../../application/laboratory";
import {
  CombineButton,
  ElementCard,
  ElementSlot,
  ReactionStage,
  SearchBar,
} from "../components/LabComponents";
import { FreeTable, clampTable, type TableFigure, type LibraryDrag } from "./FreeTable";
import { searchLibrary, type LibraryFilter, type LibraryOrder } from "../../application/librarySearch";
import "./ux.css";
import "./playfeel.css";
import { InstrumentLines } from "../components/ObservatoryMarks";
export function Laboratory({
  model,
  hint,
  slots,
  reaction,
  busy,
  select,
  clear,
  combine,
  forceCombine,
  experiment,
  favorite,
  onUseResult,
  repeat,
  reset,
  onViewDetail,
  mode,
  setMode,
  beginInteraction,
}: {
  model: LabModel;
  hint?: import("react").ReactNode;
  slots: [string?, string?];
  reaction?: LabReaction;
  busy: boolean;
  select: (id: string) => void;
  clear: (slot: number) => void;
  combine: () => void;
  forceCombine?: () => void;
  experiment?: (a: string, b: string, force?: boolean) => Promise<LabReaction | undefined>;
  favorite: (id: string) => void;
  onUseResult: () => void;
  repeat: () => void;
  reset: () => void;
  onViewDetail: () => void;
  mode: 'classic' | 'table';
  setMode: (mode: 'classic' | 'table') => void;
  beginInteraction?: () => (() => void) | undefined;
}) {
  const [figures, setFigures] = useState<TableFigure[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [externalDrag, setExternalDrag] = useState<LibraryDrag>();
  const dragRelease = useRef<(() => void) | undefined>(undefined);
  const skipClick = useRef(false);
  const touchTap = useRef<{ pointerId: number; x: number; y: number } | undefined>(undefined);
  const sequence = useRef(0);
  const add = (elementId: string, x?: number, y?: number, tone?: LabReaction['kind']) => {
    const key = ++sequence.current;
    const anchor = figures.find(f => selected.includes(f.key));
    setFigures(old => [...old, { key, elementId, tone, x: x ?? (anchor ? clampTable(anchor.x + (anchor.x > 50 ? -34 : 34)) : 25 + ((key - 1) % 2) * 50), y: y ?? (anchor ? anchor.y : 35 + (Math.floor((key - 1) / 2) % 2) * 30) }]);
    setSelected(old => [...old.slice(-1), key]);
    return key;
  };
  const [filter, setFilter] = useState<LibraryFilter>('all');
  const [order, setOrder] = useState<LibraryOrder>('relevance');
  const [libraryOpen, setLibraryOpen] = useState(() => window.innerWidth >= 768);
  const [limit, setLimit] = useState(120);
  const [recent, setRecent] = useState<string[]>([]);
  const [onlyRecent, setOnlyRecent] = useState(false);
  const pick = (id: string) => { setRecent(old => [id, ...old.filter(e => e !== id)].slice(0, 8)); if (mode === 'table') add(id); else select(id); };
  const [query, setQuery] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const slotARef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const dockRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const viewport = window.visualViewport;
    const resize = () => document.documentElement.style.setProperty('--play-height', `${viewport?.height ?? window.innerHeight}px`);
    resize(); viewport?.addEventListener('resize', resize); window.addEventListener('resize', resize);
    return () => { viewport?.removeEventListener('resize', resize); window.removeEventListener('resize', resize); document.documentElement.style.removeProperty('--play-height'); dragRelease.current?.(); };
  }, []);
  const pendingFocus = useRef<"a" | "search" | null>(null);
  useEffect(() => {
    if (!reaction && pendingFocus.current) {
      (pendingFocus.current === "a"
        ? slotARef.current
        : searchRef.current
      )?.focus();
      pendingFocus.current = null;
    }
  }, [reaction]);
  const lookup = (id?: string) => model.elements.find((e) => e.id === id);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (event.key === '/' && !(event.target instanceof HTMLElement && event.target.closest('input,textarea,select,[contenteditable]'))) { event.preventDefault(); setLibraryOpen(true); searchRef.current?.focus({ preventScroll: true }); }
    };
    window.addEventListener('keydown', shortcut); return () => window.removeEventListener('keydown', shortcut);
  }, []);
  const filtered = searchLibrary(model.elements, query, filter, order, onlyFavorites).filter(e => !onlyRecent || recent.includes(e.id));
  const card = (element: LabElement) => (
    <div key={element.id} className="library-specimen"
      onClickCapture={event => { if (skipClick.current) { skipClick.current = false; event.preventDefault(); event.stopPropagation(); } }}
      onPointerDown={event => {
        // A new gesture must not inherit click suppression from a touch drag
        // (touch browsers may omit the synthetic click after movement).
        skipClick.current = false;
        touchTap.current = undefined;
        if (mode === 'table' && !busy && event.pointerType === 'touch' && event.target instanceof Element && event.target.closest('.element-select')) {
          touchTap.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
          return;
        }
        if (mode !== 'table' || busy || event.button !== 0 || (event.pointerType === 'touch' && !(event.target instanceof HTMLElement && event.target.closest('.library-drag-handle'))) || !(event.target instanceof Element) || event.target.closest('.favorite-button')) return;
        if (externalDrag) return;
        const release = beginInteraction?.(); if (beginInteraction && !release) return;
        dragRelease.current = release;
        (event.target.closest("button") ?? event.currentTarget).setPointerCapture(event.pointerId);
        setExternalDrag({ elementId: element.id, x: event.clientX, y: event.clientY, pointerId: event.pointerId });
      }}
      onPointerCancel={() => { touchTap.current = undefined; }}
      onPointerUp={event => {
        const tap = touchTap.current; touchTap.current = undefined;
        if (tap && tap.pointerId === event.pointerId && !busy && Math.hypot(event.clientX - tap.x, event.clientY - tap.y) < 8) {
          // Handle the tap itself: Chromium may omit a compatibility click after
          // a captured drag. Suppress that click if it does arrive.
          skipClick.current = true; pick(element.id);
        }
      }}>
    <ElementCard
      element={element}
      busy={busy}
      selected={mode === 'classic' && slots.includes(element.id)}
      onSelect={() => { if (!busy) pick(element.id); }}
      onFavorite={() => favorite(element.id)}
    />
    {mode === "table" && <button className="library-drag-handle" disabled={busy} aria-label={`Trascina ${element.name} sul tavolo`}>↗</button>}
    </div>
  );
  return (
    <>
      <main
        id="laboratory"
        className={`lab-workspace ${mode === 'table' ? 'play-workspace' : ''}`}
        style={
          {
            "--reveal-accent": `var(${reaction?.setRevealDetails?.find((s) => s.kind !== "normal")?.accent ?? "--color-accent-warm"})`,
          } as CSSProperties
        }
        data-reveal-environment={
          reaction?.emphasis === "hidden-set" ||
          reaction?.emphasis === "secret-set"
            ? reaction.emphasis
            : undefined
        }
        tabIndex={-1}
      >
        <header className="workspace-heading">
          {mode === 'classic' && <><p className="eyebrow">Il tuo osservatorio</p><h2>Laboratorio</h2><p>Scegli due concetti e prova a combinarli.</p></>}
          <div className="lab-mode" role="group" aria-label="Modalità del laboratorio">
            <button disabled={busy} aria-pressed={mode === 'table'} onClick={() => setMode('table')}>Tavolo libero</button>
            <button disabled={busy} aria-pressed={mode === 'classic'} onClick={() => { setLibraryOpen(true); setMode('classic'); }}>Laboratorio classico</button>
          </div>
        </header>
        <div hidden={mode !== "classic"}><div className={`experiment ${busy ? "reacting" : ""}`}>
          <InstrumentLines />
          <div className="slots">
            <ElementSlot
              letter="A"
              buttonRef={slotARef}
              element={lookup(slots[0])}
              busy={busy}
              onClear={() => clear(0)}
            />
            <span className="slot-connector" aria-hidden="true">
              +
            </span>
            <ElementSlot
              letter="B"
              element={lookup(slots[1])}
              busy={busy}
              onClear={() => clear(1)}
            />
          </div>
          <CombineButton
            enabled={Boolean(lookup(slots[0]) && lookup(slots[1]))}
            busy={busy}
            onClick={combine}
          />
        </div>
        </div>
        <div className="table-holder" hidden={mode !== 'table'}>
          {mode === 'table' && <FreeTable elements={model.elements} busy={busy} figures={figures} selected={selected} setSelected={setSelected} setFigures={setFigures} add={add} reaction={reaction} beginInteraction={beginInteraction}
            combine={async (a,b,force) => {
              const result=await experiment?.(a,b,force);
              setRecent(old => [...new Set([...(result?.element ? [result.element.id] : []),a,b,...old])].slice(0,8));
              return result;
            }} externalDrag={externalDrag}
            endExternalDrag={moved => { skipClick.current = moved; if (moved && externalDrag) setRecent(old => [externalDrag.elementId,...old.filter(id=>id!==externalDrag.elementId)].slice(0,8)); dragRelease.current?.(); dragRelease.current = undefined; setExternalDrag(undefined); }} />}
        </div>
        {mode === 'classic' && <ReactionStage
          reaction={reaction}
          onViewDetail={onViewDetail}
          busy={busy}
          onUse={() => {
            pendingFocus.current = "a";
            onUseResult();
          }}
          onRepeat={() => {
            pendingFocus.current = "a";
            repeat();
          }}
          onReset={() => {
            pendingFocus.current = "search";
            reset();
          }}
        />}
        {reaction && ['known', 'anomaly', 'no_reaction'].includes(reaction.kind) && forceCombine && mode === 'classic' && <button className="secondary" disabled={busy} onClick={forceCombine}>Ripeti comunque</button>}
        {mode === 'classic' ? hint : hint && <details className="table-hints"><summary>Indizi</summary>{hint}</details>}
      </main>
      <aside className={`library ${mode === 'table' ? 'table-library' : ''} ${libraryOpen ? 'expanded' : 'docked'}`} aria-label="Biblioteca degli elementi"
        onKeyDown={event => { if (mode === 'table' && event.key === 'Escape') { event.preventDefault(); setLibraryOpen(false); dockRef.current?.focus({ preventScroll: true }); } }}>
        <header>
          {mode === 'classic' && <p className="eyebrow">Le tue scoperte</p>}
          <h2>
            Biblioteca <span>{model.count}</span>
          </h2>
          <button ref={dockRef} className="library-toggle" aria-expanded={libraryOpen} aria-controls="library-results" onClick={() => setLibraryOpen(v => !v)}>{libraryOpen ? 'Comprimi biblioteca' : 'Apri biblioteca'}</button>
          <div onFocus={() => setLibraryOpen(true)}><SearchBar value={query} onChange={value => { setQuery(value); setLimit(120); setLibraryOpen(true); }} inputRef={searchRef} /></div>
          <details className="library-options"><summary>{mode === 'table' ? 'Filtri' : 'Filtri e ordine'}</summary><div className="library-filters">
            <label>Filtra biblioteca<select value={filter} onChange={event => { setFilter(event.target.value as LibraryFilter); setLimit(120); }}>
              <option value="all">Tutti</option>
              <option value="possibilities">Con piste</option><option value="exhausted">Esauriti per ora</option>
              <option value="untested">Mai provati con A</option><option value="known">Ricette note con A</option>
            </select></label>
            <label>Ordina biblioteca<select value={order} onChange={event => { setOrder(event.target.value as LibraryOrder); setLimit(120); }}>
              <option value="relevance">Rilevanza</option><option value="recent">Recenti</option><option value="favorites">Preferiti</option><option value="set">Set</option>
            </select></label>
          </div></details>
          {!!recent.length && <div className={`quick-favorites ${mode === 'table' ? 'table-recent' : ''}`} aria-label="Ultimi usati">{recent.map(id => <button key={id} disabled={busy} onClick={() => pick(id)}>{lookup(id)?.name}</button>)}</div>}
          <div className="library-quick">
          {mode === 'table' && <button aria-pressed={onlyRecent} onClick={()=>setOnlyRecent(v=>!v)}>Recenti</button>}
          <button
            className="favorites-filter"
            aria-label="Solo preferiti"
            title="Solo preferiti"
            aria-pressed={onlyFavorites}
            onClick={() => { setOnlyFavorites((v) => !v); setLimit(120); }}
          >
            {mode === 'table' ? '★' : '★ Preferiti'}
          </button>
          </div>
          {model.elements.some((e) => e.favorite) && (
            <div className="quick-favorites" aria-label="Preferiti rapidi">
              {model.elements
                .filter((e) => e.favorite)
                .map((e) => (
                  <button
                    key={e.id}
                    disabled={busy}
                    onClick={() => pick(e.id)}
                  >
                    ★ {e.name}
                  </button>
                ))}
            </div>
          )}
          {slots[0] && mode === 'classic' && (
            <p className="library-context">
              Esperimenti già provati con {lookup(slots[0])?.name}
            </p>
          )}
        </header>
        <div id="library-results" className="library-results" hidden={!libraryOpen && mode === 'classic'}>
        {limit > 120 && <button className="secondary" onClick={() => setLimit(n => n - 120)}>Pagina precedente</button>}
        <div className="library-grid">{filtered.slice(Math.max(0, limit - 120), limit).map(card)}</div>
        {filtered.length > limit && <button className="secondary" onClick={() => setLimit(n => n + 120)}>Pagina successiva</button>}
        </div>
        {!filtered.length && (
          <p className="empty-library">
            {onlyFavorites && !query
              ? "Nessun preferito. Usa la stella sulle carte per aggiungerne uno."
              : "Nessun elemento trovato tra le tue scoperte."}
          </p>
        )}
      </aside>
    </>
  );
}
