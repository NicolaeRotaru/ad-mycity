---
data: 2026-11-07 12:00
autore: seo (SEO locale)
negozio: Pane Quotidiano, Via Calzolai 25, Piacenza
colore: 🟢 analisi e bozze; 🟡 per ogni modifica al sito e per la scheda Google
---

# Come si trova Pane Quotidiano: su Google, quando condividi il link, dentro MyCity

## In parole semplici

Questo documento dice se un cliente di Piacenza riesce a trovare Pane Quotidiano, e cosa sistemare perché lo trovi. Ho guardato tre strade con cui una persona di Piacenza può arrivare al negozio: cercandolo su Google, ricevendo un link su WhatsApp, o scrivendo una parola nella ricerca di MyCity. Su Google non ho trovato nessuna scheda del negozio. Il link condiviso si apre bene ma racconta un negozio che non coincide con i prodotti in vetrina. Dentro MyCity, chi scrive «pane» non trova il negozio, perché la ricerca guarda solo il nome e il testo dei prodotti, mai il nome del negozio. Esempio: lunedì 16/11 una signora di Via Calzolai scrive «pane» nella barra e vede solo l'hummus, per una frase della sua descrizione.

## Cosa cambia per te

- Il 15/11 chi cerca «Pane Quotidiano» su Google troverà probabilmente la pagina MyCity, ma non una scheda con mappa, orari e telefono. È lì che un cliente vero decide se fidarsi.
- Oggi il testo che Google mostra sotto il nome promette pane e miele. Gli unici 5 prodotti sono latticini, creme e sughi bio. Chi arriva per il pane e non lo trova se ne va, e Google lo nota.
- La correzione che costa meno e rende di più è riscrivere una frase di descrizione (5 minuti, serve il sì del negoziante). Quella che rende di più in assoluto è la scheda Google, ma richiede il negoziante.

## Cosa devi fare

- Chiedere al negoziante due cose, a voce o su WhatsApp: ha già una scheda Google (o Google Maps lo mostra)? E vende pane e miele davvero, o solo i 5 prodotti caricati? Bozza del messaggio nei Dettagli, sezione B. Non l'ho inviato.
- Dare il via alla nuova descrizione (testo nei Dettagli, sezione E) appena il negoziante risponde su pane e miele.
- Dare il via a @frontend-dev per le due modifiche al sito (ricerca per nome negozio, dati strutturati): sono 🟡, in un branch, mai sul sito vero senza la tua firma.

## Cosa non ho verificato

- **Scheda Google**: ho fatto 2 ricerche web. Non sono la ricerca di Google né Google Maps: una scheda esistente, ma non indicizzata da questo strumento, mi può sfuggire. «Non l'ho trovata» vuol dire fiducia media, non certezza. Il controllo vero lo fa chi apre Google Maps da telefono in 30 secondi.
- **Ricerca interna**: la tabella delle parole viene dalla lettura del codice e dalle prove già fatte il 7/11 (pane, kefir, hummus). Per le altre parole non ho potuto scrivere nella barra di ricerca, perché non uso moduli sul sito vero. Fiducia alta sul meccanismo, media sul singolo caso.
- **Dati strutturati**: ho letto il codice dell'HTML. Non ho passato il «Rich Results Test» di Google (serve inviare l'indirizzo a un loro strumento): da fare in branch.
- **Volumi di ricerca**: non ho uno strumento keyword (nessuna spesa autorizzata). Le parole proposte sono scelte per intenzione d'acquisto, non per numero di ricerche.
- Non ho confrontato orari e foto con la scheda Google, perché la scheda non l'ho trovata.

## Dettagli tecnici

### A. La pagina del negozio, letta dall'HTML pubblico (GET, da visitatore)

Indirizzo: `/store/c0b240c0-2a86-4218-9d0f-5154f08ff929`, risposta 200, `lang="it"`, canonical corretto, presente in `sitemap.xml` (28 indirizzi in tutto, con il negozio, i 5 prodotti e le 2 categorie), `robots.txt` lo lascia passare.

