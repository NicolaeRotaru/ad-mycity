---
data: 2026-11-21 03:12
tipo: passaggio di regia
da: «Ondata 9 · 9.0» (session_015BmpnVsaBSAMXVLwgUxhRH), a 231 mila token (regola 3 del 21/11)
a: «Ondata 9 · 10.0», aperta da Nicola o dall'AD (la 9.0 è a profondità 8 su 8)
---

# Onda 9, giro 4: il passaggio alla regia 10.0

## In parole semplici
Il giro 4 continua: quattro riparatori, 89 difetti minori. La 9.0 passa la mano presto perché le istruzioni iniziali pesano già circa 200 mila token.
Se la 10.0 la apre una sessione a profondità 8, anche lei non potrà aprire sessioni: meglio che la apra Nicola dal Pannello o da claude.ai (profondità 0).

## Cosa cambia per te
Niente: Nicola scrive alla 10.0 come alla 9.0.

## Cosa devi fare
1. Mettere il tuo id in `giro4/sessioni.json` («regista», la 9.0 in «regista_prima») e scriverlo ai quattro riparatori e alla 9.0.
2. Ricevere dalla 9.0, in chat, i dettagli della riservata (mai nel deposito).
3. Sorvegliare R01-R04 ogni 30 minuti (`bash cervello/riparazione/sorveglia.sh consegne/riparazioni/2026-11-12-sito-tutto/onda9/giro4 1`), tetto 35 $ ciascuno.
4. A «finita» con guardia e referto verdi: collaudatori (F2), poi unione, verify, harness SQL, controllore, PR in bozza (F3 della skill `riparazione` sul ramo `claude/stoic-ramanujan-p9tmso`).

## Cosa non ho verificato
- Il codice dei riparatori: nessun referto finito.
- Il conto dei difetti aperti nel registro (824 a mano contro 751 della skill): da rifare con `conti` prima di dare numeri.

---

## Dettagli tecnici

### Stato alle 03:12
- R01 13,81 $ (02:03): lotto 1 in corso, nulla spinto.
- R02 17,84 $: tre lotti spinti (`1b418f27`): 8 riparati, 5 parziali, 3 già riparati, 3 serve_file_altrui, 3 non_fatto. Revisori in corso, stima finale 24-27 $. Fa anche R02-004 e R02-005 con le firme di Nicola (`giro4/piano.json`, eccezioni_firmate).
- R03 16,64 $ (02:03): lotti 1-2 spinti; due prove comuni ritoccate (R03-008, R03-013, finto database allineato): firma a Nicola all'unione.
- R04 15,82 $: lotto A spinto (`fd1400c9`): riparati R04-005, 008, 018, 020; parziali R04-007 (serve la rotta dei contanti, non sua) e R04-021; R04-006 già riparato (detto a R04 che la 620 è già in produzione). Ha unito il remoto con strategia ours dopo un amend: verificare con guardia-ramo che il diff netto non tocchi prove comuni. Lotto B in corso.
- R02 c7525734: prova comune ritoccata (confine dei contanti), firma a Nicola all'unione.

### Domande aperte a Nicola (21/11 03:13)
- R04-020: accorciare la finestra di 3 ore per contare una consegna veloce in corso?
- R04-021: le casse con la carta aperte e non pagate occupano il fattorino?
- R04-016: R04 manderà il diff di una prova comune (scarica-i-miei-dati-non-salta-nessuna-tabella.test.ts:44); la firma è di Nicola.

### Decisioni di Nicola già prese
- 03:03 (alla 8.0): dal giro 5 riparare per causa, modello piccolo sui minori non delicati, firme date prima; «stessa efficienza» misurata a ogni giro. Aperti: tetto per le 1-2 settimane, lista «dopo» per i minori nati.
- 03:08 (alla 9.0): «A» = collaudatori, controllore e riservata li apre Nicola o l'AD quando la regia lo chiede; firme su R02-004 e R02-005.

### La catena di sorveglianza
La 9.0 non poteva usare `send_later` (profondità 8): usava un timer in background. La 10.0, se aperta più in alto, torna a `send_later` a 30 minuti.

### Spese della regia 9.0
3,09 $ alle 03:12.
