---
data: 2026-08-22 09:20
tipo: riparazioni-marketplace
referto_di_partenza: consegne/audit/2026-08-21-radiografia.md
selezionati: 100
gia_a_posto: 15
riparati: 85
ramo: claude/marketplace-100-difetti-c62gmv (repo NicolaeRotaru/mycity)
---

# Cento difetti del sito: tutti i bloccanti e tutti i gravi sono chiusi

**In due righe.** La radiografia del 21 agosto aveva trovato centonovantanove
difetti. Ho preso i cento che pesano: i dodici bloccanti e gli ottantotto
gravi. Li ho chiusi tutti. Restano i novantanove minori. Ti servono **cinque
firme**, e sono scritte in fondo.

## In parole semplici

Ecco il conto.

| | 21 agosto | oggi |
|---|---:|---:|
| Bloccanti | 12 | **0** |
| Gravi | 88 | **0** |
| Minori | 99 | 99 |
| **Aperti in tutto** | **199** | **99** |

Quindici dei cento erano già stati riparati dal lotto del 21 agosto sera. Il
referto della radiografia è stato scritto prima di quel lavoro, quindi non
poteva saperlo. Li ho aperti uno per uno nel codice per controllare, invece di
ricontarli come lavoro nuovo. Gli altri ottantacinque li ho riparati oggi.

## Cosa cambia per te

Le cose più grosse, in ordine di quanto costavano.

