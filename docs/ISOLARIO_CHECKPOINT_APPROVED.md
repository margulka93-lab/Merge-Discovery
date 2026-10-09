# Isolario + Atlante Vivente — checkpoint approvato

Data: 2026-10-09
Status: **APPROVATO PER PROTOTIPO TECNICO + COMPOSIZIONE VISIVA CAMPIONE**.
Questo checkpoint rende eseguibile il task `docs/tasks/ISOLARIO_ATLANTE_PROTOTYPE.md` nei limiti seguenti. Le diciture 'proposta/non avviabile' nei documenti originali registrano il loro stato di redazione; la decisione successiva è questa.

## Decisioni approvate

1. **Camera 2.5D fissa, prospettiva inclinata/isometrica, SVG + raster illustrati + controlli DOM.** Camera fit-to-island; schema di anchor con scelta esplicita. Nessun engine 3D/Pixi prima di benchmarking e nuova decisione.
2. **Agency:** il giocatore scopre un elemento con il resolver esistente, sceglie quando e dove manifestarlo su un anchor valido; la scoperta non causa spawn automatico. Ci devono essere almeno due ancoraggi validi nelle azioni previste per scegliere il luogo. Nessun mondo che avanza automaticamente o tramite timer.
3. **Viaggio prototipo:** quattro starter + 20 nuove scoperte canoniche dal percorso nell'ADR, senza cambiare ricette. **11 manifestation mapping inclusa la Creatura generica** dopo requisiti di habitat. Tre tipi visivamente distinti: terreno, ambiente/fenomeno, vita.
4. **Atlante:** il catalogo/Atlante completo si sblocca dopo tre scoperte, mantenendo il gate attuale. Prima del gate, Taccuino/feedback locale minimo e lista accessibile di luoghi e azioni, senza spoiler. La cronaca mostra soltanto manifestazioni effettivamente committate.
5. **Visual:** identità cozy moderno-magica, isola dipinta e leggibile su PC e smartphone; UI ridotta, nessuna replica del vecchio FreeTable/Laboratory. Le superfici documentali color avorio del poster precedente non impongono tema chiaro al gioco.

## Ordine di lavoro autorizzato

A. Esegui foundation pure + WorldRepository con migration/lock/concurrency e test senza cambiare PlayerSave/seed.

B. In parallelo o immediatamente dopo, **prepara e consegna una vera composizione campione** della stessa isola, in due stati (iniziale e sviluppato) a 1440×900, 390×844 e 320×568, con registro degli asset/pivot previsto.

**Gate visivo:** non produrre in massa i 12–16 asset definitivi e non considerare la direzione artistica approvata finché l'utente non ha visto il campione. Placeholder di scena coerenti sono ammessi per test funzionali, ma chiamarli per ciò che sono.

C. Dopo approvazione visuale, implementa renderer/isola + tray/A+B via SaveApplication + 11 mapping e manifestazioni persistenti.

D. Integra Atlante/cronaca e fai test di gioco 10–15 minuti desktop + smartphone. PR separate e draft foundation → island → atlas; nessun merge automatico.

## Condizioni di sicurezza

- WorldState separato; WorldRepository può aggiungere store nello stesso IndexedDB del save, ma l'upgrade v1→v2 deve preservare byte-for-byte gli slot canonici, import/reset deve cambiare generation in modo atomico e ogni world commit deve verificare revisioni save/world/generation.
- Niente XP o elementi concessi dalla sola manifestazione, niente scoperte artificiali date dalla geografia dell'isola.
- Crash dopo discovery e prima di manifestation: discovery conservata e manifestazione manualmente ripetibile, senza duplicazione XP/cronaca.
- Le PR #9–16 restano draft/unmerged; recupero selettivo con provenienza, senza portare layout obsoleti. Dossier 8A è proposta non approvata.
- Il file `docs/evidence/isolario-architecture/canonical-path.json` e altri artefatti di audit citati dall'ADR erano locali. **Copiali dal worktree dell'audit, se ancora disponibili, o rigenerali con lo stesso motore e documenta la provenienza** prima di usarli come golden fixtures. Non dichiarare un file presente nel Git prima di averlo committato.
- **Backup/export completo:** PlayerSave export v1 e world raw export diagnostico separato non equivalgono al trasferimento completo della partita. UI e PR devono dichiarare la limitazione. Progettare e testare il futuro bundle import/export completo con world/profile generation prima del lancio pubblico; nessun import/reset distruttivo o associazione errata di mondi a salvataggi.
- Accettazione richiede test reali dell'isola, confronto visivo PC/mobile e approvazione umana di comprensibilità, agency e piacere. CI verde non basta.

## Fonti

- `docs/adr/ISOLARIO_ATLANTE_ARCHITECTURE.md`
- `docs/tasks/ISOLARIO_ATLANTE_PROTOTYPE.md`
- `docs/proposals/ISOLARIO_ATLANTE_MIGRATION.md`
- `docs/IMPLEMENTATION_SEED_CONTENT.md`
- `docs/SAVE_AND_VERSIONING.md`
