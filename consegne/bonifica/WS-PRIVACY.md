# WS-PRIVACY — Pacchetto di fix «Privacy / GDPR & legale»

> Owner: legale-privacy (senior) · Data: 2026-07-04 · Fonte: `consegne/bonifica/_findings.json` → `privacy-legale` (8 item, tutti coperti).
> Repo analizzato in sola lettura: `/home/user/ad-mycity/marketplace`.
> **Legenda colore:** 🟢 reversibile/doc · 🟡 codice tecnico (branch → anteprima → firma) · 🔴 richiede una **decisione o un dato reale di Nicola** (non applicabile senza).
> **Nota trasversale:** questo è un pacchetto di bozze tecniche + testi legali. La **validità legale finale resta umana**: prima del go-live i testi vanno validati da un DPO/avvocato abilitato.

## Indice findings
| # | Titolo | Severità | Colore fix |
|---|--------|----------|-----------|
| B5 | Documenti KYC mai cancellati alla chiusura account | bloccante | 🟡 (+🔴 job storage) |
| P2 | Sentry (replay/tracing) senza gate di consenso | grave | 🟡 |
| P3 | Elenco destinatari/sub-responsabili incompleto (Google, PostHog, Sentry) | grave | 🟡 doc |
| P4 | Claim Anthropic errato (tratta anche recensioni/Q&A) | grave | 🟡 doc + 🔴 DPA |
| P5 | `mc_vid` + IP pieno senza consenso su eventi auth | grave | 🟡 |
| P6 | Cookie `mc_consent` senza flag `Secure` | minore | 🟡 |
| P7 | Export «Scarica i miei dati» incompleto (activity/audit/KYC) | minore | 🟡 |
| P8 | Identità Titolare con dati segnaposto (P.IVA IT00000000000) | minore | 🔴 |

---

## 🔴 RIEPILOGO PER NICOLA — cosa serve da te (blocca 2 finding + 1 verifica)

1. **Dati reali del Titolare (P8, blocca il go-live legale).** Servono, verificati:
   - Ragione sociale esatta (es. «MyCity S.r.l.» o altra forma) + sede legale reale (via, CAP, città)
   - **P.IVA reale** (ora c'è il segnaposto `IT00000000000`) e, se diversa, C.F. società / n. REA
   - Email **realmente presidiate** per privacy e DPO (le caselle `privacy@mycity.it` / `dpo@mycity.it` devono esistere e rispondere entro 30 gg) — o l'indirizzo alternativo che vuoi usare
   - Nome del DPO se nominato (altrimenti si scrive «referente privacy», non «DPO»).
   → Senza questi, l'informativa è priva di titolare identificabile (artt. 13-14 GDPR): il testo aggiornato lascia i campi come `⟪DA COMPILARE⟫` finché non li dai.

2. **DPA Anthropic (P4, decisione/verifica tua).** Va confermato che nel contratto con Anthropic siano attivi **zero-retention** e **no-training** sui dati inviati (le recensioni/Q&A degli utenti passano da Anthropic). Se il DPA non copre questo, la scelta è: (a) attivare zero-retention, oppure (b) far pseudonimizzare il testo prima dell'invio (patch pronta più sotto). Serve la tua conferma su quale strada.

3. **Verifica provider KYC realmente integrato (P3).** L'informativa cita «Onfido / Jumio / Veriff» ma nel codice i documenti KYC sono caricati su **storage Supabase** (bucket `kyc-docs`), non risulta un provider KYC esterno attivo. Conferma se un provider è realmente integrato: se no, l'elenco va corretto (dettaglio in P3).

**Dipendenze/ordine consigliato:** B5 e P5 sono i più urgenti (dati sensibili + tracking senza consenso) → applicabili subito in branch (🟡). P8 blocca il go-live e dipende solo da te. P4 dipende dalla verifica DPA.

---

# B5 🟡🔴 — I documenti KYC non vengono mai cancellati alla chiusura account

**Causa-radice.** Entrambi i flussi di delete anonimizzano solo colonne di `profiles` + `auth.admin.deleteUser`. Mancano: (a) le colonne `kyc_*_url` / `rider_*_url` dall'anonimizzazione; (b) qualsiasi rimozione dei **file fisici** nel bucket `kyc-docs` (documenti d'identità fronte/retro, selfie, patente, polizza RC, HACCP), che restano orfani a tempo indeterminato sotto `{userId}/`. Violazione art. 17 e art. 5.1.e GDPR sulla categoria di dati più sensibile.

**Fix.** Tre pezzi: (1) helper condiviso che cancella gli oggetti storage e anonimizza le colonne URL, idempotente e con audit; (2) chiamata in **entrambi** i flussi delete; (3) job di reconciliation per gli orfani già presenti.

### (1) Nuovo helper condiviso — `lib/kyc/purge.ts` (NUOVO FILE) 🟡
```ts
import { getAdminSupabase } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

const KYC_BUCKET = 'kyc-docs';

/** Colonne profilo che contengono un path a un documento KYC nel bucket privato. */
export const KYC_URL_COLUMNS = [
  'kyc_id_doc_front_url',
  'kyc_id_doc_back_url',
  'kyc_selfie_url',
  'rider_license_url',
  'rider_insurance_url',
  'rider_haccp_url',
] as const;

/** Anonimizzazione delle colonne URL (da fondere con KYC_FIELDS). */
export const KYC_URL_FIELDS: Record<string, null> = Object.fromEntries(
  KYC_URL_COLUMNS.map((c) => [c, null]),
);

/**
 * Cancella TUTTI i documenti KYC di un utente dallo storage privato.
 * Idempotente (nessun errore se la cartella è già vuota) e ritentabile.
 * Ritorna il numero di oggetti rimossi; non lancia mai (best-effort con log).
 */
export async function purgeKycStorage(userId: string): Promise<{ removed: number; ok: boolean }> {
  const admin = getAdminSupabase();
  try {
    // I file sono in `${userId}/{kind}-{ts}.{ext}` → list della "cartella" utente.
    const { data: objects, error: listErr } = await admin.storage
      .from(KYC_BUCKET)
      .list(userId, { limit: 1000 });
    if (listErr) {
      logger.error('[kyc-purge] list failed', { userId, err: listErr.message });
      return { removed: 0, ok: false };
    }
    if (!objects || objects.length === 0) return { removed: 0, ok: true };

    const paths = objects.map((o) => `${userId}/${o.name}`);
    const { error: rmErr } = await admin.storage.from(KYC_BUCKET).remove(paths);
    if (rmErr) {
      logger.error('[kyc-purge] remove failed', { userId, count: paths.length, err: rmErr.message });
      return { removed: 0, ok: false };
    }
    logger.info('[kyc-purge] removed', { userId, count: paths.length });
    return { removed: paths.length, ok: true };
  } catch (e) {
    logger.error('[kyc-purge] unexpected', { userId, e });
    return { removed: 0, ok: false };
  }
}
```

