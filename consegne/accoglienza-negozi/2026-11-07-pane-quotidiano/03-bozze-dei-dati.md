---
data: 2026-11-07 05:00
autore: ai-copywriter
oggetto: Pane Quotidiano, bozze dei dati del negozio e dei 5 prodotti (da approvare, nulla è stato caricato)
---

# Pane Quotidiano: i dati del negozio scritti al posto suo

## In parole semplici

Questa pagina serve a decidere se i testi di Pane Quotidiano possono andare online. Ho scritto in bozza quelli che mancano o sono sbagliati sulla pagina di Pane Quotidiano. Sono la descrizione del negozio, le 5 schede prodotto e gli orari. Per leggere le etichette ho scaricato le foto pubbliche dei prodotti: in tutto 13 foto su 5 prodotti, da 2 a 4 ciascuno. Non ho caricato niente e non ho scritto a nessuno.

Un esempio. Del kefir di capra (latte fermentato da bere) ho letto ingredienti, peso e origine del latte, cioè l'Italia. Il pudding, un dolce al cucchiaio, ha gli ingredienti sul bordo curvo del vasetto e non si leggono. Lì ho scritto «da chiedere al negozio» e non ho indovinato.

## Cosa cambia per te

- La descrizione attuale promette pane e miele, ma nel catalogo non ci sono. Ho scritto due versioni nuove, entrambe vere. Consiglio la B, quella con solo i prodotti di oggi.
- Il pesto ha la marca sbagliata. La scheda dice «Artigiani del Madouri», l'etichetta dice «Artigiana Amadori», produttore Artigiana Genovese S.r.l. di Genova.
- Il kefir di capra non ha gli allergeni nel database, ma l'etichetta dice latte. Per gli alimentari il campo è obbligatorio per legge.
- Il kefir grande dice «colture kefir» e «biodinamica Demeter», un marchio di agricoltura biodinamica. L'etichetta dice «fermenti lattici» e «agricoltura biologica».
- Per pudding e hummus mancano ingredienti e allergeni, e le foto non bastano. Servono una foto in più o una risposta del negozio.

## Cosa devi fare

- Scegli la descrizione A o B. Senza notizie su pane e miele, vale la B.
- Di' «ok» alle bozze. Solo allora le passo al negozio, che le inserisce lui.
- Fai arrivare al negozio le 14 domande del file di dati. Le 6 urgenti sono pane e miele, foto ingredienti di hummus e pudding, allergeni, pesi e orari.

## Cosa non ho verificato

- Ho letto bene il kefir grande, il kefir di capra e il pesto. Pudding e hummus li ho letti solo in parte.
- Non ho confrontato niente con i prodotti veri in negozio. Ho usato solo le foto caricate il 16-17 giugno.
- Gli orari vengono dal database, non dal negozio. Una scheda precedente li attribuisce a PagineGialle.
- Non so se il negozio ritira e consegna davvero, né se vende pane e miele.
- Nessun controllo legale su diciture come «biologico» o «senza glutine». Le riporto solo se stanno sull'etichetta.

## Dettagli tecnici

- Tutti i dati sono nel file `03-bozze-dei-dati.json`, nella stessa cartella. Per ogni campo ci sono valore, fonte e confidenza, più le 14 domande, le differenze con le etichette e i badge da togliere.
- Le categorie proposte sono figlie di `alimentari`, dalla migrazione 078. Oggi 4 prodotti su 5 stanno su `alimentari` generico.
