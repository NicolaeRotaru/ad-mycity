---
data: 2026-08-19 13:20
tipo: riparazioni-marketplace
referto_di_partenza: consegne/audit/2026-08-18-radiografia.md
riparati: 104
aperti: 141
ramo: claude/marketplace-100-difetti-ehne44 (repo NicolaeRotaru/mycity)
---

# Centoquattro riparazioni sul sito, in un giorno

**In due righe.** Ieri la radiografia ha trovato 245 difetti sul sito. Oggi ne ho
riparati 104, fra cui 7 bloccanti su 12. Ti servono due firme: unire la richiesta
e applicare la migrazione al database. Sono due cose diverse.

## In parole semplici

Ieri la radiografia ha trovato duecentoquarantacinque difetti sul sito. Oggi ne
ho riparati centoquattro.

Ecco il conto, prima e dopo.

| | 18 agosto | oggi | differenza |
|---|---:|---:|---:|
| Bloccanti | 12 | 4 | **-8** |
| Gravi | 114 | 76 | -38 |
| Minori | 119 | 60 | -59 |
| **Totale** | **245** | **141** | **-104** |

I bloccanti passano da dodici a quattro. Sette li ho riparati oggi. L'ottavo era
gia' a posto: la disiscrizione con un clic e' stata riparata ieri sera. Il
referto e' stato scritto due ore prima e non lo sapeva.

I quattro che restano non li posso chiudere io, e ti dico subito perche'.

## Cosa cambia per te

Le cose piu' grosse, in ordine di quanto costavano.

**Il cliente poteva scriversi da solo il credito MyCity.** Con la chiave che ha
qualunque browser si poteva alzare il proprio credito e poi spenderlo in un
ordine in contanti. Ora il profilo funziona al contrario: si dichiara cosa una
persona puo' cambiare di se stessa, e tutto il resto e' chiuso — comprese le
colonne che nasceranno domani.

**Il denaro poteva uscire due volte.** Il totale rimborsato veniva letto, sommato
e riscritto.

Un caso vero. Una cliente chiede il reso di un ordine da 40 euro, e nello stesso
minuto tu chiudi il suo reclamo dal pannello. Le due strade partono insieme.
Tutte e due leggono «zero rimborsato». Tutte e due rimborsano 40 euro. Escono 80
euro invece di 40, e uscire e' irreversibile.

Ora la somma la fa il database in una riga sola. Chi non rivendica quella riga
non arriva nemmeno a chiamare Stripe.

**Un prodotto a disponibilita' illimitata non si poteva comprare.** Il negozio lo
metteva in vetrina. Il cliente lo aggiungeva al carrello. Al momento di pagare il
sito diceva «esaurito» e spegneva il pulsante.

Il resto del codice sapeva benissimo che illimitato vuol dire illimitato. Lo
sapevano la scheda prodotto, la griglia e il server. Sbagliava un punto solo, ed
era proprio quello dove si paga.

**Il totale nel carrello era piu' basso di quello che si paga.** Mancavano i tre
euro di «Consegna MyCity» per ogni negozio. La differenza compariva all'ultimo
passo, dove chi abbandona non torna piu'.

**Il carrello non si svuotava all'uscita.** Un esempio. Anna ordina dal computer
di casa e poi esce dal suo account. Dopo di lei entra suo figlio. Nel carrello
trova ancora la spesa della madre, e al primo cambio quella spesa finisce anche
nel suo carrello sul server.

**Il pulsante «Applica a tutti» dell'AI poteva riscrivere i prezzi.** Duecento
prodotti in un colpo, senza mostrare cosa cambiava. Ora il lavoro massivo tocca
solo il testo. E un prezzo che si scosta oltre il 30% viene rifiutato: e' il caso
dello zero perso, venti euro che diventano due.

**Il sito poteva spegnersi da solo.** Il controllo di salute rispondeva «istanza
morta» a Render anche solo perche' mancava la chiave delle email. Il marketplace
vende benissimo senza spedire posta.

## Cosa devi fare

**Una firma, e sono due cose separate.**

**① Unire la richiesta.** Il codice e' su un ramo, con le prove verdi. Unirla
pubblica il codice del sito.

**② Applicare la migrazione 119 al database.** E' un'azione a parte e va chiesta a
parte. Unire una richiesta pubblica il codice: non e' la firma sul database.

Il file si chiama `119_radiografia_18_agosto.sql` e sta nella cartella delle
migrazioni. Dentro ci sono trentotto riparazioni. Quattro esempi.

- Il blocco sul credito MyCity di cui sopra.
- Il premio invito, che ora lo decide il server e non il browser.
- Le statistiche del negoziante, che tornano a contare invece di dire zero.
- Il pannello dei codici sconto, che torna a leggere i codici.

**I quattro bloccanti che restano, e perche' sono tuoi.**

