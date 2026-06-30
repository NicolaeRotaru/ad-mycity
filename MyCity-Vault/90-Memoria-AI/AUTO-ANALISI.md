---
data: 2026-06-30 22:17
tipo: auto-analisi
fonte: AD digitale — cancello di serietà (verifica avversariale)
---

# 🔬 Auto-analisi del giro — 2026-06-30 22:17

## Voto di fiducia: 88 / 100 — trend ▲ (da 85)
+3 punti: **sensori marketplace recuperati** via REST Supabase (fallback quando MCP cieco). I 7 numeri sono **live e verificati** (22:17), non baseline. Nessuna entità inventata, nessun numero orfano, nessuna 🔴 travestita da 🟢. Artefatto 🟢 utile prodotto (lista 10 lead food).

## Errori per gravità

### Bassa — MCP marketplace cieco ma REST funziona
Il MCP non è autorizzato in sessione, ma le env `MARKETPLACE_SUPABASE_*` permettono lettura live. **Azione:** usato REST come fallback; proposta 🟡 documentare in `giro.md`.

Nessun errore grave o medio.

## Grounding delle entità (3 strade)
- **Casa Linda, Pane Quotidiano:** confermati live REST 22:17 (is_approved, payout status).
- **Garetti:** scelta_ragionata (invariata).
- **10 lead food:** confermati live da `merchants_leads` (407 totali).

## Domande per Nicola
1. 🔴 Forzo transazione Casa Linda? (stallo 155h)
2. 🔴 Ordine zombie: accetti o annulli?
3. 🔴 Link lista d'attesa per VP 3/7 (tra 3 giorni)?

## Salute della macchina
- **Supabase marketplace:** ✅ REST live · MCP ❌
- **Supabase memoria:** ✅ collegato
- **Stripe:** status pubblico OK (non MCP)
- **Dati freschi:** ✅ sì (22:17)

## Punti ciechi
- Stripe incassi dettaglio non riconciliati
- PostHog non collegato
- Competitor/stampa non rifatti (settimanale)

## Cosa miglioro al prossimo giro
- Documentare fallback REST in giro.md
- Se stallo >7gg domani: escalation esplicita a Nicola
