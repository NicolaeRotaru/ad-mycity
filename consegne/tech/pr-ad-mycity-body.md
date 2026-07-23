## Cosa

Sistema la **risposta duplicata** nella chat del Pannello (Assistente/Worker), segnalata da Nicola con screenshot: due bolle identiche una sotto l'altra quando cambia/riapre una conversazione mentre l'AD sta ancora scrivendo.

Due livelli:
1. **Causa radice** — in `pannello/src/lib/lavori-gruppo.ts`, un lavoro ancora in corso ("in_attesa"/"in_corso") ora è **sempre** trattato come pending, anche se ha già del testo parziale (streaming). Prima, se c'era già del testo, veniva ricostruito come risposta **già finita** da un percorso (riapertura da "Lavori"/Conversazioni) mentre il poller in tempo reale lo trattava ancora come **pending** — i due percorsi finivano disallineati e producevano due bolle per la stessa risposta. Aggiunti anche id stabili (`lavoro.id:u` / `lavoro.id:a`) ai messaggi ricostruiti.
2. **Allineamento testo** — in `pannello/src/app/page.tsx` (`risolviLavoriPendenti`), il `.trim()` sul risultato ora è uguale a quello già usato in `messaggiDaLavoro`: senza, un risultato con spazi/a-capo finali diventava due stringhe diverse per la stessa risposta e la dedup (che confronta il testo esatto) non le riconosceva come duplicate.
3. **Rete di sicurezza a video** — nuova funzione `dedupRenderMsgs()`, applicata nei due punti dove i messaggi vengono disegnati (chat "Assistente" e chat "Worker" flottante/schermo intero): collassa bolle **consecutive identiche** (stesso ruolo, stesso testo, stesso pending/prompt) prima di mostrarle, qualunque sia il percorso che le ha prodotte. Non cambia nessuna logica di invio/salvataggio, solo cosa viene disegnato.

Il **menu (hamburger) che non si chiude** cliccando fuori o su una voce (3° problema segnalato) risulta **già sistemato nel codice** dal commit `4b32417f` (10/7) — backdrop cliccabile + chiusura su scelta voce, stesso comportamento del cassetto Conversazioni. Se sul telefono di Nicola succede ancora, il sospetto è che il Pannello che vede sia una build vecchia non ancora ripubblicata (legato al lavoro di oggi sull'auto-deploy). Nessuna modifica di codice necessaria per questo punto in questa PR.

Il **salto/refresh della vista durante lo streaming** (2° problema) resta **aperto**: la cronologia del Pannello ha già 6 branch precedenti dedicati solo allo scroll della chat, segno di un'area fragile — non ho voluto aggiungere un 7° tentativo alla cieca senza poterlo verificare dal vivo (vedi sotto).

## Perché

Nicola ha segnalato il problema con uno screenshot dal telefono; la causa radice (disallineamento pending/testo tra i due percorsi che ricostruiscono la chat) era già documentata in un commento nel codice come tentativo precedente non bastante — qui si chiude quello scarto e si aggiunge una rete di sicurezza indipendente dalla causa esatta.

## Come provare

- `npx tsc --noEmit` da dentro `pannello/`: pulito (nessun errore).
- `node --test pannello/src/lib/chat-thread-merge.test.mts`: 4/4 verde (la logica di dedup usata dai merge non regredisce).
- **Non verificato dal vivo nel browser**: in questa sessione headless `npm run dev` richiede un'approvazione che non può comparire (nessun umano al terminale in questo momento). Prima del merge sarebbe meglio: aprire il Pannello, mandare un messaggio, cambiare conversazione mentre l'AD sta ancora rispondendo, tornare indietro — controllare che la risposta compaia una volta sola.

## Limiti dichiarati

- Bug 2 (salto/refresh durante lo streaming) **non è stato toccato** in questa PR — serve una verifica dal vivo (idealmente su telefono, con tastiera aperta) prima di intervenire, per non aggiungere un ennesimo tentativo alla cieca su un'area già toccata 6 volte in passato.
- Bug 3 (menu) è verificato solo **nel codice** (già corretto dal 10/7), non dal vivo in questa sessione.
