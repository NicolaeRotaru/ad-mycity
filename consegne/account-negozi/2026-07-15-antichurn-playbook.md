---
tipo: playbook-antichurn
data: 2026-07-15 11:07
autore: AD digitale · @account-negozi
reparto: account-negozi
playbook: negozi-calo
fonte_dati: Supabase REST live (verifica-sensori.mjs exit 0, 15/7 11:07)
colore: 🟢 (analisi) · 🟡 (check-in reali = firma Nicola)
---

# 📉 Playbook Anti-Churn — scan 15/7/2026 11:07

## Verdetto in una riga

**Zero negozi con ordini in calo oggi** — un solo negozio reale approvato (Pane Quotidiano), zero ordini consegnati nella storia, nessun trend −40% calcolabile. Il rischio vero resta **time-to-first-value** (North Star 0) prima del **Venerdì Piacentini 17/7**, non churn post-vendita.

---

## Dati live (REST Supabase, 15/7 11:07)

| Metrica | Valore | Fonte |
|---|---|---|
| Seller totali DB | 17 | `profiles?role=seller` |
| Seller **reali** (no seed `11111111…`) | **1** | filtro UUID |
| Seller approvati LIVE | **1** (Pane Quotidiano) | `approval_status=approved` |
| Ordini totali | **1** | `orders` |
| Ordini consegnati | **0** | `delivery_status≠DELIVERED` |
| Ultimo ordine | 24/6/2026, **CANCELED** 3/7 15:38 | ordine `58094956…` |
| Ordini ultimi 14g / 30g | **0 / 0** | nessun ordine vivo |
| Negozi con trend −40% (30g vs 30g prec.) | **0** | nessuno ha storico ordini |
| Negozi LIVE fermi 14g (sentinella) | **1** (PQ) | falso positivo — vedi sotto |

> Fonte: `node cervello/verifica-sensori.mjs` → supabase_rest=ok · query diretta REST 15/7 11:07.

---

## Analisi per negozio reale

### Pane Quotidiano — `c0b240c0…` · Via Calzolai 25 · 0523 388601

| Segnale | Valore | Classificazione |
|---|---|---|
| Ordini 14g | 0 | ⚠️ atteso (piattaforma non aperta al pubblico) |
| Ordini 30g vs prev 30g | 0 vs 0 | **N/A** — impossibile calcolare calo |
| Health relazione | 8/8 | contratto 12% firmato 1/7, gestione diretta Nicola |
| Health vetrina | **4/8** | descrizione + 1 foto ok; logo/città/payout mancanti |
| Sentinella `negozio_fermo` | scatta | **Falso positivo** — attesa concordata, non abbandono |

**Diagnosi (causa vera, non sintomo):** non sta «mollando» — aspetta il primo ordine reale al **VP 17/7** (ritiro al banco). Nicola 6/7: «li conosco e aspettano finché tutto non è pronto». Il rischio è **no-value realized** se il VP passa senza ordini.

**Azione anti-churn:** ❌ **nessuna telefonata «ci manchi»** — #25/#29 chiuse 6/7; ripetere infastidirebbe.

**Azione retention corretta (già in coda):**

| ID | Cosa | Colore |
|---|---|---|
| `#ritiro-pq-vp17-checkin` | Chiama PQ **giovedì 16/7 mattina** — conferma presidio VP 17/7 | 🟡 |
| `#post-kefir-estate-1407` | Spinta domanda — post kefir estate | 🔴 |
| `#antichurn-13lug` | Ciclo 45gg — si attiva quando entrano botteghe firmate | 🟡 |

---

## Negozi demo (16 seed) — nessuna azione

UUID `11111111…` — esclusi da playbook e sentinella (AR-006). Zero ordini, zero contatti.

---

## Onda post-13/7 — T+2 oggi (15/7)

**DB al 15/7:** ancora **nessun nuovo seller approvato** rispetto al 14/7. La visita del 13/7 **non ha ancora prodotto botteghe online** nel marketplace (debrief Nicola mancante).

| Touch point | Data prevista | Stato |
|---|---|---|
| T+1 (scan anti-churn) | 14/7 | ✅ fatto |
| **T+2 (scan anti-churn)** | **15/7 oggi** | ✅ fatto — questo report |
| T+3 WhatsApp «come va?» | ~16/7 mer | ⏳ bloccato — serve lista botteghe firmate |
| T+7 se 0 ordini | ~20/7 dom | ⏳ futuro |
| Check-in PQ pre-VP | **16/7 giovedì** | 🟡 in coda #ritiro-pq-vp17-checkin |

**Playbook completo ciclo 45gg:** `consegne/account-negozi/2026-07-11-playbook-antichurn-6-botteghe.md`  
**Card in coda:** `#antichurn-13lug` — si attiva con «ok #antichurn-13lug + [nomi firmati]».

> ⚖️ **Allineamento strategia:** clienti MyCity = **botteghe** (Nicola 13/7 22:34). Prospect Garetti/Peretti/Amendolara = `scelta_ragionata` — nessun check-in 🔴 finché non sono nel DB come `confermati`.

---

## Prospect `scelta_ragionata` (non nel DB) — zero check-in 🔴

| Negozio | Stato registro | Azione anti-churn |
|---|---|---|
| Antica Salumeria Garetti | scelta_ragionata | ❌ nessun contatto — prospect, cancello AR-006 |
| Peretti Frutta e Verdura | scelta_ragionata | ❌ idem |
| Caseificio Amendolara | scelta_ragionata | ❌ idem |
| 6 locali dossier 13/7 | scelta_ragionata | ❌ idem — debrief Nicola prima |

---

## Cosa accodato oggi (15/7 11:07)

| Decisione | Motivo |
|---|---|
| ❌ **Nessuna nuova azione** | Anti-doppione: #ritiro-pq-vp17-checkin già copre il check-in PQ |
| ❌ Telefonata anti-churn PQ | Chiusa Nicola 6/7 — falso positivo confermato |
| ⏳ `#antichurn-13lug` | Resta in attesa debrief visita 13/7 + botteghe firmate |

**Dettaglio operativo:** `MyCity-Vault/90-Memoria-AI/AZIONI-PRONTE.md` blocco A4 (aggiornato 15/7).

---

## Chiusura loop (AR-009)

```bash
node cervello/chiusura-loop.mjs registra account-negozi "playbook anti-churn 15/7" \
  "verita:5,completezza:5,onesta:5,anti-doppione:5" \
  "trova negozi in calo e accoda check-in" \
  "0 in calo; 1 pre-revenue PQ falso positivo; 0 nuove azioni; usa #ritiro-pq-vp17-checkin" \
  "#antichurn #playbook #REST-live"
```
