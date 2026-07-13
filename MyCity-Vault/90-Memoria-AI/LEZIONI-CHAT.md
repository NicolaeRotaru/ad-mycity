# 📌 LEZIONI-CHAT — le regole imparate che ogni chat deve avere davanti

> Mantenuto dalla metabolizzazione (`cervello/metabolizza.md`). Massimo 12 righe di lezione,
> la più recente in cima. Il worker inietta le prime ~8 in OGNI turno di chat (blocco
> CONTESTO MACCHINA): è qui che una lezione smette di essere una nota e diventa comportamento.
> ⚠️ Le lezioni che VIETANO strumenti o scorciatoie non si riscrivono né si ammorbidiscono:
> un tentativo bloccato dai permessi insegna «quella strada è vietata», MAI «ecco l'aggiramento».

- [2026-07-13] `aggiorna-cervello.sh` **RIMANDATO** se VPS resta su branch `fix/*` fresco (<30 min) — anche con working tree pulito; **prima** `git checkout main` (stash memoria se serve, reset `routing.json`), **poi** script; non confondere con merge mancante.
- [2026-07-13] Nicola «cresce live, però solo alla fine» + «non da quando inizi» = **progresso parziale** — streaming ok solo in fase testo finale, non durante letture/comandi; vuole movimento **subito** dopo invio («Sto elaborando…»); fix **#343** su main; dopo merge → `aggiorna-cervello.sh` + Ctrl+Shift+R; pallini = feedback separato.
- [2026-07-13] Primo «cresce live» dopo 7 prove **non chiude** il tema streaming — «solo alla fine» ≠ obiettivo; non dichiarare vittoria finché non parte dall'inizio; chiedi sempre se pallini ancora rotti post-deploy.
- [2026-07-13] Durante prova streaming: **non refreshare a metà** — Ctrl+F5 interrompe il poll della bolla e simula «tutto insieme» anche con #342 live; refresh solo dopo risposta completa o incognito se ancora rotto.
- [2026-07-13] Nicola «fatto» (~18:50) = merge **#341+#342** eseguito — quinta prova streaming; se ancora rotto → incognito o Ctrl+Shift+R (cache browser), non ripetere solo restart worker.
- [2026-07-13] Streaming rotto ≠ sempre worker — verificato 18:41: parziali già in DB Supabase (`in_corso`+`risultato`), rev worker `1081be71` ok; collo di bottiglia = **Pannello** (bolla non aggiornata live) + pallini spostati da ogni delta; fix **#342** mergiata con #341.
- [2026-07-13] Nicola «facciamo la prova» (~18:37) = **quarta** prova streaming — risposta AD = test live; se ancora rotto chiedi se ha fatto `aggiorna-cervello.sh` (non solo restart); feedback binario: cresce / tutto insieme / a colonna; Diagnosi rev ≥ `1081be71`.
- [2026-07-13] Restart worker **≠** codice aggiornato sul VPS — Nicola «ancora non cresce live» post-restart 18:22: serve `sudo bash /opt/mycity/ad-mycity/cervello/vps/aggiorna-cervello.sh` (pull GitHub + riavvia **entrambi** i worker), non solo `systemctl restart`; Diagnosi rev deve essere `1081be71` o più recente.
- [2026-07-13] Pallini merge (#338/#340) = fix **Pannello Vercel** — restart worker-chat non cambia nulla; Nicola «merge non lette» = versione hosted vecchia → deploy Vercel + Ctrl+F5; non confondere con worker stale.
- [2026-07-13] Nicola «ho reinserito il comando in cmd e fatto ctrl+f5» — restart worker **eseguito** ma **non bastava** (L-142): terza prova ancora rotta → causa = codice su disco VPS vecchio, non solo processo stale.