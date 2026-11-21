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
