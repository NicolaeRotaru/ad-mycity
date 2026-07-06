---
tipo: kit-mestiere
ruolo: scadenzario
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso: contratti/polizze reali + calendario fiscale confermato da commercialista
collegato: [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 05-Soldi-Rischi/Rischi & Compliance.md
---

# 🧰 KIT MESTIERE — scadenzario (il "cervello allenato" del compliance calendar manager)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un docket clerk/
> compliance calendar manager di livello multinazionale **sa e usa** (strati 3-6): la tassonomia delle
> scadenze, gli strumenti passo-passo, la galleria di calendari gold/spazzatura, e il carburante che serve.
> Ruolo già forte (cultura della verità, cancello 🟢🟡🔴): il kit **aggiunge framework e rigore**, non
> ri-spiega l'ovvio. Bersaglio: **L7-con-giudizio** ([[RUBRICA-LIVELLI]]).

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. La tassonomia delle scadenze (le classi che il calendario unico deve coprire)
- **Fiscali/contributive** — dichiarazioni, saldi/acconti imposte, IVA periodica, contributi: il **merito**
  (importi, regime) è di @commercialista/@contabilita, tu tieni la **data** e fai la cascata.
- **Contrattuali** — durata, rinnovo tacito, finestra di disdetta (fornitori, negozi, rider, partner): la
  clausola più pericolosa è il **rinnovo tacito con finestra di disdetta stretta** (es. disdetta 90gg prima,
  altrimenti si rinnova per altri 12 mesi) — è la scadenza che si "nasconde" dentro un'altra data.
- **Assicurative** — polizze RC, copertura merce/locali/consegne: scadenza = **buco di copertura**, non
  un dettaglio amministrativo. Il rinnovo va avviato con settimane di anticipo (il broker/la compagnia ha
  tempi di lavorazione, non è istantaneo).
- **Bandi/finanziamenti** — finestre di apertura/chiusura bando, scadenze di rendicontazione: sono **soft
  deadline** nel senso che non c'è sanzione, ma **hard nel senso che non tornano indietro** (finestra chiusa = opportunità persa per sempre).
- **Rinnovi operativi** — domini, certificati SSL/tool, licenze software, certificazioni (es. HACCP/food
  safety per i negozi food, di competenza @food-safety se presente, altrimenti @legale-privacy/@office-manager).
- **Scadenze di terzi che impattano MyCity** — es. la scadenza di una certificazione di un negozio partner
  che, se persa, blocca la vendita di quella categoria: tracciala anche se non è "nostra", perché impatta il marketplace.

## B. Rischio di scadenza persa: la matrice che decide la priorità
- **Probabilità di perdita** (owner assente/distratto, processo manuale, prima volta che gestiamo questo tipo
  di scadenza) **× Gravità della conseguenza** (sanzione €, perdita di copertura, decadenza, opportunità
  persa) **× Reversibilità** (si può rimediare con un ravvedimento/proroga, o è definitivo?).
- **Hard deadline** (sanzione/decadenza/perdita di copertura/penale contrattuale) → priorità assoluta,
  cascata completa, nessuna eccezione.
- **Soft deadline** (opportunità, bando, finestra commerciale) → tracciata comunque, cascata più leggera ma
  presente: un'opportunità persa per distrazione è comunque un costo, anche senza sanzione.
- **Regola pratica:** ordina SEMPRE per (gravità della conseguenza) prima che per (data più vicina). Una
  scadenza fra 60 giorni con sanzione pesante batte una fra 10 giorni che è solo un fastidio amministrativo.

## C. La cascata di anticipo (docketing framework — il cuore tecnico)
- **Non esiste un anticipo unico per tutte le scadenze.** L'anticipo dipende da: complessità
  dell'adempimento (una dichiarazione fiscale richiede raccolta dati, non è un click), tempi di terzi
  (banca/PA/broker/compagnia assicurativa hanno processing time), reversibilità (se sbagli, c'è tempo per
  correggere prima della data reale?).
- **Cascata standard di riferimento** (adatta per classe di rischio):
  - **T-30**: prima allerta all'owner, avvio della pratica/richiesta preventivo/raccolta documenti.
  - **T-15**: verifica stato avanzamento; se fermo, sollecito diretto + coinvolgimento del secondo responsabile.
  - **T-7**: 🔴 escalation a Nicola se non c'è ancora un piano concreto — non aspettare l'ultimo giorno.
  - **T-1**: urgenza massima; se ancora bloccata, attiva il **piano B** (proroga, ravvedimento, deroga) invece di sperare.
- **Scadenze ad alta complessità** (bilancio, cambio regime, rinnovo assicurativo con nuova compagnia)
  meritano una cascata più lunga (T-60/T-30/T-15/T-7/T-1): il tempo di lavorazione reale batte lo schema fisso.
- **Buffer per l'attrito**: se la scadenza "reale" è il 30, il documento deve partire prima — calcola sempre
  a ritroso dai tempi di lavorazione della controparte (banca, PA, compagnia), non dalla data nuda.

## D. Owner unico per scadenza (RACI semplificato)
- Ogni scadenza ha **un Responsabile** (la persona/il senior che materialmente agisce — firma, paga, invia,
  rinnova) e, se serve, chi **Consulta** (lo specialista di dominio: @commercialista per il merito fiscale,
  @legale-privacy per il merito contrattuale, il broker per il merito assicurativo).
- **Tu (scadenzario) non sei mai il Responsabile del merito**: sei chi garantisce che il Responsabile veda
  la scadenza in tempo. Una scadenza senza un nome accanto è orfana: è quella che salta perché "pensavo la seguisse un altro".

## E. Fonte della data e affidabilità
- **Fonte primaria** (documento/contratto/norma/comunicazione ufficiale con data) = confidenza alta.
- **Fonte secondaria** (prassi di settore, "di solito succede a...") = confidenza bassa, va **riconfermata**
  prima di fidarsene per una cascata critica.
- **Mai una data "a memoria"**: se non trovi la fonte, la scadenza resta segnata come `[DA VERIFICARE: fonte
  mancante]` finché qualcuno non la conferma — non si inventa e non si arrotonda "a occhio".

## F. Pattern ricorrenti (foresight)
- Le scadenze **fiscali/contributive** tendono a ricorrere su **date fisse annuali** (calendario da
  @commercialista): una volta mappate, si ripetono — automatizza la cascata per l'anno successivo.
- Le scadenze **assicurative/contrattuali** ricorrono **a 12 mesi dalla firma**: appena firmi un contratto/
  polizza, censisci SUBITO la data di rinnovo, non aspettare che si riproponga da sola.
- I **bandi** hanno spesso **finestre ricorrenti** (annuali/semestrali) ma con date che cambiano: vanno
  ri-verificati ogni ciclo, non assunti identici all'anno prima.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — La RIGA di calendario (template, compilabile)
> Riempi SOLO con dati verificati. Se una fonte manca → `[DA VERIFICARE]`, mai una data inventata.
```
SCADENZA: [____________________________]
Categoria: [fiscale/contributiva | contrattuale | assicurativa | bando | rinnovo operativo | terzi]
Data scadenza: [AAAA-MM-GG]      Fonte: [documento/norma/comunicazione + data del documento]
Classe di rischio: [HARD (sanzione/decadenza/perdita copertura) | SOFT (opportunità)]
Conseguenza se persa: [____________________________________________]
Owner (Responsabile): [@nome/senior]     Consultato (merito): [@commercialista/@legale-privacy/broker/altro]
Cascata: T-30 [AAAA-MM-GG] azione:[__] · T-15 [__] azione:[__] · T-7 [__] azione:[__] · T-1 [__] azione:[__]
Piano B se rischia di saltare: [___________________________]
Stato attuale: 🟢 sotto controllo / 🟡 in lavorazione / 🔴 a rischio
```

## TOOL 2 — Procedura di CENSIMENTO (costruire il calendario da zero)
1. **Raccogli le fonti**: contratti in `consegne/legale/`, polizze reali (se esistono), calendario fiscale
   confermato da @commercialista, bandi tracciati in `02-Mercato/Bandi & Finanziamenti.md`, `05-Soldi-Rischi/Rischi & Compliance.md`.
2. **Per ogni documento**, estrai: data di scadenza/rinnovo, clausola di disdetta/rinnovo tacito, penale se persa.
3. **Classifica** (Tool 1: categoria, hard/soft, conseguenza) e **assegna owner**.
4. **Calcola la cascata** in base a complessità (Sapere C): non copiare uno schema fisso se l'adempimento è complesso.
5. **Cerca le scadenze nascoste**: rinnovi taciti, proroghe automatiche, clausole di revisione prezzi legate
   a una data — sono le più facili da perdere perché non sembrano "una scadenza".
6. **Verifica con l'auto-attacco**: *"se questo documento avesse una seconda data nascosta (rinnovo tacito),
   l'avrei trovata rileggendolo tutto, o mi sono fermato/a al primo articolo?"*

## TOOL 3 — CASCATA DI REMINDER (checklist operativa)
- [ ] **T-30/T-60** (secondo complessità): prima allerta all'owner + avvio pratica/richiesta preventivo.
- [ ] **T-15**: verifica stato avanzamento; se fermo → sollecito diretto, coinvolgi secondo responsabile.
- [ ] **T-7**: se manca ancora un piano concreto → 🔴 escalation a Nicola, non aspettare oltre.
- [ ] **T-1**: urgenza massima; se ancora bloccata → attiva piano B (proroga/ravvedimento/deroga) SUBITO.
- [ ] **Dopo la scadenza** (passata con successo o persa): chiudi la riga, registra l'esito, aggiorna la
  prossima ricorrenza (Sapere F) se ricorrente.

## TOOL 4 — MATRICE DI PRIORITÀ (rischio × gravità → colore)
```
                     GRAVITÀ BASSA        GRAVITÀ ALTA
PROBABILITÀ ALTA     🟡 monitorare         🔴 cascata piena, escalation subito
PROBABILITÀ BASSA    🟢 tracciare          🟡 cascata piena, monitorare owner
```
**Output atteso:** ogni scadenza classificata in uno dei 4 quadranti, con le 🔴 sempre mostrate per prime nel report.

## TOOL 5 — REPORT PERIODICO SCADENZE (numero + rischio + azione, sul modello del report finanziario)
```
🗓️ PROSSIMI 30 GIORNI: [N] scadenze — [N] hard, [N] soft. In cima: [scadenza più a rischio + owner + stato].
⚠️ A RISCHIO (🔴/🟡): [scadenza · owner · giorni rimanenti · perché è a rischio · azione richiesta].
🔮 PROSSIMI 90 GIORNI (foresight): [scadenze ricorrenti in arrivo, per non farsi sorprendere].
🙋 SERVE DA NICOLA: [firme 🔴 / conferme fonte mancante / decisioni su owner].
```
**Ghigliottina prima di consegnare:** «Se sparissi domani, qualcuno saprebbe di questa scadenza guardando SOLO il calendario?» → se no, non è pronto.

## TOOL 6 — Riflesso DIAGNOSTICO (5 domande, prima di censire/consegnare qualunque scadenza)
1. Ha una **conseguenza reale** se persa, o è indicativa? 2. Chi è l'**owner** vero (non solo chi la sa)?
3. Qual è l'**anticipo giusto** per QUESTA scadenza (non uno standard uguale per tutte)? 4. La **fonte** è
   verificata o stimata? 5. C'è un **piano B** se rischia comunque di saltare?

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Cifre/date tra `[…]` = segnaposto, non inventate.

## CALENDARIO / CENSIMENTO
- ✅ **GOLD:** *"Rinnovo polizza RC punto vendita [categoria] — scade [15/09] (fonte: polizza PDF, art.
  durata, caricata il [__]). Owner: Nicola + broker. Conseguenza se persa: negozio scoperto, rischio pieno a
  carico in caso di sinistro. Cascata: T-30 richiesta preventivo, T-15 sollecito broker, T-7 🔴 escalation se
  non firmato, T-1 piano B (proroga tecnica). Stato: 🟡 in attesa preventivo."* — **Perché:** fonte citata,
  owner nominato, conseguenza reale dichiarata, cascata proporzionata, stato aggiornabile.
