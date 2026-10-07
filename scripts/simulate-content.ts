import { loadSeed } from '../src/content/load';
import { simulateReachability } from '../src/domain/simulation/reachability';

const result = simulateReachability(loadSeed());
console.log(JSON.stringify({
  starters: result.starters, totalElements: result.totalElements, reachableElements: result.reachableElements,
  unreachableRequired: result.unreachableRequired, unrevealedSets: result.unrevealedSets,
  blockedUnlocks: result.blockedUnlocks, maxDependencyDepth: result.maxDependencyDepth,
  anomaliesObserved: result.state.observedAnomalyIds, checkpoints: result.checkpoints,
  completedCollectionChapterIds: result.state.completedCollectionChapterIds,
}, null, 2));
if (result.totalElements !== 67 || result.reachableElements !== 67 || result.maxDependencyDepth !== 11 || result.unreachableRequired.length || result.unrevealedSets.length || result.blockedUnlocks.length || result.state.completedCollectionChapterIds.length !== 4 || result.state.observedAnomalyIds.length !== 1 || result.state.resolvedAnomalyIds.length !== 0) throw new Error('Locked seed reachability audit failed');
