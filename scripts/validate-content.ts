import { loadSeed } from '../src/content/load';
import { simulateReachability } from '../src/domain/simulation/reachability';

const index = loadSeed();
const audit = simulateReachability(index, { excludeSecrets: true });
if (audit.unreachableRequired.length || audit.unrevealedSets.length || audit.blockedUnlocks.length) throw new Error(`Unreachable content / gate cycle / required secret dependency: ${JSON.stringify(audit.blockedUnlocks)} ${audit.unreachableRequired.join(',')}`);
console.log(`Content valid: ${index.elements.size} elements, ${index.content.recipes.length} recipes, ${index.content.sets.length} Sets, ${index.content.collections.length} Collections, ${index.content.anomalies.length} anomaly.`);
console.log('Strict schemas, references, localization, identities, ambiguity, Set completion and non-secret reachability: PASS.');
