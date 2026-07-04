---
tipo: runbook-tecnico
reparto: tech→security
data: 2026-07-04 05:20
azione: SQL 107 — DROP policy profiles + VIEW vetrina
colore: 🟡 (scrittura DB firmata da Nicola 2026-07-02 17:30)
stato: PRONTO — aspetta la mano tecnica (permesso strumento o incolla manuale)
---

# 🔒 SQL 107 — Chiudere il buco RLS su `profiles` (runbook pronto-al-tap)

## In una riga
Oggi chiunque, senza login, può leggere l'**intera riga `profiles`** dei negozi via
PostgREST — **IBAN, KYC, Stripe account id, wallet** inclusi. Questa migrazione
**revoca la policy permissiva** e la sostituisce con una **VIEW vetrina** che espone
solo le colonne pubbliche (nome negozio, indirizzo, orari, logo…). È l'**unico
bloccante RLS rimasto** dopo lo Sprint 1. Il codice del sito è già in produzione
(Render, dal 1/7): manca **solo** far girare questo SQL nel DB.

## Prova che serve ancora (nessun numero inventato)
- Ultima verifica sensore registrata (SALA-OPERATIVA, **2026-07-01 11:10**):
  `anon → profiles.stripe_account_id` risponde ancora **HTTP 200** → la policy
  permissiva **è ancora attiva**, la migrazione 107 **non risulta applicata**.
- Ri-check in sola lettura tentato ora (2026-07-04 05:20) via `execute_sql` MCP →
  **permesso strumento non concesso in questa sessione** → non ri-verificato dal
  vivo, non invento un nuovo stato: vale la baseline dell'1/7.

## Colore e firma
- **🟡** — scrittura su DB di produzione, ma **idempotente e in transazione**
  (`BEGIN … COMMIT`, tutti i comandi `IF EXISTS` / `OR REPLACE`): reversibile e a
  rischio contenuto. È un **hardening di sicurezza**, non un cambio di dati.
- **Firma già presente:** Nicola «eseguilo tu io lo approvo» (**2026-07-02 17:30**,
  DECISIONI) + chiarito il 1/7 11:29 che «ok deploy Sprint 1» copre anche la
  migrazione. Ri-approvata dal Pannello **2026-07-04**. Nessuna seconda firma
  richiesta: manca solo la **mano** per eseguirla.

## Perché l'AD non l'ha eseguita da solo
1. Regola dura CLAUDE.md: **«Mai scritture sul DB»** — la macchina è un sensore in
   sola lettura. La firma di Nicola supera la riga rossa per **questa** migrazione,
   ma serve comunque lo strumento.
2. Lo strumento di scrittura `mcp__supabase-marketplace__apply_migration` (e anche
   `execute_sql`) **non è concesso** nei permessi di questa sessione.
3. L'AD non ha una `MARKETPLACE_SUPABASE_WRITE_KEY` per il REST.

## SQL da eseguire (idempotente — incolla così com'è)
Fonte di verità: `marketplace/migrations/107_seller_public_profiles.sql`.

```sql
BEGIN;

DROP POLICY IF EXISTS "Anyone can view approved seller profiles" ON public.profiles;

CREATE OR REPLACE VIEW public.seller_public_profiles AS
SELECT
  id, store_name, store_address, store_lat, store_lng, store_phone,
  store_logo, store_hours, store_media, store_description,
  store_customization, store_site, offers_express, founded_year,
  is_approved, role, created_at
FROM public.profiles
WHERE is_approved = true
  AND store_name IS NOT NULL
  AND role = 'seller';

COMMENT ON VIEW public.seller_public_profiles IS
  'Vetrina pubblica negozi approvati (solo colonne non sensibili). @foreignKey (id) references public.profiles (id)';

GRANT SELECT ON public.seller_public_profiles TO anon, authenticated;

COMMIT;

NOTIFY pgrst, 'reload schema';
```

## Due strade per farlo partire (30 secondi)
- **Strada A — l'AD lo esegue:** concedi il permesso allo strumento
  `mcp__supabase-marketplace__apply_migration` (o `execute_sql`) → al giro
  successivo l'AD applica la migrazione e lancia lo smoke qui sotto.
- **Strada B — lo esegui tu (manuale):** Supabase → progetto marketplace →
  **SQL Editor** → incolla il blocco sopra → **Run** → scrivi all'AD
  **«fatto sql 107»** → l'AD lancia lo smoke RLS.

## Smoke test RLS (verifica dopo l'esecuzione)
1. **La policy è sparita** (deve tornare 0 righe):
   ```sql
   SELECT policyname FROM pg_policies
   WHERE schemaname='public' AND tablename='profiles'
     AND policyname='Anyone can view approved seller profiles';
   ```
2. **La VIEW esiste ed è leggibile da anon** (deve tornare `t`):
   ```sql
   SELECT EXISTS (
     SELECT 1 FROM information_schema.views
     WHERE table_schema='public' AND table_name='seller_public_profiles'
   );
   ```
3. **anon NON legge più i dati sensibili** — chiamata REST con la anon key:
   - `GET /rest/v1/profiles?select=stripe_account_id` → deve dare **403/permission
     denied** (non più 200 con i dati).
   - `GET /rest/v1/seller_public_profiles?select=store_name` → deve dare **200** con
     i soli campi vetrina.
4. **Il sito regge** (nessuna regressione UI): la home/catalogo mostra ancora i
   negozi (leggono dalla VIEW). Se una scheda negozio va vuota → il frontend legge
   ancora `profiles` invece di `seller_public_profiles` (già gestito nel deploy 1/7,
   ma da confermare a occhio).

## Se qualcosa va storto (rollback)
La migrazione è in transazione: se un comando fallisce, `COMMIT` non avviene e il DB
resta com'era. Per ripristinare *manualmente* la vecchia esposizione (sconsigliato —
riapre il buco) si ricrea la policy permissiva; ma la strada corretta in caso di
regressione UI è **puntare il frontend alla VIEW**, non riaprire `profiles`.

## Dopo il verde
Piattaforma RLS pulita → prerequisito di sicurezza soddisfatto per il **batch
negozi 6/7**. Aggiornare STATO (bloccante RLS → chiuso) e chiudere il loop
(`chiusura-loop.mjs`) su tech/security con atteso→reale.
