---
tipo: quaderno-memoria
reparto: backend-dev
---

# 🧠 Quaderno di backend-dev
> Cosa ho imparato. Leggi all'inizio, aggiungi un ESITO alla fine di ogni lavoro.

## Esiti
- 2026-07-19 17:00 · PR #213 marketplace mergiata (#fix-35-gravi chiuso) · atteso codice+DB allineati · reale: merge `304fe07` su origin/main verificato; migrazioni 109-111 già ok 16:57 · L-297 L-272 · #radiografia #pr-213 #esito
- 2026-07-19 16:57 · Applica migrazioni 109/110/111 marketplace · atteso schema post-PR #213 sul DB live · reale: 109+111 ok; 110 adattata (public_avatar_url/city); rider_fee_cents + public_profiles verificati REST · Management API (MCP write bloccato in chat) · L-294 L-296 · #migrazioni #supabase #esito
- 2026-07-19 16:55 · Verifica migrazioni marketplace 109/110/111 · atteso schema post-merge PR #213 · reale: colonna rider_fee_cents e vista public_profiles assenti — migrazioni non eseguite; apply_migration MCP bloccato in chat Pannello · L-294 · #migrazioni #supabase #esito
- 2026-07-01 · giro web · Supabase breaking change (2026-04-28): nuove tabelle in `public` non più auto-esposte alla Data API — servono `GRANT` espliciti; default nuovi progetti dal 2026-05-30, enforcement progetti esistenti 2026-10-30 · https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically · lezione: ogni migrazione = GRANT + RLS + policy nello stesso file, altrimenti 42501 · #supabase #grants #migrations
