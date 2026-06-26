# 🔍 Radiografia della Cabina Operativa — 2026-06-26

> Audit da cima a fondo del Pannello di Controllo (`pannello/`) + il "cervello" (`cervello/`).
> Domanda: **è tutto collegato? è tutto reale (non demo/ipotesi)?**
> Metodo: radiografia del codice (3 esploratori + verifiche dirette su env, deploy, DB).
> Colore: 🟢 sola lettura.

---

## ✅ Verdetto in una riga
Il codice della cabina è **onesto e ben costruito**: **nessun dato finto/demo** spacciato per reale.
Ogni fonte non collegata si spegne con `connected:false` / liste vuote — **mai numeri inventati**.
Quello che resta da verificare **non è nel codice ma nella configurazione di produzione** (le chiavi
su Vercel, gli interruttori accesi, il worker/VPS in esecuzione, il DB-memoria creato).

---

## 🔴 Bloccanti / da verificare subito (configurazione, non codice)

1. **DB-Memoria Supabase: forse non creato.** Nell'organizzazione Supabase collegata è visibile **un
   solo progetto** — `clmpyfvpvfjgeviworth` ("Mycity", il marketplace, **ATTIVO** ✅). Il secondo
   progetto, quello della **memoria dell'AD** (`SUPABASE_URL` / `SUPABASE_SERVICE_KEY`), non risulta.
   Se manca, va **al buio** tutta la parte viva: briefing del giro, diario, **lavori** (il ponte col
   cervello), conversazioni, **kill-switch** e tetto di spesa, stato spunte. → Confermare che esista e
   sia configurato su Vercel.
2. **Worker / VPS in esecuzione?** Le azioni e i "giri" che la cabina accoda vengono eseguiti dal
   cervello fuori dal pannello (systemd su VPS, vedi `cervello/vps/`). I file di servizio esistono
   (`mycity-worker.service`, `mycity-giro.timer`) ma **non posso confermare dal repo che la VPS sia
   accesa**. Se è spenta, i lavori restano in coda senza partire. → Verificare `systemctl status` sulla VPS.
3. **Chiavi di produzione su Vercel.** `.env.local` è (giustamente) fuori dal repo, quindi **non posso
   leggere quali chiavi sono davvero inserite in produzione**. Tutta la sezione A/B qui sotto va
   spuntata aprendo gli endpoint live o il dashboard Vercel.

---

## A. Le 6 fonti dati REALI (cablate nel codice)

| # | Fonte | Alimenta | Variabili (nomi esatti nel codice) | Senza → |
|---|-------|----------|-------------------------------------|---------|
| 1 | **DB Marketplace** (Supabase, sola lettura) | KPI, ordini, incassi, clienti, negozi, consegne, recensioni, liste, alert | `MARKETPLACE_SUPABASE_URL`, `MARKETPLACE_SUPABASE_KEY` | `connected:false` |
| 2 | **Supabase Memoria** (R/W) | briefing, diario, lavori, conversazioni, impostazioni, kill-switch | `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` | cabina "al buio" |
| 3 | **Vault via GitHub** | STATO, DECISIONI, AZIONI-IN-ATTESA, OKR, piani, ritmo, sala, checklist | `OBSIDIAN_REPO_OWNER`, `OBSIDIAN_REPO`, `OBSIDIAN_TOKEN` (fallback `GITHUB_TOKEN`), `OBSIDIAN_BRANCH` | `collegato:false` |
| 4 | **GitHub codice sito** | leggere il repo `mycity` per analisi/audit | `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_DEFAULT_BRANCH` | `NOT_CONNECTED` |
| 5 | **PostHog** | visite sito + conversione | `POSTHOG_HOST`, `POSTHOG_PROJECT_ID`, `POSTHOG_API_KEY` | KPI visite assenti |
| 6 | **n8n** | hub che esegue le azioni approvate | `N8N_WEBHOOK_URL` | azioni solo descritte |

**Confermato live:** progetto marketplace `clmpyfvpvfjgeviworth` ("Mycity") = `ACTIVE_HEALTHY`,
regione eu-west-3, Postgres 17. È lo stesso ref in `.env.example` → **DB reale, attivo**.

**Tabelle/colonne che il codice si aspetta** (da `marketplace-db.ts`, da spuntare con `list_tables`):
- `orders`(total_price, payment_status, delivery_status, created_at, delivered_at, user_id)
- `profiles`(role ∈ buyer/seller, created_at) · `abandoned_carts`(recovered, created_at) · `store_reviews`(rating)
- `notifications` (per la "mano" notifiche in-app, scrittura)

> ℹ️ **Nome corretto della env del vault:** `OBSIDIAN_TOKEN` (con fallback `GITHUB_TOKEN`). Non esiste
> nessun `VAULT_TOKEN` nel codice — se compare in appunti/chat, è solo un alias informale.

---

