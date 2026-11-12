---
name: radiografia-sessioni
description: >-
  Aprila PRIMA di lanciare qualunque radiografia del sito o del marketplace: è il manuale della regista per
  TROVARE i difetti del sito in sessioni parallele, sullo stampo della riparazione — una regista in una
  sessione sua, fino a sei sessioni per onda che cercano a lotti, la verifica solo dove serve, i controlli
  fatti da un programma, e un preventivo prima del via. Vale ogni volta che Nicola — in qualunque forma,
  anche detta male o a voce — chiede una radiografia del sito o del marketplace, di «analizzare tutto il
  sito», «trovare tutti i bug», cercare i difetti che fermano il lancio, rifare la radiografia in 12
  sessioni o «in N sessioni», guardare i difetti nati da una funzione, un ramo o una PR, o ricontrollare
  se le voci aperte del registro sono ancora vere. NON è la radiografia della macchina (`auto-radiografia`),
  del Pannello (`audit-pannello`) o del solo design (`audit-design`), non è la radiografia mentre si ripara
  (`radiografia-in-corsa.mjs`), e non RIPARA: i difetti trovati li ripara la skill `riparazione`.
---

# La radiografia del sito in sessioni — il manuale della regista

> Se sei l'AD e in questa sessione non hai ancora letto `cervello/MANUALE-AD.md`, leggilo adesso: questa
> skill non lo sostituisce, lo usa (regole ⑬-㉔ soprattutto).

> Nata il 12/11/2026 notte da Nicola: *«ora facciamo un bel lavoro anche sulla radiografia»*. Il conto che l'ha
> chiesta (misurato il 12/11, `consegne/radiografia/2026-11-12-radiografia-in-sessioni/costo-6-11.json`): la
> radiografia del 6/11 in 12 sessioni è partita incollando quattro testi legati a quel giorno; le 12 sessioni sono
> costate 327 $ di listino, ognuna è arrivata a 277-422 mila token di storia, e il 97% dei token era rilettura. Ha
> trovato 175 difetti nuovi, nessun bloccante; il giro di prova della palestra, il 7/11, ha trovato il bloccante
> degli indirizzi con 1,3 milioni di token.

## Le tre regole

1. **La regista non cerca.** Divide, sorveglia, unisce. Se apre il codice del sito, smette di vedere le sessioni.
2. **Prima i programmi, poi gli agenti.** Divisione, lotti, schede, controllo dei referti, doppioni, conti: li fa
   `cervello/radiografia-sessioni.mjs`. Agli agenti restano le domande di giudizio.
3. **Chi trova non conferma.** Un grave, un bloccante o una falla entrano solo se un agente nuovo, partendo dalla
   prova, non è riuscito a smentirli.

---

## Passo 0 — Capire la richiesta (30 secondi, zero agenti)

**Il profilo.** Si ricava dalla frase; se non si deduce, **una** domanda.

| Profilo | Frasi tipo | Cosa fa |
|---|---|---|
| `lancio` | «cosa ferma il lancio», «radiografia prima di aprire», e ogni «radiografia del sito» finché i minori aperti sono più di 100 | S01 sui gravi aperti + S02-S08, solo bloccanti e gravi; prima il giro dei flussi che incassano in palestra |
| `tutto` | «analizza tutto il sito», «rifai la radiografia in 12 sessioni» | tutti i 12 temi; i minori nuovi solo con 100 minori aperti o meno |
| `funzione` | «i difetti della funzione X», «della PR N», «del ramo …» | `--diff base..testa`: solo i file cambiati e i temi che li possiedono |
| `scelta` | «guarda solo i pagamenti e la sicurezza» | `--temi S02,S04` |
| `ricontrollo` | «quali voci aperte non sono più vere», «ripulisci il registro» | solo S01, nessun difetto nuovo |

**La regola che sceglie da sola (⑳).** Con più di 100 minori aperti nel registro non si cercano minori nuovi:
`prepara` lo calcola e lo scrive nel piano, e `valida-referto` rifiuta un minore nuovo (una falla riservata
entra anche se minore). Il 12/11 i minori aperti erano 726: il profilo di oggi è `lancio`.

**La misura.** Con una o due sessioni la regia a parte non serve: la sessione dell'AD fa da regista. Con tre o più,
la regia va in una sessione sua (regola ㉔). Oltre 18 sessioni (`prepara` è rosso) si restringe col profilo
`scelta` o si divide in due radiografie.

## Le regole del risolutore portate dentro

- **La regia in una sessione sua**, con fermate, preventivo e le figlie in «Ultra Code Extra»: `effort: "xhigh"` in
  `create_session`, ultracode acceso, e subito `get_session` deve dire `effort_level` xhigh e `is_ultracode_active`
  true. Se no, non si aprono le altre: si dice all'AD quali sessioni sono, perché Nicola le accenda dall'app.
