---
data: 2026-11-07 05:00
autore: ai-copywriter
oggetto: Pane Quotidiano, bozze dei dati del negozio e dei 5 prodotti (da approvare, nulla è stato caricato)
---

# Pane Quotidiano: i dati del negozio scritti al posto suo

## In parole semplici

Ho preparato, come bozza, i testi che oggi mancano o sono sbagliati sulla pagina di Pane Quotidiano: la descrizione del negozio, la scheda di ognuno dei 5 prodotti, gli orari scritti per esteso. Ho scaricato le 13 foto dei prodotti dalle pagine pubbliche e ho letto le etichette. Quello che ho letto lo scrivo con la fonte e quanto ne sono sicuro. Quello che non si legge finisce nella tabella «da chiedere al negozio», in fondo. Non ho caricato niente sul sito e non ho scritto a nessuno.

Un esempio. Del kefir di capra ho letto l'etichetta sul retro del flacone: ingredienti, 200 g, «Origine del latte: Italia». Il pudding invece ha gli ingredienti stampati sul bordo curvo del vasetto e non si leggono: lì scrivo «da chiedere al negozio» e non indovino.

## Cosa cambia per te

- **La descrizione attuale promette pane e miele che non ci sono.** Ti propongo due versioni nuove, tutte e due vere. Scegli quella che corrisponde a come il negozio vuole presentarsi.
- **Tre schede su cinque oggi non hanno ingredienti e allergeni** (pudding, hummus, pesto). Per il pesto li ho letti dalla foto. Per pudding e hummus non si leggono: serve una foto in più o una risposta del negozio.
- **Ho trovato 3 errori nei dati attuali**, elencati qui sotto. Il più serio: nella scheda del pesto la marca scritta nel testo alternativo della foto («Artigiani del Madouri») non corrisponde all'etichetta (che dice «Artigiana Amadori», produttore «Artigiana Genovese S.r.l.»).
- Gli allergeni sono un obbligo di legge (Reg. UE 1169/2011): finché mancano, la scheda alimentare resta incompleta.

## Cosa devi fare

1. Scegliere la versione A o B della descrizione (sezione 1).
2. Rispondere alle domande della tabella finale (sezione 5) oppure farle fare al negozio: sono 14 righe, le 5 più urgenti sono marcate.
3. Dire «ok» alle bozze: solo allora le passo al negozio, che le inserisce lui. Io non scrivo nei dati.

## Cosa non ho verificato

- Le foto sono nitide ma l'etichetta è spesso su un lato non fotografato o sul bordo curvo. Ho letto bene kefir 400 g, kefir di capra, pesto (confidenza alta, ingredienti riletti su un ingrandimento). Ho letto solo in parte pudding e hummus (confidenza bassa: vedi la tabella).
- Non ho confrontato i dati con i prodotti veri in negozio: lavoro solo sulle foto caricate il 16-17/6.
- Gli orari vengono dal database, non dal negozio. Una scheda precedente li attribuisce a PagineGialle.
- Non so se il negozio vende davvero pane e miele: per questo le due versioni.
- Nessun controllo legale sui testi (diciture «biologico», «senza glutine»): le riporto solo se le ho viste sull'etichetta.

## 1. Descrizione del negozio

**Cosa c'è oggi** (fonte: database, letto il 7/11): «specializzata nella vendita di prodotti alimentari, tra cui pane, miele biologico (acacia, tiglio, castagno, propoli) e altri generi.» Nel catalogo non c'è né pane né miele.

**Versione A, «se vendi anche pane e miele»** (da usare solo se il negozio li vende davvero e li carica a catalogo):

> Pane Quotidiano è un negozio di alimentari di Via Calzolai, a Piacenza. Trovi il pane, il miele biologico (acacia, tiglio, castagno, propoli) e una scelta di prodotti freschi bio: kefir, hummus, pesto, dolci al cucchiaio. Ordini online, paghi in contanti alla consegna oppure passi a ritirare in negozio.

**Versione B, «solo quello che c'è oggi»** (consigliata fino a quando il catalogo non cambia):

> Pane Quotidiano è un negozio di alimentari di Via Calzolai, a Piacenza. Oggi trovi qui una selezione di prodotti freschi biologici: kefir di latte vaccino e di capra, hummus di ceci, pesto genovese e pudding alla vaniglia. Ordini online e paghi in contanti alla consegna, oppure passi a ritirare in negozio.

