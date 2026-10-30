---
data: 2026-10-30 01:35
tipo: passaggio-di-consegne
referto: consegne/design/2026-10-29-esperienza-cliente-vs-migliori.md
carta: "#222"
---

# Come riprendere il lavoro sul sito visto da chi compra, in una sessione nuova

## In parole semplici

Questa pagina serve a una sessione nuova per partire subito, senza rifare l'analisi del 29 ottobre. Dice cosa è già deciso, cosa aspetta Nicola, da quale file parte ogni mossa e come si prova che è fatta.

Un esempio. La mossa «il marchio intero in testata» ha già la sua scheda aperta nel registro dei difetti del sito, ed è già nella seconda ondata. La sessione nuova non deve aprire niente: ripara quella scheda, dentro quell'ondata.

## Cosa cambia per te

Una sessione nuova, aperta domani, trova qui tre cose. La prima è il legame fra le dieci mosse e le schede che il registro dei difetti del sito ha già. La seconda è lo strumento per fotografare le pagine prima e dopo. La terza è il motore per rimisurare il sito quando le mosse sono fatte.

## Cosa devi fare

Prima di tutto unisci la richiesta di unione di questo lavoro. Una sessione nuova parte dal ramo principale: finché non unisci, questa pagina non la vede. Poi rispondi alla carta delle quattro scelte. Senza le risposte partono solo le mosse che non le aspettano.

## Cosa non ho verificato

Il sito vero non l'ho aperto in un browser: le foto sono ricostruite attraverso Vercel. Le prove scritte per ogni mossa sotto sono proposte, non le ho fatte girare. Il legame fra mosse e schede l'ho fatto cercando parole nel registro: una scheda giusta può essermi sfuggita.

---

## Dettagli tecnici

### Lo stato al 2026-10-30 01:35

- **Referto:** `consegne/design/2026-10-29-esperienza-cliente-vs-migliori.md` (pagella, dieci mosse, prove `file:riga` area per area). Materiale grezzo collaudato: `consegne/design/2026-10-29-esperienza-cliente-raw.json` (191 requisiti con stato, prova e proposta; 3 benchmark con fonti; 42 osservazioni a occhio confermate).
- **Foto e testi delle 11 pagine** del 29/10 20:15: `consegne/design/2026-10-29-foto-pagine/`, `consegne/design/2026-10-29-pagine-testo/`.
- **Carte che aspettano Nicola:** #222 (le quattro scelte: a chi somigliare, codice al posto della password, regali o fresco, foto del titolare), #201 (cancellare il negozio di prova, comando SQL pronto), #210 e #154 (la chiave di servizio su Vercel: il 30/10 alle 00:25 mancava ancora, e finché manca la cassa non registra ordini).
- **Il sito:** repo `NicolaeRotaru/mycity`, letto al commit `0df5557`. Nessuna riga del sito è cambiata con questo lavoro.
- **Registro dei difetti del sito:** `MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json`. Il piano della seconda ondata: `consegne/audit/2026-10-28-ondata2-sito.json`, preparazione in `consegne/audit/2026-10-28-ondata2-preparazione.md`.
- **Il materiale grezzo NON entra nel conto dei difetti** (`REFERTI_DI_ALTRI` in `cervello/referti-sito.mjs`): è un confronto requisito per requisito, e molti «fa danno» sono già schede del registro. Le mosse entrano nel lavoro attraverso le schede qui sotto.

### Le dieci mosse, collegate al registro

«Schede» = id della radiografia dell'11/10 e indice nel registro (`problemi[idx]`). «Ondata 2» = già dentro il piano della seconda ondata, col nome del pacchetto. Una mossa SENZA scheda va aperta nel registro solo dopo il sì di Nicola, con la prova comportamentale scritta accanto: è lavoro approvato, non una ricerca nuova, e non tocca il freno sul tasso di chiusura.

| # | Mossa | Schede già aperte | Ondata 2 | Aspetta |
|---|---|---|---|---|
| 1 | Cancellare il negozio di prova | R215 minore (idx 153), R216 minore (idx 260) | no | Nicola, carta #201 (🔴, cancella dati) |
| 2 | Merce nella prima schermata | nessuna | — | per la home la scelta 1 della #222; la scheda prodotto no |
| 3 | Via scaffali vuoti e classifiche finte | R88 grave (idx 300), R232, R103, R200, R226 minori | R88 nel pacchetto `components/CategoryShowcase.tsx` | niente: «categorie vuote nascoste» firmato il 26/10 |
| 4 | Marchio intero e «Accedi» visibili | R35 grave (idx 278) | sì, nel pacchetto `app/messages/page.tsx` | niente |
| 5 | Conferma con un codice, senza password | nessuna (vicine: R134, R211) | — | scelta 2 della #222; poi @security e @legale-privacy |
| 6 | Una promessa di consegna sola | R48 grave (idx 23), R66 grave (idx 253); R228 minore (idx 266) la chiude la #263, secondo la richiesta #899 | no | la regola nuova del prezzo (registro dei fatti, `consegna.promessa`, sera del 29/10) deve prima entrare nella cassa: è nell'ondata 14 del sito |
| 7 | Il volto del titolare | R164, R150, R216 minori | no | scelta 4 della #222 + consenso scritto del titolare (🔴) |
| 8 | Totale del carrello sotto il pollice | nessuna (vicina: R118) | — | niente |
| 9 | Via le promesse non mantenute | R64 grave (idx 251), R60 grave (idx 50), R67 grave (idx 254), R257, R108, R264, R227 minori | R64 nel pacchetto `lib/store-hours.ts` | spegnere i 100 punti tocca il database (🔴); la garanzia sul fresco: chi paga lo decide Nicola |
| 10 | Condividi su WhatsApp | R99, R165, R293 minori | no | niente |
| + | Togliere «usato» dal modulo del negozio | nessuna | — | niente (è nella lista «non costruire mai» di CONTESTO_BUSINESS §7) |

