---
tipo: quaderno-memoria
reparto: devops-sre
---

# 🧠 Quaderno di devops-sre
> Cosa ho imparato. Leggi all'inizio, aggiungi un ESITO alla fine di ogni lavoro.

## Esiti
- **2026-07-01 01:11** — VPS a due binari: memoria=`memoria-ad` (overlay worker automatico) · codice=`main` (settings.json, agenti). Nicola **non** fa pull memoria-ad (conflitti). Sync codice: `cervello/vps/aggiorna-cervello.sh` o giro Pannello. WebFetch globale: merge su main prima che worker erediti config. Fonte: correzione Nicola chat 1/7.
- **2026-07-01 01:13** — WebFetch globale **non** su GitHub remoto (main/memoria-ad = whitelist). `aggiorna-cervello.sh` sovrascrive locale da main. Verifica deploy: `git show origin/main:.claude/settings.json` — non test Cursor. Fonte: correzione Nicola chat 1/7.
- **2026-07-01 01:16** — Nicola esegue `aggiorna-cervello.sh`: worker attivo, commit `1394219`, settings.json = whitelist (11 domini). Conferma: sync codice funziona; WebFetch libero **solo dopo** PR+merge su main. Fonte: chat Nicola 1/7.
- **2026-07-01 01:19** — Fix codice (WebFetch): PR su **`main`** (base main, 1 file settings.json) — **non** memoria-ad. Nicola: delega AD («apri la PR») o GitHub UI; post-merge = `aggiorna-cervello.sh`. Fonte: chat Nicola 1/7.
