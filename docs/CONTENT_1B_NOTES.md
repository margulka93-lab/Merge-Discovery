# CONTENT-1B — Studio visuale e verifica Phase 8A

Draft stacked su CONTENT-1A / PR #14, a sua volta su UX-1 / #13 e UI 7.5C / #11. Nessun merge, pubblicazione o approvazione canonica/visiva. Il ciclo si ferma a UX-1 e CONTENT-1A/B: 8B, 8C e Android non sono iniziati.

## Uso senza scrivere JSON

1. In **Impostazioni → Modalità autore**, abilita l’opzione locale e scegli **Apri Studio contenuti**. L’opt-in non è un’autenticazione: è un confine di presentazione locale. Le anteprime autore possono mostrare segreti; i normali schermi di gioco continuano a usare i DTO filtrati.
2. Imposta titolo, identificatore e namespace del pacchetto. Una bozza nuova propone una contentVersion successiva alla composizione attiva, senza toccare il seed.
3. Crea un elemento, oppure prima un Set. Scrivi nome e descrizione, scegli Set, rarità, completamento e visibilità. Gli ID sono suggeriti e restano stabili dopo la creazione. Assegna PNG/WebP dopo aver aggiunto l’elemento; nessun elemento diventa uno starter.
4. Nelle Ricette cerca gli ingredienti e il risultato per nome/ID. A+B è B+A. I prerequisiti sono AND; sono disponibili tutti i sei tipi canonici, alternative, gate e priorità. Un avviso della coppia non sostituisce il validator.
5. Per un nuovo Set aggiungi membri required e una regola Unlock. Nelle Collezioni scegli membri e reveal: una nuova Collezione visibile senza prerequisito è disponibile dal primo ingresso alle Collezioni; una scoperta selezionata è un requisito esplicito. Restano i confini del primo ingresso del gioco. Le regole di reveal importate vengono conservate se non scegli un nuovo prerequisito.
6. **Valida e simula bozza** usa schema, validator, resolver e simulazione fixed point condivisi. Il report mostra raggiungibilità, checkpoint/XP, unlock, terminali, lunghe catene, ingredienti molto usati, alternative e connessioni tra Set. Lo schema dichiarativo di percorso è limitato a 30 nodi ed è solo un aiuto alla lettura; la simulazione verifica il percorso effettivo.
7. Esporta il ZIP o scegli esplicitamente **Installa bozza validata e riavvia**. Ogni modifica invalida l’anteprima. L’installazione locale non distribuisce né approva il contenuto. Le nuove scoperte vanno ancora ottenute combinando.
8. Per modificare un pacchetto già attivo, usa **Prepara aggiornamento**: conserva i suoi ID e aumenta entrambe le versioni. La rimozione di definizioni o identità di completamento precedenti è bloccata; le nuove collisioni canoniche non possono essere forzate dall’editor.

## Confini architetturali e storage

- `src/application/packs/authoring.ts`: operazioni sulle bozze, ID assistiti, localizzazioni, scelte e relazioni autore. Non risolve né applica ricette.
- `ContentStudioApplication.ts`: import/export, immagini e anteprima attraverso lo stesso `ContentPackApplication`; cache dell’indice attivo per revisione. L’assegnazione raster crea un artKey specifico dell’elemento/Set posseduto dalla bozza: non sostituisce altri elementi che condividevano il fallback.
- `src/persistence/AuthorDraftRepository.ts` e adapter IndexedDB: database separato `merge_discovery_authoring`, una bozza corrente con bytes e metadati. Bozze incomplete ammesse; non entrano nella composizione attiva o nel PlayerSave. Snapshot dei salvataggi della bozza serializzati e isolati da mutazioni successive.
- `ContentStudio`, `StudioForms`, `AuthorControls`: moduli visuali, ricerca, liste paginate, immagini, prerequisiti, diagnostica e azione esplicita. Scelte canoniche in sola lettura; modificabili solo le definizioni nella bozza. L’editor è lazy e si apre solo dopo opt-in.
- Il salvataggio automatico della bozza attende 400 ms; l’uscita dall’editor esegue il flush. Lo stato rende visibili errori di quota e suggerisce l’export. L’export ZIP non dipende dal successo del salvataggio della bozza. Gli aggiornamenti PWA attendono anche i write delle bozze, oltre a preview/install/reveal.
- Il clic su Installa esegue il flush prima di verificare il safe point: una preview veloce non resta bloccata dal proprio salvataggio pendente. Regressione UI mirata e prova production incluse.
- `merge_discovery_content` conserva atomicamente installazioni e artwork; il database save v1 resta invariato. Attivazione e comandi save condividono il lease Web Locks di CONTENT-1A. Nessun hot swap dell’indice.

La PR parent include anche la protezione degli ID di completamento dei capitoli: un aggiornamento non può trasformare una Collezione in capitoli eliminando il completamento originale. La compatibilità verifica scoperte/XP/storia, favoriti, Set, completamenti, anomalie e coppie testate; quarantena nuova bloccata.

Una correzione accessibilità di una riga in `exploration.css` forza anche il testo dello stato anomalia a `CanvasText` in forced colors. Il precedente colore viola poteva prevalere sull’override generico e fallire contrasto AA su Canvas bianco. Nessuna modifica alla presentazione ordinaria dell’Archivio.

## Specifiche usate

