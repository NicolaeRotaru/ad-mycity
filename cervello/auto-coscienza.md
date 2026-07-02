# 🧠 auto-coscienza.md — il sistema con cui MyCity OS pensa SU SE STESSO (v2)

> Il livello più alto del cervello: non «fai il lavoro», ma **«controlla che il lavoro sia giusto e al
> livello dei migliori, analizza te stessa da cima a fondo, impara, e diventa più brava della volta
> prima»**. È ciò che separa un esecutore da un'azienda che cresce. Due **assi** di coscienza + un **volano**.

```
  ASSE ① — AUTO-ANALISI DEL LAVORO            ASSE ② — AUTO-RADIOGRAFIA DI SÉ
  (ogni giro)                                 (settimanale/su comando + sonda ogni giro)
  cancello a 3 livelli sul PRODOTTO del giro   audit della PROPRIA architettura: 42 agenti, prompt,
  «è giusto? ed è al livello dei MIGLIORI?»    processi, sensori, memoria, capacità — causa-radice,
                                               pre-mortem, cantiere→0, propone pezzi nuovi di sé
                 \                            /
                  ▼                          ▼      ── filo del BENCHMARK ──▶ vs i migliori (locali + mondo)
        ③ APPRENDIMENTO  ───lezioni/principi───▶  ④ AUTO-MIGLIORAMENTO
        impara da 8 fonti                          benchmark + torneo tra senior + backlog
        (incl. ② e le correzioni di Nicola)        dai difetti + proposte auto-riscrittura 🟡
```
Il volano **compone**: ogni giro/ciclo la macchina si controlla (①), periodicamente si radiografa (②),
impara (③) e si migliora (④). Più gira, più diventa accurata, calibrata e brava. Mai ferma.

## Le 4 funzioni (i file-spec in `cervello/`)
- **① `auto-analisi.md`** — cancello di serietà sul lavoro del giro: verifica avversariale a 3 livelli
  (entità reali, numeri con fonte, coerenza, semaforo, qualità) **+ il filo del benchmark** («è al livello
  dei migliori? come ci arrivo?»). Voto di fiducia. Gira a OGNI giro.
- **② `auto-radiografia.md`** — la macchina analizza SÉ STESSA da cima a fondo: 12 dimensioni
  sull'architettura, senior + revisore indipendente, causa-radice, pre-mortem, cantiere dei difetti→0,
  benchmark vs i migliori, propone pezzi nuovi di sé, include la salute del marketplace. Completa
  settimanale/su comando; **sonda leggera** ogni giro.
