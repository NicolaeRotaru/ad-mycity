## Summary

- **n8n placeholder:** `N8N_WEBHOOK_URL` con host `tuo-n8n` non conta più come sensore cieco — passa a `non_configurato` e azzera il contatore.
- **Sentinella M2:** legge `max_giri_ciechi_dati` (solo supabase_rest, stripe_api, supabase_memoria) invece del massimo su tutti i sensori — stop falso allarme «dati ciechi» quando REST è ok.
- Diagnosi: `consegne/tech/2026-07-19-diagnosi-sensori-ciechi.md`

## Test plan

- [x] `node cervello/verifica-sensori.mjs` → n8n = placeholder non_configurato, exit 0
- [x] `sensori-cecita.json` → `max_giri_ciechi_dati: 0` con REST ok
- [ ] Dopo merge: prossimo giro non accoda più card M2 «sensori ciechi» per n8n da sola

## Prova locale (19/7 13:10)

```
n8n_health → N8N URL placeholder (tuo-n8n) — hub automazioni non ancora collegato
ℹ️  Sensori ausiliari ciechi (max 7 giri) — dati KPI ok, nessun blocco numeri.
```
