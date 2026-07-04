---
tipo: checklist-onboarding
negozio: Pane Quotidiano (faro)
data: 2026-07-03 15:20
colore: 🟢 piano · 🔴 le azioni reali (payout/ordine) da firmare
---

# CHECKLIST OPERATIVA DONE-FOR-YOU — Pane Quotidiano al primo incasso reale

**Senior:** onboarding-negozi · **Faro:** Pane Quotidiano (unico negozio reale, decisione Nicola 3/7) · **Obiettivo:** prima transazione end-to-end verificata (prodotto vero → ordine → incasso → payout)

**Fatti di partenza (da STATO 30/6, baseline live 29/6):**
- Negozio approvato nel DB, Stripe Connect **collegato** ma payout **non attivato**
- Ordine reale: **1 × €19,05 in contrassegno (COD)**, creato 24/6, fermo su PENDING/NEW da ~5+ giorni
- Prodotti veri pubblicati: **0** (i 250 "available" sono seed/test, non catalogo reale)
- 0 ordini pagati · 0 consegnati · 0 payout testati

> ⚠️ **Nodo critico da chiarire subito (verità della macchina):** l'ordine €19,05 è **in contrassegno**, quindi **NON transita da Stripe** e **non genererà un payout Stripe**. Sbloccare quell'ordine dà il primo *incasso reale* (contante alla consegna), ma il **test del payout Stripe** richiede un **secondo ordine pagato con carta**. Sono due tracce separate: le tengo entrambe nella checklist. [DA CONFERMARE con backend-dev: se il flusso COD del marketplace registra comunque una commissione MyCity da riconciliare a parte.]

---

## FASE 0 — Prerequisiti (blocco decisionale, 🔴 firma Nicola)
Nulla parte finché non sono firmate. Owner: **AD → Nicola**.

| # | Passo | Chi | Colore |
|---|---|---|---|
| 0.1 | Firmare le 3 decisioni di lancio ferme in AZIONI-IN-ATTESA: **Stripe live vs sandbox**, **commissione MyCity %**, **fee di servizio** | Nicola firma, AD prepara | 🔴 |
| 0.2 | Confermare che si opera in **Stripe LIVE** (non test) per incasso reale | Nicola | 🔴 |
| 0.3 | Confermare referente operativo di Pane Quotidiano (nome, telefono/WhatsApp, email) | Nicola / vendite | [DA CONFERMARE] |

---

## FASE 1 — Attivazione payout Stripe (🔴)
Owner esecuzione tecnica: **backend-dev** + **devops-sre** · verifica: **finanza/contabilita** · firma: **Nicola**

| # | Passo | Chi | Colore |
|---|---|---|---|
| 1.1 | Aprire la dashboard Stripe Connect dell'account di Pane Quotidiano e leggere lo stato: `charges_enabled`, `payouts_enabled`, `requirements.currently_due` | backend-dev | 🟢 (lettura) |
| 1.2 | Completare gli **onboarding requirements** mancanti dell'account connesso: identità titolare, **IBAN** di accredito, dati fiscali/P.IVA, eventuale documento | Titolare Pane Quotidiano (dati) → onboarding-negozi raccoglie → backend-dev inserisce via link onboarding Stripe | 🔴 (dati reali del negozio) |
| 1.3 | Verificare che dopo il completamento `payouts_enabled = true` e `requirements.currently_due = []` | backend-dev + finanza | 🟢 (verifica) |
| 1.4 | Impostare lo **schedule payout** (es. giornaliero/settimanale) coerente con la commissione firmata in 0.1 | backend-dev | 🔴 |
| 1.5 | Registrare l'esito in memoria (numero payout ora abilitato) | AD | 🟢 |

> Se al passo 1.1 i requirements sono corposi, **onboarding-negozi genera un unico link Stripe onboarding** da mandare al titolare (una sola azione per lui, done-for-you sul resto).

---

## FASE 2 — Pubblicazione di 5 prodotti VERI (🔴 pubblicazione, 🟢 preparazione)
Owner: **onboarding-negozi** (coordina) + **ai-copywriter** (schede) + **designer** (foto/immagini) · dati reali dal negozio

| # | Passo | Chi | Colore |
|---|---|---|---|
| 2.1 | Raccogliere dal titolare i **5 prodotti reali** da mettere in vetrina: nome, prezzo, unità di vendita (pezzo/etto/kg), ingredienti/allergeni, foto | onboarding-negozi ← titolare | [DA CONFERMARE — quali 5 prodotti: NON li invento] |
| 2.2 | Scrivere le 5 schede prodotto (titolo + descrizione breve, allergeni obbligatori per prodotto da forno) | ai-copywriter sotto content-social | 🟢 |
| 2.3 | Preparare/ottimizzare le 5 foto (o segnaposto evidenti se il titolare non le fornisce ancora) | designer | 🟢 |
| 2.4 | Verifica **onestà**: zero prezzi/ingredienti inventati, allergeni presenti, foto reali o segnaposto dichiarato | qa-designer / legale-privacy (HACCP/allergeni) | 🟢 |
| 2.5 | **Distinguere dai 250 seed:** i 5 veri vanno marcati come catalogo reale del negozio; NON confonderli con i prodotti di test | backend-dev | 🟢 |
| 2.6 | **Pubblicare** i 5 prodotti (status → available/live) sulla vetrina di Pane Quotidiano | backend-dev / onboarding-negozi | 🔴 |
| 2.7 | Controllo a video: i 5 appaiono nella vetrina pubblica, prezzo e disponibilità corretti, aggiungibili al carrello | qa | 🟢 (verifica) |