`AGENTS.md`, `docs/proposals/UX_1_TWO_MODES.md`, `docs/proposals/CONTENT_1_IMPORTER.md`, `CODEX_LONG_RUN.md`, `CODEX_TASK.md`, `docs/VISUAL_UX_ALIGNMENT.md`, `docs/VISUAL_BIBLE_REFERENCE.md` e poster originale realmente analizzato; specifiche di visione/decisioni, contenuto seed, modello dati, resolver, tecnica, salvataggio/versioni, validazione, screen/UX, responsive, design system, motion e accessibilità. UI dark navy/oro; niente reinterpretazione avorio. Nessun nuovo artwork finale.

## Comandi

```sh
npm ci
npm run dev
npm run check
npm run test:e2e
npm run test:production
npm run validate:pwa
npm run profile:catalog
npm run profile:map
npm run profile:packs
npm run sample:pack -- example.zip
npm run validate:pack -- example.zip
npm run simulate:pack -- example.zip
npm run report:pack -- example.zip
npm run validate:pack -- tests/fixtures/phase-8a-proposed.zip
```

Schema e limiti di ZIP/immagini/composizione sono quelli di [CONTENT-1A](CONTENT_1A_NOTES.md). Non servono rebuild per nuovi contenuti locali. Il progetto richiede Node >=22.12.

## Prova Phase 8A e decisioni pendenti

La fixture da PR #12 conserva tutte le **51 ricette/51 elementi proposti**. Il seed shipped rimane **67**; il dossier installato soltanto in browser di test arriva a **118/118**, profondità 12. Il report non approva intuito, difficoltà, payoff o composizione visiva.

Il dossier originale contiene il Set Animali, ma nessuna nuova Collezione o immagine raster. Una variante esclusivamente di prova assegnata dallo Studio aggiunge il marchio esistente come raster simbolico a Pesce e una Collezione sintetica di un membro. È dichiarata, separata dal dossier originale e non cambia le 51 ricette. La prova offline ottiene Pesce via Creatura+Oceano, mostra Animali, la Collezione di prova e la Scheda con il raster. Nessuna approvazione del dossier o di questi placeholder.

Rock+Time e Flower+Insect restano esclusi dal dossier per le collisioni note. Moon+Life conserva l’anomalia canonica irrisolta. Non sono state inventate soluzioni di design.

## Evidenze e limiti

Risultati finali e bundle in `docs/evidence/content-1b/`; screenshot in `docs/screenshots/content-1b/`. Desktop e smartphone sono browser Chromium reali con viewport/emulazione touch, non dispositivi fisici. Audit axe AA, overflow e target di 44 px su sei viewport; testo 200%, forced colors e reduced motion verificati. PWA verificata sulla build production, compreso un vero service worker waiting durante la preview 1000 e riapertura della bozza dopo update.

L’editor copre i normali elementi, ricette, Set e Collezioni, oltre ad anomalie/unlock. Conserva capitoli, regole tag, progression e reveal complessi importati: editor dedicati per questi moduli avanzati e CSV/Excel restano follow-up, non vengono trasformati in decisioni automatiche. Nessun trasferimento automatico del pack fra origini/browser. Una bozza corrente; usa export/import per archiviare più proposte. Lo stato incompleto di un form non ancora aggiunto/salvato non è una definizione della bozza. Non verificati dispositivi fisici, pen hardware, screen reader manuali e Android.

Revisione umana delle schermate e delle ricette richiesta. I test non equivalgono ad approvazione.

## Risultati finali

| Verifica | Risultato |
| --- | --- |
| `npm run check` | PASS: typecheck, lint, 232/232 unit test in 19 file, validator seed, simulazione e build |
| `npm run test:e2e` | 27/27 PASS, comprese regressioni delle fasi precedenti |
| `npm run test:production` | 21/21 PASS; dopo la sola correzione forced colors, il test production accessibilità/preferences è stato rieseguito: 1/1 PASS |
| `npm run validate:pwa` | PASS: 27 asset precache, 16 chunk JS, budget rispettati |
| Validator/simulator pack | Sample 68/68; dossier Phase 8A 118/118, profondità 12; nessuna approvazione canonica |
| Seed canonico | 67/67 raggiungibili, profondità 11, invariato |
| `profile:catalog`, `profile:map`, `profile:packs` | PASS; pack sintetico 1000/1000 |
| Worker production 1000 | 12.479 ms, 745 frame durante la preview; non installato |
| Accessibilità/responsive | Zero violazioni axe nelle sei viewport, target 44 px, testo 200%, forced colors, tastiera e reduced motion |

La misurazione CLI del pack 1000 ha richiesto 18.497 ms totali durante altre prove browser concorrenti: non è un confronto di velocità a carico controllato. Il worker conserva reattiva la UI. Le evidenze strutturate sono in [verification.json](evidence/content-1b/verification.json), [production-offline.json](evidence/content-1b/production-offline.json), [update-safe.json](evidence/content-1b/update-safe.json) e [phase-8a-sandbox.json](evidence/content-1b/phase-8a-sandbox.json).

| Bundle | Prima | Dopo |
| --- | ---: | ---: |
| Entry JS | 154.579 B | 156.233 B |
| Entry gzip | 43.841 B | 44.275 B |
| Totale JS | 796.273 B | 833.805 B |
| Totale gzip | 247.865 B | 259.688 B |

Il baseline è l’artefatto pubblicato CONTENT-1A a `1bf0a3b`, non una nuova misura del successivo guard di compatibilità a `85d7a21`. Incremento entry 1.654 B, totale JS 37.532 B; chunk Studio lazy 28.657 B / 8.486 B gzip. Anche applicazione Studio, helper autore e preview worker restano separati; il precache permette di aprire l’editor e simulare offline dopo il primo caricamento. Tutti i 23 screenshot sono in [docs/screenshots/content-1b](screenshots/content-1b).
