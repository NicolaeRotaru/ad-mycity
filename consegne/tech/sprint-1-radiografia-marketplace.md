---
tipo: consegna-tech
data: 2026-07-01 07:30
fonte: tech + security (Sprint 1 radiografia)
branch: fix/sprint-1-radiografia-2026-07-01
repo: NicolaeRotaru/mycity
---

# Sprint 1 radiografia — fix marketplace

**Stato:** branch pronto · **no deploy** (🔴 firma Nicola separata)

## Fix inclusi (4 bloccanti + urgenti)

| # | Problema | Fix |
|---|----------|-----|
| 1 | Webhook Stripe marca COMPLETED senza ordini | COMPLETED solo se `createdOrderIds.length === groups.length`; errori → throw 500 (retry Stripe); idempotenza 23505 recupera ordine esistente |
| 2 | Fee €3/consegna/negozio assente in checkout UI | `platformDeliveryFee` in checkout + riga "Consegna MyCity" in OrderSummary |
| 3 | RLS profiles espone IBAN/KYC/wallet | Migration `107_seller_public_profiles.sql`: VIEW vetrina + drop policy permissiva; query pubbliche migrate |
| 4 | COD order_items fallito → ordine fantasma | Rollback: delete ordine, restore stock, storno wallet, no notifiche; multi-negozio atomico |
| 5 | Multi-variante stesso prodotto rifiutato | `uniqueProductIds` Set in COD + Stripe checkout |
| 6 | Doppio restore stock su charge.refunded | Skip restore se `payment_status === 'REFUNDED'` (già gestito da refundOrder) |

## File toccati (principali)

- `app/api/stripe/webhook/route.ts`
- `app/api/orders/cod/route.ts`
- `app/api/stripe/checkout/route.ts`
- `app/checkout/page.tsx`, `components/checkout/OrderSummary.tsx`
- `migrations/107_seller_public_profiles.sql`
- `lib/queries/seller-public-profiles.ts`
- Vetrina pubblica: stores, StoreShowcase, store layouts, ProductGrid, SearchBar, sitemap, useStorePageData

## Prima del deploy 🔴

1. **Migrare DB prod:** `107_seller_public_profiles.sql`
2. QA smoke: checkout COD 2 negozi, carta Stripe test, stessa maglietta S+M, verifica totale con fee
3. Verificare che IBAN/KYC non siano più leggibili via API anon su `profiles`
4. Nicola: **`ok deploy Sprint 1`**

## Prossimo

Sprint 2 (privacy/sicurezza): CAPTCHA fail-closed, AI refresh, group_participants — accodato dopo review Sprint 1.
