---
data: 2026-10-31 08:25
approvato: «parti», Nicola, 2026-10-31 08:22
tipo: piano
fonte: AD digitale
richiesta: il piano per riparare tutti i difetti del sito nel minor tempo, senza crearne altri, per aprire il prima possibile (Nicola, 31/10/2026)
analisi: workflow wf_a60601a0-cae, 53 agenti, circa 6,4 milioni di token
---

# Il piano per riparare il sito e aprire al primo cliente

> **In due righe.** Ho ricontrollato sul codice tutte le 1.213 voci del registro del sito, e per aprire servono 7 ondate su due binari. Il primo cliente in contanti arriva giovedì 5/11 sera o venerdì 6/11, se le tue pratiche partono lunedì.

## In parole semplici

Il registro dei difetti del sito aveva 1.213 voci da guardare: 1.028 aperte e 185 che qualcuno aveva detto riparate. Il registro però non diceva se erano ancora vere: metà dei difetti seri veniva da ottobre, e molti non erano mai stati ricontrollati.

Le ho fatte ricontrollare tutte, una per una, sul codice di oggi. Ventiquattro verificatori si sono divisi le zone del sito. Poi un contestatore ha cercato di smentire ogni «già riparato» e ogni «spento al lancio» sui difetti seri: su 98 affermazioni ne ha respinte 15.

Il risultato, in tre righe:
- **Già riparati nel codice, manca solo la prova:** 214 voci, di cui 73 serie. Si chiudono senza scrivere codice.
- **Da riparare davvero:** circa 120 bloccanti e gravi, e circa 870 minori.
- **Da fare con le tue mani:** 28 voci, come chiavi, impostazioni, partita IVA, Stripe e firme.

Il piano lavora su due binari, cioè due sessioni che lavorano insieme su file diversi. Il binario A porta da solo tutto quello che tocca i soldi e la cassa, una ondata dopo l'altra. Il binario B porta il resto. Esempio: martedì il binario A ripara la cassa che il giovedì pomeriggio propone «Oggi 15-18» mentre Pane Quotidiano è chiuso. Nello stesso momento il binario B ripara le scorte del negozio, che oggi si cancellano se arriva un ordine mentre il fornaio le modifica.

Le date valgono se le tue pratiche partono lunedì.
- **Primo cliente in contanti:** giovedì 5/11 sera, oppure venerdì 6/11.
- **Carta:** il giorno in cui Stripe verifica il conto del fornaio. Probabilmente la settimana del 9/11.
- **Minori:** finiti verso martedì 17/11.
- **Funzioni spente:** riparate verso giovedì 19/11.

## Cosa cambia per te

- **Le tue scelte di stanotte guidano tutto.** Si apre con zero bloccanti e zero gravi raggiungibili al lancio. Delle funzioni spente si accende solo la carta. Le falle nascoste le ricostruisco io in privato. I binari sono due.
- **Ogni giorno ti arrivano due richieste di unione**, una per binario. Le unisci in fila, sempre prima quella del binario A. Se ne unisci una sola al giorno, i tempi raddoppiano: apertura entro l'11/11, fine a inizio dicembre.
- **La carta non si accende da sola.** Oggi basta mettere la chiave di Stripe e la carta parte, insieme all'abbonamento da 50 euro dei negozi. Il piano mette prima due interruttori spenti, uno per la carta e uno per l'abbonamento. Poi li accendi tu, quando Stripe ha verificato il conto.
- **Il costo è grande, e lo dico prima.** Per aprire servono circa 48 agenti e 90-150 milioni di token. Per finire tutto, minori compresi, circa 270 agenti e 550-900 milioni. Il conto vero lo rimisuro dopo la prima ondata: il motore snello non ha ancora mai girato su un'ondata vera.

## Cosa devi fare

