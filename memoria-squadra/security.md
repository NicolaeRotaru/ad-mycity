---
tipo: quaderno-memoria
reparto: security
---

# 🧠 Quaderno di security
> Cosa ho imparato. Leggi all'inizio, aggiungi un ESITO alla fine di ogni lavoro.
> Formato: AAAA-MM-GG · contesto · cosa ha funzionato o no · numero · lezione · #tag

## Esiti
- 2026-07-02 17:30 · SQL 107 RLS · Nicola FIRMA la scrittura DB in chat («eseguilo tu io lo approvo») ma esecuzione bloccata dal permesso di sessione dello strumento `mcp__supabase-marketplace__apply_migration` (non concesso) — NON dalla firma · leak `profiles.stripe_account_id` anon ancora HTTP 200 · lezione: un 🔴 bloccato ha 2 cause distinte (firma mancante vs permesso strumento mancante) → diagnostica quale e proponi lo sblocco giusto + piano B manuale (paste SQL Editor) [L-2026-0702-49] · dopo l'apply, smoke RLS in lettura · #rls #107 #permessi-strumento
- 2026-07-01 11:29 · card SQL 107 RLS · Nicola «perché approvare di nuovo?» dopo ok deploy 11:10 · leak `profiles.stripe_account_id` ancora attivo (anon HTTP 200) · firma deploy copre DROP policy — resta paste manuale Supabase · card Proposte = mal classificata (L-35) · #rls #107 #post-firma
- 2026-07-01 01:59 · guardrail 🔴 worker/autopilot · pre-mortem: azione LIVE senza firma Nicola · fix: modulo `guardrail-semaforo.mjs` + doppio gate esegui-azione + NICOLA_FIRMA solo su job approvati · exit 2 ROSSO_SENZA_FIRMA su test payout · lezione: difesa in profondità = kill-switch AZIONI_LIVE + guardrail contenuto + firma esplicita; verificare post-deploy con `esegui-azione.mjs verifica` prima di accendere LIVE · #guardrail #firma #pre-mortem #azioni-live
- 2026-07-01 07:30 · Sprint 1 RLS fix · VIEW `seller_public_profiles` + migration `107` in branch `fix/sprint-1-radiografia-2026-07-01` — niente più leak IBAN/KYC/wallet via API · pre-deploy 🔴: applicare migration su prod prima di merge · #radiografia #rls #sprint
- 2026-07-01 01:57 · radiografia marketplace · **bloccante RLS:** `profiles` venditori approvati espone IBAN/KYC/Stripe ID/wallet via API · CAPTCHA fail-open se manca Turnstile · endpoint AI `external-refresh` pubblico · lezione: Sprint 1 = VIEW `seller_public_profiles` (fixato 07:30); Sprint 2 = CAPTCHA fail-closed + AI refresh + RLS `group_participants`; verificare env `TURNSTILE_SECRET_KEY` e `INTERNAL_API_SECRET` separato da service-role · #radiografia #rls #captcha #owasp
- 2026-07-01 · giro web · OWASP Top 10:2025 (edizione ufficiale corrente, nessuna 2026 separata): A01 Broken Access Control resta #1; A02 Security Misconfiguration sale a #2; nuova A03 Software Supply Chain Failures; SSRF assorbita in A01 · https://owasp.org/Top10/2025/ · lezione: audit MyCity mappa RLS Supabase+config su A01/A02 e lockfile npm su A03 — checklist non applicata al repo in questo giro · #owasp #rls #supply-chain
- 2026-07-07 11:28 · ESITO R1 revoca PAT propagata + verifica token Pannello hosted · scorecard: verita 5 · impatto 4 · concretezza 4 · colore 5 · umano 4 · memoria 5 · atteso: buco AR-004 chiuso in memoria dopo la revoca di Nicola · reale: AR-004 chiuso (PAT revocato, chat 7/7), resta #55 (dare a Vercel un PAT read-only) condizionato al check /api/diagnosi di Nicola · #sicurezza #ar-004 #esito
