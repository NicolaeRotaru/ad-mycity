# Escalation v12 — stallo 190h · giorno 2/7 mattina

> **Data:** 2026-07-02 08:20 · @operations · 🟢 artefatto interno (nessun contatto cliente senza `ok 16`)

## Situazione
- Ordine zombie `58094956-4b9b-49b4-9299-7a5c645d7cb3` — €19,05 COD — creato **24/6 10:28**
- **Stallo: 189,9h** (+12,1h vs giro 1/7 20:18) — soglia 168h superata da **+21,9h**
- Giornata **1/7 chiusa a zero transazioni** (confermato)
- **Oggi 2/7 08:20:** meteo sereno 20–31°C — **finestra mattina/pranzo APERTA** ([3BMeteo](https://www.3bmeteo.com/meteo/piacenza))

## Mossa immediata (Nicola)
1. Scrivi **`ok 16`**
2. Dashboard seller Pane Quotidiano → **Accetta ordine**
3. WhatsApp buyer **348 642 1766** (testo in `consegne/operations/pacchetto-sblocco-ordine-zombie-19-05.md` § Opzione A — adatta slot **oggi pranzo**)
4. Consegna COD → conferma in app → @customer-success telefonata entro 24h

## Blocchi paralleli (stesso giorno)
| # | Cosa | Comando |
|---|------|---------|
| 19 | Deploy fix ruoli acquisto | **`ok merge fix ruoli-acquisto`** (Render auto post-merge GitHub) |
| SQL 107 | DROP policy profiles | Supabase SQL Editor → «fatto sql 107» |
| 17 | Sync VPS | 1× root Console Hetzner |

## Se il buyer non risponde entro 4h
- Ripiano serata 18–20 o domani mattina (aggiornare messaggio con nuova fascia)
- Non avviare batch negozi 6/7 finché #16 non chiude o non si decide B

## Fonte numeri
- REST Supabase `clmpyfvpvfjgeviworth` · giro AD 2026-07-02 08:20
