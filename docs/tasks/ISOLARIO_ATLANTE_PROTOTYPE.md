# Task proposto — primo vertical slice Isolario + Atlante

Stato: **NON AVVIABILE FINO ALL'APPROVAZIONE DEL CHECKPOINT**.
Questo file prepara il prossimo lavoro; non sostituisce autonomamente CODEX_TASK.md e non autorizza implementazione, merge, arte finale o modifiche canoniche.

## Obiettivo verificabile

Una singola isola illustrata 2.5D, visitabile e trasformabile dal giocatore attraverso venti nuove scoperte del seed esistente, con un primo Atlante che mostra conoscenza legittimamente acquisita e trasformazioni realmente salvate. Un viaggio di 10–15 minuti da verificare con persone su PC e smartphone. Recuperare il core esistente, non riscrivere il gioco.

## Gate iniziale e required reading

Prima di scrivere runtime leggere integralmente:

- AGENTS.md, CODEX_TASK.md **correnti su main**;
- `docs/proposals/ISOLARIO_ATLANTE_MIGRATION.md`;
- `docs/adr/ISOLARIO_ATLANTE_ARCHITECTURE.md`, comprese ambiguità e contratti;
- GAME_VISION, DECISIONS, DATA_MODEL, RESOLUTION_ENGINE, TECH_SPEC;
- IMPLEMENTATION_SEED_CONTENT, VALIDATION_AND_TESTING, SAVE_AND_VERSIONING;
- VISUAL_BIBLE_REFERENCE, DESIGN_SYSTEM, ACCESSIBILITY, RESPONSIVE_AND_UI_STATES, MOTION_AUDIO;
- HINTS_AND_FAILURE e proposte/notes UX_1_TWO_MODES, PLAYFEEL_V2, CONTENT_1_IMPORTER per i moduli che si estraggono dai draft.

Accertare approvazione esplicita di prospettiva/agency/Atlante, mapping e budget del percorso. Se il task corrente è ancora architecture-only, **fermarsi dopo il checkpoint**. Non interpretare questo file come autorizzazione preventiva.

## Base e Git

Nuovo ramo foundation su main aggiornato, baseline audit `39c62ada194651d27c153d3be5d5444fc3c27ce8`. Rileggere stato di #9–16 e fissare le SHA al kickoff. Draft separati foundation → island → Atlas; eventuale correzione playfeel sopra Atlas. Il pacchetto del prototipo comprende tutti questi passi, non solo uno scaffold.

Non mergiare/rebasare/force-pushare le PR esistenti. Estrarre i file utili con provenienza e test, non interi commit di layout. Recuperare #13 per search/replay e #16 per pattern pointer/visualViewport; #9 per token/art; catalog/detail/knowledge da main e componenti utili #10/#11. Importer/Studio #14/#15 si integrano in una tranche successiva; loro codice e branch restano disponibili. #12 non è una dipendenza.

## Scope autorizzabile

### A. Foundation pura e repository

Creare, dopo approvazione, i moduli minimi:

```text
src/domain/world/        tipi, regole, reducer e habitat derivati
src/content/world/      world/manifestation/asset schema, mapping e validator
src/application/island/ WorldActionApplication, safe projector, bridge esperimenti
src/application/atlas/  DTO Atlante da catalogo safe + osservazioni
src/persistence/WorldRepository.ts
src/persistence/{memory,indexeddb}/ world adapters
src/ui/island/          WorldShell, renderer, tray e azioni accessibili
src/ui/atlas/           pagine e cronaca
```

Rispettare dependency direction. Non sovrascrivere `application/world.ts`: contiene Collections/Anomalies. Nessuna regola in React, nessun mapping hard-coded dentro componenti. Separare definitionVersion, worldSchemaVersion, contentVersion e revisione repository.

WorldRepository separato logicamente, stesso DB per store mondo/profile_meta additivi come proposto nell'ADR. Migrazione IndexedDB v1→v2 conserva il save v1; profile generation cambia atomicamente su create/import/reset. Adapter memory deve riprodurre guard delle revisioni/save-generation. Niente nuovo campo PlayerSave, nessuna migrazione di recipe IDs/XP/visibility.

Comando mondo controlla possesso/prerequisiti/anchor/slot, aspettative di revision/generation e idempotenza. Stato, receipt e observation scritti insieme. Conflict/quota/invalid-reference restituiscono errore recuperabile senza pubblicare scena finta. Import canonico crea mondo nuovo dopo conferma; recupero/export raw conservano i dati precedenti e impediscono metadata di mondi estranei in UI. Nessuna cancellazione automatica dei DB.

### B. Scena, trasformazioni e esperimenti

