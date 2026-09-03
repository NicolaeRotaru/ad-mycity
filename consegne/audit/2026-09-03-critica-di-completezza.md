---
data: 2026-09-03 09:40
tipo: critica-di-completezza
oggetto: radiografia totale del sito del 3/9/2026
autore: internal-audit (terza linea, indipendente da chi ha fatto la radiografia)
---

# La radiografia ha guardato bene dove ha guardato, ma dichiara di aver guardato tutto e non è vero

## In parole semplici

Non ho cercato difetti nel sito. Ho controllato **la radiografia stessa**: dove non ha
guardato, quali prove non reggono, e dove il referto dice più di quanto ha in mano.

Il lavoro sotto è serio, e questo va detto per primo. Tutti e 361 i problemi vecchi del registro sono stati ricontrollati due volte a testa, e le due volte hanno sempre dato lo stesso verdetto. Dei 67 problemi gravi, 58 hanno una prova che è stata fatta girare davvero.

Ma tre cose non tornano. **Prima:** il riepilogo scrive «lenti scoperte: nessuna», e non è vero. Delle 93 porte del sito, 29 non le nomina nessuno. Delle 20 rotte dell'intelligenza artificiale, 11. **Seconda:** dei 184 problemi nuovi, 127 non li ha riletti nessun secondo lettore. **Terza:** su otto problemi vecchi il ricontrollo dice «riparato» e un cercatore dello stesso giorno dice «c'è ancora». Nessuno ha messo d'accordo i due. Il riepilogo ha contato zero di questi scontri.

Un esempio di cosa vuol dire. Fra le porte che nessuno ha aperto c'è il lavoro notturno che rifà il conto dei contanti incassati ieri dai fattorini. Il commento dentro quel file dice che senza di lui «il fattorino si vede un ammanco che non ha». Se sbaglia il conto, sbaglia in euro, verso una persona con un nome. Nessuna delle 24 lenti l'ha guardato, e nessuna ha detto di non averlo guardato.

## Cosa cambia per te

Il numero «184 problemi nuovi» e il numero «175 riparati» sono buoni numeri, ma non sono
un certificato di copertura. **Quello che è stato guardato è stato guardato bene.** Quello che non è stato guardato non compare da nessuna parte come mancante. Se
firmi il referto così com'è, porti in memoria una copertura che il sito non ha.

Il buco che costa di più è la cassa dei contanti e le rotte dell'intelligenza artificiale:
sono i due posti dove un difetto esce in euro veri, e nessuna delle 24 lenti li ha aperti.

## Cosa devi fare

- **Non firmare la frase «lenti scoperte: nessuna».** Va sostituita con il conto vero:
   29 porte del sito su 93 mai aperte, 102 migrazioni su 145 mai nominate.
- **Fai correggere due frasi del referto** prima che esca (quali, sotto al punto ③).
- **Decidi se vuoi il pezzo che manca davvero**: non altre lenti, ma un giro col sito
   pieno di dati veri. Costa mezza giornata e il materiale c'è già (cartella `seeds/`).
- **Fai riconciliare gli otto scontri** fra chi ha ricontrollato e chi ha cercato: un'ora.

## Cosa non ho verificato

Non ho fatto girare nessuna delle prove: ho letto i comandi e sono andato a leggere il
codice a mano. Quindi quando dico «questa prova non regge» dico che **a leggerla** non può
diventare rossa, non che l'ho vista fallire. Non ho aperto il sito pubblicato. Non ho
toccato niente in `/home/user/mycity`. Non ho riletto i 117 problemi minori uno per uno:
ho controllato solo il loro tipo di prova, contandoli.

---

## Dettagli tecnici

Base di partenza: `radiografia/sintesi/conti.json`, `radiografia/sintesi/nuovi.json` (184
schede), `radiografia/g1/*.json` + `radiografia/g2/*.json` (24 + 12 referti),
`radiografia/riverifica/*.json` + `radiografia/risultati/riverifica*.json` (361 schede
vecchie), `radiografia/runtime/findings-runtime.json`, `radiografia/sintesi/bozza-report.md`.
Codice: `/home/user/mycity` al commit dichiarato `4f446aa`, letto in sola lettura.

---

