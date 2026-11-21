---
data: 2026-11-21 14:05
tipo: passaggio di regia
da: «Regia onda 9 MyCity 10.0», session_015BmpnZ6sDXhTVpCDMSp2nP (profondità 0)
a: la regia della settimana dei 700, aperta dalla 10.0
perche: Nicola, 21/11 verso le 14:00: «quando hai finito con tutto apri una nuova sessione in cui usi la strategia per risolvere 700 difetti in una settimana»
---

# La settimana dei 700: il passaggio alla regia nuova

## In parole semplici
Questo foglio dice alla regia nuova da dove parte e cosa le chiede Nicola: chiudere 700 difetti del sito in una settimana.
Oggi, 21/11 alle 14:00, nel registro del sito i difetti aperti sono 749: 667 minori, 77 gravi e 5 bloccanti.
La strategia da usare l'ha già approvata Nicola alle 03:01-03:03 del 21/11: si ripara per causa, il modello piccolo va sui minori non delicati, e le firme si chiedono prima di partire.

Il problema vero di stanotte non è il costo, sono i difetti nuovi. I giri 4 e 5 ne hanno chiusi 45, ma i controlli ne hanno trovati 43 nuovi: gli aperti sono scesi solo da 751 a 749.
Per esempio: se la settimana va come stanotte, si chiudono 700 difetti e ne nascono quasi 700, e il traguardo non si muove.

## Cosa cambia per te
Niente sul sito finché Nicola non unisce le PR dei giri. La regia nuova lavora in un ramo, come sempre.

## Cosa non ho verificato
- Che 700 in una settimana si possano fare con l'efficienza di stanotte. Il conto qui sotto dice che oggi non bastano né i soldi né i tentativi.
- Il raggruppamento per causa: la regia 8.0 ha già detto che rende meno di quanto stimato prima. Non l'ho misurato.
- Il tetto di spesa della settimana: Nicola non l'ha ancora dato.

## Cosa devi fare
1. Leggi la skill `riparazione` e questo foglio. Poi aggiungi alla sessione il deposito del sito `NicolaeRotaru/mycity`. Nicola deve approvare il permesso nell'app: diglielo subito, perché la 11.0 è rimasta ferma proprio lì.
2. Ricevi da me, in chat, i dettagli delle voci riservate. Non vanno mai nel deposito.
3. Apri la campagna in questa cartella, partendo da `main` del sito, commit `1ad51b4c`. Il perimetro è tutto il registro. I minori nati durante la settimana vanno nella lista «dopo»: non spostano il traguardo. È la condizione numero 2 della strategia.
4. Prima di aprire un riparatore porta a Nicola tre cose in un messaggio solo.
   - Il preventivo: quanti difetti si chiudono davvero in 7 giorni. Lo dà il programma `conti --preventivo`.
   - Il tetto di spesa da firmare.
   - I testi delle firme sulle prove comuni, da dare prima di partire.
5. Parti a giri, con le regole del 21/11 e del 15/11:
   - al massimo 16 voci per lotto, 12 riparatori e 4 collaudatori;
   - i delicati in un'onda a parte, con ultracode solo su gravi, soldi, dati e permessi;
   - una riga in `misure.json` a fine giro, con chiusi e nati uno accanto all'altro.
6. In tre casi ti fermi e chiedi a Nicola.
   - Il costo per difetto chiuso supera 12 $.
   - Una voce ha già avuto due giri falliti.
   - Il limite settimanale non è più «allowed».
7. Passa la mano a 250 mila token, con un foglio come questo.

---

## Dettagli tecnici

### Il conto della settimana
- 700 in 7 giorni vuol dire 100 chiusi al giorno. Stanotte, in circa 10 ore, se ne sono chiusi 45.
- Giro 4: 34 reggono su 88 lavorate (39%), 4,74 $ a difetto chiuso. Con questa resa 700 chiusi vogliono circa 1.800 tentativi e circa 3.300 $.
- Giro 5: 11 chiusi, 15,18 $ l'uno. I non delicati col modello piccolo: 8 reggono su 20, circa 3 $ l'uno. I delicati al secondo tentativo: 3 reggono su 19.
- Nati: 29 nel giro 4 e 15 nel giro 5, quasi uno per ogni chiuso.
- Tutte le righe sono in `cervello/riparazione/misure.json`: giri 2-5 dell'onda 9 e le onde prima.

### La strategia approvata (bacheca, 21/11 03:01-03:03)
- Nicola: «devono essere risolti in 1/2 settimane», poi «usa la strategia che proponi, però mantieni la stessa efficienza».
- Si ripara per causa: prima si raggruppano i minori per file e per causa, con la ricetta scritta.
- I minori non delicati vanno sul modello piccolo, senza ultracode.
- Le firme si danno prima di partire. Sono le prove comuni che non tolgono asserzioni e l'id nei commit.
- «Stessa efficienza»: la quota che regge al collaudo non scende e il costo per chiusa non sale.
- Le condizioni della 8.0 per farcela: il tetto di spesa, la lista «dopo» per i minori nati, le firme prima. I minori aperti stanno su circa 417 file. Molti sono in zone delicate: 68 nei pagamenti, 76 nella privacy, 67 fra sicurezza e database.

### Lavoro aperto che passa a te
- Decisioni di Nicola del 21/11:
  - 11:44: ha firmato le sei prove comuni di mycity#300;
  - 13:10: ha autorizzato solo la correzione della guardia dei rami sui salti che si stringono;
  - non ha autorizzato, per ora, AR-1192 (una firma vale per tutte le prove del giro) né la rimessa a mano con uscita 2.
- Restano aperte 2 voci del giro 5m (R02-001, R01-006), ferme sulla rimessa a mano con uscita 2.
- AR-1193 (grave): cinque modi di spegnere una prova che la guardia dei rami non vede. Finché è aperto, il collaudo deve guardare a occhio le prove toccate.
- Scelte A-M di Nicola ancora aperte: `consegne/riparazioni/2026-11-12-sito-tutto/onda9/DA-FIRMARE-21-11.md`.
- Riservate: la voce di S01 che regge si chiude a parte; altre voci e difetti nuovi riservati te li do in chat.

### Dove sta la memoria
- Fino all'unione di ad-mycity#988 la memoria della notte sta nel ramo `claude/stoic-ride-btlf2d`. Parti da quel ramo, non da main.
- Quaderni dei giri: `consegne/riparazioni/2026-11-12-sito-tutto/onda9/` (giro4, giro5d, giro5m).
- Sito: `main` a `1ad51b4c`, l'unione di mycity#300.
- Lezioni di stanotte:
  - ogni SHA di `create_session` si prende con `git rev-parse`, mai scritto a mano;
  - i riparatori non clonano ad-mycity: le istruzioni vanno su un ramo del sito, in sola lettura (come `claude/adoring-bohr-kixq35-o9g5-istruzioni`);
  - una sessione ultracode non si riavvia, se ne apre una nuova.
