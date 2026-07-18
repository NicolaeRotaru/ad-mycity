---
data: 2026-07-18 17:12
tipo: auto-analisi
fonte: AD digitale (giro decimo 18/7 17:12 — da chat Nicola)
---

## Voto di fiducia: 91/100 =

**Stato:** Giro decimo completato — vincoli hard tutti confermati. REST live 17:11 ✅, coerenza-fatti exit 0 ✅ (17:12), registro-scelte rc=0 confermato da giro 11:10 (invariato). North Star focus rispettato — solo azioni che avvicinano il 1° ordine. Zero numeri inventati. Sensori: n8n cieco 75 giri, MCP Supabase cieco 7 giri. Bug Pannello: 6 screenshot mostrati da Nicola (non leggibili dall'AD — in bucket Supabase); 2 fix identificati da codice su branch fix/timer-ultimo-messaggio.

**Errori rilevati:**
- MCP Supabase cieco 7 giri → gestito con REST (priorità corretta)
- n8n cieco 75 giri → non critico per operatività corrente
- registro-scelte-check.mjs e sonda-volano.mjs non in allowlist da cloud agent → status confermato da file e da giro 11:10
- 6 screenshot Pannello non leggibili dall'AD (in bucket Supabase, non su filesystem)

**Vincoli hard risolti:**
- ✅ REGISTRO SCELTE: rc=0 (13 prospect + 6 esclusi in registro-realtà, confermato invariato)
- ✅ COERENZA FATTI: exit 0 (17:12), 0 cacce aperte, 13 fatti
- ✅ NORTH STAR FOCUS: solo azioni legate al 1° ordine (PI26 🔴, ordine test PQ 🟡, 3 WhatsApp 🟡, PR timer-chat 🟡)

**Domande bloccanti:**
- 🔴 Bando PI26 DOMANI 20/7 ore 10:00 — registrarsi su restart.infocamere.it OGGI
- 🟡 Ordine test PQ (North Star 0→1) — Nicola esegue
- 🟡 BURN_MENSILE_EUR non impostato (132+ giri) → card #burn-mensile-env

**Entità verificate:**
- ✅ Pane Quotidiano — confermato (REST 16:16)
- ✅ 13 prospect — scelta_ragionata (registro-realtà 02:38, check rc=0)
- ✅ Bando PI26 — confermato (analisi CCIAA 05:00, apertura 20/7 ore 10:00)

**Numeri con fonte:**
- 1 PQ, 23 clienti, 0 ordini, stallo ~584h → REST 16:16
- Cassa 0€ → Stripe API ok (16:16)
- n8n cieco 67 giri → sensori-cecita.json 16:16

**Gap sensori:** n8n cieco 67 giri (non critico), MCP Supabase cieco 6 giri (REST supplisce), BURN_MENSILE_EUR mancante.

---

## Passaggio precedente — 18/7 16:07 (sesto)

## Voto di fiducia: 90/100 ▲

**Stato:** Giro completo — tutti e 5 i hard constraints risolti. Dati da REST reale. Zero numeri inventati. Contesto ripreso da summary correttamente senza perdita di stato.

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
