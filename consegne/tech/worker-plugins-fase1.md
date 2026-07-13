# Plugin worker — fase 1 (grilling, ponytail, caveman interno)

## Cosa fa

1. **Manifest** (`cervello/worker-plugins.json`) — lista approvata con scope per tipo lavoro
2. **Sync** (`cervello/sync-worker-plugins.mjs`) — aggiorna i file vendored da GitHub (pin ref)
3. **Grilling** — `.cursor/skills/grilling/SKILL.md` (stress-test decisioni)
4. **Ponytail** — `.cursor/rules/ponytail-code.mdc` (solo globs codice, `alwaysApply: false`)
5. **Caveman** — NON skill globale: frammento prompt solo su giro/lavori/metabolizza via `worker.sh`
6. **Chat Nicola** — prompt esplicito: caveman SPENTO, contratto chiarezza vince

## Caveman senza rompere la chat

| Contesto | Caveman | Tono |
|----------|---------|------|
| Chat Pannello (tipo=chat) | OFF | Contratto: prima riga chiara, max 5 punti |
| Giro / lavori / metabolizza | ON (lite) | Telegrafico, zero preamboli |
| Codice | Ponytail scoped | Minimo indispensabile |

## 10 plugin utili per fase 2

| # | Plugin | Repo | A cosa serve |
|---|--------|------|--------------|
| 1 | diagnosing-bugs | mattpocock/skills | Loop riproduci→ipotesi→fix |
| 2 | tdd | mattpocock/skills | Red-green-refactor a fette |
| 3 | handoff | mattpocock/skills | Comprime sessione in doc |
| 4 | Superpowers | obra/superpowers | Piano+subagent+TDD |
| 5 | Security review | trailofbits/skills | CodeQL/Semgrep |
| 6 | React best practices | vercel-labs/agent-skills | Performance Next.js |
| 7 | Web design guidelines | vercel-labs/agent-skills | A11y/UX audit |
| 8 | Webapp testing | anthropics/skills | Playwright locale |
| 9 | code-simplifier | obra/code-simplifier | Pulisce codice post-PR |
| 10 | Firecrawl | firecrawl/firecrawl-skills | Ricerca web strutturata |
