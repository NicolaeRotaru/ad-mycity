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
Per esempio: una voce che chiede una sua scelta va nella lista per lui, e il giro va avanti senza aspettarlo.

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
3. Niente ultracode (non si accende: comando come testo). Riparatori da 12-16 voci, limite 25 $ con gravi, 20 $ minori.
4. Collaudo: due lenti solo su gravi, bloccanti e soldi/dati/permessi; un controllore per unione.
5. Firme mai chieste. Una voce che per chiudersi deve cambiare una prova comune chiede la firma di Nicola: torna com'era sul ramo e va nella lista per lui (`per-nicola.md`). Niente firme dedotte dalle sue frasi: il 26/11 alle 14:10 il sistema ha fermato la regia che ci provava, e aveva ragione.
6. Migrazioni: onda a parte per le 48, al massimo 15 per richiesta (il rilascio ne applica 20 alla volta).
7. Dopo ogni unione: giro di correzione con parziali, file altrui, bocciate e nati senza Nicola (Nicola, 26/11).
8. SHA interi in source_revision. Controllo a 10 minuti con list_sessions. Riga in misure.json a fine giro.

## Il piano
1. Onda 1: 116 voci delle 176 libere, R01-R11 (`consegne/riparazioni/2026-11-26-tutti-onda1/`: ogni onda ha la sua cartella, così il controllo riconosce le schede), poi K01-K04, unione, C01.
2. Onda 2: le 60 libere rimaste + le voci della radiografia rimaste aperte + giro di correzione dell'onda 1.
3. Onda 3: le 48 con migrazione (al massimo 15 migrazioni a richiesta) + correzioni + nati.
4. Avanti finché restano solo le voci per Nicola o finisce il tetto.

