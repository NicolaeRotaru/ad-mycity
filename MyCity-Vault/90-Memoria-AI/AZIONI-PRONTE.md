---
tipo: azioni-pronte
fonte: AD digitale
aggiornato: 2026-07-20 11:33
nota: "La corsia operativa. Ogni blocco è una mossa pronta a partire. Formato: '## ID · Titolo', poi campi 'chiave: valore', poi 'testo:' e sotto l'anteprima fino al blocco successivo."
---

# ⚡ Azioni pronte

> ⚠️ **CODA CANONICA = [[AZIONI-IN-ATTESA]]** (integrità-memoria): la coda che Nicola firma è **una sola**,
> `AZIONI-IN-ATTESA.md`. Questo file resta come **dettaglio operativo** (testo esteso/anteprima di alcune
> mosse) referenziato da lì, NON una seconda coda parallela. Quando accodi un'azione nuova, mettila in
> `AZIONI-IN-ATTESA.md`; se serve l'anteprima lunga, linkala qui. Non duplicare lo stato di approvazione.

## A4 · ⛔ RITIRATA 2026-07-18 — Playbook anti-churn 6 botteghe (post 13/7)
reparto: account-negozi
livello: ⛔ non avviare
motivo: I 6 negozi elencati (Tigellabella, La Forchetta, Le Tre Ganasce, Osteria Carducci, La Dispensa, Trattoria Pescatori) sono TUTTI **ESCLUSI** perché ristoranti/osterie (Nicola 18/7: «non sono il nostro target»). La visita del 13/7 non ha prodotto onboarding. Condizione "botteghe onboardate dopo 13/7" = mai soddisfatta.
stato: #antichurn-13lug segnata ❌ SCADUTA 2026-07-18 in AZIONI-IN-ATTESA.
sostituzione: Il playbook anti-churn si riattiva quando arriva il **primo negozio reale onboardato** (Garetti/Peretti/Amendolara o onda 2). La struttura T+3/T+7/T+14/T+45 resta valida — basta cambiare i destinatari.

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
commissione 10% sul venduto, abbonamento 50€/mese, payout a consegna confermata, nessun vincolo.
Mettiamo online la tua vetrina in ~20 minuti e il primo sabato la consegna è gratis.
Ti va se passo a sistemare tutto insieme?

