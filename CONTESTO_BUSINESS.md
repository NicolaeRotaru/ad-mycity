# CONTESTO_BUSINESS.md — Il cervello del business MyCity

> **Per Claude Code.** Questo documento è la sintesi operativa di due ricerche approfondite (agosto 2026): *"La Teoria del Cambiamento di MyCity"* (lato consumatore) e *"Il bottegaio come cliente pagante"* (lato merchant). I report completi vivono in `docs/ricerca/` e sono la fonte di verità estesa. Leggi questo file prima di ogni decisione di prodotto, priorità o architettura. Non è una spec tecnica: è il PERCHÉ che governa ogni COSA.

---

## 0. Come usare questo documento (regole per Claude Code)

Prima di proporre o costruire qualsiasi funzionalità, rispondi a queste 5 domande:

1. **Quale meccanismo comportamentale attiva?** (→ §3). Se non ne attiva nessuno, non va costruita.
2. **Quale segmento serve e qual è il suo "primo valore"?** (→ §6). Una feature generica per tutti di solito non serve a nessuno.
3. **Viola un requisito non negoziabile?** (→ §4). Se sì, fermati e segnalalo a Hulii prima di scrivere codice.
4. **Aggiunge attrito al bottegaio o al cittadino?** In ogni conflitto tra eleganza tecnica e attrito, vince meno attrito. Il bottegaio usa WhatsApp, non dashboard.
5. **Il risultato è misurabile in cassa entro 2-4 settimane?** Se no, ripianifica o riduci lo scope.

Regola generale: MyCity vince per **integrazione e densità locale**, non per singole feature. Ogni componente deve rafforzare il loop del §3. Tutto deve restare costruibile e gestibile da UNA persona.

---

## 1. Il business in una frase

MyCity è il **sistema operativo del commercio di Piacenza**: fa entrare in città denaro già vincolato alla spesa locale (welfare aziendale, gift card, buoni), intercetta la domanda a monte via WhatsApp e riduce l'attrito dell'acquisto locale sotto quello di Amazon, per spostare spesa da big tech/GDO/catene alle botteghe — partendo dalle botteghe e allargandosi poi alle altre attività.

- **Cliente pagante**: il commerciante (bottegaio).
- **Beneficiario**: il cittadino (consumatore).
- **Operatore**: una sola persona (Hulii) + Claude Code.

---

## 2. I due attori

### 2.1 Il bottegaio — il cliente pagante (buyer persona verificata dai dati)

- 52-62 anni, impresa familiare (spesso il coniuge, a volte un figlio "traduttore digitale"), 0-2 dipendenti.
- Utile netto tipico 25-40k €/anno, margini netti 2-15%, cassa fragile; 10-12 ore/giorno in negozio.
- Ha smartphone e WhatsApp; NON ha (né vuole) CRM, gestionali complessi, dashboard.
- Diffidente per esperienze documentate: agenzie web (≈60% di insoddisfatti a livello nazionale, 2,7 mld € percepiti come "bruciati"), commissioni delivery 15-30%, TheFork/Treatwell che "affittano" il cliente.
- Decide su fiducia personale e passaparola dei colleghi di via; pessimista sul contesto ma resiliente.
- **Compra una sola cosa: più incassi con meno fatica.** Nel prodotto e nella comunicazione rivolti a lui non si parla mai di "tecnologia", "digitalizzazione", "AI": si parla di incassi, clienti, tempo.

### 2.2 Il cittadino — il beneficiario

- Abitudini consolidate su Amazon/GDO: habit loop rinforzato da anni, attrito quasi zero.
- Dichiara di amare il locale (~84%) ma sposta la spesa dove è più comodo: il gap dichiarato-reale si chiude solo con convenienza concreta, mai con il senso di colpa.
- Canale nativo: WhatsApp (apertura ~98%). Nessuna app da scaricare, nessun login.

---

## 3. La teoria del cambiamento (il motore del business)

**Catena causale — da conoscere a memoria:**