### Da quale file parte ogni mossa, e la prova che dice «fatto»

La regola della casa: un grave nasce con una prova che gira e diventa rossa se il difetto c'è. Mai una parola cercata in un file. Le prove qui sotto sono proposte: chi lavora la mossa le scrive per prime, le vede rosse sul codice di oggi, poi ripara.

1. **Negozio di prova.** Il comando sta nella carta #201. Prova: in sola lettura `select count(*) from products where seller_id = '44444444-4444-4444-4444-aaaaaaaa0001'` dà 0, e la pagina dei negozi ne mostra uno.
2. **Merce nella prima schermata.** Scheda prodotto: `app/product/[id]/page.tsx:550`, `:721`, `:777`, `:976`; barra fissa `components/StickyAddToCart.tsx:66-67`. Home: `components/home/HeroStoreCard.tsx:108` (`hidden md:flex`), `components/home/ShopOfMonthHero.tsx:78`, ordine dei blocchi dal pannello (`cervello/marketplace.mjs`, corsia CONFIG). Prova: con Playwright a 390×844, il riquadro del prezzo e il pulsante «Aggiungi» della scheda del kefir finiscono sopra i 844 punti. Oggi stanno a circa 970 e 2.277.
3. **Scaffali vuoti.** `components/CategoryShowcase.tsx:68`, `:111`; `components/CategoryBar.tsx:21-29`; `app/regali/RegaliClient.tsx:20`, `:27-32`; `components/home-sections/HomeSectionRenderer.tsx:233-261`; `components/home/TrendingNow.tsx:49-52`; `app/piu-venduti/page.tsx:14`, `:21-23`; `app/category/[slug]/layout.tsx:15`, `:35`. Prova: con un catalogo finto di soli alimentari, nessun link di menu, tessera o piè di pagina porta a una pagina con zero prodotti; e nessuna etichetta «va forte» compare senza vendite vere.
4. **Marchio e «Accedi».** `app/globals.css:194`; `components/Navbar.tsx:127-128`, `:144`, `:217-218`, `:245`. Prova: il colore calcolato di «City» e di «Accedi» contro lo sfondo della testata ha contrasto almeno 4,5:1, su telefono e computer.
5. **Codice al posto della password.** `components/ui/AuthShell.tsx:137-138`; `app/auth/callback/route.ts:26-31`; `app/sign-up/page.tsx:330`, `:338`; `app/checkout/page.tsx`. Prova: un cliente nuovo, dalla scheda prodotto, arriva a «ordine confermato» senza uscire dal sito e senza scegliere una password. Contare i passi prima e dopo: oggi circa 15 fra tocchi e campi.
6. **Una promessa sola.** `components/store-sections/HeroSection.tsx:54-61`, `:146-150`; `components/ui/DeliveryCutoff.tsx:122-123`; `lib/delivery.ts:8`; `components/checkout/DeliverySlotPicker.tsx:79-85`; `lib/constants.ts:123`; `lib/promesse-pubbliche.ts`. Prova: giovedì alle 15 (Pane Quotidiano chiuso il giovedì pomeriggio) la vetrina NON dice «Consegna oggi», la cassa offre solo fasce di apertura, e striscia, home e vetrina leggono la frase dalla stessa funzione della cassa. Tocca i soldi: due collaudatori.
7. **Volto del titolare.** `components/home/ShopOfMonthHero.tsx:78`; il Negozio del mese si imposta dal pannello. Prova: sul telefono la home mostra foto e nome del titolare. Il consenso scritto va conservato prima di pubblicare.
8. **Totale sotto il pollice.** `components/ProductCard.tsx:101-102` (oggi un avviso di 2 secondi in alto); `components/MobileTabBar.tsx`. Prova: dopo il primo «+», in basso compare una barra fissa con pezzi e totale, e il «+» della card diventa «− 1 +».
9. **Promesse non mantenute.** Punti: `migrations/029_welcome_credit_search_fts_price_alert.sql:47-50` (`trg_profile_welcome_bonus`), promesse in `app/orders/page.tsx:271` e `app/sign-up/page.tsx:215`. Ritiro: `lib/store-customization.ts:111`, `components/store-sections/HeroSection.tsx:236-247`, contro `lib/constants.ts:98`. Reso: `app/product/[id]/page.tsx:824-829`, `lib/promesse-pubbliche.ts:264`. Prova: con il ritiro spento la vetrina non mostra «Ritiro in negozio»; un prodotto fresco non promette «Reso entro 14 giorni»; un iscritto nuovo non riceve punti.
10. **Condividi.** Accanto al cuore in `app/product/[id]/page.tsx` e in cima alla vetrina; prezzo all'inglese in `app/product/[id]/opengraph-image.tsx:26` e `app/store/[id]/opengraph-image.tsx`. Prova: il pulsante apre la condivisione del telefono (o WhatsApp col testo pronto) e l'anteprima scrive «2,95 €».

