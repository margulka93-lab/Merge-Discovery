# UX-1 — Laboratorio rapido + Tavolo libero (proposta pre-Codex)

Status: **SPECIFICA DI PROGETTAZIONE; non ancora implementata né approvata per merge.**
Motivazione: il Lab funziona ma l'interazione ripetitiva seleziona/seleziona/combina/scorri è pesante con centinaia di scoperte.
Le schermate dark navy/oro di Phase 7.5 restano il riferimento; non è un secondo gioco.

## Architettura

Una sola fonte di verità per il gameplay:
`ContentIndex → resolve → SaveApplication.combine → PlayerSave → safe projectors`.

Due modalità di interazione selezionabili dal Lab, senza modificare la semantica A+B e senza migrare il save:

- **Laboratorio**: i due slot attuali, click/tap e `Combina` esplicito, piena accessibilità.
- **Tavolo libero**: superficie su cui trascinare copie di elementi e accostarli/sovrapporli per combinarli immediatamente. UI distinta, stesso `SaveApplication.combine`.

Le modalità possono condividere una selezione attiva quando sensato, ma non devono creare un secondo inventario o duplicare progressione. Il cambiamento di modalità non deve scartare le scoperte salvate.

## Tavolo libero desktop

- Library a sinistra/destra, ricerca sempre raggiungibile, risultati recenti, preferiti/pinned.
- Drag da Library su tavolo crea **una copia**; elemento in library resta disponibile infinitamente.
- Drag di un oggetto già sul tavolo lo muove; collisione intenzionale con un altro oggetto → tenta combinazione.
- Doppio click su figura sul tavolo la **duplica** leggermente sfalsata; non attiva una combinazione.
- Tastiera/menù contestuale/pulsante `Duplica` accessibile per ottenere lo stesso risultato senza doppio click.
- Cestino / Rimuovi singolo e `Pulisci tavolo` con conferma solo dove serve; non cancellano le scoperte.
- Pan/zoom del tavolo soltanto dove utili; limitare il numero di oggetti contemporanei con warning gentile/sospensione rendering e virtualizzazione, non un blocco artificiale di gameplay.
- Snap/hover/cue della collisione, senza scatti e senza confermare il risultato prima di aver persistito.

## Tavolo libero smartphone/tablet

- Touch drag con sensori pointer/touch e zone drop ampie; scorrimento della library non deve trascinare accidentalmente elementi.
- Da Library: tap seleziona e aggiunge al tavolo; drag diretto come alternativa. Il tap è sempre disponibile.
- Doppio tap sulla figura del tavolo può duplicare come *scorciatoia opzionale*, ma usare anche il pulsante chiaramente visibile `Duplica` perché il gesto non è affidabile con zoom/tecnologie assistive.
- Library come drawer/bottom sheet o zona comprimibile; ricerca e preferiti rapidi raggiungibili senza riaprire menu continuamente.
- Tavolo deve restare usabile con tastiera virtuale aperta, safe-area, landscape, 320px, grandezza testo 200%.
- Ridurre il numero di gesture non ovvie; tutorial di 10–15 secondi opzionale, no onboarding obbligatorio.

## Combinazioni già testate

**Distinguere la coppia esatta dal risultato che può avere più ricette.**

Per pairKey(A,B) e versione/gate attuali, classificazione derivata da dati validati e PlayerSave:

1. **Ricetta già scoperta e invariata**: di default non ripetere la transazione; mostra segnale discreto `Già scoperta` + risultato noto, eventualmente possibilità di `Ripeti comunque` su richiesta. Nessun XP e nessun reveal maggiore duplicato.
2. **Coppia mai provata**: eseguire normalmente.
3. **Risultato già posseduto ma ricetta alternativa nuova**: NON bloccare; registra la nuova ricetta, XP alternativo canonico e risultato `Nuova ricetta`.
4. **No-reaction autorevole nella contentVersion corrente**: mostra `Già provata — nessuna reazione` e salta ripetizione se non richiesta.
5. **Vecchia no-reaction dopo update / nuova eligibility**: NON bloccare; lascia riprovare.
6. **Anomalia osservata e ancora instabile**: mostra memoria `Reazione instabile già osservata`, senza ripetizione/XP automatici. Se è riesaminabile, la prova esplicita deve essere possibile.
7. **Coppia che era già nota ma è cambiata con gating/pack**: la memoria UI non può impedire progressi futuri; derivare sempre dalla semantica corrente del resolver.
8. **A+A**: valido anche su due copie dello stesso elemento sul tavolo.