> Capacità della piattaforma (wallet earmarked + chat WhatsApp + catalogo con disponibilità + cashback che ricircola) → meccanismo attivato (mental accounting + attrito zero + reward variabile + identità locale) → occasione intercettata a monte (welfare/stipendio, "dove trovo X", cena di stasera, regalo) → euro spostato da big-tech/GDO al negozio, **solo su categorie contendibili** → loop di rinforzo (scontrini → dati → offerte migliori → più riacquisto → più negozi → wallet più utile).

### I 4 meccanismi

1. **Denaro earmarked (mental accounting, Thaler) — la leva più forte.** Un euro che entra già "etichettato Piacenza" (welfare, gift card, buoni comunali, cashback interno spendibile solo nel circuito) non compete con Amazon: la scelta è vinta a monte. Evidenze: Miconex (200+ città UK/Irlanda), TreCuori (welfare territoriale, caso Lube). Conseguenza di design: il wallet deve trattenere e far ricircolare il denaro nel circuito.
2. **Attrito zero (Fogg, B=MAP).** Aumentare l'Ability batte aumentare la Motivation. WhatsApp è l'interfaccia primaria per ENTRAMBI i lati: ordine/riordino/lista per il cittadino, preview-approve per il bottegaio. Se un flusso richiede più passaggi dell'equivalente Amazon, il flusso è sbagliato.
3. **Reward variabile + investment (Hook, Eyal).** Cashback variabile, surprise bag anti-spreco, offerta del negoziante di fiducia; ogni acquisto arricchisce profilo, lista salvata e saldo → costi di switching crescenti.
4. **Identità e riprova sociale locale.** "Io compro a Piacenza", numeri di quartiere veri, streak/badge SOLO al servizio di un'abitudine reale. Mai pointsification vuota.

### Dove si vince e dove no (onestà strutturale)

- **Categorie contendibili** (costruire qui): fresco e spesa quotidiana, cura persona e servizi su appuntamento, farmacia/parafarmacia, regali e ricorrenze, abbigliamento indipendente (parziale).
- **Categorie perse** (non investirci): elettronica/informatica (già 43% online), long-tail/assortimento infinito, guerra di prezzo su commodity.

### Effetti rete: reali vs illusori

