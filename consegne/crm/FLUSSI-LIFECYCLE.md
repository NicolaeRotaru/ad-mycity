---
tipo: flussi-ciclo-di-vita + testi pronti all'invio
reparto: crm-lifecycle
voce: "il Vicino Orgoglioso" (dà del tu, caldo, civico, mai aziendalese)
frase-causa: "Le botteghe del centro di Piacenza stanno sparendo — MyCity le porta a casa tua, così le salviamo insieme."
contesto: lancio · lista d'attesa "primi 50 = prima consegna gratis" · primo sabato concierge (sab 27/6) · negozio-faro Antica Salumeria Garetti (P.za Duomo 44)
canali-reali: Email (Resend) · notifiche in-app · web push · Telegram — TUTTI oggi in DRY-RUN
data: 2026-06-24
stato: FINITO — testi completi, pronti all'invio. NIENTE è stato inviato.
costruito-su: consegne/customer-success/primo-ordine-faro.md · 04-Prodotto-Ops/Funzionalità/{Notifiche Transazionali, Programma Referral, Recupero carrelli}.md · 03-Clienti/Clienti, Personas & Crescita.md
---

# 🔁 Flussi Lifecycle MyCity — testi pronti all'invio

> Tutti i messaggi del ciclo di vita del cliente, **testo completo**, con oggetto, corpo, timing,
> canale e trigger. Voce unica: **il Vicino Orgoglioso** (do del tu, sono caldo e civico, parlo da
> piacentino a un piacentino — mai "Gentile Cliente").
>
> 🎀 **Cura come customer-success**: questi flussi sono la versione **automatica/di scala** di ciò
> che customer-success fa a mano nei primi 10 ordini concierge. Niente li sostituisce nei primi
> ordini — li affiancano quando il volume cresce.

## Legenda semafori 🟢🟡🔴
- 🟢 **scrivere/progettare il flusso** = lo faccio io (questo documento).
- 🟡 **inviare a un cliente reale o a piccola lista** = preparato → conferma di Nicola → parte.
- 🔴 **invio a grande lista** o **incentivo in denaro/credito** (referral, gift, prima consegna gratis) = propongo importo+ROI → firma di Nicola.

## ⚙️ Cosa serve per ATTIVARE i canali (oggi tutti in DRY-RUN)
| Canale | Chiave/variabile da collegare | Chi la collega |
|---|---|---|
| Email | `RESEND_API_KEY` + dominio verificato (SPF/DKIM su `mycity.pc.it` o simile) + indirizzo mittente `ciao@…` | @builder-automazioni |
| In-app | tabella `notifications` + render in-app (già nel sito) | @tech / @builder |
| Web push | chiavi VAPID (`VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`) + service worker + opt-in browser | @builder-automazioni |
| Telegram | `TELEGRAM_BOT_TOKEN` + chat_id raccolti all'iscrizione | @builder-automazioni |
| Trigger ordine | webhook da [[Gestione Stato Ordine]] → coda notifiche | @tech |

> 🔒 **Privacy/consenso (vincolo @legale-privacy):** ogni invio richiede **consenso esplicito**
> raccolto all'iscrizione (checkbox separata marketing vs transazionale). Le email transazionali
> (conferma ordine, in consegna) non richiedono opt-in marketing; tutto il resto sì. Footer con
> **link disiscrizione** obbligatorio su ogni email di marketing. Niente lista comprata, niente spam.
> **PASSO-A @legale-privacy**: validare i footer e i testi consenso prima del primo invio reale.

---

# 1) WELCOME — Lista d'attesa (3 email) 🟡

**Trigger:** iscrizione al Google Form / landing "primi 50 = prima consegna gratis".
**Segmento:** iscritti lista d'attesa pre-lancio.
**Canale:** Email (Resend). Opzionale eco su Telegram per chi lo ha lasciato.
**Colore:** 🟡 invio (lista piccola, primi 50) — diventa 🔴 se la lista supera ~200 nomi.
**Attiva con:** `RESEND_API_KEY` + dominio verificato + consenso marketing alla checkbox del form.

---

### 1.1 — Email #1 · Benvenuto + causa (invio: subito, entro 5 min dall'iscrizione)

**Subject:** Ci sei. Sei tra i primi a riportare le botteghe a casa 🧡
**Preheader:** La prima consegna te la offriamo noi. Ecco perché ci tieni anche tu.

