import { readFileSync, writeFileSync } from 'node:fs';
import { patchFrom, writePack } from '../src/content/packs/archive';
import type { ContentPack } from '../src/content/packs/model';
const raw = JSON.parse(readFileSync('tests/fixtures/phase-8a-proposed.json','utf8'));
const { manifest: source, setAnnouncements, collectionReveals, ...modules } = raw;
const pack: ContentPack = { manifest: { schemaVersion: 1, packId: 'phase_8a_proposed', namespace: 'phase_8a', title: 'Phase 8A · 51 proposte PENDING · solo ambiente di prova', version: '0.1.0', contentVersion: source.contentVersion, minimumSaveSchemaVersion: 1, reviewStatus: 'proposed', dependencies: [], assets: {} },
  patch: patchFrom({ ...modules, registries: { features: [], ...modules.registries }, visibility: { initialRevealedSetIds: [], setAnnouncements, collectionReveals } }), assets: {} };
writeFileSync('tests/fixtures/phase-8a-proposed.zip',await writePack(pack));
console.log('Dossier PR #12 convertito in ZIP di prova. Nessuna ricetta approvata e nessuna modifica al seed.');