# ① ZONE CIECHE

## Come le ho trovate

Ho unito in un file solo tutti i referti, tutte le riverifiche e le note del livello
runtime (2.269.026 caratteri), poi ho chiesto per ogni cartella e per ogni file del sito
se il suo percorso compare almeno una volta:

```
cat g1/*.json g2/*.json risultati/*.json sintesi/nuovi.json riverifica/*.json \
    runtime/*.md runtime/findings-runtime.json > critico/_tutto.txt
for f in $(find app/api -name route.ts); do grep -qF "$f" _tutto.txt || echo "MAI $f"; done
```

Se un percorso non compare **né fra i difetti, né fra gli scarti, né fra le zone dichiarate
non viste**, allora nessuno lo ha guardato e nessuno lo ha dichiarato non guardato. È la
zona cieca vera: quella che non sa di esserlo.

## Il conto

| Cosa | Mai nominato da nessun referto |
|---|---:|
| Porte del sito (`app/api/**/route.ts`) | **29 su 93** |
| Rotte dell'intelligenza artificiale (`app/api/ai/`) | **11 su 20** |
| Migrazioni del database (nome del file) | **102 su 145** |
| Sottocartelle di `app/`, `lib/`, `components/` | **9** |
| Cartelle intere di primo livello | `seeds/` (7 file), `types/` (1), `.storybook/` (2) |

Contro il riepilogo, che a `sintesi/conti.json` riga `"lenti_scoperte": []` dichiara zero
zone scoperte.

## Le zone cieche vere, dalla più cara alla meno cara

**1. La cassa dei contanti dei fattorini — `app/api/cron/riquadra-casse/route.ts` (76 righe).**
Mai nominato da nessuna delle 24 lenti, compresa `pagamenti-stripe`. È il lavoro che rifà
il conto dei contanti incassati dal fattorino ieri e oggi. Il commento dentro al file
(righe 10-24) dice che senza di lui «il fattorino si vede un ammanco che non ha». La porta
è chiusa bene (`withCronAuth`, riga 26), quindi non è un buco di sicurezza: è un buco di
**controllo**. Se sbaglia il conto, sbaglia in euro e verso una persona vera.
Costo di un difetto qui: soldi contestati con un rider, uno per uno, senza nessuno che se
ne accorga.

**2. Undici rotte dell'intelligenza artificiale su venti.**
Mai nominate: `answer-qa`, `catalog-apply`, `catalog-batch/apply`, `catalog-batch/status`,
`description`, `improve-product`, `reviews-summary`, `seo`, `translate`, `variants`,
`voice-product` — 1.866 righe. La lente `ai-endpoints` esiste e ha trovato 7 problemi, ma
li ha trovati sulle altre nove (`copilot`, `catalog-chat`, `product-chat`, `diagnose`…).
Il difetto che quella lente ha trovato — «la scheda prodotto entra nel prompt senza
recinto, e su tre rotte manca anche la regola anti-istruzione» — non è stato cercato su
queste undici. Costo di un difetto qui: la bolletta dell'AI (chiunque può farla salire) e
testi pubblicati sul catalogo di un negozio che nessuno ha scritto.

**3. Otto porte di amministrazione su otto (`app/api/admin/`, 756 righe).**
Mai nominate: `branding`, `categories`, `cod-remittance`, `daily-drops`,
`orders/[id]/cancel`, `home`, `products`, `users/[id]/moderate`. Due di queste toccano
soldi (`cod-remittance` = i contanti da girare, `orders/[id]/cancel` = annullare un
ordine) e una tocca le persone (`users/[id]/moderate`). La lente `accessibilita` aveva
dichiarato onestamente «Area admin (`app/admin/*`): 18 select/input segnalati dallo
scanner, non verificati» — ma quella è la faccia, non le porte. Costo: chi può annullare
un ordine, e con quale prova che è stato lui.

**4. Centodue migrazioni su 145 mai nominate.**
La radiografia guarda le migrazioni 122, 124, 127, 129, 130-150. Tutto quello che c'è
sotto la 122 — cioè le fondamenta del database, comprese le regole di accesso scritte per
prime — non è stato riletto da nessuno. La riverifica dei 361 problemi vecchi copre solo
ciò che era già stato trovato. Costo: una regola di accesso scritta a marzo e mai più
riletta è esattamente il posto dove si nasconde un difetto vecchio.

