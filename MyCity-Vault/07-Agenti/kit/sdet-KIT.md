---
tipo: kit-mestiere
ruolo: sdet
fonte: AD digitale (strati 3-6 del professionista — installati, non descritti)
stato: v1 2026-07-06 · carburante reale atteso: ambiente di staging + CI + Stripe test-mode
collegato: [[RUBRICA-LIVELLI]] · [[GLOSSARIO-KPI]] · [[qa-KIT]] · [[devops-sre-KIT]] · 04-Prodotto-Ops/
---

# 🧰 KIT MESTIERE — sdet (il "cervello allenato" dell'SDET/QA Automation di marketplace)

> Il mansionario dice *chi sei* e *come ti comporti* (strati 1-2). Questo kit è ciò che un SDET di Amazon
> **sa e usa** (strati 3-6): i framework per decidere DOVE automatizzare, gli strumenti passo-passo, la
> galleria di suite gold/spazzatura, e il carburante che serve. Il kit **aggiunge framework e rigore**, non
> ri-spiega l'ovvio. Bersaglio: **L7-con-giudizio** ([[RUBRICA-LIVELLI]]).

---
# 📚 STRATO 3 — SAPERE (cosa un fuoriclasse SA davvero)

## A. La piramide dei test (e perché non si capovolge mai)
- **Unit** (base, tanti, veloci, ms) → logica pura, calcolo di un prezzo, validazione di un input. Isolati,
  deterministici, zero rete/DB.
- **Integration** (via di mezzo) → il componente parla col DB/API vero (o un doppio realistico): "il carrello
  salva l'ordine su Supabase con lo stato giusto".
- **End-to-end** (punta, pochi, lenti, costosi) → l'utente vero attraversa il browser/app fino al risultato:
  "il cliente paga e riceve la conferma". Copre l'integrazione REALE di tutti i pezzi, ma è lento e fragile
  a ogni cambio di UI.
- **Errore #1 dei junior:** capovolgere la piramide ("ice-cream cone") — tanti e2e, pochi unit. Risultato:
  CI lentissima, suite fragile, feedback che arriva in ore invece che in secondi. **Automatizza in basso
  tutto ciò che il basso può coprire**; sali all'e2e solo per il percorso reale che nessun livello sotto verifica.
- **Regola pratica MyCity (early-stage, pochi negozi reali):** priorità agli e2e sui 3-4 flussi che muovono
  soldi (checkout, payout, stato ordine, onboarding negozio); tutto il resto a integration/unit.

## B. Flakiness: cause, quarantena, SLO
- **Cause tipiche:** `sleep()` fisso invece di attesa esplicita sullo stato · dati/stato condivisi tra test
  che girano in parallelo · dipendenza da un servizio esterno non mockato (rete, orario, terze parti) ·
  ordine di esecuzione implicito · timeout troppo stretti su CI più lenta del locale.
  I test che dipendono dall'orologio di sistema, dal fuso orario, o da una sequenza fissa di ID sono i
  primi sospetti quando un test "a volte" fallisce.
- **Politica di quarantena:** un test flaky (fallisce >1 volta su ~20 run senza un cambio nel codice) va
  **marcato in quarantena** (skip esplicito, non cancellato) con un ticket che ne cerca la causa — **mai**
  ignorato in silenzio, **mai** lasciato a inquinare il segnale verde/rosso della CI.
- **SLO consigliato:** tasso di flaky della suite < 2%. Sopra, la fiducia nella CI crolla e i rossi veri
  vengono ignorati insieme ai falsi ("alert fatigue" applicato ai test).

## C. Coverage: cosa significa DAVVERO (non la percentuale di righe)
- **Coverage di riga/branch** dice quanto codice è stato *toccato*, non quanto **comportamento reale** è
  verificato. Il 100% di riga con zero assert sui casi limite è coverage-teatro.
- **Coverage per rischio** è la metrica che conta: per ogni flusso critico, quali **stati e casi limite**
  sono coperti (happy path, zero/vuoto, doppio submit, rete che cade, concorrenza, permessi/RLS)?
- **Mutation testing (concetto):** se introduci un bug deliberato (es. inverti un `>` in `<` su uno sconto)
  e nessun test fallisce, quella riga NON è davvero testata anche se la coverage di riga dice "coperta".
  Usalo come check periodico sui moduli critici (checkout/pagamento), non su tutto il codice.

