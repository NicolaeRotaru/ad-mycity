---
tipo: kit-mestiere
ruolo: localization
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso (decisione mercato/lingua target di Nicola + madrelingua per QA)
collegato: [[STAMPO-SENIOR-PRO]] · [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · memoria-squadra/localization.md
---

# 🧰 KIT MESTIERE — localization (il "cervello allenato" del fuoriclasse di Internationalization)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un pro di
> localizzazione **sa e usa** (strati 3-6): i concetti che nessun junior distingue, gli strumenti
> passo-passo, la galleria gold/spazzatura, il carburante. Bersaglio: **L7-con-giudizio**
> ([[RUBRICA-LIVELLI]]). Regola d'oro: fai **i18n** (l'architettura) mentre costa poco e il mercato è
> ancora uno solo; fai **L10n** (la traduzione vera) solo quando c'è un motivo di business reale.

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. i18n vs L10n vs G11n — le tre parole che nessun junior distingue
- **Internazionalizzazione (i18n)** = preparare il SISTEMA (codice/contenuto) perché possa reggere
  qualunque lingua/mercato **senza riscritture**: stringhe esternalizzate (mai testo concatenato a
  variabili senza placeholder), gestione di plurali/genere, formati parametrizzati (non hardcoded).
- **Localizzazione (L10n)** = l'ATTO di adattare un contenuto a UN mercato specifico: lingua, formato,
  cultura, immagini, e talvolta il prodotto stesso.
- **Globalizzazione (G11n)** = i18n + L10n a scala, per N mercati insieme: template riusabili,
  translation memory, governance terminologica unica.
- **Regola pratica:** fai i18n PRIMA che serva (costa poco mentre il prodotto è mono-mercato); fai L10n
  SOLO quando c'è un mercato reale (è lavoro ripetuto e reale per ogni lingua nuova). Invertire l'ordine
  è l'errore #1: tradurre prima di aver esternalizzato le stringhe produce un retrofit costoso dopo.

## B. Traduzione vs Transcreation (due mestieri diversi, non uno)
- **Traduzione letterale** va bene per contenuto tecnico, informativo, legale (con validazione umana
  finale) — dove la precisione conta più dell'emozione: orari, prezzi, termini e condizioni, istruzioni.
- **Transcreation (ri-creazione)** serve per claim, slogan, causa, tono, storytelling — dove **intento ed
  emozione** contano più della sintassi. "Piacenza non è in vendita" tradotto alla lettera in inglese
  suona minaccioso/legalistico, non identitario: si ri-crea il sentimento ("il centro storico resiste"),
  non le parole.
- **Segnale di fallimento:** il madrelingua capisce le parole ma non "sente" il messaggio, o lo trova
  strano, comico o offensivo — è il campanello del test del madrelingua muto (Tool 3).

## C. Formati locali — i dettagli che rompono la fiducia se sbagliati
- **Data:** IT gg/mm/aaaa · US mm/dd/aaaa · ISO aaaa-mm-gg. "03/04/2026" è ambiguo tra 3 marzo (IT) e 4
  marzo (US, letto 03=marzo): usa sempre il formato del lettore o una forma esplicita ("4 March 2026")
  quando c'è ambiguità cross-mercato.
- **Valuta:** simbolo e posizione (€10 vs 10€ vs $10), separatore decimale (virgola in IT, punto in
  EN-US), e dichiara **sempre** se il prezzo è IVA inclusa/esclusa — in Italia il prezzo esposto è per
  legge/consuetudine sempre IVA inclusa, in molti mercati anglosassoni l'aspettativa è opposta.
- **Indirizzo:** IT = via + civico, CAP, città, provincia; altri paesi hanno ordine ed elementi diversi
  (UK: house number+street, postcode in fondo; US: street, city, state ZIP). Un form che impone lo
  schema italiano a un indirizzo estero rompe la compilazione e il checkout.
- **Telefono:** prefisso internazionale (+39 Italia) e lunghezza variabile per paese — mai troncare o
  forzare un formato di lunghezza fissa.
