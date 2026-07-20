---
tipo: azioni-pronte-recupero-carrelli
reparto: crm-lifecycle
data: 2026-07-20 11:19
fonte: Supabase REST live (`verifica-sensori.mjs` 11:18 `supabase_rest=ok`) · `abandoned_carts` + `profiles` + `coupons` + `orders`
stato: DRY-RUN — bozze pronte, NESSUN INVIO
voce: Vicino Orgoglioso (FLUSSI-LIFECYCLE §6)
riferimento: playbook `consegne/crm/2026-07-01-playbook-recupero-carrelli.md`
---

# Recupero carrelli — pacchetto pronto (20/7 11:19 · playbook worker)

> **Verifica live 2026-07-20 11:19.** REST marketplace leggibile (`supabase_rest=ok`).
> `abandoned_carts`: **4 record** (invariati vs 19/7). `profiles`: **23** totali · **4 buyer** · solo **1** con carrello fermo.
> Tutti e 4 hanno `recovery_email_sent_at` valorizzato (giugno) → cron automatico **non partirebbe** (0 righe con flag null).
> Queste sono bozze **manuali one-off** (re-touch), da firmare. **Zero invii.**

## Situazione reale (con fonte)

| Metrica | Valore | Fonte |
|---|---|---|
| Record `abandoned_carts` | **4** | REST 20/7 11:19 |
| Carrelli recuperabili reali | **1** | unico `role=buyer` non-seed (samir) |
| Altri 3 record | admin / seller-auto-test / seed Casa Linda | **SKIP** |
| Profili totali | **23** | `profiles` REST 20/7 |
| Buyer registrati | **4** | `profiles?role=buyer` |
| Ordini nel DB | **1** (unico, `delivery_status=CANCELED` 24/6) | `orders` REST 20/7 |
| Ordini `DELIVERED` | **0** | `orders` REST 20/7 |
| Consenso marketing buyer samir | `email_marketing = false` | `profiles` |
| Coupon attivi | `BENVENUTO10` (10%, primo ordine) · `SPED5` (€5 sopra €25) | `coupons` REST 20/7 |

## Classificazione (20/7 11:19)

| # | user_id | Nome | Ruolo | Totale | Fermo da | Inviabile? |
|---|---------|------|-------|--------|----------|------------|
| 1 | `57494b3e-fd67-4379-8b9c-90e40e39ff06` | samir? | buyer | **€10,00** | **~803h (16/6, ~33 giorni)** | ✅ **SÌ** — unico cliente reale |
| 2 | `33333333-3333-3333-3333-aaaaaaaa0001` | Assistenza MyCity | admin | €7,95 | ~424h (2/7) | ⏭️ SKIP — admin test |
| 3 | `11111111-1111-1111-1111-cccccccc0001` | Casa Linda | seller | €17,80 | ~786h (17/6) | ⏭️ SKIP — seed demo |
| 4 | `c0b240c0-2a86-4218-9d0f-5154f08ff929` | Pane Quotidiano | seller | €13,90 | ~805h (16/6) | ⏭️ SKIP — auto-test negoziante |

**Altri 3 buyer senza carrello abbandonato:** nessuna bozza da accodare oggi.

---

## Gate operativo

**Gate: CHIUSO.** L'email va spedita SOLO dopo che PQ evade (ordine-test `#ordine-test-pq` o primo ordine reale chiuso).

| Check gate | Stato |
|---|---|
| PQ evadibile | ❌ 0 consegne completate |
| Ordini `DELIVERED` | **0** | REST 20/7 |
| Ordine-test PQ | ⏳ in coda `#ordine-test-pq` |
| Passo successivo | Nicola completa ordine-test → PQ evade → gate si apre |

---

## Cliente #1 — samir · Pane Quotidiano · €10,00

