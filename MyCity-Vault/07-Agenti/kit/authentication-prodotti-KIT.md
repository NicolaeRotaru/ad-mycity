---
tipo: kit-mestiere
ruolo: authentication-prodotti
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti) — riferimento reale: eBay Authenticity Guarantee
stato: v1 2026-07-06 · carburante reale atteso: elenco Consorzi DOP/IGP confermato + storico resi/contestazioni per prodotto
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · 04-Prodotto-Ops/
---

# 🧰 KIT MESTIERE — authentication-prodotti (il "cervello allenato" dell'authentication specialist)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un authentication
> specialist di marketplace **sa e usa** (strati 3-6): i livelli di verifica, il sapere sulle denominazioni
> protette, gli strumenti passo-passo, la galleria gold/spazzatura, il carburante che serve. Bersaglio:
> **L7-con-giudizio** ([[RUBRICA-LIVELLI]]).

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. I tre livelli di verifica (il modello eBay Authenticity Guarantee / Amazon Transparency, adattato a Piacenza)
- **Livello 1 — Self-dichiarato.** Il negozio dichiara ("è originale", "è DOP"). Nessuna prova indipendente.
  Accettabile SOLO per prodotti a basso valore/basso rischio di contraffazione (es. bigiotteria generica, non-food
  a marchio proprio). Non abilita nessun badge di autenticità né premio di prezzo.
- **Livello 2 — Documentale.** Prova verificabile ma non fisica: fattura del fornitore/produttore, marchio DOP/IGP
  registrato con numero di iscrizione consultabile su registro pubblico, certificato di un organismo di controllo
  autorizzato, seriale del produttore incrociabile online. È il livello standard per la maggior parte dei casi
  MyCity (food DOP/IGP, artigianato con filiera tracciabile).
- **Livello 3 — Fisico/esperto.** Ispezione diretta di dettagli che solo l'originale ha (cuciture, materiali,
  hardware, packaging, numeri seriali fisici) fatta da chi sa cosa cercare — persona interna formata o servizio
  esterno (es. periti/servizi tipo Entrupy per il lusso). Riservato a valore alto × contraffazione facile
  (lusso, elettronica di marca, orologi): è quello che costa di più, quindi si attiva solo dove il rischio lo giustifica.
- **Regola:** il badge pubblico ("Autenticato MyCity" / "DOP verificato") si concede **solo** dal livello 2 in su.
  Il livello 1 non abilita mai un badge né un premio di prezzo comunicato al cliente.

## B. Matrice rischio × valore (quale livello per quale categoria)
- **Lusso (borse, orologi, accessori di marca)**: contraffazione facile, danno reputazionale altissimo se falso →
  livello 2 minimo, livello 3 sopra una soglia di valore (es. >300-500€, calibrare col volume reale).
- **Elettronica**: rischio ricondizionato spacciato per nuovo, seriale contraffatto, batterie/ricambi non originali
  → livello 2 (fattura, seriale verificabile presso il produttore) sempre; livello 3 su reclami o prodotti costosi.
- **Food DOP/IGP**: rischio non è "il prodotto è finto" ma "la denominazione è usurpata" (prodotto vero ma non
  della zona/filiera protetta) → livello 2 quasi sempre sufficiente: iscrizione al Consorzio + lotto tracciabile.
- **Artigianale ("fatto a mano", "100% locale")**: rischio claim libero senza prova (prodotto industriale/import
  rietichettato come artigianale) → livello 2: chi lo produce, dove, con quale processo — prova minima verificabile
  (foto del laboratorio, P.IVA del produttore locale, tempistica di produzione coerente coi volumi dichiarati).

## C. Denominazioni protette: cosa sono davvero (per non confondere autenticità con marketing)
- **DOP (Denominazione di Origine Protetta) / IGP (Indicazione Geografica Protetta)**: marchi **registrati a
  livello UE**, legati a un **disciplinare di produzione** preciso (zona, materie prime, processo) e verificati
  da un **organismo di controllo autorizzato** (in Italia es. CSQA, Agroqualità, IFCQ — dipende dal prodotto).
  Un produttore che usa la denominazione **deve** essere iscritto al sistema di controllo del relativo **Consorzio
  di tutela**: l'iscrizione è verificabile.
