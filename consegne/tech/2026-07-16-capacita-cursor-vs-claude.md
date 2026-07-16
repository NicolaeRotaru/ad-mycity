# Controllo capacità: cosa poteva fare Cursor che oggi Claude non può

- **Data:** 2026-07-16 11:12 (Europe/Rome)
- **Richiesta di Nicola:** «fino a ieri ho usato Cursor come worker/cervello: controlla se c'è qualcosa che Cursor poteva fare e che tu adesso non puoi fare, e dai una controllata alle modifiche degli ultimi giorni»
- **Metodo:** lettura di `cervello/motore-ai.sh`, `worker.sh`, `giro.sh`, `ritmo.sh`, `monitora.sh`, `worker-plugins.json`, `sync-worker-plugins.mjs`, `.claude/settings.json`, `.cursor/` (skills+rules), `AGENTS.md`, `cervello/vps/*` (setup, checklist, servizi), Pannello (`worker-salute`, `obsidian.ts`, `parla.ts`) + git log dal 10/7.

## Verdetto in una riga
Il passaggio a Claude regge (e sblocca cose che con Cursor non funzionavano: senior, workflow, freni di sicurezza), ma **4 pezzi sono rimasti agganciati a Cursor**: i 21 plugin/skill del worker, il preflight di autenticazione, alcune mani (comandi) che il prompt promette ma l'allowlist nega, e documenti-rotaia vecchi (AGENTS.md → ramo `memoria-ad` pensionato).

---

## 1. I veri gap (cosa Cursor faceva e Claude oggi NO)

### 1.1 🔴 I 21 plugin/skill del worker vivono in `.cursor/skills/` — Claude non li carica
- `cervello/worker-plugins.json` (fase 1+2+3, sync del 2026-07-13) installa tutto in `.cursor/skills/` e `.cursor/rules/`; `sync-worker-plugins.mjs` scrive SOLO lì.
- Claude Code carica le skill da **`.claude/skills/`**, dove oggi c'è solo `verify`. Risultato: grilling, systematic-debugging, tdd, differential-review, supabase, react-best-practices, webapp-testing, pdf/xlsx/docx… **per il motore Claude non esistono**.
- Aggrava: `worker.sh → plugin_prompt_for_tipo()` continua a dire al modello «PLUGIN (skill Cursor approvate): …» — gli si promette una cassetta degli attrezzi che non c'è (rischio: il modello finge di usarle o perde tempo a cercarle).
- Il manifest stesso lo sapeva: in `candidati_fase4` c'è la nota «esporre anche come … per parity worker».
- **Fix proposto (🟡):** far scrivere a `sync-worker-plugins.mjs` OGNI skill anche in `.claude/skills/<id>/SKILL.md` (il formato SKILL.md con frontmatter è lo stesso), e rendere `plugin_prompt_for_tipo` consapevole del motore. `ponytail` è una rule `.mdc` scoped (non una skill): per Claude va portata come skill o dentro CLAUDE.md.

### 1.2 🟠 Mani ristrette: cose che il worker Cursor faceva e l'allowlist Claude nega
Cursor girava `agent -p --force --trust` = **qualsiasi comando**. Claude in headless può usare solo ciò che sta in `.claude/settings.json` + l'allowlist inline di `motore-ai.sh` (tutto il resto = negato senza possibilità di chiedere). Differenze concrete:
- **`npx tsc --noEmit` e `npm run build` nel Pannello: NEGATI.** AGENTS.md li prescrive come verifica standard; oggi il worker non può più compilare/typecheckare il codice prima di aprire una PR (permessi solo `node --test` e `npx bats`). → più PR che arrivano rotte al deploy.
- **`git show` e `git rev-parse`: NEGATI, ma il prompt della chat li promette** («Bash per git in locale (status, log, diff, show…)», worker.sh riga ~1178). Il modello ci prova e sbatte sul muro.
- `journalctl`/`systemctl`/`ps`: negati (diagnosi VPS in autonomia non più possibile — mitigata dal bottone «Riavvia worker» e da worker-salute).
- `rm`/`git rm`/`git mv`: negati → il worker può creare/modificare file ma non cancellarli o spostarli.
- **Decisione da firmare (🟡):** o si aggiungono poche righe mirate all'allowlist (`Bash(npx tsc --noEmit:*)`, `Bash(npm --prefix pannello run build:*)`, `Bash(git show:*)`, `Bash(git rev-parse:*)`) o si tolgono le promesse dal prompt. Nota onesta: `node cervello/*.mjs` già permette di eseguire codice arbitrario scritto dall'AD in `cervello/`, quindi tsc/build non allargano davvero il perimetro.

