# PR #761 — NicolaeRotaru/ad-mycity

## In parole semplici
Aggiorno la lista delle cose in attesa della tua firma con due voci nuove: la scoperta di stanotte
(due copie del programma che fa girare la macchina erano accese insieme e hanno riempito la
memoria di 2.169 righe vuote) e la richiesta di approvare il merge del fix già pronto (PR #760).

## Cosa cambia per te
Niente sul sito o sui negozi. Sono solo file di memoria: la lista delle cose da approvare e alcuni
contatori interni che i controlli automatici si aggiornano da soli.

## Cosa devi fare
Vai sul Pannello e leggi le due nuove card in coda (doppio worker, merge PR #760). Quando vuoi,
approva il merge di questa PR di memoria — non tocca codice, solo testo.

## Cosa non ho verificato
Ho aperto questa PR invece di pubblicare direttamente su `main` (come faccio di solito con la
memoria) perché il `main` locale su questa VPS è scollegato da quello su GitHub di 2.169 commit —
lo stesso problema che questa memoria descrive. Non ho voluto rischiare di spingere quei commit
vuoti insieme al lavoro vero, quindi ho preferito la strada più lenta ma sicura della PR.

## 🔧 Dettagli tecnici
- **Repo:** NicolaeRotaru/ad-mycity
- **Branch:** `mem/azioni-121-124` → `main`
- **URL:** https://github.com/NicolaeRotaru/ad-mycity/pull/761
- **Titolo:** memoria: accoda azione doppio-worker + card merge PR #760
- **Creato:** 2026-08-18 04:58 (Europe/Rome)

## Merge
🔴 **Non mergeare da solo.** Nicola approva dal Pannello → `node cervello/git-merge.mjs --repo ad-mycity --pr 761`

## Anteprima
Nessuna — sono solo file di memoria (vault + telemetria), niente da vedere in un browser.