| Elemento | Cosa c'è oggi | Giudizio |
|---|---|---|
| Titolo | «Pane Quotidiano a Piacenza — Acquista online · MyCity Piacenza» (62 caratteri) | Buono: nome, città, intento |
| Descrizione | «specializzata nella vendita di prodotti alimentari, tra cui pane, miele biologico (acacia, tiglio, castagno, propoli) e altri generi.» | Debole: minuscola iniziale, senza soggetto, promette pane e miele che non sono in vetrina, niente via, niente «consegna» |
| Anteprima (og:title) | «Pane Quotidiano» | Manca la città |
| Anteprima (og:image) | Immagine generata 1200×630: sfondo rosso, logo «My», nome, la stessa descrizione tagliata con «…», «Piacenza», «pagamento alla consegna» | Si legge, ma non c'è la foto del negozio (ne esiste 1 in `store_media`) e il testo tagliato è proprio quello sbagliato |
| og:image:alt | «Negozio su MyCity» | Generico |
| twitter:card | `summary` con immagine 1200×630 | Dovrebbe essere `summary_large_image` |
| Dati strutturati | `OnlineStore` (sito), `Store` (negozio), `BreadcrumbList` | Validi nella forma |

Cosa c'è nello `Store`: nome, descrizione, telefono `0523388601`, indirizzo, coordinate (45.0529425, 9.6916638, coerenti con il centro di Piacenza), url. Cosa manca, e il codice lo conferma (`app/store/[id]/page.tsx`, righe 78-111):

- **`image`**: il codice usa solo `store_logo`, che è vuoto. Esiste una foto in `store_media`: basta usarla come ripiego.
- **`openingHoursSpecification`**: il codice non lo scrive affatto, anche se gli orari sono nel database (lun-mer 9-13 e 16:30-19:30, gio 9-13, ven 9-13 e 16:30-19:00, sab 9-13 e 16:30-19:30, dom chiuso). Per «aperto ora» è il dato che Google più apprezza.
- **`streetAddress`**: contiene l'indirizzo intero «Via Calzolai, 25, 29100 Piacenza PC». Corretto: `Via Calzolai, 25` + `postalCode: 29100`.
- **`aggregateRating`**: previsto dal codice, assente oggi perché non ci sono recensioni. Va bene così: mai inventarlo.
- `BreadcrumbList` usa indirizzi relativi (`/`, `/stores`): da controllare nel Rich Results Test, meglio assoluti.

Scheda prodotto (provate 2: kefir Berchtesgadener e pudding): `Product` con nome, `sku`, descrizione, 2 immagini, `Offer` con prezzo 2.05 EUR, disponibilità, venditore «Pane Quotidiano» come `LocalBusiness`. Valido. Titolo «… — Pane Quotidiano a Piacenza · MyCity». Mancano `brand` (il kefir ha `marca: Berchtesgadener Land` nel database) e, sul pudding e sull'hummus, la marca e il peso: dati di etichetta, **da chiedere al negozio**, non li ricopio dalle foto.

### B. La scheda Google

Due ricerche web: «Pane Quotidiano» + «Via Calzolai 25 Piacenza», e «Pane Quotidiano Piacenza miele biologico … Google Maps orari». Nessun risultato per il negozio. Escono un'altra attività sulla stessa via (Spaccio Serafini, Via Calzolai 14) e i forni cittadini noti (Chiere, Chomp). Conclusione: **nessuna scheda trovata, fiducia media**. Nessun confronto orari/foto possibile.

Perché pesa: una ricerca come «alimentari biologici Piacenza centro» o «pane Via Calzolai» è decisa dal riquadro con mappa (i 3 risultati di Maps), non dal sito. Per entrare servono: nome, indirizzo e telefono identici ovunque, categoria giusta, orari, foto, recensioni. I dati su MyCity sono già pronti (nome «Pane Quotidiano», «Via Calzolai, 25, 29100 Piacenza PC», `0523388601`, orari sopra): se la scheda esiste o nasce, deve dire esattamente le stesse cose.

