import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { rawSeed } from '../src/content/load';
import { validateContent } from '../src/content/validate';

const copy = () => structuredClone(validateContent(rawSeed));

describe('strict authoring pipeline', () => {
  it('rejects unknown fields, malformed keys, invalid enums and absent IDs', () => {
    expect(() => validateContent({ ...rawSeed, unexpected: true })).toThrow();
    const c = copy(); c.elements[0]!.nameKey = 'not a key';
    expect(() => validateContent(c)).toThrow();
    expect(() => validateContent({ ...rawSeed, elements: [{ ...rawSeed.elements[0], rarity: 'legendary' }] })).toThrow();
    expect(() => validateContent({ ...rawSeed, recipes: [{ inputs: ['void', 'energy'] }] })).toThrow();
  });
  it('rejects duplicate IDs and Set sort positions', () => {
    const c = copy(); c.elements.push(c.elements[0]!);
    expect(() => validateContent(c)).toThrow('Duplicate elements IDs');
    const d = copy(); d.sets[1]!.sortOrder = d.sets[0]!.sortOrder;
    expect(() => validateContent(d)).toThrow('Duplicate Set sort positions');
  });
  it('rejects reversed duplicate pair even with a distinct ID', () => {
    const c = copy(); const r = c.recipes[0]!;
    c.recipes.push({ ...r, id: 'test_duplicate', inputs: [r.inputs[1], r.inputs[0]] });
    expect(() => validateContent(c)).toThrow('Ambiguous explicit pair');
  });
  it('accepts unique priorities and rejects overlapping positive gates without them', () => {
    const c = copy(); const r = c.recipes[0]!; r.priority = 1;
    c.recipes.push({ ...r, id: 'test_priority', priority: 2 });
    expect(() => validateContent(c)).not.toThrow();
    c.recipes.at(-1)!.priority = 1;
    c.recipes.at(-1)!.requirements = [{ type: 'element_discovered', elementId: 'star' }];
    expect(() => validateContent(c)).toThrow('Ambiguous explicit pair');
  });
  it.each(['recipe_input', 'recipe_result', 'element_set', 'collection_member', 'anomaly_input', 'unlock_target', 'requirement', 'tag', 'era', 'alias'] as const)('rejects unknown reference: %s', kind => {
    const c = copy();
    switch (kind) {
      case 'recipe_input': c.recipes[0]!.inputs[0] = 'unknown'; break;
      case 'recipe_result': c.recipes[0]!.resultElementId = 'unknown'; break;
      case 'element_set': c.elements[0]!.setId = 'unknown'; break;
      case 'collection_member': c.collections[0]!.memberElementIds.push('unknown'); break;
      case 'anomaly_input': c.anomalies[0]!.inputs[0] = 'unknown'; break;
      case 'unlock_target': c.unlocks[0]!.target = { type: 'set', setId: 'unknown' }; break;
      case 'requirement': c.recipes[0]!.requirements = [{ type: 'feature_unlocked', featureId: 'unknown' }]; break;
      case 'tag': c.elements[0]!.tags.push('unknown'); break;
      case 'era': c.sets[0]!.eraId = 'unknown'; break;
      case 'alias': c.migrations.aliases.test_alias = 'unknown'; break;
    }
    expect(() => validateContent(c)).toThrow('Unknown ID unknown');
  });
  it('rejects missing localization and hidden announcements', () => {
    const c = copy(); delete c.locales.it[c.elements[0]!.nameKey];
    expect(() => validateContent(c)).toThrow('Missing localization');
    const d = copy(); d.visibility.setAnnouncements.push({ setId: 'fungi', paths: [[]] });
    expect(() => validateContent(d)).toThrow('Hidden Set announcement');
  });
  it('rejects missing explicit fallback and unintended recipe/anomaly overlaps', () => {
    const c = copy(); c.recipes[0]!.gateBehavior = 'unlock_trigger';
    expect(() => validateContent(c)).toThrow('Missing authored unlock_trigger fallback');
    const d = copy(); d.anomalies.push({ ...d.anomalies[0]!, id: 'test_overlap', inputs: ['void', 'energy'] });
    expect(() => validateContent(d)).toThrow('Unauthored recipe/anomaly overlap');
  });
  it('rejects equally ranked matching tag rules and multiple anomalies', () => {
    const c = copy();
    c.rules = ['test_a', 'test_b'].map(id => ({ id, inputSelectors: [{}, {}], resultElementId: 'light', priority: 1 }));
    expect(() => validateContent(c)).toThrow('Ambiguous tag rules');
    const d = copy(); d.anomalies.push({ ...d.anomalies[0]!, id: 'test_second_anomaly' });
    expect(() => validateContent(d)).toThrow('Ambiguous anomaly pair');
  });
});

describe('locked seed transcription', () => {
  const spec = readFileSync(new URL('../docs/IMPLEMENTATION_SEED_CONTENT.md', import.meta.url), 'utf8');
  it('matches every canonical recipe pair/result and the Water alternate flag', () => {
    const documented = [...spec.matchAll(/^- `([a-z_]+) \+ ([a-z_]+) → ([a-z_]+)`(.*)$/gm)].map(([, a, b, result, suffix]) => ({ inputs: [a, b], resultElementId: result, discovery: suffix!.includes('alternate') ? 'alternate' : 'normal' }));
    expect(rawSeed.recipes.map(({ inputs, resultElementId, discovery }) => ({ inputs, resultElementId, discovery }))).toEqual(documented);
    expect(documented).toHaveLength(64);
  });
  it('matches all 67 names, rarities, starters and Set ownership', () => {
    const section = spec.split('## Elements')[1]!.split('## Canonical recipes')[0]!;
    const sets = [['Origini', 'origins'], ['Cosmo', 'cosmos'], ['Mondo', 'world'], ['Vita', 'life'], ['Piante', 'plants'], ['Funghi', 'fungi']];
    const documented = sets.flatMap(([name, setId]) => [...section.split(`### ${name}`)[1]!.split('### ')[0]!.matchAll(/^\| ([a-z_]+) \| ([^|]+) \| (common|uncommon|rare) \|(?: (yes|no) \|)?/gm)].map(([, id, label, rarity, starter]) => ({ id, name: label!.trim(), rarity, starter: starter === 'yes', setId })));
    expect(rawSeed.elements.map(e => ({ id: e.id, name: rawSeed.locales.it[e.nameKey as keyof typeof rawSeed.locales.it], rarity: e.rarity, starter: 'starter' in e && e.starter === true, setId: e.setId }))).toEqual(documented);
    expect(documented).toHaveLength(67);
  });
  it('matches all Collection memberships and the exact anomaly message', () => {
    const section = spec.split('## Starter collections')[1]!.split('## Required feature coverage')[0]!;
    const documented = [...section.matchAll(/### ([a-z_]+) — ([^\r\n]+)\r?\n([\s\S]*?)(?=### |$)/g)].map(([, id, name, body]) => ({ id, name, memberElementIds: [...body!.split('Reveal:')[0]!.matchAll(/^- ([a-z_]+)\r?$/gm)].map(m => m[1]) }));
    expect(rawSeed.collections.map(c => ({ id: c.id, name: rawSeed.locales.it[c.nameKey as keyof typeof rawSeed.locales.it], memberElementIds: c.memberElementIds }))).toEqual(documented);
    expect(rawSeed.locales.it['anomalies.lunar_life_instability.message']).toBe('Qualcosa ha reagito, ma non riesci ancora a stabilizzarlo.');
  });
});
