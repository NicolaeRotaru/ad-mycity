---
data: 2026-11-24 17:32
tipo: passaggio della regia (settima → ottava)
campagna: onda dei 700
---

# Passaggio · dalla regia settima all'ottava

## In parole semplici
Questo foglio serve alla regia ottava per partire senza rileggere la chat della settima.
Il giro di correzione è partito: tre riparatori lavorano su 19 voci e un collaudatore chiude il giudizio su altre 12.
Nicola ha firmato le prove comuni di 11 voci e ha alzato il tetto a 380 $: quelle 11 sono l'onda 3, dopo l'unione del giro.
Ha anche deciso che dalle prossime onde si lavorano solo le voci che la macchina chiude senza di lui.
Per esempio: una voce che chiede «per quanti giorni teniamo le foto cancellate» resta da parte, senza fermate.

## Cosa cambia per te
Ti apre l'AD. I figli vivi scrivono ancora alla regia settima: come prima cosa dai loro il tuo id.
Per spingere sul sito ti serve il clic di Nicola su add_repo: l'AD glielo annuncia.

## Cosa devi fare
Segui «I prossimi passi» qui sotto, dall'1.

## Cosa non ho verificato
Le riparazioni di R08, R09 e R10 non le ho viste: alle 17:27 lavoravano ancora.
Il costo finale dei figli: rileggilo tu con get_session.

## Dettagli tecnici

**Ids.** AD session_01R8112Lzth8WvHHrQ4H3whZ. Regia settima session_01R8112PFGvwN9iRDAdkSTz1: da adesso non spinge più.
Figli vivi (onda 2 del piano, tag onda-2-*), tutti approvati e senza ultracode (soli minori):
- R08 session_01R8112NqLXrakyTZaUMMqrC, ramo sito ccr-d7a54140-hak4ez-m08, 7 voci (vecchie R01-003, R01-005, R07-003, R02-006, R07-010, R06-012, R07-015);
- R09 session_01R8112KUKQJB8drAMNwk3KX, -m09, 7 voci (R03-002, R06-004, R07-005, R07-006, R05-011, R01-015, R01-016). Scelta mia: la rotta di avvio del catalogo NON si blocca lato server; la domanda va in domande_per_nicola;
- R10 session_01R8112MESXTLhypH8keWXCN, -m10, 5 voci (R04-002, R07-002, R07-009, R02-007, R07-011);
- K04 session_01R8112Pdg55NMC7nQoy7BEC, ramo ad-mycity ccr-d7a54140-hak4ez-k04, collaudo PARZIALE di 12 voci (`normali/pronte/collaudo-parziale.txt`: 11 riparate senza verdetto + R07-014). A 9,07 $ ha passato il suo limite di 8: alle 17:29 gli ho detto di chiudere con le voci già giudicate. Rimesse: 11 a uscita 0, R07-014 a uscita 3 con la rimessa a mano che regge.
Limiti dati ai riparatori: 3 subagenti, stop a 12 $ con messaggio a priority now.

**Come è nato il giro (perché 19 e non 22).** `pronte` + scelta mia in `normali/pronte/giro-correzione.txt`. Con un ramo finto la guardia ha dato rosso su 9 voci che si riparano solo in prove senza padrone: sono fra le 11 firmate. Fuori anche R05-009, che passa da lib/errors.ts come R07-010. Nel piano dell'onda 2 ho aggiunto a mano i file che le note nominano e nessuno possedeva (`nota_regia` nel piano); copertura-prima verde. I prompt dei riparatori: riga `ruolo-freno: riparatore-minori` + LEGGIMI-riparatore.md + scheda + note della regia (vecchio id per voce, tetto) + la riga finale di F1.

**Le decisioni di Nicola in questa regia** (scritte in REGIA.md, BACHECA-SESSIONI.md, DECISIONI.md):
- 17:03 «A»: giro di correzione nel tetto;
- 17:20 firma sulle prove comuni di 11 voci → onda 3 (`normali/pronte/onda3-firmate.txt`), con `eccezioni_firmate: [{onda: 3, regole: ["prove_comuni", "prova_esistente_altrui"], firma: "Nicola 2026-11-24 17:20: «Fai anche le 11 che aspettano la mia firma»"}]` nel piano prima di guardia e applica. R06-008 = cherry-pick 99c4faf1, R07-007 = cherry-pick 602c64d7, R02-004 = i 5 diff dei finti più cherry-pick a6bee2db (ramo -m02);
- 17:21 «Sì, alza il tetto a 380»: 360 $ per i passi 1 e 2 + 20 $ per l'onda 3;
- 17:26 dalle prossime onde solo le voci risolvibili senza di lui (conto sul registro: 398 senza Nicola, 50 con migrazione, 77 sue, 36 pronte, 18 senza percorso, 31 in lavoro);
- 17:27 Nicola: «fai tutti i 44». Gli ho detto che le 13 voci in più (`normali/pronte/onda3-se-440.txt`) portano il tetto a circa 440 $. **Risposta non ancora arrivata**: senza un sì scritto quelle 13 non partono.

**Il tetto.** Misurato con get_session alle 17:29: 278,01 + quinta 6,36 + C01 6,33 + sesta 5,51 + settima 12,67 + R08 3,47 + R09 3,44 + R10 2,30 + K04 9,07 = **327,16 $**.
Per i passi 1 e 2 restano circa 33 $: la fine dei tre riparatori (fino a circa 10 $ ciascuno), K05, C02 e la tua regia ci stanno a fatica. Se il conto passa 360, i 20 $ dell'onda 3 non si toccano per il giro: ci si ferma e lo si dice all'AD.

**Le regole da tenere.** SHA interi. Controllo a 10 minuti su ogni figlia (get_session, poi list_events kinds assistant con grep `"name":"mcp__`). Le letture lunghe falle fare a un aiutante sonnet che riporta solo i numeri: alle 17:27 nessun figlio aveva toccato il database vero. REGIA.md è a 68 righe: tienilo sotto le 80. Lo storico del sorvegliante si committa da solo, mai `commit -a`. La regia passa la mano a 250 mila token.

## I prossimi passi
1. `get_session` su di te; il tuo id nel campo `regista` di `normali/sessioni.json`; a R08, R09, R10 e K04 un send_message: «da adesso la regista è <id>». Commit e push.
2. Clone del sito col git normale in /home/user/mycity, `git fetch` di ccr-d7a54140-hak4ez e dei rami -m08, -m09, -m10.
3. A ogni riparatore finito: referto copiato in `normali/referti/RNN.json`, `guardia-ramo` e `valida-referto` verdi. K04: `collaudi/K04.json` copiato e `valida-collaudo` verde, poi archivia.
4. Con il clic di Nicola su add_repo (push su NicolaeRotaru/mycity): unione di -m08, -m09, -m10 nell'integrazione (da d000e3b04bc9d12ab160f5ebc55c0d665fc6e5a9), npm run verify, harness SQL, spinta, SHA nuovo in REGIA.md.
5. K05 (collaudo di R08-R10, partenza SHA della regia) e C02 (controllo sulle sole modifiche nuove dell'integrazione). Poi `applica --git` a vuoto e `conti`. La fermata va all'AD nei quattro blocchi.
6. Onda 3: `dividi --onda 3 --base <SHA dell'integrazione col giro> --file-chiavi normali/pronte/onda3-firmate.txt` (più `onda3-se-440.txt` solo col sì di Nicola ai 440 $), l'eccezione firmata nel piano, schede, una sessione. Le voci di pagamenti e account vogliono ultracode.
7. A fine giro la riga in `cervello/riparazione/misure.json`.
