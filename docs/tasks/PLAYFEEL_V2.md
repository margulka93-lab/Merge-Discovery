# PLAYFEEL-V2 — Tavolo libero come gioco principale

Status: **prototipo giocabile da approvare con playtest; non integrare automaticamente.**

## Decisione prodotto

Il giocatore deve vivere Merge Discovery come un'esperienza diretta, rapida e tattile simile per immediatezza a Little Alchemy 2, ma con il proprio canone, la propria progressione e il proprio linguaggio dark navy/oro.

**Tavolo libero è ora il punto di ingresso e la modalità primaria.** Il Laboratorio classico rimane disponibile, accessibile e funzionante come modalità alternativa. Non rimuovere il lavoro precedente, ma non mantenere il vecchio layout/toolbar se compromette il nuovo ritmo.

La priorità è il **game feel**, non l'aggiunta di altra UI. Nessun lavoro su nuovi contenuti, Content Studio, PWA, Android o produzioni artistiche massive.

## Branch e scope

- Parent: `codex/ux-1` (PR #13), basandosi sull'ultimo head della PR.
- Aprire `codex/playfeel-v2` come **nuova PR draft stacked con base `codex/ux-1`**. Non modificare e non mergiare PR #13, #14, #15 durante il prototipo.
- Il codice Content Studio è su branch figli #14–15 e **non** va copiato o riscritto per fare il tavolo.
- Se approvato, il nuovo Tavolo libero diventa parte del prodotto mediante integrazione ordinata e **rebase dei branch CONTENT-1A/B**. Non promettere merge automatici.
- `main` mantiene documentazione di progetto e task; il branch del prototipo deve consultare questa specifica da `main` senza sovrascrivere commit funzionali.

## Criterio principale di accettazione

**30 esperimenti consecutivi devono poter essere svolti fluidamente su desktop e smartphone**, senza tornare continuamente a un modulo di conferma, senza menu obbligatori per ciascuna coppia e senza dover percorrere lunghi scroll per ritrovare biblioteca/risultato.

Automated E2E + misurazione di gesti e viewport sono richiesti, ma non equivalgono ad approvazione umana. Documentare una scaletta di playtest di 10 minuti e ottenere feedback prima di merge.

## Esperienza desiderata

### Desktop

- Tavolo occupa la superficie visiva predominante (non un form al centro di un dashboard).
- Biblioteca compatta/sticky, ricerca, recenti, preferiti immediatamente accessibili.
- Trascina da biblioteca → sul tavolo crea una **copia** con posizione locale.
- Trascina un elemento **sopra un altro** → prova combinazione senza pulsante `Combina`.
- Drag diretto biblioteca → sopra elemento già sul tavolo → prova immediata, **non creare prima una copia e chiedere secondo drag**.
- La figura risultante emerge **alla posizione della collisione**, è subito afferrabile/trascinabile e non richiede un popup.
- Doppio clic sopra un elemento sul tavolo → duplica con piccolo offset visibile, senza combinare.
- Singolo clic e comandi tastiera/menù offrono alternativa accessibile.
- Spostare in area vuota non deve attivare una combinazione.
- Permettere duplicazione veloce e riutilizzo di uno stesso elemento in catene successive.
- Rimozione singolo elemento e `Pulisci` discreti, senza eliminare scoperte.

### Smartphone

- Il tavolo è **visibile immediatamente sotto un header minimo**, nella prima viewport.
- Niente istruzioni permanenti e niente toolbar a cinque pulsanti prima del tavolo.
- Biblioteca sempre raggiungibile **senza scroll verticale della pagina**: dock o drawer inferiore compatto con ricerca, recenti e preferiti, espandibile e richiudibile.
- La ricerca deve permettere selezione e drag/tap per inserire l'elemento sul tavolo, senza chiudere/reaprire vari pannelli a ogni coppia.
- Touch drag non deve confondersi con lo scrolling della biblioteca; adottare strategie pointer capture/soglie di movimento e safe area.
- Doppio tap può duplicare come scorciatoia **ma** `Duplica` esplicito deve essere disponibile nel menu contestuale accessibile.
- Se una figura sul tavolo è selezionata, tap su elemento in biblioteca può inserirlo e, su azione esplicita, combinarlo senza trascinare. Non obbligare swipe/gesture nascoste.
- Il risultato resta manipolabile e riutilizzabile senza scorrere.
- Testare 320×568, 390×844 e landscape; tastiera virtuale e ritorno dal drawer non devono nascondere il gameplay.
- Il dock/drawer deve usare focus management accessibile; non bloccare la navigazione a tastiera.

## Risultati: niente microinterruzioni

- Una nuova scoperta deve essere leggibile ed emozionante, ma apparire **sul tavolo**. Feedback visivo breve e non bloccante.
- Combina di nuovo una coppia già nota? Mostra subito una copia del risultato **già posseduto** sul tavolo, senza XP, senza transazione di discovery ridondante e senza un'altra celebrazione.
- Non bloccare il risultato noto con un messaggio `Già scoperto` che lascia il giocatore senza un oggetto manipolabile.
- Una coppia nuova che conduce a un elemento **già posseduto** tramite una **ricetta alternativa non scoperta** va invece registrata nella SaveApplication: feedback `Nuova ricetta`.
- Un tentativo autorevole senza reazione produce solo un piccolo feedback discreto; se ripetuto nella stessa versione non richiede una nuova animazione importante.
- Anomalia osservata resta registrata; se **riesaminabile** dopo requisito/update, la coppia deve poter essere riprovata.
- `A+A` si ottiene attraverso duplicazione e collisione di due figure uguali.
- In presenza di ambiguità fra `nota`, `stale`, `gated`, `nuova alternativa`, preferire percorso sicuro con resolver e persistenza ordinari: non bloccare mai una discovery legittima.

## Semantica tecnica dei risultati noti

Separare una **riproduzione visiva di un risultato conosciuto** da una **nuova transazione di scoperta**.

- Una coppia esatta è riproducibile subito solo se la **ricetta attualmente eleggibile/risolta è davvero già scoperta** e non ci sono condizioni che potrebbero cambiare la risposta.
- Usare un projector sicuro e/o resolver puro sulla snapshot corrente; non inferire dalla sola presenza del risultato nell'inventario. Non introdurre nuovi leak su coppie non ancora provate o contenuti nascosti.
- Replay noto: no nuovo XP, no duplicato in `testedPairs`, nessuna scrittura di PlayerSave superflua; è una nuova figura *visuale* sul tavolo.
- Discovery/alternate/anomalia/retry genuini: passare per `SaveApplication.combine`, attendere commit prima di mostrare come scoperto; errore di persistenza lascia il tavolo in stato coerente con feedback recuperabile.
- Trattare aggiornamenti contenuti/versioni/gate senza cache di pair eternamente autorevole.
- Nessun fork del domain engine.

## Ricerca e biblioteca senza attrito

- Input ricerca realmente persistente mentre si gioca, con scorciatoia desktop `/` quando non si sta digitando altrove.
- Ricerca solo su elementi posseduti e metadata autorizzati; insensitive ad accenti/case; no spoiler.
- Recenti e preferiti evidenti; `Ultimi usati` locale di sessione per catene, senza schema save nuovo.
- Selettori/filtri semplici: `Tutti`, `Con piste`, `Esauriti per ora`; più filtri in pannello secondario, non sempre visibili.
- `Esaurito per ora` è derivato dalla conoscenza/eligibilità correnti, non promesse sul contenuto futuro. Sempre applicare il projector sicuro Phase 6.
- Ordine/scroll della biblioteca mantenuti mentre il giocatore manipola figure o apre/chiude il drawer.
- I risultato di ricerca devono essere facilmente trascinabili/toccabili.

## Motion & feel

- Trascinamento con ghost/ombra, elemento che segue il cursore/dito in modo leggibile, suggerimento quando si sovrappone ad altro.
- Collisione: breve snap → fusione/pulse → risultato in situ, durata percepita rapida, senza transizioni che bloccano altri input.
- Nuovo elemento: enfasi maggiore ma non modale.
- Elemento noto: transizione minima.
- Anomalia: piccolo feedback violetto riconoscibile, senza spoiler né flash violenti.
- Suoni soltanto opt-in e rispettando AudioEngine esistente.
- `prefers-reduced-motion` e impostazioni di gioco: statico ma con tutta l'informazione leggibile.

## Layout e performance

- Preservare AppShell e progressive disclosure ma ridurre chrome nel Tavolo libero.
- Il tavolo non deve crescere infinitamente in pagina, nessun scroll verticale obbligatorio per combinare; pan/zoom opzionale e gestito senza conflitti con le gesture.
- Posizioni e oggetti sul tavolo sono presentazione locale; preferibilmente non persistiti nel PlayerSave.
- Gli stessi elementi possono essere presenti come copie visive, ma l'inventario resta unico e infinito.
- Evitare drag libraries poco mantenute o pesanti; niente full pair matrix o scansioni globali a ogni frame.
- Preservare offline PWA, installazioni contenuto, accessibilità e responsive; il prototipo non deve alterare Content Studio.

## Verifiche obbligatorie

1. 30 esperimenti consecutivi con almeno 8 catene, 5 risultati noti riprodotti, 2 alternative (fixture lecite), una A+A, una anomalia e un esito senza reazione.
2. Su 390×844 e 320×568, ricerca e tavolo raggiungibili senza scrolling del documento; documentare tap/drag e passaggi per `combina un nuovo A con elemento della biblioteca`.
3. Drag library→occupied figure combina in un gesto; library→empty crea copia.
4. Doppio-click duplica e non combina; touch ha equivalente discoverable.
5. Stato progressi non aumenta nei replay noti; alternativa dà gli XP prescritti una volta; retry anomalia valido; stale failure si riapre.
6. Test E2E desktop/touch/keyboard, focus, drawer/search, 200% zoom, reduced motion/forced colors, viewport/landscape, Axe.
7. Offline/reload/save and PWA update-safe invariati.
8. Produrre 1440×900, 390×844, 320×568 screenshot e **video breve** del ciclo completo su PC/mobile. Se il tool non registra video, produrre frame sequenziali ma non chiamarli video.
9. Report **quali operazioni ripetitive sono state eliminate** e quali richiedono ancora input.

## Deliverable e gate

Una sola **PR draft autonoma**, con base `codex/ux-1`, head consigliato `codex/playfeel-v2`.

- No merge automatico di PR #9–15.
- Non aggiornare #14/#15 durante il prototipo.
- Non iniziare Phase 8B/8C o Android.
- Non considerare green CI come approvazione del game feel.
- Richiedere feedback umano dopo un playtest manuale desktop + smartphone e modificare la PR finché serve.
