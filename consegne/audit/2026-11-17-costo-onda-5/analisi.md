---
data: 2026-11-17 15:50
tipo: analisi
fonte: usage di get_session delle 15 sessioni delle onde 4 e 5, i turni di R30-R33, i referti, i collaudi e i quaderni della campagna
---

# Dove sono finiti i soldi dell'onda 5

## In parole semplici

L'onda 5 è il quinto giro di riparazione dei difetti del sito. È costata circa 232 $ e ha chiuso 10 difetti. Fa circa 23 $ a difetto chiuso, contro i 5 $ dell'onda 1 e gli 8 $ dell'onda 4.

Ogni riparatore però ha speso come prima. Nelle onde 1, 4 e 5 un riparatore costa fra 34 e 46 $, cioè circa 1,5 $ per ogni difetto che riceve. Cambia quanti ne chiude: nell'onda 5 due o tre a testa, nell'onda 4 sette, nell'onda 1 undici.

La causa principale sta nei difetti scelti. I 100 difetti dell'onda 5 erano tutti avanzi delle onde prima. Su 88 gruppi, 72 erano fermi perché toccavano un file assegnato a un'altra sessione.

Un esempio vero. Il riparatore R30 ha speso 35,42 $. Di 25 difetti ne ha riparati 3, ne ha lasciati 6 a metà e ne ha scritti 7 come correzione da applicare dopo. Le correzioni da applicare dopo non contano come chiuse.

## Cosa cambia per te

- Il costo per difetto chiuso dipende da quali difetti si danno, molto più che da quanto spende un riparatore. Con la stessa spesa, difetti scelti bene chiudono quattro volte tanto.
- 15 correzioni sono già dentro il sito, ma non contano come chiuse. Nessuno le ha ancora collaudate. Collaudarle costa circa 6 $ e potrebbe chiuderne fra 8 e 11.
- La regia, cioè la sessione che dirige l'onda, è costata 59 $: un quarto di tutta l'onda. Di questi, 43 $ sono serviti solo a rileggere una chat arrivata a quasi 800 mila parole-macchina.

## Cosa devi fare

Quando vuoi, dire sì o no al pilota da circa 70 $ descritto nella ricetta qui accanto. Finché non dici sì, non parte niente.

## Cosa non ho verificato

- Le tariffe del modello le ho ricavate da quattro turni di R30, dove tornano al centesimo. Sulle altre sessioni la parte «scrittura» è un resto: il suo prezzo sta fra 5 e 8 $ al milione e non so dividerlo.
- Il costo dei lotti viene dai totali letti a fine turno. Un turno può contenere pezzi di due lotti, quindi la divisione è approssimata di 1-2 $.
- Delle 15 correzioni applicate non so quante reggerebbero: uso il 55-76% che hanno retto nelle onde 2 e 5.
- Nell'onda 4 conto come chiuse le 7 voci di R29 che reggono al collaudo. Nel registro sono ancora aperte, in attesa di una deroga sui messaggi di commit.
- Non ho letto il codice delle riparazioni: giudico dai referti e dai collaudi.

---

## Dettagli tecnici

### Le tariffe vere del modello

Risolte con quattro turni di R30 (`model_usage_since_last_result`, `costBasis: list`) e controllate sul totale di R30: 35,41 $ calcolati contro 35,41 $ letti.

| Voce | $ per milione di token |
|---|---|
| lettura della storia (cache read) | 0,20 |
| scrittura in memoria tampone, 5 minuti | 5 |
| scrittura in memoria tampone, 1 ora | 8 |
| ingresso nuovo | 4 |
| uscita (risposta e ragionamento) | 20 |

Le tariffe stimate in `misure.json` (0,3 · 3,75 · 15) sbagliavano la lettura del 50% e l'uscita del 25%. La lettura costa meno del previsto, l'uscita di più.

### Dove sono andati i dollari, sessione per sessione

