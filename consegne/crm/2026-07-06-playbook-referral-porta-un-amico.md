---
tipo: playbook-referral-give-get
reparto: crm-lifecycle
data: 2026-07-06 14:20
stato: ARMATO — nessun invio, dietro gate di scala (arma con la sicura, non un blast)
voce: "il Vicino Orgoglioso" (dà del tu, caldo, civico, mai aziendalese — FLUSSI-LIFECYCLE §voce)
fonte: STATO.md + win-back 6/7 11:40 (segmento cliente verificato MCP Supabase 6/7 11:11) + FLUSSI-LIFECYCLE §5 (testi referral già scritti) + 04-Prodotto-Ops/Funzionalità/Programma Referral.md + coupons DB (BENVENUTO10 first_order_only, SPED5 gratis >€25 — riuso dato verificato, letture live gated in sessione → nessun numero nuovo inventato)
anti-doppione: samir (unico buyer reale) è già coperto da recupero-carrelli A3 / #27 → NON toccato qui (AR-008). Il referral NON gli spara.
owner: crm-lifecycle (owner unico "porta un amico", AR-008)
peer-review-richiesta: @finanza (cap/ROI/holdout montepremi) · @trust-safety (anti-frode) · @legale-privacy (consenso/footer) · @backend-dev + @builder-automazioni (requisiti tecnici v1)
---

# 🤝 Referral "Porta un amico" give-get — PLAYBOOK ARMATO (6/7 14:20)

