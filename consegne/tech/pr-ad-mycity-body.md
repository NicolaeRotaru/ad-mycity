## Summary
Scaricate e vendored tutte le 47 marketing skill community (`coreyhaines31/marketingskills`) nel manifest plugin del worker — da 19 a 66 skill totali.

## Cosa cambia
- `worker-plugins.json`: +47 voci marketing (copy, CRO, social, SEO, ads, launch…)
- `.cursor/skills/<id>/SKILL.md`: file vendored pronti offline (sync da GitHub)
- Lo specchio Claude (`.claude/skills/`, gitignored) si rigenera da solo a ogni avvio worker/giro

## Come provare
1. Mergia la PR
2. Riavvia il worker (o attendi prossimo giro) — le skill compaiono nel prompt plugin
3. Chiedi in chat «scrivi un post Facebook per Pane Quotidiano» — il worker può attivare skill `social` / `copywriting`
4. `npx bats cervello/test/specchia-skills.bats` — 4/4 verdi (già passato in branch)

## Note
- Skill generiche B2B/SaaS: il worker deve adattarle a MyCity (Turno, Piacenza, onestà numeri) — non sostituiscono i senior marketing/content/seo
- Licenza MIT sul repo sorgente
