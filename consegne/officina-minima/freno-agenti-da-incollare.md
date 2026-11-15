---
tipo: consegna
data: 2026-11-15 07:00
per: Nicola
---

# Il freno sugli agenti: il pezzo da incollare nelle impostazioni

## In parole semplici
Il freno conta quanti agenti apre ogni sessione di una riparazione, e ferma quello di troppo.
Il programma è pronto e provato, ma parte solo quando il blocco qui sotto sta nelle impostazioni.
Le impostazioni le può cambiare solo Nicola: nessuna sessione le tocca.

## Cosa cambia per te
Dopo l'incollo un riparatore di minori non apre il settimo agente, e un collaudatore non apre il quinto.
Esempio: nell'onda 2 R17 ne ha aperti 15 con un tetto scritto di 12. Con il freno si sarebbe fermato a 6 o a 8.
Le altre sessioni (l'AD, il giro, i senior) non hanno nessun tetto da qui.

## Cosa devi fare
1. Aprire `.claude/settings.json` di ad-mycity.
2. Dentro `"PreToolUse"`, aggiungere il blocco qui sotto come nuova voce dell'elenco.
3. Fare lo stesso nel sito (mycity) solo se le sessioni del sito hanno anche ad-mycity accanto (vedi sotto).

## Cosa non ho verificato
Non l'ho provato su una sessione vera del cloud: le prove fanno girare l'hook come lo lancia Claude Code, con i dati su stdin.
Non so se le sessioni del sito hanno la cartella ad-mycity accanto: se manca, l'hook del sito non parte e non frena.

---

## Dettagli tecnici

Il blocco per ad-mycity (una voce nuova dell'elenco `hooks.PreToolUse`):

```json
{
  "matcher": "Agent|Task|Workflow",
  "hooks": [
    { "type": "command", "command": "node cervello/riparazione/freno-subagenti.mjs", "timeout": 10 }
  ]
}
```

Per il sito il comando deve puntare alla copia di ad-mycity, per esempio
`node ../ad-mycity/cervello/riparazione/freno-subagenti.mjs`. Se quel file non c'è, node esce 1: per Claude Code
è un errore che non blocca, quindi il freno resta spento senza fermare il lavoro.

Come la sessione riceve il suo tetto: la regista mette come **prima riga** del prompt con cui apre la sessione la
riga `ruolo-freno: …` che sta nel frontmatter della scheda (`riparatore-minori` 6, `riparatore-gravi` 8). Per gli
altri ruoli la riga si scrive a mano: `collaudatore` 4, `controllore` 4, `regia` 2. Il ruolo si fissa al primo
lancio e non cambia più. Senza la riga la sessione non ha tetto da questo hook (resta il controllo dopo, in
`valida-referto`, sul numero di subagenti scritto nel referto).

Prova: `node --test cervello/test/freno-subagenti.test.mjs` (8 casi, 4 mutazioni AR-1180 in `cervello/mutanti.json`).
