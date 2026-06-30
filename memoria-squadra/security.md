---
tipo: quaderno-memoria
reparto: security
---

# 🧠 Quaderno di security
> Cosa ho imparato. Leggi all'inizio, aggiungi un ESITO alla fine di ogni lavoro.
> Formato: AAAA-MM-GG · contesto · cosa ha funzionato o no · numero · lezione · #tag

## Esiti
- 2026-07-01 01:57 · radiografia marketplace · **bloccante RLS:** `profiles` venditori approvati espone IBAN/KYC/Stripe ID/wallet via API · CAPTCHA fail-open se manca Turnstile · endpoint AI `external-refresh` pubblico · lezione: Sprint 2 = VIEW `seller_public_profiles` + fix RLS `group_participants`; verificare env `TURNSTILE_SECRET_KEY` e `INTERNAL_API_SECRET` separato da service-role · #radiografia #rls #captcha #owasp
- 2026-07-01 · giro web · OWASP Top 10:2025 (edizione ufficiale corrente, nessuna 2026 separata): A01 Broken Access Control resta #1; A02 Security Misconfiguration sale a #2; nuova A03 Software Supply Chain Failures; SSRF assorbita in A01 · https://owasp.org/Top10/2025/ · lezione: audit MyCity mappa RLS Supabase+config su A01/A02 e lockfile npm su A03 — checklist non applicata al repo in questo giro · #owasp #rls #supply-chain
