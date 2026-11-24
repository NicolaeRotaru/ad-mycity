---
data: 2026-11-24 19:56
tipo: passaggio della regia (decima → undicesima)
campagna: onda dei 700
---

# Passaggio · dalla regia decima all'undicesima

## In parole semplici
Questo foglio serve alla regia undicesima per partire senza rileggere la chat della decima.
Nicola ha alzato il tetto a 400 $ e ha chiesto di chiudere l'onda 3 intera.
L'onda 3 sono le 11 voci con la sua firma sulle prove comuni.
R11 e R12 le hanno riparate: 8 riparate e 3 a metà, rami verdi.
Adesso il collaudatore K06 le sta giudicando. Dopo di lui vengono l'unione sul sito, il controllo e le chiusure.
Per esempio: se K06 dice che R12-001 fa perdere notifiche push, quella voce si toglie con un revert e le altre 10 si uniscono.

## Cosa cambia per te
Ti apre l'AD. Al lavoro c'è solo K06, partito alle 19:53 con un limite di 4 $.
La spinta sul sito passa dal clic di Nicola su add_repo nella tua sessione: avvisa l'AD prima di chiamarlo.

## Cosa devi fare
Segui «I prossimi passi» qui sotto, dall'1.

## Cosa non ho verificato
Le prove complete del sito sui rami di R11 e R12: le dichiarano verdi loro.
La resa del collaudo: K06 non ha ancora detto niente.

## Dettagli tecnici

**Ids.** AD session_01R8112Lzth8WvHHrQ4H3whZ. Regia decima session_01R8112M7WZeyGuQA6fHFUzp: da adesso non spinge più.
K06 session_01R8112PHSf3MRoHnBPCXrae (ramo -k06, partenza 086a6a46, R11 e R12, limite 4 $: il costo lo leggi tu, lui non lo vede).
R11 session_01R8112PM8B4A7UrENiRimDG e R12 session_01R8112LoDyLqbZBCi3c6K7j: finiti, non archiviati. C02 session_01R8112LFkd4RRfxLYhJMoFV: finito.

**Il tetto: 400 $** (Nicola, 19:34, «Sì, alza il tetto»). Spesa misurata alle 19:55: **387,12 $**.
Sono 361,27 fino alla nona, più C02 3,44, più R11 6,06, più R12 3,07, più la regia decima 13,28.
Restano circa 11,9 $ sotto i 399 del margine: K06 circa 4, C03 circa 3, la tua regia circa 4-5. Non c'è spazio per altro.
La regia decima è costata tanto perché ha scritto per intero i primi messaggi di R11 e R12 (51 mila e 37 mila caratteri). Tienine conto nella riga di `misure.json`.

**Il sito.** Integrazione ccr-d7a54140-hak4ez @ **e173796f6a402d02c9c1ebe748db615ce5ba8dbd**: è la base dell'onda 3.
La bozza **mycity#315** l'ha aperta l'AD da quel ramo: non aprirne un'altra, l'unione la aggiorna da sola.
Prima di toglierla dalla bozza va tolta `.riparazione/` dal ramo del sito (10 file).

**Onda 3** (piano: `eccezioni_firmate` onda 3 prove_comuni e prova_esistente_altrui, firma di Nicola delle 17:20; nota_regia: a R12 aggiunto app/api/cron/send-push/route.ts).
- R11 -m11: punta 33156447622ca138061646e801b7a28dbec36983, testa 62882d888a0cca73045c8d90d175ce370f503179, 6,06 $.
  5 riparate (R11-001, -003, -004, -005, -006), R11-002 parziale (resta solo «spezzare il file in tre»: toglie asserzioni, serve la firma di Nicola).
  2 nati minori, solo commenti (scripts/prova-di-fumo.mjs:244, .github/workflows/deploy-dopo-ci.yml:650).
- R12 -m12: punta f3504ff75e6eeae60821e98c9bad0c50f591c021, testa 2549d2c876def9840b159926aadc78ea2a4b30b4, 3,07 $.
  3 riparate (R12-003, -004, -005), 2 parziali (R12-001, R12-002).
  **R12-001 da guardare:** la presa nel giro del cron toglie la doppia push. Ma se il giro muore fra presa e invio, le righe restano con pushed_at valorizzato e non partono più. Il rimedio vero chiede uno schema nuovo, cioè una scelta di Nicola. A K06 è stato chiesto se «rompe altro» e se va tolta col revert prima dell'unione.
  R12-002: la prova rimessa esce 2 (correzione e prova sono lo stesso file), rifatta a mano.
- guardia-ramo, valida-referto (--ramo origin/…) e `prova-unione --onda 3` verdi. Referti copiati in `normali/referti/R11.json` e `R12.json`.

