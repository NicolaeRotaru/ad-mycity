---
data: 2026-11-22 21:40
tipo: passaggio di regia
da: «Settimana dei 700 · regia settima», session_015BmpnXrV1Q7uJoKhhGbeQG (692 mila token, 38,02 $)
a: la regia ottava della settimana dei 700 (la apre Nicola: la catena è a profondità 7 su 8)
---

# Settimana dei 700: il passaggio alla regia ottava

## In parole semplici
Questo foglio serve alla regia che chiude il giro di correzione dopo l'unione e apre il giro dopo.
Il giro di correzione è finito: 17 riparazioni reggono, e la richiesta di unione mycity#302 è pronta.
Un esempio: il promemoria del carrello abbandonato ora parte una volta sola, anche con due giri insieme.

## Cosa cambia per te
Per Nicola: unire mycity#302 e mycity#303, poi aprire la regia ottava con la riga in fondo.
Per la regia ottava: scrivere le chiusure dopo l'unione, poi preparare il giro dei delicati.

## Cosa devi fare
La regia ottava segue i passi in fondo, sotto «I passi della regia ottava».

## Cosa non ho verificato
- Le prove automatiche di GitHub sull'ultima testa di mycity#302 (8cbcccad): alle 21:40 giravano ancora.
- La spesa finale di «K05 secondo» e «K06 secondo»: archiviati prima che il contatore si aggiornasse, stimati 8 $ in due.

---

## Dettagli tecnici

### I passi della regia ottava
1. Leggi la skill `riparazione` e questo foglio. Non rileggere i PASSAGGI vecchi. Dettagli riservati: chiedili in chat alla regia settima, se è ancora viva; se no a Nicola. Mai nel deposito.
2. Dopo l'unione di mycity#302: `node cervello/chiudi-sito.mjs consegne/riparazioni/2026-11-21-settimana-700/normali/frammenti --applica --pr 302 --commit <sha dell'unione>`, poi `conti --cartella …/normali`. Aggiorna la riga «in corso» di `cervello/riparazione/misure.json` con le chiusure vere.
3. Dopo l'unione di mycity#303: le due riparazioni riservate sono S02-03 e S02-07 (i dettagli in chat). La migrazione 810 la applica Nicola.
4. Il giro dopo: i delicati (cartella `delicati/`, più le 13 voci tolte in questo giro: R14-001/006/007/010, R15-004/005/006/012, R17-001, R18-007/008/009/010), con ultracode e preventivo a Nicola (sopra 12 $ a chiusa decide lui). Poi le 58 voci rimaste aperte del giro e le 11 dell'onda dopo.
5. Un giro riservato: 3 voci ritirate (S02-02, S02-05, S02-06), 4 difetti nuovi trovati da KS02, la S02-04 dopo la scelta di Nicola, la S02-08.
6. Passa la mano a 250 mila token.

### La riga per aprire la regia ottava (la usa Nicola)
Sessione nuova su `NicolaeRotaru/ad-mycity`, ramo `claude/settimana-700-regia`, modalità Auto, prompt:
«Sei la regia ottava della settimana dei 700. Leggi .claude/skills/riparazione/SKILL.md e consegne/riparazioni/2026-11-21-settimana-700/PASSAGGIO-8.md, poi continua da lì.»

### Lezioni di questo giro (da portare nella skill)
- SHA sempre interi in `source_revision`: «3de8737» ha dato `ref_not_found` e C02 è rimasto fermo 52 minuti.
- Controllo a 10 minuti anche per collaudatori e controllori: «C02 secondo» si è fermato su un permesso `add_repo`; il sito si legge col git normale.
- Le firme di Nicola sulle prove comuni conviene chiederle prima del via: arrivate a metà, hanno chiesto tre giri di rimessa e due ricollaudi.
- La regola «prova spenta» (skipIf) non si deroga: R17-008 è tornata ricetta.

### Ancora aperto per Nicola
Migrazioni 640, 660, 661, 662, 701, 702, 810 sul database vero (fermo alla 620); cancellare i rami `claude/settimana-700-regia-cf`, `-s01`, `-s01b`, `-s01c`, `-s01d` (ad-mycity) e `-m10` (mycity); scelta sul servizio delle mappe (S02-04); «404 vera o segnale d'attesa» (R17-002/003); precarico delle categorie su /admin e /seller (R17-010); messa online automatica (R18-004); classifica degli inviti (R14-002); variabile di Google Analytics su Vercel (R15-015).
