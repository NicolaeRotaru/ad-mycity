---
data: 2026-11-06 19:17
tipo: piano
fonte: radiografia in 12 sessioni, §10 del prompt
---

# Il piano della palestra, da firmare

## In parole semplici

La palestra è una copia del sito fatta solo per le prove. Lì si usa il sito come tanti clienti, negozi, fattorini e amministratori insieme, fino al limite. Il sito vero non si tocca mai.

Un esempio. Un cliente finto ordina pane in contanti, il negozio finto accetta, il fattorino finto consegna e fotografa i soldi. Poi l'amministratore finto vede il versamento. Oggi questo giro intero non l'ha mai fatto nessuno.

## Cosa cambia per te

- Le 533 prove scritte dalla radiografia diventano prove fatte, a lotti, in circa tre giorni.
- Il costo principale è il database di prova: circa 0,32 $ al giorno, solo mentre è acceso.
- Tre giorni da 8 ore costano circa 0,32 $ in tutto, più l'uso di Vercel.

## Cosa devi fare

Firmare o correggere questo piano, con la carta 232. Senza la tua firma non si crea niente.

## Cosa non ho verificato

- Il prezzo del database di prova l'ho letto il 6/11: va ricontrollato il giorno che parte.
- L'uso di Vercel sotto carico pesa sul piano del sito vero, e non l'ho misurato.

## Dettagli tecnici

**Cosa si crea.**
- Un rilascio di anteprima su Vercel, mai di produzione.
- Un ramo di prova del database su Supabase, taglia Micro.
- Stripe in modalità test.
- Una casella email di prova.
- Le chiavi di prova di Cloudflare Turnstile.

**Dove vivono le variabili.** In un progetto Vercel separato, che consiglio. Oppure sul progetto vero, ma solo per l'ambiente Preview di un ramo dedicato. Mai per Production, mai per tutte le anteprime.

**Le variabili, solo per nome.**
- Database del ramo di prova: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Indirizzo della palestra: `NEXT_PUBLIC_APP_URL`.
- Stripe di test: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CONNECT_WEBHOOK_SECRET`, `STRIPE_CONNECT_CLIENT_ID`.
- Casella di prova: `RESEND_API_KEY`, `RESEND_FROM`.
- Turnstile di prova: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`.
- Segreti nuovi, mai quelli veri: `CRON_SECRET`, `INTERNAL_API_SECRET`, `UNSUBSCRIBE_SECRET`, `MIDDLEWARE_CACHE_SECRET`, `RECUPERO_PASSWORD_SECRET`, `EDGE_TRUST_SECRET`.
- Un Redis a parte: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
- Tetto dell'intelligenza artificiale: `AI_GLOBAL_DAILY_BUDGET_EUR`.
- Vuote di proposito: PostHog, Sentry, notifiche push e Google Analytics.

**L'intelligenza artificiale.** Non ha chiavi di prova. Le strade sono due:
- un fornitore finto, che consiglio, a costo zero;
- una chiave `ANTHROPIC_API_KEY` creata solo per la palestra, con un tetto di spesa in euro scritto qui prima di partire.

**Quanto costa.**
- Ramo del database Micro: 0,01344 $ l'ora. Ogni ora iniziata conta intera.
- Va sulla fattura Supabase come «Branching Compute Hours», e il tetto di spesa non lo copre.
- Vercel: le anteprime sotto carico pesano sul piano Pro del sito vero, da misurare il primo giorno.
- Stripe di test, Turnstile di prova e la casella di prova: 0 €.

**Le prove.** 533, dai 12 referti, tolti i doppioni. Per chi: cliente 145, negozio 137, estraneo 109, amministratore 106, fattorino 36. Elenco: `batteria-palestra.json`.

**Cosa non si prova nemmeno lì.**
- I pagamenti e i bonifici veri: solo modalità test.
- La consegna fisica.
- Le email ai negozi veri.
- Le impostazioni di produzione di Supabase e Vercel, da guardare con Nicola.

**Prima di partire.** Un controllo per nomi e ambiente, mai per valori. Nessuna variabile della palestra vale per Production o è condivisa col sito vero. La palestra non deve poter scrivere sul database vero né mandare email a persone vere. Se una di queste cose non si può provare, non si parte.

Fonti: §10 di `consegne/audit/PROMPT-radiografia-12-sessioni.md`; documentazione Supabase «Manage Branching usage», letta il 6/11.