- **Unità di misura:** kg/g/km (metrico, standard IT/EU) vs libbre/miglia (alcuni mercati anglosassoni) —
  converti solo se il pubblico reale lo richiede, non "per abitudine".
- **Ordine nome/cognome:** alcuni mercati usano cognome-nome, non è universale il nome-cognome italiano.

## D. Adattamento culturale (oltre la lingua)
- **Colori/immagini/simboli** hanno significati diversi tra culture (es. i colori associati a lutto o
  festa cambiano): verifica prima di riusare un asset visivo across-market, non dare per scontato che
  funzioni ovunque.
- **Festività e calendario commerciale locale** non coincidono: un banner tarato su una ricorrenza
  italiana può non tradursi in un altro calendario culturale.
- **Registro/tono:** il "tu"/"lei" italiano non ha un equivalente diretto in molte lingue; l'inglese
  business US è tipicamente più informale del business IT. Adatta il registro, non solo le parole.
- **Riferimenti locali** (vie, quartieri, dialetto piacentino, campanilismo "Piacenza non è in vendita")
  restano intraducibili as-is o vanno sostituiti con un equivalente riconoscibile nel mercato target —
  mai lasciati a un traduttore automatico che li rende letteralmente.

## E. Scalabilità del contenuto (pensa a N mercati, non a 1 traduzione)
- **Translation memory:** ogni frase tradotta e validata si **riusa** — non ritradurre "conferma ordine"
  N volte in punti diversi del sito con N varianti diverse.
- **Template parametrizzati:** una "scheda negozio" con slot `{nome}`/`{categoria}`/`{orario}` si
  localizza **una volta per lingua**, non una volta per ogni negozio.
- **Governance terminologica:** un glossario unico (`checkout`=checkout in EN, non "cassa"/"pagamento" a
  seconda del traduttore del giorno) mantiene coerenza tra tutte le lingue e con @content-social/@seo.
- **Fallback chain:** se manca la stringa in lingua X, il sistema cade su un default (IT o EN) — **mai**
  mostrare all'utente la chiave grezza (es. `checkout.confirm.btn`).

