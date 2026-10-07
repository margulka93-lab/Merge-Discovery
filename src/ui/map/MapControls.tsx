import type { MapModel } from "../../application/map";
export function MapControls({
  model,
  change,
  select,
}: {
  model: MapModel;
  change: (key: string, value: string) => void;
  select: (id: string) => void;
}) {
  return (
    <div className="map-controls">
      <label>
        Vista
        <select
          value={model.mode}
          onChange={(e) => change("mode", e.target.value)}
        >
          <option value="ancestry">Come ci sono arrivata?</option>
          <option value="possibilities">Dove posso andare da qui?</option>
          <option value="set">Come è costruito questo dominio?</option>
        </select>
      </label>
      <label>
        Elemento al centro
        <select
          value={model.focus?.id ?? ""}
          onChange={(e) => select(e.target.value)}
        >
          {model.nodes.map((e) => (
            <option value={e.id} key={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </label>
      {model.mode === "ancestry" && (
        <label>
          Profondità
          <select
            value={model.depth}
            onChange={(e) => change("depth", e.target.value)}
          >
            {[1, 2, 3].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "passaggio" : "passaggi"}
              </option>
            ))}
          </select>
        </label>
      )}
      {model.mode === "set" && (
        <label>
          Set rivelato
          <select
            value={model.setId}
            onChange={(e) => change("set", e.target.value)}
          >
            {model.sets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
