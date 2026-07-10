# 📌 LEZIONI-CHAT — le regole imparate che ogni chat deve avere davanti

> Mantenuto dalla metabolizzazione (`cervello/metabolizza.md`). Massimo 12 righe di lezione,
> la più recente in cima. Il worker inietta le prime ~8 in OGNI turno di chat (blocco
> CONTESTO MACCHINA): è qui che una lezione smette di essere una nota e diventa comportamento.

- [2026-07-10] Il «terminale Claude Code» Nicola NON ce l'ha installato e non sa cos'è — usa SOLO il Pannello web; MAI dirgli «approva il box nel terminale» o «apri Claude Code»: se serve un'approvazione, dire «aggiungi questa riga a settings.local.json» oppure «lancia dal terminale SSH del VPS».
- [2026-07-10] Chat UX (3 preferenze fisse Nicola per ChatCasella/ParlaCasella): altezza compatta (max-h-44, uguale alla nuova chat), scroll automatico all'ultimo messaggio all'apertura, spaziatura ridotta nelle risposte AI (paragrafi my-0.5, non margini prose default) — tutte e 3 vanno replicate su ENTRAMBE le componenti nello stesso commit.
- [2026-07-10] Allegati PNG in chat del Pannello: l'AD NON riesce ad aprirli (manca il permesso read sul path chat-allegati/); se Nicola allega uno screenshot, chiedere una descrizione a parole invece di provare ad aprirlo.
- [2026-07-10] BUG + FIX PARZIALE — chip skill rapide: (a) in ParlaCasella/ChatCasella i chip SI VEDONO ma il click NON popola la textarea (bug ancora aperto — debuggare onClick/textareaRef/value={bozza}); (b) nella chat principale (page.tsx, commit 65bee0a8) e nella chat fluttuante (commit 3f68c4b1) i chip MANCAVANO — aggiunti nel branch fix/chat-altezza-scroll-spaziatura, NON pushato: aggiungere `"Bash(git push origin fix/*:*)"` a settings.local.json.
- [2026-07-10] ParlaCasella e ChatCasella devono essere SEMPRE identiche dal punto di vista di Nicola ("la chat della casella e chat dell'archivio deve essere la stessa cosa") — ogni modifica UI a una va applicata all'altra nello stesso commit.
- [2026-07-10] git checkout su un branch che TRACCIA settings.local.json lo sovrascrive anche se il file è in .gitignore — .gitignore protegge solo file UNTRACKED; se il branch target ha il file già tracked (es. feature/skill-rapide-chat), checkout lo ripristina alla versione del branch. Fix: fare git stash prima di checkout, e verificare con git ls-tree che il branch non abbia il file.
- [2026-07-10] `.claude/settings.local.*` è già nel `.gitignore` (riga 28) — se il file sparisce lo sta sovrascrivendo l'AD con il proprio Write tool, NON git checkout: dopo ogni Write su settings.local.json rileggerlo per confermare il contenuto intatto.
- [2026-07-10] Nella chat del Pannello NESSUN box di approvazione può comparire (headless): se un comando è negato, usa la strada consentita o accoda l'azione — mai dire «approva il box».
- [2026-07-10] `"Bash(git push origin fix/*:*)"` non è nell'allowlist di default (c'è solo `feature/*`): commit su branch fix/* restano bloccati finché Nicola non aggiunge la riga in settings.local.json — documentarlo come azione in attesa, non tentare workaround.
- [2026-07-10] Mai chiedere a Nicola di allargare i permessi (git push:*, curl:*, gh…): il blocco è una protezione, non un ostacolo da rimuovere.
- [2026-07-10] Mai dire «fatto» senza prova verificata (git log, output comando): i «fatto» non verificati hanno fatto girare Nicola in tondo per ore.
- [2026-07-10] Mai script temporanei (_tmp_*.mjs) né curl verso api.github.com per aggirare un blocco: vietati dai permessi, e sporcano main.