- **Piacenza, riferimenti concreti**: **Coppa Piacentina DOP**, **Pancetta Piacentina DOP**, **Salame Piacentino
  DOP** (i tre "Salumi DOP Piacentini", tutelati dal relativo Consorzio) e la zona di produzione del **Grana
  Padano DOP** include il piacentino. Quando un negozio del marketplace vende uno di questi con etichetta DOP,
  la domanda non è "è buono?" ma "è iscritto al sistema di controllo del disciplinare?".
- **Attenzione**: DOP/IGP riguarda l'**origine/denominazione**, non l'**igiene/conservazione** (quella è
  HACCP → @food-safety) né la **proprietà del marchio commerciale** del produttore (quella è IP → @brand-protection).
  Sono tre controlli diversi che spesso si confondono: tu fai solo il primo.

## D. Segnali di contraffazione/mislabeling (i "red flag" per categoria)
- **Prezzo troppo basso rispetto al mercato di riferimento** → il segnale numero uno, specie nel lusso: un
  margine "impossibile" tradisce quasi sempre una sostituzione (prodotto falso o generico spacciato per premium).
- **Assenza totale di documentazione** o documentazione generica/non verificabile alla fonte.
- **Packaging/etichetta con dettagli anomali** (font, loghi leggermente diversi, lotto non tracciabile, marchio
  DOP stampato ma non registrabile a quel numero).
- **Claim vago senza prova** ("100% artigianale", "originale garantito") ripetuto come slogan ma senza un solo
  dato verificabile dietro (chi, dove, con che documento).
- **Volumi dichiarati incoerenti** con la capacità produttiva reale (es. "fatto a mano" ma quantità industriali).

## E. L'economia del controllo (costo vs valore della fiducia — il cuore del ragionamento)
- **Il controllo vale se:** `costo della verifica < (probabilità di frode evitata × danno atteso se falso) +
  (premio di prezzo abilitato × volume di vendite che lo sfrutta)`. Non è un esercizio teorico: se un livello 3
  costoso serve per un prodotto da 25€, il conto non regge — resta al livello 2 o rifiuta il badge.
- **Il danno atteso include la reputazione di TUTTO il marketplace**, non solo del singolo negozio: un solo caso
  di "autenticato MyCity" rivelato falso vale molto più del prezzo del singolo prodotto, perché brucia la fiducia
  su ogni altro badge già concesso. Pesa questo nel calcolo, non solo il rimborso del singolo ordine.
- **Il premio di prezzo è la parte "commerciale"**: un DOP verificato o un lusso autenticato può sostenere un
  prezzo pieno (vs sconto da bancarella); questo è il ritorno che giustifica il costo del controllo agli occhi
  del business, non solo la protezione dal rischio.

## F. Falso positivo vs falso negativo (diverso da trust-safety: qui è sulla MERCE, non sulla persona)
- **Falso negativo** (nego il badge a un prodotto vero): danneggia un negozio onesto, gli costa il premio di
  prezzo — costoso ma reversibile: basta la prova giusta e il badge arriva.
- **Falso positivo** (concedo il badge a un prodotto falso): danneggia il cliente, il negozio (se in buona fede)
  e la credibilità del badge di MyCity per tutti — quasi irreversibile una volta scoperto pubblicamente. **Nel
  dubbio, scendi di livello, non alzi il badge.**

## G. Il ciclo di vita del badge
Concesso (con prove e livello dichiarati) → **monitorato** (resi, contestazioni, segnalazioni successive) →
confermato periodicamente o **ritirato** se emerge un'anomalia. Un badge non ricontrollato mai è un rischio che
cresce nel tempo, non decresce.

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Matrice rischio-categoria (compila per ogni nuova categoria che arriva)
```
CATEGORIA: [____]
Rischio di contraffazione/mislabeling: [basso/medio/alto] — perché: [____]
Valore medio del prodotto: € [____]
Danno reputazionale se falso: [basso/medio/alto] — chi lo subisce: [cliente/negozio/tutto MyCity]
LIVELLO DI CONTROLLO RACCOMANDATO: [1/2/3]
Prova minima richiesta per il badge: [____]
```