> Ciao [Nome],
>
> ci sei. Sei dentro tra i **primi 50** — e la tua prima consegna te la offriamo noi.
>
> Ma prima di parlarti di consegne, una cosa vera. Le botteghe del centro di Piacenza stanno
> sparendo: la salumeria di fiducia, il fornaio sotto casa, il negozio dove ti chiamano per nome.
> Una alla volta, chiudono. **MyCity le porta a casa tua, così le salviamo insieme.**
>
> Non è un'app come le altre. Niente catene, niente magazzini fuori città. Solo le **vere botteghe
> del centro**, consegnate a mano da noi, nel tuo quartiere.
>
> Partiamo da **Antica Salumeria Garetti**, in Piazza Duomo — coppa, pancetta e salame piacentini,
> i tre DOP, fatti come una volta. E da lì cresciamo, bottega dopo bottega.
>
> Nei prossimi giorni ti spiego **come funziona il primo sabato** (è più semplice di una telefonata).
> Per ora: grazie. Sei uno dei vicini che ha deciso di non lasciarle chiudere.
>
> A presto,
> Nicola — MyCity
> *Il marketplace delle botteghe del centro di Piacenza*

*Footer:* MyCity, Piacenza · Ricevi questa mail perché ti sei iscritto alla lista d'attesa · [Disiscriviti]

---

### 1.2 — Email #2 · Come funziona il primo sabato (invio: +2 giorni)

**Subject:** Come funziona, in 4 passi (e perché paghi alla consegna)
**Preheader:** Ordini la tua bottega, te la portiamo a mano. Niente carte, niente sorprese.

> Ciao [Nome],
>
> te lo spiego in mezzo minuto, com'è semplice.
>
> **1. Scegli la tua bottega.** Per ora c'è Garetti, la salumeria di Piazza Duomo. A breve altre.
> **2. Riempi il carrello** come faresti al banco: la coppa all'etto, un salame, due fette di
> pancetta. Scrivi pure le tue richieste, le leggiamo davvero.
> **3. Ti diciamo la finestra di consegna** — stretta, tipo "tra le 11 e le 11:30", non "in giornata".
> **4. Te la portiamo a mano noi.** Paghi alla consegna, in contanti se preferisci. Nessuna carta
> obbligatoria, nessuna sorpresa.
>
> Il **primo sabato** sono io di persona a portarti la spesa. Sì, io. Perché la prima volta voglio
> guardarti in faccia e sapere che è andata bene.
>
> Tienti pronto: tra poco ti scrivo **quando si parte**. E ricorda — la tua **prima consegna è gratis**.
>
> A presto,
> Nicola — MyCity

*Footer:* MyCity, Piacenza · [Disiscriviti]

---

### 1.3 — Email #3 · Reminder pre-sabato (invio: giovedì sera prima del sabato di lancio, ore 18:00)

**Subject:** Sabato si parte 🛒 La tua bottega, a casa tua
**Preheader:** Ordina venerdì o sabato mattina — prima consegna offerta da noi.

> Ciao [Nome],
>
> ci siamo: **sabato [DATA]** parte MyCity, e tu sei tra i primi 50.
>
> Da Antica Salumeria Garetti, Piazza Duomo: coppa, pancetta, salame piacentini DOP, tagliati al
> momento. Ordina **venerdì sera o sabato mattina** e te li porto a mano nel pomeriggio — **prima
> consegna offerta da noi.**
>
> 👉 [Ordina ora dalla bottega] *(link diretto allo store Garetti)*
>
> Se hai un dubbio, rispondi a questa mail: ti rispondo io.
> Riportiamole a casa, queste botteghe. Insieme.
>
> A sabato,
> Nicola — MyCity

*Footer:* MyCity, Piacenza · [Disiscriviti]

> 🔴 **Nota incentivo:** "prima consegna gratis" è un **costo reale** (~3-5€/consegna assorbiti da
> MyCity). Cap proposto: **primi 50 iscritti, una sola volta a testa**. Costo max stimato:
> 50 × 4€ ≈ **200€**. ROI atteso: primo ordine + aggancio retention → break-even al 2° ordine.
> → Decide Nicola (riga in AZIONI-IN-ATTESA).

---

