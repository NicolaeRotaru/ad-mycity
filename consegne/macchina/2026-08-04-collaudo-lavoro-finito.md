---
titolo: Da oggi nessun lavoro esce senza essere ricontrollato da cima a fondo
data: 2026-08-04 04:05
per: Nicola
stato: fatto, aspetta la tua firma sulla PR
---

# Da oggi nessun lavoro esce senza essere ricontrollato da cima a fondo

> **In due righe.** Stanotte mi hai chiesto: «ricontrolla da sola il lavoro fatto, più e più volte,
> così non devo dirtelo io». Fatto: adesso è un cancello automatico che mi ferma, non una buona intenzione.

## In parole semplici

Facciamo un passo indietro. Quando finisco un lavoro e tu mi scrivi «ricontrolla», trovo quasi
sempre qualcosa: un pezzo che mancava, un problema che non avevo visto. Avevi ragione a dire che
è un difetto mio, e la causa è precisa.

I controlli che avevo guardavano il lavoro **mentre lo facevo**, una modifica alla volta. Ma il
pezzo che manca non compare in nessuna modifica: proprio perché non l'ho mai scritto, nessun
controllo sul «cambiamento» lo può vedere. Lo vede solo una rilettura completa del lavoro finito,
confrontata con quello che avevi chiesto. In parole povere: rileggere tutto alla fine. Quella
rilettura finora la facevi partire tu, scrivendo «ricontrolla».

Da stanotte la fa partire una macchina. Nel momento esatto in cui sto per dirti «fatto», un
cancello mi blocca e non mi lascia chiudere. Per passare devo: rileggere la tua richiesta punto
per punto e dichiarare per ognuno «fatto», «mancante» o «non fatto apposta, ecco perché»;
rileggere tutto il lavoro file per file, dal confronto vero, non a memoria; eseguire le prove e
guardare i risultati. Se trovo e correggo qualcosa, al prossimo «fatto» il cancello mi riferma e
si ricontrolla di nuovo, da capo. Il giro si ripete finché una rilettura esce a mani vuote: è il
«più e più volte» che hai chiesto. Per esempio, stanotte l'ho provato dal vivo su questo stesso
lavoro: alla prima chiusura il cancello mi ha fermata e mi ha messo davanti i 4 file da rileggere.

Un solo caso resta fuori, e te lo dico: il cancello non sa se il lavoro è **giusto nel merito**.
Quello lo dicono le prove quando falliscono, e alla fine lo dici tu. Il cancello garantisce che la
rilettura completa avvenga sempre, non che io sia infallibile dopo averla fatta.

## Cosa cambia per te

Non devi più scrivere «ricontrolla» tante volte di fila: il ricontrollo parte da solo a ogni
lavoro. Vale in ogni sessione, compresi i lavori che la macchina fa da sola sul VPS (il computer
sempre acceso dove gira il worker). Ripeto il punto con altre parole: il tempo e l'energia che
spendevi a farmi da controllore adesso li spende un cancello, prima che il lavoro arrivi a te.

## Cosa devi fare

Firmare la PR di questo lavoro quando arriva, come sempre. Nient'altro: non c'è nessuna chiave da
collegare e nessun costo nuovo.

## Cosa non ho verificato

Il cancello l'ho provato dal vivo stanotte in questa sessione, con il ciclo completo: fermata,
ricontrollo, conferma, silenzio, ripartenza dopo una modifica. Non ho ancora potuto vederlo girare
sul VPS: lì lo vedremo al primo lavoro vero del worker. E il limite dichiarato sopra resta: la
rilettura la fa comunque la mia testa — il cancello obbliga a farla, non la fa al posto mio.

### Dettagli tecnici

- Scheda: AR-532 (chiusa, verifica eseguibile) · lezione L-2026-0804-552 con gate attivo.
- Guardia nuova: `cervello/collaudo.mjs` (impronta del lavoro + registro fuori da git in
  `cervello/_tmp_collaudo.json`), agganciata a `cervello/cancello-stop.mjs` (solo `--hook`: in CI
  non c'è nessun modello a cui chiedere il ricontrollo).
- Il sorvegliante ora accetta un perimetro: `verdettoDelDelta({ da })` gira sull'intero lavoro del
  turno, non solo sull'ultima modifica, e il suo verdetto entra nelle istruzioni di collaudo.
- Taratura pagata sul campo: senza l'ancora del turno il perimetro si fissa su HEAD — la prima
  esecuzione presentava 211 file di sessioni passate come lavoro da ricollaudare (forma di AR-507).
- Prove: `node --test cervello/test/collaudo.test.mjs` (17) · 191 verdi sui file toccati ·
  2 mutazioni in `cervello/mutanti.json` verificate rosse con `node cervello/non-vacuita.mjs --difetti AR-532`.
