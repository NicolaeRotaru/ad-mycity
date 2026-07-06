# 🛰️ sentinelle.md — i trigger dell'iniziativa

> Le sentinelle fanno muovere i senior **da soli** (Carta, regola #2). Ogni senior controlla le sue:
> quando un segnale supera la soglia, AGISCE nei 🟢 e ALLERTA sui 🟡/🔴.
> ⚠️ Si attivano davvero solo quando il "cervello" gira (worker/giri schedulati in `cervello/`). Finché lo
> lanci a mano, valgono come checklist da scorrere a ogni giro.

## 👁️ La sentinella dei DATI — veglia in tempo reale a costo zero (`sentinella-dati.mjs`)
> **Il modello OCCHI/CERVELLO** (vincolo di Nicola: *«veglia sempre, ma usa i token solo quando c'è
> qualcosa da fare»*). Sono due cose diverse:
>
> - **OCCHI** = `cervello/sentinella-dati.mjs`, lanciato dal timer **`mycity-sentinella-dati.timer` ogni 1
>   minuto** (regolabile 1-5 min). È **Node puro su REST → 0 token**. Ogni giro legge i dati reali
>   (ordini, payout, recensioni, carrelli, negozi + la salute della macchina stessa), valuta le soglie
>   qui sotto in modo deterministico e aggiorna il proprio battito. Guardare **non costa nulla**.
> - **CERVELLO** = il motore AI dentro `worker.sh` (già acceso 24/7, `Restart=always`). Dorme a 5s finché
>   la coda `lavori` è vuota (**0 token**). Si sveglia **solo** quando la sentinella gli **accoda un
>   lavoro** perché una soglia è scattata. Il modello premium parte **solo sull'evento reale**.
>
> **I tre freni anti-spreco** (perché la sveglia non diventi un salasso):
> 1. **Dedup + cooldown** (default 6h): lo stesso identico problema non riaccende l'AI ogni 2 minuti;
>    riscatta solo se peggiora (firma nuova) o dopo il cooldown. Doppio controllo anche lato DB (non
>    accoda se un lavoro identico è già in coda → resiste al riavvio).
> 2. **Tetto di spesa** (default 6/giorno, 2/ora) sul **volume**. Oltre il tetto non accoda: alza solo un
>    segnale. **I 🔴 (soldi/legale) bypassano il tetto** — «sotto budget si taglia il volume, mai i controlli».
> 3. **Kill-switch**: rispetta la PAUSA del Pannello (`impostazioni.pausa=on`) e una pausa propria
>    (`sentinella-dati:pausa=on`).
>
> **Sicurezza (colore 🟢):** la sentinella accoda **solo lavori di `tipo=analisi`/proposta** — **MAI**
> `esegui-azione`. Non fa partire nulla di reale da sola: prepara l'analisi/proposta, poi **Nicola firma**
> le azioni 🔴. Zero doppio-invio, zero sorprese.
>
> **Prova a mano (dry-run, non accoda):** `node cervello/sentinella-dati.mjs` · **JSON:** `--json`.
> **Attivare il timer sul VPS = 🔴 (Nicola):** `sudo bash cervello/vps/install-ritmo-timers.sh`.
> **Regolabili via .env:** `SENTINELLA_DATI_COOLDOWN_ORE`, `SENTINELLA_DATI_MAX_GIORNO`,
> `SENTINELLA_DATI_MAX_ORA`, `SENTINELLA_DATI_CALO_MIN_BASE`; la cadenza nel `.timer` (`OnUnitActiveSec`).
>
> **Le 10 sentinelle oggi LIVE** (5 🧠 macchina + 5 💼 azioni; soglie deterministiche su nomi/enum
> reali del DB, verificati via schema — niente falsi allarmi):
>
> | 🧠 MACCHINA (auto-analisi di sé) | Soglia | Colore | Cosa fa |
> |---|---|---|---|
> | Worker morto | battito `worker:ultimo` > 3 min **e** 0 lavori in corso | 🔴 | **solo allerta** Telegram (accodare sarebbe inutile) |
> | Sensori dati ciechi | ≥ 3 giri consecutivi | 🟡 | accoda: controlla `.env` + fallback baseline |
> | Salute architettura bassa | voto < 60 (`storico-salute.json`) | 🟡 | accoda: lancia l'auto-radiografia |
> | Radiografia di sé vecchia | > 10 giorni (`auto-radiografia.json`) | 🟡 | accoda: rifà la radiografia di sé |
> | Volano fermo | `tasso_applicazione` lezioni < 0.3 | 🟡 | accoda: capire perché il loop non applica |
>
> | 💼 AZIONI (business/marketplace) | Soglia | Colore | Cosa fa |
> |---|---|---|---|
> | Ordine pagato senza payout | carta `PAID`, `payout_at` nullo da >24h (COD escluso) | 🔴 | accoda: prepara proposta payout (Nicola firma) |
> | Calo ordini | 24h < 70% media 7g (guardia: media ≥ 3/gg) | 🟢 | accoda: mini-briefing sulla causa |
> | Recensione ≤2★ | nuova dall'ultimo giro (`reviews`+`store_reviews`) | 🟡 | accoda: bozza risposta + recupero cliente |
> | Negozio LIVE fermo | seller approvato >14g, 0 ordini in 14g | 🟡 | accoda: check-in anti-churn |
> | Carrello abbandonato | `recovered=false`, email non inviata, fermo >4h | 🟡 | accoda: prepara email di recupero |
>
> Le altre righe della tabella qui sotto restano checklist del giro finché il sensore/mano non è
> collegato. La **coda-falliti/orfani** è coperta dalla sentinella gemella `sentinella-lavori.mjs` (3 min).
>
> 🔭 **Sentinelle vs Radar:** qui ci sono i trigger a **soglia su dati INTERNI** (ordini, payout,
> recensioni…). Il mondo **ESTERNO** che influenza MyCity (notizie, competitor, bandi, meteo,
> istituzioni…) sta nel **radar**: `cervello/radar.json` — i 50 fattori con senior, peso e fonti live.
> Si completano: alcuni fattori del radar, quando hanno una soglia (es. "cambio prezzo concorrente"),
> sono già sentinelle qui sotto. Il giro (`giro.md`) controlla **prima le sentinelle, poi il radar**.

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
| Voto salute architettura (auto-radiografia) | < 60 | AD | accoda + lancia la radiografia completa di sé | 🟡 |
| Volano aperto (tasso_applicazione lezioni) | < 0.3 per 3 giri | AD | radiografia completa: il loop non chiude | 🟡 |
| Sensore dati cieco (REST o MCP) | ≥ 3 giri consecutivi (`sensori-cecita.json`) | AD | verifica `.env` + retry; se REST ok usa fallback; altrimenti passaggio minimo | 🟡 |
| Giorni dall'ultima radiografia completa di sé | > 10 | AD | esegui `.claude/workflows/auto-radiografia.js` | 🟡 |
| Difetto BLOCCANTE di sé (es. 🔴 che sfugge, segreto esposto) | qualsiasi | AD/security | **allerta immediata** a Nicola (Telegram/push) + blocca | 🔴 |
| Segreto esposto nella repo (`scan-segreti.mjs`) | qualsiasi match | security/AD | **BLOCCA il push** del giro + allerta 🔴 (revoca la chiave) | 🔴 |
| Runway di cassa (`cassa-runway.json`) | < 3 mesi | finanza/AD | allerta immediata: priorità a incasso/riduzione burn | 🔴 |
| Consumo AI giornaliero (`costo-ai.json`) | > soglia (`COSTO_SOGLIA_TOKEN_GIORNO`) | prompt-engineer/AD | sposta i compiti sull'AI economica, taglia i giri ridondanti | 🟡 |
| Drift registro agenti (`agent-registry-check.mjs`) | drift > 0 (orfani/conteggio) | AD | riallinea CLAUDE.md/AGENTI.md/COMANDI ai 42 file reali | 🟡 |
| Dispersione dalla North Star | North Star = 0 per ≥ 3 giri mentre si accumulano asset/coda | AD | STOP produzione: taglia il volume, forza il focus sull'entità confermata | 🟡 |
| Negozio di deperibili verso LIVE senza gate compliance | prima consegna di freschi | qa/legale-privacy | blocca finché `GATE-COMPLIANCE-PRELANCIO.md` non è spuntato | 🔴 |
| Data breach / incidente dati personali (GDPR) | qualsiasi sospetto | legale-privacy/security | **notifica Garante entro 72h** + registro incidenti; richieste interessati entro 30gg | 🔴 |

> Aggiungere/affinare le soglie nel tempo (troppo sensibili = rumore; troppo alte = si perdono opportunità).
> Le sentinelle deterministiche (segreti, cassa, costo, drift) sono alimentate dagli script in `cervello/`
> lanciati dal giro; le altre restano checklist finché la relativa "mano"/sensore non è collegato.