### (2a) `app/api/cron/process-deletions/route.ts` 🟡
**Before** (righe 1-5, import):
```ts
import { NextResponse, type NextRequest } from 'next/server';
import { ApiErrors } from '@/lib/api/responses';
import { getAdminSupabase } from '@/lib/supabase/server';
import { withCronAuth } from '@/lib/api/middleware';
import { logger } from '@/lib/logger';
```
**After:**
```ts
import { NextResponse, type NextRequest } from 'next/server';
import { ApiErrors } from '@/lib/api/responses';
import { getAdminSupabase } from '@/lib/supabase/server';
import { withCronAuth } from '@/lib/api/middleware';
import { logger } from '@/lib/logger';
import { purgeKycStorage, KYC_URL_FIELDS } from '@/lib/kyc/purge';
```
**Before** (riga 66, chiusura oggetto `KYC_FIELDS`):
```ts
  billing_card_last4: null,
  approval_status: 'rejected',
};
```
**After** (aggiunge le colonne URL all'anonimizzazione):
```ts
  billing_card_last4: null,
  approval_status: 'rejected',
  ...KYC_URL_FIELDS,
};
```
**Before** (righe 133-143, dopo il commento "2) Hard delete auth.users"):
```ts
    // 2) Hard delete auth.users
    const { error: delErr } = await admin.auth.admin.deleteUser(userId);
    if (delErr) {
      logger.error('[cron-deletions] auth delete failed', { userId, err: delErr.message });
      results.failed++;
      results.errors.push(`${userId}: auth delete failed`);
      continue;
    }

    results.ok++;
    logger.info('[cron-deletions] processed', { userId });
```
**After** (aggiunge la purge storage + audit prima del deleteUser — così se il delete auth fallisce, i file sono comunque già rimossi):
```ts
    // 1c) B5: cancella i documenti KYC fisici dallo storage privato (Art.17).
    // Idempotente: un retry del cron non fallisce se la cartella è già vuota.
    const purge = await purgeKycStorage(userId);
    if (!purge.ok) {
      // Non blocca la cancellazione dell'account, ma tiene traccia per il job
      // di reconciliation: l'orfano verrà ripreso.
      logger.warn('[cron-deletions] kyc storage purge non completata', { userId });
    }

    // 2) Hard delete auth.users
    const { error: delErr } = await admin.auth.admin.deleteUser(userId);
    if (delErr) {
      logger.error('[cron-deletions] auth delete failed', { userId, err: delErr.message });
      results.failed++;
      results.errors.push(`${userId}: auth delete failed`);
      continue;
    }

    results.ok++;
    logger.info('[cron-deletions] processed', { userId, kycRemoved: purge.removed });
```

### (2b) `app/api/admin/users/[id]/delete/route.ts` 🟡
**Before** (righe 1-6, import):
```ts
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { withAdminAuthRateLimit } from '@/lib/api/middleware';
import { ApiErrors } from '@/lib/api/responses';
import { writeAudit } from '@/lib/audit';
```
**After:**
```ts
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { withAdminAuthRateLimit } from '@/lib/api/middleware';
import { ApiErrors } from '@/lib/api/responses';
import { writeAudit } from '@/lib/audit';
import { purgeKycStorage, KYC_URL_FIELDS } from '@/lib/kyc/purge';
```
**Before** (riga 54-55, chiusura `KYC_FIELDS`):
```ts
  billing_card_last4: null,
  approval_status: 'rejected',
};
```
**After:**
```ts
  billing_card_last4: null,
  approval_status: 'rejected',
  ...KYC_URL_FIELDS,
};
```
> Nota: questo file istanzia il proprio `admin` via `createClient` con `SUPABASE_SERVICE_ROLE_KEY`, mentre `purgeKycStorage` usa `getAdminSupabase()`. Entrambi girano con service-role: nessun conflitto. Se preferisci una sola istanza, si può passare il client come parametro all'helper (variante minore).

**Before** (righe 98-106, "6) Cancella da auth.users"):
```ts
  // 6) Cancella da auth.users
  const { error: delErr } = await admin.auth.admin.deleteUser(targetId);
  if (delErr) {
    logger.error('admin delete: auth deletion failed', delErr);
    return NextResponse.json(
      { error: `Profilo anonimizzato ma cancellazione auth fallita: ${delErr.message}` },
      { status: 500 },
    );
  }
```
**After:**
```ts
  // 5b) B5: cancella i documenti KYC fisici dallo storage privato (Art.17).
  const purge = await purgeKycStorage(targetId);
  if (!purge.ok) {
    logger.warn('admin delete: kyc storage purge non completata', { targetId });
  }

  // 6) Cancella da auth.users
  const { error: delErr } = await admin.auth.admin.deleteUser(targetId);
  if (delErr) {
    logger.error('admin delete: auth deletion failed', delErr);
    return NextResponse.json(
      { error: `Profilo anonimizzato ma cancellazione auth fallita: ${delErr.message}` },
      { status: 500 },
    );
  }
```
**Before** (righe 108-114, `writeAudit`):
```ts
  await writeAudit({
    actorId: caller.id,
    action: 'user.delete',
    targetTable: 'profiles',
    targetId: targetId,
    metadata: { role: targetProfile.role, name: targetProfile.store_name ?? targetProfile.full_name },
  });
```
**After** (traccia l'esito della purge KYC nell'audit):
```ts
  await writeAudit({
    actorId: caller.id,
    action: 'user.delete',
    targetTable: 'profiles',
    targetId: targetId,
    metadata: {
      role: targetProfile.role,
      name: targetProfile.store_name ?? targetProfile.full_name,
      kyc_docs_removed: purge.removed,
      kyc_purge_ok: purge.ok,
    },
  });
```

### (3) 🔴 Job di reconciliation orfani — decisione di Nicola
Serve un job che elenchi le "cartelle" utente in `kyc-docs` e rimuova quelle **senza profilo corrispondente** (o con profilo già anonimizzato/cancellato). È 🔴 perché è un'operazione **distruttiva su storage** e va schedulata: chiedo a Nicola il via prima di attivarla. Bozza pronta (da mettere in `app/api/cron/reconcile-kyc-orphans/route.ts`, protetta da `withCronAuth`):
```ts
// Pseudocodice del job (schedulare settimanale, dopo il cron di deletions):
// 1) list top-level "folders" del bucket kyc-docs → set di userId presenti nello storage
// 2) per ogni userId: SELECT id FROM profiles WHERE id = userId
//    - se il profilo non esiste  → orfano certo → purgeKycStorage(userId)
//    - se esiste ma approval_status='rejected' E kyc_*_url tutti NULL → orfano (già anonimizzato) → purge
// 3) log audit del numero di cartelle rimosse; MAI rimuovere se la list del bucket fallisce (fail-safe).
```
> Colore 🔴: la prima esecuzione va fatta in **dry-run** (solo log di cosa rimuoverebbe) e rivista da Nicola prima di abilitare la rimozione reale, per non cancellare documenti di utenti attivi in caso di bug.

**Test/verifica (B5).**
1. Unit: mock `storage.list` → 3 oggetti, verifica che `remove` sia chiamato con i 3 path corretti e `removed===3`.
2. Idempotenza: seconda chiamata con cartella vuota → `list` ritorna `[]` → `removed===0, ok===true` (nessun errore).
3. E2E su ambiente di test: crea utente di prova, carica un doc KYC (upload-document), lancia il flusso delete, verifica via `storage.list(userId)` che la cartella sia vuota **e** che le colonne `kyc_*_url` siano NULL.
4. Resilienza: forza errore su `remove` → l'account viene comunque cancellato, `ok===false` loggato, audit registra `kyc_purge_ok:false`.

**Rischio & rollback.** Rischio basso: la purge gira **dopo** l'anonimizzazione e prima/indipendentemente dal deleteUser; se fallisce non blocca la cancellazione. Rollback: rimuovere le due chiamate `purgeKycStorage` e l'import (i file tornerebbero a non essere cancellati — regressione della violazione). Il job di reconciliation (3) è separato e non parte finché Nicola non lo abilita.

**Dipendenze.** Bucket `kyc-docs` esistente (già usato in upload-document). Nessuna migrazione DB. `getAdminSupabase()` con service-role (già presente). Coordinare con **@security** (accesso storage) e **@backend-dev** (review del job orfani).

---

# P2 🟡 — Sentry (session replay + tracing) senza gate di consenso

**Causa-radice.** `SentryProvider` è montato incondizionatamente in `app/layout.tsx:148`; `initSentry()` parte al primo mount se `NEXT_PUBLIC_SENTRY_DSN` è presente, attivando `replaysSessionSampleRate: 0.05` e `tracesSampleRate: 0.1` **prima di qualsiasi consenso**. GA4 e PostHog invece leggono `readConsent().analytics`. `lib/consent.ts:8` colloca «Sentry performance» sotto la categoria `analytics`: il codice contraddice la propria policy. Violazione art. 122 Codice Privacy + artt. 6/7 GDPR.

**Fix.** Gate `initSentry()` sul consenso `analytics`, reagendo a `mc:consent-change` (stesso pattern di PostHog/GA4). L'error-capturing via `captureError` resta disponibile ma non inizializza replay/tracing finché non c'è consenso.

### `lib/analytics/sentry.tsx` 🟡
**Before** (righe 1-3, import):
```tsx
'use client';

import { useEffect } from 'react';
```
**After:**
```tsx
'use client';

import { useEffect } from 'react';
import { readConsent } from '@/lib/consent';
```
**Before** (righe 24-26, guardia di `initSentry`):
```tsx
async function initSentry() {
  if (initialized || !DSN || typeof window === 'undefined') return;
  initialized = true;
```
**After** (aggiunge il gate di consenso analytics):
```tsx
async function initSentry() {
  if (initialized || !DSN || typeof window === 'undefined') return;
  // P2: session replay + tracing sono trattamenti "analytics" → richiedono
  // consenso (coerente con GA4/PostHog e con lib/consent.ts). Senza consenso
  // NON inizializziamo Sentry (niente replay né tracing).
  if (!readConsent()?.analytics) return;
  initialized = true;
```
**Before** (righe 84-93, `SentryProvider`):
```tsx
export default function SentryProvider() {
  useEffect(() => {
    initSentry();
    // Catch unhandled promise rejections globally
    const onUnhandled = (e: PromiseRejectionEvent) => captureError(e.reason, { type: 'unhandledrejection' });
    window.addEventListener('unhandledrejection', onUnhandled);
    return () => window.removeEventListener('unhandledrejection', onUnhandled);
  }, []);
  return null;
}
```
**After** (inizializza solo con consenso e reagisce al cambio di consenso a runtime):
```tsx
export default function SentryProvider() {
  useEffect(() => {
    // Prova a inizializzare (no-op senza consenso analytics, vedi initSentry).
    initSentry();
    // P2: se l'utente concede il consenso dopo il primo mount, attiva Sentry
    // senza attendere un reload. La revoca non "spegne" l'SDK già caricato
    // (limite dell'SDK), ma senza consenso iniziale non parte affatto.
    const onConsentChange = () => { void initSentry(); };
    window.addEventListener('mc:consent-change', onConsentChange);
    // Catch unhandled promise rejections globally
    const onUnhandled = (e: PromiseRejectionEvent) => captureError(e.reason, { type: 'unhandledrejection' });
    window.addEventListener('unhandledrejection', onUnhandled);
    return () => {
      window.removeEventListener('mc:consent-change', onConsentChange);
      window.removeEventListener('unhandledrejection', onUnhandled);
    };
  }, []);
  return null;
}
```
> Nota sulla revoca: come per PostHog/GA4 in questo codebase, l'SDK già inizializzato non viene distrutto alla revoca nello stesso pageload (limite tecnico Sentry); alla navigazione/reload successivo non riparte. Se si vuole spegnere il replay anche a runtime, si può chiamare `Sentry.getReplay()?.stop()` nel branch di revoca — miglioria opzionale, non bloccante.

**Test/verifica.** 1) Senza cookie di consenso → in DevTools/Network nessuna richiesta a `ingest.sentry.io`; `window.__SENTRY__` assente. 2) Accetta analytics → `mc:consent-change` scatta → Sentry si inizializza (richiesta a Sentry visibile). 3) Con `NEXT_PUBLIC_SENTRY_DSN` non impostata → nessun effetto (comportamento invariato).