# 2) CONFERMA PRIMO ORDINE + istruzioni concierge 🟡

**Trigger:** primo ordine del cliente passa a `Pagato/COD → Accettato dal negozio` ([[Gestione Stato Ordine]]).
**Segmento:** clienti al loro **primo ordine** (transazionale + tocco concierge).
**Canale:** Email (conferma formale) + in-app/push (tempo reale). Per il primissimo ordine, anche il messaggio diretto di Nicola (vedi customer-success §A.4).
**Colore:** 🟡 (tocca cliente reale). La conferma transazionale pura è 🟢 una volta attivo il canale e raccolto il consenso transazionale.
**Attiva con:** `RESEND_API_KEY` + webhook stato ordine.

---

### 2.1 — Email di conferma primo ordine

**Subject:** Ci siamo, [Nome]! Il tuo primo ordine da Garetti è confermato 🧡
**Preheader:** Lo prepariamo fresco adesso. Te lo portiamo a mano. Paghi alla consegna.

> Ciao [Nome],
>
> grazie, il tuo **primo ordine** è arrivato e Garetti lo sta preparando **fresco adesso**. 🧡
>
> **Cosa hai ordinato**
> [Lista prodotti · quantità · prezzo]
> Totale: **[importo]€** — paghi **alla consegna** (contanti o come concordato).
>
> **Come va da qui in poi**
> • Garetti taglia e prepara al momento (coppa, pancetta, salame all'etto).
> • Ti scriviamo la **finestra di consegna** — stretta, non vaga.
> • Te la portiamo **a mano** noi, nel centro.
>
> Essendo la tua prima volta, **la consegna te la offriamo noi.**
>
> Se ti serve cambiare qualcosa o hai una richiesta, **rispondi a questa mail** o scrivici: c'è una
> persona vera dall'altra parte (di solito sono io).
>
> A tra poco,
> Nicola — MyCity

*Footer:* MyCity, Piacenza · Questa è una comunicazione sul tuo ordine [#ID]

---

### 2.2 — Istruzioni concierge (interne, per chi gestisce il primo ordine)

> Promemoria operativo, **non** inviato al cliente — riusa la checklist di
> `consegne/customer-success/primo-ordine-faro.md` §A.3:
> conferma in 2 min · finestra stretta · packaging curato (sacchetto MyCity + biglietto a mano +
> catena del caldo per i salumi) · consegna a mano · segna "Consegnato" (sblocca payout + recensione) ·
> telefonata feedback dopo 2-4h · richiesta recensione il giorno dopo.

---

# 3) POST-CONSEGNA — Feedback + invito recensione 🟡

**Trigger:** ordine → `Consegnato` ([[Recensioni e Rating Prodotti]]: recensione legata a `order_id`).
**Segmento:** ogni cliente con ordine consegnato.
**Canale:** Email + in-app. Per i primi 10 ordini, la **telefonata** di customer-success ha priorità (l'email è il backup/scala).
**Colore:** 🟡 (cliente reale).
**Attiva con:** `RESEND_API_KEY` + evento `Consegnato`.

---

### 3.1 — Email feedback (invio: +3 ore dopo "Consegnato")

**Subject:** Com'è andata, [Nome]? (rispondi pure a questa mail)
**Preheader:** Due righe vere ci aiutano a portarti le botteghe sempre meglio.

> Ciao [Nome],
>
> ti è arrivata la spesa da Garetti? Spero la coppa fosse come al banco. 🧡
>
> Siamo appena nati e ogni tua parola conta davvero. **Com'è andata?**
> 👍 [Tutto bene]   😐 [Così così]   👎 [C'è stato un problema]
>
> Se qualcosa non è andato, **dimmelo** rispondendo qui: lo sistemo io, oggi stesso. In una città
> piccola la fiducia è tutto, e me la voglio guadagnare.
>
> Grazie per aver scelto la bottega del centro,
> Nicola — MyCity

*Footer:* MyCity, Piacenza · [Disiscriviti dalle email di cortesia]

> 🔀 **Ramo "problema" (👎):** chi clicca o risponde negativo → handoff immediato a **@supporto**
> (non parte alcun invito recensione finché non è risolto). Regola d'oro: mai chiedere una recensione
> a un cliente insoddisfatto.

---

### 3.2 — Email invito recensione (invio: +1 giorno, SOLO se feedback ≠ negativo)

**Subject:** Aiuti la bottega del Duomo con 30 secondi? ⭐
**Preheader:** Una tua riga fa scegliere Garetti al prossimo vicino.

> Ciao [Nome],
>
> contento che sia andata bene! Posso chiederti un favore da vicino?
>
> **Lascia una riga su Garetti.** Bastano 30 secondi. Non lo fai per noi: lo fai perché il prossimo
> piacentino, quando cerca la sua salumeria, trovi Garetti e si fidi — come ti sei fidato tu.
>
> ⭐ [Scrivi la tua recensione]
>
> È così che le botteghe del centro tornano a riempirsi. Una recensione alla volta.
>
> Grazie di cuore,
> Nicola — MyCity

*Footer:* MyCity, Piacenza · [Disiscriviti]

---

# 4) WIN-BACK — Cliente che salta 2 settimane 🟡

**Trigger:** nessun ordine da **14 giorni** dall'ultimo ordine (query coorti Supabase).
**Segmento:** clienti dormienti (≥1 ordine in passato, 0 negli ultimi 14gg).
**Canale:** Email (touch 1 e 2) + telefonata per i clienti "buoni" (≥2 ordini storici).
**Colore:** 🟡 email · 🔴 se il win-back include un **credito/sconto** (vedi nota in fondo).
**Attiva con:** `RESEND_API_KEY` + query "ultimo ordine per cliente".

---

### 4.1 — Email win-back #1 (invio: giorno 14, tono "ci manchi", nessuno sconto)

**Subject:** [Nome], la coppa di Garetti ti aspetta 🧡
**Preheader:** È un po' che non ci vediamo. Te la riporto a casa quando vuoi.

> Ciao [Nome],
>
> è un paio di settimane che non ti portiamo niente, e si sente.
>
> Garetti taglia sempre fresco, e il salame nuovo è una bontà. Ti va di riprovare? Ti basta un
> minuto e te lo porto a mano come l'altra volta.
>
> 👉 [Riordina dalla bottega]
>
> E se la prima volta qualcosa non ti aveva convinto, **dimmelo rispondendo qui** — voglio capire e
> fare meglio. Le botteghe del centro le salviamo solo se torni anche tu. 🧡
>
> A presto,
> Nicola — MyCity

*Footer:* MyCity, Piacenza · [Disiscriviti]

---

### 4.2 — Email win-back #2 (invio: giorno 21, SOLO se ancora 0 ordini; può portare un piccolo incentivo 🔴)

**Subject:** Un pensiero da parte mia 🎁
**Preheader:** Torna a trovarci: la consegna del prossimo ordine la offro io.

> Ciao [Nome],
>
> non voglio insistere, solo dirti che mi piacerebbe rivederti tra i vicini di MyCity.
>
> Per convincerti: **il prossimo ordine te lo consegno io, offerto.** Scegli la tua bottega, riempi
> il carrello, ci pensiamo noi al resto.
>
> 👉 [Torna da Garetti — consegna offerta]
>
> E se non fa per te, nessun problema: ti tolgo dai promemoria con un clic qui sotto. Ma se ci dai
> un'altra possibilità, la bottega del Duomo (e io) ti aspettiamo.
>
> Nicola — MyCity

*Footer:* MyCity, Piacenza · [Disiscriviti]

---

### 4.3 — Script telefonata win-back breve (per clienti con ≥2 ordini storici) 🟡

> Da usare da customer-success/Nicola. <60 secondi. Naturale, mai venditore.

> **Apertura:** "Ciao [Nome], sono Nicola di MyCity — quello che ti ha portato la spesa da Garetti.
> Ti rubo trenta secondi, eh."
>
> **Cuore:** "Ho visto che è un po' che non ordini e volevo solo sentire se era andato tutto bene
> l'altra volta… c'era qualcosa che potevo fare meglio?"
>
> → *Se problema:* "Hai ragione, scusami. Lo sistemo. La prossima consegna te la offro io per
> rifarmi." (annota → @supporto)
> → *Se "solo non ci ho pensato":* "Ci sta! Allora ti dico una cosa: questo weekend Garetti ha il
> salame nuovo. Se ti va te ne porto un po' insieme alla solita coppa — consegna offerta. Ti
> preparo l'ordine io o fai tu dall'app?"
>
> **Chiusura:** "Perfetto. Grazie davvero — è gente come te che tiene aperte le botteghe del centro.
> A presto!"

> 🔴 **Nota incentivo win-back:** la "consegna offerta" e l'eventuale assaggio omaggio sono **costi
> reali**. Proposta: offrirli **solo nel touch #2 e in telefonata**, **una volta per cliente**,
> cap consegna ~4€. ROI: recuperare un cliente con storico costa meno che acquisirne uno nuovo.
> → Decide Nicola.

---

# 5) REFERRAL "Porta un'amica" + "Regala una spesa" (gift) 🔴

**Trigger:** cliente con ≥1 ordine consegnato e feedback positivo (per il referral); chiunque per il gift.
**Segmento:** clienti soddisfatti (referral) · chiunque voglia regalare (gift).
**Canale:** Email + pagina/link condivisibile (in-app, WhatsApp, Telegram).
**Colore:** 🔴 — entrambi muovono **credito/denaro reale**. Importi proposti sotto, firma di Nicola.
**Attiva con:** `RESEND_API_KEY` + sistema codici referral/wallet credito ([[Programma Referral]] + [[Promozioni e Coupon]]) + anti-frode (no self-referral, primo ordine reale).

---

### 5.1 — REFERRAL · Email invito a chi invita (l'invitante)

**Subject:** Porta un'amica nel centro — 5€ a te, 5€ a lei 🧡
**Preheader:** Il tuo codice personale. Più vicini ordinano, più botteghe restano aperte.

> Ciao [Nome],
>
> ti è piaciuta la spesa di Garetti? Fai una cosa bella: **dillo a una vicina.**
>
> Per ringraziarti: quando una persona che inviti fa il suo primo ordine, **5€ vanno a lei e 5€
> vanno a te**. Semplice.
>
> Ecco il tuo link personale da girare su WhatsApp o di persona:
> 👉 [mycity.pc.it/invito/CODICE-[NOME]]
>
> Ogni amica che ordina è una bottega del centro che incassa, un negoziante che tiene aperto. Non è
> solo uno sconto: è la città che si tiene su a vicenda. 🧡
>
> Grazie,
> Nicola — MyCity

*Footer:* MyCity, Piacenza · [Disiscriviti]

---

### 5.2 — REFERRAL · Messaggio che riceve l'invitato

**Subject:** [Nome] ti regala 5€ sulla spesa delle botteghe del centro 🧡
**Preheader:** La tua salumeria di fiducia, consegnata a casa. Inizi con 5€ di benvenuto.

> Ciao,
>
> **[Nome] ti ha invitato** su MyCity — e con il suo invito hai **5€ sul tuo primo ordine.**
>
> MyCity è il modo di riportarti a casa le vere botteghe del centro di Piacenza: la salumeria, il
> fornaio, il negozio di fiducia. Ordini, noi te lo portiamo a mano. Paghi alla consegna.
>
> Si parte da **Antica Salumeria Garetti** — coppa, pancetta e salame piacentini DOP.
>
> 👉 [Usa i tuoi 5€ — ordina ora]
>
> Le botteghe del centro stanno sparendo. Con un ordine, le tieni aperte.
> Benvenuto tra i vicini,
> Nicola — MyCity

*Footer:* MyCity, Piacenza · Hai ricevuto questo invito da un amico · [Non voglio inviti]

---

### 5.3 — GIFT "Regala una spesa" · Email a chi regala (il donatore)

**Subject:** Regala una spesa dalle botteghe del centro 🎁
**Preheader:** Un pensiero vero per chi ami: la sua salumeria di fiducia, a casa sua.

> Ciao [Nome],
>
> vuoi fare un regalo che sa di Piacenza? **Regala una spesa.**
>
> Scegli l'importo, scrivi due righe per la persona, e le arriva un buono da spendere nelle botteghe
> del centro — gliela portiamo a mano noi. Un pensiero per i nonni, per un amico lontano da casa,
> per chi non può uscire.
>
> 🎁 [Regala una spesa — scegli l'importo]
>
> Non è un buono qualsiasi: è la coppa di Garetti che arriva a casa di chi ami, con il tuo nome
> sopra. E intanto tieni aperta una bottega del centro.
>
> Nicola — MyCity

*Footer:* MyCity, Piacenza · [Disiscriviti]

---

### 5.4 — GIFT · Messaggio che riceve chi è stato regalato (il destinatario)

**Subject:** [Nome donatore] ti ha regalato una spesa 🎁🧡
**Preheader:** Un buono per le botteghe del centro di Piacenza, consegnato a casa tua.

> Ciao [Nome],
>
> **[Nome donatore] ti ha regalato una spesa** dalle botteghe del centro di Piacenza con MyCity. 🎁
>
> [Eventuale dedica del donatore: "«…»"]
>
> Hai **[importo]€** da spendere nella tua salumeria di fiducia — si parte da Antica Salumeria
> Garetti, Piazza Duomo: coppa, pancetta, salame piacentini DOP. Ordini, e te li portiamo **a mano**
> a casa. Paghi solo l'eventuale eccedenza, alla consegna.
>
> 👉 [Usa il tuo regalo — ordina ora]
>
> Goditelo. E intanto, anche tu, tieni aperta una bottega del centro. 🧡
>
> Nicola — MyCity

*Footer:* MyCity, Piacenza · [Aiuto]

> 🔴 **Nota incentivi referral + gift:**
> • **Referral give-get 5€+5€:** costo solo su **primo ordine valido dell'invitato** (no self-referral,
>   anti-frode). CAC referral atteso << CAC altri canali. Cap suggerito: budget mensile 250€ (≈25
>   conversioni) finché non misuriamo il k-factor.
> • **Gift:** è denaro **prepagato dal donatore** → cash-positive per MyCity (incassiamo prima di
>   consegnare). Rischio basso. Serve solo gestione wallet/buono + scadenza buono (12 mesi).
> → Importi e budget li firma Nicola.

---

# 6) CARRELLO ABBANDONATO (2 touch) 🟡

**Trigger:** carrello creato, nessun checkout completato (query Supabase carrelli abbandonati).
**Segmento:** chi ha messo prodotti nel carrello ma non ha ordinato.
**Canale:** Email + web push (se opt-in attivo).
**Colore:** 🟡 (cliente reale, lista solitamente piccola). 🔴 se il touch #2 include uno sconto.
**Attiva con:** `RESEND_API_KEY` (+ VAPID per push) + query carrelli abbandonati.

---

### 6.1 — Touch #1 (invio: +1 ora dall'abbandono, nessuno sconto, tono "ti aiuto")

**Subject:** Hai lasciato la coppa nel carrello 🛒
**Preheader:** È ancora lì, fresca. Finisci l'ordine in un minuto.

> Ciao [Nome],
>
> hai messo qualcosa di buono nel carrello da Garetti e poi… ti sei distratto, capita. 😊
>
> **È ancora lì che ti aspetta:**
> [Lista prodotti nel carrello]
>
> Garetti taglia fresco al momento e te lo portiamo a mano. Ci vuole un minuto a finire:
> 👉 [Completa il tuo ordine]
>
> Se qualcosa ti ha bloccato (un dubbio sulla consegna, sul pagamento), **rispondi qui**: ti aiuto io.
>
> A tra poco,
> Nicola — MyCity

*Footer:* MyCity, Piacenza · [Disiscriviti]

---

### 6.2 — Touch #2 (invio: +24 ore, SOLO se ancora non ordinato — può chiudere con leva morbida)

**Subject:** Ci penso io alla consegna 🧡
**Preheader:** Il tuo carrello sta per scadere — finiamolo insieme.

> Ciao [Nome],
>
> il tuo carrello da Garetti è ancora qui, ma la freschezza non aspetta in eterno. 😉
>
> [Lista prodotti nel carrello] — Totale: [importo]€
>
> Per darti una mano a decidere: **questa consegna la offro io.** Finisci l'ordine e ci pensiamo noi
> a portartelo a casa, a mano, nel centro.
>
> 👉 [Completa l'ordine — consegna offerta]
>
> E se hai cambiato idea, va bene così — il carrello si svuota da solo. Ma se la coppa la volevi
> davvero, è a un clic.
>
> Nicola — MyCity

*Footer:* MyCity, Piacenza · [Disiscriviti]

> 🔴 **Nota incentivo:** "consegna offerta" nel touch #2 = costo reale ~4€. Proposta: attivarlo
> **solo** sul secondo touch e **una volta per cliente**. Da firmare. In alternativa touch #2
> senza sconto (solo urgenza freschezza) = 🟡 puro.

---

# 7) PROMEMORIA RIORDINO settimanale ("Ordina per il weekend") 🟡

**Trigger:** ciclo settimanale (giovedì) sui clienti attivi (≥1 ordine, non dormienti, opt-in marketing).
**Segmento:** clienti attivi recenti. **Escludi** chi ha già un ordine aperto per il weekend e i dormienti (loro vanno in win-back).
**Canale:** Email + web push.
**Colore:** 🟡 (lista clienti reali) — 🔴 se la lista attiva supera ~200.
**Attiva con:** `RESEND_API_KEY` + cron settimanale + query clienti attivi.

---

### 7.1 — Email promemoria riordino (invio: giovedì ore 17:30)

**Subject:** Pronti per il weekend? 🧀 Ordina la tua spesa dal centro
**Preheader:** Garetti taglia fresco per sabato. Ordina entro venerdì sera.

> Ciao [Nome],
>
> arriva il weekend, e con lui la voglia di una tavola buona. 🧡
>
> Garetti ha il banco pieno: coppa, pancetta, salame piacentini DOP, tagliati freschi. Ordina **entro
> venerdì sera** e te li portiamo a casa **sabato**, a mano, nel centro.
>
> 👉 [Fai la spesa per il weekend]
>
> Idea per sabato: un tagliere DOP con un buon Gutturnio. La spesa della tua bottega di fiducia,
> senza muoverti da casa.
>
> Buon weekend,
> Nicola — MyCity

*Footer:* MyCity, Piacenza · Ricevi il promemoria del weekend perché sei un cliente MyCity · [Disiscriviti dai promemoria]

> 💡 **Personalizzazione futura:** quando ci sono dati, ripescare i **prodotti già ordinati** dal
> cliente ("la tua solita coppa") e ruotare la bottega/categoria in cima. Per ora segmento unico
> (Garetti).

---

# 📋 Tabella riepilogo (per l'attivazione)

| # | Flusso | Trigger | Canale | Colore | Per attivarlo serve |
|---|---|---|---|---|---|
| 1 | Welcome lista d'attesa (3) | iscrizione form | Email | 🟡 (🔴 prima-consegna-gratis) | RESEND_API_KEY + consenso |
| 2 | Conferma primo ordine | stato → Accettato | Email + in-app/push | 🟡 | RESEND + webhook ordine |
| 3 | Feedback + recensione | stato → Consegnato | Email | 🟡 | RESEND + evento Consegnato |
| 4 | Win-back (2 sett.) | 0 ordini da 14gg | Email + telefonata | 🟡 (🔴 se credito) | RESEND + query ultimo ordine |
| 5 | Referral + Gift | ≥1 ordine / chiunque | Email + link | 🔴 (denaro) | RESEND + wallet/codici + anti-frode |
| 6 | Carrello abbandonato (2) | carrello senza checkout | Email + push | 🟡 (🔴 se sconto) | RESEND (+VAPID) + query carrelli |
| 7 | Riordino settimanale | cron giovedì | Email + push | 🟡 | RESEND + cron + query attivi |

---

# 📈 Metriche per flusso (cosa misuro dopo l'attivazione)
- **Welcome:** open rate, % che ordina al lancio (target primi 50 → ≥30% primo ordine).
- **Feedback/recensione:** % risposta feedback, **n° recensioni raccolte** (semina passaparola).
- **Win-back:** **% riattivazioni** a 7gg dall'invio (target ≥10%).
- **Referral:** % nuovi clienti da referral, **k-factor**, CAC referral vs altri.
- **Gift:** n° buoni venduti (cash-positive), % riscattati.
- **Carrello:** **% recupero** (target ≥10% touch1, ≥15% cumulato).
- **Riordino:** % che ordina entro venerdì, frequenza media ordini/cliente (la vera leva retention).

---

> 🔚 **Nessun messaggio è stato inviato.** Tutti i canali sono in DRY-RUN. Le azioni di invio reale e
> gli incentivi in denaro sono accodati in `AZIONI-IN-ATTESA.md` per la firma di Nicola, e il collegamento
> dei canali (chiavi) è handoff a @builder-automazioni. Footer/consenso da validare con @legale-privacy.