Controlli di verità: «Via Calzolai» e «Piacenza» dal database; i 5 prodotti dal catalogo; «contanti alla consegna» è la regola di lancio (carta spenta). «Ritira in negozio» dipende dal badge `ritiro_in_negozio` che il negozio ha attivo: da confermare (riga 12 della tabella). Ho tolto «prodotti locali» e «sostenibile»: nessun prodotto è di Piacenza e non c'è niente dietro «sostenibile».

## 2. Le 5 schede prodotto

Categorie disponibili nel sito (fonte: codice, migrazione 078): `alimentari` (madre) e, sotto, `alimentari-latticini`, `alimentari-pasta-fresca`, `alimentari-bevande`, `alimentari-dispensa`, `alimentari-dolci`. Oggi 4 prodotti stanno su `alimentari` generico e solo il kefir di capra su `alimentari-latticini`: le proposte qui sotto li mettono tutti in una figlia.

Legenda confidenza: **alta** = letto chiaro; **media** = letto con fatica; **bassa** = intravisto.

### 2.1 Kefir bio 400 g (Berchtesgadener Land)

| Campo | Bozza | Fonte | Confidenza |
|---|---|---|---|
| Nome | Kefir biologico parzialmente scremato 400 g (Berchtesgadener Land) | foto frontale + database | alta |
| Descrizione breve | Kefir bio da latte parzialmente scremato (1,5% di grassi), in brick da 400 g, con fermenti lattici vivi. Da bere freddo. | etichetta: «Kefir, latte fermentato, 1,5% di grassi»; «da bere freddo» è un consiglio mio, da confermare | alta, tranne «freddo» |
| Categoria | `alimentari-latticini` (oggi `alimentari`) | codice | alta |
| Peso | 400 g | dalla foto dell'etichetta | alta |
| Marca | Berchtesgadener Land | dalla foto dell'etichetta | alta |
| Ingredienti | Latte parzialmente scremato, fermenti lattici. Da agricoltura biologica. | dalla foto dell'etichetta («Latte parzialmente scremato, fermenti lattici»; nota «da agricoltura biologica») | alta |
| Allergeni | Latte e derivati | dalla foto dell'etichetta (latte in grassetto); coincide col database | alta |
| Conservazione | Frigorifero, a massimo +8 °C | dalla foto dell'etichetta | alta |
| Origine / produttore | Germania. Prodotto da Milchwerke Berchtesgadener Land Chiemgau eG, 83451 Piding | dalla foto (retro, «D-83451 Piding»); «Germania» già in scheda | alta |
| Valori per 100 g | 195 kJ / 46 kcal; grassi 1,6 g (saturi 1,0 g); carboidrati 4,3 g (zuccheri 4,3 g); proteine 3,2 g; sale 0,10 g; calcio 120 mg | dalla foto dell'etichetta | media (cifre piccole) |
| Testo alternativo foto 1 | Brick di kefir biologico Berchtesgadener Land da 400 g, parzialmente scremato, con marchio Demeter | foto frontale | alta |
| Testo alternativo foto 2 | Retro del brick di kefir Berchtesgadener Land con ingredienti e valori nutrizionali | foto retro | alta |

**Differenza da correggere nel database:** la scheda dice «colture kefir» e «da agricoltura biodinamica Demeter». L'etichetta dice «fermenti lattici» e, nella nota, «da agricoltura biologica»; il marchio Demeter c'è sul fronte. Propongo la dicitura letta, con il marchio Demeter citato a parte. Il bollo «scadenza» stampato sul tappo ("05 07") non lo uso: va letto sul pezzo in vendita.

### 2.2 Pudding alla vaniglia bio (Andechser Natur)

