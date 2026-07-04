-- 141: ARCH B4 — bonifica dei venditori/rider auto-approvati dal bug (DATI) 🔴
--
-- ⚠️⚠️ QUESTO FILE MODIFICA DATI ESISTENTI — richiede la firma di Nicola. 🔴
--   NON è idempotente in senso "innocuo": demota utenti. Applicare 140 PRIMA
--   (così nessun nuovo utente rientra nel bug) e SOLO DOPO, se si vuole, questo.
--
-- CONTESTO: prima della 140, ogni self-signup con role 'seller'/'rider' nasceva
--   is_approved=TRUE, approval_status='pending' — la firma esatta del bug (uno
--   stato che lo staff NON può produrre: la moderate route setta sempre entrambe
--   le colonne insieme). Questi account sono venditori/rider NON verificati con
--   accesso operativo. Finché latenti (0 ordini oggi) il rischio è contenuto, ma
--   restano una porta aperta.
--
-- SCELTA DI SICUREZZA (marketplace con KYC): DEMOTARLI a non approvati così
--   rientrano nella coda di review dello staff. Colpisce SOLO la firma del bug
--   (is_approved=true AND approval_status='pending'): NON tocca chi è stato
--   approvato davvero (approval_status='approved') né i sospesi/rifiutati.
--
-- REVERSIBILITÀ: nessuna cancellazione. Per riapprovare basta la moderate route
--   (o un UPDATE inverso). Prima di applicare, salvare l'elenco impattato:
--     SELECT id, role, created_at FROM public.profiles
--     WHERE is_approved = true AND approval_status = 'pending'
--       AND role IN ('seller','rider');
--
-- Se si preferisce NON demotare (promuovere in blocco) NON usare questo file:
--   la scelta "approva tutti gli storici" va fatta esplicitamente da Nicola.

BEGIN;

UPDATE public.profiles
   SET is_approved = false
 WHERE is_approved = true
   AND approval_status = 'pending'
   AND role IN ('seller', 'rider');

-- Verifica: dopo l'UPDATE non deve restare nessuna riga nella firma del bug.
-- SELECT count(*) FROM public.profiles
--  WHERE is_approved = true AND approval_status = 'pending' AND role IN ('seller','rider');
--  -> atteso 0

COMMIT;
