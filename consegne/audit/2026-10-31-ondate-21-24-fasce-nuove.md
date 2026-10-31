---
data: 2026-10-31 01:25
tipo: referto
fonte: AD digitale
richiesta: «Parti con il primo giro col metodo nuovo» e le scelte sulle fasce (Nicola, 30/10/2026 sera)
---

# Le fasce nuove della cassa: quattro giri col metodo snello

**In due righe.** La cassa adesso propone sette fasce che seguono gli orari veri dei negozi, e la merce si ritira quando il negozio è aperto. I quattro giri sono costati in tutto circa un terzo di una sola ondata del vecchio metodo.

## In parole semplici

Prima un passo indietro. La cassa è la pagina dove il cliente sceglie quando ricevere la spesa. Proponeva fasce larghe, uguali per tutti i negozi, e a volte fasce che il negozio non poteva servire.

Adesso le fasce sono sette, dalle 7:30 alle 21, e ogni negozio vede solo quelle che può servire. La merce si ritira quando il negozio è aperto, e MyCity la tiene fino alla fascia scelta. Esempio: lunedì alle 12:00 Maria ordina il pane da Pane Quotidiano per le 13-16:30. Il forno legge «accettalo entro le 12:45», tu ritiri prima che chiuda alle 13 e consegni dopo pranzo.

Cambia anche il resto della catena:
- la scheda del negozio dice «consegna oggi» solo quando la cassa ha davvero una fascia per oggi.
- le due rotte dell'ordine, contanti e carta, accettano solo le fasce che la cassa propone.
- l'email «Nuovo ordine» e le pagine del negozio dicono l'ora giusta entro cui accettare.
- il controllo notturno fa scadere un ordine che nessuno può più ritirare, invece di lasciarlo vivo fino alla fine della fascia.

## Cosa cambia per te

- **Il costo, misurato.** Quattro giri, 20 agenti in tutto, 40,8 milioni di token con le riletture. Una sola ondata del vecchio metodo, il 28/10, ne aveva usati 118 milioni.
- **Le tue scelte sono nel registro dei fatti:** i 60 minuti, le sette fasce, la regola del ritiro.
- **Due scelte le ho fatte io, e te le dico.** Il negozio deve restare aperto almeno un quarto d'ora prima del ritiro, e questa l'ha proposta la squadra. La scadenza per accettare è sempre l'ultimo momento utile per il ritiro: per la fascia 9-11 è le 10.

## Cosa devi fare

- **Unire le due richieste di stasera**, quella del sito e quella della memoria.
- **Dirmi fino a quando le rotte accettano le fasce vecchie.** Oggi le accettano ancora, per le casse rimaste aperte prima del rilascio. Il mio consiglio: una settimana.
- **Rispondere sulla borsa frigo:** faccio verificare cosa chiede l'ASL prima della spesa?

## Cosa non ho verificato

- **Il sito vero non l'ho aperto.** Le prove girano sul codice, non sul sito pubblicato.
- **Due prove del carrello sono instabili.** Il primo controllo completo ne aveva 2 rosse su 6.560, nello stesso file. Da sole passano sempre, anche sul codice di prima. Il risultato del secondo controllo è scritto in fondo.
- **La carta al lancio è spenta.** Il difetto grave rimasto riguarda la carta: la fascia si controlla quando nasce il pagamento, non quando si paga.
- **Gli orari di 7 negozi su 16 non li ho trovati.** Degli altri 9 nessuno ha due fonti diverse che si confermano.

---

## Dettagli tecnici

### I quattro giri

| Giro | Run | Agenti | Con le riletture | Senza | Esito |
|---|---|---:|---:|---:|---|
| 21, la cassa legge gli orari e i 60 minuti | `wf_03b8bd70-559` | 6 | 12.554.489 | 845.189 | chiude 1948 e 1949; resta la vetrina |
| 22, sette fasce e regola del ritiro | `wf_c6291dc6-92e` | 5 | 13.526.697 | 950.712 | resta la scadenza del negozio |
| 23, la regola della scadenza | `wf_1cb0e4d8-a34` | 6 | 7.269.040 | 695.148 | territorio troppo stretto (errore dell'AD) |
| 24, email, pagine e giro notturno | `wf_ddce7ca0-044` | 3 | 7.460.345 | 486.723 | regge al primo collaudo |
| **Totale** | | **20** | **40.810.571** | **2.977.772** | |

- Ramo del sito: `fix/ondata-24-lib-email-templates-ts` = `896d704`, sopra `40cb09f` (7 commit, dal `19441ef` al `896d704`). Va sul ramo `ccr-aebe4f91-ohlf19` del sito.
- Prove: `npm run verify` sul giro 22 6.535 su 6.535; sul ramo finale 6.558 su 6.560 al primo giro (`tests/unit/il-carrello-non-promette-mezz-ora-alle-undici-di-sera.test.ts`, 2 casi), da solo 20 su 20 tre volte e 20 su 20 sulla base.
- Perimetro: `node cervello/radiografia-in-corsa.mjs --repo <ramo finale>` → 16 file riguardati dopo l'ultima modifica, su 5 dimensioni.
- Registro del sito: voci 2007-2029, 1 grave (la fascia della carta controllata alla sessione) e 22 minori; 4 da riverificare sul ramo finale.
- Fatti: `consegna.fascia-fino-a-60-minuti`, `consegna.fasce-orarie`. Orari: `consegne/intelligence/2026-10-30-orari-negozi-piacenza.md`.
- Lezione: il territorio di una squadra comprende chi usa la funzione che cambia (email, pagine, giri a orario), non solo la funzione. Il giro 23 l'ha pagata con un giro in più.
- Il sito: `npm ci` fallisce perché `package-lock.json` non è allineato (mancano `@testing-library/dom` e tre dipendenze); qui ho usato `npm install` e rimesso il lock com'era.
