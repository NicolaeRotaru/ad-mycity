---
tipo: referto
reparto: AD
data: 2026-10-28 23:05
colore: 🟡
titolo: L'ondata 1 del sito — tre pacchetti reggono, due aspettano la tua scelta
---

# L'ondata 1 del sito — tre pacchetti reggono, due aspettano la tua scelta

> **In due righe.** Tre pacchetti su cinque reggono e sono nella richiesta di unione #263: la porta del negozio, la moderazione e il catalogo. Le promesse e la cassa in contanti sono fermi, e la scelta su di loro è tua, nella carta #218.

## In parole semplici

L'ondata 1 ripara le porte del sito e le frasi false che i clienti leggono oggi. Cinque squadre hanno lavorato ognuna sui propri file, con un collaudatore che provava a rompere il loro lavoro.

Tre squadre hanno retto. Il negoziante nuovo adesso trova il modulo da compilare, e non «richiesta in valutazione» senza aver mandato niente. Era uno dei 9 difetti bloccanti. Il cliente non viene più buttato fuori quando la sessione si rinnova lentamente. Correggere la descrizione di un prodotto non rimette più in vendita la merce venduta nel frattempo.

Due squadre si sono fermate. Le promesse sono ferme per un motivo solo: i «30-60 minuti» restano in una trentina di punti del sito. La cassa in contanti è ferma per un motivo serio: la sua riparazione faceva nascere un ordine perso.

## Cosa cambia per te

- **La richiesta di unione #263 è pronta.** Porta i tre pacchetti che reggono, senza migrazioni. Il controllo completo del sito è verde: 6.068 prove su 6.068.
- **Il registro del sito è aggiornato.** Ci sono 25 voci nuove: 5 gravi e 20 minori. In più ci sono 13 note su schede già aperte. Le 77 segnalazioni del giro sono passate prima da un vaglio e da un contro-vaglio.
- **Tre gravi vecchi sono venuti a galla**, tutti sul catalogo. Esempio: il negoziante che cambia la scorta mentre arrivano ordini cancella le vendite fatte nel frattempo. Un altro esempio: se la lettura delle taglie non riesce, il salvataggio le cancella tutte.
- **Ho trovato una cosa che contraddice una tua scelta.** Il 26/10 hai sospeso il canone da 50 euro al mese. Il codice invece chiede ancora il consenso all'addebito nel modulo d'iscrizione, mostra «Attiva €50/mese» a ogni negoziante e addebita 5.000 centesimi. È nella nota della scheda 261.

## Cosa devi fare

Prima di tutto, rispondere alla carta #218. Il mio consiglio è «promesse A, cassa A»: restringere le promesse e semplificare la cassa.

Poi guardare la #263 e, se ti va bene, unirla.

## Cosa non ho verificato

- **Niente sul sito vero.** Tutte le prove girano sul codice, con il database e le letture simulati. In produzione molte di queste strade restano ferme finché su Vercel manca la chiave di servizio.
- **Il caso dell'ordine perso nella cassa** l'ha provato il collaudatore, con una prova che diventa rossa. Io non l'ho rifatto da me.
- **Una delle cose trovate dalla radiografia del perimetro** non è nel registro. Tocca la corsia delle falle riservate, e il registro sta in un deposito pubblico: resta fuori, senza dettagli.

---

## I cinque pacchetti

| Pacchetto | Esito | Difetti chiusi | Cosa resta |
|---|---|---|---|
| La porta del negozio | regge | 5, compreso il bloccante del negozio che legge «in valutazione» | il negozio respinto dal database (bloccante 3), la partita IVA, i 18 anni dei fattorini, il pannello dei fattorini: chiedono migrazioni o un disegno nuovo |
| La moderazione degli account | regge | 1 intero, 3 in parte | la notifica che il pannello ignora; i respinti di prima della riparazione |
| Il catalogo | regge | 2 | i tre gravi vecchi venuti a galla |
| Le promesse | fermo | 6 dichiarati, nessuno unito | i 30-60 minuti in circa 36 punti del sito |
| La cassa in contanti | fermo | nessuno | l'ordine di un altro carrello preso per buono; 5 gravi nati nel collaudo |

