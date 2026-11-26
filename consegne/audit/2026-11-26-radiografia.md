---
data: 2026-11-26 15:20
tipo: radiografia-marketplace (ricontrollo)
codice: NicolaeRotaru/mycity @ ed12ed8 (main del 25/11)
cartella: consegne/radiografia/2026-11-26-ricontrollo
richiesta: Nicola, 26/11 13:38, «Parti con la nuova strategia di radiografia», senza richieste di consenso
---

# Il ricontrollo del 26/11 chiude 45 difetti del sito, e fra quelli aperti ne trova 9 che sono falle

**In due righe.** Quattro sessioni hanno riletto sul codice 272 difetti aperti del registro: 45 su 272 non ci sono più. Nessun difetto nuovo, e il costo è stato 64,73 $ contro i 77,04 $ del preventivo.

## In parole semplici

Il ricontrollo è il primo passo della radiografia nuova. Prima di cercare difetti nuovi, guarda se quelli già scritti nel registro sono ancora veri. Oggi era l'unico passo possibile, perché a novembre abbiamo chiuso 29 difetti su 161 aperti, e con quel conto le ricerche nuove sono ferme.

Un programma ha guardato per primo i 522 difetti aperti con un file preciso. Ne ha tenuti aperti 250, perché i loro file non sono cambiati dall'ultima volta. Gli altri 272 li hanno riletti quattro sessioni.

Il risultato, voce per voce:
- **45 chiusi su 272**, cioè 5 gravi su 29 e 40 minori su 243. Ogni chiusura grave l'ha confermata un secondo agente che non l'aveva trovata.
- **164 su 272 ancora veri.**
- **46 cambiati**, cioè ancora lì ma in un'altra forma.
- **17 su 272 non verificabili** da qui, perché serve il sito vero o un browser.

Un esempio di chiusura: l'avviso per un ordine non accettato ora parte dopo 5 minuti, non dopo un'ora. Un esempio di difetto cambiato: il reso del pane si blocca, ma solo se il negozio ha segnato il prodotto come non restituibile.

Detto in altro modo: il registro adesso è aggiornato su 272 voci in più, e la lista degli aperti si accorcia di 45 su 598.

## Cosa cambia per te

Le voci aperte del sito passano da 598 a 553: i gravi da 67 a 62, i minori da 526 a 486, i bloccanti restano 5. Il costo misurato è di circa 1,44 $ per ogni difetto chiuso, contro circa 1,1 $ del ricontrollo del 21/11.

Fra i difetti rimasti aperti, 9 sono falle di sicurezza. Vuol dire che qualcuno potrebbe vedere, cambiare o pagare quello che non dovrebbe. I dettagli stanno solo nelle chat delle sessioni, non nei file pubblici.

## Cosa devi fare

Niente, per far andare avanti il lavoro. Quando vuoi:
- guardi e unisci la richiesta di unione;
- mi dici se vuoi nascondere nel registro i titoli delle 9 falle. Io ho scelto di non farlo, per due motivi. Sono pubblici da settimane e nasconderli non li cancella dalla storia. E la sessione che ripara il sito non li vedrebbe più. Chiuderle costa meno che nasconderle.

## Cosa non ho verificato

- Nessuna sessione aveva lo sforzo massimo (ultracode): il modo scritto nella guida oggi non lo accende più.
- I 40 minori chiusi vengono quasi tutti dalla lettura del codice, senza un secondo agente: per i minori le regole lo permettono.
- I 17 difetti non verificabili comprendono 1 bloccante e 3 gravi. Dipendono dal sito vero, che da qui non si tocca.
- I 250 difetti tenuti aperti dal programma non li ha riletti nessuno.
- Dai referti ho tolto 13 righe che indicavano i file delle falle, ma restano nella storia del ramo pubblico. Sono nomi di file già presenti nel registro pubblico, non spiegazioni.

---

## Dettagli tecnici

- Sessioni: S01 (29 gravi, 10 subagenti, 10,49 $), S01b (120 minori, 8, 13,44 $), S01c (120 minori, 9, 15,58 $), S01d (3 minori, 1, 2,01 $). Controllore finale 4,86 $, più 7,60 $ dei tre turni di riservatezza fatti dalle sessioni. Regia nella sessione dell'AD: 10,75 $.
- Riga delle misure in `cervello/radiografia/misure.json`; `misura.json` e `controllo-finale.json` nella cartella.
- Comandi verdi: `prepara`, `preventivo`, `schede`, `copertura-prima`, `segnaposti`, `valida-referto` (4), `doppioni`, `grezzo`, `conti`, `copertura-dopo`, `misura --scrivi`, `applica --scrivi`.
- Il grezzo ha 0 difetti, quindi il digest non è stato lanciato: il registro l'ha aggiornato `applica`.
- Falle fra le aperte: S01 4, S01b 3, S01c 2, elencate in `da-riservare.txt`. Il controllore finale propone di riservarne altre 6 (`controllo-finale.json`, campo `da_riservare`).
- Il controllo «suite del cervello — fetta 3» è rosso anche su main (`cervello/test/due-case.test.mjs`): non viene da questa richiesta.
- `create_session` rifiuta un prompt che comincia con «/», e `/effort` mandato con `send_message` arriva come testo: il passo F1 della skill `radiografia-sessioni` va riscritto.
