---
data: 2026-07-19 13:12
tipo: diagnosi
reparto: AD/devops-sre
origine: sentinella sensori_ciechi (firma=83, riprova Nicola 13:09)
---

# Diagnosi sensori ciechi — 19 luglio 2026

## In una riga per Nicola

**I dati business sono tutti leggibili (REST Supabase, Stripe, Resend, sito, Pannello). L'allarme è un falso positivo: n8n ha ancora l'URL segnaposto `tuo-n8n` nel `.env` (riga duplicata 2×) — non è un sensore dati cieco. Fix codice in PR: placeholder n8n → non_configurato + sentinella M2 guarda solo le fonti KPI.**

---

## Tabella sensori (verificato 13:09)

| Sensore | Stato | Giri ciechi | Impatto KPI |
|---|---|---|---|
| supabase_rest | ✅ ok | 0 | **Fonte primaria ordini/negozi** |
| stripe_api | ✅ ok | 0 | Cassa |
| resend_api | ✅ ok | 0 | Email/domini |
| supabase_memoria | ✅ ok | 0 | DB memoria Pannello |
| sito_uptime | ✅ ok | 0 | Storefront |
| pannello_uptime | ✅ ok | 0 | Cabina |
| **n8n_health** | ❌ cieco | **96** | **Nessuno** — URL finto `tuo-n8n`, automazioni mai live |
| mcp_supabase | ⚠️ cieco | 7 | Nessuno — REST copre tutto |
| posthog_api | ⏸️ spento | — | Decisione 5/7 |
| telegram_bot | ⏸️ non config | — | Token assente |

**Prova:** `node cervello/verifica-sensori.mjs` exit 0 · `meta.dati_ordini_ciechi=false` · host n8n = `tuo-n8n` · `N8N_WEBHOOK_URL` **2×** in `cervello/vps/.env`.

---

## Causa radice

1. `N8N_WEBHOOK_URL` punta a host **`tuo-n8n`** (placeholder documentazione).
2. `verifica-sensori.mjs` trattava «chiave presente» = «configurato» → fetch fallisce → contatore sale ogni giro (ora 96).
3. Sentinella M2 leggeva `max_giri_ciechi` su **tutti** i sensori ciechi, inclusi n8n e MCP — testo «dati ciechi» ma i KPI erano ok.

**Non è n8n giù:** n8n non è mai stato collegato.

---

## Cosa serve da te (Nicola)

### A) Silenziare subito (🟡 env VPS — opzionale se mergi la PR)

Commenta **entrambe** le righe `N8N_WEBHOOK_URL` in `cervello/vps/.env` → sensore `non_configurato`.

Oppure, quando n8n è pronto, URL reale + `N8N_HEALTH_URL=.../healthz`.

### B) Fix permanente (🟡 PR — consigliato)

Mergia la PR del branch `fix/sensori-ciechi-falso-allarme-2026-07-19`:

- Placeholder n8n → `non_configurato` (contatore azzerato)
- `meta.max_giri_ciechi_dati` solo su supabase_rest / stripe / supabase_memoria
- M2 sentinella legge quello — non sveglia più il worker per n8n/MCP

---

## Cosa NON fare

- ❌ Non bloccare il giro — REST ordini ok, baseline STATO valida.
- ❌ Non inventare numeri — non serve: `dati_ordini_ciechi=false`.
- ❌ Non confondere con MCP Supabase chat — cieco ma REST copre; card `#abilita-mcp-supabase-chat` resta separata.

---

*Fonti: verifica-sensori 13:09 exit 0 · sensori-cecita.json max=96 (n8n) · diagnosi precedente 16/7 confermata*
