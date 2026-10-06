# Phase 3 — primo Laboratorio giocabile

Questa tranche implementa soltanto il task corrente di `CODEX_TASK.md`, fino a Phase 3. Phase 4 non è iniziata. Nessuna modifica a elementi, ricette, XP, tassonomia, unlock di gameplay, schema del save o altre decisioni canoniche.

## Fonti lette

`AGENTS.md`, `CODEX_TASK.md` e tutto il required reading: VISUAL_BIBLE_REFERENCE, VISUAL_DIRECTION, DESIGN_SYSTEM, UX_SCREEN_ARCHITECTURE, SCREEN_SPECS, RESPONSIVE_AND_UI_STATES, ACCESSIBILITY, MOTION_AUDIO, FIRST_SESSION_EXPERIENCE, COPY_AND_LOCALIZATION, DATA_MODEL, SAVE_AND_VERSIONING e PHASE_2_NOTES. Verificati anche TECH_SPEC e DECISIONS per confini e precedenze.

La Visual Bible controlla atmosfera e gerarchia: osservatorio blu notte, oro caldo, carte illustrate simboliche, orbite e geometria incompleta viola. Gameplay/UX e contenuto canonico controllano comportamento e visibilità. Le illustrazioni sono placeholder SVG locali, deterministici rispetto ad `artKey`, senza testo incorporato; non sono artwork finali. Nessun WebGL, asset remoto o audio.

## Architettura e componenti

- `src/application/laboratory.ts`: DTO e selettori di presentazione. Esporta solo elementi posseduti e relativi nomi localizzati, preferiti, contesto storico di coppia, livello/progresso, navigazione eleggibile e risultati/eventi già committati. Non anticipa partner validi, risultati sconosciuti o denominatori nascosti. Riusa la valutazione Phase 2 per fallimenti ancora autorevoli.
- `src/application/save/SaveApplication.ts`: nuovo caso d'uso `updatePreferences` per preferiti e le tre preferenze di accessibilità necessarie. Normalizzazione, validazione, controllo revisioni, backup e commit precedono la pubblicazione; usa il repository esistente. `combine` resta la transazione Phase 2, senza duplicazioni nel frontend.
- `src/app/App.tsx`: composizione/orchestrazione React. Snapshot persistito come unica verità durevole; slot, esito presentato, destinazione e lock di transazione sono temporanei. Pubblica l'esito solo dopo il commit. Un errore mantiene gli input e il progresso valido, permette di riprovare/ricaricare e rende accessibili gli strumenti di export/recupero esistenti. Nessun reset automatico.
- `src/ui/shell/AppShell.tsx`: AppShell, NavigationRail e BottomNavigation; include accesso rapido al main e DiscoveryLevelBadge.
- `src/ui/lab/Laboratory.tsx`: stage e biblioteca. Ricerca/filtro restano montati cambiando destinazione e breakpoint. Le azioni dopo l'esito riportano il focus allo slot A o alla ricerca, mentre il reveal lascia il focus sul Combina.
- `src/ui/components/LabComponents.tsx`: DiscoveryLevelBadge, ElementCard, ElementSlot, CombineButton, ReactionStage, DiscoveryReveal, SearchBar e InlineNotice.
- `src/ui/components/ElementArt.tsx`: placeholder simbolici riusabili a scala carta/hero con chiavi stabili e accento del Set tramite token.
- `src/styles/global.css`: stili dei componenti, shell adattiva, stati, focus, animazioni leggere e sostituzioni statiche per movimento ridotto/forced colors. `tokens.css` resta la fonte dei colori canonici.
- `src/ui/SaveDiagnostics.tsx`: gli strumenti della Phase 2 restano sotto il pannello minimo Impostazioni; dopo import/recupero notificano alla composizione il nuovo snapshot. Nessuna seconda copia durevole del progresso.

Non servono ancora routing profondo o un ulteriore store: le destinazioni successive sono solo segnaposto espliciti. Le tre opzioni di accessibilità e gli strumenti di salvataggio sono l'unico contenuto del pannello Impostazioni minimo.

## Interazioni e stati

Tap, click, Enter e Space selezionano il prossimo slot libero; lo stesso elemento riempie A+B per le ricette A+A. Lo slot pieno si svuota con un'attivazione. Nessuna risoluzione automatica e nessun consumo. Combina richiede due elementi validi, serializza il salvataggio e conserva il focus durante il commit.

Esiti separati: nuova scoperta, ricetta alternativa con risultato posseduto, ricetta conosciuta, nessuna reazione, prima anomalia e ripetizione dell'anomalia. Tutti hanno testo persistente e annuncio live conciso. Un nuovo Set viene nominato solo dal relativo evento salvato. `Usa risultato` mette il risultato in A e svuota B; `Ripeti con A` conserva A originale e svuota B; `Nuovo esperimento` svuota entrambi. Nessun `Vedi scheda` fittizio.

Preferiti senza limite nel save, filtro e accesso rapido orizzontale; ricerca solo sui nomi posseduti. Le carte mostrano nome, Set, selezione e al massimo un contesto storico pertinente ad A. Fallimenti obsoleti non sono dichiarati ancora validi. Nessun highlight di partner non provati. La nuova scoperta entra nella biblioteca dopo il salvataggio, senza sostituire automaticamente A.

