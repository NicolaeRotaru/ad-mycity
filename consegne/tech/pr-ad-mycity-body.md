## Summary
- **Parla casella:** il browser non manda più il prompt gigante a `/api/lavori` — nuova route `/api/lavori/casella` costruisce la richiesta lato server (payload compatto).
- **Supabase:** sanitizzazione testo prima dell’insert (`NUL` / surrogate isolati) + blocco se il JSON verso PostgREST sarebbe vuoto — previene `PGRST102`.
- **Test:** `store.sanitize.test.mts` (2 asserzioni).

## Perché
Nicola inviando da «Parla con questa azione» riceveva `PGRST102 Empty or invalid json` — il lavoro non entrava in coda e l’AD non rispondeva da quella casella.

## Come provare
1. Mergia la PR → attendi deploy Vercel (~2 min).
2. Apri una card **Da approvare** → **Parla con questa azione**.
3. Scrivi un messaggio breve e premi Invia — **niente** avviso giallo; compare la risposta dell’AD.
4. Ripeti da **Diretta contenuti** su una casella qualsiasi.
