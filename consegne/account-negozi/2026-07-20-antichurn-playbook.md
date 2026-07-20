---
tipo: playbook-antichurn
data: 2026-07-20 11:17
autore: AD digitale · @account-negozi
reparto: account-negozi
playbook: negozi-calo
fonte_dati: Supabase REST live (verifica-sensori.mjs exit 0, 20/7 11:16)
colore: 🟢 (analisi) · 🟡 (check-in reali = firma Nicola)
---

# 📉 Playbook Anti-Churn — scan 20/7/2026 11:17

## Verdetto in una riga

**Zero negozi con ordini in calo** — un solo negozio reale approvato (Pane Quotidiano), zero ordini consegnati nella storia, nessun trend −40% calcolabile. L'unica mossa retention oggi è **`#checkin-pq-postvp`** (debrief post-VP 17/7 + primo ordine) — già in coda, non duplicare.

---

## Dati live (REST Supabase, 20/7 11:17)

| Metrica | Valore | Fonte |
|---|---|---|
| Seller totali DB | **17** | `profiles?role=eq.seller` |
| Seller **reali** (no seed `11111111…`) | **1** | filtro UUID |
| Seller approvati LIVE | **1** (Pane Quotidiano) | `approval_status=approved` |
| Ordini totali | **1** | `orders` |
| Ordini consegnati | **0** | `delivery_status≠DELIVERED` |
| Ultimo ordine | 24/6/2026, **CANCELED** 3/7 | €19,05 COD |
| Ordini ultimi 14g / 30g | **0 / 1** (unico = annullato) | nessun ordine vivo |
| Negozi con trend −40% (30g vs 30g prec.) | **0** | nessuno ha storico consegnati |
| Negozi LIVE fermi 14g (sentinella) | **1** (PQ) | falso positivo — vedi sotto |

> Fonte: `node cervello/verifica-sensori.mjs` → supabase_rest=ok · query REST diretta 20/7 11:17.

---

## Analisi per negozio reale

### Pane Quotidiano — `c0b240c0…` · Via Calzolai 25 · 0523 388601

| Segnale | Valore | Classificazione |
|---|---|---|
| Ordini 14g | 0 | ⚠️ atteso (North Star 0, piattaforma non aperta al pubblico) |
| Ordini 30g vs prev 30g | 0 vs 0 consegnati | **N/A** — impossibile calcolare calo |
| Health relazione | 8/8 | contratto 12% firmato 1/7, gestione diretta Nicola |
| Health vetrina | **4/6** | descrizione + orari + indirizzo + telefono ok in DB; logo assente; `city` null |
| Prodotti catalogo | **5** | REST count 20/7 |
| Sentinella `negozio_fermo` | scatta | **Falso positivo** — attesa concordata, non abbandono |

**Diagnosi (causa vera):** non sta «mollando» — Nicola 6/7: «li conosco e aspettano finché tutto non è pronto». Il VP 17/7 è **passato** senza ordini consegnati. Il rischio è **no-value realized** prolungato (~26 gg stallo): serve il debrief post-VP e sbloccare il primo ordine reale, non una telefonata anti-churn generica.

**Azione anti-churn «ci manchi»:** ❌ **nessuna** — #25/#29 chiuse 6/7; ripetere infastidirebbe.

**Azione retention corretta (già in coda):**

| ID | Cosa | Colore | Quando |
|---|---|---|---|
| `#checkin-pq-postvp` | Debrief VP 17/7 + prossimo passo (piogge = finestra delivery) | 🟡 | **oggi lun 20/7 mattina** (card scaduta nel timing) |
| `#ordine-test-pq` | Primo ordine reale North Star 0→1 | 🟡 | appena PQ evadibile |
| `#post-meteo-pioggia-20lug` | Spinta domanda con piogge | 🟡/🔴 | oggi |

Script check-in (2 min, già in coda):

> «Ciao [nome], com'è andata venerdì al Venerdì Piacentini? Sei riuscito a stare al banco? C'era interesse? Con le piogge che arrivano oggi/domani il delivery ha senso — intanto possiamo provare un ordine con **ritiro da te**. Cosa ti serve ancora da noi?»

---

## Negozi demo (16 seed) — nessuna azione

UUID `11111111…` — tutti `approval_status=suspended`. Esclusi da playbook e sentinella (AR-006).

---

## Prospect `scelta_ragionata` (non nel DB) — zero check-in 🔴

| Negozio | Stato | Azione anti-churn |
|---|---|---|
| Antica Salumeria Garetti | prospect | ❌ onboarding = **vendite** (#whatsapp-3-anchor-pi26) |
| Peretti Frutta e Verdura | prospect | ❌ idem |
| Caseificio Amendolara | prospect | ❌ idem |

Anti-churn si accende solo quando una bottega è **`confermata` nel DB** (cancello AR-006). Template neutro: `consegne/account-negozi/2026-07-07-playbook-anti-churn.md` § template.

---

## Cosa accodato in [[AZIONI-PRONTE]] (20/7 11:17)

| ID | Cosa | Perché |
|---|---|---|
| **A33** | Ri-verifica playbook anti-churn 20/7 + link retention PQ | Scan aggiornato; 0 negozi in calo; punta a `#checkin-pq-postvp` senza doppione |

**NON accodato (anti-doppione):**
- Telefonata anti-churn PQ — chiusa Nicola 6/7 (#25/#29)
- `#checkin-pq-postvp` — già in [[AZIONI-IN-ATTESA]] dal 18/7
- `#antichurn-13lug` — ❌ SCADUTA 18/7 (0 botteghe onboardate post-13/7)
- Check-in su prospect non firmati — fuori scope anti-churn

---

## Chiusura loop (AR-009)

```bash
node cervello/chiusura-loop.mjs registra account-negozi "playbook anti-churn 20/7" \
  "verita:5,completezza:5,onesta:5,anti-doppione:5" \
  "trova negozi in calo e accoda check-in in AZIONI-PRONTE" \
  "0 in calo; 1 pre-revenue (PQ falso positivo); A33 in AZIONI-PRONTE; retention = #checkin-pq-postvp già in coda" \
  "#antichurn #playbook #REST-live"
```
