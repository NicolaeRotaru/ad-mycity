# 📦 Bundle sync memoria — giro 30/6/2026 20:10

> Cloud agent: file vault **owned by root** → copiare sul ramo `memoria-ad` (o `giro.sh` sul VPS).

| Origine (bundle) | Destinazione vault |
|---|---|
| `STATO.md` | `MyCity-Vault/90-Memoria-AI/STATO.md` |
| `ultimo-briefing.json` | `MyCity-Vault/90-Memoria-AI/ultimo-briefing.json` |
| `intenzioni-nicola.json` | `MyCity-Vault/90-Memoria-AI/intenzioni-nicola.json` |
| `Briefing-2026-06-30-sera-2010.md` | prepend in `Briefing/2026-06-30.md` |
| `SALA-OPERATIVA-append.md` | append in `SALA-OPERATIVA.md` |
| `auto-coscienza/*` | `MyCity-Vault/90-Memoria-AI/auto-coscienza/` |
| `AUTO-ANALISI.md` | `MyCity-Vault/90-Memoria-AI/AUTO-ANALISI.md` |
| `Piano-Operativo-AD-blocco.md` | sostituire blocco AD in `06-Piani/Piano Operativo.md` |
| `Piano-Crescita-AD-blocco.md` | sostituire blocco AD in `06-Piani/Piano di Crescita.md` |

## Già scritti (consegne/)
- `consegne/analista/2026-06-30-kpi-live-snapshot.md` (aggiornato 20:10)

## DB memoria Supabase
- Digest POST tabella `briefings` — giro 20:10 ✅

## Già aggiornato (writable da agente)
- `auto-coscienza/calibrazione.json` ✅
- `auto-coscienza/cantiere-difetti.json` ✅

## Git
- `.git/config` owned by root → agente `mycity` non può committare. Serve sync VPS o fix permessi.
