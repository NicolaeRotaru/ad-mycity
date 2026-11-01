---
data: 2026-11-01 14:00
sessione: S1 soldi e cassa
pr: https://github.com/NicolaeRotaru/mycity/pull/278
---

# Sessione S1, soldi e cassa: il referto delle due ondate

> **In due righe:** chiusi 15 difetti seri su 20 sui soldi del sito, più la parte costruibile della falla R83, tutti nella richiesta #278.
> Ne restano 5: 3 aspettano una tua scelta di soldi, 2 non hanno retto.

## In parole semplici
Questa sessione doveva riparare 20 difetti seri del sito, tutti su soldi e cassa, in due ondate. Ne ha chiusi 15, più la parte della falla R83 che si poteva costruire. Il difetto più comune era il rimborso doppio. Esempio: un reso da 20 € pagato con la carta. Bastava che si perdesse una risposta del database. Il cliente riceveva 40 € e al negozio ne venivano tolti 36 invece di 18. Ora il secondo tentativo riconosce il rimborso già partito.
Dei 5 rimasti fuori, 3 aspettano una tua scelta di soldi e 2 non hanno retto.

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
- Il difetto «se il database sbaglia una scrittura, Stripe non riprova» non è chiuso. Sembra già riparato alla base, ma nessuno l'ha ricontrollato riga per riga.

---

**Dettagli tecnici**

| Ondata | Workflow | Agenti | Gettoni senza letture cache | con letture | verify |
|---|---|---|---|---|---|
| 1 | wf_ce3dd54b-5fe | 8 | 643.615 | 10.157.816 | verde, 7160/7160 |
| 2 | wf_a73112d8-f2c | 10 | 862.795 | 16.993.681 | verde, 7213/7213 |

- **Non chiusi.** Il webhook che non lancia sulle scritture: «non regge», da ricontrollare. La merce riservata dei contanti: «non regge», serve la 187 con un giro che liberi la riserva. Niente secondo tentativo, su richiesta della sesta. Contestazione parziale vinta e contestazioni dopo la 063: «fermo per una scelta».
- **Prove SQL.** `apply.sh` (170 applicate, 0 fallite), `run.sh` verde, `migrazione-su-database-pieno.sh` verde. `applica-migrazioni-mancanti.sh` due volte: prima 1, poi 0. Le prove `rls/44` e `rls/45` sono rosse senza la loro migrazione e verdi con.
- **Fuori territorio.** `app/sign-up/page.tsx`: serve una rotta server per scrivere l'invito prima di riaccendere gli inviti. Gestire `charge.dispute.funds_withdrawn` in `app/api/stripe/webhook/route.ts`.
- **Il giro di correzione dell'ondata 2.** Ha chiuso un grave che il collaudo aveva trovato nella cassa. I minori nati e i vecchi visti sono nel JSON.
- **Il cancello dello stop.** Segnala che lo strumento Workflow non ha una guardia. Serve un freno in `.claude/settings.json` o una riga in ESENZIONI, con la firma di Nicola: non l'ho toccato.
- **Due file di prova vecchi modificati.** `tests/unit/l-ordine-con-un-appuntamento-gia-passato.test.ts`: regex allargata, resta rossa se si toglie lo spostamento. La prova SQL 08 della prima ondata è stata rinominata in 44 e usa uno stato d'ordine permesso.
