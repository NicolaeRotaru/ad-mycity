---
data: 2026-11-07 02:58
autore: qa-designer
oggetto: controllo tecnico finale della locandina di Pane Quotidiano, prima di metterla in coda
verdetto: no, non ancora da accodare
---

# Controllo tecnico della locandina di Pane Quotidiano

**In breve:** il file del cartello col QR adesso è corretto. La stampa però aspetta: la pagina online del negozio non ha ancora il pane, e il fornaio non l'ha visto.

Questo documento parla del cartello col codice QR per la vetrina e la cassa di Pane Quotidiano. Serve a dire se si può mettere in coda la stampa. L'idea l'ha già scelta il direttore creativo: io controllo che il foglio sia giusto, onesto e leggibile da un telefono.

## In parole semplici

Il foglio adesso è a posto. Ho controllato colori, caratteri, testi, promesse e codice QR. Tre piccole cose le ho corrette io.

La stampa però non va ancora in coda. Mancano tre cose che non stanno sul foglio: il pane sulla pagina online, il sì del fornaio, una prova con un telefono vero.

Un esempio. Una cliente inquadra il codice davanti al banco del pane. Arriva su una pagina con 5 prodotti: due kefir, un budino, un hummus, un pesto. Nessun pane. Sotto il nome del negozio legge «Prodotti locali», ma uno dei kefir viene dalla Germania. Il cartello dice la verità; la pagina dove porta, per ora, no.

Quindi il verdetto è **no, non ancora**. Il file è pronto da stampare. La stampa si mette in coda quando le tre cose sono fatte.

## Cosa cambia per te

Il file da stampare ha lo stesso nome di prima, con tre correzioni:
- **Il marchio:** MyCity in fondo ora ha lo spessore giusto, lo stesso del sito. Prima era un po' più sottile.
- **Una riga di riserva:** sotto il codice c'è scritto, in piccolo, «Il codice non si apre? Cerca «Pane Quotidiano» su mycity-marketplace.com». Prima il foglio non aveva nessun indirizzo scritto, e chi ha un telefono vecchio restava fuori.
- **Due file per la copisteria:** uno A5 e uno A4, con 3 millimetri di colore in più su ogni lato, che la copisteria taglia via. Senza quel margine, la banda rossa in alto esce con un filo bianco sul bordo.

Altre due cose:
- La versione A4 per la vetrina è già della misura giusta. Non devi più chiedere a nessuno di «ingrandire al 141%».
- Una cosa te la risparmio. Il direttore creativo voleva far guardare al legale la frase «Paghi in contanti alla consegna». Secondo me non serve fermarsi: la frase è vera, e il 1/11 hai già scelto che l'avvocato guardi i contanti dopo il lancio.

## Cosa devi fare

- **Prima della stampa, sistema la pagina del negozio.** Servono almeno il pane o i prodotti veri del banco. E vanno tolti i bollini «Prodotti locali» e «Sostenibile», che non reggono. È già spiegato nei documenti 01 e 02 di questa cartella.
- **Fai vedere il foglio al fornaio.** Il cartello parla con la sua voce («Passiamo noi», «i nostri prodotti») e va nella sua vetrina. Serve il suo sì.
- **Stampane una copia a casa e provala.** Inquadrala con due telefoni di marca diversa, per esempio il tuo e quello del fornaio. Prova da mezzo metro e da un metro, alla luce del negozio. Costa pochi centesimi e dice se il codice regge davvero.
- **Dimmi se l'account Instagram «@mycity.piacenza» esiste già.** Le regole del marchio lo vogliono in fondo a ogni grafica. Non l'ho messo perché da qui Instagram è bloccato e non ho potuto controllare. Un nome sbagliato, una volta stampato, non si corregge più. Se esiste, lo aggiungo in due minuti.

Quando pagina, fornaio e prova col telefono sono a posto, la stampa si può mettere in coda per la tua firma. Sono 2 copie: un A5 per la cassa e un A4 per la vetrina, pochi euro in copisteria.

## Cosa non ho verificato

