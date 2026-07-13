# 📌 LEZIONI-CHAT — le regole imparate che ogni chat deve avere davanti

> Mantenuto dalla metabolizzazione (`cervello/metabolizza.md`). Massimo 12 righe di lezione,
> la più recente in cima. Il worker inietta le prime ~8 in OGNI turno di chat (blocco
> CONTESTO MACCHINA): è qui che una lezione smette di essere una nota e diventa comportamento.
> ⚠️ Le lezioni che VIETANO strumenti o scorciatoie non si riscrivono né si ammorbidiscono:
> un tentativo bloccato dai permessi insegna «quella strada è vietata», MAI «ecco l'aggiramento».

- [2026-07-13] Ogni PR su GitHub deve avere descrizione comprensibile dentro GitHub (cosa cambia, perché, come verificare in 2–3 passi) — Nicola «sempre la descrizione della pr dentro github»; in chat incolla anche il riassunto col link; mai body vuoto o titolo generico; aggiorna PR aperte vuote con git-pr.mjs --body.
- [2026-07-13] Tab Lavori — badge «In coda»/«Archivio» sbagliati + archivio troncato: Nicola «4 in coda e 46 in archivio è sbagliato, archivio incompleto» — causa verificata Supabase: API leggeva solo ultimi 50 lavori e i badge derivavano da quella finestra (reale: 1172 tot, 1010 archivio, 5 attivi ora); fix PR #325 (count DB + coda tutti attivi + archivio paginato), merge 🔴 #98.
- [2026-07-13] Conflitto PR #324 — file memoria worker nel branch Pannello (come #318/#322): Nicola «risolvilo, impara, non aprire nuova PR» — ripulire branch a solo 4 file fix chat, commit `1b9e964a`, stessa PR, simulazione merge OK; spiegare sempre il tipo di conflitto; merge 🔴 #97.
- [2026-07-13] Tab Piani mobile — Nicola: testo fuori (FAB «Parla c…» + righe piano) e dati vecchi; separare bug display (codaTesto, fix main, merge 🔴 #95 + deploy Vercel) da contenuto vault datato (numeri nei piani = giro AD). Overflow FAB = fix CSS separato da #322.
- [2026-07-13] Lista conversazioni chat fluttuante = parità con chat intera: graffetta 📌 e pallino rosso non-letto come nel cassetto pieno — Nicola lo chiede esplicitamente; fix PR #324, merge 🔴 #97.
- [2026-07-13] Su smartphone Invio = a capo nella casella chat, Invia = manda il messaggio; su PC resta Invio=manda — fix PR #324, merge 🔴 #97; vale chat principale, fluttuante e ParlaCasella.
- [2026-07-13] Screenshot in chat con `.allegati-chat` vuota = allegati non configurati (#60): NON indovinare pagina o bug — chiedi quale scheda e descrizione testuale; citare fix già mergiati (Piani/Avvisi) solo se Nicola nomina la tab.
- [2026-07-13] Avvisi «memoria incoerente»: ogni scheda gialla deve avere «Parla con questa casella» come le altre card — oggi si legge l'avviso ma non si chiede all'AD; fix PR #323, merge 🔴 #96.
- [2026-07-13] Screenshot Nicola senza testo = quasi sempre conflitti PR — rispondere con causa, commit, simulazione merge e card merge; non solo «ci sono conflitti».
- [2026-07-13] PR #318 conflitti: file worker (contatore lezioni) mescolati mentre main aveva #317 — ripulire branch a solo `globals.css`+`page.tsx`, simulare merge su main HEAD, commit `03751823`; merge 🔴 #94.
- [2026-07-13] PR #320 plugin worker: manifest+sync grilling/ponytail/caveman-internal — caveman solo su giro/lavori/metabolizza (tipo≠chat), mai in chat Nicola; fase 2 = 10 skill in `worker-plugins.json`; merge 🔴 #95 + riavvio worker post-merge.
- [2026-07-10] gh resta VIETATO anche se installato (non è in allowlist e non serve): le PR si aprono SOLO con node cervello/git-pr.mjs. Mai passare token in pipe o inventare login.