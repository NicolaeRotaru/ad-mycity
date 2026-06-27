---
tipo: kit-mestiere
ruolo: cro
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-06-27 · carburante reale atteso (eventi funnel puliti + volume)
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · MyCity-Vault/03-Funzionalità/Carrello e Checkout.md
---

# 🧰 KIT MESTIERE — CRO / Experimentation (il "cervello allenato" del fuoriclasse)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un pro **sa e usa**
> (strati 3-6): il sapere, gli strumenti passo-passo, la galleria di esempi, e il carburante che serve.
> Leggilo come la tua testa da 15 anni di mestiere (Booking/Amazon/Shopify Plus). Bersaglio:
> **L7-con-giudizio** (vedi [[RUBRICA-LIVELLI]]). Verità prima di tutto: un test si vince con i numeri, non con le opinioni.

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Psicologia della conversione — perché un umano clicca "Paga" (o scappa)
- **La conversione è una bilancia, non un bottone.** Modello **BJ Fogg: B = M·A·T** (Behavior = Motivation ×
  Ability × Trigger). L'azione avviene solo se nello stesso istante: motivazione alta abbastanza **E** azione
  facile abbastanza **E** c'è un innesco visibile. → Se non convertono, una delle tre manca: o non vogliono
  (motivazione/valore), o è troppo difficile (frizione), o non c'è un trigger chiaro (CTA invisibile). Diagnostica così, sempre.
- **Equazione di Eisenberg (LIFT):** la conversione di una pagina sale con **proposta di valore + rilevanza +
  chiarezza + urgenza(vera)** e scende con **ansia + distrazione**. Le due leve negative (ansia, distrazione)
  spesso valgono più delle positive: togliere paura e rumore batte aggiungere persuasione.
- **Avversione alla perdita (Kahneman):** una perdita pesa ~2x un guadagno equivalente. "Hai 3 articoli nel
  carrello" trattiene più di "Aggiungi articoli". Ma usata onesta, mai con countdown finti (dark pattern → rompono fiducia e sono sanzionabili).
- **Paradosso della scelta:** più opzioni = più paralisi e meno conversione (Iyengar/Lepper, marmellate). Ogni
  scelta in più nel checkout (5 metodi di consegna, 8 di pagamento) costa conversione. **Default intelligente** > scelta libera.
- **Effetto dotazione & coerenza/impegno (Cialdini):** chi ha già messo qualcosa nel carrello è "dentro"; chi
  ha compiuto un micro-step (email, CAP) tende a completare. → I micro-impegni precoci alzano il completamento.
- **Riprova sociale, autorità, reciprocità:** valgono *prima* della decisione, non dopo. Recensioni vere vicino
  al prodotto, non in fondo. Per il piacentino over-50 al primo ordine online, l'autorità locale ("la bottega che conosci") batte i badge.

## B. Frizione e carico cognitivo — il vero nemico è lo SFORZO
- **Ogni interazione ha un costo cognitivo.** Carico = quanti campi leggere, quante decisioni prendere, quanta
  incertezza tollerare. **Legge di Hick:** il tempo di decisione cresce col logaritmo del numero di opzioni →
  riduci le scelte. **Legge di Fitts:** target piccoli/lontani sono più lenti da colpire → CTA grande, in alto, pollice-friendly su mobile.
- **3 tipi di frizione:** (1) *di interazione* — campi, tap, scroll, captcha; (2) *cognitiva* — devo pensare,
  calcolare il totale, capire cosa succede dopo; (3) *emotiva* — paura ("è sicuro pagare?"), dubbio ("arriva davvero?"), sorpresa-costo.
  La frizione emotiva è la più letale e la meno visibile in heatmap: si combatte con trust e trasparenza, non con UX.
- **La regola "non farmi pensare" (Krug):** ogni schermata deve essere ovvia. Se l'utente deve chiedersi "e
  adesso?", hai già perso una quota. Una sola azione primaria evidente per schermata.
