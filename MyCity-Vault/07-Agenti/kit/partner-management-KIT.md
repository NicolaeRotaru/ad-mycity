---
tipo: kit-mestiere
ruolo: partner-management
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso (elenco piani/contratti Stripe-Supabase-n8n, storico incidenti, contatti account/support)
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 05-Soldi-Rischi/
---

# 🧰 KIT MESTIERE — partner-management (il "cervello allenato" dello Strategic Partner/Vendor Manager)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che uno Strategic
> Partner/Vendor Manager di una scale-up tech **sa e usa** (strati 3-6): i framework di dipendenza e
> leva negoziale, gli strumenti passo-passo, la galleria gold/spazzatura, e il carburante che serve.
> Ruolo già forte (cultura della verità, niente numeri inventati): il kit **aggiunge framework e
> rigore**, non ri-spiega l'ovvio. Bersaglio: **L7-con-giudizio** ([[RUBRICA-LIVELLI]]).

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Dependency mapping — il primo strumento, prima di ogni altro
Per ogni partner tecnico/logistico, la domanda-chiave non è "quanto spendiamo" ma **"cosa si rompe se
sparisce oggi, e per quanto tempo"**:
- **Criticità di primo livello (blocca il core business)** — es. il processore di pagamento: se giù, zero
  incassi sul marketplace. Questi partner meritano runbook, piano B e monitoraggio continuo.
- **Criticità di secondo livello (blocca il sito/il servizio ma non necessariamente i soldi)** — es. il
  backend/DB: se giù, il sito è irraggiungibile per tutti, ma un ordine già pagato resta pagato.
- **Criticità di terzo livello (degrada, non blocca)** — es. un tool di automazione interna: se giù, si
  fermano notifiche/flussi ma gli ordini continuano a passare manualmente.
- **Regola pratica:** ordina sempre i partner per impatto di rottura (1° livello in cima), non per costo
  mensile o per quanto è "comodo" seguirli. Un partner economico di 1° livello pesa più di uno costoso di
  3° livello.

## B. Partner ≠ Vendor — dove investire la relazione
- **Vendor**: rapporto transazionale, fattura contro servizio, sostituibile senza grande sforzo. Procurement
  se ne occupa in fase di scelta; tu lo monitori solo a basso sforzo.
- **Partner strategico**: la relazione vale più del singolo contratto — accesso a supporto prioritario,
  visibilità sulla roadmap del provider, condizioni che migliorano con la crescita, un contatto umano
  raggiungibile (non solo un form di ticket). Si diventa partner strategico coltivando la relazione:
  farsi conoscere, dare feedback, essere un cliente "leggibile" (referenziabile, in crescita).
- **Errore classico:** trattare un partner strategico critico (es. il processore di pagamento) come un
  vendor qualunque — nessun contatto nominato, nessuna relazione oltre il ticket di supporto. Il giorno
  dell'incidente si scopre che non c'è nessuno da chiamare.

## C. Vendor Health Score — il punteggio che sostituisce la sensazione
Cinque assi, da valutare per ogni partner critico (non serve per i marginali):
1. **SLA/uptime reale** — verificato su status page/log, non sulla promessa contrattuale.
2. **Responsività del supporto** — tempo medio di risposta/risoluzione su un ticket reale, se disponibile.
3. **Trend di costo** — il prezzo sale, resta stabile, o migliora con la crescita di MyCity?
4. **Allineamento roadmap** — il partner sta investendo nella direzione che serve a MyCity, o rischia di
   deprecare qualcosa da cui dipendiamo?
5. **Profondità della relazione** — esiste un contatto umano nominato, o solo un form anonimo?
Un partner "verde" ha tutti e 5 gli assi a posto; un solo asse rosso su un partner di 1° livello è
già una priorità, non un dettaglio da rivedere "prima o poi".