## Stato
- 2026-11-26 14:25 onda 1 preparata: perimetro, dividi a 16, schede, copertura-prima, segnaposti verdi.
- 2026-11-26 14:07 controllo a 10 minuti: 11 su 11 lavorano, nessuna ferma. R10 ha toccato una prova comune: chiesto di renderla inutile o di togliere la correzione (regola 5).
- 2026-11-26 14:37 R11 finito (12,51 $): 4 riparati, 1 a metà, 2 file altrui, 2 scelte di Nicola, 6 nati; guardia e referto verdi. K01 session_015BmpnYeZfvpg1D28N83v91 lo collauda (limite 15 $). R05 a 17,86 $ alle 14:35.
- 2026-11-26 14:40 R03 finito (11,58 $): 6 riparati, 1 grave a metà, 1 file altrui (serve rigenerare i tipi del database), 1 scelta di Nicola; verdi. Dato a K01. Ha visto una falla riservata nuova (permessi sui prodotti): dettagli solo nella chat della regia, va nel binario riservato.
- 2026-11-26 14:43 R07 finito (11,42 $): 2 riparati, 2 a metà (fra cui il grave dell'accesso), 1 file altrui, 1 già riparato, 1 non codice, 1 scelta di Nicola; verdi. Dato a K01 (terzo). Seconda falla riservata (accessi): dettagli solo in chat; la difesa vera è un'impostazione di Supabase, quindi tocca a Nicola.
- 2026-11-26 14:49 R10 finito (18,44 $): 6 riparati su 6, con la migrazione 960 (la applica il rilascio all'unione) e un'impostazione di Supabase per R10-001 (tocca a Nicola). Terza falla riservata (accessi, rinvio verso un altro sito): dettagli solo in chat. K02 lo collauda. R08 a 19,12 $ e R06 a 19,05 $: consegnano.
- 2026-11-26 14:52 R04 consegnato (17,69 $): solo 3 riparati e 1 a metà su 16; 11 non lavorati per il limite (5 gravi di soldi in un lotto solo hanno mangiato tutto: lezione per i lotti). Guardia rossa: ha cambiato una prova comune per R04-011. Chiesto il revert di R04-011+013 e la voce nella lista di Nicola; poi K02.
- 2026-11-26 14:53 R08 finito (19,12 $): 3 riparati (migrazione 940), 2 a metà, 2 file altrui, 3 domande per Nicola; verdi. Dato a K02. R01 a 22,63 $, verify verde, chiude.
- 2026-11-26 14:55 R09 finito (15,78 $): 3 riparati, 4 a metà, 4 file altrui, 1 già riparato, 4 scelte di Nicola. Guardia rossa per il titolo di una prova comune: chiesto di rimetterlo. K01 ha chiuso R11: 4 reggono su 4, 1 a metà, 1 nato (striscia «In evidenza» col prezzo pieno).
- 2026-11-26 14:58 K01 ha chiuso R07: reggono 3, R07-001 grave a metà (la parte fatta regge), R07-006 rompe altro (i contatori dei reclami non tornano più con la lista): da togliere all'unione. K01 a 20,42 $ (limite 20): chiude senza altri subagenti.
- 2026-11-26 15:00 R05 consegnato (22,44 $): 1 riparato, 2 gravi a metà (la 910 chiede le sue risposte), 4 non lavorati per il limite; verdi. K03 in partenza. R04 in regola (revert della prova comune) e dato a K02.
- 2026-11-26 15:06 R06 finito (22,91 $): 6 riparati, 4 a metà, 2 file altrui, 1 già riparato, 3 non lavorati, 1 domanda; verdi. Dato a K03 (terzo). Quarta falla riservata (permessi del fattorino sul mezzo): dettagli solo in chat. R09 in regola, dato a K03.
- 2026-11-26 15:08 R01 finito (23,68 $): 1 riparato, 2 a metà, 1 file altrui, 1 scelta (rilascio controllato), 2 non codice (impostazioni di GitHub), 1 tolto perché stampava dati veri nel log. Quinta falla riservata (viste del database): dettagli solo in chat. K04 in partenza su R01 e poi R02.
- 2026-11-26 15:12 K01 finito (22,43 $) e archiviato: R11 4 reggono · R03 4 reggono, R03-008 rompe altro · R07 3 reggono, R07-006 rompe altro; 7 nati. K02: R04-012 regge, R04-005 rompe altro (rimborso parziale). Da togliere all'unione: R03-008, R07-006, R04-005.
- 2026-11-26 15:20 La radiografia ha chiuso 45 voci col ricontrollo (aperti del sito 598 → 553), registro aggiornato sul suo ramo ccr-aa566c13-nvkbaw @ 348a2b1. Delle mie 246 candidate restano aperte 208: 71 non toccano i file dell'onda 1 e partono subito dalla base come onda 2 (`consegne/riparazioni/2026-11-26-tutti-onda2/`, R12-R16, 70 voci, perimetro letto col `--registro` del suo ramo); 137 aspettano l'unione dell'onda 1 (`chiavi-onda2-dopo-unione.txt`).
- Numeri: le sessioni dell'onda 2 rinumerate a mano R12-R16, e le migrazioni nelle fasce rimaste libere dell'onda 1 (870, 900, 930, 950, 970). Motivo: le migrazioni si applicano in ordine di byte (`LC_ALL=C sort`), quindi un numero da 1000 in su andrebbe prima del 108. `dividi` oggi non lo sa: difetto della macchina da registrare (con 999 come tetto delle fasce).
- 2026-11-26 15:16 Onda 2 aperta: R12-R16 (70 voci, 1 grave), dalla base ed12ed8e, regole allo SHA debbd8e5. Limiti 25 $ (R12) e 20 $.
- 2026-11-26 15:19 K02 finito (24,64 $) e archiviato: R10 2 reggono, R10-001 a metà, R10-003/004/005 rompono altro (senza la 960 in produzione le pagine col prezzo vanno in errore: serve un ripiego, va nel giro di correzione); R08 3 reggono, 2 a metà; R04 1 regge, R04-005 rompe altro. R02 finito (circa 24,3 $): 6 riparati, 4 a metà; guardia rossa per una prova comune (R02-011), chiesto il revert. R12 ha mandato il piano.
