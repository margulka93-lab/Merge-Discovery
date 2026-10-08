import type { ContentPackage } from '../../domain/model/types';
import type { PlayerSave } from '../../domain/model/save';
import { composePacks, compareVersion } from '../../content/packs/compose';
import { type ContentPack, PackError } from '../../content/packs/model';
import { simulateReachability } from '../../domain/simulation/reachability';
import { reconcileContent } from '../updates/reconcile';
import { collectionUnits } from '../../domain/completion/collections';
export function previewPack(seed: ContentPackage, installed: ContentPack[], candidate: ContentPack, oldSave?: PlayerSave) {
  const old = installed.find(p => p.manifest.packId === candidate.manifest.packId);
  if (old && compareVersion(candidate.manifest.version, old.manifest.version) <= 0) throw new PackError(['La versione del pacchetto deve aumentare.']);
  if (old) {
    for (const section of ['elements','recipes','sets','collections','rules','anomalies','unlocks'] as const) {
      for (const item of old.patch[section] ?? []) if (!(candidate.patch[section] ?? []).some(e => e.id === item.id)) throw new PackError([`Rimozione non consentita: ${item.id}`]);
    }
    for (const collection of old.patch.collections ?? []) {
      const updated = candidate.patch.collections!.find(c => c.id === collection.id)!;
      for (const unit of collectionUnits(collection)) if (!collectionUnits(updated).some(c => c.id === unit.id)) throw new PackError([`Rimozione di completamento non consentita: ${unit.id}`]);
    }
  }
  const previous = composePacks(seed, installed);
  if (compareVersion(candidate.manifest.contentVersion, previous.index.content.manifest.contentVersion) <= 0) throw new PackError(['Una nuova composizione richiede contentVersion successiva a quella attiva.']);
  const packs = [...installed.filter(p => p.manifest.packId !== candidate.manifest.packId), candidate];
  const composed = composePacks(seed, packs), simulation = simulateReachability(composed.index);
  const withoutSecrets = simulateReachability(composed.index, { excludeSecrets: true });
  const blockers = [
    ...simulation.unreachableRequired.map(id => `Elemento required irraggiungibile: ${id}`),
    ...withoutSecrets.unreachableRequired.filter(id => !simulation.unreachableRequired.includes(id)).map(id => `Required dipende da segreti: ${id}`),
    ...simulation.blockedUnlocks.map(u => `Unlock irraggiungibile/ciclo: ${u.id}`),
    ...simulation.unrevealedSets.filter(id => composed.index.content.elements.some(e => e.setId === id && e.completion === 'required')).map(id => `Set required non rivelabile: ${id}`),
    ...composed.index.content.collections.flatMap(c => collectionUnits(c).filter(unit => unit.memberElementIds.every(id => composed.index.elements.get(id)!.completion === 'required') && !simulation.state.completedCollectionChapterIds.includes(unit.id)).map(unit => `Collezione required non completabile: ${unit.id}`)),
  ];
  if (blockers.length) throw new PackError(blockers);
  const content = composed.index.content;
  const downstream = new Map<string, number>();
  for (const recipe of content.recipes) for (const id of new Set(recipe.inputs)) downstream.set(id, (downstream.get(id) ?? 0) + 1);
  const terminal = content.elements.filter(e => !downstream.has(e.id)).map(e => e.id);
  const longChains = Object.entries(simulation.depths).filter(([,depth]) => depth >= 10).map(([id,depth]) => ({ id, depth }));
  const ingredientUse = [...downstream].sort((a,b) => b[1]-a[1]).slice(0,10).map(([id,uses]) => ({ id, uses }));
  const alternateResults = [...new Set(content.recipes.map(r => r.resultElementId))].filter(id => content.recipes.filter(r => r.resultElementId === id).length > 1);
  const updated = old ? Object.keys(candidate.patch).flatMap(section => ['elements','recipes','sets','collections'].includes(section) ? (candidate.patch[section as 'elements'] ?? []).filter(e => (old.patch[section as 'elements'] ?? []).some(p => p.id === e.id)).map(e => e.id) : []) : [];
  const compatibility = oldSave ? reconcileContent(oldSave, composed.index) : undefined;
  if (compatibility && (compatibility.save.xp !== oldSave!.xp || JSON.stringify(compatibility.save.discoveredElements) !== JSON.stringify(oldSave!.discoveredElements) || JSON.stringify(compatibility.save.discoveredRecipeIds) !== JSON.stringify(oldSave!.discoveredRecipeIds))) throw new PackError(['Compatibilità save non sicura: progresso precedente non preservato.']);
  if (compatibility && oldSave) {
    for (const field of ['revealedSetIds','completedSetIds','completedCollectionChapterIds','favoriteElementIds'] as const) {
      if (oldSave[field].some(id => !compatibility.save[field].includes(id))) throw new PackError([`Compatibilità save non sicura: ${field} non preservato.`]);
    }
    for (const field of ['anomalies','testedPairs'] as const) {
      for (const [id, value] of Object.entries(oldSave[field])) if (JSON.stringify(value) !== JSON.stringify((compatibility.save[field] as Record<string, unknown>)[id])) throw new PackError([`Compatibilità save non sicura: ${field} non preservato.`]);
    }
    if (compatibility.notices.includes('optional_references_quarantined')) throw new PackError(['Compatibilità save non sicura: riferimenti precedenti spostati in quarantena.']);
  }
  return { ...composed, candidate, report: {
    packId: candidate.manifest.packId, version: candidate.manifest.version, reviewStatus: candidate.manifest.reviewStatus,
    contentVersion: content.manifest.contentVersion, addedElements: content.elements.length - previous.index.elements.size,
    addedRecipes: content.recipes.length - previous.index.content.recipes.length, updated, removed: [] as string[],
    total: simulation.totalElements, reachable: simulation.reachableElements, depth: simulation.maxDependencyDepth,
    checkpoints: simulation.checkpoints, terminal, longChains, ingredientUse, alternateResults,
    unlockPaths: content.unlocks.map(u => ({ id: u.id, target: u.target, requirements: u.requirements })),
    unreachableBonus: content.elements.filter(e => e.completion === 'bonus' && !simulation.state.discoveredElementIds.includes(e.id)).map(e => e.id),
    unreachableSecret: content.elements.filter(e => e.completion === 'secret' && !simulation.state.discoveredElementIds.includes(e.id)).map(e => e.id),
    setConnections: content.sets.map(s => ({ id: s.id, inbound: content.recipes.filter(r => composed.index.elements.get(r.resultElementId)!.setId === s.id && r.inputs.some(id => composed.index.elements.get(id)!.setId !== s.id)).length })),
    completedCollections: simulation.state.completedCollectionChapterIds,
    warnings: [...(longChains.length ? ['Catene di almeno 10 passaggi: la difficoltà richiede revisione umana.'] : []), ...(terminal.length ? ['Elementi terminali: verificare il valore collezionabile.'] : []), ...(Object.keys(candidate.manifest.assets).length < (candidate.patch.elements?.length ?? 0) ? ['Artwork incompleto: fallback simbolico esplicito.'] : [])],
    compatibility: { unchangedXpAndDiscoveries: true, notices: compatibility?.notices ?? [] },
    assetBytes: Object.values(candidate.assets).reduce((n,a) => n+a.byteLength,0),
    canonicalApproval: 'PENDING / installazione locale non approva il canone',
  } };
}