**Categoria da proporre** (da scegliere col negoziante in base a ciò che vende davvero): «Negozio di alimentari biologici» se resta il kefir/hummus/pesto; «Panetteria» solo se fa o vende pane. **Regola 🔴 rispettata:** non rivendico nessuna scheda e non ne creo una. La crea o la rivendica il titolare con il suo account Google; io preparo la lista dei dati.

Punto 1, bozza messaggio al negoziante (non inviata, da approvare; la manda Nicola):

> Buongiorno, sono di MyCity. Due domande veloci per sistemare la vostra vetrina. 1) Su Google Maps esiste già la scheda del negozio? Se sì, mi manda il nome esatto come appare? 2) Vendete anche pane e miele, o per ora solo i prodotti che vede sul sito? Così scriviamo una descrizione vera. Grazie!

### C. La ricerca dentro MyCity (letta dal codice del sito)

Come funziona (`lib/queries/griglia-prodotti.ts`, migrazione `129_il_catalogo_si_vede_senza_account.sql`, `027_growth_engagement_foundations.sql`):

- La pagina `/search` cerca solo **prodotti**, con la funzione `search_products_smart`: testo italiano su `search_tsv`, che contiene **solo nome (peso A) e descrizione (peso B) del prodotto**. Sotto le 3 lettere cerca per inizio parola.
- Non entrano nell'indice: nome del negozio, indirizzo, categoria, marca, `attributes` (bio, origine…), nome dei badge.
- La tendina di suggerimenti sotto la barra (`lib/queries/suggerimenti-ricerca.ts`) invece **cerca anche i negozi per nome** (`ilike store_name`) e le categorie. Quindi chi digita «pane quo…» vede il negozio nella tendina, ma chi preme Invio e va alla pagina dei risultati no. Non ho provato la tendina dal vivo (è codice che gira nel browser): da controllare in branch.

| Cosa scrive il cliente | Trova | Perché |
|---|---|---|
| kefir, hummus, pesto, pudding/budino | I prodotti giusti | Nel nome |
| capra, vaniglia, ceci | I prodotti giusti | Nel nome |
| bio, biologico | Probabilmente tutti i prodotti | Nel nome o nella descrizione (non provato uno per uno) |
| **pane** | Solo l'hummus (provato il 7/11), per una frase della descrizione («condire pane e verdure») | Non cerca il nome del negozio. Nessun pane in vetrina |
| **Pane Quotidiano** | Come sopra nei risultati; il negozio solo nella tendina | Idem |
| **miele**, propoli, acacia | Niente (a parte il testo del negozio, che non è indicizzato) | Nessun prodotto: solo promesso nella descrizione |
| **Calzolai**, «Via Calzolai», «centro» | Niente | L'indirizzo non è indicizzato |
| Baule Volante, Andechser, Biobruni (marche) | Niente, salvo che la marca sia nel nome (solo Berchtesgadener lo è) | La marca sta in `alt_text` o negli attributi, non nell'indice |
| latticini, alimentari | La categoria (griglia categoria), non la ricerca | Le categorie sono a parte |
| formaggio, yogurt, latte | Niente o parziale | Nessun prodotto con quel nome (kefir e budino contengono latte ma non lo dicono nel nome) |

### D. Correzioni, in ordine di effetto

