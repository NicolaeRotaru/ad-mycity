---
workstream: Deploy / SRE
owner: devops-sre
data: 2026-07-04 16:30
stato: PRONTO DA APPLICARE (branch ops/, deploy = firma Nicola 🔴)
findings_coperti: 9/9
---

# WS-DEPLOY — Pacchetto di fix "Deploy / SRE" MyCity

Repo target (sola lettura): `/home/user/ad-mycity/marketplace`. I file corretti pronti da
copiare sono in `consegne/bonifica/patches/`. **Nessun deploy è partito** — ogni applicazione
va in un branch `ops/deploy-hardening` e il go-live in produzione resta **🔴 firma Nicola**.

> Regola d'oro applicata: ogni cambiamento è **reversibile** (git revert del branch) e
> **osservabile** (health check + log baseline). Il bloccante B3 va **confermato con un deploy
> reale su Render** prima di dichiararlo chiuso: solo il build reale prova che le devDependencies
> vengono installate.

## Ordine di applicazione (dipendenze)
1. `.npmrc` + `render.yaml` (B3 + install divergente) — sbloccano il build. **Prima di tutto.**
2. `logger.ts` + `health-route.ts` + payout return + cron-health — osservabilità.
3. Step migrazioni / drift in CI — **dipende dalle SQL degli altri workstream** (backend-dev):
   cablalo solo quando il set di migrazioni è congelato, altrimenti il gate diventa rumore.

---

## 1. 🔴 B3 (BLOCCANTE) — build Render fallisce: `npm ci` omette le devDependencies
- **Causa-radice:** `render.yaml` imposta `NODE_ENV=production` (envVars, presenti anche in
  build) e usa `buildCommand: npm ci && npm run build` (riga 26). Con `NODE_ENV=production` il
  default di npm è `--omit=dev` → autoprefixer/postcss (devDeps, `package.json:72,75`, richiesti da
  `postcss.config.js`) e @types/eslint-config-next (typecheck/lint non disattivati in
  `next.config.js`) NON vengono installati → `next build` crasha. La CI non lo intercetta perché
  usa un comando diverso (`npm ci --legacy-peer-deps`, senza `NODE_ENV=production`). CI verde,
  deploy rotto.
- **Fix ESATTO** (`consegne/bonifica/patches/render.yaml`), doppia protezione:
  - `buildCommand: npm ci --include=dev --legacy-peer-deps && npm run build` — `--include=dev`
    forza le devDeps **a prescindere** da NODE_ENV.
  - env aggiunta `NPM_CONFIG_PRODUCTION=false` (cintura+bretelle).
  - `NODE_ENV=production` resta per il **runtime** (corretto).
- **Verifica:** **confermare con un deploy reale su Render** (branch/preview) — deve arrivare a
  "Build successful" e servire `/api/health` 200. Non basta la CI.
- **Colore:** applicazione a render.yaml in branch = 🟡; **il deploy in prod = 🔴 Nicola.**
- **Rischio&rollback:** nullo in build (installa solo *più* pacchetti). Rollback = git revert del
  file. Se anche così il build fallisse, ripiego C: spostare `autoprefixer`+`postcss`+`@types`
  necessari in `dependencies`.

## 2. 🟡 Install divergente CI↔Render (`--legacy-peer-deps` mancante in render.yaml)
- **Causa-radice:** CI dichiara il flag **obbligatorio** (`ci.yml:25-28`, conflitto peer
  Storybook 10 vs React 18); `render.yaml` usava `npm ci` liscio; nessun `.npmrc`. Riabilitando le
  devDeps (fix B3) l'install su Render può incappare nell'ERESOLVE mai visto in CI.
- **Fix ESATTO:** file **`.npmrc`** con `legacy-peer-deps=true` (`consegne/bonifica/patches/.npmrc`)
  → **fonte unica** letta sia da CI sia da Render. Semplifica anche `ci.yml`: i quattro
  `npm ci --legacy-peer-deps` possono tornare `npm ci` (opzionale; lasciarli non nuoce).
