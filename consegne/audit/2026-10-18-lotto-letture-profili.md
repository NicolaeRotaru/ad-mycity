---
data: 2026-10-18 20:53
tipo: lotto-riparazione-sito
richiesta: «Sì fai tutte le migrazioni e controlla se le migrazioni sono tutte corrette» (18/10) · scelta «Prima il lotto, poi tutte»
codice: NicolaeRotaru/mycity, ramo ccr-60372c68-p3gpjz, richiesta di unione #259 · base fd895d7 (main dopo la #258)
memoria: richiesta di unione ad-mycity #886
---

# Il lotto che sblocca le 48 migrazioni: il sito legge i negozi dalla vista pubblica

**In due righe.** Tre delle 48 migrazioni che mancano in produzione chiudono la tabella dei profili. Prima di lanciarle, il sito doveva smettere di leggere il negozio da lì. La richiesta #259 lo fa per carrello, cassa, ordini, fattorino, chat, storie, eventi e liste. Dopo che la unisci, servono la copia del database e il tuo sì, poi lancio le 48.

## In parole semplici

Il 18/10 mi hai chiesto di lanciare tutte le migrazioni. Ne ho lanciata una, la 163, e mi sono fermata sulle altre 48. Il motivo: la 110, la 112 e la 161 chiudono la tabella dei profili, e dopo ognuno legge solo la propria riga. Molte pagine del sito prendevano il negozio proprio da lì. Hai scelto «prima il lotto, poi tutte».

Un esempio concreto. Maria ha nel carrello una focaccia di Pane Quotidiano. Senza questo lotto, dopo le migrazioni il carrello le avrebbe mostrato 4,90 € di spedizione, mentre la cassa ne addebita 5,40. Il fattorino avrebbe aperto la consegna senza sapere dove ritirarla.

Tre squadre hanno spostato quelle letture sulla vista pubblica dei negozi: cassa, ordini e fattorino, vetrina. Ognuna l'hanno collaudata due collaudatori che non l'avevano scritta, e tutte e tre sono passate al primo giro. Poi un riesame di tutti i 24 file toccati, con quattro revisori e quattro verificatori. Ha trovato due difetti piccoli nati dal lotto, e li ho corretti. Gli altri difetti c'erano già prima: sono nel registro.

## Cosa cambia per te

| Dove | Dopo le migrazioni, senza il lotto | Con il lotto |
|---|---|---|
| Carrello e cassa | spedizione mostrata diversa da quella addebitata | uguale al centesimo |
| Pagine dell'ordine | «Negozio» al posto del nome, niente telefono | nome, logo e telefono del negozio |
| Fattorino | nessun indirizzo dove ritirare | nome, indirizzo e «Naviga» verso il negozio |
| Chat | il cliente legge «Utente» | il cliente vede a quale negozio scrive |
| Storie, drop, eventi | bolle «?» | solo negozi approvati, col nome |
| Liste e profili pubblici | autore sparito, profilo «non trovato» | letti dal server, solo per chi ha acceso il profilo pubblico |

Se la vista dei negozi non risponde, la bacheca del fattorino, la chat e «Ordina di nuovo» restano in piedi senza il nome del negozio. La pagina della consegna da ritirare invece mostra «Riprova»: lì il negozio è il cuore della pagina.

## Cosa devi fare

- **Unire la richiesta #259 del sito.** Va subito in produzione.
- **Subito dopo, la copia del database:** il passo 0 qui sotto, cinque minuti, con la password che hai solo tu.
- **Poi dirmi «vai».** Lancio le 48 migrazioni nell'ordine dello script e la 163 di nuovo dopo la 127. Poi controllo i cinque punti della verifica.
- **Una scelta, quando vuoi:** la pagina del profilo pubblico mostra nome e cognome, ma l'interruttore promette «badge e bio». Si cambia la frase o si toglie il nome.

## Cosa non ho verificato

- **Il sito vero e il database vero.** Le prove girano su un database ricostruito con tutte le migrazioni e su finti con le regole di oggi. Le regole e i permessi della produzione li ho letti in sola lettura il 18/10.
- **Un browser vero.** Le pagine sono montate nelle prove, non aperte su un telefono.
- **La rotta nuova degli autori delle liste su Vercel:** cache e freno li ho provati solo nelle prove.
- **Le letture che restano rotte.** Il nome del cliente visto dal negozio in chat, quello del fattorino visto dal cliente e le firme di domande e recensioni: oggi sono già vuote per quasi tutti, e restano così. Sono nel registro, fuori da questo lotto.

---

## I passi dopo l'unione

**Passo 0 — la copia, prima di tutto.** In Supabase apri il progetto e premi «Connect». Copia la stringa del **Session pooler**. Ha la forma `postgresql://postgres.clmpyfvpvfjgeviworth:<password>@aws-…pooler.supabase.com:5432/postgres`. Poi, dal tuo computer:

```bash
mkdir -p ~/copie-mycity && chmod 700 ~/copie-mycity
pg_dump --version   # deve dire 17
pg_dump "<stringa del Session pooler>" -Fc -f ~/copie-mycity/mycity-prima-delle-48.dump
ls -lh ~/copie-mycity/
```

Se `pg_dump` non dice 17, con Docker: `docker run --rm -v ~/copie-mycity:/out postgres:17 pg_dump "<stringa del Session pooler>" -Fc -f /out/mycity-prima-delle-48.dump`.

⚠️ La copia sta fuori dalla cartella del sito, sempre: dentro ci sono nomi, telefoni e indirizzi dei clienti. Non va caricata da nessuna parte, né incollata in chat. Tienila qualche giorno dopo le migrazioni, poi cancellala.

