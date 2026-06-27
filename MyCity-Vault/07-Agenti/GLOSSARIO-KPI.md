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

> Ondata 0.1 — fatto: documentata la verità operativa e le 7 divergenze. Prossimo passo (con Nicola):
> confermare D1-D7; poi allineo codice e glossario in modo che un termine = una formula ovunque (🟡 tocca il codice del Pannello).
