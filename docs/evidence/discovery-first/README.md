# Discovery-first — evidenze aggiornamento PR #18

Questa cartella documenta la revisione discovery-first su main dopo Foundation #17. [Review tecnica e limiti](../../DISCOVERY_FIRST_PR18_REVIEW.md). Nessuna approvazione visuale o playtest umano implicita.

## Screenshot actual UI

| Viewport | Scoperta + cue | Mondo iniziale | Mondo trasformato | Atlante |
|---|---|---|---|---|
| 1440×900 | [Scopri](discovery-1440x900.png) | [Iniziale](initial-1440x900.png) | [Trasformato](transformed-1440x900.png) | [Atlante](atlas-1440x900.png) |
| 390×844 | [Scopri](discovery-390x844.png) | [Iniziale](initial-390x844.png) | [Trasformato](transformed-390x844.png) | [Atlante](atlas-390x844.png) |
| 320×568 | [Scopri](discovery-320x568.png) | [Iniziale](initial-320x568.png) | [Trasformato](transformed-320x568.png) | [Atlante](atlas-320x568.png) |

Tastiera desktop, touch emulato a 390, stessa camera/ancoraggi e ownership ottenuta nel percorso UI fresco. Su 320 il Laboratorio storico è una pagina con scroll, non tutti i suoi controlli entrano nel primo viewport. Le capture del Mondo hanno dock contestuale, non tray A+B permanente.

Video browser automatizzati: [desktop](capture-1440.webm), [touch emulato](capture-390.webm). Non sono riprese di dispositivi fisici né playtest umani.

## Asset before/after

Sorgente `6112afc`: [stato iniziale desktop prima](before/initial-1440x900.png), [trasformato desktop prima](before/transformed-1440x900.png), [trasformato mobile prima](before/transformed-390x844.png), [320 prima](before/transformed-320x568.png). Sono capture della stessa scena dopo la prima correzione discovery-first e prima della conversione, **non** della vecchia home. L'ordine dei pulsanti dock è stato successivamente allineato alla priorità Luoghi/Atlante.

Confronto isolato su navy e fondo caldo (sorgente PNG sinistra, WebP destra): [base](asset-comparison-base.png), [suolo](asset-comparison-soil.png), [acqua](asset-comparison-water.png), [albero](asset-comparison-tree.png), [creatura](asset-comparison-creature.png). [Metriche bytes/alpha/RMSE/dimensioni/hash](raster-optimization.json). Nessuna immagine di confronto viene distribuita nel runtime.

## Riproduzione

```sh
npm ci
npx playwright install chromium
npm run dev
npm run check
npm run validate:pwa
npm run test:e2e
npm run test:production
npm run measure:bundle
```

`check` include validator content/world/raster e simulazioni 67/67 elementi e 11/11 manifestazioni. Production usa dist e il server test isolato 5179; non ricostruire dist mentre la suite production è in esecuzione. Il server dev E2E usa 5178.

Rigenerazione tecnica opzionale: `npx tsx scripts/optimize-island-assets.ts` legge i PNG dal commit indicato, esporta WebP .92 e tavole comparative. Può aggiornare gli hash in funzione della versione Chromium; il validator richiede file/report coerenti. Non inventa asset.

Con server dev attivo: `npx tsx scripts/profile-island-proof.ts http://127.0.0.1:5190/island` profila la scena iniziale e verifica dimensioni/alpha dei WebP. Output aggiornato `scene-profile.json`; misura informativa su host headless, non benchmark GPU o telefono fisico.

Report `loop-1440.json`/`loop-390.json`: scoperte nella home, undici world commit, ritorno con input, replay contestuale senza scrittura/XP, reload e Atlas/focus/axe. `production-offline.json` dichiara la fixture canonica importata attraverso la UI; `production-update.json` registra il vero waiting worker. `regression` conserva i report freschi delle schermate Phase 7 e della compatibilità Foundation, separati dalle evidenze storiche.

`verification.json`, log check/E2E/production/PWA e bundle-before/after riportano l'esito conclusivo. Rimangono pendenti playtest umano desktop/mobile, telefono fisico, screen reader umano e review grafica. Export canonico v1 **non** contiene il mondo.

Risultati finali: **231 unit/component, 33 E2E, 13 production — PASS**; seed **67/67**, mondo **11/11**, cinque raster **709.950 B**, precache completo **1.410.796 B** / 26 asset. L'ultimo E2E copre anche il commit sospeso e Indietro del browser. Nel report `foundation-adapter-migration.json`, il campo storico `islandUI: NOT IMPLEMENTED` descrive esclusivamente l'harness dell'adapter/migrazione, non l'assenza della UI di questa PR.