---

## FASE 3 — Sblocco dell'ordine €19,05 (COD) fermo (🔴)
Owner: **operations** (stato ordine) + **supporto** (contatto buyer) · decisione: **Nicola**

| # | Passo | Chi | Colore |
|---|---|---|---|
| 3.1 | Leggere il record ordine: buyer, indirizzo, prodotto/i, data (24/6), stato attuale PENDING/NEW, motivo dello stallo | operations / backend-dev | 🟢 |
| 3.2 | Decidere: **accettare e consegnare** vs **annullare con nota** al cliente (l'ordine ha ~5+ giorni → rischio cliente freddo/annullamento) | AD propone, Nicola firma | 🔴 |
| 3.3a | **Se accettare:** confermare disponibilità col titolare → preparare consegna (rider/ritiro) → transizione stato ACCEPTED/IN CONSEGNA | operations + rider-fleet/dispatch | 🔴 |
| 3.3b | Messaggio al buyer (scusa per l'attesa + conferma/finestra di consegna) — testo pronto in `consegne/`, accodato in AZIONI-IN-ATTESA | supporto prepara, Nicola invia | 🔴 |
| 3.4 | Consegna + **incasso contrassegno €19,05** (contante/POS alla porta) → stato DELIVERED/PAID | rider/titolare | 🔴 |
| 3.5 | Registrare: primo incasso reale del marketplace, importo €19,05, metodo COD, data | AD + contabilita | 🟢 |

> Se il buyer è irraggiungibile o rifiuta (probabile dopo 5+ gg): annullare pulito con nota, **non lasciarlo zombie**, e spostare il "primo incasso" sul primo ordine dei 5 prodotti nuovi.

---

## FASE 4 — Test del primo payout Stripe (🔴)
Owner: **backend-dev** + **finanza/contabilita** · firma: **Nicola**

> Serve un ordine **pagato con carta (Stripe)**, perché il COD non genera payout.

| # | Passo | Chi | Colore |
|---|---|---|---|
| 4.1 | Creare **1 ordine reale con carta** su uno dei 5 prodotti pubblicati (ordine di test controllato, importo reale piccolo) | AD/operations, con acquirente reale o Nicola stesso come primo cliente | 🔴 |
| 4.2 | Verificare in Stripe: pagamento riuscito, **application fee** MyCity calcolata secondo la commissione firmata, importo netto al connected account | finanza + backend-dev | 🟢 (verifica) |
| 4.3 | Confermare che il **payout** parte verso l'IBAN del negozio (secondo lo schedule del 1.4) e arriva | contabilita | 🔴 |
| 4.4 | **Riconciliazione:** incasso lordo − fee MyCity = netto payout; quadratura in contabilita | contabilita/finanza | 🟢 |
| 4.5 | Registrare "**payout testato: 1**" e "**ordine pagato: 1**" in STATO (chiudere 2 dei 7 numeri) | AD | 🟢 |

---

## Sequenza / percorso critico
1. **FASE 0** (firme) → sblocca tutto
2. **FASE 1** (payout attivo) e **FASE 2** (5 prodotti) in **parallelo** — non dipendono l'una dall'altra
3. **FASE 3** (sblocco €19,05) in parallelo alle prime due → dà il **primo incasso reale** (COD)
4. **FASE 4** (test payout Stripe) **dopo** che FASE 1 + FASE 2 sono chiuse (serve payout abilitato + un prodotto vero da vendere con carta)

**Definizione di "fatto":** i 7 numeri passano a → Prodotti veri pubblicati **5**, Ordini pagati **≥1**, Ordini consegnati **≥1**, Payout testato **1**.

---

## Output atteso di questa delega
- ✅ **COSA HO FATTO:** prodotto questa checklist ordinata con owner per passo; isolato il nodo COD-vs-Stripe (payout non arriva dall'ordine €19,05).
- ⏳ **COSA HO ACCODATO (da mettere in AZIONI-IN-ATTESA):** 0.1 firma 3 decisioni · 1.2/1.4 attivazione payout · 2.6 pubblicazione 5 prodotti · 3.2 decisione ordine zombie + 3.3b messaggio buyer · 4.1/4.3 ordine-carta e payout di test — tutte 🔴.
- 🙋 **COSA SERVE DA NICOLA:**
  1. Firmare le 3 decisioni di lancio (Stripe live/sandbox, commissione, fee).
  2. **[DA CONFERMARE]** i **5 prodotti reali** con prezzi (non li invento).
  3. **[DA CONFERMARE]** referente Pane Quotidiano + IBAN per il payout.
  4. Decidere accetta/annulla sull'ordine €19,05.
  5. Confermare chi fa il primo ordine-carta di test (FASE 4).