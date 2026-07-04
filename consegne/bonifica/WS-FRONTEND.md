# WS-FRONTEND — Pacchetto di fix «Frontend / UX» (mycity-live · Next.js 15 App Router)

> Owner: frontend-dev senior · Data: 2026-07-04 · Fonte problemi: `consegne/bonifica/_findings.json` chiave `frontend-ux` (10 item, tutti coperti).
> Modalità: SOLA LETTURA sul codice. Ogni fix qui è un diff pronto da applicare in un **branch** (`fix/frontend-ux-bonifica`), test verdi, PR piccola, screenshot prima/dopo mobile+desktop. **Nessun deploy/merge senza firma Nicola.**
> Le righe citate sono reali, lette da `/home/user/ad-mycity/marketplace`. I numeri di riga possono slittare di ±2 dopo le prime patch: applicare in ordine e ri-verificare l'ancora testuale.

---

## 0) Prerequisito trasversale — env WhatsApp (serve da Nicola)

Il fix #1 introduce un helper unico che **nasconde** la CTA WhatsApp finché la env non è valorizzata con un numero VERO. Finché manca, i link WhatsApp semplicemente **non compaiono** (niente numero finto) — comportamento corretto e sicuro.

- 🔴 **Nicola deve fornire il numero WhatsApp Business reale** e impostarlo come env su tutti gli ambienti (Render/Vercel + `.env`):
  `NEXT_PUBLIC_WHATSAPP_NUMBER=39XXXXXXXXXX` (solo cifre, prefisso paese incluso, senza `+` né spazi).
- Finché la env non c'è: le CTA WhatsApp restano nascoste (nessuna regressione peggiore del segnaposto attuale, anzi si toglie il link rotto).

---

## FIX 1 — Numero WhatsApp segnaposto `393000000000` hardcoded in 5 CTA 🟡 (config 🔴)

**Causa-radice.** Il numero `393000000000` (+39 300 000 0000, inesistente) è scritto a mano in 5 punti. Anche `Footer.tsx:160`, che *sembra* corretto, fa `?? '393000000000'`: se la env manca ricade **sul segnaposto**, quindi il link è rotto comunque. Nessun punto ha una fonte unica → disallineamento garantito.

**Fix — helper unico che ritorna `null` quando la env è assente o placeholder.**

Nuovo file `lib/whatsapp.ts`:
```ts
// lib/whatsapp.ts
// Fonte unica per il contatto WhatsApp assistenza. Ritorna null se la env
// non è impostata o contiene ancora il vecchio segnaposto: in quel caso le
// CTA vanno NASCOSTE (mai mostrare un numero finto).
const RAW = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(/[^0-9]/g, '');
const PLACEHOLDER = '393000000000';

/** Numero WhatsApp valido (solo cifre) o null se non configurato. */
export const whatsappNumber: string | null =
  RAW && RAW !== PLACEHOLDER && RAW.length >= 8 ? RAW : null;

/** true se esiste un numero reale su cui mostrare le CTA. */
export const hasWhatsapp = whatsappNumber != null;

/** URL wa.me pronto (con testo opzionale) o null se non configurato. */
export function whatsappHref(message = 'Ciao MyCity, ho una domanda'): string | null {
  if (!whatsappNumber) return null;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
```

**Punto A — `app/help/page.tsx:106`** (dentro il grid 3 colonne):
```diff
- import Link from 'next/link';
- import { ShoppingCart, Truck, Undo2, Settings, Store, Bike, Search, Mail, MessageCircle, FileText } from 'lucide-react';
+ import Link from 'next/link';
+ import { ShoppingCart, Truck, Undo2, Settings, Store, Bike, Search, Mail, MessageCircle, FileText } from 'lucide-react';
+ import { whatsappHref } from '@/lib/whatsapp';
...
-          <a href="https://wa.me/393000000000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white border rounded-lg p-3 hover:border-olive-300 transition-colors">
-            <MessageCircle size={24} className="text-olive-600 shrink-0" aria-hidden />
-            <div>
-              <div className="font-semibold text-sm">WhatsApp</div>
-              <div className="text-xs text-ink-500">Lun-Ven 9-18</div>
-            </div>
-          </a>
+          {whatsappHref() && (
+            <a href={whatsappHref()!} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white border rounded-lg p-3 hover:border-olive-300 transition-colors">
+              <MessageCircle size={24} className="text-olive-600 shrink-0" aria-hidden />
+              <div>
+                <div className="font-semibold text-sm">WhatsApp</div>
+                <div className="text-xs text-ink-500">Lun-Ven 9-18</div>
+              </div>
+            </a>
+          )}
```
> Nota grid: la colonna WhatsApp scompare quando assente; `sm:grid-cols-3` regge (le altre 2 tile si ridistribuiscono). Se si vuole layout stabile, tenere `sm:grid-cols-2` come fallback — opzionale, non bloccante.