### 1.3 🟠 Autenticazione: per Cursor c'è tutta la rete di sicurezza, per Claude niente
- `ai_check()` verifica l'auth SOLO per Cursor (`agent status`, messaggi di fix, `collega-cursor.sh`). Per Claude controlla solo che il binario esista: **se il login scade sul VPS, nessun preflight lo dice** — i lavori muoiono a runtime con errori criptici.
- Non esiste un `collega-claude.sh` (equivalente naturale: `claude setup-token` → `CLAUDE_CODE_OAUTH_TOKEN` nel `.env`; oggi nel cervello non c'è NESSUN riferimento a quella variabile).
- Il Pannello (`api/worker-salute`) in 2 rami dice ancora «Quasi sempre: auth Cursor mancante → collega-cursor.sh» come primo rimedio per worker fermo/crash-loop: col motore Claude è un consiglio fuorviante per Nicola. (La parte quota Claude invece è già stata aggiornata bene.)
- **Fix proposto (🟡):** preflight auth Claude in `ai_check` + script `collega-claude.sh` + testo di worker-salute condizionato al motore.

### 1.4 🟠 Rotaie di carta rimaste a Cursor (trappole di coerenza, stile AR-102)
- **`AGENTS.md` e `.cursor/rules/mycity-ad.mdc` ordinano ancora di pubblicare la memoria sul ramo `memoria-ad`** («Non scrivere la memoria solo su main: la Cabina non la leggerebbe» — oggi è ESATTAMENTE il contrario: CLAUDE.md/giro.md = ramo unico `main`, `memoria-ad` in pensione). Chiunque legga quei file (agente Cursor cloud, tool esterno) scrive la memoria nel posto sbagliato; il Pannello la vedrebbe solo dal ripiego.
- `cervello/vps/setup.sh`: default motore ancora `cursor` (installa la CLI di Cursor se rilanci il setup senza variabili); `CHECKLIST-VIVO.md` è tutta «consigliato SOLO Cursor»; `worker.ps1` in auto preferisce Cursor — l'opposto di `motore-ai.sh`, dove dal 10/7 auto = Claude prima.
- **Fix proposto (🟡):** riscrivere AGENTS.md + mycity-ad.mdc al ramo unico e allineare setup.sh/CHECKLIST/worker.ps1 al default Claude.

### 1.5 🟡 Da verificare sul VPS (non dimostrabile da qui)
- **MCP in headless:** `.mcp.json` (supabase read-only) è di progetto: senza `"enableAllProjectMcpServers": true` nei settings o un'approvazione interattiva già data sul VPS, il `claude -p` del worker NON carica quei server → le voci `mcp__supabase-*` dell'allowlist restano inerti. Non blocca nulla (i dati passano già da `curl` REST, che è la fonte-di-verità dichiarata), ma se vuoi l'MCP anche sul VPS serve quella riga.
- Che `claude` sul VPS sia autenticato con piano adeguato (i commit del worker di stanotte 01:07 fanno pensare di sì).

---

## 2. Il bilancio onesto: cosa GUADAGNI col motore Claude (che Cursor non aveva)
- **I 120 senior (`.claude/agents/`) e i 5 workflow (`.claude/workflows/`: radiografia, audit-design, audit-pannello, auto-radiografia, giro-operativo) funzionano SOLO con Claude** (strumento Task/Workflow). Con Cursor quella parte del mansionario era lettera morta: il prompt dei lavori dice «delega ai senior (strumento Task)» — ora è vero.
- **I freni di `.claude/settings.json` ora valgono davvero.** Con Cursor `--force --trust` NON esisteva allow/deny (lo ammette il commento in motore-ai.sh): `.env` era leggibile dal modello, `git push`/`gh` possibili. Ora: `.env` negato in lettura/scrittura, push diretto negato (solo `git-pr.mjs`), settings non auto-modificabili.
- Memoria di sessione (`--resume`), streaming parziali, thinking budget (`MAX_THINKING_TOKENS`), diagnosi errori: già cablati per Claude nel worker.

## 3. Controllata alle modifiche degli ultimi giorni (10–16/7)
Ho riletto i pezzi principali: due-worker (lane all+chat, claim atomico, worker_owner, grazia orfani), reload sicuro con gate di provenienza, fail-closed sulla pausa, timeout su tutte le curl, dedup risposte chat, impronta-verità, memoria di sessione, allegati chat (con fix path-traversal), freni-sicurezza Pannello, chat casella unificata (PR #400-402). **Non ho trovato rotture**: il lavoro è coerente e coperto da 24 file di test bats (incluso il test di guardia sull'ordine di `--allowedTools`). Le uniche cose «rimaste indietro» dal cambio motore sono i 4 punti della sezione 1 — in particolare i plugin (1.1), che sono l'investimento del 13/7 rimasto orfano.

## 4. Cantiere proposto (in ordine di impatto sulla crescita) — tutte auto-modifiche = 🟡 firma di Nicola
1. **Parity skill** → sync speculare in `.claude/skills/` + prompt del worker consapevole del motore (riattiva l'investimento del 13/7).
2. **Auth Claude**: preflight in `ai_check` + `collega-claude.sh` + messaggi worker-salute per-motore (evita il prossimo «worker fermo e non capisco perché»).
3. **AGENTS.md + mycity-ad.mdc** al ramo unico `main` (chiude una bugia di rotaia che può risuscitare `memoria-ad`).
4. **Allowlist**: decidere le 4 righe (tsc/build/git show/rev-parse) o correggere il prompt della chat.
5. **setup.sh / CHECKLIST-VIVO / worker.ps1** allineati al default Claude.

*Nessuna di queste l'ho toccata: regola del governo — la macchina non si modifica da sola. Dimmi quali punti firmi e li eseguo (su branch + PR, come da rotaia).*

---

## ✅ ESITO — cantiere eseguito su firma di Nicola («fai il fix di tutti e 4 i punti»)

- **Data esecuzione:** 2026-07-16 11:39 (Europe/Rome) · branch `claude/cursor-capability-check-mgw8q3` (attivo solo dopo il merge di Nicola)
- **1. Parity skill — FATTO.** `sync-worker-plugins.mjs --specchia` copia in locale (senza rete) le 19 skill + ponytail (rule → skill) da `.cursor/skills/` a `.claude/skills/`; gira da solo all'avvio di worker/giro/ritmo; specchio idempotente, generato, ignorato da git (fonte unica resta `.cursor/`). Prompt del worker riscritto: non promette più «skill Cursor». Prova: 20 file specchiati, 2° giro = 0 aggiornati, e l'ambiente Claude li ha caricati subito come skill vive.
- **2. Allowlist — FATTO.** 4 righe in `.claude/settings.json`: `npx tsc --noEmit`, `npm --prefix pannello run build`, `git show`, `git rev-parse`. (Il file è deny-per-tool sull'auto-modifica: aggiornato via node, con la firma esplicita di Nicola in chat.)
- **3. Auth Claude — FATTO.** `ai_claude_auth_mode/ok` + preflight in `ai_check` (con via di fuga `CERVELLO_CLAUDE_AUTH_CHECK=0`); nuovo `cervello/vps/collega-claude.sh` (gemello di collega-cursor: token da `claude setup-token`, verifica, riavvio worker); il worker timbra `worker:motore`; il Pannello (`worker-salute`) adatta i consigli al motore vero e espone `motore`; `test-agent.sh` e `diagnostica-completa.sh` parlano anche Claude.
- **4. Rotaie di carta — FATTO.** `AGENTS.md` e `.cursor/rules/mycity-ad.mdc` riscritti al ramo unico `main` (memoria-ad dichiarato pensionato); `setup.sh` default `claude` + istruzioni collega-claude; `CHECKLIST-VIVO.md` con sezione Claude di default + riga sintomi; `SETUP-VPS.md` aggiornato; `worker.ps1` auto preferisce claude.
- **Verifiche:** `bash -n` su 8 script OK · `node --check` OK · **17/17 test bats** (9 nuovi `motore-ai-claude-auth.bats` + regressione cursor-auth/allowedtools) · `npx tsc --noEmit` nel pannello = 0 errori.
- **Residuo (1 riga, non bloccante):** `cervello/vps/.env.example` non modificabile da qui (freno sui file `.env*`): il template porta ancora il vecchio default — ma `collega-claude.sh` scrive da solo le righe giuste nel `.env` vero.
