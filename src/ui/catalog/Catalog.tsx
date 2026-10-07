import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import type {
  CatalogElement,
  CatalogModel,
  CatalogSet,
  ElementDetailModel,
  KnownRecipe,
} from "../../application/catalog";
import { ElementCard } from "../components/LabComponents";
import { ElementArt } from "../components/ElementArt";

interface CatalogProps {
  model: CatalogModel;
  favorite: (id: string) => void;
  busy: boolean;
  thematic?: import("react").ReactNode;
  setsAvailable?: boolean;
  collectionAvailable?: boolean;
}
export function CompletionBar({ set }: { set: CatalogSet }) {
  if (!set.completion) return null;
  const c = set.completion;
  return (
    <div className="completion">
      <span>
        {c.discovered}/{c.total} elementi · {Math.round(c.percent)}%
      </span>
      <div
        role="progressbar"
        aria-label={`Completamento ${set.name}`}
        aria-valuenow={Math.round(c.percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="completion-track"
      >
        <i style={{ width: `${c.percent}%` }} />
      </div>
      {(set.earned || c.complete) && <strong>✓ Set completato</strong>}
    </div>
  );
}
export function SetCard({ set }: { set: CatalogSet }) {
  const content = (
    <>
      <div className="set-art">
        <ElementArt artKey={set.artKey} />
      </div>
      <div>
        <h3>{set.name}</h3>
        {set.revealed ? (
          <>
            <CompletionBar set={set} />
            {set.newPossibilities && <p>✧ Nuove possibilità</p>}
          </>
        ) : (
          <p>◈ Non ancora sbloccato</p>
        )}
      </div>
    </>
  );
  return (
    <article className={`set-card ${set.revealed ? "" : "locked"}`}>
      {set.revealed ? <Link to={`/sets/${set.id}`}>{content}</Link> : content}
    </article>
  );
}
function ElementGrid({
  elements,
  favorite,
  busy,
}: Pick<CatalogProps, "favorite" | "busy"> & { elements: CatalogElement[] }) {
  return (
    <div className="catalog-grid">
      {elements.map((element) => (
        <CatalogCard
          key={element.id}
          element={element}
          favorite={favorite}
          busy={busy}
        />
      ))}
    </div>
  );
}
function CatalogCard({
  element,
  favorite,
  busy,
}: { element: CatalogElement } & Pick<CatalogProps, "favorite" | "busy">) {
  const navigate = useNavigate();
  // The shared card retains the same save-backed star and art as the Laboratory.
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
export function PossibilityStatus({ element }: { element: CatalogElement }) {
  return (
    <p className="possibility-status">
      {element.stale
        ? "Una vecchia reazione potrebbe essere cambiata."
        : element.possibilities
          ? "Ha ancora reazioni da scoprire."
          : "Hai esplorato tutte le reazioni attualmente note con ciò che possiedi."}
    </p>
  );
}
interface Filters {
  query: string;
  set: string;
  rarity: string;
  state: string;
  sort: string;
}
const initialFilters: Filters = {
  query: "",
  set: "",
  rarity: "",
  state: "",
  sort: "recent",
};
const rarityOrder = ["common", "uncommon", "rare", "extraordinary", "secret"];
export function CatalogSearch({
  value,
  change,
  id,
}: {
  value: string;
  change: (value: string) => void;
  id: string;
}) {
  return (
    <div role="search" className="catalog-search">
      <label htmlFor={id}>Cerca nelle scoperte</label>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => change(e.target.value)}
        placeholder="Elemento o Set…"
      />
    </div>
  );
}
export function FilterPanel({
  filters,
  change,
  sets,
  rarities,
  withinSet,
}: {
  filters: Filters;
  change: (value: Filters) => void;
  sets: CatalogSet[];
  rarities: CatalogElement[];
  withinSet?: boolean;
}) {
  const [open, setOpen] = useState(false),
    button = useRef<HTMLButtonElement>(null),
    first = useRef<HTMLSelectElement>(null),
    id = useId();
  useEffect(() => {
    if (open) first.current?.focus();
  }, [open]);
  const close = () => {
    setOpen(false);
    button.current?.focus();
  };
  const field =
    (key: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement>) =>
      change({ ...filters, [key]: e.target.value });
  return (
    <div className="catalog-filters">
      <button
        ref={button}
        className="filter-toggle"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => (open ? close() : setOpen(true))}
      >
        Filtri e ordinamento
      </button>
      <div
        id={id}
        className={`filter-panel ${open ? "open" : ""}`}
        onKeyDown={(e) => {
          if (e.key === "Escape" && open) {
            e.stopPropagation();
            close();
          }
        }}
      >
        <label>
          {" "}
          {withinSet ? "Rarità" : "Set"}
          <select
            aria-label={withinSet ? "Rarità" : "Set"}
            ref={first}
            value={withinSet ? filters.rarity : filters.set}
            onChange={field(withinSet ? "rarity" : "set")}
          >
            <option value="">Tutti{withinSet ? " i tipi" : " i Set"}</option>
            {withinSet
              ? rarityOrder
                  .filter((r) => rarities.some((e) => e.rarityId === r))
                  .map((r) => (
                    <option key={r} value={r}>
                      {rarities.find((e) => e.rarityId === r)!.rarity}
                    </option>
                  ))
              : sets
                  .filter((s) => s.revealed)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
          </select>
        </label>
        {!withinSet && (
          <label>
            Rarità
            <select
              aria-label="Rarità"
              value={filters.rarity}
              onChange={field("rarity")}
            >
              <option value="">Tutte</option>
              {rarityOrder
                .filter((r) => rarities.some((e) => e.rarityId === r))
                .map((r) => (
                  <option key={r} value={r}>
                    {rarities.find((e) => e.rarityId === r)!.rarity}
                  </option>
                ))}
            </select>
          </label>
        )}
        <label>
          Mostra
          <select
            aria-label="Mostra"
            value={filters.state}
            onChange={field("state")}
          >
            <option value="">Tutte le scoperte</option>
            <option value="favorites">Preferiti</option>
            <option value="new">Nuove possibilità</option>
            <option value="exhausted">Attualmente esplorati</option>
          </select>
        </label>
        <label>
          Ordina per
          <select
            aria-label="Ordina per"
            value={filters.sort}
            onChange={field("sort")}
          >
            <option value="recent">Più recenti</option>
            <option value="alpha">Nome</option>
            <option value="set">Ordine del Set</option>
            <option value="rarity">Rarità</option>
          </select>
        </label>
        <button className="filter-close" onClick={close}>
          Chiudi filtri
        </button>
      </div>
    </div>
  );
}
function CatalogList({
  model,
  elements = model.elements,
  withinSet,
  favorite,
  busy,
}: CatalogProps & { elements?: CatalogElement[]; withinSet?: boolean }) {
  const [filters, change] = useState(initialFilters),
    id = useId();
  const filtered = useMemo(() => {
    const q = filters.query.trim().toLocaleLowerCase("it");
    const setOrder = new Map(model.sets.map((s, i) => [s.id, i]));
    return elements
      .filter(
        (e) =>
          (!q ||
            `${e.name} ${e.setName}`.toLocaleLowerCase("it").includes(q)) &&
          (!filters.set || e.setId === filters.set) &&
          (!filters.rarity || e.rarityId === filters.rarity) &&
          (!filters.state ||
            (filters.state === "favorites"
              ? e.favorite
              : filters.state === "new"
                ? e.newPossibilities
                : e.exhausted)),
      )
      .sort((a, b) =>
        filters.sort === "alpha"
          ? a.name.localeCompare(b.name, "it")
          : filters.sort === "rarity"
            ? rarityOrder.indexOf(b.rarityId) -
                rarityOrder.indexOf(a.rarityId) || a.order - b.order
            : filters.sort === "set"
              ? (setOrder.get(a.setId) ?? 0) - (setOrder.get(b.setId) ?? 0) ||
                a.order - b.order
              : Date.parse(b.firstDiscoveredAt) -
                  Date.parse(a.firstDiscoveredAt) || a.order - b.order,
      );
  }, [elements, filters, model.sets]);
  return (
    <>
      <div className="catalog-controls">
        <CatalogSearch
          id={id}
          value={filters.query}
          change={(query) => change({ ...filters, query })}
        />
        <FilterPanel
          filters={filters}
          change={change}
          sets={model.sets}
          rarities={elements}
          withinSet={withinSet}
        />
      </div>
      <p role="status" className="catalog-result-count">
        {filtered.length} scoperte mostrate
      </p>
      <ElementGrid elements={filtered} favorite={favorite} busy={busy} />
      {!filtered.length && <p>Nessun elemento trovato tra le tue scoperte.</p>}
    </>
  );
}
function PageHeading({ title, caption }: { title: string; caption: string }) {
  return (
    <header className="catalog-heading">
      <p className="eyebrow">Il tuo taccuino delle scoperte</p>
      <h2>{title}</h2>
      <p>{caption}</p>
    </header>
  );
}
export function CollectionHome(props: CatalogProps) {
  const { model } = props,
    favorites = model.elements.filter((e) => e.favorite),
    fresh = model.elements.filter((e) => e.newPossibilities);
  return (
    <main id="catalog-content" tabIndex={-1} className="catalog-page">
      <PageHeading
        title="Collezione"
        caption={`${model.elements.length} scoperte · ${model.sets.filter((s) => s.revealed).length} Set rivelati`}
      />
      {props.thematic}
      {props.setsAvailable !== false && (
        <section>
          <div className="section-heading">
            <h3>Set attivi</h3>
            <Link to="/sets">Tutti i Set visibili →</Link>
          </div>
          <div className="set-grid">
            {model.sets.map((s) => (
              <SetCard key={s.id} set={s} />
            ))}
          </div>
        </section>
      )}
      <section>
        <h3>Recenti</h3>
        <ElementGrid elements={model.recent} {...props} />
      </section>
      {!!fresh.length && (
        <section>
          <h3>Nuove possibilità</h3>
          <ElementGrid elements={fresh} {...props} />
        </section>
      )}
      <section>
        <h3>Preferiti</h3>
        {favorites.length ? (
          <ElementGrid elements={favorites} {...props} />
        ) : (
          <p>
            Nessun preferito. Usa la stella sulle carte per aggiungerne uno.
          </p>
        )}
      </section>
      <section>
        <h3>Le tue scoperte</h3>
        <CatalogList {...props} />
      </section>
    </main>
  );
}
export function SetIndex({ model }: CatalogProps) {
  return (
    <main id="catalog-content" tabIndex={-1} className="catalog-page">
      <PageHeading
        title="Set"
        caption="Le regioni del possibile che hai incontrato."
      />
      <div className="set-grid">
        {model.sets.map((s) => (
          <SetCard key={s.id} set={s} />
        ))}
      </div>
    </main>
  );
}
export function UnknownDetail({
  collectionAvailable = true,
}: {
  collectionAvailable?: boolean;
}) {
  return (
    <main id="catalog-content" tabIndex={-1} className="catalog-page">
      <PageHeading
        title="Non ancora scoperto"
        caption="Continua a sperimentare nel Laboratorio."
      />
      {collectionAvailable ? (
        <Link to="/collection">Torna alla Collezione</Link>
      ) : (
        <Link to="/">Torna al Laboratorio</Link>
      )}
    </main>
  );
}
export function SetDetail(props: CatalogProps) {
  const { setId } = useParams(),
    set = props.model.sets.find((s) => s.id === setId);
  if (!set) return <UnknownDetail />;
  return (
    <main
      id="catalog-content"
      tabIndex={-1}
      className="catalog-page set-detail"
    >
      <Link to="/sets">← Set</Link>
      <div className="set-detail-heading">
        <div className="set-art">
          <ElementArt artKey={set.artKey} />
        </div>
        <div>
          <PageHeading
            title={set.name}
            caption={set.revealed ? set.description : "Non ancora sbloccato"}
          />
          <CompletionBar set={set} />
        </div>
      </div>
      {set.revealed && (
        <CatalogList
          key={set.id}
          {...props}
          elements={props.model.elements.filter((e) => e.setId === set.id)}
          withinSet
        />
      )}
    </main>
  );
}
function RecipeLine({ recipe }: { recipe: KnownRecipe }) {
  return (
    <span>
      {recipe.inputs.map((e, i) => (
        <span key={i}>
          {i ? " + " : ""}
          <Link to={`/elements/${e.id}`}>{e.name}</Link>
        </span>
      ))}
      {" → "}
      <Link to={`/elements/${recipe.result.id}`}>{recipe.result.name}</Link>
    </span>
  );
}
export function RelationshipList({ detail }: { detail: ElementDetailModel }) {
  return (
    <section>
      <h3>Relazioni conosciute</h3>
      <h4>Creato da</h4>
      {detail.recipes.length ? (
        <ul className="recipe-list">
          {detail.recipes.map((r) => (
            <li key={`${r.id}-${r.inputs[0].id}-${r.inputs[1].id}`}>
              <RecipeLine recipe={r} />
            </li>
          ))}
        </ul>
      ) : (
        <p>
          {detail.starter ? "Concetto iniziale" : "Nessuna ricetta registrata."}
        </p>
      )}
      <h4>Usato per</h4>
      {detail.usedFor.length ? (
        <ul className="recipe-list">
          {detail.usedFor.map((r) => (
            <li key={`${r.id}-${r.inputs[0].id}-${r.inputs[1].id}`}>
              <RecipeLine recipe={r} />
            </li>
          ))}
        </ul>
      ) : (
        <p>Nessun risultato registrato.</p>
      )}
      {!!detail.anomalies.length && (
        <>
          <h4>Anomalie osservate</h4>
          <ul>
            {detail.anomalies.map((a, i) => (
              <li key={i}>
                <Link to={`/elements/${a.partner.id}`}>{a.partner.name}</Link> ·{" "}
                {a.status}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
export function ExperimentHistory({ detail }: { detail: ElementDetailModel }) {
  return (
    <section>
      <h3>Esperimenti</h3>
      {(
        [
          ["success", "Successi"],
          ["anomaly", "Anomalie"],
          ["no_reaction", "Nessuna reazione"],
        ] as const
      ).map(([outcome, title]) => (
        <div key={outcome}>
          <h4>{title}</h4>
          {detail.experiments.some((e) => e.outcome === outcome) ? (
            <ul>
              {detail.experiments
                .filter((e) => e.outcome === outcome)
                .map((e) => (
                  <li key={e.partner.id}>
                    <Link to={`/elements/${e.partner.id}`}>
                      {e.partner.name}
                    </Link>
                    {e.stale
                      ? " · Una vecchia reazione potrebbe essere cambiata."
                      : ""}
                  </li>
                ))}
            </ul>
          ) : (
            <p>Nessun esperimento registrato.</p>
          )}
        </div>
      ))}
    </section>
  );
}
export function ElementDetail({
  model,
  favorite,
  busy,
  setsAvailable = true,
  collectionAvailable = true,
}: CatalogProps) {
  const { elementId } = useParams(),
    detail = model.detail(elementId ?? "");
  if (!detail)
    return <UnknownDetail collectionAvailable={collectionAvailable} />;
  const e = detail.element;
  return (
    <main
      id="catalog-content"
      tabIndex={-1}
      className="catalog-page element-detail"
    >
      <div className="detail-navigation">
        {collectionAvailable && <Link to="/collection">← Collezione</Link>}
        <Link to="/">Torna al Laboratorio</Link>
      </div>
      <div className="detail-layout">
        <header className="element-portrait">
          <div className="portrait-art">
            <ElementArt artKey={e.artKey} />
          </div>
          <p className="eyebrow">Scheda elemento</p>
          <h2>{e.name}</h2>
          <p>
            {setsAvailable ? (
              <Link to={`/sets/${e.setId}`}>{e.setName}</Link>
            ) : (
              <span>{e.setName}</span>
            )}{" "}
            · {e.rarity}
          </p>
          <button
            className="detail-favorite"
            aria-pressed={e.favorite}
            aria-disabled={busy}
            onClick={() => {
              if (!busy) favorite(e.id);
            }}
          >
            {e.favorite ? "★ Rimuovi dai preferiti" : "☆ Aggiungi ai preferiti"}
          </button>
          <p>{e.description}</p>
          <PossibilityStatus element={e} />
        </header>
        <div className="detail-notes">
          <section>
            <h3>Prima scoperta</h3>
            {detail.starter ? (
              <p>Concetto iniziale</p>
            ) : detail.firstRecipe ? (
              <p>
                <RecipeLine recipe={detail.firstRecipe} />
              </p>
            ) : (
              <p>Prima ricetta non registrata nel salvataggio.</p>
            )}
          </section>
          <section>
            <h3>Ricette conosciute</h3>
            {detail.recipes.length ? (
              <ul className="recipe-list">
                {detail.recipes.map((r) => (
                  <li key={`${r.id}-${r.inputs[0].id}-${r.inputs[1].id}`}>
                    <RecipeLine recipe={r} />
                  </li>
                ))}
              </ul>
            ) : (
              <p>Nessuna ricetta registrata.</p>
            )}
          </section>
          <RelationshipList detail={detail} />
          <ExperimentHistory detail={detail} />
        </div>
      </div>
    </main>
  );
}
