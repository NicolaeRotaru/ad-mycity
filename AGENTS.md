# AGENTS.md

Repo `ad-mycity`: monorepo con cervello (vault + agenti) e codice (`pannello/` Next.js, `creativi/` Node).
Il mansionario operativo è `CLAUDE.md` (italiano).

## Cursor Cloud — regole critiche

### Memoria: ramo `memoria-ad` (MAI `main`)

Il vault (`MyCity-Vault/90-Memoria-AI/`, `consegne/`, `creativi/`, `memoria-squadra/`) vive **solo** sul ramo
`memoria-ad`. Il Pannello legge quel ramo (`OBSIDIAN_BRANCH=memoria-ad`). Il ramo `main` è **solo codice**.

**Quando esegui un giro** (`fai un giro`, `cervello/giro.md`, briefing, STATO, auto-coscienza, ecc.):

1. **Base della PR = `memoria-ad`** — non `main`.
2. **Branch di lavoro** — crea `cursor/giro-AAAA-MM-DD-HHMM-dca4` (o simile) **partendo da `memoria-ad`**.
3. **Dopo il push** — apri/aggiorna la PR con **base `memoria-ad`**, titolo tipo `Giro AAAA-MM-DD HH:MM`.
4. **Non** aprire PR `memoria-ad → main` per i giri: quella merge è manuale e separata.

Se parti da `main` per errore, la memoria finisce nel posto sbagliato e il Pannello non la vede.

### Servizi

- **Pannello** (`pannello/`): `npm run dev` → `http://localhost:3000`. Node 22.x.
- **Creativi** (`creativi/`): script Node, non server.

### Caveat

- Senza segreti il pannello degrada con dati vuoti/demo (`POST /api/demo {"on":true}`).
- `npm run lint` non è configurato; usa `npx tsc --noEmit` in `pannello/`.
- Il cervello gira fuori dal pannello (worker VPS o Cloud Agent), non via API Anthropic nel pannello.
