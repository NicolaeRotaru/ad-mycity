---
data: 2026-07-02 08:20
tipo: auto-analisi
fonte: AD digitale (cervello/auto-analisi.md)
---

# 🔬 AUTO-ANALISI — Cancello di serietà

## Voto di fiducia: **89/100** ▲ (da 87)

**Perché ▲:** automazione VPS tutto verde (nuovo segnale positivo); KPI live REST coerenti con giro precedente (+12,1h stallo prevedibile); meteo verificato live; nessun errore grounding entità/numeri; lezioni L-0702-41/42/43 applicate nel briefing.

**Malus assenti:** MCP Cursor ancora cieco (−5 una tantum già conteggiato in salute_macchina, non ripetuto per ogni numero).

---

## Errori per gravità

*Nessun errore intercettato in questo giro.*

---

## Domande per Nicola

1. **Alta:** `ok 16` oggi pranzo? (stallo 190h, meteo OK)
2. **Alta:** `ok merge fix ruoli-acquisto` per #19?
3. **Alta:** SQL 107 → «fatto sql 107»

---

## Salute della macchina

| Componente | Stato |
|------------|-------|
| REST marketplace | ✅ 200 |
| REST memoria briefings | ✅ POST 201 |
| verifica-automazione | ✅ tutto verde |
| MCP Supabase Cursor | ❌ cieco |
| Worker VPS | ✅ attivo |

---

## Punti ciechi

- Stripe live/sandbox non interrogato in sessione
- PostHog funnel assente
- Concorrenti non ricontrollati (cadenza settimanale)

---

## Cosa miglioro al prossimo giro

- Dopo `ok 16`: calibrazione @operations con esito reale
- Dopo merge #19: smoke test ruoli in produzione
- Contatore giri-ciechi MCP (difetto AR-003)
