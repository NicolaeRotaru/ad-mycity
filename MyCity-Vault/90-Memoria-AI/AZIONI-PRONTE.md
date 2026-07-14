---
tipo: azioni-pronte
fonte: AD digitale
aggiornato: 2026-07-14 02:42
nota: "La corsia operativa. Ogni blocco è una mossa pronta a partire. Formato: '## ID · Titolo', poi campi 'chiave: valore', poi 'testo:' e sotto l'anteprima fino al blocco successivo."
---

# ⚡ Azioni pronte

> ⚠️ **CODA CANONICA = [[AZIONI-IN-ATTESA]]** (integrità-memoria): la coda che Nicola firma è **una sola**,
> `AZIONI-IN-ATTESA.md`. Questo file resta come **dettaglio operativo** (testo esteso/anteprima di alcune
> mosse) referenziato da lì, NON una seconda coda parallela. Quando accodi un'azione nuova, mettila in
> `AZIONI-IN-ATTESA.md`; se serve l'anteprima lunga, linkala qui. Non duplicare lo stato di approvazione.

## A4 · 🛡️ Playbook anti-churn 6 botteghe priorità (post 13/7)
reparto: account-negozi
livello: 🟡 (ogni check-in reale va avviato da Nicola)
canale: WhatsApp/telefono diretto → poi AD prepara i testi
perche: 6 nuove botteghe food onboardate il 13/7 — nessun ciclo di cura garantisce che non si perdano in silenzio
preparato: account-negozi · playbook completo in `consegne/account-negozi/2026-07-11-playbook-antichurn-6-botteghe.md`
coda: [[AZIONI-IN-ATTESA]] #antichurn-13lug

### Testi T+3 (da inviare ≈ mer 16/7, WhatsApp) — pronti, da personalizzare col nome raccolto il 13/7

**Tigellabella** (già su Deliveroo — aggancio commissioni):
> "Ciao [nome]! Sono Nicola di MyCity. Come sta andando con la piattaforma? Ci sono ordini arrivati o preferite che vi aiuto a ottimizzare il profilo per partire forte questo weekend?"

**La Forchetta** (sito perso → aggancio vetrina digitale):
> "Ciao [nome]! La vostra vetrina su MyCity è online. Come vi sembra? Ci sono state le prime richieste? Se volete aggiungere foto o modificare qualcosa, ditemi pure."