**Punto B — `app/contact/page.tsx:68`** (qui è mostrato anche il numero in chiaro `+39 300 000 0000`, da rimuovere):
```diff
+ import { whatsappHref } from '@/lib/whatsapp';
...
-        <a href="https://wa.me/393000000000" target="_blank" rel="noopener noreferrer" className="bg-white border border-cream-300 rounded-xl p-5 hover:shadow-md hover:border-green-300 transition-all">
-          <div className="mb-2"><MessageCircle size={28} className="text-olive-600" aria-hidden /></div>
-          <div className="font-bold">WhatsApp</div>
-          <div className="text-sm text-ink-600">+39 300 000 0000</div>
-          <div className="text-xs text-ink-500 mt-1">Lun-Ven 9–18</div>
-        </a>
+        {whatsappHref() && (
+          <a href={whatsappHref()!} target="_blank" rel="noopener noreferrer" className="bg-white border border-cream-300 rounded-xl p-5 hover:shadow-md hover:border-green-300 transition-all">
+            <div className="mb-2"><MessageCircle size={28} className="text-olive-600" aria-hidden /></div>
+            <div className="font-bold">WhatsApp</div>
+            <div className="text-xs text-ink-500 mt-1">Lun-Ven 9–18</div>
+          </a>
+        )}
```
> ⚠️ Verificare anche il `tel:+390523000000` accanto (numero telefono placeholder): stesso problema fuori scope di questo finding — segnalato a Nicola sotto «punti incerti».

**Punto C — `app/seller/help/page.tsx:90`**: identico pattern al punto A (wrap `{whatsappHref() && (…)}`, import helper).

**Punto D — `app/rider/help/page.tsx:143`**: identico pattern (wrap il blocco `<a href="https://wa.me/393000000000" …>`, import helper). Etichetta «WhatsApp rider» invariata; se domani il rider avrà un numero dedicato diverso da quello assistenza, si aggiunge `NEXT_PUBLIC_WHATSAPP_RIDER_NUMBER` — per ora usa quello unico.

**Punto E — `components/Footer.tsx:73` (icona social) e `:160` (link «WhatsApp Business»)**:
```diff
// riga 73 — nell'array social
-  {
-    name: 'WhatsApp',
-    href: 'https://wa.me/393000000000',
-    color: 'hover:bg-[#25D366]',
-    svg: ( … ),
-  },
+  ...(hasWhatsapp ? [{
+    name: 'WhatsApp',
+    href: `https://wa.me/${whatsappNumber}`,
+    color: 'hover:bg-[#25D366]',
+    svg: ( … ),
+  }] : []),
```
```diff
// riga ~160 — link "WhatsApp Business" nella colonna Aiuto
-            <li>
-              <a
-                href={`https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '393000000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Ciao MyCity, ho una domanda')}`}
-                target="_blank" rel="noopener noreferrer"
-                className="text-ink-600 hover:text-primary-700 transition-colors inline-flex items-center gap-1.5"
-              >
-                <MessageCircle size={14} strokeWidth={2} aria-hidden /> WhatsApp Business
-              </a>
-            </li>
+            {whatsappHref() && (
+              <li>
+                <a
+                  href={whatsappHref()!}
+                  target="_blank" rel="noopener noreferrer"
+                  className="text-ink-600 hover:text-primary-700 transition-colors inline-flex items-center gap-1.5"
+                >
+                  <MessageCircle size={14} strokeWidth={2} aria-hidden /> WhatsApp Business
+                </a>
+              </li>
+            )}
```
Import in Footer: `import { whatsappHref, whatsappNumber, hasWhatsapp } from '@/lib/whatsapp';` (l'array social è definito a modulo: se costruito fuori dal componente, spostarlo dentro o usare uno spread come sopra — l'`...(hasWhatsapp ? […] : [])` funziona a modulo perché la env è inlined a build-time).

**Test.** `lib/whatsapp.test.ts` (Vitest): (a) env vuota → `whatsappNumber===null`, `whatsappHref()===null`; (b) env `393000000000` → `null` (placeholder rifiutato); (c) env `393331234567` → href `https://wa.me/393331234567?text=…`; (d) env con spazi/`+` → normalizzata a sole cifre.
E2E Playwright (`e2e/whatsapp-cta.spec.ts`): senza env, `/help` e `/contact` non hanno alcun link `href*="wa.me/393000000000"`.

