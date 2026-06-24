---
tipo: piano-fix
data: 2026-06-24
fonte: audit-design (workflow, ogni problema verificato)
report-dettagli: consegne/design/2026-06-24-audit-design.md
---

# 🛠️ PIANO FIX DESIGN — i 4 gruppi rimasti

> Dall'audit-design (87 problemi: 2 bloccanti, 36 gravi, 49 minori). I dettagli completi (dove + fix esatto)
> sono in `consegne/design/2026-06-24-audit-design.md`. Qui i 4 gruppi rimasti, pronti da eseguire uno alla volta.

## ✅ Già fatto
- **Bloccanti (2)** → PR #199 *(merged)* — checkout mobile: tab bar copriva "Conferma ordine".
- **Gruppo 1 — Conversione & messaggi (8)** → PR #200 *(merged)* — carrello ospiti, upsell varianti, slot consegna, microcopy pagamento, newsletter, spedizione "stima".

---

## ▶️ COME ESEGUIRE UN GRUPPO (in un'altra sessione)
**Prerequisiti:** Claude Code aperto in questa cartella (`secondo cervello`); `mycity-live` presente in
`C:\Users\InfinitaPossibilita\mycity-live` e aggiornato su `main`.

1. Di' all'AD: **«sistema il gruppo 2 dell'audit design»** (o 3, 4, 5).
2. L'AD legge questo piano + il report (per dove/fix), crea un **worktree git isolato** di mycity-live
   (`fix/groupN-…`) così non disturba altre sessioni, e **delega al frontend-dev** l'implementazione.
3. L'AD fa **push del branch e apre la PR** (via API GitHub — `gh` non serve) e ti dà il link.
4. **Render genera l'anteprima** automatica sulla PR → la controlli (specie in **mobile**) → se ok, **Merge** = online.
5. **Ordine consigliato:** 2 → 3 → 4 → 5. ⚠️ I gruppi **3 e 4 toccano gli stessi token** (`tailwind.config.ts`,
   `design-system/tokens`, `globals.css`): mergiali in sequenza e risolvi eventuali piccoli conflitti.

*Alternativa manuale:* in `mycity-live` → `git worktree add ../mycity-gN -b fix/groupN main`, poi lavori lì.

---

## 🆘 GRUPPO 2 — Errori "finti vuoti" (6 · tutti 🛠️ codice)
Se la rete fallisce, queste pagine dicono "niente qui" invece di "errore". Manca un componente `ErrorState`
condiviso → crearne uno (riusa lo stile di `EmptyState`).
- **ProductGrid** → `components/ProductGrid.tsx` (useQuery r.72; empty r.293-332)
- **Ordini** → `app/orders/page.tsx` (r.103; empty r.139-154)
- **Preferiti** → `app/favorites/page.tsx` (queryFn r.18-28 ignora l'errore DB; empty r.49-63)
- **Negozi** → `app/stores/page.tsx` (fetch r.24-30; render r.132-217)
- **StoreShowcase (home)** → `components/StoreShowcase.tsx` (fetch r.11-21) — manca anche lo skeleton
- **Scheda prodotto** → `app/product/[id]/page.tsx` (r.206; queryFn r.79-88)

## 🔆 GRUPPO 3 — Contrasto & leggibilità (8 → ~5 fix · 🛠️ codice)
Molti dipendono dallo stesso colore `accent` troppo chiaro.
- **Plugin typography mancante** (pagine legali senza spaziatura) → `tailwind.config.ts` + `components/ui/LegalLayout.tsx:71`
- **Stelle illeggibili** (★ accent-500 su bianco, 2.0:1) → product page, seller/reviews, `ReviewsSection`, orders/review → usare `accent-700` o icona Lucide
- **Focus invisibile** su navbar/categorie → `app/globals.css:154-157` + `Navbar`/`CategoryBar`/`LocationPill`
- **Tab attiva CategoryBar** sotto soglia → `components/CategoryBar.tsx` (r.90/99/118)
- **Testo bianco su accent-500** nei CTA → `rider/RiderConnectButton`, `rider/CashConfirmDialog`, `seller/layout:90` → `text-ink-900`
- **Wordmark footer** slavato (1.85:1) → `components/Footer.tsx:99` → `accent-700`/`primary-700`

## 🎨 GRUPPO 4 — Coerenza brand + Layout (7 · 🛠️ codice)
Brand:
- **CTA mostarda** con hover divergenti → usare `Button variant='accent'` (Navbar, StickyAddToCart, ProductQA, seller/layout, admin/support, HomeSectionRenderer, DropOfDay)
- **Badge sconto in 3 colori** → `Badge variant='discount'` ovunque (PromotionsSection, events)
- **"Promozioni attive" rosa fuori palette** → `components/store-sections/PromotionsSection.tsx`
- **Stelle: 2 sistemi di icone** → estrarre un componente `RatingStars` condiviso (Lucide)
- **Token `--danger` disallineato** → `tailwind.config.ts` + `design-system/tokens/colors.css:112` + `components/ui/Button.tsx:29`
Layout:
- **Card "Acquista" su tablet (md)** fuori posto → `app/product/[id]/page.tsx:360/704` (`md:col-span-2`)
- **Offset sticky `top-32` < header ~144px** → CSS var `--header-height` (Navbar:84 + cart/product/checkout/category/search/settings)

## 🖼️ GRUPPO 5 — Immagini / Social / PWA (6)
- **OG image social off-brand** (prodotto + negozio, palette rifiutata + emoji) → `app/product/[id]/opengraph-image.tsx`, `app/store/[id]/opengraph-image.tsx` → palette brand 🛠️
- **OG mancante per home/pagine** + twitter card "summary" → creare `app/opengraph-image.tsx` + `twitter.card='summary_large_image'` in `app/layout.tsx` 🛠️
- **Icone PWA/Apple solo SVG** (iOS home vuota, niente maskable) → generare PNG 180/192/512 + maskable; aggiornare `public/manifest.json` + `app/layout.tsx` 🛠️
- **X dell'onboarding** ancorata allo schermo → `components/BuyerOnboardingTour.tsx` (aggiungere `relative` alla card) 🛠️
- **Catalogo foto stock Pexels** (non foto reali) → sostituire le immagini (seeding/contenuto) ⚡ config/contenuto, no deploy

---

## ⚡ VITTORIE RAPIDE (config, da `/admin/home`, SENZA deploy)
- Hero **"30-60 min" → "24-48h"** (`site_settings.home_site` → hero subhead)
- **2 sezioni "Prodotti popolari" duplicate** → disabilitarne una
- **Sezioni placeholder** (video/banner/gallery "gallerai") → disabilitare/correggere il refuso
- Catalogo Pexels → sostituire con foto reali (contenuto)

## 🟡 49 MINORI
Nel report completo `consegne/design/2026-06-24-audit-design.md` — da affrontare dopo i 4 gruppi (es. refusi, "Inizia a esplorare" incoerente, prezzo doppio scheda prodotto, coupon senza loading, ecc.).
