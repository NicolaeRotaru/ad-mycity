# 🔐 AR-206 — l'elenco esplicito che sostituisce il permesso jolly

**Preparato dal lotto 33 il 2026-07-29. Da applicare a mano:** `.claude/settings.json` è negato in
Edit/Write alla macchina *apposta* (regola `no-auto-permessi` di `permessi-check.mjs`: la macchina
non deve poter toccare i propri permessi, né per allargarli né per restringerli). Quindi questo file
lo tocca Nicola — farlo da dentro sarebbe stato scavalcare il confine che il difetto chiede di
rispettare.

## Cosa c'è che non va oggi

In `.claude/settings.json` ci sono due permessi con il jolly:

    "Bash(node cervello/*.mjs:*)"
    "Bash(bash cervello/*.sh:*)"

Non sono un permesso su un elenco di programmi: sono un permesso su «qualunque programma io decida di
scrivere in quella cartella». E quella cartella la macchina la può scrivere. I freni veri — la pausa,
la firma di Nicola, l'allowlist del destinatario — vivono DENTRO i singoli script: col jolly si
arriva al risultato senza passare dallo script che contiene il freno.

## L'elenco che li sostituisce

70 script `.mjs`, ottenuti misurando quali le cadenze e il worker invocano davvero — non
tutti i 140 file presenti, solo quelli che qualcuno lancia.
Sostituisci la riga `"Bash(node cervello/*.mjs:*)"` con queste:

```json
      "Bash(node cervello/agent-registry-check.mjs:*)",
      "Bash(node cervello/allinea-scan-cantiere.mjs:*)",
      "Bash(node cervello/allocazione-check.mjs:*)",
      "Bash(node cervello/apprendimento-guardiano.mjs:*)",
      "Bash(node cervello/auto-fix.mjs:*)",
      "Bash(node cervello/avviso-telegram.mjs:*)",
      "Bash(node cervello/bilancio-vivo.mjs:*)",
      "Bash(node cervello/calibrazione.mjs:*)",
      "Bash(node cervello/cantiere-prove.mjs:*)",
      "Bash(node cervello/capacita.mjs:*)",
      "Bash(node cervello/chiusura-loop.mjs:*)",
      "Bash(node cervello/coerenza-fatti.mjs:*)",
      "Bash(node cervello/coerenza-rischi.mjs:*)",
      "Bash(node cervello/contesto-lezioni.mjs:*)",
      "Bash(node cervello/costo-ai.mjs:*)",
      "Bash(node cervello/cristallizza-apprendimento.mjs:*)",
      "Bash(node cervello/delta-gate.mjs:*)",
      "Bash(node cervello/esito-cadenza.mjs:*)",
      "Bash(node cervello/esperimenti-check.mjs:*)",
      "Bash(node cervello/firma-check.mjs:*)",
      "Bash(node cervello/freno-costi.mjs:*)",
      "Bash(node cervello/freschezza-cadenze.mjs:*)",
      "Bash(node cervello/freschezza-checklist.mjs:*)",
      "Bash(node cervello/freschezza-okr.mjs:*)",
      "Bash(node cervello/freschezza-segnali.mjs:*)",
      "Bash(node cervello/guardiani-check.mjs:*)",
      "Bash(node cervello/guardiano-capacita.mjs:*)",
      "Bash(node cervello/guardiano-tempo.mjs:*)",
      "Bash(node cervello/housekeeping-azioni.mjs:*)",
      "Bash(node cervello/intelligence-agenda.mjs:*)",
      "Bash(node cervello/keyword-owner-check.mjs:*)",
      "Bash(node cervello/letargo.mjs:*)",
      "Bash(node cervello/macchina-del-tempo.mjs:*)",
      "Bash(node cervello/metabolismo.mjs:*)",
      "Bash(node cervello/midollo-spinale.mjs:*)",
      "Bash(node cervello/north-star-check.mjs:*)",
      "Bash(node cervello/notifica-approvazioni.mjs:*)",
      "Bash(node cervello/onesta-check.mjs:*)",
      "Bash(node cervello/pagella-intelligenza.mjs:*)",
      "Bash(node cervello/pausa-check.mjs:*)",
      "Bash(node cervello/percorsi-git.mjs:*)",
      "Bash(node cervello/peso-contesto.mjs:*)",
      "Bash(node cervello/porte-check.mjs:*)",
      "Bash(node cervello/prove-oneste.mjs:*)",
      "Bash(node cervello/registro-scelte-check.mjs:*)",
      "Bash(node cervello/retry-policy.mjs:*)",
      "Bash(node cervello/rotte-scriventi-check.mjs:*)",
      "Bash(node cervello/sblocco-capacita.mjs:*)",
      "Bash(node cervello/scadenzario-check.mjs:*)",
      "Bash(node cervello/scan-segreti.mjs:*)",
      "Bash(node cervello/sensore-cassa.mjs:*)",
      "Bash(node cervello/sensori-spenti-check.mjs:*)",
      "Bash(node cervello/sentinella-budget.mjs:*)",
      "Bash(node cervello/sentinella-fonti.mjs:*)",
      "Bash(node cervello/sincronizza-proposte.mjs:*)",
      "Bash(node cervello/sistema-immunitario.mjs:*)",
      "Bash(node cervello/sonda-volano.mjs:*)",
      "Bash(node cervello/spazzata-fratelli.mjs:*)",
      "Bash(node cervello/stampo-check.mjs:*)",
      "Bash(node cervello/supervisione-negozi.mjs:*)",
      "Bash(node cervello/sync-worker-plugins.mjs:*)",
      "Bash(node cervello/tasso-lezioni.mjs:*)",
      "Bash(node cervello/taste-file.mjs:*)",
      "Bash(node cervello/test-cervello.mjs:*)",
      "Bash(node cervello/test-pannello.mjs:*)",
      "Bash(node cervello/uscite-check.mjs:*)",
      "Bash(node cervello/valida-contratti.mjs:*)",
      "Bash(node cervello/vault-sanita.mjs:*)",
      "Bash(node cervello/verifica-avversariale.mjs:*)",
      "Bash(node cervello/verifica-sensori.mjs:*)",
```