**Carrello (fermo dal 16/6, verificato live):**
- 1× Pesto Genovese Bio — €5,00
- 1× Kefir di latte di capra biologico — €2,95
- 1× Berchtesgadener Land kefir biologico 400g parzialmente scremato — €2,05
- **Totale prodotti: €10,00** (+ consegna)

**Blocchi tecnici:**
1. Email di samir: visibile solo da `/admin/users` (REST non legge `auth.users`)
2. `email_marketing = false` → ok @legale-privacy per invio **transazionale** (è il suo carrello)
3. Mani Resend: API ok (`verifica-sensori` 11:18) ma invio reale resta 🔴 firma Nicola

---

### Touch #1 — reminder (senza sconto) · 🟡 · PRONTA

**Oggetto:** Hai lasciato qualcosa da Pane Quotidiano

**Corpo:**

> Ciao,
>
> più di un mese fa hai messo nel carrello tre prodotti bio da **Pane Quotidiano** — pesto e kefir — e non hai concluso l'ordine.
>
> **Il carrello è ancora lì:**
> • 1× Pesto Genovese Bio — €5,00
> • 1× Kefir di latte di capra biologico — €2,95
> • 1× Berchtesgadener Land kefir biologico 400g — €2,05
> **Totale: €10,00** (+ consegna a domicilio)
>
> Se ci sono stati dubbi sulla consegna o sul pagamento, puoi rispondere a questa mail: te lo chiarisco in due righe.
>
> Altrimenti, ci vuole un click:
>
> 👉 [Completa il tuo ordine](https://mycity-marketplace.com/cart)
>
> A presto,
> Nicola — MyCity
> *Il marketplace delle botteghe di Piacenza*
>
> *MyCity, Piacenza · [Disiscriviti](https://mycity-marketplace.com/unsubscribe)*

**Codice:** nessuno (touch #1 — informativo, consenso-safe)

---

### Touch #2 — con codice BENVENUTO10 (solo se #1 non converte in 24h) · 🔴

**Oggetto:** C'è ancora €1 di sconto sul tuo carrello

**Corpo:**

> Ciao,
>
> il carrello da **Pane Quotidiano** è ancora qui — pesto e kefir bio, **€10,00** di prodotti.
>
> Per darti una mano usa il codice **`BENVENUTO10`** al checkout: **10% sul primo ordine**, circa €1 in meno su questa spesa.
>
> 👉 [Ordina con BENVENUTO10](https://mycity-marketplace.com/cart)
>
> Se hai cambiato idea, nessun problema — il carrello si svuota da solo quando vuoi.
>
> Nicola — MyCity
>
> *MyCity, Piacenza · [Disiscriviti](https://mycity-marketplace.com/unsubscribe)*

**Codice:** `BENVENUTO10` · `first_order_only=true` · costo max ~€1 · 🔴 incentivo reale

---

## Account #2–4 — SKIP (nessuna bozza accodata)

| Account | Motivo |
|---|---|
| Assistenza MyCity | Admin piattaforma |
| Casa Linda | Seed demo |
| Pane Quotidiano (seller) | Auto-test negoziante |

---

## Dove vivono le bozze

| Destinazione | Contenuto |
|---|---|
| [[AZIONI-PRONTE]] **A3** | Touch #1 🟡 + Touch #2 🔴 (agg. 20/7 11:19) |
| Questo file | Dossier completo con fonti live |

## Cosa serve prima dell'invio reale

| # | Cosa | Chi | Colore |
|---|---|---|---|
| 1 | Gate: ordine-test PQ completato (`#ordine-test-pq`) | Nicola | 🟡 |
| 2 | Ok invio transazionale (`email_marketing=false`) | @legale-privacy | 🟡 |
| 3 | Recupera email samir da `/admin/users` | Nicola | 🟡 |
| 4 | Firma Touch #1 (invio) | Nicola | 🟡 |
| 5 | Firma Touch #2 con `BENVENUTO10` | Nicola | 🔴 |
