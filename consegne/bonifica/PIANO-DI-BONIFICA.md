---
data: 2026-07-04 04:47
tipo: piano-di-bonifica-marketplace
repo: NicolaeRotaru/mycity @ f84fc70 (2026-07-02)
fonte: consegne/audit/2026-07-04-radiografia.md (6 bloccanti · 43 gravi · 53 minori = 102)
metodo: 12 ingegneri senior in parallelo, un pacchetto di fix turnkey per workstream, verificato sul codice reale
stato: PRONTO DA APPLICARE — nessuna modifica eseguita in produzione (🔴 restano da firmare)
---

# 🛠️ Piano di Bonifica del marketplace MyCity — risoluzione dei 102 problemi

> **Cos'è.** Non è un elenco di 102 patch scollegate: è il **modo migliore per risolverli davvero**. I 102 problemi sono stati **consolidati in cause-radice** e raggruppati in **12 workstream** e **4 ondate sequenziate**; per ogni problema c'è il **fix pronto da applicare** — migrazioni SQL scritte per intero, diff di codice before/after su `file:riga` reali, test da aggiungere, passo di verifica, colore 🟢🟡🔴, rischio e rollback. Ogni pacchetto è stato prodotto da un ingegnere senior che ha **letto il codice vero** del marketplace (sola lettura), non l'audit.
>
> **Nulla è stato applicato in produzione.** Tutti i fix di codice sono 🟡 (in branch, con anteprima); le migrazioni sul DB live e i deploy sono 🔴 e restano in attesa della firma di Nicola (§ Governance).

---

## 1. Principio guida: da 102 sintomi a poche cause-radice

Molti dei 102 finding sono **lo stesso difetto visto da dimensioni diverse**. Risolvere la causa-radice chiude più righe insieme. Le convergenze principali:

| Causa-radice | Finding che chiude | Owner |
|---|---|---|
| **Coupon senza claim atomico (TOCTOU)** | pagamenti + architettura + qa + api-backend (4 righe) | WS-MONEY |
| **Route auth signin/signup = dead code col client browser** | architettura + api-backend (2 righe) | WS-API |
| **Guardia store-hours solo sul COD** | architettura (+ qa checkout) | WS-ARCH |
| **Matematica ordine duplicata Stripe↔COD** | architettura + pagamenti + qa (overselling/clamp) | WS-ARCH (estrae `priceOrder.ts`) |
| **Finestra di overselling (sessione Stripe > pending)** | pagamenti + qa (2 righe) | WS-MONEY |
| **Auto-approvazione venditore dal metadata client** | architettura + rls-database (2 righe) | WS-ARCH + WS-DB-RLS (trigger) |
| **Viste/funzioni SECURITY DEFINER pubbliche** | rls-database + advisor DB live | WS-DB-RLS |
| **Rate limiter in-memory non durevole** | ai-endpoints + api-backend (2 righe) | WS-AI |
| **`messages_update_read` riscrive body altrui** | rls-database + sicurezza-auth (2 righe) | WS-DB-RLS |
| **Embed profilo venditore rotto dalla mig 107** | rls-database (B2) + tocca frontend (schede, ordini, rider, home) | WS-DB-RLS |

> Effetto: i **102 finding** si risolvono con un numero **molto minore di modifiche reali**, ognuna con un solo owner (regola anti-doppione). L'indice completo problema→workstream è in fondo (§ Tracciabilità).

## 2. Le 4 ondate (sequenza per impatto e dipendenze)

L'ordine non è per gravità pura: è per **sbloccare prima ciò che rende il sito capace di funzionare e vendere**, poi stagnare le perdite di denaro, poi chiudere sicurezza/compliance, infine robustezza e debito.

