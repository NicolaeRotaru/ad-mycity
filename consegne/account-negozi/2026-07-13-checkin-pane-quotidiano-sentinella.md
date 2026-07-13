---
data: 2026-07-13 11:18
reparto: account-negozi / AD
tipo: check-in-operativo (NON anti-churn)
sentinella: negozio_fermo · firma c0b240c0-2a86-4218-9d0f-5154f08ff929
fonte_dati: supervisione-negozi 13/7 11:18 + sentinella-dati + registro-fatti
---

# Check-in Pane Quotidiano — 13/7/2026

> **Per Nicola:** la sentinella «negozio fermo» è scattata di nuovo su Pane Quotidiano (0 ordini in 14 giorni).
> **Verdetto cancello 🔬:** **NON è churn** — è **attesa concordata** (tu li conosci, aspettano che la piattaforma sia pronta; correzione 6/7).
> **Cosa fare oggi:** check-in **operativo in visita** (#checkin-pane-quotidiano), **non** telefonata anti-churn.

---

## Health score (aggiornato 13/7 11:18)

| Dimensione | Stato | Dettaglio |
|---|---|---|
| Negozio approvato LIVE | ✅ | Unico negozio reale su 17 totali (16 demo) |
| Catalogo prodotti | ✅ | **258 prodotti** caricati (fonte: supervisione 13/7) |
| Ordini ultimi 14 giorni | ⚠️ **0** | Atteso: piattaforma non ancora «aperta» al pubblico; North Star ancora **0** |
| Primo ordine end-to-end | ❌ | Ordine #16 (€19,05 COD) **annullato** 3/7 — serve ordine-prova nuovo (#41 in coda) |
| Logo negozio | ❌ | 1 negozio senza logo → **PQ** (raccogliere oggi) |
| Foto prodotti | ❌ | Almeno 1 prodotto senza foto reale |
| Descrizione vetrina | ❌ | Manca la storia del negozio (15 negozi senza — PQ incluso) |
| Città in scheda | ❌ | Manca «Piacenza» (17 negozi — autofill proposto ma serve ok) |
| Unità/condizione prodotti | ⚠️ | 252 senza «nuovo», 242 senza «pezzo» — **proposte autofill pronte** (🟡 in coda) |
| Payout Stripe testato | ❌ | Mai verificato end-to-end — gate per primo ordine reale |

**Punteggio vetrina: 2/8** — catalogo numeroso ma **pagina percepita vuota** (no logo, no foto, no descrizione).  
**Punteggio relazione: 8/8** — contratto firmato 1/7, attesa concordata, gestione diretta Nicola.

---

## Perché NON chiamare per anti-churn

1. **Nicola 6/7:** «non c'è bisogno con PQ, li conosco e aspettano finché tutto non è pronto» → azioni #25/#29 **chiuse**.
2. **registro-fatti:** faro unico reale; ripresa operativa **13/7**; 1° ordine target **≥17/7** (Venerdì Piacentini).
3. **Oggi 13/7:** giornata di **visita operativa**, non retention telefonica.

Un messaggio «ci manchi, torna a vendere» sarebbe **fuori contesto** e rischia di infastidire.

---

## Kit visita oggi (3 cose + 4 domande)

### Da raccogliere di persona

1. **Logo** — file JPG/PNG o foto cartello su sfondo neutro  
2. **3–5 foto prodotti** — articoli icona (bio, pane, prodotti da forno)  
3. **Descrizione 2 righe** — «chi siete, cosa vendete, da quando» (le loro parole)

### Domande utili (non anti-churn)

- Riuscite ad entrare nel vostro account seller?
- Avete ricevuto l’email di attivazione?
- **Quando** volete iniziare a prendere ordini sul serio? (allinea aspettative al 17/7 o dopo bici)
- Preferite che scriviamo noi la descrizione vetrina o la fate voi?

**Contatti noti:** Via Calzolai 25 · tel. **0523 388601**

---

## Upsell catalogo (dopo la visita, 🟢)

| Priorità | Azione | Chi | Quando |
|---|---|---|---|
| 1 | Carica logo + foto + descrizione raccolti oggi | AD/onboarding (🟢) | Subito dopo visita |
| 2 | Firma batch autofill **«nuovo»** (252 prod.) + **«pezzo»** (242 prod.) | Nicola 🟡 | Dopo visita — comandi in `consegne/supervisione/2026-07-13-supervisione.md` |
| 3 | Autofill **città = Piacenza** su PQ | Nicola 🟡 | Stesso batch |
| 4 | Seleziona **5 prodotti faro** con foto per vetrina home | category-manager + designer | Post-visita |
| 5 | **A7 upsell** (espandi catalogo, promo bio) | account-negozi 🟢 | **Solo DOPO** 1ª consegna reale |

---

## Cosa NON fare oggi

- ❌ Telefonata/WhatsApp anti-churn standalone  
- ❌ Pubblicare post social con «ordina ora» (flusso non provato — gate post #46)  
- ❌ Stampare kit QR in vetrina prima del payout-test (#48 gated)

---

## Prossimo passo dopo la visita

1. Nicola deposita file in `consegne/negozi/pane-quotidiano/` (o scrive «raccolto: logo+foto+descrizione» in chat).  
2. Macchina carica vetrina (🟢).  
3. Nicola firma **ordine-prova + payout-test** (#41 🔴) → North Star da 0 a 1.  
4. Firma **#58** (allowlist attesa concordata) → la sentinella smette di svegliare la macchina ogni 2h su PQ.

---

## Fonti

- Supervisione: `consegne/supervisione/2026-07-13-supervisione.md` (17 negozi, 1 approvato, 258 prodotti)  
- Verdetto falso positivo: `consegne/account-negozi/2026-07-08-negozio-fermo-pane-quotidiano-falso-positivo.md`  
- Coda: `#checkin-pane-quotidiano` in AZIONI-IN-ATTESA
