# 🧠🗺️ Mappa delle due memorie e di tutti i flussi di dati — MyCity OS

> **Data:** 2026-07-06 22:05 (ora di Piacenza) · **Autore:** AD (risposta a domanda di Nicola)
> Fotografia presa dal codice reale del repo `ad-mycity`. Ogni affermazione ha la fonte nel file citato.

---

## 1. I tre archivi (due memorie + una fonte di verità)

| Archivio | Dove | Natura | Accesso |
|---|---|---|---|
| **Memoria lunga — GitHub** | repo `NicolaeRotaru/ad-mycity`, ramo unico `main` | file (vault, consegne, quaderni, codice della macchina) | la macchina legge/scrive via git; il Pannello legge via GitHub API |
| **Memoria veloce — Supabase «memoria»** | progetto `xjljcsorpbqwttrejqte` | tabelle (coda lavori, battiti, digest, chat) | solo chiave `service_role` (RLS chiusa); Pannello e VPS |
| **Dati del business — Supabase «marketplace»** | progetto `clmpyfvpvfjgeviworth` | tabelle del negozio (orders, products, profiles…) | **sola lettura** per tutti; scrittura solo firmata con backup |

Trappola dei nomi (fonte: `cervello/vps/.env.example`, `pannello/.env.example`):
- `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` (senza prefisso) = progetto **MEMORIA**;
- `MARKETPLACE_SUPABASE_URL/_KEY/_WRITE_KEY` = progetto **MARKETPLACE**;
- `MEMORIA_SUPABASE_*` esiste solo nel drop-in admin-chat dentro il sito (`consegne/marketplace/admin-chat/`).
- Il worker rifiuta per sicurezza un URL marketplace al posto della memoria (`cervello/worker.sh`).

---

## 2. La memoria GitHub, pezzo per pezzo (chi scrive → chi legge)

| Dove | Cosa | Chi scrive | Chi legge |
|---|---|---|---|
| `MyCity-Vault/01…07` | note di Nicola: strategia, piani, OKR, mansionari vault | **Nicola**; l'AD solo blocchi-proposta 🤖 delimitati nei Piani (`giro.md` passo 9) | AD/senior a ogni giro; Pannello (`/api/memoria/piani`, `/okr`) |
| `90-Memoria-AI/STATO.md` | i 7 numeri chiave + ora | il giro (o analista) | Pannello (`/api/memoria/stato`); giro successivo come baseline |
| `…/AZIONI-IN-ATTESA.md` | coda firme (tabella 8 colonne + blocchi 🟡/🔴) | giro, senior, `supervisione-negozi.mjs`; il worker segna ✅/❌ | Pannello «Da firmare»/«Azioni» (parser `src/lib/azioni-attesa.ts`); `notifica-approvazioni.mjs` → Telegram |
| `…/DECISIONI.md` | log append-only decisioni + mani eseguite LIVE | giro, worker, `esegui-azione.mjs` (traccia automatica), finanza | Pannello (`/api/memoria/decisioni`) |
| `…/SALA-OPERATIVA.md` | feed FACCIO/FATTO/SERVE/PASSO-A | AD e senior | Pannello (`/api/feed`, `/api/agenti-live`); guardiano `chiusura-loop --gate` |
| `…/Briefing/*.md` + `ultimo-briefing.json` | report completo del giro + digest | il giro | Pannello (card «Cosa ho scoperto» — funziona anche senza Supabase) |
| `…/Intelligence/*.md` | radar concorrenti · eventi/picchi · buchi di mercato | il giro | Pannello (Mondo → Intelligence) |
| `…/intenzioni-nicola.json` | le prossime mosse di Nicola + cosa l'AD pre-prepara | il giro | Pannello (card «Mosse di Nicola») |
| `…/auto-coscienza/*.json` (19 file) | salute, registro-realtà, cantiere difetti, apprendimento, calibrazione, cecità sensori, runway… | guardiani, sonde, auto-analisi | Pannello (Cervello); giro successivo; `midollo-spinale.mjs` |
| `memoria-squadra/*.md` (radice, percorso canonico AR-034) | quaderni ESITO dei senior (scorecard 6 assi) | senior via `chiusura-loop.mjs registra` | ogni senior a inizio lavoro; Pannello (`/api/memoria/quaderni`) |
| `consegne/` + `creativi/` | lavori finiti + backup del marketplace | senior in doer-mode 🟢 | Nicola via Pannello (`/api/consegne`, `/api/azione-scheda`) |
| `cervello/`, `.claude/agents/`, `pannello/` | il corpo: script, 120 mansionari, codice del Pannello | Nicola; auto-modifiche solo via PR 🟡 | la macchina stessa; **Vercel** (push su main → deploy Pannello); Pannello Esplora |

