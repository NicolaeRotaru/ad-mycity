---
data: 2026-11-17 23:10
tipo: passaggio di regia
da: chat «Ondata 9» (session_015BmpnYq3DQDRwTXdBwfzud), a 577 mila token
a: «Ondata 9 · 2.0»
---

# Onda 9: il passaggio alla regia 2.0

## In parole semplici
La regia dell'onda 9 passa a una sessione nuova, perché la chat di partenza ha troppa storia e ogni risveglio costa quattro volte. La chat «Ondata 9» resta quella dove Nicola parla: la 2.0 le scrive solo il conto finale, che lei gli gira. Un esempio: quando R03, oggi a circa 22 $, arriva a 30 $, è la 2.0 a dirgli «consegna» e poi a salvare il suo referto.

## Cosa cambia per te
Niente: i riparatori sanno già a chi scrivere.

## Cosa devi fare
Niente.

## Cosa non ho verificato
Che la 2.0 erediti la guardia delle aperture: se `create_session` le chiede conferma, è la PR ad-mycity#985 che manca nella sua copia.

---

## Dettagli tecnici

### Le regole di stanotte
- Nicola dorme fino al 18/11 mattina. **Nessuna azione che chiede conferma**: niente strumenti `mcp__github__` che scrivono, niente `delete_trigger`. I push con git da Bash, sul ramo `claude/adoring-bohr-kixq35` di ad-mycity. Un promemoria si spegne con `update_trigger enabled=false`.
- Decisione di Nicola delle 22:35 (in DECISIONI e in bacheca): limite all'89%, tenere libero circa il 3%. **Tetto di stanotte: circa 240 $ in tutto**, regie comprese. Consegna a 30 $ per riparatore, tetto 35 $. Se la somma supera i 210 $, o il limite è «rejected», o c'è uso extra: «consegna» a tutti, subito.

### I riparatori (sito, base `f93d246a`, rami `claude/adoring-bohr-kixq35-o9-mNN`)
| | sessione | 23:06 |
|---|---|---|
| R01 | session_015BmpnXsG8PNg7ifyDEH21e | 14,00 $, al lavoro |
| R02 | session_015BmpnUuqaZeyg8n3BBxy6h | 14,80 $, verify verde, aspetta i revisori |
| R03 | session_015BmpnYY5FRfV2QHnGfxmLq | 21,71 $, lotto 3 |
| R06 | session_015BmpnXuKeg9UZV4VTeijA9 | **finito**, 13,16 $, referto in `referti/R06.json`, verde |
| R07 | session_015BmpnY5Tr9sb9jVsUfgDzU | 12,27 $, lotto 2 |
| R10 | session_015BmpnVgNypE5YPDP33krPo | 13,04 $, lotto B |
Regia «Ondata 9» fino alle 23:10: 14,70 $. Totale alle 23:06: circa 104 $.

### Quando un riparatore consegna
1. `git -C ../mycity fetch -q origin <ramo> && git -C ../mycity show FETCH_HEAD:.riparazione/referto-RNN.json > onda9/referti/RNN.json` (il clone del sito: `git clone --filter=blob:none https://github.com/NicolaeRotaru/mycity ../mycity`).
2. `node cervello/riparazione-sessioni.mjs valida-referto onda9/referti/RNN.json --cartella consegne/riparazioni/2026-11-12-sito-tutto/onda9 --git ../mycity --ramo FETCH_HEAD` deve essere verde.
3. In `onda9/sessioni.json`: `finita`, `punta`, `testa`, `costo_usd` (da `get_session`). Una riga nel quaderno `REGIA-ONDA-9.md`, sezione «Stato». Commit e push.
4. Nessuno si archivia: giovedì riprendono le voci rimaste.

### Quando hanno consegnato tutti e sei
Manda con `send_message` a session_015BmpnYq3DQDRwTXdBwfzud il conto per Nicola, nei quattro blocchi e corto: voci per esito, spesa, le scelte che spettano a lui (con la domanda in una riga), cosa non hai verificato. Poi chiudi il turno.

### Le scelte per Nicola già arrivate
R02-011 (come si conta la scadenza del recesso con sabato e festivi) · R06-001 (testo a 11px: 10, 12 o una misura nuova da 11?) · R10-010 (quante consegne veloci si vendono insieme per fattorino) · R07: il registro degli errori spento (scelta, non riparato).

### Domattina, con Nicola sveglio
- La descrizione di ad-mycity#985 è indietro (dice 2 riparatori invece di 6, e chiede di unire prima la #984, già unita): `update_pull_request` chiede conferma, quindi si fa quando Nicola c'è.
- Nicola unisce la #985 prima di giovedì alle 10:05.

### Giovedì 19/11 alle 10:05
Il promemoria è sulla 2.0. Il testo è in «Il giro di giovedì» di `REGIA-ONDA-9.md` più la sezione «Stato». In breve: limite «allowed», ai 6 «riprendi», consegna a 40 $ e tetto 45 $. R04, R05, R08 e R09 si aprono solo dopo averli rifiltrati sul testo delle voci. Poi il collaudo del gruppo A, 4 collaudatori, il controllore, la PR del sito. Il prompt dei riparatori è quello di R03 del 17/11: si legge con `list_events` sulla sessione di R03, primo evento `user`.

### Da sapere
- Il verify del sito vuole `NODE_OPTIONS=--max-old-space-size=6144` (R06).
- `DA-SAPERE-DALLE-ONDE-7-8.md` per i rossi che tornano (eccezione sulle prove comuni, referti in `referti/RNN.json`).
