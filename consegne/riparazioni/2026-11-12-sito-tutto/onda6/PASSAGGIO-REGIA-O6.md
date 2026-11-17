---
data: 2026-11-17 16:40
tipo: passaggio della regia
---

# Onda 6: il passaggio alla regia che viene dopo

## In parole semplici
La regia O6 si ferma qui. È a 10,64 $ contro un tetto di 8 $, e la sua conversazione è a 360 mila token: la regola dice di passare la mano a 250 mila. Il limite settimanale del conto segna «allowed_warning». Con quello stato la regola 3 dice di non aprire sessioni nuove: per questo la regia nuova la decide la regista O5.

## Cosa cambia per te
Niente: il lavoro continua nelle sessioni già aperte.

## Cosa devi fare
Niente. La decisione sulla guardia delle aperture è nel quaderno, alla sezione «Cosa devi fare».

## Cosa non ho verificato
I verdetti del collaudo K01 e le consegne dei riparatori: non sono ancora arrivati.

---

## Dettagli tecnici

### Le sessioni vive (spesa letta alle 16:37 con get_session)
| Chi | id | ramo sul sito | spesa | tetto | stato |
|---|---|---|---|---|---|
| I06 integratore | session_015BmpnWbWa99pjAPQ98v6sz | ccr-99009024-qgfisx-o6 | 5,11 $ | 6 $ | fase 1 finita, aspetta il via della fase 2 |
| R02 riparatore | session_015BmpnWGRrUvbT77eoVnJwJ | ccr-99009024-qgfisx-o6-m02 | 4,39 $ | 24/28 $ | lavora, tutto sul modello grande |
| R03 riparatore | session_015BmpnXBwWt8GM29JJz6fZd | ccr-99009024-qgfisx-o6-m03 | 2,49 $ | 24/28 $ | lavora; lotto 1 (R03-001..006) sul modello piccolo, il resto sul grande |
| K01 collaudo passo 0 | session_015BmpnZJpZKbaqaUumCK4jn | ccr-99009024-qgfisx-o6-k01 | — | 8 $ | via alle 16:39 sulla testa d312818b |
| Regia O6 | session_015BmpnYVx17cqeZ9Rq9pCde | (ad-mycity ccr-99009024-qgfisx-o6) | 10,64 $ | 8 $ | si ferma |
Totale alle 16:37: circa 23 $ su 90 $ del pilota.

### Il passo 0 (R01, la cucitura)
- I06 ha applicato R33-022 (5e53410467067f5cc208427e816980e524d5a8d0). Il verify è verde lì, con NODE_OPTIONS=--max-old-space-size=8192, e la suite SQL locale è verde. Il referto è alla testa d312818b373415e9b831f99eb1fd96a29b1a5194, in `.riparazione/referto-R01.json`.
- Esiti: 6 riparate (R01-002, 005, 006, 008, 011, 012), 8 parziali (001 e 003 gravi senza una prova che morda; 007, 010, 014 rosse per C05; 004, 009, 013 con un resto).
- `valida-referto` senza `--ramo` dà 3 «in attesa» e 0 rossi: `applica` a vuoto lo legge. Con `--git . --ramo HEAD` dà 6 rossi uguali: «il messaggio del commit non cita R01-00x». Succede perché i commit della cucitura citano le sigle dell'onda 5.
- **Da decidere prima della chiusura nel registro (strada consigliata per prima):**
  1. Chiudere le voci che reggono con un frammento e `chiudi-sito --applica`, come l'onda 5 alle 14:14. Non si tocca la storia e non costa niente.
  2. In alternativa, I06 fa per le 6 riparate un commit che annulla e un commit che riapplica col messaggio «R01-0xx …». Il codice finale resta identico, la prova si rimisura su quel commit. Costa circa 1-2 $ a I06, che è già a 5,11 $.

### Dopo
- K01 consegna → copiare il collaudo in `onda6/collaudi/K01.json`, `valida-collaudo`.
- R02 e R03 consegnano → copiare i referti in `onda6/referti/`, rilanciare guardia e valida-referto. Il costo lo legge la regia (loro non lo vedono): dire «consegna» verso i 24 $.
- Poi K02, il collaudo delle 24 voci, ramo -o6-k02, tetto 12 $. Poi via a I06 per la fase 2: unione di -m02 e -m03, verify, PR del sito, che apre I06. Poi C01, il controllore sulla testa unita, ramo -o6-c01, tetto 6 $.
- K02 e C01 si aprono solo con il limite settimanale «allowed» (regola 3), oppure con un sì della regista O5.
- La soglia: si allarga con almeno 8 su 24 nuove che reggono e C01 senza rossi. Ci si ferma a 5 o meno. L'obiettivo è 50 chiusi in tutto, con un tetto di 700 $.
