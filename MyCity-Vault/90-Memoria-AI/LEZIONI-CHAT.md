# 📌 LEZIONI-CHAT — le regole imparate che ogni chat deve avere davanti

> Mantenuto dalla metabolizzazione (`cervello/metabolizza.md`). Massimo 12 righe di lezione,
> la più recente in cima. Il worker inietta le prime ~8 in OGNI turno di chat (blocco
> CONTESTO MACCHINA): è qui che una lezione smette di essere una nota e diventa comportamento.
> ⚠️ Le lezioni che VIETANO strumenti o scorciatoie non si riscrivono né si ammorbidiscono:
> un tentativo bloccato dai permessi insegna «quella strada è vietata», MAI «ecco l'aggiramento».

- [2026-07-13] Lista conversazioni chat fluttuante = parità con chat intera: graffetta 📌 e pallino rosso non-letto come nel cassetto pieno — Nicola lo chiede esplicitamente; fix PR #324, merge 🔴 #97.
- [2026-07-13] Su smartphone Invio = a capo nella casella chat, Invia = manda il messaggio; su PC resta Invio=manda — fix PR #324, merge 🔴 #97; vale chat principale, fluttuante e ParlaCasella.
- [2026-07-13] Screenshot in chat con `.allegati-chat` vuota = allegati non configurati (#60): NON indovinare pagina o bug — chiedi quale scheda e descrizione testuale; citare fix già mergiati (Piani/Avvisi) solo se Nicola nomina la tab.
- [2026-07-13] Avvisi «memoria incoerente»: ogni scheda gialla deve avere «Parla con questa casella» come le altre card — oggi si legge l'avviso ma non si chiede all'AD; fix PR #323, merge 🔴 #96.
- [2026-07-13] Screenshot Nicola senza testo = quasi sempre conflitti PR — rispondere con causa, commit, simulazione merge e card merge; non solo «ci sono conflitti».
- [2026-07-13] PR #318 conflitti: file worker (contatore lezioni) mescolati mentre main aveva #317 — ripulire branch a solo `globals.css`+`page.tsx`, simulare merge su main HEAD, commit `03751823`; merge 🔴 #94.
- [2026-07-13] Tre fix UX chat Nicola: X su card «Prompt pronto», evidenzia chat aperta nel cassetto («aperta ora»), Annulla invio durante «sto pensando…» — PR #318; chat intera + fluttuante (Prompt solo intera).
- [2026-07-13] Sync chat PC↔telefono già su main — chiudi PR #316 senza merge; non dire «mergia anche #316» dopo #317. Pallino rosso: solo risposta AD non ancora aperta, sparisce chiudendo chat.
- [2026-07-13] PR #320 plugin worker: manifest+sync grilling/ponytail/caveman-internal — caveman solo su giro/lavori/metabolizza (tipo≠chat), mai in chat Nicola; fase 2 = 10 skill in `worker-plugins.json`; merge 🔴 #95 + riavvio worker post-merge.
- [2026-07-13] Nicola «Tutto il panello aggiornato in automatico»: metabolizzazione post-chat tocca solo STATO/Lezioni/Apprendimento — coda AZIONI e registro-fatti restano vecchi finché non passa registro-fatti.mjs; ogni correzione Nicola → registro obbligatorio + propagazione file vivi.
- [2026-07-10] `pannello/vercel.json` deploymentEnabled main:false è VOLUTO (protezione quota Vercel — la memoria pusha ogni 5 min): il deploy del Pannello passa dalla GitHub Action deploy-pannello.yml che scatta DA SOLA sui push che toccano pannello/**. MAI rimettere true (il 10/7 fu rimesso per errore e revertito con la PR #258) e MAI commit-trigger o «forza build» su main: se il deploy sembra fermo, controlla l'Action e i segnali, non la config.
- [2026-07-10] gh resta VIETATO anche se installato (non è in allowlist e non serve): le PR si aprono SOLO con node cervello/git-pr.mjs. Mai passare token in pipe o inventare login.