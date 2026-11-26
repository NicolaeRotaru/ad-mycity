---
data: 2026-11-26 14:25
tipo: quaderno di bordo della regia
campagna: tutti i difetti del sito che non chiedono Nicola (26/11)
---

# Regia · tutti i difetti senza Nicola

## In parole semplici
Questo quaderno serve a ripartire senza rileggere la chat. Nicola il 26/11 ha chiesto di lavorare tutti i difetti
che non chiedono lui, senza fermate né richieste di approvazione, rimettendo nel giro anche i difetti nuovi.
La regia è la sessione che parla con lui. Il tetto è 1.200 $ («ok 1.200» del 24/11 alle 20:30).

## Cosa cambia per te
Niente: lavora la macchina. L'unione della richiesta sul sito resta tua.

## Cosa devi fare
Niente.

## Cosa non ho verificato
La percentuale del limite settimanale (la vede solo Nicola). I costi sono `usage.cost_usd` letti a turno chiuso.

## Dettagli tecnici
- Regia e AD: session_015BmpnXuogkPZVts89PH67a (questa sessione). Ramo ad-mycity e sito: `ccr-a672a2b3-92w5w1`.
- Base del sito: main @ ed12ed8ec8190e1132b690f6e034c30f0a5d55ba. Clone in /home/user/mycity.
- Analisi e strategia: `STRATEGIA.md`.
- Radiografia in corso (session_015BmpnXAVwPhPT7aWRMXdMi): ricontrolla 272 voci (`ricontrollo-radiografia.txt`),
  tetto 100 $. Le sue voci non entrano nell'onda 1: entrano dopo il suo esito, tolte quelle che chiude.
- Registro alle 13:50: 598 aperti · 424 lavorabili · fuori 89 riservate, 65 domande, 20 senza percorso.
  Lavorabili: senza Nicola 362 (176 libere + 186 in ricontrollo) · con migrazione 48 (28 + 20) · per Nicola 14.
  File: `chiavi-<senza|migrazione|per-nicola>-<libera|ricontr>.txt`.

## Regole di questa campagna (Nicola 26/11: «senza chiedere approvazione»)
1. Nessuna fermata. Quello che chiede Nicola va in `per-nicola.md` e il giro continua.
2. Tetto 1.200 $ rigido. Non si alza da sola. A 1.100 $ misurati non si apre più niente: si chiude quel che c'è.
3. Niente ultracode (non si accende: comando come testo). Riparatori 12-16 voci, limite 25 $ con gravi, 20 $ minori.
4. Collaudo: due lenti solo su gravi, bloccanti e soldi/dati/permessi; un controllore per unione.
5. Firme mai chieste: prova comune o codice di un'altra voce → la voce va a `scelta_di_nicola`, si passa oltre.
6. Migrazioni: onda a parte per le 48, al massimo 15 per richiesta (il rilascio ne applica 20 alla volta).
7. Dopo ogni unione: giro di correzione con parziali, file altrui, bocciate e nati senza Nicola (Nicola, 26/11).
8. SHA interi in source_revision. Controllo a 10 minuti con list_sessions. Riga in misure.json a fine giro.

## Il piano
1. Onda 1: 116 voci delle 176 libere, R01-R11 (`onda1/`), poi K01-K04, unione, C01.
2. Onda 2: le 60 libere rimaste + le voci della radiografia rimaste aperte + giro di correzione dell'onda 1.
3. Onda 3: le 48 con migrazione (al massimo 15 migrazioni a richiesta) + correzioni + nati.
4. Avanti finché restano solo le voci per Nicola o finisce il tetto.

## Stato
- 2026-11-26 14:25 onda 1 preparata: perimetro, dividi a 16, schede, copertura-prima, segnaposti verdi.
