---
data: 2026-11-13 01:29
tipo: giudizio-codice
codice: NicolaeRotaru/mycity @ db5164c5 (main del 5/11, quello pubblicato)
richiesta: giudizio sulla qualità del codice del sito, chiesto da Nicola in chat il 13/11
fonte: misure fatte da programma + tre senior in sola lettura (platform-infra, security, backend-dev) + il mio giudizio
---

# Il codice del sito ha basi da professionista, ma la parte che muove i soldi è cresciuta troppo

## In parole semplici

Mi hai chiesto se il codice del sito è scritto bene, come lo scriverebbe un professionista. Non volevi la lista dei difetti: volevi un giudizio.

La risposta breve: le fondamenta sì, il cuore no.

Le fondamenta sono da professionista.
- C'è un solo portiere che controlla tutte le richieste.
- I conti si fanno in centesimi, senza arrotondamenti strani.
- Le prove automatiche sono 8.886 e passano tutte in 4 minuti.

Il cuore è la parte che crea gli ordini e muove i soldi. Lì il codice è cresciuto in pochi file enormi. Il più grande, quello dei bonifici ai negozi, ha 2.074 righe. Un file normale del sito ne ha 123.

Un esempio vero, scritto dentro il codice stesso. Il calcolo di quanto paga il cliente esisteva in due copie: una per i contanti e una per la carta. Almeno tre volte è stato riparato in una copia sola. Così il cliente pagava un importo diverso a seconda di come pagava. Oggi il calcolo dei prezzi è unico. Gli altri controlli prima dell'ordine invece sono ancora doppi.

Detto in altre parole: chi ha scritto il sito è attento e preparato, ma ha costruito di corsa. Il sito funziona. Però ogni modifica alla cassa costa circa il doppio del giusto, e può rompere un caso senza che nessuno se ne accorga.

## Cosa cambia per te

- **Prima di domenica 15/11 il codice non va riscritto.** Contano due cose sole. La prima: chiudere i 6 bloccanti già scritti nel registro. La seconda: aggiornare quattro librerie, cioè pezzi di codice scritti da altri che il sito usa, perché hanno falle note.
- **Le tre falle critiche delle librerie le ho fatte guardare una per una.** Due non si possono sfruttare sul nostro sito. La terza si può sfruttare solo in teoria e farebbe poco danno. Quindi non c'è un'urgenza da notte, ma vanno chiuse. L'aggiornamento resta dentro le stesse versioni principali, quindi è piccolo.
- **Dopo il lancio il codice va riordinato in tre punti:** come nasce l'ordine, come si controllano gli accessi, come il codice parla col database. Finché non si fa, ogni funzione nuova sulla cassa costa il doppio.
- **Il catalogo è lento per chi arriva da Google.** Un senior stima tra mezzo secondo e un secondo in più sulla pagina di una categoria. Oggi non si nota, perché i visitatori sono pochi. Si noterà quando cresceranno.

## Cosa devi fare

- **Dirmi se vuoi l'aggiornamento delle quattro librerie prima del 15/11.** Lo prepara il senior tech in un ramo separato, e l'unione resta tua.
- **Decidere se aprire il riordino della cassa dopo il lancio.** Sono lavori da più giorni. Te li porto come piano con i costi: non li avvio da sola.
- **Leggere la nota di sicurezza che ti scrivo solo in chat.** È di gravità media, e i dettagli non vanno nel deposito.
- **Firmare l'unione di questa richiesta.** Contiene solo questo referto e tre righe nella memoria.

## Cosa non ho verificato

- **I tempi veri del sito in produzione.** I secondi sul catalogo sono stime di un senior, non misure.
- **Le impostazioni vere di Supabase, Vercel e Stripe.** Ho letto solo il codice. Le regole del database le ho viste negli aggiornamenti scritti nel deposito, non nel database vivo.
- **Il peso delle pagine.** Non ho potuto costruire il sito senza le chiavi vere. L'ultima misura è del 17/8.
- **Tutto il codice.** I senior hanno letto un campione scelto apposta. Della rotta dei contanti hanno letto circa 450 righe su 1.805. Delle 72 rotte che usano la chiave che scavalca i permessi, ne hanno controllate 10.
- **Quanto fidarsi dei voti.** Sono un giudizio di tre senior e mio su un campione, non una misura come le prove. Ho riaperto a mano undici punti citati dai senior, e reggevano tutti. Confidenza: circa tre su quattro.

## I cinque voti

| Aspetto | Voto | Perché, in breve |
|---|---|---|
| Mestiere | **6** su 10 | Fondamenta solide. Il cuore dei soldi è scritto a mano in file enormi, e in parte due volte. |
| Falle | **4** su 10 | Nel registro restano 6 bloccanti e 96 gravi. Tre dei sei bloccanti riguardano il modo di pubblicare il sito, non il codice. I tre senior non ne hanno trovati di nuovi gravi. |
| Velocità ed efficienza | **6** su 10 | Oggi va bene, 7: le pagine più visitate sono già veloci. Con dieci volte i visitatori, 5: il catalogo si carica dal telefono, una richiesta dopo l'altra. |
| Facilità di lavoro, anche per me | **5** su 10 | Le prove girano in 4 minuti e i nomi sono chiari. Però ci sono file giganti, commenti lunghi come un diario, e il controllo dei tipi non vede il database. |
| Sicurezza | **6** su 10 | Gli schemi sono giusti. Ma quasi tutte le rotte si difendono con una riga scritta a mano, e alcune librerie hanno falle note da chiudere. |

