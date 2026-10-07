import '../../styles/catalog.css';
import '../../styles/world.css';
import { useId, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import type { ThematicCollection, WorldModel } from "../../application/world";
import type { CatalogElement } from "../../application/catalog";
import { ElementCard } from "../components/LabComponents";
import { UnknownDetail } from "../catalog/Catalog";

export function CollectionProgress({
  collection,
}: {
  collection: ThematicCollection;
}) {
  return (
    <div className="completion">
      <span>
        {collection.discovered}/{collection.total} scoperte ·{" "}
        {Math.round(collection.percent)}%
      </span>
      <div
        role="progressbar"
        aria-label={`Progresso ${collection.name}`}
        aria-valuenow={Math.round(collection.percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="completion-track"
      >
        <i style={{ width: `${collection.percent}%` }} />
      </div>
      <strong>
        {collection.earned ? "✓ Collezione completata" : "In corso"}
      </strong>
    </div>
  );
}
export function ThematicCollectionCard({
  collection,
}: {
  collection: ThematicCollection;
}) {
  return (
    <article className="thematic-card">
      <Link to={`/collections/${collection.id}`}>
        <span aria-hidden="true" className="collection-symbol">
          ✧
        </span>
        <h3>{collection.name}</h3>
        <p>{collection.description}</p>
        <CollectionProgress collection={collection} />
      </Link>
    </article>
  );
}
export function ThematicCollectionSection({ model }: { model: WorldModel }) {
  if (!model.collections.length) return null;
  return (
    <section aria-label="Collezioni tematiche">
      <div className="section-heading">
        <h3>Collezioni tematiche</h3>
        <Link to="/collections">Tutte le collezioni visibili →</Link>
      </div>
      <p>Piccoli percorsi che attraversano le tue scoperte.</p>
      <div className="thematic-grid">
        {model.collections.slice(0, 3).map((c) => (
          <ThematicCollectionCard key={c.id} collection={c} />
        ))}
      </div>
    </section>
  );
}
export function ThematicCollections({ model }: { model: WorldModel }) {
  const [query, setQuery] = useState(""),
    id = useId();
  const filtered = useMemo(
    () =>
      model.collections.filter((c) =>
        c.name
          .toLocaleLowerCase("it")
          .includes(query.trim().toLocaleLowerCase("it")),
      ),
    [query, model.collections],
  );
  return (
    <main id="catalog-content" tabIndex={-1} className="catalog-page">
      <Link to="/collection">← Collezione</Link>
      <header className="catalog-heading">
        <p className="eyebrow">Percorsi facoltativi</p>
        <h2>Collezioni tematiche</h2>
        <p>Ogni tema unisce scoperte di mondi diversi.</p>
      </header>
      <div role="search" className="catalog-search">
        <label htmlFor={id}>Cerca nelle collezioni visibili</label>
        <input
          id={id}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="thematic-grid">
        {filtered.map((c) => (
          <ThematicCollectionCard key={c.id} collection={c} />
        ))}
      </div>
      {!filtered.length && <p>Nessuna collezione visibile trovata.</p>}
    </main>
  );
}
export function ThematicCollectionDetail({
  model,
  favorite,
  busy,
}: {
  model: WorldModel;
  favorite: (id: string) => void;
  busy: boolean;
}) {
  const { collectionId } = useParams(),
    collection = model.collections.find((c) => c.id === collectionId);
  if (!collection) return <UnknownDetail />;
  return (
    <main
      id="catalog-content"
      tabIndex={-1}
      className="catalog-page thematic-detail"
    >
      <Link to="/collections">← Collezioni tematiche</Link>
      <header className="catalog-heading">
        <p className="eyebrow">Un percorso tra le scoperte</p>
        <h2>{collection.name}</h2>
        <p>{collection.description}</p>
        <CollectionProgress collection={collection} />
      </header>
      {!!collection.chapters.length && (
        <section>
          <h3>Capitoli</h3>
          {collection.chapters.map((chapter) => (
            <p key={chapter.id}>
              {chapter.name} · {chapter.discovered}/{chapter.total} ·{" "}
              {chapter.earned ? "✓ Completato" : "In corso"}
            </p>
          ))}
        </section>
      )}
      <section>
        <h3>Scoperte del percorso</h3>
        <div className="catalog-grid">
          {collection.members.map((e) => (
            <MemberCard
              key={e.id}
              element={e}
              favorite={favorite}
              busy={busy}
            />
          ))}
          {Array.from({ length: collection.missing }, (_, i) => (
            <article key={`missing-${i}`} className="anonymous-member">
              <span aria-hidden="true">○</span>
              <p>Non ancora scoperto</p>
            </article>
          ))}
        </div>
        {!!collection.missing && (
          <p>
            {collection.missing} scoperte ancora da incontrare in questo
            percorso.
          </p>
        )}
      </section>
    </main>
  );
}
function MemberCard({
  element,
  favorite,
  busy,
}: {
  element: CatalogElement;
  favorite: (id: string) => void;
  busy: boolean;
}) {
  const navigate = useNavigate();
  // Normal shared cards; unknown members never supply an ElementDefinition to the UI.
  return (
    <div className="catalog-card">
      <ElementCard
        element={element}
        selected={false}
        busy={busy}
        onSelect={() => navigate(`/elements/${element.id}`)}
        onFavorite={() => favorite(element.id)}
      />
      <Link className="card-detail-link" to={`/elements/${element.id}`}>
        Scheda di {element.name}
      </Link>
    </div>
  );
}
