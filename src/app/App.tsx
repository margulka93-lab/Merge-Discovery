import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  BrowserRouter,
  MemoryRouter,
  Routes,
  Route,
  useInRouterContext,
  useLocation,
  useNavigate,
  Link,
  Navigate,
} from "react-router-dom";
import {
  createCurrentDirectionSelector,
  projectHint,
} from "../application/directions";
import { createMapProjector } from "../application/map";
import {
  initialHintSession,
  recordHintExperiment,
  offerHint,
  declineHint,
} from "../application/hintSession";
import { HintPanel } from "../ui/hints/HintPanel";
import { createCatalogProjector } from "../application/catalog";
import { featureDisclosure, routeAvailable } from "../application/disclosure";
import { createWorldProjector } from "../application/world";
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
import { AppShell } from "../ui/shell/AppShell";
import { KnowledgeNavigation } from "../ui/components/KnowledgeNavigation";
import { Laboratory } from "../ui/lab/Laboratory";
import { InlineNotice } from "../ui/components/LabComponents";
import { saveRuntime } from "./saveRuntime";

import { updates, registerProductionWorker } from '../platform/pwa/updates';
import { audio } from '../platform/audio/AudioEngine';
import { reactionPresentation } from '../application/presentation';
import { UpdateNotice } from '../ui/platform/UpdateNotice';
import { PlatformRecovery } from './PlatformRecovery';
import { exportRawRecovery } from './rawRecovery';
const DiscoveryMap = lazy(() => import('../ui/map/DiscoveryMap').then(m => ({ default: m.DiscoveryMap })));
const AnomalyArchive = lazy(() => import('../ui/anomalies/AnomalyArchive').then(m => ({ default: m.AnomalyArchive })));
const SaveDiagnostics = lazy(() => import('../ui/SaveDiagnostics').then(m => ({ default: m.SaveDiagnostics })));
const SettingsPanel = lazy(() => import('../ui/settings/SettingsPanel').then(m => ({ default: m.SettingsPanel })));
const ThematicCollections = lazy(() => import('../ui/collections/ThematicCollections').then(m => ({ default: m.ThematicCollections })));
const ThematicCollectionDetail = lazy(() => import('../ui/collections/ThematicCollections').then(m => ({ default: m.ThematicCollectionDetail })));
const ThematicCollectionSection = lazy(() => import('../ui/collections/ThematicCollections').then(m => ({ default: m.ThematicCollectionSection })));
const CollectionHome = lazy(() => import('../ui/catalog/Catalog').then(m => ({ default: m.CollectionHome })));
const SetIndex = lazy(() => import('../ui/catalog/Catalog').then(m => ({ default: m.SetIndex })));
const SetDetail = lazy(() => import('../ui/catalog/Catalog').then(m => ({ default: m.SetDetail })));
const ElementDetail = lazy(() => import('../ui/catalog/Catalog').then(m => ({ default: m.ElementDetail })));
const UnknownDetail = lazy(() => import('../ui/catalog/Catalog').then(m => ({ default: m.UnknownDetail })));

function RouteReady({ path, children }: { path: string; children: React.ReactNode }) {
  useLayoutEffect(() => { if (path !== '/') document.getElementById('catalog-content')?.focus({ preventScroll: true }); }, [path]);
  return children;
}

