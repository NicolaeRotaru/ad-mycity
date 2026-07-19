## Summary
- Rinomina migration duplicata `107_seller_public_profiles` → `112_*` (prefisso 107 già usato).
- Aggiorna mock test Stripe checkout: `profile` + `assertCanPurchase` + `claim_coupon` RPC (fix #36).

## Test plan
- [ ] CI job «Unit tests» verde su questa PR
- [ ] CI lint + build verde
- [ ] Nessun cambiamento funzionale al sito (solo test + rename file migration non ancora applicato in prod con doppio 107)