Una sola scena authored; camera fissa, coordinate logiche/pivot/depth, raster illustrati e controlli DOM con hit area ≥44px. Tipi SVG/DOM come ADR; introdurre Pixi/canvas solo dopo profiling e nuova decisione motivata, non per abitudine. Almeno due ancoraggi validi per una scelta spaziale significativa. Non una griglia di venti icone o vecchio tavolo su sfondo.

Implementare soltanto gli **11 mapping approvati** dell'ADR: luce, calore, lava, roccia, suolo, acqua, costa/Oceano, seme, germoglio, albero e una creatura generica. Scene/pool/shore/patch/sky labels non concedono conoscenze canoniche. Nessuna specie inventata o presa dal pack 8A; essenza `creature` del seed è sufficiente. Luoghi iniziali non sono ingredienti finché non corrispondono a una manifestazione scoperta.

Tre tipi distinti di azione: transform terrain, set environment, living object. Prerequisiti di mondo valgono per il gesto di manifestazione, **mai** per alterare la coppia canonica. Discovery e manifestation sono due commit intenzionalmente separati; un fallimento del secondo non cancella la prima. Nessuna trasformazione al boot soltanto perché si possiede un elemento. Reload ricostruisce solo effetti precedentemente scelti e committati.

Esperimento: selezione di due essenze possedute nel tray contestuale e azione Combina; stessa SaveApplication/ContentIndex. Oggetti già manifestati possono proporre una propria essenza come input, con secondo input scelto esplicitamente. Nessuna matrice A×B, preview della ricetta segreta o nuovo resolver ambientale. Known replay può evitare scritture solo sulla risposta corrente realmente scoperta; alternativa/gate/stale/anomalia valida continua normalmente. Errore di save conserva input e focus. Tap, tastiera e assistive activation equivalgono a ogni drag opzionale.

Prototipo su `/island` con WorldShell come sua home; accesso a Laboratory storico come alternativa e ritorno al mondo senza nuova istanza SaveApplication. `/` e le route precedenti possono restare la modalità storica durante la review, senza cambiare retroattivamente i suoi unlock. La migrazione pubblica della root Isolario richiede review del prototipo, non un redirect deciso dal renderer. Un solo runtime condiviso e boot promise; estrarre l'orchestrazione strettamente necessaria da App, non copiarla in un secondo save engine.

### C. Primo Atlante

Book ampio con due sezioni: conoscenza (definizioni, prima scoperta, ricette conosciute e tassonomia safe) e cronaca (dove/quando una trasformazione è realmente avvenuta). Riciclare i projector di catalog/detail; nessuna seconda logica di visibility o completion. Capitoli non costituiscono nuove Collections o Set. Filtro/search solo sul contenuto legittimamente noto.

Proposta gate: apertura Atlante completo dopo tre nuove scoperte, come catalogo attuale; prima, feedback locale leggibile. Modificare il gate solo se approvato al checkpoint. Scene summary/lista di luoghi accessibili sempre utilizzabile: non è un nuovo browser di conoscenza nascosta. Ogni osservazione nasce dal commit mondo, non da un frame o dall'apertura del libro. Si può documentare una scoperta non ancora manifestata senza inventare una trasformazione.

## Percorso canonico di accettazione

Venti nuove scoperte più `void`, `energy`, `matter`, `time` iniziali. Usare esattamente recipeId/input del [report di audit](../evidence/isolario-architecture/canonical-path.json): Light, Heat, Plasma, Space, Gravity, Cosmic Dust, Star, Planet, Lava, Rock, Soil, Comet, Water, Ocean, Life, Seed, Sprout, Tree, Movement, Creature.

Da fresco: 24 elementi posseduti, 2430 XP prima di esperimenti extra; nessun pre-own o bypass. La seconda Water alternativa Heat+Comet è facoltativamente testata a parte per gli XP prescritti. Seed completo invariato: altri tentativi leciti continuano a funzionare. La sequenza non è tutorial obbligatorio né lista di ricette pubblicata prima di scoprirle.

Verificare minimo: una scelta tra due luoghi, una trasformazione terreno, una luce/stato ambientale, una crescita authored seme→germoglio→albero e una creatura dopo scoperta+habitat. Non richiedere pioggia/vento come payoff di questi venti passi. Save dimostrativo avanzato ammesso solo separatamente e chiaramente etichettato fixture.

## Art gate

Prima di produzione: composizione campione con stato iniziale e finale a 1440×900, 390×844, 320×568; approvazione umana di leggibilità/visual direction. Conservare identità navy/oro e pittura naturale per l'isola. ElementArt è valido nell'Atlante ma non sostituisce gli asset di scena.