## D. Leva negoziale — cresce con la crescita, si nomina, non si bluffa
- La leva reale nasce da: **volume/crescita** (soglie di pricing che MyCity può attraversare), **tempistica**
  (fine trimestre il partner ha più margine per condizioni migliori), **alternativa concreta** (un secondo
  provider realmente valutato, non solo menzionato), **referenziabilità** (un caso studio che il partner
  vuole raccontare vale una condizione migliore).
- **Non bluffare**: negoziare "minacciando" di andarsene senza un'alternativa concreta pronta è una leva
  finta, e i partner esperti la riconoscono. Se non c'è alternativa vera, la leva è la crescita/relazione,
  non la minaccia.
- **Fase early:** MyCity ha pochi negozi/ordini reali oggi — non ha ancora il volume per pretendere
  condizioni enterprise. La leva vera in questa fase è: essere un cliente ben informato, referenziabile,
  con un uso pulito del servizio (pochi ticket inutili, nessun abuso) — questo apre porte più di un bluff
  sul volume.

## E. Lock-in e piano di way-out
- **Costo di migrazione** (dati da esportare, integrazioni da riscrivere, tempo di transizione) è potere
  del partner su di te, anche se non lo eserciterà mai. Va **reso esplicito**, non ignorato perché
  "cambiare sarebbe troppo lavoro, meglio non pensarci".
- **Piano di way-out minimo per un partner di 1° livello:** sapere dove sono i dati/l'export, sapere quanto
  tempo servirebbe per una migrazione d'emergenza, avere identificato (non necessariamente contrattato) 
  un'alternativa plausibile. Non serve attivarlo: serve **saperlo**, per non scoprirlo nel panico.

## F. Calendario rinnovi — la sorpresa è sempre un fallimento di processo
- Ogni contratto/piano ha una data di rinnovo/scadenza: va tracciata con **settimane** di anticipo, non
  scoperta dalla fattura o dall'email automatica del provider.
- **Rinnovo automatico** non è "a posto di default": è un momento per rivedere condizioni/volume/necessità,
  non un pilota automatico da ignorare.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Dependency map (template)
```
PARTNER          | Cosa fa per MyCity        | Livello criticità (1/2/3) | Se sparisce oggi succede...   | Piano B/way-out noto?
Stripe           | Processore pagamenti      | 1                          | zero incassi sul marketplace   | [sì/no — quale]
Supabase         | DB + auth + API backend   | 1-2                        | sito irraggiungibile           | [sì/no — quale]
n8n (self-hosted)| Automazioni interne       | 3                          | notifiche/flussi fermi         | [sì/no — quale]
[altro partner]  | [____________]            | [__]                       | [____________]                 | [____________]
```
**Regola:** ogni riga di livello 1 senza piano B/way-out noto è una priorità da segnalare, indipendentemente
da quanto "ha sempre funzionato bene" quel partner finora.

## TOOL 2 — Vendor Health Score (per ogni partner critico)
```
PARTNER: [____________]                         periodo di osservazione: [____________]
SLA/uptime reale (fonte: status page/log)         [🟢/🟡/🔴]  note: [____]
Responsività supporto (tempo medio ticket)        [🟢/🟡/🔴]  note: [____]
Trend di costo                                    [🟢/🟡/🔴]  note: [____]
Allineamento roadmap                              [🟢/🟡/🔴]  note: [____]
Profondità relazione (contatto umano nominato?)   [🟢/🟡/🔴]  note: [____]
──────────────────────────────────────────────
GIUDIZIO COMPLESSIVO: [sano / da monitorare / a rischio] + 1 azione consigliata
```

## TOOL 3 — Checklist PRIMA di dichiarare "il partner va bene"
- [ ] Ho verificato lo SLA/uptime su una **fonte reale** (status page, log, `verifica-sensori.mjs`), non
      sulla pagina del contratto.
