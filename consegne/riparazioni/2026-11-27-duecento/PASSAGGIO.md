---
data: 2026-11-27 02:25
tipo: passaggio della regia (prima → seconda)
campagna: i 200 risolti del 27/11
---

# Passaggio della regia · onda 1 in corso

## In parole semplici
La regia prima ha aperto i 12 riparatori dell'onda 1 e ha approvato tutti i 12 piani: ora stanno riparando.
Passa la mano perché la sua conversazione è a 356 mila token, vicina al limite di 400 mila firmato il 24/11.
Per esempio: R05 sta riparando i 4 difetti gravi dei bonifici ai negozi, uno per commit, con una prova ciascuno.

## Cosa cambia per te
Niente: la regia seconda riparte da qui senza rileggere la storia della prima.

## Cosa devi fare
Segui «I prossimi passi» qui sotto, dall'1.

## Cosa non ho verificato
Nessun ramo dei riparatori era ancora spinto alle 02:25: la prima guardia-ramo la fa la regia seconda.

## Dettagli tecnici

**Dove siamo (02:25).**
- Sito: base e integrazione `ccr-819e0c8d-7ryjjr` @ main 2ba05a74de2e9ad96fa94178df89711923119b0e. Cartella del programma: `<C>/onda1` (`piano.json`, `sessioni.json`, `schede/`, `regole-campagna.md`). SHA_REGISTA 0c9469a86ac8b72806affe26da791b46c98a9597.
- Le 12 sessioni sono in `onda1/sessioni.json` e sono figlie della regia prima (session_015BmpnYPczqtRmcwQzQzjV6): `list_sessions children=true` della seconda non le vede, usa `get_session` con ogni id.
- Limiti di spesa: R01-R07 25 $, R08-R12 20 $ (al 70% niente lotti nuovi). Niente ultracode, niente migrazioni nuove nell'onda.
- Scelte della regia prima sui piani: un revisore può guardare due gravi insieme, mai mescolati coi minori. Subagenti oltre il tetto di 8 solo a R06 (9) e a R03 (10, col lotto dei minori solo se la spesa è sotto 17 $). R03 lascia apposta `non_fatto` per tetto 001, 004 e 010: vanno nel giro di correzione.
- La spesa di una figlia si legge con `get_session` col suo id scritto: senza id il campo `usage` non c'è. Lo sanno tutte.
- Il registro del 26/11 serve anche ai riparatori e ai collaudatori: lo ricreano fuori dal deposito (comandi in `onda1/regole-campagna.md`) e lo passano con `--registro`.
- Costi alle 02:25: regia prima 16,37 $ (aperture comprese); riparatori fra 0,25 e 0,8 $ l'uno. Limite settimanale `allowed_warning`, senza uso extra, si azzera giovedì 3/12 verso le 10:00.

**I prossimi passi.**
1. Scrivi a ognuna delle 12 figlie, in una riga, che la regista adesso sei tu, col tuo id. Fallo per prima cosa: i referti finiti e i blocchi arrivano a chi c'è scritto nel loro primo messaggio.
2. Sorveglianza: `sorveglia.sh` non passa `--registro`, quindi il suo `valida-referto` dà falsi rossi sulle voci nate il 26/11. Per i referti lancia tu `valida-referto … --registro <C>/registro-26-11.json` (il file va ricreato, comando in REGIA.md). Controllo delle figlie ferme con `get_session` per id, non con `list_sessions`.
3. Collaudatori: 4 (K01-K04, tre riparatori a testa), sessioni su `ad-mycity` a SHA_REGISTA, come nella skill (F2). Nel primo messaggio: il registro del 26/11 e `--registro`; niente ultracode; tetto 30 $.
4. Unione nel ramo `ccr-819e0c8d-7ryjjr` del sito, `npm run verify` e harness SQL, poi C01. Poi giro di correzione (bocciate, parziali, file altrui, i `non_fatto` per tetto) e onda 2 con le 103 rimaste.
5. Da dire all'AD alla prima fermata: il cancello dello stop segnala come «allarme non accodato» le schede in `<C>/onda1/schede/`, perché l'esenzione `eSchedaRisolutore` (cervello/cancello-stop.mjs) non prevede la sottocartella dell'onda. È un difetto della macchina da registrare.