**Le Tre Ganasce** (#4 TripAdvisor — aggancio reputazione):
> "Ciao [nome]! I vostri primi ordini online — come è andata? Le Tre Ganasce #4 di Piacenza devono fare il pieno anche da asporto. C'è qualcosa che posso ottimizzare nella vetrina?"

**Osteria Carducci** (clientela fidelizzata — aggancio abituali):
> "Ciao [nome]! Come vanno i primi giorni su MyCity? La vetrina è attiva. Avete detto ai vostri clienti abituali che ora possono ordinarvi anche a casa?"

**La Dispensa de i Balocchi** (fine dining — aggancio box regalo):
> "Ciao [nome]! La vetrina de La Dispensa è online. Come vi sembra la presentazione? Volevo capire se i prodotti di gastronomia e i vini vanno bene così o se volete aggiungere qualcosa."

**Trattoria dei Pescatori** (⚠️ no consegna, solo asporto/prenotazione):
> "Ciao [nome]! Come vanno le prime prenotazioni/asporto tramite MyCity? La vetrina è online — i piacentini vi trovano ora. C'è qualcosa da aggiornare (orari, menu, note)?"

---

## A1 · ⛔ RITIRATA (6/7/2026 14:45) — il "bando Vita in Centro rimborso 50% materiali" NON esiste
reparto: relazioni-istituzionali
livello: ⛔ non inviare
motivo del ritiro: La verifica web del 6/7/2026 (`consegne/relazioni-istituzionali/2026-07-06-playbook-bandi-mail-istituzioni.md`) ha accertato che **non esiste alcun bando/contributo comunale "Vita in Centro" che rimborsi il 50% dei materiali**. "Vita in Centro" è un'**associazione di commercianti** partner dell'Hub Urbano, NON un ente che eroga rimborsi. Inviare questa mail avrebbe fatto chiedere al Comune un bando inesistente (danno di credibilità).
sostituita da: **riga 39 di [[AZIONI-IN-ATTESA]]** (mail verificate all'Ufficio Commercio del Comune + Unione Commercianti, agganciate al **vero** bando: Bando Commercio ER fondo perduto fino a €50.000, sportello aperto fino al 21/7/2026). Il rimborso materiali per i negozi, semmai, passa da quel bando (spesa ammissibile) o dagli interventi dell'Hub — non da un rimborso comunale a sportello.
nota per #33 (kit capillarità): rimuovere/riscrivere l'aggancio «bando Vita in Centro dimezza i materiali» — stessa fonte inesistente.

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
cosa cambia: l'unico cliente reale riceve un promemoria del carrello da €10 (pesto + kefir bio di Pane Quotidiano). Ri-aggancio caldo, non promo fredda. ⚠️ **Aggiornato 6/7 12:48:** il gate «dopo #16 consegnato» è MORTO — l'ordine #16 di samir è stato ANNULLATO il 3/7. Nuovo gate: parte quando Pane Quotidiano torna evadibile (ordine-prova #21 chiuso), così il carrello non spinge samir verso una **2ª delusione**. Le mail NON citano #16.
se va bene: samir torna → primo cliente con 2 ordini, base per riordino/referral; se muto dopo Touch #2, si archivia.
pre-condizioni: parte SOLO dopo che PQ è di nuovo evadibile (ordine-prova #21 chiuso: accetta→consegna→payout-test) · ok @legale-privacy sul consenso (`email_marketing=false`, transazionale vs marketing) · email da /admin/users (chiave anon non la legge) · mani Resend accese (→ builder-automazioni). Finché non attive, resta in coda.
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
stato: BOZZE PRONTE — NESSUN INVIO. **Coda canonica = riga #26** in [[AZIONI-IN-ATTESA]] (crm-lifecycle, «Riporta indietro il cliente che ha lasciato un carrello da €10»). ⚠️ Corretto 7/7 12:12: il puntatore diceva «#27» ma #27 è la richiesta-recensione (customer-success) — il recupero-carrello è la #26. **Ri-verificato 7/7 vs lettura live MCP 00:29: 4 carrelli abbandonati invariati, 1 solo recuperabile reale (samir €10) → finding stabile, business fermo dal 24/6.**

## A4 · 💌 Messaggio post-consegna (grazie + recensione) — MODELLO NEUTRO RIUSABILE
reparto: customer-success
livello: 🟢 (template neutro riusabile) · l'invio a un cliente reale è 🔴 e vive nelle istanze A13/A14
canale: WhatsApp/email/in-app al cliente dopo la consegna
perche: Subito dopo una buona consegna è la finestra migliore per (1) intercettare un problema e (2) chiedere la recensione solo a chi è contento. Questo è il **modello neutro** con segnaposti — si istanzia in 30 secondi per QUALSIASI negozio (PQ dal 17/7 e le 6 botteghe priorità dal 13/7), non solo per Pane Quotidiano.
preparato: 🤗 customer-success — playbook completo in `consegne/customer-success/2026-07-01-playbook-recensioni.md`
gate (vale per ogni istanza): parte SOLO su un ordine **realmente consegnato** (delivery_status=delivered). Regola d'oro FLUSSI §3: la richiesta recensione (Touch 2) parte **solo se il feedback del Touch 1 non è negativo**. Segnaposti da riempire coi dati veri dell'ordine: [NEGOZIO] · [PRODOTTO/I] · [LINK-RECENSIONE = /orders/{UUID-ordine}/review, aperto LIVE prima dell'invio].
riuso: card canonica in coda = **#27** [[AZIONI-IN-ATTESA]]; le istanze PQ pronte = **A13** (Touch 1) + **A14** (Touch 2). Per un altro negozio: copia A13/A14, sostituisci i segnaposti, tieni lo stesso gate.
testo (Touch 1 · feedback, +3h dalla consegna):
Ciao! Sono Nicola di MyCity 👋 Ti è arrivata la spesa da [NEGOZIO]? Spero [PRODOTTO/I] sia come al banco.
Siamo appena nati e ogni tua parola conta: com'è andata? 👍 Tutto bene · 😐 Così così · 👎 C'è stato un problema.
Se qualcosa non va, rispondi qui: lo sistemo oggi stesso.
testo (Touch 2 · recensione, +1 giorno · SOLO se Touch 1 è 👍):
Buongiorno! Come promesso, ecco il link per lasciare due righe su [NEGOZIO] 🌟
👉 [LINK-RECENSIONE]  ← verificare LIVE prima dell'invio
Bastano 30 secondi: stelline + una frase vera. Sarebbe una delle prime recensioni verificate di MyCity a Piacenza — grazie di cuore!
stato: MODELLO PRONTO — nessun invio. **Ri-verificato 2026-07-14 02:42** (playbook recensioni RIPROVA Nicola): REST live ✅ — `delivery_status=delivered` = **0**, `store_reviews` = **0**, `reviews` = **0**, ordini totali = **1** (unico ordine `58094956…` **CANCELED** 3/7, `delivered_at` null). → **Consegne completate senza recensione: 0**. Nessun cliente reale da sollecitare oggi (inviare a ordine annullato = inventato). Primo invio alla prima consegna reale PQ: istanze **A13** + **A14**; automazione email = **#recensioni-trigger**; indice giro = **A27**.

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

## A18 · 🔎 Scout negozi — 3 botteghe per le categorie mancanti del cluster-spesa
reparto: vendite
livello: 🟢 (produrre lista+pitch = prospecting neutro) · 🔴 (contatto reale ai negozi = firma Nicola, dal 13/7)
canale: Telefono/di persona ai 3 titolari (manuale) — dal 13/7
perche: Il cluster reale è 1 solo negozio (Pane Quotidiano = panetteria/bio) e la shortlist 27 è satura di ristorazione delivery (dove Glovo/JustEat già competono). Mancano le botteghe della SPESA FRESCA che rendono MyCity "fai la spesa dal centro" e non un clone del food-delivery — il vero moat locale (Glovo a Piacenza = ~3 supermercati, 0 botteghe artigianali). Le 3 categorie mancanti: ortofrutta · salumeria/DOP · formaggi & gastronomia. Con queste + PQ il piacentino fa una spesa completa in un carrello solo.
preparato: 🔎 intelligence (fondamento fatti pubblici) + 🤝 vendite (pitch) — deliverable completo: `consegne/vendite/2026-07-06-scout-negozi-categorie-mancanti.md`
i 3 target (scelta_ragionata su fatti pubblici, prospect NON nel DB):
  ① Ortofrutta → Peretti Frutta e Verdura, Via Alberici Fratelli (negozio storico centro, Vita in Centro).
  ② Salumeria/DOP → Antica Salumeria Garetti, Piazza Duomo 44 (Albo Botteghe Storiche, 3 DOP piacentini) — già pilastro coda #1/A2, qui confermata come categoria.
  ③ Formaggi & gastronomia → Caseificio Amendolara, Via Trento 7 (dal 1939, formaggi + culatello Zibello + gastronomia).
cosa cambia: la pipeline vendite mira alle categorie che costruiscono il carrello-spesa attorno al faro, invece di inseguire pizza/sushi dove c'è più concorrenza. Alla firma partono 3 chiamate mirate con pitch già pronto.
se va bene: anche 1-2 sì e MyCity diventa "la spesa completa del centro" (pane+frutta+salumi+formaggi) — offerta che nessun'altra app in città ha, e riduce il rischio "un solo negozio reale".
condizioni di lancio (comuni ai 3): commissione 12% · 0€ costi fissi · payout a consegna · vetrina done-for-you ~20 min (<48h) · primo ordine di prova offerto · agganci: Bando ER 40% (scade 21/7) + Venerdì Piacentini 10/17 lug.
pitch ① Peretti (ortofrutta):
«Buongiorno, sono di MyCity, portiamo a casa dei piacentini la spesa dai negozi del centro — come già con Pane Quotidiano in Via Calzolai. La vostra frutta e verdura fresca è quello che la gente vuole ricevere a casa ogni settimana, e in consegna a Piacenza non la fa nessuno. Zero costi fissi, commissione solo sul venduto. Vi va se vi porto la vetrina online pronta e facciamo un primo ordine di prova questa settimana?»
pitch ② Garetti (salumeria/DOP):
«Buongiorno, sono di MyCity. I vostri salumi DOP — Coppa, Pancetta, Salame piacentino — a Piacenza nessuno li consegna a domicilio: è il motivo per cui vi ho pensati per primi in questa categoria. Zero costi fissi, commissione solo sul venduto, vetrina pronta in 20 minuti. C'è anche un bando che copre il 40% della digitalizzazione, scade il 21/7. Vi va se passo a mostrarvi come funziona e facciamo un ordine di prova?»
pitch ③ Amendolara (formaggi/gastronomia):
«Buongiorno, sono di MyCity, consegniamo a casa dei piacentini la spesa dalle botteghe del centro. I vostri formaggi e la gastronomia pronta sono perfetti per chi la sera vuole qualcosa di buono senza uscire — e dalle botteghe vere, in consegna, non lo fa nessuno. Zero costi fissi, commissione solo quando vendete, vetrina pronta in 20 minuti e primo ordine di prova offerto. Vi va se ve la preparo e ne parliamo 5 minuti?»
cancello AR-006: prospect non firmati → SOLO pitch-template neutri, nessun asset pesante intestato; lo sforzo pesante resta su Pane Quotidiano (coda #21). Al sì del titolare l'entità passa a `confermato` e si intesta la vetrina.
stato: PRONTA — nessun contatto inviato. Coda canonica = riga #25 in [[AZIONI-IN-ATTESA]]. Contatto reale dal 9/7.

## A6 · 💚 Check-in anti-churn — Pane Quotidiano (titolare)
⚠️ **SUPERATA il 2026-07-06 12:41 → sostituita dalla riga #26 in [[AZIONI-IN-ATTESA]].** Premessa morta: lo script diceva «oggi chiudiamo il vostro primo ordine e vi porto il cliente», ma l'ordine #16 è stato ANNULLATO il 3/7. NON usare questo testo. Usa lo script post-annullamento §3 di `consegne/account-negozi/2026-07-06-anti-churn-pane-quotidiano-post-annullamento.md` (coda #26).
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

## A13 · 💬 Touch 1 post-consegna — feedback (primo ordine consegnato · Pane Quotidiano)
reparto: customer-success
livello: 🔴 (messaggio a cliente reale — coperto da coda #3 già firmata 30/6; 🟢 la bozza)
canale: WhatsApp/telefono del cliente dell'ordine (dal profilo ordine) · backup email/in-app
perche: +3h dalla consegna è la finestra per intercettare un problema PRIMA che diventi reclamo, e per filtrare il ramo 👎 (non chiedere recensione a chi è insoddisfatto). Regola d'oro FLUSSI §3: recensione solo se feedback ≠ negativo.
preparato: 🤗 customer-success — testo completo in `consegne/customer-success/2026-07-01-playbook-recensioni.md` § Touch 1
pre-condizione: il **primo ordine-prova PQ** (coda #21: accetta→consegna→payout-test) segnato **Consegnato** in dashboard. ⚠️ **Aggiornato 6/7 13:35:** il vecchio gate «ordine `58094956…` / #16» è MORTO — #16 annullato il 3/7. L'order_id reale sarà quello del **nuovo** ordine-prova, da leggere alla consegna.
cosa cambia: il primo cliente reale MyCity riceve un check post-consegna; se qualcosa non va lo sistemiamo in giornata invece di perderlo.
se va bene: feedback 👍 → parte A14 (richiesta recensione); feedback 👎 → handoff @supporto, A14 sospesa.
testo:
Ciao! Sono Nicola di MyCity 👋 Ti è arrivata la spesa da Pane Quotidiano? Spero pesto e kefir
siano come al banco. Siamo appena nati e ogni tua parola conta: com'è andata?
👍 Tutto bene · 😐 Così così · 👎 C'è stato un problema. Se qualcosa non va, rispondi qui: lo sistemo oggi stesso.
stato: BOZZA PRONTA — gate ordine-prova PQ **Consegnato**. **Ri-verificato 2026-07-14 02:42:** 0 consegne → nessun invio oggi.

## A14 · ⭐ Touch 2 post-consegna — richiesta recensione (primo ordine consegnato · Pane Quotidiano)
reparto: customer-success
livello: 🔴 (messaggio a cliente reale — coperto da coda #3 già firmata 30/6; 🟢 la bozza)
canale: WhatsApp/telefono del cliente + email/in-app
perche: subito dopo una buona consegna è il momento migliore per chiedere la recensione. Sarebbe la **prima recensione verificata di MyCity a Piacenza**: social proof che aiuta l'acquisizione dei prossimi clienti e la fiducia nel faro reale.
preparato: 🤗 customer-success — testo completo in `consegne/customer-success/2026-07-01-playbook-recensioni.md` § Touch 2
pre-condizione: (1) A13 con feedback 👍 · (2) +1 giorno dalla consegna · (3) link recensione reale: `https://mycity-marketplace.com/orders/{ID-ORDINE-PROVA}/review` (pagina VERIFICATA nel codice: `app/orders/[id]/review/page.tsx` — stelle negozio 1-5 + rider + commento) → sostituire `{ID-ORDINE-PROVA}` con l'UUID del **nuovo** ordine-prova PQ (NON `58094956…`, annullato) e aprirlo LIVE prima dell'invio.
cosa cambia: il cliente lascia stelline + una frase vera su Pane Quotidiano → prima recensione pubblica reale sul marketplace.
se va bene: social proof sulla scheda del negozio faro; base per referral/riordino (aggancio a #27 carrello samir).
testo:
Buongiorno! Come promesso, ecco il link per lasciare due righe su Pane Quotidiano 🌟
👉 https://mycity-marketplace.com/orders/{ID-ORDINE-PROVA}/review  ← inserire l'UUID dell'ordine-prova consegnato · verificare LIVE
Bastano 30 secondi: stelline + una frase vera (spunto: "Prodotti bio freschi, consegna puntuale a mano, gentilissimi").
Sarebbe la prima recensione verificata di MyCity a Piacenza — grazie di cuore!
promemoria: una sola ripetizione gentile +2 giorni se silenzio, poi stop.
stato: BOZZA PRONTA — gate ordine-prova PQ **Consegnato**. **Ri-verificato 2026-07-14 02:42:** 0 consegne → nessun invio oggi. Link `{ID-ORDINE-PROVA}` si riempie all'atto della prima consegna reale.

## A27 · ⭐ Playbook recensioni — ri-verifica 14/7 (0 consegne, messaggi armati)
reparto: customer-success
livello: 🟢 (sola lettura + bozze) · 🔴 l'invio al cliente reale
canale: WhatsApp/email/in-app (manuale A13→A14) oppure email automatica Resend (#recensioni-trigger)
perche: Nicola ha riapprovato il playbook recensioni. Serve sapere **chi** contattare dopo ogni consegna e avere il testo pronto — senza inventare destinatari quando non c'è nessuna consegna.
preparato: 🤗 customer-success — playbook `consegne/customer-success/2026-07-01-playbook-recensioni.md` (§ 14/7 02:42)
snapshot live (REST 14/7 02:42):
  · Ordini totali: **1**
  · Consegne completate: **0**
  · Recensioni (negozio + prodotto): **0**
  · Consegne senza recensione da sollecitare: **0**
  · Ordine zombie CANCELED `58094956…` — **non contattare**
gate: messaggio parte SOLO su `delivery_status=delivered`. Touch 2 recensione solo se Touch 1 ≠ 👎.
cosa usare:
  · **Concierge (primi ordini):** A13 (grazie + feedback +3h) → se 👍 A14 (link recensione +1g)
  · **Automazione volume:** template `consegne/customer-success/2026-07-11-template-email-recensione.md` — firma **#recensioni-trigger** in [[AZIONI-IN-ATTESA]]
se va bene: alla prima consegna PQ il cliente riceve grazie entro poche ore e, se contento, link recensione → prime stelle verificate su MyCity.
stato: VERIFICATO 2026-07-14 02:42 — nessun destinatario oggi; bozze pronte per la prima consegna reale.

## A9 · 💚 Rassicurazione standalone al titolare — Pane Quotidiano (parte anche se l'ordine è ancora fermo)
⚠️ **SUPERATA il 2026-07-06 12:41 → sostituita dalla riga #26 in [[AZIONI-IN-ATTESA]].** Premessa morta: lo script diceva «il primo ordine sta tardando ad arrivare», ma l'ordine #16 è stato ANNULLATO il 3/7 (non "in ritardo"). NON usare questo testo. Usa lo script post-annullamento §3 di `consegne/account-negozi/2026-07-06-anti-churn-pane-quotidiano-post-annullamento.md` (coda #26).
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

## A19 · 🎯 Accendi MyCity Punti (fedeltà spendibile su tutta la rete)
reparto: growth-monetizzazione
livello: 🔴 (tocca i soldi — il montepremi punti è costo di margine)
canale: banner home (config) + scheda "I miei punti" nell'account cliente (codice, frontend-dev) + email annuncio (Resend)
perche: Un cliente che compra da un negozio guadagna un vantaggio spendibile in TUTTI i negozi MyCity → moat locale che Amazon non copia e che alza frequenza + scontrino. Oggi però la rete è 1 negozio e 0 transazioni: si prepara la meccanica, non si lancia.
preparato: 🚀 growth + 💶 finanza (economia) + 🧾 contabilita (passività punti) + 🔁 crm + 🎨 designer (comunicazione)
meccanica:
- Accumulo: 1 punto ogni €1 speso su qualunque negozio. 1 punto = €0,02 (cashback effettivo 2%, default da validare @finanza).
- Spesa: valgono su TUTTA la rete. Soglia riscatto 100 punti = €2. Tetto uso 30–50% del carrello (il negozio incassa sempre una quota reale). Scadenza 12 mesi (riduce liability, obbligo trasparenza Codice del Consumo).
- Chi paga: il MARGINE MyCity, NON il negozio. Al riscatto il negozio incassa pieno; MyCity scala dal proprio take. Registro `punti_liability` (deferred), breakage a scadenza = ricavo.
- Bonus onboarding: nessun coupon nuovo (budget €0), riuso `BENVENUTO10` già a DB.
cosa cambia: ⚠️ impatto sistema — cashback 2% finanziato dal margine ≈ 2/12 ≈ 17% delle commissioni sul venduto che matura punti. Sostenibile SOLO se l'incrementale (holdout, @analista) ripaga il costo → @finanza fissa il % PRIMA del lancio, non a intuito.
se va bene: quando la rete arriva (≥5 negozi), la leva di fidelizzazione è già scritta e firmabile in 2 minuti; misurata con holdout per il dato incrementale reale (non il lordo).
gate di lancio (tutte e 4): (1) ≥5 negozi reali con payout · (2) flusso ordini reali avviato (#21 chiuso end-to-end) · (3) Stripe write collegato · (4) % e tetti validati @finanza.
dettaglio: consegne/growth/2026-07-06-playbook-fedelta-di-rete.md (Parte A). Coda canonica = riga #28 in [[AZIONI-IN-ATTESA]].
stato: ⏸ ARMATO — meccanica pronta, nessun lancio finché il gate non è verde.

## A20 · 🎁 Vendi le Gift Card MyCity (incasso anticipato)
reparto: growth-monetizzazione → legale-privacy / contabilita
livello: 🔴 (incasso reale + passività fiscale — firma Nicola)
canale: pagina "Gift Card" sul marketplace (frontend-dev) + Stripe (incasso) + email/PDF "Regala Piacenza"
perche: Gift card digitali €10/€25/€50 spendibili su tutta la rete = incasso anticipato (cassa positiva upfront senza debito) + prodotto-regalo che porta clienti nuovi ("Regala Piacenza", welfare aziendale locale B2B). Il non-usato dopo scadenza = breakage → ricavo.
preparato: 🚀 growth + ⚖️ legale-privacy (IVA/termini) + 🧾 contabilita (deferred revenue) + 🛡️ trust-safety (anti-frode) + 🧰 builder (mani)
meccanica:
- Incasso subito l'intero importo; il negozio è pagato SOLO al riscatto, sul venduto reale. Scadenza dichiarata in chiaro. Codici a uso singolo.
- Fiscale (da confermare @legale + @contabilita): spendibili su categorie a IVA diversa → buono MULTIUSO (art. 6-ter DPR 633/72) = IVA all'UTILIZZO, non all'emissione. Registro passività `giftcard_liability`.
- Anti-frode (@trust-safety): limite acquisto/giorno, blocco rivendita massiva, watch chargeback.
cosa cambia: entrano soldi veri oggi che poi girano nelle botteghe reali — non su Amazon. Ma serve il sì fiscale (IVA multiuso) e la mano Stripe write (oggi sola lettura) prima di vendere una sola card.
se va bene: carburante di cassa senza debito + un canale di acquisizione clienti nuovi (chi riceve il regalo scopre la rete).
gate di lancio: (1) parere @legale-privacy + @contabilita su IVA/termini · (2) Stripe write + generatore codici (@builder) · (3) tabella `gift_cards` + redemption al checkout.
dettaglio: consegne/growth/2026-07-06-playbook-fedelta-di-rete.md (Parte B). Coda canonica = riga #29 in [[AZIONI-IN-ATTESA]].
stato: ⏸ ARMATO — nessuna vendita finché Stripe write e parere fiscale non ci sono.

## A21 · 🔎 SEO locale — riempi i campi vetrina di Pane Quotidiano (la leva n.1, reversibile)
reparto: seo → tech (esecuzione config)
livello: 🟡 (config sul marketplace, backup per riga → reversibile)
canale: corsia CONFIG `node cervello/marketplace.mjs aggiorna profiles <id-PQ> '<json>'` (mai deploy, mai DB clienti)
perche: Ho letto il codice del sito (`app/store/[id]/layout.tsx` + `page.tsx`): titolo, meta-descrizione, Open Graph e lo schema.org `Store` sono TUTTI derivati dai campi vetrina nel DB (`store_name`, `store_description`, `store_address`). Due scoperte verificate: (a) il titolo aggiunge "**a Piacenza**" SOLO se `store_address` è pieno (riga 46 del layout) → local intent gratis; (b) se `store_description` è vuota esce una descrizione generica → oggi PQ non intercetta nessuna keyword. Riempire questi campi migliora in un colpo solo meta-title, meta-description, OG **e** lo schema.org — senza toccare codice.
preparato: 🔎 seo — testi veri (fatti pubblici PQ, ≤160 char) + verifica del meccanismo nel codice. Deliverable: `consegne/seo/2026-07-06-playbook-seo-locale-PQ.md`
le 5 ricerche ad alto intento intercettate (stime scala Piacenza, verità in Search Console post-live):
  ① prodotti bio a domicilio Piacenza / dove comprare biologico a Piacenza (~40–120/mese, concorrenza bassa) → pagina PQ
  ② alimenti dietetici Piacenza / negozio dietetico centro (~20–60, molto bassa) → pagina PQ
  ③ spesa bio online Piacenza / biologico consegna a casa (~30–90, bassa-media) → home/categoria bio
  ④ prodotti senza glutine Piacenza (~40–110, bassa) → pagina PQ ⚠️ SOSPESA finché Nicola/PQ non conferma la linea senza glutine (non inventiamo il catalogo)
  ⑤ negozi del centro storico Piacenza con consegna a casa (~30–80, bassa) → pagina PQ (Via Calzolai, centro)
campi da scrivere (tutti veri; l'esecutore fa PRIMA `node cervello/marketplace.mjs leggi` per confermare l'id seller PQ `c0b240c0…` e i valori attuali):
  store_description → «Pane Quotidiano: alimenti biologici e dietetici a Piacenza dal 1976, in Via Calzolai 25 (centro). Prodotti bio per mangiar sano — su MyCity con consegna locale o ritiro in negozio.» (≈155 char)
  store_address → «Via Calzolai 25, 29121 Piacenza (PC)» (già a DB per la parte via/telefono — confermare che il campo che alimenta il title sia pieno)
  store_phone → «0523 388601»
  (store_lat / store_lng → SOLO se geocodifica reale di Via Calzolai 25 confermata; non inventiamo coordinate)
cosa cambia: la pagina di Pane Quotidiano smette di uscire "generica" su Google: title con "a Piacenza", meta-descrizione ricca di parole vere (biologici, dietetici, bio, consegna) e schema.org con indirizzo/telefono pieni. Reversibile (backup per riga).
se va bene: PQ inizia a comparire per le ricerche 1–2–5; con Search Console (gratis) misuriamo impression/click veri a 30/90 gg e capiamo dove spingere.
cancello AR-006: PQ è `confermato` (unico negozio reale) → pacchetto pieno intestato = legittimo. Nessun campo legale/fiscale/IBAN toccato.
dettaglio: consegne/seo/2026-07-06-playbook-seo-locale-PQ.md (§0-2). Coda canonica = riga #30 in [[AZIONI-IN-ATTESA]].
stato: PRONTA — testi pronti, nessuna scrittura fatta. Aspetta il via.

## A22 · 🧩 SEO tecnica — completa lo schema.org e correggi l'URL canonico (in branch)
reparto: seo → frontend-dev / tech
livello: 🟡 (patch codice in un branch del repo marketplace, test come cancello — mai deploy senza firma 🔴)
canale: branch `marketplace/` → anteprima → merge (owner: frontend-dev/tech); cancello = `tests/e2e/06-seo-and-a11y.spec.ts`
perche: Lo schema.org `Store` (LocalBusiness) JSON-LD esiste già (`app/store/[id]/page.tsx`) ma è affamato di dati e ha un bug che lo rende invisibile ai crawler. Sistemarlo alza la qualità del risultato locale ("rich result", local pack).
i 4 interventi (in ordine di impatto):
  ① Bug URL canonico: lo schema usa `window.location.href` → `undefined` lato server, il crawler non vede l'URL. Costruire l'URL canonico server-side. (SEO tecnica, alto impatto, basso rischio)
  ② `openingHours` assente → aggiungere `openingHoursSpecification`. SERVE: orari reali di apertura di PQ (procura da Nicola/PQ) — forte per il local pack.
  ③ `@type` generico `Store` → per food-bio usare `GroceryStore`/`HealthFoodStore` (data-driven dalla categoria).
  ④ `Product` + `Offer` JSON-LD sulle schede prodotto (prezzo, disponibilità) → rich result. + `BreadcrumbList`/`CollectionPage` sulla categoria.
cosa cambia: lo schema.org di ogni negozio (a partire da PQ) esce completo e leggibile dai motori: telefono, indirizzo, orari, tipo corretto, prodotti con prezzo. Migliora come MyCity appare su Google/Maps.
se va bene: base tecnica SEO solida e riusabile per OGNI negozio futuro, non solo PQ — si scrive una volta e vale per tutta la rete.
serve da Nicola: orari reali di PQ (per ②) + firma al merge/deploy (🔴).
dettaglio: consegne/seo/2026-07-06-playbook-seo-locale-PQ.md (§3). Coda canonica = riga #31 in [[AZIONI-IN-ATTESA]].
stato: PRONTA (specifica) — nessun codice scritto. Alla firma apro il branch.

## A23 · 📍 SEO locale — rivendica i due Google Business Profile (PQ + MyCity)
reparto: seo → relazioni con il titolare PQ
livello: 🔴 (scheda pubblica reale del negozio + creazione scheda MyCity — serve OK Nicola E titolare PQ)
canale: Google Business Profile (rivendica/verifica scheda PQ · crea scheda MyCity service-area)
perche: Per le ricerche "vicino a me" / local pack, il Google Business Profile è la leva locale più forte, più del sito. PQ (attività dal 1976) è quasi certamente già mappata → si rivendica, non si crea da zero.
le 2 schede:
  ① Pane Quotidiano — rivendicare/verificare la scheda esistente: categoria "Negozio di alimenti naturali/biologici", orari reali, foto, link alla vetrina MyCity, post "ora consegniamo a domicilio con MyCity". È la scheda del NEGOZIO → serve l'ok del titolare, non è nostra.
  ② MyCity — creare la scheda "MyCity — marketplace dei negozi di Piacenza" come service-area business (zona Piacenza), categoria "Servizio di consegna spesa", link al sito, descrizione con keyword.
cosa cambia: PQ e MyCity diventano trovabili su Google Maps e nel "local pack" per chi cerca spesa/bio a Piacenza — il canale che porta più clic locali. I campi esatti (nome, categorie, descrizione, orari, foto) li preparo al via; non pubblico nulla senza firma.
se va bene: traffico organico locale "a costo zero" verso la vetrina PQ e verso MyCity; misurato in GBP Insights (gratis).
serve da Nicola: (1) ok a rivendicare/gestire i due profili · (2) ok del titolare PQ per la sua scheda · (3) orari + foto reali PQ.
dettaglio: consegne/seo/2026-07-06-playbook-seo-locale-PQ.md (§4). Coda canonica = riga #32 in [[AZIONI-IN-ATTESA]].
stato: PRONTA — campi da compilare al via, nessuna pubblicazione fatta.

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

## A24 · 🛡️ Bollino «Negozio Verificato MyCity» — lo standard di fiducia della città
> (nato come «A18» nella coda del VPS: rinumerato A24 nella riconciliazione del 6/7 per collisione col A18 «scout 3 botteghe» — i vecchi rimandi «A18 bollino» puntano qui)
reparto: trust-safety (owner) · legale-privacy (claim) · content-social (bozze)
livello: 🟢 (definire lo standard — fatto) · 🔴 (assegnarlo/mostrarlo a video e annunciarlo — firma Nicola)
canale: vetrina negozio sul sito (bollino) + annuncio IG @mycity.piacenza/gruppi FB + messaggio al titolare
perche: La fiducia è il fossato di MyCity contro Glovo (che consegna da supermercati anonimi). Un bollino con 5 criteri verificabili — identità reale, negozio attivo, pagamenti sicuri, consegna provata, regole rispettate — dice al cliente «di questo negozio ti puoi fidare, ci mettiamo la faccia noi». Diventa lo standard d'ingresso per l'ondata di negozi dal 13/7.
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

## A26 · 📣 Post del giorno "Il tuo ordine ha un nome" (motore Volti, non algoritmi)
reparto: content-social
livello: 🔴 (pubblicazione — la bozza 🟢 è già fatta)
canale: IG feed @mycity.piacenza + storia (9:16) + gruppi FB locali ("Sei di Piacenza se…", "Piacenza Mia")
perche: Post del giorno (9/7) sotto la piattaforma "Il Turno", faccia **motore "Volti, non algoritmi"** (swipe #3: il volto prima del prodotto). Pilastro DIVERSO dai due già usati (7/7 causa/A8-manifesto #57 · 8/7 comodità/ZTL #59): dice il *chi* c'è dietro l'ordine — una persona con un nome, non un algoritmo/magazzino anonimo. Nemico chiaro (swipe #1), autenticità grezza (swipe #7). Domanda-ghigliottina "poteva farlo Amazon?" → no (Amazon È l'algoritmo).
preparato: ✍️ content-social (sintesi AD) — gate ONESTA-RULES passato (0 numeri finti, 0 testimonianze, figure archetipiche non spacciate per negozi attivi, CTA + visual con segnaposto)
contenuto pronto: consegne/content/2026-07-09-post-del-giorno-volti-non-algoritmi.md
cosa cambia: esce il 3° contenuto della rubrica "Il Turno", sul lato *chi* (volti, non algoritmi) → differenzia MyCity dal delivery anonimo a costo ≈0, senza promettere numeri che non abbiamo. Neutro (nessun negozio intestato → nessun consenso bottega, cancello allocazione AR-006 ok).
se va bene: terzo mattone di notorietà + iscrizioni tracciabili via UTM; con #57 e #59 la rubrica ha tre pilastri diversi in fila (causa · comodità · volti) e regge come appuntamento settimanale.
testo (versione Gruppi FB — link nel 1° commento):
Quando ordini online, di solito dall'altra parte c'è un algoritmo: un magazzino grande come un paese, a centinaia di chilometri da qui, dove nessuno sa chi sei. A Piacenza può funzionare diversamente. Sto costruendo MyCity: quando ordini, la tua spesa la prepara una persona vera. Il fornaio che alza la saracinesca alle sei. Il salumiere che ti taglia la coppa come piace a te. Gente del centro, con un nome e una faccia — non un carrello automatico. Perché una città-centro resta accesa solo se, a turno, qualcuno la tiene aperta. Il bottegaio la mattina. Tu quando fai la spesa. La tua spesa è il tuo turno — e dall'altra parte c'è sempre qualcuno, non un algoritmo. Cerco le prime 50 famiglie del centro: per loro la prima consegna è gratis. 👉 (nel 1° commento) Iscriviti alla lista d'attesa. La spesa che tiene viva la città. Fai il tuo turno.
testo (caption IG/FB Pagina):
Il tuo ordine non lo prepara un algoritmo. 🙌 Lo prepara una persona vera: il fornaio, il salumiere, la bottega del centro di Piacenza. Gente con un nome e una faccia, non un magazzino anonimo. La stessa comodità di ordinare da casa — ma dall'altra parte c'è qualcuno che ti conosce. La tua spesa è il tuo turno. Cerchiamo le prime 50 famiglie del centro. Link in bio. La spesa che tiene viva la città. Fai il tuo turno.
visual: mani di un bottegaio che incartano/porgono un pacco spesa su banco di bottega (inquadratura sul gesto, NESSUN volto → neutro, nessun consenso); variante contrasto split braccio-robotico vs mani-bottega ("Due modi di ricevere la spesa. Uno ha un nome."). Overlay: "Il tuo ordine ha un nome." + "Volti, non algoritmi". Palette calda brand; VIETATO giallo-Glovo/arancio-Amazon/blu-tech. Fallback tipografico pubblicabile subito senza foto.
pre-condizioni: (1) versione neutra tipografica = pubblicabile con sola firma Nicola · (2) foto mani/gesto o via libera a immagine AI dichiarata (col volto reale → serve ok titolare, diventa il ponte verso l'angolo "ritratto") · (3) link reale lista d'attesa in bio/1° commento con UTM (@builder-automazioni) — è il tappo n.1 di ogni post. Coda canonica = riga #60 in [[AZIONI-IN-ATTESA]].
stato: IN ATTESA DI FIRMA NICOLA.

## A25 · 💚 Arma l'anti-churn PRIMA dell'onda del 13/7 (health-score sui negozi)
reparto: account-negozi (owner) · devops-sre / data-engineer (sentinella)
livello: 🟡 (accende una sentinella/health-score in sola lettura sul marketplace — nessuna scrittura, nessun contatto a clienti/negozi)
canale: giro.sh (blocco health-score negozi, sola lettura) + card «negozio a rischio» nel Pannello quando una soglia scatta
perche: **Playbook anti-churn 7/7 — verdetto onesto: 0 negozi in calo oggi** (1 solo negozio reale, Pane Quotidiano, senza storico ordini da cui calare; PQ **non è churn** ed è già stato chiuso da Nicola il 6/7, righe #25/#29). Il churn diventa reale dal **13/7**, quando entrano le 6 botteghe priorità. La causa #1 di churn dei commercianti non è il calo, è il **"no value realized"**: entra, mette il catalogo, non riceve il primo ordine, molla. Armare l'health-score PRIMA dell'onda protegge le 6 botteghe dal giorno 1, invece di accorgersene quando una ha già mollato.
preparato: 💚 account-negozi — registro + soglie + template check-in neutro in `consegne/account-negozi/2026-07-07-playbook-anti-churn.md`
soglie (per negozio reale, dal go-live · sola lettura):
  - 🟡 no-value: LIVE con catalogo ma **0 ordini a 5 giorni** dal go-live → check-in «ti porto il primo ordine di prova»
  - 🟡 silenzio: aveva ordini, ora **0 da 14g** → check-in + micro-spinta domanda
  - 🔴 churn: **0 da 30g** o «tolgo il negozio» → chiamata di recupero + diagnosi frizione (payout/catalogo/consegne)
  - gate AR-006: prospect non firmati → solo template neutri; l'health-score si accende quando la bottega è `confermata` (nel DB)
cosa cambia: la macchina veglia da sola il time-to-first-value di ogni bottega dell'onda 13/7 e alza una card «negozio a rischio» sul Pannello quando una supera una soglia — così il check-in parte in tempo, non a molla persa. Sola lettura, nessun contatto automatico: ogni telefonata reale resta una card da firmare.
se va bene: le 6 botteghe del 13/7 non ammutoliscono nel silenzio; il primo negozio che rischia il "no value" riceve la spinta (ordine di prova + post) prima di mollare. Riusabile per ogni negozio futuro.
non-duplicato: non tocca #25/#29 (anti-churn PQ, chiuse da Nicola) né #40 (sentinella ordini annullati) — è la lente **salute/retention negozi**, che oggi non esiste come sensore.
stato: PRONTA — spec + soglie pronte, nessun codice scritto e nessun contatto inviato. Alla firma si cabla il blocco health-score nel giro. Coda canonica = riga #56 in [[AZIONI-IN-ATTESA]].
