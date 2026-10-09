# Merge Discovery — Scoperta al centro, Mondo e Atlante come conseguenze

Decisione di prodotto — 2026-10-09.

## Gerarchia canonica dell'esperienza

**La scoperta di combinazioni ed elementi è il gameplay principale.** L'Isola/Mondo non sostituisce il gioco: è una schermata collegata in cui le scoperte si riflettono e, quando pertinente, possono essere manifestate. L'Atlante documenta conoscenze, ricette e osservazioni del mondo.

Loop:
1. sperimento A+B con un'interfaccia davvero rapida, comoda e soddisfacente;
2. scopro nuovi elementi, ricette alternative, anomalie e Set con il resolver e il save canonici;
3. la nuova conoscenza sblocca presenze, cambiamenti o manifestazioni possibili nella schermata Mondo, con segnalazione discreta;
4. posso visitare il Mondo, scegliere dove manifestare una cosa eleggibile e osservare il cambiamento (facoltativo per continuare a scoprire);
5. l'Atlante registra le mie scoperte e solo le trasformazioni effettivamente committate nel Mondo;
6. ritorno a scoprire in un gesto, senza flussi obbligatori o doppia conferma.

**Nessuna ricetta di base richiede una visita all'Isola per progredire.** WorldState separato da PlayerSave; una trasformazione non concede nuovi elementi/XP. Non ogni elemento è piazzabile: forze, condizioni, concetti e fenomeni possono avere un effetto ambientale oppure unicamente una pagina Atlante.

## Architettura della navigazione proposta

- **Scopri** — home `/`; vera interazione primaria di combinazione, con libreria veloce, risultati immediati e catene fluide. Non congelare il vecchio Laboratorio come UX definitiva solo perché è in main.
- **Mondo** — schermata separata `/island` nel proof; possibile `/world` più avanti. Territorio da osservare e modificare usando scoperte già possedute. La mini-selezione A+B nel proof è un supporto/diagnostica, **non** un secondo Laboratorio che debba diventare la nuova home.
- **Atlante** — conoscenze, ricette note, Set/Collections, storia delle manifestazioni reali; può riusare i projector e le route Catalog/Set/Element precedenti.
- **Esplora/Anomalie/Mappa delle relazioni** — viste secondarie integrate senza spoiler; impostazioni/Studio quando adeguati.

Non cambiare oggi route e backend per anticipare una UI non approvata. La schermata Mondo deve restare raggiungibile anche da desktop/mobile quando verrà integrata nella nav finale.

## Effetto delle scoperte sulla mappa

- L'acquisizione di un elemento può segnalare `Nuova possibilità nel Mondo` soltanto se esiste un'azione World valida e autorizzata. Usare lo stesso save/eligibility projector, mai metadati nascosti in UI.
- La mappa visiva non deve far apparire automaticamente una manifestazione che l'utente non ha scelto. Si può mostrare uno stato di ambiente/luce o un suggerimento **soltanto** se non attribuisce world observations o nuove scoperte; distinguere chiaramente atmosfera ambientale e azioni committate.
- Le trasformazioni create vengono mantenute e viste all'apertura della schermata; non servono check-in/timer/stamina.
- L'Atlante distingue `scoperto` da `presente nel Mondo`.

## Riuso controllato delle PR attuali

- **#17 Isolario Foundation**: buona candidata da integrare in main dopo audit/migrazione e gate tecnici, perché offre WorldRepository e validazione indipendenti dalla UI.
- **#18 Concept Proof**: prova utile su `/island`, con `/` invariata; può essere preservata **come feature sperimentale** dopo verifica visuale, ottimizzazione dei raster (~9,25 MiB contro obiettivo 5 MiB), controllo PWA e chiarezza nella navigazione. Non dichiararla design finale.
- **#9–11 Visual 7.5**: recuperare selettivamente componenti, asset e stile per la futura Scopri/Atlante, non fare un merge a catena solo per includere i commit.
- **#13/#16 Tavolo libero**: non sono il design approvato; estrarre i pezzi affidabili di ricerca/gesti/replay, ma non imporre la UI FreeTable non gradita.
- **#14/#15 Pack importer e Content Studio**: conservare i branch, recuperare su una PR indipendente senza trascinare #13/vecchio Tavolo libero, e testare import contenuti e world mappings in fase successiva.
- **#12 Phase 8A**: contenuto proposto, non canon approvato. Nessun merge.

## Regola di integrazione Git

**Non unire tutte le PR draft in main.** Main deve essere coerente e riproducibile. Le PR in branch GitHub sono già pushate e non vanno perdute se rimangono aperte.

1. Verifica tecnica e, se accettata, merge mirato #17.
2. Aggiorna la base di #18 alla main risultante, risolvendo correttamente la storia stacked, evitando duplicazioni; correggi peso asset e integra l'accesso al Mondo solo come schermata separata. Conserva eventuale flag/proof notice finché visual/playtest non sono approvati.
3. Valuta merge mirato del proof come **esperimento** o mantenimento in draft finché i gate sono aperti.
4. Pianifica PR indipendente **Discovery-first integration**: nav Scopri/Mondo/Atlante, entry fluida del core, feedback mondo disponibile e ricerca/replay; niente nuovi motori.
5. Esamina e porta le parti riusabili #14/#15 in PR separate; non importare automaticamente UX dismessa e #12.

Il budget, il test su telefono fisico, l'approvazione visuale e il bundle di export completo save+world restano limiti espliciti da chiudere prima di un rilascio pubblico.

## Criterio di accettazione

La persona deve poter giocare alla **scoperta** per 10–15 minuti senza aprire Mondo o Atlante; visitando il Mondo deve vedere conseguenze significative delle scoperte, non trovarsi obbligata a ripetere tutto il loop A+B. Il passaggio Scopri → Mondo → Atlante → Scopri deve essere immediato su PC e telefono.
