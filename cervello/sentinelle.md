# 🛰️ sentinelle.md — i trigger dell'iniziativa

> Le sentinelle fanno muovere i senior **da soli** (Carta, regola #2). Ogni senior controlla le sue:
> quando un segnale supera la soglia, AGISCE nei 🟢 e ALLERTA sui 🟡/🔴.
> ⚠️ Si attivano davvero solo quando il "cervello" gira (worker/giri schedulati in `cervello/`). Finché lo
> lanci a mano, valgono come checklist da scorrere a ogni giro.

| Segnale | Soglia | Reparto | Azione | Colore |
|---|---|---|---|---|
| Ordini oggi vs media 7g | −30% | analista | indaga la causa + mini-briefing | 🟢 |
| Nuova recensione | ≤ 2★ | customer-success | bozza risposta + alert all'AD | 🟡 |
| Carrello abbandonato | > 4h | crm-lifecycle | prepara email recupero (in coda) | 🟡 |
| Ordine in ritardo / slot scaduto | qualsiasi | operations | alert + attiva ripiego | 🟡 |
| Ordine pagato senza payout / payout fallito | qualsiasi | finanza | alert immediato | 🔴 |
| Negozio LIVE con 0 ordini | 14 giorni | vendite | visita/contatto di recupero (pronto) | 🟡 |
| Nuovo iscritto lista d'attesa | 1 | crm-lifecycle | messaggio di benvenuto (pronto) | 🟡 |
| Cambio prezzo/offerta di un concorrente | qualsiasi | intelligence | nota + impatto sui nostri prezzi | 🟢 |
| Errore/eccezione sul sito (Sentry) | nuovo | tech | diagnosi (sola lettura) + segnalazione | 🟡 |
| Stock prodotto fresco | = 0 | operations | proponi di nascondere il prodotto | 🟢 |
| Spesa di un reparto vs budget | ≥ 100% | finanza/AD | STOP automatico + avviso | 🔴 |
| Errori 5xx in produzione (Render) | >2% per 5 min | devops-sre | allerta + rollback pronto | 🔴 |
| Abbandono al checkout | >65-70% per 7gg | cro / ux-designer | audit + A/B test in branch | 🟡 |
| Negozio attivo in calo | −40% ordini o 0 per 14gg | account-negozi | check-in personalizzato | 🟡 |
| Negozio iscritto non LIVE | >36h | onboarding-negozi | completa i passi mancanti | 🟡 |
| CPA campagna ads | >130% del target per 48h | ads-performance | pausa + proposta budget | 🔴 |
| Costo AI della squadra vs budget | >+20% | prompt-engineer | sposta i compiti sull'AI economica | 🔴 |

> Aggiungere/affinare le soglie nel tempo (troppo sensibili = rumore; troppo alte = si perdono opportunità).
