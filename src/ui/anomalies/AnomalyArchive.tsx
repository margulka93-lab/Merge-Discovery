import { Fragment } from "react";
import { Link } from "react-router-dom";
import type { ObservedAnomaly, WorldModel } from "../../application/world";
import { ElementArt } from "../components/ElementArt";

export function AnomalyArchive({
  model,
  retry,
  busy,
}: {
  model: WorldModel;
  retry: (id: string) => void;
  busy: boolean;
}) {
  return (
    <main id="catalog-content" tabIndex={-1} className="anomaly-page">
      <header className="archive-heading">
        <p className="eyebrow">L’archivio dell’osservatorio</p>
        <h2>Archivio anomalie</h2>
        <p>Le reazioni che non hanno ancora trovato una forma.</p>
      </header>
      <div className="anomaly-grid">
        {model.anomalies.map((a) => (
          <AnomalyCard
            key={a.id}
            anomaly={a}
            retry={() => retry(a.id)}
            busy={busy}
          />
        ))}
      </div>
      {!model.anomalies.length && (
        <p>Nessuna reazione osservata disponibile.</p>
      )}
    </main>
  );
}
export function AnomalyCard({
  anomaly,
  retry,
  busy,
}: {
  anomaly: ObservedAnomaly;
  retry: () => void;
  busy: boolean;
}) {
  const date = new Intl.DateTimeFormat("it", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(anomaly.firstObservedAt));
  return (
    <article
      className={`anomaly-card status-${anomaly.status.toLocaleLowerCase("it")}`}
    >
      <span className="archive-orbit" aria-hidden="true">
        ◇
      </span>
      <div className="anomaly-inputs">
        {anomaly.inputs.map((element, i) => (
          <Fragment key={i}>
            {i > 0 && (
              <span aria-hidden="true" className="anomaly-plus">
                +
              </span>
            )}
            <div>
              <Link to={`/elements/${element.id}`}>
                <ElementArt artKey={element.artKey} />
                <strong>{element.name}</strong>
              </Link>
            </div>
          </Fragment>
        ))}
      </div>
      <h3>
        {anomaly.inputs[0].name} + {anomaly.inputs[1].name}
      </h3>
      <p className="anomaly-status">◇ {anomaly.status}</p>
      <p className="observed-date">
        Prima osservazione:{" "}
        <time dateTime={anomaly.firstObservedAt}>{date}</time>
      </p>
      {anomaly.status === "Riesaminabile" && (
        <p className="anomaly-change">Qualcosa è cambiato.</p>
      )}
      {anomaly.result && (
        <p>
          Risultato scoperto:{" "}
          <Link to={`/elements/${anomaly.result.id}`}>
            {anomaly.result.name}
          </Link>
        </p>
      )}
      <button
        className="secondary"
        disabled={busy}
        aria-label={`Riprova ${anomaly.inputs[0].name} + ${anomaly.inputs[1].name} nel Laboratorio`}
        onClick={retry}
      >
        Riprova nel Laboratorio
      </button>
    </article>
  );
}
