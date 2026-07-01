---
tipo: quaderno-memoria
reparto: devops-sre
---

# 🧠 Quaderno di devops-sre
> Cosa ho imparato. Leggi all'inizio, aggiungi un ESITO alla fine di ogni lavoro.

## Esiti
- **2026-07-01 01:11** — VPS a due binari: memoria=`memoria-ad` (overlay worker automatico) · codice=`main` (settings.json, agenti). Nicola **non** fa pull memoria-ad (conflitti). Sync codice: `cervello/vps/aggiorna-cervello.sh` o giro Pannello. WebFetch globale: merge su main prima che worker erediti config. Fonte: correzione Nicola chat 1/7.
- **2026-07-01 01:13** — WebFetch globale **non** su GitHub remoto (main/memoria-ad = whitelist). `aggiorna-cervello.sh` sovrascrive locale da main. Verifica deploy: `git show origin/main:.claude/settings.json` — non test Cursor. Fonte: correzione Nicola chat 1/7.
- **2026-07-01 01:16** — Nicola esegue `aggiorna-cervello.sh`: worker attivo, commit `1394219`, settings.json = whitelist (11 domini). Conferma: sync codice funziona; WebFetch libero **solo dopo** PR+merge su main. Fonte: chat Nicola 1/7.
- 2026-07-01 · giro web · Render Web Service Next.js: ISR e image optimization scrivono su `.next/cache` — filesystem effimero perde cache a ogni deploy; Persistent Disk montato su `/opt/render/project/src/.next/cache` + `healthCheckPath` per zero-downtime · https://render.com/articles/how-to-deploy-next-js-applications-with-ssr-and-api-routes.md · lezione: se abilitiamo ISR/optimizeImage su Render, valutare disco persistente (trade-off: zero-downtime deploy disabilitato con disk) · #render #nextjs #deploy #isr
- **2026-07-01 01:19** — Fix codice (WebFetch): PR su **`main`** (base main, 1 file settings.json) — **non** memoria-ad. Nicola: delega AD («apri la PR») o GitHub UI; post-merge = `aggiorna-cervello.sh`. Fonte: chat Nicola 1/7.
- **2026-07-01 01:23** — Branch `fix/webfetch-globale` pushato (`3ccfb05`); token VPS push ✓ API PR ✗ → Nicola merge compare GitHub. Post-merge: `aggiorna-cervello.sh` + grep WebFetch senza `domain:`. Fonte: chat Nicola 1/7.
- **2026-07-01 01:31** — Nicola conferma PR **non ancora mergiata** («rimandami la pr») — worker resta whitelist 11 domini fino al merge su `main`. Fonte: chat Nicola 1/7.
- **2026-07-01 01:37** — Nicola merge PR **`fix/webfetch-globale`** su `main` + `aggiorna-cervello.sh` → VPS con `"WebFetch"` globale (grep senza `domain:`). Worker/giro automatico: web libero sola lettura. Fonte: chat Nicola 1/7.
- **2026-07-01 01:57** — Inventario MCP (casella salute-sensori): Supabase in `.mcp.json` ma cieco (`SUPABASE_ACCESS_TOKEN` + Autorizza Cursor); Stripe/PostHog mai in config; REST marketplace HTTP 200 ✅. Sblocco rapido = token Supabase Dashboard. Fonte: chat Nicola 1/7.
- **2026-07-01 07:41** — Push `NicolaeRotaru/mycity` **403**: `GIT_PUSH_TOKEN` scrive solo `ad-mycity`. Accodato **#14** `MARKETPLACE_GIT_TOKEN` (Contents R/W su mycity) in `cervello/vps/.env`. Senza token: AD non può aprire PR marketplace — Nicola correzione «crea la pr». Fonte: chat Nicola 1/7 Sprint 1.
