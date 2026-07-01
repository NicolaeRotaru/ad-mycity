---
data: 2026-07-01 16:18
tipo: auto-analisi
---

# 🔬 AUTO-ANALISI — Giro 2026-07-01 16:18

## Voto di fiducia: **88/100** (trend **=**)

Stabile rispetto al giro 14:19. KPI live REST verificati; entità fondate; Scelta A rispettata (no A/B); slot consegna allineato all'orologio reale (16:18 → solo sera). Malus unico: MCP cieco (−5 già conteggiato), non ripetuto per ogni numero.

## Errori per gravità

Nessun errore bloccante in questo giro.

| Gravità | Cosa | Perché | Azione | Livello scoperta |
|---------|------|--------|--------|------------------|
| bassa | Schema `abandoned_carts` senza `updated_at` | Query live fallita | Uso conteggio playbook 12:15 (=4) + Gap dichiarato | L1 |

## Domande per Nicola

1. **Slot consegna #16:** confermi **18:30-20:00** stasera? + **`ok 16`**
2. **SQL 107:** incolla DROP policy → «fatto sql 107» (Ignora card Proposte)
3. **Batch 6/7:** quanti negozi e quali nomi?

## Salute della macchina

| Sensore | Stato |
|---------|-------|
| REST marketplace | ✅ OK 16:18 |
| REST memoria + POST briefings | ✅ OK |
| MCP Supabase | ❌ cieco (fallback REST attivo) |
| Stripe / PostHog | ❌ non collegati |
| WebFetch | ⚠️ Allerta ER OK, 3BMeteo timeout |

Dati **freschi** (query live ordini/profiles/products). Sensori attivi effettivi: **2** (REST marketplace + memoria).

## Punti ciechi

- MCP marketplace cieco in Cursor
- PostHog / Stripe MCP assenti
- Competitor: cadenza settimanale non rifatta
- Smoke checkout post-Sprint 1 non eseguito
- Conteggio live carrelli >4h (schema API cambiato)

## Cosa miglioro al prossimo giro

- Post `ok 16`: aggiornare 7 numeri con prima transazione
- Post `fatto sql 107`: verificare leak RLS chiuso + smoke anon
- Documentare schema REST aggiornato per `abandoned_carts` in query KPI