### 🌊 Onda 0 — SBLOCCO (il sito parte e vende) — *prima di tutto*
- **B3** build Render (`WS-DEPLOY`) → senza deploy funzionante nulla va live.
- **B2** embed profilo venditore / mig 107 (`WS-DB-RLS`) → senza questo il catalogo mostra "non acquistabile".
- **B1** auto-accredito wallet (`WS-DB-RLS`) → una migrazione (REVOKE + trigger) ferma il furto.
- **B4** venditore approvato senza KYC (`WS-ARCH` + trigger `WS-DB-RLS`).
> Obiettivo: sito **deployabile, navigabile, non-derubabile**. È l'onda che va chiusa e firmata per prima.

### 🌊 Onda 1 — SOLDI ROBUSTI (stagna le perdite)
`WS-MONEY` + parte di `WS-QA`: over-refund clamp, overselling (expires_at + ri-riserva), admin-cancel COD (restore stock + storno wallet), **coupon claim atomico**, reversal cumulativo, idempotenza webhook, race charge.refunded, COD multi-negozio rollback.

### 🌊 Onda 2 — SICUREZZA DATI & COMPLIANCE (prima di utenti reali)
`WS-DB-RLS` (resto) + `WS-PRIVACY` + parte di `WS-ANALYTICS-SEC`: policy rider con gate di ruolo, REVOKE colonne sensibili, `returns_buyer_insert`, viste/funzioni SECURITY DEFINER, **B5 cancellazione KYC**, Sentry/tracking sotto consenso, informativa (destinatari, Anthropic, mc_vid/IP), XSS JSON-LD, rate-limit XFF, dati Titolare.

### 🌊 Onda 3 — ROBUSTEZZA, PERF, UX, A11Y, DEBITO
`WS-QA` (B6 stato ritiro), resto `WS-DEPLOY` (log, migrazioni-in-deploy, RESEND_FROM, cron osservabili), `WS-AI`, `WS-API`, `WS-FRONTEND`, `WS-A11Y`, `WS-PERF`, resto `WS-ANALYTICS-SEC`.

## 3. Come si applica (una PR per workstream, sicura e reversibile)

1. **Un branch/PR per workstream** nel repo del marketplace (`NicolaeRotaru/mycity`), nell'ordine delle ondate. PR piccole e review-abili, mai un mega-commit.
2. **Migrazioni**: i file `.sql` di `consegne/bonifica/sql/` sono idempotenti e numerati (108→). Vanno applicati **in ordine** e **su staging prima che live**. Ogni migrazione ha il suo rollback documentato.
3. **Test come cancello**: ogni PR aggiunge i test indicati nel pacchetto; la PR non entra se `npm run verify` (typecheck+lint+test) è rosso. Onda 1 e 2 aggiungono **test comportamentali sui soldi e sulla RLS** (oggi ≈ 0), che sono anche il fix del finding "CI dà falsa sicurezza".
4. **Verifica reale**: per i bloccanti la verifica è end-to-end (B3 = deploy reale su Render; B2 = scheda prodotto vista da utente anonimo; B1 = tentativo di PATCH sul wallet respinto).
5. **Feature-flag / gradualità** dove un cambio è rischioso (es. tracking server-side, SSR delle pagine catalogo): dietro flag, con rollback immediato.

## 4. Governance 🔴 — cosa richiede la firma di Nicola

Tutti i fix di **codice** sono 🟡 (branch + anteprima). Restano **🔴** (soldi/legale/irreversibile/produzione), da firmare:
- **Applicare le migrazioni sul DB live** (schema di produzione) — dopo prova su staging.
- **Deploy su Render** della build corretta.
- **Dati reali del Titolare** per l'informativa (ragione sociale, P.IVA, sede, DPO) — oggi segnaposto.
- **Dominio email verificato** (DKIM/SPF/DMARC) per `RESEND_FROM`.
- **Chiave Upstash Redis** (rate-limit durevole AI) e conferma budget-cap AI.
- **Decisione di prodotto**: modello di approvazione venditori (tutti via `/sell` con review manuale?).
- **Numero WhatsApp assistenza reale** (env) e gestione numeri rider.

