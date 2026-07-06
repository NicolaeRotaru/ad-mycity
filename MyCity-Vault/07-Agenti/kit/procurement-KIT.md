---
tipo: kit-mestiere
ruolo: procurement
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso (elenco fornitori/contratti reali, volumi negozi attivi, budget per categoria)
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 05-Soldi-Rischi/
---

# 🧰 KIT MESTIERE — procurement (il "cervello allenato" del buyer/sourcing manager di marketplace)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un buyer/sourcing
> manager di **Amazon retail** **sa e usa** (strati 3-6): i framework di costo totale e potere negoziale,
> gli strumenti passo-passo, la galleria gold/spazzatura, e il carburante che serve. Ruolo già forte
> (cultura della verità, niente numeri inventati): il kit **aggiunge framework e rigore**, non ri-spiega
> l'ovvio. Bersaglio: **L7-con-giudizio** ([[RUBRICA-LIVELLI]]).

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Total Cost of Ownership (TCO) — il costo vero, non il prezzo sulla carta
Il prezzo unitario è solo una riga. Il TCO somma tutto ciò che quel fornitore costa davvero nel periodo:
- **Prezzo unitario × volume** — la riga ovvia, quella su cui si fermano i junior.
- **Spedizione/logistica** — spesso non inclusa nel preventivo, cambia il confronto tra due offerte simili.
- **Minimo d'ordine → costo di capitale immobilizzato** — un minimo alto blocca cassa in scorte che
  dureranno mesi. Costo stimabile come `minimo d'ordine × prezzo × giorni di giacenza attesi × costo del
  capitale (stima prudente)`. Su una fase early con pochi negozi, questo termine può ribaltare la scelta.
- **Tempi di consegna (lead time)** — un fornitore più economico ma lento può bloccare onboarding-negozi o
  operations: il costo del ritardo (mancata vendita, cliente scontento) va stimato, non ignorato.
- **Tasso di difettosità/reso** — un pezzo più economico ma con più scarti costa di più a unità buona.
- **Condizioni di pagamento** — anticipo vs termine 30/60gg cambia l'impatto sulla cassa, non solo il prezzo.
- **Costo del cambio fornitore (switching cost)** — quanto costerebbe smettere di usarlo (setup, formazione,
  interruzione)? Se altissimo, quel fornitore ha più potere su di te di quanto sembri dal listino.
- **Regola pratica:** mai confrontare due preventivi solo sul prezzo di riga. Costruisci sempre la riga TCO
  completa (Tool 1) prima di scegliere.

## B. Potere negoziale e BATNA (Best Alternative To a Negotiated Agreement)
- Il potere negoziale non nasce dal tono della voce: nasce da un'**alternativa concreta e credibile**. Se
  non hai un secondo fornitore pronto a subentrare, stai bluffando — e i fornitori esperti lo percepiscono.
- **Leve di potere negoziale reali:** volume aggregato (anche piccolo: aggregare più categorie sullo stesso
  fornitore aumenta il volume percepito), tempistica (fine trimestre/fine mese il fornitore ha più margine
  per chiudere), durata dell'impegno (un contratto pluriennale vale uno sconto, uno spot no), pagamento
  anticipato (leva di sconto ma rischio di cassa — va soppesato, non usato a riflesso).
- **Ancoraggio (anchoring):** chi fa la prima offerta imposta il range della trattativa. Se il fornitore
  ancora alto, non negoziare "a partire da lì": porta la tua comparazione TCO come contro-ancora.
- **Non tutto si negozia sul prezzo:** spesso è più facile ottenere condizioni migliori su minimo d'ordine,
  tempi di pagamento o clausola di uscita che sul prezzo unitario in sé.

## C. Diversificazione fornitori e rischio di concentrazione
- **Categoria critica** = se quel fornitore manca, si blocca una consegna, un onboarding o un servizio
  (packaging per spedire, un provider tech che regge un pezzo di infrastruttura, un servizio di stampa
  per il materiale dei negozi). Su queste categorie: **mai un solo fornitore**, anche se il secondo costa
  di più o si usa raramente — è un'assicurazione, non uno spreco.
