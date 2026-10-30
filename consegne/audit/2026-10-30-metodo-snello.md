---
data: 2026-10-30 19:45
tipo: analisi
fonte: AD digitale
richiesta: «rianalizza il modo in cui lavori … consumando il minor numero di token possibile» (Nicola, 30/10/2026, sera)
---

# Il metodo snello: le ondate fatte bene, con molti meno token

**In due righe.** Il costo di un'ondata non sta nel riparare: sta nel controllare e nel ricontrollare. Ti propongo otto regole che spostano il primo controllo dagli agenti alle prove automatiche, e un motore nuovo che le applica.

## In parole semplici

Prima un passo indietro: cos'è un'ondata. È un giro in cui fino a cinque squadre di agenti riparano cinque gruppi di difetti del sito, e altri agenti controllano che le riparazioni reggano.

Ho guardato le misure vere. L'ondata del 28/10 ha acceso 54 agenti, e ha riletto in tutto 118 milioni di token. Nell'ondata vera e propria, 27 agenti su 36 controllavano: tre su quattro. Altri 18 hanno lavorato intorno: 10 per vagliare l'elenco dei difetti, 6 per riguardare i file toccati, 2 per collaudare un bloccante.

Il controllo, poi, genera lavoro nuovo. Per il prezzo della consegna e il freno della veloce sono servite 8 ondate, dalla 13 alla 20, più 4 controlli dei file. Dal 29/10 alle 18:16 a stasera il registro del sito è passato da 1.794 a 2.007 voci, e quelle aperte da 848 a 1.005. Eppure, delle 8 voci date per chiuse nell'ultima richiesta, ne reggono 5. Tanti controlli non hanno fermato gli errori: li hanno solo resi più cari.

Anche io costo. Un mio turno, prima di fare qualsiasi cosa, si porta dietro circa 134.000 token: l'ho misurato stasera su 13 turni di questa sessione. È più del doppio di un agente del sito.

I controlli restano, ma cambiano ordine. Prima controlla una prova automatica, che costa zero agenti e non si stanca. Poi un solo collaudatore guarda tutta l'ondata, invece di uno o due per ogni pacchetto.

## Cosa cambia per te

- **Un'ondata da 54 agenti diventa un'ondata da circa 12.** Stima: da 118 milioni di token riletti a 15-25 milioni, cioè da un quinto a un ottavo. È una stima, non una misura: la misuro sulla prima ondata snella e te la scrivo.
- **Le 11 ondate che restano per i gravi** sono 118 difetti gravi o bloccanti, in 55 pacchetti. Col metodo di oggi costerebbero circa 1,3 miliardi di token riletti; col metodo snello, fra 165 e 275 milioni.
- **Le domande arrivano prima.** Esempio vero: il freno che non trova una fascia tiene l'euro della veloce. Era una scelta tua, e l'abbiamo scoperta dopo due ondate. Col metodo nuovo te la chiedo prima di costruire.

## Cosa devi fare

- **Leggere le otto regole e unire la richiesta**, se ti vanno bene. È una modifica al mio manuale, quindi la firma è tua.
- **Dirmi «vai» per costruire il motore snello.** Sono tre pezzi: lo strumento che toglie la correzione e rilancia la prova, il workflow d'ondata col tetto di 12 agenti, e l'agente leggero per le squadre. Stima: costa circa un decimo di un'ondata di oggi. Lo costruisco da solo e lo fa collaudare un agente solo.
- **Spegnere «ultracode», se puoi.** In questa sessione è acceso: mi dice di usare squadre di agenti su ogni lavoro, e che il costo non conta. È il contrario di quello che mi chiedi. È un'impostazione della sessione e non so dirti con certezza dove si spegne. Finché resta accesa, seguo la tua richiesta: lavoro da solo dove posso.

## Cosa non ho verificato

- **Le ondate dalla 13 alla 20 non le ho potute misurare.** I loro registri non ci sono più, perché questa è una macchina nuova. Nessuno aveva scritto il loro conto: è il buco che la regola 8 chiude.
- **Quale conto pesa sul tuo limite settimanale.** Possono essere tutti i token riletti, oppure solo quelli nuovi. Non lo so, e scrivo sempre tutti e due.
- **La stima del metodo snello.** Regge se le prove automatiche prendono gli errori che oggi prendono i collaudatori. La prima ondata snella lo dirà.
- **Il manuale che ogni agente rilegge non l'ho ancora tagliato.** Ha circa 9.800 byte di comandi che stanno già nel menù dei comandi. Ma dieci prove automatiche leggono il manuale, e alcuni comandi stanno solo lì. Lo taglio insieme al motore, con le prove.

## Le otto regole