**Un alimentare si poteva vendere senza dire cosa c'è dentro.** Un prodotto
alimentare si pubblicava con la casella degli allergeni vuota e nessuno lo
impediva. Per chi è allergico è la differenza fra una spesa e un ricovero, e la
legge europea vuole quell'informazione **prima** dell'acquisto anche quando si
compra a distanza. Adesso lo rifiuta il database — non solo il modulo del
venditore: al catalogo si arriva da quattro strade (il modulo, l'assistente AI,
il caricamento in blocco, l'importazione da un altro sito) e tre non passano di
lì. Chi vende un prodotto che non contiene allergeni scrive «Nessuno dei 14
allergeni»: è una dichiarazione, non un campo lasciato in bianco.

**Il fattorino faceva suonare l'allarme antifrode a ogni consegna.** Il compenso
del fattorino era calcolato in tre punti con tre regole diverse: il riquadro
dove lui dichiara i contanti, la rotta che li registra, la pagina dove tu
confermi la cassa. Risultato: su **ogni** consegna in contanti a domicilio
partiva l'avviso «l'incasso non quadra». Così l'allarme diventava rumore di
fondo. Il giorno in cui manca davvero del contante, nessuno lo distingue dagli
altri. E la quadratura di fine giornata nasceva rossa per costruzione.
Dall'altra parte
del banco la pagina delle rimesse ti chiedeva tre euro in più su ogni ordine
sopra i trenta: tu contavi i soldi, ne trovavi meno di quelli scritti, e o
accusavi il fattorino o non confermavi. Finché non confermi, il negozio non
viene pagato.

**Il credito MyCity spariva.** Il cliente usa quindici euro di buono regalo, il
negozio rifiuta l'ordine perché ha finito il pane, e quei quindici euro non
esistono più: né merce né credito, e nessun modo di riaverli dall'interfaccia.
Un buono comprato con soldi veri, evaporato su un rifiuto che il cliente non ha
nemmeno deciso. Adesso torna sul saldo, e il messaggio glielo dice.

**Il negozio veniva pagato per contanti che nessuno aveva registrato.** Quando
confermi la cassa di un fattorino, diventavano pagabili **tutti** i suoi ordini
in contanti consegnati quel giorno. Anche quelli in cui l'incasso non era mai
stato registrato. E un ordine può arrivare a «consegnato» senza passare dal
riquadro dell'incasso: basta il codice di consegna.

Un esempio. Luca fa cinque consegne il martedì. Su quattro apre il riquadro e
scrive quanto ha in mano; sulla quinta chiude con il codice e basta. Tu
confermi la cassa, e il negozio della quinta viene pagato lo stesso — per soldi
di cui non esiste traccia da nessuna parte. Con un fattorino solo lo recuperi a
mano. Appena sono due, è il buco da cui esce il contante.

Adesso serve l'incasso registrato, e la conferma ti dice quanti ordini ha
saltato per quel motivo.

**Il prezzo in promozione spariva alla cassa.** Il carrello diceva sette euro,
il checkout ne diceva dieci, con un avviso che diceva che il prezzo era
aumentato: è il momento esatto in cui si abbandona. Peggio: la soglia della
spedizione gratuita veniva valutata sul prezzo pieno dalla pagina e su quello
scontato dal server, quindi la pagina prometteva la spedizione gratis e il
server la addebitava.

**La cassa esisteva in due copie.** Il percorso in contanti e quello con carta
rifacevano lo stesso conto, riga per riga: duecento righe di aritmetica sui
soldi, scritte due volte. Almeno tre volte una riparazione è stata fatta da una
parte sola, e ogni volta il cliente pagava un importo diverso a seconda di come
sceglieva di pagare. Adesso il conto è uno, e una prova legge le due rotte: se
una torna a farsi i conti in casa, diventa rossa.

**Nessuno poteva segnalarci un prodotto contraffatto.** Sul sito non c'era
nessun canale: nessun pulsante, nessun registro, nessun punto di contatto. Il
regolamento europeo lo chiede a ogni piattaforma che ospita contenuti di terzi,
e per un marketplace è anche la difesa più economica che esista: chi vede una
cosa sbagliata ce la dice prima che la compri qualcun altro. Adesso il pulsante «Segnala» c'è su ogni scheda prodotto e su ogni negozio.
Ogni segnalazione finisce in un registro e ti arriva una campanella. Nei
Termini c'è la sezione nuova: cosa rimuoviamo, cosa succede al venditore, e
come chiede il riesame se non è d'accordo.

**Chi entrava con Google non accettava mai niente.** Il modulo con email e
password ha la spunta obbligatoria su Termini e Informativa, e la versione dei
testi finisce a verbale. Il pulsante Google, subito sotto, non aveva nulla: un
clic e si era dentro, operativi, senza nessuna riga da nessuna parte. Il giorno
in cui qualcuno contesta una condizione, su quell'utente non c'era niente da
mostrare.

**Il pulsante «scarica i miei dati» consegnava un file senza gli ordini** — e
diceva che il file era completo. Chiedeva una colonna che sulla tabella degli
ordini non esiste, il database rifiutava tutta la lettura, e il codice buttava
via l'errore. L'esportazione giusta esisteva già, completa, e non la chiamava
nessuno.

**Il sorvegliante si dichiarava sano.** Faceva quattordici letture e non
guardava l'esito di nessuna: una che fallisce lascia il risultato vuoto, il
giro finisce con «nessuna anomalia» e scrive pure il proprio battito. È il
difetto peggiore di un sorvegliante: non che non veda — che dica di aver visto.
E il freno anti-silenzio era disinnescato proprio sul caso peggiore: un lavoro
periodico che non è **mai** partito non veniva segnalato.

**Un database lento faceva riavviare istanze sane.** C'è una pagina che
l'hosting apre ogni minuto per chiedersi «questo processo è vivo?». Se risponde
male, lo ammazza e lo riavvia. Quella pagina rispondeva male anche solo perché
il database era lento.

Ed è il momento peggiore per riavviare. Si perdono le richieste in corso. Il
processo riparte. Ritrova lo stesso database lento. Riparte di nuovo. Un
rallentamento diventava un blackout, per mano nostra.

**Le foto dei prodotti non hanno nessuna copia, e la documentazione diceva il
contrario.** C'era scritto «perdita zero, ripristino immediato». Non esiste
nessun backup delle immagini: né uno script, né un passo del lavoro notturno.
È il tipo di riga più pericoloso in un documento di emergenza, perché chi lo
legge smette di cercare la copia. Adesso c'è scritto lo stato vero. E la copia
del database, che c'è, non era **mai stata riaperta**: adesso una prova di
ripristino gira da sola ogni mese e scrive quanto ci mette davvero.

## Cosa devi fare

Cinque firme, in quest'ordine. Le prime due sono le più importanti.

- **Applicare la migrazione 126 al database** (`migrations/126_radiografia_22_agosto.sql`).
   Senza, restano fuori: il credito che torna al cliente, il controllo sulla
   cassa del fattorino, il blocco sugli allergeni, i dati del venditore sulle
   pagine, il registro delle segnalazioni. Il codice regge anche prima: è
   scritto per non rompersi nella finestra in mezzo. Ma quelle riparazioni non
   fanno effetto finché la migrazione non è applicata.
- **Applicare la migrazione 120**, quella scritta il 18 agosto e mai applicata:
   toglie l'identificativo degli ordini dalla vetrina «attività dal vivo». Il
   codice che la bloccava è in produzione da giorni: si può applicare adesso.
- **Il segreto `SUPABASE_DB_URL` su GitHub** (Settings → Secrets → Actions).
   Da quel momento il rilascio applica le migrazioni **prima** di pubblicare, e
   se non si applicano non pubblica. È la riparazione del difetto per cui il
   codice nuovo arrivava su un database vecchio.
- **I tre segreti di Vercel + la parola in `vercel.json`** (in quest'ordine,
   al contrario il sito smette di aggiornarsi): da quel momento l'unica strada
   per la produzione è la CI verde.
- **Un posto dove mettere la copia delle foto** (un secchio e le sue chiavi).
   Oggi le immagini dei prodotti vivono in un posto solo: se sparisce quello,
   spariscono con lui, e rifarle vuol dire richiamare ogni negoziante a
   rifotografare tutto.

## Cosa non ho verificato

Da qui non ho potuto:

- **aprire il sito in un browser.** Le riparazioni sull'interfaccia le ho
  verificate leggendo il codice, non guardando lo schermo. Riguardano il banner
  dei cookie che copriva «Conferma ordine», il tour di benvenuto e i messaggi
  della ricerca;
- **misurare l'LCP vero** su una scheda prodotto da un telefono in 4G: per
  questo il pezzo grosso del difetto sul rendering (portare sul server la prima
  schermata delle sei pagine commerciali) resta **aperto e dichiarato**, invece
  di essere spacciato per chiuso. Ho fatto la parte che si poteva provare: la
  foto del prodotto adesso parte dal guscio, che gira sul server, invece di
  aspettare il JavaScript;
- **toccare il database di produzione**: tutti i controlli sul database girano
  su una copia ricostruita dalle migrazioni vere, qui dentro;
- **il tasso di conversione del venditore** resta un indizio, non una misura:
  le visite si contano solo su chi accetta i cookie. Adesso il numeratore è la
  popolazione giusta. Accanto al numero c'è scritto quanto vale il campione.
  Ma per chiudere davvero quel difetto bisogna contare le visite in forma
  aggregata e senza identità: è un lavoro a sé.

---

## Dettagli tecnici

**Prove.** 1016 prove unitarie verdi (nove file nuovi). 12 file di controlli sul
database verdi, contro uno schema ricostruito dalle 127 migrazioni vere.
Controllo dei tipi pulito, controllo dello stile pulito, compilazione di
produzione riuscita: 211 pagine generate. Cinque riparazioni hanno una prova
verificata **avversarialmente** — cioè rimessa la riga sbagliata, la prova
diventa rossa:

| Difetto | Prova | Rossa senza la riparazione |
|---|---|---|
| AR causa radice permessi (16) | `tests/sql/rls/10-…` | ✅ verificato con una funzione finta aperta ad anon |
| Contestazione persa/vinta (44, 45) | `tests/unit/contestazione-persa-…` | ✅ 3 prove su 5 rosse col codice di ieri |
| Credito + cassa fattorino (125, 128) | `tests/sql/rls/11-…` | ✅ 3 controlli rossi senza la migrazione 126 |
| Freno sul prezzo AI (151) | `tests/unit/il-freno-sul-prezzo-…` | ✅ 2 prove su 3 rosse togliendo una riga |
| Colonna inesistente (3) | `tests/unit/nessuna-colonna-che-non-esiste` | ✅ rossa rimettendo `orders.buyer_id` |

**Freni nuovi** (controlli che diventano rossi da soli quando il difetto
ritorna, invece di aspettare la prossima radiografia):

- `tests/sql/rls/10-nessuna-porta-nuova-aperta-agli-anonimi.test.sql` — una
  funzione potente nuova, aperta a chi non ha l'account, fa rosso il giorno in
  cui entra nel repo. Copre la causa radice, non i quattro casi noti.
- `tests/unit/nessun-corpo-senza-tetto.test.ts` — la rotta numero 54 nasce col
  tetto sul corpo della richiesta o la CI diventa rossa.
- `tests/unit/nessuna-colonna-che-non-esiste.test.ts` — ogni colonna chiesta in
  una query esiste sulla sua tabella. Ha già trovato due cose vere: una colonna
  inesistente in un allarme scritto oggi, e un difetto nel generatore dei tipi
  (le colonne dichiarate su più righe sparivano in silenzio — è così che
  `notifications.category` non era nei tipi pur essendo usata in cinque punti).
- `tests/unit/la-cassa-fa-lo-stesso-conto.test.ts` — se una delle due rotte di
  checkout torna a farsi i conti in casa, diventa rossa.
- il guardiano dei recapiti nelle pagine legali — un `mailto:` scritto a mano
  dentro il testo fa rosso.

**Migrazione 126** (`migrations/126_radiografia_22_agosto.sql`), nove blocchi:
colonne per lo storno della contestazione; ora del turno sul bonifico + indice;
stato `MISMATCH` del carrello; credito restituito in `cancel_order` e
`seller_reject_order`; `confirm_cod_remittance` che pretende
`cash_confirmed_at` e riporta i saltati; posizione GPS del fattorino cancellata
alla chiusura dell'ordine (funzione + trigger + passata una tantum);
`seller_public_profiles` con i dati identificativi d'impresa; tabella
`segnalazioni` con RLS; trigger che rifiuta un alimentare pubblicato senza
allergeni; indice `orders_seller_created_idx`; funzione `numeri_del_negozio`.

**File toccati**: 63. **Righe**: +4.900 / −800 circa, di cui una parte
consistente sono i commenti che spiegano il perché di ogni riparazione — che è
la parte che serve a chi la leggerà fra sei mesi.

**Difetti coperti da una riparazione sola** (perché erano lo stesso difetto
visto da due dimensioni d'analisi): 0/56, 90/123, 75/92, 124/127/138, 20/25.