«Lettura» è la storia riletta a ogni chiamata. «Scrittura» è il contesto nuovo messo in memoria tampone. «Uscita» è quello che il modello scrive, ragionamento compreso.

| Sessione | Ruolo | $ | Lettura $ (%) | Scrittura $ | Uscita $ | Milioni letti | Contesto finale |
|---|---|---|---|---|---|---|---|
| R30 | riparatore | 35,42 | 20,06 (57%) | 7,93 | 7,39 | 100,3 | 196 mila |
| R31 | riparatore | 34,35 | 20,78 (61%) | 5,99 | 7,54 | 103,9 | 291 mila |
| R32 | riparatore | 43,05 | 22,69 (53%) | 11,23 | 9,10 | 113,5 | 294 mila |
| R33 | riparatore | 37,01 | 20,65 (56%) | 7,70 | 8,63 | 103,2 | 260 mila |
| K17 | collaudo (13 voci) | 5,37 | 2,65 (49%) | 1,81 | 0,91 | 13,3 | 273 mila |
| K18 | collaudo (25 voci) | 9,32 | 5,10 (55%) | 2,30 | 1,92 | 25,5 | 350 mila |
| C05 | controllore | 7,99 | 4,68 (58%) | 1,58 | 1,73 | 23,4 | 302 mila |
| Regia O5 | regia | 59,43 | 43,10 (73%) | 11,46 | 4,79 | 215,5 | 796 mila |
| **Onda 5** | | **231,94** | **139,71 (60%)** | 49,99 | 42,01 | 698,6 | |

Riparatori 149,83 $ (65%) · collaudo e controllo 22,68 $ (10%) · regia 59,43 $ (26%). La regia è letta alle 15:40: comprende la preparazione, la chiusura nel registro dopo l'unione e l'apertura di questa analisi. Alle 13:15, a onda finita, segnava circa 42 $.

Nei riparatori l'uscita pesa il 21-23%. In R30 il ragionamento è 130 mila token su 369 mila di uscita (35%): è l'effetto dell'effort xhigh.

### Primo lotto contro gli altri

I totali letti a fine turno (`total_cost_usd` dei risultati di R30-R33, raccolti da un sotto-agente sul modello piccolo):

| Riparatore | Avvio fino al piano | Primo lotto (avvio compreso) | Lotti dopo | Consegna e ritocchi | Totale |
|---|---|---|---|---|---|
| R30 | 1,79 $ | 12,27 $ (lotto A, 5 voci) | 20,23 $ (lotto B) | 2,91 $ | 35,41 $ |
| R31 | 1,87 $ | 14,20 $ (lotto 1, 6 voci) | 18,74 $ (lotti 2 e 3, revisori) | 1,02 $ | 33,96 $ |
| R32 | 1,34 $ | 15,77 $ (lotto 1: solo il grave R32-001) | 24,72 $ (lotto 2 e migrazione 561) | 2,26 $ | 42,75 $ |
| R33 | 1,00 $ | 9,18 $ (lotto A: solo il grave R33-002) | 22,28 $ (lotti B, C, D) | 5,54 $ | 37,00 $ |

L'ultimo totale è un turno prima della lettura di get_session, per questo differisce di qualche centesimo.

- **L'avvio costa poco:** clone, installazione, regole, scheda da 23-47 KB e piano fanno 1,00-1,87 $, il 3-5% del totale.
- **Il primo lotto è caro per il lavoro, non per l'avvio:** 8-14 $ di riparazione vera.
- **I gravi pesano più di tutto:** R32-001 da solo è costato circa 14,4 $ (riparazione, revisore, giro di correzione) ed è finito patch riservata fuori dall'unione. R33-002 è costato circa 8,2 $ ed è finito parziale. Dei 7 gravi dell'onda 5 non ne regge nessuno.
- **Il modello piccolo:** il lotto 3 di R31, su Sonnet, è costato 3,74 $ contro i 12-13 $ dei lotti 1 e 2 sul modello grande. Non so quante voci avesse, quindi non è una misura per voce.
- **Dove va la lettura:** nei turni dei lotti la lettura è il 55-60% del costo (R30 lotto B: 59,6 milioni di token letti su 20,22 $). Sono i subagenti che lavorano molte voci nello stesso contesto.

