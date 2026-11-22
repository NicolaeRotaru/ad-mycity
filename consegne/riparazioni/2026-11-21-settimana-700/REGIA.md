# Regia · settimana dei 700 (aperta 2026-11-21 14:00)

## In parole semplici
Questo quaderno serve a riprendere la settimana dei 700 senza rileggere la chat.
Il 21/11 alle 15:20 Nicola ha dato un tetto di 1.200 $ e le due firme.
Ha anche detto sì al ricontrollo, che parte prima delle riparazioni.
Il ricontrollo guarda 459 voci con 4 sessioni, per circa 169 $.

## Cosa cambia per te
Niente sul sito: il ricontrollo legge e basta.
Le voci che risultano sparite si chiudono senza pagare una riparazione.

## Cosa devi fare
Niente, finché la regia non ti scrive in chat.

## Cosa non ho verificato
Quante voci risulteranno sparite: lo dicono i referti delle 4 sessioni.

## Dettagli tecnici

- Regista: session_015BmpnV6hh4YTsgDkt8stTW, ramo `claude/stoic-ride-btlf2d` (memoria della notte, fino all'unione di ad-mycity#988).
- Base del sito: `main` @ 1ad51b4c (unione di mycity#300). Deposito del sito aggiunto alle 14:00.
- Perimetro (2026-11-21 14:00): 749 aperti · 577 lavorabili (4 bloccanti, 55 gravi, 518 minori) · fuori: 88 riservate, 67 con domanda, 17 senza percorso.
- Divisione onda 1 a 16 voci: 12 sessioni, 192 voci; 385 alle onde dopo. Da rifare separando i delicati (regola 4 del 21/11) prima del via.
- Preventivo del programma: 3,88 $ a voce lavorata · stima 2.241 $ · tetto 2.913 $ · massimo 4.492 $.
- Quota alle 14:00: `allowed_warning`, rinnovo 26/11 alle 10:00.

## Scelte di Nicola (21/11 15:20)
- Il tetto della settimana è 1.200 $.
- Le firme a e b sono date.
- Prima si fa il ricontrollo, circa 450 voci. Poi si riparano le voci ancora vere.
- Dettagli riservati ricevuti in chat dalla 10.0 alle 13:58: restano solo in chat.

## Fermo su
- Niente: si apre il ricontrollo.
- 2026-11-21 15:40 Nicola: «Sì, parti con 169 $» per il ricontrollo (4 sessioni, ultracode perché ognuna ha dei gravi).
- 2026-11-21 15:25 aperte S01, S01b, S01c, S01d (ricontrollo, ultracode attivo, stima 169 $). Sorveglianza: send_later ogni 30 min, `node cervello/radiografia-sessioni.mjs sorveglia --cartella consegne/radiografia/2026-11-21-ricontrollo --onda 1`.
- 2026-11-21 16:11 S01b finita (120 voci: 31 non più vere, 3 gravi chiusi da riverificare in un'altra sessione). S01d finita alle 15:53 (99 voci: 25 non più vere), 16,81 $.
- 2026-11-21 16:14 tutte e 4 finite: 114 non più vere (6 gravi confermati), costo 104,72 $ su 169. Prossimo: controllore finale CF.
- 2026-11-21 16:35 CF finito: 3 gravi di S01b confermati, 117 chiusure scritte nel registro (749 → 632). Dettagli di alcune falle tolti dai referti nella cartella; restano nella storia dei rami pubblici: decide Nicola. Difetto nuovo da registrare: rimborso del negozio «1.250,00» → 1,25 € (ReturnRequestCard.tsx:116 e :147).

## Regia seconda (session_015BmpnWf7s8MAmqD6Xbh5ap, presa la mano 2026-11-21 19:30)
- Sito clonato a `main` 1ad51b4c. Dettagli riservati ricevuti in chat dalla regia prima alle 19:20: solo in chat.
- Perimetro nuovo (19:35): 632 aperti · 463 lavorabili (4 bloccanti, 46 gravi, 413 minori) · fuori 88 riservate, 65 con domanda, 16 senza percorso.
- Filtro dei delicati sul testo (regola 4): 281 delicati (tutti i 50 gravi e bloccanti + 231 minori su soldi, dati, permessi, annulli, privacy) · 182 semplici. Due cartelle: `normali/` e `delicati/`.
- Divisione a 16 voci: normali 12 sessioni, 150 voci (32 alle onde dopo) · delicati 12 sessioni, 168 voci (4 bloccanti, 41 gravi; 113 alle onde dopo). Le due partono una dopo l'altra: i delicati si ridividono dall'integrazione dei normali (numeri R e fasce di migrazione oggi coincidono).
- Preventivo dalle righe di misure.json con la stessa configurazione:
  - normali, ultracode spento, regia corta (onde 7, 8, giro 1 e 4 dell'onda 9): circa 370 $ (300-480), circa 68 chiuse, circa 5,5 $ a chiusa (4,4-8).
  - delicati, ultracode acceso (giro 3 e 5 dell'onda 9): circa 570 $ per 168 voci, circa 34 chiuse, circa 17 $ a chiusa → sopra 12 $, decide Nicola.
  - Sessione riservata: tetto 25 $. Tetto della settimana 1.200 $, spesi circa 130 $.
- `conti --preventivo` (solo l'ultima riga, giro 5 ultracode): 3,88 $ a voce, 707 $ sui normali: non usato, configurazione diversa.

## Fermo su (dalla regia seconda)
- Risposta di Nicola sulla riservatezza dei rami (storia del ramo della regia e dei 4 rami del ricontrollo).
- Via di Nicola sul preventivo. Nessun riparatore aperto.
- 2026-11-21 23:15 Nicola: riservatezza «scegli tu» → strada b; preventivo «inizia con le 182 semplici». Cancellazione dei 5 rami laterali rifiutata dalla sessione (403): la fa Nicola. Regia seconda 5,08 $, passa la mano a 250 mila token (PASSAGGIO-3.md).

## Regia terza (session_015BmpnZUjbtZs5V56c5GPWN, presa la mano 2026-11-21 23:30)
- Sito clonato a `main` 1ad51b4c. Iscritta alla PR #990.
- 2026-11-21 23:40 schede `normali/` (12 sessioni, 150 voci): schede, copertura-prima, segnaposti verdi. SHA_REGISTA = 12fa1dde.
- 2026-11-21 23:45 apertura R01-R12 (base 1ad51b4c, rami `-m01`…`-m12`, xhigh, auto, senza ultracode). Tetto del giro 480 $ (`stima_usd` 370).
- 2026-11-22 00:25 piano R01 approvato; R01-010 (permessi) tolto: va ai delicati con ultracode.
- 2026-11-22 00:28 piani R02 e R03 approvati; tolte R03-016 (permessi) e R03-005 (ciclo cancellazioni account): ai delicati.
- 2026-11-22 00:30 piano R04 approvato; tolta R04-008 (giorni del reso → rimborso): ai delicati. R04-005/009 (sole prove): rimessa con --base sul commit prima della correzione, se no parziale.
- 2026-11-22 00:31 piano R05 approvato; tolta R05-004 (totale lordo ordine): ai delicati.
- 2026-11-22 00:33 piano R06 approvato; tolte R06-010 (documento d'identità): ai delicati; R06-008 (ritiro in negozio, quarto giro): a Nicola.
- 2026-11-22 00:34 piano R07 approvato; tolta R07-008 (annullo ordine, merce rimessa in vendita): ai delicati.
- 2026-11-22 00:35 piano R08 approvato; tolta R08-002 (filtro dati personali del filmato): ai delicati.
- 2026-11-22 00:36 piano R09 approvato; tolta R09-010 (oscurare dati personali nei log): ai delicati.
- 2026-11-22 00:38 piano R10 approvato; tolta R10-002 (stato «verificato» documenti fattorino): ai delicati. R10-016 solo la lettura unica, force-dynamic resta.
- 2026-11-22 00:39 piano R11 approvato senza tolte (12 voci).
- 2026-11-22 00:40 piano R12 approvato senza tolte (14 voci). Tutti e 12 i piani approvati: 11 voci tolte (10 ai delicati, R06-008 a Nicola). Sorveglianza: send_later 01:09.
- 2026-11-22 00:58 R11 finita (7 riparati, 2 già, 1 parziale, 2 file altrui, 5,27 $). valida-referto verde. guardia rossa solo su tests/unit/cercare-per-pertinenza-non-e-ordinare-per-data.test.ts (+1 riga attesa per R11-009, importa solo griglia-prodotti e l'aiuto finto-postgrest): accettata dalla regia, da ricontrollare con prova-unione. Aspetta il collaudo.
- 2026-11-22 01:00 R09: deroga della regia sulla prova comune minori-s02-freno-della-veloce.test.ts (R09-006, nascita 22:45 invece di 20:45: la prova fissava il difetto). R09-005 senza toccare prove comuni.
- 2026-11-22 01:02 R01 finita (4 riparati, 4 file altrui, 1 già, 1 parziale, 1 non_fatto, 12,00 $), testa ad49df0d, punta bed546a4. Segnala una falla riservata nuova: dettagli solo in chat, alla sessione riservata.
- 2026-11-22 01:12 K01 aperto (R01, R06, R11). Rossi a R03 (referto) e R12 (prove comuni) mandati. Regia terza a 303 mila token: passaggio in PASSAGGIO-4.md.

## Regia quarta (session_015BmpnZUFb1f4oPiVC94n2Z, presa la mano 2026-11-22 01:40)
- Sito clonato a `main` 1ad51b4c. Iscritta alla PR #990. Dettagli riservati ricevuti in chat dalla regia terza: solo in chat.
- 2026-11-22 01:45 sorveglianza: 7 riparatori finiti e verdi (R01 R02 R04 R05 R06 R07 R08). Aperti K02 (R02 R04 R05) e K03 (R07 R08 R09). Rossi mandati: R10 (unione nel ramo, titolo della falla riservata), R12 (terza prova comune), R03 (fermo: R03-007 al giro di correzione o firma).
- Firme da chiedere a Nicola prima di F3: `prove_comuni` onda 1 (R09, R11, ed eventuale R12); `rimessa_a_mano` (R04-005, R04-009); `id_nel_commit` su 3cc4248 se 006/007 reggono.
- 2026-11-22 01:50 finiti anche R02 (11 riparati, 23,44 $), R04 (7, 19,95 $), R05 (1 riparato, 5 parziali, 19,94 $), R07 (6, 22,92 $), R08 (6, 22,94 $). #990 unita da Nicola (squash): `main` unito nel ramo, disiscritta.
- R10: unione nel ramo per un push rifiutato; togliere l'unione è una spinta forzata → chiesto il permesso a Nicola. R12: R12-012 ora serve_file_altrui (prova comune rimessa), prova_tipo onesto voce per voce.
- Da fare in F3 dalla regia: R08-009 (`git mv` della prova zz-collaudo, guardia la legge come cancellazione); le modifiche ai file altrui scritte nei referti vanno al giro di correzione.
- Riservati nuovi arrivati in chat (R03, R08): solo in chat, per la sessione riservata.
- 2026-11-22 01:55 Nicola: «sì a R10» (spinta forzata del ramo -m10, solo quella). Girato a R10.
- 2026-11-22 01:56 R12 finita (9 riparati, 2 parziali, 2 file altrui, 1 già, 18,69 $, punta bfe3ab52). Aperto K04 (R03, R12; R10 glielo mando quando finisce).
- 2026-11-22 01:59 K03 finito (valida-collaudo verde): R07 4 reggono, R08 3, R09 3; bocciate 8 (R07-001, R07-007, R08-001, R08-003, R08-006, R08-010, R09-006, R09-008) tornate ai riparatori per un giro di correzione, poi di nuovo K03.
- 2026-11-22 02:02 R10 finita (7 riparati, 4 parziali, 22,96 $). La spinta forzata permessa da Nicola è rifiutata dalla guardia automatica della sessione R10: strada senza forzare, ramo nuovo -m10b con la storia in fila, scritto in sessioni.json. R07 fa il giro di correzione in sessione (6 subagenti finiti).
- 2026-11-22 02:03 R10 su -m10b (punta 9b0efd5d, testa 38a1e1ac): guardia-ramo e valida-referto verdi rilanciati dalla regia. Passata a K04. Tutti e 12 i riparatori finiti.
- 2026-11-22 02:06 K02 finito (valida-collaudo verde): R02 7 reggono, R04 6, R05 1. Al giro di correzione: R02-001, R02-004/013, R02-009, R04-010, R05-002, R05-005 (solo referto), R05-007; poi di nuovo K02.
- 2026-11-22 02:08 K01 finito (valida-collaudo verde, 15,81 $): R01 3 reggono, R06 2, R11 3. Al giro di correzione: R01-006 (pulsante reclamo allineato al server), R01-011, R11-005, R11-007, R11-009, R11-010, R11-011, R11-012; poi di nuovo K01. Prova comune di R11 accettata dal collaudo (cambia solo l'attesa di R11-009).
- 2026-11-22 02:17 R07 giro chiuso (punta c9a78a95, 26,30 $): K03 lo ricollauda, R07-007 regge, campione R07 accettato (5 su 5). R05 giro chiuso (punta 00ea2092, 22,11 $), verificato dalla regia, a K02.
- 2026-11-22 02:18 R02 giro chiuso (001 riparato; 004/013 e 009 parziali, 26,13 $). Scelta della regia: togliere il blocco di 120 s dell'avvio (toccava ogni negozio a ogni applicazione; la gara rara c'era già alla base). Cura intera con colonna nuova in fascia 641-649 → migrazione da portare a Nicola.
- 2026-11-22 02:20 regia quarta a 360 mila token (10,61 $): passaggio in PASSAGGIO-5.md.
- 2026-11-22 02:21 aperta la regia quinta (session_015BmpnXD1kFQo49GpQXkHw9); dettagli riservati mandati in chat; R01-R12 e K01-K04 avvisati di scrivere a lei.

## Regia quinta (session_015BmpnXD1kFQo49GpQXkHw9, presa la mano 2026-11-22 04:00)
- Sito clonato a `main` 1ad51b4c. Sessione riavviata una volta all'inizio: i messaggi delle figlie arrivati prima del riavvio letti dalle loro trascrizioni.
- 2026-11-22 04:00 sorveglianza: rossi noti R03 (referto, R03-007), R09 e R11 (prove comuni, firme di Nicola), K01 (valida-collaudo su R11-005, manca la prova rimessa), K02 (guardia: file del sorvegliante nella storia del ramo). prova-unione verde.
- K04 finito (valida-collaudo verde, 33 voci): R03 reggono 3, R10 4, R12 5; non reggono R03-001, R10-006/014/016, R12-011; rompe altro R12-009; il resto parziale.
- 2026-11-22 04:05 mandati: giro di correzione a R03, R10, R12 (bocciate + parziali, tetto 35 $); secondo collaudo a K01 (R01, R11), K02 (R02, R04, R05, su ramo nuovo -k02b), K03 (R08, R09). R11 autorizzata ad applicare la cura di due righe su R11-005. Prossima sorveglianza 04:30.
- 2026-11-22 04:10 K02 non può spingere su altri rami: rosso della guardia di K02 accettato dalla regia (diff netto 12fa1dde..punta = solo collaudi/K02.json; il ramo non si unisce, all'unione si copia solo quel file). K02 resta su -k02.
- 2026-11-22 04:15 arrivati in coda (dopo il riavvio) 19 messaggi: dettagli riservati della regia quarta ricevuti (solo in chat); K02 aveva già ricollaudato R05 (R05-007 regge). R10: sesto subagente finito, concesso un settimo col modello piccolo per il giro di correzione (tetto 35 $ invariato). R12 riusa un subagente già aperto.
- Per la fermata 2: testo proposto da R08 per il GLOSSARIO-KPI (file di Nicola, va proposto, non scritto); R04-010 passa a parziale e chiede rimessa_a_mano come 005 e 009; migrazione nuova 662 (R04).
- 2026-11-22 04:20 K02 secondo collaudo finito (valida-collaudo verde; campioni R02 8/8, R04 6/6, R05 1/1): R02-001 regge; R02-004/013, R02-009, R04-010, R05-002/005 parziali; blocco di 120 s dell'avvio tolto davvero. Gruppo K02 chiuso. Guardia di K02 rossa solo per la storia (accettato 04:10).
