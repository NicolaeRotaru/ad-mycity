---
tipo: quaderno-memoria
reparto: finanza
---

# 🧠 Quaderno di finanza
> Cosa ho imparato. Leggi all'inizio, aggiungi un ESITO alla fine di ogni lavoro.
> Formato: AAAA-MM-GG · contesto · cosa ha funzionato o no · numero · lezione · #tag

## Esiti
- 2026-07-14 03:40 · sentinella cassa_sconosciuta 92 giri 03:40 · diagnosi+verifica sensori · atteso diagnosi aggiornata 92 giri + card burn in coda → reale Stripe ok 0€ BURN assente giri 92 card #burn-mensile-runway in coda · #runway #burn #esito
- 2026-07-14 03:40 · sentinella cassa_sconosciuta 91 giri · diagnosi+verifica sensori · atteso diagnosi aggiornata + card burn in coda → reale Stripe ok 0€ BURN assente giri 91 · #runway #burn #esito
- 2026-07-14 03:39 · sentinella cassa_sconosciuta 91 giri · ri-verifica worker · atteso stesso blocco BURN → reale Stripe ok 0€, BURN assente, giri+2, card #burn-mensile-runway già in coda · #runway #burn #esito
- 2026-07-14 03:36 · sentinella cassa_sconosciuta 89 giri · diagnosi+card burn · atteso diagnosi consegne/finanza + card #burn-mensile-runway → reale Stripe ok 0€, BURN mancante, M6b main, warn fino firma · #runway #burn #esito
- 2026-07-01 01:57 · radiografia marketplace · gravi soldi: doppio restore stock su refund, chargeback vinto senza re-payout, rimborsi parziali post-payout incompleti · fee €3/consegna/negozio addebitata server ma non mostrata in checkout (sorpresa pagamento) · lezione: fix fee UI = prerequisito fiducia checkout prima del payout-test 03/7 · #radiografia #refund #chargeback #fee
- 2026-07-01 01:06 · Foglio-firma #2-3 Nicola · payout-test **03/07 mattina** (esegue lui) · Stripe **sandbox** confermato → nessun incasso carta reale finché LIVE · percorso coerente: ordine zombie €19,05 già COD · lezione: non forzare opzione A/B del foglio se Nicola fissa data personale + stato sandbox · #finanza #stripe #payout #cod
- 2026-07-01 · giro web · Stripe Pricing Policy aggiornata 18/12/2025: fee listate sulla Pricing Page prevalgono se manca Pricing Agreement; modello IC+ può retro-aggiustare Network Costs; tier progressive ricalcolate giornalmente · https://stripe.com/legal/pricing-policy · lezione: margine unitario va simulato con arrotondamenti fee + possibili rettifiche IC+, non solo % headline · #finanza #stripe #fee #ic-plus