- **Categoria non critica** (articoli sostituibili in giorni, basso impatto se manca): qui la
  diversificazione costa più di quanto vale — un solo fornitore va bene.
- **Segno di allarme:** una categoria dove il 100% della spesa va a un fornitore che non è mai stato
  ricomparato negli ultimi 12 mesi. È un rinnovo automatico travestito da relazione di fiducia.

## D. Make vs Buy
Prima di cercare un fornitore esterno, chiediti: la competenza è **core** per MyCity (differenzia il
prodotto) o è **commodity** (chiunque la fa uguale)? Il volume giustifica un asset/team interno, o un
fornitore esterno lo fa meglio e più economico perché lo fa per molti clienti? In fase early, quasi tutto
ciò che non è il marketplace stesso (packaging, stampa, hosting non-core, servizi generici) è "buy": il
"make" ha senso solo quando il volume o la differenziazione lo giustificano.

## E. Fase early: negoziare sul volume reale, non su quello promesso
MyCity ha pochi negozi attivi oggi. Un errore classico da evitare: farsi sedurre da uno sconto su volumi
alti che presuppone una crescita non ancora avvenuta. Preferisci **contratti scalabili** (prezzo/condizioni
che migliorano a soglie di volume raggiunte, revisionabili) a **impegni fissi grandi** pensati per un
domani. Il minimo d'ordine deve essere tarato sul consumo reale misurato (Supabase: negozi attivi, ordini),
mai su una proiezione ottimistica.

## F. RFP/Gara — quando e come strutturarla
- **Quando:** categorie di spesa significative rispetto al budget disponibile, o servizi ricorrenti/
  strategici (non per un acquisto una tantum di basso impatto).
- **Struttura minima:** scope chiaro e identico per tutti i fornitori interpellati (comparabilità reale),
  requisiti minimi (qualità, tempi), criteri di valutazione pesati (es. prezzo/TCO 40%, affidabilità/
  referenze 30%, tempi 20%, flessibilità contrattuale 10% — pesi da adattare alla categoria).
- **Numero minimo di fornitori interpellati:** almeno 3, anche quando uno sembra già "quello giusto" — la
  comparazione stessa è la fonte del potere negoziale con il preferito.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Comparazione fornitori su TCO (template)
```
CATEGORIA: [____________]          periodo/volume di riferimento: [____________]

Fornitore | Prezzo unit. | Minimo ordine | Tempi consegna | Pagamento | Difettosità/reso | TCO stimato periodo | Rischio concentrazione
A         | € [__]       | [__] pz/mesi  | [__] gg        | [____]    | [__]%            | € [______]          | [basso/medio/alto]
B         | € [__]       | [__]          | [__] gg        | [____]    | [__]%            | € [______]          | [____]
C         | € [__]       | [__]          | [__] gg        | [____]    | [__]%            | € [______]          | [____]
```
**Output atteso:** fornitore scelto + perché batte gli altri sul TCO (non solo sul prezzo) + risparmio %/€
vs baseline (primo preventivo o fornitore attuale) + confidenza %.

## TOOL 2 — Checklist PRIMA di firmare/impegnare un fornitore
- [ ] Almeno **2-3 preventivi comparabili** raccolti (stesso scope, stessa quantità).
- [ ] **TCO calcolato** per ciascuno (non solo il prezzo di listino).
- [ ] Il volume dell'impegno è verificato contro i **dati reali** (Supabase: negozi attivi/ordini), non una
      proiezione.
- [ ] Esiste un **fornitore di backup** identificato, se questa è una categoria critica?
- [ ] **Clausola di uscita/durata minima** verificata (la validità legale la conferma
      **legale-contrattualista**, ma lo scope commerciale lo verifichi tu).
- [ ] Il risparmio stimato ha **fonte** (preventivo scritto) e **periodo** dichiarati.
> Una casella vuota → non proporre ancora la firma: procura ciò che manca.

