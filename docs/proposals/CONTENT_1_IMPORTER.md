# CONTENT-1 — Content Studio & runtime pack importer (proposta pre-Codex)

Status: **SPECIFICA DI PROGETTAZIONE; nessun importer runtime implementato**.
Problema: oggi `src/content/load.ts` importa staticamente JSON dal bundle Vite. L'export/import esistente appartiene al **salvataggio della partita** e NON carica nuove definizioni/ricette/immagini.

Obiettivo: permettere alla proprietaria del gioco di produrre/importare **pacchetti di contenuto completi** senza chiamare Codex e senza rebuild manuale per ogni ricetta.

## Distinzione cruciale

A) **Importa salvataggio**: ripristina il progresso di una partita. Già presente e da mantenere.

B) **Installa pacchetto di contenuti**: aggiunge/aggiorna definizioni, ricette, Set, Collections, anomalie, localization, registries, art e dati di progresso. Nuovo Content Studio.

Installare contenuti **non** auto-scopre nuovi elementi nella partita. La giocatrice deve ancora combinarli. `Applica combinazioni` significa: rendere disponibili nuove ricette al motore dopo import valido.

## Esperienza Content Studio

Sezione separata da gameplay ordinario (`Studio contenuti`, sotto impostazioni avanzate o modalità autore con opt-in locale), non esporre pubblicamente funzioni di editing senza un contesto autore.

Workflow:

1. `Nuovo pacchetto` / `Importa pacchetto`.
2. Importare ZIP con dati + immagini, o un JSON strutturato con immagini come file associati; supportare una variante authoring CSV/Excel in fase successiva.
3. Validazione e **anteprima prima di applicare**.
4. Report con errori bloccanti, avvisi, proposte collisioni e grafo dei prerequisiti.
5. Simulazione reale del resolver + reachability dal seed.
6. Mostrare diff: aggiunti / aggiornati / alias / rimossi (i removals per default rifiutati), dimensioni Set e ricette, possibili bottleneck, versioni.
7. `Installa pacchetto` esplicito con backup/rollback.
8. Attivazione contenuto in un safe point e ricalcolo dei derivati; vecchie no-reaction stale diventano riprovabili; nessun nuovo elemento auto-discovered.
9. Gestione installati: versione, dipendenze, disattiva/rollback solo se non compromette i save; esporta package + report.

## Formato progettuale

Un ZIP locale, ad esempio:

`merge-discovery-pack.zip`

Contenuto consigliato:

```text
manifest.json
data/
  elements.json
  recipes.json
  sets.json
  collections.json
  anomalies.json
  unlocks.json
  rules.json
  registries.json
  progression.json
  visibility.json
  migrations.json
locales/
  it.json
art/
  water.webp
  wolf.webp
  fungi/...
```

La presenza dei file è **opzionale per i moduli non modificati**. Il manifesto dichiara schema, packId, versione SemVer, dipendenze, namespace e asset map; ogni sezione contenutistica usa il formato canonico attuale o una sua estensione a patch dichiarata. Il pacchetto non esegue codice/JS.

Arte: associazione `artKey → path asset + formato + digest + dimensioni + eventuale variante`. Se assente, usare placeholder SVG attuale.

Formati raster preferiti WebP/PNG con limite MIME, dimensioni, decodifica e byte; per SVG solo file sanificati e validati o disabilitarne l'import arbitrario per sicurezza. Vietati URL remoti/script/HTML attivo/risorse esterne.

## Merge deterministic + indices

Caricamento:

1. bundled validated seed/core pack;
2. zero o più content packs installati nell'ordine dipendenze/versioni;
3. merge deterministico in memoria con namespace e policy di patch esplicita;
4. `validateContent` Zod + controlli semantici del pacchetto **completo**;
5. `buildIndex` una volta per la composizione attiva;
6. creation of new `SaveApplication(repository, activeIndex)` only at a safe boot/swap boundary;
7. existing saves reconcile via contentVersion, with prior index/snapshot rollback as appropriate.

Proibite collisioni silenziose su ID, PairKey, locale/asset o versioni; se un pack vuole alterare seed locked, bloccare o richiedere un percorso specifico di migrazione/versionamento, mai overwrite tacito.

Lo Studio deve poter utilizzare lo stesso motore di simulazione/validator del CLI/CI; **non duplicare in UI le regole**.

## Verifiche obbligatorie pre-installazione

### Integrità
- schema Zod, file richiesti e manifest, checksum, ZIP entries/paths sicuri;
- IDs univoci, formati stringhe/locales, riferimenti incrociati, tags, Sets, Collections, registries;
- artKey presenti o fallback esplicito; immagini associate in modo deterministico;
- PairKey unordered, A+A corretto, priorità/regole senza collisioni.

