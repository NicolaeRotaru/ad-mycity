# AGENTS.md

This repo (`ad-mycity`) is a monorepo with two parts:
- The "brain" (markdown vault + agent prompts) in the root, `MyCity-Vault/`, `cervello/`, `consegne/`, `memoria-squadra/`. See `CLAUDE.md` for the operating manual (in Italian).
- The runnable code:
  - `pannello/` — the main application: a **Next.js 15** control-panel dashboard (the "face" of the AD). Setup/run docs in `pannello/README.md` and `pannello/LEGGIMI.md`.
  - `creativi/` — a small **Node.js (ESM)** toolchain that generates QR codes and printable PDFs.

## Cursor Cloud specific instructions

### Services & how to run them
- **`pannello/` (Next.js dashboard)** — primary app. Node 22.x. Run the dev server with `npm run dev` in `pannello/` (serves on `http://localhost:3000`). Standard scripts are in `pannello/package.json`.
- **`creativi/` (Node toolchain)** — not a server. Run scripts directly, e.g. `node genera-qr.mjs "<URL>" out.png` from `creativi/`.

### Non-obvious caveats
- **No secrets are required to run/test the pannello.** It degrades gracefully: without Supabase/GitHub/PostHog env vars (see `pannello/.env.example`) the data routes still return HTTP 200 with empty/fallback data. The Pannello deliberately has **no Anthropic/Claude API key** — the "brain" runs separately via Claude Code.
- **Demo mode is the easiest end-to-end check without secrets.** Click "Attiva la demo" on the dashboard (or `POST /api/demo {"on":true}`, which sets the `mycity_demo=on` cookie). This populates KPIs, the "cuore" heartbeat, and action queues with clearly-labelled example data — nothing real is sent.
- **Lint is NOT configured.** `npm run lint` (`next lint`) only launches an interactive ESLint setup prompt (no `.eslintrc` in the repo) and will hang in a non-interactive shell. Use `npx tsc --noEmit` in `pannello/` for static checks instead.
- **`pannello` build runs a prebuild step** (`node ../cervello/genera-grafo.mjs`) guarded with `|| true`, so a missing/failed graph generation does not break the build. Dev mode (`npm run dev`) does not run it.
- Both `pannello/` and `creativi/` use **npm** (each has its own `package-lock.json`); install deps separately in each folder.
