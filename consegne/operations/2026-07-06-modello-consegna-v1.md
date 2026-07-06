---
tipo: modello-operativo
titolo: Il Modello di consegna v1 — chi porta gli ordini da qui a 10 negozi
data: 2026-07-06 14:10
owner: operations (con cappello rider-fleet + dispatch)
stato: bozza 🟢 — diventa operativa solo con le firme di Nicola elencate in fondo
fonti: MyCity-Vault/90-Memoria-AI/STATO.md (4/7 11:30) · MyCity-Vault/04-Prodotto-Ops/Operazioni & Logistica.md · MyCity-Vault/04-Prodotto-Ops/Aree/Area - Consegna.md · MyCity-Vault/05-Soldi-Rischi/Finanza & Unit Economics.md · cervello/sentinella-dati.mjs + pannello/src/lib/marketplace-db.ts (campi reali di `orders`)
riferimento: Piano della Piramide, Fase 1 mossa 2 (consegne/strategia/2026-07-06-piano-piramide-infrastruttura-completa.md)
---

# 🚲 Il Modello di consegna v1

> **In una frase:** oggi consegna Nicola a mano e va bene per la prima consegna della storia —
> ma il Piano della Piramide non può reggersi sulle sue gambe (regola 5). Questo documento dice
> **chi consegna da qui a 10 negozi, a quale costo per consegna e con quale copertura oraria**,
> con il trigger numerico che fa scattare il passaggio da un'opzione all'altra.

---

## La domanda a cui risponde questo documento

**CHI consegna gli ordini MyCity da qui a 10 negozi, a quale costo per consegna, con quale
copertura oraria — senza che tutto poggi sulle gambe di Nicola?**

Il metro della risposta viene dal cancello d'uscita della Fase 1 del Piano: ≥10 negozi confermati,
ordini/settimana >0 stabili per 4 settimane, **costo per consegna misurato** (non stimato).

### Da dove partiamo (i numeri veri, non le speranze)