Minimo ~12–16 asset/varianti authored, registry con pivot/footprint/depth/hit bounds. Placeholder di scena coerenti ammessi per verifica tecnica, dichiarati; non dichiararli arte finale o visualmente approvati. Se mancano asset approvati, consegnare lo stato tecnico reale e indicare il gate ancora pendente; non riempire con espansioni o nuove ricette. Target proposto scena ≤5MiB compresso, ≤30 props/40 anchor; misurare, non promettere prestazioni da un numero di icone.

## Test e accettazione obbligatori

1. **Core**: tutti i test main e dei moduli selettivamente estratti; schema/ref/ambiguity/hidden safety e seed **67/67**, profondità invariata. Pair order, A+A, alternate XP once, anomaly/revisit e stale failure preservati.
2. **World validator**: unknown element/art/anchor, prerequisite cycles, out-of-bounds/NaN, slot/replacement ambiguity e mapping impossibili falliscono. Nessuna dependency world→resolver eligibility.
3. **Application**: invalid/unknown action, max instances, target/prerequisite guard, double dispatch, same command with conflicting payload, no-op, persistence fail, revision/content mismatch. Niente XP/discovery concessi da manifest.
4. **Crash/recovery**: discovery commit seguito da world failure/crash; nuovo boot non duplica XP o placements; retry manuale possibile. Observation solo con mutation committata.
5. **DB migration/lifecycle**: shipped v1 fixtures preservate, nuova generazione import/reset, due schede stale, profile switch/crash, world corrotto raw/backup, canonical backup recovery con filtraggio world orfani. Export canonico resta compatibile e specifica che non esporta ancora il mondo; export mondo diagnostico separato, nessun round-trip completo promesso se non realizzato.
6. **Safe DTO**: hidden/secret mapping, missing canon refs, imported/retired world object non posseduto assenti da scena, DOM/accessible names, counters, Atlas/search, pins, hints; nessuna silhouette del futuro.
7. **E2E**: fresco→percorso di venti scoperte→tre tipi di manifestazione→creatura→Atlante; alternativa a drag completa da tastiera e da touch. Scelta reale del luogo, risultato/reazione leggibili, niente navigazione continua tra dashboard. Route storiche e stessa snapshot/preferiti funzionanti.
8. **Responsive/accessibilità**: 320×568, 390×844, 844×390, 768×1024, 1024×768, 1440×900, 1920×1080; browser zoom/testo 200%, high contrast/forced colors, reduced motion, soft keyboard reale dove disponibile. Focus/escape/return, safe areas, scene fit/hotspot alignment e alternativa testuale. Axe AA e smoke screen reader manuale; segnare NOT RUN se non disponibile, non simulare approvazione.
9. **Production PWA**: offline mondo+Atlante+scoperte, reload persistente di entrambi gli stati, waiting worker durante gesture/world/save commit/reveal e update esplicito safe. Nessun cache mix vecchi nuovi asset, nessun reload automatico. Asset/chunk budget, before/after bundle e profiling scena su dispositivo dichiarato; timing senza sleep/fake spinner.
10. **Human playtest**: 10–15min PC e telefono fisico, capire cosa provare, compiere almeno tre trasformazioni, riusare essenze, consultare cronaca e reload. Raccogliere comprensibilità, agency e piacere 1–5, gesture/focus errori e leggibilità. Emulazione/E2E non approvano il concept.

Comandi core da mantenere: `npm run check`, `npm run test:e2e`, `npm run test:production`, `npm run validate:pwa`, `npm run profile:catalog`, `npm run profile:map`, `npm run measure:bundle`. Aggiungere soltanto i comandi validator/simulation mondo pertinenti al nuovo mapping, senza sostituire simulator canonico.

## Consegna

PR draft con scope, base/parent SHA, elenco file estratti e provenienza, contratti/modifiche DB, test completi con risultati, validator/reachability, bundle before/after, limiti dei device. Screenshot scena iniziale/intermedia/finale e Atlante a 1440/390/320, breve video reale PC/touch, report di agency e playtest umano separato. Nessuna approvazione automatica o merge. Non concludere che il prototipo è completo soltanto perché è visibile uno sfondo-isola.

## Esclusioni

Nessuna ricetta/elemento/Set/Collection nuovi o riscritti. Nessun pack #12 attivo, 8B/8C/Arcano, Android/Capacitor, procedura di arcipelago, economia/fame/energia, growth timer, combattimento, pathfinding, multi-profile/cloud/backend, editor del mondo o nuovi ZIP world modules in questa tranche. Non riscrivere Content Studio né scartare il suo codice: integrazione successiva dedicata.