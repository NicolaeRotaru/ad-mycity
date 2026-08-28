---
data: 2026-08-28 17:05
tipo: riparazione-marketplace
lotto: bloccanti della radiografia del 27 agosto
pr: NicolaeRotaru/mycity#244
ramo: claude/marketplace-issues-q9v8c5
colore: 🟡 (codice in un ramo, nessuna pubblicazione)
---

# I quattro problemi che fermavano gli incassi sono riparati, gli altri 190 no

**In due righe.** Hai chiesto se si risolve tutto in un colpo solo. Tutti e 194 no. Sarebbe una
modifica che nessuno può rileggere. I quattro che fermano gli incassi sì: sono su una richiesta di
unione, ognuno con la sua prova che diventa rossa se il difetto torna.

## In parole semplici

La radiografia del 27 agosto ha contato 194 problemi. Quattro erano bloccanti. Bloccante vuol dire
che con quello in piedi non si va live. Gli altri 190 su 194 sono gravi e minori. Quelli vanno a
lotti.

Perché non tutti insieme. Qui un problema grave o bloccante si chiude con una prova che gira. Cioè
un comando che diventa rosso se il difetto c'è, non una frase in un documento. Quattro prove nuove si
scrivono e si collaudano in un giro. Centonovantaquattro no. Ti consegnerei un lavoro che nessuno può
controllare, e quindi non sapresti se è vero.

## Cosa cambia per te

**Il catalogo torna visibile a chi non ha l'account.** Prima un visitatore leggeva zero prodotti,
zero recensioni, zero risultati di ricerca. I negozi in home si vedevano lo stesso: il sito sembrava
vivo, poi cliccando un prodotto usciva «Prodotto non trovato». La causa era una regola che chiedeva
«il negozio è approvato?» dentro la tabella dei profili, chiusa al pubblico a fine luglio per non
esporre IBAN e documenti: la domanda tornava sempre falsa e nessun prodotto passava. Adesso quella
domanda la fa una funzione che legge coi permessi del database e risponde solo sì o no. I profili
restano chiusi esattamente come prima, e la prova nuova controlla anche quello.

**Il negozio che rifiuta un ordine pagato con la carta restituisce i soldi.** Prima il pulsante
«Rifiuta» passava dal database, che a Stripe non può parlare. Al cliente arrivava «Niente addebiti»
mentre l'addebito restava sulla carta, per sempre. È il caso più normale del primo mese: focacce
finite, negoziante di fretta. Adesso il rifiuto passa dalla stessa strada dell'annullamento del
cliente: prima rimborsa, poi annulla. Se il rimborso non riesce, l'ordine non risulta rifiutato.

**La campanella del negozio non può più perdersi.** Su un ordine con carta l'avviso al negoziante
partiva come lavoro che nessuno aspetta. La macchina che ospita il sito si spegne appena ha risposto,
quindi quel lavoro poteva morire a metà. Ordine pagato, soldi incassati, cliente che aspetta, e in
negozio non squilla niente. Adesso la campanella si scrive prima di rispondere.

**Il cancello del rilascio dice di essere spento.** Prima mostrava una spunta verde identica a
quella di un rilascio controllato. Adesso lo scrive in cima al riepilogo.

Un caso vero, per capire il primo. Pane Quotidiano mette in vetrina la focaccia. Una cliente vede il
post di lunedì e apre il sito dal telefono. È la prima volta, quindi non ha un account. Vede il
negozio, clicca sulla focaccia, legge «Prodotto non trovato» e chiude. Per lei MyCity è un sito
rotto. Non torna. Da adesso quella cliente la focaccia la vede e la può comprare.

## Cosa devi fare

**Un minuto, adesso:** apri il sito in una finestra anonima, senza fare l'accesso, e clicca un
prodotto. Dimmi cosa vedi. Se il prodotto si apre, in produzione c'è una regola aggiunta a mano che
nel progetto non c'era, e allora il difetto è un altro: il sito vero e il codice non dicono la stessa
cosa. È la card #181.

**Le tre chiavi Vercel le devi mettere tu**, perché sono segreti sul tuo GitHub. Nell'ordine: prima
le chiavi, poi una prova di rilascio su un cambio innocuo, e solo dopo si spegne la pubblicazione
automatica. Te le chiede già la card #161, ferma dal 22 agosto: non te ne ho aperta un'altra.

**La firma sull'unione della richiesta 244.** Finché non la unisci, niente di questo tocca il sito.

## Cosa non ho verificato

**Il sito pubblicato, in nessun punto.** Tutto è misurato sul codice e su un database ricostruito
dalle 130 migrazioni del progetto su un Postgres avviato qui dentro.

**Nessun ordine vero, nessuna carta addebitata, nessun rimborso chiesto a Stripe.** Le prove sui
soldi girano con uno Stripe finto: dicono che il rimborso viene chiesto una volta sola e per
l'importo giusto, non che Stripe lo esegue davvero.

**Le email non le ho viste arrivare.** La prova dice che partono dentro il meccanismo che tiene viva
la funzione, non che il servizio di posta le consegna.

**Il quarto bloccante non è chiuso, è dichiarato.** Finché le chiavi non ci sono, il rilascio resta
quello automatico. Quello che ho chiuso è il difetto che avrebbe fatto fallire l'accensione.

**Gli altri 190 problemi sono ancora tutti lì.** Nessuno di loro è stato toccato da questo lavoro.

## Dettagli tecnici

| Prova nuova | Senza la riparazione |
|---|---|
| `tests/sql/rls/19-il-catalogo-si-vede-anche-senza-account.test.sql` | 8 controlli su 10 rossi |
| `tests/unit/il-rifiuto-del-negozio-restituisce-i-soldi.test.ts` | 5 su 8 rossi |
| `tests/unit/la-campanella-del-negozio-non-si-perde.test.ts` | 2 su 2 rossi |
| doppio giro di `scripts/applica-migrazioni-mancanti.sh` in CI | il ciclo vecchio muore su `001_create_tables.sql` |

Le due prove unitarie sono state provate al contrario davvero: rimesso dentro il file il
comportamento di prima diventano rosse, ripristinata la riparazione tornano verdi.

File toccati: `migrations/129_il_catalogo_si_vede_senza_account.sql` (nuovo) ·
`app/api/seller/orders/[id]/reject/route.ts` (nuovo) · `lib/api/dopo-la-risposta.ts` (nuovo) ·
`scripts/applica-migrazioni-mancanti.sh` (nuovo) · `lib/ordini/annulla.ts` ·
`lib/stripe/webhook/ordini.ts` · `app/api/orders/cod/route.ts` · `app/seller/orders/[id]/page.tsx` ·
`tests/sql/rls/10-nessuna-porta-nuova-aperta-agli-anonimi.test.sql` (lista bianca) ·
`.github/workflows/ci.yml` · `.github/workflows/deploy-dopo-ci.yml`.

Verificato in sessione: 1538 prove unitarie verdi, 19 file di controlli sul database verdi su uno
schema ricostruito da zero, l'ultima migrazione applicata su un database con dentro degli ordini,
typecheck pulito, lint senza errori, build di produzione riuscita.

Un collaudo indipendente non c'è stato: in questa sessione non potevo affidare il lavoro a un
secondo agente, quindi ho costruito e provato io. Il sostituto è la prova al contrario — rimettere il
codice vecchio e vedere le prove diventare rosse — che almeno esclude una prova che passa comunque.
È debito dichiarato, non lavoro finito.
