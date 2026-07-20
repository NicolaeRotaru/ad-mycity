---
tipo: azioni-pronte-win-back
reparto: crm-lifecycle
data: 2026-07-20 11:15
fonte: REST Supabase live (`verifica-sensori` ok 20/7 11:13) — `profiles`, `orders`, `abandoned_carts`, `coupons`
stato: DRY-RUN — NESSUN INVIO · segmento win-back = 0 destinatari oggi
voce: Vicino Orgoglioso (FLUSSI-LIFECYCLE §4)
riferimento: `consegne/crm/2026-07-06-win-back-pronte.md` (base) · `consegne/crm/FLUSSI-LIFECYCLE.md` §4
anti-doppione: samir → recupero carrello **A3** / `#ordine-test-pq` gate (AR-008) · welcome 4 buyer → `#welcome-email-23`
---

# Win-back dormienti — playbook 20/7 (ri-verifica live)

> **Prima riga per Nicola:** oggi **nessuno** va in win-back — non c'è ancora un cliente che abbia **completato** un ordine. Le 4 iscrizioni buyer sono **attivazione primo ordine** (welcome/carrello), non riattivazione. La sequenza win-back resta **carica e pronta** per il giorno dopo la prima consegna reale + 14 giorni fermo.

---

## 1) Segmento reale OGGI (fonte REST 20/7 11:13)

**Definizione win-back** (GLOSSARIO-KPI / FLUSSI §4): cliente con **≥1 ordine CONSEGNATO** (`delivery_status=DELIVERED`) e **0 ordini negli ultimi 14 giorni**.

| Metrica | Valore | Fonte |
|---|---|---|
| Buyer registrati | **4** | `profiles?role=buyer` |
| Ordini totali | **1** | `orders` |
| Ordini consegnati | **0** | `delivery_status=DELIVERED` |
| Ordine unico | COD €19,05 Pane Quotidiano · **CANCELED** 3/7 · mai consegnato | `orders` |
| **Win-back dormienti (≥1 consegnato + 14gg fermo)** | **0** | 0 consegnati ⇒ coorte vuota |
| Carrelli buyer reali | **1** (samir, €10 PQ) | `abandoned_carts` — flusso **A3**, non win-back |

### I 4 buyer — classificazione corretta (non gonfiare il win-back)