**Come si scrive (pubblicazione — `giro.md` «DOVE PUBBLICARE»):**
- **VPS:** file → `git add/commit/push` su `main`, push **non-force con rebase** (3 tentativi), sotto lock condiviso col worker; prima del push: `scan-segreti.mjs` + `onesta-check.mjs` (`giro.sh:420-519`).
- **Sessione cloud:** commit sul ramo di lavoro → **PR con base `main`** → merge (`git-pr.mjs`/`git-merge.mjs`, token `GIT_PUSH_TOKEN`).
- Log append-only con `merge=union` in `.gitattributes` (SALA-OPERATIVA, DECISIONI, Briefing, quaderni); snapshot protetti dal push non-forzato.

**Come si legge:**
- macchina = file locali del clone; Pannello = **GitHub Contents API** (`pannello/src/lib/obsidian.ts`: token `OBSIDIAN_*`, ramo `main`, ripiego sola-lettura `memoria-ad`, timeout 5s, no-cache); Nicola = Pannello o Obsidian.
- Il Pannello **non committa mai** su GitHub: `writeNote()` esiste in `obsidian.ts` ma non è usata da nessuna route.

---

## 3. La memoria Supabase, tabella per tabella

Schema: `pannello/sql/memoria-schema.sql` (5 tabelle attive) + `operatore-macchina-schema.sql` (~22 tabelle a specchio del vault, migrazione pronta). RLS attiva senza policy pubbliche → solo `service_role`.

| Tabella | Serve a | Chi scrive | Chi legge |
|---|---|---|---|
| `lavori` | coda comandi (IPC): chat, giro, approvazioni; stati in_attesa→in_corso→fatto/errore; retry (`tentativi`, `riprova_dopo`); fili chat (`gruppo_id`) | Pannello (`store.ts creaLavoro`), admin-chat del sito, worker (esiti) | **worker** (poll 5s), Pannello (poll 2–8s) |
| `impostazioni` | chiave/valore: battiti (`cuore:ultimo_giro`, `worker:ultimo`, `automazione:*`, `memoria-ad:ultimo_push`), flag (`autopilota`, `pausa`, `worker:riavvia`, `azione:<id>`, `proposta:*`, `risposta:*`), registro `azioni_log` | ogni script VPS via `stampSegnale()` (`git-github.mjs`); Pannello (flag) | Pannello (Cuore/diagnosi), worker (riavvio), sentinelle |
| `briefings` | digest dell'ultimo giro (situazione/opportunità/azioni) | il giro (curl a fine giro, `giro.md:103-109`) | Pannello (card in alto) |
| `conversazioni` | chat sincronizzate tra dispositivi | Pannello | Pannello (fallback: localStorage) |
| `diario` | log di ciò che l'AD dice/fa | Pannello, worker | Pannello (Storico) |
| `decisioni, azioni_in_attesa, sala_operativa, sentinelle(+scattate), stato_kpi, registro_realta, apprendimento, calibrazione, cantiere_difetti, okr_squadra…` | specchio a DB delle strutture del vault | *(migrazione predisposta; oggi il codice usa soprattutto le 5 sopra — la fonte viva resta il vault)* | — |

