## In parole semplici
Il playbook "Anti-churn negozi" ripartiva da solo ogni giorno anche se non c'era niente da controllare: c'è un solo negozio vero (Pane Quotidiano) e nessun secondo negozio da confrontare, quindi il playbook non trovava mai un calo — solo lo stesso risultato vuoto, 17+ volte dall'1 luglio.

## Cosa cambia per te
Da oggi il playbook resta fermo fino al 24 agosto (la data che avevi già concordato per riprendere il lavoro sui negozi). Torna ad accodarsi da solo dopo quella data, senza bisogno di un comando manuale. Zero rischio: nessun altro playbook è toccato, e se qualcosa non va basta rimuovere la riga `sospesoFino` per tornare al comportamento di prima.

## Cosa devi fare
Mergiare la PR quando ti torna comodo — non è urgente, il playbook continuerà comunque a non fare danni nel frattempo (si limitava a scrivere un lavoro vuoto ogni giorno).

## Cosa non ho verificato
Non ho controllato se altri playbook della lista (win-back, capillarità, dati-negozi, badge-verificato, ecc.) hanno lo stesso problema — quelli però dipendono da condizioni nel database (es. "0 ordini consegnati"), non da una data fissa come questo, quindi servirebbe un meccanismo diverso. Non l'ho toccato in questa PR per restare su una modifica piccola e verificabile.

## 🔧 Dettagli tecnici
- File: `pannello/src/lib/playbook-catalogo.ts`, `pannello/src/lib/playbook.ts`
- Aggiunto campo opzionale `sospesoFino?: string` (AAAA-MM-GG) al tipo `Playbook`
- `playbookDaEseguire(giornoSettimana, oggiISO)` ora salta un playbook se `oggiISO < p.sospesoFino`
- Impostato `sospesoFino: "2026-08-24"` su `negozi-calo`, coerente con `registro-fatti.json` → `negozi.attesa-concordata` / `ripresa.lavoro-operativo`
- Prova: `npx tsc --noEmit` in `pannello/` → 0 errori
- Root cause: `accodaPlaybookDelGiorno()` in `pannello/src/lib/playbook.ts` non aveva mai un controllo di gate, solo cadenza temporale
- Riferimento: memoria `playbook-anti-churn-loop-a-vuoto.md`, 17+ invocazioni identiche, segnale di sospensione sollevato il 13/8 e mai applicato fino ad ora