| Profilo | Situazione | Flusso giusto | Win-back? |
|---|---|---|---|
| samir? | Carrello €10 PQ, ~34 gg fermo, recovery già inviato 17/6 | **A3** recupero carrello | ❌ (AR-008) |
| (anon) | Ordine €19,05 **annullato**, mai consegnato | Attesa ri-prova ordine (#ordine-test-pq) | ❌ finché non c'è 1ª consegna |
| 2 buyer anonimi | Iscritti, 0 ordini, 0 carrello | **#welcome-email-23** (attivazione) | ❌ (non è win-back) |
| 1 buyer anonimo | Iscritto 28/5, 0 ordini | **#welcome-email-23** | ❌ |

> ⚠️ **Non confondere:** «4 buyer dormienti» nel senso business (mai ordinato) ≠ **win-back CRM** (già ordinato e poi fermo). Il secondo segmento **non esiste ancora**.

### Trigger che creerà il primo dormiente win-back

```
1. #ordine-test-pq → ordine CONSEGNATO (North Star 0→1)
2. +14 giorni senza secondo ordine su quel cliente
3. → entra in coorte win-back → parte Touch #1 (🟡)
4. +7 giorni ancora fermo → Touch #2 con incentivo (🔴)
5. Se ≥2 ordini storici → opzione telefonata concierge (🟡)
```

---

## 2) Sequenza win-back — copy pronta (Pane Quotidiano = faro reale)

Segnaposti: `[Nome]` · `[Bottega]` = da profilo/ultimo ordine al momento dell'invio.

### Touch #1 — giorno 14 · «ci manchi» · €0 · 🟡

**Oggetto:** [Nome], è un po' che non ti portiamo niente 💛  
**Preheader:** Pane Quotidiano è ancora lì. Quando vuoi, te la riporto a casa.

> Ciao [Nome],
>
> è un paio di settimane che non ci vediamo, e un po' si sente.
>
> **Pane Quotidiano** (Via Calzolai — bio dal 1976) prepara sempre fresco: kefir, pesto, pane. Ti va di riprovare? Un minuto sul sito, te la portiamo a mano nel quartiere — paghi anche alla consegna se preferisci.
>
> 👉 [Torna da Pane Quotidiano](https://mycity-marketplace.com)
>
> Se la prima volta qualcosa non ti aveva convinto — consegna, orari, un prodotto — **dimmelo rispondendo a questa mail**: lo leggo io. Le botteghe del centro le teniamo aperte solo se torni anche tu. 💛
>
> A presto,  
> Nicola — MyCity  
> *Il marketplace delle botteghe di Piacenza*
>
> *MyCity, Piacenza · [Disiscriviti]*

---

### Touch #2 — giorno 21 · CON incentivo · 🔴

**Oggetto:** [Nome], la prossima consegna la offro io 🚲  
**Preheader:** Un piccolo pensiero per rivederti tra i vicini di MyCity.

> Ciao [Nome],
>
> non voglio insistere — solo dirti che mi piacerebbe rivederti tra i vicini di MyCity.
>
> Per convincerti a riprovare: **il prossimo ordine te lo consegno io, offerto.** Scegli **Pane Quotidiano**, riempi il carrello, al resto pensiamo noi.
>
> 👉 [Ordina — consegna offerta](https://mycity-marketplace.com)
>
> *(In alternativa, se preferisci una spesa più grande: codice **SPED5** — €5 di sconto sopra i **€25**. Uno dei due, quello che ti conviene.)*
>
> Se non fa per te, nessun problema: [Disiscriviti]. Ma se ci dai un'altra possibilità, Pane Quotidiano (e io) ti aspettiamo.
>
> Nicola — MyCity

---

### Touch #3 — telefonata · SOLO clienti con ≥2 ordini storici · 🟡

Script in `consegne/crm/2026-07-06-win-back-pronte.md` §Touch #3 — sostituire [Bottega] con Pane Quotidiano.

---

## 3) Incentivo entro budget (CRM = €0 nuovi coupon)

| Leva | Dettaglio live REST 20/7 | Costo max | Colore |
|---|---|---|---|
| **Consegna offerta** sul riordino | cap logistico ~**€4** | ~€4/cliente | 🔴 |
| **`SPED5`** | `type=FIXED`, €5, `min_subtotal=25`, `first_order_only=false`, `active=true` | €5 solo se scontrino ≥€25 | 🔴 |
| **`BENVENUTO10`** | `first_order_only=true` | **ESCLUSO** win-back | — |

Nessun coupon nuovo. Budget rispettato.

---

## 4) Gate all'invio (tutti ❌ oggi)

| Gate | Stato |
|---|---|
| ≥1 dormiente reale (consegnato + 14gg) | ❌ 0 consegnati |
| Consenso marketing | ❌ 3/4 buyer `email_marketing=false` |
| Mani Resend attive | ✅ API ok · invii marketing 🔴 firma |
| Incentivo Touch #2 firmato | ❌ Nicola 🔴 |

**Zero invii.** Pacchetto armato in attesa del trigger post–primo ordine.

---

## 5) Cosa fare ORA (priorità Nicola)

1. **🔴 PI26** (sportello aperto) — non compete con CRM oggi.
2. **🟡 #ordine-test-pq** — sblocca North Star e, tra 14 gg, il primo win-back reale.
3. **🔴 #welcome-email-23** — i **4 buyer** che non hanno mai completato un ordine (attivazione, non win-back).
4. **🟡 A3** — samir carrello €10 **dopo** PQ evadibile (gate già in coda).

---

## ✅ Cancello onestà

- [x] Numeri da REST live 20/7 11:13 — verificato con script ad-hoc post `verifica-sensori`.
- [x] 0 destinatari win-back inventati.
- [x] samir escluso (A3).
- [x] 4 buyer ≠ win-back — distinzione esplicita.
- [x] Coupon verificati live (`BENVENUTO10`, `SPED5`).
- [x] Nessun invio.