**Verifica manuale.** `grep -rn "wa.me/393000000000" app components` → 0 risultati dopo la patch.
**Rischio&rollback.** Basso; puramente presentazionale. Rollback = revert del branch. **Dipendenza:** env reale (🔴 Nicola) perché le CTA riappaiano.

---

## FIX 2 — «Contatta il rider» compone il numero del NEGOZIO 🟡

**Causa-radice.** In `app/orders/[id]/page.tsx:526-538` la card rider apre la ContactSheet con `phone: order.seller?.store_phone` e gate `order.seller?.store_phone`. La query (riga 90) fa `rider:profiles!orders_rider_id_fkey ( full_name )` — seleziona **solo full_name**. Non esiste alcun campo telefono rider nello schema `profiles` (solo `store_phone`). Quindi: (a) il numero mostrato sotto «Rider della consegna» è quello del negozio; (b) se il negozio non ha telefono, il bottone sparisce del tutto durante `OUT_FOR_DELIVERY`.

**Decisione onesta (dato reale).** Lo schema **non ha un telefono rider** né un proxy mascherato: inventarne uno sarebbe un numero orfano. Fix onesto in 2 mosse: **rietichettare** il contatto come contatto-consegna del negozio (che è ciò che il numero è realmente) e, se il negozio non ha telefono, **fallback a un contatto reale** (assistenza/chat) invece del vuoto. Un vero «chiama il rider» richiede prima un campo telefono rider o un proxy → dipendenza dati (🔴 Nicola/backend).

**Fix (rietichettatura onesta + fallback).** `app/orders/[id]/page.tsx` blocco 523-538:
```diff
-                {order.seller?.store_phone && (
-                  <button
-                    type="button"
-                    onClick={() => setContact({
-                      kind: 'rider',
-                      name: order.rider?.full_name ?? 'Il tuo rider',
-                      sub: 'Rider della consegna',
-                      phone: order.seller?.store_phone ?? null,
-                      orderRef,
-                    })}
-                    aria-label="Contatta il rider"
-                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cream-300 bg-white text-primary-700 hover:bg-cream-50"
-                  >
-                    <Phone size={17} strokeWidth={2.2} aria-hidden />
-                  </button>
-                )}
+                <button
+                  type="button"
+                  onClick={() => setContact({
+                    kind: 'store',
+                    name: order.seller?.store_name ?? 'Il negozio',
+                    // Onesto: il numero disponibile è quello del negozio, che
+                    // coordina la consegna. Nessun telefono rider nello schema.
+                    sub: order.seller?.store_phone
+                      ? 'Coordina la consegna'
+                      : 'Rider non raggiungibile via telefono',
+                    phone: order.seller?.store_phone ?? null,
+                    orderRef,
+                  })}
+                  aria-label="Contatta per la consegna"
+                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cream-300 bg-white text-primary-700 hover:bg-cream-50"
+                >
+                  <Phone size={17} strokeWidth={2.2} aria-hidden />
+                </button>
```
Effetti: (1) il numero non è più spacciato per «rider»; (2) il bottone **appare sempre** durante la consegna — se manca il telefono, la ContactSheet mostra già il messaggio «Numero non disponibile» (ContactSheet:114-116) + il bottone messaggio ora funzionante (FIX 3). La card di sinistra può mantenere il nome del rider (`order.rider?.full_name`) come info, distinta dall'azione di contatto.

> **Upgrade futuro (dipendenza backend/dati 🔴):** aggiungere `phone` a `profiles` per i rider (o una tabella `rider_contacts` con numero-proxy mascherato per privacy), estendere la query `rider:profiles!… ( full_name, phone )`, e allora ripristinare `kind:'rider'` con `phone: order.rider?.phone`. Passo a @backend-dev.

**Test.** RTL su OrderDetail con seller senza `store_phone`: il bottone contatto è presente e apre la sheet con sub «Rider non raggiungibile via telefono»; con `store_phone`, sub «Coordina la consegna» e `tel:` corretto. E2E: nessuna label «rider» accanto a un `tel:` del negozio.
**Rischio&rollback.** Basso, presentazionale + gate. Rollback = revert. **Dipendenza:** FIX 3 (per il fallback messaggio) e, per il vero telefono rider, dati/schema.

---

## FIX 3 — «Invia un messaggio» nella ContactSheet è un'azione morta 🟡

