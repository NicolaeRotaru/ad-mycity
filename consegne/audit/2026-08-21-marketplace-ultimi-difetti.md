---
data: 2026-08-21 03:30
tipo: riparazioni-marketplace
referto_di_partenza: consegne/audit/2026-08-18-radiografia.md
aperti_a_inizio: 29
riparati: 21
riparati_in_parte: 3
gia_a_posto: 5
ramo: claude/marketplace-bugs-njlgi8 (repo NicolaeRotaru/mycity)
---

# Gli ultimi difetti del sito sono chiusi, e ne è saltato fuori uno più grosso di tutti

**In due righe.** Dei ventinove difetti rimasti aperti, cinque erano già stati
riparati e nessuno l'aveva segnato, ventuno li ho chiusi oggi, tre restano a
metà e ti dico perché. Lavorando ne ho trovato uno nuovo che nessuna
radiografia aveva visto: **la vetrina dei negozi era rotta, e non mostrava
nessun negozio.**

## In parole semplici

Ecco il conto.

| | 18 agosto | 19 agosto | 20 agosto | oggi |
|---|---:|---:|---:|---:|
| Bloccanti | 12 | 4 | 1 | 0 |
| Gravi | 114 | 76 | 15 | 2 |
| Minori | 119 | 60 | 13 | 1 |
| **Aperti in tutto** | **245** | **141** | **29** | **3** |

I tre che restano sono a metà, non fermi: di ognuno è fatta la parte che si
poteva fare, e sotto c'è scritto cosa manca e perché.

## Cosa cambia per te

Le cose più grosse, in ordine di quanto costavano.

**La vetrina dei negozi non mostrava nessun negozio.** Questo non era sulla
lista: l'ho trovato riparando il riquadro in cima alla home. A marzo la vetrina
pubblica aveva due colonne che dicono se un negozio può incassare — servono al
bollino «Verificato». Una modifica successiva ha ricostruito la vetrina senza
quelle due colonne, scrivendo nel commento che sarebbero tornate dopo. Non sono
mai tornate.

Il punto è come reagisce il database: se chiedi una colonna che non c'è, non ti
dà il resto — rifiuta tutta la richiesta. E sei pagine del sito chiedono proprio
quelle due colonne: l'elenco dei negozi, i negozi vicini, la pagina del singolo
negozio, il riquadro in cima alla home, la scheda del venditore sotto ai
prodotti, la vetrina in home. Nessuna di quelle riceveva un negozio senza
bollino. Non ricevevano **niente**.

**Il fattorino non veniva pagato per nessuna consegna in contanti.** Gli si
chiedeva di rimettere tutto l'incasso, fee di consegna compresa. E l'unica
funzione che paga un fattorino esce subito sugli ordini in contanti: nessun
bonifico partiva, mai.

Un esempio. Luca porta una spesa da 34 euro in via Verdi, il cliente paga in
contanti alla porta. Luca rimette 34 euro. Dei suoi 3 euro di compenso non vede
niente, oggi né mai. E il contrassegno è il modo di pagare naturale del cliente
anziano di Piacenza: alla seconda settimana i fattorini smettono di prendere
quegli ordini. Ora Luca rimette 31 euro e tiene i suoi 3.

**Il ritiro in negozio non arrivava mai a «consegnato».** L'unico modo di
chiudere un ordine era il pulsante del fattorino, e su un ritiro il fattorino
non c'è. L'ordine restava «pronto» per sempre: il negoziante consegnava la merce
a mano, incassava zero e vedeva il pagamento fermo all'infinito; il cliente
vedeva «in corso» e non poteva nemmeno lasciare una recensione. Il 20 agosto
l'opzione era stata spenta per aggirarlo; adesso la strada c'è, e si può
riaccendere quando ne parli coi negozi.

**Il rimborso toglieva al negozio più del dovuto.** Su un ordine in contanti
pagato in parte col credito MyCity, il conto usava due basi diverse: il numeratore
sul lordo di vendita, il denominatore su quello che restava dopo il credito. Un
esempio vero: ordine da 50 euro, 20 pagati col credito, rimborso da 10. Al
negozio venivano tolti 15 euro invece di 9. E un ordine coperto per intero da una
gift card non era rimborsabile affatto, né dal reso né dal reclamo.

