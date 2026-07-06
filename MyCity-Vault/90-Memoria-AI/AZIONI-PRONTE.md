---
tipo: azioni-pronte
fonte: AD digitale
aggiornato: 2026-06-26
nota: "La corsia operativa. Ogni blocco è una mossa pronta a partire. Formato: '## ID · Titolo', poi campi 'chiave: valore', poi 'testo:' e sotto l'anteprima fino al blocco successivo."
---

# ⚡ Azioni pronte

> ⚠️ **CODA CANONICA = [[AZIONI-IN-ATTESA]]** (integrità-memoria): la coda che Nicola firma è **una sola**,
> `AZIONI-IN-ATTESA.md`. Questo file resta come **dettaglio operativo** (testo esteso/anteprima di alcune
> mosse) referenziato da lì, NON una seconda coda parallela. Quando accodi un'azione nuova, mettila in
> `AZIONI-IN-ATTESA.md`; se serve l'anteprima lunga, linkala qui. Non duplicare lo stato di approvazione.

## A1 · 📨 Mail al Comune per il bando "Vita in Centro"
reparto: relazioni-istituzionali
livello: 🟡
canale: Email all'Ufficio Commercio del Comune di Piacenza
perche: Bando aperto: rimborso fino al 50% sui materiali (vetrofanie, volantini, QR). Scade a fine mese — candidarsi ora è un vantaggio quasi gratis.
preparato: ✍️ copywriter + ⚖️ legale
testo:
Oggetto: MyCity — adesione al bando "Vita in Centro"
Spett.le Ufficio Commercio,
siamo MyCity, il marketplace dei negozi di Piacenza. Vorremmo aderire al bando per i
materiali di promozione del commercio di vicinato. In allegato la nostra adesione e i
preventivi. Restiamo a disposizione per ogni informazione.
Cordiali saluti — MyCity

## A2 · 🤝 Proposta di onboarding alla bottega Garetti
reparto: vendite
livello: 🔴
canale: Email / di persona — titolare Garetti
perche: È il negozio "faro" per il primo go-live. Condizioni chiare = parte subito e porta i suoi clienti.
preparato: 🤝 vendite + ⚖️ legale
testo:
Ciao, ti proponiamo l'ingresso su MyCity a condizioni di lancio:
commissione 12%, 0€ costi fissi, payout a consegna confermata, nessun vincolo.
Mettiamo online la tua vetrina in ~20 minuti e il primo sabato la consegna è gratis.
Ti va se passo a sistemare tutto insieme?

