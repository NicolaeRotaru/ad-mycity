---
tipo: azioni-pronte-recupero-carrelli
reparto: crm-lifecycle
data: 2026-07-03 11:40
fonte: snapshot REST verificato 2026-07-01 12:00 (`user_carts`+`abandoned_carts`+`profiles`) · confermato KPI 2026-07-02 10:19 · letture live MCP/curl gated in sessione 3/7 → riuso dato verificato, nessun numero nuovo inventato
stato: DRY-RUN — bozze pronte, NESSUN INVIO
voce: Vicino Orgoglioso (FLUSSI-LIFECYCLE §6)
riferimento: playbook completo `consegne/crm/2026-07-01-playbook-recupero-carrelli.md`
---

# 🛒 Recupero carrelli — pacchetto pronto (3/7 11:40)

## Situazione reale (con fonte)
| Metrica | Valore | Fonte |
|---|---|---|
| Record `abandoned_carts` con items | **4** operativi (+2 demo Verde Casa esclusi) | REST 1/7 12:00 |
| Carrelli **recuperabili reali** | **1** | l'unico `role=buyer` non-seed |
| Altri 3 record | admin / seller-auto-test / seed Casa Linda | **SKIP** (non clienti) |
| Consenso marketing del buyer | `email_marketing = false` | `profiles` |
| Coupon attivi in DB | `BENVENUTO10` (10% primo ordine) · `SPED5` (€5 sopra €25) | `coupons` |

> ⚠️ **Un solo cliente vero da recuperare.** Non gonfio la lista con account interni/demo. Il cron
> automatico oggi non partirebbe (tutti i record hanno già `recovery_email_sent_at` valorizzato a giugno):
> queste sono bozze **manuali one-off**, da firmare.

---

## 🎯 Cliente unico — samir · `57494b3e-fd67-4379-8b9c-90e40e39ff06` · Pane Quotidiano · €10,00

**Carrello (fermo dal 16/6, ~348h):**
- 1× Pesto Genovese Bio — €5,00
- 1× Kefir di latte di capra biologico — €2,95
- 1× Berchtesgadener Land kefir biologico 400g — €2,05
- **Totale prodotti: €10,00** (+ consegna)

**⛓️ Sequenza (decisione AD — coerenza cross-silo):** samir è l'**unico cliente reale**; il suo primo
ordine (#16, COD €19,05, Pane Quotidiano) è in consegna **stamattina**. Mandargli un «hai dimenticato il
carrello» *prima* di aver chiuso il primo ordine sarebbe stonato. → **Recovery parte SOLO dopo #16
consegnato** e riformulato come ri-aggancio caldo («ci sei mancato»), non come promo fredda.

**Blocchi reali all'invio:** ① email leggibile solo da admin/service_role (chiave anon non la vede) → recupera
da `/admin/users`; ② `email_marketing=false` → serve ok @legale-privacy (transazionale vs marketing);
③ mani Resend spente (→ @builder-automazioni).

---

### ✉️ Touch #1 — reminder consenso-safe (senza sconto) · 🟡

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

**Codice:** *nessuno* (reminder transazionale — rischio legale minore con `email_marketing=false`)

---

### ✉️ Touch #2 — con codice (solo se #1 non converte entro 24h) · 🔴

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

**Codice:** `BENVENUTO10` (tabella `coupons` · `first_order_only=true` · costo max ~€1 · 🔴 incentivo reale → firma Nicola)

---

## Account #2–4 — SKIP (non clienti, non accodati)
| Account | Motivo skip |
|---|---|
| Assistenza MyCity (`admin@…`) | Admin piattaforma |
| Casa Linda (`casa.linda@…`) | Negozio demo seed |
| Pane Quotidiano (seller) | Auto-test del negoziante |

## Cosa serve da Nicola
1. **🟡 ok @legale-privacy** sul consenso (transazionale reminder vs marketing) — sblocca Touch #1.
2. **🟡 recupero email** di samir da `/admin/users` (chiave anon non la legge).
3. **🔴 ok Touch #2** con `BENVENUTO10` (solo se #1 non converte).
4. **🟡 mani Resend + dominio** (→ @builder-automazioni) — finché spente l'azione resta pronta in coda.
