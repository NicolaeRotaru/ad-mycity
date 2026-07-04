# WS-AI — Pacchetto di bonifica «Endpoint AI (app/api/ai/*)»

> Owner: backend-dev (sicurezza AI). Fonte: `consegne/bonifica/_findings.json` → `ai-endpoints` (5 item, tutti coperti).
> Repo (sola lettura in questa sessione): `/home/user/ad-mycity/marketplace`. Ogni fix va applicato in un branch
> `fix/ai-endpoints-hardening`, con i test, mai su `main`, nessun deploy (🔴 = firma Nicola).
> Data: 2026-07-04 · fuso Piacenza.

## Mappa route AI (stato attuale, verificato)

| Route | rateLimit | modello | web_search | note |
|---|---|---|---|---|
| catalog-create | Async | — insert | — | **no gate policy** |
| catalog-create-bulk | **sync** | — insert x12 | — | **no gate policy** |
| catalog-apply | Async | patch | — | |
| catalog-chat | Async | Sonnet | max_uses 3 | open-ended + img url |
| product-chat | Async | Sonnet | max_uses 5 | open-ended + img url |
| description | Async | fast | — | testo, no screening |
| improve-product | **sync** | **Sonnet** | sì | img url, no screening |
| diagnose | **sync** | **Sonnet** | sì | web_search |
| barcode-lookup | **sync** | **Sonnet** | sì | web_search |
| variants | **sync** | Sonnet | — | |
| copilot | **sync** | Sonnet | — | |
| answer-qa | **sync** | fast | — | |
| reviews-summary | **sync** | fast | — | |
| seo | **sync** | fast | — | |
| translate | **sync** | fast | — | |
| voice-product | **sync** | fast | — | |
| catalog-batch/start | **sync** | batch | — | |

Le protezioni deboli (sync in-memory) stanno proprio sulle chiamate **più care** (Sonnet + web_search): è l'opposto
del corretto. Questo pacchetto rovescia la situazione.

---

## Fix trasversali (3 nuovi helper condivisi) — applicare PER PRIMI

Riducono i diff per-route a 1-2 righe l'uno e centralizzano la logica.

### H1 — `lib/ai/guard.ts` (NUOVO): body-size + host allowlist immagini
Copre i finding #3 (host immagini) e #4 (body size). 🟢 (nuovo file, nessun callsite ancora tocca prod).

```ts
// lib/ai/guard.ts  (NUOVO)
import { ApiErrors } from '@/lib/api/responses';

/** Legge il body JSON con un cap di dimensione applicato PRIMA del parse.
 *  Ritorna { ok:true, json } oppure { ok:false, res } già pronto da restituire. */
export async function readJsonLimited(
  req: Request,
  maxBytes: number,
): Promise<{ ok: true; json: unknown } | { ok: false; res: Response }> {
  // 1) short-circuit sul Content-Length dichiarato
  const cl = Number(req.headers.get('content-length') ?? '');
  if (Number.isFinite(cl) && cl > maxBytes) {
    return { ok: false, res: ApiErrors.invalidRequest('Richiesta troppo grande.') };
  }
  // 2) hard-cap reale leggendo lo stream (Content-Length è spoofabile/assente)
  const reader = req.body?.getReader();
  if (!reader) {
    try { return { ok: true, json: await req.json() }; }
    catch { return { ok: false, res: ApiErrors.invalidRequest('JSON non valido') }; }
  }
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return { ok: false, res: ApiErrors.invalidRequest('Richiesta troppo grande.') };
    }
    chunks.push(value);
  }
  try {
    const buf = new Uint8Array(total);
    let off = 0;
    for (const c of chunks) { buf.set(c, off); off += c.byteLength; }
    return { ok: true, json: JSON.parse(new TextDecoder().decode(buf)) };
  } catch {
    return { ok: false, res: ApiErrors.invalidRequest('JSON non valido') };
  }
}

/** Host dello storage Supabase del marketplace, derivato da NEXT_PUBLIC_SUPABASE_URL. */
function storageHost(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return null;
  try { return new URL(raw).host; } catch { return null; }
}

/** true SOLO se l'URL è un oggetto pubblico del bucket storage del marketplace. */
export function isMarketplaceStorageUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:') return false;
    const host = storageHost();
    // host esatto del progetto, oppure sottodominio *.supabase.co del progetto
    const okHost = host ? (u.host === host) : /(^|\.)supabase\.co$/i.test(u.host);
    return okHost && u.pathname.startsWith('/storage/v1/object/public/');
  } catch { return false; }
}
```

