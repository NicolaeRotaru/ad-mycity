---
data: 2026-11-01 15:20
sessione: S3 · legale, catalogo da file e home
pr: https://github.com/NicolaeRotaru/mycity/pull/276
---

# Sessione 3: le due ondate sono fatte

## In parole semplici
Ho fatto tutte e due le ondate di riparazioni del sito, la 5 e la 6. Erano 15 difetti seri più il titolo della home, aggiunto dalla sesta sessione. Il codice ne ripara 14. Uno è fermo per una tua scelta. Su alcune di queste riparazioni l'effetto vero arriva solo quando metti tu dati, chiavi o firme: lo dico punto per punto qui sotto.

**Ondata 5**
- **Chi c'è dietro il sito.** Le pagine dei Termini, del recesso e dei Contatti nominano la persona che risponde, Nicolae Rotaru, non più solo il marchio MyCity.
- **Alimenti caricati da file.** Un alimento senza allergeni o ingredienti non va in vendita. La migrazione nuova 195 lo blocca anche nel database, e copre anche l'alimento esaurito che tornava in vendita da solo quando arrivava lo stock.
- **Lotto dalle foto.** Una lista ingredienti lunga non fa più cadere tutte le bozze insieme.
- **Riquadro «Venduto da».** Quando non trova i dati del negozio, lo scrive nei registri.

**Ondata 6**
- **File di Excel in italiano.** Il caricamento da file legge anche i file col punto e virgola, il formato che Excel usa in Italia. Il file non porta foto: i prodotti caricati nascono bozza, e vanno in vendita quando il negozio aggiunge la foto dalla scheda.
- **Categorie della home.** Home, piè di pagina e mappa per Google mostrano solo le categorie che hanno prodotti. Le foto d'archivio prese da Pexels sono sparite: al loro posto c'è il colore della categoria.
- **Scaricare i propri dati e cancellarsi.** Quando il servizio non è configurato, il sito risponde con un messaggio chiaro e indica la strada giusta, invece di un errore.
- **Esito delle segnalazioni.** Il sito sa mandare l'esito di una segnalazione a chi l'ha fatta e al negozio.
- **Titolo della home.** Se il testo salvato promette «30-60 minuti» o «abbigliamento», il sito non lo pubblica e usa un testo prudente.

## Cosa cambia per te
Il sito smette di promettere cose che non ci sono: categorie vuote, consegna in 30-60 minuti, abbigliamento. Dice chi risponde. E un negozio non può mettere in vendita per sbaglio un alimento senza le dichiarazioni obbligatorie.

## Cosa devi fare
1. **Dare i dati veri del titolare.** Servono indirizzo, telefono e, quando ci saranno, partita IVA e PEC, da mettere come variabili su Vercel. Non li ho inventati.
2. **Firmare la 126 e la 195 in produzione.** Prima conviene contare gli alimenti già in vendita senza ingredienti: la query è in cima alla 195.
3. **Configurare la chiave di servizio e una casella privacy vera.** Senza, «scarica i miei dati» e «cancella account» dicono la strada giusta ma non la percorrono. La stessa chiave sblocca anche i contatti e le segnalazioni.
4. **Decidere sulla regola vecchia dei prodotti.** Oggi un negozio può modificare i propri prodotti direttamente dal browser, senza lasciare traccia. Chiuderla adesso romperebbe il salvataggio della scheda prodotto e il bottone Nascondi. La mia raccomandazione: prima si spostano quei due sul server, poi si chiude.
5. **Approvare una frase nuova dell'informativa privacy.** La frase è «ti rispondiamo entro un mese». È l'obbligo del regolamento europeo, ma va mantenuto davvero.
6. **Salvare dal pannello il sottotitolo nuovo della home.** Il testo proposto è già in LAVORO-APERTO.

## Cosa non ho verificato
- Le pagine non le ho aperte in un browser: le ho provate solo coi test automatici.
- La 195 l'ho provata su un database locale, mai su quello vero.
- **L'esito delle segnalazioni non parte ancora davvero.** La pagina dell'amministratore deve chiamare il pezzo nuovo dopo aver salvato la decisione, e quella pagina appartiene a un'altra sessione.
- **Le categorie vuote si vedono ancora un attimo.** Nella pagina mandata dal server compaiono per un istante, prima che il browser le tolga. Il filtro completo chiede un file di un'altra sessione.
- Ho registrato la copertura della radiografia solo qui e non nel registro, perché il registro sta nella memoria e questa sessione non doveva scriverla.

---
**Dettagli tecnici**
- **Ondata 5**, run `wf_318dd77b-a26`, 10 agenti. Ho corretto io due pacchetti saltati per il tetto di 12 agenti:
  - trigger `zz_prodotti_alimentari_dichiarazioni` nella 195;
  - tolto il tetto di 8000 caratteri dallo schema del lotto.
- **Ondata 6**, run `wf_5d46d4bc-ce3`, 11 agenti, nessuna migrazione. Il pacchetto del caricamento da file era «non regge» solo per la prova dell'ondata 5, che voleva i prodotti in vendita senza foto. L'ho allineata alla regola nuova.
- **Prove:**
  - `npm run verify` finale: verde, 7172 prove, commit `13c62bc`.
  - SQL locale dell'ondata 5: `apply`, `run`, database pieno, mancanti ×2, tutti verdi.
- **Eccezioni alla regola «solo aggiunte» in tests/:**
  - `tests/sql/rls/12-…`: 2 righe, approvate dalla sesta sessione.
  - la prova del caricamento da file nata nell'ondata 5, scritta da questa stessa sessione.
- **Fuori territorio:**
  - `app/admin/segnalazioni/page.tsx`: chiamare PATCH `/api/segnalazioni`.
  - `lib/queries/precarico.ts`: precaricare le categorie piene.
  - `app/page.tsx`: la variante dell'eroe e la descrizione per Google promettono categorie vuote.
- **Gettoni del motore:**
  - ondata 5: 606.914 senza cache, 11,05 milioni con le letture dalla cache;
  - ondata 6: 723.699 senza cache, 13,39 milioni con le letture dalla cache.
- Nati, vecchi visti e scelte sono nel `.json` accanto.
