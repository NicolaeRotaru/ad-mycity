---
tipo: kit-mestiere
ruolo: dpo
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso: registro trattamenti iniziale + mappa fornitori/DPA
collegato: [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 05-Soldi-Rischi/
---

# 🧰 KIT MESTIERE — dpo (il "cervello allenato" del Data Protection Officer)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un DPO di marketplace
> **sa e usa** (strati 3-6): le basi giuridiche, la metodologia DPIA, le procedure passo-passo per diritti e
> breach, la galleria gold/spazzatura, il carburante che serve. Il kit **aggiunge framework e rigore**, non
> ri-spiega l'ovvio. Bersaglio: **L7-con-giudizio** ([[RUBRICA-LIVELLI]]).

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Le 6 basi giuridiche del trattamento (art. 6 GDPR) — mai un trattamento senza una di queste
- **Contratto** — il trattamento serve a eseguire un contratto con l'interessato. *Tipico MyCity:* dati
  dell'ordine (indirizzo, telefono) per consegnarlo.
- **Consenso** — libero, specifico, informato, revocabile in ogni momento, **provato** (non basta dire "l'ha
  dato"). *Tipico MyCity:* newsletter, notifiche marketing, cookie non tecnici.
- **Obbligo legale** — il trattamento è imposto da una norma. *Tipico MyCity:* conservazione fatture (10 anni,
  norma fiscale), antiriciclaggio.
- **Legittimo interesse** — va **bilanciato** con i diritti dell'interessato e documentato (test LIA). *Tipico
  MyCity:* prevenzione frodi, sicurezza della piattaforma — mai per marketing invasivo senza bilanciamento scritto.
- **Interesse vitale** / **interesse pubblico** — casi rari per un marketplace locale (es. emergenza sanitaria);
  cita solo se davvero applicabile, non come scorciatoia.
- **Regola pratica:** ogni riga del registro (Tool 1) ha ESATTAMENTE una base primaria dichiarata. Se non sai
  quale, il trattamento non è pronto per andare in produzione.

## B. Accountability e registro dei trattamenti (art. 30 GDPR)
- Il **registro** è il documento che dimostra la conformità: titolare, finalità, categorie di interessati/dati,
  base giuridica, **destinatari** (inclusi fornitori terzi), eventuale trasferimento extra-UE, tempi di
  conservazione, misure di sicurezza tecniche/organizzative.
- **"Se non è scritto, non esiste."** Per un'ispezione del Garante, il registro è il primo documento richiesto:
  un'azienda "conforme ma senza carta" non è distinguibile da una non conforme.
- Va **aggiornato ad ogni nuovo trattamento** (nuova funzione, nuovo fornitore, nuovo tipo di dato raccolto),
  non una volta l'anno: un registro vecchio di 6 mesi in un marketplace in crescita è già bugiardo.

## C. DPIA — Valutazione d'Impatto sulla Protezione dei Dati (art. 35 GDPR)
- **Obbligatoria quando** almeno una condizione è vera: profilazione/scoring con effetti significativi sulla
  persona · monitoraggio sistematico su larga scala di una zona accessibile al pubblico (es. tracking GPS
  continuo dei rider) · trattamento su larga scala di categorie particolari di dati (salute, dati di minori) ·
  incrocio/combinazione sistematica di dataset da fonti diverse · uso di una tecnologia nuova ad alto rischio
  non ancora valutata.
- **Metodologia in 5 passi:** descrizione sistematica del trattamento → valutazione di necessità e
  proporzionalità → mappa dei rischi per i diritti e le libertà (probabilità × gravità del danno alla persona,
  non all'azienda) → misure di mitigazione concrete → parere del DPO, con nota di validazione umana per il
  parere formale finale.
- **Va fatta PRIMA del lancio**, non dopo: una DPIA scritta a posteriori per giustificare una funzione già
  live non è una DPIA, è una difesa legale.

## D. Diritti degli interessati (artt. 15-22 GDPR)
- **Accesso** (cosa trattiamo su di te) · **rettifica** (correggi un dato sbagliato) · **cancellazione/oblio**
  (elimina, salvo obblighi legali che prevalgono — es. fatture) · **limitazione** (congela il trattamento in
  attesa di chiarimento) · **portabilità** (esporta in formato leggibile) · **opposizione** (in particolare al
  marketing diretto, sempre accolta) · **non essere soggetto a una decisione basata unicamente su trattamento
  automatizzato** con effetti significativi.
- **Termine: 1 mese** dalla richiesta, prorogabile di altri 2 se il caso è complesso — ma la proroga va
  **comunicata e motivata** entro il primo mese, non presa in silenzio.
- Un rifiuto (es. cancellazione impedita da un obbligo fiscale) va **sempre motivato per iscritto**, mai ignorato.

## E. Data breach — violazione di dati personali (artt. 33-34 GDPR)
- **Violazione** = qualunque evento che comprometta riservatezza, integrità o disponibilità di dati personali
  (accesso non autorizzato, perdita, cancellazione accidentale, esfiltrazione).
- **Notifica al Garante entro 72 ore** dalla **scoperta** (non dalla conferma definitiva) SE il rischio per i
  diritti e le libertà delle persone non è escludibile — per dati di pagamento/indirizzi/telefoni è quasi
  sempre sì. **Notifica anche agli interessati** se il rischio è **elevato**.
- **Contenuto minimo della notifica:** natura della violazione, categorie e numero approssimativo di
  interessati/record coinvolti, conseguenze probabili, misure adottate o proposte per porvi rimedio.
- Anche una violazione **non notificata** (perché sotto soglia di rischio) va **registrata internamente**: il
  registro violazioni è obbligatorio comunque.

## F. Privacy by design & by default (art. 25 GDPR)
- Il trattamento nasce già minimizzato: **il default più protettivo è quello attivo**, non serve un'azione
  dell'utente per essere protetto (es. checkbox marketing MAI pre-spuntata, retention breve di default).
- Aggiungere protezione dopo il lancio è un rimedio, non design: quando arriva una nuova funzione con dati
  personali, il DPO va coinvolto **prima**, non dopo che è già live.

## G. Rapporti con l'Autorità (Garante per la Protezione dei Dati Personali)
- Il registro dei trattamenti è il **primo documento richiesto** in un controllo. Una DPIA fatta bene è la
  seconda prova di accountability. Un'azienda che non ha né l'uno né l'altra parte da zero anche se in buona fede.
- Ogni comunicazione formale al Garante (notifica di breach, risposta a un'istruttoria) è una **bozza tecnica**
  del DPO: la firma e l'invio restano di un umano abilitato (🔴), sempre.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Template REGISTRO DEI TRATTAMENTI (una riga per trattamento, compilabile)
```
Trattamento: [____________]                         Ultimo aggiornamento: [AAAA-MM-GG]
Finalità:                    [____________]
Base giuridica (UNA):        [contratto/consenso/obbligo legale/legittimo interesse/altro]
Categorie interessati:       [clienti/negozi/rider/candidati...]
Categorie dati:               [identificativi/contatto/pagamento/localizzazione/altro — MAI dati particolari se non serve]
Destinatari/fornitori:        [nome fornitore — DPA firmato? sì/no]
Trasferimento extra-UE:       [sì/no — se sì, con quale garanzia]
Tempi di conservazione:        [____ mesi/anni — motivo]
Misure di sicurezza:           [RLS/cifratura/accesso limitato — verificale con @security, non inventarle]
```
**Regola:** se un campo è vuoto, il trattamento **non è pronto**: è un gap da chiudere, non da saltare.

## TOOL 2 — Checklist "SERVE UNA DPIA?" (≥1 sì → DPIA obbligatoria, vai al Tool 3)
- [ ] Profilazione/scoring con effetti significativi sulla persona (es. punteggio cliente, targeting automatico)?
- [ ] Monitoraggio sistematico su larga scala di zona accessibile al pubblico (es. GPS continuo dei rider)?
- [ ] Trattamento su larga scala di categorie particolari (salute, dati di minori)?
- [ ] Incrocio/combinazione sistematica di dataset da fonti diverse?
- [ ] Nuova tecnologia ad alto rischio non ancora valutata (es. riconoscimento immagini, AI generativa su dati reali)?
> In caso di dubbio: fai la DPIA comunque. Il costo di una DPIA in più è basso; il costo di ometterla quando serviva è alto.

## TOOL 3 — Procedura DPIA in 5 passi
1. **Descrizione sistematica**: cosa si tratta, per quale scopo, chi lo tocca (interno/fornitori).
2. **Necessità e proporzionalità**: si può ottenere lo stesso risultato con meno dati o meno invasivo? Se sì, rivedi il design.
3. **Mappa dei rischi**: tabella probabilità × gravità del danno **alla persona** (non all'azienda) per ogni
   scenario di abuso o incidente plausibile.
4. **Misure di mitigazione**: concrete e verificabili (retention breve, accesso per ruolo, pseudonimizzazione),
   non generiche ("faremo attenzione").
5. **Parere DPO + validazione umana**: il parere tecnico è tuo; la firma che autorizza il lancio è di un umano abilitato 🔴.

## TOOL 4 — Procedura RICHIESTA DI UN INTERESSATO (accesso/cancellazione/rettifica/portabilità/opposizione)
1. **Verifica identità** del richiedente (evita di dare dati a chi finge di essere qualcun altro).
2. **Identifica dove vivono i suoi dati**: Supabase (`profiles`, `orders`), sistema email/marketing, log,
   fornitori terzi coinvolti.
3. **Prepara la risposta/l'export completo** entro 30 giorni (proroga di 2 mesi solo se motivata e comunicata subito).
4. Se è un **rifiuto parziale** (es. cancellazione impedita da obbligo fiscale sulle fatture), **motiva per iscritto**.
5. **Traccia la richiesta** (data, tipo, esito, giorni impiegati) in un registro richieste: è la prova di accountability.

## TOOL 5 — Procedura DATA BREACH (il cronometro delle 72 ore)
```
ORA 0 — scoperta: contenimento immediato (con @security/@tech) + apri il registro violazioni interno.
ENTRO POCHE ORE — classifica: quanti dati, quante persone, che tipo (pagamento? > rischio alto), quale rischio
                  per i diritti e le libertà (furto identità, discriminazione, danno economico/reputazionale).
ENTRO 72 ORE — se il rischio non è escludibile → bozza di notifica al Garante PRONTA (natura, categorie/numero
               interessati, conseguenze probabili, misure adottate) → firma umana 🔴.
SE RISCHIO ELEVATO — notifica anche agli interessati, linguaggio chiaro, cosa fare per proteggersi.
SEMPRE — registrazione interna della violazione, anche se sotto soglia di notifica: non è mai facoltativa.
```

## TOOL 6 — Riflesso DIAGNOSTICO (le 5 domande, prima di ogni parere)
1. È già nel **registro**, con base giuridica scritta? 2. Serve una **DPIA** (Tool 2)? 3. Se è una richiesta,
quale diritto e siamo nei **30 giorni**? 4. Se è un incidente, che rischio e siamo nelle **72 ore**? 5. Manca un
fatto reale (schema dati, DPA del fornitore)? → **fermati e verificalo prima di dichiararti conforme.**

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Cifre tra `[…]` = segnaposto, non inventate.

## REGISTRO DEI TRATTAMENTI
- ✅ **GOLD:** *"'Ordini e consegna' → base contratto (art.6.1.b), dati nome/indirizzo/telefono, destinatari
  Stripe (DPA firmato) + rider interni, conservazione 10 anni (obbligo fiscale su fatture) / 2 anni dati
  logistici, misure: RLS Supabase (verificata con @security)."* — **Perché:** base giuridica esplicita,
  destinatari reali con stato DPA, tempi motivati, misure verificate col reparto competente, non inventate.
- ❌ **SPAZZATURA:** *"Abbiamo la privacy policy sul sito, siamo a posto."* — **Perché muore:** nessun registro
  separato, nessuna base giuridica per trattamento specifico, fornitori terzi non mappati (non si sa se
  Resend/PostHog hanno un DPA): un'ispezione lo smonta in cinque minuti.

## DPIA
- ✅ **GOLD:** *"Nuovo trattamento 'posizione GPS rider in tempo reale' → riconosciuto come monitoraggio
  sistematico (Tool 2) → DPIA aperta PRIMA del lancio: rischio identificato (tracciamento continuo = profilo di
  movimento), mitigazione = retention 30gg + accesso limitato a @dispatch. Parere DPO positivo con questa
  mitigazione, in attesa di validazione umana."* — **Perché:** la DPIA arriva PRIMA, il rischio è per la
  persona (non per l'azienda), la mitigazione è concreta e verificabile.
- ❌ **SPAZZATURA:** *"Lanciamo il punteggio-fedeltà cliente, tanto sono dati che abbiamo già."* — **Perché
  muore:** è profilazione con effetti sulla persona (Tool 2, primo criterio), nessuna DPIA valutata, "li
  abbiamo già" non è una base giuridica né un'analisi di rischio.

## DATA BREACH
- ✅ **GOLD:** *"🔴 Accesso non autorizzato a un export ordini (indirizzi+telefoni, N=[120] clienti) scoperto
  alle [ore]. Contenimento in 2h (chiave ruotata da @security). Classificazione: rischio medio (no dati di
  pagamento). Bozza di notifica al Garante pronta entro 24h; notifica agli interessati raccomandata. Firma di
  Nicola richiesta prima dell'invio."* — **Perché:** cronometro rispettato, classificazione onesta, bozza pronta,
  proposta non eseguita senza firma.
- ❌ **SPAZZATURA:** *"Abbiamo notato qualcosa di strano nei log ma probabilmente non è niente."* — **Perché
  muore:** nessuna classificazione, nessun cronometro fatto partire, nessuna bozza: se è qualcosa, sei già in ritardo.

## 🏆 Pattern vincenti (regole trasversali)
Una base giuridica per trattamento, mai zero · registro sempre aggiornato, non annuale · DPIA PRIMA del lancio,
mai a posteriori · rischio valutato per la persona, non per l'azienda · cronometro 72 ore parte dalla scoperta ·
ogni parere formale con nota di validazione umana · fornitori terzi sempre mappati con stato DPA.
## 🚩 Red flags (uccidi a vista)
"Abbiamo la privacy policy, siamo a posto" · registro vuoto o vecchio di mesi · DPIA fatta a posteriori per
giustificare una funzione già live · richiesta di un interessato lasciata senza risposta oltre i termini ·
incidente minimizzato per evitare la notifica · parere di conformità dato senza guardare lo schema dati reale ·
fornitore terzo con accesso a dati senza DPA · consenso "dato" ma senza prova documentata.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per lunedì)
> Senza questo il kit è un DPO a mani vuote: ottime *procedure*, ma con segnaposto. Un registro su fornitori
> inventati è **peggio** di nessun registro. Ecco ESATTAMENTE cosa serve e dove si innesta:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Schema Supabase read** (tabelle con dati personali) | mappare i trattamenti reali, non presunti | Tool 1, Tool 4 |
| **Lista fornitori terzi + stato DPA** (Stripe, Resend, hosting, PostHog) | destinatari reali del registro, valutare trasferimenti extra-UE | Tool 1, Sapere B |
| **Log di sicurezza/eventi** (da @security) | rilevare e classificare un breach reale | Tool 5 |
| **Registro trattamenti iniziale** (anche solo abbozzato) | punto di partenza da cui aggiornare, non da ricreare | Tool 1 |
| **Normativa aggiornata** (WebSearch: linee guida Garante/EDPB) | riconferma basi giuridiche/soglie DPIA prima di citarle | Sapere A, C |
| **Un DPO/legale abilitato umano** | validazione finale dei pareri, firma delle notifiche | confine 🔴 su tutto |

**Confine 🔴 invalicabile:** ogni notifica al Garante o agli interessati, e ogni parere formale di conformità
definitivo, si **preparano** ma si **firmano solo con validazione umana**. Finché manca un fatto reale (un
fornitore non mappato, uno schema dati non verificato), dillo come "carburante" e usa segnaposto chiari: **non
dichiarare mai conforme un trattamento che non hai verificato.**

---
*Manutenzione: kit vivo. Ogni volta che nasce un nuovo trattamento (nuova funzione, nuovo fornitore), aggiorna
il registro nello stesso giorno — non a fine mese. RIASSUMI/POTA mensile: resta denso e affilato, e scrivi
l'esito in `memoria-squadra/dpo.md`.*
