---
data: 2026-08-23 15:48
titolo: Le botteghe, cosa ci sta davvero entro la data zero
per: Nicola
tipo: piano di costruzione, con una scelta da fare
colore: 🟢 documento. Il codice che ne esce è 🟡, ogni euro e ogni contatto sono 🔴
---

# 🏪 Fondamenta adesso, il mestiere dopo

La Bottega è la macchina che lavorerà per i negozianti. Questo foglio serve a decidere quale pezzo ne costruisco entro la data zero.

## In due righe

Tutto intero non ci sta in sei giorni.
Ti propongo le fondamenta finite e provate, con un mestiere solo sopra.

## In parole semplici

Il 22 agosto mi hai detto che il worker per le botteghe non c'è ancora.
Lo vuoi entro la data zero.
Ho registrato che la linea è aperta.
Fino a ieri il registro diceva di non toccarla senza il tuo via libera.

Poi ho letto il tuo documento sull'architettura, quello delle tre macchine.
La parte che costruisce la Bottega la stima in settimane.
I giorni che restano sono sei.
Da qui in avanti spiego cosa ci sta dentro quella finestra, e cosa no.

La Bottega è una macchina sola che serve tutti i negozi.
Non una copia per negozio.
Quella è la trappola che il tuo documento spiega bene: quaranta copie vogliono dire quaranta programmi accesi.
E alla quarantesima non sono più uguali.

Il punto duro non è far parlare l'AI col negoziante.
Quella è la parte che si vede, ed è anche la più veloce.
Il punto duro è che i dati di un negozio non devono poter arrivare a un altro.
E dev'essere vero dal primo giorno.

Il tuo documento è chiarissimo su questo.
Aggiungere il muro dopo, su dati già mescolati, è «il lavoro più caro e pericoloso che esista».
Quindi il muro non è una rifinitura da mettere dopo il pilota.
È la prima cosa, o non si parte.

## Cosa cambia per te

Ti propongo di dividere in due quello che chiami «il worker per le botteghe».

**Le fondamenta.** Il muro fra i negozi, la coda a corsie, il tetto di spesa, le chiavi in cassaforte.
Sono cinque o sei pezzi, ognuno piccolo.
Ognuno si può provare senza avere un negozio vero davanti.
È la parte che, se la sbagli, non si aggiusta dopo.

**Il mestiere.** L'impiegato digitale vero.
Risponde ai clienti del negozio, tiene il catalogo, scrive i post, dice cosa sta finendo.
È la parte che si vede e che si vende.

**Per esempio**, ecco cosa vedrebbe il fornaio di Pane Quotidiano.
Alle sette di sera gli arriva un messaggio su WhatsApp.
Dice due cose: quanto ha incassato oggi, e cosa sta per finire.
Lui risponde «ordina» e ha finito.
I numeri di quel messaggio oggi non esistono ancora, e l'esempio serve a far vedere la forma.

Le fondamenta ci stanno in sei giorni.
Il mestiere no.
Perché serve un negoziante vero che lo usi dal telefono, e un mese di costi misurati.
È quello che il tuo documento chiama «settimane».

## Cosa devi fare

Una scelta sola, e cambia cosa costruisco.

**(a) Fondamenta finite e provate, e un mestiere solo sopra.**
Il 29 agosto hai una macchina che tiene i negozi separati.
C'è la prova che un secondo negozio finto non vede niente del primo.
Sopra ci metto il mestiere più utile: cosa sta finendo e quanto ho incassato oggi.

**(b) Il mestiere prima, le fondamenta dopo.**
Il 29 agosto hai qualcosa da far vedere a un negoziante.
Ma i dati di tutti stanno nello stesso posto.
Il tuo documento dice che separarli dopo è il lavoro più caro che esista.

Io farei la prima.
Il motivo non è la prudenza.
È che con la seconda strada la data zero si manca due volte.
Prima si costruisce, poi si rifà.

Se non mi dici niente, parto con la prima.

## Cosa non ho verificato

Non ho ancora scritto nessuna riga di codice della Bottega.
Non so quanto costa in AI un mese di lavoro per un negozio vero.
Il tuo documento mette quel costo fra le condizioni per partire, e da qui non lo posso misurare.

C'è poi una cosa che non dipende da me: il server è fermo.
Finché resta giù, la macchina lavora solo quando apri tu una sessione.
Una Bottega che serve i negozianti deve girare da sola.

---

## Dettagli tecnici — cosa costruisco, in ordine

Il tuo documento elenca i **sei meccanismi del multi-negozio**. Qui sono in ordine di costruzione,
con quello che li prova. Ognuno è una funzione pura o un modulo con una casa sola, come il resto
della macchina: si scrive una volta e chi agisce ci passa.

| # | Pezzo | Cosa lo prova |
|---|---|---|
| 1 | `negozio_id` su ogni riga, e nessuna scrittura che possa ometterlo | una scrittura senza `negozio_id` viene rifiutata dalla funzione, non dal buon senso |
| 2 | il muro nel database (RLS) | un secondo negozio finto legge zero righe del primo — la prova che il documento mette per prima |
| 3 | la coda a corsie: un negozio in loop non ferma gli altri | una corsia satura e le altre continuano; la quota per negozio si rispetta a turno, non in ordine d'arrivo |
| 4 | contesto isolato: il testo di un lavoro non contiene mai una riga di un altro negozio | il costruttore del contesto riceve due negozi e ne fa uscire uno solo |
| 5 | tetto di spesa per negozio, con avviso a metà e stop | si sfora di proposito e lo stop scatta — il freno costi del CENTRO, esteso per negozio |
| 6 | chiavi del negoziante mai nel discorso | il testo che l'AI legge non contiene mai il segreto, provato su un negozio finto con una chiave finta |

**Il rischio che tengo d'occhio.** Il testo scritto dai clienti di un negozio può contenere frasi
messe lì per farsi obbedire dall'AI. La regola è dura e va nel codice, non nel prompt: quel testo è
**materiale**, mai un comando. Le istruzioni arrivano solo dal mandato.

**Cosa NON costruisco in questa finestra**, e lo dico perché non sia una sorpresa: il canone, il
collegamento a un gestionale, la seconda città, e qualunque contatto con i tre negozi pilota — che
peraltro non risultano nei dati del marketplace, quindi restano entità da fondare.

**Il fatto aggiornato oggi:** `worker-negozi.stato` in `registro-fatti.json`. Prima diceva di non
aprire nessun contatto su questa linea finché non fossi stato tu ad aprirla; la tua richiesta del
22/8 l'ha superato.

**Riferimenti:** `ARCHITETTURA-TRE-MACCHINE.md` (Fase 3 e i sei meccanismi) ·
`registro-fatti.json` → `worker-negozi.stato`, `pricing.worker-negozi`, `pilot.worker-negozi` ·
`consegne/strategia/2026-07-29-listino-worker-negozi.md`
