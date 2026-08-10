# 🕳️ Buchi di Mercato — 2026-08-10

> Aggiornato: 2026-08-10 13:35 · fonte: query dal vivo Supabase marketplace (MCP `execute_sql`) + `registro-fatti.json`.
> Precedente versione: 20 luglio 2026 (in git history).
> Rifatto da zero sui dati reali, non solo confermato a memoria. Tabelle interrogate oggi: `profiles`, `products`, `categories`, `merchants_leads`.

---

## Stato attuale del catalogo MyCity (dati live, non stimati)

- **1 negozio reale**: Pane Quotidiano — Via Calzolai 25, Piacenza. Panificio/gastronomia bio.
- **5 prodotti** in vendita: Pudding vaniglia bio, Hummus di ceci bio, Kefir di latte di capra bio, Pesto Genovese bio, Kefir Berchtesgadener Land bio. Non solo pane: linea bio/gastronomia.
- **0 negozi possono ancora incassare**: `stripe_charges_enabled`/`stripe_payouts_enabled`/`stripe_details_submitted` tutti falsi anche per Pane Quotidiano (fatto `negozio.faro`, verificato 10/8 09:58). Nessun buco di mercato conta finché questo non si sblocca — è la vera priorità zero, non una categoria mancante.
- **72 categorie** già pronte nella tassonomia del sito (tabella `categories`). Solo 1 di queste — Panificio, grazie a Pane Quotidiano — ha dentro un venditore reale.
- **407 contatti negozio** in archivio, tabella `merchants_leads`. Vengono da un solo scarico, fatto il 24/5/2026, mai aggiornato da allora. **Sono tutti ancora `to_contact`**: nessuno è stato davvero contattato. È una correzione rispetto alla versione precedente di questo file, che dava per contattati alcuni di questi nomi.

---

## 🔴 Il buco più grande non è di categoria: è di prospecting sulle categorie giuste

Il file di luglio elencava enoteca/pescheria/erboristeria/formaggi come "categorie scoperte, 0 prospect". Controllato oggi riga per riga sui 407 contatti reali: **è ancora vero, e il motivo è strutturale**. Lo scarico del 24/5 viene da OpenStreetMap/Google Places filtrato su ristorazione e retail generico — **zero risultati contengono "wine", "fish", "herb", "deli", "cheese"**. Non è che i negozi non li abbiano trovati: quelle categorie non erano nel raggio di ricerca del primo scarico. È un buco nello strumento di scouting, non (solo) nel mercato.

| Categoria nei 407 contatti | N. lead | Contattati davvero | Score medio | Nota |
|---|---|---|---|---|
| Abbigliamento (`clothes`) | 92 | 0 | 57,6 | Fuori perimetro attuale (non food/bottega di quartiere) |
| Bar | 76 | 0 | 65,8 | Escluso insieme a ristoranti/osterie (decisione Nicola 18/7) — da rivedere: bar ≠ osteria |
| Cafè | 43 | 0 | 50,0 | Stesso dubbio di "Bar": La Ragazzetta (vedi sotto) è proprio un caffè |
| Supermercato | 42 | 0 | 71,4 | Catene (Conad/Esselunga/Lidl/Coop…) — non target da onboarding, ma segnala densità della zona |
| Ristorante | 27 | 0 | 87,0 | **Escluso** per decisione Nicola 18/7 |
| Pizzeria | 22 | 0 | 95,5 | **Escluso** per decisione Nicola 18/7 |
| Panificio (`bakery`) | 11 | 0 | 77,3 | Categoria del negozio faro — 11 concorrenti/prospect diretti mai contattati |
| Macelleria (`butcher`) | 8 | 0 | 50,0 | 0 contattati nonostante citati come "prospect" a luglio |
| Fioraio (`florist`) | 7 | 0 | 50,0 | Categoria già "scoperta" a luglio — i 7 nomi esistono, mai chiamati |
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

## Contesto macro (invariato da luglio, non ricontrollato oggi — vedi `radar-concorrenti.md` e `eventi-picchi.md` aggiornati oggi 10/8 per il quadro esterno più fresco)

- Confcommercio: commercio al dettaglio Piacenza −22,1% (2012-2025); +19k attività ristorazione/alloggio a livello nazionale.
- Desertificazione centro storico: 20+ negozi chiusi in 3 mesi su Corso Vittorio Emanuele (dato luglio, da riverificare se serve per un pitch).
- Radar concorrenti aggiornato oggi: nessun movimento locale nuovo dei grandi (Glovo/JustEat/Deliveroo); Glovo e Deliveroo Italia sotto controllo giudiziario per caporalato algoritmico (fatto verificato, argomento di pitch pronto ma parcheggiato fino al 24/8-1/9).

---

## Cosa NON è ancora un buco di mercato da inseguire

Con 0 negozi che possono incassare e la pausa concordata con Nicola fino al 24/8-1/9, **nessuna di queste categorie va trasformata in pitch o asset pesante oggi** (regola AR-006: sforzo pesante solo su entità `confermata`, e oggi l'unica confermata — Pane Quotidiano — non incassa nemmeno). Questo file resta preparazione per la ripresa, non lavoro da eseguire ora.

---

*Fonti: query dal vivo `mcp__supabase-marketplace__execute_sql` su `profiles`, `products`, `categories`, `merchants_leads` (10/8/2026 13:20-13:35) · `registro-fatti.json` (`negozio.faro`, `negozi.attesa-concordata`) · `Intelligence/radar-concorrenti.md` e `Intelligence/eventi-picchi.md` (10/8, aggiornati oggi da @intelligence) · versione precedente 20/7 (git history) per confronto.*
