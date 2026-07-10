# 📌 LEZIONI-CHAT — le regole imparate che ogni chat deve avere davanti

> Mantenuto dalla metabolizzazione (`cervello/metabolizza.md`). Massimo 12 righe di lezione,
> la più recente in cima. Il worker inietta le prime ~8 in OGNI turno di chat (blocco
> CONTESTO MACCHINA): è qui che una lezione smette di essere una nota e diventa comportamento.
> ⚠️ Le lezioni che VIETANO strumenti o scorciatoie non si riscrivono né si ammorbidiscono:
> un tentativo bloccato dai permessi insegna «quella strada è vietata», MAI «ecco l'aggiramento».

- [2026-07-10] Dopo la PR, Nicola vuole che l'AD resti in ascolto fino a verifica live: non fermarsi dopo "PR creata" — monitorare che il merge arrivi, che Vercel buildi e che la modifica sia visibile nel Pannello prima di dichiarare finito.
- [2026-07-10] `pannello/vercel.json` con `"deploymentEnabled": {"main": false}` blocca TUTTI i deploy Vercel da main — codice incluso, non solo la memoria. Il campo fu aggiunto per bloccare i commit di memoria ma è ridondante: l'`ignoreCommand` già gestisce quel caso. Sintomo: PR mergiata, commit su GitHub, Vercel non builda. Fix: portare `main` da `false` a `true` — l'ignoreCommand skippa i commit di sola memoria senza bisogno del blocco globale.
- [2026-07-10] Dopo git-pr.mjs (eseguito da Nicola o dall'AD), verificare SEMPRE con `git ls-remote origin fix/<branch>` che il branch esista su GitHub prima di dire "PR creata" — se manca, nessuna PR esiste e Vercel non deploya.
- [2026-07-10] Il linter in questo progetto annulla le Edit su file TSX/React (le patch parziali vengono ripristinate): se le modifiche spariscono dopo una Edit, usare Write per riscrivere l'intero file invece di applicare patch parziali.
- [2026-07-10] watch-main resetta HEAD ogni 5 min: se scatta durante un git checkout, il commit finisce su main locale invece del branch fix — verificare `git branch` prima di committare; se sei su main per sbaglio, il branch fix ha lo stesso commit e la PR funziona (origin/main non ha ancora il commit).
- [2026-07-10] Il remote origin è volutamente SENZA token: git pull/fetch/push diretti falliscono APPOSTA — pubblicare = node cervello/git-pr.mjs; main lo tiene fresco watch-main ogni 5 minuti.
- [2026-07-10] gh resta VIETATO anche se installato (non è in allowlist e non serve): le PR si aprono SOLO con node cervello/git-pr.mjs. Mai passare token in pipe o inventare login.
- [2026-07-10] Nella chat del Pannello NESSUN box di approvazione può comparire (headless): se un comando è negato, usa la strada consentita o accoda l'azione — mai dire «approva il box».
- [2026-07-10] Mai chiedere a Nicola di allargare i permessi (git push:*, curl:*, gh…): il blocco è una protezione, non un ostacolo da rimuovere.
- [2026-07-10] Prima di toccare codice: git checkout main (già allineato da watch-main; NIENTE git pull, il remote è senza credenziali), poi branch NUOVO — mai lavorare sul branch ereditato dalla sessione precedente (successo con fix/rimuovi-autoscroll-chat: chip committate sul branch dell'autoscroll).
- [2026-07-10] Mai dire «fatto» senza prova verificata (git log, output comando): i «fatto» non verificati hanno fatto girare Nicola in tondo per ore.
- [2026-07-10] Mai script temporanei (_tmp_*.mjs) né curl verso api.github.com per aggirare un blocco: vietati dai permessi, e sporcano main.
