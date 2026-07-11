# 📌 LEZIONI-CHAT — le regole imparate che ogni chat deve avere davanti

> Mantenuto dalla metabolizzazione (`cervello/metabolizza.md`). Massimo 12 righe di lezione,
> la più recente in cima. Il worker inietta le prime ~8 in OGNI turno di chat (blocco
> CONTESTO MACCHINA): è qui che una lezione smette di essere una nota e diventa comportamento.
> ⚠️ Le lezioni che VIETANO strumenti o scorciatoie non si riscrivono né si ammorbidiscono:
> un tentativo bloccato dai permessi insegna «quella strada è vietata», MAI «ecco l'aggiramento».

- [2026-07-12] Sul VPS il processo watch-main fa `git pull --rebase` ogni ~5 min e azzera i file non committati: dopo ogni Edit, committa SUBITO nello stesso turno prima del prossimo reset.
- [2026-07-12] Gli screenshot di Nicola dalla chat del Pannello finivano in /tmp/ (path non accessibile all'AD). PR #285 sposta il download in .allegati-chat/ dentro il progetto — finché non è mergiata, chiedere a Nicola di descrivere lo screenshot a parole.
- [2026-07-12] Prima di costruire una nuova sezione nel Pannello, verificare se esiste già con nome diverso: la pagina "Report" faceva GIÀ quello che Nicola ha chiesto per "Archivio consegne" — bastava rinominarla.
- [2026-07-11] La chat del Pannello deve essere session-scoped: riaprire/ricaricare la pagina = chat nuova (sessionStorage, non localStorage); navigare tra sezioni nella stessa sessione = mantiene la conversazione. Anche se la tabella `conversazioni` esiste, l'auto-ripristino all'apertura va DISABILITATO.
- [2026-07-11] Se un branch PR ha conflitti nel codice reale e `git-pr.mjs` non supporta force-push: creare un branch NUOVO (nome diverso), ri-applicare le modifiche con Edit (🟢), aprire nuova PR, aggiungere nota di chiusura sulla vecchia.
- [2026-07-11] Vercel deve avere `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` del progetto Supabase Memoria — senza, sia le chat (`/api/conversazioni`) sia gli **allegati** (upload su Storage fallisce, il worker non riceve il path) sono rotti. Il VPS ha già queste chiavi. Dopo l'aggiunta serve un **Redeploy manuale** su Vercel (tab Deployments → Redeploy) — le variabili entrano in effetto solo sul prossimo build. Prerequisito: tabella `conversazioni` già esistente (vedi lezione sopra).
- [2026-07-11] GIT_PUSH_TOKEN in `cervello/vps/.env` ha scope su `ad-mycity`, NON su `NicolaeRotaru/mycity` — per pushare il branch `fix/5-bloccanti-sicurezza` sul marketplace serve un PAT separato con `Contents: R/W` su `NicolaeRotaru/mycity` (crearlo su github.com/settings/tokens). Estrarlo con `grep 'github_pat_' .env | head -1`, non con `cut` (il token ha commento multiriga sopra).
- [2026-07-10] `pannello/vercel.json` deploymentEnabled main:false è VOLUTO (protezione quota Vercel — la memoria pusha ogni 5 min): il deploy del Pannello passa dalla GitHub Action deploy-pannello.yml che scatta DA SOLA sui push che toccano pannello/**. MAI rimettere true (il 10/7 fu rimesso per errore e revertito con la PR #258) e MAI commit-trigger o «forza build» su main: se il deploy sembra fermo, controlla l'Action e i segnali, non la config.
- [2026-07-10] gh resta VIETATO anche se installato (non è in allowlist e non serve): le PR si aprono SOLO con node cervello/git-pr.mjs. Mai passare token in pipe o inventare login.
- [2026-07-10] Nella chat del Pannello NESSUN box di approvazione può comparire (headless): se un comando è negato, usa la strada consentita o accoda l'azione — mai dire «approva il box».
- [2026-07-10] Mai chiedere a Nicola di allargare i permessi (git push:*, curl:*, gh…): il blocco è una protezione, non un ostacolo da rimuovere.
- [2026-07-10] Mai dire «fatto» senza prova verificata (git log, output comando): i «fatto» non verificati hanno fatto girare Nicola in tondo per ore.
