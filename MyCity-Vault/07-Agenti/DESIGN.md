---
tipo: pipeline
fonte: AD digitale
---

# 🎨 DESIGN — lavorare su UX/UI, layout e grafica

> Comando: **"design: [richiesta]"** (alias: *"lavora sul design"*, *"ci sono errori grafici"*,
> *"sistema la grafica"*, *"cambia il layout / i colori"*).
> L'AD capisce da solo se vuoi **analizzare** o **modificare** e attiva la squadra design.

## La squadra design
ux-designer (flussi/usabilità) · designer (grafica/brand/stampa) · ai-designer (immagini/post AI) ·
frontend-dev (la mette nel codice) · cro (conversione). Riferimento visivo: la **design system** in
`mycity-live` (colori/font/spaziature: `tailwind.config.ts`, `design-system/`, `app/globals.css`).

## Due intenti (l'AD li distingue da solo)

### 🔍 ANALIZZARE ("ci sono errori grafici", "analizza il design", "com'è l'UX?")
→ parte l'**audit design** (workflow `audit-design`): 9 dimensioni in sola lettura — layout/responsive,
coerenza col design system, tipografia, accessibilità visiva, stati UI, immagini, mobile/PWA, frizioni nei
flussi, microcopy. **Ogni problema viene verificato** (niente falsi allarmi). Report per gravità in
`consegne/design/AAAA-MM-GG-audit-design.md`, con per ognuno la **corsia** del fix (config o codice).
> 💡 Per i bug **visivi pixel-level**, l'AD può anche **aprire il sito nel browser e fare screenshot** delle
> pagine (serve l'URL del sito online o il sito in locale) — così "vede" davvero il problema. Dammi l'URL e lo faccio.

### ✏️ MODIFICARE ("cambia i colori", "sposta X", "rifai la home", "il pulsante è brutto")
→ l'AD instrada sulla corsia giusta:
- ⚡ **CONFIG (subito):** colori/logo/barra annunci, **home a blocchi**, testi delle pagine, vetrine →
  `cervello/marketplace.mjs` (site_settings). Reversibile, con backup/undo, senza deploy.
- 🛠️ **CODICE (anteprima → tuo ok):** layout, componenti, CSS, nuove sezioni → frontend-dev: branch →
  `npm run verify` → PR → **anteprima Render** → al tuo 🔴 ok → online. Vedi [[MODIFICA-MARKETPLACE]].

## Output e regola
Le modifiche restano **coerenti con la design system** (niente colori/font a caso). I cambi grafici
pubblici (li vedono i clienti) sono 🟡: te li mostro/applico e ti dico cosa ho cambiato (config = undo facile).

Motore audit: `.claude/workflows/audit-design.js`. Comando nel menù: [[COMANDI]].
