## Cosa cambia

Le chat continuavano a duplicarsi ("Oiinn" x2, "Abc" x2, stesso minuto) ANCHE dopo il merge di PR #531 (fix del doppio-tap). Causa vera trovata leggendo il codice: la casella di scrittura chat esiste in DUE punti di `page.tsx` — la vista "Assistente" a pagina intera e il widget flottante/worker — e queste **possono restare montate entrambe insieme** (quando sei sulla vista Assistente e apri anche il widget flottante sopra). Il lock anti-doppio-invio di #531 era locale a ciascuna istanza: bloccava un doppio tap sullo STESSO bottone, ma non due caselle diverse che inviano nello stesso momento.

## Perché

Il commento originale nel codice diceva "una sola superficie montata per volta" — un'assunzione che in pratica non è sempre vera (confermato leggendo le condizioni in `page.tsx`: `vista === "assistente"` e `chatFluttuante || workerFull` non si escludono a vicenda). Serve un lock condiviso, non uno a testa.

## Come

Il lock (`invioChatBloccatoRef`) ora vive in `page.tsx` e viene passato come prop (`invioBloccatoCondivisoRef`) a entrambe le istanze di `BarraScritturaChat`. Un invio da una casella blocca per 800ms anche l'altra. Se il prop non arriva (uso futuro del componente altrove) resta il lock locale come prima, per compatibilità.

## Come provare

1. `npx tsc --noEmit` da dentro `pannello/` — pulito (verificato).
2. Dal vivo dopo il deploy: apri la vista Assistente, apri anche il widget flottante sopra, scrivi un messaggio breve e invia — deve comparire UNA sola chat nella lista, non due.

Non testato dal vivo nel browser (sessione headless, nessun accesso a un browser reale) — verifica visiva sul Pannello dopo il merge consigliata, come per #531.
