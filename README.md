# 🧠 AD MyCity

L'**AD digitale** del marketplace **MyCity** (Piacenza) e il suo **Pannello di Controllo** web,
in un'unica repo. L'AD osserva → capisce → decide → agisce → impara, con Nicola che dà la rotta
e firma le decisioni importanti.

## Le due parti
- 🧠 **Il cervello (l'AD)** — questa repo è il workspace di **Claude Code**:
  - `CLAUDE.md` — il mansionario dell'AD.
  - `.claude/agents/` — i 40 senior (vendite, marketing, finanza, tech…).
  - `MyCity-Vault/` — la memoria (strategia, mercato, numeri, e `90-Memoria-AI/`: STATO, DECISIONI, AZIONI-IN-ATTESA, SALA-OPERATIVA, Briefing).
  - `cervello/` — gli script che lo fanno girare (giro, worker, esegui-azione, marketplace).
  - `consegne/` · `creativi/` · `memoria-squadra/` — lavori finiti, grafiche, quaderni di memoria.
- 🖥️ **Il Pannello di Controllo** — `pannello/`: app **Next.js** (deploy su Vercel) dove Nicola
  vede tutto a colpo d'occhio (azioni da approvare, attività e briefing, stato e numeri, piani)
  e **approva** le azioni. Legge la memoria del vault via GitHub API; manda comandi all'AD via
  la coda `lavori` (Supabase) che `cervello/worker.ps1` esegue.

## Da dove parto
- 👤 **Umano:** apri `INIZIA-QUI.md`.
- 🤖 **AD (Claude Code):** leggi `CLAUDE.md`.
- 🖥️ **Pannello web:** `pannello/LEGGIMI.md`.

## La regola d'oro
🟢 reversibile → fai da solo · 🟡 impatto medio → fai e avvisa · 🔴 soldi/legale/irreversibile → proponi e aspetta la firma di Nicola.
