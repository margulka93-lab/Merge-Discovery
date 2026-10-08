import { digest, type ContentPack } from './model';
import { sampleArt } from './sample-art';
/** Synthetic importer fixture; deliberately separate from shipped gameplay and canon. */
export async function samplePack(): Promise<ContentPack> {
  const bytes = Uint8Array.from(atob(sampleArt), c => c.charCodeAt(0));
  return {
    manifest: { schemaVersion: 1, packId: 'studio_sample', namespace: 'studio_sample', title: 'Esempio autore · non canonico', version: '1.0.0', contentVersion: '0.3.0', minimumSaveSchemaVersion: 1, reviewStatus: 'proposed', dependencies: [], assets: {
      'studio_sample.spark': { path: 'art/spark.png', mime: 'image/png', sha256: await digest(bytes), width: 192, height: 192 },
    } },
    patch: {
      elements: [{ id: 'studio_sample_spark', nameKey: 'studio_sample.spark.name', descriptionKey: 'studio_sample.spark.description', setId: 'studio_sample', rarity: 'common', tags: [], completion: 'required', visibility: 'announced', sortOrder: 0, artKey: 'studio_sample.spark' }],
      sets: [{ id: 'studio_sample', nameKey: 'studio_sample.set.name', descriptionKey: 'studio_sample.set.description', eraId: 'origins', visibility: 'discovery', completionMode: 'required_elements', accentToken: '--accent-origins', iconKey: 'studio_sample.spark', sortOrder: 100 }],
      recipes: [{ id: 'studio_sample_void_void', inputs: ['void','void'], resultElementId: 'studio_sample_spark', kind: 'explicit', discovery: 'normal' }],
      unlocks: [{ id: 'studio_sample_reveal', target: { type: 'set', setId: 'studio_sample' }, requirements: [{ type: 'element_discovered', elementId: 'studio_sample_spark' }], revealMode: 'normal' }],
      collections: [{ id: 'studio_sample_collection', nameKey: 'studio_sample.collection.name', descriptionKey: 'studio_sample.collection.description', visibility: 'hidden', memberElementIds: ['studio_sample_spark'] }],
      visibility: { initialRevealedSetIds: [], setAnnouncements: [], collectionReveals: [{ collectionId: 'studio_sample_collection', paths: [[{ type: 'element_discovered', elementId: 'studio_sample_spark' }]] }] },
      locales: { it: {
        'studio_sample.spark.name': 'Scintilla di prova', 'studio_sample.spark.description': 'Elemento sintetico per verificare il caricamento locale. Arte segnaposto dal marchio del gioco.',
        'studio_sample.set.name': 'Studio di prova', 'studio_sample.set.description': 'Set sintetico, escluso dal seed.',
        'studio_sample.collection.name': 'Taccuino di prova', 'studio_sample.collection.description': 'Collezione sintetica per verificare l’importer.',
      } },
    }, assets: { 'studio_sample.spark': bytes },
  };
}
