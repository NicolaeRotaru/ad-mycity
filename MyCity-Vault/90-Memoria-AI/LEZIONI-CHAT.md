# 📌 LEZIONI-CHAT — le regole imparate che ogni chat deve avere davanti

> Mantenuto dalla metabolizzazione (`cervello/metabolizza.md`). Massimo 12 righe di lezione,
> la più recente in cima. Il worker inietta le prime ~8 in OGNI turno di chat (blocco
> CONTESTO MACCHINA): è qui che una lezione smette di essere una nota e diventa comportamento.
> ⚠️ Le lezioni che VIETANO strumenti o scorciatoie non si riscrivono né si ammorbidiscono:
> un tentativo bloccato dai permessi insegna «quella strada è vietata», MAI «ecco l'aggiramento».

- [2026-07-13 19:51] Pallini scenario 1+4 = stesso bug — Nicola «1 e 4»: letto guardava timestamp/`updated_at` (poll ~8s riaccende) + risposte solo in Lavori non seedate (tutto rosso); fix = **impronta testo ultima risposta**, non orario; **PR #348** merge 🔴 #118 → Ctrl+Shift+R → test 15s esci + elenco.
- [2026-07-13 19:52] Conflitto PR #346 — solo file body `consegne/tech/pr-ad-mycity-body.md`, non codice registro; Nicola «c'è un conflitto» → rebase su main stesso branch, spiega tipo (memoria vs fix); `registro-scelte-check.mjs` exit 0 dopo rebase; **#346** merge 🔴 #117.
- [2026-07-13 19:50] Radiografia «risolvi» = sync strutturale, non solo spiegare — fix chiudono cantiere ma lista scan 7/7 resta finché `allinea-scan-cantiere.mjs` non allinea (7 collegate chiuse); tab «Da fare ora» = cantiere vivo; 67 senza codice AR = archivio audit; marketplace 87 = nuovo audit; **PR #347** merge 🔴.
- [2026-07-13 19:48] Scelte ragionate incomplete — dossier in `consegne/vendite/` **senza** voce in `registro-realta.json` = invisibili in Auto-coscienza (Panel 2 vs 9+ ragionate); Nicola «correggi e non ricapiti» → stesso passaggio dossier→registro; guardiano `registro-scelte-check.mjs` blocca giro; **PR #346** merge 🔴 #117.
- [2026-07-13 19:44] Card Trigger-build Pannello — **obsoleta**: eseguita 11/7 (`4d37c741` su origin); rebuild automatico solo se cambia `pannello/`; commit memoria non buildano (voluto); se Pannello ok → ignora card; se vecchio → diagnosi ultimo deploy, non rifare trigger.
- [2026-07-13 19:43] Casella Gap «MCP marketplace gated» — **non** bug Pannello: avviso onesto 4 numeri non-REST (conferma 7/7); `auto-analisi.json` resta 11/7 14:30 finché non c'è «fai un giro»; REST ordini/clienti ok 19:30, business invariato 24/6; update chat/STATO **non** rigenera auto-analisi.
- [2026-07-13 19:23] Nicola «2) tutto insieme» — testo finale in un colpo solo (nemmeno parola per parola alla fine); #343 ok solo su «Sto elaborando…»; prossimo fix = parziali DB vs poll Pannello, **non** altro merge/restart.
- [2026-07-13 19:20] Attività & Briefing = data ultimo file `Briefing/*.md`, non `STATO.md` — update chat/fix Pannello senza «fai un giro» lascia 11/7 visibile; spiegare subito (non «Pannello rotto»), offrire giro se vuole data fresca.
- [2026-07-13 19:15] Nona prova — Nicola «1)si 2) alla fine 3)uguale»: #343 ok su «Sto elaborando…» subito; testo vero ancora solo alla fine; pallini invariati post-#342; chiedi anche se negli ultimi secondi cresce parola per parola o tutto insieme.
- [2026-07-13] Nicola «cresce live, però solo alla fine» + «non da quando inizi» = **progresso parziale** — streaming ok solo in fase testo finale, non durante letture/comandi; vuole movimento **subito** dopo invio («Sto elaborando…»); fix **#343** su main; dopo merge → `aggiorna-cervello.sh` + Ctrl+Shift+R; pallini = feedback separato.