*(La lista puntuale dei 🔴 per workstream è sintetizzata nella tabella § 6.)*

---
## 5. Indice dei 12 workstream (i pacchetti di fix pronti)

Ogni workstream è un file in `consegne/bonifica/` con il pacchetto completo (per ogni problema: causa-radice, diff/SQL, test, verifica, colore, rollback). Le migrazioni sono in `consegne/bonifica/sql/`, i file corretti in `consegne/bonifica/patches/`.

| Workstream | File | Prob. | Contenuto principale | Migrazioni SQL |
|---|---|---|---|---|
| 🛡️ **RLS & Database** | `WS-DB-RLS.md` | 9 +adv | **B1 wallet** (REVOKE+trigger), **B2 mig 107** (view+embed), PII rider, REVOKE colonne sensibili, viste/funzioni SECURITY DEFINER, 9 tabelle RLS-no-policy, messages freeze | `108`–`118` |
| 💳 **Pagamenti / Stripe** | `WS-MONEY.md` | 8 | over-refund clamp al residuo, overselling (expires_at+ri-riserva), admin-cancel COD, **coupon claim atomico**, reversal cumulativo, idempotenza webhook | `130`–`134` |
| 🏗️ **Architettura** | `WS-ARCH.md` | 9 | **B4 approvazione venditori** unificata, store-hours condivisa, estrazione `priceOrder.ts`, middleware gate, deliveryWindow tz | `140`–`141` |
| ⚖️ **Privacy / GDPR** | `WS-PRIVACY.md` | 8 | **B5 cancellazione KYC** storage, Sentry sotto consenso, destinatari/cookie, claim Anthropic, mc_vid/IP, export, Titolare | — |
| ✅ **QA & Flussi** | `WS-QA.md` | 5 | **B6 stato "ritiro in negozio"** (RPC+UI), COD multi-negozio rollback, self-purchase, carrello a 0 | `135` |
| 🚢 **Deploy / SRE** | `WS-DEPLOY.md` | 9 | **B3 build Render** (`.npmrc`+render.yaml), log su stdout, migrazioni-in-deploy, RESEND_FROM, cron osservabili, health | patches/ |
| 🔌 **API / Backend** | `WS-API.md` | 6 | rimozione route auth morte + lint rule, gift-card idempotency, timeout Anthropic, AI rate-limit async | — |
| 🤖 **Endpoint AI** | `WS-AI.md` | 5 | gate moderazione cablato, rate limiter durevole+budget-cap, host allowlist immagini, body-size limit, scoping chat | — |
| 🖥️ **Frontend / UX** | `WS-FRONTEND.md` | 10 | WhatsApp via env, contatto rider corretto, "invia messaggio" cablato, geocode checkout, ripeti-ordine variante, returnTo | — |
| ♿ **Accessibilità** | `WS-A11Y.md` | 7 | lightbox tastiera/focus-trap, SearchBar combobox, ProductCard linked-card, ConfirmDialog danger, focus-visible | — |
| ⚡ **Performance** | `WS-PERF.md` | 11 +adv | paginazione+virtualizzazione catalogo, sort/filtri nel DB, SSR scheda/SRP, select colonne, indici FK, RLS initplan | `120`–`123` |
| 📊 **Dati & Analytics + 🔒 Sicurezza** | `WS-ANALYTICS-SEC.md` | 15 | tracking acquisti server-side, KPI senza annullati, consenso traffico, una-sola-verità; **XSS JSON-LD**, rate-limit XFF | — |

**Totale consegnato:** 12 pacchetti · 23 migrazioni SQL idempotenti (`108`–`141`) · 4 file corretti (`render.yaml`, `.npmrc`, `logger.ts`, `health-route.ts`) · appendice di tracciabilità dei 102.

## 6. Tabella 🔴 — la firma di Nicola (sintesi da tutti i workstream)

