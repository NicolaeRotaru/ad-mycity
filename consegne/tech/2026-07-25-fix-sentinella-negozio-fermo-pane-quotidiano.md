# Fix: la sentinella "negozio fermo" smette di allarmare su Pane Quotidiano

**Data:** 2026-07-25 00:10
**Reparto:** account-negozi / tech (AD)
**Colore:** 🟡 auto-modifica macchina — firma Nicola per il merge

## Cosa cambia
La sentinella `negozio_fermo` (`cervello/sentinella-dati.mjs`) continua a segnalare
Pane Quotidiano come "a rischio churn" ogni volta che passano 14 giorni senza ordini —
è successo almeno 6 volte con dossier dedicati (6/7, 8/7, 13/7, 15/7...) e 25 esiti
registrati nel quaderno `account-negozi`, sempre con la stessa conclusione: **falso
positivo**. Nicola l'ha già chiarito più volte: conosce il fornaio di persona, sta
aspettando che la piattaforma sia pronta (oggi: dopo il 24/8-1/9), non sta mollando.

Il fix proposto due volte in passato (#24 6/7, #58 8/7) — "insegna alla sentinella
l'eccezione" — non era mai stato applicato al codice, solo descritto nei dossier.
Questa PR lo applica davvero:

1. **`MyCity-Vault/90-Memoria-AI/registro-fatti.json`** — nuovo fatto
   `negozi.attesa-concordata` con l'id di Pane Quotidiano e il perché (fonte unica
   AR-102, nessun id hardcoded nel codice).
2. **`cervello/sentinella-dati.mjs`** — la sentinella legge quel fatto ed esclude
   quell'id dalla lista `negozi_fermi` prima di generare l'allarme.

## Se va bene
Da questo momento la sentinella `negozio_fermo` sta zitta su Pane Quotidiano finché
non arriva il primo ordine vero (o finché il fatto `negozi.attesa-concordata` non
viene tolto dal registro, es. dopo la ripresa del 24/8-1/9). Continua a funzionare
normalmente su ogni altro negozio LIVE davvero fermo da 14g.

## Verifica fatta
- `node --check` non disponibile in questa sessione (comando non in allowlist headless)
  → **verifica manuale**: rilettura del filtro riga per riga, formato regex UUID
  confermato contro l'id reale già presente nel registro (`c0b240c0-2a86-4218-9d0f-
  5154f08ff929`), stesso pattern già usato altrove nel file per gli id seller.
- **Non verificato in esecuzione dal vivo** (`node cervello/sentinella-dati.mjs` non è
  nell'allowlist di questa sessione headless, comando bloccato). Consigliato un run
  manuale di `node cervello/sentinella-dati.mjs` (dry-run, sola lettura) dopo il merge
  per confermare che `negozi_fermi` non contiene più Pane Quotidiano.
- Nessun test automatico esistente copre questo script (niente bats per `.mjs`).

## Rischio
Basso: sola lettura del marketplace, nessuna scrittura su ordini/pagamenti, nessun
id hardcoded (letto dal registro-fatti). Se il fatto viene rimosso o il registro non
è leggibile, il filtro non esclude nulla e il comportamento torna quello di oggi
(fail-open verso l'allarme, non verso il silenzio).
