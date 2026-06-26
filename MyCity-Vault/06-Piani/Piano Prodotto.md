# 🧩 PIANO PRODOTTO / ROADMAP MyCity

> Base dati: [[Roadmap & Stato Prodotto]] (audit del codice reale 2026-06-17), [[Decisioni Aperte]], [[Prodotto & UX]].
> **Stato vero:** il prodotto è costruito al ~90% — **24 feature FATTE, 2 PARZIALI, 0 mancanti**, più ~24 extra non in roadmap. Stack: Supabase + Stripe Connect + Gemini + WhatsApp, PWA.
> **Realtà del business:** ~1 negozio, ~0 ordini. **Il collo di bottiglia NON è il prodotto: è la domanda/distribuzione.**
> 🔑 **Principio guida:** il prodotto è al servizio dei **primi ordini e della fiducia**, non del gold-plating. Chiudiamo solo i pochi buchi che bloccano il primo ordine. Tutto il resto è già lì o si rimanda. **A Piacenza, fase 0→1, la mossa giusta è spesso NON costruire.**

---

## 1. OBIETTIVO & PRINCIPIO

**Obiettivo del prodotto nei prossimi 60 giorni:** rendere possibile e affidabile il **primo ordine reale end-to-end** (cliente ordina → negozio prepara → consegna → payout), senza incidenti che brucino la fiducia in una città piccola dove una brutta esperienza gira veloce.

**Cosa NON è l'obiettivo:** aggiungere funzioni. Abbiamo già più feature di Glovo. Ogni riga di roadmap deve **sbloccare il prossimo passo del volano** (negozi → ordini → fiducia), non essere "figa".

**Metrica che governa tutto (North Star):** **ordini consegnati / settimana** ([[OKR-Squadra]]). Se una voce di prodotto non muove gli ordini o un KPI di squadra, **non è prioritaria** — finisce nell'anti-roadmap (§7).

➡️ *Prossima azione:* trattare ogni richiesta di "nuova feature" col filtro: *sblocca un ordine o la fiducia entro 60 giorni? Se no → §7.*

---

## 2. STATO ATTUALE (cosa è già fatto)

**Verdetto:** 24/26 feature FATTE. Il prodotto regge un marketplace a 2 lati completo. Sintesi per area:

| Area | Stato | Cosa c'è già nel codice |
|---|---|---|
| **Venditori** | ✅ Completa | Onboarding self-service + KYC, dashboard (ordini, prodotti, incassi, analytics), reputazione/approval |
| **Catalogo** | ✅ Quasi completa | Listing, scheda prodotto + SEO, ricerca FTS italiano + pg_trgm, varianti |
| **Pagamenti** | ✅ Completa | Stripe Connect split, COD, payout post-delivery, resi/rimborsi, dispute |
| **Consegna** | ✅ Backend completo | 8 stati ordine, zone per CAP, slot orari, rider_lat/lng realtime *(manca la vista mappa cliente)* |
| **Fiducia** | ✅ Completa | Recensioni (prodotto/negozio/rider) con foto, KYC, supporto/chat, dispute |
| **Crescita** | ✅ Completa | Referral, coupon/promo, SEO locale pagine negozio, membership/abbonamento |
| **Extra (non in roadmap)** | ✅ Già nel codice | Gift card, wallet+loyalty, recupero carrelli, ordini ricorrenti, B2B/SDI, AI catalog, sponsored listings… |

> ⚠️ Implicazione: parte del lavoro futuro è **nascondere/semplificare** complessità (troppe feature per ~0 ordini), non aggiungerne. → [[Prodotto & UX]].

### I 3 buchi VERI (gli unici dev che contano ora)
1. **🔴 Inventario unitario mancante** — nessun campo `quantity` per SKU: un prodotto è solo `available|sold`. Rischio **overselling** sul fresco (vendi 2 kg di un kg). Tocca direttamente la fiducia al primo ordine.
2. **🟡 Mappa live consegna assente lato cliente** — il DB traccia `rider_lat/lng` in realtime ma nessuna pagina ordine mostra la mappa. **Il dato c'è, manca la vista.**
3. **🟡 Geofencing per raggio assente** — le zone sono CAP+sconto, non "consegno entro N km dal punto". Rilevante per il modello a cluster centro.

**Buchi minori:** niente notifica "payout inviato" al venditore · app rider scheletrica (no storico/rating/offline — problema reale nei sottopassi di Piacenza).

