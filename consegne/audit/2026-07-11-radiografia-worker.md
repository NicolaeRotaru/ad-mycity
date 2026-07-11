---
data: 2026-07-11 14:07
tipo: radiografia
oggetto: worker del VPS (cervello/worker.sh + motore-ai.sh)
---

# 🩻 Radiografia del worker — perché sbagliava e cosa è cambiato

> Richiesta di Nicola: «il worker fa tante cavolate, spiega male, non ragiona,
> non risolve i problemi da solo — rendilo come Claude Code al massimo».
> Analisi completa della pipeline: coda lavori → prompt → motore AI → risposta → memoria.

## La diagnosi (le cause radice, in ordine di gravità)

1. **Amnesia totale tra i turni.** Ogni messaggio di chat lanciava un Claude NUOVO: l'AD
   perdeva cosa aveva letto, provato e sbagliato un minuto prima. Da qui i giri in tondo,
   i «già fatto» mai verificati, gli stessi errori ripetuti. Era la differenza n.1 con
   Claude Code, che vive in una sessione continua.
2. **Ragionamento spento.** Il motore partiva senza budget di pensiero (extended thinking):
   rispondeva d'istinto, senza ragionare prima di agire.
3. **Conosceva solo i divieti.** Il prompt elencava 10 cose vietate ma non diceva cosa PUÒ
   fare (e un commento nel codice diceva — ormai a torto — che la chat era «senza mani»).
   Un modello che non sa di avere strumenti tira a indovinare invece di verificare.
4. **Nessun contratto di stile.** Le risposte uscivano piene di sigle, hash e percorsi:
   incomprensibili per chi non è un tecnico.
5. **Contesto reale solo in chat.** I lavori (azioni approvate, analisi) partivano ciechi:
   senza branch attuale, coda, segnali, lezioni imparate.
6. **Errori in "linguaggio macchina".** Quando qualcosa moriva, in card arrivava il dump
   grezzo della CLI.
7. **Codice morto ingannevole.** La vecchia «corsia veloce» (classificatore Sonnet/Opus)
   non era più chiamata da nessuno ma restava nel file, con 2 file di test dedicati.
8. **Test che sporcavano la memoria vera.** La suite depositava avvisi «(test)» nel vault
   di produzione a ogni run.

## Le cure (tutte attive dopo il merge, nessuna richiede configurazione)

| # | Cura | Effetto per Nicola |
|---|------|--------------------|
| 1 | **Memoria di sessione** — ogni conversazione del Pannello riprende la STESSA sessione Claude (`--resume`), mappa in `impostazioni` (`chat:sessione:<gruppo>`), fallback automatico se la sessione muore. Copre streaming E non-stream. | L'AD ricorda la conversazione come Claude Max: niente più giri in tondo. |
| 2 | **Ragionamento esteso** — budget di pensiero (8.000 token, regolabile con `CERVELLO_THINKING_TOKENS`) su TUTTE le corsie: chat, giro, ritmo, azioni. | Risposte pensate, non d'istinto. Con l'indicatore «💭 Sto ragionando…» nel Pannello mentre pensa. |
| 3 | **Cassetta degli attrezzi esplicita** — il prompt ora elenca il PUÒ (leggere tutto, git locale, strumenti del cervello, web) accanto ai divieti, con la regola «un comando verificato vale più di dieci ipotesi». | Verifica invece di indovinare. |
| 4 | **Contratto di chiarezza** — prima riga = l'esito come lo diresti a voce; max 5 punti; sigle/ID/percorsi solo in fondo sotto «🔧 Dettagli tecnici»; passi numerati quando Nicola deve agire. Vale per chat E lavori. | Risposte che si capiscono al primo colpo. |
| 5 | **Contesto macchina ovunque** — branch, file sporchi, coda, segnali e lezioni iniettati anche in esegui-azione e nei lavori generici (prima: solo chat). | Meno azioni «cieche», meno commit sul branch sbagliato. |
| 6 | **Diagnosi umana degli errori** — quando un lavoro muore, una seconda passata AI (breve, senza mani) spiega in 2-3 frasi semplici cosa è successo e cosa fare; il dump tecnico resta sotto, per chi indaga. Salta gli errori di quota (ci pensa già la retry-policy). | Mai più «vomito tecnico» in card. |
| 7 | **Impronta-verità su tutti i lavori** — lo stato reale del repo (commit, file toccati) è appeso dal CODICE, non dal modello, a ogni lavoro che cambia qualcosa. | Un «fatto» non provato non passa più. |
| 8 | **Delega ai senior nei lavori pesanti** — il prompt dei lavori spinge a usare i 120 agenti (`.claude/agents/`, strumento Task) in parallelo. | Più capacità sui compiti grossi. |
| 9 | **Igiene** — pulizia automatica delle sessioni ferme da >14 giorni (`WORKER_SESSIONI_GIORNI`); rimosso il codice morto della corsia veloce; i test non sporcano più il vault (`AVVISI_FILE`). | Macchina più pulita e leggibile. |

**Test:** suite bats completa verde — 92 test (13 nuovi in `sessione-chat.bats`).

## Cosa resta per l'ULTIMO gradino (serve una scelta di Nicola)

1. **Modello esplicito.** Oggi `CERVELLO_MODELLO` è vuoto → si usa il default della CLI sul
   VPS. Se il default non è il modello più potente del piano Max, si perde qualità senza
   accorgersene. Verifica sul VPS con `claude config get model` (o semplicemente scrivi in
   `cervello/vps/.env`: `CERVELLO_MODELLO=claude-opus-4-8`) e riavvia il worker.
2. **Timeout.** Col ragionamento attivo i lavori complessi possono avvicinarsi ai 15 minuti
   (`WORKER_TIMEOUT=900`). Se vedremo timeout, alzarlo a 1200 è un rigo nel `.env`.
3. **Sensori ancora spenti** (fuori dal worker ma limitano l'intelligenza): Stripe non
   collegato (cassa stimata, non misurata) e chiavi AI dei creativi mancanti. Sono il
   «carburante» già censito in AZIONI-IN-ATTESA.

## 🔧 Dettagli tecnici
- File toccati: `cervello/worker.sh`, `cervello/motore-ai.sh`, `cervello/avviso-telegram.mjs`,
  `cervello/vps/.env.example`, `cervello/test/sessione-chat.bats` (nuovo),
  `cervello/test/gate-coerenza-vault-pre-push.bats`; rimossi `chat-veloce.bats`, `chat-veloce-run.sh`.
- Branch: `claude/background-session-check-uwtm6u` (merge da firmare dal Pannello).
- Dopo il merge: watch-main porta il codice sul VPS e il worker si ricarica da solo
  (gate di provenienza + `bash -n` già esistenti). Nessun comando manuale necessario.
