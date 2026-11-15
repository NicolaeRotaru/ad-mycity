---
data: 2026-11-15 10:50
chi: ricollaudatore della correzione dell'officina minima (chat 3 dell'AD)
testa: main a 6273ba1, che contiene lo squash 85e4167. Il codice di riparazione-sessioni.mjs e i test sono identici a 41e041c
---

# Ricollaudo dell'officina minima — 15/11/2026

## Verdetto: REGGE CON RISERVA

Il bloccante è chiuso, i minori 4 e 5 sono chiusi, i numeri della costruttrice tornano tutti.
La riserva è un rischio già dichiarato dalla costruttrice: lo scrivo col caso vero e con la correzione.

## Il punto adesso
- ✅ **Fatto:** ho rifatto le sei prove sulla copia della campagna del 12 novembre. Cinque reggono. La sesta regge, ma con un rischio da sapere.
- ⏳ **In corso:** niente.
- 👉 **Tocca a te:** niente di urgente. Se vuoi chiudere anche il rischio, serve un campo nel piano: lo spiego sotto.
- 🕐 **Quando vuoi:** la promessa scritta nella skill `riparazione` («applica rilancia comunque i controlli») non vale più per la regola dei 40 voci. Va corretta la frase, oppure il codice.

## In parole semplici
Il primo collaudo aveva trovato un errore che bloccava tutto. La regola nuova («sotto le 40 voci non si collauda a campione») riapriva voci già chiuse col campione quando la regola ancora non c'era.
Adesso la regola vale solo in `valida-collaudo`, il controllo del singolo collaudo. Non vale più in `applica`, il passo finale che chiude le voci.
Così le 7 voci vecchie restano chiuse: è giusto.
Il prezzo è questo: se una regista salta `valida-collaudo`, o lo vede rosso e va avanti lo stesso, `applica` chiude a campione anche un collaudo nuovo. Prima lo fermava.
Un esempio vero. Il collaudatore K08 ha guardato a campione i lotti di R15 e R16, 19 e 21 voci. Dato oggi a `valida-collaudo`, prende 6 rossi. Dato ad `applica` senza quel controllo, chiude lo stesso R16-014, R16-015 e R16-016.

## Cosa cambia per te
Puoi unire l'officina. Una sola rete tiene la regola dei 40 voci, ed è il controllo che la regista deve lanciare a mano prima di unire.
Le altre regole nuove del 15/11 funzionano già così, ma la skill promette che `applica` le rilanci da sé. È quella promessa a non essere più vera.

## Cosa devi fare
Niente per unire. Per chiudere il rischio servono due cose:
- un campo nel piano, sul modello di `verifica_testa_dall_onda` che c'è già: le campagne nuove lo mettono a 1, quella del 12/11 lo lascia vuoto;
- oppure correggere la riga 466 della skill `riparazione`, così dice la verità.

## Cosa non ho verificato
- Non ho lanciato `applica --git` sui rami veri: mi sono fermato alla copia della cartella, senza `--scrivi`.
- La classe dei casi «la regista salta valida-collaudo» l'ho ricreata a mano, prendendo K08 come se fosse nuovo. Non ho una campagna nuova vera.
- Non ho guardato se `pronte` tiene conto dei controllori: ne parlo nell'ultima sezione, fuori dal perimetro.

---

## Dettagli tecnici

Copia della campagna `consegne/riparazioni/2026-11-12-sito-tutto` nella cartella temporanea della sessione. Mai `--scrivi`. Script di prova: `decidi` ed `elenchiPronte` importati da `cervello/riparazione-sessioni.mjs`.

### 1. Bloccante — la regola dei 40 voci solo dietro `ctx.misura` — ✅ con rischio dichiarato
- ✅ `valida-collaudo` la applica ancora. Ho dato i collaudi veri come se fossero nuovi (lotti da 19 a 25 voci):
  `node cervello/riparazione-sessioni.mjs valida-collaudo <C>/collaudi/K08.json --cartella <C>` → 6 rossi «il campione non esiste». K02 → 9, K07 → 3. Atteso rosso → reale rosso.
- ✅ `applica` non la applica più: senza K10 esce 1 con **1 problema** (campione di K07 su R18). Atteso 1 → reale 1.
- ✅ `decidi` con `misura:true` riapre le 7, senza no: R08-010, R08-018, R08-020, R08-023, R16-014, R16-015, R16-016.
- ⚠️ **Rischio (la variante scomoda).** Collaudo nuovo, a campione, in un lotto di 25 voci, che non passa da `valida-collaudo`: `applica` lo chiude.
  Prova: le 7 voci di K02 (R08, 25 voci) e K08 (R16, 21 voci) risultano `si_chiude` da `decidi` come lo chiama `applica` (riga 1819, senza `misura`), e `resta_aperta` con `misura:true`.
  Nessun codice di produzione passa `misura:true` a `decidi` (righe 1819 e 2149): il ramo con la regola dentro `decidi` gira solo nei test.
  Lo stesso vale per `pronte`, che chiama `decidi` senza `misura`.
  **Gravità: rischio dichiarato, non boccia** (lo chiede il mandato, e la costruttrice lo dichiara). Però la skill `riparazione`, riga 466, promette «`applica` li rilancia comunque da sé»: per questa regola non è più vero.
  **Correzione suggerita:** `campione_fino_a_40_dall_onda` nel piano, come `verifica_testa_dall_onda`, passato come `misura` ad `applica` e a `pronte`.

