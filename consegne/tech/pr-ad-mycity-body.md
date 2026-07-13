## Summary

Chiude i fix della casella **coerenza-agenti** (La squadra — chi fa cosa):

- **trust-safety** — tolta la frode transazionale dalla description; deferral esplicito verso **fraud-risk**
- **finanza** — confini chiari con deferral verso **contabilita**, **pricing-scientist**, **seller-financing**
- **broker-assicurativo** / **enterprise-risk** — keyword duplicate rimosse (polizze vs mappa rischi)
- **growth-monetizzazione** — deferral in formato `(→ …)`; niente più overlap con pricing-scientist
- **CLAUDE.md** — roster strutturato per i 6 senior design/creativi (prima solo nota a piè di pagina)

## Prova

```bash
node cervello/agent-registry-check.mjs
# atteso: exit 0 · «nessun drift» · Drift totale: 0
```

## Fuori scope (serve Nicola)

Assegnare il campo `model:` ai 120 agenti (3 fasce economico/standard/potente) — finding minore ancora aperto in radiografia.

## Test plan

- [ ] `node cervello/agent-registry-check.mjs` → verde
- [ ] Dopo merge: casella coerenza-agenti in Radiografia → voto ≥86, nessuna collisione grave
