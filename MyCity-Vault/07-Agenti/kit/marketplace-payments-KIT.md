---
tipo: kit-mestiere
ruolo: marketplace-payments
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso quando Stripe è collegato (Payment Intents/Connect read)
collegato: [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 05-Soldi-Rischi/
---

# 🧰 KIT MESTIERE — marketplace-payments (il "cervello allenato" del payments PM di marketplace)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un payments
> product manager di marketplace (eBay Managed Payments / Amazon Pay) **sa e usa** (strati 3-6):
> il modello di split payment, gli strumenti passo-passo, la galleria gold/spazzatura, il carburante.
> Bersaglio: **L7-con-giudizio** ([[RUBRICA-LIVELLI]]).

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Authorization rate: la metrica regina del checkout di pagamento
- **Definizione:** % di tentativi di pagamento che vengono **autorizzati** dalla banca/carta, sul
  totale dei tentativi. Non è la conversion rate del carrello (quella misura tutto il funnel:
  prezzo, spedizione, fiducia); l'authorization rate misura **solo** il momento del pagamento, quando
  il cliente ha già deciso di comprare — per questo ogni punto perso qui è il più costoso del funnel.
- **Benchmark generico** (etichettalo sempre come tale, mai come dato MyCity): un marketplace tipico
  su carte EU sta al **95-97%**; sotto il 90% c'è quasi sempre una causa isolabile (3DS mal gestito,
  mix di carte anomalo, un provider con problemi).
- **Con N piccolo (fase early, pochi ordini/giorno) il tasso è rumoroso**: un authorization rate su
  N=15 tentativi non è un trend, è un campione. Dichiaralo sempre insieme al numero.

## B. Il modello di split payment (Stripe Connect e simili)
- **Chi è merchant of record** determina chi appare sull'estratto conto del cliente e chi risponde
  di un chargeback in prima battuta. Nei marketplace con Connect, tipicamente **MyCity incassa**
  (charge) e poi **trasferisce il netto al negozio** (transfer/payout), trattenendo la fee.
- **Due modelli tecnici principali:**
  - *Destination charge*: un'unica charge sul conto piattaforma, con `transfer_data` che instrada
    automaticamente il netto al Connect account del negozio. Più semplice, un solo evento da tracciare.
  - *Separate charge + transfer*: la charge arriva a MyCity, il transfer al negozio è un'operazione
    successiva e distinta. Più flessibile (utile se serve trattenere per verifiche), ma **introduce
    una finestra temporale** in cui l'ordine è pagato ma il negozio non ha ancora il transfer — è
    l'anomalia #1 che @finanza cerca in riconciliazione: qui è tuo compito capire *perché* quella
    finestra esiste (è normale? è bloccata?), non contabilizzarla (quello è @finanza).
- **Stato del Connect account del negozio** (`enabled`/`restricted`/`pending`) blocca i payout se il
  negozio non ha completato KYC (documenti, IBAN verificato). Un payout "in ritardo" spesso non è un
  bug: è un negozio con onboarding pagamenti incompleto — la diagnosi cambia l'azione (procura il
  documento mancante, non un ticket tecnico).
- **Timing del payout** (T+2, T+7, settimanale...) è una **promessa al negozio**: cambiarlo è una
  leva 🔴 (sposta cassa, tocca la fiducia), non un dettaglio di configurazione.

## C. Mix dei metodi di pagamento: trade-off audience/costo/attrito
- **Carta (Visa/Mastercard via Stripe)**: copertura universale, ma soggetta a 3DS/SCA (frizione) e
  al reason code del decline. È la base, non l'unica risposta.
- **Wallet mobile (Apple Pay / Google Pay)**: saltano la digitazione della carta e spesso saltano
  anche il redirect 3DS (autenticazione già fatta a livello dispositivo) → tipicamente **alzano
  l'authorization rate su mobile**, non solo la comodità. Target: cliente mobile-first.
- **Metodi locali (es. Satispay, molto diffuso tra i piccoli commercianti italiani)**: parlano la
  lingua del bottegaio abituato al QR in negozio fisico; possono abbassare il costo di transazione
  rispetto alla carta. Valutali quando il target è il negoziante/cliente di prossimità, non solo il cliente digitale puro.
- **Bonifico/SEPA**: basso costo, ma frizione alta (non istantaneo) — utile per ordini grandi o B2B,
  raramente per l'acquisto d'impulso del marketplace locale.
