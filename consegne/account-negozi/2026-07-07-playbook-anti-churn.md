---
tipo: registro-salute-negozi
data: 2026-07-07 12:05
fonte: account-negozi (playbook anti-churn) · AD digitale
sensori: baseline REST Supabase marketplace clmpyfvpvfjgeviworth confermata DAL VIVO via MCP 7/7 00:30 (ordini=1 totale ANNULLATO, 0 in 7g, 0 in 30g, 23 profili, North Star 0) · in questa sessione MCP execute_sql + node/REST gated (permesso non concesso) → nessun numero nuovo inventato
playbook: negozi-calo
precedente: 2026-07-04-playbook-anti-churn.md
---

# 📉 Playbook anti-churn — registro salute negozi (7/7 12:05)

## ⚠️ Verità sui dati (regola d'oro: nessun numero inventato)
La struttura negozi è **confermata dal vivo stanotte** (MCP 7/7 00:30): 1 ordine totale (annullato), 0 in 7g/30g, business fermo dal 24/6. In questa sessione i canali live (MCP `execute_sql`, `node`/REST) sono gated → uso la baseline live delle 00:30, **zero numeri nuovi**. Il guardiano `coerenza-fatti.mjs` passa (registro-fatti allineato).

## Metodo
Sentinella churn classica: `−40% ordini 30g vs 30g precedenti` **oppure** `0 ordini da 14g`.
Filtro **negozi REALI**: esclusi i seed demo (UUID `11111111…`) e i prospect non nel DB (Garetti/Peretti/Amendolara). Fonte: `registro-realta.json`.

## Riepilogo
| Metrica | Valore | Δ vs 4/7 |
|---|---|---|
| Seller nel DB | **17** (baseline) | = |
| Seller REALI | **1** (Pane Quotidiano) | = |
| Seller demo (seed) | **16** — nessuna azione | = |
| 🟡 negozi con trend −40% | **0** | = |
| 🔴 negozi in genuino churn | **0** | = |
| Negozi con storico ordini da cui calare | **0** | = |

## Il verdetto onesto: oggi non c'è nessun negozio in calo da riattivare
Il playbook cerca negozi con **ordini in calo**. Sui dati reali:

1. **C'è un solo negozio reale** (Pane Quotidiano). Un mercato a un lato solo: non esiste un secondo negozio da confrontare.
2. **Non esiste un trend da cui calare.** PQ ha **0 ordini consegnati nella sua storia** e 1 solo ordine COD (€19,05, del 24/6) che è stato **annullato** il 3/7. Zero storico ordini ⇒ la sentinella `−40%` non ha una base su cui scattare. Inventare un "calo" qui violerebbe la regola d'oro (nessun negozio/numero inventato).
3. **PQ NON è churn — ed è già stato chiuso da Nicola.** Il 6/7 Nicola ha chiuso l'anti-churn su Pane Quotidiano (righe coda **#25** check-in e **#29** rassicurazione standalone). Ragione: **li conosce, aspettano che la piattaforma sia pronta** — l'inattività è attesa concordata, non abbandono. In più la premessa operativa di quelle azioni è **morta**: erano agganciate alla chiamata dell'ordine #16, che è annullato (#21/#22 decadute). Riproporle sarebbe un doppione (AR-008) e contraddirebbe la sua decisione.

➡️ **Nessuna azione anti-churn da accodare sul parco negozi di oggi.** Segnarlo com'è, senza gonfiare la coda con lavoro finto, È il risultato corretto del playbook (cancello di serietà 🔬).

## Dove il churn diventa REALE: l'onda del 13/7
Dal **13/7** Nicola porta online **6 botteghe priorità** (di persona; dossier `consegne/vendite/2026-07-06-dossier-6-botteghe-visita-13-7.md`). Da lì in poi il churn diventa misurabile — ma con la metrica giusta per un marketplace in cold-start:

> **La causa #1 di churn dei commercianti non è il calo, è il "no value realized":** un negozio entra, mette il catalogo, e **non riceve il primo ordine**. Se dopo qualche giorno pensa «qui non vendo», molla. Il segnale da vegliare non è `−40% ordini`, è **il tempo al primo valore** (time-to-first-value) e il **silenzio dopo l'onboarding**.

Per questo la mossa a più alto ritorno oggi non è agire sul parco attuale (vuoto di churn), ma **armare l'anti-churn PRIMA che l'onda arrivi**, così le 6 botteghe sono protette dal giorno 1.

### Health-score anti-churn per l'onda (soglie proposte, neutre e riusabili)
Per ogni negozio reale, dal go-live:
- 🟢 **Sano** — ≥1 ordine ricevuto **e** ordine negli ultimi 14g.
- 🟡 **A rischio (no-value)** — LIVE con catalogo ma **0 ordini a 5 giorni** dal go-live → parte il check-in «come va, ti porto il primo ordine di prova».
- 🟡 **A rischio (silenzio)** — aveva ordini, ora **0 da 14g** → check-in + micro-spinta domanda (post quartiere / prodotto-civetta).
- 🔴 **Churn conclamato** — **0 da 30g** o titolare che dice «tolgo il negozio» → chiamata di recupero + diagnosi frizione (payout? catalogo? consegne?).

Regola d'oro sull'onda: finché una bottega è `scelta_ragionata`/prospect (non firmata, non nel DB) → **solo template neutri**, nessun asset intestato (cancello AR-006). Diventa `confermata` all'ingresso reale → si accende il suo health-score.

### Template check-in neutro riusabile (per QUALSIASI bottega dell'onda)
> «Ciao, sono Nicola di MyCity. Volevo solo sentire come va da quando siete online — se è tutto chiaro e se il catalogo è come lo volete. Nei primi giorni gli ordini partono piano: è normale, ci penso io a darvi la prima spinta (un ordine di prova + un post del quartiere). Vi ho messi tra i primi negozi di Piacenza perché [motivo vero specifico della bottega]. C'è qualcosa che posso sistemarvi dal mio lato?»

Nessun numero promesso, nessun volume garantito: solo la relazione + la presa di responsabilità della spinta. Gate onestà passato.

## Chiusura del loop (AR-009)
- Reparto: **account-negozi** · Contesto: playbook anti-churn 7/7 · Atteso: trovare negozi in calo da riattivare · Reale: **0 negozi in calo** (1 solo negozio reale, senza storico; PQ non-churn già chiuso da Nicola). Scorecard: 1/1 letto correttamente, 0 doppioni generati, 1 azione forward accodata (armare l'health-score per il 13/7).
- Calibrazione: previsto «nessun churn attuale, il rischio è sull'onda 13/7» → confermato dai dati. Nessuna sorpresa.