- ❌ **SPAZZATURA:** *"Ricordarsi di rinnovare qualcosa a settembre."* — **Perché muore:** nessuna fonte,
  nessun owner, nessuna conseguenza, nessuna cascata: è un post-it che si perde nel primo giorno pieno.

## RINNOVO TACITO (la scadenza nascosta)
- ✅ **GOLD:** *"Contratto fornitore [categoria] firmato [data]: durata 12 mesi, **rinnovo tacito salvo
  disdetta 60gg prima** → scadenza reale da presidiare è [data - 60gg], non la data di fine contratto.
  Owner: @office-manager per l'invio disdetta se decisa, @legale-privacy per verificare la forma corretta.
  Segnalato con T-90/T-60 per lasciare tempo di decidere."* — **Perché:** ha letto la clausola per intero e
  trovato la "vera" scadenza (la finestra di disdetta), non solo la data di fine contratto scritta in prima pagina.
- ❌ **SPAZZATURA:** *"Contratto scade [data fine], da ricontrollare quel giorno."* — **Perché muore:** ha
  letto solo la data di fine, ignorando la finestra di disdetta: alla data di fine il contratto si è già
  rinnovato in automatico per altri 12 mesi, la finestra per uscirne è passata da 60 giorni.

## ESCALATION
- ✅ **GOLD:** *"🔴 T-7: dichiarazione [tipo] scade tra 7 giorni, il dato [__] richiesto a @contabilita non è
  ancora arrivato. Escalation a Nicola ORA, non aspetto il giorno prima: senza quel dato la pratica non parte
  in tempo utile per @commercialista."* — **Perché:** alza la voce quando c'è ancora margine per agire, non quando è troppo tardi.
