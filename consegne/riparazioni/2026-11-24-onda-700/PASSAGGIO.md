---
data: 2026-11-24 15:07
tipo: passaggio della regia (quinta → sesta)
campagna: onda dei 700
---

# Passaggio · dalla regia quinta alla sesta

## In parole semplici
Questo foglio serve alla regia sesta per continuare senza rileggere la chat della quinta.
La quinta passa la mano a 233 mila token di storia, vicina ai 250 mila della skill.
L'unione dei sette rami è sul sito, sul ramo ccr-d7a54140-hak4ez: Nicola ha dato il clic su add_repo.
Le prove del sito sono verdi: 2088 file, 12.674 prove. Anche quelle del database: 226 migrazioni, 91 file.
Il controllore C01 è partito alle 15:01 e lavora sull'unione, con un tetto di 15 $.
Dopo C01 resta la fermata all'AD: i numeri ci sono già quasi tutti, qui sotto.

## Cosa cambia per te
Ti apre l'AD, a profondità 1. Una sola figlia lavora: C01. Quando finisce, si chiude il giro e si va alla fermata.

## Cosa devi fare
Segui «I prossimi passi» qui sotto, dall'1.

## Cosa non ho verificato
Il costo della mia regia: ho letto 3,49 $ alle 15:05, ma dopo il riavvio del worker la lettura potrebbe essere parziale.
Il verdetto di C01: non c'è ancora.

## Dettagli tecnici

**Ids.** AD session_01R8112Lzth8WvHHrQ4H3whZ. Regia quinta session_01R8112PeGJAFQGJ1DtJp6h5: da adesso non spinge più.
C01 session_01R8112MCedazmwF5a39XHqD: partita da ad-mycity @ 8ea02976bfe2a8ea27b6bb2cd6b80f28ad4ff6c9, ramo ccr-d7a54140-hak4ez-c01, cartella `normali`, scritta in `normali/sessioni.json` sotto `controllori`.
La mia sveglia trig_01UnkTnEu12wyoJoqfphWt5t (14:12 UTC, cioè 15:12) scatta da me e la ignoro: la tua la crei tu con send_later.
La regia terza è ferma su un clic di delete_trigger che nessuno può dare. Mentre aspetta non spende: lasciala così.
K01 e K03 sono archiviate. Nessun collaudatore aperto.

**Il sito.** Ramo ccr-d7a54140-hak4ez @ a673164da05ab165480595967128d01795601ba9, albero 1bc16e41636464f1f200d367f57aabb604d1fd4d, base 5b8c786c96ec789918b3e85361ca435cef726b92.
Dentro: m01…m07, la prova 48 righe 97-98, i revert di R01-005 e R07-001. `.riparazione/` resta dentro fino alla PR.
Nel tuo contenitore: `git clone https://github.com/NicolaeRotaru/mycity /home/user/mycity` col git normale.
Poi `git fetch origin` dei rami -m01…-m07 e del ramo d'integrazione: `applica --git /home/user/mycity` li vuole tutti.

**Già fatto nella cartella `normali`.** Referti copiati in `referti/`. Verdi: valida-referto (7), guardia-ramo (7), valida-collaudo (3).
`applica` a vuoto, senza C01, è verde: 21 si chiudono, 15 erano già riparate, 67 restano aperte, 29 nati (tutti minori, dai referti).
`conti` è verde: 103 aperte nel registro, come deve essere prima dell'unione di Nicola.

**Le 67 aperte, per il giro di correzione.**
- Fuori dal giro: 8 aspettano una scelta di Nicola, 4 non sono codice.
- Al riparatore di prima: 2 rompono altro, cioè R01-005 a R01 e R07-001 a R07. Se una sessione passa i 300 mila token, la voce va a «R01 secondo» o «R07 secondo».
- Da ridividere dall'integrazione: 23 a metà e 19 con un file altrui. Per R03-003 e R03-006 vale l'avviso di K01 nel passaggio di prima (commit a76a1a6).
- A un collaudatore nuovo: 11 voci già riparate, senza ancora un verdetto pieno.

**Il tetto, rigido: 360 $.** Spesa misurata con get_session, turni chiusi:
- 278,01 $: passo 1 50,65 · riparatori 152,06 (R01 26,56 · R02 25,33 · R03 19,38 · R04 18,39 · R05 19,18 · R06 20,35 · R07 22,87) · collaudatori 39,01 (K01 20,47 · K02 6,93 · K03 11,61) · regie 36,29 (10,32 · 9,24 · 11,78 · 4,95).
- Poi la quinta, 3,49 $ letti. Con C01 a 15 $ e la tua regia, la proiezione è circa 302 $.
- Per il giro di correzione restano circa 58 $.
- Quest'onda è costata circa 2 $ a voce: 1,48 di riparazione, 0,38 di collaudo e 0,15 di controllo.
- Il conto: il collaudo delle 11 costa circa 8 $. Coi 50 $ che restano si fanno circa 25 delle 44 voci da riparare.
- Alla fermata va detto così: le altre 19 partono solo col sì di Nicola a passare il tetto, o restano per dopo.

**Domande per Nicola alla fermata** (elenco del commit 176e0c4). Migrazioni nuove: 821, 822 (R01), 830, 831, 832 (R02), 840 (R03), 860 (R05).
Dai referti: R01 un secondo reclamo dopo uno chiuso; R02-008, R02-003, R02-002; R03 sette domande; R05-004 placehold.co e il ricalcolo del traguardo «venditore più votato»; R06-009 rilascio automatico di Vercel, R06-010 migrazioni 164 e 181, R06-002 la variabile Sentry su Vercel; R07 tre domande e R07-004.
Sono ancora senza firma le prove comuni di R01, R06 e R07 (vedi REGIA.md).

**Le regole da tenere.** SHA interi. Controllo a 10 minuti su C01: get_session (costo, quota), poi `list_events` kinds assistant con grep `"name":"mcp__` (non deve chiamare il database vero). Il quaderno resta sotto le 80 righe: oggi sono 77, compattalo prima di aggiungere.
Un hook del sorvegliante riscrive `MyCity-Vault/90-Memoria-AI/auto-coscienza/sorvegliante-storico.json`, e al push può dare conflitto. Non usare `commit -a`. Se il conflitto arriva: tieni la versione remota e riaggiungi solo la riga nuova della tua sessione (finestra di 200 righe).

## I prossimi passi
1. `get_session` su di te: il tuo id nel campo `regista` di `normali/sessioni.json`, commit e push. Sveglia a 10 minuti su C01.
2. Quando C01 finisce: copia `normali/controlli/C01.json` da origin/ccr-d7a54140-hak4ez-c01. Sul suo ramo deve esserci solo quel file (`git diff --name-only`). Leggi il costo, archiviala, e scrivi `finita: true` in sessioni.json.
3. Rifai `applica --cartella consegne/riparazioni/2026-11-24-onda-700/normali --git /home/user/mycity` a vuoto, ora con C01, poi `conti`. Se C01 trova rosse più di 10 voci su 103, è una fermata a sé.
4. La FERMATA all'AD, nei quattro blocchi: i numeri, le domande qui sopra e il giro di correzione con quante voci stanno nel tetto. Il giro parte solo col via di Nicola.
5. A fine giro, la riga in `cervello/riparazione/misure.json`.
