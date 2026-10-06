import manifest from './data/manifest.json';
import elements from './data/elements.json';
import sets from './data/sets.json';
import collections from './data/collections.json';
import recipes from './data/recipes.json';
import rules from './data/rules.json';
import anomalies from './data/anomalies.json';
import unlocks from './data/unlocks.json';
import progression from './data/progression.json';
import visibility from './data/visibility.json';
import registries from './data/registries.json';
import migrations from './data/migrations.json';
import it from './localization/it.json';
import { validateContent } from './validate';
import { buildIndex } from './indexes/build';

export const rawSeed = { manifest, elements, sets, collections, recipes, rules, anomalies, unlocks, progression, visibility, registries, migrations, locales: { it } };
export function loadSeed() { return buildIndex(validateContent(rawSeed)); }
