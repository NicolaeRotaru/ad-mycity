## Cosa cambia
Ogni casella in **Auto-coscienza** (analisi, apprendimento, miglioramento) parla in italiano semplice come le card «Da approvare»: sintesi, errori, domande, lezioni, benchmark, peer review, proposte — tutto il testo, senza tagli.

I riferimenti tecnici (path file, codici PR/AR/L-xxx, testo originale) restano sotto **Dettagli tecnici** espandibili.

## Perché
Nicola chiede lo stesso trattamento delle Azioni: quadro ampio e leggibile, niente gergo in faccia, niente dettaglio perso.

## Come provare
1. Apri il Pannello → Auto-coscienza (o Memoria → tab Auto-analisi / Apprendimento / Miglioramento).
2. Controlla una lezione lunga (es. con PR #379, BURN_MENSILE): il corpo è in italiano, i codici sono nella tendina.
3. Controlla domande per te e errori: sezioni Perché serve / Se rispondi complete.
4. Ctrl+Shift+R dopo il merge.

## File toccati
- `pannello/src/lib/radiografia-umana.ts` — traduzione completa senza troncamento
- `pannello/src/lib/auto-coscienza-umana.ts` — etichette reparto/stato/autonomia
- `pannello/src/components/TestoUmano.tsx` — componente testo + tendina tecnica
- `pannello/src/components/AutoCoscienza.tsx` — tutte le caselle aggiornate
