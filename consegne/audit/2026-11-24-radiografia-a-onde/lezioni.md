---
tipo: analisi e costruzione
data: 2026-11-24 21:31
fonte: misure delle onde della riparazione (cervello/riparazione/misure.json), ricontrollo del 21/11, radiografia del 6/11, quaderni delle regie
per: Nicola
---

# La radiografia a onde: cosa insegnano le onde della riparazione

> **In due righe.** La radiografia del sito ora lavora come le onde della riparazione: prima ricontrolla i difetti aperti, che è il modo più economico di chiuderli, poi cerca. Le regole che nelle onde hanno fallito come testo qui le fa rispettare un programma.

## In parole semplici

Questo documento serve a decidere se la radiografia del sito può lavorare come le onde della riparazione. Racconta cosa hanno insegnato le onde, e cosa ho già portato dentro.

Le «onde» sono il modo in cui ripariamo il sito. Una regista divide i difetti fra tante sessioni che lavorano insieme. Altre sessioni controllano il lavoro. I programmi tengono i conti.

Dal 12/11 al 23/11 le onde sono state undici, contando la settimana dei 700. Hanno chiuso centinaia di difetti, e ogni errore pagato è diventato una regola.

La radiografia, cioè il lavoro che **trova** i difetti, era rimasta alle regole del 12/11. Ha girato a onde una volta sola: il ricontrollo del 21/11.

Adesso la radiografia ha le stesse regole delle onde, e quasi tutte le fa rispettare un programma, non la buona volontà.

Un esempio concreto. Il 21/11 il ricontrollo ha guardato 459 voci aperte su 673, e ne ha chiuse 117, già sparite dal sito. È costato circa 130 $ in tutto, cioè circa 1,1 $ per voce chiusa. Una chiusura con riparazione, nelle onde migliori, costa da 4 a 8 $.

## Cosa cambia per te

- Prima di cercare difetti nuovi, la radiografia ricontrolla quelli aperti. È il modo più economico che abbiamo di accorciare la lista.
- Oggi un ricontrollo costerebbe circa 86 $ in tutto, con una forchetta da 69 a 112 $. Dovrebbe chiudere circa 78 voci su 305 guardate, circa 1,1 $ l'una.
- Il preventivo viene solo dai costi misurati, scelti con la stessa configurazione. Prima veniva da una stima scritta a mano.
- La ricerca di difetti nuovi a lotti non è mai stata misurata. Quindi la prima onda è un pilota piccolo: il ricontrollo più due sessioni di ricerca, circa 93 $ su un totale atteso di circa 444 $. Il resto parte solo col tuo sì.

## Cosa devi fare

Guardare la richiesta di unione e dirmi se va bene. Ci sono due scelte che ho fatto io e che puoi cambiare:

- **Ultracode sulle sessioni di ricerca dei temi a rischio alto** (soldi, accessi, dati). L'ho deciso per analogia con la tua regola del 15/11 sui riparatori. Raddoppia il costo di quelle sessioni. Se preferisci risparmiare, si spegne per tutte con un'opzione.
- **Il freno sul numero di agenti** vale anche per chi cerca: dodici al massimo, mai lanci di gruppo. Funziona solo dove il controllo è incollato nelle impostazioni. Nel sito c'è già. Nella macchina, dove lavorano le sessioni della radiografia, lo puoi incollare solo tu.

Nessuna radiografia parte con questo lavoro: per lanciarne una serve il tuo «via» sul preventivo.

## Cosa non ho verificato

- Le regole nuove non le ha ancora usate nessuna radiografia vera. Le ho provate con 63 prove automatiche e 31 controprove nuove, 66 in tutto: togliendo ogni regola, la sua prova diventa rossa.
- Due collaudatori indipendenti hanno bocciato il primo giro per nove difetti veri, e li ho corretti tutti. Il più serio: il primo filtro teneva fuori due voci gravi sui soldi. Il secondo giro del collaudo è nei dettagli.
- Il preventivo della ricerca a lotti è una stima: nessuna misura vera esiste ancora. Per questo c'è il pilota.
- La copia del sito che uso qui ha la storia corta. Su una copia intera il primo filtro toglierebbe qualche voce in più. Con la storia corta, nel dubbio, manda la voce agli agenti.
- Il costo di regia e controllore finale del 21/11 è una stima dal quaderno della regia: non aveva un contatore.
- Se una voce è una falla resta un giudizio della sessione. Il programma la obbliga solo a dirlo, voce per voce.

---

## Dettagli tecnici

### Come sono andate le onde: i numeri

Da `cervello/riparazione/misure.json` (in main fino al 21/11; la settimana dei 700 dal ramo `claude/settimana-700-regia`):

