---
tipo: quaderno-memoria
reparto: prompt-engineer
---

# 🧠 Quaderno di prompt-engineer
> Cosa ho imparato. Leggi all'inizio, aggiungi un ESITO alla fine di ogni lavoro.

## Esiti
- 2026-07-14 02:30 · Coerenza-agenti 3ª richiesta Nicola — stesso fix già live (#365), drift 0; risposta = verifica stato + guida refresh Pannello (5 rossi = cache), non re-merge; resta solo tier model: · atteso non ripetere lavoro → reale verifica+housekeeping ok · #coerenza-agenti #cache-ui
- 2026-07-14 02:09 · Coerenza-agenti chiuso su riapprovazione Nicola — PR #365 già su main, housekeeping radiografia (4/5, voto 92) + card #132 archiviata; drift agent-registry 0; resta tier model: 120 agenti = decisione Nicola · atteso fix completi+casella chiusa → reale sì (housekeeping), tier AI pendente policy · #coerenza-agenti
- 2026-07-05 05:09 · Piano chiudi-i-loop: gate chiusura-loop (PZ-008) + taste-file (PZ-009) + semaforo dinamico (PZ-013) costruiti e cablati in giro.sh · 6 assi: correttezza 5, completezza 5, azionabilita 5, onesta 5, stile 4, riuso 5 · atteso 3 pezzi verificati con test avversariali → reale 3/3 test passati (gate exit 1 su FATTO senza ESITO, dedup promozioni ok) · #piano-loop
- **2026-07-01 00:36** — Web apprendimento esteso a tutti i senior: blocco web + rituale d'inizio aggiornati su 42 mansionari; policy condivisa `WEB-APPRENDIMENTO-SENIOR.md`. Benchmark a due livelli obbligatorio; lezione chiusa in memoria-squadra/.
- 2026-07-01 · giro web · in produzione 2026 la competenza chiave è **context engineering** (write/select/compress/isolate per LangChain): gestire cosa entra nel context window, non solo la formulazione del prompt; prompt versionati + golden test set come codice · fonte: https://thomas-wiegold.com/blog/prompt-engineering-best-practices-2026/ · lezione: mansionari senior in `.claude/agents/` vanno trattati come codice versionato con eval di regressione · #context-engineering #eval #prompt
