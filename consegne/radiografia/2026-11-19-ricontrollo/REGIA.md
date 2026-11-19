---
data: 2026-11-19 02:05
tipo: quaderno della regista
profilo: ricontrollo
base_sito: 336f2fbda9b1b50209fbe94e1f5fde1c74134ab7
stato: fermata 1, aspetta la scelta di Nicola
regia: la sessione dell'AD (session_015BmpnWeqzXygdgmuUPgmu4), finché le sessioni sono una o due
---

# Il ricontrollo del registro del sito: il quaderno della regista

## In parole semplici
Questo quaderno serve a riprendere il ricontrollo del registro dei difetti del sito senza rileggere la chat. Nicola ha chiesto se i difetti aperti sono veri e se ci sono ancora. Nel registro ne restano aperti 741. Di questi, 76 su 741 sono falle riservate: i loro dettagli stanno fuori dal deposito pubblico. Le altre 665 su 741 si possono ricontrollare.

Un esempio: la voce «la cassa dice troppo lontano a chi abita in Via Roma» è un bloccante. Le sue righe nel codice sono cambiate dopo l'ultima conferma, quindi solo un agente può dire se c'è ancora.

## Cosa cambia per te
Niente, finché non scegli la misura. Un programma ha già diviso tutte le 665 voci ricontrollabili senza spendere niente in agenti.

## Cosa devi fare
Scegliere la misura e dire la percentuale del limite settimanale che vedi nell'app (regola ㉗).

## Cosa non ho verificato
Nessuna voce è stata ancora riletta nel codice da un agente. Il programma guarda solo se le righe citate sono cambiate.

---

## Dettagli tecnici

### Fatto
- `prepara --profilo ricontrollo` verde, dopo la regola per `.riparazione/` in `cervello/radiografia/temi.json`.
- Primo passaggio del programma: `prepasso.mjs`, risultato in `prepasso.json` e `prepasso.tsv`.
- Le classi: `fermo` (nessun file citato cambiato dall'ultima conferma) 78 · `righe_ferme` (file cambiati, righe citate no) 215 · `righe_toccate` 320 · `senza_data` 30 · `senza_file` 19 · `file_spariti` 3.
- 59 voci sono «riparate» per le sessioni del 16-17/11 ma restano aperte (collaudo parziale o non regge).
- Onda 9: 200 voci sono sue. 6 riparatori su 10 hanno finito (mycity#297, unita il 18/11): 32 riparate e 13 già riparate prima, non ancora segnate nel registro. Gli altri 4 partono il 19/11 alle 10:05.

### Le misure (stima del programma, regia e controllore finale compresi)
| Misura | Voci | Sessioni | Stima |
|---|---|---|---|
| A · gravi e bloccanti | 64 | 1 | ~77 $ · 2,1 M token |
| B · minori fuori onda 9 che il programma non garantisce | 237 | 2 | ~113 $ · 4,2 M |
| A+B | 301 | 3 | ~135 $ · 5,4 M |
| tutto | 665 | 6 | ~222 $ · 10,3 M |

Con una sessione sola la regia è questa chat: il costo vero di A è sotto la stima.

### Il prossimo passo
Al «via» di Nicola, con il limite rinnovato (rinnovo il 19/11 alle 10:00):
1. Rifare `prepara` sulla misura scelta. Per A e B si usa un registro filtrato (`--registro`), generato da `prepasso.json`: le voci fuori misura prendono lo stato `fuori_misura` solo nella copia.
2. `schede --cartella <C> --ramo ccr-a61110e2-agw8p6 --regista session_015BmpnWeqzXygdgmuUPgmu4`.
3. `copertura-prima` e `segnaposti` verdi, commit, poi le sessioni (skill `radiografia-sessioni`, F1).
4. Fine: `doppioni`, `conti`, `applica --data 2026-11-19` a vuoto, poi `--scrivi`.

La misura B va dopo la chiusura dell'onda 9 nel registro, per non pagare due volte le stesse voci.
