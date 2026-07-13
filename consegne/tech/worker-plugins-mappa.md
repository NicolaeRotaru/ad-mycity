# Mappa plugin worker MyCity — fase 1+2+3

> Aggiornato: 2026-07-13 17:22 · Manifest: `cervello/worker-plugins.json` · **21 skill**

## Per aspetto del sistema

| Aspetto | Plugin | Quando |
|---------|--------|--------|
| **Chat con Nicola** | grilling | Stress-test decisioni; caveman SPENTO |
| **Codice minimo** | ponytail, code-simplifier | PR Pannello/cervello; pulizia post-modifica |
| **Bug difficili** | diagnosing-bugs, systematic-debugging | Loop riproduci→fix; root-cause 4 fasi prima del patch |
| **Architettura moduli** | codebase-design | Seam, adapter, moduli profondi prima di refactor |
| **Nuove feature** | tdd, superpowers | Red-green-refactor; piani strutturati |
| **Security pre-merge** | differential-review | Auth, payout, RLS, webhook |
| **DB / Supabase** | supabase, supabase-postgres-best-practices | RLS, migrazioni, query lente |
| **Pannello UI** | react-best-practices, web-design-guidelines | Performance Next.js; audit UX/a11y |
| **QA browser** | webapp-testing, verify (interno) | Playwright prima del merge |
| **Token output interno** | caveman-internal | Giro/lavori — mai in chat |
| **Sessioni lunghe** | handoff | Comprime contesto multi-turno |
| **Intelligence web** | firecrawl, Tavily (nativo Cursor) | Competitor/trend — firecrawl serve API key |
| **Repo remoto** | codebase-search | mycity-live cross-repo — serve MCP Tabnine |
| **Documenti bandi** | pdf, xlsx, docx | Rendicontazione, moduli, contratti |
| **Verifica deploy** | verify (`.claude/skills/`) | Playwright Pannello + bats worker |

## Senior → plugin consigliato

| Senior | Plugin |
|--------|--------|
| frontend-dev | react-best-practices, web-design-guidelines, ponytail |
| backend-dev | supabase, supabase-postgres-best-practices, diagnosing-bugs, tdd, differential-review |
| security | differential-review, supabase (RLS) |
| qa / sdet | webapp-testing, verify |
| intelligence | firecrawl, Tavily |
| tech | systematic-debugging, diagnosing-bugs, ponytail, code-simplifier, codebase-design |
| prompt-engineer | superpowers, handoff |
| AD (decisioni) | grilling |
| designer / ux | web-design-guidelines |
| builder-automazioni | ponytail, tdd |
| grant-writer | pdf, xlsx, docx |
| data-engineer | supabase-postgres-best-practices |

## Fase 4 (candidati)

Vedi `candidati_fase4` in `worker-plugins.json`.