- **Oggi o domenica, circa un'ora:** chiudere la falla R7, coi passi che ti scrivo in chat. La password di prova dell'amministratore l'hai già sistemata il 25/10: l'ho controllato nel database. Su GitHub i quattro segreti del rilascio vanno messi dopo l'unione dell'ondata 1.
- **Lunedì 2/11 mattina, la cosa più lunga:** partita IVA e PEC col commercialista. Senza il nome del titolare sul sito non si apre. Lo stesso giorno il fornaio completa il suo conto Stripe.
- **Lunedì dopo la prima unione:** premere una volta il pulsante che aggiorna il database, poi mettere su Vercel la chiave di servizio. Io ti affianco al primo giro dei lavori a orario.
- **Prima di ogni ondata, una risposta breve alle sue scelte:** te le porto io, al massimo tre alla volta.
- Tutte le altre tue azioni, con giorno e durata, sono nella tabella in fondo.

## Cosa non ho verificato

- **La produzione l'ho vista solo in parte.** Il 31/10 ho letto, senza scrivere, le regole del database vero e i nomi delle variabili di Vercel: sette falle nascoste risultano già chiuse, e le migrazioni sono tutte applicate fino alla 163. Non ho visto GitHub, Stripe né i valori delle variabili: altre voci dipendono da lì.
- **Le 207 voci che toccano i file dell'ondata in corso** vanno rilette dopo la sua unione: qualcuna può cambiare.
- **Il critico finale ha detto che la seconda versione del piano non si poteva eseguire così.** Le sue sei correzioni sono qui sotto come regole vincolanti. L'elenco esatto dei pacchetti lo calcola uno script domenica, controllando anche quali file si importano a vicenda: oggi non è ancora fatto.
- **Le stime di tempo e di token** si basano sui giri del 29-30/10, non su un'ondata del motore snello.

---

## Dettagli tecnici

### Cosa ha trovato la verifica (registro letto dal ramo `ccr-aebe4f91-ohlf19`, codice `40cb09ff`)

| | totale | presenti | parziali | non verificabili | riparati | obsoleti |
|---|---:|---:|---:|---:|---:|---:|
| bloccanti | 9 | 3 | 1 | 4 | 1 | 0 |
| gravi | 187 | 90 | 13 | 12 | 72 | 0 |
| minori | 1.017 | 778 | 56 | 37 | 141 | 5 |