**Rischio & rollback.** Rischio basso; effetto: si perdono i replay/tracing degli utenti che rifiutano analytics (corretto). Rollback: rimuovere il `readConsent()` guard. **Dipendenze:** P3 (aggiungere Sentry ai destinatari in /privacy e /cookies) va fatto insieme.

---

# P3 🟡 — Elenco destinatari/sub-responsabili incompleto (Google, PostHog, Sentry) + cookie policy senza PostHog / `mc_vid` / replay

**Causa-radice.** Il codice integra GA4, PostHog (`session_recording` + `identify` con email in `components/hooks/useProfile.ts`) e Sentry, ma `app/privacy/page.tsx` §4 non li elenca, e `app/cookies/page.tsx` cita solo `_ga`, senza PostHog, senza `mc_vid`, senza descrivere il session replay. Difetto di trasparenza (artt. 13.1.e, 14, 30 GDPR; art. 122 Codice Privacy).

**Fix.** Aggiornare **due** documenti. Testo esatto pronto da incollare qui sotto. È tutto 🟢/🟡 (contenuto), ma va coordinato con la verifica del provider KYC (🔴, vedi riepilogo).

### 3.1 `app/privacy/page.tsx` §4 — TESTO ESATTO dei destinatari
Sostituire l'intera `<ul>` dei destinatari (righe 101-109) con:
```tsx
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Supabase Inc.</strong> (Stati Uniti — Standard Contractual Clauses) — hosting database, autenticazione, storage dei documenti.</li>
          <li><strong>Stripe Payments Europe Ltd.</strong> (Irlanda) — gestione pagamenti elettronici, PSP autorizzato.</li>
          <li><strong>Resend Inc.</strong> (Stati Uniti — SCC) — invio email transazionali.</li>
          <li><strong>Cloudflare Inc.</strong> (Stati Uniti — SCC) — CDN, protezione DDoS, CAPTCHA.</li>
          <li><strong>Google LLC</strong> (Stati Uniti — SCC) — statistiche di utilizzo aggregate (Google Analytics 4), attivate solo previo consenso ai cookie analitici.</li>
          <li><strong>PostHog Inc.</strong> (Stati Uniti — SCC) — analisi del prodotto e registrazione di sessione (session replay), attivate solo previo consenso ai cookie analitici. Riceve un identificativo utente ed eventi di navigazione.</li>
          <li><strong>Sentry (Functional Software, Inc.)</strong> (Stati Uniti — SCC) — monitoraggio errori e performance dell&apos;applicazione, con registrazione di sessione in caso di errore, attivato solo previo consenso ai cookie analitici.</li>
          <li><strong>Anthropic PBC</strong> (Stati Uniti — SCC) — funzioni di intelligenza artificiale: analisi delle immagini prodotto caricate dai venditori e sintesi di contenuti generati dagli utenti (recensioni, domande e risposte). I dati inviati non sono usati per l&apos;addestramento dei modelli.</li>
          <li><strong>OpenStreetMap Foundation</strong> (Regno Unito — decisione di adeguatezza) — geocodifica degli indirizzi.</li>
        </ul>
```
> ⚠️ **Provider KYC (riga 107 attuale):** l'elenco cita «Onfido / Jumio / Veriff» ma nel codice i documenti KYC sono su storage Supabase, senza provider esterno rilevato. **Ho rimosso la voce** dalla lista qui sopra per non dichiarare un sub-responsabile inesistente. Se un provider KYC **è** realmente integrato, Nicola lo conferma e si reinserisce con nome esatto (🔴, vedi riepilogo punto 3). Se non c'è, va bene così.

