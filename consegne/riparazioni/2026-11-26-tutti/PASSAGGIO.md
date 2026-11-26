---
data: 2026-11-26 15:46
tipo: passaggio della regia (seconda → terza)
campagna: tutti i difetti del sito che non chiedono Nicola (26/11)
---

# Passaggio · alla terza regia

## In parole semplici
Questo foglio serve alla regia nuova per continuare senza rileggere la chat della seconda.
La seconda passa la mano perché è arrivata a 243 mila token, e la regola chiede il cambio a 250 mila.
Per esempio: l'onda 1 è collaudata tutta e una sessione la sta unendo adesso; il prossimo passo è leggere il suo esito.

## Cosa cambia per te
Niente: la campagna continua da sola. Le notizie importanti arrivano all'AD, che te le riassume.

## Cosa devi fare
Niente.

## Cosa non ho verificato
L'unione dell'onda 1 è in corso: le prove complete del sito sull'albero unito non sono ancora girate.
La spesa dell'onda 2 è ancora aperta.

## Dettagli tecnici

**Chi.** AD: session_015BmpnXuogkPZVts89PH67a. Le scrivi solo a: unione fatta, PR del sito pronta, spesa al 75% (900 $) e al 100%
del tetto, fine campagna, una falla riservata nuova. Nicola (26/11 13:45): tutti i difetti senza di lui, **nessuna richiesta di
approvazione**; quello che chiede lui va in `per-nicola.md`. Tetto **1.200 $**, a 1.100 $ misurati non si apre più niente.

**File.** `REGIA.md` (regole e diario, leggi da «2026-11-26 15:25» in giù) · `per-nicola.md` · cartelle `-onda1/` e `-onda2/`.
Il passaggio della prima regia è nella storia git (commit c9d5f88).

**Basi.** Sito main @ ed12ed8ec8190e1132b690f6e034c30f0a5d55ba. Ramo ad-mycity e integrazione del sito: `ccr-a672a2b3-92w5w1`.
Il clone del sito va rifatto a ogni regia nuova: `git clone --filter=blob:none https://github.com/NicolaeRotaru/mycity /home/user/mycity`
(add_repo è stato rifiutato, git clone passa), poi `git fetch origin 'refs/heads/ccr-a672a2b3-92w5w1*:refs/remotes/origin/ccr-a672a2b3-92w5w1*'`
e `export MARKETPLACE_REPO=/home/user/mycity`. Il programma è `node cervello/riparazione-sessioni.mjs`.

**Onda 1: collaudata tutta** (K01-K04 finiti e archiviati, collaudi in `-onda1/collaudi/`, tutti verdi a valida-collaudo).
Reggono circa 31: R11 4 · R03 4 · R07 3 · R10 2 · R08 3 · R04 1 · R05 0 · R09 3 · R06 4 · R01 1 · R02 6. Il numero vero lo dà `applica`.
Rompono altro e si tolgono all'unione (17 commit, revert provati puliti in locale dopo la prova d'unione verde):
R03-008 · R07-006 · R04-005 · R10-003/004/005 (con la migrazione 960) · R05-002 · R06-003 · R06-013 · R02-014 (con la 881).
R06-001 rompe altro per una falla riservata, ma non ha commit sul ramo (era riparata prima della base).

**U01 in corso**: session_015BmpnY88LV2YEwP5rc3XuJ, sito dalla base sul ramo `ccr-a672a2b3-92w5w1`, mandato in `-onda1/MANDATO-U01.md`,
limite 12 $. Ti scrive SHA, revert fatti, voci tolte in più, prove di verify e della palestra SQL. Poi, in ordine:
1. Controllore C01: sessione nuova su ad-mycity, ramo `ccr-a672a2b3-92w5w1-c01`, tag `onda-1-controllori`, titolo «C01», prompt di
   una riga: «Sei il controllore C01. Leggi cervello/riparazione/LEGGIMI-controllore.md e controlla l'onda 1 della cartella
   consegne/riparazioni/2026-11-26-tutti-onda1: integrazione ccr-a672a2b3-92w5w1 @ <sha>, base ed12ed8ec8190e1132b690f6e034c30f0a5d55ba.»
   Il referto si copia in `-onda1/controlli/C01.json`.
