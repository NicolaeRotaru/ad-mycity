---
data: 2026-07-31 21:33
titolo: Glossario della macchina
per: Nicola
---

# 🧭 Glossario della macchina — guardiano, cancello, sentinella e tutto il resto

> Scritto il 2026-07-31 21:33 perché Nicola non aveva mai studiato la macchina e ha chiesto
> cosa vogliono dire le parole che legge ovunque nei file e nel Pannello.
> **Chi legge questo file non deve sapere niente di tecnico.** Ogni voce parte dal problema
> che risolve, non dal nome che ha.
>
> Lo stesso testo (parte 1) è appuntato nella Bacheca della home del Pannello.

---

## L'idea di fondo

Quasi tutte le parole strane della macchina sono **nomi di difese**.

Il motivo è uno solo: una macchina che lavora da sola ha due modi di fare danno —
**agire senza permesso** (spendere, scrivere a un cliente, pubblicare) e **raccontare una
bugia** (un numero inventato, un negozio che non esiste, un «fatto» che non è stato fatto).
Tutto il vocabolario qui sotto esiste per rendere difficili quelle due cose.

La domanda giusta davanti a ogni termine non è «cosa fa?», ma
**«da quale bugia o da quale sorpresa mi sta proteggendo?»**.

---

## Parte 1 — Le quattro parole che si confondono

Sembrano sinonimi. Non lo sono: **guardano cose diverse**.

| | 👁️ Sensore | 🛰️ Sentinella | 🛡️ Guardiano | 🚦 Cancello |
|---|---|---|---|---|
| **Cos'è** | Un occhio | Una sveglia | Un ispettore | Un esame all'uscita |
| **Cosa guarda** | Il mondo reale | I **dati del business** | Il **lavoro della macchina** | Il singolo lavoro che sta per uscire |
| **Quando** | Sempre, in lettura | Ogni minuto | A ogni giro | Prima di consegnare o pubblicare |
| **Se trova qualcosa** | Niente, riporta | Sveglia l'AD e accoda un lavoro | Segnala, e 36 di loro **fermano il giro** | **Blocca**: il lavoro non esce |
| **Quanti oggi** | 11 (fonte: `mappa-macchina.json`) | 10 attive | 157 script, 74 a ogni giro (fonte: `guardiani-check.mjs`) | 3 livelli |

### 👁️ Sensore — gli occhi
Un collegamento che legge la realtà: il database del marketplace, Stripe, PostHog, se il sito
risponde. Sola lettura, sempre.

Il concetto importante è il suo contrario: un sensore **cieco** (chiave scaduta, servizio giù).
Quando è cieco la macchina lo deve *dichiarare*, e le è vietato scrivere numeri nuovi.
La regola vera: **cieco e onesto vale più di sicuro e inventato.**

### 🛰️ Sentinella — la sveglia sul business
Gira ogni minuto e costa zero, perché è codice normale, non AI. Guarda soglie:

- ordine pagato ma senza payout da 24 ore → 🔴
- ordini giù del 30% rispetto alla media → 🟢
- recensione da 2 stelle o meno → 🟡
- negozio live fermo da 14 giorni → 🟡
- carrello abbandonato da più di 4 ore → 🟡

Quando una soglia scatta, sveglia l'AD e le mette in coda un lavoro.

> **Il pezzo furbo: guardare non costa, pensare costa.** Gli occhi vegliano gratis 24 ore su 24;
> l'AI si accende solo quando c'è davvero qualcosa. Tre freni la proteggono dallo spreco: non
> ripete lo stesso allarme per 6 ore, ha un tetto giornaliero, e rispetta la pausa del Pannello.
>
> **Una sentinella non può mai far partire un'azione reale**: accoda solo analisi e proposte.

Dove: `cervello/sentinelle.md` · `cervello/sentinella-dati.mjs`

