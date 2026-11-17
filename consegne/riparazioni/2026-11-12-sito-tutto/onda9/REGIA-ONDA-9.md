---
data: 2026-11-17 20:20
tipo: quaderno della regista
stima_usd: 600
tetto_usd: 650
partenza: 2026-11-19 10:05
regia: session_015BmpnYq3DQDRwTXdBwfzud (chat «Ondata 9», decisione di Nicola del 17/11 alle 21:48)
---

# Onda 9: il quaderno della regista

## In parole semplici
L'onda 9 ripara 200 difetti piccoli del sito con 10 riparatori. L'ordine l'ha scelto Nicola: prima quelli già pagati, poi quelli con la correzione già scritta, poi quelli che nessuno ha mai raggiunto, poi i mai tentati e i lasciati a metà. Nessuno tocca soldi, dati personali o permessi. Un esempio vero: R03 ripara 19 difetti delle funzioni AI dei negozi, come il copilot che oltre circa cento prodotti risponde «riprova» e fallisce ogni volta. Due riparatori, R02 e R03, sono partiti il 17/11 alle 22:14 su «falla partire adesso» di Nicola. Gli altri otto partono giovedì 19/11 alle 10:05, quando il limite settimanale si è azzerato.
Esempio: un difetto che nell'onda 5 è rimasto «mai raggiunto», perché il riparatore ha finito tempo e soldi prima di arrivarci, nell'onda 9 viene prima di quelli mai tentati.

## Cosa cambia per te
Niente fino alla PR del sito.

## Cosa devi fare
Niente: Nicola ha detto «fai così» alle 20:12 del 17/11.

## Cosa non ho verificato
Che il codice di ogni voce ci sia ancora: lo controlla il riparatore prima di spenderci.

---

## Dettagli tecnici

### L'elenco (`chiavi-onda9.txt`, gruppi in `gruppi-onda9.json`)
Calcolato il 17/11 alle 20:15 sulla base `522cfb01` (main dopo mycity#295) dai minori lavorabili (528), fuori le 42 dell'onda 8.
1. A, collaudo e basta: 5 (elenco A di `pronte`).
2. B, correzione già scritta nei referti: 27 (elenco B di `pronte`).
3. Mai raggiunti (ultimo esito non_fatto o senza referto): 49.
4. C, parziali con file altrui: 8.
5. Mai tentati: 77.
6. Parziali: 34.
Fuori: 83 delicati mai tentati (pagamenti, accessi, permessi, privacy, dati, migrazioni, o file come stripe, payout, checkout, webhook, cassa), le riservate e quelle con una domanda per Nicola. Il programma che ha fatto l'elenco: `onda9/scelta-onda9.mjs` (argomento: il perimetro dei minori, `perimetro --gravita minore` in una cartella di prova).

### Il giro di giovedì
1. `get_session`: il limite deve essere `allowed` (azzerato).
2. Rifare l'elenco sulla base di quel momento (main dopo l'onda 8): `node consegne/riparazioni/2026-11-12-sito-tutto/onda9/scelta-onda9.mjs <perimetro.json>`. Le voci chiuse dall'onda 8 escono da sole.
3. `perimetro --profilo scelta --file-chiavi onda9/chiavi-onda9.txt`, `dividi --sessioni 10 --per-sessione 20` per le 195 da riparare, schede con `--ramo ccr-30918361-coyajm-o9`.
4. Le 5 del gruppo A vanno a un collaudatore, senza riparatore.
5. 10 riparatori: Opus, xhigh, senza ultracode, 6 subagenti, consegna a 40 $ e tetto 45 $ per 20 voci. La spesa la legge la regia: i riparatori non la vedono.
6. 4 collaudatori, uno ogni 2-3 riparatori, aperti appena consegnano. Un controllore sul codice unito. Una PR del sito.

