---
data: 2026-08-01 10:54
titolo: Glossario della macchina
per: Nicola
---

# 🧭 Glossario della macchina — tutte le parole, per famiglie

> **Versione 2 — 2026-08-01 10:54.** La prima versione (31/7) spiegava le parole delle *difese*:
> guardiano, cancello, sentinella, sensore. Bastava per leggere il Pannello, non per leggere il
> lavoro: Nicola ha chiesto due volte di fila parole che **non c'erano** — *pavimento, tetto,
> potatore, freno, aggancio, regressione, lotto, spazzata, sonda, watch-main*. Erano tutte parole
> del **come si ripara**, cioè metà del vocabolario. Questa versione le contiene tutte.
>
> **Chi legge questo file non deve sapere niente di tecnico.** Ogni voce parte dal problema che
> risolve, non dal nome che ha. Lo stesso testo è appuntato nella Bacheca della home del Pannello.

---

## L'idea di fondo

Quasi nessuna di queste parole descrive **come si fa** una cosa. Descrivono **come si dimostra di
averla fatta**.

Il motivo è uno solo: una macchina che lavora da sola ha due modi di fare danno — **agire senza
permesso** (spendere, scrivere a un cliente, pubblicare) e **raccontare una bugia** (un numero
inventato, un negozio che non esiste, un «fatto» che non è stato fatto). Tutto il vocabolario qui
sotto esiste per rendere difficili quelle due cose.

La domanda giusta davanti a ogni termine non è «cosa fa?», ma
**«da quale bugia o da quale sorpresa mi sta proteggendo?»**.

---

## Parte 1 — Le difese: chi guarda cosa

Sembrano sinonimi. Non lo sono: **guardano cose diverse**.

| | 👁️ Sensore | 🛰️ Sentinella | 📡 Radar | 🛡️ Guardiano | 🚦 Cancello |
|---|---|---|---|---|---|
| **Cos'è** | Un occhio | Una sveglia | Un orecchio sul mondo | Un ispettore | Un esame all'uscita |
| **Cosa guarda** | Il reale | I **dati del business** | Il mondo **fuori** | La **macchina stessa** | Il singolo lavoro |
| **Quando** | Sempre, in lettura | Ogni minuto | A ogni giro | A ogni giro | Prima di consegnare |
| **Se trova** | Riporta e basta | Sveglia l'AD | Accoda un'occasione | Segnala, e 36 fermano il giro | **Blocca**: non esce |
| **Quanti** | 11 | 10 attive | ~50 fattori | 74 a ogni giro | 3 livelli |

### 👁️ Sensore — gli occhi
Un collegamento che legge la realtà, **sola lettura, sempre**. Gli 11, col loro nome:
`supabase_rest` · `mcp_supabase` · `supabase_memoria` · `stripe_api` · `posthog_api` ·
`resend_api` · `telegram_bot` · `n8n_health` · `sito_uptime` · `pannello_uptime` · `watchdog_esterno`.

Il concetto importante è il suo contrario: un sensore **cieco** (chiave scaduta, servizio giù).
Quando è cieco la macchina lo deve *dichiarare*, e le è vietato scrivere numeri nuovi.
La regola vera: **cieco e onesto vale più di sicuro e inventato.**

E una distinzione che sembra un dettaglio e non lo è — **spento ≠ non configurato**: *«non
configurato» è una parola sola per due situazioni opposte*: mai collegato (una scelta) e si è
rotto (un guasto). Confonderle nasconde un guasto dietro una scelta.

### 🛰️ Sentinella — la sveglia sul business
Gira ogni minuto e **costa zero**, perché è codice normale, non AI. Guarda soglie: ordine pagato
senza payout da 24 ore → 🔴 · ordini giù del 30% → 🟢 · recensione ≤ 2 stelle → 🟡 · negozio live
fermo da 14 giorni → 🟡 · carrello abbandonato da più di 4 ore → 🟡.

> **Il pezzo furbo: guardare non costa, pensare costa.** Gli occhi vegliano gratis 24 ore su 24;
> l'AI si accende solo quando c'è davvero qualcosa. Tre freni la proteggono dallo spreco: non
> ripete lo stesso allarme per 6 ore, ha un tetto giornaliero, e rispetta la pausa del Pannello.
>
> **Una sentinella non può mai far partire un'azione reale**: accoda solo analisi e proposte.

### 📡 Radar — l'orecchio sul mondo
Il gemello esterno della sentinella: ~50 fattori del mondo fuori (concorrenti, eventi, bandi,
meteo, stampa locale), in due direzioni — **IN** (cosa ci influenza) e **OUT** (su cosa possiamo
agire noi). Sentinella = dentro, radar = fuori.

### 🛡️ Guardiano — l'ispettore del lavoro
Qui c'è il salto: la sentinella guarda *il business*, il guardiano guarda **la macchina stessa**.
Sono la cosa che garantisce che quello che si legge nel Pannello sia vero. Vivono in **famiglie**:

| Famiglia | Cosa protegge | Esempi, con le loro parole |
|---|---|---|
| **numeri-veri** | Che nessun numero sia inventato | `onesta-check` — cerca i **numeri orfani** · `coerenza-fatti` — «un fatto cambia in un posto solo» |
| **rotta** | Che lo sforzo vada dove conta | `north-star-check` · `allocazione-check` — niente lavoro pesante su chi non ha firmato |
| **apprendimento** | Che imparare non sia accumulare | `chiusura-loop` · `gate-veri` · `tasso-lezioni` |
| **cantiere** | Che un difetto non nasca già chiuso | `prove-oneste` · `cantiere-prove` · `auto-fix` |
| **sicurezza** | Che niente esca senza controllo | `scan-segreti` · `porte-check` · `firma-check` — «nessuno script si scrive da solo la firma di Nicola» |
| **squadra** | Che i 120 senior siano veri | `agent-registry-check` · `keyword-owner-check` · `stampo-check` |
| **soldi-macchina** | Che la spesa AI non scappi | `freno-costi` · `costo-ai` · `sentinella-budget` |
| **tempo** | Che niente scada o dorma | `scadenzario-check` · `pausa-check` · `guardiano-tempo` |
| **test** | Che le prove girino davvero | `test-cervello` · `test-pannello` · `verifica-avversariale` |
| **mani** | Che quel che deve arrivare, arrivi | `notifica-approvazioni` · `avviso-telegram` · `retry-policy` |