### 2. Minore 4 — l'avviso del «rompe_altro» battuto da un pieno — ✅
- K07 a `rompe_altro` senza pieno su R18-009, -018 e -020, K10 `regge` pieno. `applica` sulla copia, uscita 3, stampa tre righe `⚠️ R18-009: K07 dice «rompe_altro» senza giudizio pieno; vince il «regge» pieno di K10`. `decisioni.json` porta `avvisi` con 3 righe.
- Ordine inverso con `applica` vero: K07 ribattezzato K11, così si legge dopo K10. Stesse 3 righe, stesso campo `avvisi`.
- Anche `non_regge` senza pieno lascia l'avviso. Due «regge» non lo lasciano (c'è la prova nel test).

### 3. Minore 5 — un collaudo non finito non presta il pieno — ✅
`decidi` diretto sulla campagna più K10, in tutti e due gli ordini, con `finita` mancante, `"true"` stringa, `false` e `1`: R18-009, -018 e -020 restano `resta_aperta` («campione di R18 non accettato»). Nessuna entra nell'elenco A di `pronte`.
Controllo: con `finita:true` tornano a `si_chiude`. Il codice è `c.finita === true`.
- Minore, non boccia: la prova `collaudi-guardati-insieme.test.mjs` copre solo `finita:false`. I casi «mancante» e `"true"` li ho provati solo io. Se un giorno qualcuno scrive `c.finita !== false`, nessun test diventa rosso.
  Comando che la ucciderebbe: aggiungere al test del minore 5 i due casi `delete K10.finita` e `finita: "true"`.

### 4. Regressione — `finita:true` aggiunto a 7 collaudi di prova — ✅ non ammorbidite
Il diff di 41e041c sui due file aggiunge solo `finita: true`: nessuna asserzione è cambiata.
Prova al contrario: ho tolto le sole righe del diff (`git apply -R`) sul codice di oggi.
`node --test cervello/test/riparazione-sessioni.test.mjs cervello/test/chiusure-dopo-l-onda-2.test.mjs` → 83 su 87, con 4 rossi:
(a) minore a uscita 3 col pieno · (c) `verificata_dopo_nicola` · «applica: minore fuori campione / grave solo col pieno» · «fra due regge vince il pieno».
Sono le prove che chiudono grazie al pieno: senza `finita` non lo hanno più, e diventano rosse perché la correzione funziona. Con `finita:true` provano la stessa cosa di prima.
Gli altri 3 collaudi di prova («giusto», «intruso», «rapido») passano con e senza `finita`. Dicono `resta_aperta` o confrontano due pieni: aggiungere `finita` li rende più severi, non più facili.

### 5. Numeri — `applica` sulla campagna del 12/11 — ✅
| Dichiarato | Ricalcolato | |
|---|---|---|
| senza K10 esce 1, solo per il campione di K07 su R18 | uscita 1, «rosso (1 problemi)», `K07.json: R18: campione troppo piccolo: 4 minori guardati con giudizio, ne servono 5` | ✅ |
| con K10 esce 3, 200 chiuse contro 193 | uscita 3, 200 `si_chiude` · 10 già riparate · 349 aperte | ✅ |
| le 7 in più: R07-010, R07-014, R07-017, R15-014, R18-009, R18-018, R18-020 | identiche, confronto voce per voce con `decisioni.json` al commit | ✅ |
| le 7 di R08 e R16 restano chiuse | nessuna voce passa da chiusa ad aperta | ✅ |

**11 contro 7.** Sono due misure diverse.
«11» nel primo referto erano i **problemi** di `applica` con K10 dentro: le righe rosse «il campione non esiste», 4 su K02, 3 su K08 e 4 su K10.
«7» sono le **voci** in più che si chiudono con K10.
Le righe rosse sparite non cambiano le voci chiuse: fermavano `applica` tutta intera, non le singole voci.

### 6. Mutazioni — ✅
- `node cervello/non-vacuita.mjs --difetti AR-1180` in una copia separata del deposito a 6273ba1 → **43 su 43** rendono rosso il loro test.
- «81 su 81 su riparazione-sessioni.mjs»: nel file ci sono **74** mutazioni di `riparazione-sessioni.mjs`, non 81. Sono dei difetti AR-1163, AR-1172 e AR-1180.
  Le 81 sono quelle 74 più le 7 di `prova-rimessa.mjs` degli stessi difetti. Il numero torna, l'etichetta no: minore di scrittura, non boccia.
  `node cervello/non-vacuita.mjs --difetti AR-1163,AR-1172,AR-1180 --json` → 88 lanciate (le 81 più 7 di freno e sorveglia), **87 ok e 1 «cieca»**.
  La cieca è di AR-1172 («valida-collaudo perde dal JSON i rossi sospesi»). È andata oltre il tetto di 700 secondi con la macchina carica. Non era misurata, quindi l'ho rilanciata da sola: la mutazione applicata a mano, poi `node --test cervello/test/riparazione-sessioni.test.mjs` → rosso al test 81, in 13 secondi.
  Conto finale: **88 prese su 88**.

### Fuori perimetro, solo annotato
- `decidi` da solo, senza `conIControlli`, chiude 5 voci che i controllori sul ramo unito hanno trovato rosse: R06-017, R07-019, R08-012, R09-013, R11-017. `applica` le riapre. `pronte` chiama `decidi` senza controlli: non ho verificato se le rimette nei suoi elenchi. Vale una occhiata, ma non nasce da 41e041c.
