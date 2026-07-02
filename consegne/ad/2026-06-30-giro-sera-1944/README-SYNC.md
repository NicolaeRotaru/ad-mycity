# 📦 Bundle sync memoria — giro 30/6/2026 19:44

> Il cloud agent **non può scrivere** i file vault owned by root (sync VPS 16:53).
> **Azione:** copiare questi file sul ramo `memoria-ad` (o eseguire `giro.sh` sul VPS).

## File da applicare

| Origine (bundle) | Destinazione vault |
|---|---|
| `STATO.md` | `MyCity-Vault/90-Memoria-AI/STATO.md` |
| `ultimo-briefing.json` | `MyCity-Vault/90-Memoria-AI/ultimo-briefing.json` |
| `intenzioni-nicola.json` | `MyCity-Vault/90-Memoria-AI/intenzioni-nicola.json` |
| `Briefing-2026-06-30-sera.md` | prepend in `Briefing/2026-06-30.md` |
| `SALA-OPERATIVA-append.md` | append in `SALA-OPERATIVA.md` |
| `auto-coscienza/*` | `MyCity-Vault/90-Memoria-AI/auto-coscienza/` |
| `AUTO-ANALISI.md` | `MyCity-Vault/90-Memoria-AI/AUTO-ANALISI.md` |

## Già scritti altrove (consegne/)
- `consegne/analista/2026-06-30-kpi-live-snapshot.md`
- `consegne/vendite/kit-bando-er-mycity.md`

## Già in DB memoria Supabase
- Tabella `briefings` — digest POST 19:47 UTC ✅

## Già aggiornato (writable)
- `MyCity-Vault/90-Memoria-AI/auto-coscienza/calibrazione.json` ✅
