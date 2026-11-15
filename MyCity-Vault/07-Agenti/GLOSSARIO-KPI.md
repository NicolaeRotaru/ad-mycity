---
tipo: glossario
fonte: AD digitale (abilita il vettore "coerenza cross-funzionale")
stato: seed v1 2026-06-27 · definizioni DA CONFERMARE con Nicola + dati reali (lunedì)
---

# 📖 GLOSSARIO KPI — una sola verità tra 40 reparti

> **Perché esiste.** Il fallimento tipico della scala: 40 senior ottimi che dicono cose **incoerenti**
> ("cliente attivo" = 3 definizioni diverse tra analista, finanza e marketing). Questo file è la
> **single-source-of-truth** dei termini e dei numeri: tutti usano queste definizioni, identiche. Se un
> reparto ne ha bisogno di una nuova, la propone qui — non se la inventa.
>
> ⚠️ **Stato seed:** le soglie qui sotto sono **proposte di partenza**, da **confermare con Nicola e coi
> dati reali**. Dove c'è `[?]`, il valore è da decidere. Non usarle come verità finché non sono confermate.

## Regola d'uso (vincolante per tutti i senior)
1. Un dato/termine ha **una** definizione: questa. Gli altri documenti **linkano**, non ridefiniscono.
2. Se due reparti portano numeri diversi sullo stesso KPI → **riconciliazione QUI prima** di portarli a Nicola.
3. Chi cita un numero dichiara **fonte + periodo + confronto** (regola della RUBRICA-QUALITA).

---
## Termini chiave (da confermare)
| Termine | Definizione proposta | Stato |
|---|---|---|
| **Cliente attivo** | ha fatto ≥1 ordine negli ultimi **[60?]** giorni | `[?]` da confermare |
| **Cliente dormiente** | aveva ordinato, nessun ordine da **[90?]** giorni | `[?]` |
| **Negozio attivo (live)** | vetrina pubblica + catalogo + payout configurato + ≥1 prodotto ordinabile | da confermare |
| **Negozio in calo** | ordini ultimi 30g < **[50%?]** della sua media 90g | `[?]` |
| **Carrello abbandonato** | carrello creato, nessun checkout entro **[24h?]** | `[?]` |
| **Primo ordine** | primo checkout completato e pagato di un cliente | ok |
| **Iscritto lista d'attesa** | email/contatto raccolto pre-lancio (≠ cliente) | ok |

## KPI principali (da confermare)
| KPI | Formula proposta | Owner | Stato |
|---|---|---|---|
| **GMV** | somma valore ordini completati nel periodo | finanza | da confermare |
| **Ricavo MyCity** | commissioni + fee sugli ordini completati | finanza | da confermare |
| **AOV (scontrino medio)** | GMV / n. ordini completati | analista | ok |
| **Tasso di conversione** | ordini / sessioni (stessa fonte: `[PostHog?]`) | analista/cro | `[?]` fonte |
| **CAC** | spesa acquisizione / nuovi clienti del periodo | growth/finanza | da confermare |
| **Retention 30g** | % clienti che riordinano entro 30g dal 1° ordine | analista/crm | da confermare |
| **Reach / Salvataggi / Iscritti** | metriche native per pezzo (UTM per attribuire) | content-social | ok |

---
## Come si aggiorna
Append-only per le nuove voci; per cambiare una definizione esistente serve l'**ok di Nicola** (cambia i
numeri di tutti). Quando arrivano i dati reali (lunedì), si confermano le soglie `[?]` e si toglie "seed".
Owner del glossario: **@analista** + **@finanza**, presidiato dall'**AD** nelle cadenze.

---

## 🔎 VERITÀ OPERATIVA OGGI — cosa calcola DAVVERO il codice
> Appendice 2026-06-27 (Ondata 0.1). Sopra ci sono le definizioni **proposte**; qui le formule
> **realmente in vigore** nel Pannello (`pannello/src/lib/marketplace-db.ts` → `getMetriche()`),
> negli alert (`/api/alert`) e nelle sentinelle (`lib/sentinelle.ts`). Questa è la fotografia da cui
> partire per confermare le soglie. **Dove proposta ≠ codice, vince la riconciliazione con Nicola (sotto).**

