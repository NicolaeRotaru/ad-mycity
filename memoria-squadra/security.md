---
tipo: quaderno-memoria
reparto: security
---

# 🧠 Quaderno di security
> Cosa ho imparato. Leggi all'inizio, aggiungi un ESITO alla fine di ogni lavoro.
> Formato: AAAA-MM-GG · contesto · cosa ha funzionato o no · numero · lezione · #tag

## Esiti
- 2026-07-01 01:59 · guardrail 🔴 worker/autopilot · pre-mortem: azione LIVE senza firma Nicola · fix: modulo `guardrail-semaforo.mjs` + doppio gate esegui-azione + NICOLA_FIRMA solo su job approvati · exit 2 ROSSO_SENZA_FIRMA su test payout · lezione: difesa in profondità = kill-switch AZIONI_LIVE + guardrail contenuto + firma esplicita; verificare post-deploy con `esegui-azione.mjs verifica` prima di accendere LIVE · #guardrail #firma #pre-mortem #azioni-live
- 2026-07-01 07:30 · Sprint 1 RLS fix · VIEW `seller_public_profiles` + migration `107` in branch `fix/sprint-1-radiografia-2026-07-01` — niente più leak IBAN/KYC/wallet via API · pre-deploy 🔴: applicare migration su prod prima di merge · #radiografia #rls #sprint
- 2026-07-01 01:57 · radiografia marketplace · **bloccante RLS:** `profiles` venditori approvati espone IBAN/KYC/Stripe ID/wallet via API · CAPTCHA fail-open se manca Turnstile · endpoint AI `external-refresh` pubblico · lezione: Sprint 1 = VIEW `seller_public_profiles` (fixato 07:30); Sprint 2 = CAPTCHA fail-closed + AI refresh + RLS `group_participants`; verificare env `TURNSTILE_SECRET_KEY` e `INTERNAL_API_SECRET` separato da service-role · #radiografia #rls #captcha #owasp
- 2026-07-01 · giro web · OWASP Top 10:2025 (edizione ufficiale corrente, nessuna 2026 separata): A01 Broken Access Control resta #1; A02 Security Misconfiguration sale a #2; nuova A03 Software Supply Chain Failures; SSRF assorbita in A01 · https://owasp.org/Top10/2025/ · lezione: audit MyCity mappa RLS Supabase+config su A01/A02 e lockfile npm su A03 — checklist non applicata al repo in questo giro · #owasp #rls #supply-chain
