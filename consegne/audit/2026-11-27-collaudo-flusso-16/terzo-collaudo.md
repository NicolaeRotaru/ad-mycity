---
tipo: collaudo
data: 2026-11-27 03:15
oggetto: flusso n8n «16 · Attività da visitare» (repo N8N, testa f9311bd, unita in main con 8673eef)
fonte: referto mandato dalla sessione delle PR (session_01R8112KTPLRuAkWr1PreRUu); le prove del collaudatore stanno solo nel suo contenitore, ogni difetto ha file:riga ed è riproducibile
---

# Terzo collaudo del flusso 16 · Attività da visitare

## In parole semplici
Il terzo collaudo, scelto da Nicola, è verde: nessun difetto grave, 10 minori. La macchina che trova i clienti
fa quello che dice. Le 44 mutazioni del giro prima sono tutte rosse anche per questo collaudatore.

## Cosa cambia per te
La richiesta di unione del flusso (NicolaeRotaru/N8N#31) è unita. Il flusso su n8n resta spento finché non dici di accenderlo.

## Cosa devi fare
Tre scelte: accendere il flusso; cosa fare delle 10 righe già scritte col listino vecchio; se togliere i forni dalla lista.

## Cosa non ho verificato
Niente è girato dentro n8n: la riprova sul 429, l'arresto con avviso quando la tabella va in errore e la forma
esatta dell'errore della mappa sono letti nel sorgente di n8n (fiducia circa 80%). Niente mandato a Telegram vero.
Le due «Metrò» indipendenti: fiducia circa 80%. Nessun giro vero dell'AD col listino nuovo.

---

## Esito
VERDE. 0 gravi o bloccanti, 10 minori. Suite: 355 prove, 353 verdi, 1 rossa (quella nota del 19), 1 saltata; le 19
del 16 tutte verdi. Le 44 mutazioni di `prove/mutazioni-dopo-ricollaudo.mjs`: confermate 44 rosse su 44. Simulate 62
settimane sui dati veri (esecuzioni 3458 e 3460): 1.037 attività lette, ognuna in un conto solo; nessuna riproposta e
nessuna esclusa che rientra (621 su 621); 239 messaggi, tutti con HTML valido per Telegram, il più lungo 3.900 caratteri.

## Nota operativa, prima di lunedì (non è un difetto del codice)
Le 10 righe già nella tabella (settimana 1, esecuzione 3460 partita a mano alle 00:43 UTC del 27/11, prima delle
riparazioni) hanno nel dossier il listino vecchio: «sito 500 € una volta» o «foto da 50 a 300 € al mese», 10 righe su
10. Il codice di oggi passa all'AD i tre abbonamenti 300/500/999 €, ma il flusso non corregge le righe già scritte. Va
deciso con Nicola: correggere la colonna dossier di quelle 10 righe, oppure avvisare chi visita di ignorare i prezzi.
È un'azione gialla.

## Domanda aperta
10 delle prime 30 proposte sono forni o panetterie, concorrenti diretti di Pane Quotidiano; nella settimana 2 sono 5 su 10.

## I 10 minori
1. Regressione di f9311bd: le due boutique «Metrò» di Via Cavour 35 e 40 escono per sempre come «catena», perché «metro» è nei nomi esatti e il confronto toglie l'accento. Il Metro cash and carry è già fuori come supermercato. `metti-in-fila.js:50` (anche :52, :114).
2. Dopo 3 tentativi con risposta 429 il messaggio è in inglese («Try spacing your requests out…») e non dice «troppe richieste». La prova simula il 429 con `{statusCode:429}` in cima all'uscita, una forma che con `neverError:false` non arriva mai. `metti-in-fila.js:19`, test :210.
3. Stato e nome dei «non capiti» si tagliano con `.slice(0,60)`: un'emoji al 60° posto resta a metà. `metti-in-fila.js:95`.
4. Il messaggio conta «col dossier» anche se l'AD manda una sola scheda (un id senza «node/», o 3 attività saltate): la riga «Senza il dossier dell'AD» non compare. Si perdono anche gli avvisi generali dell'AD (5 su 5 nella 3460) e la sua fonte. `componi.js:12-13`, `:36`.
5. Mappa che risponde 200 con un elenco vuoto: il messaggio dice «Sulla mappa ci sono 0 attività entro 5 km». `metti-in-fila.js:22`, `:27`.
6. Una riga doppia in tabella fa stampare «10 proposte · 20 visitate»: le proposte si contano una volta, gli stati riga per riga. `metti-in-fila.js:91-94`, `componi.js:34`.
7. Un'attività già proposta si riconosce solo dall'identificativo della mappa: se qualcuno ridisegna il punto, torna come nuova (es. «Polleria Bonatti», stato «no», al posto 1 della settimana 2). `metti-in-fila.js:137`, `righe-tabella.js:131`.
8. Ancora presente: «Bio Forno» e «L'Albero del Pane» allo stesso civico (Via Dieci Giugno 80, a 1 m), ai posti 19 e 21. `metti-in-fila.js:126-132`.
9. Per scelta dichiarata (test :135): circa 9 attività non di catena segnate come supermercato restano fuori. `metti-in-fila.js:43`.
10. Buchi nelle prove (il codice oggi fa giusto): 7 mutazioni su 8 del collaudatore restano verdi. Sei tolgono la protezione HTML (link Maps, nome e stato dei «non capiti», motivo della mappa, errore dell'AD, indirizzo); la settima toglie i «no» dal conto delle visitate. `componi.js:27, 32, 36, 40, 50, 34`.

Primi da riparare: 1 (Metrò) e 7 (ritorno dopo un «no»).

## Stato dei difetti precedenti
G1, G2, m2, m3, m4, m5 (parte shop=yes), m6, m7, m8, m9, G1-bis, m7-bis, m4-bis, m5-bis, m2-bis, P: riparati davvero.
m7 e m8 visti solo nel sorgente di n8n. m1: Groppi ed Enoteca riparati; resta «panetteria groppi» al posto 14, ed è lo
stesso forno; Bio Forno e L'Albero del Pane ancora presenti (n. 8). m1-bis: a metà, perché shop=yes conta ancora come
«stesso tipo». m6-bis: riparato in componi, rinato in `metti-in-fila.js:95` (n. 3). m7-bis: la prova test:191 esercita un
ramo che dentro n8n non si raggiunge più.
