# SCOPRI — Nuova esperienza principale (Discovery-first VNext)

Status: **direzione prodotto scelta; specifica di implementazione incrementale, non approvazione del vecchio FreeTable**.
Data: 2026-10-09.

## Obiettivo

Il cuore di Merge Discovery è **scoprire combinazioni ed elementi**, non gestire un laboratorio a moduli e nemmeno far progredire un'isola idle.

Tre superfici di prodotto:

- **Scopri** (`/`): esperienza principale; manipolazione di elementi illustrati su tavola libera.
- **Mondo** (`/island`, poi eventualmente `/world`): schermata secondaria in cui alcune scoperte permettono di manifestare cambiamenti; non richiesta per le ricette.
- **Atlante**: conoscenza già scoperta, ricette conosciute, Sets/Collections, e cronaca delle manifestazioni realmente committate.

Riferimento per la fluidità dei gesti: Little Alchemy 2. **Non copiare** branding, asset o UI proprietaria. Identità propria: navy notturno, oro sottile, atmosfera cosmica, elementi pittorici con silhouette leggibili.

## Perché ricominciare dalla UI, non dal motore

Il vecchio Lab in main è due-slot/Combina e griglia di card. PR #13/#16 aggiungono FreeTable, ma il playtest umano non ha approvato quel feel. Le sue parti di ricerca, replay e pointer sono **candidate di riuso selettivo**, non layout accettato.

Preservare:

- ContentIndex e resolver canonico A+B (ordine indifferente, supporto A+A).
- SaveApplication, XP/progression, visibility, hints, anomalie, Set.
- player-save versioning/backup, PWA/update-safe e foundation WorldState.
- indipendenza tra scoperta (PlayerSave) e manifestazione (WorldState).
- Content Studio/importer future in PR #14/#15 senza trascinare la UI #13.

## Schermata Scopri: composizione

### Desktop

- Tavola/area di gioco dominante, **75–85% della larghezza utile del Lab**, senza considerare la global navigation; navigazione molto discreta/collassabile.
- Sidebar biblioteca a destra **220–260px circa**; lista verticale densa, miniatura + nome. Evitare grandi card in griglia, metadati sempre visibili e KPI.
- Search sticky al primo posto; `Recenti`, `Preferiti` a un gesto; sorting semplice. A 1440×900 con save progredito poter leggere **almeno 10–14 nomi** senza scroll.
- Tavola senza uno schema a due slot visibili/centrali e senza un popup/pannello risultato che sottragga ampie porzioni.
- Pulsanti contestuali discreti per Duplica, Rimuovi, Pulisci e visualizza dettagli; nessun pannello tutorial sempre aperto.

### Mobile

- Tavola grande e **visibile subito**, dopo header ridotto e prima della nav finale.
- Biblioteca sottile come dock di ultimi elementi/preferiti; drawer/sheet **sovrapposto** al canvas, non lo restringe né sposta figure.
- Search accessibile dentro il drawer e da un'azione riconoscibile; trascina dalla lista al tavolo o fai tap per aggiungere.
- Ricerca/drawer mantengono testo, focus e scroll tra tentativi; evitare di chiudere/ripetere tutta la sequenza per ogni nuova coppia.
- Screenshot/test reali a 320×568, 390×844, landscape e input tastiera virtuale; nessun overflow orizzontale/pagina da scrollare per giocare.

## Figure libere, non bottoni travestiti

Ogni figura sul tavolo ha:

- `elementId`, identità della copia visuale e coordinate presentative;
- illustrazione dominante con sfondo trasparente;
- nome leggibile;
- piccolo stato contestuale solo se necessario (selezionato, nuova possibilità, anomalia).
 
Le figure non consumano elementi del catalogo. È possibile avere molte copie dello stesso elemento.
La posizione di una figura NON è uno slot/ancoraggio di ricetta: sono coordinate del tavolo.

Gestualità:

1. Drag dalla biblioteca in spazio vuoto → crea copia dove viene rilasciata.
2. Drag dalla biblioteca sopra una figura → tenta A+B in **un solo gesto**.
3. Drag di una figura sulla tavola in spazio vuoto → la sposta e la **lascia esattamente lì**, limitando solo il necessario per non perderla fuori viewport.
4. Drag di una figura su un'altra → combina. Se **non** c'è reazione, le due rimangono in prossimità della zona di drop, con piccolo disaccoppiamento per poterle recuperare. Mai snap-back all'origine.
5. Risultato valido → sostituisce solo le copie coinvolte nel punto di collisione. Il risultato è immediatamente trascinabile/duplicabile.
6. Doppio clic su figura → duplicazione veloce con piccolo offset. Doppio tap è una scorciatoia opzionale, ma esiste sempre azione contestuale `Duplica` per touch/keyboard.
7. Tap/click seleziona; una coppia selezionata può combinarsi attraverso un'azione accessibile equivalente al drag.
8. Pointercancel è annullamento del gesto, non un fallimento della ricetta.
9. La tavola usa quasi tutta l'area disponibile; **nessun clamp artificiale 16–84%**.
10. Niente time gating, stamina, drag minigames o ritorni forzati al menu.

