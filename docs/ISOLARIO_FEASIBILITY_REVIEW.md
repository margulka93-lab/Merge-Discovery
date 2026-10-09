# Isolario + Atlante Vivente — Concept Proof review

2026-10-09 · **prototipo da valutare, non concept approvato automaticamente**.

**Aggiornamento discovery-first:** [revisione corrente della #18](DISCOVERY_FIRST_PR18_REVIEW.md). La Scoperta è la home, Mondo è facoltativo, A+B contestuale; i raster runtime sono ora 0,68 MiB. Le misure e i limiti qui sotto descrivono il primo proof (`6112afc`); non sostituiscono i risultati aggiornati né un'approvazione umana.
Scope/base e nuova priorità: [task della tranche](tasks/ISOLARIO_CONCEPT_PROOF.md). Evidenze riproducibili: [cartella proof](evidence/isolario-proof/README.md).

Il recupero della Foundation permette di provare il ciclo reale senza riscrivere resolver, save, visibility o PWA. Il risultato supporta la fattibilità tecnica di una **scena authored piccola**, ma non dimostra ancora sostenibilità di molte isole, piacere per dieci minuti, prestazioni di un telefono fisico o approvazione della direzione artistica. Prima della produzione completa occorre la review umana di questo slice.

## Cosa funziona

`/island` apre una scena indipendente dal layout del Laboratorio. Si scelgono due essenze già possedute, si combina tramite lo stesso SaveApplication e si manifesta intenzionalmente su una delle due rive quando i requisiti authored lo consentono. Nessuna scoperta produce spawn automatico. Terreno fertile, bacino riempito, seme/germoglio/albero e creatura sono effetti indipendenti del WorldState; non si alternano due screenshot precalcolati.

La cronaca nasce soltanto dal world commit. Nel libro compaiono conoscenza legittimamente acquisita, prima ricetta conosciuta e osservazioni con luogo/data. Il gate resta quello esistente dopo tre scoperte; prima è disponibile il Taccuino nei Luoghi. Chiudere il libro conserva vista, input e mondo. Native dialog più ripristino esplicito del trigger gestiscono focus, Escape e sfondo inert.

Save e mondo conservano commit separati: se la manifestazione fallisce, la scoperta resta salvata e la scena non inventa un risultato. Il giocatore ricarica il progresso e riprova. La generazione/import/reset e i CAS della Foundation restano autorevoli. Known replay non scrive né concede XP; alternative/anomalie restano sul percorso del resolver canonico. Gli elementi sono riutilizzabili, anche tramite le presenze illustrate o la lista testuale.

La nuova route e il suo chunk/raster sono disponibili offline nel precache dello stesso build. È stata necessaria l’aggiunta **esplicita di `/island` alla allowlist delle navigazioni**: la prima prova production aveva correttamente fallito offline. Nessun cambio a cache runtime, waiting worker, skipWaiting o reload automatico. I world commit usano beginOperation; una nuova scoperta blocca l’update fino all’acknowledgement, poi l’aggiornamento resta esplicito.

## Cosa appare convincente — giudizio di implementazione, da confermare

- La stessa geografia passa da rocce asciutte a terra/acqua/albero/vita. Un albero dipinto con silhouette riconoscibile comunica crescita molto meglio di una card con contatore.
- Navy, riflessi caldi e natura dipinta restano vicini al mood moderno-magico del poster; l’interfaccia si limita a header, scelta della vista e dock, senza colonne da dashboard.
- Il libro si apre sopra la scena e ritorna al medesimo contesto. È una prima pagina documentale, non il nuovo catalogo completo.
- La vista mobile ravvicinata rende leggibili le trasformazioni. **È una proposta di semplificazione rispetto al fit dell’intera isola**, non una nuova decisione congelata. Ovest/Est cambiano il ritaglio presentativo, non i luoghi o le regole del mondo.

Sono stati ispezionati il poster originale locale, i campioni Foundation e le capture iniziale/trasformata del renderer. Non si tratta di un voto umano di agency/piacere. Gli screenshot sono evidenze del programma, non approvazione grafica.

## Cosa è troppo costoso o non ancora credibile

| Limite osservato | Conseguenza | Semplificazione proposta, da approvare |
|---|---|---|
| Cinque PNG: **9.702.108 B ≈ 9,25 MiB**, contro target 5 MiB | Precaching di ~9,7 MB anche per chi apre solo il Laboratorio; decode di tutte le sorgenti ~30 MiB, prima delle superfici del browser | Esportare risoluzioni da scena, WebP/AVIF con alpha e QA 1×/2×; target ≤5 MiB senza indebolire atomicità del precache. Non introdurre cache runtime parziale come scorciatoia |
| Base dipinta piatta con rocce già visibili | Acqua/terra si integrano, ma bordo costa e occlusione dietro cresta non sono ancora produzione credibile | Una maschera occlusione per la cresta e una maschera costa authored, un solo fondo; evitare una plate completa per ogni combinazione |
| Generazione indipendente dei props | Scala, prospettiva, alpha/alone e luce richiedono registrazione manuale; non basta “generare un asset” | Camera/illuminazione bloccate, prop sheet approvato, pivot misurati, revisione montata sulla base prima di ogni batch |
| Seed/germoglio/calore/lava/roccia sono studi SVG, la costa riusa l’acqua | Qualità non uniforme: roccia stabilizzata poco evidente e costa ancora un overlay locale | Usare varianti della stessa vena e silhouette di crescita coerenti; completare **solo** questi mapping se lo slice viene approvato |
| Creatura statica e piccola a 320 px | Presenza leggibile ma non dimostra comportamento “vivente”; hit area può eccedere l’immagine | Valutare silhouette più chiara e due pose leggere dopo review; niente pathfinding, nuovi bisogni o specie |
| Camera mobile ritaglia la seconda riva | Aumenta leggibilità ma riduce visione simultanea e agency percepita | Confrontare con overview opzionale e scelta Ovest/Est; test umano prima di adottare la camera definitiva |
| Biblioteca richiede apertura per selezionare essenze | Su tastiera/tap è sufficiente, ma gli esperimenti ripetuti non sono ancora un gesto unico | Provare dock contestuale delle ultime essenze come intervento UX successivo; non aggiunto in questa PR |
| Atlante modale piccolo, recenti limitati a sei | Dimostra documentazione e continuità, non navigazione di un libro grande | Un indice safe e due pagine a turno solo dopo conferma del concept; niente tassonomia nuova |
| Export v1 non include il mondo | Non è un backup portabile dell’intera esperienza | Bundle world+save con import generazionale in una tranche distinta; la disclosure del limite resta nel Laboratorio |

Non raccomando produzione di molte isole o immagini complete per tutte le combinazioni: costo e coerenza crescono troppo rapidamente. La composizione va trattata come poche superfici/props indipendenti e ancoraggi authored, con riuso controllato. Non propongo nuovi elementi o ricette per compensare problemi visuali.

## Asset minimi e pipeline concreta

**Prodotti qui:** una base Foundation riutilizzata e quattro raster **campione** (terra fertile, acqua, albero, creatura). Gli altri sei effetti sono studi SVG; oceano riusa acqua. Nessun pack finale. Le coordinate presentative registrano le immagini sul frame 1000×667; gli ID/coordinate di dominio Foundation e le regole persistite restano invariati. Art/depth/hit bounds non determinano eligibility o ricette.

Per rendere credibili tutti gli undici mapping senza espandere lo scope:

| Materiale minimo | Quantità | Produzione/riuso |
|---|---:|---|
| Base isola + maschera cresta + maschera costa | 1 + 2 maschere | Stessa geografia nei due stati; raster senza UI, maschere authored |
| Suolo fertile e bacino/acqua | 2 | Alpha irregolare, dimensioni/camera compatibili con entrambi gli anchor |
| Vena: caldo, lava, roccia stabilizzata | 3 varianti di 1 famiglia | Stesso pivot/footprint; overlay locale e luce, nessun nuovo fondale |
| Seme, germoglio, albero | 3 | Radice/pivot comune; crescita authored senza timer |
| Creatura generica | 1 | Sola silhouette canonica generica; nessuna specie o nuova scheda |
| Luce e bordo costa | 2 effetti/maschere | Materiali della scena, non nuove card o contenuti |
| Atlante | 0 nuove illustrazioni obbligatorie | ElementArt/descrizioni/ricette safe già esistenti, tipografia e cronaca DOM |

Pipeline proposta: (1) approvare questa composizione su PC/telefono; (2) fissare camera e palette; (3) produrre una famiglia alla volta sul medesimo fondo; (4) registrare sorgente/alpha/dimensioni/pivot/footprint/depth/hit bounds/hash; (5) montare iniziale/intermedio/trasformato e controllare entrambi i lati; (6) esportare alla risoluzione d’uso e misurare byte/decode; (7) validare schema/registrazione, target touch e screenshot; (8) build atomica e prova offline/update. **Non prodotta qui l’intera lista.**

## Prove, limiti e decisione di fattibilità

Risultati aggiornati in [verification.json](evidence/isolario-proof/verification.json), log e report allegati. La suite core/seed/world precedenti resta richiesta. Il percorso fresco via UI riutilizza i venti passi canonici già approvati come copertura di regressione, non come nuovo obiettivo quantitativo o tutorial con spoiler. Nessun pre-own nel percorso giocabile ordinario. Il test production usa invece una fixture canonica avanzata dichiarata, importata tramite la UI esistente, poi esegue manifestazioni vere offline.

Sette viewport, 44px, axe AA nei tre formati principali, touch emulato, tastiera, Escape/focus, reduced motion/forced colors e reflow/testo sono verifiche automatiche. Il profilo scena è **Windows/Chromium headless, scena iniziale in dev, 390×844 emulato**: p95 frame gap ~16,7 ms su 180 frame e pronto in ~1,13 s in questa esecuzione. Non è una misura di GPU mobile o di FPS garantiti della scena trasformata.

**NOT RUN:** telefono fisico, tastiera software reale, screen reader umano, playtest indipendente di 10–15 minuti e punteggi 1–5 di agency/piacere. La capture video registra azioni reali automatizzate nel browser, non un test umano o una ripresa di un dispositivo fisico. Non viene attribuito un giudizio al giocatore assente.

Conclusione: la separazione scopro → manifesto → trasformo → documento si può sostenere con il codice recuperato e una scena piccola. Il proof offre una base credibile per **valutare**, non dichiarare approvato, il concept. Budget raster, camera mobile, materiali ancora schematici e test umano sono gate aperti. La proposta è restare su una sola plate authored, poche trasformazioni riconoscibili e Atlante leggero; fermarsi qui prima di scena definitiva, full asset pack e qualsiasi espansione.