Di 74 che girano a ogni giro, **36 hanno il potere di bloccarlo**. Per vederli tutti:
`node cervello/guardiani-check.mjs`

### 🚦 Cancello — l'esame prima di uscire
Non è un controllo automatico: è un **momento** in cui il lavoro si ferma e deve dimostrare di
meritarsi l'uscita. La regola d'ingaggio è brutale: *«dai per scontato che almeno un errore ci
sia, e trovalo»*.

- **L1** — checklist meccanica su tutto: ogni entità è reale? ogni numero ha una fonte? il colore è giusto?
- **L2** — sul lavoro rischioso parte un secondo agente **con l'unico compito di demolirlo**. Se trova un buco, **vince lui**.
- **L3** — sulle decisioni gravi, più revisori con lenti diverse (realtà, numeri, soldi, legale, *«tra un mese è andata male: perché?»*) e si vota.

### Le due difese che sorvegliano le difese
- **🧭 Guardia viva** — *«un verdetto che non arriva a nessuna decisione non è una protezione»*.
  Cerca i controlli **costruiti e che non mette di guardia nessuno**: esistono, girano, e il loro
  «no» non ferma niente.
- **👁️ Sorvegliante** — la revisione che gira **mentre** si lavora, non alla fine. Nata da una frase
  di Nicola (30/7): *«ogni volta che ti chiedo di ricontrollare il lavoro fatto trovi problemi che
  tu stesso hai creato risolvendo i difetti»*.

---

## Parte 2 — I limiti: pavimento, tetto, freno

- **PAVIMENTO** — il **minimo garantito**, il numero sotto cui non si scende. La trappola: un
  pavimento *fisso* invecchia nel verso sbagliato e smette di misurare. Caso vero: i kit dei senior
  erano misurati con un pavimento di 5.200 byte, scelto **82 byte sotto il file più piccolo** —
  nessun kit poteva essere bocciato. Oggi la soglia è *relativa al parco*: se i kit migliorano,
  sale da sola. (Fuori dalla macchina vale uguale: il pavimento della fee di consegna è il costo
  reale, sotto quello ogni consegna **brucia** margine.)
- **TETTO** — ha **due significati opposti**:
  1. **tetto-limite** — il massimo di magagne tollerate, che **scende quando curi e non si alza
     mai** (`tetti-lotto.json`, `malattie.json`, `tetti-archivio.mjs`). Non è un permesso: è un
     **debito misurato**. Aggiungerne una è una violazione, portarne via è il lavoro.
  2. **tetto-di-qualità** — il livello massimo raggiungibile col carburante che c'è.
     *«Alza il tetto, non abbassare lo standard.»*
- **SOGLIA** — il numero oltre cui scatta qualcosa. Se non può mai essere superata **non è una
  soglia**: *«un tetto mai superato è indistinguibile da un tetto che non c'è»*.