## D. Load/stress testing: throughput, concorrenza, race condition
- **Load test** (carico atteso, es. N ordini/minuto in un giorno normale) vs **stress test** (oltre il
  limite, per trovare dove si rompe) vs **spike test** (picco improvviso, es. un post virale/promo).
- **Concorrenza sui punti-soldi è il bersaglio vero:** due richieste di checkout simultanee sullo stesso
  carrello, un webhook Stripe recapitato due volte (retry), due transfer di payout paralleli sullo stesso
  ordine. Il test di carico deve **cercare la race condition**, non solo misurare la latenza media.
- **Idempotenza:** ogni endpoint che tocca soldi (webhook di pagamento, creazione payout) deve comportarsi
  come se un'esecuzione doppia non producesse un doppio movimento. Il test di carico è anche il modo più
  economico per scoprire se manca una idempotency-key.
- **Metrica da riportare:** non solo "tempo medio di risposta", ma **soglia di rottura** (a che N
  richieste/s il sistema degrada/errori 5xx salgono) e **cosa si rompe per primo** (DB? webhook? coda?).

## E. Contract testing / test dei confini (API, webhook Stripe)
- Un **contract test** verifica che il confine tra due sistemi (il nostro backend e Stripe, o frontend e
  API interna) rispetti la forma attesa (campi, tipi, codici di stato) **senza dover far girare l'intero e2e**.
- Più economico e più veloce di un e2e per catturare "Stripe ha cambiato la forma del payload del webhook"
  o "l'API ha rimosso un campo che il frontend si aspetta" — lo trovi in secondi in CI, non in un incidente.
- Su MyCity: il confine più critico da proteggere così è **webhook Stripe → gestione stato ordine/payout**.

## F. Il ciclo di vita della suite di regressione (dal bug al caso permanente)
- Ogni bug reale trovato (da te, da @qa, o sfuggito in produzione) **diventa un caso automatico permanente**:
  altrimenti la stessa classe di bug torna, perché nessuno la ricontrolla a mano ogni volta.
- La suite è **viva**: si pota (rimuovi test ridondanti/obsoleti), si aggiorna (il comportamento atteso
  cambia legittimamente), si documenta (nome del test = descrizione del comportamento).

---
# 🛠️ STRATO 4 — TOOLKIT (gli strumenti passo-passo)

## TOOL 1 — Matrice RISCHIO × MANUTENZIONE (dove investire l'automazione)
> Per ogni flusso, valuta 2 assi e decidi il piano della piramide da usare.

```
FLUSSO: [____________]
Impatto se si rompe (soldi/dati/reputazione)      Basso / Medio / Alto
Frequenza di cambiamento (quanto spesso cambia)    Bassa / Media / Alta
Frequenza d'uso reale (quanti utenti lo attraversano)  Bassa / Media / Alta
──────────────────────────────────────────────
→ Impatto ALTO + uso ALTO  → e2e automatico in CI, priorità massima (checkout, payout, login)
→ Impatto ALTO + cambia SPESSO → integration test forte + contract test sul confine (non solo e2e fragile)
→ Impatto BASSO → unit test o niente di automatico, non vale il costo di manutenzione
```
**Output atteso:** lista dei 3-5 flussi da coprire per primi, con il piano di piramide scelto e il perché.

## TOOL 2 — Procedura di scrittura di un test (deterministico, non-fragile)
1. **Arrange-Act-Assert** (dato → quando → allora): stato iniziale esplicito e isolato (seed dedicato, non
   condiviso con altri test), un'azione, un assert **forte** (valore esatto atteso, non "non è vuoto").
2. **Attese esplicite sullo stato**, mai `sleep(n)` fisso: aspetta l'evento/la condizione reale (es. "lo
   stato ordine è `paid`"), con un timeout generoso ma un fallimento chiaro se non arriva.
3. **Isolamento dei dati**: ogni test crea (e pulisce) i propri dati; niente test che dipende dall'ordine
   di esecuzione di un altro o da uno stato lasciato in giro.
4. **Un test, un comportamento**: nome descrittivo ("checkout fallisce se il carrello è vuoto"), non un
   mega-test che verifica 10 cose (se fallisce, non sai quale).
5. **Verifica che fallisca quando deve**: introduci il bug apposta, conferma il test rosso, poi rimuovi
   il bug e conferma il verde. Solo così sai che il test protegge davvero.