MCP: `.mcp.json` definisce **solo** `supabase-marketplace` e `supabase-memoria`, **entrambi `--read-only`** (AR-091 del 3/7). Le scritture vere passano **sempre da REST** con le chiavi service_role, mai dall'MCP. Token unico `SUPABASE_ACCESS_TOKEN` da separare = cantiere AR-090.

---

## 4. Il DB del marketplace (sola lettura + l'unica porta di scrittura)

- **Lo scrive solo il sito** MyCity (clienti/negozianti che ordinano, si registrano, caricano prodotti).
- **Lo leggono:** Pannello (`src/lib/marketplace-db.ts`, **solo GET**, service_role, cache 45s: orders, order_items, profiles, products, categories, abandoned_carts, store_reviews); la macchina a ogni giro (REST `MARKETPLACE_SUPABASE_KEY`, 3 retry — `verifica-sensori.mjs`); `supervisione-negozi.mjs` (catalogo/gap); AD e senior in sessione (**priorità REST → MCP riserva → baseline**, mai numeri inventati; il gate lo applica `giro.sh` con `SENSORI_VINCOLO`).
- **Payout:** il Pannello NON ha chiavi Stripe: stima i payout dai campi in centesimi degli ordini. Stripe è letto solo dai sensori VPS (`sensore-cassa.mjs` → `cassa-runway.json`).
- **L'unica scrittura:** `marketplace.mjs aggiorna/inserisci/branding/home` — chiave dedicata `MARKETPLACE_SUPABASE_WRITE_KEY`, **solo con `AZIONI_LIVE=1`** (= dopo firma), **backup riga per riga** in `creativi/output/marketplace-backup/` prima di ogni PATCH. Stessa doppia condizione per le notifiche in-app (`esegui-azione.mjs notifica` → tabella `notifications`).

---

## 5. La matrice attori × archivi

| Attore | GitHub (lunga) | Supabase memoria (veloce) | Supabase marketplace | Mondo |
|---|---|---|---|---|
| **Nicola** | legge tutto; scrive le sue cartelle vault | indiretto via Pannello (firme, chat) | — | firma → mani |
| **Pannello (Vercel)** | LEGGE (Contents API; mai commit) | LEGGE+SCRIVE (lavori, flag, chat, diario) | LEGGE (GET) | email/n8n solo `AZIONI_LIVE=1` |
| **Giro/AD sul VPS** | SCRIVE (push main) + legge file locali | SCRIVE digest+battiti | LEGGE (REST) | web/radar; Stripe lettura |
| **AD in sessione cloud** | SCRIVE via PR base main | legge via MCP read-only | legge (REST→MCP) | WebSearch/WebFetch |
| **Worker** | scrive esiti (✅ coda, DECISIONI) + push | LEGGE coda 5s, riscrive esiti, battito | — | esegue le mani approvate |
| **Senior (120)** | scrivono consegne/creativi/quaderni/SALA/coda firme | — | leggono (REST/MCP) | mai diretto: tutto via coda firme |
| **Guardiani/sensori** | scrivono `auto-coscienza/*.json` | battito `automazione:*` | leggono | Stripe/uptime lettura |
| **Sito MyCity** | — | admin-chat può accodare lavori | **unico vero scrittore** | serve clienti |
| **Mani (Resend/TG/n8n)** | traccia LIVE in DECISIONI.md | — | solo `notifications` firmato | unica uscita, dietro kill-switch |
| **Vercel/GitHub** | push su main → deploy Pannello | — | — | cron 9:00 battito · 19:07 report |

---

## 6. I sei viaggi tipo

