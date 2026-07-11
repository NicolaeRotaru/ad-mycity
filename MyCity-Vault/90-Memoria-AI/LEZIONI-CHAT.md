# 📌 LEZIONI-CHAT — le regole imparate che ogni chat deve avere davanti

> Mantenuto dalla metabolizzazione (`cervello/metabolizza.md`). Massimo 12 righe di lezione,
> la più recente in cima. Il worker inietta le prime ~8 in OGNI turno di chat (blocco
> CONTESTO MACCHINA): è qui che una lezione smette di essere una nota e diventa comportamento.
> ⚠️ Le lezioni che VIETANO strumenti o scorciatoie non si riscrivono né si ammorbidiscono:
> un tentativo bloccato dai permessi insegna «quella strada è vietata», MAI «ecco l'aggiramento».

- [2026-07-11] GIT_PUSH_TOKEN in `cervello/vps/.env` ha scope su `ad-mycity`, NON su `NicolaeRotaru/mycity` — per pushare il branch `fix/5-bloccanti-sicurezza` sul marketplace serve un PAT separato con `Contents: R/W` su `NicolaeRotaru/mycity` (crearlo su github.com/settings/tokens). Estrarlo con `grep 'github_pat_' .env | head -1`, non con `cut` (il token ha commento multiriga sopra).
- [2026-07-11] `git push --force-with-lease` dopo rebase locale dice "Everything up-to-date" se il `git fetch origin` non è stato fatto PRIMA — il branch locale era già in sync con origin. Fix corretto: ① `git fetch origin` → ② `git rebase origin/main` → ③ `git push --force-with-lease origin <branch>`. Se la PR mostra ancora conflitti dopo il push, il rebase non ha aggiornato i commit su GitHub.
- [2026-07-11] Dopo aver pushato un branch vecchio (es. Sprint 1 del 1/7, pushato solo al 11/7), la PR avrà quasi certamente conflitti di merge perché `main` è andato avanti. Verificare SEMPRE i conflitti subito dopo l'apertura della PR (via WebFetch GitHub API) e proporre il rebase a Nicola come passo immediatamente successivo, non nella prossima chat.
- [2026-07-11] Se trovi lavoro già scritto da una sessione precedente (file non committati in marketplace/), dillo SUBITO nella prima riga — non procedere come se lo avessi creato tu: Nicola ha dovuto chiedere «come li hai creati?» per scoprirlo, giro in tondo evitabile.
- [2026-07-11] Due checkout del marketplace sul VPS: `/opt/mycity/marketplace` (MARKETPLACE_REPO, usato dagli script) e `/opt/mycity/ad-mycity/marketplace` (lavoro locale); verificare quale checkout è attivo e se un branch è già merged in main PRIMA di scrivere file — `fix/ruoli-acquisto-admin-seller-2026-07-02` era già in main.
- [2026-07-10] `pannello/vercel.json` deploymentEnabled main:false è VOLUTO (protezione quota Vercel — la memoria pusha ogni 5 min): il deploy del Pannello passa dalla GitHub Action deploy-pannello.yml che scatta DA SOLA sui push che toccano pannello/**. MAI rimettere true (il 10/7 fu rimesso per errore e revertito con la PR #258) e MAI commit-trigger o «forza build» su main: se il deploy sembra fermo, controlla l'Action e i segnali, non la config.
- [2026-07-10] Verificare SEMPRE lo stato reale di GitHub con `git ls-remote origin` (branch E main) prima di affermare che «origin/main è fermo» o che «la PR non è arrivata»: senza fetch il ref locale è stale — ripetere affermazioni sbagliate per 5 turni ha mandato Nicola in tondo inutilmente («ricontrolla ti stai sbagliando»).
- [2026-07-10] gh resta VIETATO anche se installato (non è in allowlist e non serve): le PR si aprono SOLO con node cervello/git-pr.mjs. Mai passare token in pipe o inventare login.
- [2026-07-10] Nella chat del Pannello NESSUN box di approvazione può comparire (headless): se un comando è negato, usa la strada consentita o accoda l'azione — mai dire «approva il box».
- [2026-07-10] Mai chiedere a Nicola di allargare i permessi (git push:*, curl:*, gh…): il blocco è una protezione, non un ostacolo da rimuovere.
- [2026-07-10] Mai dire «fatto» senza prova verificata (git log, output comando): i «fatto» non verificati hanno fatto girare Nicola in tondo per ore.
- [2026-07-10] Mai script temporanei (_tmp_*.mjs) né curl verso api.github.com per aggirare un blocco: vietati dai permessi, e sporcano main.
