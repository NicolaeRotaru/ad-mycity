## Summary
- Blocca la scrittura manuale nel registro calibrazione (solo CLI strutturata).
- Impedisce di chiudere "azzeccata" quando il sensore-fonte è cieco (AR-061).
- Aggiunge `calibrazione.mjs ripara` per backfill `sensore_stato` e fa fallire il giro se `valida` non passa.

## Perché
Il registro prosa permetteva "confermato" al buio bypassando le guardie di cmdEsito. Ora le guardie vivono anche sul file e sul giro.

## Come provare
1. `node cervello/calibrazione.mjs ripara && node cervello/calibrazione.mjs valida` → exit 0.
2. Tentativo azzeccata con sensore cieco: `node cervello/calibrazione.mjs esito --id=<aperta> --reale=1 --fonte="Supabase MCP"` con MCP cieco → exit 2 con messaggio AR-061.