**Causa-radice.** `components/orders/ContactSheet.tsx:120-128`: per `kind` `rider`/`store` il bottone «Invia un messaggio» ha `onClick={onClose}` — chiude e basta. Il marketplace HA la chat (`/api/chat/conversations` POST con `{ sellerId }` → `/messages/{id}`, vedi `components/ContactSellerButton.tsx`). Ma la chat è **buyer↔seller**: non esiste conversazione col rider.

**Fix.** Rendere il bottone reale **solo dove la chat esiste** (store), e **rimuoverlo per il rider** (niente promessa non mantenibile). La ContactSheet riceve un handler opzionale di apertura chat.

`components/orders/ContactSheet.tsx`:
```diff
- export function ContactSheet({ target, onClose }: { target: ContactTarget; onClose: () => void }) {
+ export function ContactSheet({ target, onClose, onMessage }: {
+   target: ContactTarget;
+   onClose: () => void;
+   /** Se presente e il target supporta la chat, mostra "Invia un messaggio". */
+   onMessage?: () => void;
+ }) {
...
-        {target.kind !== 'help' && (
-          <button
-            type="button"
-            onClick={onClose}
-            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-full border border-cream-300 px-4 py-3 text-sm font-semibold text-ink-700 transition-colors hover:bg-cream-50"
-          >
-            <MessageCircle size={16} strokeWidth={2.2} aria-hidden /> Invia un messaggio
-          </button>
-        )}
+        {target.kind === 'store' && onMessage && (
+          <button
+            type="button"
+            onClick={() => { onMessage(); onClose(); }}
+            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-full border border-cream-300 px-4 py-3 text-sm font-semibold text-ink-700 transition-colors hover:bg-cream-50"
+          >
+            <MessageCircle size={16} strokeWidth={2.2} aria-hidden /> Invia un messaggio
+          </button>
+        )}
```
Nel chiamante `app/orders/[id]/page.tsx:637` collegare l'apertura chat (riusa il pattern di `ContactSellerButton`):
```diff
-      {contact && <ContactSheet target={contact} onClose={() => setContact(null)} />}
+      {contact && (
+        <ContactSheet
+          target={contact}
+          onClose={() => setContact(null)}
+          onMessage={contact.kind === 'store' && order.seller_id ? async () => {
+            try {
+              const res = await fetch('/api/chat/conversations', {
+                method: 'POST',
+                headers: { 'content-type': 'application/json' },
+                body: JSON.stringify({ sellerId: order.seller_id }),
+              });
+              const json = await res.json();
+              if (!res.ok) throw new Error(apiErrorMessage(json, 'Errore'));
+              router.push(`/messages/${json.conversationId}`);
+            } catch (err) {
+              toast.error(friendlyError(err));
+            }
+          } : undefined}
+        />
+      )}
```
Import in orders/[id]: `import { friendlyError, apiErrorMessage } from '@/lib/errors';` (verificare se già presente).

> Per il rider il bottone messaggio **non compare** (nessuna chat rider) — coerente con FIX 2. Se in futuro nasce la chat rider, si estende `onMessage` a `kind:'rider'`.

**Test.** RTL: click «Invia un messaggio» su target store → POST `/api/chat/conversations` con `sellerId` e `router.push('/messages/…')`; su target rider il bottone non è renderizzato. E2E Playwright: da dettaglio ordine, «Contatta il negozio» → «Invia un messaggio» approda a `/messages/*`.
**Rischio&rollback.** Basso; usa API esistente e testata. Rollback = revert. **Dipendenza:** nessuna nuova (API già live).

---

## FIX 4 — `useSearchParams` senza `<Suspense>` sulla pagina custom negozio 🟢

**Causa-radice.** `app/store/[id]/[slug]/page.tsx:20` è `'use client'` e chiama `useSearchParams()` direttamente nel page component, senza `<Suspense>`. In Next 15 → bailout CSR dell'intera route + rischio errore a `next build` («useSearchParams() should be wrapped in a suspense boundary»).

