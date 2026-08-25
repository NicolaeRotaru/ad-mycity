---
data: 2026-08-23 18:20
titolo: La parte venditore, guardata per la prima volta e riparata
per: Nicola
tipo: analisi, poi riparazione
colore: 🟡 il codice è in una richiesta di unione, la firma è tua
---

# 🏪 La parte venditore, guardata per la prima volta

L'area venditore è il pannello che il negoziante apre per vedere i suoi ordini e i suoi soldi. Questo foglio serve a dire cosa ci ho trovato dentro, adesso che l'ho guardata.

## In due righe

Tutte e undici le pagine del venditore erano costruite con due stati invece di tre.
Quando una lettura falliva non lo diceva: **la pagina dei Guadagni mostrava zero incassato**. L'ho guardata, e poi riparata.

## In parole semplici

Una schermata che carica dei dati può trovarsi in tre situazioni: *sto ancora leggendo* · *ho letto e non c'è niente* · *la lettura è fallita*. Se ne prevedi solo due, la terza finisce dentro una delle altre. E finisce sempre nella peggiore: «la lettura è fallita» diventa «non c'è niente».

Sul lato cliente questa cosa l'abbiamo appena riparata: sono i sette difetti della richiesta **#242**, quella del carrello che diceva «sei vuoto» a chi ce l'aveva pieno.

**La parte venditore non l'aveva mai guardata nessuno.** Ho contato: undici pagine, ventinove letture, e la parola che chiede *«la lettura è andata storta?»* non compare nemmeno una volta.

**Per esempio**, la pagina dei Guadagni. Il negoziante la apre per sapere quanto ha incassato. Poi la lettura degli ordini fallisce, perché la rete è caduta o il database non risponde. La pagina non se ne accorge. Disegna la lista vuota che aveva pronta per partire, e quindi mostra tutti i numeri a zero.

E in cima alla stessa pagina c'è scritto: **«Incassi reali dai tuoi ordini»**. Dichiara di essere reale su numeri che non ha mai ricevuto.

## Cosa cambia per te

Sono quattro reperti nuovi nel referto del sito, e li ho ordinati per quanto fanno male.

| Dove | Cosa succede quando la lettura fallisce |
|---|---|
| **Guadagni** | il sito dice al negoziante che non ha incassato niente |
| **Bacheca** | lo scheletro di caricamento resta lì **per sempre**, senza un modo di sapere che è fallito né di riprovare |
| **Le altre otto** | prodotti, ordini, clienti, recensioni: tutto vuoto, come se il negozio non avesse niente |
| **Andamento** | qui l'errore si vede — ma perché la pagina si schianta, non perché qualcuno l'ha deciso |

L'ultima riga è quella che mi preoccupa di più a lungo termine. Quella pagina si comporta bene **per caso**: legge un dato che non c'è, cade, e il riquadro d'errore dell'area la raccoglie. Basta che qualcuno aggiunga una riga difensiva per fare pulizia, e quella pagina smette di cadere. Da lì in poi mostra zeri come i Guadagni. Peggiora in silenzio proprio mentre sembra che la si stia sistemando.

## Cosa devi fare

Guardare la richiesta **#242**, perché nel frattempo l'ho riparato.

Quando una lettura fallisce, adesso il negoziante legge che la lettura è fallita, con un pulsante per riprovare. Non un numero che non è vero.

Il valore vero non è l'undicesima pagina riparata. È che **la dodicesima nasca già con i tre stati**: c'è una prova che legge le pagine vere e diventa rossa se qualcuna torna alla forma vecchia.

## Cosa non ho verificato

**Non ho aperto il sito con gli occhi.** Ho letto il codice, contato, e fatto girare le prove. Che a schermo il riquadro d'errore si veda bene va guardato dal vivo, e per farlo serve un negozio vero che abbia ordini.

**La riparazione l'ho provata rompendola.** Ho disfatto il fix cinque volte, in cinque punti diversi, e ogni volta le prove sono diventate rosse. Ma sono prove che eseguono le funzioni e leggono i file: non hanno aperto una pagina.

**Ho guardato una malattia sola:** gli stati che mentono. Restano fuori il layout, i testi, le immagini e i flussi. Questa è la prima passata, non il controllo completo.

**Non so se «design della parte venditore» per te vuol dire questo.** Me l'hai chiesto subito dopo il worker per le botteghe. Potresti intendere *come apparirà il worker dentro il pannello del negoziante*. Ho cominciato da quello che c'è adesso, perché il pannello è la stanza dove quel worker andrà comunque a stare. Se intendevi l'altra cosa, dimmelo e cambio strada.

---

## Dettagli tecnici

**Il conto.** `app/seller/` porta 21 file, di cui 16 pagine. Undici usano `useQuery`, per un totale di 29 letture. `isError` compare **zero** volte. Otto pagine dichiarano un ripiego (`data: X = []`), che è ciò che trasforma il fallimento in un elenco vuoto.

**Perché il fallimento non sale.** `components/providers/QueryProvider.tsx` non imposta `throwOnError`, e ha `retry: 1`. Quindi dopo un tentativo di ripetizione la query smette, `isLoading` torna falso, `data` resta `undefined` e il valore di ripiego prende il suo posto. Il confine d'errore dell'area (`app/seller/error.tsx`) esiste e funziona, ma raccoglie solo chi *cade*: una pagina che disegna zeri contenta non gli arriva mai.

**Le tre forme, con la riga esatta:**

| Forma | File | Riga |
|---|---|---|
| zero silenzioso | `app/seller/earnings/page.tsx` | `const { data: orders = [], isLoading } = useQuery(...)` poi `if (isLoading) return <LoadingState />` |
| scheletro eterno | `app/seller/dashboard/page.tsx:180` | `if (isLoading \|\| !stats) return <LoadingState />` |
| schianto fortunato | `app/seller/analytics/page.tsx:223` | `if (!userId \|\| isLoading) return ...` e alla riga dopo `analytics.topProducts[0]` |

**La cura esiste già:** `lib/stato-vista.ts` nel repo del marketplace, funzione `statoDellaVista({letto, caricando, errore, quanti})`. La regola che serve qui è quella che quel file già pretende: **«vuoto» esce solo con `letto: true`**, perché è un'affermazione sul mondo e non si può fare prima di aver guardato.

**Reperti registrati** nel referto del sito (`radiografia-marketplace.json`), dimensione `stati-ui`: tre gravi e un minore, adesso `in-corso` e agganciati alla #242. Il totale dichiarato e i conti per gravità sono aggiornati nello stesso lavoro — 414 reperti, 14 bloccanti, 179 gravi, 221 minori.

**La riparazione.** `lib/vista-query.ts`: si passa la lettura intera e si riceve il verdetto. Il punto che conta è la definizione di «letto», che qui vuol dire **«c'è un dato in mano»** e non «la lettura è finita» — è esattamente la differenza che il difetto sfruttava, perché con `isLoading` falso e `data` a `undefined` la pagina credeva di aver letto.

**Avevo costruito anche un componente-riquadro, e non lo usava nessuno: l'ho tolto.** Un pezzo che nessuno attraversa è la stessa malattia che stavo curando.

**L'invariante di struttura ha trovato due punti che mi erano sfuggiti** — i venduti nel catalogo e le campagne in promozione — più un falso rosso su un mio stesso commento, che citava la forma malata per spiegarla. Le prove: 15 casi, 5 mutazioni verificate rosse a mano.