### Progressione e raggiungibilità
- simulazione fixed point sul **contenuto completo** dal seed reale e usando il resolver vero;
- tutti i required raggiungibili; eventuali bonus/segreti con modalità rilevanti classificati separatamente;
- Set/Collection validamente rivelabili e completable quando richiesti;
- nessun unlock gated circolare, prerequisito irraggiungibile o dipendenza che richiede un livello non conseguibile;
- XP/level thresholds e gap tra checkpoint; nessun vicolo cieco noto;
- primo ingresso in nuove ere verificabile senza sapere già ricette nascoste;
- possibili colli di bottiglia segnalati con profondità, branch factor, ingredienti unici, passaggi lineari, lunghe catene/rarità, e ricette alternative; **warning di difficoltà** distinto da errori formali.

### Compatibilità e sicurezza
- staged old-save reconciliation (in preview) senza premi, XP o scoperta automatica;
- failure stale; completamenti earned; informazioni hidden/secret, hints, search, Map e accessibilità no leakage;
- memory/perf target 1,000+; storage quota e artwork size; PWA offline dopo install pack;
- version compatibility: saveSchemaVersion distinto da contentVersionSeen; alias/retire esplicito.

## Semantica di “bottleneck”

Il validator può **dimostrare** unreachable, cycle, blocked unlock e ambiguità.
Non può dimostrare che una ricetta sia intuitiva o divertente: serve report di qualità per human design review, con soglie configurabili e warning, non un pass automatico inventato.

Report leggibile:
- elementi nuovi;
- PairKeys nuovi e alternates;
- catene più lunghe;
- unlock dependency path;
- maggiore uso dei singoli ingredienti;
- tanti elementi terminali senza downstream;
- Set poco connessi;
- rare/future/gated/hidden actions;
- percentuale ricette alternative e rischio brute-force;
- copertura e coerenza degli artwork.

## Commit atomico contenuto + asset

- Usare IndexedDB (o storage adapter compatibile) per **pack, manifest e Blob**.
- Snapshot precedente valido, puntatore versione attiva e rollback; transazione atomica di attivazione.
- Non modificare a caldo ContentIndex mentre c'è un combine/import/reveal in corso.
- Se staging/validation/install fallisce, restano in uso il pack e il save precedenti senza stato parziale.
- Inizializzazione offline dall'ultima composizione valida anche dopo reload.
- Asset blob URL revocati in cleanup; fallback stabile se asset manca.
- Web PWA non può riscrivere i JSON statici del bundle: attivare pacchetti runtime tramite pipeline app/index, non cercare di modificare i file `src/content/data` dal browser.
- Android Capacitor userà la stessa interfaccia di pack repository; validare in WebView import ZIP, assets, persistenza, rollback.

## Tooling autonomo di authoring

**Prima versione**:
- CLI `validate:pack`, `simulate:pack`, `report:pack`;
- import ZIP nel gioco;
- dashboard di anteprima e installazione;
- export completo di pack/sample;
- starter template (manifest+esempi+asset).

**Seconda iterazione**:
- editor visuale `Nuovo elemento / Ricetta / Set / Collezione` con scelte ID assistite;
- ricerca di PairKey prima di salvarlo;
- autocomplete dei prerequisiti, ricetta esempio, preview artwork;
- import da CSV/Excel come sorgente authoring che genera il medesimo pack ZIP;
- pulsante esporta+valida+installa.

Non obbligare l'autrice a toccare file JSON a mano quando Content Studio editor sarà pronto.

## Distribuzione dei contenuti

Importazione locale installa un pack **solo su quel dispositivo/browser**. Non lo pubblica automaticamente per tutti gli utenti.

Per distribuirlo a tutti, servono uno di:
- release ufficiale: pacchetto validato incluso nella build/distribuzione del gioco;
- catalogo remoto/aggiornamento pack con controllo versioni e download esplicito quando disponibile;
- esportazione/condivisione file pack offline tra dispositivi.

Questa differenza deve essere chiara in UI; niente server/account obbligatorio nella prima versione.

## Test

- sample pack integrato e validato senza code changes.
- 51 candidati Phase 8A come test end-to-end dell'import **solo dopo review canon**: 118/118 in draft, non sul main attuale 67.
- import manifest + Set + recipe + Collection + art + locale; verifica render/visibility.
- same result / multiple recipes; past known failed pair new recipe; A+A.
- malformed ZIP, unsupported version, ID conflicts, ambiguous PairKey, script SVG, oversized images, invalid deps/locked seed overrides → blocco con rollback.
- old save compatibility, atomicity/reload/offline/export, fallback missing art.
- click `Installa` never rewrites PlayerSave discoveries.
- production PWA with offline content pack and Android WebView as Phase 9 validation.
- graph/reachability and bottleneck report from actual full-content resolver.

## Sequenza consigliata

Implementare **CONTENT-1** prima di espandere massicciamente con 8B/8C, altrimenti ogni espansione resterà una patch al bundle.
La proposta Phase 8A può diventare il primo pacchetto di prova; rimane draft/PENDING fino a revisione umana.
