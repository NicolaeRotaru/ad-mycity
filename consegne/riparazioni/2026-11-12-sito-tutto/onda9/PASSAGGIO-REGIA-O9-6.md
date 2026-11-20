---
data: 2026-11-20 19:35
tipo: passaggio di regia
da: «Ondata 9 · 5.0» (session_015BmpnZZ9mpJFdTk5mxvbY8), a circa 385 mila token
a: «Ondata 9 · 6.0»
---

# Onda 9: il passaggio alla regia 6.0

## In parole semplici
Il giro di giovedì 19/11 è chiuso. Nicola ha unito la PR del sito mycity#298 il 20/11, e nel registro sono state chiuse 47 voci: 24 della #297, 23 della #298. La 6.0 apre il giro dopo, quello delle riparazioni tolte e delle scelte del 19/11. Un esempio di cosa entra: «Segna tutte come lette» nelle notifiche, che il collaudo ha bocciato perché azzerava il campanello dell'utente sbagliato.

## Cosa cambia per te
Niente: Nicola scrive alla 6.0 come scriveva alla 5.0.

## Cosa devi fare
Preparare il giro dopo col programma (`dividi` da `main` del sito `b2c62f34`), aprire i riparatori, poi collaudi, unione, verify, controllore e PR come nel giro del 19/11.

## Cosa non ho verificato
- Le voci del giro dopo non le ho rifiltrate sul codice di oggi: le liste qui sotto vengono dai referti e dai collaudi del 19/11.
- Il rilascio su Vercel dopo l'unione di #298.

---

## Dettagli tecnici

### Lo stato (20/11 19:35)
- Sito: `main` a `b2c62f34` (merge di #298), albero `180c80eb`, lo stesso controllato da C02. Clone in `/home/user/mycity`.
- Registro del sito: 748 voci aperte.
- Programma: la firma «id_nel_commit» su un commit vale anche per la voce altrui citata nel messaggio (commit della 5.0 su `claude/adoring-bohr-kixq35`, collaudo di un agente qa: regge).
- Eccezioni firmate da Nicola il 20/11: in `onda9/piano.json` (2 commit di R08) e `onda9/giro2/piano.json` (17 prove ritoccate, 3 commit). Difetto del programma ancora aperto: l'eccezione `prove_comuni` vale per tutta l'onda, non guarda sessione e file.

### La decisione aperta di Nicola
- **La scorta in «Modifica prodotto» e «Duplica»** (R04-007 del giro 2, nata da R03-019): due giri falliti. Strade portate a Nicola il 20/11: (1) una sessione dedicata solo a quella voce, con la prova E2/D2 di K02 del giro 2 come rossa di partenza e la regola «se le taglie non arrivano il Salva si blocca con un avviso, il testo resta» (consigliata, 20-30 $); (2) rimetterla nel giro con un riparatore normale. Nicola non ha ancora scelto.

### Le voci del giro dopo
- **Le 12 scelte** (DECISIONI 19/11 11:50): R02-011 recesso nei festivi, R06-001 12 px, R01-005 (= R02-002 del giro 2) tasti nel menu account, R10-010 una veloce per fattorino, R07-003, R07-009 notte rossa, R07-010, R07-011, codice di R07-008 (Sentry) e di R10-001 (controllo foto).
- **Le riparazioni tolte all'unione del 19/11** (ognuna col motivo nel suo collaudo): onda9 R04-001 (traccia «tolta» per una taglia di un'altra scheda), onda9 R05-019 (caratteri fuori dal latin), giro2 R01-002 (campanello azzerato all'utente sbagliato, K01 g2), giro2 R02-003 (rompe la prova di fumo dopo la pubblicazione, K01 g2), giro2 R03-006 (errore a Sentry a ogni giro del cron, K02 g2), giro2 R04-005 (la prova vuole Chromium nella CI: aggiungere il passo a `ci.yml` o rifare la prova), onda9 R09-007 (le miniature sul caricatore: va insieme alla soglia di `la-foto-chiesta-piu-piccola-del-riquadro`, oggi `> 20`).
- **Le parziali e le serve_file_altrui** dei referti del 19/11: in `onda9/decisioni.json` (103 restano aperte) e `onda9/giro2/decisioni.json` (13).
- **Il difetto nuovo che conta:** un ordine pagato con carta e senza coordinate passa senza controllo della zona di consegna e senza avviso (visto da R04 il 19/11).
- **Le falle riservate:** due pezzi in un file comune. I dettagli arrivano alla 6.0 solo in chat; vanno a un riparatore con mandato riservato e commit dal messaggio generico.

### Le spese
Giro del 19/11 e 20/11: circa 238 $ su 650 di tetto (regia 5.0 17,34 $, C02 6,60 $, il resto come nel passaggio alla 5.0). Limite «allowed», senza uso extra. Il tetto del giro dopo lo decide Nicola: chiederlo con il preventivo.
