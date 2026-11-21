---
data: 2026-11-21 02:45
tipo: passaggio di regia
da: «Ondata 9 · 7.0» (session_015BmpnYruq7734YUce72wCa), a circa 400 mila token
a: «Ondata 9 · 8.0»
---

# Onda 9, giro 4: il passaggio alla regia 8.0

## In parole semplici
Il giro 3 è chiuso e unito (mycity#299), e le 6 migrazioni che mancavano sono in produzione.
Il giro 4 è partito alle 02:33: quattro riparatori lavorano su 89 difetti minori, coi piani già approvati.
Alla 8.0 restano la sorveglianza, i collaudi, l'unione, il controllore e la PR.
Per esempio: se R03 o R04 si fermano a metà non si riavviano, perché perderebbero ultracode; si apre una sessione nuova, «R03 secondo».

## Cosa cambia per te
Niente: Nicola scrive alla 8.0 come scriveva alla 7.0.

## Cosa non ho verificato
- Che R04 abbia ultracode acceso: lo dice lui nel piano, io l'ho letto solo su R03.
- Le spese dei riparatori: alle 02:33 erano appena nati.

---

## Cosa devi fare
1. Dire ai quattro riparatori il tuo id: le loro risposte arrivano ancora alla 7.0 finché non lo sanno.
2. Sorvegliare R01-R04 (tetto 35 $ ciascuno), rispondere alle domande, e a «finita» aprire i collaudi.
3. Dopo l'onda 1, la sessione riservata su R03-021 col residuo (i dettagli te li manda la 7.0 in chat).
4. Unione, verify, harness SQL, controllore C04, PR in bozza: come il giro 3 (skill `riparazione`, F3).

## Dettagli tecnici

### Il giro 4 (cartella `onda9/giro4/`, base sito `2d19787b`)
- Firma di Nicola 21/11 02:30: strada A, tetto 250 $ (riparatori 4 × 35, collaudi 60, riservata 25, controllore 10, regia 15 + quella spesa dalla 7.0 sul giro 4 ≈ 3 $). Atteso circa 15 chiusi (circa 18 $ a chiusa, misura del giro 3).
- Perimetro: 89 minori = 69 rimaste aperte dal giro 3 (fuori R03-002 e R03-003 del giro 3, rimandate da Nicola, e R03-021, riservata) + 19 nati del giro 3 + la scorta (ora R01-022).
- Sessioni in `giro4/sessioni.json`: R01 `session_015BmpnYYucAqVBr7nJGfNnu`, R02 `session_015BmpnXTYcNLHuqHCtPy8uw` (xhigh, senza ultracode); R03 `session_015BmpnZ5wA1LkPL3qZuawv1`, R04 `session_015BmpnZLFNqvaVHUjPwSmo6` (ultracode). Se R03 o R04 si fermano a metà, NON riavviarle: «R0N secondo» nuova dalla punta del ramo con prompt `/effort ultracode`.
- R03 e R04 non clonano ad-mycity: manuale, schede e righe del registro stanno sul ramo orfano del sito `claude/adoring-bohr-kixq35-o9g4-manuale` (`9800cb96`), da cancellare a giro chiuso. Gli strumenti di ad-mycity li lancia la regia (guardia-ramo, valida-referto, prova-rimessa a posteriori come fatto per il giro 3).
- Note date ai riparatori: R01-022 (scorta) con la causa del giro 3, la parte in ProductForm.tsx (di R02) come serve_file_altrui; R01-005 Sentry spento per scelta di Nicola; lib/logger.ts di R01 senza toccare l'oscuramento dei testi. R02-012 prova sulla pagina che monta la barra. R03-021 (notifiche) prova con la rilettura che cade dopo i tentativi. R04-008 regola di Nicola: il primo ordine resta nella fascia scelta. A R04 i motivi di K02 su R05-007 e K03 su R04-021 del giro 3. Regola 6 del 21/11 (niente id di altre voci nei commit) girata a tutti.

### Le regole del 21/11 (firmate da Nicola verso le 02:15)
Sul ramo ad-mycity `claude/stoic-ramanujan-p9tmso` (commit 29ccb95), non ancora su main: `git fetch origin claude/stoic-ramanujan-p9tmso && git show FETCH_HEAD:.claude/skills/riparazione/SKILL.md`, sezione «Le regole del 21/11». `cervello/riparazione/misure.json` non va toccato sul nostro ramo finché il loro non è unito.

### Lezioni del giro 3 che valgono per l'unione
- I referti dei riparatori del giro 3 avevano la prova rimessa «manuale»: `applica` vuole `esito: "regge"`, `uscita: 0` e il comando. La regia l'ha rilanciata con `cervello/prova-rimessa.mjs --repo ../mycity` sul ramo unito. Il nato del controllore deve avere una delle tre gravità del registro («medio» non vale).
- Il «Rilascio dopo CI verde» del sito non applica migrazioni (mancano le chiavi Vercel su GitHub): una migrazione nuova va messa col pulsante «Migrazioni a mano» con l'ok di Nicola (APPLICA, quante, ultima), poi verifica in sola lettura.
- Un giro CI rosso sul push per `next/font` (download dei caratteri Google) non è del codice: rilanciare una volta.

### Le spese
Giro 3 chiuso a circa 275 $ (tetto 280). Regia 7.0 a circa 14 $ alle 02:30, quasi tutta sul giro 3.