- **Reali**: catalogo unificato con disponibilità in tempo reale; circuito di denaro earmarked; loyalty interoperabile; **data flywheel degli scontrini** (l'unico asset non replicabile da Amazon a livello iperlocale).
- **Illusori**: "più utenti attirano negozi" senza densità di transazioni; effetti cross-quartiere.
- **Conseguenza: nicchia-poi-espandi.** Densità in 1-2 categorie ad alta frequenza in un'area circoscritta PRIMA di allargare a tutta la città.

---

## 4. Requisiti di prodotto NON NEGOZIABILI

Derivati dalle paure documentate dei bottegai. Se una richiesta li viola, Claude Code deve segnalarlo prima di costruire.

1. **Zero commissioni sullo scontrino esistente.** Canone fisso. Eventuali fee solo sul "denaro nuovo" (welfare/gift card), mai percepite come tassa sul lavoro del negozio.
2. **Il cliente è del negozio.** Dati e contatti dei clienti sempre visibili, esportabili e di proprietà del merchant. Mai disintermediazione stile Glovo/TheFork.
3. **Attrito zero + preview-before-execute.** Ogni azione del Worker va in preview su WhatsApp con approvazione; nessuna nuova app da imparare per il bottegaio.
4. **Primo risultato in 2-4 settimane**, misurato in cassa (box vendute, clienti richiamati, ordini welfare/gift card) e comunicato attivamente.
5. **Onboarding concierge.** Il setup lo fa la piattaforma (catalogo da foto, profili, template). Il self-service produce shelfware.
6. **Report in linguaggio di cassa.** Incassi, clienti, ordini. Mai vanity metrics (like, impression, follower).
7. **Denaro in sola lettura / perimetro regolato.** Nessuna movimentazione di fondi fuori da Stripe Connect/Issuing; niente "moneta alternativa"; gift card multi-merchant da validare legalmente prima di scalare (perimetro EMI).
8. **WhatsApp mai spam.** Solo messaggi ancorati a trigger reali (lista settimanale, disponibilità richiesta, promemoria chiesti). L'opt-out è una metrica di salute critica.

---

## 5. Offerta, gerarchia del valore e pricing

**Gerarchia di ciò che MyCity vende al bottegaio** (dal più prezioso in giù):

1. **Flussi di denaro nuovi**: welfare aziendale, gift card cittadina, corporate gifting, buoni comunali. Nessun concorrente li porta al vicinato (welfare gestito ~€3,2 mld/anno che oggi finisce prevalentemente ad Amazon/GDO). È il fossato competitivo.
2. **Tempo restituito**: il Worker (social, recensioni, richiami, report) mentre lui sta al banco.
3. **Clienti nuovi misurabili**: anti-spreco, ricerca "dove trovo X", win-back.
4. **Dati semplici**: il report del lunedì in linguaggio di cassa.
5. **Appartenenza**: circuito, vetrofania, identità collettiva dei negozi di Piacenza contro catene e big tech.

**Pricing (decisioni founder + evidenze):**

- Decisione attuale: Worker incluso nell'abbonamento MyCity da €50/mese fino a ~50-100 negozi; poi servizio aggiuntivo a ulteriori €50/mese.
- Evidenze a supporto: fasce €49 (Base) / €99 (Pro) coerenti con la disponibilità a pagare; €50/mese ≈ 2% dell'utile tipico ("impulso gestibile"), €100/mese richiede ROI visibile.
- Argomento di vendita frontale: **"canone fisso, zero commissioni, il cliente è tuo"** contro Glovo/TheFork/Treatwell (7-9k €/anno di commissioni per un centro estetico medio vs 228-1.188 € di canone fisso).
- Leve di chiusura: voucher digitalizzazione delle Camere di Commercio, credito d'imposta 30% sulle commissioni (esercenti <400k € di ricavi), garanzia "primo risultato o non paghi il primo mese".

---

## 6. Segmenti, primo valore e calendario onboarding (set→dic 2026)

| Finestra | Segmento | Problema | Primo valore (1° mese) | Argomento di vendita | Prova richiesta |
|---|---|---|---|---|---|
| SET | Fresco: frutta/verdura, panetterie, gastronomie, macellerie | Invenduto deperibile, ore morte | Anti-spreco + richiami WhatsApp; pre-ordini (macellerie) | "Recuperi cassa che oggi butti, senza commissioni" | N box vendute / M clienti richiamati |
| OTT | Ottiche, estetiste, mercato coperto | Agende vuote, no-show | Booking + reminder + win-back | "Canone fisso invece del 20-30% di Treatwell; il cliente resta tuo" | No-show ridotti, agende riempite |
| NOV | Gifting (enoteche, fiorai, cartolerie) + PMI strutturate | Stagionalità Natale; welfare che va ad Amazon | Gift card cittadina + corporate gifting + welfare territoriale | "Ti porto i soldi del welfare aziendale che oggi vanno ad Amazon" | Primo ordine welfare/gift card incassato |
| DIC | — | — | Stop onboarding: consolidamento e rinnovi | — | Retention |

Esclusi (decisione founder): ristoranti, catene/franchise; pescherie in fase 2.

---

## 7. Roadmap a fasi con cancelli (gate)

**Fase 0 (0-3 mesi) — provare il meccanismo, non costruire tutto**
- Costruire: wallet "Carta Piacenza" MVP (Stripe Connect + Issuing, denaro earmarked) + rituale WhatsApp della lista settimanale, su fresco + cura persona in area circoscritta; catalogo automatico da foto come abilitatore dell'onboarding.
- **Gate per procedere**: riacquisto >40% su una coorte a 8 settimane; ≥1 fonte di denaro earmarked attiva (un'azienda o il Comune).

**Fase 1 (3-9 mesi) — consolidare rituale e data flywheel**
- Costruire: anti-spreco (surprise bag), cashback circolare (spendibile solo nel circuito), click&collect con ritiro unico, misurazione dell'incrementalità (coorti di controllo, dati scontrino).
- **Gate**: incrementalità positiva vs gruppo di controllo; costo per transazione in calo.

**Fase 2 (9-18 mesi) — i grandi flussi**
- Costruire: circuito welfare aziendale su scala (modello TreCuori), assistente d'acquisto AI cross-negozio, analytics del negozio (scontrino elettronico/POS-RT), "MyCity Prime" SOLO se la densità rende la logistica condivisa a margine positivo; gruppi d'acquisto a massa critica raggiunta.

**NON COSTRUIRE (in nessuna fase):** moneta complementare "alternativa all'euro"; dynamic pricing aggressivo; live shopping H24; second-hand; notifiche beacon di prossimità; 12 funzionalità in parallelo.

---

## 8. Metriche: la verità del sistema

- **Stella polare: euro spostati verificati** (incrementalità vs gruppo di controllo). NON il GMV, NON il numero di negozi.
- Salute consumatore: tasso di riacquisto per coorte (target >40% a 8 settimane), frequenza del rituale settimanale, opt-out WhatsApp (deve restare basso), redemption e ricircolo del wallet.
- Salute merchant / segnali di churn (agire PRIMA della disdetta): calo interazioni col Worker; preview non approvate; zero risultati generati in 30-60 giorni; nessun cliente nuovo attribuito; ritardi di pagamento.
- **Regola dei 90 giorni**: il 40-60% del churn SMB avviene lì → quick-win pianificato per segmento + check-in umano periodico.
- **Soglia kill/pivot**: a 6 mesi, riacquisto <25% E nessun ente che immette denaro earmarked → il meccanismo primario non funziona: ridisegnare l'offerta PRIMA di spendere in acquisizione.

---

## 9. I 5 rischi principali (a livello di meccanismo)

1. **Liquidità mancante**: densità insufficiente per categoria (tessuto commerciale piacentino -22,6% in 12 anni) → marketplace vuoto.
2. **Nessun denaro earmarked**: senza Comune/aziende che immettono flussi vincolati resta solo la spesa discrezionale, che perde contro Amazon.
3. **Economia della logistica negativa**: la last-mile brucia cassa (lezione Bristol Pound: la missione non paga i server).
4. **Attrito residuo**: se ordinare in città è anche solo un po' più difficile di un click su Amazon, l'abitudine non si sposta.
5. **Erosione della fiducia su WhatsApp**: frequenza sbagliata = canale primario distrutto.

---

## 10. Vincoli normativi e tecnici

- **Fondi e wallet**: restare nel perimetro Stripe Connect (la piattaforma non entra mai in possesso dei fondi, compliance PSD2) + Stripe Issuing (carte con controlli programmatici: MCC, limiti, autorizzazioni real-time). Emettere moneta elettronica in proprio richiede licenza EMI: NO.
- **Gift card multi-merchant**: le esenzioni closed-loop della normativa e-money UE hanno confini (importi, rimborsabilità, spendibilità) da verificare con un legale prima di scalare.
- **GDPR**: i dati dei clienti finali appartengono al negozio (titolare del trattamento); MyCity è responsabile del trattamento; export sempre possibile.
- **Italia**: integrazione POS-registratori telematici obbligatoria dal 2026 → aggancio naturale per l'analytics del negozio (fase 2). Compliance e-commerce: P.IVA/REA reali e visibili, termini di consegna coerenti.

---

## 11. Decisioni del founder già prese (non ridiscutere senza nuovo motivo)

- Si parte dalle botteghe, poi le altre attività. Ristoranti e catene/franchise esclusi; pescherie in fase 2.
- Consegne in proprio fino a ~30 ordini/giorno; rider (3-5 €/consegna) solo per i picchi orari.
- Packaging termico a carico dei negozi. Kit negozio = QR + vetrofania via copisteria.
- Niente white-label ad altre città: prima Piacenza, gestita da una persona sola.
- Obiettivo: €10.000/mese ≈ 100 negozi × €100/mese; 10-20 fonti di entrata attive entro gennaio 2027; ramp lento del Worker atteso per diffidenza iniziale.
- Filosofia ricavi: molte fonti anche piccole, percepite dai clienti come valore e mai come peso.

---

## 12. Fonti e onestà epistemica

I due report completi (dati, casi, caveat) sono la fonte di verità estesa:

- `docs/ricerca/teoria-del-cambiamento.pdf` — lato consumatore: meccanismi comportamentali, casi Miconex/TreCuori/Too Good To Go/Pinduoduo/Sardex-WIR, fallimenti Cashback di Stato e Bristol Pound, vincoli EMI, playbook del rituale, misurazione.
- `docs/ricerca/bottegaio-cliente-pagante.pdf` — lato merchant: buyer persona, priorità dichiarate, trauma commissioni/agenzie, WTP e pricing, churn e shelfware, concorrenti e vuoto welfare, segmentazione e primo valore.

**Nota di onestà**: parte dei numeri è auto-riportata dai fornitori (Miconex, TreCuori, statistiche WhatsApp) o proviene da proxy (ISTAT copre solo imprese ≥10 addetti): trattarli come ordini di grandezza, non certezze. Le ipotesi si validano con i gate del §7, non si danno per vere. Nessuno è ancora riuscito a spostare la spesa su scala di città: è genuinamente possibile, ma va costruito e misurato passo dopo passo, mai in blocco.

---

---

## 13. Raccordo con la macchina — *aggiunto dall'AD, non fa parte del testo di Nicola*

> Da qui in giù non c'è più il documento di Nicola: ci sono le tre note che servono a una
> sessione di Claude Code per usarlo senza sbagliare. Il testo sopra (§0→§12) è suo, parola per
> parola, e non va riscritto: se un numero cambia, cambia il registro dei fatti e si segnala qui.

**① «Hulii» è il proprietario, cioè Nicola.** Nel §0 e nel §1 il proprietario si chiama *Hulii*.
In tutto il resto della macchina si chiama *Nicola*: nel `CLAUDE.md`, nella memoria, nel Pannello.
MyCity ha un operatore solo, quindi sono la stessa persona. Il §0.3 dice «fermati e segnalalo a
Hulii»: vuol dire fermarsi e chiederlo a Nicola. È una deduzione, non una sua parola. Se sbaglio,
correggila: questa riga sparisce.

**② I numeri vivi stanno nel registro dei fatti, non qui.** Questo documento è il *perché*, e
cambia di rado. Prezzi, date e soglie cambiano spesso, e hanno UNA casa sola:
`MyCity-Vault/90-Memoria-AI/registro-fatti.json` (regola AR-102). Le decisioni del §5, del §6,
del §7, dell'§8 e dell'§11 sono state ricopiate lì l'11/8/2026, con la fonte «CONTESTO_BUSINESS.md».
Così i guardiani possono controllarle a ogni giro. **Se il registro e questo file dicono numeri
diversi, vince il registro.** E chi se ne accorge lo scrive a Nicola: vuol dire che una delle due
case è rimasta indietro.

**③ Tre punti che il documento lascia aperti** (segnalati a Nicola l'11/8/2026 02:12, ancora senza
risposta al momento in cui scrivo):

- **La commissione.** Il §4.1 e il §5 vendono «canone fisso, zero commissioni». Oggi il
  marketplace trattiene il **10% sul venduto**, ed è scritto sia nel registro
  (`pricing.commissione`) sia nel codice del sito. Le due cose stanno insieme solo leggendo
  «zero commissioni **sullo scontrino che il negozio faceva già**» — il 10% resta sugli ordini
  che porta MyCity, cioè denaro nuovo. Finché Nicola non lo conferma, il 10% **non si tocca** e
  la frase «zero commissioni» **non si usa da sola in un pitch**: va detta con il pezzo che la
  rende vera.
- **I 3 pilot a 149 €/mese.** Il §5 dice che il Worker è incluso nei 50 €/mese e poi costa altri
  50. Nel registro c'è ancora `pilot.worker-negozi` = tre negozi founder a **149 €/mese
  bloccato**. Il documento non li nomina: non so se restano a quel prezzo o rientrano nello
  schema nuovo, quindi li ho lasciati come stavano.
- **La stella polare.** L'§8 dice che la stella polare sono gli **euro spostati verificati**, non
  il GMV e non il numero di negozi. Nel registro il contatore storico si chiama ancora
  `northstar.consegnati` (ordini consegnati, oggi 0). Non l'ho rinominato: è un numero letto dal
  database, e serve comunque. Ma «ordini consegnati» adesso è **un contatore, non la stella**.
