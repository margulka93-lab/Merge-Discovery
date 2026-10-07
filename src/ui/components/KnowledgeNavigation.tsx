import { NavLink } from 'react-router-dom';

/** Availability comes from the existing disclosure projection, never from route names. */
export function KnowledgeNavigation({ overview, sets, collections }: { overview: boolean; sets: boolean; collections: boolean }) {
  return <nav className="knowledge-navigation" aria-label="Taccuino delle scoperte">
    {overview && <NavLink to="/collection" end>Panoramica</NavLink>}
    {sets && <NavLink to="/sets">Set</NavLink>}
    {collections && <NavLink to="/collections">Collezioni</NavLink>}
  </nav>;
}
