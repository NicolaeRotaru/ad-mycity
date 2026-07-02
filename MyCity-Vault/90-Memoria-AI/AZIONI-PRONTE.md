---
tipo: azioni-pronte
fonte: AD digitale
aggiornato: 2026-07-01 12:03
nota: "La corsia operativa. Ogni blocco è una mossa pronta a partire. Formato: '## ID · Titolo', poi campi 'chiave: valore', poi 'testo:' e sotto l'anteprima fino al blocco successivo."
---

# ⚡ Azioni pronte

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

## A3 · 🛒 Recupero carrelli — indice playbook 1/7 12:15
reparto: crm-lifecycle
livello: 🟡
canale: Email Resend (DRY-RUN)
perche: 4 carrelli >4h live (REST 12:00). 1 solo buyer reale (samir, Pane Quotidiano €10). RPC cron = 0 righe (flag recovery già settato a giugno).
preparato: 🔁 crm-lifecycle · dossier `consegne/crm/2026-07-01-playbook-recupero-carrelli.md`
origine: playbook:recupero-carrelli
testo:
Riepilogo: A8 = invio reale samir (touch #1 🟡) · A9–A11 = skip demo/admin.
Codici DB attivi: BENVENUTO10 (10% 1° ordine) · SPED5 (€5 sopra €25). TORNA5 non esiste — non usare.

## A8 · 🛒 Recupero carrello — samir? (Pane Quotidiano €10) · TOUCH #1
reparto: crm-lifecycle
livello: 🟡
canale: Email Resend → destinatario UUID `57494b3e-fd67-4379-8b9c-90e40e39ff06` (email da auth.users / admin dashboard)
perche: Unico buyer reale con carrello fermo 348h (3 prodotti bio PQ, €10). Ha raggiunto /checkout da iPhone. Nessun ordine completato.
preparato: 🔁 crm-lifecycle · `consegne/crm/2026-07-01-playbook-recupero-carrelli.md` §Cliente #1
origine: playbook:recupero-carrelli
codice: *(nessuno — reminder puro)*
blocco_invio: email_marketing=false → validare con @legale-privacy se transazionale o opt-in prima dell'invio
testo:
Oggetto: Hai lasciato qualcosa da Pane Quotidiano 🛒
Ciao,
hai messo nel carrello da Pane Quotidiano tre prodotti bio — pesto e kefir — e poi ti sei distratto. Capita.
Sono ancora lì: Pesto Genovese Bio €5 · Kefir capra €2,95 · Kefir Berchtesgadener €2,05 — Totale €10 (+ consegna).
Te li portiamo a mano, paghi alla consegna se preferisci.
👉 Completa il tuo ordine: https://mycity-marketplace.com/cart
Se qualcosa ti ha bloccato, rispondi a questa mail: ti aiuto io.
Nicola — MyCity

## A9 · 🛒 Recupero carrello — samir? · TOUCH #2 (con codice)
reparto: crm-lifecycle
livello: 🔴
canale: Email Resend (solo se A8 non converte entro 24h)
perche: Secondo touch con incentivo primo ordine (~€1 di sconto). Allineato a FLUSSI §6.2 e AZIONI-IN-ATTESA §crm carrello #2.
preparato: 🔁 crm-lifecycle · stesso dossier §Cliente #1 touch #2
origine: playbook:recupero-carrelli
codice: BENVENUTO10
testo:
Oggetto: Ti tengo €1 di sconto sul carrello 🧡
Ciao, il carrello da Pane Quotidiano è ancora qui — pesto e kefir bio, €10 di prodotti.
Usa BENVENUTO10 al checkout: 10% sul primo ordine (~€1 in meno).
👉 https://mycity-marketplace.com/cart
Nicola — MyCity

## A10 · ⏭️ SKIP carrello — Assistenza MyCity (admin test €7,95)
reparto: crm-lifecycle
livello: 🟢
canale: —
perche: Account admin piattaforma (`admin@piacenza-demo.local`), non cliente. Carrello test Pane Quotidiano dal 24/6.
preparato: 🔁 crm-lifecycle · playbook 1/7 12:00
origine: playbook:recupero-carrelli
testo:
NON INVIARE — account interno. Carrello: 3 prodotti PQ, €7,95.

## A11 · ⏭️ SKIP carrelli demo — Casa Linda + Pane Quotidiano seller
reparto: crm-lifecycle
livello: 🟢
canale: —
perche: Seed demo (`casa.linda@piacenza-demo.local`) e auto-test negoziante PQ (€17,80 + €13,90). Non sono clienti.
preparato: 🔁 crm-lifecycle · playbook 1/7 12:00
origine: playbook:recupero-carrelli
testo:
NON INVIARE — 2 account demo/seller. Dettaglio in consegne/crm/2026-07-01-playbook-recupero-carrelli.md.

## A4 · ⭐ Caccia recensioni — indice playbook 1/7 12:03
reparto: customer-success
livello: 🟡
canale: WhatsApp / email / in-app (DRY-RUN)
perche: Playbook recensioni giornaliero. REST 12:03: 0 consegne completate, 0 recensioni — nessun sollecito oggi. Bozze pronte per la prima consegna (#16 Pane Quotidiano €19,05).
preparato: 🤗 customer-success · dossier `consegne/customer-success/2026-07-01-playbook-recensioni.md`
origine: playbook:recensioni
testo:
Riepilogo: 0 consegne senza recensione oggi · A13–A14 = sequenza post-consegna ordine #16 (partono DOPO `ok 16` + consegna) · A15 = skip.
Regola: recensione solo se feedback ≠ negativo (FLUSSI §3).

## A5 · ⭐ Risposta a una recensione bassa
reparto: supporto
livello: 🟡
canale: Risposta pubblica alla recensione + contatto privato
perche: Una risposta garbata e una soluzione privata recuperano il cliente e migliorano la reputazione.
preparato: 🎧 supporto + 🛡️ trust-safety
testo:
Ciao, ci dispiace per l'esperienza: non è lo standard che vogliamo. Ti abbiamo scritto
in privato per sistemare subito. Grazie per il feedback, ci aiuta a migliorare.

## A6 · 📞 Check-in anti-churn — Pane Quotidiano (ordine bloccato 7g)
reparto: account-negozi
livello: 🟡
canale: Telefono / WhatsApp — titolare Pane Quotidiano (0523 388601)
perche: Unico negozio REALE: ordine COD €19,05 del 24/6 fermo in NEW/PENDING da 7 giorni. Rischio churn «non vendo qui» se il titolare non vede la prima consegna. Allineato a #16 (Scelta A firmata 11:05).
preparato: 🤝 account-negozi + 🛵 operations
origine: playbook:negozi-calo
testo:
Ciao, sono [Nicola/MyCity]. Vi scrivo perché il 24 giugno è arrivato il vostro primo ordine
su MyCity — €19,05 in contrassegno — e ci scusiamo: è rimasto in sospeso per un ritardo
NOSTRO di piattaforma, non vostro.

Oggi lo chiudiamo noi: lo accettiamo in dashboard, organizziamo la consegna al cliente e
a consegna completata vi portiamo l'incasso (payout test giovedì 3/7 mattina).

Vi chiamo oggi pomeriggio — vi va bene verso le [ORA]? Mi serve solo 2 minuti: conferma
che l'ordine è pronto da preparare quando passiamo. Grazie per la pazienza, contiamo su di
voi come bottega faro del quartiere.

## A7 · 🌾 Upsell post-prima-consegna — Pane Quotidiano (kefir + pesto)
reparto: account-negozi
livello: 🟢
canale: Messaggio dopo prima consegna completata (WhatsApp o di persona)
perche: Dopo la prima consegna (#16) espansione catalogo = retention. Avete già 5 prodotti bio online; kefir e pesto sono i più cercati nel settore — zero attrito, proposta fatta da noi.
preparato: 🤝 account-negozi
origine: playbook:negozi-calo
testo:
Complimenti per la prima consegna MyCity! Ho visto che online avete già kefir e pesto bio —
ottimo. Se avete altri 2-3 prodotti da banco che vendete spesso (pane integrale, focaccia…),
mandatemi 2 foto e il prezzo: **te li carico io** entro oggi. Così la prossima spesa del
quartiere passa anche da lì.

## A12 · ✍️ Post del giorno — Pesto bio + temporali ("Fai il tuo turno")
reparto: content-social
livello: 🔴
canale: Instagram + Facebook feed + Storie + gruppi FB locali ("Sei di Piacenza se…", "Piacenza Mia")
perche: Playbook contenuto del giorno 1/7. Finestra meteo reale: temporali pomeridiani oggi (STATO 11:52). Unico negozio LIVE = Pane Quotidiano. Angolo Cortilia "la vera stella" + piattaforma "Il Turno" — prodotto vero, zero citazioni inventate.
preparato: ✍️ content-social · dossier `consegne/content/2026-07-01-playbook-contenuto-giorno.md`
origine: playbook:contenuto-giorno
cambia: Il post esce su IG, FB e gruppi locali entro le 14:00: cavalca i temporali di oggi e mette in luce Pane Quotidiano (pesto bio €5) con CTA ordine su mycity-marketplace.com.
seguito: Se arrivano click/ordini, domani secondo post "Il nostro bottegaio" con foto reale PQ; @designer renderizza PNG da brief (Playwright assente oggi).
testo:
CAPTION IG/FB:
☔ Temporali stasera? La cena la fai da casa. La spesa te la portiamo noi.
La vera stella di questa cena veloce? Il Pesto Genovese Bio — quello di Pane Quotidiano, in Via Calzolai. Bio/dietetica in città dal 1976.
Pasta fresca, due cucchiai di pesto, fine. Niente code sotto la pioggia. Paghi alla consegna se preferisci.
👉 Fai il tuo turno: ordina da Pane Quotidiano su MyCity — link in bio / primo commento.
La spesa che tiene viva la città. · @mycity.piacenza

GRUPPI FB (tono locale):
Stasera temporali in arrivo — chi ha voglia di uscire a fare la spesa?
Pane Quotidiano (Via Calzolai, bio dal '76): pesto e kefir bio ordinabili su MyCity. Te li portiamo a casa, paghi alla consegna.
Link nel primo commento → https://mycity-marketplace.com

VISUAL (brief per designer):
1080×1350 · metà alto = cielo/temporali · metà basso = barattolo pesto bio [FOTO PESTO PQ] · hook "La vera stella di stasera?" · badge "Fai il tuo turno da casa" · footer brand @mycity.piacenza
Template: cervello/content-factory/templates/consiglio-mercoledi.html

## A13 · 💬 Feedback post-consegna — ordine #16 Pane Quotidiano · TOUCH #1
reparto: customer-success
livello: 🟡
canale: WhatsApp → 348 642 1766 · backup email/in-app
perche: Prima transazione reale MyCity. Touch +3h da `Consegnato` — intercetta problemi prima del reclamo e abilita Touch #2 recensione solo se 👍.
preparato: 🤗 customer-success · `consegne/customer-success/2026-07-01-playbook-recensioni.md` §Touch 1
origine: playbook:recensioni
blocco_invio: partire SOLO dopo esecuzione #16 (ordine consegnato e segnato in dashboard)
cambia: Il buyer riceve messaggio di cortesia post-consegna su WhatsApp: chiede se pesto/kefir/hummus da Pane Quotidiano sono ok e apre canale per problemi.
seguito: Se 👍 → A14 domani · se 👎 → @supporto, niente recensione finché non risolto · telefonata concierge (+2–4h) ha priorità su questo messaggio.
testo:
Ciao! Sono Nicola di MyCity 👋
Ti è arrivata la spesa da Pane Quotidiano? Spero pesto e kefir siano come al banco.
Siamo appena nati e ogni tua parola conta. Com'è andata?
👍 Tutto bene · 😐 Così così · 👎 C'è stato un problema
Se qualcosa non va, rispondi qui: lo sistemo io oggi stesso.
Grazie per aver scelto la bottega del quartiere 🧡

## A14 · ⭐ Richiesta recensione — ordine #16 · TOUCH #2
reparto: customer-success
livello: 🟡
canale: WhatsApp → 348 642 1766 · backup email/in-app
perche: Picco di felicità +1 giorno dopo feedback positivo. Prima recensione verificata MyCity (legata a order_id reale) = social proof per il lancio.
preparato: 🤗 customer-success · stesso dossier §Touch 2
origine: playbook:recensioni
blocco_invio: solo se A13/telefonata = feedback positivo · ordine `58094956-4b9b-49b4-9299-7a5c645d7cb3` in stato Consegnato
cambia: Al cliente arriva il link diretto alla recensione verificata su Pane Quotidiano — 30 secondi, prima recensione di MyCity a Piacenza.
seguito: Se recensisce → ringraziamento + passa a @content per UGC · se silenzio → 1 solo promemoria a +2g poi stop.
testo:
Buongiorno! Come promesso, ecco il link per lasciare due righe su Pane Quotidiano 🌟
👉 https://mycity-marketplace.com/orders/58094956-4b9b-49b4-9299-7a5c645d7cb3/review
Bastano 30 secondi: stelline + una frase vera. Spunto: "Prodotti bio freschi, consegna puntuale a mano, gentilissimi."
Sarebbe la prima recensione verificata di MyCity a Piacenza — grazie di cuore!

## A15 · ⏭️ SKIP recensioni — nessuna consegna completata oggi
reparto: customer-success
livello: 🟢
canale: —
perche: REST 1/7 12:03: 0 ordini con `delivered_at` · 0 recensioni in DB. Playbook eseguito, nessun sollecito da inviare oggi.
preparato: 🤗 customer-success · playbook 1/7 12:03
origine: playbook:recensioni
testo:
NON INVIARE oggi — zero consegne completate. Sequenza A13–A14 si attiva automaticamente dopo la prima consegna (#16).