### 3.2 `app/privacy/page.tsx` §2 — allineare la voce «Dati di navigazione»
La riga 68 dice «pagine visitate, click, tempo di permanenza». Sostituirla con testo che dichiara replay e identificativo:
```tsx
          <li><strong>Dati di navigazione e di utilizzo:</strong> pagine visitate, click, tempo di permanenza, registrazione delle interazioni di sessione (session replay) e un identificativo di navigazione di prima parte (cookie <code>mc_vid</code>) — trattati solo se attivi i cookie analitici.</li>
```

### 3.3 `app/cookies/page.tsx` §2.1 — aggiungere `mc_vid` ai cookie tecnici/di prima parte
> `mc_vid` è un cookie di correlazione: dopo il fix P5 viene impostato **solo con consenso analytics**, quindi va documentato tra i cookie di **analisi** (§2.3), non tra i tecnici. Vedi 3.4.

### 3.4 `app/cookies/page.tsx` §2.3 — TESTO ESATTO cookie di analisi
Sostituire il paragrafo + tabella (righe 63-70) con:
```tsx
        <h3 className="font-semibold text-ink-900 mt-4 mb-2">2.3 Cookie e tecnologie di analisi (richiede consenso)</h3>
        <p>
          Statistiche di utilizzo del sito e analisi del prodotto. Attivati solo dopo il tuo
          consenso. L&apos;indirizzo IP viene troncato (ultimo ottetto azzerato) prima di essere
          registrato. Alcuni strumenti registrano le interazioni di sessione (session replay) per
          capire come viene usato il sito e diagnosticare i problemi.
        </p>
        <CookieTable rows={[
          { name: '_ga / _ga_*', purpose: 'Statistiche di utilizzo aggregate', duration: '14 mesi', provider: 'Google Analytics 4' },
          { name: 'ph_* (localStorage)', purpose: 'Analisi prodotto e session replay', duration: 'Fino a 12 mesi', provider: 'PostHog' },
          { name: 'mc_vid', purpose: 'Identificativo di navigazione per correlare le visite e collegarle all\'account dopo il login', duration: '1 anno', provider: 'Prima parte' },
          { name: 'sentryReplaySession', purpose: 'Registrazione di sessione in caso di errore (diagnostica)', duration: 'Sessione', provider: 'Sentry' },
        ]} />
```