**Contestazione vinta: al negozio i soldi tornavano, al fattorino no.** Quando
arriva un chargeback la piattaforma richiama indietro sia il pagamento al negozio
sia il compenso del fattorino. Se poi si vince, il codice rimetteva in coda solo
il negozio. Il fattorino restava «stornato» per sempre: aveva fatto la consegna,
noi tenevamo l'incasso, e lui non veniva pagato. Senza nessun avviso.

**Il sito non serviva nessuna pagina già scritta.** Due su duecentotré.

Anche le pagine che non cambiano mai venivano ricalcolate a ogni visita. Le
condizioni di vendita, per dire. La causa era una riga sola: il guscio comune
leggeva la lingua del browser a ogni caricamento. Quella lettura rende dinamica
ogni pagina del sito.

Ora sono novantasei su duecentotré. L'ho misurato confrontando due compilazioni
vere, prima e dopo.

**Metà delle foto restava a 400 pixel su ogni telefono.** Erano marcate «non
ottimizzare», e quella parola cancella anche l'elenco delle varianti: l'attributo
che dice al browser quale foto scaricare non faceva più niente. Su un telefono
recente la scheda prodotto ne chiede circa 540 e ne riceveva 400, ingrandita —
proprio sulla foto che deve far venire voglia di comprare.

**Ordine in contanti da due negozi: il primo riceveva la posta di un ordine
cancellato.** Gli avvisi partivano dentro il ciclo, un negozio per volta. Se al
secondo mancava la merce, l'annullamento cancellava gli ordini ma le email erano
già uscite: il primo negozio si metteva a preparare pane e fiori per un ordine
che non esisteva.

**L'acquisto veniva contato solo se il cliente tornava sulla pagina ordini.** Chi
chiudeva la scheda dopo aver pagato aveva un ordine nel database e nessun
acquisto nella misura. Ogni tasso di conversione poggiava su un fatturato più
basso del vero di una quantità che nessuno conosce. Diventa un problema serio il
giorno in cui parte spesa pubblicitaria: si deciderebbe il budget su un numero
falso.

**C'era un filtro sui contenuti vietati scritto per intero e collegato a
niente.** Il commento in cima diceva «da collegare più avanti», e quel più avanti
non è mai arrivato. Un filtro che esiste e non gira, davanti a un'ispezione, è
peggio di uno che non c'è: prova che il rischio era stato riconosciuto.

## Cosa devi fare

**Tre cose, e sono in coda con i loro numeri.**

