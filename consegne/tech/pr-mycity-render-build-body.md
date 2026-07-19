## Summary
- Fix build Render: errore TypeScript su `app/orders/page.tsx` (`.catch` su PromiseLike Supabase).
- Aggiunge memoria Node al build su Render (`NODE_OPTIONS=4096`) per evitare OOM.

## Test plan
- [ ] CI «Lint + Typecheck + Build» verde
- [ ] Dopo merge: deploy Render verde (~2–3 min) e sito aggiornato con icona carrello (#214)
