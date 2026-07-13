# 📌 LEZIONI-CHAT — le regole imparate che ogni chat deve avere davanti

> Mantenuto dalla metabolizzazione (`cervello/metabolizza.md`). Massimo 12 righe di lezione,
> la più recente in cima. Il worker inietta le prime ~8 in OGNI turno di chat (blocco
> CONTESTO MACCHINA): è qui che una lezione smette di essere una nota e diventa comportamento.
> ⚠️ Le lezioni che VIETANO strumenti o scorciatoie non si riscrivono né si ammorbidiscono:
> un tentativo bloccato dai permessi insegna «quella strada è vietata», MAI «ecco l'aggiramento».

- [2026-07-13] PR #320 plugin worker: manifest+sync grilling/ponytail/caveman-internal — caveman solo su giro/lavori/metabolizza (tipo≠chat), mai in chat Nicola; fase 2 = 10 skill in `worker-plugins.json`; merge 🔴 #95 + riavvio worker post-merge.
- [2026-07-13] PR #316 conflitti: non era il fix chat — file memoria worker (apprendimento/AZIONI) mescolati mentre main avanzava; ripulire branch a solo `page.tsx`, simulare merge su main HEAD, poi dire «pronta»; commit `74a4cfc0`; merge 🔴 #92.
- [2026-07-13] Pallino rosso chat: solo se ultima risposta AD non ancora aperta/letta; sparisce aprendo o chiudendo finestra — non su tutto lo storico né mentre aspetti tu; PR #316 (polling ~8s + sync elenco) sostituisce #299; merge 🔴 #92.
- [2026-07-13] Chat Pannello PC≠telefono: storico in DB ma scaricato solo all'apertura (no polling come Azioni); chat aperta + pin restano localStorage — PR #316 aggiunge polling elenco ~8s; pin/badge lettura ancora per dispositivo finché non mergiata.
- [2026-07-13] PR #315 conflitti: #314 aveva già fix data UI su AutoCoscienza — rebasare su main prima di dire «pronta», unire data corretta + tick 10 min, simulare merge; non lasciare PR aperta mentre main avanza sullo stesso file.
- [2026-07-13] Nicola «Tutto il panello aggiornato in automatico»: metabolizzazione post-chat tocca solo STATO/Lezioni/Apprendimento — coda AZIONI e registro-fatti restano vecchi finché non passa registro-fatti.mjs; ogni correzione Nicola → registro obbligatorio + propagazione file vivi.
- [2026-07-13] Nicola «Prepara pr» + «Aggiornamento leggere ogni 10 minuti» → PR #315 (data UI max(data,aggiornato) + tick leggero apprendimento/miglioramento senza AI ogni ~10 min); metabolizzazione post-chat invariata; benchmark pesante resta settimanale; merge 🔴 #90/#91.
- [2026-07-13] Fix caselle «Confronto coi migliori»: Nicola «Apri pr» dopo diagnosi chiara → PR #313 aperta (solo `AutoCoscienza.tsx`, commit `027d4671`), merge 🔴 dal Pannello. Pattern: schema JSON vs tipi componente prima di dire «mancano dati».
- [2026-07-13] Caselle «Confronto coi migliori» vuote: dati in `auto-miglioramento.json` (`reparto`, `obiettivo`, `progresso`) ma UI legge campi vecchi (`ambito`, `nostro`, `cosa_ci_manca`) → vuoto e «undefined». PR #313 fixa; mergia dal Pannello.
- [2026-07-10] `pannello/vercel.json` deploymentEnabled main:false è VOLUTO (protezione quota Vercel — la memoria pusha ogni 5 min): il deploy del Pannello passa dalla GitHub Action deploy-pannello.yml che scatta DA SOLA sui push che toccano pannello/**. MAI rimettere true (il 10/7 fu rimesso per errore e revertito con la PR #258) e MAI commit-trigger o «forza build» su main: se il deploy sembra fermo, controlla l'Action e i segnali, non la config.
- [2026-07-10] gh resta VIETATO anche se installato (non è in allowlist e non serve): le PR si aprono SOLO con node cervello/git-pr.mjs. Mai passare token in pipe o inventare login.