| # | Azione 🔴 | Workstream | Perché serve te |
|---|---|---|---|
| 1 | **Applicare le migrazioni sul DB live** (`108`–`141`, in ordine, prima su staging) | tutti i DB | Toccano lo schema di produzione (soldi/RLS) — irreversibile senza rollback |
| 2 | **Deploy su Render** della build corretta (`.npmrc`+`render.yaml`) + conferma reale del build | WS-DEPLOY | B3: nessuno ha potuto lanciare un deploy vero (repo read-only) |
| 3 | **Dati reali del Titolare** (ragione sociale, sede, P.IVA, email privacy/DPO) | WS-PRIVACY | Oggi `IT00000000000`: blocca il go-live legale |
| 4 | **DPA Anthropic** — confermare zero-retention/no-training | WS-PRIVACY | Le recensioni/Q&A dei clienti passano da Anthropic |
| 5 | **Dominio email verificato** (DKIM/SPF/DMARC) → valore `RESEND_FROM` | WS-DEPLOY | Altrimenti le email transazionali falliscono in silenzio |
| 6 | **Chiave Upstash Redis** (`UPSTASH_REDIS_REST_URL/TOKEN`) + ok budget-cap AI | WS-AI | Senza, il rate-limit AI ricade in-memory (non durevole) |
| 7 | **Numero WhatsApp assistenza reale** (env) + gestione numeri rider | WS-FRONTEND | Oggi `393000000000` (segnaposto morto) |
| 8 | **Decisione di prodotto: modello approvazione venditori** | WS-ARCH | Tutti via `/sell` con review manuale? auto per categorie a basso rischio? |
| 9 | **Toggle manuale**: Leaked-Password protection = ON (dashboard Supabase) | WS-DB-RLS | Non è codice: è un'impostazione del progetto Auth |
| 10 | **Segreti Sentry** nel dashboard (`SENTRY_AUTH_TOKEN/ORG/PROJECT`) + eventuale migrazione cron a Render Cron | WS-DEPLOY | Source map + osservabilità cron |

> Le migrazioni marcate `PROPOSAL` (`122` consolidamento policy, `123` drop indici inutilizzati) restano **da NON eseguire ora**: sono studi commentati, si valutano a caldo con la telemetria.

## 7. Verifica di qualità e note

- **Ogni fix è ancorato al codice reale** (gli ingegneri hanno letto i file veri del marketplace, non l'audit) e ogni pacchetto porta test + passo di verifica.
- **Peer review incrociata** già annotata nei pacchetti (numeri→finanza, sicurezza→security, soldi→dopo review). I punti dichiarati "incerti" dai senior sono elencati nei rispettivi file: es. `order_items` grande → indice `120` in `CONCURRENTLY`; comportamento PostREST degli embed migrati (B2) da verificare in anteprima; taratura `DAILY_BUDGET_EUR` AI dalla telemetria reale.
- **Nessuna sovrapposizione**: coupon atomico (WS-MONEY/130), approvazione venditori (WS-ARCH/140), trigger wallet (WS-DB-RLS/108) sono coordinati, un solo owner per causa-radice.
- **Tracciabilità completa** dei 102 problemi → workstream: `consegne/bonifica/_tracciabilita.md`.
- **Validità legale finale** dei testi privacy resta umana (DPO/avvocato) prima del go-live: i testi consegnati sono bozze tecniche solide, non un parere.

---

### Come procedere da qui
1. Firma l'**Onda 0** (B3+B2+B1+B4): è ciò che rende il sito deployabile, vendibile e non-derubabile.
2. Per ogni workstream apro (su tua conferma) un **branch/PR nel repo del marketplace** con i fix del pacchetto, nell'ordine delle ondate, con i test come cancello.
3. Le migrazioni si applicano **prima su staging**, poi — con la tua firma — sul DB live.

*Piano prodotto in sola lettura: nessuna modifica è stata applicata al marketplace o al database. Tutto è pronto e in attesa del via.*
