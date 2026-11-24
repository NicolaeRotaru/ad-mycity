---
data: 2026-11-24 13:25
tipo: passaggio della regia (seconda → terza)
campagna: onda dei 700
---

# Passaggio · dalla regia seconda alla terza

## In parole semplici
La regia seconda passa la mano a 294 mila token di storia, contro un limite di 250 mila.
Il passo 1 è chiuso: 14 voci su 141 ricontrollate si chiudono nel registro vero.
Il passo 2 è a metà: i sette riparatori lavorano, e nessuno ha ancora finito.

## Cosa cambia per te
Le figlie sanno già il tuo id: gliel'ha detto la regia seconda appena sei nata. Non ripeterlo.
Il tuo primo lavoro è il giro di sorveglianza, dalle 13:50.

## Cosa devi fare
Segui «I prossimi passi» qui sotto, dall'1.

## Cosa non ho verificato
La spesa vera dei riparatori: compare in get_session solo a turno chiuso. Le cifre qui sono quelle che hanno dichiarato.
La firma di Nicola su «prove comuni» e «rimessa a mano»: chiesta alle 12:13, risollecitata alle 13:25, non arrivata.

## Dettagli tecnici

**Ids.** AD session_01R8112Lzth8WvHHrQ4H3whZ. Regia seconda session_01R8112LSUYWZ7q4nU6dz1Fa (da adesso non spinge più).
Riparatori R01-R07 in `normali/sessioni.json` (il campo `regista` va messo al tuo id). Nessun collaudatore aperto.
Ramo di ad-mycity: `ccr-d7a54140-hak4ez`. Lo stato completo è in `REGIA.md`, sezione «Fermo su».

**Già fatto, non rifarlo.** Passo 1 chiuso e scritto nel registro (aperte 610). Il CF del ricontrollo e S01/S01b sono archiviati. Le 7 domande del ricontrollo sono già all'AD, insieme alla decisione su R02-009.

**Rossi del giro delle 13:20** (sorveglia.sh, uscita 1):
- guardia «prove_comuni» su R01, R06, R07: prove esistenti che usano file di più sessioni. Senza la firma di Nicola non si uniscono. Se la firma arriva, va in `normali/piano.json` → `eccezioni_firmate` onda 1, con la frase di Nicola. Se non arriva entro la consegna, chiedi a quei riparatori di togliere dal ramo le modifiche a quelle prove e di scrivere il diff esatto nel referto (serve_file_altrui). La regia le applica sul ramo unito prima delle prove: la guardia stessa dice «la tocca solo la regista».
- referti parziali di R03 (esiti vuoti) e R07 (segnaposti «<sha>»): normali a metà lavoro. Alla consegna `valida-referto` deve essere verde.

**Il tetto, rigido: 360 $.** A 13:25 ne sono stati spesi circa 123: 66,69 $ misurati più 55,94 $ dichiarati dai riparatori. Se tutti arrivano alla consegna dei 24 $, i riparatori costano circa 168 $. Quindi K01-K03 (ceil(7/3)) partono con un tetto di 20 $ ciascuno e il controllore C01 con 15 $. Leggi `cost_usd` delle figlie a ogni «finita». Se la proiezione passa 360 $, ti fermi e lo dici all'AD.

**Le regole da tenere.** SHA interi in source_revision. Controllo a 10 minuti anche per collaudatori e controllori. Su collaudatori e controllore aperti, `list_events` (kinds assistant) salvata su file e cercata con grep `mcp__`, mai letta intera. La regia passa la mano a 250 mila token. Il quaderno resta sotto le 80 righe.

## I prossimi passi
1. `get_session` su di te. Metti il tuo id nel campo `regista` di `normali/sessioni.json`, poi commit e push. Non riscrivere a R01-R07 per il cambio: l'ha già fatto la seconda.
2. La sorveglianza: la prima sveglia (un'attività programmata verso di te) arriva alle 13:50. Ogni giro: `MARKETPLACE_REPO=/home/user/mycity bash cervello/riparazione/sorveglia.sh consegne/riparazioni/2026-11-24-onda-700/normali 1`, più `list_sessions`, poi il prossimo `send_later` a 30 minuti. Una catena sola.
3. Appena un riparatore manda «finita» con guardia e referto verdi, lo dai a un collaudatore (F2 della skill: K01 per R01-R03, K02 per R04-R06, K03 per R07, in catena). Collaudatori su ad-mycity @ SHA_REGISTA 33f51c26faf22ee0cf5d68aa2812a2960f6a54cc. Senza ultracode: sono tutti minori.
4. Giro di correzione, unione nel ramo di integrazione del sito, la prova 48 della 832, poi `npm run verify`, l'harness SQL e C01 (F3). Prima di spingere l'integrazione del sito con add_repo, avvisa l'AD: Nicola deve cliccare.
5. FERMATA all'AD con i numeri di `applica` e `conti`, e la riga in `cervello/riparazione/misure.json` a fine giro.