## A3 · 🛒 Recupero carrello — samir (unico cliente reale, €10 Pane Quotidiano)
reparto: crm-lifecycle
livello: 🟡 (Touch #1 senza sconto) · 🔴 (Touch #2 col codice)
canale: Email al buyer samir — indirizzo da recuperare da /admin/users (chiave anon non lo legge)
perche: Un solo carrello recuperabile REALE (verificato REST 1/7 12:00, conf. 2/7 10:19, letture live gated 3/7 → nessun numero nuovo). Buyer samir, 3 prodotti bio, €10,00, fermo dal 16/6. Gli altri 3 record `abandoned_carts` = admin/seller-autotest/seed Casa Linda → SKIP (non clienti). Un promemoria caldo può riportarlo a un 2° acquisto invece del silenzio.
preparato: 🔁 crm-lifecycle + ✍️ copywriter — testo pieno + sequenza in `consegne/crm/2026-07-03-recupero-carrelli-pronte.md`
cosa cambia: l'unico cliente reale riceve un promemoria del carrello da €10 (pesto + kefir bio di Pane Quotidiano). Da mandare come ri-aggancio caldo DOPO la prima consegna #16, non come promo fredda.
se va bene: samir torna → primo cliente con 2 ordini, base per riordino/referral; se muto dopo Touch #2, si archivia.
pre-condizioni: parte SOLO dopo #16 consegnato (stesso cliente: prima chiudi il 1° ordine) · ok @legale-privacy sul consenso (`email_marketing=false`, transazionale vs marketing) · email da /admin/users · mani Resend accese (→ builder-automazioni). Finché non attive, resta in coda.
testo (Touch #1 — reminder consenso-safe, senza sconto · 🟡):
Oggetto: Hai lasciato qualcosa da Pane Quotidiano 🛒
Ciao, hai messo nel carrello da Pane Quotidiano tre prodotti bio — pesto e kefir — e poi ti sei distratto.
Capita 😊 Sono ancora lì: 1× Pesto Genovese Bio €5,00 · 1× Kefir di latte di capra bio €2,95 ·
1× Berchtesgadener Land kefir bio 400g €2,05 — totale €10,00 (+ consegna a domicilio, paghi alla consegna se
preferisci). 👉 Completa il tuo ordine. Se qualcosa ti ha bloccato (consegna, pagamento, orari), rispondi a
questa mail: ti aiuto io. A presto, Nicola — MyCity, le botteghe di Piacenza.
Codice: nessuno (reminder transazionale, rischio legale minore con consenso marketing off).
testo (Touch #2 — solo se #1 non converte entro 24h · 🔴):
Oggetto: Ti tengo €1 di sconto sul carrello 🧡
Ciao, il carrello da Pane Quotidiano è ancora qui — pesto e kefir bio, €10,00. Per darti una mano: usa il
codice BENVENUTO10 al checkout (10% sul primo ordine, ~€1 in meno). 👉 Completa l'ordine con BENVENUTO10.
Se hai cambiato idea nessun problema, il carrello si svuota da solo — ma se la spesa la volevi davvero è a un clic.
Nicola — MyCity.
Codice: BENVENUTO10 (tabella `coupons`, `first_order_only=true`, costo max ~€1 — incentivo reale → firma Nicola).
stato: BOZZE PRONTE — NESSUN INVIO. Coda canonica = riga #26 in [[AZIONI-IN-ATTESA]].

## A4 · 💌 Messaggio post-consegna (grazie + recensione)
reparto: customer-success
livello: 🟢
canale: Messaggio in-app / email dopo la consegna
perche: Subito dopo una buona consegna è il momento migliore per chiedere una recensione.
preparato: 🤗 customer-success
testo:
Grazie per aver ordinato su MyCity! Speriamo sia andato tutto bene 💛
Ci lasci una recensione veloce? Aiuta i negozi del quartiere e ci vogliono 20 secondi.

## A5 · ⭐ Risposta a una recensione bassa
reparto: supporto
livello: 🟡
canale: Risposta pubblica alla recensione + contatto privato
perche: Una risposta garbata e una soluzione privata recuperano il cliente e migliorano la reputazione.
preparato: 🎧 supporto + 🛡️ trust-safety
testo:
Ciao, ci dispiace per l'esperienza: non è lo standard che vogliamo. Ti abbiamo scritto
in privato per sistemare subito. Grazie per il feedback, ci aiuta a migliorare.

## A8 · 📣 Post del giorno "Il turno più lungo di Piacenza" (Pane Quotidiano)
reparto: content-social
livello: 🔴 (pubblicazione — la bozza 🟢 è già fatta)
canale: IG feed @mycity.piacenza + storia (9:16) + gruppi FB locali ("Sei di Piacenza se…", "Piacenza Mia")
perche: Storia-bottega sul faro reale (partner firmato 12%). Gancio verificabile "bio dal 1976" = incarnazione letterale della piattaforma "Il Turno". Acquisizione calda a costo ≈0, ripubblicabile dal negozio. Domanda-ghigliottina "poteva farlo Amazon?" → no.
preparato: ✍️ content-social — gate ONESTA-RULES passato (0 numeri finti, 0 testimonianze, "1976" fonte pubblica)
contenuto pronto: consegne/content/2026-07-03-POST-turno-piu-lungo-PQ.md
cosa cambia: esce il primo ritratto pubblico di un negozio reale su MyCity — nome/immagine di Pane Quotidiano associati alla campagna in una città piccola. Con consenso del titolare (versione col nome+foto) oppure in versione neutra tipografica (subito, sola firma).
se va bene: il negozio ripubblica ai suoi clienti → primi iscritti caldi alla lista/store; si aggancia il ritmo settimanale del motore "Volti".
testo:
[HOOK] C'è una saracinesca in centro a Piacenza che si alza ogni mattina dal 1976.
[CORPO] Quasi cinquant'anni fa, qui qualcuno ha deciso una cosa semplice: il cibo buono non deve arrivare
da un magazzino fuori città, ma da una bottega dove entri, chiedi e ti fidi. Da allora quella saracinesca
non ha saltato un turno. Perché una città-centro resta accesa solo se, a turno, qualcuno tiene aperto.
Il bottegaio la mattina. Tu quando fai la spesa. Oggi quel turno puoi farlo anche da casa, in pochi minuti.
[CTA] 👉 Fai il tuo turno → [LINK lista/store · UTM turno_pq]
[FIRMA] La spesa che tiene viva la città. — MyCity Piacenza · @mycity.piacenza · VOLTI, NON ALGORITMI
visual: foto reale insegna/saracinesca Via Calzolai + overlay "DAL 1976 · IL TURNO PIÙ LUNGO DI PIACENZA" · fallback tipografico su palette brand (pubblicabile subito, senza foto).
pre-condizioni: (1) 🔴 versione col NOME+foto = ok del titolare (chiedibile nella chiamata A6/#21) · (2) link reale in bio con UTM turno_pq (@builder-automazioni) · (3) versione neutra = pubblicabile con sola firma Nicola.
stato: IN ATTESA DI FIRMA NICOLA.

## A6 · 💚 Check-in anti-churn — Pane Quotidiano (titolare)
reparto: account-negozi
livello: 🟡
canale: Telefono 0523 388601 — RIDER sulla chiamata operativa #21 (stessa telefonata, +2 min di retention), poi follow-up dopo la consegna
perche: Unico negozio REALE su MyCity. Il suo primo ordine (COD €19,05) è fermo da ~243h (~10 giorni): stadio "no value realized", causa #1 di churn commercianti. Se il titolare pensa "qui non vendo" e molla, i negozi reali di MyCity vanno a 0. Playbook anti-churn 4/7 (0 negozi con trend −40%: il churn qui si misura sul time-to-first-value, non sul trend). Registro: consegne/account-negozi/2026-07-04-playbook-anti-churn.md.
preparato: 💚 account-negozi (lente retention) — NON duplica #16/#21: è lo strato relazione sulla stessa chiamata
testo (rider sulla chiamata #21, dopo aver fatto accettare l'ordine):
«Ciao, sono di MyCity. Oggi chiudiamo il vostro primo ordine e vi porto il cliente a domicilio — scusate l'attesa di questi giorni, era un rodaggio nostro, non un problema del vostro negozio. Da adesso gli ordini che arrivano ve li giro subito. Volevo dirvi che il vostro catalogo bio è esattamente quello che a Piacenza non trova nessun altro in consegna: è la ragione per cui vi ho scelti come primo negozio. Appena chiudiamo questo, vi propongo 2-3 prodotti-civetta per far ripartire il flusso. Va bene?»
follow-up (messaggio, DOPO la consegna COD chiusa — vedi A7):
«Fatto! Primo ordine consegnato e incassato ✅. Il sistema funziona. Vi mando la proposta prodotti per la prossima settimana.»

## A7 · 📈 Upsell/riattivazione post-prima-consegna — Pane Quotidiano
reparto: account-negozi
livello: 🟢 (bozza pronta — parte SOLO dopo la prima consegna chiusa)
canale: Telefono/WhatsApp al titolare, entro 48h dalla prima consegna
perche: Subito dopo il primo valore realizzato è la finestra migliore per fissare l'abitudine e alzare il GMV: si trasforma un ordine singolo in flusso. Riduce il rischio churn agganciando il negozio a un ritmo settimanale.
preparato: 💚 account-negozi — dipende da A6 + #16 (prima consegna)
testo:
«Ora che il primo ordine è andato, mettiamo a scaffale su MyCity 2-3 vostri prodotti-civetta bio (quelli che vendete di più) con una piccola spinta social del quartiere. Obiettivo: un paio di ordini a settimana costanti. Vi va se preparo io la vetrina e ne parliamo 5 minuti?»
nota: 🟢 = creare la bozza è libero; la telefonata reale al titolare resta subordinata alla prima consegna (non anticipare).

## A13 · 💬 Touch 1 post-consegna — feedback (ordine #16 Pane Quotidiano)
reparto: customer-success
livello: 🔴 (messaggio a cliente reale — coperto da coda #3 già firmata 30/6; 🟢 la bozza)
canale: WhatsApp 348 642 1766 (già usato per #16) · backup email/in-app
perche: +3h dalla consegna è la finestra per intercettare un problema PRIMA che diventi reclamo, e per filtrare il ramo 👎 (non chiedere recensione a chi è insoddisfatto). Regola d'oro FLUSSI §3: recensione solo se feedback ≠ negativo.
preparato: 🤗 customer-success — testo completo in `consegne/customer-success/2026-07-01-playbook-recensioni.md` § Touch 1
pre-condizione: ordine `58094956…` segnato **Consegnato** in dashboard (dipende da #16/#22)
cosa cambia: il primo cliente reale MyCity riceve un check post-consegna; se qualcosa non va lo sistemiamo in giornata invece di perderlo.
se va bene: feedback 👍 → parte A14 (richiesta recensione); feedback 👎 → handoff @supporto, A14 sospesa.
testo:
Ciao! Sono Nicola di MyCity 👋 Ti è arrivata la spesa da Pane Quotidiano? Spero pesto e kefir
siano come al banco. Siamo appena nati e ogni tua parola conta: com'è andata?
👍 Tutto bene · 😐 Così così · 👎 C'è stato un problema. Se qualcosa non va, rispondi qui: lo sistemo oggi stesso.

## A14 · ⭐ Touch 2 post-consegna — richiesta recensione (ordine #16 Pane Quotidiano)
reparto: customer-success
livello: 🔴 (messaggio a cliente reale — coperto da coda #3 già firmata 30/6; 🟢 la bozza)
canale: WhatsApp 348 642 1766 + email/in-app
perche: subito dopo una buona consegna è il momento migliore per chiedere la recensione. Sarebbe la **prima recensione verificata di MyCity a Piacenza**: social proof che aiuta l'acquisizione dei prossimi clienti e la fiducia nel faro reale.
preparato: 🤗 customer-success — testo completo in `consegne/customer-success/2026-07-01-playbook-recensioni.md` § Touch 2
pre-condizione: (1) A13 con feedback 👍 · (2) +1 giorno dalla consegna · (3) link recensione reale attivo (verificare l'URL ordine sul dominio LIVE prima dell'invio)
cosa cambia: il cliente lascia stelline + una frase vera su Pane Quotidiano → prima recensione pubblica reale sul marketplace.
se va bene: social proof sulla scheda del negozio faro; base per referral/riordino (aggancio a #26 carrello samir).
testo:
Buongiorno! Come promesso, ecco il link per lasciare due righe su Pane Quotidiano 🌟
👉 [link recensione ordine — verificare URL LIVE]
Bastano 30 secondi: stelline + una frase vera (spunto: "Prodotti bio freschi, consegna puntuale a mano, gentilissimi").
Sarebbe la prima recensione verificata di MyCity a Piacenza — grazie di cuore!
promemoria: una sola ripetizione gentile +2 giorni se silenzio, poi stop.

## A9 · 💚 Rassicurazione standalone al titolare — Pane Quotidiano (parte anche se l'ordine è ancora fermo)
reparto: account-negozi
livello: 🔴/🟡 (tocca un commerciante reale → si accoda; la bozza è 🟢)
canale: Telefono 0523 388601 (Via Calzolai 25) · backup WhatsApp/in-app — chiama NICOLA/account, non il rider
perche: Unico negozio REALE su MyCity, LIVE con catalogo ma a 0 incassi da ~9+ giorni (stadio "no value realized", causa #1 di churn commercianti). A6 è agganciata alla chiamata di consegna #21: se #16 continua a slittare (5+ finestre saltate), #21 non parte, A6 non parte, e il titolare resta a contatto ZERO mentre matura la frustrazione. A9 è il tocco che parte PRIMA/INDIPENDENTE per tenere caldo il faro senza scaricargli addosso l'attesa. NON duplica A6 (strato-relazione SULLA chiamata #21) né A7 (upsell post-prima-consegna): li precede e li protegge.
preparato: 💚 account-negozi — deliverable completo in consegne/account-negozi/2026-07-04-anti-churn-standalone-pane-quotidiano.md · gate onestà passato (0 numeri finti, 0 promesse di volume; si cita solo il vero: bio dal '76, contratto 12%, rodaggio)
pre-condizioni: parte SOLO se #16 slitta ancora (ordine non consegnato / #21 non ancora partita al mattino). Se #16 si chiude → salta A9, vai a A6/A7. Non serve link/UTM/asset: è pura relazione telefonica.
cosa cambia: l'unico negozio reale riceve un contatto umano di rassicurazione PRIMA che l'attesa diventi "qui non vendo, mollo". Ci prendiamo noi la colpa del ritardo (logistica nostra, non problema del negozio) e gli diciamo che è stato scelto. Protegge la relazione nella finestra di rischio a costo ≈ 0 (una telefonata).
se va bene: negozio ingaggiato e paziente fino alla consegna di #16 → poi si aggancia A6 (check-in su #21) e A7 (upsell) → flusso settimanale. Retention del faro reale mantenuta 1/1.
testo (script telefonata):
«Buongiorno, sono Nicola di MyCity — quello del vostro negozio online. La chiamo solo per due minuti. Volevo dirvi di persona che il primo ordine sta tardando ad arrivare a casa del cliente, e la colpa è nostra, non vostra: stiamo mettendo a punto le consegne in questi primi giorni. Il vostro negozio funziona, il catalogo è a posto, il problema è tutto dal lato nostro e lo stiamo chiudendo. Vi ho scelti come primo negozio di Piacenza per un motivo preciso: il vostro bio, quello vero dal '76, in consegna a domicilio a Piacenza non lo fa nessun altro. Appena chiudiamo questa prima consegna — questione di giorni — vi seguo io personalmente per far partire il flusso. Volevo che lo sapeste da una voce, non da un silenzio. C'è qualcosa che nel frattempo posso sistemare per voi dal mio lato?»
[se freddo/infastidito] «Vi capisco, l'attesa è colpa nostra e me ne prendo la responsabilità. Vi richiamo io appena il primo ordine è consegnato — non dovete fare nulla, ci penso io.»
[chiusura] «Grazie della pazienza. Siete in buone mani. A prestissimo.»
testo (backup WhatsApp/in-app, se non risponde):
Buongiorno, sono Nicola di MyCity 👋 Vi scrivo solo per dirvi che il primo ordine sta tardando ad arrivare al cliente: la colpa è nostra, stiamo rodando le consegne in questi primi giorni — il vostro negozio e il catalogo sono a posto. Vi ho scelti come primo negozio di Piacenza perché il vostro bio dal '76, a domicilio, non lo fa nessun altro qui. Appena chiudiamo questa prima consegna vi seguo io per far partire il flusso. Non dovete fare nulla, ci penso io. Volevo che lo sapeste da me, non da un silenzio. A prestissimo 🌾
stato: IN ATTESA DI FIRMA NICOLA.

## A15 · 📣 Post del giorno "Il turno del sabato" (Pane Quotidiano)
reparto: content-social
livello: 🔴 (pubblicazione — la bozza 🟢 è già fatta)
canale: IG feed @mycity.piacenza + storia 9:16 + gruppi FB locali ("Sei di Piacenza se…", "Piacenza Mia")
perche: Post del giorno (sabato 4/7) sul faro reale. Angolo utilità/weekend agganciato a "Il Turno", **complementare** ad A8 (storia-bottega): quella racconta il *chi/perché*, questo spinge l'*azione del sabato* + iscrizione lista. Nemico chiaro "magazzino fuori città" (swipe #1). Domanda-ghigliottina "poteva farlo Amazon?" → no.
preparato: ✍️ content-social (sintesi AD) — gate ONESTA-RULES passato (solo "bio dal 1976" fonte pubblica, 0 numeri finti, 0 testimonianze)
contenuto pronto: consegne/content/2026-07-04-POST-turno-del-sabato-PQ.md
cosa cambia: esce il post del sabato del negozio reale su MyCity → spinta iscrizioni nel weekend a costo ≈0, ripubblicabile dal negozio; complementa il ritratto di ieri senza duplicarlo.
se va bene: il negozio ripubblica ai suoi clienti → primi iscritti caldi alla lista; si consolida il ritmo settimanale del motore "Volti/Il Turno".
testo:
[HOOK] È sabato. A Piacenza qualcuno ha già alzato la saracinesca per te.
[CORPO] Il sabato è il giorno della spesa. Puoi farla come tutti — in auto, fuori porta, davanti a uno scaffale
che non ti conosce. Oppure puoi farla dalle botteghe del centro, quelle vere: da Pane Quotidiano, che il cibo buono
lo mette a Piacenza dal 1976, non lo fa arrivare da un magazzino a chilometri da qui. Una città-centro resta accesa
solo se, a turno, qualcuno tiene aperto. Il bottegaio lo fa dalla mattina. Tu il tuo turno lo fai facendo la spesa
dalle sue mani — oggi anche da casa, senza ZTL, senza giri: te la portiamo noi.
[CTA] 👉 Fai il tuo turno del sabato → [LINK lista d'attesa · UTM turno_sabato] — i primi 50 iscritti hanno la prima consegna gratis.
[FIRMA] La spesa che tiene viva la città. — MyCity Piacenza · @mycity.piacenza · VOLTI, NON ALGORITMI
visual: versione neutra TIPOGRAFICA su palette brand ("È SABATO. FAI IL TUO TURNO." + "dal 1976 · da casa, senza ZTL") = pubblicabile subito senza foto; versione col NOME+foto insegna Via Calzolai = solo con ok titolare. Zero giallo-Glovo/arancio-Amazon.
pre-condizioni: (1) versione neutra = pubblicabile con sola firma Nicola · (2) versione col nome+foto = ok titolare (chiedibile in A6/#21) · (3) link reale lista in bio con UTM turno_sabato (@builder-automazioni). Coda canonica = riga #30 in [[AZIONI-IN-ATTESA]].
stato: IN ATTESA DI FIRMA NICOLA.

## A16 · 📣 Post del giorno "Oggi la città festeggia sé stessa" (Sant'Antonino × Pane Quotidiano)
reparto: content-social
livello: 🔴 (pubblicazione — la bozza 🟢 è già fatta)
canale: IG feed @mycity.piacenza + storia (9:16) + gruppi FB locali ("Sei di Piacenza se…", "Piacenza Mia")
perche: Contenuto del giorno che cavalca il momento unico di OGGI — Sant'Antonino, patrono di Piacenza (fiera ~250 bancarelle, centro pieno, snapshot reale [[STATO]] 4/7). Principio swipe #2 "cavalcare il momento": incopiabile da Amazon (è la festa DI Piacenza), agganciato a "Il Turno", sul faro reale Pane Quotidiano. NON duplica A8 (storia-bottega) né A15 (utilità sabato): angolo nuovo e a scadenza di giornata. Domanda-ghigliottina "poteva farlo Amazon?" → no.
preparato: ✍️ content-social (sintesi AD) — gate ONESTA-RULES passato (Sant'Antonino patrono il 4/7 e "bio dal 1976" = fatti pubblici, 0 numeri finti, 0 testimonianze, festa citata con rispetto)
contenuto pronto: consegne/content/2026-07-04-POST-santantonino-PQ.md
cosa cambia: MyCity si fa vedere nel giorno di massima attenzione locale, associando il negozio reale (Pane Quotidiano) alla festa della città — costo ≈0, ripubblicabile dal negozio.
se va bene: reach nel picco di oggi + primi iscritti caldi alla lista; si consolida il ritmo del motore "Volti/Il Turno".
testo:
[HOOK] Oggi Piacenza festeggia sé stessa. E una città si tiene viva in un modo solo: qualcuno tiene aperto.
[CORPO] È Sant'Antonino, il nostro patrono. Il centro è pieno, la fiera anche. Ma la città non vive un giorno
solo: vive ogni mattina, quando una saracinesca si alza. Pane Quotidiano lo fa a Piacenza dal 1976 — il cibo
buono qui non arriva da un magazzino a chilometri, arriva da una bottega dove entri, chiedi e ti fidi. Una
città-centro resta accesa solo se, a turno, qualcuno alza la saracinesca. Il bottegaio la mattina. Tu quando fai
la spesa. Oggi che festeggiamo Piacenza, il modo più vero per festeggiarla è tenerla viva: fai la tua spesa dalle
sue botteghe — anche da casa, te la portiamo noi.
[CTA] 👉 Fai il tuo turno → [LINK lista d'attesa · UTM turno_santantonino]
[FIRMA] La spesa che tiene viva la città. — MyCity Piacenza · @mycity.piacenza · VOLTI, NON ALGORITMI
visual: versione neutra TIPOGRAFICA su palette brand ("OGGI PIACENZA FESTEGGIA SÉ STESSA" + "si tiene viva ogni mattina · dal 1976 · fai il tuo turno", nessun simbolo religioso) = pubblicabile subito senza foto; versione col NOME+foto insegna Via Calzolai = solo con ok titolare. Zero giallo-Glovo/arancio-Amazon.
pre-condizioni: (1) versione neutra = pubblicabile con sola firma Nicola · (2) versione col nome+foto = ok titolare (chiedibile in A6/#21) · (3) link reale lista in bio con UTM turno_santantonino (@builder-automazioni). ⏰ **A scadenza di giornata: vale solo oggi 4/7** — se non firmato entro sera, decade. Coda canonica = riga #36 in [[AZIONI-IN-ATTESA]].
stato: IN ATTESA DI FIRMA NICOLA.

## A17 · 🧡 Accendi il "porta un amico" (5€ a te, 5€ al tuo amico) e manda il primo invito
reparto: crm-lifecycle
livello: 🔴 (incentivo in denaro/credito reale)
canale: Email/WhatsApp all'invitante (Resend, oggi spento) + pagina Invita amici già live nel sito
perche: Il loop give-get è GIÀ costruito nel codice (referrals mig.015, premio €5 su consegna mig.089, welcome €5 mig.029, no self-referral mig.092, pagina /profile/referral). Serve solo firma sull'incentivo + le mani email. Costo reale incrementale ≈ €5 per cliente nuovo che riceve davvero un ordine — più economico e più caldo di un click pagato.
preparato: 🔁 crm-lifecycle + 🛡️ trust-safety (anti-frode) — playbook completo + messaggi in consegne/crm/2026-07-06-playbook-referral.md
cosa cambia: si accende il programma referral e parte il primo invito al primo cliente reale (samir, dopo che riceve #16): 5€ a lui se un amico ordina e riceve, 5€ all'amico di benvenuto. Anti-frode già in codice (premio solo su ordine consegnato, no auto-invito).
se va bene: primo cliente porta un vicino → crescita organica a CAC ≈€5, il canale meno costoso che abbiamo; base per il volano "un cliente ne porta un altro".
pre-condizioni: parte SOLO quando (1) #16 è "Consegnato" (serve ≥1 cliente con un ordine ricevuto) · (2) il cliente è confermato contento (A13 👍) · (3) mani Resend accese (@builder-automazioni) · (4) faro = Pane Quotidiano (i testi parlano di PQ, non Garetti/Casa Linda). Finché non veri, resta in coda.
testo (invito a chi invita · 🔴):
Oggetto: Porta un vicino da Pane Quotidiano — 5€ a te, 5€ a lui 🧡
Ciao [Nome], ti è arrivato il pane e i prodotti di Pane Quotidiano? Fai una cosa bella: dillo a un vicino.
Quando una persona che inviti fa il suo primo ordine e lo riceve, 5€ vanno a lui e 5€ vanno a te, accreditati
in automatico. Ecco il tuo link personale da girare su WhatsApp o di persona: 👉 [LINK-INVITO ?ref=TUO-CODICE].
Ogni vicino che ordina è una bottega del centro che incassa. Non è solo uno sconto: è Piacenza che si tiene su
a vicenda. 🧡 Grazie, Nicola — MyCity.
testo (messaggio che riceve l'invitato · si applica il welcome €5 automatico):
Oggetto: [Nome] ti regala 5€ sulla spesa delle botteghe di Piacenza 🧡
Ciao, [Nome] ti ha invitato su MyCity — e con il suo invito hai 5€ sul tuo primo ordine. MyCity ti riporta a
casa le vere botteghe del centro: si parte da Pane Quotidiano, pane fresco e prodotti bio, ordinati dal telefono
e portati a mano. Paghi anche alla consegna. 👉 [Usa i tuoi 5€ — iscriviti e ordina]. Le botteghe del centro
stanno sparendo. Con un ordine, le tieni aperte. Benvenuto tra i vicini, Nicola — MyCity.
anti-frode (già in codice): premio solo su ordine CONSEGNATO (mig.089, no crea-annulla) · no self-referral CHECK+RLS (mig.092) · un premio per invitato (UNIQUE) · welcome solo ≥€10 (mig.029). Da aggiungere a volume (🟡 branch): tetto 5 invitati/7g, flag stesso indirizzo/telefono, soglia minima sul premio invitante, clawback su rimborso.
stato: BOZZE PRONTE — NESSUN INVIO. Coda canonica = riga #37 in [[AZIONI-IN-ATTESA]].

## A18 · 🛡️ Bollino «Negozio Verificato MyCity» — lo standard di fiducia della città
reparto: trust-safety (owner) · legale-privacy (claim) · content-social (bozze)
livello: 🟢 (definire lo standard — fatto) · 🔴 (assegnarlo/mostrarlo a video e annunciarlo — firma Nicola)
canale: vetrina negozio sul sito (bollino) + annuncio IG @mycity.piacenza/gruppi FB + messaggio al titolare
perche: La fiducia è il fossato di MyCity contro Glovo (che consegna da supermercati anonimi). Un bollino con 5 criteri verificabili — identità reale, negozio attivo, pagamenti sicuri, consegna provata, regole rispettate — dice al cliente «di questo negozio ti puoi fidare, ci mettiamo la faccia noi». Diventa lo standard d'ingresso per l'ondata di negozi dopo il 9/7.
preparato: 🛡️ trust-safety + ⚖️ legale-privacy + ✍️ content-social — standard completo + criteri + eligibilità + bozze in `consegne/trust-safety/2026-07-06-badge-negozio-verificato.md`
idoneità reale (2026-07-06): **0 negozi Verificati oggi, 1 candidato** = Pane Quotidiano (unico negozio reale). PQ ha 3/5 pilastri (identità ✅, catalogo ✅, contratto ✅); mancano **payout attivo** (Stripe OFF) e **≥1 consegna** (#16 in consegna). Casa Linda = demo (esclusa), Garetti = prospect non nel DB (non idoneo). PQ diventa il **1° Negozio Verificato di Piacenza** nell'istante in cui #16 è consegnato + payout acceso — combacia con la North Star di oggi.
cosa cambia: nasce lo standard di fiducia cittadino; il primo negozio reale che consegna si guadagna il bollino a video → i clienti hanno un segnale di garanzia visibile. Nessun negozio dichiarato "verificato" senza averlo meritato.
se va bene: il badge diventa il rito di qualità dell'onboarding post-9/7 (entri → payout+catalogo → 1ª consegna → bollino); l'annuncio pubblico crea il posizionamento «la spesa di cui ti fidi» incopiabile da Amazon/Glovo.
pre-condizioni: (1) 🔴 annuncio pubblico parte SOLO con ≥1 negozio davvero verificato (oggi: dopo #16 consegnato + payout PQ ON) — annunciare "lo standard" con 0 verificati sfonda il gate ONESTÀ · (2) 🔴 mostrare il bollino su PQ = ok Nicola + validazione claim @legale-privacy · (3) 🟡 corsia tecnica: flag `verified` sul profilo (backend-dev) + bollino a video (frontend-dev/CONFIG), in branch, da collegare al via.
testo (annuncio pubblico · 🔴 · bozza neutra):
[HOOK] A Piacenza è nato un bollino che prima non c'era: Negozio Verificato.
[CORPO] Comprare online da una bottega è bello solo se ti puoi fidare. Cinque regole chiare: negozio reale, pagamento sicuro, consegna provata, regole rispettate. Chi le rispetta tutte prende il bollino 🛡️. Chi lo tradisce lo perde. Non è un adesivo che regaliamo: è una garanzia che ci mettiamo noi.
[CTA] 👉 Cerca il bollino 🛡️ quando fai la spesa su MyCity.
[FIRMA] La spesa che tiene viva la città. — MyCity Piacenza · VOLTI, NON ALGORITMI
stato: STANDARD DEFINITO (🟢) — assegnazione + annuncio IN ATTESA DI FIRMA NICOLA. Coda canonica = riga #38 in [[AZIONI-IN-ATTESA]].
