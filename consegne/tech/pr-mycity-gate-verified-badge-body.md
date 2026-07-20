## Summary
- Aggiunge `lib/store-trust.ts::isVerifiedStore` (approvato + Stripe charges + payouts ON).
- Migrazione **108**: espone `stripe_charges_enabled` / `stripe_payouts_enabled` su `seller_public_profiles`.
- Applica il gate su tutti i punti badge (liste, card, home, vetrina, scheda venditore PDP).
- Rimuove il bollino dal placeholder demo in hero.
- Test anti-regressione `tests/unit/store-trust.test.ts` (3/3).

## Perché
Oggi ogni negozio in lista/card/home appariva «verificato» anche senza payout Stripe — segnale di fiducia falso. Fix richiesto da Nicola (casella trust-safety bollino, 20/7).

## Come provare
1. Apri `/stores` o home: **nessun** bollino su Pane Quotidiano (payout ancora OFF).
2. Pagina negozio PQ: niente bollino finché Stripe non è attivo.
3. `npm test -- tests/unit/store-trust.test.ts` → 3 passed.

## Merge
🟡 Nicola firma merge su main → deploy Render automatico.
