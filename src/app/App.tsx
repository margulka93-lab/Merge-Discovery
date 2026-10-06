import { useEffect, useMemo, useRef, useState } from "react";
import {
  BrowserRouter,
  MemoryRouter,
  Routes,
  Route,
  useInRouterContext,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { createCatalogProjector } from "../application/catalog";
import {
  CollectionHome,
  SetIndex,
  SetDetail,
  ElementDetail,
  UnknownDetail,
} from "../ui/catalog/Catalog";
import { engineStatus } from "../application/diagnostics";
import {
  laboratoryModel,
  laboratoryReaction,
  type LabReaction,
} from "../application/laboratory";
import type {
  ApplicationSnapshot,
  SaveApplication,
} from "../application/save/SaveApplication";
import { saveErrorMessage } from "../application/save/errors";
import { DiagnosticStatus } from "../ui/DiagnosticStatus";
import { SaveDiagnostics } from "../ui/SaveDiagnostics";
import { AppShell } from "../ui/shell/AppShell";
import { Laboratory } from "../ui/lab/Laboratory";
import { InlineNotice } from "../ui/components/LabComponents";
import { saveRuntime } from "./saveRuntime";

function RoutedLaboratoryApplication({
  application,
  boot,
}: {
  application: SaveApplication;
  boot: Promise<ApplicationSnapshot>;
}) {
  const [snapshot, setSnapshot] = useState<ApplicationSnapshot>();
  const [slots, setSlots] = useState<[string?, string?]>([]);
  const [reaction, setReaction] = useState<LabReaction>();
  const location = useLocation(),
    navigate = useNavigate();
  const active =
    location.pathname === "/"
      ? "lab"
      : location.pathname.startsWith("/elements/")
        ? "collection"
        : location.pathname.split("/")[1] || "lab";
  const setActive = (id: string) => navigate(id === "lab" ? "/" : `/${id}`);
  const projectCatalog = useMemo(
    () => createCatalogProjector(application.index),
    [application],
  );
  const catalog = useMemo(
    () => (snapshot && active !== "lab" ? projectCatalog(snapshot) : undefined),
    [snapshot, active, projectCatalog],
  );
  const ready = Boolean(snapshot);
  useEffect(() => {
    if (location.pathname !== "/") {
      const main = document.getElementById("catalog-content");
      main?.focus({ preventScroll: true });
      if (main) {
        main.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    }
  }, [location.pathname, ready]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const lock = useRef(false);
  useEffect(() => {
    let alive = true;
    boot.then(
      (value) => {
        if (alive) setSnapshot(value);
      },
      (cause) => {
        if (alive) setError(saveErrorMessage(cause));
      },
    );
    return () => {
      alive = false;
    };
  }, [boot]);
  const run = async (action: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setAnnouncement("");
    try {
      await action();
    } catch (cause) {
      setError(saveErrorMessage(cause));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const accept = (value: ApplicationSnapshot) => {
    setSnapshot(value);
    setSlots([]);
    setReaction(undefined);
    setActive("lab");
    setError("");
  };
  if (!snapshot)
    return (
      <main className="boot-screen">
        <h1>Merge Discovery</h1>
        {error ? (
          <>
            <InlineNotice message={error} error />
            <SaveDiagnostics
              application={application}
              boot={boot}
              onSnapshot={accept}
            />
          </>
        ) : (
          <p role="status">Apertura dell’osservatorio…</p>
        )}
      </main>
    );
  const model = laboratoryModel(snapshot, application.index, slots[0]);
  const reset = () => {
    setSlots([]);
    setReaction(undefined);
  };
  const preferences = (
    change: Parameters<SaveApplication["updatePreferences"]>[0],
  ) =>
    void run(async () =>
      setSnapshot(await application.updatePreferences(change)),
    );
  return (
    <AppShell model={model} active={active} navigate={setActive}>
      <div
        className="live-announcement sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </div>
      {error && (
        <div className="save-warning">
          <InlineNotice message={error} error />
          <button
            disabled={busy}
            onClick={() =>
              void run(async () => {
                setSnapshot(await application.load());
              })
            }
          >
            Ricarica il progresso salvato
          </button>
        </div>
      )}
      <div className="lab-panels" hidden={active !== "lab"}>
        <Laboratory
          model={model}
          slots={slots}
          reaction={reaction}
          busy={busy}
          select={(id) => {
            if (busy || (slots[0] && slots[1])) return;
            setReaction(undefined);
            setSlots(slots[0] ? [slots[0], id] : [id, slots[1]]);
          }}
          clear={(slot) => {
            setSlots(
              slot === 0 ? [undefined, slots[1]] : [slots[0], undefined],
            );
            setReaction(undefined);
          }}
          combine={() => {
            if (!slots[0] || !slots[1]) return;
            const [a, b] = slots as [string, string];
            setReaction(undefined);
            void run(async () => {
              const transaction = await application.combine(a, b);
              const outcome = laboratoryReaction(
                transaction.resolution,
                transaction.snapshot,
                application.index,
              );
              setSnapshot(transaction.snapshot);
              setReaction(outcome);
              setAnnouncement(outcome.announcement);
            });
          }}
          favorite={(id) => preferences({ favoriteElementId: id })}
          onUseResult={() => {
            if (reaction?.element) setSlots([reaction.element.id]);
            setReaction(undefined);
          }}
          repeat={() => {
            setSlots([slots[0]]);
            setReaction(undefined);
          }}
          onViewDetail={() => {
            if (reaction?.element) navigate(`/elements/${reaction.element.id}`);
          }}
          reset={reset}
        />
      </div>
      {catalog &&
        active !== "lab" &&
        ["collection", "sets"].includes(active) && (
          <Routes>
            <Route
              path="/collection"
              element={
                <CollectionHome
                  model={catalog}
                  favorite={(id) => preferences({ favoriteElementId: id })}
                  busy={busy}
                />
              }
            />
            <Route
              path="/sets"
              element={
                <SetIndex
                  model={catalog}
                  favorite={(id) => preferences({ favoriteElementId: id })}
                  busy={busy}
                />
              }
            />
            <Route
              path="/sets/:setId"
              element={
                <SetDetail
                  model={catalog}
                  favorite={(id) => preferences({ favoriteElementId: id })}
                  busy={busy}
                />
              }
            />
            <Route
              path="/elements/:elementId"
              element={
                <ElementDetail
                  model={catalog}
                  favorite={(id) => preferences({ favoriteElementId: id })}
                  busy={busy}
                />
              }
            />
            <Route path="*" element={<UnknownDetail />} />
          </Routes>
        )}
      {active !== "lab" && !["collection", "sets"].includes(active) && (
        <main id="catalog-content" tabIndex={-1} className="destination-panel">
          <p className="eyebrow">Il tuo osservatorio</p>
          <h2>
            {active === "explore"
              ? "Esplora"
              : model.destinations.find((d) => d.id === active)?.label}
          </h2>
          {active === "settings" ? (
            <>
              <fieldset aria-busy={busy}>
                <legend>Accessibilità</legend>
                <label>
                  <input
                    type="checkbox"
                    aria-disabled={busy}
                    checked={model.reducedMotion}
                    onChange={(e) =>
                      preferences({ reducedMotion: e.target.checked })
                    }
                  />{" "}
                  Movimento ridotto
                </label>
                <label>
                  <input
                    type="checkbox"
                    aria-disabled={busy}
                    checked={model.highContrast}
                    onChange={(e) =>
                      preferences({ highContrast: e.target.checked })
                    }
                  />{" "}
                  Contrasto elevato
                </label>
                <label htmlFor="text-scale">Dimensione del testo</label>
                <select
                  id="text-scale"
                  aria-disabled={busy}
                  value={model.textScale}
                  onChange={(e) =>
                    preferences({
                      textScale: e.target.value as LabModelTextScale,
                    })
                  }
                >
                  <option value="default">Normale</option>
                  <option value="large">Grande</option>
                  <option value="extra_large">Molto grande</option>
                </select>
              </fieldset>
              <details>
                <summary>Salvataggio locale · importazione e recupero</summary>
                <SaveDiagnostics
                  application={application}
                  boot={boot}
                  onSnapshot={accept}
                />
              </details>
            </>
          ) : (
            <>
              <p>
                Questa destinazione è stata sbloccata. La sua schermata sarà
                disponibile in una fase successiva.
              </p>
              {active === "explore" && (
                <div>
                  <button onClick={() => setActive("anomalies")}>
                    Anomalie
                  </button>
                  <button onClick={() => setActive("map")}>Mappa</button>
                </div>
              )}
            </>
          )}
          <button className="secondary warm" onClick={() => setActive("lab")}>
            Torna al laboratorio
          </button>
        </main>
      )}
    </AppShell>
  );
}
export function LaboratoryApplication(
  props: Parameters<typeof RoutedLaboratoryApplication>[0],
) {
  const routed = useInRouterContext();
  return routed ? (
    <RoutedLaboratoryApplication {...props} />
  ) : (
    <MemoryRouter>
      <RoutedLaboratoryApplication {...props} />
    </MemoryRouter>
  );
}
type LabModelTextScale = "default" | "large" | "extra_large";
const status = engineStatus();
export function App() {
  return status.ready ? (
    <BrowserRouter>
      <LaboratoryApplication {...saveRuntime()} />
    </BrowserRouter>
  ) : (
    <DiagnosticStatus {...status} />
  );
}
