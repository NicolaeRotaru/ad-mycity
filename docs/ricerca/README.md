# Le due ricerche che stanno sotto al business

Qui dentro ci sono i **due studi completi** di agosto 2026 su cui poggia tutto
`CONTESTO_BUSINESS.md`. Quel file è il riassunto che si legge prima di decidere; questi due
sono il materiale grezzo — dati, casi, numeri con i loro limiti — che si apre quando il
riassunto non basta o quando qualcuno chiede «da dove salta fuori questo numero?».

| File | Di cosa parla | Quando serve aprirlo |
|---|---|---|
| `teoria-del-cambiamento.pdf` | **Lato cittadino.** Perché una persona che compra su Amazon dovrebbe comprare in bottega: i meccanismi (denaro vincolato, attrito zero, premio variabile, identità locale), i casi che hanno funzionato (Miconex, TreCuori, Too Good To Go, Pinduoduo, Sardex/WIR), quelli falliti (Cashback di Stato, Bristol Pound), i paletti legali sui portafogli e come si misura se la spesa si è spostata davvero. | Quando si progetta qualcosa che deve cambiare l'abitudine di un cliente: wallet, rituale WhatsApp, cashback, anti-spreco, misura dell'incrementalità. |
| `bottegaio-cliente-pagante.pdf` | **Lato negoziante.** Chi è davvero il bottegaio che paga: età, conti, giornata, di cosa si fida e di cosa no, quanto è disposto a spendere, perché disdice (churn), cosa gli hanno già venduto male, e in che ordine vanno aggrediti i segmenti. | Quando si decide un prezzo, un pitch, un onboarding, un report al negozio, o si prova a capire perché un negozio sta mollando. |

## Regole d'uso

- **Sono la fonte estesa, non la fonte viva.** I numeri che cambiano — prezzi, date, soglie,
  target — vivono in `MyCity-Vault/90-Memoria-AI/registro-fatti.json`. Se un PDF e il registro
  dicono cose diverse, vince il registro: il PDF è una fotografia di agosto 2026.
- **Non tutti i numeri qui dentro sono certezze.** Una parte è dichiarata dai fornitori stessi
  (Miconex, TreCuori, le statistiche su WhatsApp) o stimata da campioni che non coprono le
  micro-imprese (ISTAT parte da 10 addetti). Vanno usati come ordini di grandezza. Quando un
  numero di questi finisce in un documento per Nicola, si cita **da dove viene e quanto è solido**
  — è la regola «nessun numero senza fonte» del `CLAUDE.md`.
- **Sono arrivati così.** I due file sono stati archiviati l'11/8/2026 esattamente come Nicola li
  ha consegnati: rinominati per leggibilità, contenuto non toccato.
- **Sono stati letti, non solo archiviati.** L'11/8/2026 li ho letti per intero e confrontati col
  riassunto. Il verdetto sta in `consegne/strategia/2026-08-11-verifica-sintesi-contro-ricerche.md`.
  Là dentro c'è anche la lista delle soglie operative che vivono solo qui dentro, e che nel riassunto
  non erano arrivate.

## Come si legge il testo, che non è ovvio

Questi due PDF usano font con una codifica propria. Un estrattore semplice restituisce solo simboli
e frammenti come `fi`, `fl`, `AdobeUCS`. Sembrano file vuoti o rotti, e non lo sono. Serve una
libreria che sappia seguire la mappa di conversione dei caratteri.

La ricetta che funziona, in tre passi:

1. `npm i pdfjs-dist@4` in una cartella temporanea, fuori da questo repo.
2. `getDocument({data}).getPage(n).getTextContent()` per ogni pagina.
3. Unire i pezzi guardando la coordinata verticale, cioè `item.transform[5]`. Senza quel passaggio
   le righe si incollano tutte insieme e il testo diventa illeggibile.

Pagine vere: 11 la teoria del cambiamento, 9 il bottegaio. Attenzione: il comando `file` ne dichiara
8 per entrambi, e sbaglia.

| File archiviato | Nome di consegna |
|---|---|
| `teoria-del-cambiamento.pdf` | `MyCity_Theory_of_Change__Shifting_Spend_to_Local_Shops_via_Earmarked_Money_and_WhatsApp_Rituals.pdf` |
| `bottegaio-cliente-pagante.pdf` | `Il_Bottegaio_Italiano_come_Cliente_Pagante__Analisi_Strategica_per_MyCity.pdf` |
