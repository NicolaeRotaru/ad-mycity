---
data: 2026-11-01 14:00
sessione: S1 soldi e cassa
pr: https://github.com/NicolaeRotaru/mycity/pull/278
---

# Sessione S1, soldi e cassa: il referto delle due ondate

> **In due righe:** chiusi 16 difetti seri su 20 sui soldi del sito, più la parte costruibile della falla R83, tutti nella richiesta #278.
> Ne restano 4: 3 aspettano una tua scelta di soldi, 1 non ha retto.

## In parole semplici
Questa sessione doveva riparare 20 difetti seri del sito, tutti su soldi e cassa, in due ondate. Ne ha chiusi 16, più la parte della falla R83 che si poteva costruire. Il difetto più comune era il rimborso doppio. Esempio: un reso da 20 € pagato con la carta. Bastava che si perdesse una risposta del database. Il cliente riceveva 40 € e al negozio ne venivano tolti 36 invece di 18. Ora il secondo tentativo riconosce il rimborso già partito.
Dei 4 rimasti fuori, 3 aspettano una tua scelta di soldi e 1 non ha retto.

## Cosa cambia per te
- **Resi e rimborsi**: 6 casi di rimborso doppio chiusi. Coprono carta e contanti, uno e due negozi, risposta persa, ripresa dopo 24 ore.
- **Contestazioni in banca**: una semplice richiesta di informazioni della banca non toglie più i soldi al negozio. Una contestazione vinta non ripaga più un reso già rimborsato.
- **Cassa e carrello**: chi abita fuori dalla zona lo legge prima di premere «Ordina», anche con l'indirizzo scritto a mano. La fascia oraria che scade mentre il cliente paga ora lo dice.
- **Negoziante**: il cruscotto conta nell'incasso anche il credito MyCity usato dal cliente. Prima mostrava 5 € in meno sui primi ordini dei clienti nuovi.
- **Buono di benvenuto e inviti**: il buono torna valido per chi ha solo un ordine annullato (migrazione 185). Un invito scritto a mano nel database non può più incassare 5 € alla riaccensione degli inviti (migrazione 186).
- **Contanti**: se l'annullamento di un ordine cade, la chiave del tocco resta chiusa, così un secondo tocco non crea un doppione.

## Cosa devi fare
Cinque decisioni, che si leggono anche nel referto JSON (`scelte_per_nicola`):
- **Chi paga i codici sconto di MyCity.** Oggi li paga il negozio: su 20 € di pane con 5 € di sconto incassa 13,50 € invece di 18. Raccomando che li paghi MyCity. I codici oggi sono spenti, quindi al lancio non tocca nessuno.
- **Contestazione parziale vinta.** Esempio: ordine da 50 €, la banca ne contesta 20 e al negozio se ne tolgono 18. Raccomando di non togliere niente all'apertura e riprendere a mano solo se MyCity perde.
- **Contestazioni aperte prima della 184.** Raccomando un confronto in sola lettura con Stripe, poi una correzione firmata da te.
- **R83, il recupero dei buoni vecchi.** Lo script è pronto e di base gira a vuoto, senza scrivere niente. Lanciarlo sul serio è una tua firma.
- **R83, il rimborso parziale e la contestazione vinta del buono.** Le raccomandazioni sono nel JSON.

## Cosa non ho verificato
- Le migrazioni 185 e 186 le ho provate solo su un Postgres locale. Sul database vero non sono applicate.
- I rimborsi e le contestazioni le ho provate con uno Stripe finto, mai con uno vero.
- Il registro del sito e la copertura della radiografia in corsa non li ho scritti: in questo giro li tiene un'altra sessione (regola 4). La copertura del collaudo sta nel JSON, `copertura_collaudo`.

---

**Dettagli tecnici**

| Ondata | Workflow | Agenti | Gettoni senza letture cache | con letture | verify |
|---|---|---|---|---|---|
| 1 | wf_ce3dd54b-5fe | 8 | 643.615 | 10.157.816 | verde, 7160/7160 |
| 2 | wf_a73112d8-f2c | 10 | 862.795 | 16.993.681 | verde, 7213/7213 |

- **Già chiuso alla base.** «Se il database sbaglia una scrittura, Stripe non riprova»: le tre prove `se-il-database-sbaglia-stripe-riprova`, `nei-gestori-di-stripe-*` sono verdi (29), e togliendo il `throw` di `scritturaObbligatoria` diventano rosse 14 su 29.
- **Il fuori territorio dalla S2.** In `lib/ordini/veloce-non-confermata.ts` la frase dice già «senza costi finché il negozio non lo conferma», e la rotta di annullo accetta solo ordini NEW: nessuna modifica.
- **Non chiusi.** La merce riservata dei contanti: «non regge», serve la 187 con un giro che liberi la riserva. Niente secondo tentativo, su richiesta della sesta. Contestazione parziale vinta e contestazioni dopo la 063: «fermo per una scelta».
- **Prove SQL.** `apply.sh` (170 applicate, 0 fallite), `run.sh` verde, `migrazione-su-database-pieno.sh` verde. `applica-migrazioni-mancanti.sh` due volte: prima 1, poi 0. Le prove `rls/44` e `rls/45` sono rosse senza la loro migrazione e verdi con.
- **Fuori territorio.** `app/sign-up/page.tsx`: serve una rotta server per scrivere l'invito prima di riaccendere gli inviti. Gestire `charge.dispute.funds_withdrawn` in `app/api/stripe/webhook/route.ts`.
- **Il giro di correzione dell'ondata 2.** Ha chiuso un grave che il collaudo aveva trovato nella cassa. I minori nati e i vecchi visti sono nel JSON.
- **Il cancello dello stop.** Segnala che lo strumento Workflow non ha una guardia. Serve un freno in `.claude/settings.json` o una riga in ESENZIONI, con la firma di Nicola: non l'ho toccato.
- **Due file di prova vecchi modificati.** `tests/unit/l-ordine-con-un-appuntamento-gia-passato.test.ts`: regex allargata, resta rossa se si toglie lo spostamento. La prova SQL 08 della prima ondata è stata rinominata in 44 e usa uno stato d'ordine permesso.

