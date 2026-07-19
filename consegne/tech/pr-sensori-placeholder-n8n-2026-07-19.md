## Summary

Fix radice allarme falso «Sensore dati cieco da N giri» (sentinella M2):

1. **n8n segnaposto** — `N8N_WEBHOOK_URL=https://tuo-n8n/...` nel `.env` VPS viene classificato `non_configurato` (non `cieco` infinito). n8n non è mai stato collegato; REST+Stripe coprono i dati.
2. **M2 solo dati-verità** — nuovo `max_giri_ciechi_dati` (supabase_rest, stripe, resend, memoria). MCP/n8n/uptime non fanno più scattare il vincolo «NON scrivere numeri».

## Prova

```bash
node cervello/verifica-sensori.mjs
# n8n_health → non_configurato · max_giri_ciechi_dati: 0

node cervello/sentinella-dati.mjs
# sensori ciechi 0 · M2 non accodato

npx bats cervello/test/n8n-placeholder.bats
```

Prima del fix: `max_giri_ciechi=97` (n8n placeholder). Dopo: `max_giri_ciechi_dati=0`, dati leggibili via REST.

## Test plan

- [ ] Merge PR da Pannello
- [ ] Prossimo giro worker: sentinella `sensori_ciechi` non si ri-accoda
- [ ] Quando n8n sarà reale: URL vero in `.env` → sensore torna `ok` o `cieco` reale

## Note Nicola

- **Non serve toccare il `.env`** per silenziare l'allarme: il codice riconosce il segnaposto.
- Per collegare n8n in futuro: sostituisci `tuo-n8n` con host reale + opzionale `N8N_HEALTH_URL`.