### 🛡️ Guardiano — l'ispettore del lavoro
Qui c'è il salto: la sentinella guarda *il business*, il guardiano guarda **la macchina stessa**.
Sono la cosa che garantisce che quello che si legge nel Pannello sia vero.

Esempi reali, con le loro parole:

- `coerenza-fatti` — «Un fatto cambia in un posto solo. Se una copia vecchia resta in giro, la trova e ferma il giro.»
- `onesta-check` — cerca i **numeri orfani**: una cifra scritta senza fonte accanto non deve uscire.
- `firma-check` — «Nessuno script può scriversi da solo la firma di Nicola.»
- `chiusura-loop` — un reparto che dice FATTO deve lasciare l'esito scritto, altrimenti non conta.
- `spazzata-fratelli` — «L'hai risolto o hai curato una copia sola?»: cerca la stessa malattia negli altri punti.
- `prove-oneste` — impedisce a un difetto di nascere già chiuso, con una prova scritta apposta per essere verde.

Di 74 che girano a ogni giro, **36 hanno il potere di bloccarlo** (segnati ⛔ nella tabella).

Per vederli tutti: `node cervello/guardiani-check.mjs`

### 🚦 Cancello — l'esame prima di uscire
Non è un controllo automatico: è un **momento** in cui il lavoro si ferma e deve dimostrare di
meritarsi l'uscita. La regola d'ingaggio è brutale: *«dai per scontato che almeno un errore ci
sia, e trovalo»*.

- **L1** — checklist meccanica su tutto: ogni entità è reale? ogni numero ha una fonte? il colore è giusto?
- **L2** — sul lavoro rischioso parte un secondo agente **con l'unico compito di demolirlo**. Se trova un buco, **vince lui**.
- **L3** — sulle decisioni gravi, più revisori con lenti diverse (realtà, numeri, soldi, legale, *«tra un mese è andata male: perché?»*) e si vota.

Dove: `cervello/auto-analisi.md`

---

## Parte 2 — Le altre parole, per famiglie

### 🎨 Come la macchina tocca il mondo
- **I colori 🟢🟡🔴** — la regola madre. 🟢 reversibile → lo fa da sola. 🟡 impatto medio → lo fa e avvisa. 🔴 soldi, legale, irreversibile → **si ferma e aspetta la firma di Nicola**. Nel dubbio si sale di colore.
- **Mano** — un canale con cui la macchina *cambia* il mondo, non lo legge: email, Telegram, Instagram, Facebook, Google Business. Ce ne sono 5. Senza mani collegate l'azione resta pronta in coda: non si perde, semplicemente non parte.
- **Coda / azioni in attesa** — il mucchio delle cose pronte da firmare. Ogni card dice **«cosa cambia»** e **«se va bene»**: la conseguenza vera e il passo dopo.
- **Firma** — il sì di Nicola. È l'unica cosa che trasforma una proposta in un fatto.

