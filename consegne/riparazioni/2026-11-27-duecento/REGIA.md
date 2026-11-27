---
data: 2026-11-27 02:10
tipo: quaderno di bordo della regia
campagna: i 200 risolti del 27/11 (strada B, tetto 3.000 $), seguito della riparazione del 26/11
---

# Regia · 200 difetti risolti, e se si può 400

## In parole semplici
Il 27/11 verso le 02:00 Nicola ha chiesto 200 difetti del sito risolti davvero, «e se riesci 400», con un tetto di 3.000 $.
97 risolti sono già pronti nella riparazione del 26/11 (mycity#342, in bozza): mancano il controllore finale e l'unione di Nicola.
Questa campagna lavora i 320 difetti rimasti che non chiedono Nicola, partendo dal codice di quella riparazione.
Per esempio: i 39 difetti rimasti a metà il 26/11 ripartono dalla correzione già scritta, non da zero.

## Cosa cambia per te
Niente: lavora la macchina. Le unioni sul sito restano di Nicola.

## Cosa devi fare
Segui «Il piano». Il via di Nicola copre tutte le onde dentro il tetto: alle fermate scrivi all'AD e vai avanti.

## Cosa non ho verificato
Che le voci rimaste a metà il 26/11 siano ancora a metà sul codice di oggi: la scheda è un indizio, comanda il codice.

## Dettagli tecnici
- AD: session_015BmpnWXi7guL4RmfTAwzbU (fermate ed esito con send_message). Ramo ad-mycity e sito: `ccr-819e0c8d-7ryjjr`; riparatori `ccr-819e0c8d-7ryjjr-mNN`.
- Base del sito: integrazione del 26/11 `ccr-a672a2b3-92w5w1` @ f1b35670eb1d54d2fbe32f5df25a23745678fad3 (onde 1-3 del 26/11 unite con main alle 01:35). Se il controllore finale del 26/11 cambia l'integrazione, la si unisce nella nostra all'unione dell'onda 1.
- Registro: `registro-26-11.json`, fuori da git perché pesa 11,7 MB: lo ricrei con `git show de5836c5fd91b249cc62f94462c454bb2b49c51a:MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json > <C>/registro-26-11.json` (il registro del ramo del 26/11, con i suoi 41 nati: 646 aperti). Si passa con `--registro`.
- Perimetro (`tutto/`): 466 lavorabili. `lavorabili-ora.mjs`: fuori 97 che si chiudono con la #342, 49 che chiedono Nicola → **320** (1 bloccante, 33 gravi, 286 minori). Di questi 122 lavorati il 26/11 (39 parziali, 30 file altrui, 36 non fatti, 15 riparati senza verdetto, 2 già riparati), 198 mai toccati.
- Le 43 con file di migrazione (`chiavi-con-migrazione.txt`) vanno in un'onda a parte, alla fine: `dividi` dà fasce da 1000 in su e il sito ordina i file per byte (1000_ prima di 100_). Difetto AR-1194. Nelle onde 1-2 **nessuna migrazione nuova**: se una voce la chiede, resta parziale con l'SQL nel referto.
- Onda 1 (`onda1/`, `dividi --per-sessione 16`): 12 sessioni, 174 voci (26 gravi), 103 all'onda 2. Schede da scrivere: `schede --cartella <C>/onda1 --ramo ccr-819e0c8d-7ryjjr --regista <id>`, poi `copertura-prima` e `segnaposti`.
- La preparazione di prima (200 dalla base main, si sovrapponeva al 26/11) è in `superata/`.

## Preventivo (dalle misure: 26/11 senza ultracode 10,3 $ a chiuso, circa 3,3 $ a voce data)
Onda 1 circa 575 $ · onda 2 circa 340 $ · migrazioni circa 170 $ · correzioni circa 270 $ · regia circa 150 $ → **circa 1.500 $** (stima_usd 1500). Chiusi attesi 145-165 sui 320, più i 97 della #342: **circa 240-260 risolti**. 400 si avvicinano solo con le risposte di Nicola (64 domande, 49 voci sue) e il binario riservato (96).

## Il piano
0. Il controllore finale della #342 lo apre l'AD della campagna del 26/11 (session_015BmpnWupeVireM1DyLQB3e), avvisato dall'AD alle 02:10. Non aprirlo tu: segui solo l'esito.
1. Onda 1: 12 riparatori senza ultracode (`effort: "xhigh"`, `permission_mode: "auto"`), limite 25 $ con gravi e 20 $ minori; 4 collaudatori; unione; C01.
2. Giro di correzione dopo ogni unione: bocciate, parziali, file altrui, nati senza Nicola (regola del 14/11 e Nicola 26/11).
3. Onda 2: le 103 rimaste, dall'integrazione dell'onda 1. Poi l'onda delle migrazioni quando la numerazione oltre 999 è decisa (chiedila all'AD).
4. Avanti finché restano solo voci di Nicola o finisce il tetto. PR del sito in bozza, controllore finale, unione di Nicola, `chiudi-sito`.

## Regole da tenere
Tetto 3.000 $ rigido: a 2.250 $ misurati non si apre niente di nuovo senza l'AD. Sopra 12 $ a chiuso lo dici all'AD col numero. Niente ultracode. Lotti al massimo da 16. Niente id di altre voci nei commit. Controllo a 10 minuti con list_sessions. La regia passa la mano a 400 mila token (firma del 24/11). Riga in `cervello/riparazione/misure.json` a fine onda. Voci che chiedono Nicola: in `per-nicola.md`, senza fermate. Ci si ferma solo per la lista «Quando ti fermi» della skill (tranne la conferma fra un'onda e l'altra, già data).

## Scelte di Nicola
- 2026-11-27 01:15 «Riesci a riparare 200 difetto adesso, e dico 200 esatti».
- 2026-11-27 01:35 «A», poi fermata dall'AD: si sovrapponeva al 26/11 (vedi `superata/`).
- 2026-11-27 ~01:55 «No scusa la B. 200 esatti difetti risolti. E se ne riesci cerca di arrivare anche a 400. C'è la puoi fare.» Alle domande dell'AD: tetto **3.000 $**, limite settimanale **sotto il 50%**.