| Campo | Bozza | Fonte | Confidenza |
|---|---|---|---|
| Nome | Pudding alla vaniglia biologico (Andechser Natur) | foto frontale: «Bio-Sahne Pudding Vanille» | alta |
| Descrizione breve | Pudding bio alla vaniglia, cremoso, in vasetto: un dolce al cucchiaio pronto da mangiare. | foto: «Bio-Sahne» = crema di panna bio (traduzione mia); «pronto» è deduzione | media |
| Categoria | `alimentari-dolci` (oggi `alimentari`) | codice | alta |
| Peso | **da chiedere** (sul vasetto si intravede un numero + «g», illeggibile) | foto frontale | non letto |
| Marca | Andechser Natur | dalla foto dell'etichetta | alta |
| Ingredienti | **da chiedere** (stampati sul bordo curvo, illeggibili anche ingranditi) | foto | non letto |
| Allergeni | **da chiedere** (è un dolce con panna: quasi certamente latte, ma non lo scrivo senza etichetta) | foto | non letto |
| Conservazione | **da chiedere** (prodotto fresco, ma la dicitura non si legge) | foto | non letto |
| Origine | **da chiedere** (etichetta in tedesco e francese; marchio Bioland e logo bio UE visibili) | foto retro | bassa |
| Valori per 100 g | 632 kJ / 151 kcal; grassi 8,8 g (saturi 6,1 g); carboidrati 15,1 g (zuccheri 11,8 g); proteine 2,8 g; sale 0,09 g | dalla foto dell'etichetta (retro) | media |
| Codice a barre | 4104060025631 | dalla foto (retro) | media |
| Testo alternativo foto 1 | Vasetto di pudding alla vaniglia biologico Andechser Natur con fiori di vaniglia sull'etichetta | foto frontale | alta |
| Testo alternativo foto 2 | Lato del vasetto Andechser Natur con valori nutrizionali, codice a barre e marchio Bioland | foto retro | alta |

### 2.3 Hummus di ceci senza aglio bio (Baule Volante)