+ **«Usato».** `lib/products/schema.ts` (`CONDITION_LABELS`). Prova: il modulo del negozio non offre più «usato» né «ricondizionato».

### Come si lavora una mossa

1. La mossa ha schede nel registro: segue la strada normale del sito. Se la scheda è già nella seconda ondata, si lavora con quella: `node cervello/schede-pacchetto.mjs --piano consegne/audit/2026-10-28-ondata2-sito.json --ondata 9 --json`, poi `.claude/workflows/ondata-sito.js`. In quel file la seconda ondata è la nona voce: le prime otto sono vuote (provato il 30/10, `--ondata 9` dà i 5 pacchetti, fra cui `components/CategoryShowcase.tsx`, `app/messages/page.tsx` e `lib/store-hours.ts`). Se non c'è, prima `node cervello/pacchetti-lotto.mjs --sito --gravi --scrivi` per il piano nuovo. Il cancello del sito è `npm run verify` nel repo del sito, più `node cervello/radiografia-in-corsa.mjs --repo ../mycity`. Il metodo sta in `cervello/lotto-a-pacchetti.md`.
2. La mossa non ha schede (2, 5, 8): dopo il sì di Nicola si apre la scheda nel registro con la sua prova, poi come al punto 1.
3. Le modifiche dal pannello (la parte config delle mosse 2, 3 e 7) passano da `cervello/marketplace.mjs`, con backup e annulla: 🟡, si fanno e si avvisa Nicola.
4. Foto prima e dopo ogni mossa, con lo strumento qui sotto, da mettere nella richiesta di unione del sito.

### Rifare le foto

`cervello/foto-pagine-vere.mjs`, istruzioni complete in testa al file. In breve:
1. `web_fetch_vercel_url` su ogni pagina, poi `node cervello/foto-pagine-vere.mjs estrai <file-risultato> <nome> <percorso> --cartella <dir>`.
2. Una volta: `web_fetch_vercel_url` sul foglio di stile grande che l'HTML nomina, poi `estrai-css <file-risultato> </_next/static/css/….css> --cartella <dir>`.
3. `node cervello/foto-pagine-vere.mjs fotografa --cartella <dir> --uscita <dir-foto> --sito ../mycity`.

Provato il 30/10 alle 01:20 sulle pagine del 29/10: la prima schermata del kefir esce identica pixel per pixel a quella del referto. La home differisce solo nel luccichio dei riquadri di caricamento, che si muove.

Per fotografare un ramo NON ancora pubblicato, il sito va acceso in locale (`npm run dev` nel repo del sito). In quel caso lo strumento non serve: Playwright apre `localhost` direttamente. Il database vero da qui non si raggiunge, quindi il catalogo in locale sarà vuoto o finto.

### Rimisurare

Il motore dell'analisi è conservato in `consegne/design/2026-10-29-strumenti/esperienza-cliente.workflow.js`, col contesto di partenza `CONTESTO-ANALISI.md` accanto. In testa al file c'è scritto quali tre costanti cambiare. Costo del 29/10: 11,3 milioni di token senza le letture dalla cache. Per rimisurare solo le aree toccate, si tolgono le altre da `DIMS` e si saltano i benchmark.

### Il testo da incollare in una sessione nuova

> Sei l'AD di MyCity. Leggi `consegne/design/2026-10-29-come-riprendere.md` e i primi blocchi del referto `consegne/design/2026-10-29-esperienza-cliente-vs-migliori.md`. Guarda la carta #222 in AZIONI-IN-ATTESA: se ho risposto, scrivi le mie risposte nella carta e nel registro dei fatti, poi parti dalla prima mossa della tabella che non aspetta niente. Se non ho risposto, parti dalla mossa 4 (il marchio), che non aspetta niente. Per ogni mossa: prima la prova che diventa rossa sul codice di oggi, poi la riparazione, poi le foto prima e dopo, poi una richiesta di unione nel repo del sito. L'unione è mia.
