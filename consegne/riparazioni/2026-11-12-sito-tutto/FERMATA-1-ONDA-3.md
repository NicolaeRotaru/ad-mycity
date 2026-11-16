---
tipo: fermata
data: 2026-11-15 11:30
per: Nicola, poi la regista dell'onda 3
da: AD chat 4 «Ondata 3» (session_015BmpnV65jCuJATqykK8GtB)
---

# Onda 3 del sito: cosa si può fare fino a giovedì, e cosa dopo

L'onda 3 intera non sta nel tetto della settimana. Ne propongo un primo pezzo, misurato.

## In parole semplici
L'onda 3 è il terzo giro di riparazione dei difetti del sito.
Le voci che si possono lavorare senza una tua scelta sono 261.
Con i costi veri dell'onda 2 costerebbero circa 2.030 $, cioè circa due terzi della settimana.
Fino a giovedì alle 10:00 restano circa 215 $ su 350 $, il tetto che hai firmato stamattina.
Quindi propongo un primo pezzo da circa 195 $ su quei 215 $: 66 voci su 261 da riparare, più un collaudo di quelle già riparate.

## Cosa cambia per te
- Fino a giovedì si chiudono circa 30-45 difetti, con una spesa che ha un tetto per ogni sessione.
- Le altre circa 195 voci partono giovedì dopo le 10:00, col limite nuovo e coi costi misurati qui.
- La prova dice anche se dare il file giusto a chi era bloccato funziona: 18 voci su 66 sono di quel tipo.

## Cosa devi fare
- Dirmi la percentuale del limite settimanale che vedi nell'app.
- Incollare il freno sugli agenti in due posti (i blocchi sono sotto, nei dettagli).
- Scegliere se i due riparatori con un grave nascono con ultracode o no.
- Dare il «via», oppure scegliere un'altra misura.

## Cosa non ho verificato
- Il margine di 215 $ è una stima: somma le spese dette dalle sessioni, non quelle che vedi nell'app.
- Il freno non l'ho provato su una sessione vera. Credo che non veda le sessioni aperte con «/effort ultracode», ma non l'ho provato.
- La divisione è una prova su una copia: la campagna vera non è stata toccata.

---

## Dettagli tecnici

**Le voci (da `pronte`, 15/11 11:16, prima che entrino le 7 chiusure di K10).**
- Lavorabili 261: 155 mai lavorate (rimandate dall'onda 2: 2 gravi, 153 minori); A 24 riparate mai giudicate (minori); B 42 `serve_file_altrui` (4 gravi, 38 minori; 1 anche fra le 155); C 41 parziali con file altrui (1 bloccante, 7 gravi, 33 minori).
- Aspettano Nicola: D 85 (4 bloccanti, 22 gravi, 59 minori). Fuori dal perimetro: 88 riservate (binario a parte), 67 domande, 11 senza file.

**Il preventivo dal programma** (`conti --preventivo`, misure.json, fase onda 2 = 7,78 $ a voce lavorata).
- Onda 3 intera, 261 voci: stima 2.032 $, tetto 2.641 $. Con il tasso dell'onda 1 (2,22 $): circa 580 $. In settimana: circa 67% e circa 19% (1% ≈ 30,5 $, da una misura sola).
- Pezzo proposto, 66 voci: 514 $ col tasso dell'onda 2; circa 147 $ con quello dell'onda 1. Il tetto per sessione lo tiene a circa 195 $: se regge, il rischio vero è chiudere meno voci, non spendere di più.

**La divisione simulata** (copia in scratchpad, `dividi --base 67666b3f --file-chiavi <38 B minori> --sessioni 3 --per-sessione 22`, verde):
- R25 pagamenti-stripe, 22 voci (1 grave, 5 di B), migrazioni 490-499;
- R26 privacy-legale, 22 voci (1 grave, 5 di B), migrazioni 500-509;
- R27 ai-endpoints, 22 voci (0 gravi, 8 di B), migrazioni 510-519.
Restano 126 voci per giovedì. Con 2 sessioni: 44 voci, tutte e due con un grave.

**Il pezzo proposto, coi tetti.** K11 (collaudo della lista A, dopo K10) 15 $ · R25, R26, R27 35 $ l'uno, consegna al 70% · K12 (tutte le 66, senza campione) 30 $ · C03 dopo l'unione 20 $ · regista leggera in una sessione sua 25 $. Totale circa 195 $ (circa 6,4% della settimana).
Attese: K11 fra 10 e 18 chiuse; R25-R27 fra 18 (28%) e 29 (44%). Cancello della cucitura, in proporzione a 18 voci B: 7 o più chiuse si allarga, sotto 5 si ferma.

**Il freno, due posti.** In `ad-mycity/.claude/settings.json`, dentro `hooks.PreToolUse`, la voce di `consegne/officina-minima/freno-agenti-da-incollare.md` (comando `node cervello/riparazione/freno-subagenti.mjs`). In `mycity/.claude/settings.json` (oggi senza `hooks`) la stessa voce con `node ../ad-mycity/cervello/riparazione/freno-subagenti.mjs`: lì lavorano i riparatori.
**Il buco probabile.** `freno-subagenti.mjs` legge il ruolo dal primo messaggio (`primoPrompt`). Una figlia con ultracode nasce col messaggio «/effort ultracode» (regola 10 del 14/11): la riga `ruolo-freno:` arriva dopo, quindi quasi certamente nessun tetto. Strade: ultracode spento sui riparatori di questo pezzo (onda 1 senza ultracode: gravi 19 su 65; onda 2 con ultracode: 0 su 19), oppure una correzione del freno prima di partire. Va nel cantiere.

**Prima di dividere davvero.** Aspettare la PR della sessione corta di K10 (…X32Uaq), rilanciare `pronte`, poi `dividi` sulla cartella vera: un'onda divisa non si riscrive.