- **Mobile-first reale:** la maggioranza converte (o abbandona) col pollice. Form lunghi, tastiera sbagliata
  (no `inputmode=numeric` sul CAP), tap-target piccoli, autofill rotto = abbandono mobile. Misura SEMPRE separato mobile/desktop: medie aggregate mentono.

## C. Anatomia del checkout — dove si vincono e perdono i soldi
- **Il funnel canonico:** vista prodotto → add-to-cart → vista carrello → inizio checkout → indirizzo →
  spedizione/slot → pagamento → conferma. Ogni step è una **porta con una % di passaggio**; il fatturato è il prodotto di tutte le porte.
- **I principi del checkout che converte** (Baymard Institute, 100k+ ore di usability testing):
  - **Costo totale mostrato PRIMA del checkout** (consegna inclusa). I costi-extra a sorpresa sono la **causa #1
    di abbandono** (~48% di chi abbandona lo fa per costi inattesi). Mostra il totale realistico già nel carrello.
  - **Guest checkout** o ordine-senza-account: l'obbligo di registrarsi è tra le prime 3 cause di abbandono. L'account si propone DOPO, sulla pagina di conferma.
  - **Form minimo:** chiedi solo ciò che serve a consegnare e fatturare. Un solo campo nome, niente "conferma
    email", indirizzo con autocomplete, no campi opzionali travestiti da obbligatori. Ogni campo rimosso ~+ conversione.
  - **Un solo schermo o stepper chiaro con progresso visibile.** L'utente deve sapere quanti step mancano e dove è.
  - **Errori inline e gentili:** validazione mentre scrivi, messaggio che dice *come* correggere, mai "errore" generico che cancella il form.
  - **Riepilogo ordine sempre visibile** (sticky): cosa compro, quanto pago, quando arriva. L'incertezza su questi tre uccide.
- **COD (contrassegno) = leva di fiducia locale**, non un costo da nascondere. Per chi paga online la prima
  volta, "paghi alla consegna" può essere il singolo trigger che sblocca l'ordine. Renderlo visibile è CRO, non operations.

## D. Abbandono carrello — le cause VERE (in ordine, dai dati di settore)
> Tasso medio di abbandono e-commerce ~70%. Ma "abbandono" non è una causa: è un sintomo. Le cause reali (Baymard), in ordine:
1. **Costi extra a sorpresa** (consegna/tasse/fee viste tardi) — ~48%. *La regina. Quasi sempre il problema #1.*
2. **Obbligo di creare un account** — ~24%.
3. **Consegna troppo lenta / tempi non chiari** — ~22%.
4. **Non mi fido a dare la carta** (sito poco credibile, no trust signal) — ~18%.
5. **Checkout troppo lungo/complicato** (troppi step/campi) — ~17%.
6. **Non vedo il totale in anticipo / non riesco a calcolarlo** — ~16%.
7. **Errori/crash del sito, lentezza** — ~13%.
8. **Resi non convincenti / policy poco chiara** — ~12%.
9. **Pochi metodi di pagamento** — ~9%.
10. **Carta rifiutata** — ~9%.
> ⚠️ **Attenzione: una grossa fetta dei "carrelli abbandonati" non è abbandono ma RICERCA** (gente che usa il
> carrello come segnalibro/wishlist, confronta prezzi, non aveva intenzione di comprare oggi). Non tutto è
> recuperabile né è un problema di funnel. Segmenta *intenzione reale* prima di gridare al disastro.

