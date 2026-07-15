---
data: 2026-07-16 01:03
tipo: piano
reparto: intelligence
origine: sentinella fonti_web_morte (comprapiacenza + comune-news/eventi/imprese)
---

# Piano fonti web morte — CompraPiacenza + Comune Piacenza

## In una riga

**comprapiacenza.it DNS morto — spostato su CNA. Comune Piacenza 403 = WAF anti-bot, sito VIVO — non fetch, solo WebSearch. Allerta sentinella chiusa con flag `sentinella_waf`.**

---

## Parte A — CompraPiacenza (chiusa 00:04)

| Controllo | Esito |
|---|---|
| `https://comprapiacenza.it/` | ❌ `Could not resolve host` (DNS) |
| `https://piacenza.cna.it/comprapiacenza-vetrina-digitale-per-il-commercio-locale/` | ✅ HTTP 200 |

**Azioni fatte:** rimosso `comprapiacenza` da radar, sostituto CNA.

---

## Parte B — Comune Piacenza (403 WAF, non morto) — verifica 16/7 01:03

| Controllo | Esito |
|---|---|
| DNS `www.comune.piacenza.it` | ✅ risolve → `sites-cloud-certificate-ita.municipiumapp.it` (34.8.63.202) |
| `curl HEAD` news/eventi/imprese/homepage | ❌ HTTP 403 (tutti i path, tutti gli UA testati) |
| WebSearch `site:comune.piacenza.it` | ✅ contenuti freschi (Venerdì Piacentini, news, eventi) |
| `piacenza.municipiumapp.it` | ⚠️ HTTP 200 ma SPA login operatori — inutile per intelligence |

**Causa vera:** WAF Municipium blocca bot/sentinella (`MyCity-sentinella-fonti/1.0`, curl, WebFetch). **Non** DNS morto né sito dismesso. Gli umani e Google indicizzano normalmente.

**URL aggiornati in radar:**
- `comune-news` → `/it/news` (era `/it/menu/news`)
- `comune-eventi` → `/it/eventi` (era categoria ID 76806)
- `comune-imprese` → invariato (`/it/page/imprese-e-commercio-139`)

---

## Azioni fatte (🟢)

1. **Aggiunto** `sentinella_waf: true` + `accesso: "websearch"` alle 3 fonti Comune in `radar-fonti.json`.
2. **Fix** `sentinella-fonti.mjs`: 403 su fonte `sentinella_waf` = `viva` + `waf_blocked`, non `morta`.
3. **Aggiornato** `monitora.md` passo 0: salta `morta:true`, WebSearch per WAF.
4. **Rieseguita** `sentinella-fonti.mjs` — allerta peso≥4 critica deve sparire.

---

## Regole per non bruciare token a vuoto

| Regola | Dove |
|---|---|
| Prima di WebFetch: leggi `fonti-salute.json` — **salta `morta: true`** | `monitora.md` passo 0 |
| Fonte `accesso: websearch` o `waf_blocked: true` → **1 WebSearch mirata**, zero retry fetch | `monitora.md` |
| Fonti Comune: query tipo `"ZTL Piacenza luglio 2026"` / `"eventi Piacenza"` + cita link comune | intelligence |
| Idealista 403 (peso 3): ok morta — non priorità finché non serve lead immobiliare | radar |
| Nuova fonte peso≥4: **un HEAD test** prima di aggiungerla al radar | `sentinella-fonti.mjs` |
| RSS Comune (`/it/feeds`): anche RSS 403 — serve integrazione Firecrawl/browser via builder | carburante futuro |

---

## Serve da Nicola (opzionale, 🟡)

- **builder-automazioni:** integrazione Firecrawl o browser headless per fonti WAF (Comune, Idealista) — sbloccherebbe bandi/ZTL automatici. Costo token Firecrawl vs valore lead.
- Chiedere a **Vita in Centro / CNA** se CompraPiacenza accorpato altrove — utile partnership, non bloccante.
- Nessuna spesa ads, nessun deploy.