- Il codice QR l'ho letto con un programma diverso da quello del direttore creativo, in 9 condizioni. Lo legge in 8 su 9; la nona è un caso estremo. Non l'ho provato con un telefono vero né su carta.
- Non ho visto dal vivo la lista dei prodotti sulla pagina. La lista arriva dopo, nel telefono, e io leggo solo la prima parte della pagina. I 5 prodotti senza pane vengono dal database, letto stanotte verso le 02:30.
- La riga «Cerca Pane Quotidiano»: il codice del sito cerca i negozi per nome, quindi dovrebbe trovarlo. Non l'ho provata scrivendo nella barra di ricerca, perché le regole di questo lavoro me lo vietano.
- I colori li ho misurati sul file, non su carta. In stampa possono uscire un po' diversi, soprattutto il rosso della banda.
- Il documento 06 del direttore creativo adesso è vecchio in tre punti: lo spessore del marchio, la riga nuova, i file per la copisteria. Non l'ho cambiato, perché questo lavoro mi lascia scrivere solo questo file.

## Dettagli tecnici

### Verdetto voce per voce

Checklist usate: `CHECKLIST-BRAND.md`, `ONESTA-RULES.md`, voce «Locandina/print» del kit `MyCity-Vault/07-Agenti/kit/qa-designer-KIT.md`.

| Checklist | Voce | Esito | Dove e prova |
|---|---|---|---|
| Brand | Solo colori della palette | passa | Pixel del PNG a 300 dpi: panna `#FBF7F0` 49,0% · terracotta `#C0492C` 27,1% · bianco 12,3% · inchiostro `#2C2A28` 8,1% · senape `#E8A33D` 2,2%. Il resto, sotto lo 0,5%, sono sfumature dei bordi del QR. Nessun colore vietato. |
| Brand | Font Fraunces + Inter | passa dopo correzione | Titoli Fraunces SemiBold, testi Inter Bold e Medium, tutti incorporati nel PDF. **Corretto:** il marchio era in Fraunces 600; il marchio ufficiale è Fraunces 800 con spaziatura −1,5/56 em (`docs/mockup/assets/wordmark-light.svg` e `app/carattere-del-marchio.ts` del sito). Il carattere 800 viene dal file del sito `app/Fraunces-ExtraBold.ttf`. |
| Brand | Una idea, circa 30 parole, gerarchia | passa con nota | Una idea sola. Parole: 42 prima, 52 con la riga di riserva. Il tetto di 30 è scritto per le grafiche social; su un cartello da banco con QR lo accetto. Gerarchia: riga negozio → domanda → titolo → sottotitolo → invito → QR → pagamento → riserva → marchio → motto. |
| Brand | Safe-area / margini | passa | Formato stampa, niente safe-area social. Testo a 9 mm dal bordo alto, circa 7 mm dal basso, almeno 13 mm dai lati: regge sia la stampante di casa (3-5 mm non stampabili) sia il taglio in copisteria. |
| Brand | Footer: marchio + motto + nome Instagram | **parziale** | Marchio e motto sì. Nome Instagram `@mycity.piacenza` assente: non verificabile (il proxy della sessione blocca instagram.com, risposta 403). Decisione in «Cosa devi fare». |
| Brand | Nessun segnaposto rimasto | passa | Nessun `[...]` né `{{...}}`. |
| Brand | Motto identico | passa | «La spesa che tiene viva la città.» = `creativi/brand.mjs`. |
| Onestà | Ogni numero ha una fonte | passa | Unico numero: «25» dell'indirizzo = `store_address` «Via Calzolai, 25» nel database. Nessun prezzo, data o distanza sul foglio. |
| Onestà | Nessuna testimonianza finta | passa | Nessuna citazione. |
| Onestà | Promesse vere | passa con nota | «Paghi in contanti alla consegna»: vero per `pagamenti.al-lancio` del registro, e la pagina del negozio scrive «Pagamento alla consegna» (letta il 2026-11-07 02:51). «Passiamo noi» / «te li portiamo a casa»: vero entro 5 km (`consegna.raggio`). La pagina dice «MyCity gestisce la vetrina, il pagamento e la consegna», e il foglio porta il marchio MyCity. Oltre 5 km la promessa non vale: rischio piccolo, perché il negozio è in centro. Non ho verificato che la cassa del sito blocchi davvero oltre 5 km. |
| Onestà | Claim legali | non blocca | Contanti incassati per conto del negozio: rischio già scelto da Nicola, con l'avvocato dopo il lancio (`rischi.scelti-al-lancio`, 1/11/2026). Se vuoi comunque un parere, va a @legale-privacy. |
| Onestà | Consensi per foto, volti, nomi | passa con condizione | Nessuna foto, nessun volto, nessuna persona. Ci sono nome e voce del negozio: serve il sì del fornaio (vedi «Cosa devi fare»). Nessuna immagine fatta con l'IA. |
| Kit, stampa | Abbondanza per il taglio | **falliva → corretta** | La banda arriva al bordo e il PDF non aveva abbondanza. Il registro dice che il kit si stampa in copisteria (`logistica.consegne-e-kit`). Fatti due PDF con 3 mm per lato e TrimBox impostato. |
| Kit, stampa | QR testato | passa in simulazione | Vedi sotto. Manca il telefono vero (vedi «Cosa devi fare»). |
| Kit, stampa | Contatti / indirizzo scritto | **falliva → corretta** | Nessun indirizzo leggibile sul foglio. Aggiunta la riga di riserva. |