Soglie consigliate: `256 * 1024` (chat/testo), `1 * 1024 * 1024` (route con liste: reviews-summary, catalog-create-bulk).

### H2 — `lib/ai/rateLimitAi.ts` (NUOVO): rate limit durevole + budget-cap EUR/giorno per seller
Copre il finding #2. **Owner cross-workstream del rate limiter AI** — vedi Dipendenze (WS-API lo referenzia). 🟡 (cambia il
comportamento del rate limit su tutte le route AI; senza Upstash resta identico a oggi, con Upstash diventa durevole).

```ts
// lib/ai/rateLimitAi.ts  (NUOVO)
import { rateLimitAsync } from '@/lib/rate-limit';

// Costo AI stimato per chiamata (EUR), tarato sulla telemetria runMessage.
// fast (Haiku) ~ trascurabile; smart (Sonnet) e Sonnet+web_search i più cari.
export type AiCostClass = 'fast' | 'smart' | 'smart_web';
const COST_EUR: Record<AiCostClass, number> = {
  fast: 0.01,
  smart: 0.05,
  smart_web: 0.12, // Sonnet + fino a N web_search
};

// Tetto di spesa AI per singolo seller al giorno (EUR). Valore prudente:
// va ritarato quando la telemetria runMessage è consolidata.
const DAILY_BUDGET_EUR = 3.0;

function dayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC, ok per un cap grezzo)
}

export type AiRlOptions = {
  key: string;          // es. `ai-diagnose:${user.id}`
  max: number;          // cap orario per-route (come oggi)
  windowMs: number;
  sellerId: string;     // per il budget-cap giornaliero
  cost: AiCostClass;    // classe di costo della chiamata
};

/** Rate limit durevole (Upstash) + budget-cap EUR/giorno per seller.
 *  Ritorna allowed=false con retryAfterSec se scatta uno dei due limiti. */
export async function aiRateLimit(opts: AiRlOptions) {
  // 1) cap orario per-route (come oggi, ma DUREVOLE via Upstash)
  const perRoute = await rateLimitAsync({ key: opts.key, max: opts.max, windowMs: opts.windowMs });
  if (!perRoute.allowed) return perRoute;

  // 2) budget-cap giornaliero per seller, in "centesimi di EUR" come contatore
  const units = Math.max(1, Math.round(COST_EUR[opts.cost] * 100)); // costo in centesimi
  const budgetUnits = Math.round(DAILY_BUDGET_EUR * 100);
  // finestra ~24h; il contatore Upstash somma `units` per chiamata
  const day = await rateLimitAsync({
    key: `ai-budget:${opts.sellerId}:${dayKey()}`,
    max: budgetUnits,
    windowMs: 24 * 60 * 60_000,
  });
  // rateLimitAsync incrementa di 1 → per pesare `units` chiamiamo il costo come
  // "max effettivo scalato": se il numero di chiamate * unità supera il budget, blocca.
  // Implementazione semplice: confronto sul remaining.
  if (day.limit - day.remaining >= Math.floor(budgetUnits / units)) {
    return { allowed: false, remaining: 0, retryAfterSec: day.retryAfterSec || 3600, limit: opts.max };
  }
  return perRoute;
}
```

> Nota implementativa onesta: `rateLimitAsync` incrementa di 1 per chiamata. Per un budget "a peso" preciso serve una
> variante `incrBy(units)` sull'adapter Upstash (`lib/rate-limit.ts:99 upstashIncr` → aggiungere `INCRBY rl:key units`).
> Consegno sopra la versione **a conteggio scalato** (blocca a `budget/costo_unitario` chiamate della classe), che è
> corretta e sufficiente al primo giro; la variante `incrBy` è un raffinamento (vedi Test T2b). Confidenza: alta sullo
> switch durevole, media sulla taratura EUR (dipende dalla telemetria reale).