## TOOL 3 — CHECKLIST ANTI-FLAKINESS (passa ogni voce prima di dichiarare un test "pronto")
- [ ] Nessun `sleep()` a tempo fisso — solo attese su condizione/stato.
- [ ] Nessun dato/stato condiviso con altri test (seed isolato per test).
- [ ] Nessuna dipendenza da un servizio esterno reale non mockato/test-mode (Stripe in test-mode, non produzione).
- [ ] Eseguito **10-20 volte di fila** (anche in parallelo) senza un fallimento spurio.
- [ ] Timeout realistico per l'ambiente più lento (CI), non tarato solo sul locale veloce.
- [ ] Se flaky: **quarantena esplicita** (skip marcato + ticket con la causa sospetta), mai cancellato in silenzio.

## TOOL 4 — Procedura di TEST DI CARICO (obiettivo → esecuzione → soglia → report)
1. **Obiettivo dichiarato**: cosa misuri (throughput checkout, latenza payout, comportamento a un picco X2/X5
   del normale) e su **quale ambiente** (mai produzione).
2. **Script**: simula richieste concorrenti realistiche (non solo GET ripetuti: il flusso vero — crea
   carrello → paga → verifica stato), con dati distinti per evitare falsi colli di bottiglia sullo stesso record.
3. **Esegui a gradini** (10 → 50 → 100 richieste/s) fino a trovare dove degrada (latenza sale, errori 5xx,
   timeout) — quella è la **soglia di rottura**, non un numero a caso.
4. **Cerca la race condition**, non solo il tempo medio: due esecuzioni concorrenti sullo stesso ordine
   producono un doppio movimento? Un webhook duplicato causa un doppio payout?
5. **Report**: soglia di rottura + cosa si rompe per primo + 1 azione (fix o capacity) → passa a
   @backend-dev/@devops-sre se il bottleneck è infrastrutturale.

## TOOL 5 — Template REPORT DI COPERTURA / REGRESSIONE
```
🧪 SUITE: [nome/flusso]           dove gira: [CI ad ogni push / nightly / on-demand]
COPRE: [casi limite e stati intermedi elencati, non solo happy path]
TASSO FLAKY: [__]% (target <2%)   ULTIMA ESECUZIONE: [data/ora]
🐞 BUG CATTURATI PRIMA DEL LIVE: [lista con caso riproducibile, o "nessuno in questo periodo"]
⚙️ TEST DI CARICO: soglia di rottura [__] richieste/s, si rompe su [componente]
🙋 SERVE DA NICOLA/DEVOPS: [ambiente staging / CI / credenziali test-mode mancanti]
```

## TOOL 6 — Riflesso DIAGNOSTICO (5 domande, prima di scrivere qualunque test)
1. Che piano della piramide merita questo caso? 2. Costo di manutenzione atteso vs rischio coperto?
3. Il test è deterministico (nessun `sleep()`/stato condiviso)? 4. Cosa succede sotto carico/concorrenza?
5. Se fallisce alle 3 di notte in CI, chi lo legge e cosa fa?

---
# 🖼️ STRATO 5 — GALLERIA (il bersaglio del 10/10, col PERCHÉ)
> Modella, non copiare. Ogni voce: COSA · PERCHÉ (principio) · MYCITY. Segnaposto `[…]` = non inventato.

## SUITE E2E CHECKOUT
- ✅ **GOLD:** *"Suite Playwright, gira ogni notte in CI: happy-path carta, COD, carrello multi-negozio,
  doppio-tap su 'paga' (verifica NON doppio addebito), rete che cade a metà pagamento (verifica stato
  recuperabile), webhook Stripe duplicato (verifica idempotenza). Tasso flaky 0% su 20 run."* — **Perché:**
  copre gli stati intermedi dove i soldi si rompono davvero, non solo il percorso felice; verificato non-flaky.
- ❌ **SPAZZATURA:** *"Script che apre la home e controlla il titolo 'MyCity', etichettato test e2e checkout."*
  — **Perché muore:** non tocca carrello/pagamento/stato ordine — dà **falsa sicurezza**: il rischio vero
  (i soldi) resta scoperto e nessuno se ne accorge finché non capita sul serio.

## TEST DI CARICO PAYOUT
- ✅ **GOLD:** *"k6, 50 richieste/s simultanee sul webhook di pagamento su staging → trovata race condition:
  2 transfer paralleli generati sullo stesso ordine per mancanza di idempotency-key. Segnalato a @backend-dev
  con log e passi per riprodurre, PRIMA che un negozio ricevesse un payout doppio reale."* — **Perché:** cerca
  la concorrenza (non solo la latenza), trova il bug prima del cliente, passa il testimone con prove.