### La pagina dove porta il QR (fuori dal foglio, ma è la promessa del foglio)

- GET pubblico, 2026-11-07 02:51: risposta 200. Titolo «Pane Quotidiano a Piacenza — Acquista online · MyCity Piacenza».
- Bollini visibili sulla pagina: «Consegna rapida», «Prodotti locali», «Biologico», «Sostenibile». «Prodotti locali» e «Sostenibile» non reggono (documento 01, punti P3 e P4).
- La descrizione del negozio, usata anche da Google, dice «tra cui pane, miele biologico». Online però non ci sono né pane né miele (database, 5 prodotti).
- **Blocca la coda:** finché la pagina è così, il cartello manda clienti veri su due promesse non vere.

### Codice QR

- Indirizzo: `https://www.mycity-marketplace.com/store/c0b240c0-2a86-4218-9d0f-5154f08ff929` (77 caratteri). Correzione errori livello Q, versione 7, 45 x 45 moduli, margine bianco di 4 moduli.
- Lato con margine: 7,8 cm su A5, 11,1 cm su A4. Modulo: 1,48 mm su A5, 2,09 mm su A4. Lettura comoda fino a circa 10 volte il lato: circa 80 cm in A5, circa 110 cm in A4.
- Contrasto scuro su bianco 14,3:1.
- Lettore usato: OpenCV 5.0.0, due lettori (`QRCodeDetector` e `QRCodeDetectorAruco`). È diverso da jsQR del direttore creativo: chi ha costruito non collauda.

| Condizione (sul PDF corretto) | Esito |
|---|---|
| A5 a 300, 150, 72 e 40 punti per pollice | letto 4 su 4 |
| Telefono inclinato (prospettiva) | letto |
| Ruotato di 15 gradi | letto |
| Basso contrasto + riflesso da vetro simulato | letto |
| Sfocato + rumore + JPEG qualità 35 | letto da uno dei due lettori |
| Pagina intera ridotta a 175 pixel (circa 2 pixel per modulo) | non letto, caso estremo |
| PDF copisteria A5 e A4 a 150 punti per pollice | letti |
| PNG finale a 300 dpi | letto |

Proposta, non fatta: il QR non ha un'etichetta di provenienza. Quando PostHog si riaccende, le visite dal cartello non si distingueranno dalle altre. Con `?utm_source=cartello` il codice passa dalla versione 7 alla 8 (49 moduli): regge ancora. Va deciso **prima** della stampa, perché un QR stampato non cambia più. La decidono Nicola o il direttore creativo.

### Contrasti dei testi

- Panna su terracotta (titoli) e terracotta su panna (invito): 4,65:1, passa per testo grande e grassetto.
- Inchiostro su panna: 13,4:1.
- «My» senape su panna: 2,0:1. È il marchio ufficiale, e i loghi sono esenti dalla regola del contrasto.
- «City» è `#1C1A18`, l'inchiostro del logo del sito, non il `#2C2A28` di `brand.mjs`. Va bene per il logo. Proposta 🟡, non fatta: aggiungere `inchiostroLogo: "#1C1A18"` ai token, così non sembra un errore la prossima volta.

### File