**Il compenso del fattorino non sta dentro l'incasso.** Tre euro fissi di
consegna non coprono un compenso che a cinque chilometri vale otto euro e
cinquanta. Non e' un errore di codice: e' un numero da decidere. O sale la
tariffa di consegna, o sale la soglia della spedizione gratis. Ti porto il conto
quando mi dici da quale parte vuoi guardarlo.

**La partita IVA in fondo alle pagine e' finta.** Servono i tuoi dati veri:
denominazione, sede, partita IVA. E se un responsabile della protezione dati
esista oppure no — perche' su `/cookies` ne e' scritto uno che non e' mai stato
nominato.

**I negozi rimessi «in attesa» dalla bonifica del 14.** Chi era operativo e si e'
ritrovato in attesa va riapprovato dal pannello, non con una scrittura a mano:
quella strada scrive anche la notifica e la traccia. Il vincolo che impediva alla
divergenza di nascere l'ho messo nella 119.

**Il ritiro in negozio non arriva mai a «consegnato».** L'ordine resta fermo e il
negoziante non viene pagato. Servono due cose nuove. Una funzione nel database
che registri la conferma del ritiro da parte del negoziante. E un pulsante nella
sua pagina ordine. E' un lavoro a se', non una toppa: te lo propongo separato.

## Cosa non ho verificato

Non ho aperto il sito in un browser. Non ho fatto un ordine, non ho pagato con
una carta di prova, non ho cliccato un link di disiscrizione vero, non ho visto
il pannello di Render.

La migrazione 119 non e' stata applicata a nessun database: e' scritta e
rileggibile, ma nessuno l'ha ancora eseguita. Le riparazioni di database che
contiene non sono attive finche' non la firmi.

Le prove che ho fatto girare sono ottocento, tutte verdi, piu' il controllo dei
tipi e quello di stile. Ottocento prove che girano non sono un sito che
funziona: sono la garanzia che quello che ho toccato si comporta come dico.

Delle prove nuove che ho scritto, quattro le ho verificate al contrario —
tolta la riparazione, diventano rosse. Le altre no: le ho scritte e le ho viste
verdi, che e' meno.

Ottantuno delle centoquattro riparazioni non hanno una prova automatica loro:
sono coperte dal controllo dei tipi, dal controllo di stile e dalle ottocento
prove esistenti che continuano a passare. E' meno di quanto vorrei, e lo dico
invece di lasciartelo scoprire.

Il cancello di accessibilita' controlla quattro pagine, su un sito che ne ha
decine. Prima non esisteva affatto, ma quattro pagine non sono tutte.

---

## Dettagli tecnici

**Dove sta il lavoro.** Repo `NicolaeRotaru/mycity`, ramo
`claude/marketplace-100-difetti-ehne44`, cinque commit sopra `1c1c0b0`
(la fusione della richiesta #224). Copia applicabile del lavoro:
`consegne/tech/2026-08-19-marketplace-104-difetti.patch` (formato `git am`).

**Non ho potuto aprire la richiesta di unione da qui.** Il proxy di questa
sessione nega le credenziali per `NicolaeRotaru/mycity`. Quel repository e' fuori
dall'elenco autorizzato, e la richiesta di aggiungerlo e' stata bloccata.

Servono due strade. O mi autorizzi ad aggiungere quel repository alla sessione. O
applichi la patch a mano, con `git am` dal file qui sopra.

**Cancelli eseguiti.** `tsc --noEmit` pulito · `next lint` zero errori
(96 avvisi di accessibilita' preesistenti, dichiarati come debito che puo' solo
scendere) · `vitest run` 800 verdi su 800.

**Ripartizione delle 104 per reparto.** accessibilita 18 · pagamenti-stripe 15 ·
api-backend 14 · rls-database 13 · frontend-ux 12 · sicurezza-auth 9 ·
privacy-legale 7 · performance 7 · ai-endpoints 2 · architettura 3 ·
deploy-sre 2 · qa-flussi 2.

**Prove nuove scritte in questo lotto** (tutte in `tests/unit/`):
`api-health.test.ts` (riscritta: 9 casi, 4 verificati rossi senza la
riparazione) · `api-rider-cash-confirm.test.ts` (2 casi nuovi: il filtro sullo
stato di consegna dentro la UPDATE, e la giornata di cassa nel fuso di Piacenza)
· `refund-order-cod.test.ts` (1 caso nuovo: il secondo rimborso non passa) ·
`api-stripe-webhook-idempotency.test.ts` (1 caso nuovo: due consegne concorrenti
dello stesso evento) · `ai-lotto-non-tocca-i-soldi.test.ts` (4 casi nuovi) ·
`tests/e2e/11-a11y-percorso-acquisto.spec.ts` (axe su 4 pagine + un solo `<main>`).

**Il registro.** `MyCity-Vault/90-Memoria-AI/auto-coscienza/radiografia-marketplace.json`
porta ora `stato` su ogni voce (`riparato` / `aperto` / `gia_riparato_prima`) e
il blocco `stato_lotto_19_agosto` col conto e i quattro bloccanti ancora aperti
con il motivo.
