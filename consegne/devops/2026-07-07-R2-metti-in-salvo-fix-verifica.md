---
data: 2026-07-07 10:40
reparto: devops-sre
tipo: verifica + runbook
stato: pronto (gated su rete/git-push)
supera: consegne/devops/2026-07-04-R2-merge-deploy-cantiere-runbook.md
---

# R2 — Metti in salvo i fix della macchina nel ramo principale · VERIFICA + comando pronto

> **Proposta approvata da Nicola dal Pannello (2026-07-07):** «Metti in salvo i fix della macchina nel ramo principale».
> Questo file fotografa lo stato REALE di oggi e supera il runbook del 4/7 (Strada A/B, riconciliazione via PR):
> con il RAMO UNICO `main` applicato, l'azione si è **ridotta a un fast-forward push**.

## Cosa è cambiato dal 4/7 (perché ora è semplice)
Il 4/7 i fix vivevano su `memoria-ad` e `main` era ~116 commit indietro → serviva una riconciliazione code-only via PR (Strada B). **Oggi non è più così:**
- I 20 fix del cantiere (AR-005 timeout giro, AR-026/027/028 sicurezza worker, AR-031 allocazione-check, AR-035 verifica-sensori, AR-037 claim atomico, AR-038 pausa fail-closed, AR-039, gate sensori anti-invenzione, guardiano agenti, sensore-cassa, **pre-commit hook segreti AR-004**, gate HACCP …) sono **già dentro `main` locale del VPS** — entrati col merge della **PR #212** (`claude/machine-ad-panel-diagnostics-8bl2jk`, reshape solo-codice) e i commit precedenti del cantiere.
- Resta solo **pubblicarli su `origin/main`**, indietro di **1831 commit**, che è il ramo letto dal **Pannello hosted** e da **watch-main**.

## Verifiche di sicurezza fatte (2026-07-07 10:40, VPS)
| Verifica | Comando | Esito |
|---|---|---|
| Fast-forward possibile (niente `--force`) | `git merge-base --is-ancestor origin/main main` | ✅ `origin/main` è antenato di `main` → FF pulito |
| Divergenza | `git rev-list --count origin/main..main` | ✅ **1831 avanti, 0 dietro** (solo avanti) |
| Landmine copia codice | `git cat-file -p HEAD^{tree} \| grep marketplace` | ✅ `marketplace` **assente dal tree** di `main` (non tracciato) → il push non lo trascina |
| I fix sono in `main` | grafo PR #212 mergiata in `main` | ✅ commit `0c6830c4` + catena cantiere in `main` locale |

## Il comando (unico, non-force, flusso sanzionato `cervello/giro.md` RAMO UNICO)
```bash
cd /opt/mycity/ad-mycity
git status                                  # deve essere pulito: committa prima le scritture di memoria pendenti (sentinella-dati.json, routing.json)
git pull --rebase origin main && git push origin main
```
- **Colore: 🔴** — pubblica sul ramo canonico, outward-facing (Pannello hosted + deploy VPS via watch-main). Irreversibile nel senso "reso pubblico".
- **Deploy Pannello hosted** = automatico via Vercel al push (nessun comando extra).
- **Deploy VPS** = automatico via `watch-main.timer` (~5 min, riallinea e riavvia il worker coi guardiani attivi).

## Un solo push chiude DUE code (convergenza — AR-008 anti-doppione)
`git push origin main` pubblica in un colpo:
- **#35 / R2** — i 20 fix del cantiere (questa proposta);
- **#54** — la memoria del giro (briefing 07/07 + STATO), che è già commit su `main` locale.
Sono la **stessa azione fisica**: non vanno accodate due volte. Quando il push parte, entrambe si chiudono.

## Rollback (se dopo il push qualcosa non va)
- `origin/main` non riscritto (FF puro) → per tornare indietro: `git revert <merge/commit>` mirato, oppure ripristino a un ref noto. Nessuna storia distrutta, sempre reversibile in avanti.

## Perché va fatto (rischio se NON si pubblica)
`watch-main` deploya da `origin/main`. Finché i fix restano solo nel `main` **locale** non pushato, un allineamento futuro da `origin/main` (indietro) può **spazzarli via** e rompere `giro.sh`/i guardiani. Il push li rende canonici e chiude il rischio.
