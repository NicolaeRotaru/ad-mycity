## Summary
47 marketing skill community + **adattamento MyCity**: overlay «Il Turno», Piacenza, onestà numeri, canali locali.

## Cosa cambia
- Ogni skill marketing ha un blocco **MYCITY — contesto obbligatorio** (Turno, tagline, Facebook/IG locali, ONESTA-RULES)
- `sync-worker-plugins.mjs` applica il patch automaticamente a ogni sync futuro (idempotente)
- Fragment riusabile: `cervello/prompt-fragments/mycity-marketing-overlay.md`

## Come provare
1. Mergia la PR
2. Apri `.cursor/skills/social/SKILL.md` — deve comparire «Il Turno» subito dopo l’header
3. Chiedi al worker: «bozza post Facebook per Pane Quotidiano» — tono Piacenza, niente numeri inventati
4. `npx bats cervello/test/specchia-skills.bats` — 4/4 (già verde)

## Note
- Bozze sì, pubblicazione live resta 🔴 firma Nicola
- Non sostituisce i senior marketing/content/seo — li potenzia