- **FRENO** — un **impedimento che scatta da solo**, l'opposto di un promemoria. È la parola-madre
  di tutta la casa. Il conto di non averlo capito, scritto nel codice di `gate-veri.mjs`:
  **269 correzioni di Nicola, 0 freni costruiti, 83% delle correzioni su un tema già visto.**
  Due regole: il freno va **sull'atto, non sul punto d'ingresso** (altrimenti il bug torna da
  un'altra strada), e *un freno che non si può provare è come non averlo*.

---

## Parte 3 — Il cantiere: le parole della riparazione

| Parola | Significato |
|---|---|
| **Cantiere** | La lista dei difetti che la macchina ha trovato **in sé stessa**. |
| **Difetto / AR-001, AR-002…** | Un guasto censito, con codice progressivo, causa radice e prova. |
| **Scheda** | Il record del difetto: cos'è, com'è nato, come si prova che è chiuso. |
| **Bloccante** | Il difetto che impedisce di dire sana quella parte. Si chiude per primo. |
| **Lotto** | Il gruppo di difetti curati insieme perché **condividono la malattia**. *Il lotto è grande quanto la malattia.* |
| **Malattia** | Non il singolo bug: la **forma** di bug che si ripete. |
| **Fratelli** | Le altre istanze della stessa malattia, altrove. |
| **Spazzata** | La caccia ai fratelli: *«l'hai risolto, o hai curato una copia sola?»* |
| **Causa radice** | Il punto da cui il guasto nasce davvero. Ci si arriva alla **quinta domanda**, non alla prima. |
| **Nascita** | Come è nato: `scoperta` (c'era già) · `regressione` (l'ho causata io) · `nuovo-lavoro`. |
| **Regressione** | Rottura nuova: **blocca subito**. E deve dire **da cosa**: *«una regressione senza il suo autore è una confessione senza reato»*. |
| **Debito ereditato** | Le magagne vecchie: si **misurano** sotto un tetto che scende, non bloccano. |
| **Prova** | Il test che dimostra che il fix funziona. |
| **Forma della prova** | Quali forme possono chiudere un difetto. Una casa sola, così non se ne inventano di nuove. |
| **Mutazione / mutante** | Si **rompe il fix apposta** e si pretende il rosso. |
| **Prove oneste** | Impedisce a un difetto di **nascere già chiuso**. |
| **Cantiere-prove** | Smaschera i difetti che nessun automatismo potrà mai chiudere. |
| **Auto-fix** | Chiude i difetti la cui prova è diventata verde **per un fix vero**, e lascia gli altri aperti. |
| **Cancello del lotto** | Il comando unico che dice se il lavoro si può consegnare: prove + guardiani + typecheck. |

### Le tre qualità di una prova
1. **Comportamentale** (buona) — esegue il codice e pretende il comportamento giusto.
2. **A comando / a pattern** (debole) — controlla che un file *contenga* una stringa. Certifica che
   una cosa **esiste**, non che **funziona**: è *«la malattia che questa casa cura da trentacinque lotti»*.
3. **Con OR** (peggiore) — condizioni in alternativa: passa quasi sempre, quindi non dice niente.

### Mutazione — il concetto più raffinato della casa
Un test verde dimostra che il codice *gira*, non che la prova *serva*. Quindi si **rompe il fix
apposta** e si pretende che il test diventi **rosso**. Se resta verde, quella prova non stava
dimostrando niente.

Prima si faceva a mano, con script buttati in `/tmp` e persi a fine sessione: *«il controllo più
prezioso del metodo era l'unico senza memoria»*. Ora vive in `cervello/mutanti.json` ed è un
comando. Due mutazioni diverse, stessa domanda («e se tornasse?»): sui **difetti** si rompe il fix
e deve diventare rosso il *test*; sui **gate** si rimette l'errore e deve diventare rosso il *gate*.

### Spazzata — perché esiste, coi precedenti veri
Nasce da una domanda di Nicola (28/7). Un test che passa dimostra **una** cosa: che quel punto
adesso funziona. Il registro dei precedenti è impietoso:

- **lotto 1** — corretta la data grezza in un file, **lasciata** in quello accanto. Proprio nel lotto nato per impedire le chiusure false.
- **lotto 3** — cinque script pubblicavano, **uno solo** aveva il cancello.
- **lotto 4** — cinque copie della stessa scrittura non atomica.
- **lotto 10** — il freno costi aveva **tre** buchi nello stesso blocco, non uno.

Quindi: **un difetto non è chiuso quando quel punto guarisce, è chiuso quando la malattia smette
di potersi ripresentare.** La spazzata nasce **verde** di proposito (la linea di partenza è il
numero di oggi): *un cancello che nasce rosso su venti file viene disattivato entro la settimana;
uno che nasce verde becca il primo che sporca.*

### Le 7 malattie censite, col loro nome vero
1. **L'esito di un guardiano finisce in una pipe e sparisce**
2. **Un campo assente diventa uno zero, e lo zero rassicura**
3. **Un errore viene ingoiato e la schermata dice che va tutto bene**
4. **Si dichiara «fatto» ciò che nessuno ha confermato**
5. **Una cadenza si costruisce da sé le protezioni invece di ereditarle**
6. **Il perimetro di un controllo è dedotto dagli esempi invece che misurato sul codice**
7. **Una fonte letta a metà produce un verdetto intero**

---

## Parte 4 — La verità e la misura

- **CIECO (e l'uscita 2)** — la parola-cardine. Ogni guardiano ha tre esiti: **0** = passa · **1** =
  violazione vera · **2** = *non ho potuto misurare*. **Il 2 non è un verde.** *Un cancello che
  lascia passare ciò che non ha saputo misurare è la bugia che questa casa cura.* Nella visita di
  salute: ✅ provato · ❌ rotto · **⚪ non l'ho potuto vedere da qui** — e ⚪ non è mai un verde.
- **MISURA CIECA** — *«una misura che non può dire di no non è una misura»*. Nata il 30/7 da cinque
  errori nello stesso giorno **non nel codice, nel modo di misurare il codice**.
- **MISURA PARZIALE** — un voto costruito su un pezzo e mostrato come intero. Il veleno: **il numero
  migliora proprio quando la realtà peggiora**, perché i pezzi peggiori sono quelli che il filtro
  butta fuori.
- **PERIMETRO** — il recinto dentro cui un controllo guarda. Malattia da dieci bloccanti: *il
  perimetro è una dichiarazione scritta a mano invece che una misura derivata dal codice vero* —
  il guardiano fa benissimo il suo lavoro dentro un recinto che nessuno ha più confrontato con la realtà.
- **NUMERO ORFANO** — una cifra senza fonte accanto. Vietata in uscita.
- **FONTE-NUMERO** — *«un numero che non c'è si traveste da numero misurato»*: un campo letto come
  zero faceva sì che il freno sui costi non scattasse mai.
- **NON-VACUITÀ** — la proprietà di una prova che dimostra davvero qualcosa.
- **VERIFICA AVVERSARIALE** — se un lavoro dice «verificato» senza che nessuno abbia provato a
  **smontarlo**, non vale.
- **PRE-MORTEM** — *«tra un mese è andata male: perché?»*, chiesto **prima**.
- **SISTEMA IMMUNITARIO / red team** — la macchina che attacca sé stessa e riporta le falle **ancora
  aperte**, per gravità.
- **CARBURANTE** — ciò che manca per lavorare al massimo (foto vere, un dato, una chiave, una
  decisione di Nicola). *Non abbassare lo standard: alza la richiesta.*
- **DEBITO DICHIARATO** — quando il freno non è scrivibile e lo si dice apertamente.
  **Debito dichiarato ≠ lavoro finito.**

---

## Parte 5 — L'apprendimento: dove finisce una correzione di Nicola

**Lezione → gate → mutazione → volano.** La catena intera serve a una cosa sola: che una correzione
non muoia in una frase.

| Parola | Significato |
|---|---|
| **Lezione** | Una cosa imparata. Le **correzioni di Nicola valgono doppio**. |
| **Gate** | Il guardiano concreto agganciato alla lezione: un comando che passa o **blocca**. |
| **Gate vero** | Lo è solo se: ① il comando cita un file che esiste ② esiste una **mutazione** che lo fa scattare ③ la mutazione trova ancora il suo pezzo. Senza la ②, scrivere `gate:` fa +1 nella pagella **senza nessuna difesa costruita**. |
| **Aggancio** | Collegare la difesa **al momento che conta**. Il cancello del lotto esisteva ed era buono: *non era agganciato al merge*. Due PR sono entrate con la prova rossa. |
| **Volano** | L'anello: lavora → si controlla → impara → migliora → lavora meglio. Era costruito in modo da **non poter mai dire di no** (contava come prova anche le previsioni ancora aperte). |
| **Quaderno** | `memoria-squadra/<reparto>.md`: cosa ha imparato ogni reparto. |
| **Chiusura del loop** | Dopo ogni lavoro serio si scrive **cosa ci si aspettava** e **cosa è successo davvero**. |
| **Atteso → reale** | La calibrazione: previsione **prima**, misura **dopo**. Chi ci prende guadagna autonomia, chi sbaglia la perde. |
| **Previsione verificabile** | *«Una previsione che nessuno può smentire non è una previsione: è una frase scritta dopo.»* |
| **Cristallizzare** | Da lezione matura a **principio scritto nel mansionario**, dove vale sempre. |
| **Potatura** | Togliere dai file vivi ciò che è morto (va in `Storico/`, col mese nel nome). |
| **Recupero memoria** | La lezione giusta **per tema**, non per posizione: prima era `head -8`, e la lezione pertinente restava sepolta. |
| **Contesto-lezioni** | Ciò che rimette in testa alla macchina, a ogni sessione, i fatti-chiave e gli errori da non ripetere. |
| **Gusto / taste-file** | Il registro dei **verdetti di Nicola** («questo sì, questo no»). Era vuoto: il gusto si perdeva a ogni sessione. |
| **Sonda** | Il controllo **leggero e frequente** (a ogni giro). Se un segnale resta basso 3 giri di fila, **chiama la radiografia**. *La sonda informa, il gate pretende.* |
| **Radiografia** | La visita profonda: 12-13 dimensioni, ogni difetto verificato avversarialmente. Due tipi: **del sito** e **di sé stessa**. |
| **Auto-coscienza** | Il volano intero: verificare il proprio lavoro, analizzarsi, confrontarsi coi migliori, estrarre lezioni. |
| **Pagella dell'intelligenza** | I 5 numeri che dicono se è **pronta per il business**: lezioni · calibrazione · freni · quaderni · salute. |
| **Salute onesta** | *«Sto migliorando nel tempo?»* come risposta e non come plateau: il voto **pieno**, non quello comodo. |
| **Utilizzo senior** | Il roster dei 120 come **numero**, non come elenco: quanti sono davvero vivi. |

> **La regola che porta via tutto:** una correzione si chiude con un **freno**, non con una frase.
> Se il freno non è scrivibile, lo si dice: è **debito dichiarato**, non lavoro finito.

**La potatura, con la sua regola:** *si pota solo ciò che è già morto o è rumore di servizio.* Una
lezione **attiva** non si tocca — potare la memoria viva per far entrare un file è esattamente il
difetto che si stava per causare. E ogni potatura **dichiara cosa ha tolto**: un archivio che si
sfoltisce in silenzio è indistinguibile da uno che perde pezzi.

---

## Parte 6 — Il corpo: worker, ritmo, economia

| Parola | Significato |
|---|---|
| **Worker** | Le braccia: il servizio sul VPS che **esegue davvero**. È l'unico pezzo che fa succedere le cose: se dorme, tutto il resto è teoria. |
| **Due corsie** | Un worker per i lavori lunghi (giro, azioni) e uno per la chat: una domanda non finisce dietro mezz'ora di giro. |
| **Coda / lavoro** | `in attesa` → `in corso` → `fatto` / `errore`. |
| **Orfano** | Un lavoro rimasto «in corso» perché chi lo teneva è morto. Va recuperato, non lasciato lì. |
| **Sentinella lavori** | L'auto-guarigione della coda: se ne accorge da sola. |
| **Retry** | L'**unica** regola su cosa si ritenta e quando — worker e sentinelle insieme, non due copie. |
| **Watch-main** | Tiene la copia sul VPS allineata a `main`: senza, il worker lavorerebbe con un cervello vecchio. |
| **Tick / battito** | Il segnale «sono vivo» a ogni giro. **Segnali attesi** = chi deve batterlo, *derivato dal codice e non scritto a mano*. |
| **Battito esterno** | Il controllo **fuori** dalla macchina. Nato dal danno vero: VPS fermo **40 ore, dodici tick mancati, nessun allarme** — perché chi controllava che fosse viva **abitava dentro di lei**. |
| **Lucchetto** | La protezione sulla cartella git condivisa. Era *«una convenzione volontaria, non un cancello»*. |
| **Porta** | Un punto che **pubblica**. Una porta scoperta *non si vede, pubblica e basta*. |
| **Uscita** | Un punto che **tocca il mondo** (email, messaggi, pagamenti). Ognuna deve avere il suo controllo. |
| **Mano** | Il canale con cui la macchina *cambia* il mondo. Ne esistono **5**: email, Telegram, Instagram, Facebook, Google Business. |
| **Lista dei permessi** | Vuota = prova a vuoto forzata. *È il freno che rende sicura tutta l'automazione: si toglie un destinatario alla volta, di proposito.* |
| **Pausa** | L'interruttore dal Pannello: ferma senza uccidere. Una card in pausa **deve avere una sveglia**, sennò dorme per sempre. |
| **Ramo unico** | La memoria si pubblica su `main`; il codice ci arriva solo da una revisione. |
| **Ramo pulito** | *Il ramo porta solo il suo lavoro.* **Ventuno correzioni di Nicola su questa cosa sola**, undici in un pomeriggio: la famiglia di errori più costosa del registro. |
| **Delta-gate** | Niente di nuovo dall'ultimo giro → **l'AI non si accende**, gira solo la sonda. |
| **Letargo** | Degradazione con grazia su 4 assi: spegne il superfluo **in ordine inverso d'importanza** e tiene il nucleo vitale (ordini, consegne, firma, sicurezza). Non si blocca mai del tutto. |
| **Metabolismo** | Quanto consuma, per tipo di lavoro e modello: trasforma la quota da vincolo a **leva**. |
| **Banco AI / routing** | Dato un compito, sceglie **l'AI più economica capace** — e lo misura. |
| **Freno costi** | Il freno a mano sulla spesa AI: *se non sa quanto è stato speso oggi, non finge che sia zero*. |
| **Scrittura atomica** | Scrivere senza lasciare mai un file a metà. C'erano **111 scritture e zero rinomine**, e la stessa funzione copiaincollata in cinque file. |
| **Peso del contesto** | Il **costo** della memoria, non il contenuto: *«la dimensione del contesto non è di nessuno»*. |
| **Muro della Cabina** | Il tetto oltre cui il Pannello non riesce più a leggere un file. Un file che cresce senza che nessuno lo guardi *è un modo di rompersi che aspetta il suo turno*. |
| **Midollo spinale** | I riflessi rapidi: per ogni allarme, la reazione pronta col suo limite. |
| **Macchina del tempo** | Ricostruisce la **giornata** della macchina: ogni mossa risalibile fino al file che l'ha generata. |
| **Bilancio vivo** | Ogni ordine sa quanto rende, al centesimo: margine **realizzato** vs **potenziale**. |

---

## Parte 7 — Il lavoro dei senior

- **DOER MODE** — il senior consegna **il lavoro fatto**, non l'analisi di cosa fare.
- **CONSEGNA** — il file finito in `consegne/<reparto>/`; le grafiche in `creativi/`.
- **CARD** — una riga della coda da firmare, coi due campi che Nicola legge: **«cosa cambia»** (la
  conseguenza vera, con negozio/importo/scadenza) e **«se va bene»** (il passo dopo).
- **FIRMA** — il sì di Nicola. L'unica cosa che trasforma una proposta in un fatto. E: **nessuno
  script può scriversi da solo la firma**.
- **COLORI 🟢🟡🔴** — 🟢 lo fa · 🟡 lo fa e avvisa · 🔴 si ferma e aspetta. Nel dubbio si sale.
- **SCRITTURA UMANA** — il titolo di un'azione si capisce **a voce**: fuori sigle, ID e path.
  Il metro: *se poteva scriverlo un terminale, riscrivilo*.
- **FARO** — il negozio su cui si concentra lo sforzo pesante.
- **REGISTRO DELLA REALTÀ** — ogni entità nominata ha uno stato: **confermata** (è nei dati) ·
  **scelta ragionata** (non è nei dati ma è motivata con prove — legittima) · **da verificare**
  (nessun fondamento: il vero «inventato», e blocca).
- **ALLOCAZIONE** — impedisce che lo sforzo pesante vada su chi non ha firmato mentre il negozio
  vero resta a zero.
- **REGISTRO DEI FATTI + CACCIA** — una casa sola per ogni fatto-chiave; quando cambia, il valore
  **vecchio** entra in *caccia* e viene inseguito in tutti i file vivi. *Una copia vecchia è una
  bugia che il Pannello mostra a Nicola.* La storia (decisioni, briefing) non si riscrive: è esente.
- **SALA OPERATIVA** — il canale comune dei senior: FACCIO / FATTO / SERVE / PASSO-A / RIVEDI.
- **STAMPO / KIT** — il modello e la cassetta degli attrezzi di ogni senior. Il metro *che non poteva
  dire di no*: «120/120 completi» mentre **72 quaderni su 120 non avevano mai una riga di esito**.
- **DEFERRAL / OWNER UNICO** — ogni mandato ha **un solo** padrone; gli altri rimandano. Se due lo
  rivendicano, il lavoro va a chi capita.
- **CAPACITÀ** — le 53 funzioni di lungo periodo (il Gemello Digitale, il Concierge di Spesa, il
  Sismografo, l'Almanacco…). **46 sono ancora chiuse** dietro un *cancello di realtà*: si aprono
  quando esistono i dati veri, non prima.
- **SKILL** — un mansionario che si accende a comando: `cantiere` · `salute` · `senior` · `worker` · `verify`.
- **WORKFLOW** — l'orchestrazione multi-agente: `radiografia` · `auto-radiografia` · `audit-design` ·
  `audit-pannello` · `giro-operativo`.
- **CADENZE** — piano del mattino · punto di mezzogiorno · report della sera · review del venerdì ·
  strategia del mese.
- **COMANDO** — la frase che fa partire un lavoro («fai un giro», «radiografia», «contenuti pro»),
  riconosciuta anche detta in modo diverso.

---

## Parte 8 — La Cabina: le parole che si vedono sullo schermo

| Parola | Cos'è |
|---|---|
| **Pannello / Cabina** | La faccia. Non decide niente: mostra e raccoglie la firma. Se sparisse, la macchina continuerebbe a lavorare. |
| **Bacheca** | Le schede della home che spiegano la macchina, tenute aggiornate dai guardiani. |
| **Cuore** | Il battito: consumo, giri, stato del worker. |
| **Bussola / Stelle Polari** | Dove stiamo andando e il numero che conta (**North Star**: ordini pagati, negozi vivi, margine). |
| **Governo AD** | Le decisioni e i colori. |
| **Arsenale** | Le capacità e gli strumenti disponibili. |
| **Lettera a Nicola** | Il racconto in italiano di cosa è successo, scritto per lui e non per un log. |
| **Memoria viva** | Chat, diario e briefing anche a database, visibili da qualunque dispositivo. |
| **Quaderni senior** | Cosa ha imparato ogni reparto. |
| **Scoperte e proposte** | Cosa ha trovato e cosa propone di fare. |
| **Grafo d'influenza** | Cosa muove cosa: le catene a due anelli del radar. |
| **Diagnostica worker** | Lo stato vero del VPS, visto da qui. |

---

## Parte 9 — Come si incastra, in pratica

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

## Parte 10 — Il giro, passo per passo

Il **giro** è l'unità di lavoro della macchina: quello che fa quando nessuno le chiede niente.
Gira da solo sul VPS ogni due ore, e si può lanciare a mano dicendo **«fai un giro»**.

Non è un comando: è una **catena di montaggio** con un prima e un dopo.

### Prima che l'AD si svegli (nessun costo, tutto codice)
- **Delta-gate** — se dall'ultimo giro non è cambiato niente, il motore AI **non si accende**: gira
  solo la sonda leggera. Serve a non pagare dieci giri identici a vuoto.
- **Verifica dei sensori** — se gli occhi sono ciechi, all'AD arriva un vincolo duro: *niente numeri
  nuovi in questo giro*. La cecità viene dichiarata, non nascosta.

### I 15 passi dell'AD

| # | Passo | In una frase |
|---|---|---|
| 0 | Sensori e volano | Guarda con quali occhi sta lavorando e cosa non ha potuto vedere. |
| 1 | Dati reali | Ordini, incassi, clienti, consegne, carrelli, recensioni degli ultimi 7 giorni. Prima il canale REST, poi il collegamento di sessione, e se sono ciechi entrambi: nessun numero inventato. |
| 2 | Sentinelle | Controlla le soglie interne, e l'automazione verifica sé stessa **prima** che se ne accorga Nicola. |
| 3 | Radar | Il mondo fuori, in due direzioni: cosa ci influenza (IN) e su cosa possiamo agire (OUT). |
| 4 | Delega | Passa i numeri all'analista e le opportunità esterne all'intelligence. |
| 5 | Briefing | Il rapporto in **11 sezioni** obbligatorie — inclusa la più importante: **«cosa NON ho potuto verificare»**. |
| 6 | Salva e pubblica | Briefing datato all'ora, i 7 numeri di STATO, i file di Intelligence, il digest che alimenta le card. |
| 7 | **Doer mode** | Esegue davvero i 🟢 e prepara i 🟡/🔴 **completi** — testo pronto, destinatario, canale — nella coda da firmare. |
| 8 | Sala operativa | Registra le mosse del giro, con l'ora. |
| 9 | Piani | Aggiorna i piani di Nicola **solo dentro un blocco marcato**: propone, non riscrive il suo testo. |
| 10 | Intenzioni di Nicola | Estrae cosa sta per fare *lui* e cosa gli si può pre-preparare. |
| 11 | 🚦 **Cancello** | Auto-analisi a 3 livelli sul lavoro appena fatto. Se il verdetto non finisce su disco, **il giro è fallito**. |
| 12 | 📚 Apprendimento | Lezioni dalle 8 fonti, gusto di Nicola registrato, previsioni dichiarate, loop chiusi nei quaderni. |
| 13 | 🚀 Auto-miglioramento | Solo sul lavoro importante: confronto coi migliori, varianti, torneo, peer-review. |
| 14 | 🩻 Sonda | Un controllo veloce su sé stessa e un passo avanti nel cantiere. |
| 15 | 🧭 Coerenza dei fatti | Ultimo cancello: se un fatto è cambiato, va cambiato **ovunque nello stesso giro**. |

### Dopo
I guardiani ispezionano il giro. Se uno dei 36 bloccanti trova qualcosa, **il giro non si pubblica**.
Se passa, la memoria finisce su `main` e il Pannello la mostra.

### Le tre cose da capire del giro
1. **Il giro non "risponde": consegna.** Lascia artefatti veri, azioni pronte da firmare, memoria aggiornata.
2. **Il giro dichiara ciò che non sa.** La sezione Gap e i sensori ciechi valgono quanto i numeri trovati.
3. **Il giro si controlla da solo prima di uscire** (passi 11 e 15) e viene controllato dopo (i guardiani). Doppio strato apposta.

---

## Parte 10-bis — Le parole vere del mestiere, quelle che valgono anche fuori da qui

Le parti da 1 a 10 spiegano le parole **della macchina**. Sono nomi che ho dato io alle sue parti.
Funzionano solo dentro MyCity.

Questa parte è diversa. Sono le parole che usano **tutti gli sviluppatori del mondo**. Impararle
serve a te per parlare con chiunque metta le mani sul sito, non solo con me.

Misurate il 2/8/2026: erano **19 parole** che usavo nei testi e che non stavano da nessuna parte in
questo glossario. Nicola non poteva studiarle perché non erano scritte.

| Parola | Cosa vuol dire | Esempio vero, successo qui |
|---|---|---|
| **commit** | Un salvataggio del lavoro, con scritto cosa hai cambiato e perché | Ogni volta che finisco un pezzo faccio un commit: resta la traccia di chi ha cambiato cosa |
| **branch** (ramo) | Una copia separata dove provo le modifiche senza toccare il sito vero | Le modifiche al marketplace le faccio sempre in un ramo: se sbaglio, il sito online non se ne accorge |
| **merge** (fusione) | Unire il ramo di prova al sito vero: da quel momento la modifica è reale | Il 2/8 la modifica sul controllo di fine lavoro è stata unita, e da lì vale per tutti |
| **PR** (pull request) | La richiesta di unire un ramo, con la spiegazione di cosa cambia. È quello che leggi e approvi | Le 5 PR che ti hanno fatto perdere 2 ore erano queste |
| **deploy** | Mettere online la nuova versione del sito | Il marketplace passa da Render a Vercel: quello è un deploy su un altro fornitore |
| **rollback** | Tornare alla versione di prima quando qualcosa si rompe | Se un deploy rompe il checkout, il rollback riporta il sito com'era in pochi minuti |
| **CI** | Il controllo automatico che gira a ogni PR prima che si possa unire | «La CI è rossa» vuol dire: un controllo ha detto no, la modifica non passa |
| **endpoint** | Un indirizzo a cui il sito chiede una cosa precisa | L'indirizzo che restituisce gli ordini di un negozio è un endpoint |
| **API** | Il modo in cui due programmi si parlano fra loro | Leggo i dati dei negozi dalle API di Supabase, in sola lettura |
| **webhook** | Un avviso che un servizio esterno manda **da solo** quando succede qualcosa | Quando un cliente paga, Stripe manda un webhook e l'ordine risulta pagato |
| **payout** | Il giro di soldi da MyCity al negozio, dopo che il cliente ha pagato | Ordine pagato ma payout non partito da 24 ore → allarme |
| **onboarding** | Portare dentro qualcuno di nuovo e farlo partire davvero | L'onboarding di un negozio: vetrina, catalogo, pagamenti, primo incasso di prova |
| **churn** | Chi se ne va: negozi o clienti che smettono di usare MyCity | Un negozio fermo da 14 giorni è un rischio di churn |
| **pipeline** | Una catena di passaggi che si eseguono in fila, ognuno dopo l'altro | Contenuti pro: brief → varianti → critica → produzione → controllo → consegna |
| **baseline** | Il punto di partenza da cui misuri se una cosa è migliorata o peggiorata | Prima di cambiare come scrivo: 263 punti difficili su 60 testi. Quella è la baseline |
| **runtime** | Mentre il programma gira davvero, non mentre lo leggi | Un difetto trovato a runtime è un difetto visto succedere, non immaginato |
| **hook** | Un comando che parte da solo quando succede una cosa precisa | Quando dico «ho finito», parte da solo il controllo che verifica se è vero |
| **fail-closed** | Nel dubbio blocca, invece di lasciar passare | Se non riesco a misurare se il lavoro è a posto, non do il via libera |
| **typecheck** | Un controllo che legge il codice e trova gli errori senza eseguirlo | Passa prima di ogni consegna del Pannello |

### Le parole mie, quelle che restano. Deciso da Nicola il 3/8

Avevo scritto che tre parole mie dovevano morire. Nicola ha deciso il contrario: *«resta potatore e
tutte le altre parole se servono per abbreviare una frase, basta che mi spieghi il significato»*.

Ha ragione, e il motivo è pratico. «Il potatore ha liberato spazio» sta in cinque parole. «La pulizia
automatica dei file vecchi ha liberato spazio» ne vuole nove. Su un testo intero la differenza si
sente. La regola quindi non è *vietarle*, è **spiegarle**:

| Parola mia | Cosa vuol dire | Esempio vero |
|---|---|---|
| **potatore** | la pulizia automatica che accorcia i file di memoria quando crescono troppo | il file dell'apprendimento pesava un mega: il potatore taglia le righe più vecchie |
| **cricchetto** | un limite che può solo scendere, mai risalire | i difetti tollerati erano 127: da lì possono solo diminuire |
| **verdetto muto** | un lavoro consegnato senza dire com'è andato | otto salvataggi di fila e nessuna riga di esito: otto verdetti muti |
| **aria fritta** | una frase che sembra spiegare e non dice niente | «adesso è più robusto» non dice cosa non si rompe più |
| **passo indietro** | dire di cosa parli e a cosa serve, prima del merito | è la prima delle sette regole di scrittura |
| **fila** | l'elenco ordinato di cose da fare, dalla più urgente | le 860 parole ancora da spiegare stanno in una fila |

> **La regola d'uso.** Una parola mia si può usare se ① accorcia davvero la frase e ② è qui dentro,
> oppure la spiego dove la scrivo. Quello che resta vietato è **inventarne una nuova e non dirtelo**:
> quello è debito che paghi tu.

---

## Parte 10-ter — Le parole che incontri leggendo, trovate il 3/8/2026

Come sono state trovate, perché il metodo conta: ho letto **tutti i 689 testi** che ti arrivano,
tolto il codice, i link e i nomi dei file, e contato le parole tecniche rimaste nella prosa. Quelle
usate almeno 25 volte e assenti da questo glossario erano **310**. Qui ci sono le più frequenti, più
le 5 che avevi chiesto tu.

### Le 5 che avevi chiesto

| Parola | Cosa vuol dire | Esempio vero |
|---|---|---|
| **denominatore** | su quanti casi ho misurato, il numero sotto la riga | «253 senza esito» non dice niente. «253 **su 277**» sì: 277 è il denominatore |
| **fixture** | un caso finto costruito apposta per provare una cosa | provo il controllo su un finto negozio, non sul tuo vero |
| **pathspec** | il filtro che dice a quali file guardare | «guarda solo i file .md dentro consegne» è un pathspec |
| **guardrail** | un blocco che ti impedisce di fare un danno | il tetto di spesa che ferma la macchina prima che bruci il budget |
| **referto** | il foglio con i risultati di un controllo, scritto su file | dopo ogni giro resta un referto con cosa è passato e cosa no |

### Le 19 che usi di più senza saperlo

| Parola | Cosa vuol dire | Esempio vero di MyCity |
|---|---|---|
| **buyer** | il cliente che compra sul marketplace | il buyer paga, e da lì parte l'ordine al negozio |
| **seller** | il negozio che vende | Pane Quotidiano è il primo seller vero |
| **rider** | il fattorino che consegna | serve un rider per ogni ordine con consegna |
| **account** | il profilo di una persona o di un negozio | ogni seller ha il suo account per gestire i prodotti |
| **admin** | la parte del sito riservata a chi comanda | dall'admin si vedono tutti gli ordini, non solo i propri |
| **token** | una chiave d'accesso, come una password per i programmi | il token di GitHub permette alla macchina di salvare il lavoro |
| **GitHub** | il posto su internet dove vive il codice e la memoria | ogni salvataggio finisce lì, e da lì lo legge il Pannello |
| **push** | mandare su GitHub il lavoro salvato | finché non faccio push, il lavoro esiste solo sul mio computer |
| **query** | una domanda fatta al database | «quanti ordini pagati oggi?» è una query |
| **server** | un computer sempre acceso che fa girare le cose | il worker vive su un server, non sul tuo portatile |
| **cron** | l'orologio che fa partire una cosa da sola a un'ora fissa | il giro del mattino parte così, senza che nessuno lo lanci |
| **timer** | il conto alla rovescia prima che qualcosa scatti | l'allarme del worker morto aspetta un timer prima di suonare |
| **sync** | allineare due copie perché dicano la stessa cosa | il Pannello si sincronizza con la memoria su GitHub |
| **refresh** | ricaricare i dati per vederli aggiornati | la Cabina fa refresh ogni 30 secondi |
| **batch** | un gruppo di cose fatte tutte insieme invece che una per volta | consegnare 5 ordini della stessa via in un giro solo |
| **playbook** | la procedura scritta passo per passo, da seguire quando serve | il playbook per accendere Telegram |
| **default** | il valore che vale se non scegli niente | di default le azioni non partono: serve la tua firma |
| **link** | il collegamento cliccabile a un'altra pagina o file | ogni card porta il link al file completo |
| **vault** | la cassaforte della memoria, cioè la cartella `MyCity-Vault` | tutto quello che la macchina ricorda vive lì |

> 📌 **Le parole di mestiere dei senior arrivano quando serve.** Restano fuori da qui, per adesso, i
> vocabolari specifici dei 120 senior: `DSCR` e `factoring` del credito, `OSS` e `IOSS` dell'IVA,
> `DVR` della sicurezza sul lavoro, `ROAS` e `CPA` della pubblicità, `KYC` dell'antiriciclaggio.
> Sono centinaia, e impararle tutte adesso non serve a niente. La regola concordata con Nicola il
> 3/8: **quando metti al lavoro un senior, quel senior ti spiega le sue parole, e finiscono qui.**
> Nel frattempo valgono le regole generali: o la parola è nel glossario, o va spiegata dove la uso.

---

### Le 10 trovate dal rilevamento automatico (prima infornata, 3/8)

Queste non le ho scelte io: le ha trovate il controllo che cerca le parole tecniche non spiegate,
ordinandole per quante volte le incontri leggendo.

| Parola | Cosa vuol dire | Esempio vero |
|---|---|---|
| **preview** | l'anteprima: una copia del sito visibile solo a noi, per guardare una modifica prima che diventi vera | ogni modifica al Pannello ha la sua anteprima con un indirizzo a parte |
| **dashboard** | il cruscotto: una pagina che raccoglie i numeri importanti a colpo d'occhio | la Cabina è il cruscotto della macchina |
| **handoff** | il passaggio di consegne da un reparto all'altro | vendite firma il negozio e lo passa a onboarding: quello è il passaggio |
| **pitch** | il discorso con cui convinci qualcuno in pochi minuti | il pitch al fornaio dura 3 minuti e finisce con una domanda |
| **trigger** | il grilletto: la condizione che fa partire una cosa da sola | ordine pagato senza consegna da 24 ore fa scattare l'allarme |
| **slot** | la fascia oraria prenotabile | gli slot di consegna della sera sono quelli che si riempiono prima |
| **stock** | la merce disponibile in magazzino | se lo stock è finito il prodotto non si può ordinare |
| **feedback** | il ritorno di chi ha provato una cosa: cosa è andato bene e cosa no | la telefonata dopo il primo ordine serve a raccogliere il feedback |
| **seed** | i dati finti messi apposta per provare il sito prima che ci siano quelli veri | i negozi demo erano dati seed, non botteghe vere |
| **summary** | il riassunto in poche righe di una cosa lunga | in cima a ogni consegna c'è il riassunto |

> 🔄 **Come cresce questa parte, da adesso.** C'è un comando che legge tutti i testi e trova le parole
> tecniche assenti da qui. Le mette in fila, ordinate per quante volte le incontri.
> Il comando è `node cervello/si-capisce.mjs --nuove`.
> La fila vive in `auto-coscienza/parole-da-spiegare.json`. Oggi contiene **860 parole**: le più
> frequenti entrano qui a infornate, le altre restano in fila. Nessuna definizione viene scritta in
> automatico — una definizione sbagliata dentro il materiale che studi è peggio di una parola che
> manca.

---

## Parte 11 — I livelli di comprensione

| Livello | Cosa spiega | La domanda a cui risponde |
|---|---|---|
| 1 | **Il vocabolario** (Parti 1-9) | Cosa vogliono dire le parole. |
| 2 | **Il giro** (Parte 10) | Cosa fa la macchina quando nessuno le chiede niente. |
| 3 | **La squadra** — 120 senior, deleghe, owner unico, catene di reparti | Chi fa cosa, e perché non c'è un solo cervello che fa tutto. |
| 4 | **Il volano** — auto-analisi, auto-radiografia, apprendimento | Come diventa più brava invece di ripetere gli stessi errori. |
| 5 | **Il cantiere** — difetti, malattie, prove, mutazioni | Come si ripara da sola, e perché conta la malattia e non il conteggio. |
| 6 | **Le mani e i sensi** | Qual è oggi il confine vero tra proposta ed esecuzione. |
| 7 | **L'economia della macchina** — costo AI, letargo, delta-gate, routing | Quanto costa tenerla viva e come si difende dallo spreco. |

---

## Fotografia del 2026-08-01 10:54

Tutti letti dai comandi adesso, non copiati dalla versione del 31/7:

- **74 guardiani a ogni giro, 36 bloccanti** — su **158** script in `cervello/` (fonte: `guardiani-check.mjs`)
- **120 senior · 11 sensori · 5 mani · 13 servizi sul VPS · 5 skill · 5 workflow** (fonte: `mappa-macchina.json`, `.claude/agents/`)
- **409 difetti** censiti su sé stessa: **162 aperti**, 247 chiusi (fonte: `cantiere-difetti.json`)
- **487 lezioni**, di cui **31 con un freno vero** (fonte: `apprendimento.json`)
- **28 fatti-chiave** in memoria (fonte: `registro-fatti.json`)
- **7 malattie** censite (fonte: `malattie.json`) · **53 capacità**, di cui **46 ancora chiuse** dietro un cancello di realtà (fonte: `cervello/capacita/_indice.json`)
- **Pagella dell'intelligenza**: lezioni 18% (50/281) · **nessuna previsione mai confrontata col reale** · 6 bloccanti aperti · quaderni 21 su 120 · salute 9/100 (fonte: `pagella-intelligenza.json`)

> ⚠️ **Tre numeri della fotografia del 31/7 erano già invecchiati in un giorno** — 157 → **158**
> script, 408 → **409** difetti, 27 → **28** fatti-chiave. Nessuno era una bugia: erano fotografie
> vecchie lasciate in un file vivo. **È esattamente il mestiere del guardiano `coerenza-fatti`**, e
> la ragione per cui i numeri qui sopra vanno riletti dai comandi e mai copiati a memoria.

---

## Se si dimentica tutto il resto, quattro cose

1. **Sensore = un occhio · sentinella = il business · guardiano = la macchina · cancello = l'uscita.**
   Le ultime tre sono difese, la prima è un senso.
2. **Il colore comanda su tutto.** Nessun guardiano, nessuna sentinella e nessun automatismo può far
   partire un 🔴 al posto di Nicola.
3. **Cieco e onesto vale più di sicuro e inventato.** Ogni ⚪ e ogni «2» esistono per questo.
4. **Una correzione di Nicola si chiude con un freno, non con una frase.** Tutto il resto del
   vocabolario esiste per rendere quel freno dimostrabile.

> **La macchina è progettata per non poter mentire più che per essere veloce.** Metà del codice non
> produce valore: impedisce di raccontare balle. È voluto.
