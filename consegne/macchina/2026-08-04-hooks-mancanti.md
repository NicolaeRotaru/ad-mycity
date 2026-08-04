---
tipo: consegna
reparto: macchina
data: 2026-08-04 01:45
---

# I quattro freni nuovi, e il blocco da incollare

## In parole semplici

Questa consegna parla dei controlli automatici che rileggono il mio lavoro mentre lo faccio.
Servono a farmi trovare i miei errori da solo, invece di lasciarli trovare a te.
Mi hai chiesto di creare quelli che mancavano: qui ci sono, e qui c'è cosa devi fare tu.

La macchina ha nove momenti in cui può accendere un controllo. Ne usava due.
Ho costruito i quattro pezzi che coprono i momenti spenti che contano.
Sono scritti, provati e girano: li ho lanciati tutti con eventi finti.
Manca un passo solo, ed è tuo: incollare il blocco qui sotto in un file che io non posso toccare.
Finché non lo fai, i quattro freni esistono ma non frenano.

Esempio concreto, di ieri. Il 3 agosto ti ho mandato una risposta e il freno di chiusura mi ha fermato.
Mi ha contestato 8 cose. Di quelle 8, ben 7 erano file scritti il 31 luglio, che non avevo aperto.
Una sola riguardava il lavoro di quel momento.
Succedeva perché il freno non sapeva dove cominciava il mio turno.
Il primo dei quattro pezzi risolve esattamente quello.

## Cosa cambia per te

**Uno.** Quando un mio senior finisce di lavorare, adesso c'è un controllo.
Prima non c'era: i senior consegnavano e nessuno guardava cosa lasciavano per terra.
Sono il canale che produce più lavoro di tutti, ed era l'unico senza freno.

**Due.** Quando scrivo un file che esce da questa copia, la macchina te lo chiede.
Alcuni strumenti scrivono direttamente su GitHub, saltando ogni controllo locale.
Non passano dal controllo sui segreti, che è quello che ferma una chiave vera.
Adesso ti chiede il permesso invece di farlo e basta.

**Tre.** Il freno di chiusura sa dove comincia il tuo messaggio.
Quindi ti parla del lavoro di adesso, non di quello di tre giorni fa.

**Quattro.** Quello che le guardie trovano non muore più con la sessione.
Prima ogni sessione nuova ripartiva senza memoria di cosa era rimasto aperto.

## Cosa devi fare

Apri il file `.claude/settings.json`.
Sostituisci tutta la parte che comincia con `"hooks"` col blocco qui sotto.
Poi lancia questo comando: `node cervello/hooks-check.mjs`.
Ti dirà se ha attaccato tutto o se qualcosa non torna.

Non devi controllare tu che il blocco sia scritto bene: l'ho già provato.
L'ho scritto in un file di prova e ci ho fatto girare sopra il guardiano.
Risultato: dieci comandi su otto momenti, tutti validi, nessuno staccato.
Il primo agosto il blocco che avevi incollato aveva due errori.
Uno era una parentesi mancante, l'altro una lettera minuscola.
Qui non ci sono, e non per fortuna: è il guardiano che l'ha detto.

Se non lo incolli entro l'undici agosto, il guardiano diventa rosso da solo.
È voluto: un'attesa senza scadenza è un permesso travestito.

## Il blocco da incollare

```json
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash cervello/installa-hooks.sh >/dev/null 2>&1; node cervello/contesto-lezioni.mjs --hook"
          },
          {
            "type": "command",
            "command": "node cervello/memoria-guardia.mjs --apri --hook",
            "timeout": 15
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node cervello/intento-turno.mjs --hook",
            "timeout": 10
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash|Task|mcp__.*",
        "hooks": [
          {
            "type": "command",
            "command": "node cervello/pre-scrittura.mjs --hook",
            "timeout": 10
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit|NotebookEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node cervello/sorvegliante.mjs --hook",
            "timeout": 15
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node cervello/misura-cieca.mjs --hook",
            "timeout": 10
          }
        ]
      }
    ],
    "SubagentStop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node cervello/cancello-senior.mjs --hook",
            "timeout": 20
          }
        ]
      }
    ],
    "PreCompact": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node cervello/memoria-guardia.mjs --consegna --hook",
            "timeout": 10
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node cervello/cancello-stop.mjs --hook",
            "timeout": 20
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node cervello/memoria-guardia.mjs --chiudi --hook",
            "timeout": 15
          }
        ]
      }
    ]
  }
```