**La media è 5,4 su 10.** In una frase: è il codice di una persona brava che ha corso, non quello di una squadra che ha avuto il tempo di riordinare.

Sul voto «facile per me» il senior dell'architettura ha dato 4. Io do 5, per un motivo concreto. Quando cambio qualcosa, in 4 minuti le prove mi dicono se ho rotto un comportamento. Questo vale molto.

## Le cinque correzioni, in ordine di ritorno

1. **Aggiornare le quattro librerie con falle note.** È piccolo, e si fa prima del lancio.
2. **Far nascere l'ordine in un colpo solo dentro il database, e prepararlo in un posto unico per contanti e carta.** Oggi l'ordine nasce in quattro passi separati. Se il terzo fallisce, un annullamento scritto a mano deve disfare i primi due, e a volte fallisce anche lui. Con un colpo solo, l'ordine «nato a metà» non può più esistere.
3. **Far passare le richieste di negozi e clienti dalle regole del database.** Oggi la difesa è una riga di controllo scritta a mano in ogni rotta. Basta dimenticarla una volta, e un negozio vede i dati di un altro. Serve anche una prova che diventi rossa quando una rotta nuova scavalca le regole senza motivo.
4. **Collegare il controllo dei tipi al database, partendo da ordini e pagamenti.** Oggi una colonna rinominata si scopre solo in produzione. È già successo: l'esportazione dei dati di un cliente usciva senza gli ordini e diceva che era andata bene.
5. **Rendere veloce il catalogo.** La griglia dei prodotti deve arrivare con una richiesta sola, tenuta pronta per un minuto. La cassa deve fare le sue richieste insieme, non una dopo l'altra.

Le correzioni dalla 2 alla 5 vanno dopo il lancio. Nessuna fa incassare di più nelle prime settimane. Abbassano il costo e il rischio di ogni modifica che verrà dopo.

---

## Dettagli tecnici

**Codice guardato:** `NicolaeRotaru/mycity` @ `db5164c5`. Sola lettura: nessun file del sito modificato.

**Misure fatte da programma (zero agenti)**
- `npm run typecheck`: 0 errori in 51 s, con `strict: true`. `npm run lint`: 0 errori, 63 avvisi (quasi tutti `jsx-a11y`), 13 s.
- `npx vitest run`: 1.196 file e 8.886 casi passati, 1 saltato, 4 min 10 s. L'uscita stampa centinaia di righe di log durante le prove.
- Sorgente (esclusi prove, tipi generati, script): 849 file, 154.282 righe. Prove: 1.238 file, 176.153 righe. Migrazioni SQL: 178.
- File oltre 300 righe: 133; oltre 500: 53; oltre 1.000: 8. Mediana: 123 righe. I più grandi: `lib/stripe/payout.ts` 2.074 · `app/api/orders/cod/route.ts` 1.805 · `app/checkout/page.tsx` 1.769 · `app/product/[id]/page.tsx` 1.486 · `components/seller/ProductForm.tsx` 1.301 · `app/admin/users/page.tsx` 1.291.
- Scorciatoie: `as unknown as` 135, `any` 19, `as any` 5, `@ts-ignore` 2, `eslint-disable` 66, TODO 0.
- Codice ripetuto (finestre di 12 righe normalizzate, script locale): 1,2%, concentrato in `app/category/[slug]/page.tsx` e `app/search/page.tsx`.
- Rotte API: 107. Con un `with*Auth`: 90. Senza: 17, tutte pubbliche per scelta giusta (verificato dal senior security). Con zod: 37. Con limite di richieste: 72.
- `getAdminSupabase(` in 99 file, di cui 72 in `app/api`. `supaUtente` in 1 rotta (`app/api/seller/products/[id]/route.ts:91`).
- Pagine: 118, di cui 101 `'use client'`; 79 di queste fanno `.from(` dal browser. File `'use server'`: 0.
- Prove che leggono il sorgente come testo (`readFileSync`): 386 file.
- `npm audit --omit=dev`: 3 critiche, 5 alte, 12 medie, 2 basse. `npm outdated`: 26 pacchetti su 45 indietro di una versione maggiore (fra gli altri stripe 16→23, react 18→19, next 15→16, zod 3→4).

