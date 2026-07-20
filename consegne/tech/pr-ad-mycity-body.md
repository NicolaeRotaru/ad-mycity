## Summary
- Redige 3 frammenti di PAT GitHub nel report auto-radiografia 16/7 che bloccavano ogni pubblicazione memoria (`scan-segreti` exit 1).
- Aggiunge `redattore-segreti.mjs` + `segreti-pattern.mjs` (regex condivise con lo scan) per prevenire leak futuri negli audit.
- Regola in `scrittura-umana.md` e nota in `auto-radiografia.md`: mai scrivere il valore di un token, solo `[REDATTO]`.

## Perché
AR-124: documentare un leak in un audit re-iniettava il token e bloccava il giro in loop. DECISIONI.md era già pulito; il blocco restava solo nel report in `consegne/audit/`.

## Come provare
```bash
node cervello/scan-segreti.mjs          # deve uscire 0
node --test cervello/test/segreti-pattern.test.mjs
echo "test github_pat_11$(python3 -c 'print(\"X\"*25)')" | node cervello/redattore-segreti.mjs --stdin
```

## Dopo il merge
- Il prossimo giro può pubblicare memoria su main.
- Se il PAT trapelato era ancora valido, Nicola dovrebbe ruotarlo (#ruota-pat-github in coda).
