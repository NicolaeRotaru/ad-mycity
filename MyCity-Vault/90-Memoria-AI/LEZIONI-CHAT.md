# 📌 LEZIONI-CHAT — le regole imparate che ogni chat deve avere davanti

> Mantenuto dalla metabolizzazione (`cervello/metabolizza.md`). Massimo 12 righe di lezione,
> la più recente in cima. Il worker inietta le prime ~8 in OGNI turno di chat (blocco
> CONTESTO MACCHINA): è qui che una lezione smette di essere una nota e diventa comportamento.
> ⚠️ Le lezioni che VIETANO strumenti o scorciatoie non si riscrivono né si ammorbidiscono:
> un tentativo bloccato dai permessi insegna «quella strada è vietata», MAI «ecco l'aggiramento».

- [2026-07-13] Pallini rossi — Nicola «impara questi errori»: (1) **mai 2-3 PR per lo stesso bug** — ho aperto #327+#328+#330 nella stessa chat → mergia **solo #328**, chiudi #327 e #330 senza merge; (2) **conflitti = file memoria worker** nel branch Pannello (stesso errore di #318/#324) → ribasa su main, branch = **solo** `pannello/`, simula merge prima di dire pronto; fix #328 ripulito 17:16, merge OK.
- [2026-07-13] Guardiano agenti — `agent-registry-check.mjs` controllava solo nomi file, non le `description` del router: collisioni fraud-risk/trust-safety («account multipli», «rimborsi falsi») passavano in verde; fix PR #329 (≥2 frasi-trigger = rosso + deferral mancante segnalato), merge 🔴 #101; correggere le description = passo separato.
- [2026-07-13] Tab OKR & pagella mobile — Nicola: frasi fuori riquadro + numeri non «live»; separare overflow CSS (PR #326, merge 🔴 #99) da Stelle Polari (refresh ogni minuto nel fix) vs tabella OKR sotto (documento statico 24/6 — serve giro AD, non ricarica).
- [2026-07-13] Ogni PR su GitHub deve avere descrizione comprensibile dentro GitHub (cosa cambia, perché, come verificare in 2–3 passi) — Nicola «sempre la descrizione della pr dentro github»; in chat incolla anche il riassunto col link; mai body vuoto o titolo generico; aggiorna PR aperte vuote con git-pr.mjs --body.
- [2026-07-13] Tab Lavori — badge «In coda»/«Archivio» sbagliati + archivio troncato: Nicola «4 in coda e 46 in archivio è sbagliato, archivio incompleto» — causa verificata Supabase: API leggeva solo ultimi 50 lavori e i badge derivavano da quella finestra (reale: 1172 tot, 1010 archivio, 5 attivi ora); fix PR #325 (count DB + coda tutti attivi + archivio paginato), merge 🔴 #98.
- [2026-07-13] Conflitto PR #324 — file memoria worker nel branch Pannello (come #318/#322): Nicola «risolvilo, impara, non aprire nuova PR» — ripulire branch a solo 4 file fix chat, commit `1b9e964a`, stessa PR, simulazione merge OK; spiegare sempre il tipo di conflitto; merge 🔴 #97.
- [2026-07-13] Tab Piani mobile — Nicola: testo fuori (FAB «Parla c…» + righe piano) e dati vecchi; separare bug display (codaTesto, fix main, merge 🔴 #95 + deploy Vercel) da contenuto vault datato (numeri nei piani = giro AD). Overflow FAB = fix CSS separato da #322.
- [2026-07-13] Lista conversazioni chat fluttuante = parità con chat intera: graffetta 📌 e pallino rosso non-letto come nel cassetto pieno — Nicola lo chiede esplicitamente; fix PR #324, merge 🔴 #97.
- [2026-07-13] Su smartphone Invio = a capo nella casella chat, Invia = manda il messaggio; su PC resta Invio=manda — fix PR #324, merge 🔴 #97; vale chat principale, fluttuante e ParlaCasella.
- [2026-07-13] gh resta VIETATO anche se installato (non è in allowlist e non serve): le PR si aprono SOLO con node cervello/git-pr.mjs. Mai passare token in pipe o inventare login.