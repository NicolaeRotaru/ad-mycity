---
tipo: script-concierge + script-telefonata-feedback + richiesta-prima-recensione
reparto: customer-success
negozio-faro: Antica Salumeria Garetti — Piazza Duomo 44, Piacenza
categoria: salumeria / gastronomia DOP (3 DOP Piacentini)
data: 2026-06-24
go-live-target: 2026-06-25
primo-sabato-concierge: 2026-06-27 (mercato Piazza Cavalli)
stato: FINITO — pronto da usare per il primo ordine
costruito-su: consegne/vendite/pitch-garetti.md · consegne/intelligence/campo-aperto-faro.md · Piano d'Azione.md (§3 primo sabato concierge, §8 rischio "cattiva prima esperienza")
---

# 🎀 Primo ordine concierge — Antica Salumeria Garetti

> Documento operativo per il **primo ordine vero** della prima bottega-faro. Non un report: **cosa
> fare e cosa dire**, passo per passo, dal QR in cassa alla consegna a mano, più la **telefonata di
> feedback** e la **richiesta della prima recensione**.
>
> 🎯 Regola d'oro del primo ordine (Piano d'Azione §8): in città piccola **una brutta consegna gira
> veloce**, una bella consegna fa passaparola. I primi 10 ordini li facciamo **in concierge**: cura
> maniacale, telefonata dopo ogni consegna, problema intercettato prima che diventi reclamo.
>
> Legenda semafori: 🟢 lo faccio io subito · 🟡 tocca un cliente reale → preparo, conferma di Nicola,
> poi procedo · 🔴 soldi/voucher → propongo, decide Nicola.
> Note di onestà sono marcate ⚠️.

---

## 👥 I tre attori del primo ordine

| Chi | Ruolo nel primo ordine |
|---|---|
| **Garetti** (il negozio) | Riceve l'ordine, prepara coppa/pancetta/salame, conferma. È la fonte del primo cliente (QR in cassa). |
| **Il primo cliente** | Un cliente affezionato di Garetti, o un vicino del cluster Duomo. Persona reale, non test. |
| **Io / Nicola (concierge)** | Faccio io la prima consegna a mano, con sacchetto curato e telefonata dopo. Sono il volto di MyCity. |

> ⚠️ **Test ≠ primo ordine vero.** L'ordine di prova interno (fatto all'onboarding, vedi pitch Parte B
> minuto 17-20) serve solo a verificare che le notifiche arrivino. Il **primo ordine concierge** è di
> un **cliente reale**: è quello che conta per il passaparola.

---

## PARTE A — DAL QR IN CASSA AL PRIMO ORDINE

### A.1 · Il QR in cassa è l'amo (Loop 1 — il negozio come canale)

Il primo cliente non arriva da una pubblicità: arriva **dalla clientela di Garetti**. Strumento:
QR in cassa + una frase che Garetti (o io, il primo sabato) dice di persona.

**Cosa metto in cassa (🟢, lo preparo io / chiedo a @designer la grafica stampabile):**
- Un **cartoncino/vetrofania col QR** vicino alla cassa: *"Te la porto a casa. Inquadra e ordina."*
- Sotto il QR, una riga di rassicurazione: *"La spesa della tua salumeria di fiducia, consegnata a
  mano nel centro. Paghi alla consegna."*

**La frase che Garetti dice al cliente in cassa (gliela lascio scritta su 1 riga):**
> *"Signora, lo sa che da oggi gliela posso portare a casa? Inquadra qui, ordina quando vuole, e
> gliela consegnano a mano. Paga alla consegna, come sempre da me."*

> 💡 Perché funziona: il cliente non si fida di un'app sconosciuta, si fida di **Garetti**. Il negozio
> "presta" la sua fiducia a MyCity. Questo è il loop di crescita n.1 del Piano d'Azione.

### A.2 · Il momento giusto per il primo ordine: sabato 27/6

