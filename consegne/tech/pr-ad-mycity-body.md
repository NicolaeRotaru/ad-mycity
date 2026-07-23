## Cosa

Il freno "fermati se superi il budget token giornaliero" (`cervello/costo-ai.mjs`) non scattava mai:
il contatore usato dal gate (`token_totali`) resta a 0 per costruzione, perché `giro.sh`/`ritmo.sh`
passano SEMPRE `--stima` (nessuna fonte di conteggio reale esiste in questa sessione CLI) — e le
stime, per design, non alzavano quel contatore.

## Perché

Trovato nell'auto-radiografia del 23/7 (AR-144) — nello stesso giorno il "Piano del mattino" si è
ripetuto 7 volte in ~100 minuti (oltre 1,3M token stimati), e il gate è rimasto silenzioso per
tutto il tempo perché confrontava la soglia con uno zero. Dettagli in
`MyCity-Vault/90-Memoria-AI/RADIOGRAFIA-MACCHINA.md`.

## Cosa cambia (in pratica)

Il gate ora guarda il PIÙ ALTO fra token reali e token stimati (non li somma, così se un giorno
arriva un conteggio vero non si "diluisce" con le stime). Finché arriva solo la stima — sempre,
oggi — è lei a far scattare l'allarme oltre soglia. Il messaggio del sensore ora mostra entrambi i
numeri (reali + stimati) invece di uno solo, così è chiaro su cosa si basa il gate.

## Come si prova

- Letto il codice riga per riga e contato parentesi/graffe bilanciate (52/52 `{}`, 99/99 `()`) —
  **non sono riuscito a eseguire `node cervello/costo-ai.mjs` per una prova dal vivo**: il comando è
  stato negato dal sistema di permessi in questa sessione (stesso comando che in teoria è in
  allowlist, ma il permesso non è arrivato). Lo dichiaro esplicitamente: verifica solo per lettura,
  non per esecuzione. Consiglio di lanciarlo a mano una volta (`node cervello/costo-ai.mjs --json`)
  dopo il merge per conferma, prima di fidarsi ciecamente del gate nuovo.
- Modifica piccola e localizzata (due righe di calcolo + due stringhe di log), nessun cambio allo
  schema del file salvato né alla logica di accumulo dei contatori esistenti.

## Non ancora fatto (fuori scope)

- Non risolve la causa delle ripetizioni a raffica del giro/ritmo (AR-145) — quello è un fix
  separato, già proposto, non incluso qui.
