# Esecuzione ok 16 — ordine zombie €19,05 · consegna STASERA cena 19–21 sab 4/7 (accorpata al payout-test)

> **🌙 STATO 2026-07-04 09:31 — PROPOSTA DAL GIRO APPROVATA (Pannello): «Esegui #16 stasera — tap WhatsApp #20 (cena 19–21) → #21 → #22 → "consegna fatta"».** Nicola firma l'esecuzione serale (🔴). **Piano stasera:** finestra consegna **19:00–21:00** (negozio + freschi ok di sera, no caldo, buyer a casa dopo il lavoro del sabato). #20 era già stato inviato stamattina (04:51 «prosegui #21-#22»); se il buyer **non ha ancora bloccato indirizzo+orario**, il tap serale qui sotto (PASSO 1) riconferma la consegna per le 19–21. Poi mani di Nicola: **§PASSO 2 (#21 accetta ordine + chiama PQ)** → **§PASSO 3 (#22 consegna COD €19,05 → «Consegnato»)**. Al «consegna fatta» → payout-test #2 + recensione A13/A14 (#27) + carrello samir (#26). Registrato in [[DECISIONI]] 09:31.
>
> **🚚 STATO precedente 2026-07-04 04:51 — #20 FATTO, si prosegue a #21-#22:** Nicola risponde all'auto-analisi «Hai inviato WhatsApp #20?» con **«prosegui #21-#22»** → **PASSO 1 (WhatsApp) chiuso: inviato, contatto col buyer avvenuto**. (Il tap serale qui sotto è la riconferma per lo slot 19–21, non un secondo primo-contatto.)
>
> **Approvato:** Nicola Pannello **2/7 08:38** (`ok 16`) · Scelta A già firmata **1/7 11:05** · Decisione binaria **2/7 17:09** = Scelta A (eseguire) · proposta #16 3/7 13:29
> **✅ Aggiornato 2026-07-04 04:38 — PROPOSTA DAL GIRO #20 APPROVATA (Pannello):** «#20 WhatsApp buyer 348 642 1766 — primo passo consegna pranzo, ok 16 già approvato». Le finestre di giovedì 3/7 (mattina/pomeriggio/sera) sono passate senza il tap → **riprogrammata a STAMATTINA sabato 4/7 (entro le 13)**. Motivo: Pane Quotidiano è aperto la mattina (facile ritiro) e i freschi vanno consegnati prima del caldo pomeridiano. Artefatto rigenerato con lo slot di oggi. Stallo ~236h — chiuderlo è la mossa #1.
> **@operations + @supporto** · 🔴 mani reali (WhatsApp + dashboard + consegna COD) — **~5 min di tap per Nicola**
> **🔗 Accorpato al payout-test (#2, riga coda):** questa prima transazione reale end-to-end È il payout-test — verifica su un caso vero l'incasso COD €19,05 e la riconciliazione (Stripe = sandbox, decisione #3 → nessun incasso carta, contanti alla consegna). Chiuso #16, @finanza/@contabilita quadrano incasso vs ordine.

## Dati ordine (verificati live REST 2/7 08:38)

| Campo | Valore |
|---|---|
| ID ordine | `58094956-4b9b-49b4-9299-7a5c645d7cb3` |
| Negozio | **Pane Quotidiano** (`c0b240c0-2a86-4218-9d0f-5154f08ff929`) · Via Calzolai 25 · tel. **0523 388601** |
| Buyer tel. | **348 642 1766** |
| Nome/indirizzo in app | ⚠️ **Placeholder** (`N` / `N`) — **chiedere indirizzo reale in WhatsApp** |
| CAP/città | Piacenza 29121 · lat/lng 45.0506 / 9.6969 |
| Totale | **€19,05 COD** (prodotti €12,95 + consegna €6,10) |
| Stato DB | `payment_status=PENDING` · `delivery_status=NEW` · slot originale «Stasera 18–20» del 24/6 |
| Creato | 2026-06-24 10:28 — stallo **~190h** |

### Prodotti da preparare (Pane Quotidiano)
| Prodotto | Qtà | Prezzo |
|---|---|---|
| Hummus di ceci senza aglio biologico | 1 | €2,95 |
| Kefir di latte di capra biologico | 1 | €2,95 |
| Berchtesgadener Land kefir bio 400g | 1 | €2,05 |
| Pesto Genovese Bio | 1 | €5,00 |

---

## PASSO 1 — WhatsApp buyer (🔴 · Nicola · STASERA cena 19–21) ✅ APPROVATO (proposta 4/7 09:31)

**Slot proposto:** **stasera, consegna tra le 19:00 e le 21:00** (buyer a casa dopo il sabato, freschi ok di sera senza caldo)

**Testo (copia-incolla):**
> Ciao! Siamo MyCity — il tuo ordine da Pane Quotidiano del 24 giugno è ancora pronto. Possiamo consegnartelo **stasera tra le 19 e le 21**? Rispondi sì e confermami **indirizzo e citofono** — li avevamo persi in piattaforma. — Nicola, MyCity

**Link diretto (1 tap):**
https://wa.me/393486421766?text=Ciao!%20Siamo%20MyCity%20%E2%80%94%20il%20tuo%20ordine%20da%20Pane%20Quotidiano%20del%2024%20giugno%20%C3%A8%20ancora%20pronto.%20Possiamo%20consegnartelo%20stasera%20tra%20le%2019%20e%20le%2021%3F%20Rispondi%20s%C3%AC%20e%20confermami%20indirizzo%20e%20citofono%20%E2%80%94%20li%20avevamo%20persi%20in%20piattaforma.%20%E2%80%94%20Nicola%2C%20MyCity

**Se non risponde entro le 20:00:** tieni comunque il ritiro dal negozio pronto e, se il buyer conferma tardi, sposta di poco lo slot; se resta irraggiungibile tutta la sera si riprova domani (non riproporre la decisione binaria — è già firmata Scelta A).

---

## PASSO 2 — Dashboard seller + negozio (🔴 · Nicola)

1. **Accetta ordine** in dashboard Pane Quotidiano:
   https://mycity-marketplace.com/seller/dashboard
   → ordine `58094956…` → **Accetta**
2. **Chiama Pane Quotidiano** (0523 388601) — script in `AZIONI-PRONTE.md` **A6**:
   > «C'è un ordine MyCity da preparare: 4 prodotti bio (pesto + kefir + hummus), €19,05 contrassegno. Passiamo a ritirarlo/consegnarlo **stasera verso le 19**. Confermate che è pronto?» *(⚠️ verifica orario di chiusura del negozio sabato sera — se chiude presto, ritira prima e consegna 19–21)*
3. Aggiorna **slot consegna** in app se il buyer conferma orario diverso.

---

## PASSO 3 — Consegna COD (🔴 · Nicola o rider)

| Step | Cosa |
|---|---|
| Ritiro | Da Pane Quotidiano Via Calzolai 25 |
| Consegna | Indirizzo confermato dal buyer (⚠️ non quello placeholder in DB) |
| Incasso | **€19,05 contanti** alla consegna |
| Chiusura app | Dashboard → segna **Consegnato** + conferma COD incassato |

---

## PASSO 4 — Post-consegna (🔴 · @customer-success)

| Quando | Cosa | Riferimento |
|---|---|---|
| +3h da Consegnato | WhatsApp feedback | `AZIONI-PRONTE.md` **A13** |
| Se 👍 | Richiesta recensione | **A14** · link review sotto |
| Entro 24h | Telefonata concierge | `consegne/customer-success/primo-ordine-faro.md` |

**Link recensione ordine:**
https://mycity-marketplace.com/orders/58094956-4b9b-49b4-9299-7a5c645d7cb3/review

---

## Checklist rapida Nicola (5 min)

- [ ] **1.** Tap link WhatsApp → invia messaggio serale (consegna 19–21)
- [ ] **2.** Attendi risposta buyer (indirizzo + sì)
- [ ] **3.** Accetta ordine in dashboard PQ
- [ ] **4.** Chiama negozio (0523 388601) — prodotti pronti
- [ ] **5.** Ritiro + consegna + incasso €19,05 COD
- [ ] **6.** Conferma «Consegnato» in app
- [ ] **7.** Scrivi AD **«consegna fatta»** → attiva A13/A14
- [ ] **8.** *(payout-test #2 accorpato)* AD segna incasso COD €19,05 in DECISIONI + @finanza/@contabilita quadrano incasso vs ordine (Stripe sandbox → nessuna carta, solo contanti riconciliati)

---

## Fonte numeri
REST Supabase `clmpyfvpvfjgeviworth` · verifica AD 2026-07-02 08:38
