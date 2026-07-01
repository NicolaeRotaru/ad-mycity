---
data: 2026-07-01 11:52
tipo: auto-analisi
---

# 🔬 AUTO-ANALISI — Cancello di serietà

**Voto di fiducia: 88/100** (▼ da 87 del giro 08:17 — −1 per stallo oltre 168h non risolto; +2 per allineamento post-Scelta A e verifica deploy LIVE)

## Trend
Stallo **superato** la soglia 168h — il business resta fermo ma il lavoro di questo giro è **onesto e ancorato**: KPI live REST, entità verificate, nessuna 🔴 nuova senza firma, Scelta A rispettata (no ripetizione A/B), card obsolete non riproposte.

## Errori per gravità
Nessun errore nuovo di grounding o numeri orfani in questo giro.

| Gravità | Cosa | Perché problema | Azione presa | Livello |
|---------|------|-----------------|--------------|---------|
| — | — | — | — | — |

## Domande per Nicola
1. **Quando consegniamo l'ordine PQ?** (pranzo o sera post-18, evitando temporali 15-16) + **`ok 16`**
2. **SQL 107:** incolla migration in Supabase → «fatto sql 107» (non seconda Approva)
3. **Batch 6/7:** quanti negozi e quali nomi?

## Salute della macchina
| Sensore | Stato |
|---------|-------|
| Supabase marketplace REST | ✅ live 11:52 |
| Supabase memoria REST | ✅ POST briefings OK |
| Supabase MCP | ❌ cieco (fallback REST) |
| Stripe MCP | ❌ assente |
| PostHog | ❌ assente |
| WebFetch | ✅ OK |
| Dati freschi | ✅ sì (query questo giro) |

## Punti ciechi
- RPC `list_abandoned_carts_to_recover` vuoto — carrelli mantenuti a **4** dal giro precedente (non inventato)
- Smoke test checkout produzione post-Sprint 1 non eseguito
- Competitor: cadenza settimanale, non rifatto

## Cosa miglioro al prossimo giro
- Se #16 eseguito: aggiornare KPI con 1° ordine pagato/consegnato e chiudere sentinella ordine zombie
- Post «fatto sql 107»: verificare anon non legge `stripe_account_id`
- Non re-inserire in Proposte promemoria ops già decisi (lezione L recidiva onboarding 6/7)
