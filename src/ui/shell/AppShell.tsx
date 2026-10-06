import type { ReactNode } from "react";
import type { Destination, LabModel } from "../../application/laboratory";
import { DiscoveryLevelBadge } from "../components/LabComponents";
function NavigationItems({
  items,
  active,
  navigate,
}: {
  items: Destination[];
  active: string;
  navigate: (id: string) => void;
}) {
  return items.map((d) => (
    <button
      key={d.id}
      aria-current={
        active === d.id ||
        (d.id === "explore" && ["map", "anomalies"].includes(active))
          ? "page"
          : undefined
      }
      onClick={() => navigate(d.id)}
    >
      <span aria-hidden="true">{d.symbol}</span>
      <span>{d.label}</span>
    </button>
  ));
}
export function NavigationRail({
  model,
  active,
  navigate,
}: {
  model: LabModel;
  active: string;
  navigate: (id: string) => void;
}) {
  return (
    <aside className="navigation-rail">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          ✧
        </span>
        <h1>
          Merge
          <br />
          Discovery
        </h1>
      </div>
      <DiscoveryLevelBadge model={model} />
      <nav aria-label="Navigazione principale desktop">
        <NavigationItems
          items={model.destinations}
          active={active}
          navigate={navigate}
        />
      </nav>
      <p className="rail-note">
        Combina. Scopri.
        <br />
        Espandi il possibile.
      </p>
    </aside>
  );
}
export function BottomNavigation({
  model,
  active,
  navigate,
}: {
  model: LabModel;
  active: string;
  navigate: (id: string) => void;
}) {
  return (
    <nav
      className="bottom-navigation"
      aria-label="Navigazione principale mobile"
    >
      <NavigationItems
        items={model.mobileDestinations}
        active={active}
        navigate={navigate}
      />
    </nav>
  );
}
export function AppShell({
  model,
  active,
  navigate,
  children,
}: {
  model: LabModel;
  active: string;
  navigate: (id: string) => void;
  children: ReactNode;
}) {
  return (
    <div
      className={`app-shell text-${model.textScale}${model.highContrast ? " high-contrast" : ""}`}
      data-reduced-motion={model.reducedMotion}
    >
      <a className="skip-link" href={active === "lab" ? "#laboratory" : "#catalog-content"}>
        {active === "lab" ? "Vai al laboratorio" : "Vai al contenuto"}
      </a>
      <NavigationRail model={model} active={active} navigate={navigate} />
      <header className="mobile-header">
        <h1 className="sr-only">Merge Discovery</h1>
        <span className="brand-mark" aria-hidden="true">
          ✧
        </span>
        <DiscoveryLevelBadge model={model} />
      </header>
      {children}
      <BottomNavigation model={model} active={active} navigate={navigate} />
    </div>
  );
}