`Luna + Vita` presenta Reazione instabile, geometria viola incompleta e messaggio canonico; nessun futuro risultato. Nessuna reazione usa un anello neutro e non è un errore. Repeat non aggiunge XP; preferiti/opzioni non cambiano XP.

## Navigazione e precedenze

Avvio: Laboratorio e Impostazioni. Collezione compare dopo tre nuove scoperte, Set dopo un reveal ulteriore rispetto ai Set iniziali, Mappa a 15 elementi posseduti, Anomalie dopo un'osservazione. Mappa/Anomalie si raggruppano sotto Esplora su mobile quando entrambe esistono, mantenendo massimo cinque destinazioni. Sono solo segnaposto: nessun catalogo, Set browser, archivio o grafo.

Nota di interpretazione documentale: “3 discoveries” nell'onboarding indica tre scoperte effettuate dal giocatore, escludendo i quattro concetti forniti; questo conserva la prescrizione esplicita dell'avvio con solo Lab/Impostazioni. Il seed non contiene regole feature per questa navigazione, quindi queste soglie sono esclusivamente disclosure UX nei selettori Application, secondo SCREEN_SPECS/FIRST_SESSION_EXPERIENCE. Nessun nuovo unlock nel dominio o nel contenuto.

Il vecchio SCREEN_SPECS menziona `Vedi scheda` e FIRST_SESSION_EXPERIENCE chiama ancora provvisoria la coppia anomala: prevalgono il task attuale (nessuna scheda Phase 4) e il seed bloccato (Luna + Vita). Nessuna contraddizione irrisolta; nessuna soluzione creativa inventata.

## Responsive e accessibilità

Viewport verificati in Chromium: 320×568, 390×844, 768×1024, 1024×768, 1440×900 e 1920×1080. Nessun overflow orizzontale; esperimento e ricerca sopravvivono al ridimensionamento. Desktop: tre zone, rail persistente, stage e biblioteca con scroll indipendente. Compact: rail e biblioteca sotto lo stage. Mobile: header, stage, ricerca/preferiti, griglia a tre colonne (due a 320 o testo grande), bottom nav con safe area. A 320 gli slot si impilano. Testo molto grande può impilare anche i pannelli per conservarne l'usabilità.

Pulsanti semantici, landmark, label, stato selezionato/preferito, nomi accessibili senza spoiler, focus evidente e live region polite. Target dei pulsanti misurati ≥44×44 nei sei viewport. Gli esiti rimangono leggibili senza colore/movimento/audio. Nessun drag richiesto. Movimento ridotto nel save e `prefers-reduced-motion` eliminano le animazioni; high contrast e forced colors rafforzano i bordi. Verificati ingrandimento del testo al 200%, preferenza testo molto grande e contrasto elevato.

Test browser percorre tutti i 67 elementi attivando ricerca, carte, Combina e continuazione con tastiera, usando transazioni reali IndexedDB. Axe esegue scansioni senza violazioni sul Lab normale e con testo/contrasto adattati. Le verifiche ARIA/nomi/live/focus sono automatiche; non equivalgono a certificazione WCAG o a una sessione manuale con NVDA. Le schermate Phase 4 escluse non sono oggetto di verifica.

## Comandi e risultati

```sh
npm ci
npm run dev
npm run check
npx playwright install chromium
npm run test:e2e
npm run validate:content
npm run simulate:content
npm run build
npm run preview
```

`check`: typecheck, lint, 98 test in 5 file e build validata. `test:e2e`: 4 test Chromium (viewport/accessibilità, round trip reale IndexedDB, percorso seed da tastiera, screenshot). CI esegue entrambi, installando Chromium con le dipendenze Linux.

Validator: 67 elementi, 64 ricette, 6 Set, 4 Collezioni, 1 anomalia; schemi/referenze/localizzazione/ambiguità/completion/raggiungibilità non segreta PASS. Simulazione: **67/67**, profondità massima **11**, zero elementi required irraggiungibili, zero Set non rivelati e zero unlock bloccati. Le regressioni Phase 0–2, i rollback e i test di migrazione/recupero restano verdi.

Limiti tecnici: le descrizioni canoniche restano placeholder, senza riscriverle. Restano warning non bloccanti delle annotazioni upstream Zod/Rollup; il bundle iniziale supera di poco la soglia indicativa Vite di 500 kB (circa 152 kB gzip). Il codice non modifica la soglia per nascondere l'avviso. Art/audio finali, ottimizzazioni del catalogo e schermate successive restano fuori scope.

## Screenshot richiesti

Screenshot del viewport, senza ridimensionamento successivo. Il test importa tramite preview/conferma la fixture compatibile `v1-completed-sets`: tutti gli elementi mostrati sono posseduti dal save di test. Sono evidenza della UI, non uno spoiler nel nuovo gioco.

- [1440×900 — desktop, reazione conosciuta](evidence/phase-3-1440x900.png)
- [390×844 — mobile, anomalia Luna + Vita](evidence/phase-3-390x844.png)
- [320×568 — viewport minimo, slot impilati A+A](evidence/phase-3-320x568.png)

Conferma scope: nessuna Phase 4, catalogo completo, detail, Set browser, Collezioni, archivio anomalie completo, mappa, hints, PWA, Android, backend, cloud, monetizzazione, analytics, Arcano, ricette nuove o artwork finale.
