import { scenePoints, sceneSprites } from '../../application/island/scenePresentation';
import type { SafeWorldProjection } from '../../application/island/projection';
import base from '../../assets/island-proof/base.webp';
import tree from '../../assets/island-proof/tree.webp';
import soil from '../../assets/island-proof/soil.webp';
import water from '../../assets/island-proof/water.webp';
import creature from '../../assets/island-proof/creature.webp';
const rasters: Record<string,string> = {tree,soil,water,ocean:water,creature};

/** Authored modular SVG studies; rough props are deliberately not advertised as final art. */
function Study({ kind }: { kind: string }) {
  return <svg viewBox="0 0 160 100" aria-hidden="true">
    {kind === 'soil' ? <><ellipse cx="80" cy="53" rx="75" ry="36" fill="#443427" opacity=".95"/><path d="M21 50Q65 30 132 57M28 68Q69 45 135 70" stroke="#92734c" strokeWidth="3" fill="none"/><path d="m44 39 8 6m30-4 12 4m-26 18 9 4m27-7 10 4" stroke="#bdd17a" strokeWidth="3"/></> :
    kind === 'water' || kind === 'ocean' ? <><ellipse cx="80" cy="51" rx="76" ry="37" fill="#264e5a"/><ellipse cx="80" cy="48" rx="67" ry="29" fill="#397f8a"/><path d="M25 45q40-20 96 0M45 60q30-12 72 0M36 32q18-6 30-4" stroke="#9bd4c8" strokeWidth="3" fill="none" opacity=".8"/></> :
    kind === 'light' ? <><defs><radialGradient id="proof-daybreak"><stop stopColor="#ffe3a1" stopOpacity=".8"/><stop offset="1" stopColor="#e0ae68" stopOpacity="0"/></radialGradient></defs><ellipse cx="80" cy="50" rx="80" ry="50" fill="url(#proof-daybreak)"/></> :
    kind === 'seed' ? <><ellipse cx="80" cy="78" rx="44" ry="12" fill="#17232a" opacity=".5"/><path d="M54 62Q60 20 116 20Q120 70 72 83Z" fill="#d1a45f" stroke="#705031" strokeWidth="4"/></> :
    kind === 'sprout' ? <><ellipse cx="80" cy="88" rx="48" ry="9" fill="#17232a" opacity=".4"/><path d="M80 91V42" stroke="#658849" strokeWidth="7"/><path d="M80 58Q35 61 24 22Q76 18 80 58M82 44Q89 5 140 14Q134 53 82 44" fill="#91b568" stroke="#426f50" strokeWidth="3"/></> :
    kind === 'creature' ? <><ellipse cx="80" cy="86" rx="60" ry="12" fill="#18282d" opacity=".4"/><path d="M30 62Q12 29 34 17l19 18q30-28 63 1l22-22q22 26-1 49" fill="#e6d1a2"/><ellipse cx="84" cy="64" rx="55" ry="30" fill="#ead6b1"/><circle cx="107" cy="55" r="4" fill="#17242d"/><circle cx="126" cy="66" r="4" fill="#725540"/></> :
    kind === 'rock' ? <><ellipse cx="80" cy="57" rx="72" ry="30" fill="#b8c7b7" opacity=".24"/><path d="m29 68 31-12 28 9 35-21" stroke="#d7dfcf" opacity=".4" strokeWidth="2" fill="none"/></> :
    <><ellipse cx="80" cy="52" rx="70" ry="32" fill={kind === 'lava' ? '#b85f35' : '#b48754'} opacity=".8"/><path d="m22 40 41 12 18-18 24 33 25-7" stroke={kind === 'lava' ? '#ffc479' : '#e1ae65'} strokeWidth="7" fill="none"/></>}
  </svg>;
}
export function WorldScene({ world, action, shore, selectEntity, manifest }: {
  world: SafeWorldProjection; action?: SafeWorldProjection['actions'][number]; shore: 'west' | 'east';
  selectEntity: (id: string) => void; manifest: (anchor: string) => void;
}) {
  return <section className={`proof-scene shore-${shore}`} aria-label="Paesaggio dell’isola">
    <div className="proof-plane">
      <img className="proof-base" src={base} alt="Isola rocciosa dipinta, due rive e bacini asciutti, in un mare sotto le stelle." />
      {world.entities.map(entity => {
        const point = scenePoints[entity.anchorId], sprite = sceneSprites[entity.artKey];
        if (!point || !sprite) return null;
        return <div className={`proof-prop prop-${entity.artKey}`} key={entity.id} data-entity={entity.elementId} data-shore={entity.anchorId.startsWith('east') ? 'east' : 'west'}
          style={{ left: `${(point.x - sprite.pivotX) / 10}%`, top: `${(point.y - sprite.pivotY) / 6.67}%`, width: `${sprite.width / 10}%`, height: `${sprite.height / 6.67}%`, zIndex: 1 + entity.depth }}>
          {rasters[entity.artKey] ? <img src={rasters[entity.artKey]} alt="" /> : <Study kind={entity.artKey} />}
          <button className="proof-prop-hit" aria-label={`Utilizza ${entity.name}, ${entity.zone}`} onClick={() => selectEntity(entity.elementId)} />
        </div>;
      })}
    </div>
    {/* Controls remain screen-sized, separate from the scaled illustration. Textual actions are equivalent. */}
    <div className="proof-scene-caption">{action ? action.name : shore === 'west' ? 'Riva occidentale' : 'Riva orientale'}</div>
    <div className="proof-scene-actions" aria-label="Azioni sul paesaggio">
      {action?.targets.map(t => <button key={t.id} onClick={() => manifest(t.id)}>{t.zone}</button>)}
    </div>
  </section>;
}