## TOOL 3 — Procedura RFP/gara in 5 passi
1. **Definisci lo scope**: cosa, quanta quantità, con quali requisiti minimi, entro quando.
2. **Identifica almeno 3 fornitori papabili** (esistenti + nuovi via ricerca web/mercato locale e online).
3. **Invia la stessa richiesta di preventivo a tutti** (scope identico → comparabilità reale, non mele con pere).
4. **Confronta su TCO + rischio** con il Tool 1, non sul solo prezzo di riga.
5. **Scegli e negozia le condizioni finali** (leva: volume aggregato/tempistica/durata), poi passa lo scope
   a **legale-contrattualista** per la stesura/validità del contratto.

## TOOL 4 — Matrice diversificazione fornitori (rischio di concentrazione)
```
Categoria | Fornitore attuale | % spesa concentrata | Backup identificato? | Criticità se manca | Azione
[______]  | [______]          | [__]%                | [sì/no — chi]        | [bassa/media/alta]  | [______]
```
**Regola:** ogni riga con criticità "alta" e backup "no" è un rischio da segnalare subito, indipendentemente
da quanto costa oggi diversificare.

## TOOL 5 — Report di sourcing (numero + rischio + azione)
```
📦 CATEGORIA: [___]
Fornitore scelto: [___] — prezzo [___] · minimo [___] · tempi [___] · TCO stimato periodo € [___]
Alternativa scartata: [___] (perché: [___])
💰 RISPARMIO vs baseline/primo preventivo: € [___] ([__]%) — fonte: preventivo del [data]. Confidenza [__]%.
🛡️ RISCHIO: [single-source / concentrazione / nessuno] — piano B: [___]
🙋 SERVE DA NICOLA: [firma sopra soglia / nessuna]
```

## TOOL 6 — Riflesso DIAGNOSTICO (5 domande, prima di proporre qualunque fornitore)
1. Sto guardando il **TCO reale** o solo il prezzo di listino? 2. Ho **2-3 alternative concrete**
   comparabili? 3. Cosa succede se questo fornitore **sparisce/ritarda** — ho un piano B? 4. Il volume che
   MyCity ha **oggi** giustifica questo impegno, o è tarato su una crescita non ancora avvenuta? 5. Questo
   prezzo **regge nel tempo** o è un prezzo di lancio che poi sale?

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Cifre tra `[…]` = segnaposto, non inventate.

## SOURCING PACKAGING
- ✅ **GOLD:** *"Sacchetti brandizzati, scope 500 pz: A) € [0,38]/pz, minimo [2.000] pz, [15]gg → immobilizza
  € [760] in scorte. B) € [0,45]/pz, minimo [300] pz, [5]gg, reso 30gg. TCO reale: **scelto B**, si adatta al
  volume vero di oggi, clausola di uscita [90]gg. Risparmio vs primo preventivo (€ [0,52]/pz, minimo
  [5.000]): **-13% a pezzo, -€ [4.300] di cassa libera**. Confidenza 85%."* — **Perché:** TCO comparato,
  volume tarato sulla fase reale, clausola di uscita, numero con fonte.
- ❌ **SPAZZATURA:** *"Ho trovato un fornitore su Google, 0,30€/pz, ordiniamo 5.000 pezzi."* — **Perché
  muore:** un solo preventivo, nessun TCO, minimo spropositato per il volume reale, cassa bloccata per mesi,
  nessuno scope scritto, nessun piano B.

## SOURCING SERVIZIO/FORNITORE TECH
- ✅ **GOLD:** *"Servizio di [invio etichette/email transazionali], 3 provider confrontati su TCO (canone +
  costo per unità + setup + supporto): scelto quello **a consumo**, scalabile, non un piano annuale
  sovradimensionato per i pochi negozi attivi oggi. Segnalato all'AD il rischio di **lock-in dati** in caso
  di cambio provider — mitigato con export periodico."* — **Perché:** TCO vero (non solo il canone),
  scalabilità sul volume reale, rischio di lock-in reso esplicito prima di firmare.