## A3 · 🛒 Recupero carrello — samir (unico cliente reale, €10 Pane Quotidiano)
reparto: crm-lifecycle
livello: 🟡 (Touch #1 senza sconto) · 🔴 (Touch #2 col codice)
canale: Email al buyer samir — indirizzo da recuperare da /admin/users (chiave anon non lo legge)
perche: Un solo carrello recuperabile REALE (verificato REST live 20/7 11:19: 4 record `abandoned_carts`, 1 buyer reale su 4 buyer registrati). Buyer samir, 3 prodotti bio, €10,00, fermo dal 16/6 (~803h). Gli altri 3 = admin/seller-autotest/seed Casa Linda → SKIP. Tutti hanno `recovery_email_sent_at` già settato (giugno) → re-touch manuale, non cron.
preparato: 🔁 crm-lifecycle — testo pieno in `consegne/crm/2026-07-20-recupero-carrelli-pronte.md` (agg. 20/7 11:19 playbook)
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
stato: BOZZE PRONTE — NESSUN INVIO. **Ri-verificato 20/7 11:19 (playbook worker):** REST live (`verifica-sensori` ok) — 4 carrelli invariati, 1 solo recuperabile (samir €10, ~803h). 23 profili / 4 buyer / 0 ordini consegnati → gate PQ ancora CHIUSO. Per invio reale: firma Touch #1 🟡 dopo `#ordine-test-pq` + email da `/admin/users`.

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
stato: MODELLO PRONTO — nessun invio. **Ri-verificato 2026-07-20 11:27** (playbook recensioni worker): REST live ✅ — `delivery_status=DELIVERED` = **0**, `store_reviews` = **0**, `reviews` = **0**, ordini totali = **1** (unico ordine `58094956…` **CANCELED**, `delivered_at` null). → **Consegne completate senza recensione: 0**. Nessun cliente reale da sollecitare oggi (inviare a ordine annullato = inventato). Primo invio alla prima consegna reale PQ: istanze **A13** + **A14**; automazione email = **#recensioni-trigger**; indice giro = **A27**; pacchetto `consegne/customer-success/2026-07-20-playbook-recensioni-pronte.md`.

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
livello: 🟢 (produrre lista+pitch = prospecting neutro) · 🔴 (contatto reale ai negozi = firma Nicola)
canale: WhatsApp anchor (#whatsapp-3-anchor-pi26) poi telefono/di persona ai 3 titolari
aggiornato: 2026-07-20 11:15 (playbook ri-verifica REST)
perche: REST live 20/7 — **17 negozi, 1 approvato** (solo Pane Quotidiano). Cluster-spesa invariato: mancano ortofrutta · salumeria/DOP · formaggi/gastronomia per il carrello completo del centro. Shortlist delivery esclusa (Nicola 18/7). Moat: Glovo ≈ 3 supermercati, 0 botteghe artigianali.
preparato: 🤝 vendite + 🔎 intelligence — deliverable: `consegne/vendite/2026-07-20-playbook-scout-negozi-categorie-mancanti.md` (aggiorna scout 6/7)
i 3 target (scelta_ragionata, prospect NON nel DB):
  ① Ortofrutta → Peretti Frutta e Verdura, Via Alberici Fratelli (Vita in Centro).
  ② Salumeria/DOP → Antica Salumeria Garetti, Piazza Duomo 44 (Albo Botteghe Storiche, 3 DOP).
  ③ Formaggi & gastronomia → Caseificio Amendolara, Via Trento 7 (dal 1939, formaggi + culatello Zibello).
cosa cambia: pitch allineati al bando **PI26 CCIAA** (50%, max €10k, sportello dal 20/7, scade 30/7). ⛔ Bando ER 40% **chiuso** 23/6 — non citare più.
se va bene: anche 1–2 sì → carrello-spesa completo (pane+frutta+salumi+formaggi) — offerta unica a Piacenza; riduce rischio «un solo negozio reale».
condizioni comuni: commissione 10% · 50€/mese abbonamento · payout a consegna · vetrina ~20 min · primo ordine prova offerto · leva PI26 50% fino 30/7.
pitch ① Peretti (ortofrutta):
«Buongiorno, sono di MyCity — portiamo a casa la spesa dal centro, come con Pane Quotidiano in Via Calzolai. La vostra frutta e verdura fresca in consegna a Piacenza non la fa nessuno. Abbonamento 50€/mese e commissione 10% solo sul venduto. Dal 20 luglio c'è un bando CCIAA che copre il 50% della digitalizzazione — scade il 30. Vi va se vi preparo la vetrina e facciamo un primo ordine di prova questa settimana?»
pitch ② Garetti (salumeria/DOP):
«Buongiorno, sono di MyCity. I vostri salumi DOP — Coppa, Pancetta, Salame piacentino — nessuno li consegna a domicilio a Piacenza: vi ho pensati per primi. Zero costi fissi, vetrina in 20 minuti. Bando Camera di Commercio aperto da oggi: rimborsa metà dei costi di digitalizzazione, fino a 10.000 euro, scadenza 30 luglio. Vi va se passo a mostrarvi come funziona e facciamo un ordine di prova?»
pitch ③ Amendolara (formaggi/gastronomia):
«Buongiorno, sono di MyCity — consegna a casa la spesa dalle botteghe del centro. I vostri formaggi e gastronomia pronta: perfetti per la sera senza uscire, e dalle botteghe vere non lo fa nessun altro. Zero costi fissi, vetrina in 20 minuti, primo ordine prova offerto. Il bando PI26 copre il 50% se digitalizzate entro il 30 luglio. Vi va se ve la preparo e ne parliamo 5 minuti?»
cancello AR-006: prospect non firmati → SOLO pitch-template neutri; asset pesante resta su PQ (#ordine-test-pq). Al sì → `confermato` + vetrina intestata.
stato: PRONTA — zero contatti inviati. Primo passo 🔴: **#whatsapp-3-anchor-pi26** (3 WhatsApp PI26). Poi chiamate A18.

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
stato: BOZZA PRONTA — gate ordine-prova PQ **Consegnato**. **Ri-verificato 2026-07-20 11:27:** 0 consegne → nessun invio oggi.

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
stato: BOZZA PRONTA — gate ordine-prova PQ **Consegnato**. **Ri-verificato 2026-07-20 11:27:** 0 consegne → nessun invio oggi. Link `{ID-ORDINE-PROVA}` si riempie all'atto della prima consegna reale.

## A27 · ⭐ Playbook recensioni — ri-verifica 20/7 (0 consegne, messaggi armati)
reparto: customer-success
livello: 🟢 (sola lettura + bozze) · 🔴 l'invio al cliente reale
canale: WhatsApp/email/in-app (manuale A13→A14) oppure email automatica Resend (#recensioni-trigger)
perche: Nicola ha riapprovato il playbook recensioni. Serve sapere **chi** contattare dopo ogni consegna e avere il testo pronto — senza inventare destinatari quando non c'è nessuna consegna.
preparato: 🤗 customer-success — playbook `consegne/customer-success/2026-07-01-playbook-recensioni.md` + pacchetto `consegne/customer-success/2026-07-20-playbook-recensioni-pronte.md`
snapshot live (REST 20/7 11:27 · playbook worker):
  · Ordini totali: **1**
  · Consegne completate: **0**
  · Recensioni (negozio + prodotto): **0**
  · Consegne senza recensione da sollecitare: **0**
  · Ordine zombie CANCELED `58094956…` — **non contattare**
gate: messaggio parte SOLO su `delivery_status=DELIVERED`. Touch 2 recensione solo se Touch 1 ≠ 👎.
cosa usare:
  · **Concierge (primi ordini):** A13 (grazie + feedback +3h) → se 👍 A14 (link recensione +1g)
  · **Automazione volume:** template `consegne/customer-success/2026-07-11-template-email-recensione.md` — firma **#recensioni-trigger** in [[AZIONI-IN-ATTESA]]
se va bene: alla prima consegna PQ il cliente riceve grazie entro poche ore e, se contento, link recensione → prime stelle verificate su MyCity.
stato: VERIFICATO 2026-07-20 11:27 — nessun destinatario oggi; bozze pronte per la prima consegna reale (pacchetto `consegne/customer-success/2026-07-20-playbook-recensioni-pronte.md`).

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
perche: Un cliente che compra da un negozio guadagna un vantaggio spendibile in TUTTI i negozi MyCity → moat locale che Amazon non copia e che alza frequenza + scontrino. Oggi però la rete è 1 negozio, 4 buyer, 0 ordini pagati (~625h stallo): si prepara la meccanica, non si lancia.
preparato: 🚀 growth + 💶 finanza (economia refresh 20/7) + 🧾 contabilita (passività punti) + 🔁 crm + 🎨 designer + ✍️ content-social (bozze 20/7)
meccanica:
- Accumulo: 1 punto ogni €1 speso su qualunque negozio. Valore punto da fissare @finanza — **consiglio lancio 1% (1 pt = €0,01)**, scale a 2% solo se holdout ≥+20% GMV.
- Spesa: valgono su TUTTA la rete. Soglia riscatto 100 punti = €2. Tetto uso **30%** del carrello (finanza 20/7; playbook ammette 30–50%). Scadenza 12 mesi.
- Chi paga: il MARGINE MyCity, NON il negozio. Al riscatto il negozio incassa pieno; MyCity scala dal proprio take. Registro `punti_liability` (deferred), breakage a scadenza = ricavo.
- Bonus onboarding: nessun coupon nuovo (budget €0), riuso `BENVENUTO10` già a DB.
cosa cambia: ⚠️ impatto sistema — a 2% cashback erode ~17% delle commissioni (AOV €50 🟡: €1/ordine su €6 commissione). Break-even = +20% GMV incrementale. @finanza raccomanda **0% oggi**, **1% al lancio rete**.
se va bene: quando la rete arriva (≥5 negozi), la leva è scritta + copy pronta + firmabile in 2 minuti; misurata con holdout.
gate di lancio (5): (1) ≥5 negozi payout OK · (2) #41 ordine-prova PQ chiuso · (3) Stripe write · (4) % firmato @finanza · (5) copy senza % finché non firmato.
dettaglio: consegne/growth/2026-07-06-playbook-fedelta-di-rete.md + refresh `consegne/growth/2026-07-20-playbook-fedelta-di-rete-refresh.md` · bozze `consegne/content/2026-07-20-bozze-punti-giftcard-turno.md` · coda #44 in [[AZIONI-IN-ATTESA]].
stato: ⏸ ARMATO — refresh 20/7, nessun lancio finché il gate non è verde.

## A20 · 🎁 Vendi le Gift Card MyCity (incasso anticipato)
reparto: growth-monetizzazione → legale-privacy / contabilita
livello: 🔴 (incasso reale + passività fiscale — firma Nicola)
canale: pagina "Gift Card" sul marketplace (frontend-dev) + Stripe (incasso) + email/PDF "Regala Piacenza"
perche: Gift card digitali €10/€25/€50 spendibili su tutta la rete = incasso anticipato (cassa positiva upfront senza debito) + prodotto-regalo che porta clienti nuovi ("Regala Piacenza", welfare aziendale locale B2B). Il non-usato dopo scadenza = breakage → ricavo. Oggi: 1 negozio, Stripe sola lettura → nessuna vendita possibile.
preparato: 🚀 growth + ⚖️ legale-privacy (IVA/termini) + 🧾 contabilita (deferred revenue) + 🛡️ trust-safety (anti-frode) + 🧰 builder (mani) + ✍️ content-social (post «Regala Piacenza» 20/7)
meccanica:
- Incasso subito l'intero importo; il negozio è pagato SOLO al riscatto, sul venduto reale. Scadenza dichiarata in chiaro. Codici a uso singolo.
- Fiscale (da confermare @legale + @contabilita): spendibili su categorie a IVA diversa → buono MULTIUSO (art. 6-ter DPR 633/72) = IVA all'UTILIZZO, non all'emissione. Registro passività `giftcard_liability`.
- Anti-frode (@trust-safety): cap **€100/giorno/cliente**, blocco rivendita massiva, watch chargeback.
cosa cambia: entrano soldi veri oggi che poi girano nelle botteghe reali — non su Amazon. Ma serve il sì fiscale (IVA multiuso) e la mano Stripe write (oggi sola lettura) prima di vendere una sola card.
se va bene: carburante di cassa senza debito + un canale di acquisizione clienti nuovi (chi riceve il regalo scopre la rete).
gate di lancio: (1) parere @legale-privacy + @contabilita su IVA/termini · (2) Stripe write + generatore codici (@builder) · (3) tabella `gift_cards` + redemption al checkout · (4) ≥3 negozi evadibili (passività senza rete = rischio).
dettaglio: consegne/growth/2026-07-06-playbook-fedelta-di-rete.md (Parte B) + refresh 20/7 · bozze `consegne/content/2026-07-20-bozze-punti-giftcard-turno.md` · coda #45 in [[AZIONI-IN-ATTESA]].
stato: ⏸ ARMATO — refresh 20/7, nessuna vendita finché Stripe write e parere fiscale non ci sono.

## A21 · 🔎 SEO locale — allinea la vetrina di Pane Quotidiano al catalogo reale (refresh 20/7)
reparto: seo → tech (esecuzione config)
livello: 🟡 (config sul marketplace, backup per riga → reversibile)
canale: corsia CONFIG `node cervello/marketplace.mjs aggiorna profiles c0b240c0-2a86-4218-9d0f-5154f08ff929 '<json>'` (mai deploy, mai DB clienti)
perche: REST 20/7 11:04 — la `store_description` attuale cita **pane e miele** ma il catalogo live ha **5 prodotti** (2 kefir, pesto, hummus, pudding) e **0 SKU senza glutine**. Title/meta/schema derivano da quel campo (`layout.tsx`) → oggi Google vede testo **disallineato** dal negozio. Refresh keyword + testo allineato al catalogo verificato.
preparato: 🔎 seo — playbook refresh `consegne/seo/2026-07-20-playbook-seo-locale.md` (REST live + SERP spot-check)
le 5 ricerche ad alto intento (refresh 20/7, stime scala Piacenza):
  ① prodotti bio a domicilio Piacenza (~40–120/mese) → pagina PQ
  ② negozio dietetico Piacenza centro (~20–60) → pagina PQ
  ③ spesa bio online Piacenza (~30–90) → home + `/category/alimentari`
  ④ **kefir biologico Piacenza** (~15–45) → pagina PQ + 2 schede prodotto kefir — **sostituisce «senza glutine»** (0 SKU MyCity; soft claim solo GBP fisico se titolare conferma)
  ⑤ botteghe centro storico con consegna (~30–80) → pagina PQ (Via Calzolai)
campi da scrivere (l'esecutore fa PRIMA `node cervello/marketplace.mjs leggi`):
  store_description → «Pane Quotidiano: alimenti biologici e dietetici a Piacenza dal 1976, Via Calzolai 25 (centro). Kefir, pesto e prodotti bio — ordina online con consegna locale MyCity.» (≈158 char)
  store_address → già pieno «Via Calzolai, 25, 29100 Piacenza PC» — non toccare se invariato
  store_phone → già «0523388601» — ok
comando pronto:
```bash
node cervello/marketplace.mjs aggiorna profiles c0b240c0-2a86-4218-9d0f-5154f08ff929 '{
  "store_description": "Pane Quotidiano: alimenti biologici e dietetici a Piacenza dal 1976, Via Calzolai 25 (centro). Kefir, pesto e prodotti bio — ordina online con consegna locale MyCity."
}'
```
cosa cambia: meta title/description e schema.org PQ smettono di promettere pane/miele assenti e puntano su kefir/pesto/bio verificati — base per le 5 ricerche locali.
se va bene: prime impressioni Search Console su bio/dietetico/kefir Piacenza entro 90 gg; poi A22 (schema tecnico) e A23 (GBP).
dettaglio: `consegne/seo/2026-07-20-playbook-seo-locale.md` · approvazione originaria 6/7 ancora valida · esecuzione DB **non ancora fatta** (descrizione vecchia ancora live).
stato: PRONTA — refresh 20/7, aspetta esecuzione via Pannello/giro autorizzato.

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
dettaglio: consegne/seo/2026-07-20-playbook-seo-locale.md (§2-3) + consegne/seo/2026-07-06-playbook-seo-locale-PQ.md (§3). Coda canonica = riga #31 in [[AZIONI-IN-ATTESA]].
stato: PRONTA (specifica) — nessun codice scritto. Alla firma apro il branch. Priorità Product schema sui 2 kefir (keyword #4 refresh).

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
dettaglio: consegne/seo/2026-07-20-playbook-seo-locale.md (§2 keyword 1-2-5 + §6) + consegne/seo/2026-07-06-playbook-seo-locale-PQ.md (§4). Coda canonica = riga #32 in [[AZIONI-IN-ATTESA]].
stato: PRONTA — campi da compilare al via, nessuna pubblicazione fatta.

## A31 · 🔎 SEO categoria — ottimizza «Alimentari» per spesa bio online (branch marketplace)
reparto: seo → frontend-dev / tech
livello: 🟡 (patch meta/H1/copy in branch marketplace — mai deploy senza firma)
canale: branch `marketplace/` → `app/category/[slug]/layout.tsx` + JSON-LD `CollectionPage`/`ItemList`
perche: Keyword #3 «spesa bio online Piacenza» punta a `/category/alimentari` (5 SKU PQ, tutti bio). Oggi meta generici — quick win senza creare pagina «bio» thin (1 negozio).
preparato: 🔎 seo — testi pronti in `consegne/seo/2026-07-20-playbook-seo-locale.md` §4
title → `Alimentari biologici a Piacenza — Compra online dai negozi locali · MyCity`
meta (134 char) → `Alimentari bio e dietetici a Piacenza: kefir, pesto e prodotti biologici delle botteghe locali. Consegna a domicilio con MyCity.`
copy sotto griglia (2 frasi) → vedi playbook §4
cosa cambia: la categoria Alimentari intercetta «spesa bio online» senza doorway page; ItemList schema collega i 5 prodotti PQ.
se va bene: terzo pilastro SEO oltre pagina negozio (A21) e schema tecnico (A22); misurabile in Search Console su query categoria.
dettaglio: consegne/seo/2026-07-20-playbook-seo-locale.md §4
stato: PRONTA — specifica completa, nessun branch aperto.

## A17 · 🧡 Accendi il "porta un amico" (5€ a te, 5€ al tuo amico) e manda il primo invito
reparto: crm-lifecycle
livello: 🔴 (incentivo in denaro/credito reale)
canale: WhatsApp manuale (348 642 1766) o Email (Resend, oggi spento) + pagina `/profile/referral` già live
perche: Il loop give-get è GIÀ costruito nel codice (referrals mig.015, premio €5 su consegna mig.089, welcome €5 mig.029, no self-referral mig.092). Refresh verificato 20/7 11:36. Costo incrementale ≈€5 per cliente nuovo con ordine consegnato — vs Glovo referral 16€ + sconti catena -25/-40% (intelligence 20/7). Cap mensile proposto 250€ (≈25 conversioni) — da firmare.
preparato: 🔁 crm-lifecycle + 🛡️ trust-safety — `consegne/crm/2026-07-06-playbook-referral.md` + refresh `consegne/crm/2026-07-20-playbook-referral-refresh.md`
cosa cambia: si accende il referral e parte il primo invito a samir dopo ordine-prova PQ consegnato: 5€ a lui se un amico ordina e riceve, 5€ welcome all'amico. Anti-frode base in codice; a volume tetto 5 inviti/7g + clawback (🟡 branch).
se va bene: primo cliente porta un vicino → crescita organica a CAC ≈€5; base volano «un cliente ne porta un altro».
pre-condizioni: (1) ordine-prova PQ **Consegnato** (#16 annullato 3/7) · (2) A13 feedback 👍 · (3) firma Nicola €5+5€ + cap 250€/mese · (4) WhatsApp ok a mano OR Resend · (5) faro Pane Quotidiano. **Gate G1 oggi ❌** (0 consegnati, STATO 20/7). Rimando 9/7 «dopo primo negozio» superato — PQ live dal 1/7.
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
anti-frode (già in codice): premio solo su ordine CONSEGNATO (mig.089) · no self-referral (mig.092) · un premio per invitato · welcome ≥€10 (mig.029). A volume (🟡): tetto 5/7g, flag indirizzo/telefono, clawback rimborso.
stato: BOZZE PRONTE — NESSUN INVIO. Card [[AZIONI-IN-ATTESA]] **#referral-porta-un-amico** · refresh 20/7 11:36.

## A24 · 🛡️ Bollino «Negozio Verificato MyCity» — lo standard di fiducia della città
> (nato come «A18» nella coda del VPS: rinumerato A24 nella riconciliazione del 6/7 per collisione col A18 «scout 3 botteghe» — i vecchi rimandi «A18 bollino» puntano qui)
reparto: trust-safety (owner) · legale-privacy (claim) · content-social (bozze)
livello: 🟢 (definire lo standard — fatto) · 🔴 (assegnarlo/mostrarlo a video e annunciarlo — firma Nicola)
canale: vetrina negozio sul sito (bollino) + annuncio IG @mycity.piacenza/gruppi FB + messaggio al titolare
perche: La fiducia è il fossato di MyCity contro Glovo (che consegna da supermercati anonimi). Un bollino con 5 criteri verificabili — identità reale, negozio attivo, pagamenti sicuri, consegna provata, regole rispettate — dice al cliente «di questo negozio ti puoi fidare, ci mettiamo la faccia noi». Diventa lo standard d'ingresso per ogni negozio che entra live.
preparato: 🛡️ trust-safety + ⚖️ legale-privacy + ✍️ content-social — standard + refresh idoneità 20/7 in `consegne/trust-safety/2026-07-20-playbook-badge-negozio-verificato.md` (originale 6/7: `2026-07-06-badge-negozio-verificato.md`)
idoneità reale (2026-07-20 11:33 REST): **0 Verificati · 1 candidato = Pane Quotidiano** (3/5). ✅ P1 identità (Via Calzolai 25, tel.) · ✅ P2 approved + 5 prodotti `available` · ❌ P3 Stripe charges+payouts **OFF** · ❌ P4 **0** consegnati (1 ordine CANCELED 24/6) · 🟡 P5 contratto firmato 1/7 [DOC], consensi DB nulli. Casa Linda = demo suspended (esclusa). Garetti/Peretti/Amendolara = prospect (non nel DB).
cosa cambia: lo standard è pronto e onesto (0 badge finti oggi); al **1° ordine consegnato + payout ON** PQ diventa il 1° Negozio Verificato di Piacenza — combacia con `#ordine-test-pq` e North Star 0→1.
se va bene: rito onboarding (payout → catalogo → 1ª consegna → bollino); annuncio «standard cittadino» solo dopo il fatto; gate codice #51 chiude il bug «badge su tutti».
pre-condizioni: (1) 🔴 annuncio pubblico SOLO con ≥1 verificato reale · (2) 🔴 bollino su PQ = ok Nicola · (3) 🟡 mergia #51 prima (altrimenti il sito mente) · (4) 🟡 flag `verified` + CONFIG tooltip.
testo (annuncio pubblico · 🔴 · bozza — vedi A39 step 4):
[HOOK] A Piacenza è nato un bollino che prima non c'era: Negozio Verificato.
[CORPO] … Il primo a guadagnarselo è **Pane Quotidiano** — gente vera, non un magazzino fuori città.
[CTA] 👉 Cerca il bollino 🛡️ quando fai la spesa su MyCity.
[FIRMA] La spesa che tiene viva la città. — MyCity Piacenza · VOLTI, NON ALGORITMI
stato: STANDARD CONFERMATO (🟢 refresh 20/7) — assegnazione + annuncio IN ATTESA (coda #38 · sequenza A39 · gate #51).

## A39 · 🛡️ Sequenza «primo Negozio Verificato» — esegui quando PQ fa 5/5
reparto: trust-safety → tech → content-social
livello: 🔴 (assegnazione + comunicazione) · 🟡 (gate codice prima)
canale: marketplace (flag + bollino) · WhatsApp titolare · IG/FB
perche: Il badge vale solo se guadagnato e mostrato onestamente. Oggi il sito mostra «Verificato» a tutti (bug #51) — chiudere prima, poi celebrare PQ.
trigger: Pane Quotidiano passa **5/5 pilastri** (REST: payouts ON + ≥1 ordine DELIVERED + resto già ok).
sequenza:
  1 · 🟡 Mergia **#51** (gate `isVerifiedStore` su tutti i punti badge) — PR marketplace in branch
  2 · 🔴 Imposta flag verified su profilo PQ + bollino visibile (backend-dev + frontend-dev/CONFIG)
  3 · 🔴 WhatsApp titolare: «siete il primo Negozio Verificato di Piacenza» (testo in A24 / consegne 20/7 §4a)
  4 · 🔴 Pubblica annuncio standard città (testo A24 §4b) su IG + gruppi FB locali
cosa cambia: nasce il segnale di fiducia visibile — differenzia MyCity da delivery anonimo; PQ diventa faro per Garetti/Peretti/Amendolara.
se va bene: ogni nuovo negozio replica il rito 30 giorni; clienti cercano il bollino 🛡️ prima di ordinare.
pre-condizioni: mai saltare step 1 · mai annunciare con 0 verificati · claim validato @legale-privacy (in doc 20/7).
stato: ARMATA — parte al via di #38 / dopo `#ordine-test-pq` + payout PQ. Dettaglio: `consegne/trust-safety/2026-07-20-playbook-badge-negozio-verificato.md` §5.

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

## A28 · 📣 Post del giorno "La vera stella della colazione" (Pane Quotidiano · kefir bio)
reparto: content-social
livello: 🔴 (pubblicazione — la bozza 🟢 è già fatta)
canale: IG feed @mycity.piacenza + storia 9:16 + gruppi FB locali ("Sei di Piacenza se…", "Piacenza Mia")
perche: Post del giorno 14/7 sul faro reale. Angolo **prodotto-eroe** (swipe #2 Cortilia "la vera stella in uso") — colazione fresca estiva senza uscire col caldo. Complementare a pesto/temporali (1/7) e rubrica lunedì (6/7). Domanda-ghigliottina "poteva farlo Amazon?" → no.
preparato: ✍️ content-social (sintesi AD) — gate ONESTA passato su numeri commerciali (kefir fonte REST 1/7, 1976 fonte pubblica, 0 testimonianze)
contenuto pronto: consegne/content/2026-07-14-post-del-giorno-kefir-caldo-PQ.md
cosa cambia: esce post estivo sul negozio reale Pane Quotidiano — prodotto verificato, colazione a domicilio, costo ≈0 reach gruppi locali.
se va bene: primi iscritti via UTM `kefir_estate_1407`; PQ può ripubblicare ai suoi clienti.
testo (hook IG):
☀️ Estate a Piacenza: la colazione fresca la fai da casa. Te la portiamo noi. La vera stella di questa mattina? Il Kefir di latte di capra bio — Pane Quotidiano, Via Calzolai, bio dal 1976. 👉 Fai il tuo turno — link in bio.
visual: prodotto in uso (vasetto kefir + frutta, luce mattutina) oppure tipografico neutro su palette brand — pubblicabile subito senza foto.
pre-condizioni: (1) link reale lista d'attesa in bio/1° commento UTM kefir_estate_1407 · (2) foto kefir reale o ok visual tipografico · (3) versione col prodotto in foto = ok titolare se boost. Coda canonica = riga #138 in [[AZIONI-IN-ATTESA]].
stato: IN ATTESA DI FIRMA NICOLA.

## A29 · 📣 Post del giorno "Domenica sera: fai il turno per la settimana" (Pane Quotidiano)
reparto: content-social
livello: 🔴 (pubblicazione — la bozza 🟢 è già fatta)
canale: IG feed @mycity.piacenza + storia 9:16 + gruppi FB locali ("Sei di Piacenza se…", "Piacenza Mia")
perche: Post del giorno 19/7 (domenica sera). Angolo **rubrica + utilità settimana** (swipe #4 BTS "dietro la saracinesca" + rubrica fissa) — prepari la spesa stasera, ricevi lunedì. **Non duplica:** kefir 14/7 (colazione) · pioggia 20/7 (in coda domani) · VP 17/7 (scaduto). Domanda-ghigliottina "poteva farlo Amazon?" → no.
preparato: ✍️ content-social (sintesi AD) — gate ONESTA passato (1976 fonte pubblica, prodotti da catalogo REST, 0 numeri MyCity, 0 testimonianze)
contenuto pronto: consegne/content/2026-07-19-post-del-giorno-domenica-settimana-PQ.md
cosa cambia: esce il post della domenica sera sul negozio reale — spinta ordini/lista nel momento in cui la gente pianifica la settimana.
se va bene: click marketplace via UTM `domenica_settimana_1907`; PQ può ripubblicare; complementa il post pioggia di domani mattina.
testo (hook IG):
🌙 Domenica sera a Piacenza: prepari la settimana, noi portiamo i freschi. Pane Quotidiano — bio dal 1976, Via Calzolai. Ordini stasera, lunedì te la portiamo al mattino. 👉 Fai il tuo turno — link in bio.
visual: tipografico serale su palette brand ("DOMENICA SERA · FAI IL TUO TURNO PER LA SETTIMANA") = pubblicabile subito; foto PQ = ok titolare.
pre-condizioni: (1) link marketplace in bio/1° commento con UTM domenica_settimana_1907 · (2) pubblicare entro le 21:00 di oggi · (3) foto reale = ok titolare se boost. Coda canonica = #post-domenica-settimana-1907 in [[AZIONI-IN-ATTESA]].
stato: IN ATTESA DI FIRMA NICOLA.

## A30 · 💚 Playbook anti-churn — ri-verifica 19/7 (0 negozi in calo, retention PQ puntata)
reparto: account-negozi
livello: 🟢 (scan sola lettura) · 🟡 (check-in reale = firma Nicola)
canale: REST Supabase + coda `#checkin-pq-postvp` (telefono/WhatsApp)
perche: **Playbook anti-churn RIPROVA 19/7 13:05 — verdetto onesto: 0 negozi con ordini in calo.** 1 solo negozio reale (Pane Quotidiano), 0 ordini consegnati, nessun trend −40% calcolabile. PQ **non è churn** (Nicola 6/7: attesa concordata). VP 17/7 passato senza ordini → il rischio è **no-value realized**, non abbandono post-vendita.
preparato: 💚 account-negozi — report `consegne/account-negozi/2026-07-19-antichurn-playbook.md`
cosa cambia: nessuna nuova telefonata anti-churn (evita doppione #25/#29). La mossa giusta è il debrief post-VP già in coda.
se va bene: capisci com'è andato venerdì al banco, pianifichi primo ordine reale (#ordine-test-pq) con finestra piogge lun 20/7.
retention_già_in_coda: `#checkin-pq-postvp` in [[AZIONI-IN-ATTESA]] · tel. **0523 388601** · script 2 min in coda
non-duplicato: non tocca #25/#29 (chiuse) · non riapre #antichurn-13lug (scaduta) · prospect Garetti/Peretti/Amendolara = vendite, non anti-churn
stato: SCAN ✅ — azione retention = firma `#checkin-pq-postvp` (🟡 lun 20/7 o WhatsApp weekend)

## A32 · 🔁 Win-back dormienti — ri-verifica 20/7 (0 destinatari, sequenza armata)
reparto: crm-lifecycle
livello: 🟡 (Touch #1 «ci manchi», €0) · 🔴 (Touch #2 consegna offerta ~€4 o SPED5)
canale: Email Resend (dominio ok — invio marketing = firma Nicola)
perche: **Playbook win-back 20/7 11:15 — coorte win-back VUOTA.** REST live: **4 buyer**, **1 ordine** (CANCELED, mai consegnato), **0** `DELIVERED` → **0 dormienti** per definizione (≥1 consegnato + 14 gg fermo). I 4 buyer sono **attivazione primo ordine** (#welcome-email-23 + A3 samir), non win-back.
preparato: 🔁 crm-lifecycle — pacchetto `consegne/crm/2026-07-20-playbook-win-back-pronte.md` (aggiorna base 6/7 con PQ faro + coupon live)
cosa cambia: nessuna email win-back oggi (corretto). Sequenza pronta: mail #1 relazionale €0 → mail #2 **consegna offerta cap ~€4** oppure **SPED5** (€5 sopra €25, già in DB, `first_order_only=false`) → telefonata se ≥2 ordini storici. **Budget €0:** nessun coupon nuovo · **BENVENUTO10 escluso** (first_order_only).
se va bene: dopo `#ordine-test-pq` consegnato, il primo cliente fermo 14 gg entra in coorte → Nicola firma Touch #1 🟡 → se muto, Touch #2 🔴.
anti-doppione: samir → **A3** carrello (AR-008) · welcome 4 buyer → **#welcome-email-23** · coda canonica win-back = riga **#42** [[AZIONI-IN-ATTESA]]
gate (tutti ❌ oggi): dormiente reale · consenso marketing (3/4 false) · firma incentivo 🔴
testo (Touch #1 — anteprima):
Oggetto: [Nome], è un po' che non ti portiamo niente 💛
Ciao [Nome], è un paio di settimane che non ci vediamo. Pane Quotidiano (Via Calzolai, bio dal 1976) prepara sempre fresco. 👉 Torna da Pane Quotidiano — rispondi se qualcosa non andò bene. Nicola — MyCity.
testo (Touch #2 — solo se ancora fermo · 🔴):
Oggetto: [Nome], la prossima consegna la offro io 🚲
Consegna offerta sul prossimo ordine da Pane Quotidiano — oppure codice SPED5 (€5 sopra €25). Una volta per cliente. Firma Nicola.
stato: ARMATO DRY-RUN — 0 invii · trigger = 1ª consegna PQ + 14 gg fermo

## A33 · 💚 Playbook anti-churn — ri-verifica 20/7 (0 negozi in calo, retention PQ puntata)
reparto: account-negozi
livello: 🟢 (scan sola lettura) · 🟡 (check-in reale = firma Nicola)
canale: REST Supabase + coda `#checkin-pq-postvp` (telefono/WhatsApp)
perche: **Playbook anti-churn 20/7 11:17 — verdetto onesto: 0 negozi con ordini in calo.** 1 solo negozio reale (Pane Quotidiano), 0 ordini consegnati, nessun trend −40% calcolabile. PQ **non è churn** (Nicola 6/7: attesa concordata). VP 17/7 passato senza ordini → il rischio è **no-value realized** (~26 gg stallo), non abbandono post-vendita.
preparato: 💚 account-negozi — report `consegne/account-negozi/2026-07-20-antichurn-playbook.md`
cosa cambia: nessuna nuova telefonata anti-churn (evita doppione #25/#29). La mossa giusta è il debrief post-VP già in coda.
se va bene: capisci com'è andato venerdì al banco, pianifichi primo ordine reale (#ordine-test-pq) con finestra piogge oggi.
retention_già_in_coda: `#checkin-pq-postvp` in [[AZIONI-IN-ATTESA]] · tel. **0523 388601** · script 2 min in coda
non-duplicato: non tocca #25/#29 (chiuse) · non riapre #antichurn-13lug (scaduta) · prospect Garetti/Peretti/Amendolara = vendite, non anti-churn · supersede scan A30 (19/7)
stato: SCAN ✅ — azione retention = firma `#checkin-pq-postvp` (🟡 **oggi 20/7 mattina**, card scaduta nel timing)

## A34 · 📊 Report dati MyCity per Pane Quotidiano — stampo + anteprima pre-revenue
reparto: account-negozi (+ analista)
livello: 🟢 (report generato, sola lettura) · 🔴 (consegna al titolare = firma Nicola)
canale: WhatsApp / email / di persona al fornaio (0523 388601)
perche: **Playbook Dati-come-servizio 20/7 11:22 — MyCity può regalare al negozio insight che dal banco non vede.** Oggi **0 ordini DELIVERED** → sezioni venduto/orari/ritorno **vuote per onestà**; c’è però segnale debole reale (samir: pesto+2 kefir €10) + pudding mai in carrello. **Gate consegna:** `#ordine-test-pq` — prima non c’è transato da mostrare.
preparato: 💚 account-negozi + 📊 analista — `consegne/account-negozi/2026-07-20-playbook-dati-come-servizio.md` (query schema corretto `seller_id`/`total_price`)
cosa cambia: il fornaio riceve (dopo il 1° ordine) un mini-report mensile: cosa tira online, fascia oraria domanda a domicilio, chi torna, carrelli persi. Oggi = anteprima del servizio + leva retention.
se va bene: al primo ordine consegnato rigeneri il report con numeri veri e lo mandi come «regalo MyCity»; poi mensile automatico; a ≥5 negozi tier premium (@growth-monetizzazione).
gate (❌ oggi): ≥1 ordine `DELIVERED` su PQ · `#ordine-test-pq` chiuso
testo (anteprima onesta — da inviare SOLO post-1° ordine · 🔴):
Ciao [nome], ogni mese MyCity ti manda cosa vendi *online*, a che ora ordinano a domicilio e chi torna — dal banco non lo vedi. Questo mese: [TOP] · fascia [GIORNO/ORA] · [N] clienti di ritorno · €[Y] in carrelli recuperabili. Prossimo report tra 30 giorni. Nicola — MyCity.
stato: STAMPO ✅ + mini-report pre-revenue ✅ — **zero consegne al titolare** finché North Star = 0 · coda canonica = **#50** [[AZIONI-IN-ATTESA]]

## A35 · 📍 Kit capillarità Pane Quotidiano — asset pronti, stampa gated
reparto: designer → vendite
livello: 🟢 (template + istanza PQ prodotti) · 🔴 (preventivo tipografia + stampa + posa fisica)
canale: tipografia locale Piacenza + posa a mano in negozio (Via Calzolai 25)
perche: **Playbook Capillarità 20/7 11:24** — unico negozio `confermato` (PQ). Kit fisico = ogni vetrina e ogni sacchetto diventa cartellone MyCity. Prospect Garetti/Peretti/Amendolara = solo template neutri (AR-006), nessun pacchetto intestato.
preparato: 🎨 designer + 🤝 vendite — refresh `consegne/vendite/2026-07-20-playbook-capillarita.md`
asset_pronti:
  · Template neutri: `creativi/output/kit-capillarita/` (6 file: A5, vetrofania, adesivo tondo, 2 sacchetti, QR home PNG)
  · Istanza PQ: `creativi/output/capillarita/` (A5 cassa + vetrofania SVG + `qr-pane-quotidiano.png`)
  · URL QR verificato live HTTP 200: `https://mycity-marketplace.com/store/c0b240c0-2a86-4218-9d0f-5154f08ff929/pane-quotidiano?utm_source=qr&utm_medium=vetrina&utm_campaign=qr-pane-quotidiano`
cosa_cambia: nessuna spesa oggi — i file vanno in tipografia solo dopo firma 🔴. Quando stampi e posi, ogni cliente in vetrina può ordinare PQ da telefono.
se_va_bene: PQ ha QR in cassa + vetrofania → tracciamento UTM → primi ordini da vetrina; al 2° negozio firmato basta istanziare il template neutro in 2 min.
gate_stampare:
  · PQ **evadibile** (`#ordine-test-pq` chiuso) — NON stampare prima (brucia prima impressione)
  · ok titolare PQ per posa vetrina
  · preventivo tipografia (~€80–150 stimati, 1 colore terracotta)
leva_finanziamento: ⛔ bando «Vita in Centro 50% materiali» **inesistente** (A1 ritirata 6/7) · alternativa: **PI26 CCIAA** 50% digitalizzazione (scade 30/7) — `#bandi-cciaa-2007`
coda_canonica: **#48** stampa+posa PQ · **#49** semina città (≥3 negozi evadibili)
stato: ASSET ✅ — stampa ⏸ gated su `#ordine-test-pq`

## A36 · 📣 Post del giorno "Lunedì mattina: il turno è già iniziato" (Pane Quotidiano)
reparto: content-social
livello: 🔴 (pubblicazione — la bozza 🟢 è già fatta)
canale: IG feed @mycity.piacenza + storia 9:16 + pagina FB (+ gruppi FB se non già coperti da #post-meteo-pioggia-20lug)
perche: Post del giorno 20/7 (playbook worker). Angolo **BTS mattutino** (swipe #4 "dietro la saracinesca" + #3 volto bottega) — qualcuno è già al banco mentre la città si sveglia. **Non duplica:** kefir 14/7 · domenica settimana 19/7 · pioggia 20/7 (gruppi). Domanda-ghigliottina "poteva farlo Amazon?" → no.
preparato: ✍️ content-social (sintesi AD) — gate ONESTA passato (1976 fonte pubblica, prodotti catalogo REST, 0 numeri MyCity, 0 testimonianze)
contenuto pronto: consegne/content/2026-07-20-post-del-giorno-lunedi-turno-mattina-PQ.md
cosa cambia: esce post lunedì sul negozio reale — motore Volti + Il Turno, fascia pranzo/pausa lavoro.
se va bene: click marketplace via UTM `lunedi_turno_2007`; PQ può ripubblicare; complementa post pioggia (gruppi) e recupero domenica (#post-domenica-settimana-1907).
testo (hook IG):
☀️ Lunedì mattina a Piacenza: qualcuno è già al lavoro per te. Pane Quotidiano — bio dal 1976, Via Calzolai. Il fornaio ha già alzato il turno. Tu il tuo lo fai da casa. 👉 Fai il tuo turno — link in bio.
visual: tipografico mattutino su palette brand ("LUNEDÌ · IL TURNO È GIÀ INIZIATO") = pubblicabile subito; foto interno bottega = ok titolare.
pre-condizioni: (1) link marketplace in bio/1° commento UTM lunedi_turno_2007 · (2) timing 11:00–14:00 · (3) foto reale = ok titolare se boost. Coda canonica = #post-lunedi-turno-mattina-2007 in [[AZIONI-IN-ATTESA]].
stato: IN ATTESA DI FIRMA NICOLA.

## A37 · 📰 Comunicato stampa PI26 + invio Libertà (botteghe del centro)
reparto: pr-stampa
livello: 🟢 (playbook + comunicato + pitch pronti) · 🔴 (invio email a redazioni — firma Nicola)
canale: email redazione Libertà (+ Telelibertà) → poi PiacenzaSera / Piacenza24 / IlPiacenza
perche: PLAYBOOK Stampa worker 20/7. Angolo **PI26 a sportello oggi** (attualità forte) + MyCity chiede fondi per digitalizzare botteghe del centro — eroe = bottega/città, non l'app. Onestà: 1 negozio (Pane Quotidiano), 0 ordini completati, 4 buyer (MAI "23 iscritti").
preparato: 📰 pr-stampa — comunicato 1 pagina + 5 contatti + 2 pitch in `consegne/pr/2026-07-20-playbook-stampa-settimana.md`
cosa cambia: parte l'earned media locale — Libertà prima (esclusiva), online dopo 48h.
se va bene: articolo/TG → reach 25–40k gratis → commercianti e cittadini scoprono MyCity + bando PI26.
testo (oggetto Libertà):
Esclusiva Libertà: bando PI26 aperto oggi — un piacentino digitalizza le botteghe del centro (parte dal Pane Quotidiano)
pre-condizioni:
  · **Prima** domanda PI26 inviata (`#bandi-cciaa-2007`)
  · Ok scritto titolare PQ per citazione (altrimenti versione senza nome)
  · Numero/email stampa + nomi giornalisti ri-verificati
  · Timing: martedì/mercoledì mattina 8–10 (dopo PI26)
coda_canonica: **#invio-comunicato-stampa-pi26-2007** in [[AZIONI-IN-ATTESA]]
stato: BOZZE PRONTE — NESSUN INVIO.

## A38 · 🏛️ Playbook Istituzioni 20/7 — bandi verificati + 2 mail Hub + kit negozi
reparto: relazioni-istituzionali + finanza-agevolata
livello: 🟢 (verifica + bozze) · 🔴 (invio mail Comune/Unione + domanda PI26 MyCity)
canale: email istituzionale + restart.infocamere.it + kit WhatsApp negozi
perche: PLAYBOOK Istituzioni worker 20/7 11:30. **PI26/BT26 a sportello ORA** (scade 30/7). Bando ER Regione **chiuso** (350 domande). Nessun bando comunale «rimborso materiali».
preparato: 🏛️ relazioni-istituzionali — `consegne/relazioni-istituzionali/2026-07-20-playbook-bandi-mail-istituzioni.md` + kit `2026-07-20-kit-bandi-cciaa-negozi-1pagina.md`
bandi_aperti_oggi:
  · **PI26** 50% max €10k — digitalizzazione (MyCity + negozi) — 20/7 10:00 → 30/7 16:00
  · **BT26** 40% max €7k — riqualificazione punto vendita (botteghe retail/food)
  · **BE26** solo se spese energetiche — ignorare per MyCity
bandi_chiusi_non_citare:
  · Bando Commercio ER FESR (esaurito giugno) · «Vita in Centro 50% materiali» (inesistente)
cosa_cambia: mail Hub aggiornate con leva PI26 (non bando ER 21/7); ogni pitch negozio ha scheda bandi 1 pagina.
se_va_bene: Comune/Unione aprono pilota Hub → onboarding 3–5 botteghe con bando CCIAA; MyCity incassa rimborso PI26.
testo (mail #1 Comune — oggetto):
MyCity al servizio dell'Hub Urbano — digitalizzazione botteghe + bando Camera a sportello (scade 30/7)
testo (mail #2 Unione — oggetto):
MyCity per i soci dell'Hub — vendita online + consegna, e una mano sul bando PI26 (scade 30/7)
destinatari:
  · Comune: margherita.maini@comune.piacenza.it · PEC suap@cert.comune.piacenza.it
  · Unione Commercianti: direzione@unionecommerciantipc.it · 0523 461852
pre-condizioni:
  · Firma reale Nicola (tel/email/sito) al posto dei segnaposto
  · Esempio citato: **Pane Quotidiano** only (AR-006)
  · **Prima** domanda PI26 MyCity (`#bandi-cciaa-2007`) — poi mail/comunicato stampa
coda_canonica: **#52** (2 mail Hub) · **#bandi-cciaa-2007** (PI26 MyCity) · **#bandi-cciaa-kit** ✅ kit negozi · **#whatsapp-3-anchor-pi26**
raccomandazione_ad: gate #52 (parcheggiata 9/7) **sbloccabile** — PQ è online; leva PI26 scade tra 10 giorni.
stato: PRONTO — zero mail inviate.
