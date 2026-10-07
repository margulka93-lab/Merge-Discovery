import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { MapModel, MapRecipe } from "../../application/map";
import { MapControls } from "./MapControls";
import { MapNode } from "./MapNode";
import "./map.css";
export function DiscoveryMap({ model }: { model: MapModel }) {
  const [query, setQuery] = useSearchParams();
  const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });
  const canvas = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const change = (key: string, value: string) => {
    setView({ x: 0, y: 0, zoom: 1 });
    const next = new URLSearchParams(query);
    next.set(key, value);
    setQuery(next);
  };
  useEffect(() => {
    const normalized = new URLSearchParams();
    normalized.set("mode", model.mode);
    normalized.set("depth", String(model.depth));
    if (model.focus) normalized.set("element", model.focus.id);
    if (model.mode === "set" && model.setId) normalized.set("set", model.setId);
    if (query.toString() !== normalized.toString())
      setQuery(normalized, { replace: true });
  }, [query, setQuery, model.mode, model.depth, model.focus, model.setId]);
  const select = (id: string) => change("element", id);
  const columns = Math.max(2, Math.ceil(Math.sqrt(model.nodes.length)));
  const positions = new Map(
    model.nodes.map((e, i) => [
      e.id,
      { x: 100 + (i % columns) * 185, y: 100 + Math.floor(i / columns) * 155 },
    ]),
  );
  const width = Math.max(420, columns * 185 + 20),
    height = Math.max(330, Math.ceil(model.nodes.length / columns) * 155 + 30);
  const [fit, setFit] = useState(1);
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect)
        setFit(
          Math.max(0.55, Math.min(1, rect.width / width, rect.height / height)),
        );
    });
    if (canvas.current) observer.observe(canvas.current);
    return () => observer.disconnect();
  }, [width, height]);
  const recipe = (r: MapRecipe, i: number) => {
    const a = positions.get(r.inputs[0].id)!,
      b = positions.get(r.inputs[1].id)!,
      c = positions.get(r.result.id)!;
    const junction = {
      x: (a.x + b.x + c.x) / 3 + 22,
      y: (a.y + b.y + c.y) / 3 + 32,
    };
    return (
      <g
        key={`${r.id}-${i}`}
        className={r.route === "alternate" ? "alternate-route" : ""}
      >
        <path
          d={`M ${a.x} ${a.y} L ${junction.x} ${junction.y} M ${b.x} ${b.y} L ${junction.x} ${junction.y}`}
        />
        <path
          markerEnd="url(#map-arrow)"
          d={`M ${junction.x} ${junction.y} L ${c.x} ${c.y}`}
        />
        <circle cx={junction.x} cy={junction.y} r="13" />
        <text x={junction.x} y={junction.y + 5} textAnchor="middle">
          {r.inputs[0].id === r.inputs[1].id ? "×2" : "+"}
        </text>
      </g>
    );
  };
  return (
    <main id="catalog-content" tabIndex={-1} className="discovery-map">
      <header>
        <p className="eyebrow">Il tuo osservatorio</p>
        <h2>Mappa delle scoperte</h2>
        <p>
          Due concetti, una reazione. Segui soltanto i percorsi che hai
          incontrato.
        </p>
      </header>
      <MapControls model={model} change={change} select={select} />
      <div className="map-layout">
        <section
          className="map-canvas-panel"
          aria-label="Grafo locale delle scoperte"
          aria-describedby="map-description"
        >
          <div
            className="map-viewport"
            ref={canvas}
            onPointerDown={(e) => {
              if ((e.target as Element).closest("button")) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
            }}
            onPointerUp={(e) => pointers.current.delete(e.pointerId)}
            onPointerCancel={(e) => pointers.current.delete(e.pointerId)}
            onPointerMove={(e) => {
              const previous = pointers.current.get(e.pointerId);
              if (!previous) return;
              const next = { x: e.clientX, y: e.clientY },
                others = [...pointers.current.entries()].filter(
                  ([id]) => id !== e.pointerId,
                );
              const other = others[0]?.[1];
              setView((v) => ({
                x: v.x + next.x - previous.x,
                y: v.y + next.y - previous.y,
                zoom: other
                  ? Math.max(
                      0.4,
                      Math.min(
                        2.5,
                        (v.zoom *
                          Math.hypot(next.x - other.x, next.y - other.y)) /
                          Math.max(
                            1,
                            Math.hypot(
                              previous.x - other.x,
                              previous.y - other.y,
                            ),
                          ),
                      ),
                    )
                  : v.zoom,
              }));
              pointers.current.set(e.pointerId, next);
            }}
          >
            <div
              className="map-space"
              style={{
                width,
                height,
                transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom * fit})`,
              }}
            >
              <svg width={width} height={height} aria-hidden="true">
                <defs>
                  <marker
                    id="map-arrow"
                    markerWidth="8"
                    markerHeight="8"
                    refX="28"
                    refY="3"
                    orient="auto"
                  >
                    <path d="M0,0 L0,6 L6,3 Z" />
                  </marker>
                </defs>
                {model.recipes.map(recipe)}
                {model.anomalies.map((a, i) => {
                  const p = positions.get(a.inputs[0].id)!,
                    q = positions.get(a.inputs[1].id)!;
                  return (
                    <path
                      key={i}
                      className="anomaly-edge"
                      d={`M ${p.x} ${p.y} L ${q.x} ${q.y}`}
                    />
                  );
                })}
              </svg>
              {model.nodes.map((e) => {
                const p = positions.get(e.id)!;
                return (
                  <MapNode
                    key={e.id}
                    element={e}
                    selected={model.focus?.id === e.id}
                    x={p.x}
                    y={p.y}
                    scale={view.zoom * fit}
                    select={select}
                  />
                );
              })}
            </div>
          </div>
          <div className="map-zoom" aria-label="Controlli della mappa">
            <button
              onClick={() =>
                setView((v) => ({ ...v, zoom: Math.min(2.5, v.zoom + 0.2) }))
              }
            >
              Ingrandisci
            </button>
            <button
              onClick={() =>
                setView((v) => ({ ...v, zoom: Math.max(0.4, v.zoom - 0.2) }))
              }
            >
              Riduci
            </button>
            <button onClick={() => setView({ x: 0, y: 0, zoom: 1 })}>
              Centra e ripristina
            </button>
          </div>
          <p id="map-description" className="map-legend">
            + / ×2 Due ingressi · → Risultato conosciuto · Tratto punteggiato:
            anomalia osservata
          </p>
          {model.marker && (
            <div className="possibility-marker">
              ? {model.marker.label}
              {model.marker.count !== undefined
                ? ` · ${model.marker.count} direzioni disponibili`
                : ""}
            </div>
          )}
        </section>
        <RelationshipExplorer model={model} select={select} />
      </div>
    </main>
  );
}
export function RelationshipExplorer({
  model,
  select,
}: {
  model: MapModel;
  select: (id: string) => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const choose = (id: string, event: React.MouseEvent<HTMLButtonElement>) => {
    select(id);
    if (event.detail === 0) heading.current?.focus();
  };
  const line = (r: MapRecipe, i: number) => (
    <li key={`${r.id}-${i}`}>
      <button onClick={(event) => choose(r.inputs[0].id, event)}>
        {r.inputs[0].name}
      </button>{" "}
      +{" "}
      <button onClick={(event) => choose(r.inputs[1].id, event)}>
        {r.inputs[1].name}
      </button>{" "}
      →{" "}
      <button onClick={(event) => choose(r.result.id, event)}>
        {r.result.name}
      </button>
      {r.route === "alternate" && <span> · Alternativa</span>}
    </li>
  );
  return (
    <aside
      className="relationship-explorer"
      aria-label="Esploratore delle relazioni"
    >
      <p className="eyebrow">Relazioni conosciute</p>
      <h3 ref={heading} tabIndex={-1}>
        {model.focus?.name ?? "Le tue scoperte"}
      </h3>
      {model.focus && (
        <Link to={`/elements/${model.focus.id}`}>Apri scheda elemento</Link>
      )}
      <h4>Creato da</h4>
      {model.producing.length ? (
        <ul>{model.producing.map(line)}</ul>
      ) : (
        <p>Nessuna ricetta registrata.</p>
      )}
      <h4>Produce</h4>
      {model.using.length ? (
        <ul>{model.using.map(line)}</ul>
      ) : (
        <p>Nessun risultato registrato.</p>
      )}
      <h4>Ricette alternative conosciute</h4>
      {model.alternatives.length ? (
        <ul>{model.alternatives.map(line)}</ul>
      ) : (
        <p>Nessuna alternativa registrata.</p>
      )}
      <h4>Anomalie osservate</h4>
      {model.anomalies.length ? (
        <ul>
          {model.anomalies.map((a, i) => (
            <li key={i}>
              <button onClick={(event) => choose(a.inputs[0].id, event)}>
                {a.inputs[0].name}
              </button>{" "}
              +{" "}
              <button onClick={(event) => choose(a.inputs[1].id, event)}>
                {a.inputs[1].name}
              </button>{" "}
              · {a.status}
            </li>
          ))}
        </ul>
      ) : (
        <p>Nessuna anomalia osservata.</p>
      )}
      {model.marker && (
        <p>
          {model.marker.label}
          {model.marker.count !== undefined
            ? ` · ${model.marker.count} direzioni disponibili`
            : ""}
        </p>
      )}
      <details>
        <summary>Percorsi mostrati nel grafo</summary>
        <ul>{model.recipes.map(line)}</ul>
      </details>
    </aside>
  );
}
