# PR #18 — Scoperta principale, Mondo facoltativo

2026-10-09. Revisione del proof, **non approvazione visuale o playtest**.

Fonti: `CODEX_TASK.md`, `DISCOVERY_FIRST_WORLD_ATLAS.md`, review #18 del 9 ottobre, `AGENTS.md`, checkpoint Foundation, feasibility review, architettura/TECH_SPEC, save/versioning, specifiche responsive, accessibilità, motion e PWA Phase 7. Questa revisione supera la precedente impostazione del dock A+B e il budget raster del primo proof. Nessuna vecchia PR è stata importata in blocco.

## Esperienza e confini

`/` resta la home di combinazione: la voce principale si chiama **Scopri**, il Laboratorio esistente rimane funzionante. Non è stato ridisegnato in questa tranche. Mondo è un piccolo link nella rail desktop e nell'header mobile: non aggiunge una sesta destinazione alla bottom navigation. È visitabile dall'inizio perché osservare la scena vuota non rivela contenuti futuri; non viene introdotto un unlock o requisito di progressione. Su 320×568 il Laboratorio conserva il suo flusso verticale con scroll, mentre Mondo occupa il viewport.

`Nuova possibilità nel Mondo` indica almeno un'azione attualmente valida nella proiezione sicura. Non mostra quantità, nomi futuri, ricette o target non autorizzati. Il controllo è asincrono e non blocca la Scoperta: conflitti/errori del WorldRepository sopprimono soltanto l'avviso. Nessuna manifestazione è automatica e nessun elemento/XP è concesso dal mondo. Il segnale resta disponibile finché esiste un'azione valida, senza toast o celebrazione ripetuta.

Mondo mostra prima luoghi/trasformazioni e Atlante. A+B compare soltanto aprendo **Esperimento** o selezionando una presenza illustrata. È un supporto facoltativo, delegato allo stesso ProofSession/SaveApplication/resolver; non una seconda home. **Scopri** torna alla combinazione in un gesto. Gli input del Laboratorio sono conservati in memoria di sessione e filtrati sull'ownership corrente; la route rilegge i commit attuali. Non cambia lo schema del save e non persiste input temporanei.

Gli accessi Mondo/Scopri attendono il commit in corso. Se si lascia la route attraverso Indietro del browser, il commit resta protetto dall'operation guard e il componente smontato non pubblica un reveal invisibile che blocchi gli update. Una prova con commit sospeso verifica questo caso.

L'Atlante resta una prima pagina prototipale: conoscenza posseduta/ricette note e cronaca di manifestazioni committate. Il gate già esistente non cambia. Nessuna nuova tassonomia, specie, ricetta, Set, era o espansione.

## Asset e produzione

| Misura | Prima, commit `6112afc` | Dopo |
|---|---:|---:|
| Cinque raster runtime | 9.702.108 B / 9,25 MiB | 709.950 B / 0,68 MiB |
| Memoria teorica dei pixel RGBA sorgente | 31.454.520 B | 11.323.392 B |
| Target ≤5 MiB | Fallito | Passato, riduzione 92,7% |

Base conservata a 1536×1024, props a larghezza 768 (suolo/acqua 768×307, albero/creatura 768×512), WebP qualità .92. Nessun crop, nuova arte, luce o pivot. WebP con alpha è supportato dai browser moderni del target; la prova di decode/offline è Chromium, non una certificazione Safari/telefono fisico. Non è stato aggiunto un decoder o una cache runtime.

L'alpha decodificato coincide **esattamente con quello della sorgente ridimensionata** (errore massimo 0), non con la griglia della sorgente ad alta risoluzione. RGB lossy: metriche RMSE, pixel trasparenti/translucidi, dimensioni e hash sono nel report. Le tavole affiancate su navy e sfondo caldo consentono di controllare silhouette e bordi; i capture della scena confrontano l'uso reale desktop/mobile. I colori dei pixel quasi trasparenti hanno RMSE più alto senza costituire da soli una misura della differenza composita. L'ispezione di implementazione non vede aloni o perdita evidente alla scala di scena; l'approvazione umana rimane necessaria.

Gli originali si recuperano dal commit identificato, senza duplicare altri 9,7 MB nel runtime. `scripts/optimize-island-assets.ts` rigenera WebP e confronti usando Chromium Canvas; `validate:island-assets` impone cinque file, hash verificati e budget. `validate:pwa` misura anche i cinque raster reali di dist nel precache atomico. Le evidenze di confronto e i JSON **non** entrano in dist o nella cache PWA.

Il runtime del mondo è un chunk asincrono condiviso tra cue e route; renderer/CSS/raster rimangono separati dall'entry della Scoperta. Misure JS before/after in `evidence/discovery-first/bundle-before.json` e `bundle-after.json`. Nessun cambio a installazione atomica, waiting worker, guardie operazione/reveal, consenso all'update o reload.

## Evidenze e verifica

Risultati finali, log, screenshot e capture: [evidence/discovery-first/README.md](evidence/discovery-first/README.md). Il percorso UI fresco scopre nella home venti elementi già canonici, visita il mondo per undici commit e consulta l'Atlante; tastiera desktop e touch **emulato**. La suite storica mantiene il percorso completo 67/67 senza richiedere Mondo. Fixture production importata tramite UI dichiarata nei report; nessuna ownership pre-caricata nel percorso fresco.

Comandi: `npm ci`, `npm run dev`, `npm run check`, `npm run validate:pwa`, `npm run test:e2e`, `npm run test:production`, `npm run measure:bundle`. Validator/simulazioni seed e world sono inclusi in check/build. `npx tsx scripts/optimize-island-assets.ts` è una rigenerazione tecnica opzionale, non una modifica creativa.

## Gate ancora aperti

Playtest desktop/mobile umano di 10–15 minuti, telefono fisico, tastiera software, screen reader umano e approvazione grafica **non eseguiti**. Camera mobile, occlusione della cresta, costa e studi SVG restano limiti del proof originale; questo lavoro non li dichiara definitivi. Non è stato prodotto un nuovo pack di asset.

L'export canonico v1 **non è un backup portabile combinato save+world**. WorldState locale e generazione restano separati; il bundle di export completo richiede una tranche distinta. #18 resta draft su main: nessun merge, Android, arcipelago, produzione asset completa o incorporazione indiscriminata delle PR storiche.