| KPI operativo | Formula esatta nel codice | Popolazione |
|---|---|---|
| **ordini** (oggi/7g/30g) | `orders` con `payment_status != 'FAILED'` e `created_at` nella finestra | non-falliti (include PENDING) |
| **incasso / GMV** (oggi/7g/30g) | somma `total_price` su `orders` con `payment_status == 'PAID'` nella finestra | solo PAID |
| **scontrino medio (AOV)** | media `total_price` sugli ordini **PAID** nella finestra | solo PAID |
| **nuovi clienti** | `profiles` con `role=buyer` e `created_at` nella finestra | — |
| **clienti attivi** (oggi/7g/30g) | `user_id` distinti con ≥1 ordine nella finestra | finestre 7g/30g |
| **clienti dormienti** | clienti il cui **ultimo** ordine è **> 30 giorni** fa | soglia 30g nel codice |
| **carrelli** (abbandonati) | `abandoned_carts` con `recovered != true` | **nessuna** soglia temporale |
| **negozi** | `profiles` con `role=seller` (tutti i registrati) | non solo i "live" |
| **consegne in corso** | ordini non-FAILED con `delivery_status` ∉ {DELIVERED, CANCELED} | — |
| **tempo consegna (min)** | media `(delivered_at − created_at)` sugli ordini consegnati | — |
| **problemi** | ordini con `delivery_status == 'CANCELED'` | — |
| **recensione media** | media `rating` su `store_reviews` con rating>0 | — |
| **conversione** | `ordini_7g / visitatori_7g` (PostHog) × 100 | finestra 7g, *visitatori* |

**Soglie d'allarme realmente attive** (alert + sentinelle): problemi `>0` 🔴 · recensione `<3.5` 🔴 ·
ordini oggi `==0` 🟡 · carrelli `≥3` 🟡 · clienti dormienti `≥5` 🟡 · tempo consegna `>90 min` 🟡 · negozi `<3` 🟡.

### ➕ Numeri che il codice consegna e qui mancavano — aggiunti il 2026-11-15 04:18, da confermare da Nicola
> Nati con la scheda AR-962. Il codice consegnava questi numeri a Nicola senza una riga qui: la
> definizione è presa dal codice che li calcola (file → funzione), **non è una decisione**. Il registro
> che dice quali numeri sono KPI è `cervello/kpi-registro.json`; il controllo che lo tiene allineato a
> questo file è `cervello/glossario-kpi-check.mjs`, e gira a ogni giro.