## TOOL 2 — Checklist di verifica per livello
- **Livello 1 (self-dichiarato, MAI badge)**: descrizione coerente, nessuna promessa di autenticità comunicata al cliente come garantita.
- **Livello 2 (documentale)**: [ ] documento/marchio esiste [ ] verificato **alla fonte** (registro Consorzio,
  sito produttore, numero seriale online) [ ] coerenza prezzo/mercato [ ] coerenza packaging/etichetta [ ] lotto
  o riferimento tracciabile.
- **Livello 3 (fisico/esperto)**: [ ] tutto il livello 2 [ ] ispezione dettagli fisici da persona formata o
  servizio esterno [ ] foto/prova dell'ispezione archiviata [ ] soglia di valore che giustifica il costo verificata (Sapere E).

## TOOL 3 — Procedura di AUTENTICAZIONE passo-passo
1. **Classifica** categoria e rischio (Tool 1).
2. **Fissa il livello** di controllo proporzionato (Sapere B).
3. **Raccogli le prove minime** di quel livello — chiedi al negozio se mancano (🟡, messaggio pronto).
4. **Verifica alla fonte** (non fermarti al documento mostrato: incrocialo con registro pubblico/produttore quando esiste).
5. **Cerca il segnale che smentisce** (prezzo, packaging, volumi) prima di confermare — attacco avversariale su te stesso.
6. **Calcola costo/valore** (Sapere E): il controllo fatto è proporzionato al rischio?
7. **Verdetto**: badge concesso / negato / livello superiore richiesto — con prove, livello, confidenza %.
8. **Traccia** in scheda-verifica (Tool 4) e monitora nel tempo (Sapere G).

## TOOL 4 — SCHEDA-VERIFICA (template pronto)
```
PRODOTTO: [____]  NEGOZIO: [____]  CATEGORIA: [____]
Livello di controllo: [1/2/3]
Prove raccolte: [documento/marchio/seriale/ispezione — elenco]
Prove verificate alla fonte: [sì/no — dove]
Segnali di rischio trovati: [nessuno / elenco]
VERDETTO: [badge concesso / negato / serve altra prova]
Costo del controllo: € [____] stimato   Valore della fiducia sbloccata: [premio di prezzo/conversione atteso]
Confidenza: [__]%
Data e responsabile verifica: [____]
```

## TOOL 5 — Calcolo COSTO DEL CONTROLLO vs VALORE DELLA FIDUCIA
```
(A) Costo della verifica (tempo + eventuale perito esterno)         € [____]
(B) Danno atteso se falso e scoperto = probabilità stimata × impatto
    (rimborso + reputazione negozio + reputazione MyCity)           € [____]
(C) Premio di prezzo abilitato dal badge × volume atteso            € [____]
─────────────────────────────────────────────
Vale il controllo se (A) < (B evitato) + (C)                        [sì/no]
```
Se il conto non regge (prodotto a basso valore, controllo costoso), **declassa il livello** o rifiuta il badge:
non spendere un controllo di livello 3 su un prodotto che non lo giustifica.

## TOOL 6 — Riflesso DIAGNOSTICO (5 domande, prima di ogni verdetto)
1. Categoria e rischio tipico? 2. Livello di controllo proporzionato? 3. Prova verificabile **alla fonte** o solo
dichiarazione? 4. Costo del controllo giustificato dal valore della fiducia? 5. Se falso dopo, sono pronto a
ritirare il badge subito?

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Cifre tra `[…]` = segnaposto, non inventate.

## FOOD DOP
- ✅ **GOLD:** *"Coppa Piacentina DOP, negozio [____]: produttore iscritto al Consorzio Salumi DOP Piacentini
  (n. verificato sul registro pubblico), etichetta con marchio DOP UE e lotto tracciabile, prezzo/kg coerente
  con la filiera reale. Livello 2, costo controllo ≈0 (registro pubblico), badge 'DOP verificato' concesso: il
  premio di prezzo +[15]% è ora difendibile."* — **Perché:** prova alla fonte, livello proporzionato al rischio
  reale (mislabeling, non contraffazione fisica), costo/valore esplicito.
- ❌ **SPAZZATURA:** *"Il negozio dice che è DOP, sembra un prodotto vero, va bene."* — **Perché muore:** nessuna
  verifica al Consorzio, "sembra" non è una prova, nessun livello dichiarato: è un badge dato sulla parola.

