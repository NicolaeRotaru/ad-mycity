# Upgrade del worker-chat — dalle cavolate reali alle contromisure

- **Data:** 2026-07-10 17:19 (Europe/Rome)
- **Chi:** AD (sessione cloud, richiesta di Nicola: «faceva un sacco di cavolate, migliora tutto quello che sbaglia»)
- **Base di evidenza:** le trascrizioni VERE delle chat di oggi nel DB memoria (tabella `lavori`), non ipotesi.

## Le cavolate documentate (con l'ora)

| Ora | Cavolata | Perché è successa |
|---|---|---|
| 11:04 | Committa le chip skill sul branch `fix/rimuovi-autoscroll-chat` (avanzo della sessione dell'autoscroll) | Ogni sessione parte cieca: non sa su che branch si trova |
| 11:13 | «Serve approvazione per `gh pr create`. Approva e la PR parte» — ma `gh` NON è installato e il box di approvazione nel Pannello NON esiste (headless) | Non conosce la propria cassetta degli attrezzi né il proprio ambiente |
| 11:14 | Suggerisce `/update-config` (strumento che lì non esiste) e detta a Nicola regole permessi da incollare (`gh pr create:*`…) | Aggira i blocchi invece di rispettarli |
| 11:17 | Propone `sudo apt install gh` sul VPS | Idem: installare software per aggirare l'ignoranza di git-pr.mjs |
| 10:05-10:10 | Fa incollare a Nicola `git push:*` e `curl:*` nel settings.local.json | Consiglio pericoloso: ha spalancato il push su main |
| 10:14 | «Le modifiche delle chat precedenti non sono qui… devo rifarle» | Amnesia di sessione non gestita |
| 17:0x | Commit «pannello: forza build Vercel (v3)» dritti su main | Non sa che il deploy parte da solo al merge |

## Le contromisure (in questa PR)

1. **🧭 CONTESTO MACCHINA** (`contesto_macchina_chat()` in `worker.sh`) — a OGNI turno di chat il worker (codice, non modello) inietta nel prompt: ora esatta, branch attuale, ultimo commit, file sporchi coi nomi, coda lavori delle ultime 24h, segnali automazione in errore/warn, e le prime 8 lezioni da LEZIONI-CHAT.md. La chat non parte più cieca: il branch sbagliato e i «già fatto» falsi muoiono qui. Degrada con grazia (senza Supabase mostra comunque la verità git).
2. **🧰 CASSETTA DEGLI ATTREZZI esplicita nel prompt** — sei headless (nessun box di approvazione esiste); le PR solo con `git-pr.mjs` (gh non esiste e non si installa); mai chiedere di allargare permessi; mai `sudo`/`apt`/script `_tmp_*`; mai «forza build» su main (il deploy parte da solo al merge); parti da main aggiornato, branch nuovo, e a PR aperta torna su main.
3. **🔁 Circuito delle lezioni chiuso** — nuovo `MyCity-Vault/90-Memoria-AI/LEZIONI-CHAT.md` (seminato con le 8 lezioni di oggi): la metabolizzazione lo mantiene (regole aggiunte in `metabolizza.md`: una riga per lezione, la più recente in cima, max 12, niente duplicati) e il worker lo rilegge in ogni turno. Prima le lezioni finivano in un JSON che la chat non apriva mai: ora una correzione di Nicola diventa comportamento al turno successivo.
4. **⚠️ Errori in lingua umana** — se il motore della chat muore, prima una riga chiara («il messaggio non è perso, riprova; se risuccede dimmelo»), poi il dettaglio tecnico per la diagnosi.

## Test
`cervello/test/contesto-chat.bats` (5 casi: verità su branch/commit, conteggio file sporchi coi nomi, degradazione senza Supabase, lettura lezioni, guardia anti-drift). Suite completa worker+motore: **25/25 verde**.

## Cosa vedrai di diverso da domani
- La chat sa sempre dove si trova e cosa è successo (niente più «rifaccio da capo»).
- Se sbaglia strada, te lo dice l'impronta-verità in fondo al messaggio — e la lezione finisce in LEZIONI-CHAT.md, così la volta dopo non lo rifà.
- Se un attrezzo manca o un permesso è negato, lo dichiara e accoda l'azione invece di inventarsi `gh`, `sudo` o permessi da incollare.