**Fix.** Estrarre il corpo in `StoreCustomPageInner` e wrapparlo in `<Suspense>`. Il default export legge solo `params` (già via `use()`), l'inner legge `useSearchParams`.
```diff
- 'use client';
- import { use, type CSSProperties } from 'react';
+ 'use client';
+ import { use, Suspense, type CSSProperties } from 'react';
...
- export default function StoreCustomPage(props: { params: Promise<{ id: string; slug: string }> }) {
-   const { id, slug } = use(props.params);
-   const searchParams = useSearchParams();
-   const preview = searchParams.get('preview') === '1';
+ export default function StoreCustomPage(props: { params: Promise<{ id: string; slug: string }> }) {
+   const { id, slug } = use(props.params);
+   return (
+     <Suspense fallback={<div className="container mx-auto px-4 py-16"><LoadingState /></div>}>
+       <StoreCustomPageInner id={id} slug={slug} />
+     </Suspense>
+   );
+ }
+
+ function StoreCustomPageInner({ id, slug }: { id: string; slug: string }) {
+   const searchParams = useSearchParams();
+   const preview = searchParams.get('preview') === '1';
```
(Il resto del corpo — `useStorePageData`, `useQuery` viewer, i `return` — passa dentro `StoreCustomPageInner`; `LoadingState` è già importato.)

**Test.** `next build` non emette il warning Suspense per questa route; smoke E2E su `/store/<id>/<slug>` (200) e `?preview=1`. Unit RTL opzionale.
**Rischio&rollback.** Molto basso, refactor meccanico. Rollback = revert.
**Colore 🟢** (reversibile, migliora build/prerender). **Dipendenza:** nessuna.

---

## FIX 5 — Checkout carta senza geocodifica: ordini con coordinate nulle 🟡

**Causa-radice.** Nel ramo COD (`app/checkout/page.tsx:380-397`) se `form.lat/lng` sono null si chiama `/api/geocode`. Nel ramo Stripe (`payWithStripe`, 467-505) il passo manca: il payload usa `lat: form.lat, lng: form.lng` (493-501) → null quando l'utente digita un indirizzo nuovo. `app/api/stripe/checkout/route.ts:262,349` usa `body.delivery.lat` direttamente senza geocodifica di riserva → ordine con coordinate nulle (no puntino mappa, no ETA rider).

**Fix.** Estrarre la geocodifica in una funzione condivisa e usarla anche in `payWithStripe`. Nuovo helper (client) `lib/geocode-client.ts`:
```ts
// lib/geocode-client.ts
export async function geocodeIfNeeded(
  addr: { lat: number | null; lng: number | null; address: string; zip: string; city: string },
): Promise<{ lat: number | null; lng: number | null }> {
  let { lat, lng } = addr;
  if (lat != null && lng != null) return { lat, lng };
  try {
    const res = await fetch('/api/geocode', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ q: `${addr.address}, ${addr.zip} ${addr.city}, Italia` }),
    });
    const json = await res.json();
    if (json && json.lat != null && json.lng != null) { lat = json.lat; lng = json.lng; }
  } catch { /* best-effort: ripiega su null, come oggi in COD */ }
  return { lat, lng };
}
```
COD (righe 380-397) → sostituire il blocco inline con:
```diff
-      let deliveryLat: number | null = form.lat;
-      let deliveryLng: number | null = form.lng;
-      if (deliveryLat == null || deliveryLng == null) {
-        try { … fetch('/api/geocode') … } catch {}
-      }
+      const { lat: deliveryLat, lng: deliveryLng } = await geocodeIfNeeded(form);
```
Stripe (`payWithStripe`, prima di costruire `delivery`, ~riga 492):
```diff
+      const { lat: deliveryLat, lng: deliveryLng } = await geocodeIfNeeded(form);
       const res = await fetch('/api/stripe/checkout', {
         …
           delivery: {
             fullName: form.fullName, address: form.address, city: form.city,
             zip: form.zip, phone: form.phone, notes: form.notes || null,
-            lat: form.lat,
-            lng: form.lng,
+            lat: deliveryLat,
+            lng: deliveryLng,
           },
```
Import in checkout: `import { geocodeIfNeeded } from '@/lib/geocode-client';`.

> **Difesa in profondità (consigliata, passo a @backend-dev):** geocodifica di riserva **server-side** in `app/api/stripe/checkout/route.ts` quando `body.delivery.lat` è null, così l'invariante «ordine ha coordinate» non dipende solo dal client. Non bloccante per questo WS ma raccomandato.

**Test.** Unit su `geocodeIfNeeded`: coordinate presenti → passthrough senza fetch; assenti → chiama `/api/geocode` e mappa lat/lng; errore rete → ritorna null senza throw. E2E Playwright (mock `/api/geocode`): checkout carta con indirizzo digitato → il payload verso `/api/stripe/checkout` contiene lat/lng non nulli.
**Rischio&rollback.** Basso; `payWithStripe` guadagna una fetch (best-effort, già usata in COD). Rollback = revert. **Dipendenza:** `/api/geocode` esistente.

---

## FIX 6 — «Ripeti ordine» perde la variante (taglia/colore) 🟡

