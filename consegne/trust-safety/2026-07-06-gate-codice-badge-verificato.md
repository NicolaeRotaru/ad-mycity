---
tipo: spec-tecnica
reparto: trust-safety → backend-dev/frontend-dev
data: 2026-07-06 14:20
colore: 🟡 (patch in branch del repo marketplace, mai deploy senza firma 🔴)
stato: PRONTA — nessun codice scritto
---

# 🔧 Gate del badge «Negozio Verificato» — renderlo guadagnato, non decorativo

> Companion tecnico dello **standard** `2026-07-06-standard-negozio-verificato.md`.
> Senza questa patch, i criteri di fiducia restano un documento: il sito continua a
> mostrare "verificato" su chiunque.

## 🔬 Il difetto (verificato nel codice, repo `marketplace/`, 6/7 2026)
Il componente `components/ui/VerifiedBadge.tsx` mostra il tooltip **"Negozio verificato da MyCity"**.
La sua docstring dichiara *«appare quando profilo.is_approved = true»*, ma **nell'uso reale il controllo
c'è in un solo punto su cinque**:

| Punto d'uso | Condizione oggi | Corretto? |
|---|---|---|
| `store-sections/HeroSection.tsx:167` | `{store.is_approved && …}` | ✅ gated (ma solo su is_approved) |
| `components/StoreListRow.tsx:44` | **nessuna** — sempre reso | ❌ ungated |
| `components/StorePreviewCard.tsx:76` | **nessuna** — sempre reso | ❌ ungated |
| `components/home/HeroStoreCard.tsx:137` | **nessuna** — sempre reso | ❌ ungated |
| `components/home/HeroStoreCard.tsx:235` | **nessuna** — sempre reso | ❌ ungated |

**Conseguenza reale:** nelle liste (`/stores`, `/near`), nelle card vetrina e in home OGNI negozio
mostrato porta il badge "verificato" — **inclusa la demo Casa Linda** (seed, fittizia). Il segnale di
fiducia #1 del marketplace è oggi un ornamento grafico. Per un badge che *promette fiducia al cliente*
questo è un problema di onestà, non un dettaglio estetico.

## ✅ Il fix (minimo, reversibile, in branch)
Un solo predicato di verità, applicato ovunque — la fonte della checkbox è lo **standard** (vedi il file
companion). Ordine per impatto:

1. **Predicato unico condiviso** — aggiungere `lib/store-trust.ts`:
   ```ts
   // Un negozio è "Verificato" solo se ha superato la moderazione E può davvero incassare
   // e pagare (Stripe Connect attivo). Vedi standard 2026-07-06-standard-negozio-verificato.md.
   export function isVerifiedStore(p?: {
     is_approved?: boolean | null;
     stripe_charges_enabled?: boolean | null;
     stripe_payouts_enabled?: boolean | null;
   } | null): boolean {
     if (!p) return false;
     return !!p.is_approved && !!p.stripe_charges_enabled && !!p.stripe_payouts_enabled;
   }
   ```
   > Livello del badge = decisione dello standard. Se Nicola/trust-safety scelgono il badge pubblico
   > come «Identità Verificata» (senza payout), il predicato si riduce a `!!p.is_approved`. Un solo
   > punto da cambiare, non cinque.

2. **Gate su tutti e 5 i punti d'uso** — `{isVerifiedStore(store) && <VerifiedBadge …/>}`. Questo
   richiede che le query che alimentano quelle card selezionino anche
   `stripe_charges_enabled, stripe_payouts_enabled` (oggi diverse selezionano solo `is_approved`) — è
   una `select` in più, nessuna migrazione DB.

3. **Coerenza `HeroSection`** — allineare il gate di riga 167 allo stesso predicato (oggi si ferma a
   `is_approved`), così pagina-negozio, liste, card e home dicono la stessa verità.

4. **Cancello di test** — un test che verifica: (a) un profilo demo/seed o non-approvato NON mostra il
   badge; (b) un profilo approvato con payout attivo lo mostra. Impedisce la regressione al
   "badge-su-tutti".

## 📌 Effetto sui negozi reali OGGI
- **Pane Quotidiano:** `is_approved=true` ✅ ma `stripe_payouts_enabled=false` ❌ → con la regola
  «Verificato completo» **il badge NON gli appare finché il payout non è attivo**. Diventa Verificato
  automaticamente quando il payout-test passa (primo ordine-prova PQ, coda #21). È coerente e onesto.
- **Casa Linda (demo):** anche se ha `payouts_enabled=true` nel seed, ha `is_approved` sul negozio
  fittizio — va comunque tenuta fuori dai KPI/vetrine reali; se compare in liste di test, il gate
  almeno impedisce che si "auto-verifichi" un negozio finto in produzione.

## 🎨 Colore e mani
- 🟡 patch in branch del repo `marketplace/` (owner: frontend-dev per le card + backend-dev per le
  `select` che espongono i due campi Stripe). Cancello = il test al punto 4.
- 🔴 il merge/deploy resta firma di Nicola.
- Serve da Nicola: solo la firma al merge + la scelta del livello di badge pubblico (Identità Verificata
  vs Verificato completo) — default consigliato nello standard.