| File | Cosa è | Stato |
|---|---|---|
| `/home/user/ad-mycity/creativi/pane-quotidiano/locandina-A5.pdf` | da stampare a casa, A5 al 100% | rigenerato (v3) |
| `/home/user/ad-mycity/creativi/pane-quotidiano/locandina-A5.png` | anteprima a 300 dpi, 1749 x 2481 | rigenerato (v3) |
| `/home/user/ad-mycity/creativi/pane-quotidiano/locandina-A5-copisteria-abbondanza-3mm.pdf` | cassa, copisteria; MediaBox 436,5 x 612,3 punti, TrimBox = A5 | nuovo |
| `/home/user/ad-mycity/creativi/pane-quotidiano/locandina-A4-vetrina-copisteria-abbondanza-3mm.pdf` | vetrina, copisteria; MediaBox 612,3 x 858,9 punti, TrimBox = A4 595,3 x 841,9 | nuovo |
| `/home/user/ad-mycity/creativi/pane-quotidiano/locandina-A5-v1-scartata.png` | prima versione, solo confronto | invariato |
| `/tmp/claude-0/-home-user/528441c4-587c-512c-8da8-547598174a58/scratchpad/qa/backup-v2-direttore/` | v2 del direttore creativo, per tornare indietro | copia |
| `/tmp/claude-0/-home-user/528441c4-587c-512c-8da8-547598174a58/scratchpad/pq/mk3.mjs` | programma che genera i tre PDF | nuovo |

Il programma e la copia di riserva stanno nella cartella temporanea della sessione, che si perde quando la sessione finisce. Proposta 🟡: spostare `mk3.mjs` in `creativi/` quando Nicola dice ok. Il generatore del progetto `genera-locandina.mjs` ha ancora il testo da lista d'attesa (lo dice il documento 06).

### Come stamparla (sostituisce la parte del documento 06)

- **A casa:** `locandina-A5.pdf` al 100%, a colori. Il bordino bianco della stampante va bene.
- **In copisteria:** il file A5 per la cassa e il file A4 per la vetrina. Da dire: «abbondanza 3 mm per lato, tagliare al formato finito». Carta opaca da 170 grammi, non lucida: dietro al vetro la carta lucida fa riflessi proprio sul codice.
- In vetrina: lato interno del vetro, col codice all'altezza degli occhi.

### Cosa resta da aggiornare nel documento 06 (non mio)

1. «Il marchio MyCity è ricostruito… con uno spessore di carattere un po' più leggero»: non è più vero, ora è Fraunces 800.
2. «Testo della locandina»: manca la riga «Il codice non si apre? Cerca «Pane Quotidiano» su mycity-marketplace.com».
3. «Come stamparla»: per la copisteria ci sono i due file con abbondanza; la scala 141% non serve più.

### Note fuori dal mio campo

- Nel registro, `pagamenti.al-lancio` e `lancio.data` dicono che al lancio ci sono contanti **e** carta. Il testo di questo compito dice «solo contanti». La frase del foglio è vera in tutti e due i casi; la contraddizione va chiarita da chi tiene il registro.
- Mossa di sistema: il direttore creativo propone lo stesso cartello per ogni bottega. Se diventa un modello, deve nascere con la riga di riserva, il marchio 800 e l'abbondanza, così i tre difetti trovati qui non si ripetono su ogni negozio.

### Voto sui sei assi (il mio lavoro, da 1 a 5)

Altitudine 4 · Verità e dati 4 · Mestiere 4 · Cliente e impatto 3 · Sistema e coerenza 3 · Anima 4. I due più bassi: **cliente e impatto**, perché le scansioni oggi non si possono contare; **sistema e coerenza**, perché il documento 06 resta vecchio e il programma sta in una cartella temporanea.

### Effetto atteso sui numeri

Difetti arrivati alla stampa: 0 su questo pezzo. Ne ho trovati 3: niente abbondanza, nessun indirizzo scritto, marchio col peso sbagliato. Tutti e 3 sono corretti nel file. La riga di riserva recupera una parte di chi non riesce a inquadrare: quanti non lo so stimare, perché non ci sono dati.

### Riga per il quaderno (proposta per `memoria-squadra/qa-designer.md`, non scritta lì: questo compito mi limita a questo file)

`2026-11-07 02:58 · controllo tecnico locandina QR Pane Quotidiano · foglio onesto ma senza indirizzo scritto, senza abbondanza, marchio a peso 600 invece di 800: corretti; coda bloccata per pane assente e bollini non veri sulla pagina di arrivo · 3 difetti corretti, 3 condizioni aperte · su un cartello col QR la promessa vera è la pagina dove porta: si controlla anche quella, non solo il foglio · #locandina #qr #stampa #pane-quotidiano`
