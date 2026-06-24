# 🧱 Prompt per il Business Model Canvas (vista Strategyzer)

> **Cosa fa:** genera il **Business Model Canvas** di MyCity fatto come lo farebbe un esperto (metodo Osterwalder/Strategyzer), con il trattamento **multi-sided** che un marketplace richiede (un lato non basta) + Value Proposition Canvas per i segmenti chiave + test delle assunzioni rischiose.
> **Diverso da [[Piano d'Azione]] e [[Piano di Notorieta 2026]]:** quelli producono *piani operativi*. QUESTO produce il **modello di business** (la fotografia strategica: chi serviamo, con quale valore, come guadagniamo, cosa ci serve, cosa rischiamo).
> **Come si usa:** copia tutto il blocco tra `=== INIZIO PROMPT ===` e `=== FINE PROMPT ===` e incollalo in una nuova sessione di Claude/LLM. È autosufficiente: non serve allegare la vault.
> **Prima di lanciarlo:** controlla i parametri 🔧 (numeri economici, scadenza bando) e aggiornali se sono cambiati.
> Fonti dei dati → [[Finanza & Unit Economics]] · [[Strategia & Fossato]] · [[Clienti, Personas & Crescita]] · [[Brand & Posizionamento]] · [[Tecnologia & Stack]].

---

`=== INIZIO PROMPT ===`

# RUOLO
Agisci come un **business model strategist senior**, esperto del metodo **Strategyzer di Alexander Osterwalder & Yves Pigneur** (*Business Model Generation* + *Value Proposition Design* + *Testing Business Ideas*), con specializzazione in **marketplace e piattaforme multi-sided** (hai disegnato modelli per piattaforme a due e tre lati e conosci i loro pattern: network effects, cold-start, chicken-and-egg, take rate, lato difficile/lato facile). Non sei un consulente che riempie caselle: ragioni come un operatore che usa il canvas per **prendere decisioni e scoprire dove il modello può rompersi**.

# MISSIONE
Produci il **Business Model Canvas completo e preciso di "MyCity"**, trattandolo per ciò che è — una **piattaforma multi-sided** — e non come un'azienda lineare. Devi:
1. Compilare i **9 blocchi** del canvas in modo rigoroso, specifico e quantificato (niente genericità da slide).
2. Gestire esplicitamente la **multi-lateralità**: i blocchi rivolti al cliente (Segmenti, Proposte di Valore, Canali, Relazioni, Ricavi) vanno **declinati lato per lato e persona per persona**, perché in un marketplace ogni lato ha bisogni, canali ed economie diversi.
3. Distinguere lo stato **"Anno 1 / oggi"** dal modello **"a regime"** (i 3 motori di ricavo), perché il business model evolve.
4. Aggiungere il **Value Proposition Canvas** (jobs/pains/gains ↔ prodotti/pain reliever/gain creator) per i 2 segmenti che reggono tutto.
5. Chiudere con il **test del modello**: assunzioni rischiose ("leap-of-faith") ordinate per pericolosità, e il controllo di coerenza tra i blocchi.

# METODO (come un esperto compila il canvas)
- **Etichetta ogni voce con il livello di evidenza:** 🟢 fatto/fonte · 🟡 assunzione plausibile da validare · 🔴 dato critico ancora da raccogliere (ipotesi pericolosa). Un canvas onesto mostra cosa sa e cosa sta scommettendo.
- **Quantifica sempre che puoi** (numeri, %, €): un blocco senza numeri è un'opinione.
- **Mostra i collegamenti**: ogni Proposta di Valore deve agganciarsi a un Segmento; ogni Attività/Risorsa Chiave deve servire una Proposta di Valore; ogni Ricavo a un Segmento. Se un blocco non si collega a nulla, segnalalo.
- **Pensa come Strategyzer**: separa *desiderabilità* (lo vogliono i clienti?), *fattibilità* (sappiamo costruirlo/consegnarlo?) e *viabilità* (i conti chiudono?).

# CONTESTO (tutto ciò che ti serve — il modello è già abbastanza maturo da non andare inventato)

## Cos'è MyCity
Marketplace locale delle **botteghe del centro storico di Piacenza** (food/freschi: pane, gastronomia, ortofrutta, salumi, macelleria, pasticceria, enoteca, fiori). Il cliente fa **una sola spesa multi-negozio** dalle botteghe del quartiere e la riceve a casa. Modello mentale: **Amazon** (catalogo+fiducia) × **eBay** (venditori+reputazione) × **Glovo** (consegna locale). Posizionamento scelto: **non "l'ennesima app di delivery", ma infrastruttura civica che salva le botteghe del centro** dalla desertificazione.
- **Stato:** software già costruito al ~90% (PWA Next.js + Supabase). Esistono già: onboarding negozi self-service con **estrazione prodotti da foto via AI** (~20 min/negozio), dashboard venditore, catalogo, ricerca, carrello/checkout multi-bottega, pagamenti Stripe Connect + contrassegno, KYC, recensioni/reputazione, referral, gift card, wallet, ordini di gruppo, notifiche, gestione ordini/stati, area rider. **Il collo di bottiglia NON è il prodotto: è la distribuzione/domanda.**
- **Consegna:** rider proprio (all'inizio il fondatore) su **cargo-bike elettrica** (accesso ZTL 8-19), **batching giornaliero D+1** con consolidamento. Regola di unit economics: **non si consegna sotto i 2 ordini per giro** → la **densità in un solo cluster** è vitale.

## I 3 LATI del cliente (un marketplace ha più di un cliente)
1. **NEGOZI/BOTTEGHE — il lato OFFERTA (lato difficile, da conquistare per primo).** Non "tutti": i **~6 negozi di un "carrello minimo vitale"** (pane + ortofrutta + salumi/gastronomia + macelleria + pasticceria + jolly enoteca/fioraio), **contigui in UN cluster** (Via Calzolai–Piazza Duomo–Chiapponi), a partire dal **"negozio-faro"** (bottegaio influente e chiacchierone → testimonial). Profilo ideale: prodotto a riacquisto frequente, già fa consegne informali, titolare <50 anni, ticket medio ≥15-20€. Segmenti negozi in sequenza: A "Delivery-Ready" (gastronomie/ortofrutta già su Glovo, stufe del 30%) → B "Scettici razionali" (macellerie, dopo la prova sociale) → C trainati da bando + contagio. **Ogni bottega firmata porta in dote i suoi clienti fedeli (CAC~0) → l'offerta è anche il canale di acquisizione della domanda.**
2. **ACQUIRENTI — il lato DOMANDA (portato DAI negozi).** Personas:
   - 🥇 **Giulia (BEACHHEAD)** = famiglia/coppia che lavora nel cluster o entro ~1 km. JTBD: *"completa la spesa settimanale di freschi senza ZTL né girare 5 botteghe a piedi"*. Frequenza **settimanale** (crea abitudine), scontrino 40-60€, AOV ~€50, WTP fee 3-5€. Acquisibile a **CAC~0** perché già cliente di quelle botteghe. Obiezione #1: 🔴 *"i freschi me li scelgo io"*.
   - **Caregiver di anziani soli** (Anna+Roberto, persona doppia: il figlio ordina/paga, la madre riceve; ~5.600 over-75 soli a Piacenza). JTBD del figlio: *"curare mia madre a distanza"*. **WTP altissima (5-8€), churn quasi nullo.** Canale: il figlio (farmacie, FB, eventuale convenzione Servizi Sociali/SAD).
   - **Single (Marco)** (>1/3 famiglie unipersonali): fee-sensitive, scontrino 20-35€, mal tollera il minimo alto, convertibile con **abbonamento**.
   - **Turista/emigrato (Elena)** → box DOP spediti (margine alto, **stagionale**, è il Motore 2, non abitudine).
   - Satelliti: **studenti** (~3.400, motore di passaparola + ponte export DOP) · **welfare aziendale** (B2B2C, 1 sì = decine di clienti).
3. **ISTITUZIONI — acceleratori, NON clienti paganti.** Non comprano ma **moltiplicano offerta + domanda + legittimità** e creano un fossato di legittimità che un clone non replica. Rolodex reale (verificato giugno 2026): **Comune di Piacenza** (sindaca **Katia Tarasconi**; assessore unico **Simone Fornasari**, deleghe commercio+marketing territoriale+centro storico+innovazione); **Hub Urbano della Città di Piacenza** (1.149 spazi, adesione gratuita, governato da "Cabina di Regia" Comune+Confcommercio+Confesercenti+CNA+Vita in Centro; **porta d'ingresso = associazione "Vita in Centro a Piacenza"**, pres. Eugenia Maserati); **Camera di Commercio dell'Emilia** (canale PID + Voucher); associazioni di categoria (Confcommercio pres. **Raffaele Chiappa**, Confesercenti, CNA, **Coldiretti/Campagna Amica** per la filiera corta); consorzi **DOP** piacentini (unica provincia europea con 3 salumi DOP). Attenzione: esiste già `CompraPiacenza.it` (vetrina del commercio promossa dal Comune) → trattare come **complementare** (loro vetrina; MyCity transazione+logistica+consegna), non come nemico.

## Cosa cerca ogni lato (il bisogno reale → base delle Proposte di Valore)
| Lato | Quello che cerca (e nessuno gli dà bene) |
|---|---|
| **Negozi** | Più clienti **senza** il ~30% di Glovo (odiato); sopravvivere alla **desertificazione** (centro PC: −22% negozi in 12 anni, da 642 a ~550); andare online **senza fatica** (foto→AI). |
| **Acquirenti** | I freschi delle proprie botteghe **senza fare 5 negozi a piedi in ZTL**; recuperare tempo; (caregiver) prendersi cura di un genitore a distanza. |
| **Enti pubblici** | Anti-desertificazione, "città dei 15 minuti", inclusione digitale anziani, **city-logistics sostenibile** (cargo-bike — oggi non esiste un progetto pubblico), valorizzazione DOP/turismo. → MyCity = **infrastruttura civica che realizza obiettivi già dichiarati dal Comune**. |

## Brand & posizionamento (input per la Proposta di Valore)
- **Tesi:** MyCity non vende la spesa, vende **l'appartenenza** — ogni ordine è un atto civico ("tieni viva una saracinesca"). Lo spazio bianco: *"l'unica spesa a domicilio che è ancora roba di Piacenza"* (Glovo = impulso/globale; Amazon/GDO = settimanale/impersonale; il quadrante "spesa settimanale + di Piacenza + relazione umana" è vuoto).
- Tagline guida: **"La spesa che tiene viva la città."** Modello di riferimento: **Bookshop.org** ("l'anti-Amazon" delle librerie indipendenti).
- ⚠️ Naming "MyCity" è considerato debole per un brand civico (decisione aperta; candidato: *Bottega Piacenza*). Non è un blocco del canvas ma incide sulla Proposta di Valore di marca.

## Economia del modello (per Ricavi, Costi, Viabilità) 🔧
- **Architettura ricavi — il margine è nel MIX, non nella sola commissione.** Un marketplace di sola commissione+consegna NON chiude (caso Cortilia: €41,9M ricavi 2024, ancora in perdita dopo 14 anni).
  - **Commissione al negozio 10-15%** (base 12% ≈ €6 su AOV €50) — contro il ~30% di Glovo. *Anno 1 ≈ 55% dei ricavi.*
  - **Fee di consegna al cliente €2,50-5** (base €3,50). *Anno 1 ≈ 30% dei ricavi.*
  - **A regime (margine quasi puro):** **abbonamento/membership**, **box DOP spediti** (Motore 2, nazionale), **welfare B2B2C** (Motore 3), **fee di promozione/visibilità ai negozi**, gift card/wallet.
- **Unit economics (il conto che decide tutto):** ricavo/ordine ≈ €9,50; costo variabile non-rider ≈ €2,57 (packaging €1,20 + Stripe €1,37); costo rider €7/giro. → **CM/ordine: 1 ordine/giro = −€0,07 (perde); 2 = +€3,43; 3 = +€4,60; 5 = +€5,53.** Target 4-6 ordini/giro. **L'ordine singolo perde: il margine nasce dal batching.**
- **Break-even:** costi fissi Anno 1 ~€4.000/mese; CM medio ~€5,18 → **~160 ordini/settimana ≈ 150-320 clienti attivi** (NON migliaia).
- **KPI target:** CAC < €30 · LTV cliente fedele ~€400 · **LTV:CAC ≥ 3** (stima ~16:1 se la frequenza settimanale regge) · payback < 12 mesi.
- **Capitale fino al break-even:** ~€120-180k, da coprire **a tasso zero/fondo perduto PRIMA dell'equity** (Smart&Start, ON Tasso Zero, **Bando Commercio ER 2026** 40% fondo perduto fino al 🔧 **21 luglio 2026**, Voucher PI25 CdC). Burn ~€3-4k/mese → con €150k >30 mesi di autonomia. **Il rischio non è il runway: è la frequenza di riacquisto.**
- **Proiezione 3 anni 🟡:** A1: 8 negozi / 250 clienti / GMV €325k / ricavi €62k / EBITDA −€26k · A2: 30 / 900 / €1,72M / €360k / −€25k · A3: 70 / 2.500 / €6,44M / €1,48M / **+€330k**.

## Risorse, Attività, Partner (per i blocchi infrastruttura)
- **Stack ("buy the boring, build the core"):** BUILD i 3 pezzi unici (carrello multi-bottega, split payment, batching consegne); BUY l'infra noiosa — **Stripe Connect Express** (pagamenti+KYC, scarica la compliance PSD2/AML, pattern "Separate Charges & Transfers"), **Supabase** (DB/auth/storage EU, RLS = difesa privacy), **Vercel**, **Google Gemini Flash** (AI vision onboarding, ~€0,10-0,50/bottega), **WhatsApp Cloud API** (ordini ai negozi), PostHog, n8n. Costi tech €50-250/mese.
- **Asset unici:** la codebase/3 feature core, l'onboarding AI foto→catalogo in 20 min, il **pass ZTL + cargo-bike**, le **relazioni esclusive con le botteghe** (moat solo se rese esclusive), il **brand civico "di Piacenza"** (incopiabile per definizione), i **dati** (moat futuro, prematuro ora), il **fondatore full-time** (oggi anche venditore e rider).
- **I 3 motori di ricavo (il modello "a regime"):** ① **Delivery locale** = il moat e il brand (margine sottile). ② **Box DOP nazionale** = il margine e la scala (slegato dalla densità → probabilmente il vero motore di valore economico). ③ **Welfare/sociale B2B2C** = stabilità e legittimità (domanda ricorrente a CAC~0, riempie i batch). Ordine: scala ① fino alla liquidità su Piacenza → accendi ② come cash engine → sistematizza ③.

## Canali & Relazioni (per i blocchi omonimi)
- **Canale #1 = il negozio stesso** (QR alla cassa + sacchetto/packaging brandizzato + vetrofania; incentivo **performance-gated**, premi quando i clienti portati completano N ordini). Poi: gruppi Facebook/WhatsApp di quartiere, volantinaggio mirato nel cluster, Instagram dei negozi, eventi cittadini, earned media locale (Libertà/PiacenzaSera/Telelibertà), referral/gifting/ordini di gruppo (già nel prodotto).
- **5 loop di crescita organica:** ① negozio-come-canale ② "regala una spesa" (gifting) ③ ordine di gruppo per via ④ referral give-get bilaterale a ciclo breve ⑤ prova sociale di prossimità ("vedo il sacchetto del vicino"). Loop 2-3-4 **già costruiti** nel prodotto → vanno attivati, non sviluppati.
- **Relazione coi clienti:** **lancio concierge** (i primi ~10 ordini a mano, telefonata dopo la consegna); fiducia verificabile (recensioni, KYC, reputazione, dispute, reso); con i negozi relazione di **partnership/lock-in esclusivo** (esclusiva centro + integrazione operativa).

## Strategia & rischio (per il test del modello)
- **Moat reale = (rete locale × densità × relazioni esclusive) tenuti insieme dal marchio civico.** Network effects **locali** (vincere Piacenza non aiuta Parma → ogni città è un cold-start; ma Glovo non può schiacciarti con la rete globale). Espansione cluster-per-cluster poi città-per-città (Parma, Reggio, Modena, Ferrara).
- **Le 5 scommesse (se false, affondano l'azienda):** ① esiste domanda **ricorrente** reale (non curiosità una tantum); ② le unit economics cluster+batch sono **positive** a regime; ③ le relazioni coi negozi diventano **lock-in esclusivo**; ④ il box DOP nazionale è **scalabile a margine sano**; ⑤ i colossi non costruiscono un prodotto su misura **prima** che tu abbia il moat. (① e ② vanno validate per prime: economiche da testare, fatali se false.)
- **North Star:** *ordini qualificati consegnati/settimana* (clienti unici, on-time, no rimborso, item-fill ≥90%). NON GMV/download/n. negozi.
- **Anti-pattern:** sconti profondi (cacciatori di offerte); espansione geografica prematura (morte n.1 per mancanza di densità); cattiva prima esperienza (azzera la retention); disintermediazione (negozio+cliente fuori piattaforma); box rigido in abbonamento mal gestito.

# OUTPUT RICHIESTO (il Business Model Canvas come lo consegnerebbe un esperto)

Struttura la risposta esattamente così:

### 1. Snapshot del modello (5 righe)
In che "tipo" di business model rientra MyCity (riconosci i **pattern**: piattaforma multi-sided, long-tail dell'offerta locale, modello a take-rate + servizio logistico, elementi freemium/abbonamento) e qual è la **storia in una frase**: chi serve, con quale valore unico, come fa i soldi.

### 2. Il Business Model Canvas — i 9 blocchi
Compila **tutti e 9 i blocchi**. Per i 5 blocchi rivolti al cliente, **declina lato per lato** (Negozi / Acquirenti-per-persona / Istituzioni). Usa tabelle. Su ogni voce metti l'etichetta di evidenza 🟢/🟡/🔴. Per i blocchi che evolvono, distingui **"Anno 1 / oggi"** da **"a regime"**.

1. **Customer Segments** — i 3 lati + le personas; chi paga e chi no; qual è il beachhead e perché.
2. **Value Propositions** — una proposta distinta **per ogni segmento** (negozio, Giulia, caregiver, single, turista/box, welfare, ente), legata al job-to-be-done e all'obiezione #1; più la proposta di **marca civica** trasversale.
3. **Channels** — per acquisire / consegnare valore / fare assistenza, lato per lato; evidenzia che **l'offerta è il canale della domanda** e i 5 loop organici.
4. **Customer Relationships** — tipo di relazione per segmento (concierge, self-service, community, partnership esclusiva coi negozi, fiducia verificabile); leve di retention e di lock-in.
5. **Revenue Streams** — ogni flusso con **meccanismo di prezzo e numeri** (commissione 10-15%, fee €2,50-5, abbonamento, box DOP, welfare, fee promo); il **mix Anno 1 vs a regime** e i **3 motori**; nota perché la sola commissione non basta.
6. **Key Resources** — fisiche/intellettuali/umane/finanziarie (codebase+3 core, onboarding AI, cargo-bike+pass ZTL, relazioni esclusive, brand civico, dati, fondatore, capitale fondo-perduto).
7. **Key Activities** — acquisizione supply, onboarding foto→AI, orchestrazione batching/last-mile, attivazione dei 5 loop, customer success concierge, gestione fiducia (KYC/recensioni/dispute), public affairs/bandi.
8. **Key Partnerships** — botteghe (esclusiva), infra tech (Stripe/Supabase/Gemini/WhatsApp), rider, istituzioni (Comune/Fornasari, Hub Urbano via Vita in Centro, CdC/PID, associazioni, Campagna Amica), consorzi DOP, media locali, bandi/finanziatori pubblici; per ognuno **perché** e **cosa si scambia**.
9. **Cost Structure** — fissi (~€4k/mese: fondatore + marketing) vs variabili (rider €7/giro, packaging €1,20, Stripe €1,37, tech €50-250/mese); cost-driven vs value-driven; il punto in cui il batching ribalta il CM; break-even ~160 ordini/sett; fabbisogno €120-180k.

> Dopo le tabelle, includi una **rappresentazione visiva del canvas** in formato testo/markdown (i 9 riquadri nella disposizione classica Strategyzer), con 3-5 bullet sintetici per riquadro, così che sia leggibile a colpo d'occhio.

### 3. Value Proposition Canvas (i 2 segmenti che reggono tutto)
Per **(a) il negozio-faro** e **(b) Giulia (beachhead)**, compila il VPC:
- **Profilo cliente:** Customer Jobs (funzionale/emotivo/sociale) · Pains · Gains.
- **Mappa del valore:** Prodotti & Servizi · Pain Relievers · Gain Creators.
- Evidenzia il **fit** (quali pain reliever/gain creator colpiscono i pain/gain più intensi) e il **gap** (dove il fit è ancora un'ipotesi 🔴, es. "i freschi scelti da altri").

### 4. Coerenza del modello (la prova del nove)
Spiega come i 9 blocchi **si rinforzano a vicenda** in una storia sola (es.: relazioni esclusive coi negozi → canale a CAC~0 → densità nel cluster → batching → CM positivo → margine per reinvestire). Indica **dove la catena è più fragile**. Valuta separatamente **desiderabilità / fattibilità / viabilità** con un semaforo per ciascuna.

### 5. Le assunzioni rischiose (leap-of-faith) e come testarle
Una tabella delle **5-8 ipotesi più pericolose** del modello (parti dalle 5 scommesse e dalle voci 🔴), ordinate per **(impatto se falsa × incertezza)**. Per ognuna: il blocco del canvas che colpisce, il **test più economico** per validarla (preferendo i primi 10 ordini concierge ai sondaggi), il **segnale di pass/fail**, e cosa cambia nel canvas se risulta falsa.

### 6. Le 3 mosse che migliorano il modello
Le 3 modifiche al business model con il miglior rapporto impatto/sforzo (es.: accendere il Motore 2 box DOP per la viabilità; rendere esclusive le relazioni coi negozi per il moat; introdurre l'abbonamento per stabilizzare la frequenza). Per ognuna: quale blocco cambia e perché muove i numeri.

# STILE
Da esperto Strategyzer, in italiano, **denso e specifico per Piacenza** (nomi, numeri, € reali — niente caselle generiche). Tabelle ovunque aiutino. Ogni affermazione importante porta la sua etichetta di evidenza 🟢/🟡/🔴. Quando usi un numero, è uno di quelli del contesto (non inventarne di nuovi senza dichiararlo assunzione). Niente teoria fine a sé stessa: il canvas deve servire a decidere.

`=== FINE PROMPT ===`

---

#prompt #business-model-canvas #strategia #bmc #piacenza #priorità/alta