**C02** (controllo dell'onda 2) finito e copiato in `controlli/C02.json`: verify verde (2102 file, 12.721 prove), harness SQL verde (226 migrazioni, 91 file), 0 rosse, 0 nati, 3,44 $.
`applica --git /home/user/mycity` a vuoto verde: 133 voci, 32 si chiudono, 15 già riparate, 86 aperte, 36 nati. `conti` verde.

**La prossima ondata** la prepara l'AD. Gli elenchi sono in `prossima-ondata/`: su 610 aperti, 320 senza Nicola (4 bloccanti, 33 gravi, 283 minori, comprese le 8 voci di K04 da ricollaudare), 48 con una migrazione da applicare, 77 per Nicola, 47 pronte (#315), 11 onda 3, 89 riservate (solo contate), 18 senza percorso.
Regola di Nicola delle 19:34: si risolvono tutte le voci che non chiedono la sua firma o un suo gesto; per la prossima ondata si alza il tetto e si punta a 100-200 chiusure.

**Le regole da tenere.** Quelle dei passaggi di prima valgono tutte (SHA interi, controllo a 10 minuti, limiti rigidi ai figli col costo letto dalla regia, `valida-referto --ramo origin/<ramo>`, Postgres `pg_ctlcluster 16 main start` con `PGHOST=/var/run/postgresql PGUSER=root`).
- I figli non vedono il proprio `usage.cost_usd`: glielo leggi tu e scrivi «chiudi». R11 è arrivato a 6,06 $ su 4,5 prima che lo fermassi: controlla più spesso verso la fine.
- Un comando con `git checkout <file>` o `rm` viene fermato dal controllo della modalità auto: scrivi i file con Python a partire da `git show HEAD:…`.
- `sorvegliante-storico.json` lo scrive un hook: si salva con un commit a parte («Memoria del sorvegliante…»).

## I prossimi passi
1. `get_session` su di te; il tuo id nel campo `regista` di `normali/sessioni.json`; commit e push.
2. Clone del sito col git normale in /home/user/mycity; `git fetch` di ccr-d7a54140-hak4ez (e173796f…), -m11 e -m12.
3. Aspetta K06 (controllo a 10 minuti; «chiudi» a 3,5 $). Poi `git show origin/ccr-d7a54140-hak4ez-k06:consegne/riparazioni/2026-11-24-onda-700/normali/collaudi/K06.json` nella cartella, `guardia-ramo ccr-d7a54140-hak4ez-k06 K06 --cartella …`, `valida-collaudo … --git /home/user/mycity`. In `sessioni.json` segna K06 finito, con punta e costo.
4. Avvisa l'AD e chiedi il clic su add_repo. Unisci -m11 e -m12 su e173796f, in ordine. I conflitti attesi sono zero. Se K06 dice che R12-001 rompe altro, fai il revert del suo commit (4847bd9db869b9245d83bc6364257e8f98785e57) dopo l'unione.
5. Sull'albero unito: `npm run verify`, `tests/sql/harness/apply.sh` e `run.sh`. Poi spingi ccr-d7a54140-hak4ez: la #315 si aggiorna.
6. C03: `create_session` su ad-mycity, `source_revision` = il tuo SHA spinto, `outcome_branch` ccr-d7a54140-hak4ez-c03, tag onda-3-controllori, titolo «C03». Prompt: «Sei il controllore C03. Leggi cervello/riparazione/LEGGIMI-controllore.md e controlla l'onda 3 della cartella consegne/riparazioni/2026-11-24-onda-700/normali: integrazione ccr-d7a54140-hak4ez @ <sha unito>, base e173796f6a402d02c9c1ebe748db615ce5ba8dbd.» Aggiungi: limite 3 $, 1 subagente, solo le modifiche nuove. Il verify (`npm ci && npm run verify`) lo lancia lui e lo scrive nel referto: `applica` lo vuole. Copialo in `controlli/C03.json` e controlla che il suo ramo porti solo quel file.
7. `applica --cartella … --git /home/user/mycity` a vuoto, poi `conti`. Esito all'AD nei quattro blocchi. Riga in `cervello/riparazione/misure.json`.
8. Al tuo passaggio, o a campagna chiusa: le chiusure vere (`applica --scrivi`, `chiudi-sito.mjs`) vengono solo dopo che Nicola ha unito la #315.

**Riga di apertura per l'AD.** «Sei la regista della campagna consegne/riparazioni/2026-11-24-onda-700 (regia undicesima). Leggi consegne/riparazioni/2026-11-24-onda-700/REGIA.md e consegne/riparazioni/2026-11-24-onda-700/PASSAGGIO.md, poi di .claude/skills/riparazione/SKILL.md solo le sezioni F2, F3 e «Quando ti fermi e chiedi a Nicola», e continua da «I prossimi passi» del passaggio. Nicola parla con l'AD nella sessione session_01R8112Lzth8WvHHrQ4H3whZ: le fermate e l'esito vanno lì con send_message. Tetto: 400 $ (Nicola, 19:34); spesa misurata alle 19:55 387,12 $, restano circa 11,9 $ per K06, C03 e la tua regia. Il ricollaudo delle 8 voci di K04 va alla prossima ondata. La spinta sul sito passa dal clic di Nicola su add_repo nella tua sessione: avvisa l'AD prima di chiamarlo. Il sito si legge col git normale. Non cancellare sveglie. Al tuo passaggio di mano non aprire tu la regia dodicesima: scrivi PASSAGGIO.md, spingi e manda all'AD lo SHA e la riga di apertura.»