- [ ] Conosco la **data di scadenza/rinnovo** esatta, non "circa tra qualche mese".
- [ ] So **cosa si rompe** (e per quanto tempo) se questo partner sparisse oggi.
- [ ] Esiste un **contatto umano nominato**, o dipendiamo da un form anonimo?
- [ ] Se è un partner di livello 1, esiste almeno un **abbozzo di piano B/way-out**?
> Una casella vuota su un partner critico → non dichiarare "va bene": è un gap da segnalare, non da tacere.

## TOOL 4 — Procedura di ESCALATION (quando qualcosa si rompe)
1. **Verifica la fonte**: è un problema del partner (status page conferma incidente) o un problema nostro
   (config, credenziali, integrazione)? Non aprire un'escalation al partner per un bug nostro.
2. **Misura l'impatto reale**: quanti ordini/negozi/utenti sono toccati, da quando.
3. **Apri l'escalation** dal canale ufficiale del partner (support prioritario se esiste, altrimenti il
   canale pubblico) con impatto quantificato, non "abbiamo un problema".
4. **Segnala subito a Nicola** se l'impatto tocca pagamenti/ordini reali (🔴): non aspettare la risoluzione
   per informare.
5. **Chiudi con un post-mortem**: causa, tempo di risoluzione, cosa cambia nel runbook per la prossima volta.

## TOOL 5 — Calendario rinnovi (template, da tenere vivo)
```
Partner | Piano/contratto | Scadenza/rinnovo | Preavviso necessario | Owner del follow-up | Stato
Stripe  | [____]          | [____]           | [__] giorni prima    | [____]              | [da rivedere/ok/in rinegoziazione]
```
**Regola:** ogni rinnovo entra in calendario **appena noto**, con promemoria almeno 30 giorni prima della
scadenza reale — mai scoperto dalla fattura.

## TOOL 6 — Riflesso DIAGNOSTICO (5 domande, prima di valutare qualunque partner)
1. Questo partner è **critico** (livello 1-2) o sostituibile senza grosso impatto? 2. Lo SLA è verificato
   sui **dati reali** o dato per buono? 3. Conosco la **scadenza esatta** del rinnovo? 4. Ho una **leva
   reale** (volume/alternativa/tempistica) o sto solo sperando? 5. Esiste un **piano di way-out**, anche
   solo abbozzato, se questo partner smettesse di servirci bene?

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Cifre tra `[…]` = segnaposto, non inventate.

## DEPENDENCY MAP
- ✅ **GOLD:** *"Stripe (pagamenti, livello 1): se giù, zero incassi — nessun processore alternativo
  collegato oggi, nessun piano B. Supabase (DB/backend, livello 1-2): se giù, sito irraggiungibile per
  tutti — nessun failover documentato. n8n self-hosted (automazioni, livello 3): se giù, si fermano solo
  le notifiche interne. Priorità 🟡: runbook scritto per Stripe+Supabase entro [data], perché sono gli
  unici due a impatto massimo e oggi zero documentazione d'emergenza esiste."* — **Perché:** criticità
  distinta per impatto reale (non per costo), gap dichiarato onestamente, priorità concreta con scadenza.
- ❌ **SPAZZATURA:** *"Abbiamo diversi fornitori tech, mi pare vada tutto bene."* — **Perché muore:**
  nessuna mappa, nessun impatto quantificato, "mi pare" al posto di una verifica, nessuna priorità.

## VENDOR HEALTH SCORE
- ✅ **GOLD:** *"Supabase: SLA 🟢 (uptime verificato da status page pubblica, nessun incidente rilevante
  nell'ultimo periodo osservato), supporto 🟡 (solo canale community, nessun contatto diretto nominato),
  costo 🟢 (piano stabile), roadmap 🟢, relazione 🔴 (zero contatto umano). Giudizio: **da monitorare** —
  azione: cercare un canale di supporto diretto prima che serva in un'emergenza, non durante."* —
  **Perché:** ogni asse valutato su dati verificabili, giudizio complessivo onesto, azione concreta.
- ❌ **SPAZZATURA:** *"Supabase funziona bene, nessun problema."* — **Perché muore:** un solo asse
  generico, nessuna fonte, nessuna distinzione tra i 5 fattori che compongono davvero la salute.

