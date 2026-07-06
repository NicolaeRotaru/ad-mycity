# 📞 Le 27 botteghe food da chiamare — scheda operativa di chiamata

> Preparato: **2026-07-06 15:40** · @vendite + @AD (doer da proposta Pannello approvata) · 🟢 preparare la lista/script · 🟡 la chiamata reale (firma Nicola)
> Serve la proposta approvata dal Pannello: *«Ho preparato la lista delle 27 botteghe food da chiamare»* → contesto: **pronta per l'inserimento negozi dopo il 9/7**.
> Fonte dati: Supabase `merchants_leads` — **407 lead totali** `outreach_status=to_contact` (misura live REST 30/6 22:17, ri-citata nei giri fino al 2/7). Sola lettura, nessuna scrittura sul DB.

---

## ⚠️ Onestà sui dati (cancello 🔬 — nessun nome inventato)
La proposta parla di **27 botteghe food**: è il sotto-insieme *food* dei 407 lead `to_contact`
(panetterie, macellerie, gastronomie, salumerie, pasticcerie, ortofrutta…). Di queste 27:

- **10 sono già enumerate con dati verificati dal DB** (nome, categoria, indirizzo — pull REST reale del 30/6, vedi `2026-06-30-primi-10-lead-food-centro.md`). Sono le righe **1-10** qui sotto: **chiamabili subito** appena hai il numero.
- **~17 restano nel serbatoio del DB ma non enumerate**: per elencarle nome-per-nome serve **una query live su `merchants_leads`** (categoria food, `to_contact`), e in **questa sessione l'accesso dati è gated** (MCP `execute_sql` non concesso, `node`/`curl` chiusi). → Le righe **11-27** sono segnaposto **`[da pull live]`**: **non invento nomi** (regola d'oro CLAUDE.md).

> 🟢 **Passo di completamento (prossimo giro con dati live / grant MCP), 0 rischi — query pronta da incollare:**
> ```sql
> SELECT business_name, category, address, phone, email, score, latitude, longitude
> FROM merchants_leads
> WHERE outreach_status = 'to_contact'
>   AND (category ILIKE ANY (ARRAY['%bak%','%butch%','%food%','%gastro%','%salumeria%',
>        '%deli%','%cheese%','%grocer%','%pastic%','%fish%','%green%','%fruit%','%market%']))
> ORDER BY score DESC NULLS LAST, business_name;
> ```
> Il risultato riempie le righe 11-27 (e conferma il conteggio esatto del sotto-insieme food). Finché non gira, si chiama sui **10 verificati** — bastano per partire dopo il 9/7.

---

## 🎯 Ordine di chiamata (priorità per ritorno)
Prima le **panetterie/macellerie del cluster-centro** (stesso quartiere del negozio-faro **Pane Quotidiano**,
così la demo "guarda, funziona già in centro" è credibile), poi le categorie che **mancano a catalogo** (polleria, ortofrutta).

## ☎️ Copione della chiamata (30 secondi + demo)
1. **Aggancio (chi sei):** «Buongiorno, sono di **MyCity**, il marketplace dei negozi di Piacenza — la spesa dalle botteghe del centro consegnata a casa, senza ZTL. La chiamo perché la vostra bottega è proprio il tipo di attività per cui l'abbiamo fatto.»
2. **Prova che è vero (demo):** «C'è già un negozio del centro online e che riceve ordini veri (**Pane Quotidiano**). Le mando il link, ci mette 20 minuti a essere online anche lei — vetrina e catalogo li prepariamo noi (done-for-you).»
3. **La leva del momento (bando):** «C'è anche un **bando Commercio Emilia-Romagna al 40% a fondo perduto, ma scade il 21/7** — se le interessa le passo il kit già pronto per candidarsi.»
4. **Chiusura (un solo sì):** «Le va se le mando il link della vetrina-demo e ci sentiamo per attivarla? Zero costi fissi, commissione solo sul venduto, payout a consegna.»
5. **Se dice sì →** handoff a **@onboarding-negozi** (vetrina <48h) + kit bando (`consegne/vendite/kit-bando-er-mycity.md`).

### Obiezioni pronte
- *«Quanto mi costa?»* → 0€ fissi, commissione **12%** solo sul venduto, payout a consegna, nessun vincolo (stesso patto di Pane Quotidiano).
- *«Non ho tempo per il sito.»* → Lo facciamo noi: foto/catalogo/vetrina pronti, lei approva e basta.
- *«Chi consegna?»* → Consegna locale in centro, a piedi/bici; per ora anche ritiro/COD.
- *«Chi c'è già?»* → Pane Quotidiano (centro), e stiamo aprendo il quartiere bottega per bottega.

---

