# Escalation post-168h v6 — 2026-07-01 11:52

> 🟢 Artefatto AD · Stallo transazionale **SUPERATO** la soglia 168h (~10:30). Fonte: REST live + DECISIONI Nicola 11:05.

## Situazione

| Metrica | Valore |
|---------|--------|
| Stallo | **169,4h** (ultimo evento: ordine 24/6 08:28 UTC) |
| Soglia 168h | **Superata ~10:30** — ora siamo **+1,4h oltre** |
| Transazioni reali | **0** pagati · **0** consegnati |
| Decisione Nicola | **Scelta A** ordine €19,05 (11:05) — #16 in attesa |
| Piattaforma | Sprint 1 **LIVE** Render ~10:31 · SQL 107 policy ⏳ |

## Cosa cambia rispetto a v5 (pre-168h)

Non è più «countdown alla soglia» — è **ritardo misurabile oltre il guardrail**. Ogni ora senza #16 aumenta rischio reputazione col buyer (7 giorni di attesa).

## Azioni (in ordine)

1. **🔴 #16 — Eseguire Scelta A ORA** (prima temporali 15-16 se possibile)
   - WhatsApp buyer 348 642 1766 con data/ora concreta
   - Accetta ordine in dashboard Pane Quotidiano
   - Organizza consegna COD €19,05
   - Nicola: **`ok 16`** + data/ora consegna

2. **🟡 SQL 107** — Nicola incolla DROP policy in Supabase (~30s) → scrivi «fatto sql 107»
   - Non serve seconda Approva (già chiarito 11:29)

3. **🟢 Batch onboarding 6/7** — dopo #16 + SQL 107

## Meteo oggi (impatto consegna)

- Max **35°C**, allerta calore pomeriggio
- **Temporali 15-16** (~7mm cumulati) — [3BMeteo](https://www.3bmeteo.com/meteo/piacenza) agg. 11:53
- Se #16 parte: preferire consegna **pranzo** o **sera post-18** (dopo temporali)

## Messaggio buyer (template #16)

> Ciao! Siamo MyCity — il tuo ordine da Pane Quotidiano del 24 giugno era rimasto in sospeso, ci scusiamo per il ritardo. Possiamo consegnartelo **[DATA/ORA]**? Rispondi sì e lo organizziamo subito. — Nicola, MyCity