- **Il preventivo detto giusto**: il consumo è `usage.cost_usd` di `get_session`, al prezzo di listino; con
  l'abbonamento scala dal limite settimanale, e a limite finito si ferma tutto fino al rinnovo.
- **Il lavoro che non si fa**: la regista non rilegge le trascrizioni (giudica dal ramo, dal referto e da
  `sorveglia`); un giro senza rossi non scrive a nessuno (㉓); nessun verificatore sui minori (⑲); mai il controllo
  di un controllo; oltre 12 subagenti per sessione o 2 milioni di token ci si ferma e si chiede (⑱).
- **Le storie piccole**: ogni sessione fa il capo squadra e dà ogni lotto (circa 300 KB di codice, 8 al massimo) a un
  subagente nuovo, che restituisce solo le righe del referto (`LEGGIMI-cercatore.md`, §3).
- **La partenza controllata**: le figlie lavorano su `ad-mycity`, quindi leggono LEGGIMI e scheda dalla loro copia;
  a 10 minuti dall'apertura una `list_sessions` (limit 20) e ogni figlia `BLOCKED` si sblocca in quel turno; quello
  che solo Nicola può cliccare si dice all'AD alla prima volta, col nome della sessione.
- **I lucchetti**: `ad-mycity` vieta di scrivere `.claude/settings.local.json`, anche per chiudere permessi (provato il
  12/11: la scrittura viene negata). Nessuna figlia ci prova: il divieto di Supabase, Vercel e Stripe resta scritto nel
  LEGGIMI e nel mandato di ogni subagente. Il lucchetto vero, togliere quei permessi in `ad-mycity`, è una scelta di
  Nicola (card #236).

---

## F0 — Preparazione (l'AD, programmi, 15-20 minuti)

Tutti i comandi dalla radice di `ad-mycity`, con `C=consegne/radiografia/AAAA-MM-GG-<profilo>` (il giorno da
`giornoPiacenza()`).

1. **La quota.** `get_session` senza argomenti: con `isUsingOverage` o un blocco non si parte.
2. **Il codice.** `node cervello/collega-marketplace.mjs`, poi `BASE=$(git -C marketplace rev-parse HEAD)` (40
   caratteri). Tutte le sessioni guardano quel commit e nessun altro.
3. **La palestra prima** (se il profilo la chiede): un giro dei flussi che incassano — cassa in contanti, ordine,
   accettazione, consegna, riquadro, bonifico — sulla copia del sito, con un agente solo (circa 1,3 milioni di token
   il 7/11, `consegne/audit/2026-11-07-palestra/`). Se la palestra è spenta lo si dice alla fermata 1: accenderla è
   una scelta di Nicola.
4. **Il piano:**
   `node cervello/radiografia-sessioni.mjs prepara --profilo <…> --base $BASE --cartella $C [--temi …] [--diff a..b]`
   Scrive `piano.json`, `mappa-file.txt`, `registro-compatto.txt`, `da-ricontrollare.txt` e `lotti/`.
5. **Il preventivo:** `preventivo --cartella $C` (agenti, token e dollari stimati, e se serve la firma).
6. **Le schede:** `schede --cartella $C --ramo <ramo della regista> --regista <id della regista>`. Se la regia va in
   una sessione sua, il suo ramo e il suo id si sanno solo dopo averla aperta: si apre prima la regista (F1), e le
   schede le scrive lei con questo comando.
7. **I controlli:** `copertura-prima --cartella $C` verde (prima delle schede è «in attesa» solo per quelle) e, dopo le
   schede, `segnaposti --cartella $C` verde. Si aprono le cercatrici solo con tutti e due verdi.
8. Commit e push di `$C` sul ramo: lo SHA dopo le schede è `SHA_REGISTA`. La PR in bozza su `ad-mycity` (regola «PR sempre»).
9. **FERMATA 1**, a Nicola con «Il punto adesso»: il profilo e il perché; le sessioni e le onde coi temi; cosa resta
   fuori (`lenti_fuori`, `angoli_fuori`, il codice dei soli temi fuori); la soglia dei minori; il preventivo, con il
   confronto coi 327 $ delle 12 sessioni del 6/11; lo stato della palestra. Si parte solo col suo «via».

## F1 — La regia e le onde

**Aprire la regista** (con tre sessioni o più): `create_session` con `source_url` = `ad-mycity`, `outcome_branch` = il
ramo della radiografia, `effort: "xhigh"`. Il prompt è una riga: *«Sei la regista della radiografia <C>. Leggi
.claude/skills/radiografia-sessioni/SKILL.md e <C>/REGIA.md, poi continua da lì. Nicola parla con l'AD nella
sessione <id>: le fermate e l'esito vanno lì con send_message.»* `<C>/REGIA.md` è il quaderno di bordo (80 righe al
massimo): le scelte di Nicola, lo stato, il prossimo passo, i comandi esatti. La sessione dell'AD deve essere in
modalità Auto: una figlia nasce nella modalità di chi la apre, e in «plan» si blocca.