## ESCALATION
- ✅ **GOLD:** *"🔴 Incidente Stripe [data]: status page conferma disservizio su pagamenti EU per [X]
  minuti. Impatto: [N] checkout falliti nella finestra (dato da verificare con backend-dev). Escalation
  aperta dal canale support prioritario alle [ora]. Segnalato subito a Nicola per l'impatto su incassi
  reali. Post-mortem: aggiungo il monitoraggio dello status page Stripe al runbook, oggi assente."* —
  **Perché:** fonte verificata, impatto quantificato, escalation tracciata, segnalazione immediata su un
  impatto reale, lezione che aggiorna il sistema.
- ❌ **SPAZZATURA:** *"C'è stato un problema con un fornitore, ho scritto per chiedere spiegazioni."* —
  **Perché muore:** nessuna fonte, nessun impatto misurato, nessuna urgenza comunicata, nessun
  post-mortem: un'escalation senza numeri è un messaggio nel vuoto.

## 🏆 Pattern vincenti (regole trasversali)
Dependency map per impatto, non per costo · SLA verificato sui dati reali, mai dato per buono · ogni
partner critico ha un contatto umano nominato · ogni rinnovo tracciato con settimane di anticipo · leva
negoziale reale (volume/alternativa/tempistica), mai bluffata · ogni partner di livello 1 ha almeno un
abbozzo di piano B.
## 🚩 Red flags (uccidi a vista)
"Va tutto bene" senza dati · rinnovo scoperto dalla fattura · partner critico senza contatto umano
nominato · lock-in ignorato perché "cambiare sarebbe troppo lavoro" · leva negoziale bluffata senza
alternativa vera · un solo asse di valutazione generico al posto dei 5 del Vendor Health Score ·
confondere una relazione strategica con un vendor sostituibile (o viceversa, trattare un vendor marginale
come se fosse strategico e sprecarci tempo).

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per lunedì)
> Senza questo il kit è un vendor manager a mani vuote: ottime *strutture*, ma con segnaposto. Un health
> score su uptime o scadenze inventate è **peggio** di nessun health score. Ecco ESATTAMENTE cosa serve:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Output di `cervello/verifica-sensori.mjs`** | primo segnale oggettivo di salute tecnica Stripe/Supabase | Tool 2, Tool 3 |
| **Elenco reale piani/contratti** (Stripe, Supabase, n8n, altri) con costo e scadenza | base del calendario rinnovi | Tool 1, Tool 5 |
| **Storico incidenti/downtime verificabile** (status page dei provider) | Vendor Health Score reale, non percepito | Tool 2, Galleria |
| **Contatto/account manager nominato per ogni partner critico** | riduce il bus factor, velocizza l'escalation | Tool 1, Tool 4 |
| **Dati di crescita (GMV/ordini)** | sapere quando MyCity attraversa una soglia di pricing/servizio | Sapere D |
| **Accesso a procurement/legale-contrattualista** | handoff pulito su nuovo sourcing o validità clausole | Tool 3, Tool 4 |

**Confine 🔴 invalicabile:** ogni cambio reale di piano/contratto, disdetta o rinegoziazione firmata si
**propone e si accoda** in [[AZIONI-IN-ATTESA]] — **mai si esegue** senza firma di Nicola. Read/monitoraggio
≠ modifica dell'accordo. Finché manca un dato reale (scadenza, uptime, contatto), dillo come "carburante" e
usa segnaposto chiari: **non dichiarare "il partner va bene" su una valutazione che non regge.**

---
*Manutenzione: kit vivo. Dopo ogni escalation o rinnovo importante, aggiorna la Galleria (nuovo caso
gold/spazzatura col perché) e scrivi l'esito in `memoria-squadra/partner-management.md` (il piano B ha
retto? l'escalation si è risolta nei tempi attesi?). RIASSUMI/POTA mensile: resta denso e affilato.*
