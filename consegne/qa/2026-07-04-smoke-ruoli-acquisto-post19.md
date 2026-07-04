---
data: 2026-07-04 05:10
reparto: qa
tipo: smoke-test
stato: pronto-da-eseguire (matrice autenticata gated)
fonte: Nicola approva dal Pannello «Smoke post-#19 ruoli acquisto» (proposta dal giro, livello verde)
decisione: proposta:smoke-post-19-ruoli-acquisto
---

# Smoke post-#19 «ruoli acquisto» — verifica in PROD

**Obiettivo (parole di Nicola):** verificare in produzione che dopo #19
(PR #211, `f84fc70`, merged 2/7) i **ruoli d'acquisto** siano enforced:
**admin → 403** sugli acquisti · **seller → redirect** fuori dal marketplace.

**Prod:** `https://mycity-marketplace.com`
**Script pronto:** `consegne/qa/smoke-ruoli-post19.sh` (una riga per lanciarlo).

---

## Comportamento atteso — VERIFICATO NEL CODICE (non ipotesi)

Due strati di enforcement, letti riga per riga sul codice collegato:

**A) Pagine — `marketplace/middleware.ts:30-207`**
- `ROLE_PROTECTED`: `/admin`→[admin], `/seller`→[seller,admin], `/rider`→[rider,admin].
- Anonimo su rotta protetta → **307 redirect → `/sign-in?returnTo=…`** (righe 176-181).
- Loggato con ruolo sbagliato / non approvato → **307 redirect → `/`** (righe 191-206).
- Email non confermata → redirect → `/auth/verify-email` (righe 183-187).

**B) API — `marketplace/lib/api/middleware.ts:132-185`**
- `withAdminAuth`: non-admin → **403 «Solo admin»** (riga 168). → *questo è "admin 403".*
- `withSellerAuth`: non-(seller approvato|admin) → **403 «Solo seller approvati o admin»** (riga 138).
- Acquisto (`app/api/orders/cod/route.ts:69-74`, `app/api/stripe/checkout/route.ts:72-78`):
  `withAuthRateLimit` (qualsiasi utente auth) + gate email confermata → **403** se email non confermata.

**C) Spec funzionale #19** (da `consegne/qa/2026-07-02-smoke-ruoli-acquisto-post-19.md`, autorevole su cosa #19 doveva fare):
- **Admin = zero acquisti:** «Aggiungi» disabilitato, niente carrello, POST purchase → **403**.
- **Seller = solo opt-in:** seller su `/` o URL prodotto → **redirect a `/seller/dashboard`**.
- **Buyer = invariato.**

---

## ⚠️ Nota di candore (perché il test in prod è indispensabile)
La **copia locale del marketplace** collegata alla macchina **è indietro rispetto a #19**:
- nessun blocco-ruolo negli endpoint d'acquisto (COD/checkout usano `withAuthRateLimit`, non un guard admin/seller);
- nessun redirect `seller → /seller/dashboard` dalla root del marketplace (il redirect `seller→dashboard` esiste solo al **login**, `app/sign-in/page.tsx:87`, non come guard di navigazione).

→ Non posso confermare #19 **staticamente** dal mirror locale: probabilmente predata `f84fc70`.
**Solo il colpo in prod dice la verità.** Prima di dare l'esito per "definitivo" conviene rinfrescare il mirror:
`node cervello/collega-marketplace.mjs` (🟢, sola lettura) e ri-grep.

---

## Esiti

### Parte ANONIMA (🟢 automatica — nessun login) — *da eseguire con lo script*
| # | Test | Atteso | Esito | Note |
|---|------|--------|-------|------|
| 1 | GET `/` | 200/30x | ⏳ | il sito risponde |
| 2 | GET `/admin` (anon) | 30x → `/sign-in` | ⏳ | middleware:176 |
| 3 | GET `/seller/dashboard` (anon) | 30x → `/sign-in` | ⏳ | middleware:176 |
| 4 | GET `/rider` (anon) | 30x → `/sign-in` | ⏳ | middleware:176 |
| 5 | GET `/api/admin/branding` (anon) | 401/403 | ⏳ | API guard |

> ⏳ = non eseguito **da questa sessione**: l'uscita di rete è bloccata dai permessi del sandbox.
> Girano appena si lancia lo script dove la rete è aperta (VPS/Nicola): `bash consegne/qa/smoke-ruoli-post19.sh`.

### Matrice AUTENTICATA (🟡 — serve login admin/seller/buyer)
| # | Ruolo | Test | Atteso | Esito |
|---|-------|------|--------|-------|
| 6 | admin | POST `/api/orders/cod` | **403** | ⏳ |
| 7 | admin | POST `/api/stripe/checkout` | **403** | ⏳ |
| 8 | seller | GET `/` | 30x → `/seller/dashboard` | ⏳ |
| 9 | buyer | POST `/api/orders/cod` (no body) | 400/422/409 (**non** 403-ruolo) | ⏳ |

Come: copiare l'header `Cookie:` di 3 sessioni loggate (DevTools) e lanciare
`ADMIN_COOKIE=… SELLER_COOKIE=… BUYER_COOKIE=… bash consegne/qa/smoke-ruoli-post19.sh`.

---

## Se tutto verde
Segnala a @crm-lifecycle il via libera al **recupero carrello samir** (coda #26): quel
guard corretto è la pre-condizione perché un buyer reale possa completare l'acquisto.
Se **rosso** (admin acquista o seller non redirige) → apri fix a @backend-dev/@frontend-dev,
🔴 blocca ogni comunicazione d'acquisto finché non è chiuso.