- **Verifica:** `npm ci` pulito su macchina senza cache legge il flag da `.npmrc` senza ERESOLVE.
- **Colore:** 🟡. **Rollback:** elimina `.npmrc`. **Rischio:** nullo.

## 3. 🟡 Log server spariscono in prod (`logger.warn`/`error` muti senza Sentry)
- **Causa-radice** (`lib/logger.ts:66-90`): `info` ed `error` scrivono su console solo se
  `NODE_ENV !== 'production'` → muti in prod; `warn` sul server richiede `typeof window !==
  'undefined'` → mai emesso lato server; `error` in prod dipende al 100% da `captureServerError`,
  che esce subito senza DSN (`:55`). Sentry è opzionale. Risultato: payout/webhook/refund/email/push
  falliti sono invisibili in prod.
- **Fix ESATTO** (`consegne/bonifica/patches/logger.ts`): `info/warn/error` emettono **sempre** su
  stdout/stderr (Render li conserva); `warn` invia anche a Sentry via nuova `captureServerMessage`
  (`captureMessage` livello `warning`) quando c'è il DSN; `error` invariato su Sentry. Da correggere
  anche i 3 commenti fuorvianti che promettono visibilità Sentry oggi inesistente:
  `app/api/stripe/webhook/route.ts:664`, `lib/email/client.ts:33-41`, `lib/push/send.ts`.
- **Verifica:** in un ambiente con `NODE_ENV=production` e **senza** DSN, un `logger.warn`/`error`
  produce comunque una riga JSON nei log Render.
- **Colore:** 🟡. **Rollback:** git revert del file. **Rischio:** volume log ↑ (accettabile;
  `info` è già usato con parsimonia). Nessun rischio funzionale.

## 4. 🟡→🔴 Nessuno step migrazioni nel deploy + drift non controllato in CI
- **Causa-radice:** con `autoDeploy:true` Render builda/avvia ma **non applica** i file in
  `migrations/`. Il drift-check (`scripts/check-migration-drift.mjs`) è opt-in, richiede
  `SUPABASE_DB_URL`, **non è cablato in CI**. Il codice usa RPC create via migrazione
  (`restore_stock_for_order`, `increment_coupon_usage`… webhook `:360,729,847,885`): un push che
  aggiunge migrazione + codice va live **prima** che lo schema esista → 500 su checkout/webhook.
- **Fix ESATTO — 2 tempi:**
  1. **Gate in CI (blocca il merge sul drift)** — nuovo job in `.github/workflows/ci.yml`, sullo
     schema del job RLS (skip visibile se manca il secret):
     ```yaml
       migration-drift:
         name: Migration drift
         runs-on: ubuntu-latest
         timeout-minutes: 5
         steps:
           - uses: actions/checkout@v4
           - uses: actions/setup-node@v4
             with: { node-version: "20", cache: "npm" }
           - run: npm ci
           - name: Check drift
             env:
               SUPABASE_DB_URL: ${{ secrets.SUPABASE_DB_URL_READONLY }}
             run: |
               if [ -z "$SUPABASE_DB_URL" ]; then
                 echo "::warning::Drift-check SALTATO: manca SUPABASE_DB_URL_READONLY (secret di sola lettura)."
               else
                 npm i -D pg >/dev/null 2>&1 || true
                 node scripts/check-migration-drift.mjs
               fi
     ```
  2. **Applicazione migrazioni al deploy** — pre-deploy hook Render (`preDeployCommand`) o, meglio,
     migrare i cron/deploy a un runbook che applica le SQL **prima** di instradare traffico.
- **Verifica:** aggiungi un file `migrations/NNN_*.sql` non applicato → il job CI deve fallire (exit 1).
- **Colore:** cablare CI = 🟡; **applicare migrazioni in prod = 🔴 Nicola** (potenzialmente
  irreversibile). **Dipendenza dura:** lo step migrazioni dipende dalle **SQL degli altri
  workstream** (backend-dev/security) — cablarlo a set congelato.