**Causa-radice.** `order_items` HA `variant_id`/`variant_label` (schema confermato in `lib/database.types.ts:1094`), ma né la query dettaglio (`app/orders/[id]/page.tsx:93`) né quella lista (`app/orders/page.tsx:51`) li selezionano; `handleReorder` (detail 279-297 e list 112-125) chiama `addToCart` senza `variantId/variantLabel`. Al checkout gli item con varianti finiscono in `variantIssues` e **bloccano** l'ordine. `addToCart` accetta già `variantId?`/`variantLabel?` (`lib/cart.ts:12-13`).

**Fix — dettaglio ordine.** Query (riga 93) e type (71-77):
```diff
       order_items (
-        id, quantity, unit_price, product_id,
+        id, quantity, unit_price, product_id, variant_id, variant_label,
         products ( name, images )
       )
```
```diff
   order_items: {
     id: string; quantity: number; unit_price: number; product_id: string | null;
+    variant_id: string | null; variant_label: string | null;
     products: { name: string; images: string[] | null } | null;
   }[];
```
`handleReorder` (283-291):
```diff
       addToCart({
         id: it.product_id,
         name: it.products.name,
         price: Number(it.unit_price),
         image: it.products.images?.[0],
         quantity: it.quantity,
         sellerId: order.seller_id ?? undefined,
         storeName: order.seller?.store_name ?? undefined,
+        variantId: it.variant_id ?? undefined,
+        variantLabel: it.variant_label ?? undefined,
       });
```
**Fix — lista ordini.** Stesse 3 modifiche in `app/orders/page.tsx`: query select (riga 51) `+ variant_id, variant_label`; type `OrderItem` (23-29) `+ variant_id: string | null; variant_label: string | null;`; `handleReorder` (116-124) `+ variantId/variantLabel` come sopra.

> Nota: se un prodotto ha cambiato le varianti dall'acquisto, `variant_id` potrebbe non esistere più; il checkout lo ricade già in `variantIssues` (comportamento corretto: chiede di riselezionare). Il fix copre il caso normale (variante ancora valida), che è la stragrande maggioranza.

**Test.** RTL: reorder di un ordine con item a variante → `addToCart` chiamato con `variantId` valorizzato. E2E: acquista taglia M → «Ripeti ordine» → checkout NON mostra il blocco variante e l'item è taglia M.
**Rischio&rollback.** Basso; aggiunge 2 colonne in select. Rollback = revert. **Dipendenza:** nessuna (colonne già in DB).

---

## FIX 7 — `returnTo` perso nel percorso registrazione ospite 🟡

**Causa-radice.** `/sign-in` propaga `returnTo` a `/sign-up` (`signUpHref`, sign-in:120-123). Ma `app/sign-up/page.tsx`: (a) legge solo `ref` e `role`, **mai** `returnTo` (34-37); (b) il link «Accedi» punta a `/sign-in` secco (206); (c) `emailRedirectTo` (72) è `.../auth/callback` senza `next`, e `auth/callback` defaulta a `/` (route.ts:20-21, già sanifica `next`).

**Fix.** `app/sign-up/page.tsx`:
```diff
   const roleParam = searchParams.get('role');
   const initialRole: Role = isRole(roleParam) ? roleParam : 'buyer';
+  // Preserva la destinazione del funnel (es. checkout → login → registrati).
+  const rawReturnTo = searchParams.get('returnTo');
+  const returnTo = rawReturnTo && rawReturnTo.startsWith('/') && !rawReturnTo.startsWith('//') ? rawReturnTo : null;
```
```diff
-      const emailRedirectTo = `${APP_URL || window.location.origin}/auth/callback`;
+      const base = `${APP_URL || window.location.origin}/auth/callback`;
+      const emailRedirectTo = returnTo ? `${base}?next=${encodeURIComponent(returnTo)}` : base;
```
```diff
-        <Link href="/sign-in" className="font-bold text-primary-700 hover:underline">Accedi</Link>
+        <Link href={returnTo ? `/sign-in?returnTo=${encodeURIComponent(returnTo)}` : '/sign-in'} className="font-bold text-primary-700 hover:underline">Accedi</Link>
```
> `auth/callback/route.ts:20-21` già fa `next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/'` — quindi onora `next` in sicurezza. Sanifico anche lato sign-up (difesa in profondità). Nessuna modifica al callback necessaria.