La soppressione dei tentativi ridondanti è una **scelta UX / application** verificata con un projector, non una modifica al resolver; in caso di incertezza scegliere esecuzione normale anziché falsamente `Già fatto`.

## Elemento attualmente esaurito

È **esaurito per ora**, non `finito per sempre`. Calcolare solo reazioni correntemente eleggibili, sicure, non segrete con elementi già posseduti usando il selector comune di Phase 6.

- Stato di ogni card (es. icona piccola + tooltip/label accessibile): Nuove possibilità / Reazioni conosciute / Già provato / Nessuna pista attuale.
- `Esaurito per ora` non deve indicare future combinazioni segrete o Set nascosti; ricalcolare al cambio di contenuto, scoperta, gate o anomalia.
- Filtro ordinamento `Con piste`, `Esauriti per ora`, `Mai provati con A`, `Ricette note con A`.
- Nessuna informazione esatta su future ricette non scoperte al di fuori della modalità informativa/hint già progettata.

## Più combinazioni per lo stesso risultato

- Due PairKey diversi possono produrre lo stesso elemento; registrare **ciascuna ricetta scoperta**.
- Raggruppare in scheda risultato le vie note (A+B→X; C+D→X).
- Se una combinazione nuova produce elemento già noto: `Nuova ricetta`, non `Già scoperto`.
- Quick action `Prova con risultato` usa elemento noto senza scroll infinito.
- Eventuali ricette alternative non scoperte non vengono anticipate in hint, contatori o badge segreti.

## Ricerca e ritmo

- Campo di ricerca persistente/sticky con autofocus opzionale da scorciatoia `/` (non durante digitazione in input).
- Ricerca accent-insensitive (italiano), per nome e alias **solo visibili**, Set visibili e tag non spoiler.
- Risultati in tempo reale su elementi posseduti, evidenziazione del termine, ordinamento rilevanza/recenza/preferiti/Set.
- Suggerimenti rapidi recenti e preferiti, ultimi usati, `Ripeti con A` e bottone `Usa risultato` a portata di mano.
- Rotellina, scroll della library, stato query e posizione mantenuti quando si apre una scheda/si cambia modalità/si torna al Lab.
- Virtualizzazione quando i contenuti crescono (target 1000+), niente full graph/full pair matrix su ogni render.

## Movimento, sensazione e feedback

- Drag ghost dalla carta illustrata, drop snap, orbit/ripple, collegamento tra elementi e reveal differenziato, usando i motion tier di Phase 7.
- Drop immediato ma esito dichiarato solo dopo commit; animazione non governa il save.
- Nessuna modale a ogni combinazione, niente attese obbligate; risultato può essere afferrato e riusato immediatamente.
- Riduzione movimento da impostazioni/OS, high contrast e suoni solo opt-in.
- I drop senza esito restano brevi, non punitivi e non interrompono il flusso.

## Stato e versioning

- Posizioni del tavolo sono **presentazione**, non progressi canonici. Tenere inizialmente in UI state; opzionale ripristino layout separato per modalità, senza gonfiare PlayerSave. Non registrare migliaia di drag come transazioni di gameplay.
- `SaveApplication.combine` unica transazione per vera combinazione eseguita.
- Sia pointer/touch sia tastiera attivano la stessa command pipeline.
- Non usare librerie DnD non mantenute; scegliere dopo spike browser su mobile/desktop.
- Non anticipare Android-specific branching; touch e WebView prevedibili.

## Test di accettazione

- Laboratorio classico regressione totale.
- Tavolo libero mouse/pen/touch/keyboard, collisioni e no collision, movimenti e duplicazione desktop/mobile.
- Doppio click duplica senza combinare; gesto mobile ha alternativa esplicita.
- Pair noto non farmabile; ricetta alternativa sullo stesso risultato ancora discoverable; anomaly revisitable non bloccata; stale no-reaction non bloccata.
- Import contentVersion aggiornata non fa perdere opportunità.
- Ricerca nome/alias/Set, no spoiler, query/scroll preservati, 1000+ element perf.
- 320/390/768/1024/1440/1920, 200% zoom, safe-area, reduced motion, axe, PWA offline e aggiornamento non distruttivo.
- Screenshot/video brevi dalle vere interazioni nelle due modalità, desktop e smartphone.

## Sequenza consigliata

Implementare **UX-1** su una base visuale 7.5 approvata prima del rilascio di grandi pacchetti. Il motore resta invariato; far approvare le due modalità con un piccolo playtest reale prima di espanderle.
