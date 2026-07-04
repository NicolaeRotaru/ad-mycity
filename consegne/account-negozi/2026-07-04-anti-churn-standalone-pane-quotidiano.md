---
tipo: deliverable-anti-churn
reparto: account-negozi
data: 2026-07-04 08:40
negozio: Pane Quotidiano (bio/dietetica dal 1976, Via Calzolai 25, Piacenza)
livello: 🔴/🟡 (tocca un commerciante reale → si ACCODA; la bozza è 🟢)
azione-collegata: A9 (in AZIONI-PRONTE) — standalone, NON dipende da #16/#21
---

# 💚 Tocco anti-churn STANDALONE — Pane Quotidiano

> Scopo in una riga: **tenere caldo l'unico negozio reale di MyCity mentre chiudiamo la logistica di #16,
> senza fargli pesare l'attesa.** Parte ANCHE SE l'ordine è ancora fermo.

## 1) Analisi coorte (onesta, dati veri baseline REST 3/7 21:21)

- **Coorte = 1 negozio.** Unico seller reale su MyCity: **Pane Quotidiano** (contratto firmato 1/7, commissione 12%). Casa Linda = demo/seed, esclusa.
- **Nessun trend di calo.** Marketplace-wide c'è 1 solo ordine in assoluto (COD €19,05, del 24/6), mai consegnato. Non esiste una coorte con calo −X%: con un negozio solo non c'è un "trend mensile" da misurare.
- **L'asse di churn qui è il TIME-TO-FIRST-VALUE, non il trend.** Pane Quotidiano è LIVE, con catalogo bio caricato, ma a **0 incassi da ~9+ giorni**. Lo stadio è "no value realized" — la causa #1 di churn dei commercianti su un marketplace: il titolare inizia a pensare *"qui non vendo"*.
- **Il rischio operativo NON è del negozio, è nostro.** Il fermo dipende dalla logistica del primo ordine #16 (5+ finestre di consegna saltate), non da un problema di Pane Quotidiano. Questo va detto chiaro al titolare: la colpa dell'attesa è nostra, non sua.

## 2) Perché serve un tocco STANDALONE (e non basta A6)

- **A6** è lo strato-relazione **SULLA** chiamata operativa #21 (il rider che chiude la consegna): +2 min di retention sulla stessa telefonata. Buono — ma **esiste solo se #21 parte**, cioè se #16 viene finalmente consegnato.
- **Problema:** se #16 continua a slittare, #21 non parte, A6 non parte, e il titolare resta a **contatto ZERO** proprio mentre la frustrazione matura. È il momento peggiore per il silenzio.
- **A9 (questo)** è il tocco che parte **PRIMA / A PRESCINDERE**: una telefonata breve di rassicurazione che non aspetta la consegna. Non duplica A6/A7 — li precede e li protegge, tenendo viva la relazione nella finestra di rischio.

## 3) Pre-condizioni

- ✅ Va accodato e firmato da Nicola (🔴/🟡: tocca un commerciante reale).
- ✅ Parte **solo se #16 slitta ancora** (indicativamente: se al mattino del giorno X l'ordine non è consegnato / #21 non è ancora partito). Se #16 si chiude oggi → salta A9, va direttamente A6/A7.
- ✅ ZERO promesse di volume/vendite. Si cita solo il vero: catalogo bio reale, contratto 12%, che siamo in rodaggio.
- ✅ Non richiede link/UTM/asset esterni: è pura relazione, si può fare col solo telefono.

## 4) Canale

- **Primario:** telefono **0523 388601** (negozio, Via Calzolai 25).
- **Backup:** WhatsApp / messaggio in-app se non risponde al telefono (stesso testo, versione scritta sotto).

## 5) SCRIPT TELEFONATA (primario)

> Tono: persona vera, breve, calda. Il titolare deve sentirsi **scelto e seguito**, non sotto pressione.
> Chi chiama: Nicola (o chi cura l'account), NON il rider.

«Buongiorno, sono Nicola di MyCity — quello del vostro negozio online. La chiamo solo per due minuti, niente
di che.

Volevo dirvi di persona una cosa: il primo ordine sta tardando ad arrivare a casa del cliente, e **la colpa
è nostra, non vostra** — stiamo mettendo a punto le consegne in questi primi giorni. Non voglio che pensiate
che il vostro negozio non funzioni: funziona, il catalogo è a posto, il problema è tutto dal lato nostro e
lo stiamo chiudendo.

Vi ho scelti come **primo negozio di Piacenza** per un motivo preciso: il vostro bio, quello vero dal '76,
in consegna a domicilio a Piacenza non lo fa nessun altro. È esattamente quello che voglio far vedere alla
città. Quindi tranquilli: appena chiudiamo questa prima consegna — che è questione di giorni — vi seguo io
personalmente per far partire il flusso.

Volevo solo che lo sapeste da una voce, non da un silenzio. C'è qualcosa che nel frattempo posso sistemare
per voi dal mio lato?»

**[se il titolare è freddo/infastidito]** → «Vi capisco, l'attesa è colpa nostra e me ne prendo la responsabilità.
Vi richiamo io appena il primo ordine è consegnato — non dovete fare nulla, ci penso io.»

**[chiusura]** → «Grazie della pazienza. Siete in buone mani. A prestissimo.»

## 6) TESTO WhatsApp / in-app (backup, se non risponde al telefono)

Buongiorno, sono Nicola di MyCity 👋
Vi scrivo solo per dirvi che il primo ordine sta tardando ad arrivare al cliente: **la colpa è nostra**, stiamo
rodando le consegne in questi primi giorni — il vostro negozio e il catalogo sono a posto.
Vi ho scelti come primo negozio di Piacenza perché il vostro bio dal '76, a domicilio, non lo fa nessun altro qui.
Appena chiudiamo questa prima consegna vi seguo io per far partire il flusso. Non dovete fare nulla, ci penso io.
Volevo che lo sapeste da me, non da un silenzio. A prestissimo 🌾

## 7) Cosa cambia · Se va bene

- **Cosa cambia:** l'unico negozio reale di MyCity riceve un contatto umano di rassicurazione **prima** che l'attesa del primo ordine si trasformi in "qui non vendo, mollo". Il titolare sente che la colpa del ritardo ce la prendiamo noi e che è stato scelto, non parcheggiato. Protegge la relazione nella finestra di rischio (0 incassi da 9+ giorni) senza dipendere dalla logistica.
- **Se va bene:** il negozio resta ingaggiato e paziente fino alla consegna di #16 → poi si aggancia A6 (check-in sulla chiamata #21) e A7 (upsell post-prima-consegna) → si costruisce il flusso settimanale. Retention dell'unico faro reale mantenuta a costo ≈ 0 (una telefonata).

## 8) Effetto atteso sui KPI

- **Retention negozi reali:** mantiene 1/1 (evita che l'unico negozio reale vada a 0).
- **Riattivati:** N/A (non è ancora churned — è prevenzione).
- **Metrica onesta:** non muove GMV oggi; muove la **probabilità di sopravvivenza** del faro fino al primo valore realizzato. È difesa, non espansione — l'espansione è A7, dopo la prima consegna.
