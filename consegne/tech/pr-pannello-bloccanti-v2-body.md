Fix di 3 bug nel Pannello di controllo.

Bug 1 — La risposta non è arrivata mostrata anche quando c'è (page.tsx): race-condition worker, se il job finisce con risultato vuoto ma lo streaming aveva già mostrato testo reale, la bolla veniva sovrascritta con l'errore. Fix: se MSG_RISPOSTA_VUOTA ma la bolla pending ha già contenuto reale, mantienilo.

Bug 2 — Azione in attesa bloccata per sempre (azioni-pronte/route.ts): stato "in_attesa" trattato come già eseguito, impossibile ri-approvare o annullare. Fix: escludi in_attesa dal controllo idempotenza.

Bug 3 — Parla con questa casella azzerava la chat principale (ParlaCasella.tsx): al click veniva pubblicato subito un thread vuoto prima del caricamento async. Fix: guard che salta la pubblicazione se msgs vuoti e convId null.

Come testare:
1. Invia un messaggio in chat e verifica che la risposta appaia normalmente
2. Se un'azione resta in attesa, puoi ri-approvarla o annullarla
3. Clicca Parla con questa casella su qualsiasi card: la chat principale NON si svuota
