# Esecuzione ok 16 — ordine zombie €19,05 · consegna pranzo 2/7

> **Approvato:** Nicola Pannello **2/7 08:38** (`ok 16`) · Scelta A già firmata **1/7 11:05**
> **@operations + @supporto** · 🔴 mani reali (WhatsApp + dashboard + consegna COD)

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

## PASSO 1 — WhatsApp buyer (🔴 · Nicola · ORA)

**Slot proposto:** **oggi pranzo 12:00–13:30**

**Testo (copia-incolla):**
> Ciao! Siamo MyCity — il tuo ordine da Pane Quotidiano del 24 giugno era rimasto in sospeso, ci scusiamo per il ritardo. Possiamo consegnartelo **oggi a pranzo (12:00–13:30)**? Rispondi sì e confermami **indirizzo e citofono** — li avevamo persi in piattaforma. — Nicola, MyCity

**Link diretto (1 tap):**
https://wa.me/393486421766?text=Ciao!%20Siamo%20MyCity%20%E2%80%94%20il%20tuo%20ordine%20da%20Pane%20Quotidiano%20del%2024%20giugno%20era%20rimasto%20in%20sospeso%2C%20ci%20scusiamo%20per%20il%20ritardo.%20Possiamo%20consegnartelo%20oggi%20a%20pranzo%20(12%3A00%E2%80%9313%3A30)%3F%20Rispondi%20s%C3%AC%20e%20confermami%20indirizzo%20e%20citofono%20%E2%80%94%20li%20avevamo%20persi%20in%20piattaforma.%20%E2%80%94%20Nicola%2C%20MyCity

**Se non risponde entro 11:00:** richiama o ripianifica 18:00–20:00 (aggiornare messaggio).

---

## PASSO 2 — Dashboard seller + negozio (🔴 · Nicola)

1. **Accetta ordine** in dashboard Pane Quotidiano:
   https://mycity-marketplace.com/seller/dashboard
   → ordine `58094956…` → **Accetta**
2. **Chiama Pane Quotidiano** (0523 388601) — script in `AZIONI-PRONTE.md` **A6**:
   > «C'è un ordine MyCity da preparare: 4 prodotti bio (pesto + kefir + hummus), €19,05 contrassegno. Passiamo a ritirarlo/consegnarlo oggi a pranzo. Confermate che è pronto?»
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

- [ ] **1.** Tap link WhatsApp → invia messaggio pranzo
- [ ] **2.** Attendi risposta buyer (indirizzo + sì)
- [ ] **3.** Accetta ordine in dashboard PQ
- [ ] **4.** Chiama negozio (0523 388601) — prodotti pronti
- [ ] **5.** Ritiro + consegna + incasso €19,05 COD
- [ ] **6.** Conferma «Consegnato» in app
- [ ] **7.** Scrivi AD **«consegna fatta»** → attiva A13/A14

---

## Fonte numeri
REST Supabase `clmpyfvpvfjgeviworth` · verifica AD 2026-07-02 08:38
