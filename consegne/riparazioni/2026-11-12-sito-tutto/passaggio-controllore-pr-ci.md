---
tipo: passaggio
data: 2026-11-13 17:10
da: Controllore · PR e CI · onda 2 (session_015BmpnWroKtzTLyTmXZVE2k)
a: Controllore · PR e CI · onda 2 · 2.0
---

# Il passaggio del controllore PR e CI dell'onda 2

Questo foglio serve alla sessione che prende il posto del controllore. Il controllore segue le richieste di unione
della campagna e ripara la CI rossa e i conflitti.

## In parole semplici
La #952 di ad-mycity è unita: Nicola l'ha unita il 13/11 alle 14:28, con la CI verde su tutti e 14 i controlli.
Adesso non c'è nessuna richiesta aperta da seguire. Ne arriveranno due, e il numero lo manda la regista:
- la prossima richiesta di ad-mycity, dallo stesso ramo `claude/magical-hamilton-xouwr8`;
- la richiesta dell'onda 2 sul sito, quando i 12 rami dei riparatori sono uniti.

## Cosa cambia per te
La regista adesso è la 4.0 (`session_015BmpnZaZMi8cGzkuE9PJE7`). Gli avvisi vanno a lei, e all'AD
(`session_015BmpnYWmNDPKAztZMPww6M`) solo per un clic di Nicola, un rosso che non sai riparare o la quota.

Un esempio vero di oggi. Alle 14:17 in main è entrata la #947, mentre Nicola stava per unire la #952. La #952 è tornata in
conflitto su tre file di memoria: lo storico del sorvegliante, la bacheca e la coda delle azioni. Il controllore ha unito
main nel ramo tenendo le righe di tutti e due i lati, e la CI è tornata verde in 6 minuti.

## Cosa devi fare
- **Un conflitto.** Unisci main nel ramo, mai un rebase del ramo condiviso. Tieni le righe dei due lati, nell'ordine di
  tempo che il file usa già. Nello storico tieni tutte le voci dei due lati in ordine di `quando`, poi le ultime 200
  delle oltre 200 che risultano: è la stessa regola di `aggiungiAlloStorico`. Nella coda delle azioni un numero di carta
  non deve mai comparire due volte.
- **Nicola vuole unire.** Ogni spinta sul ramo cancella la corsa della CI in corso. Chiedi alla regista di non spingere
  finché la corsa non è verde.
- **Lo scatto del sorvegliante.** La copia locale riscrive lo storico a ogni giro. Salvalo da solo, in un commit
  «Lo storico del sorvegliante col suo ultimo scatto», come fanno le registe. Se il rebase si ferma sullo storico,
  unisci le voci con la regola del primo punto.
- **Le prove.** `conflitti-memoria-che-nessuno-risolve` e `rebase-che-non-parte` diventano rosse se girano insieme ad
  altre prove, perché lavorano tutte e due su git. Falle girare con `--test-concurrency=1`: così sono verdi.
- **Il costo.** Leggilo in `get_session`, alla voce `usage.cost_usd`. Non stimarlo: la 1.0 diceva 7-9 $ quando era 18 $.

## Cosa non ho verificato
- La CI sugli ultimi commit di memoria del ramo: gira solo quando sul ramo c'è una richiesta aperta.
- Lo strumento `Workflow` non ha una guardia. Decide Nicola se aggiungerla, perché è una modifica alla macchina.

---

## Dettagli tecnici
- Unione della #952: `1905bee` in main. Ramo allineato con `d0e06e9`. Ultima testa della 1.0: `d376c5d`.
- Il sito si legge con `git clone --filter=blob:none https://github.com/NicolaeRotaru/mycity`, attraverso il proxy della
  sessione. Per spingere sul sito serve `add_repo` con accesso push: è un clic di Nicola (regola 4).
- Esenzioni degli strumenti: `cervello/mappa-copertura.mjs`, `ESENZIONI`. Freni: `.claude/settings.json`.
- Conto della 1.0: 23,86 $ su un tetto di 30 $. Storia: 420 mila token su un milione.
