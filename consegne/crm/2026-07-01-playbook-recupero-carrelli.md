---
tipo: playbook-recupero-carrelli
reparto: crm-lifecycle
data: 2026-07-01 12:00
fonte: Supabase REST `clmpyfvpvfjgeviworth` · `user_carts` + `abandoned_carts` + `profiles`
stato: DRY-RUN — nessun invio
voce: Vicino Orgoglioso (FLUSSI-LIFECYCLE §6)
---

# 🛒 Playbook Recupero carrelli — 2026-07-01 12:00

## Snapshot live

| Metrica | Valore | Fonte |
|---------|--------|-------|
| Carrelli con items >4h | **6** totali · **4** operativi (esclusi 2 demo Verde Casa) | `user_carts` REST 1/7 12:00 |
| RPC `list_abandoned_carts_to_recover(4)` | **0 righe** | tutti i record in `abandoned_carts` hanno già `recovery_email_sent_at` valorizzato (giugno) |
| Buyer reali con carrello fermo | **1** | `57494b3e…` (role=buyer, non seed) |
| Codici coupon attivi in DB | **BENVENUTO10** (10% primo ordine) · **SPED5** (€5 sopra €25) | tabella `coupons` |

> **Nota RPC:** il cron automatico oggi non selezionerebbe nessun carrello perché il flag `recovery_email_sent_at` è già settato su tutti e 4 i record `abandoned_carts`. Le bozze qui sotto sono **re-touch manuali** su carrelli ancora pieni in `user_carts`.

## Classificazione carrelli (>4h, esclusi Verde Casa demo)

| # | user_id | Nome profilo | Ruolo | Negozio | Totale | Fermo da | Inviabile? |
|---|---------|--------------|-------|---------|--------|----------|------------|
| 1 | `57494b3e-fd67-4379-8b9c-90e40e39ff06` | samir? | buyer | Pane Quotidiano | **€10,00** | ~348h (16/6) | ✅ **SÌ** — unico cliente reale |
| 2 | `33333333-3333-3333-3333-aaaaaaaa0001` | Assistenza MyCity | admin | Pane Quotidiano | €7,95 | ~169h (24/6) | ⏭️ SKIP — account admin test (`admin@piacenza-demo.local`) |
| 3 | `11111111-1111-1111-1111-cccccccc0001` | Casa Linda | seller | Pane Quotidiano | €17,80 | ~331h (17/6) | ⏭️ SKIP — seed demo (`casa.linda@piacenza-demo.local`) |
| 4 | `c0b240c0-2a86-4218-9d0f-5154f08ff929` | Pane Quotidiano | seller | Pane Quotidiano | €13,90 | ~350h (16/6) | ⏭️ SKIP — auto-test del negoziante |

**Esclusi dal conteggio analista (2):** carrelli Verde Casa demo (`22222222…` rider, `11111111…0002` Frutteto Verde) — seed `@piacenza-demo.local`.

---

## Cliente #1 — samir? · Pane Quotidiano · €10,00

**Destinatario:** email in `auth.users` (non leggibile con chiave anon) — recuperare da dashboard admin `/admin/users` o RPC `list_abandoned_carts_to_recover` con service_role al via invio.

**Consenso:** `email_marketing = false` → il cron attuale **salta** l'invio. Opzioni: (a) email transazionale “hai lasciato il carrello” senza promo; (b) chiedere opt-in prima; (c) invio manuale one-off 🟡 con ok @legale-privacy.

**Prodotti nel carrello:**
- 1× Pesto Genovese Bio — €5,00
- 1× Kefir di latte di capra biologico — €2,95
- 1× Berchtesgadener Land kefir biologico 400g — €2,05

**Codice proposto:** `BENVENUTO10` (10% sul primo ordine · già attivo in DB · costo max ~€1 su questo carrello)

### Email — Touch #1 (reminder, senza sconto) · 🟡

**Oggetto:** Hai lasciato qualcosa da Pane Quotidiano 🛒

**Corpo:**

> Ciao,
>
> hai messo nel carrello da **Pane Quotidiano** tre prodotti bio — pesto e kefir — e poi ti sei distratto. Capita. 😊
>
> **Sono ancora lì:**
> • 1× Pesto Genovese Bio — €5,00  
> • 1× Kefir di latte di capra biologico — €2,95  
> • 1× Berchtesgadener Land kefir biologico 400g — €2,05  
> **Totale prodotti: €10,00** (+ consegna a domicilio)
>
> Te li portiamo a mano nel quartiere, paghi alla consegna se preferisci.
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

**Codice:** *(nessuno — touch #1 per Piano Crescita E5)*

---

### Email — Touch #2 (con codice, se #1 non converte) · 🔴

**Oggetto:** Ti tengo €1 di sconto sul carrello 🧡

**Corpo:**

> Ciao,
>
> il carrello da **Pane Quotidiano** è ancora qui — pesto e kefir bio, **€10,00** di prodotti.
>
> Per darti una mano: usa il codice **`BENVENUTO10`** al checkout (**10% sul primo ordine**, vale ~€1 in meno su questa spesa).
>
> 👉 [Completa l'ordine con BENVENUTO10](https://mycity-marketplace.com/cart)
>
> Se hai cambiato idea, nessun problema — il carrello si svuota da solo. Ma se la spesa la volevi davvero, è a un clic.
>
> Nicola — MyCity
>
> *MyCity, Piacenza · [Disiscriviti]*

**Codice:** `BENVENUTO10` (tabella `coupons` · `first_order_only=true` · 🔴 incentivo reale — firma Nicola, già in coda FLUSSI §6.2)

---

## Account #2–4 — bozze SKIP (non clienti)

Non accodati per invio reale. Motivo: account interni/demo, non buyer.

| Account | Email seed (se serve debug) | Motivo skip |
|---------|----------------------------|-------------|
| Assistenza MyCity | `admin@piacenza-demo.local` | Admin piattaforma |
| Casa Linda | `casa.linda@piacenza-demo.local` | Negozio demo seed |
| Pane Quotidiano (seller) | email titolare in auth.users | Auto-test negoziante |

---

## Cosa serve da Nicola

1. **🟡 Invio touch #1 a samir** — dopo recupero email da admin + ok @legale-privacy su consenso transazionale vs marketing.
2. **🔴 Invio touch #2 con BENVENUTO10** — se touch #1 non converte entro 24h (allineato a AZIONI-IN-ATTESA §crm carrello #2).
3. **🟡 Reset flag recovery** (opzionale) — se vuoi riattivare il cron automatico: azzerare `recovery_email_sent_at` sui carrelli ancora validi via SQL admin.
4. **🟡 RESEND + dominio** — mani spente; collegamento @builder-automazioni.

## Riferimenti

- Template voce: `consegne/crm/FLUSSI-LIFECYCLE.md` §6
- Cron produzione: `marketplace/app/api/cron/abandoned-carts/route.ts`
- Azioni pronte: `MyCity-Vault/90-Memoria-AI/AZIONI-PRONTE.md` A3 + A8–A11