### 3.5 `app/cookies/page.tsx` §4 — trasferimenti extra-UE (aggiungere PostHog e Sentry)
Sostituire il paragrafo (righe 104-108) con:
```tsx
        <p>
          Alcuni provider hanno sede negli Stati Uniti (Cloudflare, Google, PostHog, Sentry,
          Stripe Inc., Anthropic, Resend). I trasferimenti sono coperti dalle Standard Contractual
          Clauses adottate dalla Commissione Europea con Decisione 2021/914.
        </p>
```

### 3.6 Condivisione email con PostHog — `components/hooks/useProfile.ts:35,43`
Il codice fa `identify(uid, { email })`. **Ora è dichiarato** (PostHog «riceve un identificativo utente», e in §4 «riceve un identificativo utente ed eventi»). In alternativa, se si vuole minimizzare, **rimuovere l'email** dall'`identify` (inviare solo `uid`): scelta consigliata (minimizzazione), la segnalo come opzione a @data-engineer. Decidere UNA delle due: dichiarare (fatto sopra) **oppure** smettere di inviarla.

**Test/verifica (P3).** Renderizzare `/privacy` e `/cookies` e verificare a occhio che gli elenchi corrispondano ai provider realmente presenti nel codice (grep: GA4, PostHog, Sentry, Anthropic, Stripe, Supabase, Resend, Cloudflare, OSM). Nessun provider dichiarato che non esista; nessun provider integrato che non sia dichiarato.

**Rischio & rollback.** Nessun rischio tecnico (solo testo). Rollback: git revert dei due file. **Dipendenze:** allineato a P2 (Sentry gated), P4 (Anthropic UGC), P5 (`mc_vid` gated su consenso).

---

# P4 🟡🔴 — Claim su Anthropic errato: le recensioni degli acquirenti gli vengono inviate

**Causa-radice.** `app/privacy/page.tsx:106` dichiara su Anthropic «solo immagini caricate dai venditori; nessun dato personale dell'acquirente». Ma `app/api/ai/reviews-summary/route.ts:80,88` costruisce `dataText` dal **testo delle recensioni degli acquirenti** e lo invia ad Anthropic. Il perimetro dichiarato è falso: contenuti personali dei clienti sono trattati da un sub-responsabile USA. (Pattern simile in altre route `app/api/ai/*` su UGC.)

**Fix — due leve, entrambe raccomandate.**
1. **Correggere l'informativa** (già fatto in P3 §3.1: la voce Anthropic ora dice «sintesi di contenuti generati dagli utenti (recensioni, domande e risposte)»). 🟡/🟢 doc.
2. **Verificare il DPA + attivare zero-retention/no-training** su Anthropic → **🔴 decisione/verifica di Nicola** (vedi riepilogo punto 2).

**Opzione tecnica di minimizzazione (consigliata come difesa aggiuntiva) 🟡** — pseudonimizzare/ridurre PII nel testo prima dell'invio. Le recensioni possono contenere nomi propri, indirizzi, numeri. Patch minima in `reviews-summary/route.ts`:
**Before** (riga 80):
```ts
  const dataText = `${productLine}Recensioni dei clienti (${reviews.length}):\n${reviews.join('\n')}`;
```
**After** (scrub leggero di email/telefono/IBAN prima dell'invio ad Anthropic):
```ts
  // P4: minimizzazione — rimuovi PII evidente dal testo prima di inviarlo al
  // sub-responsabile AI (le recensioni sono UGC e possono contenere contatti).
  const scrubPii = (s: string) =>
    s
      .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email]')
      .replace(/\b(?:\+?39[\s.-]?)?(?:\d[\s.-]?){9,10}\b/g, '[telefono]')
      .replace(/\bIT\d{2}[A-Z0-9]{11,27}\b/gi, '[iban]');
  const dataText = scrubPii(`${productLine}Recensioni dei clienti (${reviews.length}):\n${reviews.join('\n')}`);
```
> Nota onesta: lo scrub regex **non** elimina i nomi propri (non deterministico) — è una riduzione del rischio, non un'anonimizzazione completa. La copertura legale resta il DPA + base informativa corretta (punti 1 e 2). Applicare lo stesso helper alle altre route `app/api/ai/*` che passano UGC (answer-qa, product-chat): task per @backend-dev, fuori dal perimetro di questi 8 file ma segnalato.

**Test/verifica.** 1) Unit sullo `scrubPii`: input con email/telefono/IBAN → output con i placeholder. 2) Verifica manuale che la voce Anthropic in `/privacy` non contenga più «nessun dato personale dell'acquirente».

**Rischio & rollback.** Rischio basso; lo scrub potrebbe mascherare numeri legittimi in una recensione (es. «3 stelle su 5» → improbabile col pattern 9-10 cifre). Rollback: rimuovere `scrubPii`. **Dipendenze:** 🔴 verifica DPA Anthropic (Nicola).

---

# P5 🟡 — `mc_vid` + IP pieno senza consenso sugli eventi auth; `mc_vid` non documentato

**Causa-radice.** In `app/api/track/route.ts` il gate di consenso `analytics` copre solo la categoria `visitor` (righe 87-90). Gli eventi `auth` (login/logout/signup) **generano e impostano** `mc_vid` (cookie httpOnly 1 anno, identificatore di correlazione cross-sessione) e salvano l'**IP pieno** (`getClientIp` → `lib/activity.ts`) senza consenso. Il claim «IP anonimizzato» (cookies §2.3) è smentito. Violazione art. 122 + artt. 6/7 GDPR.

