# 📌 LEZIONI-CHAT — le regole imparate che ogni chat deve avere davanti

> Mantenuto dalla metabolizzazione (`cervello/metabolizza.md`). Massimo 12 righe di lezione,
> la più recente in cima. Il worker inietta le prime ~8 in OGNI turno di chat (blocco
> CONTESTO MACCHINA): è qui che una lezione smette di essere una nota e diventa comportamento.
> ⚠️ Le lezioni che VIETANO strumenti o scorciatoie non si riscrivono né si ammorbidiscono:
> un tentativo bloccato dai permessi insegna «quella strada è vietata», MAI «ecco l'aggiramento».

- [2026-07-13] Nicola «facciamo la prova» (~18:37) = **quarta** prova streaming — risposta AD = test live; se ancora rotto chiedi se ha fatto `aggiorna-cervello.sh` (non solo restart); feedback binario: cresce / tutto insieme / a colonna; Diagnosi rev ≥ `1081be71`.
- [2026-07-13] Restart worker **≠** codice aggiornato sul VPS — Nicola «ancora non cresce live» post-restart 18:22: serve `sudo bash /opt/mycity/ad-mycity/cervello/vps/aggiorna-cervello.sh` (pull GitHub + riavvia **entrambi** i worker), non solo `systemctl restart`; Diagnosi rev deve essere `1081be71` o più recente.
- [2026-07-13] Pallini merge (#338/#340) = fix **Pannello Vercel** — restart worker-chat non cambia nulla; Nicola «merge non lette» = versione hosted vecchia → deploy Vercel + Ctrl+F5; non confondere con worker stale.
- [2026-07-13] Nicola «ho reinserito il comando in cmd e fatto ctrl+f5» — restart worker **eseguito** ma **non bastava** (L-142): terza prova ancora rotta → causa = codice su disco VPS vecchio, non solo processo stale.
- [2026-07-13] Nicola «riprova» dopo demo streaming — secondo test live che fallisce **conferma** worker VPS stale (16:08): codice #338+#339 su main ok ma processo vecchio; un solo sblocco = restart + «ok fatto» prima di terza prova.
- [2026-07-13] Nicola «mostrami la risposta in streaming» — la risposta **è** il test live: chiedi cosa vede (cresce / tutta insieme / a colonna); tutta insieme o colonna = worker VPS non riavviato dal 16:08, non solo Pannello.
- [2026-07-13] «Facciamo una verifica» (Nicola 18:15) = git merge su main + `git show HEAD:cervello/worker.sh` + test locale `_estrai_stream` + **3 prove Nicola** (restart worker, Ctrl+F5, streaming orizzontale + pallino 15s); «codice ok» ≠ «funziona per te» se worker fermo dal 16:08.
- [2026-07-13] Pallini = **DUE bug** — fix **#338+#340 mergiate** (~18:14): (A) esci da chat → pallino torna (#338); (B) risposta AD senza riaprire → pallino mancava (#340 `selectedConv`). Test A = 15s; test B = Plancia → elenco Conversazioni; deploy Vercel + Ctrl+F5.
- [2026-07-13] Streaming Cursor — testo **spezzato a colonna** (Nicola screenshot ~18:03): micro-frammenti incollati in orizzontale nel worker; in chat **niente Markdown** finché completo; fix **#339 mergiata** ~18:14 + deploy Vercel + `sudo systemctl restart mycity-worker-chat`; «c'è streaming» ≠ «leggibile».
- [2026-07-13] Audit PR giornata — merge #335 ha **annullato** il fix streaming su main (commit buono `db0552a0` ≠ su HEAD); dopo merge verifica `git show HEAD:cervello/worker.sh` (Cursor = `--stream-partial-output`), non solo che la PR sia chiusa.
- [2026-07-13] Coda Pannello può restare indietro — card «in attesa» (#335/#337/#331) possono essere già mergiate su GitHub; audit = verifica GitHub + codice su main, non solo la coda.
- [2026-07-13] Un bug = una PR — Nicola «impara» + «ripeterai?»: mai 2-3 PR stesso bug; branch fix = **solo** cartella del fix, zero file memoria worker; mai «pronta» senza simulare merge su main.