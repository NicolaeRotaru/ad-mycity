---
data: 2026-11-26 16:46
tipo: passaggio della regia (terza → quarta)
campagna: tutti i difetti del sito che non chiedono Nicola (26/11)
---

# Passaggio · alla quarta regia

## In parole semplici
Questo foglio serve alla regia nuova per continuare senza rileggere la chat della terza.
La terza passa la mano perché è a 278 mila token, e la regola chiede il cambio a 250 mila.
Per esempio: l'onda 1 è unita e controllata; l'onda 2 è consegnata tutta e manca un collaudo.

## Cosa cambia per te
Niente: la campagna continua da sola. Le notizie importanti arrivano all'AD.

## Cosa devi fare
Niente.

## Cosa non ho verificato
Il collaudo K06 (su R12 e R15) e il giro corto di R13 sono in corso. L'onda 2 non è ancora unita.

## Dettagli tecnici

**Chi.** AD: session_015BmpnXuogkPZVts89PH67a. Le scrivi solo a: unione fatta, PR del sito pronta, spesa al 75% (900 $) e
al 100% del tetto, fine campagna, una falla riservata nuova (i dettagli solo in chat, mai nel deposito). Nicola (26/11 13:45):
tutti i difetti senza di lui, **nessuna richiesta di approvazione**; quello che chiede lui va in `per-nicola.md`. Tetto **1.200 $**,
a 1.100 $ misurati non si apre più niente.

**File.** `REGIA.md` (regole e diario: leggi da «2026-11-26 15:55» in giù) · `per-nicola.md` · cartelle `-onda1/` e `-onda2/`.
I passaggi delle regie prima sono nella storia git (prima c9d5f88, seconda 700608ad).

**Basi.** Sito main @ ed12ed8ec8190e1132b690f6e034c30f0a5d55ba. Clone del sito da rifare:
`git clone --filter=blob:none https://github.com/NicolaeRotaru/mycity /home/user/mycity`, poi
`git fetch origin 'refs/heads/ccr-a672a2b3-92w5w1*:refs/remotes/origin/ccr-a672a2b3-92w5w1*'` e `export MARKETPLACE_REPO=/home/user/mycity`.
Programma: `node cervello/riparazione-sessioni.mjs <comando> … --radice $PWD` (guardia-ramo vuole `<ramo> <RNN> --cartella --git`,
valida-referto vuole `<file> --cartella --git --ramo`). Sorveglianza muta:
`MARKETPLACE_REPO=/home/user/mycity bash cervello/riparazione/sorveglia.sh --attendi consegne/riparazioni/2026-11-26-tutti-onda2 1`
(in sottofondo; l'onda dentro `sessioni.json` è «1»; dopo ogni segnale gestito lo scrivi in `-onda2/rossi-noti.txt` e la rilanci; se
aggiungi una sessione a `sessioni.json` la fermi e la rilanci, perché legge l'elenco solo all'avvio).

**Onda 1: unita e controllata.** Integrazione del sito `ccr-a672a2b3-92w5w1` @ a60799bdcd19e5fe35358b7f494fa5a2c09ab211 (U01: 11 rami,
0 conflitti, 17 revert puliti, verify e palestra SQL verdi). C01 (6,82 $) verde: nessuna delle 27 che reggono è rossa.
`applica --scrivi` fatto: 27 si chiudono dopo l'unione di Nicola, 3 già riparate, 86 aperte, 51 nati (47 scritti), 10 frammenti
in `-onda1/frammenti` per `chiudi-sito.mjs`. Il ramo della radiografia (ccr-aa566c13-nvkbaw @ a75708c) è già unito in questo ramo.
`campione_fino_a_40_dall_onda: 1` scritto nei piani di tutte e due le onde.

**Onda 2: consegnata tutta**, referti copiati in `-onda2/referti/`, guardia e referto rilanciati verdi dalla regia per tutte e cinque.
- K05 (4,33 $) su R13, R14, R16: collaudo verde copiato. **R14-012 rompe altro: togliere 20b107a4 all'unione** (la 930 riscrive la
  funzione dell'avviso e cancella R13-012). R14-002 e R16-014 non reggono.
