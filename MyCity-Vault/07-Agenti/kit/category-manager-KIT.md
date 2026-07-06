---
tipo: kit-mestiere
ruolo: category-manager
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso (GMV/margine per categoria dal DB, mappa botteghe per categoria)
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 05-Soldi-Rischi/ · 02-Mercato/
---

# 🧰 KIT MESTIERE — category-manager (il "cervello allenato" del Category Manager di marketplace)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un Category/
> Vendor Manager di Amazon **sa e usa** (strati 3-6): i framework di assortimento e margine, gli
> strumenti passo-passo, la galleria gold/spazzatura, e il carburante che serve. Bersaglio:
> **L7-con-giudizio** ([[RUBRICA-LIVELLI]]). Regola madre: **ogni negozio/prodotto in categoria si
> valuta per share e margine che porta, mai per "sarebbe bello averlo".**

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. Share of category (la metrica che sostituisce "abbiamo un negozio")
- **Share of category** = quota della domanda reale di quella categoria a Piacenza che MyCity
  intercetta. Domanda reale ≈ negozi fisici della categoria in centro/città (`02-Mercato`) + quanto la
  gente compra già online/GDO per quella categoria. Numero di negozi MyCity ≠ share: 1 negozio può
  presidiare uno share minuscolo se la categoria ha 15 negozi fisici in città e ne manca la metà a bordo.
