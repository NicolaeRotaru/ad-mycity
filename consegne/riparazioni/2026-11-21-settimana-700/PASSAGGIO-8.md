---
data: 2026-11-23 02:20
tipo: passaggio di regia
da: «Settimana dei 700 · regia settima», session_015BmpnXrV1Q7uJoKhhGbeQG (692 mila token, 38,02 $)
a: la regia ottava della settimana dei 700 (la apre Nicola: la catena è a profondità 7 su 8)
---

# Settimana dei 700: il passaggio alla regia ottava

## In parole semplici
Questo foglio serve alla regia che apre il giro dopo: quello delle riparazioni delicate.
Il giro di correzione è chiuso e sta sul sito: Nicola ha unito mycity#302 e mycity#303, e le 17 chiusure sono nel registro.
Anche il database vero è in pari: le sette migrazioni del giro sono state applicate il 23/11 alle 02:20.
Un esempio: il promemoria del carrello abbandonato ora parte una volta sola, anche con due giri insieme.

## Cosa cambia per te
Per Nicola: aprire la regia ottava con la riga in fondo.
Per la regia ottava: niente da chiudere dal giro prima. Si parte dal giro dei delicati, col preventivo a Nicola.

## Cosa devi fare
La regia ottava segue i passi in fondo, sotto «I passi della regia ottava».

## Cosa non ho verificato
- Le sette migrazioni le ho controllate sul database, oggetto per oggetto, ma non le ho provate dal sito: per esempio un fattorino che tocca un ordine già preso da un altro.
- La spesa finale di «K05 secondo» e «K06 secondo»: archiviati prima che il contatore si aggiornasse, stimati 8 $ in due.

---

## Dettagli tecnici

### I passi della regia ottava
1. Leggi la skill `riparazione` e questo foglio. Non rileggere i PASSAGGI vecchi. Dettagli riservati: chiedili in chat alla regia settima, se è ancora viva; se no a Nicola. Mai nel deposito.
2. ~~Chiusure dopo l'unione di mycity#302~~: fatte il 23/11 alle 01:40 dalla regia settima (17 chiusure, commit d747c3ce, solo i frammenti dell'onda 2). `misure.json` chiusa. Non rilanciare `chiudi-sito` su tutta la cartella: riscriverebbe il commit dell'onda 1.
3. ~~Migrazioni~~: 640, 660, 661, 662, 701, 702 e 810 sul database vero dal 23/11 alle 02:20, firma di Nicola. Le riparazioni riservate di mycity#303 sono S02-03 e S02-07 (i dettagli in chat).
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
La migrazione 703 dell'iscrizione flessibile (non di questo giro: mycity#304 e #305), che aspetta il suo ok; cancellare i rami `claude/settimana-700-regia-cf`, `-s01`, `-s01b`, `-s01c`, `-s01d` (ad-mycity) e `-m10` (mycity); scelta sul servizio delle mappe (S02-04); «404 vera o segnale d'attesa» (R17-002/003); precarico delle categorie su /admin e /seller (R17-010); messa online automatica (R18-004); classifica degli inviti (R14-002); variabile di Google Analytics su Vercel (R15-015).