> **Cos'è questo file.** Il programma referral give-get **completo e firmabile**, ma **con la sicura**:
> oggi non ha nessuno a cui sparare (0 clienti attivi, 1 solo negozio) → **NON parte finché non c'è
> massa**. Come win-back (#24) e MyCity Punti (#28): pronto in canna, dietro un **gate di scala** onesto.
> **Non accodo nessun blast oggi.** L'unica azione accodata è la *firma dell'importo del montepremi*
> (🔴), che serve prima ancora che ci sia un cliente da premiare.

---

## 1) Segmento reale OGGI — la verità, con la fonte

Il referral premia chi **invita** dopo un'esperienza positiva. Quindi l'unico segmento sensato è:
**clienti con ≥1 ordine consegnato + pagato e feedback non-negativo.**

| Metrica | Valore | Fonte |
|---|---|---|
| Profili cliente totali | **23** | MCP Supabase `profiles`, verifica 6/7 11:11 |
| Ordini consegnati + pagati in tutta la storia | **0** (North Star = 0) | MCP `orders`, 6/7 11:11 |
| Unico ordine mai creato (#16, COD €19,05, PQ, 24/6) | **ANNULLATO il 3/7** — mai pagato/consegnato | MCP `orders` |
| **Clienti idonei a invitare** (≥1 consegnato + feedback ok) | **0** | conseguenza diretta: 0 ordini consegnati ⇒ 0 "ambasciatori" |
| Negozi reali in catalogo | **1** (Pane Quotidiano — il faro; Casa Linda = demo esclusa) | STATO.md |

> ⚠️ **Segmento referral = 0 ambasciatori, oggi.** Nessuno ha vissuto un ordine buono → nessuno ha
> qualcosa di vero da consigliare a un vicino. Invitare qualcuno a "portare un amico" prima del primo
> ordine consegnato è un anti-pattern: **si brucia credibilità e si invita a raccomandare il vuoto.**
> Non gonfio la lista, non invento ambasciatori.
>
> 🔒 **L'unico buyer reale (samir)** è già in recupero-carrelli (A3 / #27) e **non ha ancora un ordine
> consegnato** → non è idoneo al referral e **qui NON lo tocco** (AR-008 + zero fatigue su un cliente unico).
>
> 🏪 **Anche il lato offerta non regge il referral oggi:** con **1 solo negozio**, l'amico invitato
> trova una vetrina sola. Il referral rende quando c'è **scelta** (l'invitato riordina perché c'è varietà,
> non solo per il credito). Il gate di scala tiene conto anche di questo.

---

## 2) IL GATE DI SCALA — quando (e solo quando) si arma davvero

Il playbook **non parte** finché **tutte** queste precondizioni non sono vere insieme. È la sicura.

| # | Precondizione (onesta) | Perché | Stato oggi |
|---|---|---|---|
| G1 | **≥20 clienti con ≥1 ordine consegnato + pagato** | Servono ambasciatori reali che abbiano vissuto un'esperienza da raccomandare. Sotto ~20 il referral non ha da chi partire e il k-factor non è misurabile. | ❌ (0 consegnati) |
| G2 | **≥5 negozi reali attivi** in catalogo | L'invitato deve trovare *scelta*, non una vetrina sola, o il credito non genera il 2° ordine. | ❌ (1 negozio) |
| G3 | **Mani Resend attive** (`RESEND_API_KEY` + dominio verificato) + link/pagina invito condivisibile | Senza canale d'invio e senza landing dell'invito, il give-get non gira. | ❌ (Resend OFF) |
| G4 | **Wallet/credito + attribuzione + trigger "primo ordine consegnato"** costruiti (vedi §5) | Il credito deve scattare da solo al momento giusto e essere anti-frode by design. | ❌ (da costruire) |
| G5 | **Importo montepremi + cap mensile firmati** da Nicola (🔴) con ROI/holdout di @finanza | È denaro vero: non parte senza numero firmato e senza tetto di spesa. | ❌ (da firmare — **è l'unica cosa che accodo oggi**) |
| G6 | **Consenso + footer validati** da @legale-privacy (l'invito è marketing) | GDPR: l'invitante gira il proprio link (ok), ma le nostre email give-get sono marketing. | ❌ (da validare) |

> **Finché anche uno solo è ❌ → nessun invito parte.** Oggi sono ❌ tutti e sei. Questo file resta ARMATO
> in attesa che G1 e G2 diventino veri (è lì il collo di bottiglia: servono ordini e negozi, non messaggi).
> **La cosa più utile che il referral può fare oggi è aspettare** — e avere l'importo già firmato per
> partire il giorno in cui la scala c'è.

---

## 3) MECCANICA give-get — proposta (importo → firma Nicola 🔴)

### 3.1 — Il numero: perché 5€ + 5€ (con alternativa motivata)

| Voce | Proposta | Ragionamento (dichiarato, non spacciato per dato locale) |
|---|---|---|
| **Give (all'invitante)** | **5€** di credito | Premia solo a conversione avvenuta; 5€ è percepito come "un regalo vero" ma è ~1/2 di un carrello locale piccolo → non domina il margine. |
| **Get (all'invitato)** | **5€** sul primo ordine, **usabile sopra i 15€** di spesa | Abbassa la barriera al primo ordine senza regalare tutto il carrello; la soglia €15 evita l'ordine "solo per svuotare il credito" e protegge lo scontrino. |
| **Alternativa se il carrello medio risultasse basso** | **give 3€ / get 5€** (asimmetrico) | Se @finanza vede scontrino medio < €15, conviene un give più basso: l'invitato (acquisizione) vale più dell'invitante (già cliente). Asimmetria classica Uber/Glovo. **Scelga @finanza col dato reale del carrello quando esisterà.** |

> ⚠️ **impatto sistema** — **Chi paga il montepremi = il margine MyCity, NON il negozio.** Il negozio
> incassa il prezzo pieno; il credito lo assorbiamo noi. Costo lordo max per conversione = **give + get =
> 10€** (nel caso 5+5). Con un **cap mensile** (proposta iniziale **250€/mese ≈ 25 conversioni**, come già
> ipotizzato in FLUSSI §5.4) il montepremi è limitato e prevedibile. **@finanza fissa cap/ROI con un holdout
> PRIMA del lancio** — l'incrementale (clienti che NON sarebbero arrivati) è ciò che giustifica la spesa,
> non il fatturato lordo generato dai codici.

### 3.2 — Le regole (tutte)

| Regola | Valore | Perché |
|---|---|---|
| **Quando scatta il credito** | Al **primo ordine dell'invitato consegnato E pagato** — **non** alla registrazione, **non** all'ordine creato, **non** se annullato/rimborsato. | Evita frode e "ordini fantasma": si paga solo su valore reale generato. È la lezione di #16 (ordine annullato ≠ conversione). |
| **A chi va il credito** | Invitante +5€, invitato +5€, **entrambi allo stesso evento** (ordine invitato consegnato). | L'invitante non guadagna finché l'amico non completa davvero. |
| **Tetto per invitante** | Max **5 inviti premiati/mese** (25€ di give max a testa/mese). | Blocca il "referral farming" da un singolo account. |
| **1× per invitato** | Un invitato riceve il get **una sola volta**, mai riutilizzabile né cumulabile. | Anti-abuso base (Programma Referral §requisiti). |
| **Soglia minima carrello** | Get usabile **sopra €15** di spesa (netto consegna). | Protegge lo scontrino e il margine. |
| **Scadenza credito** | **60 giorni** dall'emissione, sia give che get. | Crea urgenza + evita passività a bilancio aperte all'infinito. |
| **Non cumulabile** | Il get **non si somma** a `BENVENUTO10` (già `first_order_only`) né ad altri coupon primo-ordine. | Un solo incentivo di benvenuto per cliente: no stacking di margine. |
| **Codice/link** | **1 codice/link univoco per cliente** (`mycity.pc.it/invito/CODICE-[NOME]`), condivisibile WhatsApp/di persona. | Attribuzione pulita, tracciabile. |

---

## 4) ANTI-FRODE — checklist implementabile (peer review @trust-safety)

> Requisito esplicito. Il referral è la leva più abusata di un marketplace: va **anti-frode by design**,
> non "aggiustato dopo". Elenco pronto da implementare per @backend-dev / @builder-automazioni.
> **PASSO-A @trust-safety:** validare questa lista e i cluster-rule prima del lancio.

**A — Identità / self-referral (blocco a monte):**
- [ ] **No self-referral:** invitante e invitato **non possono** condividere stessa **email** (normalizzata: rimuovi punti/`+alias` su gmail), **numero di telefono**, **IBAN/carta** di pagamento, **device fingerprint**, **indirizzo di consegna**.
- [ ] **Match indirizzo:** stesso indirizzo di consegna invitante↔invitato → conversione **sospesa** per review manuale (non auto-negata: coinquilini reali esistono).
- [ ] **Email usa-e-getta:** blocklist domini temporanei (mailinator, guerrillamail, ecc.) → invitato non idoneo al get.

**B — Evento di credito (paga solo il valore reale):**
- [ ] Credito **solo** su ordine invitato in stato **`Consegnato` + `Pagato`** (COD incassato o Stripe `paid`), **mai** su `Creato/Accettato/Annullato/Rimborsato`.
- [ ] Se l'ordine viene **rimborsato/annullato entro 30gg** → **clawback**: il credito give+get viene revocato (o non emesso se ancora in holding).
- [ ] Get **1× per invitato** (flag DB), give **max 5/mese per invitante**.

**C — Cluster / abuso di scala:**
- [ ] **Cap giornaliero:** max N conversioni referral/giorno per invitante (proposta 2/giorno) → oltre = review.
- [ ] **Blocco cluster stesso device/IP:** ≥3 account nuovi dallo stesso device fingerprint o IP in 24h con lo stesso codice invito → cluster flaggato, crediti in holding.
- [ ] **Velocità sospetta:** invito→registrazione→ordine in < X minuti ripetuto → segnale di bot/farm.
- [ ] **Nuovi account che ordinano solo col credito e mai più** → segnale di farm (metrica di monitoraggio, non blocco automatico).

**D — Governance:**
- [ ] Ogni conversione referral logga: invitante, invitato, codice, ordine, evento, esito anti-frode → tabella `referrals` auditabile.
- [ ] Crediti in **holding** finché i check passano; rilascio automatico dopo consegna+pagamento+finestra clawback.

---

## 5) REQUISITI TECNICI v1 (per quando si costruisce — @backend-dev)

> Riusa `04-Prodotto-Ops/Funzionalità/Programma Referral.md` (Note tecniche: codici univoci, attribuzione,
> wallet/credito). **PASSO-A @backend-dev + @builder-automazioni.**

- **Codice univoco per utente** — generato al primo ordine consegnato (non alla registrazione), formato `CODICE-[NOME]`, immutabile.
- **Attribuzione** — link `/invito/CODICE` setta cookie/param; alla registrazione dell'invitato lega `referred_by` al codice; alla consegna+pagamento del suo 1° ordine scatta l'emissione.
- **Wallet/credito utente** — saldo credito per profilo, movimenti (emesso/usato/scaduto/revocato), scadenza 60gg, usabile solo sopra soglia €15, non cumulabile con coupon primo-ordine.
- **Trigger "primo ordine consegnato + pagato"** — hook su [[Gestione Stato Ordine]] → verifica anti-frode (§4) → emissione give+get in holding → rilascio dopo finestra clawback.
- **Non-stacking:** il motore coupon deve rifiutare get + `BENVENUTO10`/`SPED5` primo-ordine sullo stesso checkout.

---

## 6) I MESSAGGI PRONTI (voce "Vicino Orgoglioso" — segnaposti evidenti, footer consenso)

> `[Nome]` / `[Codice]` / `[Bottega]` sono **segnaposti evidenti**: si popolano dal profilo/ordine reale
> al momento dell'invio, **mai a mano, mai inventati**. Nessun dato o numero finto. Costruiti su
> FLUSSI-LIFECYCLE §5.1–5.2, aggiornati a give-get 5+5 e alla realtà multi-bottega.
> **PASSO-A @legale-privacy:** validare footer disiscrizione + testo consenso marketing prima del 1° invio.

### 6.1 — 📲 INVITO che il cliente manda all'amico (WhatsApp / condivisibile)

> Testo copiabile che il cliente gira su WhatsApp o legge di persona. Corto, personale, dal cliente (non da noi).

**WhatsApp (una riga + link):**
> Ehi! Ho scoperto MyCity, ti portano a casa la spesa dalle botteghe del centro di Piacenza 🧡 Ti regalo 5€ sul primo ordine, prendi il mio link: mycity.pc.it/invito/[Codice]

**Versione lunga condivisibile (per chi vuole spiegare):**
> Da un po' faccio la spesa su MyCity: scelgo dalle botteghe vere del centro — [Bottega] e le altre — e me la portano a casa a mano. Se provi col mio link hai **5€ sul primo ordine** (e ne arrivano 5 anche a me quando ordini). Tieni: 👉 mycity.pc.it/invito/[Codice]

---

### 6.2 — ✉️ "HAI UN CREDITO DA REGALARE" · all'invitante (email/notifica)

**Oggetto:** [Nome], porta un vicino nel centro — 5€ a te, 5€ a lui 🧡
**Preheader:** Il tuo link personale. Più vicini ordinano, più botteghe restano aperte.

> Ciao [Nome],
>
> ti è piaciuta la spesa da [Bottega]? Fai una cosa bella: **dillo a un vicino.**
>
> Quando una persona che inviti fa il suo primo ordine e gli arriva a casa, **5€ vanno a lui e 5€ vanno a te.** Semplice, e senza fretta.
>
> Ecco il tuo link personale, da girare su WhatsApp o dire di persona:
> 👉 **mycity.pc.it/invito/[Codice]**
>
> Ogni vicino che ordina è una bottega del centro che incassa, un negoziante che tiene aperto. Non è solo un credito: è la città che si tiene su a vicenda. 🧡
>
> Grazie,
> Nicola — MyCity
> *Il marketplace delle botteghe del centro di Piacenza*

*Footer:* MyCity, Piacenza · Ricevi questa mail perché sei un cliente MyCity e hai dato il consenso alle comunicazioni · [Disiscriviti]

---

### 6.3 — ✉️ BENVENUTO all'invitato con il credito (email/notifica)

**Oggetto:** [Nome] ti regala 5€ sulla spesa delle botteghe del centro 🧡
**Preheader:** La tua bottega di fiducia, consegnata a casa. Inizi con 5€ di benvenuto.

> Ciao,
>
> **[Nome] ti ha invitato** su MyCity — e con il suo invito hai **5€ sul tuo primo ordine.**
>
> MyCity ti riporta a casa le vere botteghe del centro di Piacenza: la panetteria, la salumeria, il negozio di fiducia. Ordini, te lo portiamo a mano. Paghi anche alla consegna, se preferisci.
>
> 👉 **[Usa i tuoi 5€ — scegli la tua bottega]**
>
> *(Il credito vale su una spesa da almeno 15€, entro 60 giorni. Il resto lo spieghiamo al checkout, senza sorprese.)*
>
> Le botteghe del centro stanno sparendo. Con un ordine, le tieni aperte.
> Benvenuto tra i vicini,
> Nicola — MyCity

*Footer:* MyCity, Piacenza · Hai ricevuto questo invito da [Nome] · [Non voglio ricevere inviti]

---

### 6.4 — 🔔 "IL TUO AMICO HA ORDINATO, HAI GUADAGNATO 5€" · all'invitante (notifica/email)

**Oggetto:** Ci sei riuscito, [Nome] — hai 5€ di credito 🎉
**Preheader:** Il vicino che hai invitato ha ricevuto la sua spesa. Grazie.

> Ciao [Nome],
>
> il vicino che hai invitato ha appena ricevuto la sua prima spesa dalle botteghe del centro — e tu, per averlo portato qui, hai **5€ di credito** pronti sul tuo prossimo ordine. 🎉
>
> 👉 **[Usa i tuoi 5€ da [Bottega]]**
>
> *(Valgono su una spesa da almeno 15€, entro 60 giorni.)*
>
> Grazie davvero: ogni vicino che porti è una bottega che tiene aperto. Continua pure — c'è credito per i prossimi che inviti.
>
> A presto,
> Nicola — MyCity

*Footer:* MyCity, Piacenza · [Disiscriviti]

---

## 7) KPI / MISURA (stime oneste, NON dati locali)

- **% nuovi clienti da referral** — quota di nuovi buyer arrivati con codice invito. *Nessun target locale: storico = 0 invii.*
- **CAC referral vs altri canali** — costo per cliente acquisito = montepremi speso / conversioni. **Atteso << CAC ads** (benchmark di categoria, non dato MyCity): il referral è tipicamente il canale più economico perché paga solo a conversione.
- **k-factor** — inviti inviati × tasso conversione per invitante. Obiettivo strutturale **k > 0.5** per contribuire alla crescita (benchmark, non promessa).
- **Holdout obbligatorio** — tenere un **10–20%** di clienti idonei **fuori** dal referral per misurare l'**incrementale** (quanti amici sarebbero arrivati comunque). Il numero che conta è il **delta**, non le conversioni lorde attribuite al codice.
- **Loop:** al primo ciclo reale, scrivere l'esito (conversioni, CAC, k-factor, incrementale) in `memoria-squadra/crm-lifecycle.md`.

---

## ✅ Cancello onestà (auto-analisi a 3 livelli — passato prima di consegnare)

**L1 — è vero?**
- [x] **0 numeri finti** — 23 profili / 0 consegnati / 1 negozio hanno fonte (MCP 6/7 11:11 + STATO); importi (5+5, cap 250€) marcati come **proposte da firmare**; KPI marcati come **benchmark esterni**, non dati MyCity.
- [x] **0 destinatari inventati** — segmento ambasciatori dichiarato **VUOTO**; `[Nome]/[Codice]/[Bottega]` sono segnaposti evidenti.

**L2 — è la mossa giusta?**
- [x] **Gate di scala onesto** — non parte finché non ci sono ~20 clienti consegnati + 5 negozi (G1/G2 sono il vero collo di bottiglia, non i messaggi). Rispetta AR-006: sforzo pesante NON su un'ipotesi.
- [x] **Anti-doppione** — samir escluso (già A3/#27, e comunque non idoneo: 0 ordini consegnati). AR-008 rispettato.
- [x] **Incrementale > lordo** — holdout richiesto; montepremi giustificato dal delta, non dalle conversioni attribuite.

**L3 — cosa può rompersi?**
- [x] **Impatto margine segnalato** — montepremi = margine MyCity; cap + ROI + holdout deferiti a @finanza PRIMA del lancio.
- [x] **Frode** — checklist §4 completa, peer review @trust-safety richiesta.
- [x] **Consenso** — invito è marketing; footer + consenso deferiti a @legale-privacy.
- [x] **Colore** — progettare/scrivere 🟢 (fatto io) · pubblicare l'incentivo in denaro 🔴 (firma Nicola).
- [x] **Nessun invio** — 6/6 gate chiusi; l'unica cosa accodata è la firma dell'importo (🔴), non un blast.