**Mestiere e architettura — 6/10, facilità 4/10 (senior platform-infra)**
- Bene: il portiere unico `lib/api/middleware.ts:141-281` (limite per IP a :166, provenienza a :183, 503 distinto da 401 a :229 e :271). I prezzi da una funzione pura condivisa, `lib/ordini/prezzi.ts:257`, usata anche in `app/api/stripe/checkout/route.ts:681`. Le chiavi di idempotenza Stripe in `lib/stripe/payout.ts:349, 526, 623, 1721`. Il formato degli errori `lib/api/responses.ts:13-74` è usato da 94 rotte su 107.
- Male: la creazione dell'ordine in contanti non è atomica (`cod/route.ts:1233-1290`), e il ripristino a mano `:1157-1224` può fallire a metà. La lettura del catalogo `cod:773-799` è ripetuta in `stripe/checkout:236-261`, e la divergenza passata è ammessa in `stripe/checkout:676-679`. I client sono senza `<Database>` (`lib/supabase/server.ts`): `lib/database.types.ts` è importato da 5 file, e `lib/db-rows.ts:12-17` ammette 310 errori a collegarli. `app/checkout/page.tsx:83` è un componente solo, con 22 `useState` e 6 query dal browser. Commenti: 26% del sorgente, circa 41% nei file dei soldi. `README.md:91` è fermo alle migrazioni «001→037».
- Prove: circa 80% dei casi esegue codice e circa 7% cerca solo parole (stima con ricerche di testo). Contro un database vero ci sono solo 2 prove d'integrazione, più 44 prove RLS su PostgreSQL.

**Sicurezza — 6/10 (senior security)**
- Bene: il webhook verifica la firma sul corpo grezzo (`app/api/stripe/webhook/route.ts:52-53`) e rivendica ogni evento una volta sola (:75-87). RLS è accesa su 78 tabelle su 78 secondo le migrazioni. La colonne permesse e la macchina a stati sugli ordini sono in `migrations/114_hardening_radiografia.sql:61-125`. CSP con nonce e `strict-dynamic`, HSTS di 2 anni (`middleware.ts:274-307`, `next.config.js:12-29`).
- Male: la chiave di servizio è la norma (72 rotte contro 1). Esempi del filtro per proprietario fatto nel codice: `app/api/orders/[id]/cancel/route.ts:33-51`, `app/api/seller/orders/[id]/reject/route.ts:40-64`. Il controllo notturno sulle migrazioni confronta i nomi, non il contenuto (la migrazione 161 racconta 27 regole riaperte il 9/9). `lib/api/corpo.ts:114` restituisce `any`.
- Avvisi delle librerie: l'avviso SVG di next non ci tocca (`dangerouslyAllowSVG` assente, e le immagini su Vercel). DOMPurify non ci tocca (`lib/sanitize-html.ts:38-45`, niente `IN_PLACE`). Sentry ci tocca solo in teoria (`tunnelRoute: '/monitoring'`, `next.config.js:114`), con impatto basso. Versioni corrette: next ≥ 15.5.28, @sentry/nextjs ≥ 10.75.2, dompurify ≥ 3.4.17, sharp ≥ 0.35.5.
- Una nota di gravità media resta fuori dal deposito: è nella chat del 13/11.

**Ottimizzazione — 6/10: oggi 7, con dieci volte i visitatori 5 (senior backend-dev)**
- Bene: il portiere non chiama il database per i visitatori anonimi (`middleware.ts:399, 406`). La home è letta sul server, con 60 s di memoria (`app/page.tsx:124-134`). La scheda prodotto è letta sul server (`app/product/[id]/layout.tsx:88, 143`). I cron lavorano a lotti (`release-payouts/route.ts:30`, `expire-stale-orders/route.ts:109`).
- Male: `export const dynamic = 'force-dynamic'` per tutto il sito (`app/layout.tsx:95`), a causa del nonce della CSP, e i `revalidate` delle pagine non contano (lo ammette `app/product/[id]/layout.tsx:83-87`). La categoria fa 5 attese in fila dal browser (`app/category/[slug]/page.tsx:42-71, 330-350`, `lib/queries/griglia-prodotti.ts:159, 228-235`, `components/ProductGrid.tsx:341-347`). La cassa fa 4 attese in fila (`app/checkout/page.tsx:154, 189, 214, 247`). `auth.getUser()` è chiamato in 51 file di pagina. Le recensioni sono scaricate fino a 500 righe (`app/product/[id]/page.tsx:200-202`) anche se esiste `product_rating_stats`.

**Cosa NON entra nel registro (regola ⑳: oltre 100 minori aperti)**
- `tests/unit/i-passaggi-di-stato…test.ts:82` confronta le regole con la migrazione 114, ma la funzione è stata ridefinita nelle 127 e 179. Oggi il contenuto è identico, quindi è un minore latente.
- Gli indici `orders_payout_status_created_idx` e `orders_seller_created_idx` nascono nelle migrazioni 124 e 126: in produzione potrebbero mancare. È un'ipotesi, non verificata con EXPLAIN.

**Il conto:** 3 senior, circa 397.000 token (121.000 + 136.000 + 140.000), più le misure da programma. È sotto il limite di 12 agenti e 2 milioni di token della regola ⑱. La modalità estesa era accesa, ma non ha allargato il lavoro (regola ㉑).
