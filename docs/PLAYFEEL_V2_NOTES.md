# PLAYFEEL V2 — prototipo da valutare

## Scope e riferimenti

Nuova PR draft stacked su `codex/ux-1`, head parent `2267a444c9a41741040642fdf89c2530eda2941c` (PR #13). Nessuna modifica o integrazione delle PR #14/#15, nessun merge, nuovo contenuto, Studio, espansione o Android.

Letti AGENTS.md, CODEX_TASK.md e PLAYFEEL_V2.md da main, UX_1_TWO_MODES, VISUAL_BIBLE_REFERENCE, VISUAL_UX_ALIGNMENT e le specifiche di architettura, modello dati, resolver, validazione, salvataggi, hints/failure, responsive, accessibilità e motion. Il riferimento originale della Design Bible mantiene navy/oro. La nuova decisione PLAYFEEL V2 rende la collisione un comando esplicito nel Tavolo libero; il pulsante Combina rimane nel Laboratorio classico.

## Implementazione

- `App.tsx`: ingresso sul tavolo; stesso projector sicuro e comando applicativo del parent. Replay verificato sulla snapshot/resolver corrente, senza transazione. Discovery, alternativa nuova, gate e retry validi attraversano SaveApplication. Nessun cambiamento al domain engine o al PlayerSave.
- `Laboratory.tsx`: biblioteca interna con ricerca persistente, scorciatoia `/`, recenti di sessione e preferiti durevoli esistenti; dock mobile espandibile, Escape/focus e altezza visualViewport. La modalità classica conserva azioni e risultati precedenti.
- `FreeTable.tsx`: Pointer Events e capture, soglia 8px, ghost/collisione; biblioteca→vuoto copia, biblioteca→figura combina direttamente, figura→figura fonde. Il risultato sostituisce le copie locali alla collisione solo dopo il commit; un errore conserva gli input. Doppio clic duplica, menu esplicito offre Duplica/Rimuovi/Pulisci, tap e tastiera permettono di combinare senza drag.
- `playfeel.css`: tavolo nella prima viewport, biblioteca con scroll interno, linework cosmico, feedback brevi distinguendo risultato noto/discovery/anomalia. Reduced motion e forced colors conservano l'informazione. Nessuna dipendenza drag aggiunta.

Le figure sono presentazione locale e si azzerano al reload; le scoperte restano salvate. Il limite di rendering di 100 copie non limita l'inventario: le copie precedenti sono sospese con messaggio. Nessun pan/zoom aggiunto. Le operazioni pointer e il breve reveal del tavolo partecipano al safe-point PWA esistente; il tavolo non richiede acknowledgement manuale. Il Laboratorio classico conserva il proprio acknowledgement.

## Attrito eliminato e input rimasti

Eliminati: copia intermedia prima di una collisione dalla biblioteca, secondo drag, conferma Combina per ogni collisione, popup risultato, Usa risultato, reset obbligatorio, scroll del documento fra biblioteca e tavolo. I replay producono una figura utilizzabile senza XP o nuova celebrazione.

Una catena richiede un drag dalla biblioteca sul risultato precedente. Per un nuovo A: ricerca/tap (oppure drag in area vuota), poi un drag di B sopra A. Su touch il target ↗ da 44px distingue il drag dallo scroll delle card. La biblioteca rimane aperta e la ricerca non si azzera. L'alternativa accessibile richiede selezione di due copie e Combina figure; ricerca e pulizia rimangono azioni volontarie. I filtri avanzati e le istruzioni sono disclosure secondarie.

## Verifica riproducibile

```sh
npm ci
npm run dev -- --host 127.0.0.1
npm run check
npm run test:e2e
npm run test:production
npm run validate:pwa
npm run profile:catalog
npm run profile:map
npm run measure:bundle -- docs/evidence/playfeel-v2/bundle.json
```

Risultati finali e conteggi sono in `docs/evidence/playfeel-v2/verification.json`. Video reali Chromium e screenshot sono in `docs/videos/playfeel-v2/` e `docs/screenshots/playfeel-v2/`. Ogni ciclo registra 30 esperimenti, 18 passaggi che riutilizzano il risultato precedente, cinque replay senza scritture, A+A, anomalia e nessuna reazione. Due alternative sono provate: la ricetta canonica Calore+Cometa→Acqua e una seconda ricetta **solo fixture** Energia+Tempo→Acqua. Quest'ultima non modifica il seed e non entra nella build. La fixture possiede già i 67 elementi per verificare le catene/ricette; screenshot production separati mostrano una vera nuova scoperta con progresso iniziale.

La matrice comprende mouse, touch emulato con eventi CDP, tastiera, focus/dock, 320×568, 390×844, 1440×900, landscape 844×390, viewport corta 320×360, Axe AA, testo 200%, forced colors/reduced motion. La produzione verifica offline, reload, replay senza modificare IndexedDB e waiting worker bloccato durante un gesto e applicato esplicitamente senza perdere il save. I test precedenti selezionano esplicitamente il Laboratorio classico quando verificano quel percorso.

## Gate umano — PENDING

I test automatici non approvano game feel o grafica. Il touch è emulato: dispositivo fisico, tastiera virtuale reale, penna e screen reader manuale non verificati. Il viewport corto verifica il reflow, non sostituisce la prova con la tastiera di uno smartphone. Nessuna approvazione automatica delle schermate.

Playtest di **10 minuti per piattaforma**, desktop e smartphone:

Per provare su un telefono fisico nella stessa LAN, avviare questo branch con `npm run dev -- --host 0.0.0.0 --port 5181` e aprire sul telefono l'indirizzo Network stampato da Vite. Per la prova offline usare invece una build production in un contesto sicuro HTTPS; il semplice HTTP della LAN non verifica il service worker.

1. Minuti 0–2: nuovo progresso, trova Energia, crea due copie e Calore; prova drag diretto biblioteca→figura e tap/Combina. Valuta quanto è chiaro il gesto senza aprire l'aiuto.
2. Minuti 2–5: almeno 10 combinazioni in catena, usa subito i risultati, alterna ricerca e recenti. Segnala drag mancati, tempi percepiti e ostacoli.
3. Minuti 5–7: ripeti una ricetta nota, duplica A+A, prova un esito senza reazione e un'anomalia se disponibile. Verifica che il feedback sia leggibile senza interrompere il gioco.
4. Minuti 7–9: mobile portrait/landscape e tastiera virtuale, espandi/richiudi dock, cerca e usa preferiti. Desktop tastiera e movimento ridotto. Verifica che tavolo e risultato restino raggiungibili.
5. Minuto 9–10: passa al Laboratorio classico, torna al tavolo, reload/offline; raccogli voto fluidità 1–5, gesto più fastidioso, errori, leggibilità del risultato e confronto percepito con Little Alchemy 2.

Richiesto feedback umano su entrambe le piattaforme prima di approvazione/merge; il prototipo resta draft e modificabile sulla base del feedback.
