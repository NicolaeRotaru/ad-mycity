---
tipo: note della regia per l'onda 3
data: 2026-11-26 17:40
campagna: tutti i difetti del sito che non chiedono Nicola (26/11)
---

## In parole semplici
Queste sono le note che la regia dà ai riparatori dell'onda 3, oltre alla scheda.
Molte voci tornano dalle onde 1 e 2: erano rimaste a metà, o rompevano un'altra cosa.
Per esempio: R21 riprende tre voci sul prezzo che andavano in errore senza la migrazione 960 applicata.

## Cosa cambia per te
Niente: lo leggono le sessioni.

## Cosa devi fare
Niente.

## Cosa non ho verificato
Che ogni nota sia ancora vera sul codice dell'integrazione: lo controlla il riparatore prima di toccare.

---

## Dettagli tecnici

**Base di tutti:** integrazione del sito `ccr-a672a2b3-92w5w1` @ aac2350b09db195d6d2286f15f75a7d02ae590a1 (onde 1 e 2 unite).
Il tuo ramo: `ccr-a672a2b3-92w5w1-mNN`. Regista: session_015BmpnXSyPksZEDoo4vMSYa (quinta regia).

**Per tutti.**
- Senza ultracode (regole del 26/11, punto 1). Limite 25 $ con un grave, 20 $ di soli minori; se chiudi un difetto nato da te puoi sforare di 5 $, poi consegni.
- Le voci con «prima:» nella scheda hanno già un tentativo: leggi cosa resta e la modifica scritta, non ripartire da zero.
  I collaudi precedenti, con il perché di ogni «rompe altro», sono in `consegne/riparazioni/2026-11-26-tutti-onda1/collaudi/K01-K04.json`
  e `consegne/riparazioni/2026-11-26-tutti-onda2/collaudi/K05-K06.json` (nel clone di ad-mycity). Cerca la chiave della voce.
- **Migrazioni.** La tua fascia è nella scheda. Sono sotto la 970 già presente (880, 900, 910, 940, 970 sono delle onde 1-2):
  in ordine di byte la tua gira PRIMA di quelle. Se la tua migrazione ridefinisce una funzione, una regola o una vista toccata
  da 880/900/910/940/970, riporta dentro le loro correzioni e provalo su Postgres con tutte le migrazioni applicate. Nel dubbio,
  esito `serve_file_altrui` con la modifica esatta.
- Una voce per commit, nessun codice di altre voci nei messaggi di commit.

**Note per sessione (dai collaudi delle onde 1 e 2).**
- **R18** · la voce sul blocco del prodotto tolto (prima R02-014, migrazione 881 tolta): il blocco si aggirava dalle rotte AI del
  venditore, e bloccava per sempre un prodotto rimesso in vendita dallo staff. Copri le rotte AI e lo sblocco dello staff.
- **R19** · la voce del rimborso parziale (prima R04-005): il collaudo K02 l'ha trovata rompere il rimborso parziale. Leggi K02.
  Sei un lotto di soli gravi di soldi: uno per lotto, prova su ognuno, consegna al 70% del limite.
- **R20** · la voce della spesa AI (prima R12-001, grave): il cliente legge «Budget esaurito» quando il conto non si legge
  (run.ts:306 e 491), e senza Upstash le prenotazioni in volo restano della copia. Nota intera in `-onda2/collaudi/K06.json`.
- **R20** · la voce dell'avviso al cliente quando il negozio risponde (prima R14-012, migrazione 930 tolta): **una funzione sola**
  che tenga insieme la correzione già nella 900 (il negozio che risponde a se stesso non si avvisa, con la condizione che legge
  l'utente della sessione: non toglierla) e la tua (la risposta svuotata e riscritta non riavvisa). Migrazione nella fascia
  980-989, così gira dopo la 900. Una prova SQL che copra le due cose insieme.
- **R20** · la voce dei contatori dei reclami (prima R07-006): i contatori non tornavano più con la lista. Devono tornare uguali.
- **R21** · le tre voci sul prezzo (prima R10-003, 004, 005, migrazione 960 tolta): senza la 960 in produzione le pagine col
  prezzo andavano in errore. Serve un ripiego: la pagina funziona anche se la migrazione non è ancora applicata.
- **R22** · la voce dei ritiri al banco (prima R05-002): la commissione dei ritiri al banco non si scriveva da nessuna parte e il
  bonifico segnato non restava. Tutte e due devono restare scritte.
- **R26** · la guardia di prima R09-003 non controllava niente: deve poter diventare rossa. La voce di prima R09-006 lasciava
  scoperta la pagina della cassa: con lo sconto a zero restavano verdi 497 prove. Serve una prova che diventi rossa.
- **R28** · la voce del testo a capo (prima R15-006): niente `overflow-wrap:anywhere` nella fascia di about/page.tsx:237-243, il
  testo deve restare leggibile a 280-320 px. La voce della password debole (prima R06-003): con un testo nuovo di Supabase
  dava un errore generico e un link che non c'è. La voce del rifiuto (prima R06-013): un rifiuto che incontra un cambio di stato
  diverso dall'annullo rispondeva «già annullato» con l'ordine vivo.
