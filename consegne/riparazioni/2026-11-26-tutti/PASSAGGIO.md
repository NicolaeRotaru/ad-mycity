---
data: 2026-11-26 17:06
tipo: passaggio della regia (quarta → quinta)
campagna: tutti i difetti del sito che non chiedono Nicola (26/11)
---

# Passaggio · alla quinta regia

## In parole semplici
Questo foglio serve alla regia nuova per continuare senza rileggere la chat della quarta.
La quarta passa la mano a circa 215 mila token: il resto del lavoro non sarebbe stato sotto i 250 mila.
Per esempio: le onde 1 e 2 sono unite sul sito; manca il controllore dell'onda 2, poi parte l'onda 3.

## Cosa cambia per te
Niente: la campagna continua da sola. Le notizie importanti arrivano all'AD.

## Cosa devi fare
Niente.

## Cosa non ho verificato
Il controllo C02 sull'onda 2 unita è in corso. Il registro dell'onda 2 non è ancora scritto (`applica --scrivi`).

## Dettagli tecnici

**Chi.** AD: session_015BmpnXuogkPZVts89PH67a. Le scrivi solo a: unione fatta, PR del sito pronta, spesa al 75% (900 $) e
al 100% del tetto, fine campagna, una falla riservata nuova (i dettagli solo in chat, mai nel deposito). «Unione fatta» per
l'onda 2 è già mandata (17:03). Nicola (26/11 13:45): tutti i difetti senza di lui, **nessuna richiesta di approvazione**;
quello che chiede lui va in `per-nicola.md`. Tetto **1.200 $**, a 1.100 $ misurati non si apre più niente.

**File.** `REGIA.md` (regole e diario: leggi da «2026-11-26 16:55» in giù) · `per-nicola.md` · cartelle `-onda1/` e `-onda2/`.
I passaggi delle regie prima sono nella storia git (seconda 700608ad, terza 9783b25).

**Basi.** Sito main @ ed12ed8ec8190e1132b690f6e034c30f0a5d55ba. Integrazione del sito (onde 1 e 2 unite) `ccr-a672a2b3-92w5w1` @ aac2350b09db195d6d2286f15f75a7d02ae590a1. Clone del sito da rifare:
`git clone --filter=blob:none https://github.com/NicolaeRotaru/mycity /home/user/mycity`, poi
`git fetch origin 'refs/heads/ccr-a672a2b3-92w5w1*:refs/remotes/origin/ccr-a672a2b3-92w5w1*'` e `export MARKETPLACE_REPO=/home/user/mycity`.
Programma: `node cervello/riparazione-sessioni.mjs <comando> … --radice $PWD` (guardia-ramo vuole `<ramo> <RNN> --cartella --git`,
valida-referto vuole `<file> --cartella --git --ramo`). Sorveglianza muta:
`MARKETPLACE_REPO=/home/user/mycity bash cervello/riparazione/sorveglia.sh --attendi consegne/riparazioni/2026-11-26-tutti-onda2 1`
(in sottofondo; l'onda dentro `sessioni.json` è «1»; dopo ogni segnale gestito lo scrivi in `-onda2/rossi-noti.txt` e la rilanci; se
aggiungi una sessione a `sessioni.json` la fermi e la rilanci, perché legge l'elenco solo all'avvio).

**Onda 1: unita, controllata (C01 verde), registro scritto.** 27 si chiudono dopo l'unione di Nicola; frammenti in `-onda1/frammenti`.

**Onda 2: unita.** U02 (0,34 $): `aac2350b` sopra a60799bd, m12-m16 senza conflitti, revert 20b107a4 (R14-012), e586e7df +
384c46be (R12-001, il grave della spesa AI: rompe altro, torna nell'onda 3), f2b9a86e (R15-006, testo illeggibile a 280-320 px).
verify verde (13638 prove), palestra SQL verde (240 migrazioni, 104 file). Collaudi K05 e K06 copiati e validati. R13 ha rifatto
la 900 con la cura riservata (a1682ada, referto alla punta 72753feb, verdi). `applica` a vuoto: 70 voci, 31 si chiudono dopo
l'unione, 5 già riparate, 34 aperte, 21 nati.
- **C02 in corso** (session_015BmpnXuwMmpmWMEfTUvDbG, ramo -c02, partenza 72465184, 15 $). Gli ho detto di rispondere alla
  regia: alla quinta lo dico io prima di chiudere. Quando finisce: copia `-onda2/controlli/C02.json` (sul suo ramo solo quel
  file, `git diff --name-only`), guarda che nessuna delle 31 che reggono sia rossa, poi `applica --git /home/user/mycity` a
  vuoto e `--scrivi`. Sorveglianza: spenta (tutte le figlie dell'onda 2 hanno consegnato); C02 scrive lei.
- Spesa onda 2 in più rispetto al passaggio di prima: K06 9,35 · R13 12,33 in tutto · U02 0,34 · quarta regia circa 3,5.
  Totale campagna circa 445 $. Lontano dai 900 $.
- **Da scrivere a fine onda 2:** la riga in `misure.json` (regola 7 del 21/11).

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

**Note in più per l'onda 3 (quarta regia).** R12-001 (grave): la nota del collaudo K06 è in `-onda2/collaudi/K06.json` (il
cliente legge «Budget esaurito» quando il conto non si legge, run.ts:306/491; senza Upstash le prenotazioni in volo restano della
copia). R15-006: niente `overflow-wrap:anywhere` nella fascia di about/page.tsx:237-243, il testo deve restare leggibile a 280 px.

**Regola imparata dalla quarta regia.** In un giro corto di un riparatore che ha già il referto sul ramo, `sorveglia.sh` dà
subito «finita RNN»: lascia la riga in `rossi-noti.txt` e aspetta il messaggio del riparatore.

**Regole imparate oggi (terza regia).** I riparatori di soli minori sforano il limite di 20 $ quando chiudono un loro difetto nato
(R15 25,82, R12 22,52): va bene, ma nel loro primo messaggio di correzione metti il limite in dollari in più. I controllori e i
collaudatori chiedono l'ultracode: nel prompt scrivi subito «senza ultracode, REGIA.md regola 3». `rossi-noti.txt` non deve mai
contenere le righe «finita RNN» prima che finiscano: zittiscono l'avviso.

**Riga di apertura per la regia nuova:** «Sei la regista della campagna consegne/riparazioni/2026-11-26-tutti (quinta regia).
Leggi consegne/riparazioni/2026-11-26-tutti/PASSAGGIO.md e REGIA.md, e di .claude/skills/riparazione/SKILL.md le regole del 21/11 e
del 15/11 e la sezione F3; poi continua da «C02 in corso». L'AD è session_015BmpnXuogkPZVts89PH67a.»
