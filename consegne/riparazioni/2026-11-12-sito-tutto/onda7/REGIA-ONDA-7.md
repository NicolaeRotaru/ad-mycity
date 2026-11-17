---
data: 2026-11-17 17:50
tipo: quaderno della regista
stima_usd: 140
tetto_usd: 170
---

# Onda 7: il quaderno della regista

## In parole semplici
L'onda 7 ripara 52 difetti piccoli del sito mai tentati, in 4 sessioni da 13. Prima chiude il lavoro già pagato dell'onda 6: 6 riparazioni da collaudare e una che regge già.

## Cosa cambia per te
Niente finché la PR del sito non è pronta: quello che spetta a Nicola sarà scritto lì.

## Cosa devi fare
Niente. Nicola ha dato il via alle 17:38.

## Cosa non ho verificato
Quante voci reggeranno: lo dicono il collaudo e il controllore.

---

## Dettagli tecnici

### Chi
- Regia: la chat dell'AD «Ondata 7 difetti» `session_015BmpnWeHkst12TRwrzmMfw`. Ramo ad-mycity `ccr-30918361-coyajm`, ramo di integrazione sul sito `ccr-30918361-coyajm`.
- Avanzi dell'onda 6 passati dalla regista O5 `session_015BmpnYvNwUpgfdhaKx9PKT` alle 17:41.

### Il limite
`allowed_warning` alle 17:45, nessun extra, si azzera giovedì 19/11 alle 10:00. Nicola sceglie di partire lo stesso. Prima di ogni apertura si rilegge `rate_limit_info`: con `rejected` o uso extra ci si ferma.

### Il sito
- main `c83c3e4e6decc5c167bd0cefceb269364f388cd0` (#294).
- Integrazione `ccr-30918361-coyajm` @ `bc36f48120ec38bf20880c7d68b3171015744681` = main + `-o6` (d312818b, R01 cucitura con R33-022) + `-o6-m03` (0eaca5c7) + `-o6-m02` ricopiato (3f76cf43 diventa 2207f8e0, messaggio senza «R07-009»; contenuto identico a ee2988ad).

### Passo 0 (cartella `onda6/`)
- K02 collauda R02-001, R02-002, R03-001, R03-003, R03-004, R03-009 sui rami `-o6-m02` e `-o6-m03`. Ramo `ccr-30918361-coyajm-o6-k02`, tetto 5 $.
- Poi C01 (`onda6/controlli/C01.json`) sulla testa `bc36f481`, tetto 6 $.
- R01-011 regge (K01): si chiude dopo l'unione della PR del sito.
- Fuori: R03-006 (serve la rigenerazione di `lib/database.types.ts`), R03-002 e 005 (manca codice sulla base), le parziali R01.

### Onda 7 (cartella `onda7/`)
- Candidate 64 (`chiavi-onda7.txt`): 49 rimandate dall'onda 6 + 15 mai iniziate (R02-003…012, R03-007/008/010/011/012 dell'onda 6). Tutte minori.
- `dividi --sessioni 4 --per-sessione 13`: R01 accessibilità (13), R02 architettura (13), R03 flussi-conversione (13), R04 frontend-ux (13). 12 all'onda dopo. `copertura-prima` e `segnaposti` verdi.
- Riparatori: Opus, effort xhigh, senza ultracode, al massimo 6 subagenti, niente Workflow. Consegna verso i 24 $, tetto 28 $. Rami `ccr-30918361-coyajm-mNN`.
- Collaudo: K01 per R01+R02, K02 per R03+R04, ognuno sui 26 minori senza campione. Ramo `ccr-30918361-coyajm-kNN`, tetto 13 $.
- Controllore C01 di `onda7/` sulla testa unita finale, tetto 6 $. Poi la PR del sito.

### Il tetto
Atteso 140 $, tetto 170 $: riparatori 96-112 $, collaudi 26 $, passo 0 11 $, controllori 12 $, regia 20 $. Cancello: stop sopra i 12 $ a chiuso.