## 📋 Scheda chiamate (da riempire mentre chiami)
> Telefono/email **non sono nel DB** per la maggior parte → si recuperano da **Google Maps / Pagine Gialle / visita**.
> Colonne "Tel. trovato · Chiamata · Esito · Prossimo passo" = le riempi durante la campagna.

| # | Bottega | Categoria | Indirizzo (DB) | Tel. trovato | Chiamata | Esito | Prossimo passo |
|---|---------|-----------|----------------|--------------|----------|-------|----------------|
| 1 | **Frolla Couture** | panetteria/bakery | Via Felice Frasi 8f | ☐ | ☐ | | score DB più alto (350) — apri con questa |
| 2 | **Rasparini panificio** | panetteria | Piazza Borgo 26 | ☐ | ☐ | | piazza centro, alto passaggio |
| 3 | **Struzzi** | panetteria | Via Roma 95 | ☐ | ☐ | | asse commerciale Via Roma |
| 4 | **Panetteria Del Corso Piacenza** | panetteria | Corso Vittorio Emanuele II 181 | ☐ | ☐ | | corso principale, visibilità |
| 5 | **Macelleria Callegari dal 1961** | macelleria | Stradone Farnese | ☐ | ☐ | | storicità (>60 anni), DOP potenziale |
| 6 | **Anzico Forno** | forno | Via Giuseppe Taverna 82 | ☐ | ☐ | | forno artigianale, zona Borgo |
| 7 | **L'Albero del Pane** | panetteria | Via Dieci Giugno 80 | ☐ | ☐ | | panetteria di quartiere vicina al centro |
| 8 | **Macelleria (Via Scalabrini)** | macelleria | Via G.B. Scalabrini 16a | ☐ | ☐ | | macelleria di prossimità |
| 9 | **Macelleria Polleria** | polleria | Viale Pubblico Passeggio 88 | ☐ | ☐ | | polleria = categoria mancante a catalogo |
| 10 | **Macelleria Carne Bovina** | macelleria | Via Campagna 54 | ☐ | ☐ | | completa il cluster macellerie |
| 11 | `[da pull live — merchants_leads food to_contact]` | food | — | ☐ | ☐ | | riempire con la query sopra |
| 12 | `[da pull live]` | food | — | ☐ | ☐ | | " |
| 13 | `[da pull live]` | food | — | ☐ | ☐ | | " |
| 14 | `[da pull live]` | food | — | ☐ | ☐ | | " |
| 15 | `[da pull live]` | food | — | ☐ | ☐ | | " |
| 16 | `[da pull live]` | food | — | ☐ | ☐ | | " |
| 17 | `[da pull live]` | food | — | ☐ | ☐ | | " |
| 18 | `[da pull live]` | food | — | ☐ | ☐ | | " |
| 19 | `[da pull live]` | food | — | ☐ | ☐ | | " |
| 20 | `[da pull live]` | food | — | ☐ | ☐ | | " |
| 21 | `[da pull live]` | food | — | ☐ | ☐ | | " |
| 22 | `[da pull live]` | food | — | ☐ | ☐ | | " |
| 23 | `[da pull live]` | food | — | ☐ | ☐ | | " |
| 24 | `[da pull live]` | food | — | ☐ | ☐ | | " |
| 25 | `[da pull live]` | food | — | ☐ | ☐ | | " |
| 26 | `[da pull live]` | food | — | ☐ | ☐ | | " |
| 27 | `[da pull live]` | food | — | ☐ | ☐ | | " |

---

## 🚦 Quando si chiama (gate)
- **Non prima del 9/7:** Nicola riparte col lavoro operativo dopo giovedì 9/7 (reset quote). Fino ad allora la lista resta pronta.
- **Meglio dopo la 1ª transazione end-to-end** (#16 consegnato): la demo "funziona davvero" è l'argomento più forte al telefono.
- **La chiamata reale è 🟡** (contatto con commercianti veri): parte al via di Nicola → vedi coda [[AZIONI-IN-ATTESA]] #39.
- **Leva a scadenza:** il **bando Commercio ER (40% fondo perduto) scade il 21/7** → chi vuole candidarsi va contattato entro ~15/7.

## 🙋 Cosa serve da Nicola
1. **Via libera a chiamare** dopo il 9/7 (il "sì" alla campagna → sblocca #39).
2. Se vuoi le altre **17 botteghe** nome-per-nome: un **giro con dati live** o il grant MCP `execute_sql` (query già pronta sopra) — poi le aggiungo in 1 minuto.
3. (Opzionale) se hai già dei **numeri di telefono** di qualche bottega, dammeli: salto la ricerca su Maps.

---
*Preparato dall'AD. Supera il precedente `2026-06-30-primi-10-lead-food-centro.md` (lo ingloba). Traccia in [[DECISIONI]] e [[SALA-OPERATIVA]].*