- 🟢 **Sabato 27/6 c'è il mercato in Piazza Cavalli** (verificato da @intelligence): la città è in
  centro a fare la spesa, col caldo e la ZTL. È il **primo weekend dopo il go-live** → la finestra
  naturale per il primo ordine concierge.
- 🟡 **Io sono in bottega sabato mattina** (concierge dal vivo): aiuto Garetti a proporre il QR ai
  clienti del banco e raccolgo i primi ordini anche **a voce / via WhatsApp** se serve (Piano §3:
  "raccogli ordini anche via WhatsApp/breve chiamata" nella prima fase).

### A.3 · Quando entra il primo ordine — la checklist concierge (🟢 io, in tempo reale)

Appena arriva il primo ordine (notifica/telefonata a Garetti, vedi [[Gestione Stato Ordine]]):

- [ ] **Confermo entro 2 minuti** che l'ordine è stato visto e accettato (io accanto a Garetti, o lo
      chiamo). Stato ordine: `Pagato/COD → Accettato dal negozio`.
- [ ] **Mando un messaggio di benvenuto al cliente** (🟡, testo pronto in §A.4) — è il suo primo
      ordine su una piattaforma nuova: rassicuro subito.
- [ ] **Verifico con Garetti cosa prepara** e **quando è pronto** (coppa/pancetta/salame all'etto:
      confermo tagli e quantità per evitare sorprese). Stato: `In preparazione → Pronto`.
- [ ] **Concordo la fascia di consegna col cliente** (telefonata breve o messaggio): do una **finestra
      stretta** ("tra le 11 e le 11:30"), non una vaga.
- [ ] **Curo il packaging** (vedi §A.5): sacchetto MyCity, prodotti protetti dal caldo, biglietto.
- [ ] **Consegno a mano io** (vedi §A.6). Stato: `In consegna → Consegnato`.
- [ ] **Segno l'ordine "Consegnato"** sulla dashboard (sblocca il payout a Garetti e abilita la
      recensione — vedi [[Recensioni e Rating Prodotti]]: recensione legata a `order_id`).
- [ ] **Telefonata di feedback** dopo 2-4 ore (vedi PARTE B).
- [ ] **Richiesta recensione** il giorno dopo (vedi PARTE C).

### A.4 · Messaggio di benvenuto al cliente (🟡 — preparato, conferma di Nicola, poi parte)

> ⚠️ Questo messaggio tocca un **cliente reale** → 🟡. Lo lascio pronto; parte solo col via di Nicola
> e va inviato dal canale concordato (vedi nota privacy in fondo). Va sostituito `[Nome]` e l'orario.

**WhatsApp / SMS, subito dopo l'ordine:**
> *"Ciao [Nome], sono Nicola di MyCity 👋 Grazie per il tuo primo ordine dalla Salumeria Garetti! La
> coppa e il salame li prepara fresco adesso. Te li porto **io a mano** tra le **11:00 e le 11:30**.
> Paghi alla consegna, in contanti. Se ti serve qualcosa scrivimi qui. A tra poco!"*

**Perché così:** dice chi sono (persona, non bot), conferma cosa, **dà una finestra stretta**, ricorda
il pagamento (nessuna sorpresa), apre un canale diretto. È già cura, non solo logistica.

### A.5 · Il packaging che fa passaparola (🟢 io)

Il sacchetto è la prima cosa fisica di MyCity che il cliente tocca. In città piccola, è marketing.

- [ ] **Sacchetto brandizzato MyCity** (Piano §3: "sacchetto brandizzato") — se non è pronto, sacchetto
      pulito + adesivo/biglietto MyCity (→ chiedo a @designer/@content il kit stampabile).
- [ ] **Catena del caldo:** è giugno, sono salumi → prodotti protetti, eventualmente **busta termica /
      siberino** per coppa e pancetta. Il caldo è una leva di vendita (intelligence), ma per la
      consegna è un **rischio qualità**: lo gestisco.