| KPI operativo | Formula esatta nel codice (file → funzione) | Popolazione | Stato |
|---|---|---|---|
| **clienti totali** | `profiles` con `role=buyer`, tutti (`marketplace-db.ts` → `getMetriche`, campo `clienti`) | anche chi non ha mai ordinato | aggiunta il 2026-11-15, da confermare da Nicola |
| **carrelli abbandonati per finestra** (oggi/7g/30g) | `abandoned_carts` con `recovered != true` e `last_activity` nella finestra (`marketplace-db.ts` → `getMetriche`) | se la lettura fallisce il numero non esce: casella «—» | aggiunta il 2026-11-15, da confermare da Nicola |
| **carrelli recuperati** (oggi/7g/30g) | `abandoned_carts` con `recovered == true` e `recovered_at` nella finestra (`marketplace-db.ts` → `getMetriche`) | senza la colonna `recovered_at` (migrazione 148 del sito) il numero non esce | aggiunta il 2026-11-15, da confermare da Nicola |
| **nuovi negozi** (oggi/7g/30g) | `profiles` con `role=seller` e `created_at` nella finestra (`marketplace-db.ts` → `getMetriche`) | i registrati, non solo i live | aggiunta il 2026-11-15, da confermare da Nicola |
| **consegne completate** (oggi/7g/30g) | ordini con `delivered_at` nella finestra (`marketplace-db.ts` → `getMetriche`) | qualunque `payment_status` | aggiunta il 2026-11-15, da confermare da Nicola |
| **ordini annullati** (oggi/7g/30g) | ordini con `delivery_status == 'CANCELED'` e `created_at` nella finestra (`marketplace-db.ts` → `getMetriche`) | qualunque `payment_status` | aggiunta il 2026-11-15, da confermare da Nicola |
| **recensioni totali** | numero di `store_reviews` con `rating > 0` (`marketplace-db.ts` → `getMetriche`) | solo le recensioni con un voto | aggiunta il 2026-11-15, da confermare da Nicola |
| **visite sito (7g)** | eventi `$pageview` degli ultimi 7 giorni su PostHog (`posthog.ts` → `getPostHog`) | visite, non visitatori unici | aggiunta il 2026-11-15, da confermare da Nicola |
| **tasso di riordino** | % dei clienti con almeno un ordine PAID che ne hanno almeno due, su tutto lo storico (`marketplace-db.ts` → `getRetention`, campo `repeat_rate`) | solo PAID; diverso dalla «Retention 30g» proposta sopra: qui non c'è la finestra di 30 giorni (D10) | aggiunta il 2026-11-15, da confermare da Nicola |
| **valore cliente (LTV)** | spesa totale sugli ordini PAID diviso i clienti paganti, su tutto lo storico (`marketplace-db.ts` → `getRetention`, campo `ltv_medio`) | solo PAID | aggiunta il 2026-11-15, da confermare da Nicola |
| **ordini per cliente** | ordini PAID diviso i clienti paganti (`marketplace-db.ts` → `getRetention`) | solo PAID | aggiunta il 2026-11-15, da confermare da Nicola |
| **giorni fra 1° e 2° ordine** | media dei giorni fra il primo e il secondo ordine PAID, solo per chi ha riordinato, arrotondata al giorno (`marketplace-db.ts` → `getRetention`) | solo chi ha almeno due ordini PAID | aggiunta il 2026-11-15, da confermare da Nicola |
| **clienti paganti** | clienti distinti con almeno un ordine PAID, su tutto lo storico (`marketplace-db.ts` → `getRetention`) | solo PAID | aggiunta il 2026-11-15, da confermare da Nicola |
| **salute dei negozi** (rossi / gialli / totale) | per ogni venditore: rosso = mai un ordine non fallito, o fermo da 14 giorni o più; giallo = ordini degli ultimi 30 giorni giù del 40% o più rispetto ai 30 prima, o recensione media sotto 3,5; totale = tutti i venditori (`marketplace-db.ts` → `getHealthNegozi`) | tutti i `role=seller`; diverso da «Negozio in calo» proposto sopra (50% sulla media di 90 giorni) | aggiunta il 2026-11-15, da confermare da Nicola |
| **catalogo** (prodotti / mai venduti / esauriti / categorie) | prodotti in `products`; mai venduti = nessuna quantità in `order_items` di ordini PAID; esauriti = `stock == 0`; categorie = quelle con almeno un prodotto (`marketplace-db.ts` → `getCatalogo`) | tutti i prodotti, senza filtro su `status` | aggiunta il 2026-11-15, da confermare da Nicola |
| **payout ai negozi** (completati / in attesa / falliti, in numero e in €) | ordini con un payout dovuto (PAID, o contanti incassati, o payout già tracciato); fallito se `payout_status` dice fail, error, revers, cancel o declin; completato se c'è `payout_at` o lo stato dice paid, complete, transfer, success o settled; altrimenti in attesa; gli euro sono `seller_payout_cents` / 100 (`marketplace-db.ts` → `getRiconciliazionePayout`) | storico | aggiunta il 2026-11-15, da confermare da Nicola |
| **rimborsi** (numero / €) | ordini con `refunded_amount_cents > 0`, e la loro somma in euro (`marketplace-db.ts` → `getRiconciliazionePayout`) | storico | aggiunta il 2026-11-15, da confermare da Nicola |
| **nuovi clienti (acquisizione)** | `profiles` con `role=buyer` creati negli ultimi 30 giorni (`marketplace-db.ts` → `getAcquisizione`, campo `nuovi_clienti_30g_acq`) | stessa formula di «nuovi clienti» a 30 giorni, calcolata una seconda volta da un'altra funzione | aggiunta il 2026-11-15, da confermare da Nicola |
| **inviti (referral)** (30g / totali / quota %) | clienti con `referred_by` valorizzato: fra i nuovi degli ultimi 30 giorni, fra tutti, e la loro quota % su tutti i clienti (`marketplace-db.ts` → `getAcquisizione`) | `role=buyer` | aggiunta il 2026-11-15, da confermare da Nicola |
| **ricavo commissioni (30g)** | somma di `application_fee_cents` / 100 sugli ordini PAID degli ultimi 30 giorni (`marketplace-db.ts` → `getMargineReale`) | solo la commissione, la fee di consegna resta fuori: diverso dal «Ricavo MyCity» proposto sopra (commissioni + fee) | aggiunta il 2026-11-15, da confermare da Nicola |
| **margine per ordine** (commissione media / fee consegna media / margine di contribuzione) | commissione media e fee di consegna media sugli ordini PAID degli ultimi 30 giorni; margine = commissione media + fee media − costo di consegna (`marketplace-db.ts` → `getMargineReale`) | nel cruscotto il costo di consegna vale 0 (D9) | aggiunta il 2026-11-15, da confermare da Nicola |
| **picco degli ordini** (ora / giorno) | l'ora (da 0 a 23) e il giorno della settimana (0 = lunedì, 6 = domenica) con più ordini non falliti, nel fuso di Piacenza (`marketplace-db.ts` → `getPatternOrari`) | non falliti, storico | aggiunta il 2026-11-15, da confermare da Nicola |
| **cassa (Pannello)** | il valore scritto a mano nelle impostazioni del Pannello (`cassa_attuale`), arrotondato al centesimo (`economia.ts` → `calcolaRunway`) | una dichiarazione, non una misura (D8) | aggiunta il 2026-11-15, da confermare da Nicola |
| **burn mensile (Pannello)** (lordo / netto) | lordo = costi fissi mensili scritti nelle impostazioni (`burn_mensile`); netto = lordo − ricavo commissioni degli ultimi 30 giorni (`economia.ts` → `calcolaRunway`) | una dichiarazione meno una misura | aggiunta il 2026-11-15, da confermare da Nicola |
| **runway (Pannello)** | cassa (Pannello) diviso burn netto, in mesi con un decimale; vuoto se il burn netto è zero o negativo (`economia.ts` → `calcolaRunway`) | due formule di runway (D8) | aggiunta il 2026-11-15, da confermare da Nicola |
| **break-even (ordini al mese)** | costi fissi diviso il margine di contribuzione per ordine, arrotondato in su; margine = scontrino medio × commissione % + fee cliente − costo di consegna (`economia.ts` → `calcolaUnitEconomics`) | vuoto se costi fissi o margine sono zero o negativi | aggiunta il 2026-11-15, da confermare da Nicola |
| **cassa disponibile (sensore del giro)** | banca (dichiarata da Nicola, `CASSA_BANCA_EUR`) + saldo Stripe (available + pending) − payout dovuti ai negozi (`PAYOUT_DOVUTI_EUR`) (`cervello/sensore-cassa.mjs` → `componentiCassa`) | è la formula di AR-282; due formule di cassa (D8) | aggiunta il 2026-11-15, da confermare da Nicola |
| **burn mensile (sensore del giro)** | il burn mensile dichiarato da Nicola (`BURN_MENSILE_EUR`), usato da `statoCassa` (`cervello/sensore-cassa.mjs`) | una dichiarazione, non una misura | aggiunta il 2026-11-15, da confermare da Nicola |
| **runway (sensore del giro)** | cassa disponibile (sensore) diviso burn mensile (sensore), in mesi con un decimale; lo stato è «parziale», mai «critico», se manca una componente della cassa (`cervello/sensore-cassa.mjs` → `statoCassa`) | due formule di runway (D8) | aggiunta il 2026-11-15, da confermare da Nicola |

