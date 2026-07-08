---
data: 2026-07-08 22:40
owner: security + frontend-dev (AD)
tipo: dossier-esecuzione
fonte: proposta approvata dal Pannello «Chiudere l'ultimo blocco di sicurezza del sito prima delle 6 botteghe»
colore: 🟡 (branch/anteprima) + 🔴 (SQL live + deploy)
supera: il framing «1 comando SQL 107» delle code #13/#32 (scritto l'1/7, prima dell'analisi embed del 4/7)
---

# 🔒 Chiudere l'ultimo blocco di sicurezza — SQL 107 / RLS `profiles`

## In una riga
Il leak di **IBAN/KYC/Stripe dei negozi** su `profiles` è l'unico rischio di piattaforma
rimasto. Si chiude con la migrazione **107** (DROP policy permissiva + view vetrina).
**Ma 107 da sola, oggi, rompe la vetrina**: va deployata **insieme** alla migrazione del
codice client (embed → view). Questo dossier corregge il "1 comando" della coda e dà la
sequenza sicura.

## Cosa ho verificato (reale, non a memoria — 2026-07-08)
- **La migrazione `marketplace/migrations/107_seller_public_profiles.sql`** fa esattamente:
  `DROP POLICY "Anyone can view approved seller profiles" ON public.profiles` + crea la VIEW
  `public.seller_public_profiles` (sole colonne vetrina: `store_name/address/lat/lng/phone/logo/
  hours/media/description/is_approved/role/offers_express/founded_year/created_at`; **mai**
  IBAN/KYC/CF/Stripe/wallet). Idempotente, in transazione, `GRANT SELECT` a `anon/authenticated`.
- **Stato DB live: NON applicata.** Il grant MCP read-only sul DB marketplace è **negato in
  questa sessione** (come il 4/7) → non ho potuto ri-misurare il DB. La baseline verificata più
  recente resta quella del 4/7 (#32): *anon HTTP 200 su `profiles` → buco aperto*. Va ri-misurato
  quando la mano è disponibile.
- **Il codice client ha ancora ~34 embed raw `profiles!...fkey` soggetti a RLS** (grep verificato).
  Dopo il DROP di 107 questi tornano `null`:
  - schede prodotto → "negozio non disponibile" (`app/product/[id]/*`)
  - ordini buyer senza dati negozio (`app/orders/*`)
  - **rider senza indirizzo/telefono di ritiro → consegne bloccate** (`app/rider/orders/[id]`, `app/rider/page`)
  - home/ricerca con **`!inner`** (`SearchBar`, `FrequentlyBoughtTogether`) → **i prodotti spariscono del tutto**
- **L'helper di migrazione esiste già ed è collaudato**: `lib/queries/seller-public-profiles.ts`
  (`fetchSellerPublicMap` + `attachSellerProfiles`), pattern usato in `components/ProductGrid.tsx`.
  La view 107 include già tutte le colonne che servono (incl. quelle di ritiro del rider) → non
  serve la 109 per far funzionare la vetrina.

## Perché il vecchio "1 comando" è pericoloso
Le code #13 e #32 (scritte l'1/7) dicono «SQL 107 = 1 comando». Vero per lo **SQL**, ma
**incompleto**: l'1/7 solo `ProductGrid` era stato migrato alla view; gli altri ~34 embed sono
rimasti raw. Applicare 107 "nuda" **oggi** chiuderebbe il leak **e insieme** spegnerebbe
vetrina + ordini + **ritiro rider** — cioè proprio quando le 6 botteghe iniziano a ricevere
ordini (dal 13/7). De-risk oggi: **0 clienti/ordini reali in volo** (solo Pane Quotidiano in
attesa) → la finestra per fare SQL+codice insieme, testati in anteprima, è **adesso**, prima del 13/7.

## Sequenza sicura (owner AD; firma già data 2/7 «eseguilo tu, io approvo», ri-confermata 4/7)
1. **🟡 Codice (branch, no deploy).** Migrare i ~34 embed vetrina-venditore allo helper
   `seller_public_profiles` (branch `fix/107-embed-migration-2026-07-08`). **Stato reale
   2026-07-08: NON producibile in questa sessione** — i comandi `git`/`npx tsc` dentro il repo
   `marketplace/` sono **negati dal sandbox** (stessa classe di blocco della scrittura DB). La
   patch `consegne/tech/2026-07-08-107-embed-migration.patch` **non esiste ancora**; lo spec
   esatto (lista file + pattern helper) è qui sotto ed è mechanical da applicare quando la mano
   è aperta (giro VPS o sessione con Bash su `marketplace/`). **Fuori scope** (NON toccati): admin/api
   (service_role, bypassano RLS) e gli embed che leggono il `full_name` di una controparte
   rider/buyer/reviewer (107 non li rompe; sono il follow-up del blocco 110/GDPR).
2. **🔴 Anteprima + smoke QA** sul branch: scheda prodotto mostra il negozio (non "non
   disponibile"); ricerca ritorna prodotti; **rider vede indirizzo/telefono di ritiro**; checkout
   COD regge. Script pronto: `consegne/qa/2026-07-04-verifica-rls-smoke-checkout.sh`.
3. **🔴 Deploy coordinato**: merge del branch **+** applicazione SQL 107 **nella stessa finestra**
   (prima il codice o insieme; mai lo SQL prima del codice).
4. **🔴 Verifica RLS post-deploy** (quando la mano DB è disponibile): policy permissiva sparita;
   `anon → profiles.stripe_account_id/billing_iban` = 0 righe/403; `seller_public_profiles`
   leggibile (solo colonne vetrina). Runbook: `consegne/tech/2026-07-04-sql-107-drop-policy-runbook.md`.

## Cosa serve per eseguire (l'unico blocco è "la mano")
La firma c'è. In questa sessione sono negati **entrambi** i lati (DB e codice): MCP write
`execute_sql`/`apply_migration` **e** `git`/`npx` dentro `marketplace/`. Serve uno di questi due canali:
- **(A)** una sessione con Bash aperto su `marketplace/` (per costruire+typecheck il branch e
  produrre la patch) **+** grant `mcp__supabase-marketplace__apply_migration`/`execute_sql` e deploy
  del branch su Render → l'AD fa branch → anteprima → SQL → verifica RLS → smoke, **oppure**
- **(B)** un giro sul VPS con rete + credenziali: costruisce il branch, deploya, applica SQL, smoke.

## Il blocco più grande (contesto, NON in questo lavoro)
Questo dossier chiude **solo** il leak IBAN/KYC/Stripe (107 + embed vetrina). Restano, come
cantiere separato già istruito in `consegne/bonifica/WS-DB-RLS.md`, i fix 108-118 (wallet 108,
lockdown profili cross-tenant 110, rider 111, returns 112, ecc.). Non fanno parte di "l'ultimo
blocco" approvato oggi: vanno pianificati a parte per impatto.
