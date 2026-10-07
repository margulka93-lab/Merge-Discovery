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
export function Laboratory({
  model,
  hint,
  slots,
  reaction,
  busy,
  select,
  clear,
  combine,
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
  favorite: (id: string) => void;
  onUseResult: () => void;
  repeat: () => void;
  reset: () => void;
  onViewDetail: () => void;
}) {
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
  const filtered = model.elements.filter(
    (e) =>
      (!onlyFavorites || e.favorite) &&
      e.name
        .toLocaleLowerCase("it")
        .includes(query.toLocaleLowerCase("it").trim()),
  );
  const card = (element: LabElement) => (
    <ElementCard
      key={element.id}
      element={element}
      busy={busy}
      selected={slots.includes(element.id)}
      onSelect={() => select(element.id)}
      onFavorite={() => favorite(element.id)}
    />
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
        </header>
        <div className={`experiment ${busy ? "reacting" : ""}`}>
          <div className="celestial-lines" aria-hidden="true" />
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
        <ReactionStage
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
        />
        {hint}
      </main>
      <aside className="library" aria-label="Biblioteca degli elementi">
        <header>
          <p className="eyebrow">Le tue scoperte</p>
          <h2>
            Biblioteca <span>{model.count}</span>
          </h2>
          <SearchBar value={query} onChange={setQuery} inputRef={searchRef} />
          <button
            className="favorites-filter"
            aria-pressed={onlyFavorites}
            onClick={() => setOnlyFavorites((v) => !v)}
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
                    onClick={() => select(e.id)}
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
        <div className="library-grid">{filtered.map(card)}</div>
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
