---
tipo: auto-analisi
data: 2026-07-01 00:17
---

# 🔬 AUTO-ANALISI — Giro 2026-07-01 00:17

## Voto di fiducia: **86/100** (▲ +1 vs 85 del 30/6 23:15)

**Perché:** 7 numeri riverificati live via REST (= vs passaggio precedente). Grounding entità ok. Nessun numero orfano. Valore aggiunto del giro: playbook temporali 1/7 🟢 + snapshot KPI + aggiornamento Intelligence. Malus singolo −5 MCP cieco (REST fallback attivo). Non ho ripetuto un passaggio vuoto: business invariato ma **contesto esterno nuovo** (allerta oggi) giustifica il giro.

## Errori per gravità
Nessun errore L1 intercettato in questo giro.

## Domande per Nicola
1. **Forzo Casa Linda entro ~10h dalla soglia 168h?** — Stallo 157,8h, unico payout-ready.
2. **Ordine €19,05:** accetti, consegni o annulli? — Buyer fermo ~6,6 gg.
3. **Link lista d'attesa per VP 3/7?** — Tra ~66h, senza link conversione zero.

## Salute della macchina
- Supabase marketplace REST: ✅ live 00:17
- Supabase memoria: ✅ env presente
- Supabase MCP: ❌ cieco (fallback OK)
- Stripe: ✅ status pubblico OK
- PostHog: ❌ non collegato
- Dati freschi: ✅ sì (REST questo giro)

## Punti ciechi
- PostHog / funnel checkout
- Stripe MCP (solo status page)
- Competitor live (cadenza settimanale)
- Sentiment social (non esaustivo)

## Cosa miglioro al prossimo giro
- Non ripetere passaggio se numeri = E radar esterno invariato E nessun evento del giorno
- Escalation automatica 🔴 se stallo supera 168h senza firma Nicola