## ⚠️ DIVERGENZE da riconciliare (proposta ↔ codice) — servono a Nicola
| # | Termine | Proposta nel glossario | Cosa fa il codice OGGI | Da decidere |
|---|---|---|---|---|
| D1 | **Cliente dormiente** | nessun ordine da **90g** | nessun ordine da **30g** | quale soglia è "dormiente"? (90 vs 30) |
| D2 | **Cliente attivo** | ≥1 ordine in **60g** | finestre **7g/30g** (non 60) | scegliere la finestra ufficiale |
| D3 | **Carrello abbandonato** | nessun checkout in **24h** (sentinella: **4h**) | **tutti** i non-recuperati, **senza tempo** | fissare la soglia oraria unica |
| D4 | **Negozio attivo (live)** | vetrina+catalogo+payout+1 prodotto | **qualsiasi** `role=seller` registrato | il Pannello deve contare i *live*, non i registrati? |
| D5 | **GMV / "ordine completato"** | "ordini completati" | 3 popolazioni diverse: *ordine*=non-failed, *incasso*=PAID, *consegna*=delivered_at | definire cosa = "completato" (pagato? consegnato?) |
| D6 | **Conversione** | ordini / **sessioni** | ordini / **visitatori** (PostHog), finestra 7g | sessioni vs visitatori: una sola base |
| D7 | **Recensione bassa** | non definita | soglia **<3.5** attiva negli alert | ufficializzare la soglia di reputazione |
| D8 | **Cassa e runway** | non definite | due formule: il Pannello divide la cassa scritta a mano per il burn al netto delle commissioni; il sensore del giro divide banca + Stripe − payout dovuti per il burn dichiarato | quale delle due è «il» runway? (aggiunta il 2026-11-15, scheda AR-1176) |
| D9 | **Margine per ordine** | non definito | il cruscotto lo calcola con costo di consegna 0, la pagina dei conti per ordine col costo vero: due numeri diversi con lo stesso nome | il cruscotto deve togliere il costo di consegna? (aggiunta il 2026-11-15, scheda AR-1177) |
| D10 | **Retention / riordino** | riordino entro **30g** dal primo ordine | `repeat_rate`: riordino in qualunque momento | quale finestra è quella ufficiale? (aggiunta il 2026-11-15) |

> Ondata 0.1 — fatto: documentata la verità operativa e le 7 divergenze. Prossimo passo (con Nicola):
> confermare D1-D7; poi allineo codice e glossario in modo che un termine = una formula ovunque (🟡 tocca il codice del Pannello).