- **K06 in corso** (session_015BmpnXzF5QVKnL1CkGnuYM, ramo -k06, partenza b24636e4) su R12 (punta d29a7978) e R15 (punta e24d158d),
  limite 15 $. Quando finisce: copia `collaudi/K06.json`, guardia-ramo K06 e valida-collaudo.
- **R13 in giro corto** (session_015BmpnViKZet1m9TCGC1DsF): l'AD ha chiesto di scrivere la condizione della 900 già con la cura
  riservata (dettaglio nella chat dell'AD), commit generico, prove SQL rilanciate, 4 $ in più. Quando ti manda il nuovo SHA:
  ricopia il referto, guardia e valida-referto. Se cambia solo la 900, non serve un collaudo nuovo (basta guardare il diff).
- Poi **U02**: unione di -m12…-m16 sopra l'integrazione a60799bd, sul ramo `ccr-a672a2b3-92w5w1` del sito, in ordine di numero,
  togliendo 20b107a4 e quello che K06 dice che rompe altro; verify e palestra SQL. Prima prova l'unione e i revert in locale
  (`git worktree add --detach`), poi scrivi il mandato in `-onda2/MANDATO-U02.md` sullo stampo di `-onda1/MANDATO-U01.md`.
  Poi il controllore C02 (come C01, onda 2, ramo -c02), `applica` a vuoto e `--scrivi`, messaggio all'AD «unione fatta».

**Il giro dopo (onda 3)** dall'integrazione unita: `dividi --base <SHA integrazione> --file-chiavi --per-sessione 16` con parziali,
serve_file_altrui, non_fatto, i rompono altro con la nota del collaudo, le 137 di `chiavi-onda2-dopo-unione.txt`, i nati senza Nicola.
Note da dare: quelle del passaggio della seconda regia (R10-003/004/005, R05-002, R02-014, R09-003, R09-006: in `REGIA.md` 15:31 e
15:42 e nel commit 700608ad) più **R13-012 + R14-012: una funzione sola dell'avviso con le due correzioni e la cura riservata, con
una prova SQL che le copra insieme**. Rinumera da R17. Migrazioni solo nelle fasce **882-889, 891-899, 911-919, 921-929, 941-949,
961-969, 980-989** (990-999 è della sessione riservata S01, fuori dalla tua unione).

**Le falle riservate.** Oltre alle 6 di prima, la terza regia ne ha girate all'AD tre: da R13 (permessi sulla funzione dell'avviso),
da R12 (semi del database), da R16 (permessi sulle domande dei prodotti). Nel deposito solo «riservato».

**Spesa misurata (cost_usd).** Circa 321 $ fino alla seconda regia. Onda 2: R12 22,52 · R13 11,95 (più il giro corto) · R14 13,20 ·
R15 25,82 · R16 circa 17 · K05 4,33. C01 6,82 · U01 non misurata (l'ultimo turno 0,55) · terza regia 7,57. Totale circa 431 $
più K06 e il giro di R13. Lontano dalla soglia dei 900 $.

**Regole imparate oggi (terza regia).** I riparatori di soli minori sforano il limite di 20 $ quando chiudono un loro difetto nato
(R15 25,82, R12 22,52): va bene, ma nel loro primo messaggio di correzione metti il limite in dollari in più. I controllori e i
collaudatori chiedono l'ultracode: nel prompt scrivi subito «senza ultracode, REGIA.md regola 3». `rossi-noti.txt` non deve mai
contenere le righe «finita RNN» prima che finiscano: zittiscono l'avviso.

**Riga di apertura per la regia nuova:** «Sei la regista della campagna consegne/riparazioni/2026-11-26-tutti (quarta regia).
Leggi consegne/riparazioni/2026-11-26-tutti/PASSAGGIO.md e REGIA.md, e di .claude/skills/riparazione/SKILL.md le regole del 21/11 e
del 15/11 e la sezione F3; poi continua da «K06 in corso». L'AD è session_015BmpnXuogkPZVts89PH67a.»