### ⏱️ Il ritmo
- **Giro** — il ciclo di perlustrazione: legge i dati, controlla sentinelle e guardiani, scrive un briefing, aggiorna la memoria. È l'unità di lavoro base (spiegato nella Parte 4).
- **Cadenze** — piano del mattino (6:00), punto di mezzogiorno, report della sera (18:00), review del venerdì.
- **Worker / VPS** — le braccia: il server sempre acceso che esegue davvero. **È l'unico pezzo che fa succedere le cose.** Se dorme, tutto il resto è teoria.
- **Pannello / Cabina** — la faccia (l'app web). Non decide niente: mostra e raccoglie la firma. Se sparisse, la macchina continuerebbe a lavorare; si perderebbe solo la possibilità di vederla.

### 🔬 Come si controlla (oltre a guardiani e cancelli)
- **Radar** — il gemello esterno della sentinella: 50 fattori del mondo fuori (concorrenti, eventi, bandi, meteo). Sentinella = dentro, radar = fuori.
- **Prova** — il test che dimostra che un fix funziona.
- **Mutante / mutazione** — il concetto più raffinato della casa. Un test verde dimostra che il codice *gira*, non che la prova *serva*. Quindi si **rompe il fix apposta** e si pretende che il test diventi rosso. Se resta verde, quella prova non stava dimostrando niente. Vivono in `cervello/mutanti.json`.

### 🧠 Come impara
- **Lezione** — una cosa imparata, spesso da una correzione di Nicola (che vale doppio).
- **Gate su una lezione** — la ferita che la macchina si è auto-diagnosticata, scritta nel codice di `gate-veri.mjs`: *«269 volte Nicola ha corretto la macchina, e la difesa costruita è sempre stata una frase in un file. L'83% delle correzioni cade su un tema già visto.»* Da lì la regola: **una correzione non si chiude con una frase, si chiude con un freno che può fallire.**
- **Volano** — l'anello: lavora → si controlla → impara → si migliora → lavora meglio.
- **Cantiere e difetti (AR-001, AR-002, …)** — la lista dei difetti che la macchina ha trovato *in sé stessa*, ognuno con un codice progressivo.
- **Malattia** — non il singolo bug, ma il *tipo* di bug. Esempi veri da `cervello/malattie.json`: «un campo assente diventa uno zero, e lo zero rassicura», «un errore viene ingoiato e la schermata dice che va tutto bene», «si dichiara fatto ciò che nessuno ha confermato». Si ripara per malattia, non per conteggio — altrimenti si cura una copia e le sorelle restano.
- **Quaderno / chiusura del loop** — dopo ogni lavoro serio il reparto scrive cosa si aspettava e cosa è successo davvero. Lì si misura se la macchina ci prende.

### 📚 La verità e la memoria
- **Registro dei fatti** — una casa sola per ogni fatto-chiave (prezzi, date, negozio faro). Gli altri file lo **citano**. Se una copia vecchia resta in giro, il guardiano ferma il giro: *una copia vecchia è una bugia che il Pannello mostra a Nicola*.
- **Registro della realtà** — ogni negozio o persona nominata ha uno stato: **confermato** (è nei dati), **scelta ragionata** (non è nei dati, ma è una proposta motivata con prove — legittima), **da verificare** (nessun fondamento: questo è il vero «inventato», e blocca).
- **North Star** — il numero che conta davvero: ordini pagati, negozi vivi, margine. Se resta fermo mentre si accumula lavoro, un guardiano alza la voce.
- **Numero orfano** — una cifra senza fonte. Vietata.

---

## Parte 3 — Come si incastra, in pratica

```
   Sensori leggono il reale  →  Sentinelle vegliano le soglie (gratis, ogni minuto)
                                          ↓ soglia superata
                          il Worker sveglia l'AD e le accoda il lavoro
                                          ↓
                        l'AD lavora, delegando ai 120 senior
                                          ↓
        🚦 CANCELLO: il lavoro prova a demolirsi da solo (3 livelli)
                                          ↓
        🛡️ 74 GUARDIANI ispezionano il giro — 36 possono fermarlo
                                          ↓
     🟢 esce da solo   |   🟡 esce e avvisa   |   🔴 si ferma in coda → la FIRMA di Nicola
                                          ↓
                    quello che è andato storto diventa lezione
                    → e la lezione deve diventare un freno, non una frase
```

---

## Parte 4 — Il giro, passo per passo

Il **giro** è l'unità di lavoro della macchina: quello che fa quando nessuno le chiede niente.
Gira da solo sul VPS ogni due ore, e si può lanciare a mano dicendo **«fai un giro»**.

Non è un comando: è una **catena di montaggio** con un prima e un dopo.

### Prima che l'AD si svegli (nessun costo, tutto codice)
Lo script `cervello/giro.sh` prepara il campo. Due decisioni si prendono qui:

- **Delta-gate** — se dall'ultimo giro non è cambiato niente, il motore AI **non si accende**: gira solo la sonda leggera. Serve a non pagare dieci giri identici a vuoto.
- **Verifica dei sensori** — se gli occhi sono ciechi, all'AD arriva un vincolo duro: *niente numeri nuovi in questo giro*. La cecità viene dichiarata, non nascosta.

### I 15 passi dell'AD

| # | Passo | In una frase |
|---|---|---|
| 0 | Sensori e volano | Guarda con quali occhi sta lavorando e cosa non ha potuto vedere. |
| 1 | Dati reali | Ordini, incassi, clienti, consegne, carrelli, recensioni degli ultimi 7 giorni. Prima il canale REST, poi il collegamento di sessione, e se sono ciechi entrambi: nessun numero inventato. |
| 2 | Sentinelle | Controlla le soglie interne. Più l'autocontrollo dell'automazione: la macchina verifica sé stessa **prima** che Nicola se ne accorga. |
| 3 | Radar | Il mondo fuori, in due direzioni: cosa ci influenza (IN) e su cosa possiamo agire noi (OUT), seguendo anche le catene a due anelli. |
| 4 | Delega | Passa i numeri all'analista e le opportunità esterne all'intelligence. |
| 5 | Briefing | Scrive il rapporto in **11 sezioni** obbligatorie — inclusa l'ultima, che è la più importante: **«cosa NON ho potuto verificare»**. |
| 6 | Salva e pubblica | Briefing datato all'ora, aggiorna i 7 numeri in STATO, i tre file di Intelligence, il digest che alimenta le card del Pannello. |
| 7 | **Doer mode** | Esegue davvero i 🟢, e prepara i 🟡/🔴 **completi** — testo pronto, destinatario, canale — nella coda da firmare. Nessuna analisi di cosa si potrebbe fare: cose finite. |
| 8 | Sala operativa | Registra le mosse del giro, con l'ora, così la Cabina mostra cosa è successo. |
| 9 | Piani | Aggiorna i piani di Nicola **solo dentro un blocco marcato**: propone, non riscrive il suo testo. |
| 10 | Intenzioni di Nicola | Estrae dai piani cosa sta per fare *Nicola* (non la macchina) e cosa gli si può pre-preparare. |
| 11 | 🚦 **Cancello** | Auto-analisi a 3 livelli sul lavoro appena fatto. Se il file del verdetto non finisce su disco, **il giro è fallito**: la Cabina resterebbe vuota. |
| 12 | 📚 Apprendimento | Lezioni dalle 8 fonti, gusto di Nicola registrato, previsioni dichiarate con la CLI, loop chiusi nei quaderni. |
| 13 | 🚀 Auto-miglioramento | Solo sul lavoro importante: confronto coi migliori, varianti, torneo, peer-review. |
| 14 | 🩻 Sonda | Un controllo veloce su sé stessa e un passo avanti nel cantiere dei difetti. |
| 15 | 🧭 Coerenza dei fatti | Ultimo cancello: se un fatto è cambiato, va cambiato **ovunque nello stesso giro**. Il guardiano deve passare pulito prima di chiudere. |

### Dopo
I guardiani ispezionano il giro. Se uno dei 36 bloccanti trova qualcosa, **il giro non si pubblica**.
Se passa, la memoria finisce su `main` e il Pannello la mostra.

### Le tre cose da capire del giro
1. **Il giro non "risponde": consegna.** Ogni giro lascia dietro di sé artefatti veri, azioni pronte da firmare e memoria aggiornata.
2. **Il giro dichiara ciò che non sa.** La sezione Gap e i sensori ciechi valgono quanto i numeri trovati.
3. **Il giro si controlla da solo prima di uscire** (passi 11 e 15), e viene controllato dopo (i guardiani). Doppio strato apposta.

---

## Parte 5 — I livelli di comprensione

Il glossario è il **primo** livello, il giro il **secondo**. Da lì in poi:

| Livello | Cosa spiega | La domanda a cui risponde |
|---|---|---|
| 1 | **Il vocabolario** (Parti 1-3) | Cosa vogliono dire le parole. |
| 2 | **Il giro** (Parte 4) | Cosa fa la macchina quando nessuno le chiede niente. |
| 3 | **La squadra** — 120 senior, deleghe, owner unico per mandato, catene di reparti | Chi fa cosa, e perché non c'è un solo cervello che fa tutto. |
| 4 | **Il volano** — auto-analisi, auto-radiografia, apprendimento, auto-miglioramento | Come fa a diventare più brava invece di ripetere gli stessi errori. |
| 5 | **Il cantiere** — difetti su sé stessa, malattie, prove, mutazioni | Come si ripara da sola, e perché conta la malattia e non il conteggio. |
| 6 | **Le mani e i sensi** — cosa sa toccare del mondo reale, e cosa no | Qual è oggi il confine vero tra proposta ed esecuzione. |
| 7 | **L'economia della macchina** — costo AI, letargo, delta-gate, routing dei modelli | Quanto costa tenerla viva e come si difende dallo spreco. |

---

## Fotografia del 2026-07-31 21:33

- **74 guardiani a ogni giro, 36 bloccanti** · su 157 script totali — fonte: `guardiani-check.mjs`
- **120 senior · 11 sensori · 5 mani · 13 servizi sul VPS** — fonte: `mappa-macchina.json`
- **27 fatti-chiave** in memoria · **North Star: 0** ordini consegnati — fonte: `registro-fatti.json`
- **408 difetti** censiti su sé stessa: 167 aperti, 241 chiusi — fonte: `cantiere-difetti.json`
- **485 lezioni**, di cui 31 con un freno vero — fonte: `apprendimento.json`

**Fonti dei numeri** (eseguiti il 2026-07-31 21:33, sola lettura):
`node cervello/guardiani-check.mjs` (guardiani) · `auto-coscienza/mappa-macchina.json` (senior,
sensori, mani, servizi, script) · `auto-coscienza/cantiere-difetti.json` (difetti) ·
`auto-coscienza/apprendimento.json` (lezioni) · `registro-fatti.json` (fatti-chiave contati sul
registro, e `northstar.consegnati`).

> 🔎 **Stato dei controlli su questo file** (2026-07-31 21:33): `vault-sanita` verde ·
> `coerenza-fatti` verde · `peso-file-cabina` verde. `onesta-check` segnala 27 «numeri senza fonte»,
> ma sono date, orari e numeri didattici del testo («i 15 passi», «11 sezioni», perfino «AR-001»):
> il guardiano cerca claim di business e non sa distinguerli da un testo che spiega. È un guardiano
> che **avvisa e non ferma**, e qui va letto così.
>
> ⚠️ **Due numeri erano già stantii mentre scrivevo questo file**, ed è il modo migliore per capire
> perché la macchina è fatta così: la scheda «I guardiani della macchina» diceva **73** controlli
> quando ne giravano già **74**, e la mappa diceva **26** fatti-chiave quando nel registro erano già
> **27**. Nessuno dei due era una bugia intenzionale: erano fotografie vecchie di un giorno lasciate
> in un file vivo. Entrambi corretti il 2026-07-31 21:33. **È esattamente il mestiere del guardiano
> `coerenza-fatti`** — e la ragione per cui i numeri di questa fotografia vanno riletti dai comandi,
> non copiati a memoria.

---

## Se si dimentica tutto il resto, tre cose

1. **Sentinella guarda il business, guardiano guarda la macchina, cancello ferma il lavoro all'uscita, sensore è solo un occhio.** Le prime tre sono difese, l'ultima è un senso.
2. **Il colore comanda su tutto.** Nessun guardiano, nessuna sentinella e nessun automatismo può far partire un 🔴 al posto di Nicola.
3. **La macchina è progettata per non poter mentire più che per essere veloce.** Metà del codice non produce valore: impedisce di raccontare balle. È voluto.
