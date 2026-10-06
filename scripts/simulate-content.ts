import { loadSeed } from '../src/content/load';
import { simulateReachability } from '../src/domain/simulation/reachability';

const result = simulateReachability(loadSeed());
console.log(JSON.stringify({
  starters: result.starters, totalElements: result.totalElements, reachableElements: result.reachableElements,
  unreachableRequired: result.unreachableRequired, unrevealedSets: result.unrevealedSets,
  blockedUnlocks: result.blockedUnlocks, maxDependencyDepth: result.maxDependencyDepth,
  anomaliesObserved: result.state.observedAnomalyIds, checkpoints: result.checkpoints,
}, null, 2));
if (result.totalElements !== 67 || result.reachableElements !== 67 || result.maxDependencyDepth !== 11 || result.unreachableRequired.length || result.unrevealedSets.length || result.blockedUnlocks.length) throw new Error('Locked seed reachability audit failed');
