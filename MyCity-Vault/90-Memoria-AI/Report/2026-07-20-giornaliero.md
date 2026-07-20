---
tipo: report-giornaliero
data: 2026-07-20 21:07
fonte: AD digitale
---

# Report giornaliero — 20 luglio 2026

## La situazione in una riga

Giornata eccezionale sulla macchina (Pannello, PostHog verde, catalogo ripulito, intelligence automatica) — ma il business resta fermo a zero ordini pagati; PI26 non risulta inviata e i post social del weekend sono ancora in coda.

---

## Numeri chiave (ore 21:07 — fonte REST + north-star-check + sensore-cassa)

| KPI | Valore | Var. vs ieri (19/7 21:07) |
|-----|--------|---------------------------|
| **Ordini pagati (North Star)** | **0** | = (stallo dal 24/6) |
| Ordini creati DB | 1 (annullato 24/6) | = |
| Ordini consegnati | 0 | = |
| **Clienti buyer** | **4** | = |
| Negozi live | **1** (Pane Quotidiano) | ▼ da 17 (pulizia demo) |
| Prodotti available | **5** | ▼ da 258 (253 demo eliminati) |
| Stallo North Star | **~637h** (~26,5 giorni) | ▼ peggiorato (+26h) |
| Cassa Stripe | **0 €** | = |
| Runway | **non calcolabile** (manca `BURN_MENSILE_EUR`, 187 giri) | = |
| Lead negozi DB | 407 (baseline) | = |

Sensori ore 21:07: REST ✅ · Stripe ✅ · PostHog ✅ · Resend ✅ · Sito ✅ · Pannello ✅ · n8n ✅ · Telegram ❌ (token assente) · MCP Supabase cieco in sessione (REST copre).

---

## Fatto oggi (🟢 e 🟡 completati)

**Catalogo e verità dati:**
- **Pulizia demo eseguita** (Nicola approvò in chat ~18:28) — 16 negozi finti rimossi, **253 prodotti demo eliminati** dal DB; restano **1 negozio · 5 prodotti** (solo Pane Quotidiano). Irreversibile, verificato REST 18:32.
- **Pricing allineato** — registro-fatti 10% + 50€/mese; coerenza-fatti bonificata su 48 file; **PR #501** collega casella «Pochi negozi» al registro (merge pendente).

**Pannello e macchina:**
- **PR #496 ✅ mergiata** — intelligence automatica (9 fonti/giorno, workflow n.41 RSS bandi non-stub).
- **PR #498 ✅ mergiata** — Diretta contenuti stabile (cache, max 80 caselle).
- **PR #497 ✅ mergiata** — allegati casella Parla.
- **PR #499 / #500** — fix Parla PGRST102 + Bacheca chiusa di default: rebase vs main, **mergeable** (link GitHub, no card merge L-402).
- **PR #502 ✅** — Radiografia dice quale env Vercel PostHog manca (chiuso: Pannello ora verde).
- **15 playbook reparto** consegnati in `consegne/` (mattina).
- Coda ripulita: **6 card merge obsolete** rimosse (L-402); ~46 azioni aperte.

**PostHog (chiuso):**
- Causa radice: account **US** con host EU nel env → **401**.
- Fix env VPS `https://us.posthog.com` + chiave `phx_` → sensore **verde** 18:44.
- Vercel Production allineato → Radiografia Pannello **verde** 20:16.
- **PR #219** (mycity) — allinea ingest tracking Render **EU→US**; merge opzionale Nicola.

**Automazioni e skill:**
- **50 workflow n8n** JSON importabili + catalogo in `consegne/automazioni/n8n/`.
- **47 marketing skills** community scaricate + adattate MyCity (**PR #495** merge pendente).
- n8n **runtime ok**; workflow «Pubblica post programmato» importato — resta **OAuth Meta** + token Telegram.

**Contenuti preparati (non pubblicati):**
- Post domenica «Prepara la settimana da casa» · post lunedì «Il turno è già iniziato» · post meteo pioggia — tutti pronti in `consegne/content/`.

**Bandi:**
- Sportello **PI26 aperto ore 10:00** (20/7 → 30/7 16:00) — **domanda non risulta inviata** su restart.infocamere.it.

---

## Da firmare — in ordine di urgenza

### 🔴 Business (soldi e visibilità)

1. **#bandi-cciaa-2007** — Invia domanda PI26 sul portale CCIAA (scade **30/7**). Sportello aperto da stamattina.
2. **#ordine-test-pq** — Ordine di prova su Pane Quotidiano (~10 min) → unica leva diretta North Star 0→1.
3. **#post-domenica-settimana-1907** — Pubblica post domenica (copy + PNG pronti). Timing originale 19/7 21:00 — **recupero urgente**.
4. **#post-lunedi-turno-mattina-2007** — Post lunedì mattina su IG/FB (A36 pronto).
5. **#post-meteo-pioggia-20lug** — Gruppi Facebook pioggia/delivery (oggi 20/7, se ancora utile stasera).

### 🔴 Automazione / canali

6. **#accendi-intelligence-sveglia** — Telegram bot token + workflow n.41/n.31 **Active** in n8n (65 avvisi non inviati).
7. **Meta FB/IG** — Pagina + app Business → token pagina + ID IG **nei nodi n8n** (mai in chat) → workflow Active → scrivi «Meta collegato» per post prova.

### 🟡 Merge codice (deploy ~2–5 min ciascuno)

8. **PR #501** — Casella pricing legge registro-fatti.
9. **PR #499** + **#500** — Fix Parla + Bacheca chiusa default.
10. **PR #219** (mycity) — PostHog ingest US su Render (opzionale, allinea eventi sito).
11. **PR #495** — Marketing skills nel worker (+ riavvio worker post-merge).

### 🟡 Altri sblocchi

12. **#burn-mensile-env** — Burn mensile nel `.env` VPS → runway calcolabile (187 giri senza).
13. **#whatsapp-3-anchor-pi26** · **#welcome-email-23** — Dopo ordine test.

---

## Segnali macchina (warn aperti)

| Segnale | Stato | Impatto |
|---------|-------|---------|
| tick-coscienza-leggero | warn | tasso warn, esperimenti ok |
| notifica-approvazioni | warn | **65** nuove NON inviate (Telegram mancante) |
| cassa-runway | warn | runway sconosciuto da **187** giri |
| freschezza-segnali | warn | 7 guardiani senza battito fresco (<60 min) |

Nessuno blocca operatività immediata. Il collo di bottiglia resta **North Star = 0** + **PI26** + **post social**.

---

## Lezione del giorno

Una maratona di fix al Pannello (Diretta, Parla, PostHog, demo ripuliti) **non muove la North Star**. Oggi contavano tre mosse umane: **PI26**, **ordine test al fornaio**, **un post pubblicato** — non un'altra PR.

---

## Domani (21 luglio)

- **Prima cosa:** chiudi PI26 se manca, poi **ordine test PQ**.
- **Meteo:** pioggia debole/temporali possibili → post indoor dopo ordine test.
- **Social:** recupero post weekend + lunedì mattina; Meta collegato sblocca pubblicazione automatica futura.

---

## Mano email

Resend ✅ configurato (API ok). **Invio automatico non eseguito:** `cervello/mani-allowlist.json` ha lista `email` **vuota** — regola AR-103 = DRY-RUN forzato. Per ricevere il report via email ogni sera: aggiungi la tua email in allowlist e di' «ok invio report».

---

*Generato da AD digitale MyCity — 2026-07-20 21:07 (Europe/Rome)*
