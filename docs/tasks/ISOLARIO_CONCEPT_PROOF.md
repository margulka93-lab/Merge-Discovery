# Concept Proof Slice — priorità aggiornata

Richiesta diretta dell’utente, 2026-10-09: verificare la fattibilità di **Isolario + Atlante Vivente**, non costruire il gioco completo né assumere approvata ogni forma dell’isola.

Questa tranche sostituisce la sequenza Island → Atlante del task prototipo con **un solo piccolo draft di fattibilità**. Il checkpoint precedente resta storico: non viene trasformato retroattivamente in approvazione artistica. L’autorizzazione successiva permette qui un renderer campione giocabile e una prima pagina dell’Atlante prima della produzione definitiva, per la review richiesta.

Base: Foundation #17, `codex/isolario-foundation`, SHA `9aa9130021f0205aa4fabae559b53af175ce5c3b`. Draft stacked separato, nessun merge o modifica di #9–17. Nessun nuovo elemento, ricetta, Set, Collezione o era; nessuna modifica ai mapping Foundation, al resolver, al save schema o ai gate esistenti.

## Scope di prova

- `/island`: una plate illustrata, camera desktop e proposta di vista ravvicinata mobile con due rive, quattro piccoli asset modulari campione; non una nuova dashboard.
- Essenze possedute → esperimento canonico → risultato salvato → scelta esplicita della riva → manifestazione committata → cronaca. Nessuno spawn al boot o timer.
- Terreno fertile, ambiente/acqua/luce, crescita seme → germoglio → albero; creatura generica con habitat già authored. Gli altri mapping Foundation restano tecnicamente esercitabili con studi provvisori.
- Tap/click, tastiera, lista testuale equivalente; libro modale con focus/Escape/ritorno, senza cambio route; prime sei scoperte e cronaca acquisita, non catalogo Atlante definitivo.
- Stesso runtime SaveApplication, WorldRepository e projector safe della Foundation; nessuna copia del motore o database parallelo.

## Evidenza richiesta

Review di fattibilità separa prove tecniche, giudizio visivo e limiti produttivi; nessuna approvazione automatica. Screenshot iniziale/trasformato e Atlante 1440×900, 390×844, 320×568, intermedi e capture reale browser desktop/mobile emulato. Test core/validator/reachability, percorso fresco via UI, replay, recovery, touch/tastiera, responsive/axe, produzione offline/waiting worker, bundle e budget asset.

Telefono fisico, screen reader manuale, tastiera software reale e playtest umano vanno segnati **NOT RUN** se indisponibili. Non inventare valutazioni di piacere/agency. Non procedere alla produzione completa o ad altre tranche dopo questa PR: consegnare la fattibilità per revisione.

## Documenti e riferimenti

AGENTS, CODEX_TASK, ISOLARIO_CHECKPOINT_APPROVED, ADR ISOLARIO_ATLANTE_ARCHITECTURE, task ISOLARIO_ATLANTE_PROTOTYPE e migration; required reading core/save/seed/validation/visibility, VISUAL_BIBLE_REFERENCE, DESIGN_SYSTEM, ACCESSIBILITY, RESPONSIVE_AND_UI_STATES, MOTION_AUDIO e HINTS_AND_FAILURE. Pattern replay/lease già recuperati selettivamente nella Foundation.

Ispezionati il poster locale `Bibbia di Design Merge Discovery.png` e i campioni Foundation iniziale/sviluppato. Il poster orienta navy/oro, pittura naturale e gerarchie; le sue vecchie schermate laboratorio non sono il layout del mondo. I campioni Foundation sono proposte, non immagini automaticamente approvate. Il proof deve rendere verificabili anche le differenze rispetto al campione piatto e al fit completo dell’isola.
