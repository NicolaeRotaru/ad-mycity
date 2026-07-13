# 📌 LEZIONI-CHAT — le regole imparate che ogni chat deve avere davanti

> Mantenuto dalla metabolizzazione (`cervello/metabolizza.md`). Massimo 12 righe di lezione,
> la più recente in cima. Il worker inietta le prime ~8 in OGNI turno di chat (blocco
> CONTESTO MACCHINA): è qui che una lezione smette di essere una nota e diventa comportamento.
> ⚠️ Le lezioni che VIETANO strumenti o scorciatoie non si riscrivono né si ammorbidiscono:
> un tentativo bloccato dai permessi insegna «quella strada è vietata», MAI «ecco l'aggiramento».

- [2026-07-13 19:43] Casella Gap «MCP marketplace gated» — **non** bug Pannello: avviso onesto 4 numeri non-REST (conferma 7/7); `auto-analisi.json` resta 11/7 14:30 finché non c'è «fai un giro»; REST ordini/clienti ok 19:30, business invariato 24/6; update chat/STATO **non** rigenera auto-analisi.
- [2026-07-13 19:34] Pallini ancora rossi post-#336–#342 — **non** worker/VPS; prima del fix chiedi scenario Nicola (1 esci→~8s torna rosso / 2 Plancia / 3 lampeggio / 4 tutte rosse); nessuna PR residuo aperta; #343 streaming = track separato.
- [2026-07-13 19:32] Radiografia/marketplace «ancora 74/87 problemi» dopo fix — lista = **foto scan 7/7**, cantiere vivo si aggiorna (42 chiusi); mergiare fix **non** riscrivono l'audit; spiegare scan vs cantiere + voto live (#344); lista lunga sparisce solo con **nuovo audit** completo.
- [2026-07-13 19:23] Nicola «2) tutto insieme» — testo finale in un colpo solo (nemmeno parola per parola alla fine); #343 ok solo su «Sto elaborando…»; prossimo fix = parziali DB vs poll Pannello, **non** altro merge/restart.
- [2026-07-13 19:20] Attività & Briefing = data ultimo file `Briefing/*.md`, non `STATO.md` — update chat/fix Pannello senza «fai un giro» lascia 11/7 visibile; spiegare subito (non «Pannello rotto»), offrire giro se vuole data fresca.
- [2026-07-13 19:15] Nona prova — Nicola «1)si 2) alla fine 3)uguale»: #343 ok su «Sto elaborando…» subito; testo vero ancora solo alla fine; pallini invariati post-#342; chiedi anche se negli ultimi secondi cresce parola per parola o tutto insieme.
- [2026-07-13 19:16] Tabella OKR = obiettivi fissi (`OKR-Squadra.md` 24/6, poll 90s solo se doc cambia su GitHub); **tutte** le righe uguali; numeri live = Stelle Polari (60s) o «I numeri di oggi»; chat sotto ogni OKR = quasi live.
- [2026-07-13 19:13] Nicola «ok fatto» = allineamento VPS completato post-#343 — worker-chat riavviato 19:10; **nona** prova streaming = «Sto elaborando…» subito dopo invio + testo che cresce; pallini = feedback separato.
- [2026-07-13] `aggiorna-cervello.sh` **RIMANDATO** se VPS resta su branch `fix/*` fresco (<30 min) — anche con working tree pulito; **prima** `git checkout main` (stash memoria se serve, reset `routing.json`), **poi** script; non confondere con merge mancante.
- [2026-07-13] Nicola «cresce live, però solo alla fine» + «non da quando inizi» = **progresso parziale** — streaming ok solo in fase testo finale, non durante letture/comandi; vuole movimento **subito** dopo invio («Sto elaborando…»); fix **#343** su main; dopo merge → `aggiorna-cervello.sh` + Ctrl+Shift+R; pallini = feedback separato.
- [2026-07-13] Durante prova streaming: **non refreshare a metà** — Ctrl+F5 interrompe il poll della bolla e simula «tutto insieme» anche con #342 live; refresh solo dopo risposta completa o incognito se ancora rotto.
- [2026-07-13] Streaming rotto ≠ sempre worker — verificato 18:41: parziali già in DB Supabase (`in_corso`+`risultato`), rev worker `1081be71` ok; collo di bottiglia = **Pannello** (bolla non aggiornata live) + pallini spostati da ogni delta; fix **#342** mergiata con #341.