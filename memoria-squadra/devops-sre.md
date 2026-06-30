---
tipo: quaderno-memoria
reparto: devops-sre
---

# 🧠 Quaderno di devops-sre
> Cosa ho imparato. Leggi all'inizio, aggiungi un ESITO alla fine di ogni lavoro.

## Esiti
- **2026-07-01 01:11** — VPS a due binari: memoria=`memoria-ad` (overlay worker automatico) · codice=`main` (settings.json, agenti). Nicola **non** fa pull memoria-ad (conflitti). Sync codice: `cervello/vps/aggiorna-cervello.sh` o giro Pannello. WebFetch globale: merge su main prima che worker erediti config. Fonte: correzione Nicola chat 1/7.
- **2026-07-01 01:13** — WebFetch globale **non** su GitHub remoto (main/memoria-ad = whitelist). `aggiorna-cervello.sh` sovrascrive locale da main. Verifica deploy: `git show origin/main:.claude/settings.json` — non test Cursor. Fonte: correzione Nicola chat 1/7.