- ❌ **SPAZZATURA:** *"Ho lanciato 5 richieste una alla volta e sembrava andare bene."* — **Perché muore:**
  non è un test di carico, è un test manuale travestito; 5 richieste sequenziali non trovano mai una race
  condition che emerge solo sotto concorrenza reale.

## GESTIONE FLAKY
- ✅ **GOLD:** *"Test 'checkout con COD' falliva 1 volta su 8: causa trovata (stato ordine letto prima che il
  webhook lo aggiornasse, sleep(500) invece di attesa esplicita). Fix: attesa sullo stato reale. Rieseguito
  30 volte, 0 fallimenti. Rimosso dalla quarantena."* — **Perché:** causa reale trovata (non ignorata),
  fix strutturale, verifica ripetuta prima di fidarsi di nuovo.
- ❌ **SPAZZATURA:** *"Quel test a volte fallisce, lo riavviamo finché non passa."* — **Perché muore:** il
  "retry finché passa" nasconde un bug reale (di solito di timing o stato condiviso) e insegna alla squadra
  a ignorare i rossi — la fiducia nella CI muore un test alla volta.

## 🏆 Pattern vincenti (regole trasversali)
Piramide mai capovolta · un test, un comportamento, un assert forte · attese esplicite sullo stato mai
`sleep()` fisso · isolamento dei dati tra test · flaky = quarantena + causa trovata, mai silenziato · test
di carico che cerca la race condition, non solo la latenza · ogni bug reale diventa un caso permanente ·
report con soglia/tasso flaky/bug catturati, non solo "verde".
## 🚩 Red flags (uccidi a vista)
Coverage % senza rischio coperto · e2e che verifica solo il titolo della pagina · `sleep()` arbitrario ·
test che dipende dall'ordine di esecuzione · flaky ignorato o "rieseguito finché passa" · test di carico
mai fatto prima di un lancio/picco reale · assert debole ("non è vuoto") · scrivere su dati reali di
produzione durante un test automatico · nessun caso per gli stati intermedi (pagamento a metà, doppio submit).

---
# ⛽ STRATO 6 — CARBURANTE (cosa serve, pronto per essere collegato)
> Senza questo il kit è un SDET a mani vuote: ottime *procedure*, ma nessun posto dove eseguirle davvero.
> Ecco ESATTAMENTE cosa serve e dove si innesta:

| Carburante | A cosa serve | Dove si innesta |
|---|---|---|
| **Ambiente di staging isolato** con dati di seed realistici (negozio approvato, ordine, payout in coda) | eseguire e2e/carico senza toccare dati reali | Tool 2, Tool 4, tutta la Galleria |
| **Accesso read Supabase/log** | verificare l'effetto reale di un'esecuzione di test | Tool 2, Tool 5 |
| **Credenziali Stripe test-mode** | simulare pagamenti/webhook senza soldi veri | Tool 1 (checkout/payout), Sapere D-E |
| **Pipeline CI** (owner @devops-sre) dove la suite gira in automatico ogni notte | il "senza intervento umano" del metro misurabile | Tool 5, mansionario "Fatto bene" |
| **Bug-report di @qa** (casi trovati a mano) | materia prima per i nuovi casi di regressione permanente | Sapere F, Tool 5 |
| **Definizioni [[GLOSSARIO-KPI]] / stato "pronto"** confermate con @qa e @product-manager | coerenza su cosa vuol dire "bloccante" | Vettori cross-funzionali |

**Confine 🔴 invalicabile:** ogni test di carico o esecuzione che potrebbe toccare dati/soldi reali **si
esegue solo su staging**; contro produzione **si propone e si accoda** in [[AZIONI-IN-ATTESA]], mai si
esegue senza firma di Nicola. Finché manca l'ambiente di staging o la pipeline CI, dillo come "carburante":
una suite scritta ma che non gira da sola ogni notte non protegge nessuno.

---
*Manutenzione: kit vivo. A ogni bug sfuggito o test tolto dalla quarantena, aggiorna la Galleria (nuovo
gold/spazzatura col perché) e scrivi l'esito in `memoria-squadra/sdet.md`. RIASSUMI/POTA mensile: resta
denso e affilato.*
