import { reactionPresentation } from '../../application/presentation';
import type { CSSProperties, Ref } from "react";
import type {
  LabElement,
  LabModel,
  LabReaction,
} from "../../application/laboratory";
import { ElementArt } from "./ElementArt";
const accentStyle = (element: LabElement): CSSProperties =>
  ({ "--element-accent": `var(${element.accent})` }) as CSSProperties;
export function DiscoveryLevelBadge({ model }: { model: LabModel }) {
  return (
    <div className="level-badge">
      <span className="level-orbit" aria-hidden="true">
        {model.level}
      </span>
      <div>
        <strong>Livello di Scoperta {model.level}</strong>
        <span>
          {model.count} scoperte · {model.xp} XP
        </span>
        <div
          role="progressbar"
          aria-label="Progresso del livello"
          aria-valuenow={Math.round(model.progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="level-progress"
        >
          <i style={{ width: `${model.progress}%` }} />
        </div>
      </div>
    </div>
  );
}
export function ElementCard({
  element,
  selected,
  busy,
  onSelect,
  onFavorite,
}: {
  element: LabElement;
  selected: boolean;
  busy: boolean;
  onSelect: () => void;
  onFavorite: () => void;
}) {
  return (
    <article
      className={`element-card${selected ? " selected" : ""}`}
      style={accentStyle(element)}
    >
      <button
        className="element-select"
        onClick={onSelect}
        disabled={busy}
        aria-pressed={selected}
        aria-label={`${element.name}, elemento del set ${element.setName}${selected ? ", selezionato" : ""}${element.context ? `, ${element.context}` : ""}`}
      >
        <ElementArt artKey={element.artKey} />
        <strong>{element.name}</strong>
        <span className="set-cue">{element.setName}</span>
        {selected ? <span className="selected-cue">✓ Selezionato</span> : element.context && (
          <span className="context-cue">{element.context}</span>
        )}
      </button>
      <button
        className="favorite-button"
        aria-label={`${element.favorite ? "Rimuovi" : "Aggiungi"} ${element.name} ${element.favorite ? "dai" : "ai"} preferiti`}
        aria-pressed={element.favorite}
        aria-disabled={busy}
        onClick={() => {
          if (!busy) onFavorite();
        }}
      >
        {element.favorite ? "★" : "☆"}
      </button>
    </article>
  );
}
export function ElementSlot({
  letter,
  element,
  busy,
  onClear,
  buttonRef,
}: {
  letter: "A" | "B";
  element?: LabElement;
  busy: boolean;
  onClear: () => void;
  buttonRef?: Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={buttonRef}
      className={`element-slot${element ? " filled" : ""}`}
      style={element && accentStyle(element)}
      onClick={onClear}
      disabled={busy || !element}
      aria-label={
        element
          ? `Rimuovi ${element.name} dallo slot ${letter}`
          : `Slot ${letter} vuoto`
      }
    >
      <span className="slot-label">Elemento {letter}</span>
      {element ? (
        <>
          <span className="slot-specimen"><ElementArt artKey={element.artKey} /></span>
          <strong>{element.name}</strong>
          <span>{element.setName}</span>
          <small className="slot-clear">× Rimuovi</small>
        </>
      ) : (
        <>
          <span className="slot-specimen"><span className="empty-orbit" aria-hidden="true">+</span></span>
          <strong>Scegli un elemento</strong>
          <span>Dalla tua biblioteca</span>
        </>
      )}
    </button>
  );
}
export function CombineButton({
  enabled,
  busy,
  onClick,
}: {
  enabled: boolean;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="combine-button"
      disabled={!enabled}
      aria-disabled={busy || !enabled}
      aria-busy={busy}
      onClick={() => {
        if (!busy) onClick();
      }}
    >
      <span aria-hidden="true">✧</span> {busy ? "Salvataggio…" : "Combina"}
    </button>
  );
}
export function SearchBar({
  value,
  onChange,
  inputRef,
}: {
  value: string;
  onChange: (value: string) => void;
  inputRef?: Ref<HTMLInputElement>;
}) {
  return (
    <div className="search-bar" role="search">
      <label htmlFor="element-search">Cerca tra le tue scoperte</label>
      <div>
        <span aria-hidden="true">⌕</span>
        <input
          ref={inputRef}
          id="element-search"
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Cerca un elemento…"
        />
      </div>
    </div>
  );
}
export function InlineNotice({
  message,
  error = false,
}: {
  message: string;
  error?: boolean;
}) {
  return (
    <p
      className={`inline-notice${error ? " error" : ""}`}
      role={error ? "alert" : "status"}
    >
      {message}
    </p>
  );
}
export function DiscoveryReveal({ reaction }: { reaction: LabReaction }) {
  const element = reaction.element!;
  return (
    <div
      className={`discovery-reveal ${reaction.kind}`}
      style={accentStyle(element)}
    >
      <div className="result-art">
        <ElementArt artKey={element.artKey} />
      </div>
      <div className="result-copy">
      <p className="eyebrow">{reaction.title}</p>
      <h2>{element.name}</h2>
      <div className="result-tags">
        <span>{element.setName}</span>
        <span>{element.rarity}</span>
      </div>
      <p>{reaction.message}</p>
      </div>
    </div>
  );
}
export function ReactionStage({
  reaction,
  busy,
  onUse,
  onRepeat,
  onReset,
  onViewDetail,
}: {
  reaction?: LabReaction;
  busy: boolean;
  onUse: () => void;
  onRepeat: () => void;
  onReset: () => void;
  onViewDetail: () => void;
}) {
  return (
    <section
      className={`reaction-stage ${reaction?.kind ?? "idle"}`}
      data-emphasis={reaction?.emphasis}
      data-motion-tier={reactionPresentation(reaction).tier}
      aria-label="Risultato dell’esperimento"
    >
      {reaction ? (
        <>
          {reaction.element ? (
            <DiscoveryReveal reaction={reaction} />
          ) : (
            <div className="quiet-reaction">
              <span className="reaction-orbit" aria-hidden="true">
                {reaction.kind === "anomaly" ? "◇" : "○"}
              </span>
              <h2>{reaction.title}</h2>
              <p>{reaction.message}</p>
              <small>
                {reaction.announcement !== reaction.title
                  ? reaction.announcement
                  : ""}
              </small>
            </div>
          )}
          {!!reaction.setRevealDetails?.length && (
            <div className="set-reveal-callouts">
              {reaction.setRevealDetails.map((set) => (
                <div key={set.id} className={`set-reveal-callout ${set.kind}`}>
                  <ElementArt artKey={set.motifKey} />
                  <p className="eyebrow">
                    {set.kind === "hidden"
                      ? "Set nascosto scoperto"
                      : set.kind === "secret"
                        ? "Set segreto scoperto"
                        : "Nuovo set"}
                  </p>
                  <h3>Set: {set.name}</h3>
                  <p>{set.line}</p>
                </div>
              ))}
            </div>
          )}
          {!!reaction.collectionCallouts?.length && (
            <div
              className="collection-callouts"
              aria-label="Novità delle collezioni"
            >
              {reaction.collectionCallouts.map((c) => (
                <p key={`${c.id}-${c.kind}`}>
                  <strong>
                    {c.kind === "completed"
                      ? "✓ Collezione completata"
                      : "✧ Nuova collezione tematica"}
                  </strong>{" "}
                  · {c.name}
                </p>
              ))}
            </div>
          )}
          {reaction.remembered && <p className="remembered-reaction">{reaction.kind === "known" ? "Già scoperta" : reaction.kind === "no_reaction" ? "Già provata — nessuna reazione" : "Reazione instabile già osservata"} · Nessuna nuova transazione.</p>}
          <div className="result-actions">
            {reaction.element && (
              <button
                className="secondary"
                disabled={busy}
                onClick={onViewDetail}
              >
                Vedi scheda
              </button>
            )}
            {reaction.element && (
              <button
                className="secondary warm"
                disabled={busy}
                onClick={onUse}
              >
                Usa risultato
              </button>
            )}
            <button className="secondary" disabled={busy} onClick={onRepeat}>
              Ripeti con A
            </button>
            <button className="secondary" disabled={busy} onClick={onReset}>
              Nuovo esperimento
            </button>
          </div>
        </>
      ) : (
        <div className="quiet-reaction idle">
          <span className="reaction-orbit" aria-hidden="true">
            ✧
          </span>
          <p>Ogni scoperta apre nuove possibilità.</p>
          <small>I tuoi elementi sono sempre riutilizzabili.</small>
        </div>
      )}
    </section>
  );
}
