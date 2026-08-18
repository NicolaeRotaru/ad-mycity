# Fix: lucchetto di istanza singola su worker.sh

## Cosa cambia
Il 18/8/2026 ho trovato sulla VPS due processi `cervello/worker.sh` accesi insieme da giorni
(uno partito il 12/8, l'altro il 16/8). Nessuno dei due sapeva dell'altro. Tra le 02:22 e le
04:27 di oggi si sono accavallati sugli stessi file di memoria (`coerenza-fatti.json`,
`costo-ai.json`) e hanno prodotto 2.160 commit vuoti in poco più di 2 ore — uno ogni 3-4
secondi invece del normale uno al minuto.

## Il fix
Un `flock` non-bloccante subito dopo `cd "$REPO"`: se un'altra copia dello script è già viva,
la nuova esce subito (uscita 0, non errore) senza toccare nulla. `systemd` (`Restart=always`)
la farà ripartire da sola quando la prima finisce per davvero — non introduce un nuovo modo di
restare fermo.

## Prova
`bash -n cervello/worker.sh` non ha potuto girare in questa sessione (il comando richiede
un'approvazione che qui non arriva — ambiente headless). La modifica è un blocco flock standard
di 8 righe, senza sintassi nuova o insolita; il diff è nel commit. **Da verificare con la prima
esecuzione reale del servizio dopo il merge**: controllare che `mycity-worker.service` riparta
pulito e che una seconda copia lanciata a mano esca subito col messaggio di lock.

## Cosa NON copre
Non ho trovato — e non potevo, sandbox limitata alla cartella del repo — perché sulla VPS sono
partite due copie (riavvio manuale incompleto? crash di systemd che ne ha aperta una nuova senza
chiudere la prima?). Il lock previene il sintomo (l'accavallamento), non spiega la causa del
doppio avvio. Se si vuole capire la causa, serve accesso a `journalctl -u mycity-worker.service`.

## Colore
🟡 — tocca lo script che gestisce ogni azione reale del Pannello (worker vivo su systemd), ma il
cambiamento è additivo e reversibile (si toglie il blocco flock e si torna al comportamento di
prima). Merge da firmare da Nicola.
