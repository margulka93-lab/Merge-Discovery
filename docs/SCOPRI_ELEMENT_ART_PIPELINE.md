# Elementi illustrati — contratto visivo e pipeline pilota

Status: **direzione e contract per il primo proof**, non è un set di illustrazioni già approvato.

## Problema

L'attuale `ElementArt` è un fallback SVG simbolico; i concept approvati mostrano **oggetti pittorici riconoscibili**. La tavola va resa giocabile con figure belle e leggibili, non con card o simboli ripetuti.

## Famiglie di resa

- **Essenze astratte/cosmiche** (Vuoto, Energia, Tempo, Luce): vortici, anelli, materia luminosa, silhouette nette senza trasformare tutto in cerchi quasi identici.
- **Materia e fenomeni** (Materia, Calore, Acqua, Vapore, Fuoco, Roccia): oggetti/materiali/volumi distinguibili a 64–128 px; luce e colore coerenti con la natura dell'elemento.
- **Vita e natura** (Seme, Albero, Creatura): silhouette organiche riconoscibili e coerenti con la scala degli altri oggetti.
- **Concetti complessi futuri**: inventare grammatica simbolica pertinente, non forzare ogni concetto in un cubo.

Un singolo `artKey` stabile punta a un master/asset locale; un elemento può avere varianti `board`, `library`, `atlas`, ma con identità e silhouette coerenti.

## Lotto pilota minimo (non l'intera collezione)

Prima approvazione visiva su **12 elementi canonici**:

`void`, `energy`, `matter`, `time`, `light`, `heat`, `water`, `lava`, `rock`, `steam`, `tree`, `creature`.

Gli ID sopra sono stati verificati nel seed attuale da 67 elementi. **`fire` (Fuoco) non è un elemento canonico nel seed:** compare nei concept grafici ma non deve essere introdotto implicitamente come nuova ricetta o asset associato.

Confrontare almeno: 4 starter, 2 elementi fenomeno, 2 solidi, 2 forme di vita e 2 risultati avanzati. Differenziarli **senza** dipendere solo dal colore.

## Specifiche tecniche dei master

- Sorgente painterly premium con silhouette ben isolata e trasparenza corretta (no fondale quadrato nel PNG).
- Art master min 512×512, con area utile consistente (padding ottico e non crop casuale).
- Derivati: `library` ~64–80 CSS px, `board` ~96–144 CSS px, `atlas` ~200–300 CSS px, esportati con DPR sensato e compressione WebP/AVIF o PNG fallback se giustificato.
- Stessi pivot/centro visivo; `object-fit: contain` e nessun layout shift; shadow/glow UI separato dall'immagine ove utile.
- Real asset senza font/testo/UI disegnati dentro l'immagine.
- Registrarne `artKey`, path, pixel dimensions, alpha, perceived scale, master/source provenance, license/ownership and checksum in an asset manifest.
- Lazy loading e import/export compatibili con il futuro Content Studio runtime. Fallback `ElementArt` per tutti gli elementi non ancora disegnati, senza promettere un'illustrazione finale.
- Ottimizzare il peso, specialmente PWA/offline/mobile; immagini dell'isola e elementi si sommano al budget totale.

## Processo

1. **Design/prove in parallelo a Scopri VNext:** screenshot composizione con placeholder accurati e 12 immagini pilota; se ancora non ci sono veri asset, etichettare `temporary`. Niente pretesa di aver approvato stile produzione sulla base di icone geometriche.
2. Approvare **un master/stile e scala** per diverse famiglie (non 12 stili indipendenti).
3. Estrarre derivati/manifest di arte e provarli nello **stesso vero renderer** in tavola, list e Atlante a 1440/390/320.
4. Una volta approvati, generare il resto dei 67 per **batch**, verificando silhouette, uniformità e performance dopo ogni batch.
5. L'importer/Studio #14/#15 dovrà usare lo stesso artKey manifest, non introdurre un secondo asset contract.

## Distinzione dalle immagini del concept

I poster grafici sono **target di mood/composizione**, non sprite sheet estraibili né screenshot del risultato reale. Non usare crop di figure dal poster come asset in-game. Una bella immagine statica non dimostra drag, collisioni, alfa, performance o resa a 64 px.

## Verifica visiva obbligatoria

- Tavola desktop con figure di classi diverse; list stretta visibile e leggibile;
- stessa scena 390×844 e 320×568;
- contrasto/silhouette su fondo scuro, anche con riduzione movimento;
- risultati nuovi e noti non coperti da UI;
- nessun rifacimento del canone/alias artKey.
