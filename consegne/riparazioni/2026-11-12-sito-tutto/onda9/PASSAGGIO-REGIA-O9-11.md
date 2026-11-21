---
data: 2026-11-21 04:30
tipo: passaggio di regia
da: «Regia onda 9 MyCity 10.0», session_015BmpnZ6sDXhTVpCDMSp2nP (profondità 0)
perche: storia lunga, regola 3 del 21/11 (passare la mano a 250 mila token)
a: «Ondata 9 · 11.0», aperta dalla 10.0
---

# Onda 9, giro 4: il passaggio alla regia 11.0

## In parole semplici
Questo foglio dice alla regia che segue a che punto è il giro 4 dell'onda 9 e cosa le resta da fare stanotte.
I quattro riparatori hanno finito. R01 e R02 sono collaudati. Il collaudo di R03 e R04 è appena partito.
Nicola dorme e alle 04:24 ha scritto: «lavora senza mai fermati risolvendo il maggior numero di difetti». Per esempio: a collaudo finito si unisce, si apre la riservata e si fa il giro di correzione, senza aspettarlo. Le firme e l'unione sul sito restano sue.

## Cosa cambia per te
Niente: Nicola, al risveglio, scrive alla 11.0 come scriveva alla 10.0.

## Cosa non ho verificato
- Che «K02 secondo» sia partito con ultracode acceso: aperto alle 04:25, non ancora controllato.
- Il verdetto di R03 e R04: il collaudo non c'è ancora.
- La correzione di R03 sulla voce R03-018: chiesta alle 04:24, non ancora arrivata.
- Se la PR ad-mycity#988 litiga con main: la CI è verde su `709d7abb`, i conflitti non li ho guardati.

## Cosa devi fare
1. Mettere il tuo id in `giro4/sessioni.json` («regista», la 10.0 in testa a «regista_prima») e scriverlo a R03 e a «K02 secondo». Gli altri hanno finito.
2. Ricevere dalla 10.0, in chat, i dettagli della riservata (mai nel deposito).
3. Sorvegliare ogni 30 minuti con `send_later` (`bash cervello/riparazione/sorveglia.sh consegne/riparazioni/2026-11-12-sito-tutto/onda9/giro4 1`, con `MARKETPLACE_REPO` che punta alla copia del sito). Alle 04:35 un controllo solo: «K02 secondo» è partito e `is_ultracode_active` è true?
4. Alla punta nuova di R03: `valida-referto`, poi la punta a «K02 secondo».
5. A collaudo finito: F3 della skill `riparazione` sul ramo `claude/stoic-ramanujan-p9tmso` del sito. Unione dei quattro rami, `npm run verify`, harness SQL, controllore, PR in bozza. L'unione sul sito la fa Nicola.
6. La riservata dopo l'unione, perché tocca file di R01: tetto 25 $, ultracode.
7. Il giro di correzione: voci bocciate, parziali e `serve_file_altrui`, lotti da 16 al massimo, `dividi` dall'integrazione.
8. Fermarsi solo se il limite settimanale non è più «allowed», o con l'uso extra, o se il costo per chiusa supera 12 $: lì decide Nicola.
9. Tenere pronte per Nicola le domande aperte (sotto) e scrivere a fine giro la riga in `misure.json`, con chiusi e nati uno accanto all'altro.

---

## Dettagli tecnici

### Stato alle 04:30
| Sessione | Id | Esito | Spesa |
|---|---|---|---|
| R01 | `session_015BmpnYYucAqVBr7nJGfNnu` | finita, punta `b25acfc1`, testa `438462e9`; collaudo: 10 reggono su 15, 5 parziali | 25,97 $ |
| R02 | `session_015BmpnXTYcNLHuqHCtPy8uw` | finita, punta `6f6c827b`, testa `adf7ec6e`; collaudo: 9 reggono su 18, 9 parziali (006, 004, 005 scese) | 23,82 $ |
| R03 | `session_015BmpnZ5wA1LkPL3qZuawv1` | finita, punta `6d360986` (referto rosso su R03-018), testa `0617700d`; ultracode | 35,15 $ |
| R04 | `session_015BmpnZLFNqvaVHUjPwSmo6` | finita, punta `44f46f7a`, testa `356502b7`; ultracode | 25,71 $ |
| K01 + «K01 secondo» | `session_015BmpnZ4cmytXiuJNEUHbjF`, `session_015BmpnXJDYTrbKj6zcC9iir` | `collaudi/K01.json` su R02 e R01, valida-collaudo verde (punta `eb6bb115`) | 10,24 + 4,49 $ |
| «K02 secondo» | `session_015BmpnVznX8Z2f413vhALzY` | R04 poi R03, ultracode, tetto 35 $, ramo `-o9g4-k02` | – |

Il primo K02 non è mai partito: la 10.0 gli ha dato un commit di partenza scritto a mano, sbagliato (`ref_not_found`). Ogni SHA di `create_session` si prende con `git rev-parse`, mai a mano.

Costo per chiusa finora: (25,97 + 23,82 + 14,73) $ / 19 voci che reggono ≈ 3,4 $.

### Prove comuni
- Firmate da Nicola (in `giro4/piano.json`): R01-021, R02-009, R02-004, R02-005.
- Non firmate, toccate sui rami: R02-006 (`c7525734`), R03-013 (`82d3d4c4`), R03-008 (`155d11a4`). K01 dice che non indeboliscono niente; all'unione entrano nella PR in bozza con la firma da chiedere.
- Pronte ma non applicate (R04, diff nel referto): R04-016, R04-009, R04-019; R04-010 tocca `prezzi.ts`, non suo.
- La guardia non le ferma per AR-1192: `eccezioneFirmata()` non legge «sessione» e «file». Proposta di cura nella scheda, aspetta il «sì al programma» di Nicola.

### Domande aperte a Nicola
- Firme 3-7: R02-006, R03-013 e R03-008 insieme, R04-016, R04-009 (la vetrina ricordata 30 secondi), R04-019.
- «Sì al programma» per AR-1192.
- Consegna veloce: A = R04-020, la finestra di 3 ore; B = R04-021, la cassa con carta aperta e non pagata.
- R01-015: il testo da 11 a 12 pixel (`text-xs`) va bene?
- R03-019: `VELOCI_PER_FATTORINO` in `lib/ordini/consegna-veloce.ts`, la domanda è nel referto di R03.
- Il messaggio a R01 delle 03:47 l'ha rifiutato lui: R01 ha finito, non serve rimandarlo.

### Decisioni di Nicola di stanotte
- 03:20: la macchina si riaccende a zero difetti aperti, minori compresi; il perimetro è tutto il registro (751 aperti: 669 minori, 77 gravi, 5 bloccanti).
- 04:24: «lavora senza mai fermati risolvendo il maggior numero di difetti».

### Memoria
- Ramo della regia `claude/stoic-ride-btlf2d` (dentro c'è `claude/adoring-bohr-kixq35`), PR in bozza ad-mycity#988, CI verde su `709d7abb`.
- L'AD ha la PR ad-mycity#989 su STATO.md: quando entra in main, nell'unione tenere il suo blocco delle 03:35 sopra quello delle 01:45.
- Spese della regia 10.0: il contatore della sessione non si è mosso per tutto il turno (un turno solo dalle 03:15).
