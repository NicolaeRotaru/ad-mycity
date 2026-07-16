# AGENTS.md

Repo `ad-mycity`: monorepo con cervello (vault + agenti) e codice (`pannello/` Next.js, `creativi/` Node).
Il mansionario operativo è `CLAUDE.md` (italiano): vale per QUALSIASI motore/agente che lavora qui.

## Memoria: RAMO UNICO `main` — come vede il Pannello

> ⚠️ Fase 2 (ramo unico): il vecchio ramo separato `memoria-ad` è **in pensione**. Questa pagina
> prima diceva il contrario — se hai in memoria «pubblica su memoria-ad», è superato (fix 2026-07-16).

Codice E memoria (`MyCity-Vault/90-Memoria-AI/`, `consegne/`, `creativi/`, `memoria-squadra/`)
vivono insieme su **`main`**. Il Pannello legge il vault **direttamente da GitHub** su quel ramo
(`OBSIDIAN_BRANCH=main`).

| Cosa | Ramo | Perché |
|------|------|--------|
| Giro, briefing, STATO, AZIONI | `main` | È la memoria viva che legge la Cabina |
| Codice pannello/cervello | `main` (via PR firmata da Nicola) | Deploy e fix tecnici |
| Ramo `memoria-ad` | ⛔ pensionato | Non scriverci MAI: resta solo come ripiego in sola lettura del Pannello |

**Quando esegui un giro** (`fai un giro`, `cervello/giro.md`, briefing, STATO, ecc.):

1. **Sul VPS** (`giro.sh`): la memoria si committa e pusha **direttamente su `main`** (rebase, non-force, sotto lock).
2. **Da cloud agent**: branch di lavoro creato **da `main`** → apri/aggiorna la PR con **base `main`** → falla mergiare in `main`.
3. **Mai** pubblicare la memoria su un ramo separato: la Cabina non la leggerebbe.

Dettagli: `cervello/giro.md` (sezione «DOVE PUBBLICARE») e `CLAUDE.md` (comando «fai un giro»).

### Servizi

- **Pannello** (`pannello/`): `npm run dev` → `http://localhost:3000`. Node 22.x.
- **Creativi** (`creativi/`): script Node, non server.

### Caveat

- Senza segreti il pannello degrada con dati vuoti/demo (`POST /api/demo {"on":true}`).
- `npm run lint` non è configurato; usa `npx tsc --noEmit` in `pannello/` (è nell'allowlist di `.claude/settings.json`).
- Il cervello gira fuori dal pannello (worker VPS o Cloud Agent), non via API Anthropic nel pannello.
- Motore AI del worker: **Claude Code (`claude`) è il principale**; Cursor (`agent`) solo con `CERVELLO_MOTORE=cursor` esplicito. Un solo punto di scelta: `cervello/motore-ai.sh`.
