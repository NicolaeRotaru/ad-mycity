## Problema

Il build Vercel era rotto dopo il merge della PR #411 con questo errore TypeScript:

```
src/app/page.tsx(2959,40): error TS2367: This comparison appears to be unintentional
because the types '"lavori" | "numeri" | ... | "esplora"' and '"assistente"' have no overlap.
```

## Causa

La riga 2959 si trovava dentro il blocco `{chatFluttuante && vista !== "assistente" && (...)}` (riga 2803). TypeScript restringeva già il tipo di `vista` a "non assistente", rendendo il confronto `vista === "assistente"` impossibile.

## Fix (1 riga)

```tsx
// PRIMA (errore TS2367):
const chatVisibile = vista === "assistente" || chatFluttuante;

// DOPO — chatFluttuante è sempre true in questo blocco:
const chatVisibile = chatFluttuante;
```

Typecheck: **0 errori** dopo il fix. Il build Vercel riprende normalmente.
