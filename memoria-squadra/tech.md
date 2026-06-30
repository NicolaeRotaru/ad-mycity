---
tipo: quaderno-memoria
reparto: tech
---

# 🧠 Quaderno di tech
> Cosa ho imparato. Leggi all'inizio, aggiungi un ESITO alla fine di ogni lavoro.
> Formato: AAAA-MM-GG · contesto · cosa ha funzionato o no · numero · lezione · #tag

## Esiti
- 2026-07-01 01:57 · radiografia marketplace · **46 problemi confermati** (4 bloccanti · 24 gravi · 18 minori) · report `consegne/audit/2026-07-01-radiografia.md` · bloccanti: webhook Stripe ordine perso, fee €3/negozio assente UI, COD ghost order, varianti duplicate checkout · lezione: Sprint 1 = webhook+fee UI+rollback COD+varianti in branch 🟡 prima di qualsiasi deploy 🔴 · #radiografia #checkout #stripe #cod
- 2026-07-01 · giro web · Next.js 16 (GA 2025): caching opt-in con Cache Components/`use cache`, `middleware.ts` deprecato → `proxy.ts` (Node), API sync `cookies`/`params`/`headers` rimosse · https://nextjs.org/blog/next-16 · lezione: prima di upgrade marketplace mappare breaking change cross-stack (Node ≥20.9, Turbopack default, firma `revalidateTag`) · #nextjs #upgrade #stack
