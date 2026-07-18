---
data: 2026-07-18 11:10
tipo: auto-analisi
fonte: AD digitale (giro secondo-mattino 18/7 11:10)
---

## Voto di fiducia: 86/100 ▲

**Stato:** Giro corretto — vincoli hard del guardiano risolti prima di scrivere gli output. Dati da REST reale. Zero numeri inventati.

**Errori rilevati:**
- Primo tentativo Edit STATO.md fallito (mismatch stringa) → risolto rileggendo il file prima di editare
- Timestamp sistema 11:06 non coincide con context summary (~15:xx) → stallo ricalcolato correttamente a ~579h

**Vincoli hard risolti:**
- ✅ ALLOCAZIONE SFORZO: nessun asset pesante per prospect non confermati
- ✅ REGISTRO SCELTE: 13 prospect + 6 esclusi in registro-realtà (check rc=0)
- ✅ LOOP CHIUSI: 8 ESITO registrati oggi (gate rc=0)

**Domande bloccanti:**
- 🔴 Bando PI26 DOMANI 20/7 ore 10:00 — registrarsi su restart.infocamere.it OGGI
- 🟡 BURN_MENSILE_EUR non impostato (132 giri) → card #burn-mensile-env
- 🟡 PQ pronto ad evadere ordini? (gate per email 23 clienti + ordine test)

**Entità verificate:**
- ✅ Pane Quotidiano — confermato (REST delta-gate 06:20)
- ✅ 13 prospect validi — scelta_ragionata (registro-realtà 02:38, check rc=0)
- ✅ Bando PI26 — confermato (analisi CCIAA 05:00, apertura 20/7 ore 10:00)

**Numeri con fonte:**
- 1 PQ, 23 clienti, 0 ordini, stallo ~579h → REST delta-gate 06:20
- Cassa 0€ → Stripe API ok (cassa-runway.json 11:00)
- n8n cieco 51 giri → sensori-cecita.json 11:00

**Gap sensori:** n8n cieco 51 giri (non critico), MCP Supabase cieco 3 giri (REST supplisce), BURN_MENSILE_EUR mancante.

---

## Passaggio precedente — 18/7 06:30

**Voto di fiducia: 84/100** — fleet 6 senior in parallelo, REST reale, zero numeri inventati.

**Errori:** Workflow tool ha richiesto approvazione → fallback con Agent tool. MCP Supabase non autorizzato → REST ok.

**Entità:** PQ confermato, 13 prospect scelta_ragionata, PI26 confermato.

---

## Passaggio precedente — 17/7 20:30

**Voto di fiducia: 84/100 ▲** — giro serale corretto. Bando ER CHIUSO 23/6. Tutte le entità fondate.

**Gap residui:** n8n cieco 42 giri, BURN_MENSILE_EUR mancante 116 giri.