**5. `lib/net/` (176 righe), `lib/hooks/` (191), `lib/bg-removal/` (210), `components/orders/` (138),
`lib/seller/` (54).** Cinque pezzi di libreria mai nominati. `lib/net` in particolare: è la
rete, cioè quello che sta sotto a tutte le chiamate. Costo: medio, ma è codice condiviso —
un difetto lì si moltiplica per tutti i chiamanti.

**6. `seeds/` (7 file), `.storybook/` (2), `types/` (1): zero menzioni.**
`seeds/` è il materiale per riempire il sito di dati finti ma realistici. Nessuno l'ha
aperto — ed è il motivo per cui la zona cieca ⑤ (sotto) esiste.

**7. Quattro pagine pubbliche mai nominate: `app/cookies`, `app/novita`,
`app/piccoli-prezzi`, `app/piu-venduti`** (349 righe in tutto). `app/cookies` è una pagina
legale. Costo: basso in euro, ma è la pagina che un'ispezione privacy guarda per prima.

## Zone cieche già dichiarate (queste vanno bene: chi le ha dichiarate ha fatto il suo dovere)

Il livello runtime le scrive per esteso in `runtime/findings-runtime.json`, campo
`zone_non_viste`: il sito pubblicato mai aperto da un browser esterno (la rete della
sessione rifiuta la connessione), l'indirizzo Vercel chiuso dietro il suo login, i
contenuti veri del database mai letti (solo la struttura), i log oltre i sette giorni non
consultabili, Stripe senza chiave. La lente `accessibilita` dichiara 11 zone, fra cui
«nessun test reale a tastiera o con lettore di schermo». Queste sono **onestà**, non buchi.

---

# ② PROVE CHE NON REGGONO

## Il conto, per tipo di prova

```
jq -r 'group_by(.severita)[] | "\(.[0].severita): " + ([.[]|.prova_tipo]|group_by(.)|map("\(.[0])=\(length)")|join(", "))' sintesi/nuovi.json
```

| Gravità | comando | umano | grep |
|---|---:|---:|---:|
| bloccante (3) | 3 | 0 | 0 |
| grave (64) | 57 | 7 | 0 |
| minore (117) | 54 | 17 | **46** |

**Prima cosa buona, e va detta:** nessun grave e nessun bloccante ha per prova un grep.
La regola dell'asticella (CLAUDE.md) è stata rispettata dove conta. I 46 grep stanno tutti
sui minori, dove la regola li ammette.

**Seconda cosa buona:** ho cercato i comandi che sono grep travestiti — un `grep`, `cat`,
`sed` o `jq` messo dentro al campo «comando» per farlo sembrare una prova. Su 58 prove-comando
di gravi e bloccanti, **zero** sono travestite. Sono vitest (33), psql (14), playwright (3),
curl (3), script node (2).

## I nove gravi con la prova mai eseguita

```
jq -r '.[] | select((.severita=="grave" or .severita=="bloccante") and .prova_eseguita==false) | .dimensione + " :: " + .titolo' sintesi/nuovi.json
```

| # | Lente | Titolo (corto) | Tipo |
|---|---|---|---|
| 1 | sicurezza-auth | 14 funzioni con permessi elevati chiamabili da chi non ha fatto l'accesso, 2 scrivono | comando |
| 2 | rls-database | 6 viste girano coi permessi di chi le ha create | comando |
| 3 | accessibilita | Il campo per cancellare l'account non ha nome | umano |
| 4 | dati-analytics | L'accesso con Google non lascia riga nel registro | umano |
| 5 | tipografia | Il nome del prodotto tagliato a una riga nella pagina ordine | umano |
| 6 | mobile-pwa | «Arriva tra ~3 min» su una posizione ferma da mezz'ora | umano |
| 7 | microcopy | Quasi tutte le email su un dominio che il codice tratta da ripiego | umano |
| 8 | microcopy | Chi spegne le promozioni continua a vederle nella campanella | umano |
| 9 | stati-ui | Il credito del cliente si legge zero quando la lettura non riesce | umano |

