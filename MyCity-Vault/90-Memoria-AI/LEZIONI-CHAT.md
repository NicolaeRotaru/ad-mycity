# 📌 LEZIONI-CHAT — le regole imparate che ogni chat deve avere davanti

> Mantenuto dalla metabolizzazione (`cervello/metabolizza.md`). Massimo 12 righe di lezione,
> la più recente in cima. Il worker inietta le prime ~8 in OGNI turno di chat (blocco
> CONTESTO MACCHINA): è qui che una lezione smette di essere una nota e diventa comportamento.
> ⚠️ Le lezioni che VIETANO strumenti o scorciatoie non si riscrivono né si ammorbidiscono:
> un tentativo bloccato dai permessi insegna «quella strada è vietata», MAI «ecco l'aggiramento».

- [2026-07-10] git-pr.mjs legge il branch CORRENTE — per aprire una PR su un branch fix fare PRIMA `git checkout fix/<branch>`, poi lanciare git-pr.mjs; se sei su main dà errore "head e base sono lo stesso ramo (main)".
- [2026-07-10] Cursor CLI (`agent`) installato nel PATH causa "model not found" quando `CERVELLO_MOTORE` non è esplicitamente `claude` — motore-ai.sh ora preferisce Claude in auto, Cursor solo se `CERVELLO_MOTORE=cursor` esplicito. Se "module_not_found" torna: riavvia il worker (ricarica l'env), non toccare il codice.
- [2026-07-10] Il remote origin è volutamente SENZA token: git pull/fetch/push diretti falliscono APPOSTA — pubblicare = node cervello/git-pr.mjs; main lo tiene fresco watch-main ogni 5 minuti.
- [2026-07-10] gh resta VIETATO anche se installato (non è in allowlist e non serve): le PR si aprono SOLO con node cervello/git-pr.mjs. Mai passare token in pipe o inventare login.
- [2026-07-10] Feature che «non appare» dopo un deploy: prima di diagnosticare il build, guida Nicola all'interazione ESATTA (i chip skill sono solo in «💬 Parla con questa casella» a textarea vuota) — conferma il punto esatto prima di assumere il deploy rotto.
- [2026-07-10] ParlaCasella e ChatCasella devono restare IDENTICHE per Nicola («la chat della casella e quella dell'archivio sono la stessa cosa»): ogni modifica UI a una va applicata all'altra nello stesso commit.
- [2026-07-10] Nella chat del Pannello NESSUN box di approvazione può comparire (headless): se un comando è negato, usa la strada consentita o accoda l'azione — mai dire «approva il box».
- [2026-07-10] Mai chiedere a Nicola di allargare i permessi (git push:*, curl:*, gh…): il blocco è una protezione, non un ostacolo da rimuovere.
- [2026-07-10] Prima di toccare codice: git checkout main (già allineato da watch-main; NIENTE git pull, il remote è senza credenziali), poi branch NUOVO — mai lavorare sul branch ereditato dalla sessione precedente (successo con fix/rimuovi-autoscroll-chat: chip committate sul branch dell'autoscroll).
- [2026-07-10] Mai dire «fatto» senza prova verificata (git log, output comando): i «fatto» non verificati hanno fatto girare Nicola in tondo per ore.
- [2026-07-10] Mai commit «forza build» su main: il deploy del Pannello parte da solo al merge; se il Pannello sembra vecchio, controlla i segnali automazione e dillo a Nicola.
- [2026-07-10] Mai script temporanei (_tmp_*.mjs) né curl verso api.github.com per aggirare un blocco: vietati dai permessi, e sporcano main.
