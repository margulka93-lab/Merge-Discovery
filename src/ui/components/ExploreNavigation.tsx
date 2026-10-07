import { NavLink } from "react-router-dom";
/** Availability is supplied by the existing disclosure projection. */
export function ExploreNavigation({ map, anomalies }: { map: boolean; anomalies: boolean }) {
  return <nav className="explore-navigation" aria-label="Strumenti dell’osservatorio">
    {map && <NavLink to="/explore/map">Mappa</NavLink>}
    {anomalies && <NavLink to="/explore/anomalies">Anomalie</NavLink>}
  </nav>;
}