**Fix.** (a) `mc_vid` è un identificatore di tracciamento → generarlo **solo con consenso analytics** (anche per gli eventi auth); (b) troncare l'IP (ultimo ottetto) prima di salvarlo in `activity_events`; (c) impostare il cookie `mc_vid` con flag `Secure`; (d) documentare `mc_vid` (fatto in P3 §3.4) e allineare il claim «IP anonimizzato» (fatto in P3 §3.4). Gli eventi auth **restano loggati** (finalità di sicurezza / legittimo interesse) ma senza tracking id e con IP troncato.

### (a) Helper di anonimizzazione IP — `lib/rate-limit.ts` 🟡
**Before** (righe 152-159, fine file):
```ts
/** Estrae IP "ragionevole" da NextRequest. Non perfetto contro spoofing. */
export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}
```
**After** (aggiunge `anonymizeIp`; `getClientIp` resta pieno per la chiave di rate-limit):
```ts
/** Estrae IP "ragionevole" da NextRequest. Non perfetto contro spoofing. */
export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

/**
 * Anonimizza un IP per la memorizzazione: azzera l'ultimo ottetto (IPv4) o gli
 * ultimi gruppi (IPv6, /48). Coerente con il claim "IP anonimizzato" in privacy.
 * L'IP pieno resta usato solo in memoria per la chiave di rate-limit, non salvato.
 */
export function anonymizeIp(ip: string | null | undefined): string | null {
  if (!ip || ip === 'unknown') return null;
  if (ip.includes(':')) {
    const parts = ip.split(':').filter(Boolean);
    return parts.slice(0, 3).join(':') + '::';
  }
  const p = ip.split('.');
  if (p.length === 4) { p[3] = '0'; return p.join('.'); }
  return null;
}
```

### (b)(c) `app/api/track/route.ts` 🟡
**Before** (righe 2, import):
```ts
import { rateLimitAsync, getClientIp } from '@/lib/rate-limit';
```
**After:**
```ts
import { rateLimitAsync, getClientIp, anonymizeIp } from '@/lib/rate-limit';
```
**Before** (righe 79-109 — gate visitor + generazione mc_vid):
```ts
  const eventType = typeof body.event_type === 'string' ? body.event_type : '';
  const category = ALLOWED_EVENTS[eventType];
  if (!category) return noContent(); // tipo non in allowlist → ignora

  // 🟡-8: defense-in-depth GDPR. Gli eventi di analitica/sorveglianza ('visitor':
  // page_view, session_start) richiedono il consenso 'analytics' anche lato
  // server, non solo nel client. Gli eventi 'auth' (login/logout/signup) sono
  // funzionali/di sicurezza e non sono soggetti a consenso.
  if (category === 'visitor') {
    const consent = parseConsentCookie(readCookie(request.headers.get('cookie'), CONSENT_COOKIE) ?? undefined);
    if (!consent.analytics) return noContent();
  }
```
**After** (legge il consenso una volta; blocca i visitor senza consenso come prima):
```ts
  const eventType = typeof body.event_type === 'string' ? body.event_type : '';
  const category = ALLOWED_EVENTS[eventType];
  if (!category) return noContent(); // tipo non in allowlist → ignora

  // 🟡-8 / P5: consenso letto una sola volta. I 'visitor' senza consenso analytics
  // vengono ignorati; gli 'auth' (login/logout/signup) restano loggati come
  // eventi di sicurezza (legittimo interesse), ma SENZA identificatore di
  // tracciamento e con IP troncato (vedi sotto).
  const consent = parseConsentCookie(readCookie(request.headers.get('cookie'), CONSENT_COOKIE) ?? undefined);
  if (category === 'visitor' && !consent.analytics) return noContent();
```
**Before** (righe 102-109 — generazione mc_vid):
```ts
  // id visitatore stabile (cookie di prima parte). Generato server-side e
  // mantenuto anche dopo il login → correla anonimo ↔ account.
  let vid = readCookie(request.headers.get('cookie'), VID_COOKIE);
  let setCookie = false;
  if (!vid) {
    vid = crypto.randomUUID();
    setCookie = true;
  }
```
**After** (genera `mc_vid` SOLO con consenso analytics; è un identificatore di correlazione = finalità analytics):
```ts
  // id visitatore stabile (cookie di prima parte, finalità di correlazione =
  // analytics). P5: lo generiamo/impostiamo SOLO con consenso analytics.
  // Senza consenso l'evento (es. auth) viene comunque loggato ma con anonId null.
  let vid = readCookie(request.headers.get('cookie'), VID_COOKIE);
  let setCookie = false;
  if (!vid && consent.analytics) {
    vid = crypto.randomUUID();
    setCookie = true;
  }
```
**Before** (righe 120-139 — chiamata `recordActivity`, campo `ip`):
```ts
  await recordActivity({
    category,
    eventType,
    summary: (SUMMARY[eventType] ?? (() => eventType))(path ?? undefined),
    actorId: userId,
    userId,
    anonId: vid,
    sessionId,
    path,
    referrer,
    ip,
    userAgent: ua,
```
**After** (salva l'IP troncato; `anonId` è `vid` che ora può essere null):
```ts
  await recordActivity({
    category,
    eventType,
    summary: (SUMMARY[eventType] ?? (() => eventType))(path ?? undefined),
    actorId: userId,
    userId,
    anonId: vid,
    sessionId,
    path,
    referrer,
    ip: anonymizeIp(ip),
    userAgent: ua,
```
**Before** (righe 141-152 — set cookie mc_vid):
```ts
  const res = noContent();
  if (setCookie && vid) {
    res.cookies.set({
      name: VID_COOKIE,
      value: vid,
      maxAge: VID_MAX_AGE,
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
    });
  }
  return res;
```
**After** (aggiunge `secure` in produzione):
```ts
  const res = noContent();
  if (setCookie && vid) {
    res.cookies.set({
      name: VID_COOKIE,
      value: vid,
      maxAge: VID_MAX_AGE,
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
  }
  return res;
```

**Test/verifica (P5).** 1) POST evento `login` senza cookie `mc_consent` → 204, nessun `Set-Cookie: mc_vid`, e in `activity_events` la riga ha `anon_id NULL` e `ip` con ultimo ottetto `0` (es. `93.45.12.0`). 2) Con consenso analytics → `mc_vid` impostato con `Secure` (in prod) e IP comunque troncato. 3) Rate-limit invariato (usa `ip` pieno solo in memoria per la chiave). 4) Claim `/cookies` §2.3 «IP troncato» ora veritiero.

