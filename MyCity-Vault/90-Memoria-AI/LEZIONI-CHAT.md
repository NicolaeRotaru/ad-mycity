# 📌 LEZIONI-CHAT — le regole imparate che ogni chat deve avere davanti

> Mantenuto dalla metabolizzazione (`cervello/metabolizza.md`). Massimo 12 righe di lezione,
> la più recente in cima. Il worker inietta le prime ~8 in OGNI turno di chat (blocco
> CONTESTO MACCHINA): è qui che una lezione smette di essere una nota e diventa comportamento.
> ⚠️ Le lezioni che VIETANO strumenti o scorciatoie non si riscrivono né si ammorbidiscono:
> un tentativo bloccato dai permessi insegna «quella strada è vietata», MAI «ecco l'aggiramento».

- [2026-07-13] Screenshot Nicola senza testo = quasi sempre conflitti PR — rispondere con causa, commit, simulazione merge e card merge; non solo «ci sono conflitti».
- [2026-07-13] PR #319 conflitti: #317+#318 già su main — unire fix volano (ESITI quaderni+STATO) con righe coda #318+#319, commit `2d8ff61f`, simulare merge; tasso verificato 0,29 (39/133); merge 🔴 #96.
- [2026-07-13] PR #318 conflitti: file worker (contatore lezioni) mescolati mentre main aveva #317 — ripulire branch a solo `globals.css`+`page.tsx`, simulare merge su main HEAD, commit `03751823`; merge 🔴 #94.
- [2026-07-13] Tre fix UX chat Nicola: X su card «Prompt pronto», evidenzia chat aperta nel cassetto («aperta ora»), Annulla invio durante «sto pensando…» — PR #318; chat intera + fluttuante (Prompt solo intera).
- [2026-07-13] Sync chat PC↔telefono già su main — chiudi PR #316 senza merge; non dire «mergia anche #316» dopo #317. Pallino rosso: solo risposta AD non ancora aperta, sparisce chiudendo chat.
- [2026-07-13] PR #320 plugin worker: manifest+sync grilling/ponytail/caveman-internal — caveman solo su giro/lavori/metabolizza (tipo≠chat), mai in chat Nicola; fase 2 = 10 skill in `worker-plugins.json`; merge 🔴 #95 + riavvio worker post-merge.
- [2026-07-13] PR Pannello con conflitti: quasi sempre file memoria worker nel branch, non il fix — ripulire a solo file Pannello target + simulare merge su main HEAD prima di «pronta» (pattern #315/#316/#318/#319).
- [2026-07-13] Nicola «Tutto il panello aggiornato in automatico»: metabolizzazione post-chat tocca solo STATO/Lezioni/Apprendimento — coda AZIONI e registro-fatti restano vecchi finché non passa registro-fatti.mjs; ogni correzione Nicola → registro obbligatorio + propagazione file vivi.
- [2026-07-13] Nicola «Prepara pr» + «Aggiornamento leggere ogni 10 minuti» → PR #315 (data UI max(data,aggiornato) + tick leggero apprendimento/miglioramento senza AI ogni ~10 min); metabolizzazione post-chat invariata; benchmark pesante resta settimanale; merge 🔴 #90/#91.
- [2026-07-10] `pannello/vercel.json` deploymentEnabled main:false è VOLUTO (protezione quota Vercel — la memoria pusha ogni 5 min): il deploy del Pannello passa dalla GitHub Action deploy-pannello.yml che scatta DA SOLA sui push che toccano pannello/**. MAI rimettere true (il 10/7 fu rimesso per errore e revertito con la PR #258) e MAI commit-trigger o «forza build» su main: se il deploy sembra fermo, controlla l'Action e i segnali, non la config.
- [2026-07-10] gh resta VIETATO anche se installato (non è in allowlist e non serve): le PR si aprono SOLO con node cervello/git-pr.mjs. Mai passare token in pipe o inventare login.