| Campo | Bozza | Fonte | Confidenza |
|---|---|---|---|
| Nome | Hummus di ceci senza aglio biologico (Baule Volante) | foto frontale | alta |
| Descrizione breve | Crema di ceci bio senza aglio, pronta all'uso. Sul pane tostato, con una pita o con verdure crude di stagione. | etichetta «Come si usa»: «crema delicata e versatile pronta all'uso… pita… pane tostato… verdure crude di stagione»; «fonte di fibre» in etichetta | alta |
| Categoria | `alimentari-dispensa` (oggi `alimentari`); è un prodotto da frigo, ma non c'è una figlia «sughi e creme» | codice | media (scelta mia) |
| Peso | **da chiedere** (non fotografato) | foto | non letto |
| Marca | Baule Volante | dalla foto dell'etichetta | alta |
| Ingredienti | **da chiedere** (faccia con l'elenco non fotografata; da fotografare) | foto | non letto |
| Allergeni | **da chiedere** (non si deducono dalle foto: chiedere in particolare se c'è sesamo) | foto | non letto |
| Conservazione | In frigorifero tra 0 °C e +4 °C. Dopo l'apertura, in frigorifero e da consumare entro 2 giorni. Confezionato in atmosfera protettiva. | dalla foto dell'etichetta (lato) | alta |
| Origine | Prodotto per Baule Volante, Calenzano (FI); stabilimento a Verona. Origine dei ceci: da chiedere. | dalla foto (lato) | alta per i luoghi |
| Valori per 100 g | 1028 kJ / 247 kcal; grassi 14 g (saturi 1,8 g); carboidrati 19 g (zuccheri 1,4 g); fibre 6,4 g; proteine 8 g; sale 1,7 g | dalla foto dell'etichetta | media |
| Testo alternativo foto 1 | Vaschetta di hummus di ceci biologico senza aglio Baule Volante, con ceci e rosmarino illustrati | foto frontale | alta |
| Testo alternativo foto 2 | Lato della vaschetta di hummus Baule Volante con i suggerimenti d'uso | foto 2 | alta |
| Testo alternativo foto 3 | Lato della vaschetta di hummus Baule Volante con valori nutrizionali e modo di conservazione | foto 3 | alta |

### 2.4 Kefir di capra bio da bere 200 g (Biobruni)

| Campo | Bozza | Fonte | Confidenza |
|---|---|---|---|
| Nome | Kefir di capra magro biologico da bere 200 g (Biobruni) | foto frontale: «Kefir magro biologico di capra da bere» | alta |
| Descrizione breve | Kefir bio da latte scremato di capra, in bottiglietta di vetro da 200 g. Da bere: si agita prima dell'uso. Latte di origine italiana. | etichetta: «Origine del latte: Italia», «agitare prima dell'uso» | alta |
| Categoria | `alimentari-latticini` (già giusta) | database + codice | alta |
| Peso | 200 g | dalla foto dell'etichetta; coincide col database | alta |
| Marca | Biobruni | dalla foto dell'etichetta | alta |
| Ingredienti | Latte scremato pastorizzato di capra*; fermenti lattici vivi (Lactococcus lactis, Leuconostoc mesenteroides, Streptococcus thermophilus, Lactobacillus acidophilus, Debaryomyces hansenii, Saccharomyces spp. unisporus ed exigus). *ingredienti biologici | dalla foto dell'etichetta (ingrandita) | alta; il database scrive «fermenti lattici vivi» senza i nomi, che invece ci sono |
| Allergeni | Latte e derivati (in grassetto nell'elenco) | dalla foto dell'etichetta | alta. **Oggi manca nel database** |
| Conservazione | Frigorifero (dal database; la dicitura sull'etichetta non si legge) | database | media |
| Origine | Latte: Italia | dalla foto dell'etichetta | alta |
| Valori per 100 g | 169 kJ / 40 kcal; grassi 0,9 g (saturi 0,6 g); carboidrati 4,3 g (zuccheri 4,2 g); proteine 3,5 g; sale 0,10 g | dalla foto dell'etichetta | alta |
| Testo alternativo foto 1 | Bottiglietta di vetro di kefir magro biologico di capra da bere Biobruni, 200 g | foto frontale | alta |
| Testo alternativo foto 2 | Retro della bottiglietta Biobruni con ingredienti, valori nutrizionali e origine del latte | foto retro | alta |

Le foto 3 e 4 di questo prodotto sono le stesse della 1 e della 2 (stessa dimensione e stessi dettagli): se il negozio le ha caricate due volte, se ne può togliere una coppia.

### 2.5 Pesto genovese bio 120 g

| Campo | Bozza | Fonte | Confidenza |
|---|---|---|---|
| Nome | Pesto genovese biologico classico 120 g | foto frontale: «Pesto Genovese BIO, Classico» | alta |
| Descrizione breve | Pesto genovese bio con basilico genovese DOP (25%), olio extravergine, Parmigiano Reggiano DOP e pinoli. Senza glutine. Vasetto di carta da 120 g. | etichetta (retro, ingrandita) | alta |
| Categoria | `alimentari-dispensa` (oggi `alimentari`); è da frigo, vedi nota hummus | codice | media |
| Peso | 120 g | dalla foto dell'etichetta; coincide col testo alternativo del database | alta |
| Marca | **Artigiana Amadori** (logo sul fronte). Produttore: Artigiana Genovese S.r.l., via Ungaretti 6/L, Genova Prà. Nel database oggi: «Artigiani del Madouri». | dalla foto dell'etichetta | alta per il logo e il produttore |
| Ingredienti | Olio extravergine di oliva*, basilico genovese DOP* 25%, Parmigiano Reggiano DOP* (latte*, sale, caglio), siero di latte in polvere*, sale, pinoli*, aglio*, antiossidante: acido ascorbico. (*ingredienti biologici). Senza glutine. | dalla foto dell'etichetta (ingrandita) | alta |
| Allergeni | Latte (in grassetto nell'etichetta). Può contenere tracce di frutta a guscio e soia. | dalla foto dell'etichetta | alta |
| Conservazione | In frigorifero a +4 °C. Dopo l'apertura, consumare entro 3 giorni. | dalla foto dell'etichetta | alta |
| Origine | Prodotto e confezionato a Genova (Prà). Origine degli ingredienti: da chiedere. | dalla foto dell'etichetta | alta per il luogo di confezionamento |
| Valori per 100 g | 2178 kJ / 528 kcal; grassi 53 g (saturi 10 g); carboidrati 6,1 g (zuccheri 5,4 g); proteine 7 g; sale 2,8 g | dalla foto dell'etichetta | media |
| Testo alternativo foto 1 | Vasetto di carta di pesto genovese biologico classico Artigiana Amadori, 120 g | foto frontale | alta |
| Testo alternativo foto 2 | Retro del vasetto di pesto genovese bio con ingredienti, allergeni e valori nutrizionali | foto retro | alta |

**Perché la marca conta:** il database dice «Artigiani del Madouri», l'etichetta dice altro. Un cliente che cerca il marchio non lo troverebbe, e uno che legge la scheda e poi il vasetto vede due nomi. Da correggere anche nel testo alternativo.

## 3. Gli orari scritti per esteso

Fonte: database (`store_hours`), letto il 7/11. Da confermare con il negozio (riga 11 della tabella).

- **Lunedì:** 9:00-13:00 e 16:30-19:30
- **Martedì:** 9:00-13:00 e 16:30-19:30
- **Mercoledì:** 9:00-13:00 e 16:30-19:30
- **Giovedì:** 9:00-13:00 (il pomeriggio è chiuso)
- **Venerdì:** 9:00-13:00 e 16:30-19:00
- **Sabato:** 9:00-13:00 e 16:30-19:30
- **Domenica:** chiuso

In una frase, per la pagina: «Aperto dal lunedì al sabato la mattina dalle 9 alle 13; il pomeriggio dalle 16:30 (alle 19:30; il venerdì alle 19:00), tranne il giovedì. Domenica chiuso.»

Totale: 6 giorni su 7 aperti; 5 pomeriggi su 6 aperti (il giovedì no).

## 4. Errori trovati nei dati attuali

1. Marca del pesto sbagliata nel testo alternativo e nella scheda («Artigiani del Madouri», sull'etichetta «Artigiana Amadori»).
2. Kefir di capra senza allergeni nel database, ma l'etichetta dice latte. Il campo allergeni è obbligatorio per gli alimentari.
3. Kefir 400 g: la scheda dice «colture kefir». L'etichetta dice «fermenti lattici».
4. Kefir 400 g: la scheda dice «agricoltura biodinamica Demeter». L'etichetta dice «agricoltura biologica» e porta il marchio Demeter solo sul fronte.

## 5. Da chiedere al negozio

| N. | Domanda | Prodotto | Perché non lo so | Urgente |
|---|---|---|---|---|
| 1 | Vendete anche pane e miele? Sì o no | negozio | decide la versione A o B | sì |
| 2 | Foto dell'elenco ingredienti | hummus | faccia non fotografata | sì |
| 3 | Foto dell'elenco ingredienti (bordo del vasetto) | pudding | illeggibile | sì |
| 4 | Allergeni (c'è sesamo? latte?) | hummus, pudding | non deducibili | sì |
| 5 | Peso in grammi | hummus, pudding | non letto | sì |
| 6 | Dicitura di conservazione | pudding | illeggibile | no |
| 7 | Origine dei ceci / degli ingredienti | hummus, pesto | non scritta nelle foto | no |
| 8 | Origine del pudding | pudding | etichetta in tedesco | no |
| 9 | Scadenza dei pezzi in vendita (prima del 15/11) | tutti | si legge solo sul pezzo | no |
| 10 | Perché le scorte sono tutte a 20? Sono davvero 20 pezzi? | tutti | sembra un numero messo a mano | no |
| 11 | Orari corretti? (il giovedì pomeriggio è chiuso?) | negozio | solo database | sì |
| 12 | Ritiro in negozio: lo fate davvero? Consegna rapida: la fate? | negozio | badge attivi nel database | no |
| 13 | Il bollino «prodotti locali» e «sostenibile»: toglierli? | negozio | nessun prodotto è di Piacenza | no |
| 14 | Conferma la marca del pesto: «Artigiana Amadori» | pesto | database in contrasto con etichetta | no |

## Dettagli tecnici

- **Come ho letto le foto.** Scaricate le 13 immagini JPEG 1200x1600 dalla pagina pubblica di ogni prodotto (solo richieste GET) e guardate una per una; ingrandite quattro zone (ingredienti pesto, marca pesto, retro kefir di capra, bordo pudding). Cartella di lavoro non versionata.
- **Foto per prodotto:** kefir 400 g (2), pudding (2), hummus (3), kefir di capra (4, di cui 2 doppie), pesto (2). Totale 13, coerente con `n_foto` del database (2+2+3+4+2).
- **Campi del sito usati:** `lib/category-attributes.ts`, categoria `alimentari`: marca, peso, confezione, origine, bio, senza_glutine, senza_lattosio, vegano, allergeni (obbligatorio), ingredienti (obbligatorio), valori_nutrizionali, conservazione, scadenza, ean. Valore da scrivere quando non ci sono allergeni: «Nessuno dei 14 allergeni».
- **Bio/vegano/senza glutine:** `bio` letto sul pesto, hummus, pudding, kefir; `senza_glutine` letto solo sul pesto (scritto sull'etichetta). Il resto non si spunta senza etichetta.
- **Pinoli:** non li ho trattati come allergene a sé: la dicitura letta è «può contenere frutta a guscio, soia» e va riportata così; la qualifica giuridica la lascio a chi ha competenza legale.
- **Foto non scritte nel database:** nessun campo è stato modificato; tutto qui è bozza.
