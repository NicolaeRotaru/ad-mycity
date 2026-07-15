---
tipo: azioni-pronte-recupero-carrelli
reparto: crm-lifecycle
data: 2026-07-15 11:08
fonte: Supabase REST live (`abandoned_carts` + `profiles` + `coupons`) · `verifica-sensori.mjs` 11:08 (`supabase_rest=ok`)
stato: DRY-RUN — bozze pronte, NESSUN INVIO
voce: Vicino Orgoglioso (FLUSSI-LIFECYCLE §6)
riferimento: playbook `consegne/crm/2026-07-01-playbook-recupero-carrelli.md`
---

# Recupero carrelli — pacchetto pronto (15/7 11:08 · playbook worker)

> **Verifica live 2026-07-15 11:08.** REST marketplace leggibile (`supabase_rest=ok`, `verifica-sensori.mjs` 11:08).
> `abandoned_carts`: **4 record** (invariati vs 14/7). `ordini_tot=1` (unico ordine CANCELED 3/7, user `9262fa38…`).
> Tutti e 4 hanno `recovery_email_sent_at` valorizzato (giugno) → cron automatico **non partirebbe**.
> Queste sono bozze **manuali one-off** (re-touch), da firmare.

## Situazione reale (con fonte)

| Metrica | Valore | Fonte |
|---|---|---|
| Record `abandoned_carts` | **4** | REST 15/7 11:08 |
| Carrelli recuperabili reali | **1** | unico `role=buyer` non-seed |
| Altri 3 record | admin / seller-auto-test / seed Casa Linda | **SKIP** |
| Consenso marketing buyer | `email_marketing = false` | `profiles` |
| Coupon attivi | `BENVENUTO10` (10%, primo ordine) · `SPED5` (€5 sopra €25) | `coupons` REST 15/7 11:08 |

## Classificazione (15/7 11:08)

| # | user_id | Nome | Ruolo | Totale | Fermo da | Inviabile? |
|---|---------|------|-------|--------|----------|------------|
| 1 | `57494b3e-fd67-4379-8b9c-90e40e39ff06` | samir? | buyer | **€10,00** | ~683h (16/6) | **SÌ** — unico cliente reale |
| 2 | `33333333-3333-3333-3333-aaaaaaaa0001` | Assistenza MyCity | admin | €7,95 | ~304h (2/7) | SKIP — admin test |
| 3 | `11111111-1111-1111-1111-cccccccc0001` | Casa Linda | seller | €17,80 | ~666h (17/6) | SKIP — seed demo |
| 4 | `c0b240c0-2a86-4218-9d0f-5154f08ff929` | Pane Quotidiano | seller | €13,90 | ~685h (16/6) | SKIP — auto-test negoziante |

---

## Cliente #1 — samir · Pane Quotidiano · €10,00

**Carrello (fermo dal 16/6, verificato live):**
- 1× Pesto Genovese Bio — €5,00
- 1× Kefir di latte di capra biologico — €2,95
- 1× Berchtesgadener Land kefir biologico 400g parzialmente scremato — €2,05
- **Totale prodotti: €10,00** (+ consegna)

**Gate invio (decisione AD 6/7, ancora valido):** parte quando Pane Quotidiano torna **evadibile**
(ordine-prova chiuso: accetta → consegna → payout-test). Non spingere samir verso una 2ª delusione
mentre PQ non evade.

**Blocchi reali:** ① email solo da `/admin/users` (anon non legge auth.users); ② `email_marketing=false`
→ ok @legale-privacy (transazionale vs marketing); ③ mani Resend spente.

### Touch #1 — reminder consenso-safe (senza sconto) · 🟡

**Oggetto:** Hai lasciato qualcosa da Pane Quotidiano 🛒

**Corpo:**
> Ciao,
>
> hai messo nel carrello da **Pane Quotidiano** tre prodotti bio — pesto e kefir — e poi ti sei distratto. Capita. 😊
>
> **Sono ancora lì:**
> • 1× Pesto Genovese Bio — €5,00
> • 1× Kefir di latte di capra biologico — €2,95
> • 1× Berchtesgadener Land kefir biologico 400g parzialmente scremato — €2,05
> **Totale prodotti: €10,00** (+ consegna a domicilio)
>
> Te li portiamo a mano nel quartiere, e paghi alla consegna se preferisci.
>
> 👉 [Completa il tuo ordine](https://mycity-marketplace.com/cart)
>
> Se qualcosa ti ha bloccato (consegna, pagamento, orari), **rispondi a questa mail**: ti aiuto io.
>
> A presto,
> Nicola — MyCity
> *Il marketplace delle botteghe di Piacenza*
>
> *MyCity, Piacenza · [Disiscriviti]*

**Codice:** *nessuno*

### Touch #2 — con codice (solo se #1 non converte entro 24h) · 🔴

**Oggetto:** Ti tengo €1 di sconto sul carrello 🧡

**Corpo:**
> Ciao,
>
> il carrello da **Pane Quotidiano** è ancora qui — pesto e kefir bio, **€10,00** di prodotti.
>
> Per darti una mano: usa il codice **`BENVENUTO10`** al checkout (**10% sul primo ordine**, ~€1 in meno su questa spesa).
>
> 👉 [Completa l'ordine con BENVENUTO10](https://mycity-marketplace.com/cart)
>
> Se hai cambiato idea nessun problema — il carrello si svuota da solo. Ma se la spesa la volevi davvero, è a un clic.
>
> Nicola — MyCity
>
> *MyCity, Piacenza · [Disiscriviti]*

**Codice:** `BENVENUTO10` (`coupons` · `first_order_only=true` · costo max ~€1 · 🔴 incentivo reale)

---

## Account #2–4 — SKIP (non accodati per invio)

| Account | Motivo skip |
|---|---|
| Assistenza MyCity | Admin piattaforma |
| Casa Linda | Negozio demo seed |
| Pane Quotidiano (seller) | Auto-test del negoziante |

## Dove vivono le bozze

- **Dettaglio operativo:** [[AZIONI-PRONTE]] blocco **A3** (oggetto + corpo + codice per samir)
- **Coda canonica:** per invio reale serve nuova card 🔴 in [[AZIONI-IN-ATTESA]] (non duplicata qui, AR-008)

## Cosa serve da Nicola

1. **🟡 ok @legale-privacy** sul consenso transazionale (`email_marketing=false`)
2. **🟡 recupero email** samir da `/admin/users`
3. **🔴 ok Touch #2** con `BENVENUTO10` (solo se #1 non converte)
4. **🟡 mani Resend** (→ @builder-automazioni)
5. **Gate operativo:** PQ evadibile prima di inviare (Venerdì Piacentini 17/7)
