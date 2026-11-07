---
tipo: accoglienza-negozio, obblighi
reparto: legale-privacy
data: 2026-11-07 02:50
stato: bozza da far validare da un legale abilitato
---

# Pane Quotidiano: cosa manca per essere in regola e per ricevere i soldi

**In parole semplici**

Questo foglio è la parte «obblighi» dell'accoglienza di Pane Quotidiano. Dice cosa la legge pretende sulle sue pagine, e cosa serve a te per pagarlo.

Ho letto il database (sola lettura, 7/11 alle 02:30), le 6 pagine pubbliche del negozio e il codice del sito. Ho trovato tre buchi veri.

- **Non abbiamo i dati della ditta.** Ragione sociale, partita IVA, sede, IBAN (il codice del conto in banca): 4 campi su 4 vuoti. Senza IBAN non puoi fare il bonifico del lunedì. Senza partita IVA non puoi fatturargli il 10%.
- **Mancano le informazioni sugli alimenti.** Pudding, hummus e pesto (3 prodotti su 5) sono in vendita senza ingredienti e senza allergeni. Nessuno dei 5 ha la tabella nutrizionale.
- **Non c'è un accordo firmato.** Il negozio non ha mai accettato i Termini. La bozza di contratto dice ancora 12% e Stripe, mentre la regola firmata è 10% e contanti.

Un esempio: il cliente compra l'hummus e non sa se contiene sesamo. Per una vendita online la legge vuole che lo legga prima di pagare.

Ci sono anche due buone notizie. Al fornaio **non servono** documento d'identità e selfie: una regola europea esonera i siti piccoli come MyCity. E le frasi a rischio le abbiamo scritte noi, quindi le togliamo noi in 5 minuti.

Il riassunto, detto in un altro modo: una visita di 20 minuti al banco chiude quasi tutto. Restano a te due scritture e una firma.

**Cosa cambia per te**

- **Prima del 15/11:** vai dal fornaio con il foglio di domande in fondo. Ti servono 20 minuti: dati della ditta, IBAN, email, foto delle etichette, firma.
- **Il sito non ha una pagina** dove un negozio già approvato possa scrivere partita IVA e IBAN. Pane Quotidiano è stato approvato il 15/6, prima che il modulo li chiedesse. Quei dati li devi scrivere tu nel database, oppure serve una pagina nuova.
- **Il bonifico del lunedì:** se il primo ordine in contanti arriva lunedì 16/11, il primo bonifico è lunedì 23/11. Entro quel giorno ti servono IBAN e firma.
- **La carta:** il conto Stripe del negozio esiste, ma il fornaio non ha mai mandato i suoi dati. Incassi e versamenti sono spenti. Il modulo di Stripe dura circa 10 minuti, lo fa lui.
- **Sei frasi o etichette da togliere** dalle pagine del negozio. Alcune la legge le vieta, altre sono solo rischiose. Le trovi nella tabella dei dettagli.

**Cosa devi fare**

Tre decisioni, la mia raccomandazione è la prima di ognuna.

- **Prima decisione:** dimmi «ok frasi» e preparo la correzione delle sei frasi rischiose. Sono «flora intestinale», «probiotici», «ecosostenibile», «carta sostenibile» e i bollini «Sostenibile» e «Prodotti locali».
- **Seconda decisione:** i dati della ditta li scrivi tu nel database, copiandoli dal foglio firmato dal fornaio. L'alternativa è una pagina «Dati della ditta» nel profilo del negozio: meglio, ma arriva dopo il 15/11.
- **Terza decisione:** dimmi «ok contratto» e aggiorno la bozza: 10% invece di 12%, contanti che incassi tu per conto del negozio, bonifico ogni lunedì. Poi la firmate in due copie.

**Cosa non ho verificato**