- **Rollback:** rimuovere il job; nessuna scrittura DB nel gate (drift-check è read-only).

## 5. 🔴 `RESEND_FROM` placeholder (`no-reply@example.com`) mancante in render.yaml
- **Causa-radice:** `lib/env.ts:44` default `MyCity <no-reply@example.com>`, usato come `from`
  (`lib/email/client.ts:51`). Resend rifiuta un dominio non verificato → **ogni** email
  transazionale fallisce, e l'errore va solo a `logger.error` (perso in prod — vedi #3).
  `render.yaml` elenca `RESEND_API_KEY` ma non `RESEND_FROM`.
- **Fix ESATTO:** `RESEND_FROM` + `RESEND_REPLY_TO` aggiunti a `render.yaml` (`sync:false`, dominio
  verificato DKIM/SPF/DMARC). + guardrail: l'health check ora va **degraded (503)** se il from è
  vuoto o contiene `example.com` (vedi #7, `checks.payments`).
- **Verifica:** deploy con `RESEND_FROM=ordini@mydominio.it` → `/api/health` 200 su payments; invio
  di prova consegnato.
- **Colore:** valore reale = 🔴 (config prod, Nicola sceglie il dominio). **Rollback:** rimuovere le
  env. **Rischio:** nullo.

## 6. 🟡 Cron fuori-IaC + payout 200 in fallimento + watchdog auto-referenziale
- **Causa-radice:** cron su cron-job.org esterno (`render.yaml:73-92`) — se lo scheduler cade,
  nessuno gira **incluso** il watchdog `operational-alerts` (`lib/cron-health.ts`), e `/api/health`
  non se ne accorgeva. `release-payouts` ritorna **HTTP 200** anche con `failed>0` (`route.ts:187-190`)
  → un monitor "alert on non-200" non vede i payout falliti. `external-price-alerts` non è nelle
  soglie di staleness.
- **Fix ESATTO — 3 punti:**
  1. **payout non-200 in fallimento** — `app/api/cron/release-payouts/route.ts:181-190`, sostituire
     il return finale:
     ```ts
       const anyFailed = failed > 0 || riderFailed > 0 || codFailed > 0;
       if (anyFailed) {
         logger.error('[cron] release-payouts: fallimenti parziali', { failed, riderFailed, codFailed });
       }
       return NextResponse.json(
         { ok: !anyFailed, released, skipped, failed, riderReleased, riderSkipped, riderFailed, codReleased, codSkipped, codFailed },
         { status: anyFailed ? 500 : 200 },
       );
     ```
  2. **heartbeat esposto in `/api/health`** — fatto in `patches/health-route.ts` (`checks.cron`):
     l'uptime monitor esterno intercetta lo scheduler morto **senza** dipendere dal cron
     auto-referenziale.
  3. **`external-price-alerts` nelle soglie** — `lib/cron-health.ts:20-28`, aggiungere:
     ```ts
       'external-price-alerts': 180, // cadenza 1 h
     ```
     (`operational-alerts` resta escluso by-design: non può auto-vigilarsi → coperto dall'uptime
     monitor sul nuovo `checks.cron`.)
  - **Consigliato (Nicola):** migrare i cron a **Render Cron** (IaC, retry, log nativi) — template
    già commentato nel `render.yaml` corretto.
- **Verifica:** forzare un `failed>0` di payout → il cron risponde 500; fermare i heartbeat →
  `/api/health` 503 con `checks.cron` che nomina i cron stale.
- **Colore:** patch codice in branch = 🟡; migrazione cron a Render (a pagamento) = 🔴 Nicola.
  **Rollback:** git revert. **Rischio:** un 500 sul cron è voluto (segnale), non un outage utente.

## 7. 🟡 Health check dà falsa fiducia (ignora env pagamenti)
- **Causa-radice:** `/api/health` (`route.ts:38-44`) verifica DB + sole 3 env
  (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`). Non controlla
  Stripe/webhook/Resend/CRON → deploy con pagamenti rotti passa 200 e riceve traffico.
- **Fix ESATTO** (`consegne/bonifica/patches/health-route.ts`): aggiunto `checks.payments`
  (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `CRON_SECRET` + `RESEND_FROM`
  non-placeholder) e `checks.cron` (#6). DB resta gate primario; qualsiasi check ko → `degraded`
  503.
- **Verifica:** deploy senza `STRIPE_WEBHOOK_SECRET` → `/api/health` 503 con `checks.payments`.
- **Colore:** 🟡. **Rollback:** git revert. **Rischio:** un deploy realmente incompleto ora
  risponde 503 e Render non instrada — comportamento **voluto** (fail-closed). Assicurarsi che tutte
  le env critiche siano settate **prima** del cutover (checklist #8).

## 8. 🟡 render.yaml manifest env incompleto
- **Causa-radice:** mancavano `VAPID_*` (cron send-push no-op silenzioso), `SUPPORT_EMAIL`,
  `STRIPE_CONNECT_CLIENT_ID` (onboarding Connect), `INTERNAL_API_SECRET`, `NEXT_PUBLIC_POSTHOG_HOST`,
  `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
- **Fix ESATTO:** tutte aggiunte in `patches/render.yaml` (`sync:false`) con commento sul cron/feature
  che le richiede.
- **Verifica:** deploy Blueprint mostra tutte le env attese da settare.
- **Colore:** 🟡. **Rollback:** git revert. **Rischio:** nullo (dichiarative).

## 9. 🟡 Source map Sentry non caricate (stack trace minificati)
- **Causa-radice:** `next.config.js:89-104` gira `withSentryConfig` se il DSN è impostato, ma
  l'upload source map richiede `SENTRY_AUTH_TOKEN` (+`SENTRY_ORG`/`SENTRY_PROJECT`), assenti in
  `render.yaml`; con `silent:!process.env.CI` l'upload viene saltato in silenzio.
- **Fix ESATTO:** `SENTRY_AUTH_TOKEN`+`SENTRY_ORG`+`SENTRY_PROJECT` aggiunti a `patches/render.yaml`
  (`sync:false`, necessari solo se Sentry è abilitato).
- **Verifica:** deploy con DSN+token → in Sentry gli errori mostrano stack trace de-minificati.
- **Colore:** 🟡 (valori = segreti, li mette Nicola nel dashboard). **Rollback:** rimuovere env.
  **Rischio:** nullo.

---

## Extra (fuori dai 9, segnalato): regione app↔DB
`render.yaml` app in **Frankfurt**, DB Supabase in **Paris**. Latenza ~10ms round-trip:
accettabile, non un incidente. Allineare la region richiederebbe ricreare il servizio (🔴, non vale
la pena ora). Commento aggiunto nel render.yaml corretto per non perdere la nota.

## Riepilogo colori
| # | Finding | Applicazione branch | Azione prod |
|---|---------|--------------------|-------------|
| 1 | B3 build devDeps | 🟡 | 🔴 deploy + conferma reale Render |
| 2 | install divergente | 🟡 | — |
| 3 | log muti prod | 🟡 | — |
| 4 | migrazioni/drift | 🟡 (CI) | 🔴 applicare SQL prod (dip. backend-dev) |
| 5 | RESEND_FROM | 🟡 | 🔴 dominio verificato |
| 6 | cron/payout/watchdog | 🟡 | 🔴 (opz.) migrare a Render Cron |
| 7 | health env pagamenti | 🟡 | — |
| 8 | env incompleto | 🟡 | 🔴 valori reali dashboard |
| 9 | source map Sentry | 🟡 | 🔴 token dashboard |
