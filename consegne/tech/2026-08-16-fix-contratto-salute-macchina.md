# Fix: il contratto di `auto-analisi.json` bocciava due chiavi che il giro scriveva già

## In parole semplici
Il giro scrive ogni tanto due dati in più dentro `salute_macchina` di `auto-analisi.json`
(quanti sensori dichiarano di essere spenti, e se Telegram è collegato). Il controllo
automatico che tiene pulito quel file non li conosceva, quindi li bocciava — ed è lo
stesso identico problema già risolto il 10/8 per "sito negozi" (vedi il commento in
`cervello/valida-contratti.mjs`).

## Cosa cambia
- `cervello/valida-contratti.mjs`: le due chiavi entrano nell'elenco ammesso.
- `pannello/src/components/AutoCoscienza.tsx` + `pannello/src/lib/auto-coscienza-umana.ts`:
  due nuovi riquadri nella Cabina, così l'informazione che il giro scrive non resta invisibile.
  "Sensori ciechi" è verde solo a zero (più alto = peggio, al contrario dei "sensori attivi").
  "Telegram non configurato" resta marcato come scelta dichiarata (card #66 in coda), non
  come guasto.

## Perché ora
Trovato investigando un log di test residuo (`.giro-test-full.log`, non committato):
`cervello/test/scadenze-calcolate.test.mjs` era rosso sul file vero — e quel test, per
costruzione, va rosso su OGNI PR che tocca `auto-analisi.json`, non solo quelle che
c'entrano con questo contenuto.

## Provato
- `node --test cervello/test/scadenze-calcolate.test.mjs` → 21/21 verdi (incluso il test
  che tiene allineati il contratto e i tile della Cabina).
- `npx tsc --noEmit` in `pannello/` → pulito.

## Cosa non ho verificato
Non ho aperto il Pannello nel browser per vedere i due nuovi riquadri a video (sessione
senza dev server). Il typecheck e il test del contratto sono puliti, ma un controllo visivo
resta da fare prima di considerarlo definitivo.

## Un secondo difetto trovato, NON incluso in questa PR
`cervello/test/una-card-una-volta-sola.test.mjs` è rosso sul mondo vero, per un motivo
diverso e più a monte: il guardiano `cervello/sensori-spenti-check.mjs` usa UN SOLO
segnalibro globale (`<!-- sensori-spenti-senza-motivo -->`) per non ripetere la card. La
prima volta ha coperto `sito_uptime`/`telegram_bot` (card #66, già in coda). Ora un sensore
diverso — `mcp_supabase` — è spento senza un motivo dichiarato, ma il guardiano non può
fargli una card propria: il segnalibro esiste già, quindi resta rosso per sempre finché
qualcuno non dichiara a mano un motivo in `cervello/sensori-motivi.json`. Serve una card
verificarsi la logica di dedup (per-sensore, non globale) prima di sistemarlo — non l'ho
toccato qui perché non c'entra col contratto di `auto-analisi.json` e merita la sua PR.
