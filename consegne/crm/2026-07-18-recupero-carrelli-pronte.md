---
tipo: azioni-pronte-recupero-carrelli
reparto: crm-lifecycle
data: 2026-07-18 11:25
fonte: Snapshot REST 16/7 · STATO.md 18/7 · MCP bloccato in questa sessione (nessuna query live)
stato: DRY-RUN — bozze pronte, NESSUN INVIO
voce: Vicino Orgoglioso (FLUSSI-LIFECYCLE §6)
riferimento: playbook `consegne/crm/2026-07-01-playbook-recupero-carrelli.md`
---

# Recupero carrelli — pacchetto pronto (18/7 11:25)

> ⚠️ **Nota dati:** query REST bloccata in questa sessione (MCP richiede approvazione, .env protetto).
> Questo snapshot è basato sui dati verificati il 16/7 + STATO.md 18/7 (0 ordini, 23 clienti).
> Per confermare nuovi carrelli da clienti registrati dopo il 16/7: approvare `mcp__supabase-marketplace__execute_sql`
> o lanciare `node cervello/sensore-cassa.mjs` dal terminale VPS.

## Situazione (baseline 16/7 · confermata invariata da STATO.md 18/7)

| Metrica | Valore | Fonte |
|---|---|---|
| Record `abandoned_carts` | **4** | REST 16/7 |
| Carrelli recuperabili reali | **1** | unico `role=buyer` non-seed |
| Nuovi ordini dal 16/7 | **0** | STATO.md 18/7 |
| Clienti registrati | **23** | STATO.md 18/7 |
| Nuovi carrelli possibili (23 clienti vs 4 carts) | **Non verificato** | serve query live |
| Consenso marketing buyer | `email_marketing = false` | `profiles` 16/7 |
| Coupon attivi | `BENVENUTO10` (10%, primo ordine) · `SPED5` (€5 sopra €25) | `coupons` REST 16/7 |

## Classificazione (snapshot 16/7)

| # | user_id | Nome | Ruolo | Totale | Fermo da | Inviabile? |
|---|---------|------|-------|--------|----------|------------|
| 1 | `57494b3e-fd67-4379-8b9c-90e40e39ff06` | samir | buyer | **€10,00** | **~792h dal 16/6 (~33 giorni)** | ✅ SÌ — unico cliente reale |
| 2 | `33333333-3333-3333-3333-aaaaaaaa0001` | Assistenza MyCity | admin | €7,95 | ~376h | SKIP — admin test |
| 3 | `11111111-1111-1111-1111-cccccccc0001` | Casa Linda | seller | €17,80 | ~738h | SKIP — seed demo |
| 4 | `c0b240c0-2a86-4218-9d0f-5154f08ff929` | Pane Quotidiano | seller | €13,90 | ~757h | SKIP — auto-test negoziante |

---

## 🎯 Gate operativo (aggiornato 18/7)

**Gate: CHIUSO.** L'email va spedita SOLO dopo che PQ evade il primo ordine (ordine-test o ordine reale).

| Check gate | Stato |
|---|---|
| PQ evadibile | ❌ 0 ordini al 18/7 |
| Ordine-test PQ (`#ordine-test-pq`) | ⏳ in coda, non ancora eseguito |
| VP 17/7 (Via Calzolai) | ✅ avvenuto — ma 0 ordini risultanti |
| Passo successivo | Nicola fa l'ordine-test → PQ evade → gate si apre |

**Contesto post-VP:** Nicola era al banco PQ il 17/7. Nessun ordine dal marketplace. Il gate rimane chiuso per non mandare samir su una bottega che ancora non evade.

---

## Cliente #1 — samir · Pane Quotidiano · €10,00

**Carrello (fermo dal 16/6, ~33 giorni):**
- 1× Pesto Genovese Bio — €5,00
- 1× Kefir di latte di capra biologico — €2,95
- 1× Berchtesgadener Land kefir biologico 400g parzialmente scremato — €2,05
- **Totale prodotti: €10,00** (+ consegna)

**Blocchi tecnici:**
1. Email di samir: visibile solo da `/admin/users` (anon non legge auth.users)
2. `email_marketing = false` → ok @legale-privacy per invio transazionale (carrello = proprio suo)
3. Mani Resend: spente — servono prima del via

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

## Account #2–4 — SKIP

| Account | Motivo |
|---|---|
| Assistenza MyCity | Admin piattaforma |
| Casa Linda | Seed demo |
| Pane Quotidiano (seller) | Auto-test negoziante |

---

## Cosa serve prima dell'invio

| # | Cosa | Chi | Colore |
|---|---|---|---|
| 1 | Approva invio transazionale (`email_marketing=false` — è il suo carrello) | @legale-privacy | 🟡 |
| 2 | Recupera email di samir da `/admin/users` | Nicola | 🟡 |
| 3 | Gate: fai l'ordine-test PQ (`#ordine-test-pq`) | Nicola | 🟡 |
| 4 | Attiva mani Resend | @builder-automazioni | 🟡 |
| 5 | Ok Touch #2 con `BENVENUTO10` | Nicola | 🔴 |

> **Quando tutti e 5 sono pronti:** sostituire `#touch-samir` in AZIONI-IN-ATTESA con carta 🔴 pronta al via.

---

## Nuovi carrelli da verificare (19 clienti senza dati)

Con 23 clienti registrati e solo 4 carts noti al 16/7, è possibile che altri abbiano aggiunto prodotti negli ultimi 2 giorni. Per la verifica completa:

```sql
-- Lanciare dal terminale VPS: node -e "..." o MCP (con approvazione)
SELECT uc.user_id, p.full_name, p.role, p.email_marketing,
       SUM(ci.quantity * ci.unit_price) AS totale,
       EXTRACT(EPOCH FROM (NOW() - uc.updated_at))/3600 AS ore_ferme
FROM user_carts uc
JOIN cart_items ci ON ci.cart_id = uc.id
LEFT JOIN profiles p ON p.id = uc.user_id
WHERE uc.updated_at < NOW() - INTERVAL '4 hours'
GROUP BY uc.user_id, p.full_name, p.role, p.email_marketing, uc.updated_at
ORDER BY ore_ferme DESC;
```
