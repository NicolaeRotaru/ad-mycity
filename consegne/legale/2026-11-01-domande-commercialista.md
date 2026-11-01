---
data: 2026-11-01 12:05
tipo: preparazione
fonte: AD digitale, dalla verifica della soglia dei 5.000 euro (3 ricercatori e 2 contestatori)
richiesta: «la sede, partita iva e pec fino ai 5000 di fatturato non ci sono» (Nicola, 1/11)
per: l'incontro col commercialista di lunedì 2/11/2026
---

# Le domande per il commercialista, lunedì 2/11

**In breve:** per la partita IVA la legge non mette una soglia di 5.000 euro. Conta se l'attività è abituale, e MyCity lo è dal primo ordine.
**Per te:** porta le cinque domande qui sotto, in quest'ordine. La prima decide quasi tutto il costo.

## In parole semplici

Il numero 5.000 esiste, ma riguarda un'altra cosa. È la soglia sotto cui chi fa un lavoretto occasionale non paga i contributi INPS. Non dice niente sulla partita IVA, e non vale per un'attività commerciale come MyCity.

MyCity invece è abituale: il sito è sempre aperto, c'è il 10% su ogni ordine, il bonifico al forno parte ogni lunedì e la consegna la fai tu. Per un'attività così la partita IVA serve dal primo ordine. Hai 30 giorni di tempo dal primo ordine per aprirla.

Su due cose avevi ragione:
- **La sede.** Non serve un locale: va bene l'indirizzo di casa tua.
- **La PEC.** Per una persona è facoltativa. Diventa obbligatoria quando ti iscrivi alla Camera di Commercio come ditta, e quell'iscrizione va insieme alla partita IVA.

Un esempio coi numeri. Con la ditta individuale e il regime forfettario al 5%, su 5.000 euro di commissioni in un anno le tasse sono quasi zero. Il costo vero sono i contributi INPS dei commercianti: circa 3.000 euro l'anno con lo sconto del 35%, circa 4.600 senza. Se però hai un altro lavoro che ti prende più tempo di MyCity, quei contributi potrebbero non toccarti.

## Cosa cambia per te

- **Il costo grosso dipende dalla prima domanda,** non dalla partita IVA in sé. L'apertura costa circa 36 euro, la Camera di Commercio circa 53 euro l'anno, la PEC pochi euro.
- **Sul sito servono subito un indirizzo, un telefono e un'email.** Lo chiede il Codice del Consumo a chiunque venda online, anche senza partita IVA. Oggi il sito ha solo il tuo nome e l'email.
- **La frase «10% IVA inclusa» va cambiata.** Col forfettario l'IVA non si applica, quindi si scrive «10%» e basta.

## Cosa devi fare

Fai al commercialista queste cinque domande, in quest'ordine:

- **Prima: Con il lavoro che faccio oggi, devo pagare i contributi INPS dei commercianti?** Sono dovuti solo se MyCity è la mia attività principale. Vale circa 3.000-4.600 euro l'anno.
- **Seconda: Quale codice ATECO usiamo per MyCity?** Da quello dipende il coefficiente del forfettario: 40%, 62% o 67%. E la consegna in bici chiede un secondo codice?
- **Terza: Come scriviamo che incasso i contanti del pane per conto del forno?** Così quei soldi non sembrano miei. Servono un mandato scritto col forno, un conto dedicato o un registro?
- **Quarta: I 3 euro della consegna me li paga il cliente: che documento gli do?** E il pane: chi fa lo scontrino, e quando?
- **Quinta: Serve la SCIA per il commercio elettronico, e a chi?** A me che faccio da intermediario, al forno che vende a distanza, o a nessuno dei due?

## Cosa non ho verificato

- Normattiva, Agenzia delle Entrate e INPS erano bloccati dalla rete di questa sessione. Le norme vengono da guide e giornali che dicono la stessa cosa, non dai testi originali.
- Gli importi sono affidabili al 60-80%. La parola finale è del commercialista.

---

## Dettagli tecnici

### Le altre domande, più tecniche

- Il forfettario al 5% per i primi 5 anni: ne ho i requisiti? Contano le attività degli ultimi 3 anni, e il lavoro dipendente del 2025 sopra i 35.000 euro.
- Partire a novembre conta il 2026 come primo dei cinque anni al 5%: conviene comunque?
- Fattura elettronica mensile a ogni negozio per la commissione: bollo da 2 euro sopra 77,47 euro e la dicitura del comma 67? È ammessa la fattura differita mensile?
- La commissione è soggetta a ritenuta d'acconto da parte del forno? La risposta dipende anche dal regime del forno, che non conosciamo ancora.
- DAC7 (D.Lgs. 32/2023): una ditta individuale è «gestore di piattaforma»? Se sì, la verifica dei dati del forno va fatta entro il 31/12/2026 e l'invio entro il 31/1/2027.
- Stripe fattura dall'Irlanda: da forfettario serve l'iscrizione al VIES e l'integrazione in reverse charge?
- L'abbonamento da 50 euro al mese ai negozi, oggi spento: stesse regole della commissione?
- Il preventivo scritto dello studio per contabilità, fatture, dichiarazione, DAC7 e pratiche INPS.
- Se l'apertura slitta dopo il primo ordine: entro i 30 giorni non c'è sanzione, e da che data partono INPS e imposte?

### Le norme

- La partita IVA dipende dall'abitualità, non dall'importo: artt. 4 e 35 DPR 633/1972, art. 55 TUIR. Sentenza: Cass. sez. V n. 7552/2025 (vendite online seriali: impresa).
- I 5.000 euro: art. 44 c.2 DL 269/2003, solo per i contributi del lavoro autonomo occasionale.
- Il Registro delle imprese entro 30 giorni (art. 2196 c.c.). La PEC della ditta individuale: art. 5 c.2 DL 179/2012, come modificato dal DL 76/2020.
- Cosa deve dire il sito: art. 7 D.Lgs. 70/2003 (nome, indirizzo, contatti, partita IVA se soggetto) e art. 49 D.Lgs. 206/2005 dopo il D.Lgs. 26/2023 (indirizzo e telefono).
- Il forfettario: L. 190/2014, commi 54-89. I contributi dei commercianti: L. 662/1996 art. 1 c.203 (abitualità e prevalenza), circolare INPS 14/2026.
- La SCIA per il commercio elettronico: art. 68 D.Lgs. 59/2010.
- Dal 1/1/2027 entrano il nuovo testo unico IVA e quello delle sanzioni: gli articoli citati cambiano numero.

### Nel sito, da cambiare dopo l'incontro

- `app/seller/earnings/commissione.ts:96`, cioè `IVA_SULLA_COMMISSIONE = 'IVA inclusa'`. La leggono 9 file, fra cui il punto 9 dei Termini.
- `lib/health/titolare-check.ts`: oggi segna «degradato» finché mancano partita IVA e PEC.
- Le variabili su Vercel: `NEXT_PUBLIC_TITOLARE_INDIRIZZO` e `NEXT_PUBLIC_SUPPORT_PHONE` subito; `NEXT_PUBLIC_TITOLARE_PIVA` e `NEXT_PUBLIC_TITOLARE_REA` dopo l'apertura. Hanno il prefisso `NEXT_PUBLIC_`, quindi dopo averle messe va rifatta la costruzione del sito.
- Verifica: run `wf_e1bcefed-284`.