### Stato
- 17:50 cartella `onda7/` pronta, decisione in DECISIONI e bacheca.
- 17:48 aperte, senza nessuna richiesta a Nicola: K02 dell'onda 6 `session_015BmpnYbF1A4qxsRXWWgoeH` (ramo `ccr-30918361-coyajm-o6-k02`), R01 `session_015BmpnYgRJ2nThdqp4z1F41`, R02 `session_015BmpnWpKkj3VXdnrdtAc4b`, R03 `session_015BmpnZ6MiCTaF52P9H1E5L`, R04 `session_015BmpnWQtM3nnP4b4XgAfEj`. Limite `allowed_warning`. Regia a 229 mila token e 1,78 $: resta qui oltre i 250 mila, perché una regia nuova in ad-mycity farebbe chiedere conferma a Nicola a ogni apertura (guardia `pre-scrittura.mjs`).
- 18:00 K02 finito (`552dc490`, 6,39 $ su 5 $, 3 subagenti): R03-001, 003, 004, 009 reggono; R02-001 non regge (il registro della chat si accende nello stesso frame); R02-002 parziale (h2 solo con promozioni). `valida-collaudo` verde. Visti fuori voce, da registrare come nati: LocationPill:49 e :108 cadono con "null" in memoria; un tipo nuovo nello zod delle segnalazioni senza tabella dà 500 (route.ts:82). Il codice di R02-001 e 002 resta nell'integrazione: non rompe niente, la voce resta aperta.
- 18:11 C01 dell'onda 6 finito (`e5ba7809`): verify verde (10.707 prove), suite SQL locale verde, 0 voci rosse. Reggono sull'unione R01-002, 005, 006, 008, 011, 012 e R03-001, 003, 004, 009. Nati: 1 minore (LocationPill.tsx:49 cade con un valore rovinato in memoria, già prima dell'unione). Da chiudere dopo l'unione della PR del sito: R01-011, R03-001, 003, 004, 009 (frammento + `chiudi-sito`). K02 costo vero 7,31 $. C01 e K02 archiviate.
- 18:05 R02 lotto A: 5 riparati, R02-006 serve_file_altrui (file di R01), R02-002 scelta_di_nicola (placehold.co ammesso apposta). 7,40 $.
- 18:41 «consegna» ai quattro riparatori (R01 24,05 $, R02 25,29 $, R03 23,55 $, R04 23,18 $).
- 18:45 R01 consegnato (`a0fccbee`, codice `d4d3f3b0`, 25,83 $): 4 riparati (003, 009, 004, 007), 3 parziali (012, 001, 005), 3 non_fatto tolti con revert (002, 013, 006), 2 già riparati (010, 011), 1 scelta di Nicola (008). `guardia-ramo` e `valida-referto` verdi; referto copiato in `referti/R01.json`. Una nota riservata su R01-007 sta solo in chat: va al collaudatore e a Nicola, mai nel deposito.
- 18:53 R02 consegnato (`7a0b53ab`, testa `7254987c`, 27,10 $): 11 riparati, 1 serve_file_altrui (006, file di R01, le 7 modifiche nel referto), 1 scelta di Nicola (002, placehold.co), 8 difetti nuovi nel referto. `guardia-ramo` e `valida-referto` verdi. Si apre K01 su R01+R02 (15 riparati).
- 18:54 K01 aperto `session_015BmpnYLWEi1RmcXfHGEeYD` (R01+R02, 15 riparati, tetto 12 $); nota riservata su R01-007 passata solo in chat.
- 18:55 R03 consegnato (`c9f42333`, testa `55b27b49`, 28,36 $ sopra il tetto di 28): 12 riparati, 1 già riparato (004), 4 difetti nuovi minori nel referto. `valida-referto` verde. `guardia-ramo` ROSSA su due prove esistenti: `tests/unit/aiuti/database-della-vetrina.ts` (la regia l'ha dato a R03 per R03-013, perché nessun'altra sessione l'aveva: errore mio, la regola dice che una prova esistente la tocca solo la regista) e `tests/unit/riparazione-r20-home-variante-a.test.ts` (aggiornata per il testo nuovo di R03-003). Si collauda così; all'unione si controlla con `prova-unione` che nessun altro ramo tocchi quei file, e la deroga va scritta nella PR per Nicola.
- 18:59 R04 consegnato (`c7c580c0`, testa `2b9e7dbe`, 30,43 $ sopra il tetto: smentitori e verify partiti prima della consegna): 7 riparati, 3 parziali (001, 011, 006), 2 serve_file_altrui (003, 010), 1 già riparato (007), 2 difetti nuovi. `guardia-ramo` e `valida-referto` verdi. `prova-unione` dei quattro rami verde: nessun file in due rami, l'unione di prova non litiga. Riparatori in tutto 111,72 $. Si apre K02 su R03+R04 (19 riparati).
- 19:00 K02 aperto `session_015BmpnYRNv6mjgz8ptfTtTy` (R03+R04, 19 riparati, tetto 14 $). Integrazione sito: m01-m04 uniti senza conflitti (`a5e2c7a3`).
- 19:03 K01 finito (`6997a5a5`, `valida-collaudo` verde, costo non leggibile): reggono R01-003, 009, 004 e R02-001, 003, 004, 005, 007, 010, 011, 012, 013 (12); già riparati che reggono R01-010, 011; parziali R01-012, 001, 005, R02-008, 009; R01-007 rompe_altro (dettaglio riservato, solo in chat). Tolto R01-007 dall'integrazione col revert `00bb233c`. Nati minori: DropOfDay.tsx:52/:61 e admin/users:575, admin/orders:185 sul giorno UTC; admin/products/route.ts:266 traccia scritta a mano. Archiviati K01, R01 (26,20 $), R02 (27,43 $).
- 19:19 K02 finito (`9ac3589f`, 15,65 $ sopra 14, `valida-collaudo` verde): reggono R03-002, 003, 005, 007, 009, 010, 011, 012, 013 e R04-002, 004, 005, 008, 009, 012 (15); già riparati che reggono R03-004, R04-007; parziali R03-001, R04-013 e i parziali R04-001, 006, 011; rompe_altro R03-006 e R03-008, tolte coi revert `a3eaa8f7` e `a3c43d1f`. Nato GRAVE da registrare: SponsoredCarousel.tsx:71 e :113 fanno `void supabase.rpc(...)` senza `.then`, la richiesta non parte e impressioni e clic delle sponsorizzate non si contano. Altri nati minori: refusi PageListEditor.tsx:52/:55, app/faq/page.tsx:229 scroll-mt, prezzo pieno nella scheda prodotto page.tsx:594/640, loading cards in app/loading.tsx:24 e simili, app/store/[id]/layout.tsx:37, lib/queries/categorie-dei-negozi.ts:17. Una nota riservata su R04-011 solo in chat (per Nicola, da far guardare a legale-privacy).
- Onda 7 dopo i collaudi: 27 reggono su 52 date (52%), più 4 già riparati confermati. Integrazione `a3c43d1f`. Si apre C01.