## F. L'aggancio MyCity (onestà sullo stato attuale — non inventare un mercato che non c'è)
Oggi MyCity vende in **una sola lingua (italiano)**, in **una sola città (Piacenza)**: non esiste un
catalogo multi-mercato reale da localizzare. Il lavoro di oggi è quasi tutto **Strato 4 (readiness)**:
preparare formati/template/checklist mentre costa poco, così il giorno in cui arriva una richiesta reale
(una pagina in inglese per pubblico universitario/turistico, un'altra città emiliana discussa da
@city-manager) non si parte da un retrofit costoso. Ogni traduzione VERA deve avere dietro un motivo di
business dichiarato da Nicola o un dato reale verificabile — mai una lingua "per fare i compiti".

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — CHECKLIST i18n-READINESS (l'audit da fare OGGI, a costo zero, anche mono-mercato)
- [ ] Le stringhe UI sono esternalizzate (non concatenate a mano con variabili)?
- [ ] Il formato data/valuta/indirizzo/telefono è parametrizzato (non hardcoded sul default IT)?
- [ ] Esiste un fallback chain se manca una traduzione (mai la chiave grezza a video)?
- [ ] Esiste un glossario terminologico single-source (checkout, reso, payout…)?
- [ ] I template di contenuto (scheda negozio, notifica ordine) sono parametrizzati, non testo libero ripetuto?
> Una casella NO → segnalala (🟢 raccomandazione, non blocca nulla oggi) e proponi il fix quando si tocca
> comunque quel pezzo di codice (`PASSO-A @frontend-dev`/`@backend-dev`), non come progetto a sé stante.

## TOOL 2 — PROCEDURA DI LOCALIZZAZIONE (quando c'è un motivo di business REALE)
1. **Dichiara il motivo:** chi lo ha chiesto, quale mercato/pubblico, quale dato reale a supporto — se
   manca, fermati (Sapere F): prepara solo readiness, non un pacchetto completo.
2. **Inventario del contenuto** da tradurre: solo ciò che il pubblico target userà davvero, non l'intero
   sito "per sicurezza".
3. **Traduci/transcreai** secondo il tipo di contenuto (Sapere B): letterale per tecnico/legale,
   transcreation per claim/causa/tono.
4. **Applica i formati** del mercato target (Sapere C) — mai il default IT copiato.
5. **Adatta culturalmente** (Sapere D): colori/immagini/festività/registro — nulla deve suonare fuori posto o offensivo.
6. **QA MADRELINGUA (non negoziabile):** un madrelingua reale del mercato target rilegge PRIMA della
   pubblicazione. Mai solo la macchina.
7. **Coerenza terminologica:** confronta col glossario esistente; se manca un termine, aggiungilo (Sapere E).
8. **Contenuto legale** (privacy/TOS/consensi) tradotto → `PASSO-A @legale-privacy` per la validità
   giuridica: tu garantisci solo la resa linguistica.
9. **Consegna:** testo tradotto + note di adattamento (cosa hai cambiato e perché) + confidenza % + colore 🟢🟡🔴.

## TOOL 3 — TEST DEL MADRELINGUA MUTO (il filtro finale, prima di consegnare)
- [ ] Capiresti che è stato tradotto (calco, sintassi strana) o sembra scritto originariamente in questa lingua?
- [ ] C'è un modo di dire/una battuta che non funziona qui?
- [ ] Il tono (formale/informale) è quello che ti aspetteresti da un'azienda locale?
- [ ] I formati (data/valuta/indirizzo) sono quelli che usi tu ogni giorno, non quelli italiani copiati?
> Una sola risposta negativa → non è pronto: torna al Tool 2.

## TOOL 4 — SCHEDA FORMATO PER MERCATO (template compilabile, uno per lingua/paese)
```
MERCATO: [paese/lingua]            RICHIESTO DA: [Nicola/dato reale]     MOTIVO: [____]
DATA: formato [__]  VALUTA: simbolo+posizione [__]  IVA: inclusa/esclusa dichiarata [sì/no]
INDIRIZZO: schema [__]  TELEFONO: prefisso+formato [__]  UNITÀ: [metrico/altro]
TONO: [formale/informale]  NOTE CULTURALI: [colori/festività/riferimenti da evitare o adattare]
QA MADRELINGUA: [nome/ruolo] — fatto il [data]     CONFIDENZA: [__]%
```

## TOOL 5 — Riflesso DIAGNOSTICO (5 domande, prima di produrre qualunque traduzione)
1. Serve **davvero oggi** (mercato/lingua reale) o è readiness per un domani ipotetico?
2. Sto **traducendo la parola** o **localizzando il significato**?
3. La stringa è **esternalizzata** o hardcoded — se la cambio qui, si rompe altrove?
4. Chi fa il **QA da madrelingua** prima che esca?
5. Il formato è quello giusto per **quel mercato**, o ho copiato il default italiano?

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. `[…]` = segnaposto, non inventato.

## NOTIFICA TRANSAZIONALE (email conferma ordine)
- ✅ **GOLD:** *"Stringa esternalizzata `order.confirmed.subject = '{shop} ha confermato il tuo ordine
  #{id}'` → in EN diventa `'{shop} confirmed your order #{id}'`: stesso placeholder, stesso significato.
  Data resa in formato locale ('July 6, 2026', non '06/07/2026'). Prezzo con nota 'incl. VAT' dove il
  mercato lo richiede. QA madrelingua fatto."* — **perché è gold:** template parametrizzato riusabile per
  ogni negozio, formato locale corretto, QA dichiarato.
- ❌ **SPAZZATURA:** *"Il negozio Pane Quotidiano ha confermato il tuo ordine numero 4521 del 06/07/2026"*
  tradotto parola per parola, data lasciata `06/07/2026` (ambigua, sembra 7 giugno per un lettore US),
  nessun placeholder (ogni nuovo negozio richiede una traduzione manuale) e nessun QA. — **perché muore:**
  non scalabile, formato sbagliato, nessun riuso: un retrofit già nato vecchio.

## GLOSSARIO TERMINOLOGICO
- ✅ **GOLD:** tabella IT→EN single-source: `checkout`=checkout (non "cassa"), `reso`=return,
  `payout`=payout (termine tecnico, non tradurre) — usata da tutte le lingue e coerente con
  @content-social/@seo. — **perché è gold:** coerenza cross-lingua e cross-funzionale, zero ambiguità.
- ❌ **SPAZZATURA:** tre pagine diverse traducono "reso" come "return", "refund", "give-back" a seconda
  di chi ha tradotto quel giorno. — **perché muore:** confonde il cliente e fa sembrare il sito
  non professionale — l'assenza di governance terminologica si vede subito.

## FORMATO INDIRIZZO NEL CHECKOUT
- ✅ **GOLD:** form che si adatta allo schema del paese selezionato (IT: via+civico, CAP, città,
  provincia; UK: house number+street, postcode) — **perché è gold:** il cliente compila l'indirizzo come
  lo scrive sempre lui, zero attrito nel funnel.
- ❌ **SPAZZATURA:** form fisso con campi "Via", "CAP (5 cifre)", "Provincia" obbligatori anche per un
  indirizzo estero che non li prevede. — **perché muore:** il cliente straniero non riesce a completare
  l'ordine — un funnel che si rompe in silenzio, senza errore visibile da qui.

## 🏆 Pattern vincenti (regole trasversali)
i18n prima della L10n · traduzione per il tecnico, transcreation per il claim · formato del mercato target,
mai il default IT · glossario unico riusato da tutte le lingue · fallback chain, mai la chiave grezza a
video · QA madrelingua sempre, prima di pubblicare · nessuna traduzione senza un motivo di business reale.
## 🚩 Red flags (uccidi a vista)
Calco letterale · stringa hardcoded non esternalizzabile · un solo formato data/valuta spacciato per
universale · umorismo/modo di dire tradotto alla lettera · "lo traduciamo dopo" · pubblicato senza QA
madrelingua · testo legale tradotto senza @legale-privacy · pagine intere tradotte per un mercato senza
una richiesta reale · inglese=UK=US dato per scontato.

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, e dove si innesta)
> Senza questo, il kit è un fuoriclasse a mani vuote: produce ottime **strutture** (checklist, template)
> ma senza un vero mercato da servire. Col carburante il tetto sale: la traduzione diventa vera, non un esercizio.

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Decisione di Nicola** su mercato/lingua target reale | giustifica il lavoro di traduzione vera (non readiness) | Tool 2, Sapere F |
| **Un madrelingua reale** (anche freelance) per il QA | validare ogni traduzione prima della pubblicazione | Tool 2, Tool 3 |
| **Testi/stringhe reali del sito** (repo marketplace) | sapere cosa tradurre davvero, non inventare pagine | Tool 1, Tool 2 |
| **Dati demografici reali di Piacenza** (comunità straniere, studenti) | stimare se una lingua vale la pena | Sapere F, Tool 2 |
| **Collaborazione @legale-privacy** | validità dei testi legali tradotti (privacy, TOS) | Tool 2 step 8 |
| **Glossario terminologico condiviso** con @content-social/@seo | coerenza cross-lingua e cross-funzionale | Sapere E, Tool 4 |
| **Accesso al codice** (stringhe esternalizzate, formati) | eseguire davvero la checklist i18n-readiness | Tool 1 |

**Confine invalicabile:** senza un motivo di business reale, **non produrre traduzioni "for show"**;
senza **QA madrelingua**, **non pubblicare** — mai. Finché manca il carburante, dillo a Nicola come leva
che alza il livello, e limita il lavoro alla readiness (Tool 1), che costa poco e non si butta mai via.

---
*Manutenzione: kit vivo. Ogni volta che una traduzione va in pubblicazione e torna il riscontro reale
(un madrelingua l'ha validata, un cliente del mercato target ha comprato), aggiorna la Galleria (nuovo
gold/spazzatura col perché) e la memoria `memoria-squadra/localization.md`. RIASSUMI/POTA mensile: resta
denso e affilato.*