- **Le norme** le ho ricontrollate con ricerche sul web, su fonti di seconda mano. Gli importi delle multe e la regola sul biologico venduto online vanno riconfermati dal legale.
- **Il biologico:** non so se Pane Quotidiano ha un certificato bio suo. Senza, il bollino «Biologico» sul negozio è un rischio.
- **Il database di oggi:** il 5/11 era fermo a un aggiornamento vecchio. Non so se il controllo sugli ingredienti e la spunta «escluso dal reso» sono già attivi.
- **Lo schermo:** il riquadro «Ingredienti e allergeni» si apre nel telefono. Ho letto la pagina che manda il server e il codice, ma non l'ho visto aperto.
- **La data di apertura:** questo compito dice che il 15/11 la carta è spenta. Il registro dei fatti del 1/11 dice invece «si apre solo con contanti e carta». Se vale il registro, Stripe va chiuso prima del 15/11.
- **Nessun legale abilitato** ha letto questo foglio. È una bozza solida, non un parere.

## Dettagli tecnici

### A. OBBLIGATORIO — senza questo non si è in regola o non si paga

Legenda «chi»: **N** = negozio, **Ni** = Nicola, **S** = sito (codice o testi, quindi la squadra tech o l'AD).

| # | Cosa manca oggi | Norma | Chi | Entro |
|---|---|---|---|---|
| O1 | **Ingredienti e allergeni**: pudding, hummus e pesto non hanno né l'uno né l'altro. Il kefir di capra ha gli ingredienti ma non il campo allergeni. | Reg. UE 1169/2011 art. 9 c.1 lett. b-c, art. 14 c.1 lett. a, art. 21 (allergeni evidenziati negli ingredienti). Multa: D.Lgs. 231/2017, articolo sulla vendita a distanza, **2.000-16.000 €** secondo le fonti trovate (da riconfermare su Normattiva). | N dà le etichette → S trascrive → N approva | **Prima del 15/11.** Sono già in vendita: il rischio c'è adesso |
| O2 | **Il resto delle informazioni obbligatorie**, su tutti e 5: tabella nutrizionale (manca a 5 su 5), nome e indirizzo del produttore (manca a 5 su 5), quantità netta (manca a pudding e hummus, il pesto la ha solo nella descrizione), conservazione (manca a pudding, hummus e pesto). | Reg. UE 1169/2011 art. 9 c.1 lett. e, g, h, l + art. 14: tutto prima dell'acquisto, tranne la data di scadenza. La scadenza basta sulla confezione consegnata. | N (etichette) → S | **Prima del 15/11** |
| O3 | **Chi vende, sulla pagina**: oggi «Venduto da» mostra insegna, via e telefono. Mancano la **ragione sociale** e l'**email** del negozio. | Codice del consumo art. 49 c.1 lett. b-c (identità del professionista, indirizzo, telefono, email). | N dà i dati → Ni li scrive → S li mostra già (ragione sociale e P.IVA compaiono da sole se il database ha le colonne della migrazione 126). L'email il riquadro non la mostra: piccola modifica S | **Prima del 15/11.** Rischio basso, costo quasi zero |
| O4 | **Accordo col negozio**: Termini accettati = no. La bozza di contratto in `consegne/legale/contratto-pane-quotidiano-bozza.md` dice 12% e pagamenti Stripe: è superata. | Codice civile: trattenere il 10% dal bonifico richiede un accordo (artt. 1321 e 1241 sulla compensazione). Reg. UE 2019/1150 (P2B) art. 3: condizioni chiare, accettate dal negozio, modifiche con almeno 15 giorni di preavviso. | Ni aggiorna e firma, N firma | **Prima del primo ordine.** Al più tardi prima del primo bonifico |
| O5 | **Permesso scritto a incassare i contanti per conto del negozio.** Oggi il cliente paga Nicola, non il negozio. | Codice civile art. 1188: il pagamento fatto alla persona indicata dal creditore lo libera. Serve una riga nel contratto: «il Negozio autorizza MyCity a incassare in suo nome e per suo conto». | Ni (clausola nel contratto di O4) | **Prima del primo ordine in contanti** |
| O6 | **IBAN e intestatario** per il bonifico del lunedì. | Contratto (O4) e Termini al paragrafo 8: «bonifico ogni lunedì». Controllo antifrode: il conto deve essere **intestato alla ditta**, non a un privato a caso. | N | **Prima del primo bonifico**: lunedì 23/11 se il primo ordine è del 16/11 |
| O7 | **Dati per la fattura del 10%** che MyCity manda al negozio: ragione sociale, partita IVA, sede legale. | DPR 633/1972 art. 21 c.2 (dati di chi riceve la fattura). Fattura elettronica obbligatoria anche fra imprese (L. 205/2017 art. 1 c. 909). | N | **Prima della prima fattura** (fine del primo mese). In pratica: alla stessa visita |
| O8 | **Informativa privacy al titolare** quando gli prendiamo nome, IBAN e dati fiscali. Oggi «privacy accettata» = no. **Non serve un consenso**: le basi giuridiche sono il contratto e gli obblighi fiscali. | GDPR art. 13 (informare quando si raccolgono i dati), art. 6.1 lett. b e c. | Ni consegna l'informativa insieme al contratto | **Alla visita** |
| O9 | **Frasi vietate o ingannevoli** sulle pagine (elenco esatto nella sezione C). | Reg. CE 1924/2006 art. 10 (salute: solo frasi autorizzate). Codice del consumo come cambiato dal D.Lgs. 30/2026, in vigore dal 27/9/2026 (frasi «verdi» generiche). Codice del consumo art. 21 (origine ingannevole). | S (le abbiamo scritte noi) | **Prima del 15/11.** Costo: 5 minuti |
| O10 | **Stripe, solo per la carta**: conto creato, dati mai inviati, incassi spenti, versamenti spenti. | Obblighi antiriciclaggio del prestatore di pagamento (Direttiva UE 2015/849): Stripe deve identificare il titolare. Li assolve Stripe, non MyCity. | N, dal suo cruscotto: pulsante del collegamento Stripe (documento + IBAN, circa 10 minuti) | **Prima di accendere la carta.** Se vale il registro dei fatti del 1/11, prima del 15/11 |

### B. CONSIGLIATO — non è un obbligo stretto, ma conviene

| # | Cosa | Perché | Chi | Entro |
|---|---|---|---|---|
| C1 | **Bollino «Biologico» sul negozio** e frase «miele biologico» nella descrizione (online non c'è nessun miele). | Reg. UE 2018/848: chi rivende bio confezionato è esonerato dal certificato solo se vende **di persona**. Le FAQ della Commissione dicono che l'online non rientra. Un accordo europeo di ottobre 2026 allargherebbe l'esonero ai piccoli negozi online, ma non risulta ancora in vigore. Rischio medio, da chiarire. | N risponde se è certificato. Se no, S toglie il bollino dal negozio. I nomi dei prodotti restano come sull'etichetta del produttore: rischio più basso, lo rivaluta il legale | Bollino: **prima del 15/11** |
| C2 | **«Escluso dal reso» prodotto per prodotto** su kefir, kefir di capra, pudding, hummus. Il pesto solo se va tenuto in frigo. | Codice del consumo art. 49 c.1 lett. m e art. 59 lett. d. Oggi ogni scheda dice la frase generica «esclusi i prodotti freschi, deperibili o fatti su ordinazione»: per prodotti chiaramente freschi probabilmente basta. La spunta per prodotto arriva con la migrazione 180. | N spunta, S applica la 180 (🔴, Nicola) | Dopo il 15/11 va bene |
| C3 | **Partita IVA e «venditore professionista»** visibili nel riquadro «Venduto da». | DSA art. 30 c.7 lo chiederebbe, ma l'art. 29 esonera i siti micro e piccoli. Codice del consumo art. 49-bis: i Termini dicono già che il Venditore è un professionista con partita IVA. Sulla pagina rafforza la fiducia. | S (la P.IVA compare da sola dopo O3) | Insieme a O3 |
| C4 | **Registrazione sanitaria aggiornata** alle consegne a domicilio. | Reg. CE 852/2004 art. 6. La scheda della Regione Emilia-Romagna dice che per l'e-commerce accessorio non serve un permesso commerciale in più. Per la notifica sanitaria va chiesto all'AUSL o al SUAP se serve una variazione. | N (il suo consulente HACCP) | Prima del primo ordine con consegna, se possibile |
| C5 | **Catena del freddo** per kefir, pudding, hummus (e pesto se da frigo). Dalla foto dell'etichetta del kefir Berchtesgadener: «Conservare a max +8 °C». Sicurezza della lettura: alta. | Reg. CE 852/2004 allegato II capitolo IV (trasporto). La borsa termica c'è già. Corso HACCP e polizza dopo il lancio sono un **rischio che hai scelto il 1/11**, non una dimenticanza. | Ni | Già coperto dalla tua scelta |
| C6 | **Scontrino o documento delle vendite online.** È del negozio (Termini paragrafo 8). Per la consegna a casa le regole sono diverse dal banco. | Materia fiscale: decide il commercialista del negozio, non noi. | N (commercialista) | Prima del primo ordine |
| C7 | **Codice destinatario (7 caratteri) o PEC** per la fattura elettronica. | Senza, la fattura si manda col codice «0000000» e il negozio la trova nel suo cassetto fiscale. Non blocca niente. | N | Quando lo trova |
| C8 | **Due frasi dei Termini da allineare.** ① Promettono ai Venditori una «verifica KYC» con documento d'identità, ma il sito non la chiede ai negozi. ② Dicono «IVA inclusa» sulla commissione, mentre il registro la tiene sospesa finché il commercialista non conferma il regime. | Una promessa scritta e non mantenuta è un rischio inutile. **Togliere la frase costa meno che raccogliere documenti** (minimizzazione dei dati). | S (testi) + @finanza per l'IVA | Dopo il 15/11 va bene |

### C. Le sei frasi o etichette da togliere (O9 + C1)

| Dove si vede | Frase | Perché | Rischio |
|---|---|---|---|
| Kefir Berchtesgadener, descrizione | «per il benessere della flora intestinale» | Frase sulla salute non presente nell'elenco UE delle frasi autorizzate (Reg. UE 432/2012) | **Alto**: è vietata |
| Kefir di capra, descrizione | «ricca di probiotici» | La Commissione la tratta come frase sulla salute. In Italia la prassi è discussa | Medio: togliere costa zero |
| Kefir Berchtesgadener, descrizione | «brick TetraTop ecosostenibile» | Frase «verde» generica, vietata dal 27/9/2026 senza una prova riconosciuta | Medio-alto |
| Pesto, descrizione | «confezionato in carta sostenibile» | Stesso motivo | Medio-alto |
| Pagina del negozio, bollino | «Sostenibile» | Stesso motivo | Medio-alto |
| Pagina del negozio, bollino | «Prodotti locali» | Dei 5 prodotti online, 2 vengono dalla Germania (kefir Berchtesgadener, pudding Andechser) | Medio-basso: torna giusto quando ci sarà il pane |

Proposta di testo sostitutivo, senza frasi a rischio:
- Kefir Berchtesgadener: «Kefir biologico Demeter di Berchtesgadener Land, latte parzialmente scremato (1,5% di grassi) con fermenti lattici vivi. Gusto fresco e leggermente acido. Confezione da 400 g in brick. Conservare in frigorifero.»
- Kefir di capra: «Kefir magro biologico di latte di capra, con fermenti lattici vivi. Bottiglia di vetro da 200 g.»
- Pesto: «Pesto alla genovese biologico Artigiani del Madouri, vasetto da 120 g.»

### D. Cosa NON chiedere al fornaio (abilita, non frenare)

- **Documento d'identità e selfie: no.** Il DSA, art. 30, li vorrebbe, ma l'art. 29 esonera le piattaforme micro e piccole. Il codice del sito non li pretende dai negozi: in `lib/admin/regole-approvazione.ts` la lista dei documenti obbligatori del venditore è vuota. Stripe li chiede da sé quando si accende la carta. Meno dati teniamo, meno rischiamo.
- **Codice fiscale e residenza del titolare: no, per ora.** Servono a Stripe, non a noi, e Stripe li raccoglie nel suo modulo.
- **Un «consenso privacy»: no.** Serve l'informativa (O8), non una spunta di consenso.
- **L'accettazione dell'abbonamento: no.** I 50 € al mese restano sospesi fino ai primi incassi, e il sito non fa accettare nessun addebito.

### E. Le frasi esatte da dire al fornaio (una visita, circa 20 minuti)

1. **Dati della ditta (O3, O7):** «Per la vostra pagina e per le fatture mi servono i dati della ditta come li avete sullo scontrino: nome della ditta, partita IVA e indirizzo. Mi dà uno scontrino di oggi? E la sede legale è sempre qui in Via Calzolai 25?»
2. **IBAN (O6):** «Ogni lunedì le faccio il bonifico dei contanti incassati nella settimana prima. Su quale conto? Mi serve l'IBAN e il nome a cui è intestato: deve essere il conto della ditta.»
3. **Email (O3):** «A quale email vuole ricevere gli ordini? La legge chiede di mostrarla ai clienti sulla pagina del negozio: va bene questa?»
4. **Etichette (O1, O2):** «Per ognuno dei 5 prodotti faccio una foto da vicino al retro dell'etichetta, dove ci sono ingredienti, allergeni e la tabella. Ci vogliono 5 minuti. Poi le faccio vedere le schede prima di pubblicarle.»
5. **Frigo (C2, C5):** «Quali di questi tiene in frigo? Il pesto anche?»
6. **Biologico (C1):** «Avete un certificato biologico vostro, cioè un ente di controllo che viene in negozio, tipo ICEA, CCPB o Bioagricert? O vendete prodotti già certificati dal produttore?»
7. **Registrazione sanitaria (C4):** «La vostra notifica sanitaria all'AUSL dice già che fate anche consegne a casa? Se non lo sa, lo chieda al suo consulente HACCP: a volte basta una comunicazione di variazione.»
8. **Scontrino (C6):** «Per gli ordini che arrivano da MyCity, chieda al suo commercialista come registrarli: la consegna a casa ha regole diverse dal banco.»
9. **Codice per le fatture (C7):** «Per mandarle la fattura elettronica del 10% mi serve il vostro codice destinatario, 7 caratteri, o la PEC. Se non ce l'ha sotto mano, me lo manda dopo.»
10. **Contratto (O4, O5, O8):** «Questo è l'accordo: 10% su quello che vende tramite MyCity, nessun costo fisso finché non incassa. I contanti dei clienti li ritiro io per conto suo e ogni lunedì le faccio il bonifico. Può uscire quando vuole, con 7 giorni di avviso. Qui c'è anche come trattiamo i suoi dati. Lo legga con calma e, se va bene, lo firmiamo in due copie.»
11. **Carta (O10), quando la accendiamo:** «Dal suo pannello MyCity tocca il pulsante per collegare Stripe. Stripe le chiede un documento e l'IBAN, ci vogliono circa 10 minuti. I soldi delle carte poi glieli manda Stripe, non io.»

### F. Cosa deve cambiare nella bozza di contratto (O4, O5)

La bozza del 1/7 va aggiornata in sei punti prima di farla firmare.
1. Commissione **10%** su tutti gli ordini passati da MyCity, anche i ritiri in negozio e i clienti che il negozio aveva già (registro dei fatti, `pricing.commissione`, 1/11).
2. **Mandato all'incasso**: il Negozio autorizza MyCity a incassare i contanti in suo nome e per suo conto (art. 1188 c.c.).
3. **Bonifico ogni lunedì** per le consegne della settimana prima (`pagamenti.bonifico-contanti-al-negozio`).
4. **Compensazione**: sui ritiri pagati in contanti al banco il 10% si toglie dal bonifico del lunedì; se non basta, va nella fattura del mese (`ritiro.in-negozio`).
5. **Abbonamento 50 € al mese sospeso** fino ai primi incassi portati da MyCity (`pricing.abbonamento`).
6. **Carta via Stripe** solo quando è accesa; resi esclusi sui freschi (`legale.recesso-esclusi`); dati dei clienti come al paragrafo 9 dei Termini (titolare autonomo, solo per evadere l'ordine).

Resta la nota: **bozza, da far validare da un legale abilitato.** Per tua scelta del 1/11 l'avvocato rilegge contratto e contanti dopo il lancio (`rischi.scelti-al-lancio`). Incassare contanti per conto del negozio è un'eccezione al paletto 7 che hai già accettato: il mandato del punto 2 è il minimo che la rende difendibile.

### G. Cosa serve dalla parte di MyCity (non dal negozio)

- **Partita IVA di MyCity**: serve per fatturare il 10% e va mostrata sul sito (D.Lgs. 70/2003 art. 7; DPR 633/1972 art. 35). Oggi il fondo pagina dice solo «Titolare: Nicolae Rotaru» e «Piacenza, IT». Il 5/11 risultava in corso col commercialista: da qui non lo vedo.
- **Migrazioni da applicare** (🔴, Nicola): la 126 (colonne della ditta nel riquadro «Venduto da»), la 180 (spunta «escluso dal reso»), la 195 (niente alimento in vendita senza ingredienti). Il 5/11 il database risultava fermo alla 163.
- **Una pagina «Dati della ditta»** nel profilo del negozio (S). Oggi `/sell` rimanda il negozio approvato a `/seller/profile`, che non ha quei campi. Il modulo dello staff modifica solo nome, telefono, indirizzo e insegna. La colonna però è tra quelle che il titolare può scrivere (migrazione 119).

### H. Da dove ho letto

- **Database** (sola lettura): file dati del 7/11 alle 02:30 nello scratchpad del compito. Campi «presenza»: ragione_sociale, partita_iva, sede_legale, iban, termini_accettati, privacy_accettata, dati_veri_confermati tutti `false`. Poi `stripe_account` `true`, `stripe_dati_inviati` `false`, incassi e bonifici Stripe `false`.
- **Pagine pubbliche** (GET da visitatore, 7/11 alle 02:29 ora di Piacenza): la pagina del negozio e le 5 schede prodotto, tutte con risposta 200. Il riquadro «Venduto da» mostra insegna, via e telefono. Il riquadro allergeni compare solo sui due kefir.
- **Foto delle etichette**: ogni prodotto ha la foto del retro (13 foto da 1200×1600). L'etichetta occupa circa un quinto della larghezza: ingrandita si legge (es. la tabella nutrizionale del kefir), a grandezza normale su un telefono no. Le foto vanno bene come fonte per trascrivere, non come unica informazione al cliente.
- **Codice del sito**:
  - `app/api/seller/apply/route.ts`: il modulo pretende ragione sociale, partita IVA con controllo, sede, codice fiscale e accettazione dei Termini.
  - `lib/admin/regole-approvazione.ts`: approvare senza partita IVA è bloccato dal 1/11, ma un negozio già approvato non viene ricontrollato.
  - `migrations/126` e `migrations/195`: il controllo su allergeni e ingredienti. Un prodotto già in vendita resta in vendita finché non cambia le sue dichiarazioni.
  - `app/api/stripe/connect/onboarding/route.ts`: il collegamento Stripe (documento, IBAN, condizioni Stripe).
  - `app/terms/page.tsx`: Termini 3.0 (bonifico del lunedì, obblighi del venditore, dati dei clienti).
  - `components/products/AllergensAccordion.tsx` e `lib/queries/venduto-da.ts`: cosa mostra la scheda.
- **Norme**, riconfermate il 7/11 con ricerche web, fonti secondarie:
  - DSA, art. 29 che esonera i siti micro e piccoli: [leggeinchiaro.it](https://leggeinchiaro.it/articolo-29-dsa/) e [Unioncamere](https://www.unioncamere.gov.it/sites/default/files/articoli/2023-11/DSA%20II%20parte%2014%20novembre%202023.pdf).
  - Reg. UE 1169/2011: [EUR-Lex](https://eur-lex.europa.eu/legal-content/IT/TXT/?uri=CELEX:32011R1169). Multa per la vendita a distanza: [foodtimes](https://www.foodtimes.eu/it/consumatori-e-salute/sanzioni-reg-ue-11692011-il-d-lgs-2312017/) e [slide CCIAA Cuneo](https://www.cn.camcom.gov.it/sites/default/files/uploads/documents/Promozione/Slide_Lab%20Chimico_Avv.%20Lorenza%20Andreis_webinar%2022.04.2024.pdf).
  - Codice del consumo art. 49-bis: [Brocardi](https://www.brocardi.it/codice-del-consumo/parte-iii/titolo-iii/capo-i/sezione-ii/art49bis.html).
  - Frasi «verdi», D.Lgs. 30/2026: [CMS](https://cms.law/it/ita/publication/recepimento-della-direttiva-empowering-consumers-in-italia-d.lgs.-30-2026-e-novita-su-green-claims-durabilita-dei-prodotti-e-informazioni-preco) e [Il Fatto Alimentare](https://ilfattoalimentare.it/stop-greenwashing-litalia-recepisce-direttiva-ue-2024-825.html).
  - Biologico venduto online: [EuroCommerce](https://www.eurocommerce.eu/app/uploads/2026/03/organic-regulation-eurocommerce.pdf), [FAQ della Commissione](https://www.gfrs.de/fileadmin/files/eu/organic-rules-faqs_en.pdf) e [accordo di ottobre 2026](https://www.lovguiden.dk/en/det-offentlige/raadet-for-den-europaeiske-union/2026-10-20-eu-aftale-om-oekologireglerne-hoejere-graenser-for-smaasaelgere).
  - E-commerce e notifica sanitaria in Emilia-Romagna: [scheda della Regione](https://imprese.regione.emilia-romagna.it/semplificazione-e-sportello-unico/schede-attivita-imprenditoriali/commercio-sede-fissa-e-aree-pubbliche-forme-speciali-di-vendita-quotidiani-e-periodici/e-commerce_vendita_per_corrispondenza_televisione_ed_altri_sistemi_di_comunicazione_scheda_informativa.pdf).
- **Fatti di business** dal registro dei fatti: `pricing.commissione`, `pagamenti.al-lancio`, `pagamenti.bonifico-contanti-al-negozio`, `ritiro.in-negozio`, `pricing.abbonamento`, `rischi.scelti-al-lancio`, `lancio.data`, `legale.recesso-esclusi`.

### I. Scorecard ed effetto atteso

- **Scorecard (1-5 sui 6 assi):** dati reali 5 · chiarezza 4 · conformità 4 · abilitazione 5 · rischio proporzionato 4 · completezza 3. I due più bassi sono **completezza**, perché mancano le risposte del negozio e il database di oggi, e **chiarezza**: il foglio è lungo, ma ha un punto d'ingresso solo, cioè i quattro blocchi in alto.
- **Effetto atteso:** oggi gli obblighi aperti sono 10 su 10 (sezione A). Con la visita di 20 minuti e le due scritture di Nicola, me ne aspetto chiusi 8 prima del 15/11. Restano Stripe, se la carta resta spenta, e la firma, se il fornaio vuole leggere con calma.
- **Non ho scritto** né nella memoria del reparto né nella coda delle azioni: il compito mi permetteva un file solo. L'esito da salvare è nel messaggio di ritorno.