**Test.** RTL: `/sign-up?returnTo=/checkout` → `emailRedirectTo` contiene `?next=%2Fcheckout` e il link «Accedi» punta a `/sign-in?returnTo=/checkout`; `returnTo` esterno (`//evil.com`) → scartato (`next` assente). E2E: ospite in checkout → «registrati» → conferma email (link callback con `next=/checkout`) → atterra su `/checkout`.
**Rischio&rollback.** Basso; solo propagazione parametro già sanificato. Rollback = revert. **Dipendenza:** nessuna.

---

## FIX 8 — `window.confirm/prompt` nativi nonostante `ConfirmDialog` 🟡

**Causa-radice.** Esiste `components/ConfirmDialog.tsx` con `confirmDialog(opts): Promise<boolean>` (già usato lato buyer + `<ConfirmDialogHost/>` montato). 5 punti usano ancora nativi:
`app/rider/orders/[id]/page.tsx:445` · `components/seller/site/PageListEditor.tsx:46` · `components/seller/site/PageSectionsEditor.tsx:182` · `app/admin/users/page.tsx:626` (prompt) · `app/admin/sos/page.tsx:137` (prompt).

**Fix — i 3 `confirm()` (rider + 2 seller).** Esempio rider:445:
```diff
-            onClick={() => { if (confirm('Rilasciare questo ordine? Tornerà disponibile per altri rider.')) release.mutate(); }}
+            onClick={async () => {
+              const ok = await confirmDialog({
+                title: 'Rilasciare l\'ordine?',
+                message: 'Tornerà disponibile per altri rider.',
+                confirmLabel: 'Rilascia', cancelLabel: 'Annulla', danger: true,
+              });
+              if (ok) release.mutate();
+            }}
```
Import: `import { confirmDialog } from '@/components/ConfirmDialog';`. Il gestore diventa `async` (già dentro JSX arrow → ok).
`PageListEditor.tsx:46` e `PageSectionsEditor.tsx:182`: stessa sostituzione (`danger: true`, label «Elimina/Rimuovi»); rendere `async` la funzione contenitore e `await confirmDialog(...)`.
> Verificare che `<ConfirmDialogHost/>` sia montato nei layout rider/seller/admin (è nel layout root buyer). Se manca in `app/rider/layout.tsx` / `app/seller/layout.tsx` / `app/admin/layout.tsx`, aggiungerlo una volta — **passo a @frontend-dev/@ux-designer** per conferma montaggio.

**Fix — i 2 `prompt()` (admin, richiedono input testo).** `confirmDialog` non raccoglie testo. Due strade:
- **Rapida (consigliata ora):** sostituire il `prompt` con un piccolo campo controllato inline (textarea nel pannello/riga) + bottone «Conferma», riusando gli input del design system (`Input`/`Textarea`). Es. `admin/users:626` motivo rifiuto → mostra una textarea sotto la card e passa il valore alla mutation.
- **Strutturale (follow-up):** estendere `ConfirmDialog` con una variante `promptDialog({ title, label }): Promise<string|null>`. Fuori scope minimo di questo finding; segnalato come miglioria.

**Test.** RTL: click su azione distruttiva → compare il dialog brand (non `window.confirm`, che jsdom non intercetta bene); conferma → mutation chiamata, annulla → no-op. Per gli admin-prompt: submit con testo vuoto → bloccato con messaggio inline.
**Rischio&rollback.** Basso-medio (i 2 prompt admin cambiano micro-UX). Rollback = revert. **Dipendenza:** `ConfirmDialogHost` montato negli layout interessati.

---

## FIX 9 — Form checkout nascosto (`display:none`) + submit esterno blocca in silenzio 🟡

**Causa-radice.** `components/checkout/ShippingAddressForm.tsx:132` applica `hidden` (`display:none`) al `<form id="checkout-form">` quando si usa una tile indirizzo salvato (`editing=false`), ma i bottoni submit esterni (`app/checkout/page.tsx:829-839`, `form="checkout-form"`) restano puntati lì. Il form ha 5 input `required` (140,150,160,170,183) e nessun `noValidate`. Se un indirizzo salvato ha un `required` vuoto, il browser prova a validare un input **non-focusabile** → Chrome: «An invalid form control is not focusable», submit bloccato **senza feedback**.

