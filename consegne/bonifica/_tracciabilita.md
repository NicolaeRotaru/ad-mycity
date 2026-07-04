# Appendice — Tracciabilità 102 problemi → workstream → fix


Totale: 102 problemi. Ogni riga ha un pacchetto di fix nel file del workstream indicato.


| Sev | Workstream | Problema |
|---|---|---|
| 🔴 | WS-ARCH | Chiunque si registra come "Venditore" è approvato all'istante e pubblica prodo |
| 🔴 | WS-DB-RLS | Auto-accredito illimitato del wallet: qualsiasi utente puo UPDATE profiles.wal |
| 🔴 | WS-DB-RLS | Migrazione 107 rompe gli embed del profilo venditore: le schede prodotto risul |
| 🔴 | WS-DEPLOY | Build di produzione su Render fallisce: NODE_ENV=production fa omettere a `npm |
| 🔴 | WS-PRIVACY | I documenti KYC (carta d'identità, selfie, patente, assicurazione, HACCP) NON  |
| 🔴 | WS-QA | Ordini 'Ritiro in negozio' non raggiungono MAI 'Consegnato': payout venditore  |
| 🟠 | WS-A11Y | Lightbox foto prodotto: dialog senza Esc, senza focus trap e senza navigazione |
| 🟠 | WS-A11Y | SearchBar (ricerca principale): autocomplete senza semantica combobox e senza  |
| 🟠 | WS-A11Y | ProductCard: bottoni interattivi annidati dentro un <a> (nesting interattivo n |
| 🟠 | WS-A11Y | ConfirmDialog globale: focus automatico sul pulsante di conferma + Enter confe |
| 🟠 | WS-AI | Gate di moderazione Trust & Safety costruito ma mai collegato: creazione prodo |
| 🟠 | WS-AI | Rate limiter non durevole (in-memory) proprio sugli endpoint AI piu' costosi ( |
| 🟠 | WS-ANALYTICS-SEC | XSS/HTML-injection via JSON-LD: dati venditore serializzati in <script> senza  |
| 🟠 | WS-ANALYTICS-SEC | Metà del catalogo eventi è definito ma non viene MAI emesso (funnel morti) |
| 🟠 | WS-ANALYTICS-SEC | Acquisti con carta (Stripe) tracciati SOLO al ritorno client su /orders → unde |
| 🟠 | WS-ANALYTICS-SEC | Conversion rate e 'Ordini 30gg' del seller includono ordini annullati/pending |
| 🟠 | WS-ANALYTICS-SEC | Le dashboard traffico admin misurano solo i visitatori che hanno accettato i c |
| 🟠 | WS-ANALYTICS-SEC | Doppia verità sulle 'visite': product_views scritto senza consenso, product_vi |
| 🟠 | WS-API | Le route auth (signin/signup) usano il client Supabase 'browser' come singleto |
| 🟠 | WS-API | reverseOrderTransfer supporta un solo claw-back per ordine: il secondo rimbors |
| 🟠 | WS-ARCH | La guardia "negozio chiuso" esiste solo sul COD, assente sul checkout con cart |
| 🟠 | WS-ARCH | Matematica di creazione ordine duplicata (~200 righe) tra checkout Stripe e CO |
| 🟠 | WS-ARCH | Middleware applica il gate is_approved anche a /admin e /rider, incoerente con |
| 🟠 | WS-DB-RLS | Policy RLS ordini 'rider' senza controllo di ruolo: qualsiasi utente autentica |
| 🟠 | WS-DB-RLS | Over-grant colonne sensibili al ruolo authenticated: KYC/IBAN/codice fiscale/S |
| 🟠 | WS-DB-RLS | Auto-approvazione al signup: role e is_approved presi da raw_user_meta_data co |
| 🟠 | WS-DB-RLS | returns_buyer_insert non validato: il client puo forgiare richieste di reso by |
| 🟠 | WS-DEPLOY | Comando di install del deploy divergente dalla CI: `--legacy-peer-deps` è dich |
| 🟠 | WS-DEPLOY | In produzione i log server spariscono: `logger.warn` non emette nulla né va su |
| 🟠 | WS-DEPLOY | Nessuno step di applicazione migrazioni nel deploy e drift schema non controll |
| 🟠 | WS-DEPLOY | Mittente email di default su dominio non verificato (`no-reply@example.com`):  |
| 🟠 | WS-DEPLOY | Cron critici (payout/email/expiry) su scheduler esterno non-IaC, watchdog auto |
| 🟠 | WS-FRONTEND | Numero WhatsApp assistenza è un segnaposto morto (393000000000) hardcoded in 5 |
| 🟠 | WS-FRONTEND | «Contatta il rider» compone il numero del NEGOZIO, non del rider |
| 🟠 | WS-FRONTEND | Bottone «Invia un messaggio» nella ContactSheet non fa nulla (azione morta) |
| 🟠 | WS-MONEY | Over-refund: refundOrder clampa al TOTALE ordine, non al residuo (+ reversal s |
| 🟠 | WS-MONEY | Finestra di overselling: sessione Stripe (24h) piu' longeva del pending_checko |
| 🟠 | WS-MONEY | Admin cancel di ordine COD/non pagato: nessun ripristino stock ne' storno del  |
| 🟠 | WS-MONEY | Coupon senza riserva atomica: max_uses e first_order_only aggirabili in concor |
| 🟠 | WS-PERF | Catalogo/ricerca senza limite né paginazione: si scarica l'intero catalogo lat |
| 🟠 | WS-PERF | Ordinamento e filtri (rating, sconto, stock, promo, aperti) calcolati in JS su |
| 🟠 | WS-PERF | Scheda prodotto: `select('*')` scarica colonne pesanti mai usate (search_tsv,  |
| 🟠 | WS-PERF | Esperienza di shopping interamente client-rendered: il contenuto non è in SSR  |
| 🟠 | WS-PRIVACY | Sentry (session replay + performance tracing) si carica SENZA gate di consenso |
| 🟠 | WS-PRIVACY | Elenco destinatari/sub-responsabili incompleto: mancano Google (GA4), PostHog  |
| 🟠 | WS-PRIVACY | L'informativa dichiara che ad Anthropic non arriva alcun dato personale dell'a |
| 🟠 | WS-PRIVACY | Beacon /api/track: gli eventi 'auth' impostano il cookie di tracciamento persi |
| 🟠 | WS-QA | Pagamento carta completato DOPO la scadenza del pending_checkout -> oversellin |
| 🟠 | WS-QA | COD multi-negozio: se la riserva stock di un gruppo fallisce, gli ordini dei g |
| 🟡 | WS-A11Y | Menu account Navbar: aria-haspopup="menu" senza role menu/menuitem e senza chi |
| 🟡 | WS-A11Y | Indicatore di focus da tastiera azzerato su alcuni input (focus:outline-none v |
| 🟡 | WS-A11Y | Selettore stelle interattivo (form recensione): manca il gruppo radio e lo sta |
| 🟡 | WS-AI | URL immagine arbitrari accettati e persistiti (catalog-create/bulk) senza vinc |
| 🟡 | WS-AI | Nessun limite di dimensione del body prima di req.json() sulle route AI (press |
| 🟡 | WS-AI | Chat AI open-ended (product-chat/catalog-chat) usabili come proxy di web searc |
| 🟡 | WS-ANALYTICS-SEC | RLS su messages: un partecipante puo' RISCRIVERE il testo dei messaggi (anche  |
| 🟡 | WS-ANALYTICS-SEC | Rate-limit per-IP aggirabile via header X-Forwarded-For falsificato + Turnstil |
| 🟡 | WS-ANALYTICS-SEC | 'Visitatori 24h' calcolato su un fetch troncato a .limit(3000): si rompe silen |
| 🟡 | WS-ANALYTICS-SEC | 'Visitatori unici' conta tutte le categorie di evento con fallback su r.id → i |
| 🟡 | WS-ANALYTICS-SEC | Cookie A/B 'mc_exp_home_hero' impostato per tutti i visitatori senza consenso |
| 🟡 | WS-ANALYTICS-SEC | PostHog $pageview inviato con $current_url = solo path (senza origin) |
| 🟡 | WS-ANALYTICS-SEC | Valore del funnel checkout incoerente: begin_checkout usa il subtotale, purcha |
| 🟡 | WS-ANALYTICS-SEC | search_performed.result_count riflette solo il match sul nome, pre-filtri clie |
| 🟡 | WS-ANALYTICS-SEC | Route /api/track: handler per 'session_start' e 'signup' mai inviati dal clien |
| 🟡 | WS-API | validateCoupon: convalida non atomica (TOCTOU) → over-redenzione max_uses e by |
| 🟡 | WS-API | gift-cards/checkout: idempotencyKey Stripe include Date.now(), quindi non è id |
| 🟡 | WS-API | Nessun timeout esplicito sul client Anthropic né maxDuration sulle route AI co |
| 🟡 | WS-API | Webhook Stripe: consegna duplicata concorrente può incrementare due volte l'us |
| 🟡 | WS-ARCH | Route di auth /api/auth/signin e /api/auth/signup sono dead code e usano il cl |
| 🟡 | WS-ARCH | Il checkout client duplica costanti e logica di spedizione/sconto invece di us |
| 🟡 | WS-ARCH | lib/order-status.ts (modulo di dominio) importa icone lucide-react, accoppiand |
| 🟡 | WS-ARCH | deliveryWindow usa il fuso locale del runtime (setHours), incoerente con romeN |
| 🟡 | WS-ARCH | Race TOCTOU sull'uso dei coupon: validazione e incremento sono separati nel te |
| 🟡 | WS-DB-RLS | messages_update_read consente al destinatario di riscrivere il body dei messag |
| 🟡 | WS-DB-RLS | subscription_orders: policy FOR ALL permette al seller di modificare le righe  |
| 🟡 | WS-DB-RLS | coupons: lettura pubblica dell'intera tabella -> enumerazione dei codici scont |
| 🟡 | WS-DEPLOY | Health check dà falsa fiducia: verifica solo 3 env e ignora le variabili criti |
| 🟡 | WS-DEPLOY | render.yaml è un manifest env incompleto: mancano variabili usate da funzioni  |
| 🟡 | WS-DEPLOY | Source map Sentry non caricate: mancano SENTRY_AUTH_TOKEN/ORG/PROJECT nel depl |
| 🟡 | WS-FRONTEND | useSearchParams senza boundary Suspense sulla pagina custom del negozio |
| 🟡 | WS-FRONTEND | Checkout con carta non geocodifica l'indirizzo: ordini con coordinate consegna |
| 🟡 | WS-FRONTEND | «Ripeti ordine» perde la variante scelta (taglia/colore) |
| 🟡 | WS-FRONTEND | returnTo perso nel percorso registrazione: l'ospite non torna al checkout |
| 🟡 | WS-FRONTEND | window.confirm/prompt nativi in flussi rider/venditore/admin nonostante esista |
| 🟡 | WS-FRONTEND | Form checkout nascosto + submit esterno: indirizzo salvato con campo obbligato |
| 🟡 | WS-FRONTEND | Filtro «spedizione gratis» ignorato quando si imposta un prezzo minimo, ma il  |
| 🟡 | WS-MONEY | Effetti collaterali non idempotenti su retry/doppia consegna del webhook (coup |
| 🟡 | WS-MONEY | Race charge.refunded vs payout in-flight (PROCESSING): venditore pagato senza  |
| 🟡 | WS-MONEY | Compenso rider non recuperato su rimborso pieno / chargeback |
| 🟡 | WS-MONEY | Il webhook non verifica payment_status='paid' ne' amount_total della sessione |
| 🟡 | WS-PERF | Pagina 'Vicino a te': scarica tutte le recensioni negozio e le aggrega in Java |
| 🟡 | WS-PERF | ProductGrid: waterfall sequenziale prodotti → profili venditore su ogni superf |
| 🟡 | WS-PERF | next/image `unoptimized` in tutto il sito: niente srcset/DPR, l'attributo `siz |
| 🟡 | WS-PERF | Scheda prodotto: query recensioni senza LIMIT |
| 🟡 | WS-PERF | Cron carrelli abbandonati: N+1 (una query profilo per ogni candidato, in serie |
| 🟡 | WS-PERF | Cron invio email: getUserById + update per riga, tutto in serie |
| 🟡 | WS-PERF | Pagina risultati ricerca: `ilike '%term%'` solo su name invece dell'FTS già pr |
| 🟡 | WS-PRIVACY | Il cookie di consenso mc_consent è impostato senza il flag Secure |
| 🟡 | WS-PRIVACY | L'export 'Scarica i miei dati' omette i log comportamentali (activity_events), |
| 🟡 | WS-PRIVACY | Identità del Titolare con dati segnaposto (P.IVA IT00000000000, indirizzo fitt |
| 🟡 | WS-QA | Enforcement del limite d'uso coupon non atomico (over-redemption) |
| 🟡 | WS-QA | Il venditore puo acquistare i propri prodotti: volumi di vendita e ranking fal |
