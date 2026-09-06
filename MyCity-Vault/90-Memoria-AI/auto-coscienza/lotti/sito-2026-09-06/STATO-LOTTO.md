# Lotto minori del sito — 2026-09-06 — stato

**Cosa è.** 275 difetti di gravità minore del marketplace, divisi in 126 pacchetti su 27 ondate da 5
squadre. Il piano è `consegne/audit/2026-09-06-1509-pacchetti-sito-304difetti.json`, filtrato ai soli
minori. Fuori dal lotto restano 3 bloccanti e 26 gravi: quelli hanno un'altra asticella.

**Regole del lotto.** Ramo `claude/marketplace-open-issues-0gudy6` nei due repo. Le squadre non
committano: commit per ondata, li fa l'AD. Cancello finale: `npm run verify` nel repo del sito +
`node cervello/radiografia-in-corsa.mjs --repo ../mycity`. Colore 🟡: l'unione resta di Nicola.

## Avanzamento

| ondata | squadre | difetti | esito | commit |
|---|---|---|---|---|