**Aprire le cercatrici dell'onda**, una `create_session` per sessione:
- `source_url` = `https://github.com/NicolaeRotaru/ad-mycity`; `source_revision` = `SHA_REGISTA` (dall'onda 2: lo
  SHA del commit con `trovati.txt`); `outcome_branch` = `<ramo della regista>-sNN`;
- nessun `permission_mode: "plan"`; `effort: "xhigh"`, poi il controllo di Ultra Code Extra;
- `title` «Radiografia SNN — <nome>», mai un dettaglio di una falla; tag `radiografia-<profilo>`;
- il prompt, una riga: *«Sei la sessione SNN della radiografia. Leggi cervello/radiografia/LEGGIMI-cercatore.md e
  <C>/schede/SNN.md, poi lavora: il divieto del §1 vale per te e per ogni subagente. La regista è <id>.»*

Gli id, i rami e le partenze vanno in `<C>/sessioni.json`:
`{"regista": "<id>", "sessioni": {"S02": {"id": "…", "ramo": "…-s02", "onda": 1, "partenza": "<SHA_REGISTA>"}}}`.

**La sorveglianza**, ogni 30 minuti con una catena sola di `send_later` (mai `sleep`, mai due catene): prima
`get_session` della regista (quota), poi una `list_sessions` (limit 20) per le figlie `BLOCKED`, poi **un comando**:
`node cervello/radiografia-sessioni.mjs sorveglia --cartella <C> --onda N` (fa `git fetch`, `guardia-ramo` e
`valida-referto` su ogni referto parziale, scrive il diario e stampa solo i rossi). Un rosso si corregge con
`send_message` alla sessione; una scrittura sul mondo vero si ferma con `interrupt_session` e si avvisa Nicola. La
catena smette quando tutte le sessioni dell'onda sono finite e verdi (`sorveglia` esce 0), o a una fermata.