| Fase | Voci date | Chiuse | Costo | $ a chiusa | Configurazione |
|---|---|---|---|---|---|
| Onda 1 (12-13/11) | 275 | 122 | 610 $ (774 con la regista di prima) | 6,34 | senza ultracode, regia 58 $ |
| Onda 2 (13-15/11) | 209 | 60 | 1.627 $ | 27 | ultracode, 12 registe per 407,68 $ |
| Onda 4 | 50 | 10 | 132,48 $ | 7,79 | senza ultracode |
| Onda 5 | 100 | 10 | 231,94 $ | 23,19 | voci in file di altri, 15 correzioni mai collaudate |
| Onda 7 | 52 | 27 | 152,77 $ | 5,66 | senza ultracode, lotti da 13 |
| Onda 8 | 40 | 24 | 104,46 $ | 4,35 | quasi tutta avanzi, con i file in mano |
| Onda 9, giro 3 | 89 | 15 | 266,46 $ | 17,76 | ultracode su tutto, lotti da 21-22, 53 voci mai toccate |
| Onda 9, giro 4 | 88 | 34 | 161,19 $ | 4,74 | regia corta, collaudi in catena |
| Settimana dei 700, giro di correzione | 79 | 17 | 224 $ | 13,2 | firme arrivate a metà giro, regia a 692 mila token |

E la radiografia (`cervello/radiografia/misure.json`, nuovo):

| Fase | Cosa | Costo |
|---|---|---|
| 6/11, 12 sessioni | 175 difetti nuovi (11 gravi, 164 minori, nessun bloccante) | sessioni 327,39 $ · **regia 1.108,15 $** in sei giorni |
| 7/11, palestra (prova di fumo) | 1 bloccante, 1 grave, 1 minore verificati | 1,3 milioni di token |
| 21/11, ricontrollo | 459 voci, 117 chiuse | sessioni 104,72 $ · regia e controllore circa 25 $ (stima) |

### Dove hanno sbagliato

1. **Le regole scritte e basta non hanno frenato niente.** Nell'onda 2 erano scritti il tetto di 12 agenti, i tetti di spesa, le attese mute: superati tutti. Quattro sessioni su dodici avevano 13-15 agenti.
2. **La regia lunga.** Il 6/11 la regia della radiografia è costata più di tre volte le sessioni. Nell'onda 9 sette regie fra 343 e 650 mila token hanno preso il 20% della spesa. Nella settimana dei 700 la catena di regie è arrivata a 7 livelli su 8, e la regia nuova non si poteva più aprire.
3. **Ultracode dappertutto.** Con ultracode un riparatore costa circa il doppio per voce: 4,16 $ contro 2,22 $. Il giro 3 dell'onda 9 l'aveva su tutto: 17,76 $ a chiusa.
4. **Il preventivo a memoria.** `misure.json` è rimasto fermo dal 17 al 21/11 mentre giravano quattro onde. Il preventivo prende ancora l'ultima riga, qualunque configurazione abbia.
5. **Lotti troppo grandi.** Nel giro 3 lotti da 21-22 voci: 53 voci su 87 mai toccate, perché il tetto finiva prima.
6. **Sessioni che non partono.** C02 è rimasta ferma 52 minuti; il primo K02 non è mai partito, per un commit di partenza sbagliato.
7. **Le firme a metà giro.** Nella settimana dei 700 tre giri di rimessa e due ricollaudi: circa 13 $ a chiusa invece di 5-8.
8. **I dettagli delle falle nei rami pubblici.** Nel ricontrollo del 21/11 dodici voci aperte hanno avuto il «come» scritto nei referti spinti. Il controllore finale l'ha visto, ma dopo il push.
9. **Un grave senza posto.** Il ricontrollo ha visto il rimborso «1.250,00» letto come 1,25 €, e il profilo non sapeva dove metterlo.
10. **Il costo in dollari mancante.** Nessuno dei quattro referti del 21/11 aveva il costo della sessione; nella settimana dei 700 i costi si leggevano dai messaggi.

### Dove hanno fatto bene

1. **Il ricontrollo**: 117 chiusure a circa 1,1 $ l'una, la chiusura più economica della casa.
2. **Il primo filtro fatto dal programma**: 214 voci su 673 non sono mai andate agli agenti, con file e righe fermi dall'ultima conferma.
3. **Il doppio controllo**: nell'onda 9 collaudatori e controllori hanno tolto 17 riparazioni prima che arrivassero al sito, tre gravi.
4. **Regia corta e ultracode spento**: 4-8 $ a chiusa nelle onde 1, 4, 6, 7, 8, 8b e nei giri 1 e 4 dell'onda 9.
5. **Lotti piccoli a subagenti nuovi**: le storie restano corte, e la rilettura costa poco.

### Cosa entra nella radiografia, e chi lo fa rispettare

