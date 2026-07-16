---
tipo: playbook-antichurn
data: 2026-07-16 11:04
autore: AD digitale · @account-negozi
reparto: account-negozi
playbook: negozi-calo
fonte_dati: Supabase REST live (verifica-sensori.mjs exit 0, 16/7 11:03)
colore: 🟢 (analisi) · 🟡 (check-in reali = firma Nicola)
---

# 📉 Playbook Anti-Churn — scan 16/7/2026 11:04

## Verdetto in una riga

**Zero negozi con ordini in calo** — un solo negozio reale approvato (Pane Quotidiano), zero ordini consegnati nella storia, nessun trend −40% calcolabile. **Oggi giovedì 16/7:** l'unica mossa retention è la card **#ritiro-pq-vp17-checkin** (telefonata al fornaio, T-1 VP 17/7) — già in coda, non duplicare.

---

## Dati live (REST Supabase, 16/7 11:04)

| Metrica | Valore | Fonte |
|---|---|---|
| Seller totali DB | 17 | `profiles?role=seller` |
| Seller **reali** (no seed `11111111…`) | **1** | filtro UUID |
| Seller approvati LIVE | **1** (Pane Quotidiano) | `approval_status=approved` |
| Ordini totali | **1** | `orders` |
| Ordini consegnati | **0** | `delivery_status≠DELIVERED` |
| Ultimo ordine | 24/6/2026, **CANCELED** | ordine `58094956…` |
| Ordini ultimi 14g / 30g | **0 / 1** (unico = annullato) | nessun ordine vivo |
| Negozi con trend −40% (30g vs 30g prec.) | **0** | nessuno ha storico consegnati |
| Negozi LIVE fermi 14g (sentinella) | **1** (PQ) | falso positivo — vedi sotto |

> Fonte: query REST diretta 16/7 11:04 + `node cervello/sentinella-dati.mjs --dry-run` (negozi-fermi 1, cooldown sentinella attivo).

---

## Analisi per negozio reale

### Pane Quotidiano — `c0b240c0…` · Via Calzolai 25 · 0523 388601

| Segnale | Valore | Classificazione |
|---|---|---|
| Ordini 14g | 0 | ⚠️ atteso (piattaforma non aperta al pubblico) |
| Ordini 30g vs prev 30g | 1 vs 0 (unico = CANCELED) | **N/A** — impossibile calcolare calo |
| Health relazione | 8/8 | contratto 12% firmato 1/7, gestione diretta Nicola |
| Health vetrina | **2/4** | descrizione ok; logo/orari/città incompleti |
| Prodotti disponibili | **5/5** con stock | catalogo minimo ok per VP |
| Sentinella `negozio_fermo` | scatta | **Falso positivo** — attesa concordata, non abbandono |

**Diagnosi (causa vera):** non sta «mollando» — aspetta il primo ordine reale al **VP 17/7** (ritiro al banco). Nicola 6/7: «li conosco e aspettano finché tutto non è pronto». Il rischio è **no-value realized** se il VP passa senza ordini, non churn post-vendita.

**Azione anti-churn «ci manchi»:** ❌ **nessuna** — #25/#29 chiuse 6/7; ripetere infastidirebbe.

**Azione retention corretta (già in coda — OGGI):**

| ID | Cosa | Colore |
|---|---|---|
| `#ritiro-pq-vp17-checkin` | **Chiama PQ oggi 16/7 mattina** — conferma presidio VP 17/7 al banco | 🟡 |
| `#post-kefir-estate-1407` | Spinta domanda — post kefir estate | 🔴 |
| `#antichurn-13lug` | Ciclo 45gg — si attiva quando entrano botteghe firmate | 🟡 |

---

## Negozi demo (16 seed) — nessuna azione

UUID `11111111…` — esclusi da playbook e sentinella (AR-006). Zero ordini, zero contatti.

---

## Onda post-13/7 — T+3 oggi (16/7)

**DB al 16/7:** ancora **nessun nuovo seller approvato** rispetto al 14/7. La visita del 13/7 **non ha ancora prodotto botteghe online** nel marketplace (debrief Nicola mancante).

| Touch point | Data prevista | Stato |
|---|---|---|
| T+1 (scan anti-churn) | 14/7 | ✅ fatto |
| T+2 (scan anti-churn) | 15/7 | ✅ fatto |
| **T+3 (scan + WhatsApp «come va?»)** | **16/7 oggi** | ⏳ **bloccato** — zero botteghe firmate online nel DB |
| T+7 se 0 ordini | ~20/7 dom | ⏳ futuro |
| Check-in PQ pre-VP | **16/7 giovedì** | 🟡 in coda **#ritiro-pq-vp17-checkin** |

**Playbook completo ciclo 45gg:** `consegne/account-negozi/2026-07-11-playbook-antichurn-6-botteghe.md`  
**Testi T+3 pronti:** `MyCity-Vault/90-Memoria-AI/AZIONI-PRONTE.md` blocco A4 (personalizzare col nome raccolto in visita)

---

## Prospect `scelta_ragionata` (non nel DB) — zero check-in 🔴

| Negozio | Stato registro | Azione anti-churn |
|---|---|---|
| Antica Salumeria Garetti | scelta_ragionata | ❌ nessun contatto — prospect, cancello AR-006 |
| Peretti Frutta e Verdura | scelta_ragionata | ❌ idem |
| Caseificio Amendolara | scelta_ragionata | ❌ idem |
| 6 locali dossier 13/7 | scelta_ragionata | ❌ idem — serve debrief Nicola |

> ⚖️ **Allineamento strategia:** clienti MyCity = **botteghe** (Nicola 13/7 22:34). I 6 locali del dossier 6/7 **non** sono clienti MyCity finché non firmati e online.

---

## Cosa accodato oggi (16/7 11:04)

| Decisione | Motivo |
|---|---|
| ❌ **Nessuna telefonata anti-churn PQ** | Chiusa Nicola 6/7 — falso positivo confermato |
| ❌ **Nessun duplicato #ritiro-pq-vp17-checkin** | Già in coda — è LA mossa retention di oggi |
| 🟡 **#debrief-visita-13lug** | Sblocca ciclo T+3/T+7 per botteghe firmate — debrief mancante da 3 giorni |
| ⏳ **#antichurn-13lug** | Resta in attesa lista botteghe firmate + «ok #antichurn-13lug» |

**Dettaglio operativo:** `MyCity-Vault/90-Memoria-AI/AZIONI-PRONTE.md` blocco A4 (aggiornato 16/7).

---

## Chiusura loop (AR-009)

```bash
node cervello/chiusura-loop.mjs registra account-negozi "playbook anti-churn 16/7" \
  "verita:5,completezza:5,onesta:5,anti-doppione:5" \
  "trova negozi in calo e accoda check-in" \
  "0 in calo; 1 pre-revenue PQ falso positivo; accodato #debrief-visita-13lug; usa #ritiro-pq-vp17-checkin oggi" \
  "#antichurn #playbook #REST-live #VP17"
```
