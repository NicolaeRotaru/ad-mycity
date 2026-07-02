---
tipo: review-settimanale
data: 2026-06-28 16:46
nota: review eseguita fuori-ciclo (oggi è domenica, non venerdì) su richiesta di Nicola — "fai tutto adesso"
---

# 📅 Review + Retrospettiva — settimana 22→28 giugno 2026

## TL;DR
La settimana del **set-up**, non delle vendite. Costruita tutta la macchina (marketing, contenuti, memoria,
auto-coscienza) ma **0 ricavi** e, alla riprova dei dati di oggi, **azienda in stallo da 4 giorni**. Il
database è tornato collegato: da qui in poi niente più scuse "dati giù". La mossa della settimana entrante è
una sola: **chiudere la prima transazione vera**.

## 1. Pagella per reparto (target OKR vs reale)
| Reparto | Settimana | Voto | Nota |
|---|---|---|---|
| @vendite | 2 negozi approvati (Casa Linda, Pane Quotidiano), 0 LIVE-veri, 407 lead mai contattati | 🟡 5 | pipeline pronta ma spenta: nessun lead toccato |
| @marketing/@content-social | 16+ contenuti, piattaforma "Il Turno", calendario 4 settimane | 🟢 8 | enorme produzione; manca solo il via alla pubblicazione (🔴) |
| @operations | 1 ordine creato, 0 consegnati; "prima consegna 27/6" non avvenuta | 🔴 3 | il ciclo operativo non ha mai girato davvero |
| @intelligence | radar esterno aggiornato (caldo, Venerdì Piacentini, Tortello) | 🟢 8 | ottimo lavoro di scouting, fonti citate |
| @analista/@finanza | numeri riverificati oggi; Stripe non ancora riconciliato | 🟡 6 | bene appena tornati i dati; manca il lato incassi |
| Macchina (auto-coscienza) | volano avviato, registro realtà, auto-analisi 85▲ | 🟡 7 | fondamenta solide, deve ancora "girare" su più cicli |

## 2. Cosa ha funzionato / cosa no
- ✅ **Funziona:** la fabbrica di contenuti e l'onestà del sistema (niente numeri/testimonianze inventati).
- ✅ **Funziona:** il grounding delle entità — Garetti correttamente trattato come scelta_ragionata, non invenzione.
- ❌ **Non funziona:** la conversione dei preparativi in **fatti di mercato**. Tanto pronto-da-partire, niente partito.
- ❌ **Non funziona:** la persistenza della memoria (DB 2 ambiguo) e i sensori intermittenti (oggi rientrati).

## 3. 🩻 Sonda di auto-radiografia (4 invarianti del volano)
| Invariante | Stato | Dettaglio |
|---|---|---|
| Il loop si chiude? | 🟡 | il giro produce memoria, ma le azioni 🔴 restano in coda da settimane (servono firme) |
| `tasso_applicazione` > 0? | 🟡 | le lezioni esistono ma pochi cicli per misurarne l'applicazione |
| Giro a cadenza? | 🟡 | i giri ci sono ma irregolari (dipendono dai sensori); oggi ripreso pieno |
| Le sentinelle scattano? | 🟢 | la sentinella "marketplace silente" ha scattato correttamente sui dati veri |
- **Voto salute (sonda):** 75 (da 72) — +3 perché i sensori dati sono rientrati. Snapshot in `storico-salute.json`.
- ⚠️ La **radiografia COMPLETA** (workflow 12 dimensioni `.claude/workflows/auto-radiografia.js`) NON è stata
  eseguita in questo giro: è un lavoro pesante multi-agente. Lanciala a comando con **"radiografia di te stesso"**.

## 4. 🚧 Cantiere difetti (avanzamento)
- **AR-001** (sensori MCP intermittenti): **rientrato** in questo giro (Supabase tornato), ma la **causa radice
  non è risolta** (manca retry/fallback). Resta aperto, è il difetto a maggior impatto sulla crescita → fix 🟡 proposto.
- **AR-002** (percorso marketplace cablato su Windows): aperto.
- **AR-003** (cecità sensori silenziosa): aperto. Oggi la sentinella ha funzionato → priorità più bassa.

## 5. 🎯 Le 3 mosse della settimana entrante (29/6→5/7)
1. 🔴 **Prima transazione end-to-end con Casa Linda** (payout-ready): 1 prodotto vero → ordine → pagato → consegnato → payout.
2. 🔴 **Sbloccare l'ordine zombie €19,05** e azzerare gli ordini fermi.
3. 🟡 **Primi 10 dei 407 lead `to_contact`** + via alla pubblicazione del primo contenuto (in attesa firma).

## 6. Decisioni che servono da Nicola
- 🔴 Memoria: progetto Supabase separato o lo stesso del marketplace? (blocca `SUPABASE_URL`)
- 🔴 Via libera a forzare la prima transazione con Casa Linda.
- 🔴 Le 3 firme di lancio (Stripe live/sandbox, commissione, fee).

## 7. Lettera a Nicola
Aggiornata in `auto-coscienza/LETTERA-A-NICOLA.md`.
