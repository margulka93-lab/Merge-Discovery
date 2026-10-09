# Evidenze Concept Proof

Branch `codex/isolario-concept-proof`, parent Foundation #17 `9aa9130`. Vedere [scope](../../tasks/ISOLARIO_CONCEPT_PROOF.md) e [review](../../ISOLARIO_FEASIBILITY_REVIEW.md). Nessun merge, arte/UX **PENDING HUMAN REVIEW**.

## Avvio

```sh
npm ci
npm run dev -- --host 127.0.0.1
# Aprire http://127.0.0.1:5173/island
# / resta il Laboratorio storico; il collegamento Laboratorio torna al runtime condiviso.
npm run check
npm run test:e2e
npm run test:production
npm run validate:pwa
npm run validate:world
npm run simulate:content
npm run simulate:world
npm run profile:catalog
npm run profile:map
npm run measure:bundle -- docs/evidence/isolario-proof/bundle-after.json
# Con un dev server sulla porta 5190:
npx tsx scripts/profile-island-proof.ts http://127.0.0.1:5190/island
```

Production test usa build reale su 5179, worker e IndexedDB reali. Le prove del renderer sono su fresh save o su fixture dichiarata; non c’è una route di reset/pre-own nascosta nel prodotto.

## File

- `initial-*`, `transformed-*`, `atlas-*`: screenshot reali di `/island`/libro a 1440×900, 390×844 e 320×568. `intermediate-*`: prima della crescita finale. Capture E2E dev, non mock HTML o immagine del concept spacciata per UI.
- `capture-1440.webm`, `capture-390.webm`: video reali del percorso UI automatizzato con tastiera/touch emulato. Non telefono fisico o playtest umano; il recorder Playwright adatta il viewport al frame video.
- `loop-*`: snapshot storage e controlli replay/reload/gate/focus/legacy; **questi JSON sono fixture di test e possono contenere conoscenza acquisita nel test, non DTO da servire al giocatore**.
- `production-offline.json`, `production-update.json`: prove vere di worker/world/Atlante offline e update esplicito.
- `scene-profile.json`: registro delle cinque sorgenti con dimensioni, alpha, SHA, pivot/anchor presentativi, peso/decode; profilo dev initial scene su host dichiarato. `budgetPassed: false` è un limite reale del proof, non un validator da nascondere.
- `bundle-before.json`: dist Foundation #17, stessa installazione; `bundle-after.json`: build proof. `pwa.log`, `profile-*.log` e log delle suite: output corrente.
- `regression/`: report production appena rigenerati delle schermate storiche. I baseline storici nel repository vengono ripristinati, non rimpiazzati da screenshot di questa tranche.
- `verification.json`: riepilogo finale, approvazione visuale e playtest umano pendenti.

Il profiler legge l’alpha e registra le sorgenti; non modifica immagini. Base da campione Foundation, quattro props via imagegen con quella stessa base come riferimento, ispezionati prima del montaggio. Tutti **sample**, non asset finali approvati. Nessuna immagine completa trasformata sostituisce il renderer. I placeholder SVG restano dichiarati nella review.