## B. Le 7 "mani" (azioni reali) — implementate, con doppio interruttore di sicurezza

Tutte fanno **vere chiamate API** (non sono stub). Partono solo con l'interruttore acceso:
`AZIONI_LIVE` (flusso "Approva" dal pannello) e `AUTOPILOT_LIVE` (scheduler autonomo).
Senza interruttore o senza chiave → **DRY-RUN / coda** (simula, non invia). **Niente parte di sorpresa.**

| Canale | Stato impl. | Chiavi necessarie |
|--------|-------------|-------------------|
| Email (Resend) | LIVE | `RESEND_API_KEY`, `RESEND_FROM`, `AZIONI_LIVE=on` |
| Telegram | LIVE | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` |
| Facebook | LIVE | `FB_PAGE_ID`+`FB_PAGE_ACCESS_TOKEN` **o** `N8N_WEBHOOK_URL`, `AUTOPILOT_LIVE=1` |
| Instagram | LIVE | `IG_USER_ID`+`IG_ACCESS_TOKEN` **o** n8n + media pubblico (obbligatorio) |
| Google Business | LIVE | `GBP_ACCESS_TOKEN`+`GBP_ACCOUNT_ID`+`GBP_LOCATION_ID` **o** n8n (consigliato) |
| n8n (hub) | LIVE | `N8N_WEBHOOK_URL` |
| Notifiche in-app | LIVE | `MARKETPLACE_SUPABASE_URL`, `MARKETPLACE_SUPABASE_WRITE_KEY` |

Connettori contenuti AI (opzionali, per "contenuti pro"): `GEMINI_API_KEY`, `CANVA_TOKEN`,
`RUNWAY_API_KEY`, `KLING_API_KEY`.

---

## C. Logica autonoma — regole hardcoded (corrette, ma da tarare con numeri reali)
- `sentinelle.ts` + `api/alert/route.ts`: 7 regole con soglie arbitrarie (recensione < 3.5, carrelli ≥ 3,
  dormienti ≥ 5, consegne lente, pochi negozi…). → **tarare** sui valori veri di MyCity.
- `api/metriche/unit/route.ts`: commissione default **12%**, costo fisso **€0** (sovrascrivibili dalla
  tabella `impostazioni`). → **confermare** i numeri economici reali.
- `api/intelligence/route.ts`: 3 analisi predefinite (concorrenti/eventi/buchi) — ok come template.

---

## D. Moduli ancora da collegare (dichiarati `placeholder` — non bug, "in arrivo")
`moduli.ts`: Rider & flotta · Contatti/CRM · Lead & pipeline · Catalogo · Campagne · Calendario/eventi ·
Mercato & concorrenti · News/rassegna · Sicurezza & accessi · Legale & documenti · Esperimenti · Roadmap.
Parziali: Task & progetti · Reclami & dispute.
→ Decidere la **priorità di accensione** (suggerito: Catalogo, Lead/pipeline, Campagne — leve di ricavo).

---

## E. Orchestratore "cervello" (fuori dal pannello)
- `autopilot.mjs`, `esegui-azione.mjs`, `worker.sh`, `giro.sh`: girano su Claude Code (Max) / VPS.
  Il pannello **legge** ciò che il cervello scrive in memoria.
- Cron pannello (`vercel.json`): `/api/heartbeat` 09:00, `/api/report?genera=giornaliero` 19:07.
- VPS: `mycity-giro.timer` (giro ogni 2h) + `mycity-worker.service` (coda approvazioni, `Restart=always`).

---

## ✅ Checklist operativa (da spuntare in produzione)
- [ ] **DB-Memoria** creato e `SUPABASE_URL`/`SUPABASE_SERVICE_KEY` su Vercel → `/api/stato` ritorna `memoria:true`
- [ ] **DB-Marketplace**: `/api/metriche` ritorna `connected:true` e numeri plausibili
- [ ] **Vault**: `/api/memoria/stato` ritorna `collegato:true` (token Obsidian/GitHub valido sul branch giusto)
- [ ] **PostHog**: KPI visite presenti in `/api/metriche`
- [ ] **VPS** accesa: `systemctl status mycity-worker mycity-giro.timer` = active
- [ ] **Interruttori mani**: deciso cosa è `AZIONI_LIVE=on` / `AUTOPILOT_LIVE=1`, con 1 test reale per canale
- [ ] **n8n**: webhook risponde 200 a un'azione di prova
- [ ] **Soglie & numeri**: commissione/costo fisso reali in `impostazioni`; soglie sentinelle tarate
- [ ] **Env vault**: usare il nome corretto `OBSIDIAN_TOKEN` (non `VAULT_TOKEN`) ovunque negli appunti

> Le azioni di "accensione" (chiavi, interruttori, deploy) toccano il mondo reale → restano **🔴**:
> la cabina le prepara, **Nicola firma**.
