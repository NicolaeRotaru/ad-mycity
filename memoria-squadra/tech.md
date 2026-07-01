---
tipo: quaderno-memoria
reparto: tech
---

# 🧠 Quaderno di tech
> Cosa ho imparato. Leggi all'inizio, aggiungi un ESITO alla fine di ogni lavoro.
> Formato: AAAA-MM-GG · contesto · cosa ha funzionato o no · numero · lezione · #tag

## Esiti
- 2026-07-01 07:41 · correzione Nicola PR · «crea la pr, non l'hai creata» dopo ok Sprint 1 — push `mycity` 403 confermato (PAT solo ad-mycity); PR **non** aperta; patch `consegne/tech/sprint-1-radiografia-marketplace.patch` + compare link fallback · lezione: ok sprint = Nicola si aspetta PR, non solo branch locale · #403 #pr #nicola
- 2026-07-01 07:30 · Sprint 1 eseguito · Nicola «ok Sprint 1» → branch `fix/sprint-1-radiografia-2026-07-01` commit `8dc0f88`: webhook Stripe (COMPLETED solo se ordini ok), fee €3/negozio in UI, migration 107 VIEW `seller_public_profiles`, rollback COD multi-negozio, varianti duplicate + stock idempotente refund · **push GitHub 403** (token worker senza permessi su `NicolaeRotaru/mycity`) → PR da Nicola · migrazione 107 pre-deploy 🔴 · doc `consegne/tech/sprint-1-radiografia-marketplace.md` · #radiografia #sprint #rls #stripe #403
- 2026-07-01 01:57 · radiografia marketplace · **46 problemi confermati** (4 bloccanti · 24 gravi · 18 minori) · report `consegne/audit/2026-07-01-radiografia.md` · bloccanti: webhook Stripe ordine perso, fee €3/negozio assente UI, COD ghost order, varianti duplicate checkout · lezione: Sprint 1 = webhook+fee UI+rollback COD+varianti in branch 🟡 prima di qualsiasi deploy 🔴 · #radiografia #checkout #stripe #cod
- 2026-07-01 06:45 · chat Nicola workflow fix · coda = **#13 Sprint 1** (4 bloccanti); Sprint 2/3 nel report, accodati dopo ok; deploy 🔴 sempre separato · AD orchestra branch+QA, Nicola firma a blocchi (`ok 13`, `ok deploy`) · #radiografia #workflow #sprint
- 2026-07-01 · giro web · Next.js 16 (GA 2025): caching opt-in con Cache Components/`use cache`, `middleware.ts` deprecato → `proxy.ts` (Node), API sync `cookies`/`params`/`headers` rimosse · https://nextjs.org/blog/next-16 · lezione: prima di upgrade marketplace mappare breaking change cross-stack (Node ≥20.9, Turbopack default, firma `revalidateTag`) · #nextjs #upgrade #stack
