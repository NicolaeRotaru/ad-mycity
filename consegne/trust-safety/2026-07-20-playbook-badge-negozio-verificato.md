---
tipo: playbook-standard
titolo: "Bollino «Negozio Verificato MyCity» — refresh idoneità + comunicazione"
reparto: trust-safety (owner) · legale-privacy (claim) · content-social (bozze)
data: 2026-07-20 11:33
stato: STANDARD CONFERMATO (🟢) · 0 assegnati · 1 candidato · comunicazione pronta in attesa del 1° ordine consegnato
fonte_dati: REST marketplace 2026-07-20 11:33 · registro-realta.json · consegne/trust-safety/2026-07-06-badge-negozio-verificato.md (standard originale)
---

# 🛡️ Negozio Verificato MyCity — refresh 20/7/2026

> **Esito in una riga:** lo standard c'è già (5 pilastri verificabili); oggi **nessun negozio lo merita ancora**; **Pane Quotidiano** è candidato **3/5** — mancano **payout Stripe ON** e **≥1 consegna consegnata**. Comunicazione pronta, parte **solo dopo** il fatto.

---

## 1) I 5 pilastri (invariati dal 6/7 — fonte unica)

| # | Pilastro | Prova |
|---|---|---|
| P1 | **Identità reale** | Sede + telefono verificabili · KYC Stripe Connect completato |
| P2 | **Bottega attiva** | `approval_status=approved` · **≥5 prodotti** `status=available` con prezzi/foto reali |
| P3 | **Pagamenti sicuri** | `stripe_charges_enabled=true` **e** `stripe_payouts_enabled=true` |
| P4 | **Consegna provata** | **≥1 ordine** `delivery_status=DELIVERED` · 0 dispute aperte |
| P5 | **Regole rispettate** | Contratto venditore firmato + consensi GDPR · 0 segnalazioni trust-safety aperte |

**Revoca:** il badge si **sospende** se cade un pilastro (payout off, dispute persa, segnalazione frode, catalogo vuoto).

**Claim pubblico (validato @legale-privacy):** *«Abbiamo verificato che questo negozio è reale, che paghi protetto e che consegna davvero. Non è un voto sulla qualità del prodotto — per quello ci sono le recensioni.»*

---

## 2) Idoneità LIVE — 2026-07-20 11:33 (REST)

| Negozio | Stato | P1 | P2 | P3 | P4 | P5 | Verdetto |
|---|---|:---:|:---:|:---:|:---:|:---:|---|
| **Pane Quotidiano** | `confermato` | ✅ Via Calzolai 25, tel. 0523388601 | ✅ approved, **5/5** prodotti `available` | ❌ charges **OFF**, payouts **OFF** | ❌ **0** consegnati (1 ordine **CANCELED** 24/6) | 🟡 contratto 12% firmato 1/7 **[DOC]** · campi `tos_accepted_at`/`privacy_accepted_at` **nulli in DB** | **CANDIDATO 3/5** |
| Casa Linda | demo `suspended` | — | — | — | — | — | ⛔ **Esclusa** (seed, non reale) |
| Altri 15 seller | non approved | — | — | — | — | — | ⛔ Non idonei (non live) |
| Garetti / Peretti / Amendolara | prospect | — | — | — | — | — | ⛔ Pipeline vendite (non nel DB) |

**Numeri fonte:** 17 seller totali · **1 approved** (PQ) · **4 buyer** · **0 ordini pagati/consegnati** · stallo North Star ~625h.

**Conclusione onesta:** **0 Negozi Verificati oggi.** PQ diventa il **1° Negozio Verificato di Piacenza** nell'istante esatto in cui:
1. Nicola completa **#ordine-test-pq** (o altra consegna reale) → P4 ✅
2. Stripe Connect PQ passa a **charges + payouts ON** → P3 ✅
3. (Opzionale ma consigliato) allineare consensi in DB → P5 pieno anche lato dato