- **Fase early (pochi negozi reali):** finché il campione è piccolo, dichiara lo share come **stima con
  fonte** ("2 negozi su ~8 gastronomie fisiche mappate in centro → share potenziale ~25%, non share
  reale di GMV perché mancano ordini sufficienti per misurarlo"), mai come dato certo.
- **Share vs vanity count:** "abbiamo 5 negozi in categoria fiori" non dice nulla se sono tutti fioristi
  generici e nessuno copre "fiori funebri" o "bouquet economico sotto 15€" — quello è un buco di
  profondità che convive con un numero di negozi che sembra già alto.

## B. Ampiezza vs profondità di gamma (i due assi del catalogo)
- **Ampiezza** = quante sotto-categorie sono coperte. Esempio dentro "casa": ferramenta, arredo,
  elettrodomestici, giardinaggio. Un buco di ampiezza è visibile: manca l'intera sotto-categoria.
- **Profondità** = quante opzioni dentro ciascuna sotto-categoria già coperta (fasce di prezzo,
  occasioni d'uso, varianti). Un buco di profondità è invisibile a un conteggio grezzo: la
  sotto-categoria "c'è", ma solo con un'opzione, spesso la più cara o la meno cercata.
- **Regola pratica:** mappa SEMPRE su una matrice sotto-categoria × fascia/occasione. Le celle vuote
  sono i buchi; ordina per quanto la cella vuota costa in vendite perse (stima da ricerche interne al
  sito se disponibili, o da benchmark generico dichiarato come tale).

## C. Attach rate e cross-sell interno alla categoria
- **Attach rate** = % di ordini nella categoria che trascinano un secondo prodotto/negozio collegato
  (vino → formaggio, fiori recisi → biglietto/vaso). Si alza SENZA un negozio nuovo: basta il bundle,
  la vetrina "completa l'ordine", la sequenza giusta nel checkout (coordina con @growth-monetizzazione
  per l'upsell tecnico, tu porti la logica di categoria: cosa si abbina davvero).
- **Prodotti-civetta** — pochi articoli ad alta frequenza (pane fresco, fiori del giorno) che portano il
  traffico e fanno scoprire il resto della gamma. Proteggerli (disponibilità, prezzo competitivo) vale
  più che aggiungere il ventesimo SKU di coda lunga.

## D. Margine di categoria (con @finanza) — la seconda dimensione, mai solo l'assortimento
- **CM aggregato di categoria** = somma dei CM1/CM2 (definizione in `finanza-KIT.md`) di tutti gli
  ordini della categoria nel periodo. Categorie diverse hanno strutture di margine strutturalmente
  diverse: deperibile fresco (costo consegna a temperatura, spreco) ≠ casa/non-deperibile (margine più
  stabile, meno urgenza).
- **Non decidere l'assortimento guardando il negozio preferito**: un negozio-faro amato da Nicola può
  avere margine sottile; un negozio meno "romantico" può reggere meglio il CM. Il category manager
  guarda la categoria, non l'affetto.
- **Prima di negoziare condizioni** (esclusiva, quota minima di assortimento, vetrina) chiedi sempre a
  @finanza l'impatto sul margine: una condizione che alza lo share ma affossa il CM1 è una vittoria
  cosmetica.

## E. Cannibalizzazione vs completamento (il test prima di ogni aggiunta)
- **Cannibalizza** un'aggiunta che duplica: stesso SKU, stesso prezzo, stesso target di un negozio già
  dentro → lo share si divide tra due negozi, il GMV totale della categoria non cresce (o cresce meno
  del previsto), e il negozio esistente può risentirne (rischio di churn → coordina con @account-negozi).
- **Completa** un'aggiunta che copre una fascia/occasione/sotto-categoria assente → lo share cresce
  davvero. Test rapido: "se tolgo il negozio nuovo, il cliente troverebbe un sostituto identico dentro
  MyCity?" Se sì → cannibalizzazione probabile, verifica meglio prima di procedere.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — MATRICE DI CATEGORIA (mappa ampiezza × profondità, compilabile)
```
CATEGORIA: [____________]           periodo/fonte dati: [Supabase AAAA-MM / mappa 02-Mercato]
Sotto-categoria | Negozi MyCity | Fascia/occasione coperte | Fascia/occasione MANCANTI | Note
-----------------|---------------|--------------------------|---------------------------|------
[____]           | [N]           | [____]                   | [____] ← BUCO              | [____]
[____]           | [N]           | [____]                   | [____] ← BUCO              | [____]

Negozi fisici di Piacenza in questa categoria (da 02-Mercato): [N] · su MyCity: [N] → share potenziale [__]%
GMV categoria (periodo): € [____] (fonte Supabase) · CM1 aggregato: € [____] o [__]% (fonte @finanza, se disponibile)
```
**Output atteso:** ogni cella "BUCO" diventa una riga nel Tool 2, ordinata per impatto stimato.

## TOOL 2 — CLASSIFICAZIONE E OWNER DEL BUCO (non lasciarlo lì)
Per ogni buco identificato, rispondi in ordine:
1. **Tipo:** ampiezza (sotto-categoria assente) o profondità (fascia assente in sotto-categoria coperta)?
2. **Si chiude con un negozio nuovo o ampliando uno già attivo?**
   - Serve un negozio che non c'è → **PASSO-A @vendite** (pitch mirato su questo buco specifico).
   - Un negozio già dentro potrebbe coprirlo ampliando il suo catalogo → **PASSO-A @account-negozi**.
   - Il buco è un'intera verticale nuova, fuori da categorie esistenti → **PASSO-A @new-verticals**.
3. **Verifica cannibalizzazione:** l'aggiunta proposta duplica un negozio già dentro? Se sì, cambia
   target/fascia della proposta o scartala.
4. **Verifica margine:** la categoria/sotto-categoria regge il CM (chiedi a @finanza se manca il dato)?
5. **Impatto stimato:** € di GMV potenziale o share guadagnato (dichiara la fonte/assunzione).
> Ordina i buchi per impatto × facilità di chiusura, non per data di scoperta.

## TOOL 3 — CHECKLIST PRE-NEGOZIAZIONE CONDIZIONI (🔴 — solo proposta, mai esecuzione)
- [ ] Il margine di categoria (CM1/CM2) è confermato da @finanza per questa condizione?
- [ ] La condizione (esclusiva locale, quota minima assortimento, vetrina prioritaria) ha un termine e
      una scadenza chiari, non indefinita?
- [ ] L'impatto su un negozio concorrente nella stessa categoria è stato valutato (rischio churn → avvisa @account-negozi)?
- [ ] Il testo della proposta è completo (negozio/fornitore, termini, durata, contropartita) e pronto
      per `AZIONI-IN-ATTESA.md`?
- [ ] @legale-privacy ha rivisto se la condizione tocca un contratto/esclusiva formale?
> Una condizione negoziata senza queste 5 spunte è una promessa che nessuno ha verificato: non consegnarla.

## TOOL 4 — IL REPORT DI CATEGORIA (share + buco + margine + azione)
```
📦 CATEGORIA: [nome] — [N] negozi MyCity / [N] negozi fisici mappati (02-Mercato) → share potenziale [__]%
🧩 BUCO PRINCIPALE: [ampiezza/profondità] — [descrizione] → impatto stimato [€/share], fonte [____]
💰 MARGINE: CM1 aggregato categoria [€/%] (fonte @finanza, confidenza [__]%) → regge / da verificare
🚫 CANNIBALIZZAZIONE: [nessuna / rischio su negozio X — evitata cambiando fascia target]
➡️ PASSO-A: [@vendite / @account-negozi / @new-verticals] — [azione specifica]
🙋 SERVE DA NICOLA: [firma su condizione 🔴 / dato mancante]
```
**Ghigliottina prima di consegnare:** «Se un cliente cercasse questo dentro la categoria oggi, lo
troverebbe — e converrebbe rispetto ad Amazon o al negozio fisico?» → se no, il buco è reale.

## TOOL 5 — Riflesso DIAGNOSTICO (5 domande, prima di proporre qualunque mossa di categoria)
1. Qual è la **domanda reale** di questa categoria (fisica + online) contro quanto intercettiamo — che
   share, con quale fonte? 2. Il buco è **ampiezza o profondità**? 3. Il **margine aggregato** regge
   (dato @finanza) o rischio di spingere volume su un segmento in perdita? 4. Questa aggiunta porta
   **share vera o cannibalizza**? 5. Chi è l'**owner del passo successivo** — l'ho dichiarato o l'ho
   lasciato in sospeso?

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Cifre tra `[…]` = segnaposto, non inventate.

## MAPPA DI CATEGORIA
- ✅ **GOLD:** *"GASTRONOMIA: 2 negozi MyCity su ~8 gastronomie fisiche mappate in centro (`02-Mercato`)
  → share potenziale ~25%. Buco di PROFONDITÀ: zero banco fresco (salumi/formaggi da taglio), solo
  confezionato. GMV categoria (Supabase, [periodo]): € [____]. CM1 confermato positivo su confezionato
  (fonte @finanza); da verificare su fresco per il costo di consegna a temperatura controllata.
  PASSO-A @vendite: pitch mirato su banco fresco a 1 gastronomia-faro non ancora a bordo."* —
  **Perché:** share con fonte dichiarata, buco classificato ampiezza/profondità, margine verificato
  invece che assunto, owner del passo esplicito.
- ❌ **SPAZZATURA:** *"La categoria gastronomia va bene, abbiamo dei negozi buoni."* — **Perché muore:**
  nessuno share, nessun buco identificato, nessun margine, nessuna azione: è un'impressione, non un lavoro di category management.

## AGGIUNTA A CATEGORIA (cannibalizzazione vs completamento)
- ✅ **GOLD:** *"Proposta: nuovo fioraio specializzato in composizioni funebri (fascia [__]€, oggi
  assente). Non cannibalizza i 2 fioristi già dentro (loro coprono bouquet/matrimoni, fascia diversa) →
  completa la profondità. Share atteso +[__]%. PASSO-A @vendite."* — **Perché:** verifica esplicita di
  cannibalizzazione, fascia diversa dichiarata, share atteso quantificato con assunzione trasparente.
- ❌ **SPAZZATURA:** *"Aggiungiamo un altro fioraio, più scelta per il cliente."* — **Perché muore:**
  nessun controllo su cosa già c'è dentro, rischio reale di cannibalizzare un negozio esistente e
  spaccare lo share invece di farlo crescere.

## NEGOZIAZIONE CONDIZIONI DI CATEGORIA
- ✅ **GOLD:** *"🔴 Proposta esclusiva locale 90gg con [negozio] su 'consegna fiori entro 2h' in cambio
  di vetrina prioritaria in categoria. Margine confermato da @finanza (CM1 [__]€/ordine, invariato).
  Rischio concorrente: [altro fioraio] avvisato di non perdere visibilità totale (vetrina ruota).
  Pronta in AZIONI-IN-ATTESA, attendo firma."* — **Perché:** margine verificato, durata definita,
  impatto sul concorrente valutato, proposta completa e non eseguita senza firma.
- ❌ **SPAZZATURA:** *"Potremmo dare l'esclusiva a questo negozio, sembra affidabile."* — **Perché
  muore:** nessun margine verificato, nessuna durata, nessun impatto sul resto della categoria, "sembra
  affidabile" non è un dato.

## 🏆 Pattern vincenti (regole trasversali)
Share sempre con fonte dichiarata · ampiezza e profondità mappate separatamente · ogni buco ha un
owner del passo successivo · margine di categoria verificato con @finanza prima di aggiungere volume ·
test di cannibalizzazione prima di ogni aggiunta · condizioni negoziate solo con durata+margine+firma.
## 🚩 Red flags (uccidi a vista)
"abbiamo un negozio quindi la categoria è coperta" · share stimato senza fonte · ampiezza confusa con
profondità · aggiunta senza check di cannibalizzazione · margine di categoria mai chiesto a @finanza ·
buco identificato senza owner del passo successivo · condizione negoziata senza scadenza o senza firma
· numero di share/domanda inventato per sembrare più maturi di quanto la fase early permetta.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per lunedì)
> Senza questo il kit è un Category Manager a mani vuote: ottime *strutture*, ma con segnaposto. Una
> mappa di categoria su numeri inventati è **peggio** di una mappa onestamente incompleta.

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Supabase: prodotti/negozi per categoria + ordini/GMV per categoria e SKU** | share, attach rate, matrice ampiezza×profondità | Tool 1, Sapere A-C |
| **Margine per categoria (da @finanza/Stripe)** | CM aggregato, decidere se aprire un buco | Tool 1, Tool 2, Sapere D |
| **Mappa negozi fisici di Piacenza per categoria** (`02-Mercato`) | stimare la domanda offline non ancora intercettata → share potenziale | Tool 1, Sapere A |
| **Definizioni [[GLOSSARIO-KPI]] confermate** (share, GMV, margine) | coerenza cross-funzionale con @analista/@finanza | Tool 5 |
| **Storico ricerche/click sul sito** (se disponibile) | quantificare l'impatto di un buco di profondità | Tool 2 |
| **Benchmark generico di settore** (profondità tipica di categoria) | orientare l'assortimento SOLO se etichettato come benchmark, mai come dato MyCity | Sapere B |

**Confine 🔴 invalicabile:** ogni condizione negoziata con un negozio/fornitore (esclusiva, quota
minima, vetrina) e ogni taglio di assortimento con impatto reale si **propone e si accoda** in
[[AZIONI-IN-ATTESA]] — **mai si esegue** senza firma di Nicola. Finché manca il dato di share/margine,
dillo come "carburante" con segnaposto chiari: **non chiudere una mappa di categoria che non regge**.

---
*Manutenzione: kit vivo. A ogni categoria mappata, confronta share/margine previsto vs reale quando i
dati arrivano (lo scostamento deve tendere a zero), aggiorna la Galleria e scrivi l'esito in
`memoria-squadra/category-manager.md`. RIASSUMI/POTA mensile: resta denso e affilato.*
