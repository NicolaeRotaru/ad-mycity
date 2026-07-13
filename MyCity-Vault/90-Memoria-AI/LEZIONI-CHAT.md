# 📌 LEZIONI-CHAT — le regole imparate che ogni chat deve avere davanti

> Mantenuto dalla metabolizzazione (`cervello/metabolizza.md`). Massimo 12 righe di lezione,
> la più recente in cima. Il worker inietta le prime ~8 in OGNI turno di chat (blocco
> CONTESTO MACCHINA): è qui che una lezione smette di essere una nota e diventa comportamento.
> ⚠️ Le lezioni che VIETANO strumenti o scorciatoie non si riscrivono né si ammorbidiscono:
> un tentativo bloccato dai permessi insegna «quella strada è vietata», MAI «ecco l'aggiramento».

- [2026-07-13] Audit PR giornata — merge #335 ha **annullato** il fix streaming su main (commit buono `db0552a0` ≠ su HEAD); dopo merge worker verifica `git show HEAD:cervello/worker.sh` (Cursor = `--stream-partial-output`), non solo che la PR sia chiusa; serve PR correttiva + riavvio worker.
- [2026-07-13] Worker chat attivo dal 16:08 senza riavvio — fix su `main` (#331 plugin fase 3, #335 streaming) ≠ comportamento live finché non `sudo systemctl restart mycity-worker-chat` sul VPS; post-merge worker sempre nel checklist audit.
- [2026-07-13] #336 mergiata ma pallino ancora rotto — Nicola riconferma 17:52; «codice su main» ≠ verificato sul suo telefono/PC; chiedi prova post-deploy (10s fermo) prima di dire «fix live».
- [2026-07-13] Coda Pannello può restare indietro — card «in attesa» (#335/#331/#329/#318/#323) possono essere già mergiate su GitHub; audit giornata = verifica GitHub + codice su main, non solo la coda.
- [2026-07-13] Nicola «voglio ci sia sempre la descrizione della pr» — **#337** (`git-pr.mjs`): senza body reale (≥80 char, cosa/perché/prova) lo script **si ferma** (exit 1), niente più «PR aperta dall'AD…»; PR esistente → aggiorna body se diverso; prima scrivi in `consegne/tech/pr-*-body.md` o `--body`; merge 🔴 #110.
- [2026-07-13] Nicola «c'è un conflitto» su pallino ~5s — #334 partiva da codice vecchio mentre **#328/#332/#333 già su main**; stesso errore L-129 (PR nuova invece di push sul branch); **mergia solo #336** (`ee9d3f9b`), **chiudi #334**; prima di aprire PR verifica cosa c'è già su main.
- [2026-07-13] Aprire PR senza `--body` lascia solo testo script su GitHub — Nicola «perché non mi hai messo la descrizione della pr dentro github?» (#333): body completo (cosa/perché/prova) **al momento dell'apertura** con `git-pr.mjs --body` o `gh pr create --body-file`; se dimenticato, aggiorna subito — mai aspettare che Nicola se lo chieda.
- [2026-07-13] Chat fluttuante Safari/iPhone — graffetta visibile ma selettore file non si apre: input nascosto + click finto ignorato da Safari (post-#60 Storage ok); fix **#333** tap diretto sull'input (`b2d86257`), merge 🔴 #106; workaround = ingrandisci chat intera; **ParlaCasella** ancora senza graffetta (fix separato).
- [2026-07-13] Pallino ~5s ancora in produzione fino a merge **#336** — #332 su main (17:37) incompleto; Nicola riconferma 17:54; merge 🔴 #108 → test 10s fermo senza ricaricare; chiudi #334; #328 sync ok.
- [2026-07-13] Allegati chat — 3 superfici: chiedi SEMPRE quale (fluttuante / «Parla con questa casella» / Archivio); `ParlaCasella.tsx` senza graffetta; fluttuante post-#60 su iPhone = bug Safari selettore (#333), non env; prima 503 env, poi superficie, poi browser.
- [2026-07-13] PR #329 conflitti — Nicola «ci sono dei conflitti»: file memoria worker nel branch, non il codice fix; ripulire a **solo** file del fix, simulare merge — mai «pronta» senza verifica; mergia **#329** (🔴 #101).
- [2026-07-13] Un bug = una PR — Nicola «impara» + «ripeterai?»: mai 2-3 PR stesso bug; branch fix = **solo** cartella del fix, zero file memoria worker; mai «pronta» senza simulare merge su main.
- [2026-07-13] Guardiano agenti — `agent-registry-check.mjs` non leggeva le `description` del router: collisioni fraud-risk/trust-safety passavano in verde; fix PR #329 su main.