| Lezione | Pezzo nuovo | Chi frena |
|---|---|---|
| Prima il già trovato | `prepara` fa il prepasso (era lo script `consegne/riparazioni/2026-11-21-settimana-700/prepasso.mjs`); `copertura-prima` rifà la scelta e la confronta | programma |
| Ultracode solo dove serve | ricontrollo diviso in sessioni di voci gravi (ultracode) e minori (senza); `--ultracode dove-serve|no|tutte` | programma |
| Preventivo dalle misure | `preventivo` sceglie la misura con lo stesso tipo, metodo e ultracode; tre cifre, per onda, percentuale della settimana, chiusure attese | programma |
| Una novità alla volta | `prepara` mette al massimo 2 cercatrici nella prima onda finché la ricerca a lotti non ha una misura | programma (la soglia per andare avanti è testo) |
| La riga delle misure | comando `misura`; `applica --scrivi` è rosso senza la riga di questa radiografia in `misure.json` (una misura a vuoto non basta) | programma |
| Il costo nel referto | `valida-referto` vuole `conto.usd` o il perché | programma |
| La falla scoperta | `valida-referto` vuole `falla` su ogni voce che resta aperta, anche nel referto parziale; con `falla: true` i dettagli valgono «(nel referto privato)»; `applica` scrive `da-riservare.txt` | programma |
| Il grave di passaggio | profilo `ricontrollo` con gravità bloccante e grave, senza ricerca | programma |
| Sorveglianza muta, sessione che non parte | `sorveglia --attendi` (esce 1 col segnale nuovo, 4 al battito) e `segnali` (non partita, ferma, attesa, spesa, quota) | programma |
| Agent, mai Workflow | ruolo `cercatore` nel freno (12, Workflow bloccato) | programma dove l'hook è incollato |
| Regia corta, aperta dall'AD | skill, F1 | solo testo |

**Un miglioramento che la riparazione non ha ancora.** Il preventivo della riparazione (`conti --preventivo`) prende l'ultima riga di `misure.json`, e la regola 1 del 21/11 che lo corregge è solo testo. Quello della radiografia sceglie la riga per configurazione. Lo stesso pezzo si può portare nella riparazione: è una proposta, non l'ho fatto.

### I collaudi (chi ha costruito non collauda)

Due collaudatori nuovi, uno per lente, su `2c19ae489`. Primo giro: bocciato da tutti e due.

| Lente | Difetto trovato | Correzione |
|---|---|---|
| A «sa diventare rosso?» | il prepasso leggeva solo il primo intervallo di righe: «payout.ts:921-927, 1662, 1869-1889» teneva fuori due gravi sui soldi | `intervalliDi`: tutti gli intervalli |
| A | un grave con ultima riverifica «non più vero» senza verificatore restava fuori per sempre (e lo scrive `applica` stesso) | classe `chiusura_da_confermare`, sempre agli agenti |
| A | la data di nascita cadeva su un commit di un ramo laterale | si guardano due versioni (linea principale e ultimo commit di ogni ramo): basta una «toccata» |
| A | senza data di nascita le righe si confrontavano dall'ultima conferma | file cambiato e nascita ignota: agli agenti |
| A | un nome di file ambiguo non diceva niente e la voce restava fuori | classe `file_ambigui`, agli agenti |
| A | `misura` a vuoto scriveva `misura.json`, e `applica --scrivi` passava senza la riga | misura a vuoto non scrive; `applica` cerca la riga nel file delle misure |
| A | un fetch solo per tutti i rami falliva se uno non era spinto: la sessione che non parte accecava l'onda | un fetch per ramo, refspec esplicito; ramo assente non è errore |
| A | il «come» di una falla passava da domande, prove per la palestra, copertura | rosso se il titolo della voce ricompare lì; tipi chiusi per prova_tipo e verificato |
| A | una quota di regia sola per tutte le sessioni | quota per sessione |
| B «nasce rotto?» | «8-12 agenti per lancio» faceva scattare il guardiano dei senior, vincolo duro a ogni giro | «8-12 subagenti» |
| B | il modello del referto portava `"usd": 0`, e lo zero passava come costo | `null` nel modello; lo zero è un costo che manca |
| B | radiografia in corsa da registrare dopo l'ultima modifica | registrata dopo il secondo giro |

### Le prove

- `node --test cervello/test/radiografia-sessioni.test.mjs`: 63 verdi (41 di prima, 22 nuove).
- `node --test cervello/test/freno-subagenti.test.mjs`: 9 verdi (1 nuova).
- Controprove: le 66 di `radiografia-in-sessioni` e `radiografia-a-onde`, ognuna rende rossa la sua prova (runner `consegne/audit/2026-11-24-radiografia-a-onde/mutazioni.mjs`; `non-vacuita.mjs --difetti` accetta solo codici AR).
- Guardiani verdi: `agent-registry-check` (drift 0), `mutazioni-orfane`, `mutazioni-senza-esecutore`, `mutazione-vagante --tutti`, `forma-json`, `gate-veri`.
- Il prepasso rifatto sui dati veri del 21/11 (registro prima della #990, sito a `1ad51b4c`): 513 voci agli agenti contro le 459 di allora, nessuna in meno. Le 54 in più sono le voci che le correzioni del collaudo mandano agli agenti nel dubbio.
- Prova a vuoto sul registro di oggi (sito a `0311a90f`): ricontrollo in 4 sessioni, 305 voci su 556 agli agenti, preventivo 69-86-112 $, circa 78 chiusure; lancio in 9 sessioni e 2 onde, pilota S01 S02 S03 circa 93 $, totale atteso circa 444 $.