## Correzione dopo il collaudo finale (2026-11-01 15:20)
Il collaudo finale della sesta sessione ha bocciato un solo pacchetto: il rimborso doppio dei resi, nel caso di un ordine pagato col credito MyCity. La #278 aveva chiuso solo la carta. Esempio: reso da 20 €, il credito esce, si perde la scrittura sul reso. Ai passi normali l'ordine contava 40 € su 20 usciti, e al negozio si toglievano 36 € invece di 18.
La correzione sta nella richiesta https://github.com/NicolaeRotaru/mycity/pull/282. Prima di segnare il rimborso si legge il diario del credito con la stessa chiave: se il credito c'è già e l'ordine lo conta, non si rifà niente.
Prove: la prova del collaudatore, rinominata e allargata. Copre 8 € e 35 €, il doppio tocco e due negozi. Una prova nuova sul carrello di due negozi, con 20 € e 25 € rimborsati sull'altro ordine, chiude il buco nel filtro dell'ordine. La prova rimessa regge. Il controllo completo è verde: 7462 prove passate, 1 saltata.
Cosa resta: un ordine con un altro rimborso, e insieme un credito uscito ma non contato, va ancora avanti come prima. È il guasto doppio già dichiarato.

## Correzione 2, dopo il secondo ricollaudo (2026-11-01 16:55)
Il ricollaudo della prima correzione ha trovato due guasti nuovi, tutti e due nel freno del credito.
- **Un altro reso lo ingannava.** Il freno deduceva «credito già contato» dal totale rimborsato. Esempio: due resi da 20 € sullo stesso ordine, e il secondo ha un guasto doppio. Il totale era già 20 € grazie al primo reso, quindi il secondo non si contava più.
- **Una funzione morta usciva in silenzio.** Se la funzione si fermava dopo il credito, la ripresa diceva «ok» senza riprendere la quota del negozio e senza avvisare nessuno.

Il rimedio è un segno per ogni reso, al posto del totale. Sull'ordine si scrive «wallet:<chiave del reso>» subito dopo la prenotazione. Se un passo cade, il segno si toglie insieme a lei.
- Se ci sono il segno e il credito, non si rifà niente. Se lo stato del pagamento non è mai stato scritto, si avvisa chi amministra.
- Se c'è il segno ma non il credito, si finisce il lavoro senza prenotare di nuovo.
- Se il segno non c'è, si va come sempre.

Prove: le due del collaudatore, rinominate, più il caso «morta fra la prenotazione e il credito». I casi a ciclo ora mordono anche con 8 € su 50 e 31 € su 80. La prova rimessa regge. Il controllo completo è verde: 7471 prove passate, 1 saltata. Commit 1539bbe, richiesta #282.

## Correzione 2: non regge (2026-11-01 17:00)
Anche il secondo ricollaudo è rosso, con tutte e due le lenti. È il terzo rosso sullo stesso pezzo. Per la regola fissata da Nicola, la correzione resta fuori. La richiesta #282 resta aperta come materiale per un giro futuro, e il ramo non si tocca.
- **Cosa chiude.** Le tre prove rosse dei collaudi di prima sono verdi. Il segno `wallet:<chiave>` non rompe chi legge l'elenco dei rimborsi. I casi da 8 € su 50 e da 31 € su 80 mordono.
- **Cosa resta aperto.** Il caso è un ordine da 40 € pagato tutto col credito. Il reso A da 20 € va a buon fine. Il reso B da 20 € si ferma subito dopo l'uscita del credito. Alla ripresa il freno trova lo stato «rimborsato in parte», ma l'ha scritto A, non B. Così risponde ok: al negozio si tolgono 18 € invece di 36, e nessuno viene avvisato. Il freno guarda lo stato del pagamento, e l'altro rimborso l'ha già cambiato.
- **Due gravi nati.**
  - **Ripresa con un'altra cifra.** Il cliente riceve 15 € di credito, ma l'ordine ne conta 20 e al negozio si tolgono 13,50 €, senza avvisi. Il segno del credito non porta la cifra.
  - **Due guasti nella stessa richiesta.** Se il catch non riesce a togliere il segno ma storna la prenotazione, l'ordine conta 0 € e il tetto lascia rimborsare altri 40 €.
- **Un minore.** Se il reso supera metà dell'ordine, i passi «ricevuto» e «rimborsato» non arrivano mai al rimborso.
- **La strada per il giro futuro.** Un segno per chiave che porti anche la cifra, come quello del bonifico, e la ripresa decide da quel segno. Il catch deve togliere il segno prima di stornare la prenotazione, oppure non stornarla se non riesce a toglierlo.