---

## 3) Bug critico da chiudere PRIMA del bollino (🟡 #51)

Oggi `VerifiedBadge.tsx` compare su **quasi tutti** i punti del sito **senza condizione** → anche negozi non idonei sembrano «verificati». **Prima** di assegnare il badge a PQ, mergiare il gate codice (`lib/store-trust.ts::isVerifiedStore`) — spec: `consegne/trust-safety/2026-07-06-gate-codice-badge-verificato.md`.

---

## 4) Comunicazione pronta (NON pubblicare con 0 verificati)

### 4a) Al titolare PQ (WhatsApp — 🔴, solo a 5/5 pilastri)

> Buongiorno! Da oggi Pane Quotidiano è il **primo «Negozio Verificato MyCity» di Piacenza** 🛡️
> I clienti vedono un bollino sulla vostra vetrina: negozio vero, pagamento sicuro, consegna che funziona.
> Ve lo siete guadagnato con la prima consegna. Da qui in avanti lo teniamo insieme.

### 4b) Annuncio pubblico (IG @mycity.piacenza + gruppi FB — 🔴)

> **[HOOK]** A Piacenza è nato un bollino che prima non c'era: **Negozio Verificato**.
> **[CORPO]** Comprare online da una bottega del centro è bello solo se ti puoi fidare. Cinque regole chiare: negozio reale, pagamento sicuro, consegna provata, regole rispettate. Chi le rispetta tutte prende il bollino 🛡️. Chi lo tradisce lo perde. Non è un adesivo che regaliamo: è una garanzia che ci mettiamo noi, faccia a faccia. Il primo a guadagnarselo è **Pane Quotidiano** — perché dietro c'è gente vera, non un magazzino fuori città.
> **[CTA]** 👉 Cerca il bollino 🛡️ quando fai la spesa su MyCity.
> **[FIRMA]** La spesa che tiene viva la città. — MyCity Piacenza · VOLTI, NON ALGORITMI

### 4c) Tooltip sito (CONFIG — 🟡)

> **🛡️ Negozio Verificato MyCity** — Identità reale · Pagamenti sicuri · Consegna provata · Regole rispettate.
> *(tooltip)* «Abbiamo verificato che questo negozio è reale, che paghi protetto e che consegna davvero. Se qualcosa non va, il bollino si sospende.»

### 4d) Onboarding nuove botteghe — rito 30 giorni

Entri → payout attivo + catalogo ≥5 → **1ª consegna consegnata** → **bollino**. Checklist stampabile per Garetti/Peretti/Amendolara al go-live.

---

## 5) Sequenza operativa (quando PQ passa 5/5)

| Step | Cosa | Colore | Dipende da |
|---|---|---|---|
| 1 | Mergia gate codice badge (#51) | 🟡 | branch marketplace |
| 2 | Flag `verified` su profilo PQ + bollino a video | 🔴 | step 1 + P3+P4 |
| 3 | WhatsApp al titolare (4a) | 🔴 | step 2 |
| 4 | Post annuncio standard città (4b) | 🔴 | step 2 + ok Nicola |

Anteprima operativa: [[AZIONI-PRONTE]] **A39** · coda canonica: riga **#38** + **#51** in [[AZIONI-IN-ATTESA]].

---

## 6) Cosa chiedere a Nicola

1. **🔴 Priorità oggi:** `#ordine-test-pq` + accendere payout PQ → sblocca il badge (North Star + fiducia insieme).
2. **🟡 Mergia #51** prima del bollino — altrimenti il sito mente anche dopo l'assegnazione.
3. **🔴 Dopo 5/5:** ok su annuncio pubblico (4b) + messaggio al fornaio (4a).

*Preparato dall'AD · owner @trust-safety · peer @legale-privacy (claim) · bozze @content-social. Nessun negozio dichiarato verificato: 0 oggi.*
