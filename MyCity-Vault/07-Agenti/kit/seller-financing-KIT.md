---
tipo: kit-mestiere
ruolo: seller-financing
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso: storico performance negozi + partner bancario/fintech per erogare
collegato: [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 05-Soldi-Rischi/ · kit/finanza-KIT
---

# 🧰 KIT MESTIERE — seller-financing (il "cervello allenato" del risk manager di embedded lending)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un risk manager di embedded financing (Amazon Lending / Klarna / Square Capital) **sa e usa** (strati 3-6): il sapere sul rischio di credito, gli strumenti passo-passo per scorare e strutturare un anticipo, la galleria gold/spazzatura, e il carburante che serve. Bersaglio: **L7-con-giudizio** ([[RUBRICA-LIVELLI]]).

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. I tre prodotti di credito dentro un marketplace (non confonderli)
- **Merchant Cash Advance / anticipo sul venduto** — MyCity anticipa capitale a un negozio contro una quota futura dei suoi incassi sulla piattaforma. Non è un prestito a rata fissa: è un "acquisto" di una fetta di vendite future a sconto (fee), rimborsato via trattenuta automatica. È il prodotto-cardine di Amazon Lending: prezzato sui dati di piattaforma, non sul merito di credito tradizionale.
- **Micro-prestito per capitale circolante** — importo più piccolo, scopo dichiarato (scorte, attrezzatura, packaging), rimborso a rata fissa o RBF. Più vicino a un prestito classico, ma comunque **sotto-soglia** di credito al consumo/impresa — richiede comunque un soggetto autorizzato a erogare.
- **BNPL (Buy Now Pay Later) / rateizzazione lato cliente** — il *cliente* paga in 3-4 rate; il *negozio* incassa subito (meno una fee). Il rischio di credito si sposta dal negozio al consumatore ed è quasi sempre gestito da un **provider terzo specializzato** (Klarna/Scalapay/PayPal), non dal marketplace: il consumer credit è tra le attività più regolate in assoluto.
> Regola di sopravvivenza: quando qualcuno dice "facciamo credito", chiedi *sempre* "a chi (negozio o cliente), con quale struttura di rimborso, e chi tiene il rischio?". Sono tre prodotti diversi con rischi, margini e vincoli regolatori diversi.

## B. Underwriting alternativo: il vantaggio del marketplace
- Una banca guarda bilancio e centrale rischi, con dati vecchi di mesi. Un marketplace vede in tempo reale: **GMV mensile e sua costanza, tenure (da quanto è live), tasso di reso/dispute, puntualità del ritiro/consegna, recensioni, stagionalità della categoria**. Questo è il dato che rende l'underwriting di un marketplace potenzialmente **più accurato e più veloce** di quello bancario tradizionale — è il moat.
- **Segnali positivi (abbassano il rischio):** GMV crescente o stabile da ≥3-6 mesi, tasso di reso basso, zero dispute aperte, payout mai in ritardo lato negozio, categoria a domanda stabile (non ultra-stagionale senza cuscinetto).
- **Segnali negativi (alzano il rischio o bloccano l'erogazione):** meno di 2-3 mesi di storico, GMV irregolare/in calo, dispute o reclami recenti, categoria fortemente stagionale senza riserva, nessun ordine nelle ultime settimane (negozio dormiente).
- **In fase early (pochi negozi reali, storico corto):** quasi nessun venditore ha ancora un campione sufficiente per uno score statistico robusto. Onestà del mestiere: il primo prodotto reale è un **pilota N=1 qualitativo** (storico + giudizio), non un modello predittivo — dichiaralo, non fingere una precisione che i dati non permettono ancora.

## C. Pricing del rischio: PD × LGD × EAD (Expected Loss)
- **PD (Probability of Default)** = probabilità che il negozio/cliente non rimborsi. Stimata da tenure, costanza GMV, categoria, storico dispute — in assenza di un modello statistico maturo, usa una **classificazione qualitativa esplicita** (basso/medio/alto rischio) con i criteri che la motivano.
- **LGD (Loss Given Default)** = quota del capitale che si perde se il default avviene (raramente 100%: si può recuperare parzialmente trattenendo payout futuri o per via legale, a costo e tempo).
- **EAD (Exposure At Default)** = capitale ancora esposto al momento del default (con RBF cala nel tempo man mano che il negozio rimborsa; con rata fissa resta piatto fino alla scadenza).
- **Expected Loss (EL) = PD × LGD × EAD.** Il fee/tasso applicato deve coprire l'EL attesa su tutto il portafoglio **più** un margine — altrimenti il prodotto perde soldi per costruzione, non per sfortuna.
- **Regola pratica:** se non riesci a stimare nemmeno qualitativamente PD/LGD per un caso, quel caso **non è ancora finanziabile** — manca il dato, non la volontà.

## D. Revenue-Based Financing (RBF): perché il rimborso deve seguire le vendite
- Meccanica: MyCity trattiene una **% fissa X%** di ogni incasso del negozio finché non ha restituito capitale + fee pattuita. Non c'è una scadenza fissa: negozio che vende tanto rimborsa in fretta, negozio che vende poco rimborsa piano — **mai una rata che il negozio non può permettersi in un mese debole.**
- Vantaggio sul rischio: la rata fissa tradizionale è il modo più comune in cui un piccolo prestito affonda un'attività in difficoltà temporanea (un mese di vendite basse + una rata fissa = default a cascata). L'RBF assorbe la variabilità del business invece di ignorarla.
- Vantaggio sul controllo: la trattenuta avviene **direttamente sul flusso di pagamento della piattaforma** — MyCity non deve "rincorrere" il pagamento come farebbe una banca esterna. È un altro motivo per cui il marketplace è nella posizione ideale per offrire questo prodotto (se autorizzato a farlo).
- Il **tempo stimato di rimborso** dipende dal ritmo di vendita reale: comunicalo sempre come range ("~30-60 giorni al ritmo attuale"), mai come data fissa — il ritmo di vendita può cambiare.

## E. BNPL lato cliente: build vs partner, e perché quasi sempre "partner"
- **Costruire in-house** = MyCity tiene il rischio di credito al consumo (regolatissimo: Codice del Consumo, TUB se sopra soglia, necessità di licenza per l'intermediazione finanziaria) e il margine potenziale più alto. Per un marketplace early-stage, il costo di compliance e il rischio legale superano quasi sempre il beneficio.
- **Partner (Klarna/Scalapay/PayPal/Stripe Installments)** = il provider tiene il rischio di credito ed è già autorizzato; MyCity guadagna sulla **conversione al checkout più alta** (dato di settore: il BNPL aumenta tipicamente il tasso di conversione e lo scontrino medio — benchmark generico di settore, non dato MyCity) e paga una fee di integrazione/transazione al provider.
- **La domanda guida:** "il beneficio di conversione supera la fee al provider, e siamo pronti a costruire e mantenere un motore di rischio al consumo in casa?" — quasi sempre la risposta corretta in fase early è **integrare un partner**, non costruire.
- **Owner della scelta tecnica del provider e dell'integrazione in checkout**: coordina con @marketplace-payments (meccanica di pagamento) e @consulente-bancario/@credito-impresa (struttura, se si valuta un partner bancario diretto).

## F. Il confine regolatorio (non negoziabile, mai da dimenticare)
- **TUB (Testo Unico Bancario)**: l'esercizio del credito verso il pubblico è un'attività riservata a banche e intermediari finanziari autorizzati (art. 106 TUB) o vigilati da Banca d'Italia. Un marketplace **non può erogare credito in proprio** senza questa autorizzazione o senza appoggiarsi a un soggetto che ce l'ha.
- **Tasso soglia anti-usura**: aggiornato trimestralmente da Banca d'Italia per categoria di finanziamento. Ogni tasso/fee proposto va confrontato con la soglia in vigore nel trimestre — mai proporre un fee "che sembra ragionevole" senza verificarlo.
- **Codice del Consumo / TAEG**: il credito al consumo (quindi il BNPL) richiede trasparenza sul costo totale del credito (TAEG) verso il consumatore.
- **In pratica per te:** disegni il prodotto, il modello di rischio, il pricing e il caso d'uso. L'**erogazione reale** passa sempre da un partner bancario/fintech autorizzato (dominio di @consulente-bancario/@credito-impresa) e da un parere di @legale-privacy sul contratto. Tu non firmi né eroghi mai da solo — è 🔴 per costruzione, non per prudenza eccessiva.

---
# 🛠️ STRATO 4 — TOOLKIT (procedure passo-passo, pronte all'uso)

## TOOL 1 — SCORECARD di eleggibilità (per ogni negozio candidato a un anticipo)
```
NEGOZIO: [nome]                          PERIODO ANALIZZATO: [___]
(1) Tenure su MyCity (mesi live)                    [__]   → <2 mesi: NON eleggibile ancora
(2) GMV medio mensile (ultimi 3 mesi)          € [_____]   → fonte: Supabase orders, periodo dichiarato
(3) Trend GMV (crescente/stabile/calante)           [___]
(4) Tasso di reso/dispute (ultimi 3 mesi)            [_]%   → >soglia alta: rischio elevato
(5) Puntualità payout (ritardi ultimi 3 mesi)       [__]   → 0 = pulito
(6) Stagionalità categoria (piatta/picchi noti)     [___]
─────────────────────────────────────────
CLASSE DI RISCHIO (qualitativa): [BASSO / MEDIO / ALTO / NON VALUTABILE — storico insufficiente]
MOTIVAZIONE: [2-3 righe che citano i punti sopra, non "sembra affidabile"]
```
**Output atteso:** una classe di rischio motivata sui dati, non un'impressione. "NON VALUTABILE" è un esito legittimo e va comunicato come tale (non forzato a una classe).

## TOOL 2 — STRUTTURA dell'anticipo (Merchant Cash Advance / RBF)
1. **Importo richiesto/proposto** — ancoralo a un multiplo prudente del GMV mensile (mai un importo arbitrario): es. 0,5-1× il GMV medio mensile per un primo anticipo, MAI un multiplo che il negozio non potrebbe rimborsare nemmeno in un mese buono.
2. **Fee (il costo del capitale)** — calibrata sulla classe di rischio (Tool 1) + verificata contro il tasso soglia anti-usura del trimestre in corso (Sapere F). Mai un fee uguale per tutte le classi di rischio.
3. **% di trattenuta per RBF** — scegli una % che non soffochi il cash flow operativo del negozio (regola pratica di settore: mai oltre 15-20% di ogni incasso, benchmark generico, verifica caso per caso).
4. **Tempo stimato di rimborso** — capitale+fee / (GMV medio mensile × % trattenuta) → esprimilo come RANGE, mai data fissa.
5. **Uso dichiarato del capitale** — scorte/attrezzatura/marketing: verifica che generi GMV incrementale plausibile (Sapere C), non sostituzione di capitale che il negozio avrebbe usato comunque.
6. **Confine regolatorio** — chi eroga (partner), quale contratto, chi risponde del TAEG/soglia usura.

## TOOL 3 — CALCOLO Expected Loss (per singolo anticipo e per portafoglio)
```
Capitale proposto (EAD iniziale)          € [_____]
PD stimata (classe di rischio, Tool 1)        [__]%   ← qualitativo → range indicativo, non falsa precisione
LGD stimata (% persa se default)              [__]%   ← default: recupero parziale via trattenuta payout futuri
EL = PD × LGD × EAD                       € [_____]
Fee applicata (Tool 2)                    € [_____]   ← deve coprire EL + margine, altrimenti STOP
Margine netto stimato = Fee − EL          € [_____]   ← se negativo, il pricing non regge: rivedi fee o rifiuta
```
**A livello di portafoglio** (quando ci sono più anticipi attivi): somma EL su tutti gli anticipi e confrontala con la cassa disponibile per assorbire perdite — mai concentrare EAD > [X]% su un solo negozio/categoria.

## TOOL 4 — CHECKLIST pre-proposta (passa ogni voce prima di portarla a Nicola)
- [ ] Storico minimo di performance reale presente (Tool 1) — altrimenti "NON VALUTABILE", non stimare.
- [ ] Struttura RBF (o motivazione esplicita se si sceglie rata fissa).
- [ ] EL calcolata e fee che la copre (Tool 3).
- [ ] Uso del capitale collegato a GMV incrementale plausibile, non sostituzione.
- [ ] Tasso/fee verificato contro il tasso soglia anti-usura del trimestre.
- [ ] Confine regolatorio esplicito: chi eroga, quale partner/licenza, chi fa il contratto.
- [ ] Diversificazione: questo anticipo non porta l'esposizione su un negozio/categoria oltre soglia prudente.
- [ ] Colore corretto: 🔴 (mai erogazione autonoma) + accodato in AZIONI-IN-ATTESA.

## TOOL 5 — Il REPORT di proposta (numero + rischio + azione, come da finanza-KIT)
```
💰 PROPOSTA: [negozio/cliente] · importo € [___] · struttura [RBF __%/rata fissa] · fee [__]%
📊 RISCHIO: classe [bassa/media/alta] · PD~[__]% · LGD~[__]% · EL € [___] · margine netto € [___]
🎯 EFFETTO ATTESO: GMV incrementale stimato € [___] (o "non stimabile, dichiaralo") · retention attesa
⚖️ CONFINE REGOLATORIO: erogazione via [partner/licenza] · tasso verificato vs soglia usura [trimestre]
🙋 SERVE DA NICOLA: firma 🔴 + eventuale partner bancario da attivare (@consulente-bancario)
```
**Ghigliottina prima di consegnare:** «Se questo negozio sparisse domani, sapevamo già quanto avremmo perso?»

---
# 🖼️ STRATO 5 — GALLERIA (bersaglio 10/10, col PERCHÉ)
> Modella, non copiare. Cifre tra `[…]` = segnaposto/esempio didattico, mai dato MyCity reale non verificato.

## MERCHANT CASH ADVANCE
- ✅ **GOLD:** *"Negozio confermato, [7] mesi live, GMV medio € [1.200]/mese stabile, 0 dispute, payout puntuali → propongo anticipo € [600] (0,5× GMV) per scorte pre-festività. RBF: trattengo [10]% di ogni incasso finché non torna € [660] (fee 10%), stimato [55-70] giorni al ritmo attuale. PD bassa (storico pulito), LGD ~40% (recupero via trattenuta futura), EL € [___] coperta dalla fee. Non erogabile da MyCity: proposta a @consulente-bancario per struttura, resto in attesa firma."* — **Perché:** dati reali, RBF non rata fissa, EL calcolata e coperta, confine regolatorio dichiarato, propone non eroga.
- ❌ **SPAZZATURA:** *"Il negozio sembra andare bene, prestiamogli 1000€ al 10% fisso in 3 rate mensili."* — **Perché muore:** "sembra" non è uno storico, rata fissa ignora il ciclo di vendita, nessun calcolo di EL, nessuna verifica del tasso soglia, nessun accenno a chi eroga legalmente.

## BNPL LATO CLIENTE
- ✅ **GOLD:** *"Proposta: integrare un provider BNPL partner (categoria Klarna/Scalapay-tipo) sul checkout per carrelli > € [50] — il provider tiene il rischio di credito ed è già autorizzato; MyCity paga una fee di transazione stimata sul benchmark di settore (non dato nostro) e si aspetta un uplift di conversione da misurare in A/B. Non costruiamo un motore di credito al consumo in casa: rischio regolatorio troppo alto per la fase attuale. @marketplace-payments per l'integrazione tecnica."* — **Perché:** distingue build vs partner, onesto sul benchmark vs dato reale, evita il rischio regolatorio sproporzionato per la fase dell'azienda.
- ❌ **SPAZZATURA:** *"Facciamo pagare a rate i clienti direttamente noi, tanto è solo dividere il prezzo per 3."* — **Perché muore:** ignora che il credito al consumo è regolato (Codice del Consumo/TUB), nessuna valutazione del rischio di mancato pagamento, nessun partner, MyCity si espone da sola a un rischio legale e di cassa che non ha gli strumenti per gestire.

## PORTAFOGLIO
- ✅ **GOLD:** *"3 anticipi attivi, EAD totale € [___], EL portafoglio € [___] (< 5% della cassa disponibile) → diversificato su 3 categorie diverse, nessun negozio oltre il 40% dell'esposizione totale. Monitoraggio: nessun ritardo di trattenuta a oggi."* — **Perché:** pensa a livello di portafoglio, non solo di singolo anticipo, con diversificazione esplicita.
- ❌ **SPAZZATURA:** *"Abbiamo prestato in totale 2.000€ a 2 negozi, va tutto bene."* — **Perché muore:** concentrazione su 2 negozi non segnalata, nessun EL di portafoglio, "va tutto bene" senza monitoraggio dichiarato.

## 🏆 Pattern vincenti (regole trasversali)
Underwriting da dati di piattaforma, non da bureau · RBF invece di rata fissa quando possibile · EL sempre calcolata prima del pricing · confine regolatorio sempre esplicito (chi eroga, con quale licenza) · GMV incrementale verificato, non presunto · diversificazione di portafoglio · BNPL cliente = partner, non build, in fase early.

## 🚩 Red flags (uccidi a vista)
Tasso "flat per tutti" senza classe di rischio · rata fissa senza motivazione · "sembra affidabile" al posto di uno storico · EL non calcolata · fee sotto l'Expected Loss (il prodotto perde soldi per costruzione) · nessuna verifica del tasso soglia anti-usura · "eroghiamo noi" senza partner autorizzato · BNPL spacciato per "gratis" senza dire chi tiene il rischio · concentrazione di portafoglio non vista.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per quando arriva)
> Senza questo il kit è un risk manager a mani vuote: ottime *strutture*, ma con segnaposto. Un underwriting su dati inventati è **peggio** di nessun underwriting. Ecco esattamente cosa serve:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Storico performance negozio** (GMV mensile, tenure, resi/dispute, puntualità payout — Supabase/Stripe read) | la base dell'underwriting alternativo, il vantaggio del marketplace | Sapere B, Tool 1, Tool 3 |
| **Partner bancario/fintech con licenza di erogazione** (TUB/Banca d'Italia) | l'unico modo legale di erogare un anticipo/prestito reale | Sapere F, Tool 2, ogni proposta 🔴 |
| **Tasso soglia anti-usura aggiornato** (trimestrale, Banca d'Italia) | verificare che ogni fee/tasso proposto sia legale | Tool 2, Tool 4 |
| **Parere legale su intermediazione finanziaria e Codice del Consumo** | struttura del contratto, TAEG, responsabilità | Sapere E, F |
| **Provider BNPL valutato** (per il lato cliente) | decidere build vs partner con termini reali, non ipotetici | Sapere E |
| **1 caso pilota reale** (negozio confermato, volontario, con storico minimo) | testare il modello RBF prima di scalare, senza rischiare il portafoglio | Tool 1-3, Galleria |
| **Definizioni [[GLOSSARIO-KPI]] confermate** (GMV, retention) | coerenza cross-funzionale con @finanza/@analista sugli stessi numeri | Tool 5 |

**Confine 🔴 invalicabile:** ogni erogazione reale di capitale, ogni attivazione di un provider BNPL, ogni cambio di tasso/fee si **propone e si accoda** in [[AZIONI-IN-ATTESA]] — **mai si esegue** senza partner autorizzato + firma di Nicola. Read ≠ erogazione. Finché manca lo storico minimo o il partner, dillo come "carburante": **meglio nessun prodotto di credito che uno prezzato al buio.**

---
*Manutenzione: kit vivo. Al primo pilota reale, confronta rimborso previsto vs reale (lo scostamento deve tendere a zero), aggiorna la Galleria con la prima riconciliazione gold/spazzatura vera e scrivi l'esito in `memoria-squadra/seller-financing.md`. RIASSUMI/POTA quando il portafoglio cresce: resta denso e affilato.*
