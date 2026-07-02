---
data: 2026-07-01 20:18
tipo: auto-analisi
---

# 🔬 AUTO-ANALISI — Giro 2026-07-01 20:18

## Voto di fiducia: **87/100** (trend **▼** da 88)

Leggero calo: previsione giro 18:18 («ultima chance entro 20:00») **confermata** — giornata chiusa senza #16. Dati live REST OK; entità fondate; Scelta A rispettata. Malus: rischio materializzato (−1) + MCP cieco (−5 già conteggiato nel baseline).

## Errori per gravità

Nessun errore bloccante in questo giro.

| Gravità | Cosa | Perché | Azione | Livello scoperta |
|---------|------|--------|--------|------------------|
| bassa | Schema `abandoned_carts` query fallita | Colonna/filtro | Uso playbook 12:15 (=4) + Gap | L1 |

## Domande per Nicola

1. **#16 2/7 mattina:** scrivi **`ok 16`**
2. **SQL 107:** incolla DROP policy → «fatto sql 107»
3. **Sync VPS #17:** 1× root Console Hetzner → `install-sync-vps.sh`

## Salute della macchina

| Sensore | Stato |
|---------|-------|
| REST marketplace | ✅ OK 20:18 |
| MCP Supabase Cursor | ❌ cieco |
| REST memoria + POST briefings | ✅ OK |
| Stripe / PostHog | ❌ non collegati |

## Punti ciechi

- MCP marketplace cieco (mitigato REST)
- Carrelli: schema cambiato — uso playbook
- Allerta meteo: mappe JS non leggibili in fetch statico

## Benchmark

N/a — giro operativo KPI + ripiano consegna.