## Cosa non ho verificato

Non ho provato i freni dentro una sessione vera con gli hook attaccati.
Li ho provati uno per uno, con eventi finti dati in pasto a mano.
La differenza conta: che il programma risponda bene non dimostra che il programma venga chiamato.
È lo stesso difetto del trenta luglio, quando una guardia girò un giorno intero parlando a nessuno.
Solo tu puoi chiudere questa parte, incollando il blocco e guardando cosa succede.

Non ho attaccato niente al nono momento, quello che scatta quando la macchina resta in attesa.
Per la guardia non ha un mestiere, e attaccarci qualcosa tanto per fare sarebbe rumore.
Ha un mestiere per il worker sul server, ma è un lavoro suo e va aperto a parte.

## Dettagli tecnici

I quattro file nuovi, con il momento a cui vanno agganciati e il difetto che chiudono:

| File | Evento | Difetto |
|---|---|---|
| `cervello/intento-turno.mjs` | `UserPromptSubmit` | AR-522 — il perimetro del turno non esiste al primo giro |
| `cervello/pre-scrittura.mjs` | `PreToolUse` | AR-525 — le scritture MCP non le guarda nessuna guardia |
| `cervello/cancello-senior.mjs` | `SubagentStop` | AR-527 — i 120 senior consegnano senza cancello |
| `cervello/memoria-guardia.mjs` | `SessionStart` + `PreCompact` + `SessionEnd` | AR-528 — quello che la guardia trova muore con la copia |

Modifiche ai pezzi che c'erano già:

- `cervello/hooks-check.mjs` — AR-526, la terza strada: un freno costruito e non ancora agganciato è giallo se dichiarato con PR e scadenza in `cervello/hook-in-attesa.json`, rosso se la data manca o è passata. Non tocca `freniNonAttaccati`: quella riga è il `cerca` di una mutazione di AR-455.
- `cervello/sorvegliante.mjs` — due funzioni esportate in più, `difeseDelRepo()` e `vociDaScatto()`. Nessuna riga esistente cambia significato: le 20 dipendenze restano valide.
- `cervello/mutanti.json` — 13 mutazioni nuove.
- `cervello/materiale-in-mano.mjs` + `cervello/cancello-lotto.mjs` — AR-524, il guardiano nato dalla domanda di Nicola del 4/8: una card che chiede un gesto di copia deve portare il materiale dentro di sé.

Prove: 75 nuove, contate una per una (`grep -c "^test("` sui sette file), tutte verdi.
Mutazioni: 192 in totale, 13 mie, tutte rendono rosso il loro test (`node cervello/non-vacuita.mjs`).

Correzione dichiarata: in un primo momento avevo scritto «47 prove» e poi «51», e nel messaggio in chat «169 su 169» e «172 su 172». Erano numeri veri in un momento e mai ricontati dopo il rebase su un `main` che nel frattempo aveva aggiunto le sue mutazioni. I numeri qui sopra sono contati adesso, sul ramo com'è.
Blocco verificato: `node cervello/hooks-check.mjs` su un file candidato → 10 comandi su 8 eventi, uscita 0.

Un difetto nuovo trovato mentre costruivo, e non riparato: AR-523. `non-vacuita.mjs` applica le mutazioni ai file veri e li ripristina alla fine; se muore a metà (un timeout, un Ctrl-C) lascia il repo con un fix disfatto. È successo davvero in questo lotto su `cervello/git-pr.mjs`, col fix di AR-451 annullato. L'ha trovato il sorvegliante al primo Edit dopo, con una voce `prova-accecata`. Ripristinato a mano, scheda aperta col fix proposto: ripristino in `finally` più una trap sui segnali, o meglio mutare una copia invece del file vero.
