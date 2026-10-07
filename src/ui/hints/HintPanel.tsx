import { useCallback, useId, useRef, useState } from "react";
import type { HintModel } from "../../application/directions";
import "./hints.css";
export function HintPanel({
  model,
  offer,
  decline,
  label = "Indizio",
}: {
  model?: HintModel;
  offer?: boolean;
  decline?: () => void;
  label?: string;
}) {
  const [tier, setTier] = useState(0),
    trigger = useRef<HTMLButtonElement>(null),
    id = useId();
  const heading = useRef<HTMLHeadingElement | null>(null);
  const mountHeading = useCallback((node: HTMLHeadingElement | null) => {
    heading.current = node;
    node?.focus();
  }, []);
  const reveal = (next: number) => {
    setTier(next);
    heading.current?.focus();
  };
  const close = () => {
    setTier(0);
    trigger.current?.focus();
  };
  return (
    <section
      className="hint-control"
      aria-label="Indizi"
      onKeyDown={(e) => {
        if (e.key === "Escape" && tier) {
          e.stopPropagation();
          close();
        }
      }}
    >
      {model && label !== "Indizio" && <p>{model.tier1}</p>}
      <button
        ref={trigger}
        className="secondary warm"
        aria-expanded={tier > 0}
        aria-controls={id}
        onClick={() => setTier(tier ? 0 : 1)}
      >
        {label}
      </button>
      {offer && !tier && model?.available && (
        <ProactiveHintOffer request={() => setTier(1)} decline={decline} />
      )}
      {tier > 0 && (
        <div
          id={id}
          className="hint-sheet"
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
          }}
        >
          <h3 tabIndex={-1} ref={mountHeading}>
            Una pista da seguire
          </h3>
          <p role="status" aria-live="polite">
            {!model
              ? "Seleziona prima un elemento nello slot A."
              : tier === 3
                ? (model.tier3 ?? model.tier2 ?? model.tier1)
                : tier === 2
                  ? (model.tier2 ?? model.tier1)
                  : model.tier1}
          </p>
          {model?.available && tier === 1 && (
            <button onClick={() => reveal(2)}>Dammi una direzione</button>
          )}
          {model?.tier3 && tier === 2 && (
            <button onClick={() => reveal(3)}>Più chiaro</button>
          )}
          <button onClick={close}>Chiudi indizio</button>
        </div>
      )}
    </section>
  );
}

export function ProactiveHintOffer({
  request,
  decline,
}: {
  request: () => void;
  decline?: () => void;
}) {
  return (
    <div className="hint-offer" role="status">
      <span>Vuoi un indizio?</span>
      <button onClick={request}>Leggero</button>
      <button onClick={decline}>Non ora</button>
    </div>
  );
}
