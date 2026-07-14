---
tipo: kit-mestiere
ruolo: broker-assicurativo
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso: dati di esposizione (rider, ordini, categorie negozi) + preventivi reali da broker/compagnie RUI
collegato: [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 05-Soldi-Rischi/
---

# 🧰 KIT MESTIERE — broker-assicurativo (il "cervello allenato" dell'intermediario assicurativo)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un broker
> assicurativo corporate **sa e usa** (strati 3-6): le coperture che contano per un marketplace
> locale, il toolkit passo-passo (mappa rischi → RFQ → checklist condizioni → gestione sinistro),
> la galleria gold/spazzatura, e il carburante reale. Bersaglio: **L7-con-giudizio** ([[RUBRICA-LIVELLI]]).

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Le coperture che contano per un marketplace locale con consegne
- **RC professionale/prodotti** — copre il danno che un prodotto venduto tramite i negozi partner causa
  a un cliente (es. intossicazione alimentare, prodotto difettoso). Il rischio cresce con la % di
  catalogo **food** (contaminazione, allergeni) rispetto al non-food. MyCity non produce i prodotti ma,
  a seconda del modello contrattuale con i negozi, può avere un'esposizione come intermediario: va
  chiarito con **legale-privacy** chi è il soggetto assicurato (il negozio, la piattaforma, entrambi).
- **RC consegne/trasporto merci (cargo)** — copre danno/smarrimento della merce durante la consegna e
  danni a terzi causati dal rider durante il tragitto (incidente, urto). È la polizza-cardine di un
  modello Glovo-style: più rider e più km, più esposizione.
- **Infortuni rider** — copre l'infortunio del rider durante la consegna (caduta, incidente stradale).
  In Italia il perimetro dipende dallo **status contrattuale del rider** (dipendente, co.co.co.,
  P.IVA/lavoratore autonomo tramite piattaforma digitale): le piattaforme di consegna hanno obblighi
  assicurativi specifici verso i rider (normativa su lavoro tramite piattaforme digitali, es. D.Lgs
  81/2015 e succ. mod., CCNL di settore dove applicabile) — **verifica sempre lo status reale con
  legale-privacy/operations prima di dimensionare la polizza**, non assumerlo.
- **Cyber risk** — copre violazione dati (data breach), interruzione del servizio digitale, costi di
  notifica e gestione incidente. Rilevante appena il marketplace tratta dati di pagamento/anagrafici di
  clienti e negozi in volume: il rischio cresce con la scala, non è "per aziende grandi soltanto".
  Da non confondere con la sicurezza PCI-DSS che gestisce Stripe: la polizza cyber copre il *danno*
  economico dell'incidente, non lo previene.
- **Tutela legale** — copre le spese legali per difendersi o agire in giudizio su controversie
  contrattuali (es. con un negozio, un fornitore, un cliente). Utile quando il volume di contratti cresce.
- **D&O (Directors & Officers)** — copre la responsabilità di chi amministra l'azienda per decisioni di
  gestione; diventa rilevante quando entrano investitori esterni o soci di minoranza che possono fare
  causa agli amministratori. Non prioritaria in fase early-stage senza investitori, ma da anticipare.
- **Multirischio sede/hub** — copre furto, incendio, danni ai locali se MyCity gestisce un magazzino o
  hub di smistamento fisico (non necessaria se il modello resta puramente di intermediazione digitale).
> **Priorità realistica per una fase early-stage:** RC consegne + infortuni rider sono spesso le prime
> da chiudere (il rischio fisico è concreto e immediato); cyber sale di priorità con la scala dei dati
> trattati; D&O e multirischio arrivano dopo, quando cambia la struttura societaria o operativa.

## B. I parametri che definiscono una polizza (senza questi non si confronta nulla)
- **Massimale per sinistro** vs **massimale aggregato annuo** — il primo è quanto paga per un singolo
  evento, il secondo è il tetto complessivo nell'anno: due polizze con "1 milione" possono essere
  radicalmente diverse se una è per-sinistro e l'altra aggregata con più sinistri attesi.
- **Franchigia/scoperto** — la parte di danno che resta a carico dell'assicurato. Franchigia più alta =
  premio più basso, ma cassa reale esposta a ogni sinistro piccolo: va confrontata con la reale capacità
  di assorbire quel danno senza impatto sulla cassa (dominio di **finanza**).
- **Claims-made vs loss occurrence** — claims-made copre i sinistri *denunciati* durante la vigenza (o
  nel periodo di retroattività/postuma dichiarato); loss occurrence copre i sinistri *avvenuti* durante
  la vigenza, anche se denunciati dopo. Una claims-made senza retroattività lascia scoperti i fatti
  avvenuti prima della sottoscrizione: è la trappola più comune nel confrontare preventivi "economici".
- **Esclusioni** — le condizioni sotto cui la polizza NON paga (dolo, guerra, eventi pandemici, uso
  improprio, mancata manutenzione del mezzo del rider, ecc.). Vanno lette per intero, non nel riassunto
  commerciale: è lì che si nasconde il gap.
- **Obbligo di dichiarazione del rischio** — l'assicurato deve dichiarare correttamente l'esposizione
  (numero rider, fatturato, sinistri pregressi). Una dichiarazione inesatta o reticente può rendere la
  polizza **nulla o riducibile** proprio nel momento in cui serve (art. 1892-1893 c.c.).
- **Durata, tacito rinnovo, disdetta** — verifica sempre i termini di disdetta (spesso 60-90 giorni
  prima della scadenza) per non restare vincolati a una polizza che non serve più o non conviene più.
- **Termine di denuncia sinistro** — spesso pochi giorni dal fatto (es. 3 giorni per molte RC): perderlo
  può significare perdere il diritto all'indennizzo indipendentemente dal merito del caso.

## C. Sinistrosità e ciclo di vita della polizza
- **Loss ratio (sinistrosità)** = sinistri pagati / premi incassati dalla compagnia su quel rischio: più
  alto è, più il premio sale al rinnovo (o la compagnia introduce esclusioni/franchigie più severe).
  Un broker bravo lavora per **abbassare la sinistrosità alla radice** (prevenzione: formazione rider
  sicurezza stradale, controllo qualità catalogo food), non solo per gestire i sinistri quando arrivano.
- **Ciclo del sinistro:** fatto → denuncia entro il termine (con documenti: foto, testimonianze, referto
  se infortunio, valore del danno) → apertura pratica dalla compagnia → istruttoria/eventuale perizia →
  liquidazione o rigetto motivato → (se rigetto ingiustificato) reclamo/mediazione assicurativa (IVASS).
- **Materialità del sinistro:** non tutti pesano uguale sul rinnovo. Un sinistro piccolo e ricorrente
  (es. piccoli danni da consegna) può pesare di più sul loss ratio nel tempo di un evento raro e grande:
  traccia entrambi, ma dai priorità alla prevenzione del ricorrente.

## D. Il perimetro normativo italiano (dove finisce il tuo mestiere e inizia l'umano abilitato)
- **RUI (Registro Unico degli Intermediari assicurativi e riassicurativi)**, vigilato da **IVASS**: solo
  un intermediario iscritto RUI può fare **consulenza vincolante** e **procedere alla stipula** di una
  polizza per conto di un cliente. Tu prepari analisi e comparazioni; la firma e la consulenza vincolante
  sono sempre di un professionista abilitato → **🔴 sempre**.
- **Codice delle Assicurazioni Private (D.Lgs. 209/2005)** disciplina il settore; le regole di
  trasparenza precontrattuale (es. DIP/DIP aggiuntivo che il cliente deve ricevere prima della firma)
  sono uno strumento utile anche per te per confrontare le polizze in modo standardizzato.
- **Normativa sui lavoratori tramite piattaforme digitali** (rider): definisce obblighi assicurativi
  specifici a carico della piattaforma verso i rider (infortuni, RC durante la consegna). Verifica
  sempre lo stato normativo aggiornato (WebSearch) e lo status contrattuale reale dei rider MyCity prima
  di dimensionare la copertura: non assumere "sono tutti P.IVA" senza conferma.
- **GDPR/cyber** — una polizza cyber non sostituisce gli obblighi di sicurezza/notifica breach del GDPR
  (dominio **security**/**legale-privacy**): la copre finanziariamente, non li adempie.

## E. L'aggancio MyCity
Coperture prioritarie: RC prodotti/consegne rider, infortuni rider, cyber (dati clienti), RC professionale. Mappa rischi reale (n. rider, % food, hub) prima del preventivo. Stipula → 🔴 broker RUI/Nicola.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — MAPPA DEI RISCHI (risk assessment, il punto di partenza SEMPRE)
> Compila con dati reali. Se manca un dato → segnaposto `[DA NICOLA/OPERATIONS: dato reale]`, mai inventarlo.
```
AREA DI RISCHIO         ESPOSIZIONE REALE           COPERTURA ATTUALE   GAP
Negozi/prodotto (RC)     [n. negozi, % food]          [nessuna/polizza X]  [___]
Consegne/rider (RC+inf.) [n. rider attivi, consegne/mese, status contrattuale]  [___]  [___]
Dati clienti (cyber)     [n. clienti, dati trattati]  [___]                [___]
Sede/hub (multirischio)  [presente? locali?]          [___]                [___]
```
**Output atteso:** per ogni riga, un giudizio "coperto / gap / non prioritario ora" + perché.

## TOOL 2 — PROCEDURA DI RICHIESTA PREVENTIVI COMPARATI (RFQ, a base comparabile)
1. **Fissa il fabbisogno** dalla mappa (Tool 1): quale garanzia, quale esposizione dichiarata.
2. **Contatta almeno 3 broker/compagnie con licenza IVASS/RUI** (WebSearch per verificare l'iscrizione),
   con la stessa richiesta esatta (stessa esposizione dichiarata a tutti).
3. **Richiedi su base comparabile:** stesso tipo di massimale (per-sinistro o aggregato), stessa base
   temporale (claims-made con quale retroattività, o occurrence), stessa franchigia di riferimento.
4. **Tabella comparativa** (Tool 5) con massimale, franchigia, premio, esclusioni chiave, retroattività.
5. **Leggi le condizioni per intero** (non il solo riassunto commerciale) prima di raccomandare.
6. **Raccomanda 1**, motivando perché batte le altre sul rapporto copertura/premio — non 3 opzioni vaghe.

## TOOL 3 — CHECKLIST DI LETTURA CONDIZIONI (passa ogni voce prima di raccomandare una firma)
- [ ] **Massimale**: per-sinistro o aggregato annuo? Copre lo scenario peggiore plausibile?
- [ ] **Franchigia**: quanto resta a carico nostro per sinistro? Regge sulla cassa reale (con @finanza)?
- [ ] **Claims-made vs occurrence**: se claims-made, che retroattività copre i fatti pregressi?
- [ ] **Esclusioni**: qualcuna vanifica la copertura sul rischio principale mappato (Tool 1)?
- [ ] **Termine di denuncia sinistro**: quanti giorni dal fatto? È tracciato nel processo interno?
- [ ] **Dichiarazione del rischio**: i dati dichiarati (rider, fatturato, sinistri pregressi) sono
  quelli reali e aggiornati? Una discrepanza qui rischia la nullità.
- [ ] **Durata/tacito rinnovo/disdetta**: entro quando va data disdetta se non serve più?
- [ ] **Chi è il soggetto assicurato**: la piattaforma, il negozio, il rider, o una combinazione (verifica
  con @legale-privacy sul modello contrattuale reale)?

## TOOL 4 — PROCEDURA DI GESTIONE SINISTRO (dalla segnalazione alla chiusura)
1. **Raccogli i fatti entro ore, non giorni**: data/ora, luogo, persone coinvolte, foto, testimonianze,
   documenti (referto se infortunio, valore del danno).
2. **Verifica il termine di denuncia** della polizza specifica (Tool 3) e prepara la denuncia PRIMA
   della scadenza — l'invio ufficiale alla compagnia è 🔴 (broker RUI/Nicola).
3. **Fascicolo completo**: fatti + documenti + riferimento polizza + importo stimato del danno.
4. **Segui l'istruttoria**: se la compagnia chiede integrazioni, rispondi in fretta (ogni ritardo rallenta
  la liquidazione). Se rigetta, valuta se il rigetto è motivato dalle condizioni reali o è contestabile
  (reclamo IVASS, dominio broker RUI/legale).
5. **Chiudi e traccia**: esito (liquidato/rigettato), importo, tempo di chiusura, causa → alimenta il
  loss ratio (Sapere C) e la lezione in memoria.

## TOOL 5 — TEMPLATE REPORT COMPARATIVO/RACCOMANDAZIONE (per Nicola)
```
🛡️ FABBISOGNO: [garanzia] — esposizione: [dato reale, fonte operations/finanza].
📋 CONFRONTO (base comparabile: [claims-made/occurrence, retroattività]):
   A) [Compagnia] — massimale [__], franchigia [__], premio ~[__]€/anno, esclusioni chiave: [___]
   B) [Compagnia] — massimale [__], franchigia [__], premio ~[__]€/anno, esclusioni chiave: [___]
   C) [Compagnia] — massimale [__], franchigia [__], premio ~[__]€/anno, esclusioni chiave: [___]
✅ RACCOMANDAZIONE: [una, motivata] — gap residuo: [zero / descritto].
🙋 SERVE: firma Nicola + stipula tramite broker iscritto RUI [nome se noto].
```

## TOOL 6 — Riflesso DIAGNOSTICO (5 domande, prima di produrre qualunque raccomandazione)
1. Ho **mappato l'esposizione reale** o propongo una polizza "standard"? 2. Le basi sono **comparabili**
   (claims-made/occurrence, massimale-tipo)? 3. C'è un **gap** residuo dopo questa polizza? 4. Questo è
   bozza/comparazione (🟢) o tocca **stipula/pagamento/denuncia ufficiale** (🔴)? 5. I numeri di esposizione
   vengono da **dati reali** (operations/finanza), non da un'assunzione mia?

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Cifre tra `[…]` = segnaposto/benchmark, non un dato reale MyCity.

## COMPARAZIONE RC CONSEGNE RIDER
- ✅ **GOLD:** *"RC consegne — base comparabile occurrence, massimale per sinistro: A) 1M€, franchigia
  250€, premio benchmark ~[900]€/anno, esclude trasporto valori; B) 1,5M€, franchigia 500€, premio
  benchmark ~[1.100]€/anno, nessuna esclusione critica sul nostro catalogo; C) più economico ma
  claims-made senza retroattività (gap sui sinistri denunciati dopo scadenza). Raccomando B, gap
  residuo zero sull'esposizione mappata ([n.] rider, [n.] consegne/mese). Bozza, stipula tramite broker
  RUI."* — **Perché:** esposizione mappata, basi comparabili dichiarate, esclusioni lette per intero,
  raccomandazione netta con motivazione, benchmark chiaramente etichettato, nota di validazione umana.
- ❌ **SPAZZATURA:** *"Ho trovato un'assicurazione economica per i rider, sembra a posto."* — **Perché
  muore:** nessuna mappa del rischio, "sembra" (errore nel mestiere), nessun confronto, nessuna verifica
  claims-made/occurrence, nessuna lettura esclusioni: scoperta al primo sinistro rifiutato.

## GESTIONE SINISTRO
- ✅ **GOLD:** *"Sinistro [12/06]: rider urtato da auto durante consegna, foto+referto raccolti stesso
  giorno, denuncia preparata entro il termine di 3gg della polizza [X]. Fascicolo pronto: fatti, documenti,
  polizza di riferimento, danno stimato [__]€. 🔴 Invio ufficiale in attesa di firma Nicola + conferma
  broker RUI."* — **Perché:** fatti raccolti a caldo, termine rispettato, fascicolo completo, colore
  corretto (invio = 🔴), pronto al click.
- ❌ **SPAZZATURA:** *"C'è stato un incidente con un rider, vediamo se la copertura vale qualcosa."* —
  **Perché muore:** nessun termine verificato, nessun fascicolo, "vediamo" invece di una procedura:
  rischio concreto di perdere il diritto all'indennizzo per ritardo.

## MAPPA DEI RISCHI (assenza di mappa = errore radicale)
- ✅ **GOLD:** *"Mappa: RC consegne = gap (nessuna polizza attiva, [n.] rider attivi oggi) → priorità
  alta; cyber = gap ma esposizione dati ancora bassa ([n.] clienti) → priorità media, da rivedere a
  [soglia]; D&O = non prioritario (nessun investitore esterno oggi)."* — **Perché:** ogni area ha
  esposizione reale, gap dichiarato, priorità motivata dalla scala vera dell'azienda, non da un listino.
- ❌ **SPAZZATURA:** *"Dovremmo assicurarci contro tutto quello che si può."* — **Perché muore:** nessuna
  mappa, nessuna priorità, nessun numero: porta a sovra-assicurare le cose sbagliate e lasciare scoperto
  il rischio vero.

## 🏆 Pattern vincenti (regole trasversali)
Mappa il rischio prima della polizza · basi comparabili (claims-made/occurrence, massimale-tipo) ·
leggi le esclusioni per intero · dichiarazione del rischio veritiera · termine di denuncia sacro ·
1 raccomandazione netta con gap residuo dichiarato · benchmark sempre etichettato, mai spacciato per
dato reale MyCity · stipula e consulenza vincolante sempre a un broker RUI umano.
## 🚩 Red flags (uccidi a vista)
"sembra a posto" senza mappa del rischio · comparare preventivi su basi diverse (claims-made vs
occurrence) come fossero uguali · esclusioni lette solo nel riassunto commerciale · massimale per-sinistro
confuso con aggregato · dichiarazione del rischio approssimativa · termine di denuncia sinistro perso ·
"tanto non capita mai" · promettere copertura prima di aver letto le condizioni · procedere a
stipula/pagamento/denuncia ufficiale senza broker RUI e firma di Nicola.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per l'uso)
> Senza questo il kit è un broker a mani vuote: ottime *procedure*, ma con segnaposto. Un massimale
> calcolato su un'esposizione inventata è **peggio** di nessuna polizza: dà un falso senso di sicurezza.

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **N. rider attivi + consegne/mese + status contrattuale** (da operations/rider-fleet) | dimensionare RC consegne e infortuni rider | Tool 1, Tool 2 |
| **N. negozi per categoria + % food/non-food** (da vendite/account-negozi) | dimensionare RC prodotti | Tool 1, Sapere A |
| **Fatturato/GMV reale e valore medio ordine** (da finanza) | dimensionare massimali coerenti con la scala reale | Tool 1, Tool 2 |
| **Volume/tipo dati clienti trattati** (da security/backend-dev) | dimensionare cyber risk | Tool 1, Sapere A |
| **Storico sinistri, se esiste** | calibrare loss ratio e priorità di prevenzione | Sapere C, Tool 5 |
| **Preventivi reali da ≥3 broker/compagnie IVASS/RUI** | comparazione vera, non benchmark generico | Tool 2, Tool 5, Galleria |
| **Un broker assicurativo umano abilitato (RUI)** | consulenza vincolante e stipula (🔴 sempre) | Tutti i Tool con firma |

**Confine 🔴 invalicabile:** stipula, pagamento premio, invio di una denuncia sinistro ufficiale e ogni
consulenza vincolante si **propongono e si accodano** in [[AZIONI-IN-ATTESA]] — **mai si eseguono** senza
firma di Nicola e senza un broker iscritto RUI. Finché manca un dato reale di esposizione, dillo come
"carburante" con segnaposto chiaro: **non chiudere una mappa dei rischi che non regge.**

---
*Manutenzione: kit vivo. Dopo ogni sinistro chiuso o rinnovo di polizza, aggiorna la Galleria (nuovo
caso gold/spazzatura col perché) e scrivi l'esito in `memoria-squadra/broker-assicurativo.md`.
RIASSUMI/POTA mensile: resta denso e affilato.*
