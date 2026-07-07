---
tipo: quaderno-memoria
reparto: tech
---

# 🧠 Quaderno di tech
> Cosa ho imparato. Leggi all'inizio, aggiungi un ESITO alla fine di ogni lavoro.
> Formato: AAAA-MM-GG · contesto · cosa ha funzionato o no · numero · lezione · #tag

## Esiti
- 2026-07-07 00:29 · Fix quota Vercel: deploymentEnabled:false + Action deploy-pannello con Deploy Hook (PR #210, mergiata; hook+secret configurati da Nicola) · 5/5/4/4/5/5 · atteso da domani 0 deployment dai push di memoria, quota 100/giorno intatta → reale da misurare al reset quota (check-in armato) · #vercel #quota
- 2026-07-07 00:29 · AR-102 fonte unica della verità: registro-fatti + guardiano coerenza-fatti + cablaggio giro (PR #207, mergiata) · 5/5/4/5/5/5 · atteso guardiano verde al primo giro VPS e registro popolato → reale 9 test e2e passati in sviluppo; registro popolato con 8 fatti fondati stanotte; verifica live VPS al prossimo giro · #ar-102 #coerenza
- 2026-07-02 07:35 · fix ruoli acquisto · Nicola (briefing 1/7): admin **403** checkout/COD + UI blocco · seller solo `/?shop=1` cookie 8h + middleware redirect · branch `fix/ruoli-acquisto-admin-seller-2026-07-02` (14 file, typecheck OK, non pushato) · spec `consegne/tech/2026-07-02-ruoli-acquisto-admin-seller.md` · #19 deploy 🔴 · lezione: ruoli acquisto = UI+server+middleware, mai solo navbar · L-0702-41 · #ruoli #admin #seller #middleware
- 2026-07-01 11:10 · ok deploy Sprint 1 · Nicola firma #13 · Render **già live ~10:31** (auto post-merge #209+#210) · verificato: fee €3 UI + query `seller_public_profiles` in bundle prod · **SQL 107 mancante** — anon legge ancora `profiles.stripe_account_id` · AD senza write key → Nicola SQL Editor · L-0701-34 + L-0701-25 · #deploy #107 #rls
- 2026-07-01 11:15 · card PR obsoleta · Nicola «crea la PR» da casella Sprint 1 · GitHub: **#209 mergiata 09:34** + **#210** hotfix 10:00 (push manuale post-403) · codice su `mycity/main` · prossimo **`ok deploy Sprint 1`** 🔴 (migrazione `107` + smoke test) · lezione: verificare GitHub prima di rispondere a card PR · #209 #deploy #stale-card
- 2026-07-01 07:41 · correzione Nicola PR · «crea la pr, non l'hai creata» dopo ok Sprint 1 — push `mycity` 403 confermato (PAT solo ad-mycity); PR **non** aperta; patch `consegne/tech/sprint-1-radiografia-marketplace.patch` + compare link fallback · lezione: ok sprint = Nicola si aspetta PR, non solo branch locale · #403 #pr #nicola
- 2026-07-01 07:30 · Sprint 1 eseguito · Nicola «ok Sprint 1» → branch `fix/sprint-1-radiografia-2026-07-01` commit `8dc0f88`: webhook Stripe (COMPLETED solo se ordini ok), fee €3/negozio in UI, migration 107 VIEW `seller_public_profiles`, rollback COD multi-negozio, varianti duplicate + stock idempotente refund · **push GitHub 403** (token worker senza permessi su `NicolaeRotaru/mycity`) → PR da Nicola · migrazione 107 pre-deploy 🔴 · doc `consegne/tech/sprint-1-radiografia-marketplace.md` · #radiografia #sprint #rls #stripe #403
- 2026-07-01 01:57 · radiografia marketplace · **46 problemi confermati** (4 bloccanti · 24 gravi · 18 minori) · report `consegne/audit/2026-07-01-radiografia.md` · bloccanti: webhook Stripe ordine perso, fee €3/negozio assente UI, COD ghost order, varianti duplicate checkout · lezione: Sprint 1 = webhook+fee UI+rollback COD+varianti in branch 🟡 prima di qualsiasi deploy 🔴 · #radiografia #checkout #stripe #cod
- 2026-07-01 06:45 · chat Nicola workflow fix · coda = **#13 Sprint 1** (4 bloccanti); Sprint 2/3 nel report, accodati dopo ok; deploy 🔴 sempre separato · AD orchestra branch+QA, Nicola firma a blocchi (`ok 13`, `ok deploy`) · #radiografia #workflow #sprint
- 2026-07-01 · giro web · Next.js 16 (GA 2025): caching opt-in con Cache Components/`use cache`, `middleware.ts` deprecato → `proxy.ts` (Node), API sync `cookies`/`params`/`headers` rimosse · https://nextjs.org/blog/next-16 · lezione: prima di upgrade marketplace mappare breaking change cross-stack (Node ≥20.9, Turbopack default, firma `revalidateTag`) · #nextjs #upgrade #stack
