---
data: 2026-11-21 06:55
tipo: firme e scelte per Nicola
da: regia 10.0 dell'onda 9 (session_015BmpnZ6sDXhTVpCDMSp2nP)
---

# Onda 9: quello che serve da Nicola per chiudere la notte

## In parole semplici
In breve: le riparazioni della notte sono tutte nella PR in bozza del sito, mycity#300, che è verde.
Per chiuderle servono le tue firme su alcune prove comuni e qualche scelta. Questo foglio le mette in fila.
Una prova comune è una prova scritta in un giro vecchio che protegge una riparazione già fatta: cambiarla chiede la tua firma.

## Cosa cambia per te
Dopo le firme e la tua unione si chiudono circa 46 difetti minori: 34 del giro 4 e circa 12 del giro di correzione.
Nessuna migrazione nuova: non serve l'«ok migrazioni».

## Cosa non ho verificato
- Il sito vero: tutte le prove girano su copie, nessuna sul database di produzione.
- Il conto preciso del giro di correzione: il programma lo fa solo dopo le firme.

## Cosa devi fare
Rispondi con i numeri che firmi, per esempio «firmo 1-6», e con le scelte che vuoi fare adesso.

**Firme sulle prove comuni** (i collaudatori dicono che nessuna è indebolita):
- **1 · Contanti e consegna veloce.** La prova del tetto dei contanti ora conta anche l'euro della veloce.
- **2 · Il finto database.** Due prove vecchie aggiornate di 2 e 5 righe (assistenza e benvenuto in contanti).
- **3 · L'avviso di rimborso.** Due prove ora aspettano che l'email «Rimborso emesso» parta dopo la risposta, non dentro.
- **4 · L'ordine delle migrazioni.** La prova che controlla l'ordine usa lo stesso ordinamento dello script vero.
- **5 · Il finto degli avvisi.** Una prova scritta a mano usa adesso il finto comune: stessi casi, stesso esito.
- **6 · I caratteri del sito.** Tre prove si adattano ai caratteri salvati nel sito invece che scaricati da Google.

**Due correzioni del programma**, da fare in un lavoro a parte (rispondi «sì al programma»):
- Una firma su una prova sospende oggi il controllo su tutte le prove comuni del giro. Deve valere solo per i file che nomina.
- Per le firme 4 e 5 la prova rimessa del programma non si può usare, perché la riparazione è la prova stessa. La deroga «rimessa a mano» oggi vale solo per un altro codice di uscita: va allargata, altrimenti quelle due voci non si chiudono nemmeno con la tua firma.

**Scelte**, quando vuoi:
- **A · Consegna veloce in corso:** oggi conta per 3 ore al massimo. Vuoi una finestra più corta?
- **B · Cassa con carta aperta e non pagata:** deve tenere occupato il fattorino?
- **C · Fattorini per consegna veloce:** la regola del numero massimo di veloci per fattorino (la domanda è nel resoconto di R03).
- **D · Testo da 11 a 12 pixel** nelle pagine pubbliche: va bene?
- **E · Ritorno indietro del sito nei due casi rari:** la strada che chiude tutta la voce tocca quattro prove comuni.
- **F · Migrazione 403, link delle storie vecchie:** cambiarla prima di applicarla, perché oggi li cancella.
- **G · Librerie con falle note:** resend da 3 a 6, zod da 3 a 4; tre di queste girano anche sul sito.
- **H · Reclutamento dei fattorini dal sito:** chiuso per tua decisione del 26/10; una voce lo riaprirebbe.
- **I · Due schermate vere del sito** per la scheda di installazione dell'app (una stretta, una larga).
- **L · Migrazione 640** (carrello in contanti): pronta per un giro dopo, entra solo col tuo «ok migrazioni».
- **M · Sessione riservata:** tre voci da rifare e alcuni difetti nuovi; i dettagli te li do solo in chat.

---

## Dettagli tecnici
- Firme 1-2 (giro 4): R02-006 `c7525734` (`riparazione-r02-contanti-sopra-il-tetto.test.tsx`); R03-013 `82d3d4c4` (`riparazione-r04-assistenza-doppione`), R03-008 `155d11a4` (`riparazione-r04-benvenuto-dopo-i-contanti`).
- Firma 3 (giro5d R02-001): `api-cron-expire-stale-orders.test.ts`, `chi-paga-alla-consegna-sa-che-l-ordine-e-annullato.test.ts`.
- Firma 4 (giro5m R02-001): `le-migrazioni-a-mano-partono-solo-con-la-conferma.test.ts`, più la deroga `rimessa_a_mano`.
- Firma 5 (giro5m R01-006): `minori-s08-avvisi.test.ts`, più la deroga `rimessa_a_mano`.
- Firma 6 (giro5m R01-007): `il-corsivo-del-sito-e-un-corsivo-vero.test.ts`, `riparazione-r10-manifest-nel-head.test.tsx`, `riparazione-r15-la-pagina-non-trovata-non-si-presenta-come-la-home.test.ts`.
- Programma: AR-1192 (`eccezioneFirmata()` in `cervello/riparazione-sessioni.mjs`); `valida-collaudo` apre `rimessa_a_mano` solo con l'uscita 3, mentre `prova-rimessa` esce 2 quando correzione e prova sono lo stesso file.
- Scelte: A = R04-020, B = R04-021, C = R03-019 del giro 4, D = R01-015 del giro 4, E = R02-008 di giro5d, F = R02-003 di giro5m, G = R01-003 di giro5m, H = R01-010 di giro5d, I = R01-009 di giro5m, L = R02-002 di giro5d.
- Le firme vanno scritte in `eccezioni_firmate` dei `piano.json` di giro4, giro5d e giro5m; poi `applica --scrivi` e, dopo l'unione, `chiudi-sito.mjs`.
