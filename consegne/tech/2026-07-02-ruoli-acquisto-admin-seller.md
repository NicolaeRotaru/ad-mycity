# Ruoli acquisto — admin bloccato, seller solo via pulsante

**Data:** 2026-07-02 (decisione Nicola, casella briefing 1/7)  
**Colore:** 🟡 codice pronto · 🔴 deploy produzione  
**Branch marketplace:** `fix/ruoli-acquisto-admin-seller-2026-07-02` (repo `NicolaeRotaru/mycity`, locale `/opt/mycity/marketplace`)

## Problema (stato prima)

| Ruolo | Comportamento attuale | Bug |
|-------|----------------------|-----|
| **Admin** (Assistenza MyCity) | Navbar senza carrello, ma `addToCart` + API checkout/COD **senza blocco ruolo** | Carrello test €7,95 in DB (`admin@piacenza-demo.local`) — inquinava CRM |
| **Seller** | Poteva aprire `/`, prodotti, carrello localStorage; login atterrava su dashboard ma link/errori portavano al catalogo | Confusione ruolo + carrelli demo (#3 Casa Linda, #4 Pane Quotidiano seller) |

## Decisione Nicola

1. **Admin/assistenza:** non devono poter comprare — mai.
2. **Retailer (seller):** comprano sul marketplace **solo** entrando dal pulsante «Vai al marketplace»; nessun altro percorso (errori, URL dirette) deve lasciarli sul catalogo.

## Soluzione implementata

### Admin — blocco acquisto totale
- UI: niente carrello in navbar; `+` prodotto e checkout disabilitati con messaggio.
- API: `assertCanPurchase()` su `/api/stripe/checkout` e `/api/orders/cod` → **403** per `role=admin`.

### Seller — modalità acquisto esplicita
- Pulsante SellerShell / stati pending/suspended → `/?shop=1` (non `/` nudo).
- Middleware: cookie `mycity_shopping_mode=1` (8h); senza cookie il seller su catalogo/carrello/checkout → **redirect `/seller/dashboard`**.
- In modalità acquisto: banner «Modalità acquisto · Torna al negozio», carrello in navbar, tab mobile stile buyer.
- Uscita: `Torna al negozio` → `/seller/dashboard?exit_shop=1` (cookie cancellato).

### File toccati (marketplace)
- `lib/shopping-access.ts` (nuovo)
- `middleware.ts`
- `lib/api/middleware.ts` + checkout/COD API
- `components/hooks/useShoppingMode.ts`, `SellerShoppingBanner.tsx`
- `Navbar.tsx`, `MobileTabBar.tsx`, `ProductCard.tsx`, `product/[id]/page.tsx`
- `seller/SellerShell.tsx`, `seller/layout.tsx`, `app/layout.tsx`

## Impatto sui 4 carrelli del briefing 1/7

| # | Account | Dopo il fix |
|---|---------|-------------|
| 1 | samir (buyer) | Invariato — unico recovery reale |
| 2 | Assistenza admin | **Non può più creare ordini**; carrello esistente ignorabile (SKIP CRM) |
| 3–4 | Seed seller/demo | **Non accedono al catalogo** senza modalità; carrelli restano dati storici |

## Deploy

🟡 **Nicola:** `ok merge fix/ruoli-acquisto-admin-seller` → PR su `mycity` → anteprima Render → ok → produzione.

**Test rapido post-deploy:**
1. Login admin → apri prodotto → «Aggiungi» → toast blocco; checkout API 403.
2. Login seller → digita `/` → redirect dashboard.
3. Seller → «Vai al marketplace» → banner + carrello; completa flusso o esci «Torna al negozio».