| # | Cosa | Effetto atteso | Chi / colore |
|---|---|---|---|
| 1 | **Scheda Google del negozio** (creare o rivendicare), con gli stessi nome, indirizzo, telefono, orari del sito, categoria vera e 3-5 foto | La più grande: è l'unico modo di comparire nel riquadro con mappa. Stima: da 0 a visibile sulle ricerche «negozio + zona». Non misurabile senza Search Console | Titolare + Nicola. 🔴 (non si rivendica ciò che non controlliamo) |
| 2 | **Riscrivere la descrizione del negozio** (alimenta titolo di Google, anteprima WhatsApp, dati strutturati, pagina) | Alto, costa 5 minuti. Toglie la promessa falsa e mette via e città | Negoziante dal suo pannello, o noi con la sua conferma. 🟡 |
| 3 | **La ricerca trova il negozio per nome** nella pagina dei risultati, non solo nella tendina (blocco «Negozi» sopra i prodotti) | Alto per chi cerca «pane» o il nome del negozio. Il pane resta assente finché non c'è | @frontend-dev, branch, 🟡 |
| 4 | **Indicizzare marca e categoria** nel testo del prodotto (nella funzione di ricerca o nella colonna `search_tsv`) | Medio: «Biobruni», «latticini» iniziano a trovare qualcosa. Richiede una migrazione del database: 🔴 | @frontend-dev + @tech, firma Nicola |
| 5 | **Dati strutturati**: aggiungere `openingHoursSpecification`, usare `store_media[0]` come immagine, indirizzo spezzato in via + CAP, `brand` sui prodotti dove la marca esiste | Medio: abilita «aperto ora» e l'immagine nei risultati | @frontend-dev, branch, 🟡. Poi Rich Results Test |
| 6 | **Anteprima del link**: città nel titolo (`og:title`), `summary_large_image`, `alt` descrittivo, e foto del negozio al posto del solo logo «My» | Medio-basso: più clic dai link in WhatsApp | @frontend-dev, 🟡 |
| 7 | **Caricare il pane e il miele, se esistono** (1 foto, 1 prezzo, peso e ingredienti dall'etichetta) | Chiude la contraddizione alla radice; fa funzionare la ricerca «pane» da sola | Negozio, con la mini-guida del @designer. 🟢 per noi |

### E. Descrizione proposta (punto 2), due versioni

Versione A, da usare **subito** (poggia solo sui prodotti oggi in vetrina e sull'indirizzo del database):

> Pane Quotidiano, in Via Calzolai 25 a Piacenza: alimentari biologici come kefir, hummus, pesto e budini. Ordini su MyCity e paghi alla consegna, in contanti.

(158 caratteri, sotto il taglio di ~160 di Google. «In contanti» vale solo al lancio: quando riaccenderete la carta va tolto.)

Versione B, **solo se il negoziante conferma** pane e miele:

> Pane Quotidiano, in Via Calzolai 25 a Piacenza: pane, miele biologico (acacia, tiglio, castagno) e alimentari bio. Ordini su MyCity e paghi alla consegna.

Raccomandazione: A adesso, B dopo la risposta. Parola principale della pagina: «alimentari biologici Piacenza» (intento: comprare; la parola «pane» la riprendiamo solo quando c'è il pane). Cannibalizzazione: nessuna, una sola pagina negozio.

### F. Metrica di successo

- Dopo il 15/11: apertura di Search Console su `mycity-marketplace.com` (**carburante mancante**: oggi lavoro senza dati reali di posizione). Chiedere a Nicola l'accesso o la verifica del dominio.
- Misura a 4 settimane: la pagina `/store/c0b2…` compare per «pane quotidiano piacenza» in prima posizione? Clic organici sul negozio. Ipotesi, non promessa: la ricerca per nome dovrebbe portare la pagina in alto, il resto dipende dalla scheda Google.
- Scorecard (1-5, rubrica livelli): intento e keyword 3 (niente volumi veri), correttezza tecnica 4, dati reali 4, eseguibilità 4, misurabilità 2 (manca Search Console), impatto 4. I due assi più bassi: misurabilità e keyword.

### G. Rischio da dichiarare

Nessuna pagina-quartiere o doorway da produrre ora: un solo negozio non giustifica pagine «alimentari a [quartiere]» (penalità per contenuto sottile). Prima il catalogo reale, poi i template.

Passaggi: PASSO-A @frontend-dev punti 3, 5, 6 (branch, mai sul sito vero) · PASSO-A @tech punto 4 (migrazione) · PASSO-A @designer punto 7 (guida foto) · PASSO-A @content-social punto 2 (rifinitura del testo) · PASSO-A @legale-privacy per «biologico» nella descrizione (claim: serve conferma della certificazione del negozio).