2. `applica --cartella <C> --git /home/user/mycity` a vuoto (prima scrivi nel piano il campo `campione_fino_a_40_dall_onda`, F3.1).
3. Messaggio all'AD: unione fatta (SHA, reggono, tolte, nati).
4. Registro: la radiografia ha 45 chiusure sul ramo ccr-aa566c13-nvkbaw @ 348a2b1. Prima di `applica --scrivi`: `git fetch`; se
   la sua PR è unita, merge di origin/main, se no merge del suo ramo. Le chiusure vere solo dopo che Nicola unisce la PR del sito.

**Onda 2** (R12-R16, 14 minori a testa salvo R12 con un grave, base ed12ed8e, migrazioni 870/900/930/950/970, id in
`-onda2/sessioni.json`): tutte al lavoro alle 15:21, piani ricevuti, nessuna finita. Le figlie sanno che la regia ero io:
**le ho avvisate del cambio**. Collaudatori: uno ogni 3 riparatori finiti (K05, K06), limite 20 $, tetto 9 subagenti, lenti
doppie solo su soldi/dati/permessi. Prima: guardia-ramo e valida-referto rilanciati da te. Poi U02 unisce -m12…-m16 sopra l'integrazione.

**Il giro dopo (onda 3)** dall'integrazione unita: `dividi --base <SHA integrazione> --file-chiavi` con parziali, serve_file_altrui,
non_fatto, i rompono altro con la nota del collaudo, le 137 di `chiavi-onda2-dopo-unione.txt`, i nati senza Nicola. Note da dare:
R10-003/004/005 serve un ripiego sull'errore 42703 in lib/queries/griglia-prodotti.ts finché la 960 non è in produzione; R05-002
la commissione dei ritiri va scritta da qualche parte e il bonifico segnato deve restare; R02-014 il blocco va messo anche sulle
rotte che scrivono con la chiave di servizio e sugli INSERT, senza bloccare per sempre un prodotto rimesso dallo staff; R09-003 la
guardia nuova non controlla niente; R09-006 la pagina della cassa resta scoperta. Rinumera a mano da R17. Migrazioni solo nelle
fasce **882-889, 891-899, 911-919, 921-929, 941-949, 961-969, 980-989** (990-999 è della sessione riservata S01 dell'AD, il ramo
-s01 va in una PR a parte dell'AD e non entra nella tua unione).

**Le falle riservate.** 5 dalla prima regia più quella di K03 su R06-001 (forse la stessa di R06): dettagli solo nella chat dell'AD.

**Spesa misurata (cost_usd).** Fino alle 15:20 circa 274 $ (vedi il passaggio della prima regia). Dopo: K03 31,05 · K04 15,84 ·
R02 25,94 (al posto di ~24,5). Seconda regia circa 5 $. Totale circa 321 $ più onda 2 (preventivo ~130 $) e U01.

**Regole imparate oggi (seconda regia).** I collaudatori sforano: K03 a 31 $ su 20 con 9 subagenti su 9 (scrivilo nel loro
messaggio: consegna al 70% del limite). Prima di aprire l'unione, la prova d'unione e i revert si provano in locale in una copia
a parte (`git worktree add --detach`): costa poco e la figlia parte con una ricetta già provata. Nel quaderno, delle falle riservate
solo «falla riservata legata a RNN-NNN»: niente nomi di campi o di ruoli.

**Riga di apertura per la regia nuova:** «Sei la regista della campagna consegne/riparazioni/2026-11-26-tutti (terza regia).
Leggi consegne/riparazioni/2026-11-26-tutti/PASSAGGIO.md e REGIA.md, e di .claude/skills/riparazione/SKILL.md le regole del 21/11 e
del 15/11 e la sezione F3; poi continua da «U01 in corso». L'AD è session_015BmpnXuogkPZVts89PH67a.»
