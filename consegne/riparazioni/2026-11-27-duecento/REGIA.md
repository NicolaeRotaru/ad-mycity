---
data: 2026-11-27 01:45
tipo: quaderno di bordo della regia
campagna: i 200 del 27/11 (la «prossima ondata» firmata il 24/11 alle 20:30 con «ok 1.200»)
---

# Regia · i 200 difetti del sito

## In parole semplici
Il 27/11 verso l'01:15 Nicola ha chiesto di riparare 200 difetti, «200 esatti».
Questo quaderno serve alla regia per partire senza rileggere la chat.
I 200 sono scelti fra i difetti del sito che si chiudono senza una sua firma, una risposta o un suo gesto.
Per esempio: sono dentro i 40 difetti «normali», tipo il plurale fisso «1 negozi»; restano fuori le 48 voci che chiedono una migrazione del database.

## Cosa cambia per te
Niente finché Nicola non dice «via». Poi le tre onde qui sotto, una dopo l'altra.

## Cosa devi fare
Segui «Il piano», dall'onda 1, solo col via scritto di Nicola.

## Cosa non ho verificato
La quota vera: l'avviso del limite settimanale è acceso, e la percentuale la vede solo Nicola in app.
Il costo dei delicati senza ultracode: non è mai stato misurato, lo misura il pilota dell'onda 1.

## Dettagli tecnici

- ⛔ **FERMA dal 2026-11-27 01:40, non si apre.** Al «A» di Nicola l'AD ha trovato la campagna `2026-11-26-tutti` (ramo `ccr-a672a2b3-92w5w1`, ad-mycity#1032 e mycity#342 in bozza): ha già lavorato 386 voci, e 199 dei 200 qui sono fra quelle (39 si chiudono con la #342, 11 già riparate, 79 restano aperte, 70 nel suo perimetro senza esito). Il tetto «ok 1.200» del 24/11 l'ha usato lei: circa 995 $ le onde 1-3 più circa 101 $ le riservate. Il registro di main (554 aperti) non porta ancora le sue chiusure. Una campagna nuova si fa dalla sua integrazione (mycity `ccr-a672a2b3-92w5w1` @ 932163a9, meglio dopo l'unione della #342) e con un tetto nuovo di Nicola.

- AD: session_015BmpnWXi7guL4RmfTAwzbU (le fermate vanno lì con send_message). Modalità auto.
- Ramo di ad-mycity: `ccr-819e0c8d-7ryjjr`. Ramo del sito per l'integrazione: lo stesso nome.
- Base del sito: `main` @ a07c5b387c64309091e937db8ae28813673d5ed4 (SHA intero in source_revision).
- Registro: 554 aperti (27/11 00:19, dopo il ricontrollo del 26/11 e le chiusure della mycity#315).
- Perimetro: 375 lavorabili (4 bloccanti, 36 gravi, 335 minori) · fuori 96 riservate, 64 domande, 19 senza percorso.
- Senza Nicola (`senza-nicola.mjs`): 315 · fuori 48 con migrazione, 8 scelte, 4 non codice.
- Filtro sul testo (`filtro-delicati.mjs`, regola 4 del 21/11): 275 delicati (3 bloccanti, 26 gravi, 246 minori) · 40 normali.
- I 200 (`scelta-200.mjs`, `chiavi-200.txt`): 40 normali + 20 pilota (minori delicati a rotazione fra le dimensioni, senza file in comune coi normali) + 140 dell'onda 2 (29 gravi e bloccanti, poi 111 minori in ordine di impatto: qa-flussi 55, privacy-legale 25, pagamenti-stripe 23, flussi-conversione 5, sicurezza-auth 3). Fuori dai 200: 115 (`chiavi-fuori-dai-200.txt`).
- Onda 1 (`onda1/`, `dividi --per-sessione 12`): 5 sessioni, 59 voci, nessun grave. Il pilota è mescolato: 3-5 voci delicate per sessione. Il suo costo per chiuso si misura a quota di voci, e va detto così. 1 voce (il plurale «1 negozi») passa all'onda 2.
- Onda 2 (`onda2-prova/`, solo prova sulla base): 9 sessioni, 95 voci (7 sessioni con gravi), 46 all'onda 3. Si rifà da capo con `dividi --base <SHA dell'integrazione dell'onda 1> --per-sessione 16`.
- Schede: non ancora scritte (servono id e ramo della regista). `schede --cartella <C>/onda1 --ramo ccr-819e0c8d-7ryjjr --regista <id>`, poi `copertura-prima` e `segnaposti`.
- Preventivo: `preventivo.json` (650-1.200 $, atteso 915 $; 80-105 chiusi, atteso 90; circa 10 $ a chiuso).

## Il piano (si parte col via di Nicola, un'onda alla volta)
1. Onda 1: 5 riparatori senza ultracode, `effort: "xhigh"`, `permission_mode: "auto"`, 2 collaudatori, 1 controllore. Alla fine il costo per chiuso del pilota: sopra 12 $ l'onda 2 non parte senza un sì nuovo di Nicola.
2. Onda 2: dall'integrazione dell'onda 1. Ultracode solo nelle sessioni con gravi o bloccanti (regola 5 del 15/11).
3. Onda 3: le voci rimaste per file in comune, poi il giro di correzione su bocciate, parziali e file altrui (regola del 14/11).
4. Unione, PR del sito in bozza, controllore finale, registro con `chiudi-sito.mjs` dopo l'unione di Nicola.

## Regole da tenere
Tetto 1.200 $ (Nicola 24/11 20:30): non si alza a metà. Regie che passano la mano a 400 mila token (firma del 24/11). Lotti al massimo da 16. Niente id di altre voci nei commit. Controllo a 10 minuti di tutte le figlie. Riga in `cervello/riparazione/misure.json` a fine onda. Voci che chiedono Nicola: da parte, senza fermate (24/11 17:23).

## Scelte di Nicola
- 2026-11-27 01:15 Nicola: «Riesci a riparare 200 difetto adesso, e dico 200 esatti». Preparato; aspetta la risposta alla fermata 1 (strada A o B, e la percentuale del limite).
- 2026-11-27 01:35 Nicola: «A». La percentuale non l'ha data. Non eseguita: la preparazione si sovrapponeva alla campagna del 26/11 e il tetto era già speso (vedi sopra). Detto a Nicola con la correzione.
