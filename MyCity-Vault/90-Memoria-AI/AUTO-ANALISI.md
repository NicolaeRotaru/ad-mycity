---
data: 2026-07-01 18:18
tipo: auto-analisi
---

# 🔬 AUTO-ANALISI — Giro 2026-07-01 18:18

## Voto di fiducia: **88/100** (trend **=**)

Stabile rispetto al giro 16:18. KPI live REST verificati; entità fondate; Scelta A rispettata (no A/B); slot consegna allineato all'orologio reale (18:18 → finestra **APERTA ORA**, non più «stasera post-18»). Ordine DB conferma slot «Stasera · 18:00–20:00». Malus unico: MCP cieco (−5 già conteggiato).

## Errori per gravità

Nessun errore bloccante in questo giro.

| Gravità | Cosa | Perché | Azione | Livello scoperta |
|---------|------|--------|--------|------------------|
| bassa | Schema `abandoned_carts` senza `updated_at` | Query live fallita | Uso conteggio playbook 12:15 (=4) + Gap dichiarato | L1 |

## Domande per Nicola

1. **#16 ORA:** scrivi **`ok 16`** + avvia consegna entro **20:00**
2. **SQL 107:** incolla DROP policy → «fatto sql 107» (Ignora card Proposte)
3. **Batch 6/7:** quanti negozi e quali nomi?

## Salute della macchina

| Sensore | Stato |
|---------|-------|
| REST marketplace | ✅ OK 18:18 |
| MCP Supabase Cursor | ❌ cieco |
| REST memoria + POST briefings | ✅ OK |
| Stripe / PostHog | ❌ non collegati |

## Punti ciechi

- MCP marketplace cieco (mitigato REST)
- Carrelli: schema cambiato — uso playbook
- Competitor: cadenza settimanale non rifatta

## Cosa miglioro al prossimo giro

- Se #16 eseguito: aggiornare 7 numeri con prima transazione reale
- Post SQL 107: smoke test RLS + checkout
- Distinguere messaggio «finestra imminente» vs «finestra APERTA» (L-36 applicata)
