import type { ContentPackage } from '../../domain/model/types';
import { buildIndex } from '../indexes/build';
import { validateContent } from '../validate';
import { PackError, packManifestSchema, packPatchSchema, type ContentPack } from './model';
import { pairKey } from '../../domain/resolver/pair';
export const compareVersion = (a: string, b: string) => {
  const x = a.split('.').map(Number), y = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i]! - y[i]!;
  return 0;
};
/** Dependency order is stable, explicit and independent of ZIP/import enumeration. */
export function orderedPacks(packs: ContentPack[]) {
  const byId = new Map(packs.map(p => [p.manifest.packId, p]));
  if (byId.size !== packs.length) throw new PackError(['packId duplicato.']);
  if (new Set(packs.map(p => p.manifest.namespace)).size !== packs.length) throw new PackError(['namespace già appartenente a un altro pacchetto.']);
  const result: ContentPack[] = [], active = new Set<string>(), done = new Set<string>();
  const visit = (pack: ContentPack) => {
    const id = pack.manifest.packId; if (done.has(id)) return;
    if (active.has(id)) throw new PackError([`Dipendenza circolare: ${id}`]); active.add(id);
    for (const dependency of pack.manifest.dependencies) {
      const source = byId.get(dependency.packId);
      if (!source || source.manifest.version !== dependency.version) throw new PackError([`Dipendenza mancante/incompatibile: ${dependency.packId} ${dependency.version}`]);
      visit(source);
    }
    active.delete(id); done.add(id); result.push(pack);
  };
  [...packs].sort((a,b) => a.manifest.packId < b.manifest.packId ? -1 : a.manifest.packId > b.manifest.packId ? 1 : 0).forEach(visit);
  return result;
}
export function composePacks(seed: ContentPackage, input: ContentPack[]) {
  const content = structuredClone(seed), packs = orderedPacks(input), assets = new Map<string, { pack: ContentPack; bytes: Uint8Array }>();
  for (const pack of packs) {
    const manifest = packManifestSchema.parse(pack.manifest), patch = packPatchSchema.parse(pack.patch);
    if (patch.manifest) throw new PackError(['La versione della composizione va dichiarata nel manifest del pacchetto.']);
    if (compareVersion(manifest.contentVersion, seed.manifest.contentVersion) <= 0) throw new PackError(['contentVersion deve essere successiva al seed.']);
    for (const recipe of patch.recipes ?? []) if ([...seed.recipes,...seed.anomalies].some(r => pairKey(...r.inputs) === pairKey(...recipe.inputs))) throw new PackError([`Override PairKey seed non consentito: ${pairKey(...recipe.inputs)}`]);
    if (patch.unlocks?.some(({ target }) => target.type === 'set' && seed.sets.some(s => s.id === target.setId))) throw new PackError(['Unlock dei Set seed bloccati.']);
    if (patch.visibility?.setAnnouncements.some(v => seed.sets.some(s => s.id === v.setId)) || patch.visibility?.collectionReveals.some(v => seed.collections.some(c => c.id === v.collectionId))) throw new PackError(['Visibility seed bloccata.']);
    for (const section of ['elements','recipes','sets','collections','rules','anomalies','unlocks'] as const) {
      const existing = new Set(content[section].map(e => e.id));
      for (const item of patch[section] ?? []) {
        if (existing.has(item.id)) throw new PackError([`Collisione ID / override non consentito: ${section}.${item.id}`]);
        if (section === 'elements' && 'starter' in item && item.starter) throw new PackError(['I pacchetti non possono attribuire nuovi starter automaticamente.']);
        existing.add(item.id);
      }
      // These canonical module arrays share identity semantics; Zod checks their concrete shapes.
      Object.assign(content, { [section]: [...content[section], ...(patch[section] ?? [])] });
    }
    for (const registry of ['tags','features','eras'] as const) content.registries[registry] = [...new Set([...content.registries[registry], ...(patch.registries?.[registry] ?? [])])];
    for (const [key, value] of Object.entries(patch.locales?.it ?? {})) {
      if (Object.hasOwn(content.locales.it, key) && content.locales.it[key] !== value) throw new PackError([`Collisione locale: ${key}`]);
      content.locales.it[key] = value;
    }
    if (patch.visibility) {
      if (patch.visibility.initialRevealedSetIds.length) throw new PackError(['Reveal iniziali non consentiti nei pacchetti.']);
      content.visibility.setAnnouncements.push(...patch.visibility.setAnnouncements);
      content.visibility.collectionReveals.push(...patch.visibility.collectionReveals);
    }
    if (patch.progression) {
      if (JSON.stringify(patch.progression.rewards) !== JSON.stringify(seed.progression.rewards) || content.progression.levelThresholds.some((n,i) => patch.progression!.levelThresholds[i] !== n)) throw new PackError(['Premi e curva XP esistente sono bloccati.']);
      if (patch.progression.levelThresholds.length > content.progression.levelThresholds.length) content.progression = structuredClone(patch.progression);
    }
    if (patch.migrations && Object.keys(patch.migrations.aliases).length) throw new PackError(['Migrazioni di ID shipped richiedono un percorso di migrazione dedicato.']);
    for (const [key, spec] of Object.entries(manifest.assets)) {
      if (assets.has(key)) throw new PackError([`Collisione artKey: ${key}`]);
      if (!pack.assets[key]) throw new PackError([`Asset mancante: ${key}`]);
      if (!content.elements.some(e => e.artKey === key) && !content.sets.some(s => s.iconKey === key)) throw new PackError([`artKey non utilizzato: ${key}`]);
      if (seed.elements.some(e => e.artKey === key) || seed.sets.some(s => s.iconKey === key)) throw new PackError([`Override dell'arte seed non consentito: ${key}`]);
      assets.set(key, { pack, bytes: pack.assets[key]! });
      if (spec.mime !== 'image/png' && spec.mime !== 'image/webp') throw new PackError(['MIME non consentito.']);
    }
    if (compareVersion(manifest.contentVersion, content.manifest.contentVersion) > 0) content.manifest.contentVersion = manifest.contentVersion;
  }
  if (content.elements.length > 2500 || content.recipes.length > 10000 || content.rules.length > 32 || input.reduce((n,p) => n + Object.values(p.assets).reduce((a,b) => a+b.length,0),0) > 64 * 1024 * 1024) throw new PackError(['Composizione oltre i limiti supportati: 2500 elementi, 10000 ricette, 32 regole, 64 MiB artwork.']);
  return { index: buildIndex(validateContent(content)), assets, packs };
}
