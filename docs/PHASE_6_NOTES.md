# Phase 6 — Mappa locale e indizi

## Architettura e confini

`application/directions.ts` indicizza coppie esplicite/anomalie e, se presenti, i soli pool che soddisfano i selettori delle tag rules. Il resolver corrente decide se una coppia posseduta offre una ricetta nuova o un'anomalia nuova. Una coppia canonica conta una sola volta, anche A+A e ricette alternative. Nessuna matrice globale A×B e nessuna modifica al contenuto.

Il Catalogo riusa questo selettore per possibilità, esaurimento e conteggi Collector; conserva la propria cronologia delle prove obsolete. Espone inoltre le sole ricette già apprese per la proiezione del grafo. Mappa e indizi usano la stessa definizione di direzione disponibile.

`application/map.ts` costruisce indici di produzione/utilizzo una volta per snapshot e proietta soltanto il vicinato richiesto. Ancestry segue gli ingressi delle ricette note per 1–3 passaggi (default mobile 1, desktop 2); Possibilities mostra uscite note, anomalie osservate e un marcatore aggregato anonimo; Set mostra membri posseduti e vicini collegati direttamente da ricette conosciute. Il modello resta vuoto sotto 15 scoperte. Query sconosciute vengono normalizzate a selezioni sicure. Vista, elemento, Set e profondità vivono nell'URL, conservato a resize/reload.

Le ricette sono relazioni a due ingressi con giunzione +/×2 e freccia verso il risultato noto. Le alternative sono tratteggiate e nominate nella lista. Le anomalie osservate sono collegamenti punteggiati fra i due ingressi, con stato e senza risultato futuro. Un'eventuale risoluzione resta una normale ricetta appresa nella proiezione.

Il renderer locale usa SVG e pulsanti con l'ElementArt esistente: nessuna nuova libreria grafica. Pan, pinch, zoom e ripristino sono facoltativi; l'esploratore strutturato offre selezione da tastiera, formule complete e tutte le ricette del grafo. I controlli non dipendono dalle gesture. Non vengono animati spostamenti/zoom; contrasto elevato e forced colors mantengono selezione e relazioni leggibili.

## Indizi e informazioni

Il DTO degli indizi contiene solo disponibilità e testi Tier 1–3: mai coppia, partner esatto o risultato. La scelta è deterministica, per ordine della chiave canonica. Sono esclusi input/result secret, ricette secret, domini hidden/secret non rivelati, ricette non attivabili adesso e anomalie già osservate. Le prove obsolete vengono rivalutate con il resolver corrente. Tier 2 comunica solo stesso/altro Set; Tier 3 nomina una famiglia soltanto se già rivelata, su richiesta esplicita “Più chiaro” dopo Tier 2. In assenza di una famiglia sicura resta disponibile il livello inferiore.

Indizi disponibili da 15 scoperte nel Laboratorio (slot A) e nelle Schede possedute. Un pannello non modale annuncia il testo, consente di continuare a giocare e restituisce focus alla chiusura/Escape. Il cambio Tier mantiene il focus sul titolo del pannello.

Mystery nasconde marcatori anonimi e conteggi di direzioni; Balanced mostra un solo marcatore anonimo senza numero; Collector aggiunge il numero esatto di coppie sicure disponibili. Le preferenze informative e off/light/normal usano i campi già esistenti del save e il commit validato di SaveApplication. XP, resolver, schema e preferiti non cambiano.

`application/hintSession.ts` gestisce esclusivamente memoria della sessione: light propone dopo 5 fallimenti consecutivi oppure 10 esperimenti senza progresso; normal dopo 3 oppure 6; off mai. Ripetere ricette note non costituisce progresso. Scoperta, nuova ricetta/anomalia, reveal di Set/Collezione e completamento di Collezione azzerano lo stallo. “Non ora” richiede altri 3 esperimenti prima di una nuova proposta, oppure un nuovo progresso. Nessun timer, penalità, costo, assist flag o dato di telemetria.

## Riproduzione e verifica

```sh
npm ci
npm run dev -- --host 127.0.0.1
npm run check
npm run validate:content
npm run simulate:content
npm run profile:catalog
npm run profile:map
npx playwright install chromium
npm run test:e2e
```

I test browser usano origine isolata `127.0.0.1:5178`, importazione preview/conferma dei fixture Phase 2/5 e veri esperimenti. Non iniettano identità nascoste o modificano il save del browser dell'utente.

Screenshot in `docs/screenshots/phase-6`: desktop Ancestry, Possibilities e indizio Tier 2 (1440×900), Mappa locale e lista relazioni (390×844), Mappa a larghezza minima (320×568). Verificati inoltre 768×1024, 1024×768, 1920×1080, testo 200%, reduced motion e forced colors.

Nessuna contraddizione di design irrisolta. Il task corrente delimita la consegna ai Tier 1–3 anche dove i documenti descrivono livelli futuri. Phase 7, Tier 4/5, Resonance e PWA non sono stati avviati; Laboratorio, Catalogo, Set, Schede, Collezioni e Archivio restano nell'ambito delle regressioni.

## Risultati di consegna

- `npm run check`: PASS (typecheck, lint, 164 test in 8 file, validator, simulazione, build).
- `npm run test:e2e`: 19/19 PASS, inclusi tutti i 14 test Phase 0–5; dopo l'ultima rifinitura del focus/Esplora, rieseguiti e passati i 5 test Phase 6.
- Validator: 67 elementi, 64 ricette, 6 Set, 4 Collezioni, 1 anomalia; PASS.
- Raggiungibilità: 67/67, profondità massima 11, nessun elemento richiesto irraggiungibile, nessun Set o unlock bloccato; 4 Collezioni complete, 1 anomalia osservata senza risoluzione canonica.
- Profilo sintetico 1000 definizioni: Catalogo 70.86 ms + cache/details 1.08 ms; Map/Catalogo 221.07 ms + 1000 proiezioni locali/cache 140.09 ms; nessuna matrice globale. Tempi locali indicativi, non benchmark di prodotto.
- Sei PNG verificati anche nelle dimensioni effettive del file; axe AA senza violazioni nei test.
- `git diff --check`: PASS. Nessun cambiamento a contenuto, Domain, persistence o schema del save.

La build segnala annotazioni di dipendenze Zod rimosse da Rollup e un bundle JS di circa 595 kB (180.55 kB gzip), oltre la soglia advisory 500 kB. La build riesce; non sono stati aggiunti pacchetti né avviati interventi di bundling fuori tranche.