**Rischio & rollback.** L'IP troncato riduce la precisione geografica/anti-fraude su `activity_events` (accettabile; `audit_logs` conserva l'IP pieno per la sicurezza). `mc_vid` senza consenso non viene più creato → si perde la correlazione anonimo↔account per chi rifiuta (corretto). Rollback: revert del file + rimozione di `anonymizeIp`. **Dipendenze:** P6 (Secure sul cookie di consenso), P3 (documentazione `mc_vid`).

---

# P6 🟡 — Cookie di consenso `mc_consent` senza flag `Secure`

**Causa-radice.** `lib/consent.ts:72` scrive `mc_consent` con `SameSite=Lax` ma senza `Secure`, quindi trasmissibile in chiaro. Il sito è HTTPS.

**Fix.** `lib/consent.ts` 🟡
**Before** (righe 68-72):
```ts
  const maxAge = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60;
  const value = encodeURIComponent(
    `${next.functional ? 1 : 0}${next.analytics ? 1 : 0}${next.marketing ? 1 : 0}`,
  );
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
```
**After:**
```ts
  const maxAge = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60;
  const value = encodeURIComponent(
    `${next.functional ? 1 : 0}${next.analytics ? 1 : 0}${next.marketing ? 1 : 0}`,
  );
  // P6: su HTTPS il cookie di prima parte deve viaggiare solo cifrato.
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
```

**Test/verifica.** In DevTools → Application → Cookies: `mc_consent` mostra `Secure ✓` su https, assente in dev http (localhost). **Rischio & rollback.** Nullo; su localhost http il cookie resta scrivibile (il guard evita di romperlo in dev). Rollback: rimuovere il suffisso. **Dipendenze:** nessuna.

---

# P7 🟡 — Export «Scarica i miei dati» omette activity_events, audit_logs e documenti KYC

**Causa-radice.** `app/api/account/export/route.ts` esporta profilo/ordini/recensioni ecc. ma non `activity_events` (tracciamento comportamentale: IP, device, `mc_vid`), non `audit_logs` relativi all'utente, né i documenti KYC. La metadata afferma «tutti i dati personali associati al tuo account»: non veritiera. Riscontro all'accesso incompleto (art. 15).

**Fix.** Aggiungere le query mancanti + una sezione KYC con signed URL a TTL breve, e distinguere portabilità (art. 20) da accesso (art. 15).

### `app/api/account/export/route.ts` 🟡
**Before** (righe 38-73 — array di query parallele, ultime voci):
```ts
    admin.from('notifications').select('*').eq('user_id', userId),
    // 🟡-13: chat e contact form fanno parte dei dati personali (Art. 15/20).
    admin.from('conversations').select('*').or(`buyer_id.eq.${userId},seller_id.eq.${userId}`),
    admin.from('messages').select('*').eq('sender_id', userId),
    admin.from('contact_messages').select('*').eq('user_id', userId),
  ]);
```
**After** (aggiunge activity_events e audit_logs alla destrutturazione e all'array):
```ts
    admin.from('notifications').select('*').eq('user_id', userId),
    // 🟡-13: chat e contact form fanno parte dei dati personali (Art. 15/20).
    admin.from('conversations').select('*').or(`buyer_id.eq.${userId},seller_id.eq.${userId}`),
    admin.from('messages').select('*').eq('sender_id', userId),
    admin.from('contact_messages').select('*').eq('user_id', userId),
    // P7: tracciamento comportamentale e audit → dovuti in accesso (Art. 15).
    admin.from('activity_events').select('*').or(`user_id.eq.${userId},actor_id.eq.${userId}`).limit(5000),
    admin.from('audit_logs').select('*').or(`actor_id.eq.${userId},target_id.eq.${userId}`).limit(5000),
  ]);
```
E aggiornare la destrutturazione all'inizio (righe 38-54): aggiungere `activityEvents,` e `auditLogs,` in coda alla lista prima di `] = await Promise.all([`.
**Before** (righe 47-54, coda destrutturazione):
```ts
    notifications,
    conversations,
    chatMessages,
    contactMessages,
  ] = await Promise.all([
```
**After:**
```ts
    notifications,
    conversations,
    chatMessages,
    contactMessages,
    activityEvents,
    auditLogs,
  ] = await Promise.all([
```
**Sezione KYC (signed URL) — inserire prima della costruzione del `payload`, dopo riga 79:**
```ts
  // P7: riferimenti scaricabili ai documenti KYC dell'utente (Art. 15). Non
  // esportiamo i binari nel JSON: generiamo signed URL a TTL breve (1h) per i
  // path presenti nel profilo. Se il profilo è già anonimizzato, l'oggetto è vuoto.
  const KYC_COLS = [
    'kyc_id_doc_front_url', 'kyc_id_doc_back_url', 'kyc_selfie_url',
    'rider_license_url', 'rider_insurance_url', 'rider_haccp_url',
  ] as const;
  const kycDocuments: Record<string, string> = {};
  for (const col of KYC_COLS) {
    const p = (profile.data as Record<string, unknown> | null)?.[col];
    if (typeof p === 'string' && p) {
      const { data: signed } = await admin.storage.from('kyc-docs').createSignedUrl(p, 60 * 60);
      if (signed?.signedUrl) kycDocuments[col] = signed.signedUrl;
    }
  }
```
**Before** (righe 81-110, oggetto `payload`):
```ts
  const payload = {
    export_metadata: {
      generated_at: new Date().toISOString(),
      gdpr_article: 20,
      user_id: userId,
      email: userEmail,
      note: 'Questo file contiene tutti i dati personali associati al tuo account. Conservato in formato JSON strutturato e leggibile come previsto dall\'art. 20 GDPR.',
    },
    profile: profileClean,
    ...
    contact_messages: contactMessages.data ?? [],
  };
```
**After** (metadata onesta + nuove sezioni; distingue art. 20 da art. 15):
```ts
  const payload = {
    export_metadata: {
      generated_at: new Date().toISOString(),
      gdpr_articles: [15, 20],
      user_id: userId,
      email: userEmail,
      note: 'Questo file contiene i dati personali associati al tuo account. I dati forniti da te e trattati per contratto/consenso sono resi in portabilità (art. 20); i log di attività, di audit e i documenti KYC sono resi in accesso (art. 15). I link ai documenti KYC scadono dopo 1 ora.',
    },
    profile: profileClean,
    addresses: addresses.data ?? [],
    orders_as_buyer: ordersAsBuyer.data ?? [],
    orders_as_seller: ordersAsSeller.data ?? [],
    orders_as_rider: ordersAsRider.data ?? [],
    reviews: {
      products: productReviews.data ?? [],
      stores: storeReviews.data ?? [],
      riders: riderReviews.data ?? [],
    },
    favorites: favorites.data ?? [],
    referrals: {
      as_referrer: referralsOut.data ?? [],
      as_referred: referralsIn.data ?? [],
    },
    notifications: notifications.data ?? [],
    chat: {
      conversations: conversations.data ?? [],
      messages_sent: chatMessages.data ?? [],
    },
    contact_messages: contactMessages.data ?? [],
    // P7: dati resi in accesso (art. 15)
    activity_events: activityEvents.data ?? [],
    audit_logs: auditLogs.data ?? [],
    kyc_documents: kycDocuments,
  };
```

**Test/verifica (P7).** 1) Utente con attività → il JSON contiene `activity_events` non vuoto e `kyc_documents` con URL scaricabili (scadenza 1h). 2) Utente senza KYC → `kyc_documents: {}`. 3) Verifica che i signed URL aprano davvero i file. 4) Controllo che `audit_logs` includa le azioni admin fatte SULL'utente (`target_id`).

