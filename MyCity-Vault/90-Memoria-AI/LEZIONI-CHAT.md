# 📌 LEZIONI-CHAT — le regole imparate che ogni chat deve avere davanti

> Mantenuto dalla metabolizzazione (`cervello/metabolizza.md`). Massimo 12 righe di lezione,
> la più recente in cima. Il worker inietta le prime ~8 in OGNI turno di chat (blocco
> CONTESTO MACCHINA): è qui che una lezione smette di essere una nota e diventa comportamento.
> ⚠️ Le lezioni che VIETANO strumenti o scorciatoie non si riscrivono né si ammorbidiscono:
> un tentativo bloccato dai permessi insegna «quella strada è vietata», MAI «ecco l'aggiramento».

- [2026-07-13] «Facciamo una verifica» (Nicola 18:15) = git merge su main + `git show HEAD:cervello/worker.sh` + test locale `_estrai_stream` + **3 prove Nicola** (restart worker, Ctrl+F5, streaming orizzontale + pallino 15s); «codice ok» ≠ «funziona per te» se worker fermo dal 16:08.
- [2026-07-13] Pallini = **DUE bug** — fix **#338+#340 mergiate** (~18:14): (A) esci da chat → pallino torna (#338); (B) risposta AD senza riaprire → pallino mancava (#340 `selectedConv`). Test A = 15s; test B = Plancia → elenco Conversazioni; deploy Vercel + Ctrl+F5.
- [2026-07-13] Streaming Cursor — testo **spezzato a colonna** (Nicola screenshot ~18:03): micro-frammenti incollati in orizzontale nel worker; in chat **niente Markdown** finché completo; fix **#339 mergiata** ~18:14 + deploy Vercel + `sudo systemctl restart mycity-worker-chat`; «c'è streaming» ≠ «leggibile».
- [2026-07-13] Audit PR giornata — merge #335 ha **annullato** il fix streaming su main (commit buono `db0552a0` ≠ su HEAD); dopo merge verifica `git show HEAD:cervello/worker.sh` (Cursor = `--stream-partial-output`), non solo che la PR sia chiusa.
- [2026-07-13] Worker chat attivo dal 16:08 senza riavvio — fix su `main` (#331, #335, #338) ≠ comportamento live finché non `sudo systemctl restart mycity-worker-chat` sul VPS.
- [2026-07-13] Coda Pannello può restare indietro — card «in attesa» (#335/#337/#331) possono essere già mergiate su GitHub; audit = verifica GitHub + codice su main, non solo la coda.
- [2026-07-13] Nicola «voglio ci sia sempre la descrizione della pr» — **#337** (`git-pr.mjs`): senza body reale (≥80 char, cosa/perché/prova) lo script **si ferma** (exit 1), niente più «PR aperta dall'AD…»; PR esistente → aggiorna body se diverso; prima scrivi in `consegne/tech/pr-*-body.md` o `--body`; merge 🔴 #110.
- [2026-07-13] Nicola «c'è un conflitto» su pallino ~5s — #334 partiva da codice vecchio mentre **#328/#332/#333 già su main**; stesso errore L-129 (PR nuova invece di push sul branch); **mergia solo #336** (`ee9d3f9b`), **chiudi #334**; prima di aprire PR verifica cosa c'è già su main.
- [2026-07-13] Aprire PR senza `--body` lascia solo testo script su GitHub — Nicola «perché non mi hai messo la descrizione della pr dentro github?» (#333): body completo (cosa/perché/prova) **al momento dell'apertura** con `git-pr.mjs --body` o `gh pr create --body-file`; se dimenticato, aggiorna subito — mai aspettare che Nicola se lo chieda.
- [2026-07-13] Allegati chat — 3 superfici: chiedi SEMPRE quale (fluttuante / «Parla con questa casella» / Archivio); `ParlaCasella.tsx` senza graffetta; fluttuante post-#60 su iPhone = bug Safari selettore (#333), non env; prima 503 env, poi superficie, poi browser.
- [2026-07-13] Un bug = una PR — Nicola «impara» + «ripeterai?»: mai 2-3 PR stesso bug; branch fix = **solo** cartella del fix, zero file memoria worker; mai «pronta» senza simulare merge su main.