### Le tre onde con la stessa misura

| Misura | Onda 1 | Onda 4 | Onda 5 |
|---|---|---|---|
| Spesa totale | 609,0 $ | 132,5 $ | 231,9 $ |
| riparatori | 398,4 $ (11) | 85,5 $ (2) | 149,8 $ (4) |
| collaudo e controllo | 152,3 $ | 14,0 $ | 22,7 $ |
| regia | 58,4 $ | 33,0 $ | 59,4 $ |
| Voci date | 275 | 50 | 100 |
| Voci toccate (date meno non fatte) | non misurato | 27 | 64 |
| Voci che reggono al collaudo | 122 | 17 (14 + 3 di K14) | 10 |
| $ dei riparatori per voce data | 1,45 | 1,71 | 1,50 |
| $ dei riparatori per voce toccata | non misurato | 3,17 | 2,34 |
| $ totali per voce data | 2,21 | 2,65 | 2,32 |
| **$ totali per voce chiusa** | **4,99** | **7,79** | **23,19** |
| Spesa media di un riparatore | 36,2 $ | 42,7 $ | 37,5 $ |
| Voci chiuse da un riparatore | 11,1 | 7 | 2,5 |
| Quota di lettura della storia | 61% | circa 53% | 60% |
| Quota della regia | 10% | 25% | 26% |

Onda 1: `consegne/audit/2026-11-15-lezioni-onde/fatti.json` (tabella delle sessioni). Onda 4: usage di R28 39,94 $, R29 45,53 $, K15 5,09 $, C04 2,96 $, regia O4 uno 25,04 $ e due 7,98 $ letti oggi; K14 2,06 $ e K16 3,88 $ dal quaderno. R28 e R29 sono saliti dopo la consegna (37 e 42,95 $) per i turni col passaggio della regia.

**La lettura della tabella:** il costo per voce data è quasi uguale nelle tre onde (2,21 · 2,65 · 2,32 $). Il costo per voce chiusa cambia di quattro volte. Quindi l'onda 5 non ha consumato di più: ha convertito meno.

### Gli esiti delle voci: onda 5 contro onda 4

| Esito del riparatore | Onda 5 (100) | Onda 4 (50) |
|---|---|---|
| riparato | 11 (11%) | 14 (28%) |
| di cui reggono al collaudo | 10 | 14 |
| serve_file_altrui (patch per la cucitura) | 22 (22%) | 6 (12%) |
| parziale | 17 (17%) | 5 (10%) |
| già riparato prima | 10 (10%) | 1 (2%) |
| non fatto per il tetto | 36 (36%) | 23 (46%) |
| scelta di Nicola o non codice | 4 | 1 |

Sulle voci toccate reggono il 16% nell'onda 5 (10 su 64) e il 52% nell'onda 4 (14 su 27).

### Le cause, in ordine di peso

