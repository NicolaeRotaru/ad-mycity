## Cosa cambia

La card "Sala Operativa" (e ogni altra card che usa `codaTesto`, es. "Decisioni") mostrava
l'avviso di troncamento incollato al primo rigo del contenuto vero, senza andare a capo:

```
…(troncato, mostro la parte più recente)
: la lezione L-2026-0730-530 dichiarava attivo il gate...
```

Ora l'avviso è in corsivo con un separatore `---` prima del contenuto, così ReactMarkdown lo
rende come blocco a sé (nota separata), non come parte del testo.

## Perché

Nicola, 4/8 19:36, screenshot alla mano: ha scambiato l'avviso per un errore vero ("la casella
parte troncata, lo vedi?"). Causa: `codaTesto()` in `pannello/src/lib/vault.ts` usava un solo
`\n` tra avviso e contenuto — in markdown due righe con un solo a-capo restano nello stesso
paragrafo.

## Come provare

1. `npx tsc --noEmit` da dentro `pannello/` → pulito (verificato).
2. Dal vivo dopo il deploy: aprire una card con testo > 6000 caratteri (es. Sala Operativa,
   Decisioni) e controllare che l'avviso appaia separato dal contenuto da una riga vuota + linea
   orizzontale.
3. Test unitario aggiunto: `pannello/src/lib/vault-coda-testo.test.mts` — **non eseguito** in
   questa sessione: `vault.ts` importa `./obsidian` senza estensione, e `node --test` nativo non
   risolve import extensionless (limite preesistente, non introdotto da questo fix — nessun altro
   test esistente importa `vault.ts` per lo stesso motivo). I tentativi di eseguire uno script di
   verifica standalone per controllare la stringa a mano sono stati bloccati dai permessi della
   sandbox di questa sessione. La logica è stata riletta a mano (semplice template string) ma non
   eseguita — dichiaro questo limite invece di fingere un test verde.

## Correlato

Registrato anche AR-560 nel cantiere difetti: un bug diverso e più serio (le risposte dell'AD in
chat si incollano senza separatore quando scatta il cancello di stop, in `cervello/worker.sh`) —
NON toccato in questa PR, richiede un fix separato e più delicato su un file condiviso da tutte le
chat del Pannello.