1. **Il giro (ogni 2h, VPS):** timer systemd → `giro.sh` → delta-gate (pieno o sonda) → sensori+guardiani (esiti = vincoli duri nel prompt) → motore AI esegue `giro.md` → scrive vault (briefing, STATO, Intelligence, coda firme, SALA, intenzioni, auto-coscienza) → cancelli segreti/onestà → commit+push main → digest in `briefings` + battiti in `impostazioni` → Telegram avvisa delle firme nuove → il Pannello mostra tutto entro 60s.
2. **Una chat dal Pannello:** input → `POST /api/lavori` (riga in_attesa) → worker (5s) → motore AI risponde → worker riscrive la riga (fatto/errore) → Pannello (poll 2s) mostra e salva in `conversazioni`.
3. **Un'azione approvata:** proposta nella coda firme (contenuto in `consegne/`) → Approva nel Pannello → flag `azione:<id>` (idempotenza) + lavoro `esegui-azione` → worker esegue `esegui-azione.mjs` sul canale giusto (dry-run se `AZIONI_LIVE=0`) → traccia in DECISIONI.md + ✅ in coda → push → esito nel quaderno del senior.
4. **Supervisione negozi:** legge il marketplace (sola lettura) → classifica gap in autofill/procura/mai (blocklist legale/fiscale/KYC) → report in `consegne/supervisione/` + proposte 🟡 in coda → dopo firma: `marketplace.mjs aggiorna` con backup per riga.
5. **Il battito:** ogni script timbra `automazione:<nome>`; giro/worker timbrano `cuore:*`/`worker:*` → Pannello (battito.ts) decide «Vivo» (<26h) → cron Vercel: 9:00 giro, 19:07 report → worker muto >15 min = sentinella + bottone «Riavvia worker».
6. **Una radiografia:** workflow legge il codice (clone `marketplace/` o la macchina stessa) → verifica avversariale dei problemi → report in `consegne/audit|design/` + cantiere in `auto-coscienza/` → fix proposti 🟡 in coda firme.

---

## 7. Chiavi e confini

| Chiave | Dove | Apre | Limite |
|---|---|---|---|
| `SUPABASE_URL/_SERVICE_KEY` | VPS+Vercel | memoria veloce R/W | solo server; RLS chiusa |
| `MARKETPLACE_SUPABASE_URL/_KEY` | VPS+Vercel | dati marketplace | sola lettura (solo GET nel codice) |
| `MARKETPLACE_SUPABASE_WRITE_KEY` | solo VPS | scrittura marketplace | solo `AZIONI_LIVE=1` + firma + backup |
| `OBSIDIAN_TOKEN` (+owner/repo/branch) | Vercel | Pannello legge vault | main + ripiego memoria-ad; scrittura non usata |
| `GIT_PUSH_TOKEN` | VPS | push memoria, PR, merge | non-force; cancelli prima del push |
| `GITHUB_TOKEN` | Vercel | lettura codice mycity | sola lettura Contents |
| `STRIPE_SECRET_KEY` | VPS | saldo/cassa | sola lettura; il Pannello non ce l'ha |
| `RESEND_API_KEY · TELEGRAM_* · N8N_WEBHOOK_URL` | VPS (+n8n su Vercel) | le mani | tutte dietro `AZIONI_LIVE` (default 0) |
| `SUPABASE_ACCESS_TOKEN` (MCP) | sessioni | 2 server MCP Supabase | entrambi read-only; token da separare (AR-090) |
| `CRON_SECRET` | Vercel | endpoint battito | fail-closed (401) |

Principi: **una sola uscita verso il mondo** (mani) e **una sola porta di scrittura sul negozio** (marketplace.mjs), entrambe dietro kill-switch+firma; **due progetti Supabase separati**; **il Pannello non committa mai**; log append-only con fusione automatica, snapshot protetti dal push non-forzato.

---

*Fonti: `cervello/giro.md`, `cervello/giro.sh`, `cervello/worker.sh`, `cervello/vps/.env.example`, `cervello/esegui-azione.mjs`, `cervello/marketplace.mjs`, `cervello/verifica-sensori.mjs`, `cervello/supervisione-negozi.mjs`, `cervello/notifica-approvazioni.mjs`, `pannello/.env.example`, `pannello/sql/*.sql`, `pannello/src/lib/{obsidian,vault,store,marketplace-db,mani,azioni,battito,azioni-attesa}.ts`, `pannello/vercel.json`, `.mcp.json`, `.gitattributes`.*
