# AGENTS.md

Repo `ad-mycity`: monorepo con cervello (vault + agenti) e codice (`pannello/` Next.js, `creativi/` Node).
Il mansionario operativo è `CLAUDE.md` (italiano).

## Cursor Cloud — regole critiche

### Memoria: ramo `memoria-ad` — come vede il Pannello

Il vault (`MyCity-Vault/90-Memoria-AI/`, `consegne/`, `creativi/`) vive sul ramo **`memoria-ad`**.
Il Pannello lo legge **direttamente da GitHub** su quel ramo (`OBSIDIAN_BRANCH=memoria-ad`).
**Non serve mergiare `memoria-ad` in `main` per vedere i dati del giro nel Pannello.**

| Cosa | Ramo | Perché |
|------|------|--------|
| Giro, briefing, STATO, AZIONI | `memoria-ad` | È la memoria viva che legge la Cabina |
| Codice pannello/cervello | `main` | Deploy e fix tecnici |
| Merge `memoria-ad → main` | Solo se **tu** lo decidi | Opzionale, per backup/Obsidian su main — **non** per il Pannello |

**Quando esegui un giro** (`fai un giro`, `cervello/giro.md`, briefing, STATO, ecc.):

1. **Base della PR = `memoria-ad`** — non `main`.
2. **Branch di lavoro** — crea `cursor/giro-AAAA-MM-DD-HHMM-3045` **partendo da `memoria-ad`**.
3. **Dopo il push** — apri/aggiorna la PR con **base `memoria-ad`**, titolo tipo `Giro AAAA-MM-DD HH:MM`.
4. **Merge la PR in `memoria-ad`** (non in `main`) — così il Pannello vede subito il giro.
5. **Non** scrivere la memoria solo su `main`: la Cabina non la leggerebbe.

Se parti da `main` per errore, la memoria finisce nel posto sbagliato e il Pannello resta fermo.

### Servizi

- **Pannello** (`pannello/`): `npm run dev` → `http://localhost:3000`. Node 22.x.
- **Creativi** (`creativi/`): script Node, non server.

### Caveat

- Senza segreti il pannello degrada con dati vuoti/demo (`POST /api/demo {"on":true}`).
- `npm run lint` non è configurato; usa `npx tsc --noEmit` in `pannello/`.
- Il cervello gira fuori dal pannello (worker VPS o Cloud Agent), non via API Anthropic nel pannello.