## E. Trust al pagamento — la fiducia è una feature del checkout
- **Il momento-carta è il momento-paura.** Lì servono, visibili e veri: lucchetto/HTTPS, loghi dei circuiti e
  metodi noti (Stripe/Apple Pay/Google Pay riducono l'attrito e *prestano* la loro fiducia), policy resi/rimborsi a portata, contatto umano visibile.
- **Trust signal che contano** (in ordine): metodi di pagamento riconosciuti > resi chiari > recensioni vere >
  identità locale/contatto reale > badge di sicurezza generici (i badge "secure" anonimi fanno poco, a volte insospettiscono).
- **Velocità = fiducia percepita.** Un checkout lento *sembra* rotto. Ogni 100ms in più di latenza erode
  conversione (ordine di grandezza Amazon: ~1% di vendite per 100ms). La **velocità percepita** (skeleton, stati di caricamento, feedback immediato sul tap) conta quanto quella reale.
- **Coerenza = sicurezza.** Prezzo che cambia tra carrello e checkout, design che "stacca" su una pagina,
  redirect sospetti al pagamento → bandiere rosse nella testa del cliente. La coerenza visiva è un trust signal.

## F. Statistica dell'A/B test — il rigore che separa il pro dal dilettante
> Senza questo, un "test vinto" è un aneddoto. Questa sezione è il tuo scudo contro le bugie statistiche.
- **Ipotesi nulla e p-value.** Un test confronta A (controllo) vs B (variante). Il **p-value** è la probabilità
  di osservare un effetto così grande *se in realtà non ci fosse differenza*. **Significatività al 95%** (α=0.05) = accetti 1 falso positivo su 20. Non è "95% di probabilità che B vinca": è un controllo dei falsi allarmi.
- **Potenza statistica (1-β), standard 80%.** È la probabilità di *rilevare* un effetto reale se esiste. Test
  sotto-potenziato = anche se B è meglio, probabilmente non lo vedrai → concludi "nessuna differenza" per sbaglio (falso negativo). **Volume basso = potenza bassa = test cieco.**
- **MDE (Minimum Detectable Effect).** Il più piccolo miglioramento che il test può rilevare con quel campione.
  Con poco traffico l'MDE è enorme (es. "rilevo solo se la conversione sale di +30%"): se ti aspetti +5%, quel test **non può** vederlo, è inutile prima di partire. Calcola SEMPRE l'MDE prima, non dopo.
- **Sample size.** Dipende da: baseline di conversione, MDE che vuoi rilevare, α (0.05) e potenza (0.80). Regola
  spannometrica: più la baseline è bassa e più piccolo l'effetto, più campione serve (cresce ~ con 1/MDE²). Per conversioni del 2-5% e effetti del 5-10% relativi servono **migliaia–decine di migliaia di sessioni per variante**.
- **No-peeking / peeking problem.** **Mai** guardare il risultato e fermare il test appena è "significativo".
  Il p-value oscilla nel tempo; se ti fermi al primo picco fortunato, il tuo tasso di errore reale schizza ben oltre il 5% (anche 30%+). → **Fissa durata e campione PRIMA, non guardare per decidere, ferma solo a target raggiunto.** (O usa metodi sequenziali/bayesiani progettati per il peeking — ma vanno dichiarati prima.)
- **Durata minima: cicli interi.** Almeno **1-2 settimane intere** anche se il campione arriva prima, per
  coprire tutti i giorni della settimana (lun≠sab) ed evitare effetti novità/stagione. Mai concludere su 3 giorni.
- **Una variabile (o test multivariato disegnato apposta).** Cambi 5 cose insieme = non sai cosa ha funzionato. Isola la causa.
- **SRM (Sample Ratio Mismatch):** se lo split doveva essere 50/50 e arriva 56/44, il test è **rotto** (bug di
  assegnazione/tracking) → buttalo, non interpretarlo. Controllo igienico obbligatorio prima di leggere i risultati.
- **Significatività ≠ rilevanza pratica.** +0.2% statisticamente significativo su volumi enormi può non valere
  l'investimento; +15% su un test sotto-potente può essere rumore. Dichiara **sempre delta + intervallo di confidenza + € attesi/mese**.
- **La verità per MyCity (oggi):** con poche decine di ordini/settimana **non c'è potenza per un A/B test
  classico**. Onestà brutale: in questo regime la mossa giusta è **correzione ragionata della frizione + misura prima/dopo dichiarata come tale** (non spacciata per A/B test), oppure aspettare il volume. Vedi Tool 3.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — FUNNEL TEARDOWN passo-passo (la radiografia dell'imbuto)
1. **Disegna l'imbuto reale** con i numeri veri (Supabase eventi): per ogni step → utenti entrati, utenti
   usciti, **% di passaggio**. Step canonici: vista prodotto → add-to-cart → carrello → checkout-start → indirizzo → consegna → pagamento → conferma.
2. **Segmenta SUBITO mobile vs desktop** (e nuovo vs ritornante). Le medie aggregate nascondono il problema.
3. **Trova la "porta che perde di più × valore":** non lo step con la % peggiore in assoluto, ma quello dove
   `(abbandoni × valore dell'utente perso)` è massimo. Lì cadono i soldi.
4. **Vai a vedere PERCHÉ** su quello step: session recording/heatmap se ci sono; altrimenti percorri tu il
   flusso su mobile lento, come un piacentino over-50 al primo ordine. Annota ogni esitazione, campo, costo che appare tardi, dubbio.
5. **Classifica la causa** (frizione interazione/cognitiva/emotiva — Sapere B) e mappala alle 10 cause vere (Sapere D).
6. **Quantifica l'opportunità:** "se questo step passa da X% a Y%, sono +€___/mese a parità di traffico". Questo numero ordina il backlog.
7. **Output:** tabella funnel + lo step-bersaglio + causa ipotizzata + € in gioco. Solo ora si formula l'ipotesi (Tool 2).

## TOOL 2 — TEMPLATE DI IPOTESI A/B (compilabile, mai saltare un campo)
```
IPOTESI #__  ·  AAAA-MM-GG HH:MM
Step del funnel:        [es. checkout-start → indirizzo]
Problema osservato:     [dato reale: % abbandono, recording, % per device]
IPOTESI:  Poiché [evidenza], se cambio [X] in [variante B] per [segmento],
          allora [metrica primaria] migliorerà di [delta atteso], perché [meccanismo psicologico].
Metrica PRIMARIA:       [una sola — es. % completamento checkout]
Metriche guardrail:     [AOV, margine, % resi, errori] — NON devono peggiorare
Variante A (controllo): [stato attuale]
Variante B:             [la modifica, UNA variabile]
Baseline attuale:       [%]   ·   MDE che mi serve: [%]   ·   Sample size/variante: [n]
Durata stimata:         [settimane, ≥1-2 cicli interi]   ·   Split: [50/50]
Soglia:                 95% sig. · 80% potenza · no-peeking · check SRM prima di leggere
€ attesi/mese se vince: [stima onesta]
Colore: 🟢 disegno · 🔴 messa online
```
> Domanda-ghigliottina prima di consegnare: **«Se questo test vince, quanti € in più al mese, ed è
> statisticamente reale o rumore?»** Se non sai rispondere → rifai l'ipotesi.

## TOOL 3 — CALCOLO SAMPLE SIZE / DURATA + il bivio "test o correzione"
1. **Raccogli 3 numeri:** baseline di conversione dello step (es. 30% completa il checkout), MDE relativo che
   vuoi rilevare (es. +10% → 33%), parametri standard (α=0.05, potenza=0.80).
2. **Stima il campione/variante** (formula proporzioni o calcolatore Evan Miller/AB-test calculator). Indicativo
   per baseline 30% e MDE +10% rel. ≈ **~3.000–4.000 sessioni/variante**; per conversioni del 2-3% servono **decine di migliaia**.
3. **Calcola la durata:** `campione totale ÷ sessioni utili al giorno su quello step`. Aggiungi cicli interi (min 1-2 settimane).
4. **IL BIVIO (giudizio L7):**
   - Se la durata è **ragionevole** (settimane, non mesi) → disegna l'A/B test vero (Tool 2).
   - Se la durata è **assurda** (mesi/anni perché il volume è basso — caso MyCity oggi) → **NON è un A/B test, è
     una scommessa.** Fai una **correzione ragionata della frizione** (basata su Baymard/cause vere), **misura prima/dopo onestamente** e dichiaralo come tale. Oppure: testa solo modifiche con **effetto atteso enorme** (rifacimenti, non sfumature).
5. **Output:** campione, durata, e la **chiamata esplicita** test-vero vs correzione-misurata, con il perché.

## TOOL 4 — CHECKLIST ANTI-FRIZIONE DEL CHECKOUT (passa il flusso e spunta — una ❌ = ipotesi di fix)
**Trasparenza costi**
- [ ] Totale completo (con consegna) visibile **nel carrello**, prima del checkout.
- [ ] Nessun costo/fee che appare per la prima volta dopo l'indirizzo o al pagamento.
- [ ] Soglia "consegna gratis" mostrata e quanto manca, se esiste.

**Form & frizione di interazione**
- [ ] Guest checkout / ordine senza obbligo account (account proposto DOPO).
- [ ] Solo campi necessari; zero "conferma email", zero opzionali travestiti da obbligatori.
- [ ] Autocomplete indirizzo; `inputmode`/tastiera giusta per CAP/telefono su mobile.
- [ ] Tap-target grandi, CTA primaria una sola, sticky/sempre raggiungibile su mobile.
- [ ] Validazione inline, errori che dicono *come* correggere, il form non si svuota.

**Chiarezza & progresso**
- [ ] Riepilogo ordine sticky: cosa, quanto, **quando arriva**.
- [ ] Stepper/progresso visibile; l'utente sa quanti step mancano.
- [ ] Una sola azione primaria evidente per schermata ("e adesso?" ha risposta ovvia).

**Trust al pagamento**
- [ ] Metodi noti visibili (carte/Apple Pay/Google Pay) + **COD visibile e valorizzato**.
- [ ] Resi/rimborsi e contatto umano a portata di mano nel checkout.
- [ ] Prezzo coerente carrello↔checkout; nessun redirect sospetto; HTTPS/lucchetto.

**Velocità & device**
- [ ] Checkout veloce; stati di caricamento/skeleton, feedback immediato al tap.
- [ ] Provato davvero **su mobile lento**, non solo desktop dello sviluppatore.

## TOOL 5 — LIBRERIA MICRO-COPY / CTA (con esempio MyCity)
**CTA — verbo + chiarezza + (beneficio):**
- ❌ "Invia" / "Continua" generici → ✅ **"Vai al pagamento"**, **"Conferma ordine"**, **"Paga ora"** (dice cosa succede dopo).
- Carrello: ❌ "Procedi" → ✅ **"Completa l'ordine — consegna inclusa"** (toglie la paura del costo nascosto).
- Primo ordine/diffidenti: ✅ **"Paghi alla consegna, se vuoi"** vicino alla CTA (sblocca il piacentino prudente).

**Micro-copy che toglie ansia (riduce la frizione emotiva):**
- Sotto la CTA pagamento: *"Pagamento sicuro · Consegna a Piacenza · Resi facili"* (3 paure principali, una riga).
- Campo telefono: *"Solo per avvisarti quando il rider è in arrivo"* (spiega il perché → meno resistenza).
- Tempi: *"Arriva oggi entro le 19"* o *"Pronto domani"* — mai vago. L'incertezza sui tempi è causa #3 di abbandono.
- Slot pieno/errore: *"Questo slot è al completo — il primo libero è alle 18:30"* (dà la via d'uscita, non solo l'errore).

**Riprova/valore (solo se VERO):**
- ✅ "La bottega di Piazza Duomo che conosci" (autorità locale > badge anonimo).
- ❌ Countdown finti, "23 persone stanno guardando", "ultimo pezzo" non vero → **vietati** (dark pattern, candore con Nicola).

## TOOL 6 — REGISTRO TEST / BACKLOG (asset versionato, single source of truth)
- **Backlog di ipotesi** prioritizzato per **impatto** (€ in gioco × confidenza × facilità — modello PIE/ICE):
  ogni riga = ipotesi (Tool 2) con il suo € atteso. Si lavora dall'alto.
- **Registro test** (append-only): `data · ipotesi · variante · metrica · campione · esito (VINTO/PERSO/INCONCLUSIVO + numero + IC) · lezione`.
- → Niente test ri-fatti, niente "mi pare avesse vinto". Scrivi l'esito anche dei test **persi**: un perso è un dato sul *nostro* cliente. Memoria: `memoria-squadra/cro.md`.

## TOOL 7 — IL LOOP INTERNO (non consegni la prima ipotesi)
1. [ ] Funnel teardown (Tool 1): dove cade davvero il cliente × valore.
2. [ ] **3 ipotesi diverse** sulla *causa* (non 3 copy dello stesso bottone): es. costo-sorpresa / obbligo-account / sfiducia-carta.
3. [ ] Criticale contro i dati e le 10 cause vere (Sapere D): quale spiega il maggior abbandono × valore?
4. [ ] **Tieni 1, scarta 2** (annota perché → memoria).
5. [ ] Raffina 2-3 round: variante, metrica primaria, MDE, durata, soglia, **guardrail** (no AOV/margine bruciati).
6. [ ] Ghigliottina (€ reali o rumore?). Check fattibilità (Tool 3: test vero o correzione-misurata?).
7. [ ] Solo ora consegni: dichiari l'ipotesi scelta e perché batte le altre due.

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10 — test/ottimizzazioni col PERCHÉ)
> Modella il ragionamento, non copiare la ricetta. Ogni voce: COSA · PERCHÉ (principio) · MYCITY.

## OTTIMIZZAZIONI GOLD ✅
- ✅ **Mostrare il costo totale (consegna inclusa) già nel carrello.** *Perché:* attacca la causa #1 di abbandono
  (costo-sorpresa); toglie frizione emotiva prima che monti. *MyCity:* totale realistico + "consegna inclusa" nel carrello, COD visibile → sblocca il primo ordine del diffidente.
- ✅ **Guest checkout (ordine senza account), account proposto in conferma.** *Perché:* rimuove la causa #2;
  l'account è un beneficio per noi, non per chi vuole solo comprare. *MyCity:* il piacentino over-50 ordina senza creare password; lo invitiamo a salvare i dati DOPO l'ordine riuscito.
- ✅ **Amazon 1-click / Shop Pay / Apple-Google Pay.** *Perché:* azzerano la frizione di interazione al picco di
  intenzione (B=M·A·T: massimizzano A). *MyCity:* wallet express dove possibile + dati pre-compilati per chi torna.
- ✅ **Booking — micro-trasparenza onesta** ("colazione inclusa", "cancellazione gratuita", prezzo finale chiaro).
  *Perché:* riduce ansia/incertezza, leve negative della LIFT, senza dark pattern reali. *MyCity:* tempi di consegna espliciti ("oggi entro le 19"), resi chiari, COD — fiducia, non trucco.
- ✅ **Errori inline gentili che dicono come correggere.** *Perché:* l'errore generico che svuota il form è una
  delle frizioni più costose e invisibili. *MyCity:* validazione mentre scrivi su CAP/telefono, messaggio con la via d'uscita.

## SPAZZATURA ❌ (e perché perde — o peggio, danneggia)
- ❌ **"Bottone verde vs arancione" su 30 sessioni/settimana, dichiarato vinto dopo 3 giorni.** *Perché no:* zero
  potenza statistica + peeking → decisione sul rumore, peggio che non testare. *MyCity:* con questo volume → correzione ragionata + misura prima/dopo, mai "A/B test vinto".
- ❌ **Countdown / "ultimo pezzo" / "23 stanno guardando" finti.** *Perché no:* dark pattern → bruciano la
  fiducia in una città dove ci si conosce, e sono sanzionabili. *MyCity:* candore con Nicola, mai eseguire — l'autenticità locale è il nostro asset.
- ❌ **Aggiungere badge "secure", urgenza e copy persuasivo quando il problema vero è il costo-sorpresa 2 step
  prima.** *Perché no:* ottimizzi il dettaglio mentre i soldi cadono a monte. *MyCity:* la frizione vera è quasi sempre più in alto — risali il funnel.
- ❌ **Rimuovere il consenso/privacy o campi legali "per snellire".** *Perché no:* non conforme, rischio legale > guadagno. *MyCity:* 🔴 + candore; si snellisce altro.
- ❌ **Testare 5 modifiche insieme e cantare vittoria.** *Perché no:* non sai *cosa* ha funzionato → non impari, non replichi. *MyCity:* una variabile per volta.
- ❌ **Concludere su 3 giorni / fermare appena "significativo".** *Perché no:* peeking + nessun ciclo settimanale intero → falso positivo. *MyCity:* durata e campione fissati prima, ≥1-2 settimane.

## 🏆 Pattern vincenti distillati
Segui i soldi che cadono (abbandono × valore) · togli prima di aggiungere · costo totale prima · guest checkout ·
trust al pagamento (COD!) · una variabile · potenza prima del test · no-peeking · mobile separato dal desktop · misura prima/dopo onesta quando manca volume.
## 🚩 Red flags (uccidi a vista)
"secondo me è più bello" · test vinto senza campione/IC · peeking · 5 cose insieme · ottimizzare il bottone mentre la frizione è a monte ·
urgenza/scarsità finta · togliere consensi · ignorare il segmento mobile · alzare il CR bruciando AOV/margine · medie aggregate · concludere su 3 giorni.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, e dove si innesta)
> Senza questo, la CRO è cieca: produce ottime *ipotesi* ma non può misurare nulla. Ecco ESATTAMENTE cosa serve e dove entra:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Eventi funnel completi e puliti** (vista→carrello→checkout→indirizzo→consegna→pagamento→conferma), per step e **device** | disegnare l'imbuto reale, trovare la porta che perde × valore | Tool 1 (teardown), tutto lo Strato 3 |
| **Volume reale di traffico/sessioni** per step | sapere se un A/B test è fattibile (sample size/durata) o serve correzione-misurata | Tool 3 (sample size + il bivio) |
| **Carrelli abbandonati con timestamp e step** | causa vera dell'abbandono (≠ ricerca/wishlist), segmentare intenzione | Sapere D, Tool 1 |
| **Session recording / heatmap** (PostHog) | vedere *dove e perché* si bloccano (frizione invisibile in heatmap aggregata) | Tool 1 passo 4, Sapere B |
| **AOV, margine, % resi reali** (con @finanza) | guardrail: non alzare il CR bruciando il fatturato/margine | Tool 2 (guardrail), visione di sistema |
| **Una sola definizione condivisa di "conversione" e di ogni step** (con @analista/@finanza) | una verità sola, riconciliare numeri divergenti prima di decidere | [[GLOSSARIO-KPI]], Tool 6 |
| **Accesso al flusso checkout reale** (repo mycity-live, lettura) + ambiente di anteprima | percorrere il funnel come l'utente, disegnare la variante in branch | Tool 4, Tool 7 |

Se il tracking è rotto o gli eventi mancano → **fermati e procuratelo** (coordina con @data-engineer): senza
eventi puliti la CRO non è un mestiere, è un'opinione. Dillo a Nicola come "carburante" che alza il tetto da 6 a 10.
Finché manca il volume per test veri, **lavora in modalità correzione-ragionata + misura prima/dopo onesta** (Tool 3) — mai spacciare una scommessa per A/B test.

---
*Manutenzione: questo kit è vivo. Ogni volta che un test chiude (vinto/perso/inconclusivo) aggiorna il Registro
(Tool 6) e la Galleria (nuovo gold/spazzatura col perché), e scrivi la lezione in `memoria-squadra/cro.md`.
RIASSUMI/POTA mensile: resta denso e affilato.*
