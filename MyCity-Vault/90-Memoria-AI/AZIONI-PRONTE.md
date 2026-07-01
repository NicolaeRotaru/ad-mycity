---
tipo: azioni-pronte
fonte: AD digitale
aggiornato: 2026-07-01 12:01
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