1. **I difetti dati erano avanzi già falliti (peso: circa 15 $ dei 23 $ a chiusa).** Le 88 chiavi dell'onda 5 sono 34 dell'elenco B (serve_file_altrui delle onde prima), 38 dell'elenco C (parziali su file altrui) e 16 non fatte dell'onda 4. Nessuna era nuova. Il riparato scende dal 28% all'11%. Con la resa dell'onda 4 (7 chiuse a riparatore) l'onda 5 avrebbe chiuso 28 voci, cioè 8,3 $ a chiusa.
2. **Il lavoro pagato e non incassato: 22 patch (peso: circa 51 $ di lavoro, 22% della spesa).** La regola delle 10:40, «verify verde alla testa», ha spostato in patch ogni correzione che rompeva una prova comune. Le patch di R30 e R31 sono 15 e sono state applicate pulite alla cucitura (93dff97f), con il verify verde dopo due ritocchi. Nessuna è stata collaudata, quindi nessuna conta. A 2,34 $ per voce toccata, sono circa 51 $. Collaudarle costerebbe circa 6 $ (0,37-0,41 $ a verdetto, K17 e K18). Con il 55-76% che regge darebbero 8-11 chiuse in più: l'onda passerebbe a 18-21 chiuse, 11-13 $ a chiusa. Questa causa in parte si sovrappone alla prima: le voci B e C tornano patch più spesso.
3. **La regia in una chat lunga (peso: circa 30 $, 3 $ a chiusa).** 59,43 $, cioè il 26% dell'onda, contro il 10% dell'onda 1. 43,10 $ sono lettura di 215,5 milioni di token: la chat era a 407 mila token alle 10:20 e a 796 mila alle 15:40. La regola 4 del 15/11 dice di passare la mano a 250 mila. La regista è rimasta per non perdere il permesso scritto di Nicola in quella chat. Una regia sotto i 250 mila legge circa tre volte meno: circa 30 $ in meno, e l'onda sarebbe a circa 20 $ a chiusa.
4. **I gravi dentro i lotti dei minori (peso: almeno 22,6 $, circa 2,3 $ a chiusa).** I 7 gravi erano in testa alle schede e sono partiti per primi. Due soli, R32-001 e R33-002, sono costati circa 22,6 $ e non si sono chiusi. Degli altri: due patch altrui (R30-001, R30-002), una patch (R31-001), una già riparata (R33-001), uno senza esito chiuso (R33-003). Zero gravi reggono.
5. **10 posti su 100 dati a voci già riparate (peso stimato: circa 1 $ a chiusa, 10 $ in tutto).** `pronte` metteva nell'elenco B voci già riparate e collaudate dall'onda 4, non ancora unita. Il lavoro su ognuna è stato breve, ma i posti persi più le 36 non fatte fanno 46 voci su 100 senza lavoro vero.
6. **L'effort xhigh sull'uscita (peso: 5-6 $ se il ragionamento si dimezzasse).** L'uscita fa il 21-23% del costo dei riparatori, 32,66 $ su 149,83. In R30 il ragionamento è il 35% dell'uscita. Su difetti minori un effort più basso potrebbe tagliarne una parte, ma non è mai stato misurato.

### Le ipotesi della regista, una per una

| Ipotesi | Esito | Il numero |
|---|---|---|
| I difetti erano gli avanzi più difficili | confermata, è la causa più pesante | 72 su 88 chiavi da B e C, 16 non fatte dell'onda 4, nessuna nuova |
| La regola del verify verde ha spinto 20 correzioni in patch | confermata, e sono 22 | 15 applicate alla cucitura, 0 collaudate, 0 chiuse |
| Ogni riparatore ha speso 9-14 $ nel primo lotto fra clone, installazione e schede | smentita nella spiegazione | il primo lotto costa 9-16 $, ma l'avvio fino al piano costa 1,00-1,87 $: il resto è riparazione, e in R32 e R33 è il grave |
| La regia in una chat lunga è costata 50 $ | confermata, e sono 59 $ | 73% di lettura, 215,5 milioni di token |

### Cosa non è la causa

- **Il prezzo dei riparatori:** 1,50 $ per voce data, uguale all'onda 1 (1,45 $).
- **Ultracode:** spento in tutte e quattro.
- **I subagenti:** da 2 a 5 per riparatore, contro i 5-10 dell'onda 1.
- **L'avvio dei riparatori:** 1,00-1,87 $ fino al piano, il 3-5% del totale.
- **Il collaudo e il controllore:** 22,68 $, il 10% dell'onda, contro il 25% dell'onda 1. Un verdetto costa 0,37-0,41 $.