- [ ] **Biglietto scritto a mano** dentro il sacchetto:
      > *"Grazie per aver scelto la bottega del Duomo. — Nicola, MyCity"*
- [ ] **Scontrino/documento commerciale di Garetti** incluso (richiesto dal contratto §8 — allergeni
      e documento commerciale a carico del negozio).
- [ ] (Se c'è) **mini-card con QR per la recensione** già nel sacchetto → semina la richiesta di §C.

### A.6 · La consegna a mano — lo script alla porta (🟡 io, dal vivo)

> Obiettivo: il cliente deve **sentirsi curato**, non servito da un corriere. 30 secondi sulla porta.

**Quando il cliente apre:**
> *"Buongiorno [Nome]! Sono Nicola di MyCity. Ecco la sua spesa dalla Salumeria Garetti: coppa,
> pancetta e salame, tagliati freschi stamattina. Sono [importo] euro. — Ha trovato facile ordinare?
> Qualsiasi cosa, ha il mio numero direttamente. Buon pranzo!"*

**Cose da fare alla porta (non da dire ma da fare):**
- [ ] **Consegnare con le due mani**, sorriso, nome del cliente.
- [ ] **Verificare l'ordine davanti al cliente** ("ecco la coppa, ecco il salame") → zero contestazioni
      dopo.
- [ ] **Incassare il contante** (COD) con il resto pronto.
- [ ] **Una micro-domanda**, non un interrogatorio: *"Ha trovato facile ordinare?"* → mi dà già il
      primo feedback a caldo.
- [ ] **Annotare a mente** (e dopo per iscritto in §D) com'è andata: tempo, intoppi, faccia del cliente.

> ⚠️ **Non chiedere la recensione sulla porta.** Sulla porta il cliente non ha ancora assaggiato. La
> recensione arriva **dopo** (PARTE C), quando ha provato il prodotto. Sulla porta semino solo la
> mini-card col QR (§A.5).

---

## PARTE B — TELEFONATA DI FEEDBACK POST-CONSEGNA (🟡)

> **Quando:** 2-4 ore dopo la consegna (ha avuto tempo di scartare/assaggiare, è ancora la stessa
> giornata). **Chi:** io/Nicola di persona (non un call center: è concierge). **Durata:** 2-3 minuti.
> **Scopo doppio:** (1) intercettare un problema **prima che diventi un reclamo o un brutto
> passaparola** (Piano §8); (2) creare la relazione che porta alla recensione e al secondo ordine.
>
> ⚠️ Chiamata a cliente reale = 🟡. Script pronto; parte col via di Nicola. Vedi nota privacy/consenso
> in fondo.

### B.1 · Apertura (calda, breve, non commerciale)
> *"Buonasera [Nome], sono Nicola di MyCity — quello che le ha portato la spesa di Garetti stamattina.
> La disturbo un minuto solo per sapere se è andato tutto bene. È un buon momento?"*

→ Se dice *"sto cenando / non ora"*: *"Nessun problema, le mando due righe su WhatsApp e mi dice con
calma. Buona serata!"* (e mando il messaggio di feedback scritto, §B.5).

### B.2 · Le 3 domande (in quest'ordine — dal prodotto alla relazione)
1. **Prodotto:** *"I salumi erano come se li fosse scelti al banco? La coppa, il salame… tutto fresco
   e giusto?"*
2. **Esperienza:** *"E ordinare e ricevere — è stato semplice? L'orario le è andato bene?"*
3. **Apertura al futuro:** *"C'è qualcosa che potevamo fare meglio? Glielo chiedo davvero, è il
   nostro primo ordine in città e voglio farlo perfetto."*

> 🎤 Tono: curiosità sincera, non spunta da compilare. La domanda 3 ("cosa potevamo fare meglio")
> tira fuori il problema **a noi**, prima che il cliente lo dica **a un vicino**.

### B.3 · Se il feedback è POSITIVO → ponte alla recensione (non chiusura secca)
> *"Mi fa felice, davvero. Senta, le chiedo un piacere che per noi vale tantissimo: siamo appena nati
> e le persone si fidano dei vicini più che di noi. Le va, **domani**, di lasciare due righe e qualche
> stellina? Le mando io il link, è un minuto. Sarebbe la **prima recensione di tutta Piacenza** — ci
> aiuta a far conoscere le botteghe del centro."*

→ Se dice sì: *"Grazie di cuore. Le arriva il link domani mattina."* → innesco PARTE C.
→ **Non mando il link al telefono adesso:** lascio che la giornata sedimenti, mando domani (§C).

### B.4 · Se il feedback è NEGATIVO o tiepido → recupero, NON difesa
> *"La ringrazio che me lo dice, è esattamente quello che mi serve. Mi dispiace per [problema]. Glielo
> sistemo: [azione concreta]. E sul prossimo ordine ci tengo a rifarmi — me lo lasci dimostrare."*

- 🟢 **Ascolto e mi scuso**, non giustifico. Scrivo il problema in §D e nel briefing per la squadra.
- 🟢 **Azione concreta subito** se è in mio potere (es. ricontatto Garetti sul taglio, riorganizzo
  l'orario della prossima).
- 🔴 **Risarcimento / voucher / sconto sul prossimo ordine = decisione di Nicola.** Io **propongo**
  ("le farei trovare la consegna gratis sul prossimo come scusa"), non lo concedo da solo. Lo accodo
  in AZIONI-IN-ATTESA.md.
- ⚠️ **Su un feedback negativo NON chiedo la recensione.** Prima risolvo. La recensione la chiederò
  solo dopo che ho recuperato (eventuale secondo ordine andato bene).

### B.5 · Versione scritta della chiamata (se non risponde / preferisce WhatsApp)
> *"Ciao [Nome], sono Nicola di MyCity 👋 Volevo solo sapere: la spesa di Garetti di stamattina è
> andata bene? I salumi ti sono piaciuti, l'orario era comodo? Dimmi pure tutto, anche se c'è
> qualcosa da migliorare — è il nostro primo ordine in città e voglio farlo perfetto. Grazie! 🙏"*

---

## PARTE C — LA PRIMA RECENSIONE (🟡)

> **Quando:** il giorno **dopo** la consegna (mattina), e **solo se** il feedback (PARTE B) è stato
> positivo. **Perché legare alla recensione verificata:** in MyCity la recensione è ancorata a un
> `order_id` reale (vedi [[Recensioni e Rating Prodotti]]) → la prima recensione è **vera e
> verificata**, non gonfiata. Questo è il social proof che apre la strada al secondo cliente (Loop 5
> del Piano d'Azione: prova sociale di prossimità).
>
> ⚠️ Messaggio a cliente reale = 🟡. Pronto; parte col via di Nicola.

### C.1 · Principi della richiesta
1. **Chiedo solo a chi è già contento** (filtro della telefonata B.3) → evito recensioni tiepide.
2. **Rendo facile fino all'assurdo:** link diretto, un solo tap, già loggato all'ordine.
3. **Do un motivo "civico", non commerciale:** non "aiutaci a vendere" ma *"aiuta a far conoscere le
   botteghe del centro"* — è ciò che muove davvero un piacentino affezionato alla sua salumeria.
4. **Suggerisco cosa scrivere** (le persone si bloccano davanti al foglio bianco) senza metterle in
   bocca parole false.

### C.2 · Il messaggio con il link (WhatsApp/SMS, mattina dopo)
> *"Buongiorno [Nome]! Come promesso, ecco il link per le due righe sulla Salumeria Garetti 🌟
> 👉 [LINK RECENSIONE — order_id]
> È un minuto, basta toccare le stelline e scrivere una frase. Se non sa cosa scrivere, anche solo:
> *'Coppa e salame freschissimi, consegna puntuale a mano, gentilissimi'* va benissimo 😊
> Sarebbe la **prima recensione di MyCity a Piacenza** — grazie di cuore!"*

### C.3 · Lo "scheletro" di recensione da suggerire (se chiede aiuto)
Tre micro-spunti, fra cui scegliere — onesti, non finti:
- **Sul prodotto:** *"Coppa, pancetta e salame DOP freschi come al banco."*
- **Sul servizio:** *"Ordinato facile, consegnato a mano puntuale, persone gentili."*
- **Sul perché:** *"Bello poter avere la mia salumiera di fiducia del Duomo direttamente a casa."*

### C.4 · Promemoria gentile (solo UNA volta, se non recensisce entro 2 giorni)
> *"Ciao [Nome]! Nessuna fretta, ma se avesse un minuto per le due righe su Garetti sarebbe per noi un
> regalo 🙏 Ecco di nuovo il link: 👉 [LINK]. E grazie ancora per essere stata la nostra prima
> cliente!"*

> ⚠️ **Un solo sollecito.** Insistere oltre infastidisce e brucia la relazione. Se non recensisce,
> va benissimo: ha già fatto il primo ordine, è già un successo.

### C.5 · Cosa faccio della prima recensione (🟢, dopo)
- [ ] La prima recensione (verificata) compare su scheda prodotto e profilo Garetti → **alimenta la
      reputazione del venditore** ([[Reputazione Venditore]]).
- [ ] **Propongo a @content/@growth** di usarla (con permesso del cliente) come prova sociale per il
      lancio: *"I tuoi vicini stanno già ordinando"* (Loop 5). → PASSO-A @content.
- [ ] **Ringrazio il cliente** quando la recensione è pubblicata (chiude il cerchio, predispone al 2°
      ordine):
      > *"Ho visto la sua recensione — grazie davvero, è la prima in assoluto! 🙌 Quando vuole rifare
      > la spesa, mi scriva pure direttamente."*

---

## PARTE D — DOPO: cosa imparo e a chi lo passo

### D.1 · Diario del primo ordine (🟢 io → 90-Memoria-AI/Briefing/)
Subito dopo la consegna annoto (per migliorare gli ordini 2-10):
- ⏱️ Tempi reali: ordine → accettazione → pronto → consegnato.
- 🧱 Intoppi: notifica arrivata? taglio giusto? caldo/packaging? pagamento liscio?
- 😊 Reazione del cliente (porta + telefonata).
- 💡 Una cosa da cambiare per il prossimo ordine.

### D.2 · Cosa segnalo alla squadra (handoff)
- **PASSO-A @designer/@content:** mi serve **stampabile** → (1) cartoncino QR per la cassa di Garetti,
  (2) sacchetto/adesivo MyCity, (3) mini-card "recensisci" col QR per il sacchetto, (4) biglietto
  ringraziamento. Il primo ordine concierge funziona meglio con questi in mano.
- **PASSO-A @growth:** la **prima recensione verificata** è munizione per Loop 5 (prova sociale) →
  legarla al post del primo weekend / mercato 27/6.
- **SERVE da @tech:** confermare che (a) lo stato "Consegnato" abiliti davvero la **richiesta
  recensione** legata a `order_id`, e (b) il **link recensione** sia generabile e mandabile al cliente
  domani. (Coerente con [[Recensioni e Rating Prodotti]] §requisiti: "richiesta recensione
  post-consegna via notifica".)
- **SERVE da @legale-privacy:** **revisione consenso/privacy** sui messaggi 🟡 a clienti reali
  (benvenuto, telefonata, richiesta recensione) → vedi nota sotto.
- **PASSO-A @builder-automazioni:** quando le "mani" (WhatsApp/SMS/notifiche) saranno collegate via
  n8n, automatizzare l'**invio del messaggio benvenuto** e del **link recensione post-consegna**.
  Finché non sono collegate, li mando a mano io (è concierge: va bene così per i primi 10).

### D.3 · ⚠️ Nota privacy/consenso (da far validare a @legale-privacy)
Tutti i contatti diretti al cliente (WhatsApp/SMS/telefono di benvenuto, feedback, recensione) toccano
dati personali e vanno fatti su una **base lecita**:
- Il **messaggio transazionale** (conferma ordine, orario consegna) è legato all'esecuzione
  dell'ordine → generalmente ok come servizio.
- La **telefonata di feedback** e la **richiesta recensione** sono ai limiti del transazionale: meglio
  avere il **consenso del cliente** raccolto in fase di ordine ("posso ricontattarti sul tuo ordine e
  per un feedback?"). → chiedo a @legale-privacy la riga di consenso da inserire al checkout/ordine e
  la conferma che questi messaggi siano coperti.
- Coerente con il contratto venditore (clausola privacy/GDPR essenziale: minimizzazione, diritti
  interessati) — qui il dato è del **cliente**, non del negozio.

---

## ✅ Riepilogo operativo (la sequenza, in una vista)

```
SABATO 27/6 (primo weekend, mercato Piazza Cavalli)
  └─ QR in cassa + frase di Garetti  → primo cliente reale ordina
       └─ [io] confermo <2 min  +  messaggio benvenuto 🟡 (finestra oraria stretta)
            └─ Garetti prepara (coppa/pancetta/salame all'etto)  → stato "Pronto"
                 └─ [io] packaging curato (sacchetto + caldo/termico + biglietto + scontrino + QR recensione)
                      └─ CONSEGNA A MANO 🟡 (script alla porta, verifico l'ordine, incasso COD)
                           └─ stato "Consegnato"  → abilita payout Garetti + recensione (order_id)
2-4 ORE DOPO
  └─ TELEFONATA FEEDBACK 🟡 (3 domande)
       ├─ positivo → ponte alla recensione (chiedo per domani)
       └─ negativo → recupero + azione concreta · risarcimento = 🔴 propongo a Nicola
GIORNO DOPO
  └─ messaggio con LINK RECENSIONE 🟡 (solo se contento) → prima recensione verificata di Piacenza
       └─ [io] ringrazio + propongo a @content come prova sociale (Loop 5)
```

---

## 🔚 Chiusura (doer mode)

**✅ COSA HO FATTO**
- Scritto il deliverable completo: `consegne/customer-success/primo-ordine-faro.md` — script concierge
  primo ordine (QR in cassa → consegna a mano), script telefonata feedback post-consegna (rami
  positivo/negativo), flusso richiesta prima recensione (messaggi pronti + scheletro + sollecito).
- Tutti i testi a clienti sono **pronti da inviare** (basta sostituire `[Nome]`, orario, importo, link).

**⏳ COSA HO ACCODATO / PASSATO**
- PASSO-A @designer/@content: kit stampabile (QR cassa, sacchetto, mini-card recensione, biglietto).
- PASSO-A @growth: prima recensione verificata come prova sociale (Loop 5, post primo weekend).
- PASSO-A @builder-automazioni: automatizzare benvenuto + link recensione via n8n quando le "mani"
  saranno collegate.
- SERVE da @tech: conferma che "Consegnato" abiliti richiesta recensione su `order_id` + link
  mandabile.
- SERVE da @legale-privacy: revisione consenso/privacy sui messaggi 🟡 + riga di consenso al checkout.

**🙋 COSA SERVE DA NICOLA**
- 🟡 **Via libera all'invio** dei messaggi/telefonata ai clienti reali (sono pronti, non parto senza
  ok — toccano persone vere).
- 🔴 **Decisione su eventuale voucher/risarcimento** se il primo feedback è negativo (io propongo,
  decide lui).
- Conferma che la **prima consegna a mano** del primo ordine la facciamo io/lui in concierge sabato 27/6.

#customer-success #faro #garetti #primo-ordine #concierge #feedback #recensioni #piacenza
