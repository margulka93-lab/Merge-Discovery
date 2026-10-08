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
import { FreeTable, type TableFigure, type LibraryDrag } from "./FreeTable";
import { searchLibrary, type LibraryFilter, type LibraryOrder } from "../../application/librarySearch";
import "./ux.css";
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
}) {
  const [mode, setMode] = useState<'classic' | 'table'>('classic');
  const [figures, setFigures] = useState<TableFigure[]>([]);
  const [externalDrag, setExternalDrag] = useState<LibraryDrag>();
  const skipClick = useRef(false);
  const sequence = useRef(0);
  const add = (elementId: string, x?: number, y?: number) => {
    if (busy) return;
    const key = ++sequence.current;
    setFigures(old => [...old, { key, elementId, x: x ?? 16 + ((key - 1) % 3) * 34, y: y ?? 25 + (Math.floor((key - 1) / 3) % 3) * 25 }]);
  };
  const [filter, setFilter] = useState<LibraryFilter>('all');
  const [order, setOrder] = useState<LibraryOrder>('relevance');
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [limit, setLimit] = useState(120);
  const [recent, setRecent] = useState<string[]>([]);
  const pick = (id: string) => { setRecent(old => [id, ...old.filter(e => e !== id)].slice(0, 8)); if (mode === 'table') add(id); else select(id); };
  const [query, setQuery] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const slotARef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
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
      if (event.key === '/' && !(event.target instanceof HTMLElement && event.target.closest('input,textarea,select,[contenteditable]'))) { event.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener('keydown', shortcut); return () => window.removeEventListener('keydown', shortcut);
  }, []);
  const filtered = searchLibrary(model.elements, query, filter, order, onlyFavorites);
  const card = (element: LabElement) => (
    <div key={element.id} className="library-specimen"
      onClickCapture={event => { if (skipClick.current) { skipClick.current = false; event.preventDefault(); event.stopPropagation(); } }}
      onPointerDown={event => {
        if (mode !== 'table' || busy || event.button !== 0 || (event.pointerType === 'touch' && !(event.target instanceof HTMLElement && event.target.closest('.library-drag-handle'))) || !(event.target instanceof Element) || event.target.closest('.favorite-button')) return;
        skipClick.current = false;
        (event.target.closest("button") ?? event.currentTarget).setPointerCapture(event.pointerId);
        setExternalDrag({ elementId: element.id, x: event.clientX, y: event.clientY, pointerId: event.pointerId });
      }}>
    <ElementCard
      element={element}
      busy={busy}
      selected={slots.includes(element.id)}
      onSelect={() => pick(element.id)}
      onFavorite={() => favorite(element.id)}
    />
    {mode === "table" && <button className="library-drag-handle" disabled={busy} aria-label={`Trascina ${element.name} sul tavolo`}>↗ Trascina</button>}
    </div>
  );
  return (
    <>
      <main
        id="laboratory"
        className="lab-workspace"
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
          <p className="eyebrow">Il tuo osservatorio</p>
          <h2>Laboratorio</h2>
          <p>Scegli due concetti e prova a combinarli.</p>
          <div className="lab-mode" role="group" aria-label="Modalità del laboratorio">
            <button disabled={busy} aria-pressed={mode === 'classic'} onClick={() => setMode('classic')}>Laboratorio classico</button>
            <button disabled={busy} aria-pressed={mode === 'table'} onClick={() => setMode('table')}>Tavolo libero</button>
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
        <div hidden={mode !== 'table'}>
          <FreeTable elements={model.elements} busy={busy} figures={figures} setFigures={setFigures} add={add}
            combine={experiment ?? (async () => undefined)} externalDrag={externalDrag}
            endExternalDrag={moved => { skipClick.current = moved; setExternalDrag(undefined); }} />
        </div>
        <ReactionStage
          reaction={reaction}
          onViewDetail={onViewDetail}
          busy={busy}
          onUse={() => {
            pendingFocus.current = "a";
            if (mode === "table" && reaction?.element) add(reaction.element.id);
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
        />
        {reaction && ['known', 'anomaly', 'no_reaction'].includes(reaction.kind) && forceCombine && mode === 'classic' && <button className="secondary" disabled={busy} onClick={forceCombine}>Ripeti comunque</button>}
        {hint}
      </main>
      <aside className="library" aria-label="Biblioteca degli elementi">
        <header>
          <p className="eyebrow">Le tue scoperte</p>
          <h2>
            Biblioteca <span>{model.count}</span>
          </h2>
          <button className="library-toggle" aria-expanded={libraryOpen} onClick={() => setLibraryOpen(v => !v)}>{libraryOpen ? 'Comprimi biblioteca' : 'Apri biblioteca'}</button>
          <SearchBar value={query} onChange={value => { setQuery(value); setLimit(120); setLibraryOpen(true); }} inputRef={searchRef} />
          <div className="library-filters">
            <label>Filtra biblioteca<select value={filter} onChange={event => { setFilter(event.target.value as LibraryFilter); setLimit(120); }}>
              <option value="all">Tutti</option>
              <option value="possibilities">Con piste</option><option value="exhausted">Esauriti per ora</option>
              <option value="untested">Mai provati con A</option><option value="known">Ricette note con A</option>
            </select></label>
            <label>Ordina biblioteca<select value={order} onChange={event => { setOrder(event.target.value as LibraryOrder); setLimit(120); }}>
              <option value="relevance">Rilevanza</option><option value="recent">Recenti</option><option value="favorites">Preferiti</option><option value="set">Set</option>
            </select></label>
          </div>
          {!!recent.length && <div className="quick-favorites" aria-label="Ultimi usati">{recent.map(id => <button key={id} disabled={busy} onClick={() => pick(id)}>{lookup(id)?.name}</button>)}</div>}
          <button
            className="favorites-filter"
            aria-pressed={onlyFavorites}
            onClick={() => { setOnlyFavorites((v) => !v); setLimit(120); }}
          >
            ★ Preferiti
          </button>
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
          {slots[0] && (
            <p className="library-context">
              Esperimenti già provati con {lookup(slots[0])?.name}
            </p>
          )}
        </header>
        <div hidden={!libraryOpen}>
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
