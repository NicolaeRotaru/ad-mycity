## In parole semplici
Il giro delle 22:39 aveva scritto 3 file di log interni. Non li aveva ancora salvati su GitHub.
Sono rimasti "in sospeso" sul server. Questa PR li mette al sicuro.

## Cosa cambia per te
Niente sul sito o sui negozi. Sono solo i log tecnici della macchina.
`cervello/routing.json` dice quale AI ha usato la macchina per ogni compito.
`cervello/fonti-salute.json` è lo stato dei controlli di salute.
`cervello/intelligence-agenda.json` è l'agenda dei controlli esterni.
Zero impatto su ordini, pagamenti o dati dei negozi.

## Cosa devi fare
Puoi mergiare quando vuoi, senza fretta. Non blocca nessuna funzione del marketplace.

## Cosa non ho verificato
Non ho riletto riga per riga ogni voce di log: sono centinaia di righe auto-generate.
Ho verificato solo due cose. Che il tipo di modifica è coerente con lo scopo dei tre file — log
e agenda, non logica di programma. E che nessun altro file è toccato.

---
### 🔧 Dettagli tecnici
- Causa: `cervello/routing.json`, `cervello/fonti-salute.json`, `cervello/intelligence-agenda.json`
  sono classificati come "codice" dall'hook pre-commit. Regola AR-332: su `main` il codice passa
  da PR, non da commit diretto. Vale anche se il loro contenuto è log/stato auto-generato.
  Per esempio: `cervello/routing.json` è stato riscritto due volte oggi dal worker sul server (giro
  delle 22:39 e giro delle 23:22), ma nessuna delle due riscritture è mai arrivata su GitHub finché
  non ho aperto questa PR — è esattamente il caso che la regola vuole evitare: log tecnico rimasto
  solo sul server, invisibile a Nicola dal Pannello.
- I file di memoria pura (8 file sotto `MyCity-Vault/90-Memoria-AI/auto-coscienza/`) sono già
  su `main`. Committati e pushati diretti, commit `bb619f2a6`, come da regola memoria-diretta.
- Questa PR contiene SOLO l'aggiornamento di stato/log dei tre file `cervello/*.json` sopra.
  Nessuna modifica di logica o di script.
- CI su questa PR (verificata di nuovo il 15/8 00:20): 1 controllo rosso, `cervello/test/mappa-in-bacheca.test.mjs`
  ("oggi ogni pezzo misurabile ha la sua riga"). Causa: 65 skill del pacchetto marketing
  (`ab-testing`, `ads`, `seo-audit`, …) non hanno ancora una riga di spiegazione nella bacheca —
  un buco che c'era già prima di questo lavoro. Verificato con `git diff origin/main --stat`: questa
  PR non tocca né `.claude/skills/` né `cervello/censimento-macchina.mjs`, quindi non può averlo
  causato. Il verdetto automatico di `ci-stato.mjs` lo segna per errore come "colpa mia" — da
  correggere lì, ma il guasto vero resta su `main`, non su questo ramo.
