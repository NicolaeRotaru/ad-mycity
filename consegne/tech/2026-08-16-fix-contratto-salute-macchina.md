# Fix: il controllo bocciava due dati che il giro scrive già da tempo

## In parole semplici
Il giro scrive due dati in più dentro `salute_macchina`. Un dato è quanti sensori
si dichiarano spenti. L'altro è se Telegram è collegato. Il controllo automatico
che tiene pulito il file non conosceva questi due dati. Per questo li bocciava.
È lo stesso problema già risolto il 10/8 per "sito negozi".

## Cosa cambia per te
Prima questo test era rosso su ogni PR che tocca `auto-analisi.json`, anche
quando la PR non c'entrava niente col contenuto. Ora è verde. In più, la Cabina
mostra due nuovi riquadri: quanti sensori sono ciechi, e se Telegram è collegato.
Prima questa informazione il giro la scriveva ma nessuno la vedeva.

## Cosa devi fare
Niente per ora. Apri la PR #740 dal Pannello quando vuoi mergiarla. Prima di
considerarla definitiva manca solo un controllo a video dei due nuovi riquadri
(vedi sotto).

## Cosa non ho verificato
Non ho aperto il Pannello nel browser. Non ho visto i due nuovi riquadri a
video. La sessione non aveva un dev server attivo. Il typecheck e il test del
contratto sono puliti, ma un controllo visivo resta da fare.

## Un secondo difetto trovato, non incluso in questa PR
Un test diverso (`cervello/test/una-card-una-volta-sola.test.mjs`) è rosso sul
mondo vero. La causa è un'altra e più a monte. Il guardiano
`cervello/sensori-spenti-check.mjs` usa un solo segnalibro per non ripetere la
stessa card più volte. La prima volta il segnalibro ha coperto due sensori
(card #66, già in coda). Ora un sensore diverso è spento senza un motivo
dichiarato. Il guardiano non può fargli una card propria: il segnalibro esiste
già, quindi il test resta rosso finché qualcuno non dichiara un motivo a mano.
Serve prima sistemare la logica del guardiano (un segnalibro per sensore, non
uno solo per tutti). Non l'ho toccato qui perché non c'entra con questo fix e
merita una PR sua.

## 🔧 Dettagli tecnici
- File toccati: `cervello/valida-contratti.mjs` (le due chiavi entrano
  nell'elenco ammesso), `pannello/src/components/AutoCoscienza.tsx` +
  `pannello/src/lib/auto-coscienza-umana.ts` (i due nuovi riquadri).
- "Sensori ciechi" è verde solo a zero — più alto è peggio, al contrario di
  "sensori attivi".
- "Telegram non configurato" resta marcato come scelta dichiarata (card #66),
  non come guasto.
- Trovato investigando un log di test residuo non committato
  (`.giro-test-full.log`): `cervello/test/scadenze-calcolate.test.mjs` era
  rosso sul file vero.
- Provato: `node --test cervello/test/scadenze-calcolate.test.mjs` → 21/21
  verdi (incluso il test che tiene allineati contratto e tile della Cabina).
- Provato: `npx tsc --noEmit` in `pannello/` → pulito.
- Secondo difetto (non incluso): sensore `mcp_supabase` spento senza motivo
  dichiarato in `cervello/sensori-motivi.json`.