### H3 — `lib/ai/moderationGate.ts` (NUOVO): wrapper riusabile del gate T&S
Copre il finding #1. 🟡 (cabla codice T&S finora morto: cambia il comportamento di creazione/generazione).

```ts
// lib/ai/moderationGate.ts  (NUOVO)
import { classifyProductPolicy, assertSafeText, UnsafeContentError } from '@/lib/ai/moderation';
import type { ProductPolicyInput } from '@/lib/ai/moderation';
import { logger } from '@/lib/logger';

/** Verdetto su un prodotto (fail-closed: in caso di errore del classificatore blocca). */
export async function gateProduct(
  p: ProductPolicyInput, sellerId: string, feature: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  try {
    const v = await classifyProductPolicy(p, feature);
    if (v.allowed) return { ok: true };
    logger.warn('moderation blocked product', { sellerId, feature, category: v.category });
    return { ok: false, reason: v.reason };
  } catch (e) {
    logger.error('moderation classifier failed → block', { sellerId, feature });
    return { ok: false, reason: 'Verifica di conformità non disponibile, riprova.' }; // default DENY
  }
}

/** Screening di testo AI generato prima di restituirlo. true = safe. */
export async function gateText(text: string, feature: string): Promise<boolean> {
  try { await assertSafeText(text, feature); return true; }
  catch (e) { if (e instanceof UnsafeContentError) return false; throw e; }
}
```

---

## Finding #1 — Gate T&S costruito ma mai collegato (severità: GRAVE) 🟡