### Il preventivo
Circa 3 $ per voce data: 195 voci danno circa 585 $, più la regia, circa 600 $. Dentro il tetto totale di 1.200 $: le onde 6, 7 e 8 ne hanno spesi circa 325. Se regge il 50% come nell'onda 7, circa 95 difetti chiusi a circa 6 $ l'uno. Nel caso peggiore, 30%, circa 10 $. Il cancello è a 20 $ a difetto chiuso.
- 20:16 Le 25 correzioni già scritte (gruppo B) sono passate all'onda 8b, chiesta da Nicola alle 20:28. Il programma della scelta adesso esclude anche `onda8b/chiavi-B.txt`: giovedì il posto delle B lo prendono le voci dopo nell'ordine.

### Stato (regia «Ondata 9», session_015BmpnYq3DQDRwTXdBwfzud)
- 21:47 Nicola dà la regia a questa chat. 21:50 firma la guardia delle aperture (ad-mycity#985). 21:56 il promemoria della chat «Ondata 7 difetti» è spento, il mio parte giovedì alle 10:05.
- 22:2x Nicola: «falla partire adesso». Limite visto nell'app: fra 90% e 95%. Scelta: «mi fermo prima», con circa il 3% lasciato alle sue chat. Stasera circa 60-70 $ (2 riparatori, consegna a 30 $, tetto 35 $); gli altri giovedì alle 10:05.
- 22:12 Elenco rifatto sulla base del sito `f93d246a` (main dopo mycity#296): 200 voci, 5 solo collaudo (`chiavi-collaudo-A.txt`), 195 da riparare (`chiavi-riparatori.txt`). Perimetro verde, `dividi --sessioni 10 --per-sessione 20`: 152 voci in R01-R10, 43 al giro dopo. Schede, copertura-prima e segnaposti verdi. Rami `claude/adoring-bohr-kixq35-o9-mNN` sul sito.
- Prima scelta per stasera: R05 (20 voci, 8 mai raggiunte) e R09 (20 voci, 6 mai raggiunte), poi cambiata in R03 e R02 (riga sotto). Giovedì R01-R04, R06-R08, R10, il collaudo del gruppo A, i collaudatori e il controllore.
- 22:14 aperti R03 `session_015BmpnYY5FRfV2QHnGfxmLq` e 22:15 R02 `session_015BmpnUuqaZeyg8n3BBxy6h`, senza conferme (la guardia di ad-mycity#985 regge dal vivo). Al posto di R05 e R09: in R05 ci sono annullo ordini, soldi fra ordini del carrello, cancellazione ed esportazione dell'account; il filtro dei delicati di `scelta-onda9.mjs` guarda le dimensioni e pochi nomi di file, non il testo. Regola 3 nel prompt: voci con soldi, dati personali, permessi o migrazioni → `non_fatto` «delicata: fuori dall'onda 9». Da fare prima di giovedì: rifiltrare R04 (12 voci sospette su 20), R05 (8), R09 (7) e le altre, sul testo delle voci.
- Stasera: consegna a 30 $, tetto 35 $ a riparatore. La spesa la legge la regia con get_session.
- 22:35 Nicola legge nell'app l'89% del limite settimanale. Resta circa l'11%; tolto il 3% per le sue chat, circa 240 $. Aperti altri 4 riparatori, consegna a 30 $ e tetto 35 $: R01 `session_015BmpnXsG8PNg7ifyDEH21e`, R06 `session_015BmpnXuKeg9UZV4VTeijA9`, R07 `session_015BmpnY5Tr9sb9jVsUfgDzU`, R10 `session_015BmpnVgNypE5YPDP33krPo`. Fuori R08 (prezzo che arriva al carrello) e R04, R05, R09 (troppe voci delicate). Nel prompt di R01 sessioni e iscrizione sono permessi; in R07 i file del rilascio: modifica minima, mai togliere un controllo, accendere un allarme spento è una scelta di Nicola.
- Nicola dorme fino al 18/11 mattina: stanotte nessuna azione che chiede conferma (niente strumenti GitHub che scrivono).
