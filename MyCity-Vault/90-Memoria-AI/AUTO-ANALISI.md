---
data: 2026-07-01 04:17
voto_fiducia: 88
trend: ▲
---

# 🔬 AUTO-ANALISI — Giro 2026-07-01 04:17

## Voto di fiducia: **88/100** (▲ +1 vs 02:17)

**Perché:** 7 numeri live REST verificati (= business, stallo +2h → 161,8h, countdown 168h ~6,2h). Delta carrelli 4 ▼−2 documentato con query completa abandoned_carts. Entità allineate (Pane Quotidiano confermato, Casa Linda demo). Nessun numero orfano. -3: MCP cieco (mitigato REST). -5: domande 🔴 ordine zombie ancora aperte (blocco legittimo, urgenza correttamente escalata).

## Errori per gravità

| Gravità | Cosa | Azione |
|---------|------|--------|
| — | Nessun errore grounding/numeri in questo giro | — |

## Domande per Nicola

1. **Ordine €19,05 A/B?** — entro ~6,2h (gravita: alta)
2. **Ok Sprint 1 radiografia?** — 4 bloccanti prima del batch 6/7 (gravita: alta)
3. **Quanti negozi il 6/7?** — checklist pronta (gravita: media)

## Salute della macchina

| Sensore | Stato |
|---------|-------|
| Supabase marketplace REST | ✅ live 04:17 |
| Supabase MCP | ❌ cieco |
| Supabase memoria env | ✅ presente |
| Stripe status | ⚠️ fetch timeout (OK al giro precedente) |
| PostHog | ❌ non collegato |
| Dati freschi | ✅ sì |
| Sensori attivi | 2/4 |

## Punti ciechi

- MCP marketplace cieco (REST compensa)
- PostHog assente
- Competitor/stampa non ricontrollati (settimanale)

## Cosa miglioro al prossimo giro

- Trigger escalation 🟡 automatica se stallo >168h
- Riverificare stato PR quaderni su main
