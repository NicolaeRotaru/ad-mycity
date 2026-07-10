# Diagnosi completa — perché la macchina non apriva le PR (e ti faceva girare in tondo)

- **Data:** 2026-07-10 17:05 (Europe/Rome)
- **Chi:** AD (sessione cloud su richiesta di Nicola)
- **Ambito:** worker VPS (`cervello/worker.sh`), motore AI (`cervello/motore-ai.sh`), permessi Claude (`.claude/settings.json`), ritmo (`cervello/ritmo.sh`), PR #247

## TL;DR (5 righe)
1. Da ieri sera alle **23:54** ogni lavoro «con le mani» (giro, metabolizza, azioni approvate, playbook) **moriva alla partenza**: un bug di argomenti faceva sì che la CLI ricevesse il prompt DENTRO il flag `--allowedTools` → «Input must be provided…». Oggi: **49 metabolizzazioni su 49 in errore**, playbook e analisi ko, `automazione:pr` fermo alle 00:15.
2. La chat (l'unica corsia viva) aveva i **permessi al contrario**: poteva pushare su main ma NON creare branch → il flusso branch→PR era fisicamente impossibile; risultato: commit diretti su main e script improvvisati.
3. La **metabolizzazione morta = zero apprendimento** dalle tue correzioni → gli stessi errori tornavano a ogni chat («giro in tondo»).
4. La PR #247 l'hai aperta **tu a mano**: è stale e riporterebbe indietro il fix del deploy → va chiusa (contenuto già su main).
5. **Nessun commit è andato perso**: gli 80 commit dalle 5:00 sono TUTTI su main; l'unico lavoro «non mergiato» erano i 3 commit duplicati della #247.

## La catena dei 4 guasti (con le prove)

### Guasto 1 — Il prompt mangiato da `--allowedTools` (la causa radice del blackout)
Commit `b927a970` (9/7 21:54, PR #235 «la macchina apre PR da sola») ha aggiunto `--allowedTools <lista>` come **ultima** opzione di `AI_CMD`. Il flag è **variadico** (accetta più valori): quando il worker appende il prompt dopo (`"${AI_CMD[@]}" "$prompt"`), la CLI lo interpreta come altra regola-strumento e resta **senza prompt**.
- Prova nel DB memoria: 49/49 lavori `metabolizza` in errore con `Ignoring --allowedTools rule "**METABOLIZZA**"…`, 4 `playbook` e 1 `analisi` con `Error: Input must be provided either through stdin or as a prompt argument`.
- Effetto a catena: il **giro** ritenta 3 volte, fallisce e prosegue «senza cervello» (briefing baseline); `esegui-azione` (i tuoi «Approva») sarebbe morto allo stesso modo; `automazione:pr` fermo a stanotte 00:15 = `git-pr.mjs` mai più eseguito.
- **Fix:** `--allowedTools` ora viene PRIMA di `--permission-mode` (opzione a valore singolo che chiude la lista). Test di guardia: `cervello/test/motore-ai-allowedtools.bats` (3 casi).

### Guasto 2 — Permessi al contrario (perché la chat scriveva su main)
`.claude/settings.json` (arrivato su main con PR #246 alle 12:11) **permetteva** `git push origin main:*` e **non permetteva** `git checkout/switch/branch`. Tradotto: la strada vietata (main) era spalancata, la strada giusta (branch→PR) era chiusa. In più la regola `git push origin main:*` permetteva anche `git push origin main:feature/x` — è così che il branch della #247 è finito su GitHub. E in chat (10:05-10:10) l'AD ti ha fatto incollare nel `settings.local.json` del VPS regole ancora più larghe (`git push:*`, `curl:*`).
- **Fix:** tolto `git push origin main:*`; aggiunti `git checkout/switch/branch/stash`; aggiunte **deny** esplicite: `git push*main*` (nessuna sessione AI può più pushare main, né col trucco `main:feature/x` — le deny vincono su qualunque allow, anche quelle del settings.local.json del VPS) e `*api.github.com*` (niente più curl diretti all'API GitHub: l'unica mano per pubblicare è `node cervello/git-pr.mjs`, che pusha il branch e apre la PR; il merge resta la tua firma).

### Guasto 3 — Chat smemorata e senza prova dei fatti
Ogni chat è una sessione NUOVA: alle 10:14 l'AD scrive «le modifiche delle chat precedenti non sono qui… devo rifarle», alle 10:24 promette «ogni modifica al Pannello va in branch → PR», alle 10:33 committa l'auto-scroll **direttamente su main** (`dad1424`), poi le chip skill (`98a2b75`, `84bee73`). Diceva «fatto» senza verificare.
- **Fix (prompt):** il prompt della chat ora ha le **REGOLE DI VERITÀ**: mai «fatto» senza prova (git log/output), errori e permessi negati dichiarati subito, consapevolezza che la sessione parte da zero (verifica con git log/status prima di dire «già fatto»), nessun numero senza fonte, correzione esplicita degli errori propri.
- **Fix (strutturale, non aggirabile):** 📸 **impronta-verità** — a fine di ogni turno di chat che ha cambiato il repo, il worker (codice, non il modello) appende in chat lo stato REALE: branch, ultimo commit, file modificati non committati. Se l'AD sbaglia o omette, tu lo VEDI, e il turno dopo riparte dalla verità del disco.

### Guasto 4 — Lo spazzino del ritmo raccoglieva tutto su main
`ritmo.sh` faceva `git add -A` **globale** (2 punti): è così che `_tmp_create_pr.mjs` (script improvvisato da una chat) è finito committato su main alle 15:00 (`7f1f156`). Il giro invece era già limitato alle cartelle memoria (AR-044).
- **Fix:** anche il ritmo ora committa SOLO `MyCity-Vault consegne creativi memoria-squadra`; `_tmp_*` in `.gitignore`; `_tmp_create_pr.mjs` rimosso dal repo.

## PR #247 — chiusa, ecco perché
Aperta alle 12:15 **dalla UI GitHub** (titolo auto «Feature/skill rapide chat») dopo che l'AD non era riuscito ad aprirla da solo. Contiene 3 commit stale: le chip skill (GIÀ su main da `98a2b75`/`84bee73`), più un `vercel.json` VECCHIO che **riporterebbe indietro il fix del deploy** di stamattina (PR #246) e due file di stato (`routing.json`, `sentinella-dati.json`) vecchi. Mergiarla = rompere di nuovo il deploy. → Chiusa con spiegazione; il branch `feature/skill-rapide-chat` si può cancellare quando vuoi.

## Tutti i commit su main dalle 05:00 alle 16:50 (80)
**Riepilogo per tipo:** 47 spazzino/chat worker («worker: …») · 11 «recupero: scritture pendenti» · 7 giri memoria · 5 ritmo memoria · 8 codice/fix · 2 merge.
**Merge del periodo:** PR **#246** (permessi + deploy-gate) mergiata alle 12:11 — unica PR mergiata dopo le 5 (le #243/#245 erano prima delle 5; #244 chiusa senza merge alle 04:25).
**Commit «mai mergiati»:** nessuno perso — tutto quello che vedi sotto È su main. Fuori da main c'erano solo i 3 commit stale della #247.

| Ora | Commit | Autore | Messaggio |
|---|---|---|---|
| 05:01 | `4f3edfa` | AD MyCity VPS | worker: ## Conversazione finora Nicola: 1) quando entro dentro conve (0ff85f53-22cf-4a7f-851c-ed2843 |
| 05:09 | `318f23d` | AD MyCity VPS | worker: ## Conversazione finora Nicola: 1) quando entro dentro conve (4d0c29bc-d71f-4171-b6dd-bf1acb |
| 05:23 | `56b977f` | AD MyCity VPS | worker: ## Conversazione finora Nicola: 1) quando entro dentro conve (5dec65dd-406f-4f39-960d-07ee92 |
| 05:26 | `5c3d32b` | AD MyCity VPS | worker: ## Nuovo messaggio di Nicola ho un grosso problema, non ries (f50dabe4-626b-46ac-881a-4adfde |
| 05:33 | `34bad88` | AD MyCity VPS | worker: ## Conversazione finora Nicola: ho un grosso problema, non r (41e9902b-350d-430f-a40a-92e406 |
| 05:39 | `db1708d` | AD MyCity VPS | worker: ## Conversazione finora Nicola: sai andare in loop? voglio c (4ee8db65-4c71-4bb2-b591-bb4e90 |
| 05:42 | `9bec749` | AD MyCity VPS | pannello: chat più alta, textbox più compatta |
| 05:42 | `59cccf4` | AD MyCity VPS | worker: ## Nuovo messaggio di Nicola ingrandisci la chat normale qua (1864be41-8a13-42fc-b846-3d5460 |
| 05:47 | `19e6d69` | AD MyCity VPS | worker: ## Nuovo messaggio di Nicola sai andare in loop? voglio che  (8e48c5f4-d91d-4c2c-92e4-c3ca2e |
| 05:53 | `3a33383` | AD MyCity VPS | worker: ## Conversazione finora Nicola: sai andare in loop? voglio c (70388b14-4e19-442a-ad80-7e4929 |
| 06:00 | `980ebea` | AD MyCity VPS | recupero: scritture pendenti da ritmo interrotto (2026-07-10 06:00) |
| 06:01 | `fdf17ea` | AD MyCity VPS | ritmo AD (mattino): aggiorna memoria (2026-07-10 06:01) |
| 06:03 | `aa440f3` | AD MyCity VPS | recupero: scritture pendenti da ritmo interrotto (2026-07-10 06:03) |
| 06:04 | `55dd8e4` | AD MyCity VPS | ritmo AD (mattino): aggiorna memoria (2026-07-10 06:04) |
| 06:20 | `0b11779` | AD MyCity VPS | recupero: scritture pendenti da un giro interrotto (2026-07-10 06:20) |
| 06:21 | `f3bc4dc` | AD MyCity VPS | giro AD: aggiorna memoria (2026-07-10 06:21) |
| 08:20 | `34cb135` | AD MyCity VPS | recupero: scritture pendenti da un giro interrotto (2026-07-10 08:20) |
| 08:20 | `ada58d0` | AD MyCity VPS | giro AD: aggiorna memoria (2026-07-10 08:20) |
| 08:30 | `8444c0e` | AD MyCity VPS | recupero: scritture pendenti da un run interrotto (2026-07-10 08:30) |
| 10:06 | `19ba476` | AD MyCity VPS | worker: ## Conversazione finora Nicola: sai andare in loop? voglio c (b0886c92-03da-4f3d-af6f-13a5f6 |
| 10:08 | `04f3163` | AD MyCity VPS | worker: ## Conversazione finora Nicola: sai andare in loop? voglio c (a2ebd914-429b-475b-aab0-ff5785 |
| 10:10 | `59d80c8` | AD MyCity VPS | worker: ## Conversazione finora Nicola: sai andare in loop? voglio c (6fb996a6-35f0-453a-b75b-bb74d2 |
| 10:16 | `30297bd` | AD MyCity VPS | worker: ## Conversazione finora Nicola: sai andare in loop? voglio c (4e63102b-61a3-4e98-b56f-05464b |
| 10:18 | `113dd4b` | AD MyCity VPS | worker: ## Conversazione finora Nicola: sai andare in loop? voglio c (45d8dff6-2ea0-4946-a0c9-719432 |
| 10:20 | `e149a98` | AD MyCity VPS | recupero: scritture pendenti da un giro interrotto (2026-07-10 10:20) |
| 10:20 | `ed9de5a` | AD MyCity VPS | giro AD: aggiorna memoria (2026-07-10 10:20) |
| 10:22 | `ed7c65f` | AD MyCity VPS | worker: ## Conversazione finora Nicola: sai andare in loop? voglio c (03851adb-8593-4d1c-857f-6e05ce |
| 10:24 | `4302c28` | AD MyCity VPS | memoria: chiudi loop AR cantiere 10/7 — 42 chiusi, AR-006 in-corso |
| 10:25 | `a3db6ca` | AD MyCity VPS | worker: ## Conversazione finora Nicola: sai andare in loop? voglio c (70f10b58-b930-4f76-923e-025d44 |
| 10:27 | `75efb17` | AD MyCity VPS | worker: ## Nuovo messaggio di Nicola mi dà molto fastidio che ogni  (3c277ec1-a395-471d-972f-853ccb3 |
| 10:33 | `dad1424` | AD MyCity VPS | pannello: rimuovi auto-scroll automatico dalla chat |
| 10:33 | `51f2d78` | AD MyCity VPS | worker: ## Conversazione finora Nicola: mi dà molto fastidio che og (7c08687d-d134-4986-ac8d-2d5ff0f |
| 10:35 | `e38055e` | AD MyCity VPS | worker: ## Conversazione finora Nicola: mi dà molto fastidio che og (a41b4705-8937-4df2-a856-08a867a |
| 10:39 | `628280a` | AD MyCity VPS | worker: ## Conversazione finora Nicola: mi dà molto fastidio che og (d402a8c5-169b-4be1-b2d2-ba186e2 |
| 10:40 | `107d1b1` | AD MyCity VPS | worker: ## Conversazione finora Nicola: mi dà molto fastidio che og (bdff78e8-2fe7-4ab0-a725-a7e2833 |
| 10:43 | `366e0d2` | AD MyCity VPS | worker: ## Conversazione finora Nicola: mi dà molto fastidio che og (2c980981-72fd-4b83-aa0c-b6a6009 |
| 10:47 | `b8ce7f9` | AD MyCity VPS | worker: ## Conversazione finora Nicola: mi dà molto fastidio che og (ee19c29f-1518-4d24-aa9b-a69381f |
| 10:51 | `b9d1ffa` | AD MyCity VPS | worker: ## Conversazione finora Nicola: mi dà molto fastidio che og (18cacb97-4758-493e-801b-8d250f2 |
| 10:53 | `9550d65` | AD MyCity VPS | worker: ## Conversazione finora Nicola: mi dà molto fastidio che og (914f530e-1c4e-47be-8408-34e09c8 |
| 10:56 | `8ede255` | AD MyCity VPS | worker: ## Conversazione finora Nicola: mi dà molto fastidio che og (39c6f4b7-a016-48ef-bdc3-ba1ba82 |
| 10:59 | `fdd7f70` | AD MyCity VPS | worker: ## Conversazione finora Nicola: mi dà molto fastidio che og (7400bb7a-15a4-4a0a-a312-a2d4a85 |
| 11:02 | `fb3e4a8` | AD MyCity VPS | worker: ## Conversazione finora Nicola: mi dà molto fastidio che og (e28f01b1-6292-4d00-9877-b10b455 |
| 11:07 | `98a2b75` | AD MyCity VPS | pannello: aggiunge chip skill rapide nella chat di ogni casella |
| 11:07 | `aad132c` | AD MyCity VPS | worker: ## Nuovo messaggio di Nicola aggiungimi le skill dentro la c (d8e3a54c-598b-4c99-888a-45ef38 |
| 11:09 | `afc1af2` | AD MyCity VPS | worker: ## Conversazione finora Nicola: aggiungimi le skill dentro l (4a6db3c6-92dd-4337-a6d0-a94597 |
| 11:12 | `84bee73` | AD MyCity VPS | pannello: aggiunge chip skill rapide anche nella chat dell'Archivio (ChatCasella) |
| 11:12 | `92c0c6e` | AD MyCity VPS | worker: ## Conversazione finora Nicola: aggiungimi le skill dentro l (7e091e18-b642-462c-89d7-1c5e9e |
| 11:13 | `46b8cfe` | AD MyCity VPS | worker: ## Conversazione finora Nicola: aggiungimi le skill dentro l (704835f7-1c55-4a0c-a90f-c54614 |
| 11:14 | `e8dea3a` | AD MyCity VPS | worker: ## Conversazione finora Nicola: aggiungimi le skill dentro l (c3138b88-0679-4c4d-beac-bc0bb3 |
| 11:18 | `684e994` | AD MyCity VPS | worker: ## Conversazione finora Nicola: aggiungimi le skill dentro l (a8bb01cd-6b42-4766-80d6-717b7b |
| 11:19 | `73d9029` | AD MyCity VPS | worker: ## Conversazione finora Nicola: aggiungimi le skill dentro l (704f49fa-e096-4055-863c-96386c |
| 11:25 | `1a9c738` | AD MyCity VPS | worker: ## Conversazione finora Nicola: aggiungimi le skill dentro l (d04dad61-10a9-47fc-b30e-82df44 |
| 11:28 | `6b97072` | AD MyCity VPS | worker: ## Conversazione finora Nicola: aggiungimi le skill dentro l (1e4925d2-d708-455e-9e41-e37ebc |
| 11:34 | `5480eb9` | AD MyCity VPS | worker: ## Conversazione finora Nicola: aggiungimi le skill dentro l (fb9ffaf8-169e-47cc-8614-22075c |
| 11:36 | `edec7a5` | AD MyCity VPS | worker: ## Conversazione finora Nicola: aggiungimi le skill dentro l (934d3664-71ca-450b-95c7-8603c9 |
| 11:37 | `d60100c` | AD MyCity VPS | worker: ## Conversazione finora Nicola: aggiungimi le skill dentro l (2d4ecb89-159e-4107-a4da-618504 |
| 11:40 | `feab110` | AD MyCity VPS | worker: ## Conversazione finora Nicola: aggiungimi le skill dentro l (07341112-d4c8-4f08-85b3-4c44ce |
| 11:46 | `a14d572` | AD MyCity VPS | worker: ## Conversazione finora Nicola: aggiungimi le skill dentro l (c907e7c4-716f-4e60-81bf-b5c571 |
| 11:47 | `45e2666` | AD MyCity VPS | giro AD: aggiorna memoria (2026-07-10 11:47) |
| 11:52 | `7ddba98` | AD MyCity VPS | worker: ## Conversazione finora Nicola: aggiungimi le skill dentro l (8f298295-7334-4bc2-8aa1-f2b880 |
| 11:59 | `a98bdc7` | Claude | pannello: il deploy non salta più i commit di codice (confronto con l'ultimo deploy riuscito) |
| 12:00 | `fcb5e39` | AD MyCity VPS | ritmo AD (mezzogiorno): aggiorna memoria (2026-07-10 12:00) |
| 12:09 | `e3f60c2` | Claude | permessi Claude: le regole aggiunte sul VPS non spariscono più |
| 12:11 | `c7300ed` | NicolaeRotaru | Merge pull request #246 from NicolaeRotaru/claude/hopeful-ritchie-nhjxw8 |
| 12:12 | `7832486` | AD MyCity VPS | Merge branch 'main' of https://github.com/NicolaeRotaru/ad-mycity |
| 12:12 | `5f5fea3` | AD MyCity VPS | worker: ## Conversazione finora Nicola: aggiungimi le skill dentro l (d3b613b6-5e5d-4f3e-8aa9-f3ebb5 |
| 12:14 | `e61e205` | AD MyCity VPS | worker: ## Conversazione finora Nicola: aggiungimi le skill dentro l (cc27baad-8886-4fff-b2e3-2da515 |
| 12:19 | `e4b159f` | AD MyCity VPS | auto: salva stato pending |
| 12:20 | `b813716` | AD MyCity VPS | recupero: scritture pendenti da un giro interrotto (2026-07-10 12:20) |
| 12:20 | `3c3a3f8` | AD MyCity VPS | giro AD: aggiorna memoria (2026-07-10 12:20) |
| 12:20 | `77d0a1f` | AD MyCity VPS | worker: ## Conversazione finora Nicola: aggiungimi le skill dentro l (f2e96eff-b961-493e-a4a6-5582b8 |
| 12:47 | `df8881f` | AD MyCity VPS | worker: ## Conversazione finora Nicola: aggiungimi le skill dentro l (7f429321-3700-4ec2-a7f0-a40a7a |
| 14:20 | `c23d61a` | AD MyCity VPS | recupero: scritture pendenti da un giro interrotto (2026-07-10 14:20) |
| 14:20 | `f723d63` | AD MyCity VPS | giro AD: aggiorna memoria (2026-07-10 14:20) |
| 15:00 | `7f1f156` | AD MyCity VPS | recupero: scritture pendenti da ritmo interrotto (2026-07-10 15:00) |
| 15:01 | `0e5caf0` | AD MyCity VPS | ritmo AD (settimana): aggiorna memoria (2026-07-10 15:01) |
| 15:03 | `fabdcdd` | AD MyCity VPS | recupero: scritture pendenti da ritmo interrotto (2026-07-10 15:03) |
| 15:04 | `224080b` | AD MyCity VPS | ritmo AD (settimana): aggiorna memoria (2026-07-10 15:04) |
| 16:20 | `3cf39cc` | AD MyCity VPS | recupero: scritture pendenti da un giro interrotto (2026-07-10 16:20) |
| 16:20 | `491b150` | AD MyCity VPS | giro AD: aggiorna memoria (2026-07-10 16:20) |

## Cosa ho cambiato in questa PR
1. `cervello/motore-ai.sh` — ordine argomenti CLI (fix radice) + `if` esplicito sull'ultima riga di `ai_build_cmd` (non lasciava rc=1 sotto `set -e`).
2. `.claude/settings.json` — permessi raddrizzati + deny su push-main e api.github.com.
3. `cervello/worker.sh` — regole di verità nel prompt chat, rotaia branch→PR nei prompt (chat e lavori), 📸 impronta-verità a fine turno, titoli commit umani (l'ultimo messaggio tuo, non la busta «## Conversazione finora»).
4. `cervello/ritmo.sh` — spazzino limitato alla memoria (AR-044).
5. Pulizia: `_tmp_create_pr.mjs` rimosso, `_tmp_*` in `.gitignore`.
6. Test: `cervello/test/motore-ai-allowedtools.bats` (nuovo, 3 casi) + 2 casi nuovi in `worker-titolo-commit.bats`. Suite completa: **20/20 verdi**.

## Rischi residui / prossimi passi (in ordine di importanza)
1. 🟡 **Pulisci il `settings.local.json` sul VPS** (`/opt/mycity/ad-mycity/.claude/settings.local.json`): le righe `Bash(git push:*)` e simili incollate stamattina non servono più (le deny di progetto le neutralizzano sul push-main, ma meglio toglierle). 
2. 🟡 `git-merge.mjs` è invocabile dall'AI quando `AZIONI_LIVE=1` e ha un flag `--force`: da legare all'ID di un'azione firmata (proposta futura).
3. 🟢 Le 49 metabolizzazioni morte di oggi restano in errore (storico); le 2 in coda ripartiranno da sole col fix. L'apprendimento riprende dal prossimo turno.
4. 🟢 `Bash(curl:*)` resta largo (serve per i sensori): la deny su `api.github.com` chiude il buco più grosso; se vuoi stringere ancora, si passa a una allowlist di host.