## Due buchi del motore delle ondate

- **Le spiegazioni dei difetti non chiusi si perdono.** La squadra del portiere aveva spiegato perché 5 difetti restavano aperti. Dopo il primo collaudo l'ha bocciata, e quando la squadra ha rifatto il lavoro il motore ha tenuto solo l'ultima risposta. Così quei 5 difetti sono usciti come «non dichiarati». Per questo il bloccante l'ho fatto collaudare a parte, con due lenti.
- **Le tue scelte non arrivano alle squadre.** Il motore passa la scheda del difetto, non le decisioni firmate. Le ho scritte io nelle schede, a mano, in 14 difetti su 25.

## Cosa resta fuori dal registro, e perché

17 segnalazioni e 5 gravi aperti sono nati nei due rami fermi. Descrivono codice che non arriva su main, quindi non li scrivo nel registro. Restano qui, per il giro che riprenderà quei pacchetti:

- **Le promesse.** Le prove guardano un componente alla volta, mai la pagina intera. Il dialogo di conferma perde il fuoco quando si apre sopra un altro dialogo. La guida per i nuovi clienti dice «scegli come pagare», ma il metodo è uno solo.
- **La cassa.** La ricerca dell'ordine già nato non è legata al carrello. 13 prove vecchie diventano rosse con i finti database nuovi. Dopo certi errori del server il browser butta la chiave, e il tocco dopo crea il secondo ordine.

I due rami sono `fix/ondata-10-lib-promesse-pubbliche-ts` e `fix/ondata-10-app-api-orders-cod-route-ts`.

## Il conto

| Lavoro | Agenti | Gettoni senza le riletture | Gettoni con le riletture |
|---|---|---|---|
| L'ondata | 36 | 3.789.918 | 70.988.008 |
| Vaglio del registro | 10 | 1.329.870 | 24.741.026 |
| Radiografia del perimetro | 6 | 885.296 | 17.472.638 |
| Collaudo del bloccante | 2 | 272.221 | 5.072.706 |
| **Totale** | **54** | **6.277.305** | **118.274.378** |

Nell'ondata, 27 agenti su 36 sono andati nei collaudi. Non si sa quale dei due conti pesi sul limite della settimana: li scrivo tutti e due.

Nel registro aspettano 154 difetti piccoli nati riparando. Prima dell'ondata erano 139: il giro ne ha aggiunti 15.

---

## Dettagli tecnici

- Piano `consegne/audit/2026-10-28-ondata1-sito.json` (`--ondata 10`). Run `wf_2326095d-a6c`, base `1776e6b1`, tipi `tech` e `qa`, tetto 45.
- Ramo d'integrazione `fix/ondata-10-integrazione` = `ccr-b2418a18-982q9d` del sito (`0df7945`): `7ffe97a`, `ba74c73`, `0a15291`. PR mycity #263.
- `npm run verify` (CI: `npm ci --legacy-peer-deps`): 673 file, 6.068 prove. Base `1776e6b1`: 666 file, 6.026 prove.
- `node cervello/radiografia-in-corsa.mjs --repo ../mycity`: verde, 10 file su 3 dimensioni; trovati architettura 7, sicurezza-auth 2, frontend-ux 6+1 riservato.
- Vaglio `wf_414a376a-0f4` (5 vagli + 5 contro-vagli). Radiografia del perimetro `wf_80358590-efb`. Collaudo del 18 `wf_c91379e4-eb5`: lente A regge (variante), lente B regge.
- Registro: nuove voci idx 1730-1754; note `nota_riesame` su 18, 24, 85, 120, 190, 253, 255, 261, 1252, 1253, 1254, 1255, 1516. Conto ⑨: 1.755 voci, 0 scritte male.
- Chiusure da scrivere dopo l'unione della #263, con `cervello/chiudi-sito.mjs`: 85, 1214, 1137, 86, 18, 19, 1293, 1254. Restano parziali: 1252, 1253, 1255.
- Un errore mio, già corretto: riscrivendo le fonti del registro con Python, il file è rimasto troncato su un carattere che non sapeva scrivere. L'ho ripristinato dall'ultimo commit e ho rifatto le due modifiche con node, controllando che il file si rilegga.
