---
data: 2026-11-24 12:48
tipo: passaggio della regia (prima → seconda)
campagna: onda dei 700
---

# Passaggio · dalla regia prima alla seconda

## In parole semplici
La regia prima passa la mano a circa 400 mila token di storia (regola 3 del 21/11: si passa a 250 mila).
I passi 1 e 2 sono partiti. Qui c'è tutto quello che serve per continuare senza rileggere la chat.

## Cosa cambia per te
Le figlie scrivevano alla regia prima. Primo lavoro della seconda: dire a tutte il suo id.

## Cosa devi fare
Segui «I prossimi passi» qui sotto, dall'1.

## Cosa non ho verificato
Il costo dei riparatori a metà lavoro: compare in get_session solo a turno chiuso.
Le firme di Nicola su «prove comuni» e «rimessa a mano»: chieste, non arrivate.

## Dettagli tecnici

**Ids.** Regia prima session_01R8112LxmCk5Y1BXWKNWKCY (da adesso non spinge più). AD session_01R8112Lzth8WvHHrQ4H3whZ.
Riparatori R01-R07 in `normali/sessioni.json`. Ricontrollo in `ricontrollo/sessioni.json` (S01, S01b archiviate).
CF del ricontrollo: session_01R8112KZNkwa12CzqesffGN, ramo `ccr-d7a54140-hak4ez-cf-ricontrollo`, partenza fec3e792c29f55fcdc656bdd4805e193d0b6e506, tetto 12 $.

**Sito.** Si legge col git normale: `git clone https://github.com/NicolaeRotaru/mycity /home/user/mycity`. Mai `add_repo` senza avvisare prima l'AD (Nicola deve cliccare): servirà solo per spingere l'integrazione in F3. main del sito = e67ed29d86a207d58c0faf9afb55f8315bbf9d4a; base dei riparatori = 5b8c786c96ec789918b3e85361ca435cef726b92. Rami del sito col refspec esplicito (`git fetch origin +refs/heads/<ramo>:refs/remotes/origin/<ramo>`).

**Passo 1 (ricontrollo, a main e67ed29).** 141 voci (le 207 con un file cambiato dal 21/11, meno le 66 normali). S01: 120 voci, 14 non_piu_vero (1 grave confermato dal verificatore), 67 ancora_vero, 37 cambiato, 2 non_verificabili. S01b: 21 voci, 0 chiuse. Referti in `ricontrollo/referti/`, doppioni, grezzo (0 difetti) e conti verdi. Costo: S01 36,70 $, S01b 8,94 $.
Il piano del ricontrollo l'ha fatto `prepara` con un registro filtrato (solo le 141 aperte), rimasto nello scratchpad della regia prima: **ad `applica` si passa il registro vero** (quello predefinito del vault).

**Passo 2 (103 normali).** R01-R07 al lavoro dalle 12:31, piani approvati. Correzioni date: R02-009 fa anche «rider → fattorino» nella sua migrazione 832; R05-008 va in serve_file_altrui (la stessa funzione della campanella «ordine pronto»), da chiudere dopo l'unione. R06-008 riparato solo nella scelta del rilascio; R06-009 resta una scelta di Nicola. Tetto 35 $ a riparatore, consegna a 24 $. `campione_fino_a_40_dall_onda: 1` è già nel piano dei normali.

**Domande per Nicola dal ricontrollo:** 7 (3 di S01b, 4 di S01), nei campi `domande_per_nicola` dei due referti. Vanno all'AD alla fermata, raggruppate.

**Costi a 12:48.** Regia prima circa 8 $ alle 12:39 (rileggere `get_session` su session_01R8112LxmCk5Y1BXWKNWKCY per il numero finale). Passo 1: 45,64 $ più il CF. Riparatori: in corso (R01 piano 1,23 $). Tetto rigido dei passi 1 e 2: **360 $**.

## I prossimi passi
1. A ogni figlia aperta (R01-R07, CF ricontrollo) un `send_message`: «la regista adesso è <tuo id>: piani, esiti e domande vanno lì».
2. All'AD lo stato, nei quattro blocchi, coi due costi: il passo 1 finito (14 da chiudere dopo il CF), i 7 riparatori al lavoro, il passaggio, le 7 domande.
3. Quando il CF scrive `ricontrollo/controllo-finale.json` (sul suo ramo): copialo, rifai `conti`, poi `applica --cartella <C>/ricontrollo --data 2026-11-24` a vuoto e poi `--scrivi` (le chiusure del passo 1 rientrano nel via di Nicola).
4. Sorveglianza dei riparatori ogni 30 minuti, catena unica di `send_later`: `MARKETPLACE_REPO=/home/user/mycity bash cervello/riparazione/sorveglia.sh consegne/riparazioni/2026-11-24-onda-700/normali 1`, più `list_sessions`.
5. Collaudatori K01-K03 (ceil(7/3)) appena i riparatori hanno `finita: true` con guardia e referto verdi (F2 della skill), poi unione, C01, applica.
6. Le firme `prove_comuni`/`rimessa_a_mano`, se arrivano, vanno in `normali/piano.json` → `eccezioni_firmate` onda 1, con la frase di Nicola.
7. Riga in `cervello/riparazione/misure.json` a fine giro.