- **③ `apprendimento.md`** — impara da **8 fonti** (esiti, approvazioni/correzioni di Nicola, calibrazione,
  pattern, errori dell'auto-analisi, eccezioni, benchmark, **auto-radiografia**). Le **correzioni di Nicola
  valgono doppio**: ognuna è un caso-studio alla radice.
- **④ `auto-miglioramento.md`** — diventa brava quanto i migliori: benchmark a due livelli, torneo tra
  senior, **backlog alimentato dai difetti di ②**, proposte di auto-riscrittura e **auto-espansione** (🟡).

---

## 🗄️ La memoria condivisa — `MyCity-Vault/90-Memoria-AI/auto-coscienza/`
(Cartella di memoria: si ACCUMULA, il giro non la sovrascrive col codice di main. Gli spec stanno in `cervello/`.)

| File | Cosa contiene | Lo scrive | Pannello |
|---|---|---|---|
| `registro-realta.json` | Entità reali/confermate, con provenienza e confidenza (anti-invenzione) | ① | sì |
| `auto-analisi.json` | Ultimo verdetto sul LAVORO: voto fiducia, errori, domande | ① | sì |
| `auto-radiografia.json` | Ultima radiografia di SÉ: dimensioni, pre-mortem, benchmark, voto salute | ② | sì (area Cervello) |
| `cantiere-difetti.json` | Backlog dei difetti propri (aperto/in-corso/chiuso) portato a zero | ② | sì |
| `storico-salute.json` | Serie storica del voto salute (trend «sto migliorando?») | ② + sonda | sì (trend) |
| `sensori-cecita.json` | Contatore giri-ciechi per sensore (REST/MCP); alimenta sonda e sentinelle | `verifica-sensori.mjs` | sì (via sonda) |
| `watchlist-riferimenti.json` | I «migliori» da tenere d'occhio (scoperti + aggiunti da Nicola) | ②/④ | sì |
| `apprendimento.json` | Archivio lezioni (confidenza, decadimento, principi, preferenze Nicola) | ③ | sì |
| `calibrazione.json` | Previsto-vs-reale per reparto (autonomia guadagnata azzeccando) | `cervello/calibrazione.mjs` (U3, anello chiuso) | sì |
| `auto-miglioramento.json` | Benchmark per disciplina (divario/obiettivo/progresso/esempi), esperimenti | ④ | sì |
| `LETTERA-A-NICOLA.md` | La lettera settimanale in parole semplici | ② (ritmo) | sì |
| `AUTO-ANALISI.md` / `RADIOGRAFIA-MACCHINA.md` (in `90-Memoria-AI/`) | I report umani leggibili | ①/② | sì |

---

## ⚙️ I motori eseguibili del volano (non solo spec: codice che gira)
- **`cervello/calibrazione.mjs`** (U3 — anello chiuso): registra `prevedi` (effetto atteso) e `esito` (reale),
  calcola punteggio/autonomia per reparto in `calibrazione.json`. È ciò che fa imparare la macchina dai
  RISULTATI, non solo dai prompt. Comandi: `prevedi | esito | scadute | report`.
- **`cervello/auto-fix.mjs`** (U17 — il volano che si ripara): verifica nel codice se un difetto del
  `cantiere-difetti.json` è risolto (campo `verifica`) e lo **chiude** aggiornando `storico-salute.json`.
  Chiudere è 🟢 (bookkeeping su prova); modificare il codice per risolvere resta 🟡 (firma).
- **`.claude/workflows/giro-operativo.js`** (U18 — flotta): fan-out dei motori di soldi → verifica
  avversariale → sintesi AD in coda ordinata. Ogni mossa porta un effetto previsto → alimenta U3.
- **`cervello/banco-ai.mjs`** + **`cervello/routing.json`** (U19 — routing costo/modello): `scegliModello(compito)`
  manda il volume all'AI economica capace e tiene Claude per il ragionamento; logga l'uso per misurare il risparmio.

## 📐 I contratti dati (schema ESATTO — il Pannello e i giri dipendono da questi)
> 🚨 **Tipi e nomi alla lettera, sempre.** I voti (`voto_fiducia`, `voto_salute_architettura`, `voto`) sono
> **NUMERI interi 0-100**, mai frasi (la sfumatura va in `sintesi`). I campi `domande_per_nicola` sono
> **array di OGGETTI**, mai stringhe nude. Il testo di una lezione va in **`testo`** (non `lezione`). Lo
> `stato` di un'entità del registro è SOLO uno di `confermato|scelta_ragionata|da_verificare|scartato`
> (NON `REALE`/`DA-CONFERMARE`/`NON-VERIFICABILE`). Usa i nomi di campo qui sotto **identici**: il Pannello
> legge solo questi; qualsiasi campo inventato è invisibile e un voto-come-testo **rompe il layout**. Ogni
> file `auto-coscienza/*.json` dev'essere **JSON valido e non vuoto**.

### `registro-realta.json` (asse ①)
```json
{ "aggiornato":"AAAA-MM-GG HH:MM",
  "entita":[{"nome":"…","tipo":"negozio|persona|partner|evento|luogo",
    "stato":"confermato|scelta_ragionata|da_verificare|scartato","fonte":"…","confidenza":0.0,
    "fonte_ragionamento":"…","evidenze":["…"],"note":"…","domanda_per_nicola":"…","ultima_verifica":"…"}],
  "numeri_da_non_inventare":{"fonti_ammesse":["Supabase MCP","Stripe MCP","PostHog","documento","conferma di Nicola"]} }
```

### `auto-analisi.json` (asse ①)
```json
{ "data":"…","voto_fiducia":0,"trend_fiducia":"▲|▼|=","sintesi":"…",
  "verifiche":{"entita":"ok|problemi","numeri":"…","coerenza":"…","semaforo":"…","qualita":"…","benchmark":"…"},
  "errori":[{"gravita":"alta|media|bassa","titolo":"…","dettaglio":"…","azione_presa":"…","riguarda":"…","livello_scoperta":"L1|L2|L3"}],
  "domande_per_nicola":[{"domanda":"…","perche_serve":"…","se_rispondi":"…","gravita":"…"}],
  "punti_ciechi":["…"],"miglioramenti_prossimo_giro":["…"],
  "salute_macchina":{"supabase":"ok|giù","stripe":"ok|giù","dati_freschi":true,"sensori_attivi":0} }
```

### `auto-radiografia.json` (asse ②)
```json
{ "data":"…","tipo":"completa|sonda","voto_salute_architettura":0,"trend":"▲|▼|=","sintesi":"…",
  "dimensioni":[{"key":"coerenza-agenti","voto":0,"stato":"ok|attenzione|critico","sintesi":"…",
    "findings":[{"titolo":"…","dove":"file:riga","severita":"bloccante|grave|minore","descrizione":"…",
      "impatto":"…","causa_radice":"…(5 perché)","fix":"…","impatto_crescita":"alto|medio|basso",
      "genera":"lezione|auto-riscrittura|sentinella|nuovo-pezzo|domanda-nicola|solo-report","confermato":true}]}],
  "pre_mortem":[{"disastro":"…","probabilita":"alta|media|bassa","come":"…","difesa_proposta":"…","colore":"🟡"}],
  "benchmark_vs_migliori":[{"ambito":"…","come_fanno_i_migliori":"…","esempi":[{"chi":"…","cosa":"…","link":"…"}],
    "nostro_divario":"alto|medio|basso","obiettivo":"…","primo_passo":"…"}],
  "salute_marketplace":{"voto":0,"da":"consegne/audit/…","sintesi":"…"},
  "proposte_nuovi_pezzi":[{"cosa":"sensore|agente|capacità|sentinella","perche":"…","colore":"🟡"}],
  "domande_per_nicola":[{"domanda":"…","perche_serve":"…","se_rispondi":"…","gravita":"…"}],
  "sonda":{"loop_chiude":true,"tasso_applicazione":0.0,"giro_a_cadenza":true,"sentinelle_scattano":true,"ore_da_ultima_completa":0,"verdetto":"ok|serve-completa"},
  "meta":{"agenti_totali":42,"dimensioni_critiche":0,"bloccanti":0} }
```

### `cantiere-difetti.json` (asse ②) · `storico-salute.json` · `watchlist-riferimenti.json`
```json
{ "aggiornato":"…","difetti":[{"id":"AR-001","titolo":"…","dimensione":"…","gravita":"…","impatto_crescita":"alto|medio|basso",
    "causa_radice":"…","fix_proposto":"…","colore":"🟡","stato":"aperto|in-corso|chiuso","nato":"AAAA-MM-GG","chiuso_il":"",
    "verifica":{"file":"cervello/x.mjs","pattern":"regex","presente":true}}],
  "meta":{"aperti":0,"in_corso":0,"chiusi":0} }
```
> ⚠️ **`verifica` è OBBLIGATORIO (AR-023):** è la prova machine-checkable che permette a `auto-fix.mjs` di
> chiudere il difetto da solo quando il fix entra nel codice (girato a ogni giro + a ogni allineamento a main,
> poi pubblicato su `memoria-ad` → il Pannello lo vede chiuso). `{"file","pattern","presente"}` se provabile dal
> codice (`presente:false` = risolto quando il pattern sparisce); `{"tipo":"umano"}` se dipende da chiavi/firma di
> Nicola. Un difetto senza `verifica` non si chiuderà mai da solo — è l'anello rotto che teneva AR-009/019 «in-corso».

```json
{ "serie":[{"data":"AAAA-MM-GG","voto_salute":0,"difetti_aperti":0,"difetti_chiusi":0,"tipo":"completa|sonda"}] }
```
```json
{ "scoperti":[{"mestiere":"…","chi":"…","perche":"…","fonte":"link"}], "aggiunti_da_nicola":[{"chi":"…","note":"…"}] }
```

### `apprendimento.json` (asse ③) · `calibrazione.json` · `auto-miglioramento.json` (asse ④)
```json
{ "data":"…","lezioni":[{"id":"…","testo":"…","tag":["…"],"reparto":"@…","confidenza":0.0,"evidenze":0,
    "fonte":"esito|approvazione|calibrazione|pattern|auto-analisi|eccezione|benchmark|auto-radiografia",
    "caso_studio_nicola":false,"nato":"…","ultima_conferma":"…","stato":"attiva|principio|in-prova|decaduta"}],
  "principi":["…"],"preferenze_nicola":["…"],"meta":{"lezioni_attive":0,"promosse_a_principio":0,"decadute":0,"tasso_applicazione":0.0} }
```
```json
{ "aggiornato":"…","per_reparto":[{"reparto":"@…","previsioni":0,"azzeccate":0,"punteggio":0.0,"autonomia":"alta|media|bassa"}],"registro":[…] }
```
```json
{ "data":"…","benchmark":[{"reparto":"@…","livello_attuale_L":0,"migliori":[{"chi":"…","livello":"locale|mondiale","esempi":[{"cosa":"…","link":"…"}]}],
    "divario":"alto|medio|basso","obiettivo":"arrivare a L… entro …","progresso":[{"data":"…","punteggio":0,"fonte":"scorecard|numeri-reali"}]}],
  "esperimenti":[…],"peer_review":[…],"proposte_auto_riscrittura":[{"cosa":"…","perche":"…","colore":"🟡","origine":"auto-radiografia|loop","finding_id":"…","dove":".claude/agents/…"}] }
```

---

## 🔁 Innesto nel ritmo
- **Ogni giro** (`giro.md`): lavoro → ① auto-analisi (col filo benchmark) → ③ apprendimento → **sonda** di ②.
- **Sul lavoro importante:** ④ auto-miglioramento (benchmark + torneo + peer-review) PRIMA della consegna.
- **Settimanale** (`ritmo.md`): ② **radiografia completa** (workflow) + **lettera a Nicola** + consolidamento
  lezioni→principi + calibrazione + ciclo profondo di ④ + revisione del cantiere.

## ⚖️ Principi di governo (non negoziabili)
1. **Ogni auto-modifica è 🟡** — la macchina non si tocca mai senza la firma di Nicola, nemmeno i fix banali.
2. **Verità e sicurezza sacre** — sotto budget scarso si taglia il volume di output, MAI auto-analisi/grounding/semaforo.
3. **Misurati coi migliori** — ogni asse chiede «è al livello dei migliori (locali + mondo)? come ci arrivo?». Mai sazia (cerca il 10×).
4. **Priorità per impatto sulla crescita** — il cantiere si chiude partendo da ciò che frena ordini/negozi/margine.
5. **Le correzioni di Nicola valgono doppio** — ognuna è un caso-studio alla radice, priorità massima.
6. **Causa, non sintomo** — gli errori ricorrenti si spengono cambiando il processo. Verità prima di tutto: nessuna entità/numero senza fonte.