- **File**: `lib/ai/moderation.ts:63/93` (mai importati) · `app/api/ai/catalog-create/route.ts:74` · `app/api/ai/catalog-create-bulk/route.ts:77`
- **Causa-radice**: `classifyProductPolicy()`/`assertSafeText()` sono codice morto (commento modulo: *"Da cablare … in PR
  successive"*). L'unico controllo policy è `policy_ok` prodotto dal passo **vision client-side**, quindi saltabile: un
  seller scriptato POSTa direttamente a `catalog-create` un `draft` arbitrario (DraftSchema zod passa qualunque testo) e
  crea schede di prodotti vietati, con descrizione di marketing AI inclusa. Nessun punto del percorso di **scrittura**
  filtra il contenuto.
- **Fix ESATTO**:

**(a) catalog-create — blocca l'insert se non conforme** (`route.ts:74-80`):
```diff
   const payload = buildDraftProductInsert({ draft, imageUrls, categories, sellerId: user.id });
+
+  // Gate Trust & Safety server-side: la policy_ok del passo vision è client-side
+  // e saltabile. Ri-classifichiamo nome+descrizione+categoria sulla sorgente reale.
+  const gate = await gateProduct(
+    { name: payload.name, description: payload.description, categorySlug: draft.category_slug },
+    user.id, 'catalog-create',
+  );
+  if (!gate.ok) return ApiErrors.invalidRequest(`Prodotto non pubblicabile: ${gate.reason}`);
 
   const { data: created, error } = await admin
     .from('products')
     .insert(payload)
```
+ import in testa: `import { gateProduct } from '@/lib/ai/moderationGate';`

**(b) catalog-create-bulk — filtra gli item non conformi** (`route.ts:73-83`):
```diff
-  const payloads = parsed.data.items
-    .map((item) => {
-      const imageUrls = item.imageUrls.filter((u) => /^https?:\/\//i.test(u));
-      if (imageUrls.length === 0) return null;
-      return buildDraftProductInsert({ draft: item.draft, imageUrls, categories, sellerId: user.id });
-    })
-    .filter((p): p is NonNullable<typeof p> => p !== null);
+  const built = parsed.data.items
+    .map((item) => {
+      const imageUrls = item.imageUrls.filter((u) => isMarketplaceStorageUrl(u)); // vedi finding #3
+      if (imageUrls.length === 0) return null;
+      return { p: buildDraftProductInsert({ draft: item.draft, imageUrls, categories, sellerId: user.id }),
+               slug: item.draft.category_slug };
+    })
+    .filter((x): x is NonNullable<typeof x> => x !== null);
+
+  // Gate T&S in parallelo su tutti gli item (fast model, default DENY su errore).
+  const verdicts = await Promise.all(
+    built.map((b) => gateProduct({ name: b.p.name, description: b.p.description, categorySlug: b.slug },
+                                  user.id, 'catalog-create-bulk')),
+  );
+  const payloads = built.filter((_, i) => verdicts[i].ok).map((b) => b.p);
+  const blocked = verdicts.filter((v) => !v.ok).length;
```
e nella risposta finale aggiungere `blocked` per trasparenza: `return NextResponse.json({ ok: true, count: created.length, blocked, products: … })`.

**(c) route testuali (description, improve-product, product-chat, catalog-chat, copilot, seo, translate, variants,
answer-qa)** — screening del **testo generato** prima di restituirlo. Pattern minimo dopo aver ottenuto l'output AI:
```diff
+  // Screening T&S del copy generato prima di restituirlo al client.
+  if (!(await gateText(generatedText, 'description'))) {
+    return ApiErrors.invalidRequest('Contenuto non conforme alle policy: riformula la richiesta.');
+  }
   return NextResponse.json({ description: generatedText });
```
Per le chat (`product-chat`/`catalog-chat`) screening dell'**ultimo messaggio utente** in ingresso (oltre allo scoping del
finding #5): `if (!(await gateText(lastUserText, 'product-chat'))) return ApiErrors.invalidRequest(...)`.

**(d) pubblicazione draft→available**: oggi la transizione avviene **client-side** via RLS
(`app/seller/products/page.tsx:98 supabase.from('products').update({ status })`), quindi **non c'è un punto server** dove
inserire il gate. Due strade (scelgo la 1, la 2 è il follow-up robusto):
  1. **Ora**: il gate alla creazione già impedisce che una scheda vietata **nasca**. Sufficiente per chiudere il rischio principale.
  2. **Follow-up (dipendenza WS-API/DB)**: spostare la pubblicazione dietro una route server `POST /api/seller/products/[id]/publish`
     che ri-esegue `gateProduct` prima di settare `available`, e **togliere alla policy RLS** il permesso di update diretto
     di `status→available` dal client. Richiede migrazione RLS → coordinare con @security. Accodato, non in questo diff.

- **Test (scheletro)** — `__tests__/api/ai/moderation-gate.test.ts`:
  ```ts
  // mock classifyProductPolicy → allowed:false su "coltello a farfalla"
  // POST catalog-create con draft vietato → 400, products.insert NON chiamato
  // POST con draft lecito → 200, insert chiamato
  // bulk: 3 item (2 leciti, 1 vietato) → count=2, blocked=1
  // classifier che throwa → default DENY (400)
  ```
- **Verifica**: `grep -rn "gateProduct\|gateText" app/api/ai` deve elencare tutte le route di scrittura/testo;
  `classifyProductPolicy` non è più codice morto.
- **Rischio & rollback**: +1 chiamata `fast` per creazione/testo (latenza ~+300-600ms, costo trascurabile) e rischio di
  **falsi positivi** che bloccano prodotti leciti. Mitigazione: log `moderation blocked` con categoria per tarare; rollback =
  revert del branch (il gate è additivo, nessuna migrazione). Confidenza: alta.
- **Dipendenze**: H3. Per la strada (d.2) → migrazione RLS con @security.

---

## Finding #2 — Rate limiter non durevole sugli endpoint AI più costosi (GRAVE) 🟡 + 🔴 (Upstash)

- **File**: `improve-product:225 · diagnose:90 · barcode-lookup:62 · variants:63 · copilot:75 · catalog-batch/start:35 ·
  answer-qa:47 · reviews-summary:57 · seo:52 · translate:56 · voice-product:54` (tutti `rateLimit` **sync**) ·
  `catalog-create-bulk:53` (sync) vs `lib/rate-limit.ts:131 rateLimitAsync`.
- **Causa-radice**: `rateLimit()` è in-memory per-istanza (Map locale, `lib/rate-limit.ts:22`). Su Render `plan: starter`
  (single instance con spin-down) ogni **cold-start azzera i bucket**; sul piano standard lo **scale-out** moltiplica il
  limite per il numero di istanze. Le route Sonnet+web_search (le più care, "costo = preoccupazione #1" nel codice) sono
  proprio quelle protette dalla versione debole.
- **Fix ESATTO** — passare **tutte** le route AI ad `aiRateLimit` (H2). Esempio `diagnose/route.ts`:
```diff
-import { rateLimit } from '@/lib/rate-limit';
+import { aiRateLimit } from '@/lib/ai/rateLimitAi';
 ...
-  const rl = rateLimit({ key: `ai-diagnose:${user.id}`, max: 20, windowMs: 60 * 60_000 });
+  const rl = await aiRateLimit({ key: `ai-diagnose:${user.id}`, max: 20, windowMs: 60 * 60_000,
+                                 sellerId: user.id, cost: 'smart_web' });
   if (!rl.allowed) return ApiErrors.rateLimited(rl.retryAfterSec);
```
  Classe `cost` per route: `smart_web` = diagnose, barcode-lookup, improve-product, product-chat, catalog-chat;
  `smart` = variants, copilot, catalog-apply, catalog-batch/start; `fast` = description, answer-qa, reviews-summary, seo,
  translate, voice-product. **Attenzione**: `rateLimit` è **sync**, `aiRateLimit` è **async** → aggiungere `await` a tutti i
  callsite (già dentro handler async). Le route già su `rateLimitAsync` (catalog-create, catalog-chat, product-chat,
  description, catalog-apply, catalog-batch/status) migrano ad `aiRateLimit` per avere anche il budget-cap.
- **🔴 CHIAVE INFRA (firma Nicola)**: senza Upstash anche `rateLimitAsync` **ricade in-memory** (`lib/rate-limit.ts:145-149`),
  quindi lo switch da solo NON basta a rendere durevole il limite. Serve configurare in produzione:
  `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` (Upstash Redis, piano free ~10k cmd/giorno sufficiente all'inizio).
  → **Accodato in AZIONI-IN-ATTESA**: creare progetto Upstash + inserire le 2 env su Render. Finché non c'è, il codice è già
  giusto (durevole appena le chiavi arrivano) ma la protezione resta per-istanza.
- **Test** — `__tests__/lib/rateLimitAi.test.ts`:
  ```ts
  // T2a: 21ª chiamata entro l'ora → allowed:false (cap orario)
  // T2b: budget: N chiamate 'smart_web' fino a superare DAILY_BUDGET → allowed:false con retryAfter
  // T2c: senza UPSTASH_* → fallback in-memory, comportamento invariato (no throw)
  // mock fetch Upstash per T2a/T2b (INCR counter)
  ```
- **Verifica**: `grep -rn "import { rateLimit }" app/api/ai` → **zero** risultati (solo `aiRateLimit`).
- **Rischio & rollback**: se Upstash è lento/giù, `upstashIncr` ha timeout 500ms + fallback in-memory (già gestito) → nessun
  fail-open. Il budget-cap può bloccare un seller legittimo molto attivo: `DAILY_BUDGET_EUR` va tarato, log del blocco.
  Rollback = revert import (nessuna migrazione). Confidenza: alta sullo switch, media sulla soglia EUR.
- **Dipendenze**: H2 · **WS-API referenzia questo rate limiter** (owner unico = WS-AI): coordinare che WS-API usi lo stesso
  `aiRateLimit`/`rateLimitAsync` e le stesse env, non reintrodurre `rateLimit` sync su percorsi condivisi.

---

## Finding #3 — URL immagine arbitrari accettati e persistiti (MINORE) 🟡

- **File**: `catalog-create/route.ts:43,60 · catalog-create-bulk/route.ts:43,75 · lib/products/draftFromVision.ts:118` ·
  blocchi immagine chat: `product-chat:~219 · catalog-chat:~254 · improve-product:~277`.
- **Causa-radice**: `imageUrls` validati solo come `z.string().url()` + regex `^https?:` e scritti tali-quali in
  `products.images`. `next.config.js:36` si fida solo di `*.supabase.co` per il render, ma il DB accetta qualsiasi host →
  incoerenza. Gli stessi URL arbitrari vengono passati ad Anthropic come `source:{type:'url'}` (fetch lato Anthropic verso
  host esterni).
- **Fix ESATTO** — usare `isMarketplaceStorageUrl` (H1) come filtro prima di persistere. `catalog-create/route.ts:60`:
```diff
-  const imageUrls = parsed.data.imageUrls.filter((u) => /^https?:\/\//i.test(u)).slice(0, 4);
-  if (imageUrls.length === 0) return ApiErrors.invalidRequest('Servono le foto del prodotto.');
+  const imageUrls = parsed.data.imageUrls.filter((u) => isMarketplaceStorageUrl(u)).slice(0, 4);
+  if (imageUrls.length === 0) {
+    return ApiErrors.invalidRequest('Le foto devono essere caricate nello storage del marketplace.');
+  }
```
  Bulk: già mostrato nel diff #1(b). Import: `import { isMarketplaceStorageUrl } from '@/lib/ai/guard';`
  **Alternativa più permissiva** (se il client a volte passa URL esterni legittimi): invece di rifiutare, **ri-ospitare** con
  `rehostImageUrls(admin.storage, user.id, imageUrls)` (`lib/products/rehostImages.ts:56`, che usa già `safeImageFetch`
  SSRF-safe) e persistere solo gli URL ri-ospitati. Scelgo il **filtro** per catalog-create (il client già carica su storage);
  la ri-ospitazione resta il fallback.
  **Chat**: filtrare i blocchi immagine passati al modello con lo stesso predicato, es. `product-chat`:
```diff
-    ...imageUrls.map((url): Anthropic.ImageBlockParam => ({ type: 'image', source: { type: 'url', url } })),
+    ...imageUrls.filter(isMarketplaceStorageUrl)
+       .map((url): Anthropic.ImageBlockParam => ({ type: 'image', source: { type: 'url', url } })),
```
- **Test**: URL `https://evil.example/x.jpg` → scartato (create ritorna 400 se resta 0 immagine); URL
  `https://<proj>.supabase.co/storage/v1/object/public/products/…` → accettato.
- **Verifica**: `grep -rn "source: { type: 'url'" app/api/ai` → ogni occorrenza filtrata da `isMarketplaceStorageUrl`.
- **Rischio & rollback**: se il client carica su un host storage diverso da `NEXT_PUBLIC_SUPABASE_URL`, il filtro lo scarta
  (falso negativo) → verificare in staging che gli URL prodotti da `/api/vision/*` matchino il predicato prima del merge.
  Rollback = revert. Confidenza: alta (host derivato dall'env reale).
- **Dipendenze**: H1.

---

## Finding #4 — Nessun limite dimensione body prima di req.json() (MINORE) 🟡

- **File**: `product-chat:170 · catalog-chat:168 · reviews-summary:62 · copilot:80` (+ tutte le altre `await req.json()`).
- **Causa-radice**: le App Router route non hanno il vecchio limite `bodyParser` dei Pages API; i cap applicativi
  (`MAX_HISTORY`, `MAX_CONTENT`, `MAX_REVIEWS`…) girano **dopo** il parse → il JSON grezzo può essere arbitrariamente grande e
  viene parsato interamente in memoria. `/api/vision/extract-product:254` invece cappa correttamente → le route `ai/*` no.
- **Fix ESATTO** — sostituire `await req.json()` con `readJsonLimited` (H1). Pattern (es. `reviews-summary/route.ts:60-66`):
```diff
-  let body: Body;
-  try {
-    body = await req.json();
-  } catch {
-    return ApiErrors.invalidRequest('JSON non valido');
-  }
+  const parsed = await readJsonLimited(req, 1 * 1024 * 1024); // liste recensioni
+  if (!parsed.ok) return parsed.res;
+  const body = parsed.json as Body;
```
  Soglie: `256*1024` per chat/testo (product-chat, catalog-chat, copilot, description, seo, translate, answer-qa, variants,
  diagnose, improve-product, barcode-lookup, voice-product); `1*1024*1024` per liste (reviews-summary, catalog-create-bulk,
  catalog-create). Import: `import { readJsonLimited } from '@/lib/ai/guard';`
- **Test**: body 2MB su chat (limite 256KB) → 400 **senza** parse completo; body piccolo valido → 200.
- **Verifica**: `grep -rn "await req.json()" app/api/ai` → zero (tutte via `readJsonLimited`).
- **Rischio & rollback**: soglia troppo bassa taglierebbe richieste legittime con molte immagini/history → soglie tarate sui
  cap esistenti (MAX_HISTORY 20 × MAX_CONTENT 2000 ≪ 256KB). Rollback = revert. Confidenza: alta.
- **Dipendenze**: H1.

---

## Finding #5 — Chat AI open-ended usabili come proxy web search (MINORE) 🟡

- **File**: `product-chat/route.ts:33 (SYSTEM) , 147 (web_search max_uses 5)` · `catalog-chat/route.ts:45 (SYSTEM) , 139 (max_uses 3)`.
- **Causa-radice**: il system si autodefinisce *"Sei come un assistente Claude generale, ma specializzato su QUESTO
  prodotto"* con `tool_choice:auto` e `web_search`, senza rifiuto esplicito fuori dominio. Entro il cap orario (25 msg/h) un
  seller ha di fatto 25 chiamate/h Sonnet+ricerca web a carico del marketplace, usabili per query generiche.
- **Fix ESATTO** — restringere lo scope nel SYSTEM e ridurre `max_uses`. `product-chat/route.ts:33`:
```diff
-const SYSTEM = `Sei l'assistente di "MyCity Piacenza" che aiuta un venditore a costruire e correggere la scheda di un suo prodotto. Conversi in italiano, in modo caldo, concreto e onesto. Sei come un assistente Claude generale, ma specializzato su QUESTO prodotto.
+const SYSTEM = `Sei l'assistente di "MyCity Piacenza" che aiuta un venditore a costruire e correggere la scheda di un suo prodotto. Conversi in italiano, in modo caldo, concreto e onesto.
+
+AMBITO RIGIDO: rispondi ESCLUSIVAMENTE a richieste relative a QUESTO prodotto e alla sua scheda (identificazione, campi, prezzo di mercato, categoria, attributi, descrizione). Qualsiasi richiesta fuori ambito — codice, testi generici, ricerche non legate al prodotto, domande personali/di cultura generale, uso come assistente generico — va RIFIUTATA con una frase breve ("Posso aiutarti solo con la scheda di questo prodotto"). Non usare "web_search" per scopi diversi dall'identificare/verificare QUESTO prodotto.
```
```diff
   type: 'web_search_20250305',
   name: 'web_search',
-  max_uses: 5,
+  max_uses: 3,
```
  Analogo in `catalog-chat` (max_uses 3→2 se accettabile). **Opzionale (follow-up)**: classificatore leggero on-topic
  (`assertSafeText`/una fast-call) prima della chiamata Sonnet — copre anche lo screening input del finding #1(c).
- **Test**: prompt "scrivimi una poesia / cerca il meteo" → risposta di rifiuto, `web_search` non invocato (asserire su tool_use).
- **Verifica**: system contiene "AMBITO RIGIDO"; `max_uses` ridotto.
- **Rischio & rollback**: scoping troppo severo può rendere la chat meno utile su domande legittime borderline (es. prezzo di
  mercato) — la formulazione tiene esplicitamente dentro "prezzo di mercato/identificazione". Rollback = revert del prompt.
  Confidenza: media (efficacia dipende dall'aderenza del modello; il budget-cap del finding #2 è la difesa hard complementare).
- **Dipendenze**: nessuna hard; sinergia con #1(c) e #2.

---

## Ordine di applicazione (percorso critico)
1. H1, H2, H3 (nuovi file, 🟢/🟡, nessun callsite rotto).
2. Finding #2 switch rate limit (tutte le route) — meccanico, ampio.
3. Finding #1 gate (create/bulk/testo) — dipende da H3.
4. Finding #3 (host immagini) e #4 (body size) — dipendono da H1, tocca gli stessi file di #1 (fare insieme per un solo diff per route).
5. Finding #5 (prompt) — isolato.
6. Test suite → `npm run test` verde → PR verso `main` (firma Nicola). **Upstash env = 🔴 separato.**

## Coordinamento sessioni parallele
`mycity-live` è editato da 2 sessioni: prima di aprire il branch `git pull`/`status`, lavorare su
`fix/ai-endpoints-hardening` isolato, evitare conflitti su `lib/rate-limit.ts` (qui si **aggiunge** `INCRBY` opzionale, non si
riscrive) — segnalare a WS-API che `aiRateLimit` è l'owner del rate limiter AI.