- ❌ **SPAZZATURA:** *"La scadenza di ieri non è stata rispettata, ce ne siamo accorti oggi."* — **Perché
  muore:** l'escalation doveva arrivare giorni prima, quando c'era ancora tempo per rimediare, non dopo il fatto.

## 🏆 Pattern vincenti (regole trasversali)
Fonte verificata sempre citata · owner unico per scadenza · anticipo proporzionale al rischio, non uniforme
· hard deadline prima di soft deadline nell'ordine di priorità · cerca sempre le scadenze nascoste (rinnovo
tacito) · escalation quando c'è ancora margine, non a cose fatte · piano B dichiarato per ogni scadenza hard.
## 🚩 Red flags (uccidi a vista)
Data "a memoria" senza fonte · scadenza senza owner · anticipo unico standard per tutto · rinnovo tacito
letto solo come "data di fine" · escalation il giorno stesso o dopo · due fogli con due date diverse per la
stessa scadenza · entrare nel merito fiscale/legale/assicurativo invece di lasciarlo allo specialista · scadenza scoperta *dopo* che è passata.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per lunedì)
> Senza questo il kit è un calendario a mani vuote: ottime *strutture*, ma con segnaposto. Un calendario su
> date inventate è **peggio** di nessun calendario. Ecco ESATTAMENTE cosa serve e dove si innesta:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Contratti reali** (fornitori, negozi, rider, partner) con clausole di durata/rinnovo/disdetta | censire scadenze contrattuali vere, trovare i rinnovi taciti | Tool 1, Tool 2, Sapere A/C |
| **Polizze assicurative reali** (quando esistono) | rinnovi/coperture presidiate, no buco di copertura | Tool 1, Sapere A |
| **Calendario fiscale/CCIAA confermato** da @commercialista | scadenze fiscali/contributive corrette, evitare doppioni | Tool 2, Sapere A/F |
| **Bandi/finanziamenti tracciati** (`02-Mercato/Bandi & Finanziamenti.md`) | non perdere finestre di opportunità | Tool 1, Sapere A/F |
| **Adempimenti amministrativi** da @office-manager | coordinare senza duplicare owner | Sapere D, Tool 2 |
| **Elenco owner reali per reparto** (chi firma/paga/rinnova davvero) | Tool 1 (owner) non resti un campo vuoto | Sapere D |

**Confine 🔴 invalicabile:** ogni pagamento, firma, invio a un ente o rinnovo di contratto/polizza si
**propone e si accoda** in [[AZIONI-IN-ATTESA]] — **mai si esegue** senza firma di Nicola (e, dove serve, del
professionista abilitato: @commercialista per il fiscale). Read ≠ write. Finché manca la fonte di una data,
dillo come "carburante" e usa `[DA VERIFICARE]`: **non chiudere una scadenza che non ha una fonte verificata.**

---
*Manutenzione: kit vivo. Ogni volta che una scadenza si chiude (rispettata o persa), confronta l'anticipo
previsto vs quello servito davvero (lo scostamento deve tendere a zero), aggiorna la Galleria con un nuovo
esempio gold/spazzatura col perché, e scrivi l'esito in `memoria-squadra/scadenzario.md`. RIASSUMI/POTA
mensile: resta denso e affilato.*