**Fix (2 parti, entrambe consigliate).**
1. **`noValidate` sul form** — deleghiamo la validazione a `validateAddress()` (già presente) che può mostrare gli errori anche a form collassato:
```diff
-      <form onSubmit={onSubmit} className={`space-y-4 ${editing ? '' : 'hidden'}`} id="checkout-form">
+      <form onSubmit={onSubmit} noValidate className={`space-y-4 ${editing ? '' : 'hidden'}`} id="checkout-form">
```
2. **Non usare `display:none`** sul target di submit esterni: nascondere visivamente mantenendo la focusabilità off-screen (evita del tutto l'edge «not focusable»):
```diff
-      <form onSubmit={onSubmit} noValidate className={`space-y-4 ${editing ? '' : 'hidden'}`} id="checkout-form">
+      <form onSubmit={onSubmit} noValidate className="space-y-4" id="checkout-form"
+            style={editing ? undefined : { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', clipPath: 'inset(50%)' }}
+            aria-hidden={editing ? undefined : true}>
```
> Con `noValidate` + validazione applicativa, il submit su indirizzo salvato incompleto **non fallisce muto**: `validateAddress()` popola `errors` e, quando l'utente passa in edit (o mostrando un toast «Completa i dati dell'indirizzo»), vede cosa manca. Verificare in `page.tsx` che `onSubmit`→`validateAddress` faccia `toast`/scroll all'errore anche con form collassato; se non lo fa, aggiungere: se `!valid` e `!editing` → `setEditing(true)` + toast. **Punto da confermare leggendo `validateAddress` completo** (segnalato sotto).

**Test.** E2E Playwright: seleziona indirizzo salvato con CAP vuoto → «Conferma ordine» → NON resta muto: o mostra errore inline/toast o riapre il form in edit evidenziando il campo. Unit: form ha `noValidate` e nessun `hidden`/`display:none` quando collassato.
**Rischio&rollback.** Medio (tocca il percorso d'acquisto: testare a fondo mobile+desktop). Rollback = revert. **Dipendenza:** comportamento di `validateAddress()` — vedi punto incerto.

---

## FIX 10 — «Spedizione gratis» ignorato con prezzo minimo, ma il chip resta attivo 🟢

**Causa-radice.** `app/search/page.tsx:478`: `minPrice={minPrice > 0 ? minPrice : (freeShipping ? 30 : undefined)}`. Se l'utente imposta `minPrice=10` **e** attiva `freeShipping`, prevale 10 e la soglia 30 non si applica mai; il chip «spedizione gratis» (riga 139) resta attivo → risultati incoerenti coi filtri mostrati.

**Fix — comporre invece di sovrascrivere.**
```diff
-          minPrice={minPrice > 0 ? minPrice : (freeShipping ? 30 : undefined)}
+          minPrice={(() => {
+            const eff = Math.max(minPrice, freeShipping ? 30 : 0);
+            return eff > 0 ? eff : undefined;
+          })()}
```
Così i due filtri coesistono: se `minPrice=10` e freeShipping → soglia effettiva 30; se `minPrice=50` → 50 (già ≥30). Il chip resta coerente con ciò che accade.

> **Debito onesto (segnalato):** «spedizione gratis» è approssimata come «prezzo ≥ 30€», che non è la vera spedizione gratis del prodotto. Fix pulito = filtro server dedicato (`freeShipping` reale sulla riga prodotto/negozio) — passo a @backend-dev. Il fix qui rende almeno **coerente** filtro↔chip↔risultati. In alternativa, se non si vuole l'euristica, disaccoppiare: rendere il chip «spedizione ≥30€» esplicito nel testo. Decisione di prodotto → @ux-designer/@cro.

**Test.** Unit sulla funzione di composizione: (minPrice 0, free true) → 30; (10, true) → 30; (50, true) → 50; (10, false) → 10; (0, false) → undefined. E2E: attiva prezzo min 10 + spedizione gratis → i prodotti < 30€ non compaiono (coerente col chip).
**Rischio&rollback.** Molto basso. Rollback = revert. **Colore 🟢.** **Dipendenza:** nessuna per il fix euristico; il filtro server è follow-up.

---

## Piano di consegna
- Branch unico `fix/frontend-ux-bonifica` (o 2 branch: «no-deps» FIX 3/4/6/10 + «con-deps» FIX 1/2/5/7/8/9). PR piccole, con screenshot mobile(360px)+desktop prima/dopo per ogni schermata toccata.
- Ordine consigliato: 4,10,6 (🟢/basso) → 3,7 → 1,2 → 5 → 8 → 9 (checkout, massima cautela + QA).
- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` verdi prima della PR. QA end-to-end su checkout (FIX 5,9) e funnel registrazione (FIX 7) → @qa.
- Coordinamento anti-conflitto: l'altra sessione sta editando il repo → prima di toccare `app/checkout/page.tsx`, `components/orders/ContactSheet.tsx`, `app/orders/*`, `components/Footer.tsx` verificare in SALA-OPERATIVA che non siano in mano ad altri; se sì, coordinare i file condivisi.