1. **Una funzione, al massimo due ondate.** Al terzo giro mi fermo e ti chiedo: spesso il grave è una scelta tua.
2. **Prima le scelte, poi il codice.** Le tue scelte aperte te le chiedo prima di costruire. I casi da provare li scrivo prima del codice, per esempio: «sabato sera, negozio chiuso la domenica: l'ordine passa a lunedì».
3. **Prima la macchina, poi l'agente.** Una riparazione vale se la sua prova è rossa sul codice vecchio, verde sul nuovo, e torna rossa se tolgo la correzione. Questo lo fa uno strumento, senza agenti. Poi il controllo completo del sito, una volta per ondata.
4. **Un collaudo per ondata, non per pacchetto.** Un collaudatore guarda tutte le modifiche dell'ondata; due, con lenti diverse, se toccano soldi, dati o permessi. Il suo controllo vale anche come riguardo dei file toccati: niente controlli separati, niente vagli da 10 agenti.
5. **Il vecchio trovato strada facendo va nel registro.** Non apre un'ondata nuova. In ondata si ripara solo quello che l'ondata ha rotto.
6. **Istruzioni precise.** Ogni squadra riceve i file, le righe e il comando della prova, così non esplora. Le squadre usano un agente leggero, coi soli strumenti di lavoro. Tetto: 12 agenti per ondata.
7. **Io per primo.** Comandi raggruppati, file letti a pezzi, niente squadre di agenti per una domanda semplice.
8. **Il conto a fine ondata, misurato, nel referto.** Se un'ondata supera il tetto, mi fermo.

---

## Dettagli tecnici

### Le misure

| Lavoro | Agenti | Con le riletture | Senza le riletture | Fonte |
|---|---:|---:|---:|---|
| Ondata del 28/10 (`--ondata 10` del piano) + vaglio + perimetro + collaudo | 54 | 118.274.378 | 6.277.305 | `consegne/audit/2026-10-28-ondata1-sito-referto.md` |
| Giro B, 29/10 | 37 | 115.096.591 | 5.428.209 | `consegne/audit/2026-10-29-ondata1-giroB-sito-referto.md` |
| Costruzione degli attrezzi, 25/10 (`wf_b3ed64db-62d`) | 26 | 141.564.331 | 5.192.994 | `consegne/audit/2026-10-25-consumo-token.md` |
| Questa sessione, ciclo principale, 13 turni | 1 | 2.039.736 | 127.209 | `node cervello/conto-token.mjs --sessione` su `86dcfbc3…jsonl`; primo turno 133.832 |

- Peso di un turno, 25/10: 141,6 M su 1.059 turni = circa 133.700 a turno; il primo turno pesa 55.611-63.211, il resto si accumula leggendo file e uscite delle prove. In media 41 turni per agente. Le leve sono tre: quanti agenti, quanti turni, quanto pesa il turno.
- Ondate 13-20 (29-30/10): piani `consegne/audit/2026-10-29-ondata1[2-4]-*.json` e `2026-10-30-ondata1[5-9]-*.json`, `…ondata20-freno-veloce.json`; i run sono in `LAVORO-APERTO.md`, Dettagli tecnici. Conto mai registrato; `~/.claude/projects` di questo contenitore ha solo questa sessione.
- Registro del sito: «848 aperti su 1.794» nella voce di STATO del 29/10 18:16; ora 1.005 aperti su 2.007. Chiusure della #265: 5 su 8 dichiarate (restano 1826, 1981, 1986).
- Gravi rimasti: `node cervello/pacchetti-lotto.mjs --sito --gravi` → 118 difetti (110 gravi, 8 bloccanti), 55 pacchetti, 11 ondate da 5.
- La stima snella: 12 agenti × 2,19 M (media per agente del 28/10) × 0,5 (metà dei turni con istruzioni precise) × 0,7 (turno più leggero: 35.000 contro 57.000 al primo turno, stima del 25/10) ≈ 9 M; scrivo 15-25 M per margine. Oggi: 11 × 118 M ≈ 1,3 miliardi; snello: 11 × 15-25 M = 165-275 M.
- Ultracode: acceso in questa sessione (avviso di sistema).

### Il prossimo lavoro, al «vai»

- `cervello/prova-rimessa.mjs` e la sua prova: riporta i file corretti alla base, rilancia le prove della squadra (devono essere rosse), rimette la correzione (devono tornare verdi). Zero agenti.
- `.claude/workflows/ondata-snella.js` e la prova sul motore finto: squadre, un collaudo per ondata (due lenti su soldi, dati e permessi), al massimo un giro di correzione, tetto 12, conto nel risultato.
- `.claude/agents/squadra-sito.md`: sei strumenti (Read, Grep, Glob, Bash, Edit, Write), mansionario corto; iscritto nell'organigramma e nei guardiani. Si carica solo in una sessione nuova.
- Il taglio dei comandi rapidi di `CLAUDE.md` verso `COMANDI.md`. Lì mancano: RAMO UNICO, autofill/procura/mai, `cancello-lotto`, `audit-design`, `MODIFICA-MARKETPLACE`, «ok [n]», «collega [mano]». Da rilanciare: le 10 prove di `cervello/test/` che leggono `CLAUDE.md`.
- Collaudo: un agente `qa` solo. La prima ondata snella: la 21, la cassa che legge gli orari del negozio (voci 1948 e 1949).