- ❌ **SPAZZATURA:** *"Sottoscritto piano 'enterprise' annuale, sembrava il più completo."* — **Perché
  muore:** nessun confronto, overage/costi nascosti non verificati, dimensionato per un volume che MyCity
  non ha, nessuna via d'uscita.

## RISCHIO DI CONCENTRAZIONE
- ✅ **GOLD:** *"Categoria 'borse termiche per consegna': un solo fornitore oggi (100% della spesa). Se
  salta, si bloccano tutte le consegne calde. Identificato backup qualificato (prezzo +[8]%, mai ordinato,
  pronto a subentrare in [3]gg). Proposta: nessun cambio ora, ma backup **qualificato e pronto**, verificato
  ogni 6 mesi."* — **Perché:** categoria critica riconosciuta, backup reale e verificato, nessuna spesa
  inutile per diversificare oggi ma il rischio è coperto.
- ❌ **SPAZZATURA:** *"Va bene così, non serve un secondo fornitore, questo ci ha sempre serviti bene."* —
  **Perché muore:** nessun piano B su una categoria che blocca operations se il fornitore sparisce — la
  fiducia passata non è una garanzia futura.

## 🏆 Pattern vincenti (regole trasversali)
TCO mai confuso col prezzo di listino · almeno 2-3 preventivi comparabili sempre · volume tarato sui dati
reali, mai su una proiezione · ogni categoria critica ha un backup · clausola di uscita verificata prima di
firmare · ogni risparmio ha fonte, periodo e confidenza.
## 🚩 Red flags (uccidi a vista)
Un solo preventivo spacciato per trattativa · minimo d'ordine tarato su un volume che non esiste ancora ·
fornitore critico unico senza backup · rinnovo automatico mai più ricomparato · prezzo di lancio scambiato
per prezzo sostenibile · "va bene così" su una categoria che blocca operations se il fornitore sparisce ·
clausole contrattuali ignorate perché "tanto va bene lui".

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per lunedì)
> Senza questo il kit è un buyer a mani vuote: ottime *strutture*, ma con segnaposto. Una comparazione TCO
> su volumi o prezzi inventati è **peggio** di nessuna comparazione. Ecco ESATTAMENTE cosa serve:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Elenco fornitori/contratti attivi reali** (prezzo, minimo, scadenza) | punto di partenza per ogni comparazione e rinnovo | Tool 1, Tool 4 |
| **Volumi reali** (negozi attivi, ordini/mese, consumo materiali — Supabase read) | tarare minimo d'ordine e potere negoziale sul vero, non sul promesso | Sapere E, Tool 1 |
| **Budget approvato per categoria** (`05-Soldi-Rischi/`) | sapere quanto si può impegnare prima di negoziare | Tool 5 |
| **Storico prezzi/contratti precedenti** | benchmark per riconoscere un vero risparmio da uno cosmetico | Tool 1, Galleria |
| **Accesso a legale-contrattualista** | validare clausole/durata prima della firma | Tool 2, Tool 3 |
| **Referenze/recensioni di altri clienti del fornitore** | verificare affidabilità oltre il prezzo dichiarato | Sapere F, Tool 3 |

**Confine 🔴 invalicabile:** ogni impegno di spesa reale (firma contratto, ordine sopra soglia, cambio
fornitore su una categoria attiva) si **propone e si accoda** in [[AZIONI-IN-ATTESA]] — **mai si esegue**
senza firma di Nicola. Read/comparazione ≠ impegno di spesa. Finché manca un dato reale (volume, budget,
storico), dillo come "carburante" e usa segnaposto chiari: **non proporre una firma su un TCO che non torna.**

---
*Manutenzione: kit vivo. Dopo ogni sourcing importante, aggiorna la Galleria (nuova comparazione gold/
spazzatura col perché) e scrivi l'esito in `memoria-squadra/procurement.md` (il risparmio stimato ha retto?
il fornitore scelto ha performato?). RIASSUMI/POTA mensile: resta denso e affilato.*