I numeri 1 e 2 sono i più gravi **e sono anche i due che si potevano provare oggi**: il
banco di prova del database era acceso e ha funzionato (`runtime/db-harness.log`, ultima
riga `exit_drift=0`, 145 migrazioni applicate senza errori) e altre 14 prove psql sono
girate. Non c'è una ragione tecnica per cui queste due non siano state fatte girare.

## Le tre più gravi, andate a guardare nel codice

### ① «Quattordici funzioni chiamabili da chi non ha fatto l'accesso, e due scrivono» — LA PROVA NON REGGE, IL DIFETTO È PIÙ PICCOLO DI COME È SCRITTO

La prova proposta è:
`psql … "BEGIN; SET ROLE anon; select track_sponsored_click(…); ROLLBACK;" → se non lancia «permission denied», l'anonimo può scrivere.`

Sono andato a leggere. La funzione sta in `migrations/122_radiografia_20_agosto.sql:242-256`:

```sql
CREATE OR REPLACE FUNCTION public.track_sponsored_click(p_id uuid)
...
  -- Dieci clic al minuto sulla stessa campagna: nessuna persona vera lo fa.
  IF NOT public.sponsored_sotto_tetto(p_id, 'click', 10) THEN
    RETURN;
  END IF;
```

**La prova, se la fai girare, esce verde in un modo che inganna:** non lancia «permission
denied» (giusto, l'anonimo può chiamarla), quindi il difetto sembra confermato — ma la
prima chiamata passa comunque anche a difetto riparato, perché il tetto è 10 al minuto.
Una prova che dà lo stesso esito prima e dopo la riparazione **non è una prova.**

E c'è di peggio nella descrizione: dice «salvo il limite in `sponsored_tracking_rate`,
**da verificare**». Il limite è scritto a `migrations/122_radiografia_20_agosto.sql:186-224`,
cioè **nello stesso file che la scheda cita**. Non era da verificare: era da leggere.

Il difetto vero resta, ma è un altro e va riscritto: il tetto è **per campagna**, non per
chi chiama (`sponsored_sotto_tetto` conta solo `campaign_id, kind, minuto`, righe 210-214).
Quindi un anonimo può portare una campagna a 10 clic al minuto = 14.400 clic al giorno, e
può anche **azzerare i clic veri** riempiendo il minuto prima che arrivi un cliente. Questo
sì è provabile e nessuno l'ha provato.

### ② «Sei viste girano coi permessi di chi le ha create» — LA PROVA CONTROLLA IL RUOLO SBAGLIATO

La prova proposta finisce con:
`BEGIN; SET ROLE anon; select * from ordini_disponibili_rider limit 1; ROLLBACK;`

Sono andato a guardare. `migrations/124_radiografia_21_agosto.sql:305-306`:

```sql
REVOKE ALL    ON public.ordini_disponibili_rider FROM anon, authenticated;
GRANT  SELECT ON public.ordini_disponibili_rider TO authenticated;
```

L'anonimo **non ha il permesso**. Quella prova, se la fai girare, dà «permission denied» e
sembra dire che è tutto a posto. Ma il difetto, se c'è, non è lì: la vista si difende con
`AND public.is_rider_approvato()` scritto dentro il corpo (riga 301), non con la RLS delle
tabelle sotto. La domanda giusta era: **un utente autenticato che non è un fattorino
approvato, cosa vede?** Nessuno l'ha chiesta. La scheda è verosimile ma la sua prova
guarda dalla parte sbagliata: va riscritta con `SET ROLE authenticated` e un utente finto
non-rider.

### ③ «Il credito del cliente si legge zero euro quando la lettura non riesce» — IL DIFETTO C'È DAVVERO, MA LA PROVA È CLASSIFICATA MALE

Qui la scheda dice `prova_tipo: umano` («bloccare la rete dagli strumenti del browser»).
Sono andato a leggere `app/profile/gift-cards/page.tsx:70-76`:

```js
const { data } = await supabase.from('profiles').select('wallet_balance_cents').eq('id', userId!).single();
return (data?.wallet_balance_cents as number) ?? 0;
```

L'errore non viene nemmeno raccolto. Il difetto è vero e si legge in due righe. Ma non
serviva un occhio umano: si scriveva una prova che diventa rossa in dieci minuti (finta la
risposta con errore, controlla che non esca `0`). Classificarlo «umano» lo mette nella
pila delle cose che aspettano Nicola, quando poteva essere nella pila delle cose che si
riparano da sole.

**E la scheda dice meno del vero, non più:** nomina 2 file. Lo stesso schema — la risposta
presa senza guardare l'errore — è nel sito **75 volte in 52 file**:

```
grep -rn "const { data } = await supabase" app components lib --include=*.tsx --include=*.ts | wc -l   → 75
```

Nessuno ha chiesto quanti di quei 75 mostrano un numero al posto di un errore. Questa è
insieme una prova debole e una zona cieca.

## Il buco più grande di tutto il ②: 127 schede su 184 non le ha lette nessun secondo lettore

```
jq -r '[.[]|.verificato]|group_by(.)|map("\(.[0])=\(length)")|join(", ")' sintesi/nuovi.json
  → collega=44, no=127, autore=13
```

Il metodo dichiarato nel referto (`bozza-report.md`, sezione «Metodo») dice: «ogni grave
verificato a blocchi di quattro **da un collega che deve rifiutarlo**». Il conto dice che
**69 su 100** delle schede nuove non hanno avuto quel collega. Fra i 67 gravi e bloccanti,
44 hanno avuto un secondo lettore: quindi 23 gravi e bloccanti sono usciti col solo autore.
La frase del metodo va corretta, o il secondo lettore va fatto passare su quei 23.

---

# ③ CONCLUSIONI PIÙ FORTI DELLE PROVE

Sette frasi della bozza (`sintesi/bozza-report.md`) affermano più di quanto hanno in mano.
Le metto in ordine di quanto ingannano.

### 1. «Ho fatto girare le prove: 2.411 prove automatiche, tutte verdi» — vero ma incompleto, e sta nel punto peggiore

Sta nel blocco *In parole semplici*, cioè dove Nicola legge se non legge altro. Il numero è
vero (`runtime/verify.log`: `Test Files 326 passed (326)` · `Tests 2411 passed`). Ma nella
stessa sessione le prove nel browser sono andate così:

- `runtime/playwright.log`: **25 fallite, 3 passate, 1 saltata**
- `runtime/playwright2.log`: **40 passate, 16 fallite, 2 saltate**

Il referto cita solo il secondo giro, e solo giù nei *Dettagli tecnici*. Il primo — 25
rosse su 29 — non compare da nessuna parte. Un lettore che si ferma alle prime righe esce
con «tutto verde». **Correzione da fare:** aggiungere «e 16 prove nel browser sono rosse»
nella riga stessa, non 200 righe dopo.

### 2. Il titolo: «il database vero è indietro di ventuno passi» — la tabella dello stesso referto ne mostra tre applicati

La tabella sotto (*«Produzione: cosa manca delle migrazioni 130-150»*) esamina 10
migrazioni e per tre scrive **«sì»** (142, 143, 144). Il corpo lo ammette («Alcune
migrazioni invece ci sono, applicate a mano e a spizzichi»), ma il titolo no. «Ventuno»
è il numero di righe mancanti nel registro `supabase_migrations.schema_migrations`, non il
numero di cose che mancano davvero. Sono due misure diverse chiamate con lo stesso nome.

### 3. «Le venticinque cose che mancano» — il numero non si ricava da nessuna tabella del referto

Contando gli oggetti riga per riga nella tabella del referto stesso: 131 → 3, 135 → 1,
140 → 3, 141 → 2, 143 → 1 indice, 147 → 2 indici, 148 → 2, 150 → 2. **Fanno 16**, non 25.
E la stessa frase dice «e cinque indici», mentre nella tabella gli indici nominati sono
**quattro** (`wallet_ledger_chiave_idx`, `products_status_price_idx`,
`products_category_price_idx`, `abandoned_recuperati_idx`). Due numeri orfani nella stessa
frase. O si aggiunge la fonte, o si scrivono i numeri che la tabella sostiene.

### 4. «Uno che arriva sull'indirizzo tecnico trova una schermata di accesso che non è la sua» — dedotto da un'impostazione, mai visto

La scheda bloccante (`sintesi/nuovi.json`, lente `deploy-sre`) ha `prova_eseguita: true`,
ma dentro la prova stessa c'è scritto: *«Da un browser fuori dal team: aprire
https://mycity-phi.vercel.app in finestra anonima → **se** compare la pagina di accesso di
Vercel»*. È un'istruzione per Nicola, non un comando eseguito. Ciò che è stato davvero
misurato è l'impostazione (`Deployment Protection = Vercel Authentication`) e il DNS
(`getent hosts mycity-marketplace.com → 216.24.57.1`). Quella parte regge. La conseguenza
sul visitatore è una **deduzione corretta ma non provata**, ed è scritta come un fatto
osservato. Il referto lo ammette in fondo («Non ho potuto aprire il sito da un browser
esterno») — quindi il referto contraddice se stesso a distanza di dieci righe.
Il campo `prova_eseguita` di quella scheda va messo a `false` per metà claim, o spezzata in
due schede.

### 5. «Il sensore legge errore 503 da 219 controlli di fila» — la fonte c'è, ma non è nel referto

Il 219 viene da `runtime/findings-runtime.json:215` (`sensore sito_uptime: HTTP 503 … da
219 giri, ultimo ok 30/7 08:20`). È un numero della macchina dell'AD, non del sito. Va
bene, ma nel referto arriva senza dire da dove: per il lettore è un numero orfano. Basta
aggiungere «lo dice il sensore `sito_uptime`».

### 6. «Lenti scoperte: nessuna» (`sintesi/conti.json`, campo `lenti_scoperte`) — falso

Nel referto diventa il segnaposto `{{LENTI_SCOPERTE_FRASE}}` dentro *Cosa non ho
verificato*, e con `[]` dentro quel segnaposto sparisce o dice «nessuna». Il campo misura
le **etichette** (24 lenti hanno prodotto un file), non la **copertura** (29 porte del
sito su 93 mai aperte). Un campo che si chiama «scoperte» e conta le etichette è la cosa
che più facilmente diventa una bugia nel Pannello.

### 7. «Il secondo giro l'hanno avuto 12 lenti su 24 — le più vicine ai soldi, ai permessi e alla conversione» — mezza vera

L'elenco (`conti.json`, `lenti_giro2`) è: accessibilita-visiva, api-backend,
dati-analytics, flussi-conversione, microcopy, mobile-pwa, pagamenti-stripe,
privacy-legale, qa-flussi, rls-database, sicurezza-auth, stati-ui. Manca **`architettura`**,
che è la lente che ha trovato il difetto sui paletti dei soldi («un compenso al negozio più
alto dell'incasso entra lo stesso»), e manca **`ai-endpoints`**, che è quella con 11 rotte
mai guardate. Se il criterio era «i più vicini ai soldi», `architettura` doveva esserci.

---

# ④ CONTRADDIZIONI

## Prima, la cosa che regge: il ricontrollo dei 361 problemi vecchi è solido

Ho controllato se le due scritture della riverifica (cartella `riverifica/` e file
`risultati/riverifica*.json`) si contraddicono:

```
361 schede uniche · riverificate più di una volta: 361 · con verdetti discordi: 0
```

Tutte e 361 sono state ricontrollate due volte, e due volte hanno dato lo stesso verdetto.
Questo è il pezzo migliore di tutta la radiografia e va scritto nel referto: oggi non c'è.

## Poi, la contraddizione vera: otto problemi che sono «riparati» e «ancora vivi» insieme

I cercatori del giro 1 hanno un campo `noti_ancora_presenti`. Ci hanno messo dentro **71**
problemi vecchi che dicono di aver ritrovato vivi. Il riepilogo, a
`sintesi/conti.json` → `riverifica.confermato_dai_cercatori`, scrive **0**.
I due canali non sono mai stati messi uno contro l'altro. L'ho fatto io (confronto dei
titoli, soglia 55% di parole in comune e almeno 4 parole):

| Lente | Problema | Riverifica dice | Cercatore dice |
|---|---|---|---|
| qa-flussi | «Il negozio rifiuta un ordine pagato con carta e i soldi NON tornano al cliente» | riparato | ancora presente |
| rls-database | «Anonimi e utenti loggati possono scrivere su una cinquantina di tabelle: li ferma solo la RLS» | riparato | ancora presente |
| sicurezza-auth | «L'indirizzo di rete nel registro dei consensi è preso dal pezzo che scrive il chiamante» | riparato | ancora presente |
| ai-endpoints | «Nessuna rotta guarda `stop_reason`: una risposta tagliata a metà passa per completa» | riparato | ancora presente |
| ai-endpoints | «La scheda prodotto entra nel prompt senza recinto, e su tre rotte manca la regola anti-istruzione» | riparato | ancora presente |
| ai-endpoints | «Un corpo troppo grande viene raccontato al venditore come JSON non valido» | riparato | ancora presente |
| accessibilita | «Su /stores il menu di ordinamento non ha nessun nome» | riparato | ancora presente |
| accessibilita-visiva | «La striscia che scorre in cima non si può fermare da telefono né da tastiera» | riparato | ancora presente |

## Chi ha ragione: ho controllato quello che costa di più

Il primo della lista è l'unico che tocca i soldi. Sono andato a leggere la prova della
riverifica:

> «Il pulsante non chiama più la RPC: `app/seller/orders/[id]/page.tsx:212` fa POST su
> `/api/seller/orders/[id]/reject`, e quella rotta (riga 70) chiama `annullaERimborsa` e
> BLOCCA il rifiuto se il rimborso fallisce (righe 79-85). Prova che gira:
> `npx vitest run tests/unit/il-rifiuto-del-negozio-restituisce-i-soldi.test.ts` → 8 test passati.»

**La riverifica ha ragione, il cercatore no.** E qui sta il difetto di processo, che è più
importante del singolo caso: il campo `noti_ancora_presenti` è **una lista di frasi
senza prova**. Nei file `g1/*.json` sono stringhe nude: nessun `prova`, nessun `file:riga`,
nessun `prova_eseguita`. Cioè un canale senza prove può contraddire un canale con prove, e
nessuno se ne accorge perché il riepilogo lo conta zero.

**Due rimedi, in ordine:**
1. `noti_ancora_presenti` deve avere lo stesso obbligo di prova delle schede nuove, oppure
   va rinominato `sospetti_da_ricontrollare` — perché è quello che è.
2. Il riepilogo deve incrociare i due canali e stampare gli scontri, invece di scrivere 0.
   Otto scontri non riconciliati sono otto occasioni di dire a Nicola «riparato» su una
   cosa viva. Oggi ne ho controllato uno; gli altri sette restano aperti.

## Terza contraddizione: il metodo dichiarato contro il conto vero

`bozza-report.md` (Metodo): «ogni grave verificato a blocchi di quattro **da un collega che
deve rifiutarlo**». `sintesi/nuovi.json`: `verificato: no` su **127 schede su 184**, di cui
23 gravi o bloccanti. O la frase è vecchia, o il collega è saltato.

---

# ⑤ COSA MANCA DI DIVERSO — cinque MODI di guardare mai usati

Non servono altre lenti. Servono altri **punti di vista**. Questi cinque non sono stati
usati nemmeno una volta, da nessuna delle 24 lenti né dal livello runtime.

### 1. Il sito con dentro dati veri — nessuno ha mai visto una pagina piena
Tutto è stato letto sul codice o su pagine vuote. Il database di produzione ha **5 prodotti,
1 venditore, 1 ordine mai pagato** (tabella del referto, «Produzione: numeri di base»), e
il banco locale è stato ricostruito solo in **struttura** (`runtime/db-harness.log`). La
cartella `seeds/` (7 file) esiste e **ha zero menzioni in tutta la radiografia**. Un
elenco con 40 prodotti si rompe dove uno con 5 non si rompe: impaginazione, ordinamento,
lentezza, testi lunghi.
**Costo:** mezza giornata. Il materiale c'è già, va solo caricato sul database locale che è
già acceso.

### 2. Un percorso d'acquisto intero, dall'inizio alla fine, da una persona sola
Ogni lente ha guardato un pezzo. Nessuno ha fatto: mi registro → cerco → metto nel carrello
→ pago → il negozio accetta → il fattorino consegna → chiedo il reso → mi rimborsano.
I difetti che si vedono solo così sono quelli fra un pezzo e l'altro — ed è esattamente il
posto dove stanno i due bloccanti di oggi (il dominio e il database indietro), che infatti
il referto stesso descrive come «non nel codice: fra il codice e il mondo».
**Costo:** una giornata, e serve una chiave Stripe di prova (oggi non c'è: è la prima zona
dichiarata non vista).

### 3. L'occhio di chi attacca **con un account vero**, non da anonimo
Tutte le prove di sicurezza partono da `SET ROLE anon`. Ma l'advisor di produzione elenca
**31 funzioni con permessi elevati eseguibili da `authenticated`**
(`runtime/supabase-advisors-sicurezza.json`, `authenticated_security_definer_function_executable`
= 31) contro le 14 da `anon` — e nessuno le ha guardate. La domanda mai fatta è: **il
cliente A può leggere o toccare la roba del cliente B?** È la stessa svista che ha reso
sbagliata la prova della vista `ordini_disponibili_rider` (punto ② sopra). Ed è la forma
del bloccante trovato oggi («un cliente si rimborsa da solo»): se quello esiste, altri
simili esistono.
**Costo:** tre o quattro ore. Il database locale è già acceso e le 11 tabelle segnalate
`rls_enabled_no_policy` dall'advisor sono già l'elenco da cui partire.

### 4. Seguire un euro solo, da un capo all'altro
Le lenti sono per mestiere (`pagamenti-stripe`, `dati-analytics`, `api-backend`). Nessuna
ha seguito **la stessa somma** lungo tutta la catena: incasso → commissione → compenso al
negozio → rimborso → quadratura della cassa contanti. Che questo manchi si vede dai
difetti trovati, che sono tutti pezzi scollegati della stessa catena: «il rimborso non
toglie un euro dai guadagni che il negozio vede» (dati-analytics), «un compenso più alto
dell'incasso entra lo stesso» (architettura), più la cassa contanti che non ha guardato
nessuno (zona cieca #1). Sono tre viste dello stesso conto che non torna.
**Costo:** una giornata, meglio con @finanza a fianco che dice quale numero deve tornare.

### 5. Provare a rompere il codice apposta, per vedere se le prove se ne accorgono
«2.411 prove verdi» dice che le prove passano. **Non dice che coprono.** Nessuno ha preso
dieci punti caldi (il calcolo del compenso, il rimborso, il controllo dei permessi) e li ha
storpiati di proposito per vedere se qualche prova diventa rossa. Se non diventa rossa, quel
verde è decorativo. È lo stesso principio della regola di casa (`cervello/mutanti.json`),
applicato al sito invece che alla macchina.
**Costo:** mezza giornata a mano su dieci punti scelti; una giornata se lo vuoi automatico.

---

# Il riassunto in cinque righe

1. **Copertura dichiarata ≠ copertura vera**: `lenti_scoperte: []` contro 29 porte su 93 e
   102 migrazioni su 145 mai nominate. Va corretto prima della firma.
2. **La qualità della prova regge dove conta** (0 grep sui gravi, 0 comandi travestiti) ma
   **9 gravi hanno la prova mai eseguita**, e due di quei nove si potevano eseguire oggi.
3. **Due prove su tre che ho aperto guardano dalla parte sbagliata**: una non può diventare
   rossa (tetto di 10 clic al minuto già scritto), l'altra controlla il ruolo `anon` su una
   vista che ad `anon` è già negata.
4. **127 schede su 184 senza secondo lettore**, contro un metodo che dichiara il contrario.
5. **Otto «riparato» contro otto «ancora vivo»**, mai riconciliati, e il riepilogo li conta
   zero. Il canale che contraddice non ha l'obbligo della prova: va chiuso quel buco.

**Confidenza.** Alta (90%) su ①, ② e ④: sono conteggi ripetibili con i comandi scritti
sopra, e le tre letture di codice le ho fatte a mano. Media (70%) su ③: giudico frasi, e un
lettore diverso potrebbe essere più indulgente su due delle sette. Media (65%) su ⑤:
l'elenco di ciò che manca è per sua natura incompleto — è il limite di chi critica dall'esterno.