function RoutedLaboratoryApplication({
  application,
  boot,
}: {
  application: SaveApplication;
  boot: Promise<ApplicationSnapshot>;
}) {
  const [snapshot, setSnapshot] = useState<ApplicationSnapshot>();
  const [slots, setSlots] = useState<[string?, string?]>([]);
  const [reaction, publishReaction] = useState<LabReaction>();
  const updateState = useSyncExternalStore(updates.subscribe, updates.getSnapshot);
  const setReaction = (value?: LabReaction) => {
    updates.setReveal(reactionPresentation(value).acknowledgement);
    publishReaction(value);
  };
  useEffect(() => { void boot.then(registerProductionWorker, registerProductionWorker); return () => updates.setReveal(false); }, [boot]);
  const location = useLocation(),
    navigate = useNavigate();
  const active =
    location.pathname === "/"
      ? "lab"
      : location.pathname.startsWith("/explore/anomalies") ||
          location.pathname === "/anomalies"
        ? "anomalies"
        : location.pathname.startsWith("/explore/map")
          ? "map"
          : location.pathname.startsWith("/elements/") ||
              location.pathname.startsWith("/collections")
            ? "collection"
            : location.pathname.split("/")[1] || "lab";
  const setActive = (id: string) =>
    navigate(
      id === "lab"
        ? "/"
        : id === "anomalies"
          ? "/explore/anomalies"
          : id === "map"
            ? "/explore/map"
            : `/${id}`,
    );
  const projectCatalog = useMemo(
    () => createCatalogProjector(application.index),
    [application],
  );
  const catalog = useMemo(
    () => (snapshot && active !== "lab" ? projectCatalog(snapshot) : undefined),
    [snapshot, active, projectCatalog],
  );
  const projectWorld = useMemo(
    () => createWorldProjector(application.index),
    [application],
  );
  const world = useMemo(
    () => (snapshot && catalog ? projectWorld(snapshot, catalog) : undefined),
    [snapshot, catalog, projectWorld],
  );
  const directionSelector = useMemo(
    () => createCurrentDirectionSelector(application.index),
    [application],
  );
  const projectMap = useMemo(
    () => createMapProjector(application.index),
    [application],
  );
  const [hintSession, setHintSession] = useState(initialHintSession);
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const resize = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  const ready = Boolean(snapshot);
  const previousPath = useRef(location.pathname);
  useEffect(() => {
    if (location.pathname !== "/") {
      const main = document.getElementById("catalog-content");
      main?.focus({ preventScroll: true });
      if (main) {
        main.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    } else if (previousPath.current !== "/")
      document.getElementById("laboratory")?.focus({ preventScroll: true });
    previousPath.current = location.pathname;
  }, [location.pathname, ready]);
  const [error, setError] = useState("");
  const [operationBusy, setBusy] = useState(false);
  const busy = operationBusy || updateState.applying;
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
    const release = updates.beginOperation();
    if (!release) return;
    audio.userGesture();
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
      release();
      setBusy(false);
    }
  };
  const accept = (value: ApplicationSnapshot) => {
    setSnapshot(value);
    setHintSession(initialHintSession);
    setSlots([]);
    setReaction(undefined);
    setActive("lab");
    setError("");
  };
  if (!snapshot)
    return (
      <Suspense fallback={<main className="boot-screen">Apertura…</main>}><main className="boot-screen">
        <h1>Merge Discovery</h1>
        {error ? (
          <>
            <InlineNotice message={error} error />
            <SaveDiagnostics
              beginOperation={updates.beginOperation}
              application={application}
              boot={boot}
              onSnapshot={accept}
            />
          </>
        ) : (
          <p role="status">Apertura dell’osservatorio…</p>
        )}
      </main></Suspense>
    );
  const model = laboratoryModel(snapshot, application.index, slots[0]);
  const features = featureDisclosure(snapshot, application.index);
  const available = routeAvailable(location.pathname, features);
  const currentDirections = directionSelector(snapshot);
  const hintFor = (id?: string) =>
    projectHint(snapshot, application.index, currentDirections, id);
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
      <UpdateNotice state={updateState} accept={() => { updates.accept(); }} defer={() => { updates.defer(); document.getElementById(active === 'lab' ? 'laboratory' : 'catalog-content')?.focus({ preventScroll: true }); }} />
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
          hint={
            features.map && (
              <HintPanel
                key={`${slots[0]}-${snapshot.revision}`}
                model={hintFor(slots[0])}
                offer={offerHint(
                  hintSession,
                  snapshot.save.settings.proactiveHints,
                )}
                decline={() => setHintSession(declineHint(hintSession))}
              />
            )
          }
          slots={slots}
          reaction={reaction}
          busy={busy}
          select={(id) => {
            if (busy || (slots[0] && slots[1])) return;
            audio.userGesture();
            void audio.play("ui_select", snapshot.save.settings.soundEnabled);
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
                snapshot,
              );
              setHintSession((previous) =>
                recordHintExperiment(
                  previous,
                  transaction.resolution,
                  transaction.snapshot.derived.collections.some(
                    (c) =>
                      !snapshot.derived.collections.some(
                        (old) => old.id === c.id,
                      ),
                  ),
                ),
              );
              setSnapshot(transaction.snapshot);
              setReaction(outcome);
              const cue = reactionPresentation(outcome).audio;
              if (cue) void audio.play(cue, transaction.snapshot.save.settings.soundEnabled);
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
            updates.setReveal(false);
            if (reaction?.element) navigate(`/elements/${reaction.element.id}`);
          }}
          reset={reset}
        />
      </div>
      <Suspense fallback={<main id="catalog-content" tabIndex={-1} className="destination-panel"><p>La schermata si sta aprendo…</p></main>}><RouteReady path={location.pathname}>
      {catalog &&
        active !== "lab" &&
        available &&
        ["collection", "sets", "anomalies", "map"].includes(active) && (
          <Routes>
            <Route
              path="/map"
              element={
                <Navigate replace to={`/explore/map${location.search}`} />
              }
            />
            <Route
              path="/explore/map"
              element={
                world && (
                  <DiscoveryMap
                    model={projectMap(
                      snapshot,
                      catalog,
                      world,
                      Object.fromEntries(new URLSearchParams(location.search)),
                      mobile,
                    )}
                  />
                )
              }
            />
            <Route
              path="/collection"
              element={
                <CollectionHome
                  navigation={<KnowledgeNavigation overview={features.collection} sets={features.sets} collections={!!world?.collections.length} />}
                  model={catalog}
                  favorite={(id) => preferences({ favoriteElementId: id })}
                  busy={busy}
                  thematic={
                    world && <ThematicCollectionSection model={world} />
                  }
                  setsAvailable={features.sets}
                />
              }
            />
            <Route
              path="/sets"
              element={
                <SetIndex
                  navigation={<KnowledgeNavigation overview={features.collection} sets={features.sets} collections={!!world?.collections.length} />}
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
                  navigation={<KnowledgeNavigation overview={features.collection} sets={features.sets} collections={!!world?.collections.length} />}
                  model={catalog}
                  favorite={(id) => preferences({ favoriteElementId: id })}
                  busy={busy}
                  mapAvailable={features.map}
                />
              }
            />
            <Route
              path="/elements/:elementId"
              element={
                <ElementDetail
                  navigation={<KnowledgeNavigation overview={features.collection} sets={features.sets} collections={!!world?.collections.length} />}
                  model={catalog}
                  favorite={(id) => preferences({ favoriteElementId: id })}
                  busy={busy}
                  setsAvailable={features.sets}
                  collectionAvailable={features.collection}
                  mapAvailable={features.map}
                  hint={(id) =>
                    features.map && (
                      <HintPanel
                        key={`${id}-${snapshot.revision}`}
                        model={hintFor(id)}
                        label="Chiedi un indizio"
                      />
                    )
                  }
                />
              }
            />
            <Route
              path="/collections"
              element={world && <ThematicCollections model={world} navigation={<KnowledgeNavigation overview={features.collection} sets={features.sets} collections={!!world.collections.length} />} />}
            />
            <Route
              path="/collections/:collectionId"
              element={
                world && (
                  <ThematicCollectionDetail
                    navigation={<KnowledgeNavigation overview={features.collection} sets={features.sets} collections={!!world.collections.length} />}
                    model={world}
                    favorite={(id) => preferences({ favoriteElementId: id })}
                    busy={busy}
                  />
                )
              }
            />
            <Route
              path="/anomalies"
              element={<Navigate replace to="/explore/anomalies" />}
            />
            <Route
              path="/explore/anomalies"
              element={
                world && (
                  <AnomalyArchive
                    model={world}
                    busy={busy}
                    retry={(id) => {
                      if (busy) return;
                      const anomaly = world.anomalies.find((a) => a.id === id);
                      if (!anomaly) return;
                      setSlots([anomaly.inputs[0].id, anomaly.inputs[1].id]);
                      setReaction(undefined);
                      setAnnouncement(
                        `${anomaly.inputs[0].name} e ${anomaly.inputs[1].name} pronti nel Laboratorio. Premi Combina per riprovare.`,
                      );
                      navigate("/");
                    }}
                  />
                )
              }
            />
            <Route
              path="*"
              element={
                <UnknownDetail collectionAvailable={features.collection} />
              }
            />
          </Routes>
        )}
      {active !== "lab" && !available && (
        <main id="catalog-content" tabIndex={-1} className="destination-panel">
          <h2>Non ancora disponibile</h2>
          <Link to="/">Torna al Laboratorio</Link>
        </main>
      )}
      {active !== "lab" &&
        available &&
        !["collection", "sets", "anomalies", "map"].includes(active) && (
          <main
            id="catalog-content"
            tabIndex={-1}
            className="destination-panel"
          >
            <p className="eyebrow">Il tuo osservatorio</p>
            <h2>
              {active === "explore"
                ? "Esplora"
                : model.destinations.find((d) => d.id === active)?.label}
            </h2>
            {active === "settings" ? (
              <SettingsPanel model={model} snapshot={snapshot} busy={busy} preferences={preferences} application={application} boot={boot} accept={accept} beginOperation={updates.beginOperation} />
            ) : (
              <>
                <p>
                  {active === "explore"
                    ? "Esplora le relazioni conosciute e le anomalie osservate."
                    : "Questa destinazione è stata sbloccata. La sua schermata sarà disponibile in una fase successiva."}
                </p>
                {active === "explore" && (
                  <div>
                    {features.anomalies && (
                      <Link to="/explore/anomalies">Archivio anomalie</Link>
                    )}
                    {features.map && <Link to="/explore/map">Mappa</Link>}
                  </div>
                )}
              </>
            )}
            <button className="secondary warm" onClick={() => setActive("lab")}>
              Torna al laboratorio
            </button>
          </main>
        )}
      </RouteReady></Suspense>
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
const status = engineStatus();
export function App() {
  return status.ready ? (
    <BrowserRouter>
      <LaboratoryApplication {...saveRuntime()} />
    </BrowserRouter>
  ) : (
    <PlatformRecovery fatal exportRaw={exportRawRecovery} reload={() => window.location.reload()} />
  );
}