➡️ *Prossima azione:* nessun nuovo sviluppo finché i 3 buchi (in particolare l'inventario) non sono chiusi e il flusso ordine non è verificato end-to-end da qa.

---

## 3. LA ROADMAP PER PRIORITÀ (solo l'essenziale)

Ordinata per **cosa sblocca il primo ordine**, non per quanto è figa. Sforzo: S = piccolo, M = medio.

| Pri | Cosa | Perché | Impatto sui primi ordini | Sforzo | Colore |
|---|---|---|---|---|---|
| **P0** | **Inventario unitario (`quantity` per SKU)** | Evita overselling sul fresco | **Alto** — un overselling al 1° ordine brucia la fiducia | M | 🟡 branch |
| **P0** | **Verifica end-to-end flusso ordine** (carrello→checkout→pagamento→stato→payout→reso) | È il percorso del primo ordine vero | **Alto** — è LA cosa che deve funzionare | S | 🟢 qa |
| **P0** | **Notifica "payout inviato" al venditore** | Fiducia del negozio sull'incasso | **Alto** lato venditore — senza, il negozio dubita di essere pagato | S | 🟡 branch |
| **P1** | **Geofencing per raggio (zona cluster centro)** | Allinea consegna al modello cargo-bike ZTL | **Medio** — evita ordini fuori raggio non consegnabili | M | 🟡 branch |
| **P1** | **Mappa live consegna lato cliente** | "Effetto Glovo", riduce ansia/chiamate | **Medio** — *ma solo DOPO che ci sono ordini da tracciare* | M | 🟡 branch |
| **P2** | **App rider: storico + rating + offline** | Affidabilità rider in centro storico | **Basso ora** (rider = fondatore) | M | ⏸️ rimanda |
| **P2** | **Semplificare/nascondere feature extra** (wallet, B2B, sponsored…) | Ridurre carico cognitivo a 0 ordini | **Medio** sulla conversione | S | 🟢 config |

> Regola di sequenza: **prima l'inventario e la verifica end-to-end**, poi payout-notify, poi geofencing, **la mappa live per ultima** (è una vanity feature finché non ci sono ordini reali da tracciare — vedi anti-pattern in [[Roadmap & Stato Prodotto]]).

➡️ *Prossima azione:* aprire una spec per ciascun P0 in `04-Prodotto-Ops/Funzionalità/` con criteri di accettazione testabili (vedi §5) prima di mettere in coda dev a `tech`/`backend-dev`.

---

## 4. DECISIONI DI PRODOTTO APERTE (trade-off da risolvere)

Da [[Decisioni Aperte]] — quelle che toccano il prodotto **ora**:

| # | Decisione | Raccomandazione attuale | Blocca |
|---|---|---|---|
| 1 | **Inventario: a quantità o a disponibilità?** | **A quantità** per il food fresco (P0). Senza, overselling garantito. | Spec inventario |
| 2 | **Commissioni & fee** (10-15% negozio + ~€2,50 cliente) | Da **congelare** prima di rifinire checkout: il prezzo mostrato dipende dalla fee | [[Carrello e Checkout]] |
| 3 | **Profondità catalogo: SKU condivisi vs listing liberi** | **Listing liberi** (modello eBay): negozi eterogenei, più realistico al lancio | Catalogo/ricerca |
| 4 | **Geografia: raggio del cluster centro** | Definire il **raggio in km** del geofencing prima di costruirlo | Geofencing P1 |
| 5 | **Cold start fiducia** (0 recensioni) | Garanzia MyCity + reso facile + primo ordine concierge (già nel prodotto) | Conversione 1° ordine |
| 6 | **Nome brand** (MyCity vs Bottega Piacenza) | Da decidere prima dell'identità visiva — impatta UI/stampa | Branding (non blocca codice) |

> Le decisioni 1, 2, 4 **bloccano dev**: vanno chiuse questa/prossima settimana o le spec restano monche.

➡️ *Prossima azione:* portare a Nicola le decisioni **1 (inventario), 2 (fee), 4 (raggio)** per la firma — sono le uniche che bloccano il primo ordine.

---

## 5. QUALITÀ & FIDUCIA (cosa deve essere impeccabile prima del live)

In una città piccola, **un solo incidente** (overselling, doppio addebito, dato di un negozio visibile a un altro) costa più di mesi di marketing. Prima del primo ordine reale, questi tre devono essere a prova di bomba:

| Area | Cosa verificare | Handoff |
|---|---|---|
| **Checkout** | No doppio addebito, multi-seller corretto, fee calcolata bene, errore gestito | `qa` (flusso) + `cro` (frizioni) |
| **Pagamenti** | Split Stripe Connect, payout post-delivery, reso/rimborso, webhook firmati | `qa` + `finanza` (quadratura) |
| **RLS / dati** | Ogni negozio vede SOLO i suoi ordini/clienti; KYC e dati cliente protetti | `security` (RLS Supabase) |

**Criteri di accettazione (modello da usare in ogni spec):**
- *Problema → Utente → Criteri testabili → Metrica di successo.*
- Es. inventario: *"Se quantity=0, il prodotto non è acquistabile e non entra nel carrello; un ordine non può portare quantity sotto 0 (test concorrenza). Metrica: 0 overselling su 100 ordini di test."*

➡️ *Prossima azione:* far girare `qa` end-to-end sul flusso ordine + `security` su RLS **prima** di qualunque go-live, e allegare l'esito alla spec.

---

## 6. COME SI LAVORA SUL CODICE

Repo locale `mycity-live` — **sola lettura per il prodotto**. Le modifiche le fa `tech`/`backend-dev`/`frontend-dev`.

**Due corsie:**
- **🟢 CONFIG** (subito, reversibile): colori, banner, home, testi pagina, attivare/nascondere una feature via `cervello/marketplace.mjs`. Niente branch.
- **🟡 CODICE** (branch → anteprima → ok): logica (inventario), layout/componenti, nuove viste (mappa). Mai sul main, mai diretto.

**Regole ferree:**
- Ogni modifica codice in un **branch dedicato** → anteprima → revisione → solo allora si valuta il merge.
- **Mai deploy diretto in produzione (🔴 — solo firma Nicola).**
- ⚠️ **Due sessioni stanno editando `mycity-live` ora:** coordinare via [[SALA-OPERATIVA]], **mai lavorare sullo stesso file in parallelo**. Il prodotto assegna un file a un solo team alla volta.

➡️ *Prossima azione:* prima di accodare l'inventario a dev, dichiarare in Sala quali file tocca (probabile `products` schema + checkout) per evitare collisioni con l'altra sessione.

---

## 7. COSA NON FACCIAMO ORA (anti-roadmap)

Difendere il "no" vale quanto difendere il "sì". **Da rimandare a quando ci saranno ordini reali:**

- ❌ **Mappa live consegna** *prima* di avere ordini → vanity feature (la facciamo P1, non P0).
- ❌ **Raccomandazioni ML personalizzate** → cold start senza dati di traffico = inutile.
- ❌ **Recensioni come priorità** → niente da recensire senza transazioni.
- ❌ **Nuove feature di crescita** (più gift card, più B2B, più sponsored) → ne abbiamo già più di Glovo.
- ❌ **App rider completa** → il rider è il fondatore; basta lo scheletro.
- ❌ **Qualsiasi feature "perché ce l'ha il concorrente"** → si costruisce per sbloccare un ordine, non per parità.

> Il lavoro di prodotto più prezioso questo trimestre è **togliere**, non aggiungere: nascondere le feature extra che confondono a 0 ordini (§3, P2).

➡️ *Prossima azione:* censire in [[Prodotto & UX]] le feature extra da nascondere via CONFIG (🟢) e proporre la lista a Nicola.

---

## 8. REGOLE 🟢🟡🔴

- 🟢 **Da solo:** leggere codice/vault, scrivere spec e requisiti, dare priorità motivata (impatto × sforzo), aggiornare la roadmap, dire "questa non si fa ora", modifiche CONFIG reversibili.
- 🟡 **Fai e avvisa:** spec che entra in coda dev, riordino roadmap che sposta un team, **modifiche codice solo in branch + anteprima** (mai sul main). Avvisi l'AD + il team toccato.
- 🔴 **Serve firma di Nicola:** **qualsiasi deploy/push in produzione**, rimuovere/deprecare una feature viva, cambiare scope di un impegno con venditori/clienti, spese, cambiare prezzi/commissioni.

> Nel dubbio, sali di colore. Mai sorprese: prima mostri cosa faresti, poi esegui.

---

## ✅ LE 5 AZIONI DI QUESTA SETTIMANA (chiudere i buchi che bloccano il primo ordine)

1. **Spec inventario unitario** (P0) in `Funzionalità/` — problema/utente/criteri testabili/metrica (0 overselling). Decisione 1 a Nicola per firma.
2. **Congelare fee & commissioni** (Decisione 2) con `finanza` — il checkout non si rifinisce senza il numero.
3. **Verifica end-to-end del flusso ordine** → handoff a `qa` (carrello→payout→reso) + `security` su RLS. Esito allegato alla roadmap.
4. **Spec "notifica payout inviato"** (P0 venditore) — piccola, alta fiducia lato negozio. In coda a `backend-dev` in branch.
5. **Definire il raggio del geofencing** (Decisione 4) con `operations`/`dispatch`, poi spec P1. Lista feature extra da nascondere (CONFIG 🟢) per Nicola.

---

📌 **Sintesi per l'AD:** prodotto al 90%, il collo di bottiglia è la domanda — quindi roadmap sobria. Tre dev contano: **inventario unitario (P0, blocca la fiducia al 1° ordine)**, **verifica end-to-end** e **payout-notify**. Mappa live e geofencing dopo. Tutto il resto è anti-roadmap. Servono a Nicola 3 firme (inventario, fee, raggio) e il via per accodare i dev in branch.

#prodotto #roadmap #piano #priorità/alta #stato-reale