Atteso: un file non vuoto. Dimmi solo «copia fatta» e la sua grandezza: la stringa non serve a me.

**Passo 2 — le 48, le lancio io col tuo «vai».** Prima conto in sola lettura cosa manca, per essere sicura che siano le stesse 48. Poi le applico nell'ordine dello script `scripts/applica-migrazioni-mancanti.sh` e le registro come fa lui. La 163 la rilancio dopo la 127.

**Passo 3 — la verifica.** La domanda di controllo della procedura deve dare cinque «vero»: oggi ne dà uno.

---

## Dettagli tecnici

**Ramo e commit** (NicolaeRotaru/mycity, `ccr-60372c68-p3gpjz`, base `fd895d7`):

| Commit | Cosa |
|---|---|
| `778d741` | squadra cassa: `app/cart`, `app/checkout`, `app/shared-cart` leggono `seller_public_profiles` (`fetchSellerPublicMap`, `attachSellerProfiles`); prova `la-cassa-mostra-la-spedizione-che-addebita-coi-profili-chiusi` con la rotta vera dei contanti |
| `afe3835` | squadra ordini e fattorino: `app/orders/**`, `app/rider/**`, `app/messages/**`, `ReorderRail`; nuovi `lib/queries/negozio-dell-ordine.ts`, `lib/queries/controparte-della-chat.ts`; prova `gli-ordini-sanno-il-negozio-con-i-profili-chiusi` (9 pagine, 3 mondi) |
| `ff99456` | squadra vetrina: storie, drop, eventi, «Chi siamo», `/u/[handle]` (client di servizio, filtro `public_profile_enabled`), liste con la rotta nuova `/api/profili-pubblici` (solo `id` e `public_handle`, freno 120/min, al più 50 id) |
| `333fea1` | tre prove chieste dai collaudatori: ordine sospeso in elenco, chat con due negozi, nome alla cassa |
| `f8bd13a` | i due difetti nati dal riesame: vista giù non spegne bacheca e chat (`conNegozioSePossibile`); tetto di 3 s sugli autori delle liste |
| `a5c260c` | il giro senza uscita del fattorino: la consegna dice «Riprova» su lettura caduta; «Ordina di nuovo» torna severo; procedura migrazioni «Stato al 18/10» |

**Collaudi.** Tre squadre, ognuna con lente A («sa diventare rosso?») e lente B («nasce rotto?»): «regge» al primo giro. Correzione `f8bd13a`: due collaudatori, «regge», con un giro senza uscita trovato dalla lente B e corretto in `a5c260c`. Mutazioni sulle correzioni: 9 su 9 rosse.

**Riesame del perimetro** (workflow `wf_709f9433-e0a`): 24 file in 4 dimensioni, 4 revisori + 4 verificatori. 35 segnalazioni, 4 smontate (già nel registro), 2 difetti nati (corretti), 26 c'erano già. Registro del perimetro: 24 file su 24 riguardati dopo l'ultima modifica.

**Cancello locale su `a5c260c`:** `npm run verify` 634 file, 5.602 prove (base 629 / 5.449), lint 0 errori e 78 avvisi come la base; `npm run build` riuscita; prove SQL, migrazione su database pieno, rilascio due volte, database nato prima del registro, `la-158`/`la-159`/`la-160`, `db:check-drift`, `db:types`: verdi.

**Produzione, sola lettura il 18/10.** Su `profiles` vive «Anyone can view approved seller profiles», «Public profile read», «Riders can view buyer of assigned orders», amministratori, propria riga. `anon` e `authenticated` hanno SELECT per colonna su `full_name`, `public_handle`, `public_bio`, `public_avatar_url`, `public_profile_enabled`: leggere `/u/[handle]` col client di servizio non mostra niente in più di oggi.

**Registro dei difetti del sito** (`radiografia-marketplace.json`):
- chiuse le 11 schede della prima ondata entrate in produzione con la #258: R3, R76, R82, R84, R25, R85, R24, R36, R41, R43, R33 (la 163 è lanciata). Le 8 parziali (R55, R71, R77, R81, R70, R57, R53, R13) hanno la nota di cosa manca;
- aggiunte 38 schede: 33 c'erano già, 5 nate dal lotto e lasciate aperte per scelta (negoziante non approvato, negozio sospeso col profilo pubblico, chat con la vista giù, nome sulla bacheca dopo un guasto passeggero, e una sulla cassa coi numeri a zero già presente prima e con un secondo innesco). 1 grave, 37 minori. Aperte 577: 10 bloccanti, 122 gravi, 445 minori;
- da chiudere dopo l'unione della #259, con le prove del lotto: «Dopo le migrazioni il fattorino non vede più dove ritirare…», «Dopo la chiusura dei profili, carrello e cassa mostrano la consegna a 4,90 €…», «Dopo la chiusura dei profili, nelle storie in home, nel Drop del giorno e negli eventi il negozio diventa «?»…», «Se la pagina della consegna non riesce a leggere l'ordine, al fattorino dice «Ordine non trovato»…».

**Le 48 migrazioni, per il passo 2.** In produzione mancano: 091, 092, 093, 094, 095, 096, 098, 099, 107, 109, 110, 111, 112, 113, 119, 120, 122, 125, 126, 127, 128, 129, 130, 131, 134, 135, 140–161 e la 163 da rilanciare dopo la 127. Si applicano nell'ordine di `scripts/applica-migrazioni-mancanti.sh`, ognuna registrata in `supabase_migrations.schema_migrations` con versione e nome. Quindici file portano un loro `BEGIN`/`COMMIT`: 109, 110, 111, 112, 119, 120, 122, 142, 153, 154, 156, 157, 158, 159, 160. Vanno lanciati così come sono, senza una transazione intorno.
