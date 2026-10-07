import type { CatalogElement } from "../../application/catalog";
import { ElementArt } from "../components/ElementArt";
export function MapNode({
  element,
  selected,
  x,
  y,
  scale,
  select,
}: {
  element: CatalogElement;
  selected: boolean;
  x: number;
  y: number;
  scale: number;
  select: (id: string) => void;
}) {
  const size = Math.max(selected ? 124 : 84, 44 / scale);
  return (
    <button
      className="map-node"
      aria-pressed={selected}
      style={{
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
      }}
      onClick={() => select(element.id)}
    >
      <ElementArt artKey={element.artKey} />
      <span style={{ fontSize: `${.85 / scale}rem` }}>{element.name}</span>
    </button>
  );
}