### Esiti e regole

- Esito noto ripetuto: deve poter generare la figura risultante per continuare la catena, con feedback minimo, **zero XP**, **zero scritture superflue**. Una coppia identica già provata non deve impedire di produrre un risultato già conosciuto.
- Ricetta alternativa nuova che genera un elemento già posseduto: registrarla tramite SaveApplication con reward canonico di nuova ricetta, feedback `Nuova ricetta`.
- No-reaction: nessun blocco/modale, piccolo cue e oggetti restano dove rilasciati.
- Anomalia: feedback violetto contestuale. Le anomalie riesaminabili e le coppie stale dopo update devono poter essere riprovate.
- Solo un projector applicativo può fare known replay; non estrarre ricette ignote nel UI.
- Dopo scoperte che permettono un'azione Mondo, piccolo invito contestuale `Puoi trasformare il Mondo` se la safe projection lo conferma; non si cambia schermata automaticamente.

## Trovare elementi non deve essere una fatica

- Search accent/case insensitive su **soli elementi posseduti e alias/Set visibili**; nessuna query sul canone completo.
- Ordinamento di default sensato (alfabetico/search relevance), con Recenti e Preferiti ben riconoscibili.
- Elemento appena scoperto entra nella lista subito e diventa disponibile per il tavolo; non perdere query/scroll.
- Filtri discreti: `Tutti`, `Con nuove piste`, `Esauriti per ora`, più scelte secondarie in overflow.
- `Esaurito per ora` è **relativo a contenuto/gate/possessi attuali**, usando il selector Phase 6, mai promessa che sia inutile per sempre; ricalcolare dopo scoperte/update.
- Ricette alternative conosciute sono distinte dalla conoscenza dell'elemento risultante; nessun leak di ricette/Set nascosti.
- 1000+ definizioni: virtualizzare libreria e non renderizzare/scandire tutte le combinazioni a ogni frame.

## Ritmo e motion

- Il gesto deve fare il lavoro; l'animazione lo sostiene e non costringe ad aspettare.
- Hover/collision candidate con alone lieve; fallimento con microreazione non punitiva; noto con snap morbido; nuovo elemento con reveal locale caldo/orbitale; anomalia viola controllato; hidden Set come evento superiore.
- Nessuna modale obbligatoria per singolo risultato. Tutte le scoperte vengono comunque annunciate in modo accessibile e registrate.
- Nessun audio prima dell'interazione utente e sound opt-in; rispetta reduced motion/forced colors.

## Interazione col Mondo e l'Atlante

- `Scopri` resta la home e può funzionare interamente da sola. `Mondo` e `Atlante` sono destinazioni di navigazione accessibili in un gesto, senza azzerare la tavola al ritorno.
- WorldState/PlayerSave restano distinti. Manifestare non regala nuove ricette/XP.
- Le manifestazioni reali (non mere conoscenze) vengono registrate nell'Atlante e conservate su Mondo; la disponibilità di azioni future non svela ID segreti.
- Memoria delle copie/coordinate della tavola = stato UI, mai progresso XP. Conservarle almeno quando si torna da Mondo/Atlante **nella stessa sessione**; un eventuale ripristino dopo reload è opzionale e isolato dal PlayerSave.

## Rischi da evitare

- Reimpacchettare il vecchio Lab in una grande card/tab "Tavolo".
- Tavola piccola e library ingombrante.
- Snap-back dopo drop fallito.
- Usare solo bottoni per gli elementi con art ornamentale irrilevante.
- Dare la stessa icona generica a decine di elementi.
- Costringere a un `Combina` esplicito per ogni prova.
- Duplicare resolver/stato progressi per Tavolo/Mondo.
- Produrre 67 asset finali prima di validare un piccolo set coerente.
- Fondere PR #13/#16/#14/#15 integralmente senza controllo delle dipendenze.

## Playtest di accettazione

Test automatici: 30 tentativi consecutivi reali su desktop e touch emulato, uno scenario da 4 starter, uno da save progredito, almeno due A+A/catene, replay noto senza XP, nuova alternativa, anomalia, fallimenti e ritorno da Mondo senza perdere layout.

**Gate umano**: 10–15 minuti su PC e smartphone. Chiedere non solo "funziona?" ma se si può continuare a combinare senza sentire il peso della UI. Test verdi ≠ feel approvato.