- Il verificatore del database considera da bloccante la voce 326 (l'interruttore `allow_order_write` che chiunque accende).
- Contestazioni: 98 affermazioni sui seri, 15 respinte. Voci in volo: 207.
- Dati salvati il 31/10 alle 08:25: i verdetti per voce in `consegne/audit/2026-10-31-verifica-1213-schede.json`; il piano v2, le critiche della v1 e il critico finale in `consegne/audit/2026-10-31-piano-difetti-sito.json`.

### Passo 0 — domenica 1/11, prima del codice

**Stato al 31/10 alle 08:55:** fatti 0.1, 0.2, 0.3 (le richieste #266 e #905 sono unite; riverifica delle 45 voci serie), 0.4 (11 voci riaperte), 0.6 (censimento: 11 file, tre voci nuove 2030-2032), 0.8; per 0.5 le librerie sono installate e il controllo completo sul main nuovo è verde, 6.560 prove su 6.560 in 3 minuti e 38 secondi. Restano 0.5 (la prova a vuoto del motore), 0.7 e 0.9.

0.1 **Salvare i dati nella memoria:**
  - i verdetti delle 1.213 voci in `consegne/audit/2026-10-31-verifica-1213-schede.json`;
  - il piano v2 e le critiche in `consegne/audit/2026-10-31-piano-difetti-sito.json`;
  - questo piano in `consegne/audit/2026-10-31-piano-difetti-sito.md`;
  - una riga in `LAVORO-APERTO.md`, una in `DECISIONI.md` con le quattro scelte e l'ora, e una richiesta di unione della memoria.

0.2 **Registro dei fatti:**
  - `pagamenti.al-lancio` diventa «carta nel lancio, accesa con `CARTA_ACCESA` quando Stripe verifica il conto»;
  - `lancio.criterio` diventa «zero bloccanti e zero gravi raggiungibili, minori dopo»;
  - si registra con `node cervello/coerenza-fatti.mjs registra …` e si chiude col guardiano a exit 0.

0.3 **Unione dell'ondata 24 dell'altra sessione:**
  - si aspetta l'unione e si riparte dal principale nuovo;
  - si rileggono su main le voci serie in volo, poi le minori con uno script.

0.4 **Si riaprono nel registro** le voci «riparato» che la verifica ha trovato presenti. Serve perché `schede-pacchetto.mjs` salta le schede non aperte.

0.5 **Prove a vuoto:**
  - librerie nel sito con `npm install --package-lock=false`, perché `npm ci` fallisce: al lock mancano `@testing-library/dom` e tre dipendenze, e il lock lo ripara il pacchetto R;
  - una prova a vuoto di `.claude/workflows/ondata-snella.js`.

0.6 **Censimento della 161:**
  - si elencano, in sola lettura, tutte le letture dal browser dei profili di un altro utente;
  - ci sono anche `app/orders/[id]/review/page.tsx` e `app/seller/orders/[id]/page.tsx` (nome del fattorino) e altre due pagine trovate dal critico;
  - l'elenco esatto diventa il pacchetto P161; se supera circa 12 file si divide in P161a e P161b.

0.7 **Referto privato delle 11 falle R**, ricostruito dal codice e da `consegne/audit/2026-10-11-radiografia.md`: solo in chat, mai nel deposito.

0.8 **Il piano dei pacchetti lo calcola uno script, non un agente.**
  - Parte dal piano v2 e dalle regole qui sotto, e scrive il formato di `cervello/pacchetti-lotto.mjs --scrivi`: `{registro:"sito", ondate:[[{chiave, difetti:[{chiave}]}]]}`.
  - Le chiavi le calcola `chiaveProblema`, importata da `cervello/referti-sito.mjs`.
  - Controlli che devono uscire a zero prima di lunedì:
    - copertura: ogni voce una volta sola;
    - nel livello 1 al massimo 7 voci per pacchetto;
    - file disgiunti nella stessa ondata e nell'ondata accanto, contando anche le prove che importano un file dell'altra;
    - i file della cassa e dei soldi solo sul binario A.

0.9 **Chiusure senza codice, niente agenti:**
  - un comando lancia su main le prove citate nelle 214 voci, e `cervello/chiudi-sito.mjs` chiude le verdi;
  - le voci sui file dei pacchetti del livello 1 aspettano l'unione di quell'ondata: l'elenco lo calcola lo script, non lo si scrive a mano;
  - le voci senza una prova restano «riparato» finché un pacchetto tocca il loro file;
  - lo script spiega anche la differenza fra 214 e 196.

### Le regole vincolanti (dalle critiche, verificate sul codice)

1. **Due blocchi, solo sul binario A, in fila.**
   - Il blocco della cassa: `app/api/orders/cod/route.ts`, `app/checkout/page.tsx`, `lib/promesse-pubbliche.ts`, `lib/store-hours.ts`, `lib/quando-arriva.ts`, `lib/promessa-consegna.ts`, `lib/delivery.ts`, `components/checkout/DeliverySlotPicker.tsx`, `lib/stripe/client.ts`.
   - Il blocco dei soldi: `lib/ordini/annulla.ts`, `lib/stripe/payout.ts`, `lib/stripe/webhook/*`, `lib/db/migrazione-124.ts` e chi li importa.
   - Mai due ondate dei soldi insieme.
   - Contratto bloccato su `refundOrder`, `notifyAdmins`, `conRipiegoSchema`, `CAMPI_124` e `cartaAlCheckoutDisponibile`. La 1290 si ripara dentro `payout.ts`.
2. **Migrazioni.** Il pulsante `migrazioni-a-mano.yml` applica tutte quelle che mancano, e `deploy-dopo-ci.yml` si ferma se ne mancano più di 20. Lettura del database vero del 31/10 alle 09:00: in produzione **non ne manca nessuna fino alla 163**, la 161 compresa. Il numero «48» dei critici veniva da un testo del 19/10.
   - Il primo pulsante si preme dopo l'unione delle ondate 1 e 2: solo le nuove, cioè 164, 165, 166 e 181, con «quante» e «ultima» ricontate. Poi il rilascio finto, poi `main:false`.
   - La 161 è già applicata: le letture del censimento oggi mostrano già «Utente» e «Cliente» al posto dei nomi. P161a e P161b riparano un guasto presente.
   - Dopo, le migrazioni che **aggiungono** entrano col pulsante PRIMA dell'unione, e il codice regge senza la colonna (ripiego su PGRST204/42703).
   - Quelle che **tolgono** permessi o colonne seguono l'ordine inverso: prima l'unione del codice che non le usa più, poi la prova di fumo, poi il pulsante.
   - Non si modifica mai un file vecchio: si scrive una migrazione nuova, col suo ritorno indietro e una prova SQL che parte rossa.
3. **I lavori a orario.** Gli 11 lavori di `vercel.json` partono da soli con la chiave di servizio.
   - Il pacchetto CE aggiunge in `lib/cron/solo-conta.ts` un fermo per tutti, acceso se la variabile manca. La chiamata del calendario risponde «fermo», quella a mano con `CRON_SECRET` lavora.
   - Il primo giro a mano va in quest'ordine: `send-emails` dopo la pulizia della coda, `expire-stale-orders`, `veloce-non-confermata`, poi `process-deletions` e le potature in sola conta.
4. **La carta.**
   - `release-payouts` in sola conta prima del controllo di Stripe: dà l'elenco degli ordini HELD e di quelli fermati dai reclami senza chiavi e senza scritture.
   - L'ordine dei passi: unione dell'ondata 5, poi l'elenco, poi la tua firma su 1285 e 1810, poi le chiavi vere con `CARTA_ACCESA` spento, poi l'accensione.
   - Le chiavi di test vanno solo nell'anteprima, mai in produzione.
5. **Gli interruttori nuovi.** Il pacchetto INT dell'ondata 1 li aggiunge spenti, a comportamento invariato: `CARTA_ACCESA`, `ABBONAMENTO_NEGOZI_ACCESO`, PostHog, inviti e punti, `FATTORINI_ESTERNI_ACCETTATI` (letto dalla rotta di moderazione, per le voci 21 e 119).
   - Ogni freno ha la sua prova sulla rotta vera: chiavi presenti e interruttore spento devono dare un rifiuto.
   - Dopo INT, nessun altro pacchetto scrive `lib/funzioni-al-lancio.ts`.
6. **Le ondate dei nati.** Un difetto nato che tocca soldi o cassa va sul binario A: anche l'ondata 7, quella dei nati del livello 1. Accanto gira un'ondata del livello 2 senza soldi.
7. **Nel livello 1 un minore entra solo se ha la prova in comune col suo grave.** Gli altri scendono al livello 2.
   - LE si divide in LE-a (`lib/legal/titolare.ts`, `scripts/controlla-titolare.mjs`, `deploy-dopo-ci.yml`, voce 46) e LE-b (i testi delle pagine).
   - La frase del reso (50) va con PC.
8. **Ordini obbligati.**
   - Tutto il censimento della 161 prima del pulsante.
   - Prima della revoca della regola sui prodotti (1211): la 1538, `nascondi.ts`, `salva-dal-browser.ts` e una prova-grep delle scritture su `products` dal browser che dia zero.
   - La pulizia della coda prima della chiave.
   - La 1477 prima che tu salvi la home.
9. **Il bloccante 3 resta intero in un pacchetto**: una rotta del server per diventare negozio, il modulo che la chiama, e la guardia del database rigida sul cambio di ruolo dal browser.
10. **La 342 (cliente assente)** si ripara senza uno stato nuovo: `annullaERimborsa` con motivo `cliente_assente`, sul binario A.
11. **Due ondate da non mettere insieme:** quella del KYC e delle potature, e quella della cancellazione degli account.

### Livello 1 — per aprire (7 ondate, 4 turni) — disposizione finale del 31/10 alle 08:55

Calcolata da `consegne/audit/2026-10-31-ridisegna-piano.py`, scritta in `consegne/audit/2026-10-31-pacchetti-sito-piano.json`. Controlli dello script: copertura di 1.216 voci, 0 mancanti, 0 doppie; nessun file del blocco cassa o soldi sul binario B; nessun pacchetto oltre 7 voci distinte; nessun file in comune fra le ondate che girano insieme. Lo strumento delle schede legge tutte e 7 le ondate senza voci mancanti.

| Turno | Binario A (soldi e cassa) | Binario B (il resto) |
|---|---|---|
| 1 · lun 2/11 | **Ondata 1 «il cancello»**: R rilascio dopo la CI · P161a il nome del fattorino e gli autori pubblici dopo la 161 (1353, 2031, 2032) · H salute · CE coda email e fermo dei lavori · INT interruttori | **Ondata 2**: VE vetrina · AD admin · RI fattorino · HP home · P161b i nomi dei clienti visti dal negozio dopo la 161 (1336, 114, 1372, 2030) |
| 2 · mar 3/11 | **Ondata 3 «soldi e cassa 1»**: CA contanti · CF fasce e orari · PC promessa, frase del reso e del pagamento (50, 255) · AN annullo e cliente assente · PB rimborso prenotato | **Ondata 4**: SKA scorte e porta unica · KY documenti · AC accessi e falle R14/R15 · NE iscrizione del negozio · AIH pulsanti AI |
| 3 · mer 4/11 | **Ondata 5 «soldi e cassa 2: carta pronta»**: FW data della fascia · PA bonifici, HELD, reclami e permesso delle carte (1812) · VN freno della veloce · FP falle del database · SO resi del negozio | **Ondata 6**: SKB modulo prodotto · FR freni AI e newsletter · LE-a titolare · LE-b testi · NL via i 5 euro e i punti |
| 4 · gio 5/11 | **Ondata 7**: OC ordine del cliente coi resi, poi i nati del livello 1, poi un ordine vero in contanti, un ordine con carta in anteprima e **l'apertura** | un'ondata del livello 2 senza soldi né cassa |

- **Il pulsante delle migrazioni si preme lunedì dopo l'unione delle ondate 1 e 2**: tutte e due portano letture che la 161 rompe. Poi il rilascio finto, `main:false`, la chiave di servizio.
- **L'ordine del cliente coi resi (OC) sta sul binario A**: tocca i rimborsi, e 13 prove lo legavano al rimborso prenotato dell'ondata 3.
- **La 1948 e la 1949 sono riparate dalla #266** (riverifica sul commit `0fc4ec7d`, run `wf_df9b9a65-06c`): escono da CF e si chiudono con la loro prova.
- **Le 11 prove che legano due ondate che girano insieme** si sorvegliano: la seconda sessione si riallinea sul main appena unito e le fa girare con `npm run verify` prima della sua richiesta di unione.
  - 1|2: `entro-quando-accettare-si-rilegge-quando-il-telefono-si-riapre`, `il-catalogo-regge-con-i-profili-chiusi`, `la-chat-con-l-assistenza-si-chiama-assistenza-mycity`, `la-consegna-si-promette-all-ora-che-scegli`, `le-frasi-pubbliche-seguono-la-cassa-e-la-realta`, `le-funzioni-spente-al-lancio-le-rifiuta-il-server`;
  - 3|4: `chi-cancella-l-account-sa-che-l-avviso-del-bonifico-resta`, `chi-ha-pagato-in-contanti-legge-il-vero-su-bonifico-e-cancellazione`, `l-avviso-del-bonifico-resta-utile-dopo-la-cancellazione`;
  - 5|6: `i-termini-dicono-quello-che-l-annullo-rende-davvero`, `le-funzioni-spente-al-lancio-le-rifiuta-il-server`.
- **Prima di `CARTA_ACCESA`**, in testa all'ondata 8 sul binario A: WH contestazioni (1267, 1268, 1317).
- **Le voci 25, 1216 e 195 scendono al livello 2**; scendono anche i minori del livello 1 senza una prova in comune col loro grave (regola 7).

### Livello 2 e 3

- **Livello 2:** circa 670 minori, in 23 ondate più 7 dei nati, a coppie A/B, fino a circa martedì 17/11. Si parte dai soldi (8, 11, 13, 17) sul binario A.
- **Livello 3:** 4 ondate, circa 105 voci delle funzioni che restano spente, fino a circa giovedì 19/11.
- La voce 159 riguarda il modello AI che si spegne il 30/11. Va riparata prima di riaccendere l'AI.
- I numeri esatti e i contenuti delle ondate li fissa lo script del passo 0.8.

### Le tue azioni, con la data

| Quando | Cosa | Durata |
|---|---|---|
| sab 31/10 o dom 1/11 | La falla R7, coi sette passi che ti ho dato in chat. La R9 è già fatta | 45 min |
| dopo l'unione dell'ondata 1 | GitHub: `SUPABASE_DB_URL` (Session pooler), `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`; ruleset Main attivo, col controllo «Main» che comprende «Controlli database». Prima dell'unione, il rilascio non ha ancora il cancello: non metterli prima | 30 min |
| subito | Supabase Auth: protezione contro le password già rubate (320) | 5 min |
| lun 2/11 mattina | Partita IVA e PEC col commercialista (bloccante 46); poi le variabili `NEXT_PUBLIC_TITOLARE_*` su Vercel | 1-3 giorni |
| lun 2/11 | Il fornaio completa il conto Stripe (dati, documento, IBAN) | 30-60 min, poi i giorni di Stripe |
| lun 2/11 | Le scelte che non chiedono codice (1370, 1371, 1373, 1514, 1970, 1805) | 15 min |
| lun 2/11, dopo l'unione della 1 e della 2 | Premere una volta il pulsante delle migrazioni (solo le nuove: 164, 165, 166, 181); poi la chiave di servizio, la casella privacy, `SUPPORT_EMAIL` e Resend su Vercel; il primo giro a mano con me; le variabili della copia delle foto (434) | circa 2 ore e mezza |
| entro mer 4/11 | Un progetto Supabase di prova e l'anteprima di Vercel con le chiavi Stripe di test (è una spesa) | 30 min |
| dopo l'unione della 4 | I template Supabase su `/auth/confirm` (82); ragione sociale e P.IVA di Pane Quotidiano; via il Panificio Demo; lat/lng del negozio | 1 ora |
| dopo l'unione della 5 | La firma sui riallineamenti 1285 e 1810, guardando l'elenco; poi le chiavi Stripe vere, col webhook e la carta spenta | 1-2 ore |
| dopo l'unione della 6 | Correggere il titolo della home da `/admin/home` | 10 min |
| prima del primo cliente | Fuori dal sito: attestato HACCP, avviso all'ASL, contenitori termici per la bici | dipende dagli uffici |
| quando Stripe verifica il conto | Accendere `CARTA_ACCESA` e seguire il primo ordine vero con carta | 15 min |

### Le scelte da darmi prima dell'ondata che le usa

- **Ondata 2:** cosa dire della polizza dei fattorini nella pagina d'aiuto (247).
- **Ondata 3:**
  - quanti minuti prima della fine una fascia resta scegliibile (1949; il ramo ne propone 60);
  - la veloce, «30-60 minuti» o «circa 35-50» (1516);
  - il cliente assente, con annullo, rimborso intero e merce a scaffale (342).
- **Ondata 4:**
  - «Contatta il venditore»: lo togliamo o lo costruiamo (22);
  - dopo quanti giorni scadono i documenti di chi si ferma a metà (1241);
  - cosa promettiamo al negozio al posto di «un'ora dopo la consegna» (185, 1811);
  - il permesso delle carte chiesto ai negozi (1812).
- **Ondata 5:** chi paga i 3 euro del fattorino in un rimborso dopo la consegna con carta, e su cosa si calcola la quota del negozio (191, 192, 1694). Può aspettare il livello 2.
- **Ondata 6:**
  - quali categorie sono escluse dal recesso (50);
  - la frase al posto di «zero commissioni» e «nessun costo mensile» (248, 261);
  - il cookie da 400 giorni (1687);
  - chi rilegge i Termini;
  - se tutti devono riaccettarli;
  - la commissione con IVA dentro o fuori, col commercialista (68, 190).
- **Ondata 6, per il pacchetto NL:** spegnere inviti e punti con una migrazione nuova; il credito già dato resta spendibile (107, 254, 9).

### Come si esegue ogni ondata (strumenti che esistono già)

1. Le schede: `node cervello/schede-pacchetto.mjs --piano <piano del passo 0.8> --ondata N --json`.
2. Il workflow `.claude/workflows/ondata-snella.js`, con args `{schede, repo, radice_ad, base: <git -C <sito> rev-parse HEAD>, tipo_costruisce:"tech", tipo_controlla:"qa"}`.
   - Ogni squadra fa passare `cervello/prova-rimessa.mjs`.
   - Un collaudo per ondata: lente A sempre, lente B in più su soldi, dati e permessi.
   - Un solo giro di correzione, poi si chiede a te.
3. Si ricuciono i rami e si lancia `npm run verify` una volta. Se l'ondata ha migrazioni, anche `tests/sql/harness/apply.sh`, `migrazione-su-database-pieno.sh` e `applica-migrazioni-mancanti.sh` due volte sulla copia, oppure il lavoro «Controlli database» della CI verde.
4. Poi `node cervello/radiografia-in-corsa.mjs --repo ../mycity`, e una richiesta di unione per ondata, che unisci tu.
5. **Il secondo binario** è una seconda sessione cloud, con il suo contenitore, creata con `create_session` e guidata con `send_message`. Si riallinea sul main appena unito prima del suo verify. Mai nello stesso contenitore: 4 processori fanno girare solo 2 agenti alla volta.
6. **Dopo l'unione:**
   - `node cervello/chiudi-sito.mjs <frammenti> --pr N --commit X --applica`;
   - `node cervello/conto-token.mjs --workflow <runId>` nel referto;
   - `node cervello/chiusura-loop.mjs registra …`;
   - i difetti vecchi visti strada facendo vanno nel registro e non aprono ondate.
7. **Dopo il rilascio:** la prova di fumo, `/api/health` e `/api/health/ready`, e 15 minuti di log su Vercel. Se qualcosa si rompe, si torna al rilascio che serviva i clienti.

### Verifica: come so che regge

- **Ogni pacchetto:** la sua prova è rossa senza la correzione e verde con la correzione (`prova-rimessa.mjs`, a zero agenti). Sui soldi si provano importi sotto e sopra 10 e 30 euro, uno e due negozi, contanti e carta, una risposta persa e un doppio tocco.
- **Ogni ondata:**
  - il collaudo;
  - `npm run verify` verde;
  - le prove SQL se ci sono migrazioni;
  - il perimetro coperto da `radiografia-in-corsa.mjs`;
  - la CI verde, «Controlli database» compreso.
- **Prima del primo cliente:**
  - ondate 1-7 unite;
  - `/api/health/ready` verde con la chiave;
  - un tuo ordine vero in contanti, da ospite sul telefono, dal carrello alla consegna col codice;
  - un ordine con carta e un rimborso nell'anteprima con le chiavi di test;
  - nel registro, `node cervello/pacchetti-lotto.mjs --sito --gravi` deve mostrare solo voci delle funzioni spente.
- **Prima della carta:** gli HELD firmati, il conto verificato da Stripe, l'ordine di prova riuscito. Solo dopo `CARTA_ACCESA=true`.
