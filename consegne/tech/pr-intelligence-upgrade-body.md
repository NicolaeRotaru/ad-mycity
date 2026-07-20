## Summary
Intelligence passa da «solo quando chiedi» a **agenda automatica + sveglia bandi** pronta da accendere.

## Cosa cambia
- **`intelligence-agenda.mjs`**: ogni giro sa quali fonti controllare oggi (9/18 oggi, incl. CCIAA bandi)
- **2 fonti bandi** aggiunte al radar (Camera Commercio Emilia + Unione Commercianti, cadenza giornaliera)
- **Workflow n.41** non è più stub: 3 feed RSS → filtro bandi → Telegram (serve chiavi 🔴)
- Playbook accensione in `consegne/intelligence/PLAYBOOK-ACCENSIONE-2026-07-20.md`

## Come provare
1. `node cervello/intelligence-agenda.mjs` → deve stampare fonti dovute
2. `npx bats cervello/test/intelligence-agenda.bats` → 2/2 verde
3. `bash -n cervello/giro.sh` → ok
4. Dopo merge: import workflow 41 in n8n, test dry-run, poi Active (card `#accendi-intelligence-sveglia`)

## Note
- Scan intelligence **stamattina già fatto** (perlustrazione 20/7) — questo upgrade è infrastruttura
- Telegram + Active n8n restano 🔴 firma Nicola