| Dato | Valore | Fonte |
|---|---|---|
| Negozi reali approvati | **1** (Pane Quotidiano, Via Calzolai 25) | STATO.md, baseline REST 4/7 11:30 |
| Ordini creati nella storia | **1** (contrassegno €19,05, del 24/6) | STATO.md |
| Ordini consegnati | **0** (il #16 è "in consegna", mani di Nicola) | STATO.md |
| Clienti registrati | 23 profili (4 buyer veri) | STATO.md |
| Chi consegna oggi | Nicola, a piedi/bici, quando può | STATO.md (azioni #21–#22) |
| Costo per consegna misurato | **nessuno** — mai avvenuta una consegna | STATO.md (0 delivered) |

**Scala coperta da questo v1: 0 → ~10 ordini/settimana.** Sopra quella soglia il vault ha già il
modello successivo (batching con cargo-bike, cut-off 21:00 → consegna il giorno dopo, micro-hub:
`Operazioni & Logistica.md`) — questo documento è il ponte che ci porta fin lì senza bruciare
Nicola né il margine.

### Le definizioni (una sola verità, valida per tutti i reparti)
- **Consegnato** = `delivered_at` valorizzato su `orders` (non "il cliente probabilmente l'ha ricevuto").
- **In ritardo** = `expected_delivery` superata e `delivered_at` ancora vuoto (è già la sentinella
  "ordini oltre lo slot" in `cervello/sentinella-dati.mjs`).
- **Costo per consegna** = costo vivo del recapito di UN ordine (tempo + mezzo + eventuale compenso),
  escluse le commissioni piattaforma. Come si misura: sezione «Come misuriamo il costo» sotto.

---

## Le quattro opzioni sul tavolo (per la scala 0→10 ordini/settimana)

> ⚠️ **Onestà sui numeri:** a oggi NON esiste un costo per consegna reale (0 consegne completate).
> Tutte le cifre sotto sono **formule con segnaposto dichiarati** o assunzioni del vault marcate 🟡
> (`Finanza & Unit Economics.md`). La prima consegna vera (#16) sarà il primo dato reale.

### Opzione A — Nicola consegna, ma con un tetto scritto (l'interim dichiarato)

**Come funziona.** Nicola resta il fattorino, ma smette di esserlo "per default e senza limiti":
si dichiara un **tetto settimanale** e delle **finestre orarie fisse** (proposta da firmare:
max **5 consegne/settimana**, in 2 finestre — es. 12:30–13:30 e 18:30–19:30, quando è già in giro).
L'ordine fuori finestra slitta alla finestra successiva, e il cliente lo sa dal checkout
(la promessa scritta vale più della promessa veloce: `expected_delivery` si imposta sulla finestra).

**Costo per consegna (formula).**
`costo = (minuti_porta_a_porta ÷ 60 × valore_ora_Nicola) + (km × costo_km)` — tutti e tre i
segnaposto sono da misurare/decidere: `minuti_porta_a_porta` esce dalla consegna #16 (primo dato
reale), `valore_ora_Nicola` lo fissa Nicola (è il costo-ombra del suo tempo, oggi contabilizzato €0
— che è esattamente il modo in cui il costo resta invisibile e il modello sembra gratis),
`costo_km` ≈ 0 a piedi/bici.

**Pro.** Zero cassa in uscita · qualità del contatto altissima (il fondatore alla porta del primo
cliente è marketing, non solo logistica) · nessun terzo da coordinare · parte domani.

**Contro.** Bus factor 1 (già nel pre-mortem del Piano, rischio 9: «l'unico umano si assenta») ·
il costo vero è nascosto (il tempo di Nicola vale più di qualunque rider) · copertura oraria = la
sua agenda · **è la cosa che il Piano dice di smontare** (regola 5) · lo stallo di 10 giorni
sull'ordine #16 è la prova empirica del limite: 4 finestre di consegna saltate (STATO.md).

**Quando smette di reggere.** Al superamento del tetto firmato per 2 settimane di fila, o alla
prima assenza >3 giorni di Nicola con ordini in coda. In numeri: **>5 ordini/settimana per 2
settimane consecutive → si attiva l'opzione successiva** (il valore 5 è la proposta, la firma è sua).

### Opzione B — Il negoziante consegna nel suo quartiere

**Come funziona.** Per gli ordini mono-negozio (oggi il 100%: c'è UN negozio), il negoziante
consegna lui nel raggio breve (proposta: entro ~1 km dalla bottega), negli orari morti tra i picchi.
MyCity gli gira la fee di consegna pagata dal cliente: campo reale `delivery_fee_cents` su `orders`.
Per Pane Quotidiano è naturale: il pane si consegna in mattinata, quando la produzione è finita.

**Costo per consegna (formula).**
`costo_MyCity = fee_girata_al_negoziante` = `delivery_fee_cents` dell'ordine (assunzione vault 🟡:
€3,50 — da confermare come fee reale al checkout). Per MyCity il costo variabile è ~zero: la fee
incassata dal cliente transita al negoziante. Il margine di contribuzione perde la quota-fee
(~30% dei ricavi Anno 1 nel mix del vault 🟡) ma non esce cassa.

**Pro.** Scala con i negozi (ogni bottega copre il suo quartiere) · zero cassa MyCity · il
negoziante che consegna conosce i suoi clienti (retention) · toglie Nicola dal giro subito.

**Contro.** ⚠️ Il vault lo boccia **come modello di lungo periodo**: «il modello "negozio consegna"
è incompatibile col carrello multi-bottega» (`Operazioni & Logistica.md`) — 5 negozi non consegnano
alla stessa porta. Vale quindi SOLO finché gli ordini sono mono-negozio · qualità/puntualità fuori
dal nostro controllo (serve lo stato "consegnato" segnato dal negoziante, e la sentinella che
verifica) · non tutti i negozianti vorranno/potranno.

**Quando smette di reggere.** Al primo carrello multi-bottega reale, o quando i negozi attivi in
consegna sono ≥3 e le promesse orarie iniziano a divergere (ogni bottega il suo orario = esperienza
cliente incoerente). In numeri: **≥1 ordine multi-negozio/settimana o ≥3 negozi in consegna → serve
il giro unificato** (opzione C o il batching del vault).

### Opzione C — Un rider a chiamata (part-time, a turni brevi)

**Come funziona.** Una persona pagata a turno breve (proposta: 2 ore) nelle finestre a domanda
(pranzo e/o fine pomeriggio), solo nei giorni con ordini in coda — il turno si accende al cut-off,
non è fisso. In bici/cargo-bike: l'accesso alla zona a traffico limitato coi mezzi elettrici 8–19 è
già mappato nel vault (`Operazioni & Logistica.md`).

**Costo per consegna (formula).**
`costo = (paga_oraria × ore_turno + costi_mezzo) ÷ consegne_nel_turno` — `paga_oraria` è la scelta
🔴 di Nicola (segnaposto: da CCNL/voucher/prestazione occasionale, il vault stesso segna «costo
rider reale post-CCNL» tra i dati critici da raccogliere); il vault assume 🟡 €7/giro come costo
rider. La matematica del vault (`Finanza & Unit Economics.md` 🟡) è spietata e va detta intera:
**a 1 ordine/giro il margine di contribuzione è negativo (−€0,07), a 2 ordini/giro è +€3,43** →
regola operativa già scritta nel vault: **≥2 ordini/giro o non esci** (si accumula al giorno dopo).

**Pro.** Toglie Nicola dal giro davvero · copertura oraria promettibile al cliente (le finestre
diventano contrattuali, non "quando passo") · è il primo mattone del modello a regime (rider →
batching → cluster) · il costo diventa un numero vero in fattura, non un costo-ombra.

**Contro.** Prima uscita di cassa vera (🔴 budget da firmare) · sotto ~2 ordini/giro perde soldi
ordine per ordine · trovare una persona affidabile per 2-4 turni/settimana richiede tempo ·
inquadramento da verificare con @legale-privacy prima dell'ingaggio.

**Quando smette di reggere.** Verso l'alto: quando la domanda supera ~10 ordini/giorno nel cluster
serve il modello vault completo (batching + micro-hub; soglia già scritta in
`Operazioni & Logistica.md`). Verso il basso: **se per 4 settimane il rider esce con <2 ordini/giro
di media, il turno brucia cassa → si torna a B/D e si riaccende più avanti.**

### Opzione D — Il ritiro in bottega (l'ordine che si consegna da solo)

**Come funziona.** Il cliente ordina online e **ritira in negozio** in una finestra concordata.
Non è una consegna: è la valvola di sfogo che rende ogni altra opzione più robusta — l'ordine
fuori finestra, fuori zona, o nel giorno in cui Nicola/il rider non c'è, non muore: diventa ritiro.
Il centro di Piacenza è compatto e i clienti passano già davanti alle botteghe.

**Costo per consegna (formula).** `costo ≈ €0` variabile per MyCity (il costo è la rinuncia alla
fee di consegna: `delivery_fee_cents = 0` sull'ordine). Il costo vero è di prodotto: la UI del
checkout deve offrire l'opzione (verifica con @frontend-dev/@product-manager se già esiste).

**Pro.** Zero costo marginale · zero dipendenza da chiunque · porta il cliente IN bottega (il
negoziante lo ama: vende altro al banco) · attivo anche quando tutto il resto è spento.

**Contro.** Non è la promessa di MyCity («il prodotto arriva vicino e in fretta» — `Area -
Consegna.md`): da solo non basta, è un complemento · sposta la fatica sul cliente · niente fee di
consegna nel mix ricavi.

**Quando smette di reggere.** Mai del tutto — resta come opzione permanente. Ma se >50% degli
ordini sceglie il ritiro, il segnale è che la consegna promessa non è credibile (prezzo o finestre
sbagliate), e va letto come allarme, non come successo.

---

## La mia raccomandazione (una sola, motivata)

**Per la fase attuale: A + D subito, B appena Pane Quotidiano ci sta, C solo a trigger scattato.**

In concreto, il modello v1 che propongo di firmare:

1. **Da oggi:** Nicola-interim **con tetto scritto** (proposta: max 5 consegne/settimana, 2 finestre
   fisse) + **ritiro in bottega sempre offerto** come alternativa nel checkout. Il tetto trasforma
   l'interim da abitudine invisibile a scelta misurata con una scadenza.
2. **Al primo check-in con Pane Quotidiano** (comunque entro l'onboarding dei negozi post-9/7):
   proporre al negoziante la **consegna di quartiere** con fee girata (opzione B) per gli ordini
   mono-bottega in mattinata. È il primo passo che toglie consegne a Nicola senza spendere.
3. **Trigger per il rider a chiamata (opzione C):** **ordini/settimana >5 per 2 settimane
   consecutive** (misura: conteggio `orders` via REST, la stessa firma settimanale del giro)
   **oppure** primo ordine multi-negozio **oppure** assenza di Nicola >3 giorni con ordini in coda.
   Al trigger, si porta a Nicola la proposta di budget già pronta (vedi elenco firme).
4. **Uscita dal v1:** sopra ~10 ordini/giorno nel cluster si passa al modello vault completo
   (cut-off 21:00, batching, cargo-bike, micro-hub) — già scritto, non va reinventato.

**Perché così e non altrimenti.** (i) Con 1 ordine nella storia, pagare un rider oggi significa
uscire con 0-1 consegne/turno = margine negativo certo (tabella vault 🟡): il costo fisso si accende
solo quando la densità lo ripaga. (ii) L'opzione B da sola non regge il futuro multi-bottega, ma
alla scala attuale (1 negozio, ordini mono-bottega per definizione) è esattamente giusta. (iii) Il
tetto sull'interim è il pezzo che mancava: senza numero scritto, "Nicola consegna" resta per sempre
— lo stallo di 10 giorni del #16 lo dimostra. (iv) D costa zero e toglie pressione a tutto.

**Confidenza:** alta sulla struttura (poggia sui documenti vault e sui vincoli reali), dichiaratamente
bassa sui numeri di costo — che infatti non firmo: li misureremo dalle prime consegne vere.

---

## Come misuriamo il costo per consegna dai dati reali

### I campi che esistono già su `orders` (Supabase REST — verificati nel codice)

| Campo | A cosa serve nel modello | Dove l'ho verificato |
|---|---|---|
| `created_at` | inizio del percorso ordine | `cervello/sentinella-dati.mjs` |
| `expected_delivery` | la promessa (finestra) fatta al cliente | `sentinella-dati.mjs` (sentinella slot scaduto) |
| `delivered_at` | la verità sulla consegna (vuoto = non consegnato) | `sentinella-dati.mjs` |
| `delivery_fee_cents` | fee incassata dal cliente → costo dell'opzione B | `pannello/src/lib/marketplace-db.ts` |
| `payment_status` · `payment_method` | contrassegno vs pagato online (il COD chiude solo alla porta) | `sentinella-dati.mjs` |
| `seller_id` · `delivery_address` (+lat/lng) | densità per bottega e per via → decide quando batchare | schema confermato 27/6 (`consegne/strategia/2026-06-27-piano-costruzione-analisi.md`) + `consegne/bonifica/sql/111` |
| `application_fee_cents` · `seller_payout_cents` | margine di contribuzione per ordine | schema confermato 27/6 |

Con questi campi si misurano **già oggi**: tempo promessa→consegna (`delivered_at − created_at`),
puntualità (`delivered_at ≤ expected_delivery`), ricavo-fee per ordine. 

### Cosa manca oggi per il costo VERO (il buco da chiudere)

1. **Chi ha consegnato** — non c'è un campo `consegnato_da` (Nicola / negoziante / rider / ritiro).
   Senza, il costo non è attribuibile all'opzione. *(Nota: `consegne/bonifica/sql/111` mostra che un
   ruolo rider con "claim" dell'ordine è già previsto nel DB — da verificare con @backend-dev se
   basta o va esteso.)*
2. **Il momento del ritiro in bottega** (`picked_up_at`) — separa "negozio lento" da "consegna lenta":
   senza, ogni ritardo è un'accusa cieca.
3. **Il costo vivo della consegna** (`costo_consegna_cents`: compenso rider, o fee girata al
   negoziante, o 0 per ritiro) — è LA colonna che rende il costo per consegna una query e non una stima.
4. **Ponte immediato, senza toccare il DB:** finché i campi non esistono, un **registro consegne
   manuale** (data · ordine · chi · minuti porta-a-porta · km · costo) tenuto in
   `consegne/operations/registro-consegne.md` a partire dalla #16. Tre righe a consegna, e il
   cancello di Fase 1 «costo per consegna misurato» diventa passabile.

La modifica schema (punti 1–3) è lavoro 🟡 di @backend-dev in branch, da proporre SOLO quando
l'opzione firmata la richiede (per A+D basta il registro manuale).

---

## Le firme che servono a Nicola (pronte da accodare, nessuna eseguita)

> Nessuna di queste è partita: sono le scelte 🔴/🟡 che rendono operativo il modello.

1. 🔴 **Scegli il modello di consegna per questa fase** — la mia raccomandazione: Nicola-interim
   col tetto + ritiro in bottega, negoziante-di-quartiere appena possibile, rider solo a trigger.
   *Cosa cambia:* da «consegna Nicola quando può» a un modello scritto con un'uscita automatica.
   *Se va bene:* ogni ordine da qui a 10 negozi ha un consegnatore previsto e un costo misurato.
2. 🔴 **Firma il tuo tetto da fattorino** — quante consegne/settimana al massimo (proposta: 5) e in
   quali 2 finestre orarie. *Cosa cambia:* il tuo tempo smette di essere il buffer infinito del
   sistema. *Se va bene:* al primo sforamento scatta la proposta rider già pronta, non un'emergenza.
3. 🔴 **Metti un tetto di budget per il rider a chiamata** (si spende SOLO a trigger scattato —
   segnaposto da decidere: €/mese massimo e paga per turno; prima dell'ingaggio passa da
   @legale-privacy per l'inquadramento). *Cosa cambia:* quando gli ordini superano il tuo tetto,
   la consegna non si ferma. *Se va bene:* il primo turno rider esce con ≥2 ordini e margine positivo.
4. 🔴 **Conferma la fee di consegna al cliente** — il €3,50 in `Finanza & Unit Economics.md` è
   un'assunzione 🟡, non un prezzo deciso; ed è anche la cifra da girare al negoziante nell'opzione B.
   *Cosa cambia:* la fee smette di essere un numero di foglio di calcolo e diventa il prezzo vero al
   checkout. *Se va bene:* il conto del margine per ordine si fa coi numeri veri.
5. 🟡 **Alla consegna del #16, dammi i due numeri veri:** minuti porta-a-porta e km. *Cosa cambia:*
   il primo costo per consegna della storia di MyCity, misurato e non stimato. *Se va bene:* le
   formule di questo documento si riempiono con dati reali e il cancello di Fase 1 si avvicina.

---

*Scritto dal senior operations il 2026-07-06 14:10 su mandato del Piano della Piramide (Fase 1,
mossa 2). Documento 🟢: nessuna azione reale eseguita, nessun messaggio inviato, nessun numero
inventato — ogni cifra ha la fonte accanto, ogni segnaposto è dichiarato.*
