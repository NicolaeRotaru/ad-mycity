---
data: 2026-07-16 03:07
tipo: diagnosi
reparto: AD/devops-sre
origine: sentinella sensori_ciechi (firma=3) + cassa_sconosciuta (116 giri)
---

# Diagnosi sensori ciechi — 16 luglio 2026

## In una riga per Nicola

**Ordini e cassa ok (REST + Stripe); l'allarme viene da n8n con URL finto `tuo-n8n` nel `.env` (riga duplicata 2×) — commenta la riga o metti URL vero. Runway bloccato solo perché manca il burn mensile (card già in coda). Fix codice opzionale in branch `fix/n8n-placeholder-non-cieco-2026-07-16` (da pushare/mergiare dal VPS).**

---

## Tabella sensori (verificato 03:07)

| Sensore | Stato | Giri ciechi | Impatto KPI |
|---|---|---|---|
| supabase_rest | ✅ ok | 0 | **Fonte primaria ordini/negozi** |
| stripe_api | ✅ ok | 0 | Cassa letta (0 €) |
| resend_api | ✅ ok | 0 | Email/domini |
| supabase_memoria | ✅ ok | 0 | DB memoria Pannello |
| **n8n_health** | ❌ cieco | **4** | **Nessuno** — automazioni non ancora live |
| mcp_supabase | ⚠️ cieco | 1 | Nessuno — REST copre tutto |
| posthog_api | ⏸️ spento | — | Decisione 5/7: non usato |
| sito_uptime | ⏸️ non config | — | Manca MARKETPLACE_SITE_URL |
| pannello_uptime | ⏸️ non config | — | Manca PANNELLO_URL |
| telegram_bot | ⏸️ non config | — | Manca TELEGRAM_BOT_TOKEN |

**Prova:** `node cervello/verifica-sensori.mjs` exit 0 · `sensori-cecita.json` 03:07 · host n8n = `tuo-n8n` (placeholder) · `N8N_WEBHOOK_URL` presente **2 volte** in `cervello/vps/.env`.

---

## Causa radice n8n (unico cieco ≥3 giri)

1. In `cervello/vps/.env` c'è `N8N_WEBHOOK_URL` con host **`tuo-n8n`** (placeholder documentazione, non server reale).
2. Il verificatore deriva `/healthz` da quell'URL → **`fetch failed`** (host inesistente).
3. Il sensore risulta **configurato** (chiave presente) quindi conta come **cieco**, non come **non_configurato** → scatta sentinella M2 ogni ~2h.

**Non è n8n giù:** n8n **non è mai stato collegato**. Automazioni social/email/recensioni restano manuali o in coda futura.

---

## Cosa serve da te (Nicola) — due mosse indipendenti

### A) Silenziare l'allarme n8n (🟡, env VPS)

**Opzione 1 — n8n non pronto (consigliata ora):** commenta o rimuovi **entrambe** le righe `N8N_WEBHOOK_URL` in `cervello/vps/.env` → sensore passa a `non_configurato`, sentinella smette di svegliare.

**Opzione 2 — n8n pronto:** sostituisci con URL reale, es.:
```
N8N_WEBHOOK_URL=https://<tuo-host-n8n>/webhook/...
N8N_HEALTH_URL=https://<tuo-host-n8n>/healthz
```
Poi: `node cervello/verifica-sensori.mjs` → deve uscire `n8n health ok`.

### B) Runway cassa (🟡, card già in coda)

Card **#burn-mensile-runway** — aggiungi `BURN_MENSILE_EUR=XXXX` in `cervello/vps/.env`. Diagnosi: `consegne/finanza/2026-07-16-diagnosi-cassa-runway.md`.

---

## Cosa NON fare

- ❌ Non serve PR codice — diagnosi chiusa, fix = env.
- ❌ Non inventare numeri burn — senza tua cifra resta «sconosciuto» (regola AD).
- ❌ Non bloccare il giro — REST ordini ok, business baseline in STATO resta valida.

---

## Raccomandazione AD

1. **Oggi:** rimuovi placeholder n8n (opzione A1) — stop spam sentinella a ogni 2h.
2. **Quando serve n8n:** collega URL reale + card #recensioni-trigger / builder-automazioni.
3. **Runway:** firma #burn-mensile-runway quando hai 5 min (anche stima bollette).

---

*Fonti: `verifica-sensori.mjs` 03:07 exit 0 · host `tuo-n8n` in `cervello/vps/.env` (2×) · `sensori-cecita.json` giri_ciechi n8n=4 · `sensore-cassa.mjs` runway sconosciuto 116 giri (BURN assente, Stripe ok)*
