## Cosa

L'autopilota del Pannello (esegue da solo le azioni 🟢) e la funzione che invia le email reali
(`eseguiAzione`, usata sia dal click "Approva" sia dall'autopilota) non controllavano due cose che
invece la via da terminale (`cervello/consenso-azione.mjs`, AR-103) già controlla:

1. **La PAUSA (kill-switch)**: se Nicola la preme dal Pannello, oggi l'autopilota continua comunque
   a eseguire azioni verdi — l'interruttore non arriva fin lì.
2. **L'allowlist destinatari email** (`cervello/mani-allowlist.json`): un'email poteva partire verso
   qualunque indirizzo scritto nel testo dell'azione, senza controllare che sia autorizzato.

## Perché

Trovato nell'auto-radiografia del 23/7 (AR-138, AR-139) — dettagli in
`MyCity-Vault/90-Memoria-AI/RADIOGRAFIA-MACCHINA.md`. Nessun danno reale è mai successo (oggi non
ci sono destinatari email in allowlist, quindi ogni invio sarebbe comunque finito in coda), ma le
condizioni tecniche per un'azione reale senza vera firma esistevano già.

## Cosa cambia (in pratica)

- Se la pausa è attiva, l'autopilota non esegue nulla (e si ferma a metà giro se viene premuta
  mentre sta lavorando) — stesso comportamento del kill-switch da terminale.
- Un'email reale parte solo se il destinatario è nella lista `cervello/mani-allowlist.json → "email"`
  (oggi vuota — quindi NESSUNA email reale può partire finché non la popoli tu, com'è già oggi via
  terminale). Se non è in lista, l'azione resta "in coda" con il motivo scritto in chiaro.

## Come si prova

- `cd pannello && npx tsc --noEmit` → nessun errore (verificato).
- Attivare `pausa` da Supabase (`impostazioni.chiave=pausa` → `valore=on`) e lanciare
  `POST /api/azioni-pronte/autopilota` → risposta `{ok:true, attivo:true, eseguite:0, in_pausa:true}`,
  nessuna azione eseguita.
- Con `pausa` off e un'azione 🟢 canale email con destinatario NON in `mani-allowlist.json`:
  l'esito torna "coda" con dettaglio "Bloccata dall'allowlist: …".
- Non verificato dal vivo nel browser (sessione headless): solo typecheck + lettura del codice.

## Non ancora fatto (fuori scope di questa PR, per non farla troppo grande)

- Il controllo AZIONE_ID/APPROVATA (per le azioni 🟡/🔴) non è stato portato qui: si applica solo
  alla via CLI perché le azioni 🟢 sono per design auto-eseguibili senza quella firma testuale
  (vedi CLAUDE.md, "Doer mode"). Se in futuro l'autopilota dovesse eseguire anche 🟡/🔴, va aggiunto.
- Il colore 🟢/🟡/🔴 resta testo libero non riverificato lato server (AR-140) — proposto come fix
  separato, non incluso qui per tenere questa PR piccola e sicura da rivedere.