**① Applicare la migrazione 124 al database** (carta #140). È un'azione a parte
dall'unire la richiesta: unire pubblica il codice, non tocca il database. Senza
questa firma metà delle riparazioni di oggi non è attiva, e la vetrina dei negozi
resta vuota.

**② Decidere sul rilascio** (carta #141). Oggi il rilascio in produzione parte
insieme ai controlli, non dopo: se un controllo diventa rosso, il codice rotto è
già online. La metà buona esiste già ed è spenta perché le manca un indirizzo.
Tre mosse, tutte tue perché toccano la produzione.

**③ Un Supabase di prova** (carta #139). Due gruppi di controlli si saltano da
soli perché mancano i segreti di un progetto di prova. Da oggi almeno lo dicono
in cima al riepilogo invece che dentro il log, ma restano saltati.

**E una decisione quando vuoi:** il ritiro in negozio adesso funziona fino in
fondo. Si riaccende cambiando una riga, ma prima ne devi parlare coi negozi —
come avevi detto tu il 20 agosto.

## Cosa non ho verificato

Non ho aperto il sito in un browser. Non ho fatto un ordine, non ho pagato con
una carta di prova, non ho premuto il pulsante nuovo del ritiro in negozio. Non
ho visto il pannello di Render né le impostazioni di GitHub.

La migrazione 124 non è stata applicata a nessun database vero: l'ho applicata a
un Postgres di prova qui dentro, ricostruendo lo schema da zero con tutte e 125
le migrazioni in fila.

**Ecco i tre lavori lasciati a metà, uno per uno.**

- **Le tre pagine che portano soldi restano composte dal browser.** Ho tolto la
  causa che rendeva dinamico tutto il sito. I dati che servono a Google sulla
  scheda prodotto adesso stanno nell'HTML. Ma convertire scheda prodotto,
  categoria e negozio in pagine scritte dal server è un lavoro a sé: la sola
  scheda prodotto è milleduecento righe con trenta punti interattivi. Senza
  poter aprire il sito in un browser non si riscrive alla cieca.
- **I tre percorsi nel browser non ci sono.** Il difetto vero era un altro:
  nessuna prova percorreva la catena dell'ordine fino in fondo. È per questo che
  i due bloccanti del referto erano rimasti in piedi, con novantuno file di
  prove già scritti. Adesso quella catena è provata, da un controllo sul
  database che gira già oggi senza chiavi: ordine, accettazione, pronto, presa
  in carico, codice di ritiro, codice di consegna, pagabilità al negozio. Ma
  provare il database non è provare quello che vede il cliente. Per quello serve
  la carta #139.
- **Le due mosse sul rilascio sono tue.** Carta #141.

Delle ventuno riparazioni, diciotto hanno una prova nuova che diventa rossa
senza di loro. Le altre tre sono coperte dalle prove esistenti. La divisione del
gestore dei pagamenti, per esempio, è uno spostamento senza cambi di logica: il
fatto che le prove sul webhook restino verdi senza una riga modificata è
esattamente la dimostrazione che serviva.

---

## Dettagli tecnici

**Dove sta il lavoro.** Repo `NicolaeRotaru/mycity`, ramo
`claude/marketplace-bugs-njlgi8`, sei commit sopra `de98c10`.

**Cancelli eseguiti.** `tsc --noEmit` pulito · `next lint` zero errori (95
avvisi di accessibilità preesistenti, invariati) · `vitest run` 933 verdi su 933
(erano 876) · schema ricostruito da zero su Postgres 16 con tutte e 125 le
migrazioni, zero fallite · otto file di controlli SQL verdi · due build di
produzione riuscite.

**Le prove che diventano rosse senza la riparazione.**
`tests/sql/rls/07-ritiro-in-negozio-arriva-a-consegnato.test.sql` (7 controlli) e
`tests/sql/rls/08-la-vetrina-e-la-catena-dell-ordine.test.sql` (11 controlli)
falliscono su un database senza la 124. Fra le unitarie:
`rimborso-diviso-per-il-lordo` · `contestazione-vinta-paga-anche-il-fattorino` ·
`middleware-non-aspetta-la-rete` · `foto-che-si-adattano-allo-schermo` ·
`il-filtro-e-collegato` · `ordini-contrassegno-due-negozi` (casi nuovi) ·
`api-rider-cash-confirm` (casi nuovi).

**Misure, non impressioni.**

| | prima | dopo |
|---|---:|---:|
| Pagine servite dalla cache | 2 su 203 | 96 su 203 |
| Righe della rotta del webhook | 1002 | 178 |
| Colonne nei tipi del database | 191 | 740 |
| Prove unitarie verdi | 876 | 933 |

**Migrazione 124** (`migrations/124_radiografia_21_agosto.sql`):
`gross_total_cents` sull'ordine + `accumula_rimborso` col tetto sul lordo ·
contatori `payout_tentativo` e `rider_payout_tentativo` per le chiavi di
idempotenza · `confirm_pickup_by_seller` + stato `CASH_IN_STORE` · stati
`HELD` e `CASH_WITHHELD` sul compenso del fattorino · vista
`ordini_disponibili_rider` senza i ritiri · **vetrina pubblica con i due
booleani di stato pagamento** · funzione `vetrina_home` · tabella
`payment_attempts` · due indici per gli avvisi.

**Divisione del gestore dei pagamenti.** `app/api/stripe/webhook/route.ts` da
1002 a 178 righe; i gestori in `lib/stripe/webhook/`: `comune`, `ordini`,
`giftcard`, `sponsorizzati`, `abbonamenti`, `rimborsi`, `dispute`,
`trasferimenti`, `pagamenti`.

**Il registro.** `MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json`
porta il blocco `stato_lotto_21_agosto` col conto, le note su ogni riparazione e
l'elenco di cosa resta.
