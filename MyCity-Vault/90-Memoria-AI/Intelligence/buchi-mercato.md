# 🕳️ Buchi di Mercato — 2026-09-01

> **Ricontrollato 2026-09-01 07:00** (giro leggero `cervello/monitora.md`). Sono 8 giorni di buco: l'ultimo controllo risale al 18/8. Fonte: IlPiacenza-Economia. Il fetch diretto resta in errore HTTP 403, stesso blocco delle settimane scorse. Oggi invece liberta.it e piacenzasera.it hanno risposto senza blocco. Ho ripiegato su WebSearch mirata ("ilpiacenza.it economia negozio chiude apre agosto settembre 2026"). **Nessuna chiusura o apertura di bottega specifica trovata con nome.** L'unico risultato pertinente: l'apertura di un **maxistore Maury's da 3.300 mq in via R. Goitre**, dal 27/8 al 19/9/2026, con promozioni di apertura. È una grande superficie non-food, abbigliamento e casa, non una bottega di quartiere. Non cambia il quadro delle categorie scoperte sotto. Fonte: [anteprimavolantino.it — Volantino Maury's Nuova Apertura Piacenza](https://www.anteprimavolantino.it/134193/volantino-maurys-nuova-apertura-piacenza-dal-27-agosto-2026/), del 1/9. Nessun altro dato nuovo oggi. Catalogo, contatti e stato pagamenti (dati DB) non sono ricontrollati: la fonte è Supabase, non giornaliera, quindi non era dovuta oggi. Restano quelli letti il 10/8. Sono coerenti con `registro-fatti.json`, verificato oggi stesso: negozio faro Pane Quotidiano, Stripe ancora non attivo al 22/8, nessun aggiornamento più recente noto.
>
> Aggiornato: 2026-08-10 13:35 · fonte: query dal vivo Supabase marketplace (MCP `execute_sql`) + `registro-fatti.json`.
> Il contesto macro in fondo alla pagina è stato rinfrescato il 13/8 alle 09:30. È il recupero del giro delle 08:41, fallito per limite motore. La fonte è IlPiacenza-Economia. Il fetch diretto ha dato HTTP 403, quindi l'ho recuperata via WebSearch. Il resto del file non è stato ricontrollato oggi. Catalogo e lista contatti restano quelli letti dal database il 10/8.
> **Ricontrollato 15/8 06:45** (giro leggero, `cervello/monitora.md`). Fonte: IlPiacenza-Economia via WebSearch, il fetch diretto resta in errore 403. Nessuna apertura o chiusura nuova di negozi trovata. Confermano lo stesso quadro già noto dal 13/8. Le imprese attive a Piacenza restano in calo. Nel primo semestre 2026 sono scese del 3,3%, 840 in meno di un anno fa ([ilpiacenza.it](https://www.ilpiacenza.it/economia/piacenza-imprese-calo-primo-semestre-2026.html)). Via Taverna resta sotto i 40 negozi, contro i 51 di prima. Catalogo e contatti restano quelli letti dal database il 10/8: non ricontrollati oggi perché non dovuti.
> **Ricontrollato 17/8 06:33** (giro leggero, `cervello/monitora.md`). Fonte: IlPiacenza-Economia, fetch diretto ancora in errore 403, ripiegato su WebSearch mirata ("ilpiacenza.it economia negozio apre chiude agosto 2026"). Nessuna apertura o chiusura nuova trovata: la ricerca restituisce solo notizie generiche di Ferragosto (orari supermercati) senza nomi di negozi specifici. Nessun cambiamento al quadro del 13-15/8. Catalogo e contatti non ricontrollati oggi perché non dovuti (fonte Supabase, non giornaliera).
> **Ricontrollato 18/8** (giro leggero, `cervello/monitora.md`). Fonte: IlPiacenza-Economia. Il fetch diretto resta in errore 403. Ho usato una WebSearch mirata ("ilpiacenza.it economia negozio chiude apre agosto 2026"). Non ha trovato nessuna apertura o chiusura nuova con il nome di un negozio. Solo risultati generici fuori tema: H&M a livello nazionale, orari supermercati per Ferragosto, un vecchio articolo su Coin non riferito a Piacenza. Nessun cambiamento al quadro del 13-17/8. Catalogo e contatti non ricontrollati oggi perché non dovuti (fonte Supabase, non giornaliera).
> Precedente versione: 20 luglio 2026 (in git history).
> Rifatto da zero sui dati reali, non solo confermato a memoria. Tabelle interrogate il 10/8: `profiles`, `products`, `categories`, `merchants_leads`.

---

## Stato attuale del catalogo MyCity (dati live, non stimati)

- **1 negozio reale**: Pane Quotidiano — Via Calzolai 25, Piacenza. Panificio/gastronomia bio.
- **5 prodotti** in vendita: Pudding vaniglia bio, Hummus di ceci bio, Kefir di latte di capra bio, Pesto Genovese bio, Kefir Berchtesgadener Land bio. Non solo pane: linea bio/gastronomia.
- **0 negozi possono ancora incassare**: `stripe_charges_enabled`/`stripe_payouts_enabled`/`stripe_details_submitted` tutti falsi anche per Pane Quotidiano (fatto `negozio.faro`, verificato 10/8 09:58). Nessun buco di mercato conta finché questo non si sblocca — è la vera priorità zero, non una categoria mancante.
- **72 categorie** già pronte nella tassonomia del sito (tabella `categories`). Solo 1 di queste ha dentro un venditore reale: Panificio, grazie a Pane Quotidiano.
- **407 contatti negozio** in archivio, tabella `merchants_leads`. Vengono da un solo scarico, fatto il 24/5/2026, mai aggiornato da allora. **Sono tutti ancora `to_contact`**: nessuno è stato davvero contattato. È una correzione rispetto alla versione precedente di questo file, che dava per contattati alcuni di questi nomi.

---

## 🔴 Il buco più grande non è di categoria: è di prospecting sulle categorie giuste

Il file di luglio elencava enoteca/pescheria/erboristeria/formaggi come "categorie scoperte, 0 prospect". Controllato oggi riga per riga sui 407 contatti reali: **è ancora vero, e il motivo è strutturale**. Lo scarico del 24/5 viene da OpenStreetMap/Google Places filtrato su ristorazione e retail generico — **zero risultati contengono "wine", "fish", "herb", "deli", "cheese"**. Non è che i negozi non li abbiano trovati: quelle categorie non erano nel raggio di ricerca del primo scarico. È un buco nello strumento di scouting, non (solo) nel mercato.

| Categoria nei 407 contatti | N. lead | Contattati davvero | Score medio | Nota |
|---|---|---|---|---|
| Abbigliamento (`clothes`) | 92 | 0 | 57,6 | Fuori perimetro attuale (non food/bottega di quartiere) |
| Bar | 76 | 0 | 65,8 | Escluso insieme a ristoranti/osterie per decisione di Nicola del 18/7. Da rivedere: bar ≠ osteria |
| Cafè | 43 | 0 | 50,0 | Stesso dubbio di "Bar": La Ragazzetta (vedi sotto) è proprio un caffè |
| Supermercato | 42 | 0 | 71,4 | Catene tipo Conad, Esselunga, Lidl e Coop: non target da onboarding, ma segnalano la densità della zona |
| Ristorante | 27 | 0 | 87,0 | **Escluso** per decisione Nicola 18/7 |
| Pizzeria | 22 | 0 | 95,5 | **Escluso** per decisione Nicola 18/7 |
| Panificio (`bakery`) | 11 | 0 | 77,3 | Categoria del negozio faro. 11 concorrenti/prospect diretti, mai contattati |
| Macelleria (`butcher`) | 8 | 0 | 50,0 | 0 contattati nonostante citati come "prospect" a luglio |
| Fioraio (`florist`) | 7 | 0 | 50,0 | Già segnata come "scoperta" a luglio. I 7 nomi esistono, ma nessuno è mai stato chiamato |
| *(coda lunga: sushi, kebab, cinese, messicano, indiano…)* | ~74 | 0 | var. | Ristorazione etnica, stesso vincolo del 18/7 |

**Enoteca, pescheria, erboristeria, formaggi/caseificio: 0 su 0** — non ci sono NEI 407, quindi nessuno li ha mai cercati con uno scarico dedicato.

---

## 🟡 Correzione importante rispetto alla versione precedente di questo file

I nomi **Garetti, Peretti, Amendolara** (gastronomia/salumi, 3 anchor) e **La Ragazzetta** (caffè storico) citati come "prospect" nella versione del 20/7 **non sono nella tabella `merchants_leads`** — non vengono dallo scarico del 24/5, vengono da ricerca web mirata di `@intelligence` a luglio. Sono legittimi come **scelta ragionata con fonti pubbliche** (AR-006: base news/articoli citati, non inventati), ma vanno tenuti distinti dai 407 lead strutturati nel DB: se serve un pitch, per questi 4 serve prima una verifica telefono/indirizzo aggiornata (fonte web, non DB).

---

## Categorie scoperte — priorità per la ripresa (24/8-1/9)

| # | Categoria | Perché priorità | Prospect nel DB oggi | Prossimo passo |
|---|-----------|----------------|----------------------|-----------------|
| 1 | **Enoteca / vini** | Gutturnio, Ortrugo DOC — alto scontrino, gift-box | 0 (mai cercato) | Nuovo scarico mirato scouting, non solo ricontattare i 407 |
| 2 | **Pescheria** | Servizio premium, differenziante | 0 (mai cercato) | Idem |
| 3 | **Erboristeria / naturale** | Sovrapposizione clientela bio di PQ | 0 (mai cercato) | Idem |
| 4 | **Formaggi / caseificio (DOP piacentini)** | Differenziante, alto margine | 0 (mai cercato) | Idem |
| 5 | **Macelleria** | Categoria alimentare base, alta frequenza | 8 lead reali, 0 contattati | Ricontattare i 8 già in DB prima di cercarne altri |
| 6 | **Fiori / piante** | Impulso, alta frequenza | 7 lead reali, 0 contattati | Ricontattare i 7 già in DB |
| 7 | **Caffè storico / bar di quartiere** | La Ragazzetta = lead caldo (apertura 4/7) | 76 bar + 43 cafè in DB, mai filtrati per escludere solo osterie/ristoranti pieni | Rivedere il criterio di esclusione 18/7: bar/caffè ≠ osteria |

---

## Zone geografiche scoperte

Nessun dato di consegna reale su cui misurare zone (0 ordini pagati, 0 consegne). Le due righe sotto restano un'inferenza da densità abitativa, non un dato osservato — da verificare quando ci sarà traffico reale:

| Zona | Note |
|------|------|
| Quartieri oltre ZTL (Farnesiana, Besurica) | Alta densità residenziale, inferenza non misurata |
| Periferia nord (Borgotrebbia, Castelvetro) | Domanda consegna potenzialmente più alta, inferenza non misurata |

---

## Buchi nel negozio attuale (Pane Quotidiano)

| Gap | Stato oggi |
|-----|-----------|
| Pagamenti (Stripe charges/payouts) | **Disattivati** — priorità assoluta, blocca ogni incasso (vedi `negozio.faro`) |
| Catalogo | Solo 5 prodotti bio/gastronomia, nessun pane "base" a catalogo nonostante il nome del negozio |
| Foto prodotto pro | Da verificare oggi, serve intervento diretto del negoziante |

---

## Contesto macro — aggiornato 13/8 (web scan, dati DB sotto restano del 10/8)

- **Nuovo dato 13/8 (Confesercenti/Liberta.it):** imprese attive a Piacenza scese a **24.768** al 30/6/2026, **-840 rispetto a un anno prima**. Confesercenti: calano i piccoli negozi, ma crescono le superfici di vendita (i grandi guadagnano terreno sui piccoli). Conferma il trend −22,1% (2012-2025) già noto, con un numero assoluto più recente da citare in un pitch.
- **Nuovo dettaglio 13/8 (piacenzasera.it, dato luglio ma dettaglio più preciso oggi):** oltre a "20+ negozi chiusi in 3 mesi su Corso Vittorio Emanuele" (da riverificare sul posto), **via Taverna è scesa da 51 a meno di 40 negozi**, con altre chiusure attese. Due vie del centro con lo stesso segnale — rafforza l'argomento "botteghe a rischio" per @vendite, ancora da verificare di persona prima di un pitch nominale.
- **Nuovo dettaglio 13/8, recupero 09:30 (ilpiacenza.it via WebSearch):** il fetch diretto ha dato HTTP 403, quindi questa è una sintesi, non il testo integrale. Lo stesso -3,3% (-840 imprese) è **peggio sia della media nazionale (-0,9%) sia di quella regionale (-1,0%)**. Per settore: edilizia la più colpita (-10,7%, 4.085 imprese), poi **commercio -3,8% (4.734 imprese)**, manifatturiero -3,6% (2.296), alloggio/ristorazione -2,7% (1.850), agricoltura -2,6% (4.197). In controtendenza: servizi alle imprese +1,3% (+64, a quota 5.071). Fonte: [ilpiacenza.it — "Piacenza, imprese in calo del 3,3%: peggio della media nazionale e regionale"](https://www.ilpiacenza.it/economia/piacenza-imprese-calo-primo-semestre-2026.html) (sintesi via WebSearch, consultato 13/8). **Confidenza alta sul dato aggregato**, perché è la stessa fonte CCIAA del punto sopra, triangolata con Confesercenti. **Confidenza media sul dettaglio settoriale**, perché l'ho letto solo in sintesi, non nel testo integrale.
- **Dato di contesto, non di oggi ma nuovo per questo file (Osservatorio Confcommercio demografia imprese 2025, ripreso da ilpiacenza.it a marzo 2026):** nel **centro storico** il commercio al dettaglio è sceso da 642 attività (2012) a 548 previste (2025), **-94**. Fuori dal centro il calo è più marcato: da 517 a 380, **-137**. In controtendenza, le "altre forme di alloggio" (B&B/case vacanza) in centro storico sono salite da 2 (2012) a 21 previste (2025), +19 (+147,5%). La fonte è datata marzo 2026 (dati Osservatorio 2025), quindi non è una notizia di oggi. La aggiungo perché dà, per la prima volta, un numero assoluto e verificabile al "buco di offerta" nel centro storico — più solido dei riferimenti sparsi già in questo file. Fonte: [ilpiacenza.it — "Metamorfosi Piacenza: meno negozi di abbigliamento, boom di B&B e ristorazione"](https://www.ilpiacenza.it/economia/metamorfosi-piacenza-meno-negozi-di-abbigliamento-boom-di-b-b-e-ristorazione.html) (sintesi via WebSearch, HTTP 403 sul full-text).
- Radar concorrenti (10/8, non ricontrollato oggi — settimanale, prossimo controllo dovuto ≥17/8): nessun movimento locale nuovo dei grandi (Glovo/JustEat/Deliveroo); Glovo e Deliveroo Italia sotto controllo giudiziario per caporalato algoritmico (fatto verificato, argomento di pitch pronto ma parcheggiato fino al 24/8-1/9).
- **Ricontrollato 14/8** (giro leggero `cervello/monitora.md`). IlPiacenza-Economia ha dato di nuovo HTTP 403 sul fetch diretto. Il ripiego WebSearch ha trovato lo stesso identico articolo del calo imprese -3,3%, già incorporato ieri (13/8, riga sopra). Nessun dato più recente reperibile oggi. Nessuna novità da aggiungere.

---

## Cosa NON è ancora un buco di mercato da inseguire

Con 0 negozi che possono incassare e la pausa concordata con Nicola fino al 24/8-1/9, **nessuna di queste categorie va trasformata in pitch o asset pesante oggi** (regola AR-006: sforzo pesante solo su entità `confermata`, e oggi l'unica confermata — Pane Quotidiano — non incassa nemmeno). Questo file resta preparazione per la ripresa, non lavoro da eseguire ora.

---

*Fonti: query dal vivo `mcp__supabase-marketplace__execute_sql` su `profiles`, `products`, `categories`, `merchants_leads` (10/8/2026 13:20-13:35) · `registro-fatti.json` (`negozio.faro`, `negozi.attesa-concordata`) · `Intelligence/radar-concorrenti.md` e `Intelligence/eventi-picchi.md` (10/8, aggiornati oggi da @intelligence) · versione precedente 20/7 (git history) per confronto. Contesto macro 13/8: liberta.it (Confesercenti Piacenza, imprese attive 30/6/2026) · piacenzasera.it/2026/07/sempre-piu-serrande-abbassate-centro-storico-verso-la-desertificazione (via Taverna). Recupero 09:30 (giro 08:41 fallito): ilpiacenza.it/economia/piacenza-imprese-calo-primo-semestre-2026.html · ilpiacenza.it/economia/metamorfosi-piacenza-meno-negozi-di-abbigliamento-boom-di-b-b-e-ristorazione.html (entrambe lette via WebSearch, fetch diretto bloccato HTTP 403).*
