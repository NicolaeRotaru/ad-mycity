---
data: 2026-11-21 03:02
tipo: passaggio di regia
da: «Ondata 9 · 8.0» (session_015BmpnX37gUC8Poxk3muVMa), a 253 mila token (regola 3 del 21/11)
a: «Ondata 9 · 9.0»
---

# Onda 9, giro 4: il passaggio alla regia 9.0

## In parole semplici
Il giro 4 è in corso da 02:33: quattro riparatori, 89 difetti minori, tutti ancora sul primo o secondo lotto.
La 8.0 passa la mano perché ha superato i 250 mila token. Alla 9.0 restano sorveglianza, collaudi, unione, controllore e PR.
Nicola ha chiesto un traguardo nuovo, «tutti i difetti risolti in 1-2 settimane»: la risposta con le condizioni l'ha avuta dalla 8.0 alle 03:02, aspetta le sue scelte.

## Cosa cambia per te
Niente: Nicola scrive alla 9.0 come scriveva alla 8.0.

## Cosa devi fare
1. Dire ai quattro riparatori il tuo id (le risposte arrivano alla 8.0 finché non lo sanno).
2. La catena di sorveglianza della 8.0 (`trig_01YX157iitNbqVSBra94Hdpj`, 03:04) la cancella la 8.0: la 9.0 ne apre una sua a 30 minuti.
3. Sorvegliare R01-R04 (tetto 35 $), a «finita» i collaudi; dopo l'onda 1 la riservata (dettagli in chat dalla 8.0).
4. Unione, verify, harness SQL, controllore, PR in bozza: come il giro 3 (skill `riparazione`, F3, sul ramo `claude/stoic-ramanujan-p9tmso`).

## Cosa non ho verificato
- Il codice dei riparatori: solo la guardia, nessun referto ancora finito.
- Il conto dei difetti aperti: `radiografia-marketplace.json` filtrato a mano dice 824 (729 minori, 90 gravi, 5 bloccanti), la skill dice 751 (669/77/5). Va rifatto con `conti` o con lo strumento giusto prima di dare numeri a Nicola.

---

## Dettagli tecnici

### Stato alle 03:00
- Spese alle 02:50: R01 9,81 · R02 12,62 · R03 10,85 · R04 9,20 $. Ritmo sopra il tetto: soglia d'allarme R02 a 20 $.
- R02: lotto 1 spinto (`0a157ea3`, 6 riparati, 1 parziale). Lotti 2 e 3 sul modello piccolo con l'ok della 8.0 (una voce su soldi, dati o permessi torna al grande).
- R03: lotto 1 spinto (soldi e cassa).
- R01, R04: niente spinto alle 03:00. R04 ha ultracode acceso (confermato), R03 pure.
- Guardia rossa per prove comuni ritoccate, NON annullate apposta (non indeboliscono, il motivo è nei referti): R02 `c7525734` (confine dei contanti spostato di 1 € per la consegna veloce, R02-006); R03 `82d3d4c4` e `155d11a4` (finto database allineato alla tabella vera, R03-013 e R03-008). Al collaudo il giudizio «non indebolite», all'unione la firma di Nicola (come le 17 del giro 2). Tutti avvisati: nessuna altra prova comune senza chiedere.

### Decisioni di Nicola aperte (chat della 8.0, 21/11 02:55-03:02)
- Proposta dell'AD sul traguardo (`ad.uso-e-crediti`, anche `lancio.criterio`): contare solo gravi e bloccanti. Spiegata, nessuna risposta.
- «Riparare per causa» (raggruppamento dei minori prima del prossimo giro), modello piccolo sui minori, firme date prima (prove comuni che non tolgono asserzioni, id nei commit). Proposte, nessuna risposta.
- Nicola 03:01: «devono essere risolti in 1/2 settimane». Risposta della 8.0: possibile solo con tre condizioni sue — tetto di spesa, i minori nati durante le riparazioni in una lista «dopo» che non sposta il traguardo, firme date prima. Nota: i minori aperti stanno su circa 417 file diversi, molti in zone delicate (pagamenti 68, privacy 76, sicurezza e database 67): il raggruppamento per causa rende meno di quanto stimato prima.

### Spese della regia 8.0
4,27 $ alle 03:00. Lineage: la 8.0 è a profondità 7 su 8; la 9.0 è a 8, l'ultima: non può aprire una 10.0 figlia. Al suo passaggio serve che la regia successiva la apra Nicola o l'AD.
