# PR: Cassa/runway — messaggio corretto + sentinella M6b

## Problema
- Runway «sconosciuto» da 87 giri; messaggio sensore diceva «collega STRIPE_SECRET_KEY» ma Stripe **è già ok** (cassa 0€ letta).
- Blocco reale: `BURN_MENSILE_EUR` mancante nel .env VPS.
- `sentinella-dati.mjs` M6 copriva solo runway **critico**, non cecità persistente (difetto radiografia Opus 7/7).

## Fix
1. `sensore-cassa.mjs`: istruzioni distinguono Stripe ok / burn mancante / entrambi ciechi.
2. `sentinella-dati.mjs` M6b: allerta 🟡 `cassa_sconosciuta` se `giri_sconosciuto ≥ 5`.

## Test
```bash
node cervello/sensore-cassa.mjs          # messaggio «Stripe ok, manca BURN»
node cervello/verifica-sensori.mjs       # stripe_api ok
```

## Non tocca
- Nessun valore burn inventato
- Nessuna modifica env produzione (accodata azione #burn-mensile-runway per Nicola)
