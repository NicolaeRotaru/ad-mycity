# Difetti di cantiere dalla radiografia 7/7 (Round 1+2) — da ri-applicare a main

> Il PR #212 e solo-codice (non tocca la memoria del VPS, che la riscrive ogni 5 min). Queste voci
> vanno aggiunte al cantiere di main per id. Snapshot completo: consegne/audit/2026-07-07-cantiere-nuovi-difetti.json

| ID | Gravita | Stato | Fix | Verifica (file · pattern) |
|---|---|---|---|---|
| AR-026 | bloccante | in-corso | ⛔ Un'azione reale approvata e interrotta a metà riparte DA SOLA al riavvio del w | cervello/worker.sh · esegui-azione proposta |
| AR-027 | grave | in-corso | Il worker si riavvia da solo dopo ogni push della memoria: watch-main non distin | cervello/vps/watch-main.sh · SOLO_MEMORIA |
| AR-028 | grave | in-corso | ritmo.sh butta via i commit di memoria non ancora pushati (checkout -f distrutti | cervello/ritmo.sh · rebase FETCH_HEAD |
| AR-029 | grave | aperto | Il registro dei fatti-chiave è vuoto: il guardiano di coerenza gira «verde a vuo | MyCity-Vault/90-Memoria-AI/registro-fatti.json · "id": |
| AR-030 | grave | aperto | La checklist personale di Nicola è ferma al 26/6 e il Pannello la serve come lis | MyCity-Vault/90-Memoria-AI/CHECKLIST-NICOLA.md · aggiornato: 2026-06-26 |
| AR-031 | grave | aperto | La scheda del reparto vendite reclama ancora i mestieri di altri tre reparti (ro | .claude/agents/vendite.md · account-negozi |
| AR-032 | grave | aperto | growth-monetizzazione si sovrappone a tre owner (carrelli, fee dinamiche, churn) | .claude/agents/growth-monetizzazione.md · crm-lifecycle |
| AR-033 | bloccante | aperto | ⛔ Pannello: la risposta del worker viene scartata in silenzio e la bolla «sto pe | pannello/src/app/page.tsx · mergeThread\(esiste |
| AR-034 | grave | aperto | Pannello: approva/ignora rispondono «ok» anche se il salvataggio fallisce → al r | umano  |
| AR-035 | grave | in-corso | Chi lancia i guardiani da un ambiente senza chiavi sovrascrive lo stato buono de | cervello/verifica-sensori.mjs · scriviStato |
| AR-036 | bloccante | aperto | ⛔ Pannello: ogni «Parla con questa casella» scarica TUTTE le conversazioni al mo | pannello/src/components/ParlaCasella.tsx · cache|Context|useSWR|condivis |
| AR-037 | grave | in-corso | Claim della coda non atomico: due worker possono eseguire lo stesso lavoro due v | cervello/worker.sh · id=eq.$id&stato=eq.in_attesa |
| AR-038 | minore | in-corso | Kill-switch PAUSA fail-open nel worker (il componente che esegue le azioni reali | cervello/worker.sh · PAUSA_FAIL_CLOSED |
| AR-039 | grave | in-corso | allocazione-check conta un asset per OGNI negozio nominato: conteggio gonfiato e | cervello/allocazione-check.mjs · function entitaPrimaria |