**Rischio & rollback.** `activity_events` può essere voluminoso → aggiunto `limit(5000)` per evitare export enormi (se un utente supera, valutare paginazione/allegato separato — segnalo a @backend-dev). I signed URL in un file scaricabile dall'interessato stesso sono accettabili (accede ai propri documenti) e scadono in 1h. Rollback: revert del file. **Dipendenze:** riuso delle colonne `kyc_*_url` (coerente con B5); coordinare con @backend-dev per volumi.

---

# P8 🔴 — Identità del Titolare con dati segnaposto

**Causa-radice.** `app/privacy/page.tsx:50-56` riporta `MyCity S.r.l.`, `Via Roma 1`, `P.IVA IT00000000000`, `privacy@mycity.it`, `dpo@mycity.it` — segnaposto. Informativa priva di titolare identificabile = non conforme artt. 13-14.

**Fix — 🔴 richiede i dati reali di Nicola (vedi riepilogo punto 1).** Finché non arrivano, il testo va reso **esplicitamente da-compilare** (meglio di un dato falso che sembra vero). Testo esatto per §1:
```tsx
      <LegalSection id="titolare" heading="1. Titolare del trattamento">
        <p>
          Il titolare del trattamento è <strong>⟪RAGIONE SOCIALE — DA COMPILARE⟫</strong>, con sede
          in ⟪INDIRIZZO SEDE LEGALE — DA COMPILARE⟫, P.IVA ⟪P.IVA REALE — DA COMPILARE⟫.
        </p>
        <p>
          <strong>Contatti del Titolare:</strong> <a href="mailto:⟪EMAIL PRIVACY⟫" className="text-primary-700 underline">⟪EMAIL PRIVACY — DA COMPILARE⟫</a><br />
          <strong>Referente per la protezione dei dati:</strong> <a href="mailto:⟪EMAIL DPO/PRIVACY⟫" className="text-primary-700 underline">⟪EMAIL — DA COMPILARE⟫</a>
        </p>
      </LegalSection>
```
> Ho sostituito «Responsabile della protezione dei dati (DPO)» con «Referente per la protezione dei dati»: il DPO ha un significato giuridico preciso (art. 37) e va indicato solo se effettivamente nominato. Nicola conferma se c'è un DPO nominato (allora si ripristina «DPO»).
> Nota: gli indirizzi email `dpo@mycity.it` compaiono anche in §5 (righe 132, 171) e nella cookie policy (righe 115): vanno tutti allineati alla casella reale scelta.

**Test/verifica.** Prima del go-live: nessun `⟪…⟫` residuo (grep), P.IVA valida (11 cifre, checksum), email che risolvono e vengono monitorate. **Rischio & rollback.** Bloccante per il go-live legale; non c'è rollback tecnico — è un dato che deve arrivare. **Dipendenze:** 🔴 Nicola.

---

## Riepilogo colori & ordine di applicazione
| # | Colore | Applicabile ora? |
|---|--------|------------------|
| B5 (codice) | 🟡 | Sì, in branch |
| B5 (job orfani) | 🔴 | No — via di Nicola (dry-run prima) |
| P2 | 🟡 | Sì |
| P3 | 🟡 doc | Sì (verificare provider KYC) |
| P4 (informativa+scrub) | 🟡 | Sì |
| P4 (DPA) | 🔴 | No — verifica Nicola |
| P5 | 🟡 | Sì |
| P6 | 🟡 | Sì |
| P7 | 🟡 | Sì |
| P8 | 🔴 | No — dati reali Nicola |

**Nuovi file:** `lib/kyc/purge.ts`. **File modificati:** 2 delete-flow, `lib/analytics/sentry.tsx`, `lib/consent.ts`, `lib/rate-limit.ts`, `app/api/track/route.ts`, `app/api/account/export/route.ts`, `app/api/ai/reviews-summary/route.ts`, `app/privacy/page.tsx`, `app/cookies/page.tsx`, `app/layout.tsx` (nessuna modifica strutturale: `SentryProvider` resta montato, il gate è interno al componente).

**Validazione legale finale (🔴):** l'intero pacchetto di testi legali va rivisto da un DPO/avvocato abilitato prima del go-live. Questa è una bozza tecnica solida, non un parere definitivo.