E la riga `"Bash(bash cervello/*.sh:*)"` con queste 12:

```json
      "Bash(bash cervello/allineamento-esito.sh:*)",
      "Bash(bash cervello/gate-pubblicazione.sh:*)",
      "Bash(bash cervello/giro-esito.sh:*)",
      "Bash(bash cervello/giro.sh:*)",
      "Bash(bash cervello/installa-hooks.sh:*)",
      "Bash(bash cervello/lib-cadenza.sh:*)",
      "Bash(bash cervello/monitora.sh:*)",
      "Bash(bash cervello/motore-ai.sh:*)",
      "Bash(bash cervello/ritmo-run.sh:*)",
      "Bash(bash cervello/ritmo.sh:*)",
      "Bash(bash cervello/verify-marge.sh:*)",
      "Bash(bash cervello/worker.sh:*)",
```

## Come si controlla che sia servito

`node cervello/permessi-check.mjs` oggi esce **1** e segnala i due jolly per nome. Dopo la
sostituzione quella regola deve uscire pulita. Se un domani servirà uno script nuovo, il suo permesso
va aggiunto a mano — ed è il punto: aggiungere una riga è una decisione che si vede, il jolly no.

## Cosa resta comunque da fare (e non è in questo elenco)

- **(c)** estendere a ogni script il controllo di provenienza già usato per `worker.sh`: se il file su
  disco non corrisponde alla versione committata, non si esegue;
- **(d)** togliere dall'ambiente del worker le chiavi che i singoli lavori non devono vedere,
  passandole solo ai due script che hanno il cancello dentro.

Sono infrastruttura, non perimetro: vanno in un lotto loro. Con questa sostituzione AR-206 resta
aperto, ma il buco più largo — «qualunque programma io scriva lì dentro» — è chiuso.
