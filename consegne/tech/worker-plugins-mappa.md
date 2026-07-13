# Mappa plugin worker MyCity — fase 1+2

> Aggiornato: 2026-07-13 17:20 · Manifest: `cervello/worker-plugins.json`

## Per aspetto del sistema

| Aspetto | Plugin | Quando |
|---------|--------|--------|
| **Chat con Nicola** | grilling | Stress-test decisioni; caveman SPENTO |
| **Codice minimo** | ponytail, code-simplifier | PR Pannello/cervello; pulizia post-modifica |
| **Bug difficili** | diagnosing-bugs | Loop riproduci→fix con test |
| **Nuove feature** | tdd, superpowers | Red-green-refactor; piani strutturati |
| **Security pre-merge** | differential-review | Auth, payout, RLS, webhook |
| **Pannello UI** | react-best-practices, web-design-guidelines | Performance Next.js; audit UX/a11y |
| **QA browser** | webapp-testing, verify (interno) | Playwright prima del merge |
| **Token output interno** | caveman-internal | Giro/lavori — mai in chat |
| **Sessioni lunghe** | handoff | Comprime contesto multi-turno |
| **Intelligence web** | firecrawl, Tavily (nativo Cursor) | Competitor/trend — firecrawl serve API key |
| **Verifica deploy** | verify (`.claude/skills/`) | Playwright Pannello + bats worker |

## Senior → plugin consigliato

| Senior | Plugin |
|--------|--------|
| frontend-dev | react-best-practices, web-design-guidelines, ponytail |
| backend-dev | diagnosing-bugs, tdd, differential-review |
| security | differential-review |
| qa / sdet | webapp-testing, verify |
| intelligence | firecrawl, Tavily |
| tech | diagnosing-bugs, ponytail, code-simplifier |
| prompt-engineer | superpowers, handoff |
| AD (decisioni) | grilling |
| designer / ux | web-design-guidelines |
| builder-automazioni | ponytail, tdd |

## Fase 3 (candidati)

Vedi `candidati_fase3` in `worker-plugins.json`.
