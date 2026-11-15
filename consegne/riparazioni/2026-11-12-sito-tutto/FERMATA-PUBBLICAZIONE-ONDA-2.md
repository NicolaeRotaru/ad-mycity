---
data: 2026-11-15 01:47
cosa: le firme che servono per pubblicare il sito con l'onda 2
---

# Pubblicare il sito con l'onda 2: cosa si firma

**In parole semplici.** Il lavoro dell'onda 2 è pronto nella richiesta di unione del sito. Per metterlo online servono tre firme di Nicola: le 11 migrazioni sul database vero, le due deroghe, l'unione nel ramo principale. Dopo l'unione il sito si pubblica da solo.

**Cosa cambia per te.** Le migrazioni vanno applicate PRIMA dell'unione. Esempio: il salvataggio di un prodotto, nel codice nuovo, chiama una funzione che nasce con la migrazione 405. Se il codice va online prima, il negoziante non riesce a salvare. Il contrario invece regge: il codice di oggi funziona anche con le 11 migrazioni già applicate.

**Cosa devi fare tu.** Scrivere alla regista le firme dell'elenco qui sotto. Poi la regista applica le migrazioni una per una, unisce e controlla il sito online.

**Cosa non ho verificato.** Ho controllato il database vero solo in lettura. Non ho provato ad applicare le migrazioni: le ha provate un Postgres di prova durante i collaudi. Il sito pubblicato non l'ho ancora visto: si controlla dopo l'unione.

## I controlli fatti sul database vero (sola lettura, 15/11 01:30-01:45)

- Le 15 migrazioni dell'onda 1 ci sono tutte. Mancano solo le 11 dell'onda 2.
- Righe che le migrazioni cambierebbero: zero. Storie con un link fuori da MyCity: 0 su 0. Reclami legati a un ordine inesistente: 0. «Ultimi visti» da cancellare per consenso tolto: 0 su 8. Promo doppie attive: 0 su 1.
- I permessi della 425: tutti i 241 permessi sulle tabelle e i 164 sulle funzioni ci sono già. La 425 sul sito vero non cambia niente.
- La 421 riscrive la funzione che crea il profilo alla registrazione: è identica a quella di oggi, con in più il nome.
- La 412 cambia la funzione dei rimborsi: il terzo campo nuovo è facoltativo, quindi il codice di oggi continua a funzionare.
- Ramo principale del sito fermo a a19ff892; la richiesta di unione è 388 commit avanti e 0 indietro: si unisce senza conflitti.

## Le firme

1. Le 11 migrazioni, in quest'ordine: 400, 403, 404, 405, 412, 421, 422, 424, 425, 429, 450.
2. Le due deroghe: due correzioni difettose tolte col messaggio standard di git (R13-012 e R17-005), invece del messaggio che chiede il guardiano. Il codice torna com'era prima: non entra niente di nuovo.
3. L'unione della richiesta di unione del sito nel ramo principale. La pubblicazione parte da sola dal ramo principale.

## Dettagli tecnici

- Progetto: Mycity (`clmpyfvpvfjgeviworth`). Ramo: `claude/magical-hamilton-xouwr8` a `dbb84ebd`, mycity#290.
- Deroghe: `10708bcf` (Revert R13-012) e `bb53b6be` (Revert R17-005); nel ramo unito c'è `bb53b6be`.
- Controlli dopo la pubblicazione: la cassa, il salvataggio di un prodotto con varianti, un rimborso.
