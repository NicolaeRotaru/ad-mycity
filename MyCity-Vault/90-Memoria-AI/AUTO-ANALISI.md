---
data: 2026-07-17 12:15
tipo: auto-analisi
fonte: AD digitale (cervello/auto-analisi.md)
---

# 🔬 Auto-analisi — giro 12:15 (17/7 · REST ok 11:28 · intelligence aggiornata · VP STASERA)

**Voto di fiducia: 87/100** — supervisione-negozi.mjs ok (17 negozi/258 prodotti/494 autofill), 3 file Intelligence scritti, sensori REST ok, intelligence fresca.

**Errori questo giro**: bandi CCIAA BT26/BE26 riportati senza verifica da fonte primaria CCIAA (classificati scelta_ragionata da verificare — non bloccante).

**Entità fondate**: PQ confermato (supervisione 11:29), North Star 0 confermato (REST 11:28), 23 clienti confermati, VP 17/7 confermato, bando ER 21/7 confermato (fesr.regione.emilia-romagna.it), acquisizione Prosus/JustEat confermata (retailfood.it).

**Gap residui**: n8n cieco 29 giri (causa sconosciuta) · MCP Supabase cieco 2 giri · BURN_MENSILE_EUR mancante 116+ giri · bug video live (PR #428, in attesa conferma Nicola).

**Benchmark**: giro onesto su giornata operativa. Focus su azione concreta (presidio banco VP). Nessun numero inventato.

## Verdetto

| Controllo | Esito |
|---|---|
| Numeri REST (via delta-gate 06:20) | ✅ invariati: ordini=1, clienti=23 |
| Sensori | ✅ REST ok · Stripe ok · n8n cieco 19g |
| Entità PQ | ✅ confermato baseline 06:20 |
| Allocazione AR-006 | ✅ nessun silo prospect (supervisione 06:20) |
| Comandi node questa sessione | ⚠️ non autorizzati → baseline |

## Entità verificate

| Entità | Stato | Fondamento |
|---|---|---|
| Pane Quotidiano | `confermato` | delta-gate 06:20 — 1 approved |
| VP 17/7 | `confermato OGGI` | registro-fatti + calendario VP |
| Bando ER 21/7 | `scade tra 4 giorni` | registro-fatti (gate: 1° ordine reale) |
| Casa Linda | `DEMO` | registro-realtà UUID seed |

## Domande a Nicola

1. Vai al banco PQ stasera (QR in mano → North Star 0→1)?
2. Link lista d'attesa → post kefir
3. Esegui comando BURN_MENSILE_EUR (già approvato 16/7 21:17)
4. Mergia PR #427 (smartphone)
5. Approva push branch fix/video-live-chat
6. Ruota PAT GitHub (sicurezza)