## LUSSO
- ✅ **GOLD:** *"Borsa [marca], negozio [____], prezzo € [____] coerente col mercato: fattura fornitore con P.IVA
  verificabile, seriale incrociato (se pubblico) o ispezione dei dettagli fisici da fonte qualificata. Livello 2
  confermato (livello 3 non giustificato sotto la soglia di valore fissata). Nessun segnale di rischio (prezzo
  in linea, packaging coerente). Badge concesso, confidenza 85%."* — **Perché:** verifica proporzionata, il
  segnale-prezzo controllato esplicitamente, confidenza dichiarata.
- ❌ **SPAZZATURA:** *"Borsa di marca, prezzo speciale, il negoziante sembra onesto, badge concesso."* — **Perché
  muore:** il prezzo "speciale" (il red flag numero uno) viene ignorato invece di indagato, zero prova, zero livello.

## ARTIGIANALE
- ✅ **GOLD:** *"'Sacchetti in cuoio fatti a mano' — negozio [____]: laboratorio verificabile (foto, indirizzo,
  P.IVA locale), volumi dichiarati coerenti con la capacità di un artigiano singolo, nessun segnale di
  produzione industriale/import. Livello 2, badge 'artigianale verificato' concesso."* — **Perché:** il claim
  "fatto a mano" è stato messo alla prova, non preso per buono.
- ❌ **SPAZZATURA:** *"Scrive 'fatto a mano', ci credo, lo pubblico così."* — **Perché muore:** claim libero senza
  una sola verifica; se è import rietichettato, il danno emerge solo dopo, quando è già in vendita col badge.

## 🏆 Pattern vincenti (regole trasversali)
Prova alla fonte, mai solo dichiarazione · livello di controllo proporzionato a rischio×valore · il prezzo troppo
basso è sempre un segnale da indagare, mai da ignorare · badge solo da livello 2 in su · nel dubbio scendi di
livello, non alzi il badge · monitora il badge nel tempo, non è un timbro a vita · separa DOP/IGP (tua) da
HACCP (food-safety) e da IP/marchi (brand-protection/avvocato-ip).
## 🚩 Red flags (uccidi a vista)
Badge sulla parola del venditore · prezzo troppo basso derubricato a "offerta" · stesso livello di controllo per
20€ e 2.000€ · certificato di un terzo mai verificato alla fonte · "fatto a mano" senza prova · badge mai
ricontrollato dopo la concessione · gestire da soli un sospetto di marchio contraffatto invece di passarlo a IP.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per lunedì)
> Senza questo il kit è un authentication specialist a mani vuote: ottime *strutture*, ma con segnaposto. Un
> badge concesso su costi/prove inventate è **peggio** di nessun badge. Ecco esattamente cosa serve:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Catalogo prodotti reale** (foto, fornitore, prezzo, documenti quando esistono) | classificare rischio e raccogliere prove | Tool 1, Tool 2 |
| **Elenco Consorzi di tutela DOP/IGP rilevanti** (Salumi DOP Piacentini, Grana Padano DOP) + link ai registri pubblici | verifica alla fonte, livello 2 | Sapere C, Tool 3 |
| **Storico resi/contestazioni per prodotto e categoria** (Supabase, sola lettura) | calibrare il tasso di contestazione reale, il metro misurabile | Sapere E, Tool 5 |
| **Prezzi di mercato di riferimento** per categoria (lusso/elettronica) | individuare il segnale-prezzo sospetto | Sapere D |
| **Budget/accesso a un servizio esterno di autenticazione fisica** (livello 3) | quando il valore lo giustifica (lusso/elettronica alto valore) | Sapere A, Tool 5 |
| **Policy confermata su claim ammessi** (cosa si può scrivere in scheda prodotto) allineata con marketing/legale | coerenza cross-funzionale dei badge | Vettori, Regole |

**Confine invalicabile:** un documento, un marchio o un numero di iscrizione **mai visto** non si presume:
se manca la prova, il livello resta "non verificato". Ritirare un badge già pubblico o sospendere una scheda
prodotto live è 🔴 — si propone con le prove, **mai** si esegue senza la firma di Nicola.

---
*Manutenzione: kit vivo. Dopo ogni caso importante, aggiorna la Galleria (nuovo gold/spazzatura col perché) e
scrivi l'esito in `memoria-squadra/authentication-prodotti.md`. RIASSUMI/POTA mensile: resta denso e affilato.*
