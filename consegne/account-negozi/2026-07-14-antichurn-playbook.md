---
tipo: playbook-antichurn
data: 2026-07-14 11:07
autore: AD digitale · @account-negozi
reparto: account-negozi
playbook: negozi-calo
fonte_dati: Supabase REST live (verifica-sensori.mjs exit 0, 14/7 11:06)
colore: 🟢 (analisi) · 🟡 (check-in reali = firma Nicola)
---

# 📉 Playbook Anti-Churn — scan 14/7/2026 11:07

## Verdetto in una riga

**Zero negozi con ordini in calo oggi** — c'è un solo negozio reale (Pane Quotidiano), zero ordini consegnati nella storia, nessun trend −40% calcolabile. Il rischio vero è **time-to-first-value** (North Star 0), non churn post-vendita.

---

## Dati live (REST Supabase, 14/7 11:07)

| Metrica | Valore | Fonte |
|---|---|---|
| Seller totali DB | 17 | `profiles?role=seller` |
| Seller **reali** (no seed `11111111…`) | **1** | filtro UUID |
| Seller approvati LIVE | **1** (Pane Quotidiano) | `approval_status=approved` |
| Ordini totali | **1** | `orders` |
| Ordini consegnati | **0** | `delivery_status≠DELIVERED` |
| Ultimo ordine | 24/6/2026, **CANCELED** 3/7 | ordine `58094956…` |
| Ordini ultimi 14g / 30g | **0 / 0** | nessun ordine vivo |
| Negozi con trend −40% (30g vs 30g prec.) | **0** | nessuno ha storico ordini |
| Negozi LIVE fermi 14g (sentinella) | **1** (PQ) | falso positivo — vedi sotto |

> Fonte: `node cervello/verifica-sensori.mjs` → supabase_rest=ok · query diretta REST 14/7 11:07.

---

## Analisi per negozio reale

### Pane Quotidiano — `c0b240c0…` · Via Calzolai 25 · 0523 388601

| Segnale | Valore | Classificazione |
|---|---|---|
| Ordini 14g | 0 | ⚠️ atteso (piattaforma non aperta al pubblico) |
| Ordini 30g vs prev 30g | 0 vs 0 | **N/A** — impossibile calcolare calo |
| Health relazione | 8/8 | contratto 12% firmato 1/7, gestione diretta Nicola |
| Health vetrina | 2/8 | logo/foto/descrizione mancanti (supervisione 14/7) |
| Sentinella `negozio_fermo` | scatta | **Falso positivo** — attesa concordata, non abbandono |

**Diagnosi (causa vera, non sintomo):** non sta «mollando» — aspetta che la piattaforma sia pronta e il primo ordine reale (target **VP 17/7**, ritiro al banco — bici non pronta, Nicola 14/7 02:59). Il rischio è **no-value realized** se il VP passa senza ordini.

**Azione anti-churn:** ❌ **nessuna telefonata «ci manchi»** — Nicola 6/7 ha chiuso #25/#29; ripetere infastidirebbe.

**Azione retention corretta (già in coda o separata):**
- 🟢 Completare vetrina (logo/foto/descrizione raccolti il 13/7 se disponibili)
- 🔴 Post kefir + lista d'attesa (#post-kefir-estate-1407) — spinta domanda
- 🟡 Check-in pre-VP 17/7 (#ritiro-pq-vp17-checkin — accodato oggi)
- 🔴 Primo ordine reale / payout-test (#41)

---

## Negozi demo (16 seed) — nessuna azione

UUID `11111111…` — esclusi da playbook e sentinella (AR-006). Zero ordini, zero contatti.

---

## Onda post-13/7 — T+1 oggi (14/7)

**DB al 14/7:** nessun nuovo seller approvato rispetto al 11/7. La visita del 13/7 **non ha ancora prodotto negozi online** nel marketplace (debrief Nicola mancante — briefing 13/7 20:21).

| Touch point | Data prevista | Stato |
|---|---|---|
| T+1 (scan anti-churn) | **14/7 oggi** | ✅ fatto — questo report |
| T+3 WhatsApp «come va?» | ~16/7 mer | ⏳ bloccato — serve lista botteghe firmate |
| T+7 se 0 ordini | ~20/7 dom | ⏳ futuro |
| T+14 riattivazione | ~27/7 dom | ⏳ futuro |

**Playbook completo ciclo 45gg:** `consegne/account-negozi/2026-07-11-playbook-antichurn-6-botteghe.md`  
**Card in coda:** `#antichurn-13lug` — si attiva con «ok #antichurn-13lug + [nomi firmati]».

> ⚖️ **Allineamento strategia:** clienti MyCity = **botteghe** (Nicola 13/7 22:34). I 6 locali del dossier 13/7 erano mossa tattica; l'anti-churn core punta a Garetti/Peretti/Amendolara quando entrano nel DB come `confermati`.

---

## Prospect `scelta_ragionata` (non nel DB) — zero check-in 🔴

| Negozio | Stato registro | Azione anti-churn |
|---|---|---|
| Antica Salumeria Garetti | scelta_ragionata | ❌ nessun contatto — prospect, cancello AR-006 |
| Peretti Frutta e Verdura | scelta_ragionata | ❌ idem |
| Caseificio Amendolara | scelta_ragionata | ❌ idem |
| 6 locali dossier 13/7 | scelta_ragionata | ❌ idem — debrief Nicola prima |

Template neutro riusabile: `consegne/account-negozi/2026-07-07-playbook-anti-churn.md` § template.

---

## Cosa accodato oggi (14/7 11:07)

| ID | Cosa | Perché non duplica |
|---|---|---|
| `#ritiro-pq-vp17-checkin` | 🟡 Chiama PQ giovedì 16/7 — conferma presidio VP 17/7 | Diverso da #25/#29 (chiusi) e da #checkin-pane-quotidiano (visita 13/7) |

**NON accodato (anti-doppione):**
- Telefonata anti-churn PQ — chiusa Nicola 6/7
- `#antichurn-13lug` — già in coda, aspetta esiti visita
- Check-in generico «come va?» su prospect non firmati

---

## Chiusura loop (AR-009)

```bash
node cervello/chiusura-loop.mjs registra account-negozi "playbook anti-churn 14/7" \
  "verita:5,completezza:5,onesta:5,anti-doppione:5" \
  "trova negozi in calo e accoda check-in" \
  "0 in calo; 1 pre-revenue (PQ); 1 check-in VP17 accodato; 0 doppioni" \
  "#antichurn #playbook #REST-live"
```