**Fine onda.** Si portano i referti nella cartella (`git checkout origin/<ramo>-sNN -- <C>/referti/SNN.json`, solo dopo
la rilettura della riservatezza del CF se è l'ultima onda), poi `doppioni --cartella <C>`: scrive `doppioni.json` e
`trovati.txt`. Commit e push: l'onda dopo parte da quel commit e vede i trovati. **FERMATA 2** a Nicola: i difetti per
sessione e gravità, il costo misurato (`usage.cost_usd` di ogni figlia), la quota; si va avanti con «via la seconda».

## F2 — Il controllo finale e la chiusura

1. `doppioni --cartella <C>` su tutti i referti, poi `grezzo --cartella <C> --data <giorno>`: i difetti tenuti, senza
   doppioni né regressioni, con le riservate numerate (R dopo la più alta del registro). Da solo il programma toglie
   solo i difetti con la stessa chiave; le coppie soltanto simili restano dentro, in `doppioni.json` (`simili`,
   `simili_registro`), finché il controllore finale non le decide. Un referto rosso non entra nel grezzo.
2. **Il controllore finale** (`CF`): una sessione nuova su `ad-mycity`, ramo `<ramo della regista>-cf`, col prompt
   *«Sei il controllore finale della radiografia <C>. Leggi cervello/radiografia/LEGGIMI-verificatore.md (parte B) e
   controlla la cartella al commit <sha>.»* Rifà `conti` e `copertura-dopo`, fa rileggere la riservatezza a due
   `security`, rilancia tre prove a sorpresa, decide i simili e scrive `controllo-finale.json` (solo quel file sul suo
   ramo). Se toglie dei simili, si rifà `grezzo --cartella <C> --data <giorno> --togli <id,id>`: il programma accetta
   solo id che `doppioni` ha segnato come simili, e li scrive in `tolti`.
3. `conti --cartella <C>` verde: nessun difetto trovato è sparito, e `doppioni.json` è quello che il programma rifà da
   referti e registro. Con `conti` rosso non si scrive niente nel registro.
4. **Il registro**, nell'ordine: `git merge origin/main`; `applica --cartella <C> --data <giorno>` a vuoto, poi con
   `--scrivi` (i ricontrolli, le regressioni dei referti e quelle trovate da `doppioni`, per chiave); il grezzo copiato in
   `consegne/audit/<giorno>-radiografia-marketplace-raw.json` e `node cervello/radiografia-marketplace-digest.mjs`
   una volta sola, contando le voci prima e dopo; il referto `consegne/audit/<giorno>-radiografia.md` con
   `node cervello/si-capisce.mjs` verde.
5. La memoria (`STATO.md`, `LAVORO-APERTO.md`, `DECISIONI.md`, l'ESITO con `node cervello/chiusura-loop.mjs
   registra …`), poi `node cervello/cancello-lotto.mjs` e la PR fuori dalla bozza. Mai unire.
6. **Il messaggio finale** all'AD, con «Il punto adesso»: i bloccanti nuovi coi titoli detti a voce, i gravi, le
   chiusure, il conto misurato contro il preventivo, i buchi del CF, il link della PR. I dettagli delle falle solo in
   chat, riletti dalle trascrizioni delle sessioni.

## Le falle riservate

Il deposito `ad-mycity` è pubblico. Una falla si scrive in una forma sola (la stessa del risolutore:
`TITOLO_RISERVATO` di `riparazione-sessioni.mjs`), e `valida-referto` rifiuta ogni altra forma. I dettagli viaggiano
solo nelle chat delle sessioni: nel diario si scrive dove stanno (sessione e uuid dell'evento), mai cosa sono. Se un
dettaglio finisce in un ramo pubblico, si avvisa Nicola subito: cancellare o riscrivere un ramo lo decide lui.

## Quando ti fermi e chiedi a Nicola

- extra a pagamento (`isUsingOverage`) o un blocco della quota, prima di ogni onda e prima del CF;
- una sessione che ha scritto, o provato a scrivere, sul mondo vero;
- un bloccante che tocca soldi veri o la legge oggi: non si aspetta la fine;
- il commit del sito che non si scarica;
- agenti o costo oltre il preventivo della fermata 1;
- `conti` rosso, o una chiave che non aggancia una voce sola in `applica`;
- un dettaglio di una falla in un ramo pubblico;
- qualunque azione 🔴.

## I comandi del programma

| Comando | Cosa controlla | Uscita |
|---|---|---|
| `prepara` | profilo → piano, mappa, registro compatto, lotti; minori ammessi o no (⑳); tetto delle sessioni | 0 · 1 |
| `preventivo` | agenti, token e dollari stimati; se serve la firma (⑱) | 0 |
| `schede` | le schede dal piano, deterministiche | 0 |
| `copertura-prima` | la mappa rifatta dal sito, ogni file e voce in un lotto, lenti e angoli dentro o fuori, schede uguali al piano, partenza corta | 0 · 1 · 2 · 3 |
| `segnaposti` | nessun segnaposto nelle schede | 0 · 1 |
| `guardia-ramo` | il ramo cambia solo il suo referto, e nessun difetto già spinto sparisce dalla sua storia | 0 · 1 · 3 |
| `valida-referto` | formato, asticella, minori (⑳), verifica (⑲), tetto (⑱), lotti dichiarati, nessun id sparito, riservate | 0 · 1 · 3 |
| `sorveglia` | guardia e referto per ogni sessione dell'onda, una riga di diario | 0 · 1 · 3 |
| `doppioni` | stessa chiave contro il registro e fra le sessioni; i soli simili restano da decidere | 0 · 3 |
| `grezzo` | solo referti verdi, riservate a campi chiusi, chiavi uniche e nuove, `--togli` solo fra i simili | 0 · 1 |
| `conti` | ogni difetto trovato è nel grezzo, nei doppioni o fra i simili tolti; doppioni.json rifatto e confrontato | 0 · 1 · 3 |
| `applica` | ricontrolli e regressioni (dei referti e dei doppioni) sul registro, per chiave; mai coi rossi (`--scrivi`) | 0 · 1 |
| `copertura-dopo` | i file del perimetro letti o eseguiti | 0 · 3 |

L'uscita 2 vuol dire «non ho potuto misurare»: non è mai un verde. Le prove del programma:
`node --test cervello/test/radiografia-sessioni.test.mjs`, con le mutazioni in `cervello/mutanti.json` (difetto
`radiografia-in-sessioni`). I temi, i profili e le misure stanno in `cervello/radiografia/temi.json`.

## Il debito dichiarato

- La prima radiografia vera non è ancora partita: il preventivo è una stima, da rimisurare alla fermata 2.
- Il giro dei flussi che incassano in palestra non ha ancora un comando suo: lo fa un agente col metodo del 7/11.
- Lo stato delle figlie (`BLOCKED`) da bash non si vede: lo guarda la regista con `list_sessions`, ogni giro.
- Il controllo del CF (`controllo-finale.json`) non ha ancora un validatore del programma.