- **Ogni metodo aggiunto è un costo di manutenzione** (supporto, riconciliazione, edge case): prima
  di proporne uno, stima **chi lo userebbe davvero** (dato reale o segmento dichiarato dai negozi), non "sarebbe carino averlo".

## D. SCA/3D Secure (PSD2, area UE): frizione vs frode
- La **Strong Customer Authentication** impone un'autenticazione aggiuntiva (redirect banca, OTP)
  sopra soglia o per pagamenti a rischio. Riduce la frode ma è la causa più comune di **drop su
  mobile** se l'UX del redirect è scomoda o lenta.
- **Exemption** (basso importo, transazione a basso rischio - TRA) possono ridurre la frizione senza
  perdere sicurezza — ma la configurazione tecnica e la conformità normativa restano perimetro di
  @security/@legale-privacy: tu segnali l'impatto su conversione, non certifichi la regola.
- **Regola pratica:** se il 3DS non completato è una fetta grande dei decline, la causa è quasi
  sempre UX del redirect (mobile) o assenza di wallet 1-click — indaga lì prima di incolpare il cliente.

## E. Costo di transazione: leva di prodotto, non solo voce di spesa
- Fee tipica Stripe EU: **~1,5% + 0,25€ per charge**, più alta su carte extra-UE/AMEX/valute diverse.
- Il costo di transazione **si somma sull'intero importo dell'ordine**, non sulla sola fee MyCity:
  su un ordine piccolo può erodere gran parte del margine (questo lo quantifica @finanza in unit
  economics; tu lo guardi come leva prodotto: un metodo più economico o una soglia minima cambiano il quadro senza toccare l'esperienza).
- Scegliere il metodo di pagamento più economico **senza aumentare l'attrito** è la mossa L5-L7 di
  questo mestiere: non è "taglia costi", è "stesso click, meno fee".

## F. Payout reliability come promessa, non come batch job
- Per un negozio, il payout è l'equivalente dello stipendio: puntualità e importo corretto sono il
  minimo indispensabile di fiducia nel marketplace.
- Con **pochi negozi reali** (fase early di MyCity), un solo payout in ritardo o sbagliato pesa
  quanto decine in un marketplace maturo: **ogni negozio è materiale**, non serve una soglia % per giustificare l'attenzione.
- Comunicazione proattiva ("il tuo payout arriva il giorno X") batte la sorpresa: se lo stato del
  Connect account è incompleto, dillo al negozio (via @account-negozi/@onboarding-negozi) prima che se ne accorga da solo.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Il FUNNEL di pagamento (dove cade il tentativo)
```
Checkout aperto → Pagamento avviato → [3DS/SCA se richiesto] → Autorizzato → Completato
   N=[__]            N=[__]              drop 3DS: N=[__]         N=[__]        N=[__]
```
Calcola il drop-off per step. Se il buco più grande è tra "avviato" e "autorizzato" con causa 3DS →
sospetta UX del redirect mobile. Se è tra "autorizzato" e "completato" → indaga un problema tecnico
post-autorizzazione (non di pagamento in sé), passa a @backend-dev.

## TOOL 2 — Tabella DECLINE REASON CODE → azione
| `decline_code` | Causa tipica | Leva possibile |
|---|---|---|
| `insufficient_funds` | Fondi insufficienti sulla carta | Nessuna leva diretta; eventualmente offri metodo alternativo (wallet/altro) al retry |
| `do_not_honor` | Rifiuto generico banca (spesso fraud-screen lato issuer) | Nessuna leva diretta; monitora se concentrato su un BIN/paese |
| `card_declined` / `incorrect_cvc` | Dato carta errato | UX di validazione in tempo reale nel form |
| `authentication_required` / `3ds_failed` | SCA non completata | UX del redirect 3DS su mobile, valutare wallet 1-click |
| `fraud_suspected` | Blocco antifrode (Stripe Radar o issuer) | Perimetro @trust-safety/@security, non tuo da solo |
| `currency_not_supported` / `processing_error` | Problema tecnico/valuta | Passa a @backend-dev |
**Uso:** non consegnare "il 9% fallisce" — consegna la distribuzione sopra, con N e periodo, e la leva giusta per la fetta più grande.

## TOOL 3 — Checklist "aggiungere un metodo di pagamento" (prima di proporlo)
- [ ] **Audience**: chi lo userebbe davvero? (dato reale — richieste dei negozi/clienti — o segmento dichiarato, non "sarebbe carino")
- [ ] **Costo di transazione stimato** vs quello attuale (% e fisso)
- [ ] **Frizione al checkout**: quanti click/redirect in più o in meno rispetto a oggi
- [ ] **Costo di integrazione/manutenzione**: chi lo implementa (@backend-dev/@frontend-dev), quanto pesa
- [ ] **Come si misura il successo a 30/60gg**: % di ordini che lo usano, effetto su authorization rate
- [ ] **Colore**: proposta 🟡/🔴 in `AZIONI-IN-ATTESA.md`, mai attivato in autonomia

## TOOL 4 — Monitoraggio PAYOUT ai negozi
1. Per ogni negozio attivo: stato Connect account (`enabled`/`restricted`/`pending`), data ultimo
   payout, importo, giorni trascorsi dall'ordine pagato al payout.
2. Confronta con lo **SLA promesso** (es. T+2): scostamento = anomalia da segnalare 🔴 subito.
3. Se lo stato è `restricted`/`pending` → causa è KYC incompleto, non un bug: segnala a
   @account-negozi/@onboarding-negozi per procurare il documento mancante dal negozio.
4. **Mai** proporre di sbloccare o modificare un payout da solo: è perimetro @finanza/@contabilita per il movimento, tu diagnostichi e segnali.

## TOOL 5 — Il REPORT PAGAMENTI (numero + causa + leva)
```
💳 AUTHORIZATION RATE: [__]% (Stripe, [periodo], N=[__] tentativi) — vs benchmark generico [95-97]%.
🔎 CAUSA PRINCIPALE: [__]% dei decline è [reason_code] → [ipotesi causa].
💸 COSTO DI TRANSAZIONE: [__]% del GMV medio (fee Stripe [__]).
📦 PAYOUT NEGOZI: [N] negozi attivi, [__]% puntuali (SLA T+[__]), [N] anomalie aperte.
🧭 1 LEVA: [metodo di pagamento / soglia 3DS / retry] → effetto stimato su authorization rate o conversione.
🙋 SERVE DA NICOLA: [firma su nuovo metodo/split, oppure "niente"].
```

## TOOL 6 — Riflesso DIAGNOSTICO (5 domande prima di produrre un numero)
1. Authorization rate, costo di transazione o esperienza di checkout — quale sto guardando?
2. Qual è la fonte (Stripe `decline_code`, non l'impressione)?
3. Il payout è nei tempi promessi per QUESTO negozio?
4. Il metodo di pagamento proposto sposta davvero il mix, o è una richiesta senza dato?
5. È mio (prodotto pagamenti) o di @contabilita/@security/@dispute? Se diverge → passa, non improvvisare.

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Cifre tra `[…]` = segnaposto, non inventate.

## AUTHORIZATION RATE
- ✅ **GOLD:** *"Authorization rate ottobre: [91]% (Stripe, N=[212]) — sotto il benchmark generico
  [95-97]%. [62]% dei decline è `insufficient_funds`, [24]% è `authentication_required` (3DS non
  completato, probabile drop su redirect mobile). Leva: Apple Pay/Google Pay saltano la digitazione
  e spesso il redirect 3DS → stima +[3-5] punti. Confidenza [70]% (N piccolo, benchmark generico non MyCity)."*
  — **Perché:** tasso vero, distribuzione per reason code, leva mirata sulla fetta più grande, confidenza onesta su N piccolo.
- ❌ **SPAZZATURA:** *"I pagamenti funzionano bene, ogni tanto qualcuno fallisce."* — **Perché muore:**
  nessun tasso, nessuna fonte, nessun reason code, nessuna leva: un'impressione spacciata per prodotto gestito.

## PAYOUT AI NEGOZI
- ✅ **GOLD:** *"4 negozi attivi: 3 con payout puntuali (T+2, 0 ritardi 30gg), 1 (Pane Quotidiano)
  con Connect account `restricted` da 5 giorni — KYC incompleto (manca IBAN verificato) → payout
  fermo, negozio non ancora avvisato. 🔴 Segnalo a @onboarding-negozi: serve procurare l'IBAN dal
  negozio OGGI, prima che pensi che il pagamento non arrivi per colpa nostra."* — **Perché:** ogni
  negozio nominato, causa diagnosticata (KYC, non bug), azione concreta con owner e urgenza.
- ❌ **SPAZZATURA:** *"Qualche negozio lamenta ritardi nei pagamenti, da vedere."* — **Perché muore:**
  nessun nome, nessuna causa, nessun owner, nessuna urgenza: un'anomalia di fiducia non quantificata è rumore.

## AGGIUNTA METODO DI PAGAMENTO
- ✅ **GOLD:** *"Proposta: attivare Satispay come metodo di pagamento. Audience: [2] negozi su [4]
  lo usano già in negozio fisico e l'hanno chiesto; costo di transazione stimato inferiore alla carta
  su ordini piccoli; integrazione stimata [X] giorni (@backend-dev). Misura a 30gg: % ordini pagati
  con Satispay, effetto su authorization rate. Accodato in AZIONI-IN-ATTESA, 🟡, in attesa di firma."*
  — **Perché:** audience reale (richiesta dai negozi, non ipotesi), costo/beneficio, owner tecnico, metrica di successo, colore giusto.
- ❌ **SPAZZATURA:** *"Dovremmo aggiungere più metodi di pagamento per essere più moderni."* —
  **Perché muore:** nessuna audience, nessun costo, nessun owner, nessuna metrica: uno slogan, non una proposta.

## 🏆 Pattern vincenti (regole trasversali)
Authorization rate ≠ conversion rate del carrello · ogni decline con reason code, mai aggregato ·
il payout è una promessa, non un batch · ogni metodo di pagamento pesato su audience/costo/attrito
reali · benchmark sempre etichettato come generico, mai spacciato per dato MyCity · N piccolo →
confidenza dichiarata bassa · ogni proposta con owner tecnico e metrica di successo a 30/60gg.
## 🚩 Red flags (uccidi a vista)
"il pagamento fallisce, sarà il cliente" · authorization rate senza fonte/periodo/N · un ritardo
payout derubricato senza diagnosticare lo stato del Connect account · metodo di pagamento proposto
senza audience reale · benchmark di settore presentato come dato MyCity · toccare chiavi/webhook
(perimetro @security) o eseguire un movimento di denaro (perimetro @finanza/@contabilita).

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per quando Stripe è collegato)
> Senza questo il kit è un payments PM a mani vuote: ottime *strutture*, ma con segnaposto. Un
> authorization rate su costi/tassi inventati è **peggio** di nessun authorization rate.

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Stripe Payment Intents/Charges con `decline_code`** | authorization rate reale, distribuzione dei decline | Tool 1, Tool 2, Galleria |
| **Stato dei Connect account dei negozi** (`enabled`/`restricted`/KYC) | diagnosi payout in ritardo (causa vera, non bug) | Tool 4, Sapere B/F |
| **Calendario/SLA payout confermato** (T+2, T+7...) | misurare puntualità reale vs promessa | Tool 4 |
| **Funnel checkout in Supabase** (step raggiunti per ordine) | isolare dove cade il tentativo di pagamento | Tool 1 |
| **Elenco metodi di pagamento richiesti dai negozi/clienti** | stimare audience reale prima di proporre un metodo | Tool 3, Sapere C |
| **Definizioni [[GLOSSARIO-KPI]] confermate** (authorization rate, costo di transazione) | coerenza cross-funzionale con @finanza | Tool 6 |
| **Fee reali per metodo/regione** (da Stripe o dal contratto) | costo di transazione vero, non stimato | Sapere E, Tool 3 |

**Confine 🔴 invalicabile:** ogni cambio di metodo di pagamento, split fee, timing payout o soglia
3DS si **propone e si accoda** in [[AZIONI-IN-ATTESA]] — **mai si esegue** da solo. Read ≠ write.
Le chiavi/webhook restano perimetro @security; il movimento di denaro reale resta perimetro
@finanza/@contabilita. Finché Stripe non è collegato, dillo come carburante mancante: **non
inventare un authorization rate per avere comunque un numero da mostrare.**

---
*Manutenzione: kit vivo. Quando Stripe è collegato e arriva il primo authorization rate reale,
aggiorna la Galleria con un caso vero (non più segnaposto) e scrivi l'esito in
`memoria-squadra/marketplace-payments.md`. RIASSUMI/POTA mensile: resta denso e affilato.*
