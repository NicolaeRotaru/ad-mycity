---
name: radiografia-sessioni
description: >-
  Aprila PRIMA di lanciare qualunque radiografia del sito o del marketplace: è il manuale della regista per
  TROVARE i difetti del sito in sessioni parallele, a onde, con le stesse regole della riparazione — una regista
  in una sessione sua, fino a sei sessioni per onda che cercano a lotti, il ricontrollo delle voci aperte prima di
  ogni ricerca nuova, la verifica solo dove serve, i controlli fatti da un programma, e un preventivo dalle misure
  prima del via. Vale ogni volta che Nicola — in qualunque forma, anche detta male o a voce — chiede una
  radiografia del sito o del marketplace, di «analizzare tutto il sito», «trovare tutti i bug», cercare i difetti
  che fermano il lancio, rifare la radiografia «in N sessioni» o «a onde», guardare i difetti nati da una
  funzione, un ramo o una PR, o ricontrollare se le voci aperte del registro sono ancora vere. NON è la
  radiografia della macchina (`auto-radiografia`), del Pannello (`audit-pannello`) o del solo design
  (`audit-design`), non è la radiografia mentre si ripara (`radiografia-in-corsa.mjs`), e non RIPARA: i difetti
  trovati li ripara la skill `riparazione`.
---

# La radiografia del sito a onde — il manuale della regista

> Se sei l'AD e in questa sessione non hai ancora letto `cervello/MANUALE-AD.md`, leggilo adesso: questa
> skill non lo sostituisce, lo usa (regole ⑬-㉗ soprattutto).

> Nata il 12/11/2026 da Nicola: *«ora facciamo un bel lavoro anche sulla radiografia»*. Rifatta il 24/11 con le
> lezioni delle onde della riparazione: *«guarda come funzionano le ondate, dove hanno sbagliato e dove hanno fatto
> bene, e crea lo stesso sistema anche per la radiografia»*. Analisi: `consegne/audit/2026-11-24-radiografia-a-onde/lezioni.md`.
> I conti che contano (`cervello/radiografia/misure.json`): la radiografia del 6/11 è costata 327 $ di sessioni e
> 1.108 $ di regia, rimasta aperta sei giorni; il ricontrollo del 21/11 ha chiuso 117 voci con circa 130 $, cioè
> circa 1,1 $ a chiusa, contro 4-8 $ di una chiusura con riparazione nelle onde migliori.

## Le tre regole

1. **La regista non cerca.** Divide, sorveglia, unisce. Se apre il codice del sito, smette di vedere le sessioni.
2. **Prima i programmi, poi gli agenti.** Divisione, prepasso, lotti, schede, preventivo, controllo dei referti,
   doppioni, conti, misure: li fa `cervello/radiografia-sessioni.mjs`. Agli agenti restano le domande di giudizio.
3. **Chi trova non conferma.** Un grave, un bloccante, una falla o la chiusura di un grave entrano solo se un agente
   nuovo, partendo dalla prova, non è riuscito a smentirli.

## Le lezioni delle onde, portate qui (24/11)

Ogni regola dice chi la fa rispettare. «Solo testo» vuol dire che oggi nessun programma la frena: nella riparazione
tutte le regole solo testo sui costi sono state superate almeno una volta (regola ㉕ del manuale).

| # | La regola | Da dove viene | Chi la fa rispettare |
|---|---|---|---|
| 1 | **Prima il già trovato.** Il ricontrollo delle voci aperte viene prima di ogni ricerca nuova, e un programma toglie prima le voci con file e righe fermi dall'ultima conferma | 21/11: 214 voci su 673 tolte dallo script della campagna, 117 chiuse a circa 1,1 $ | `prepara` (prepasso), `copertura-prima` lo rifà |
| 2 | **Ultracode solo dove serve.** Ricontrollo diviso: le voci gravi in sessioni con ultracode, le minori senza. Cercatrici con ultracode solo nei temi a rischio alto | Riparazione: 2,22 $ a voce senza, 4,16 $ con (onde 1 e 2); il 21/11 ultracode su tutte e quattro | `prepara`, `copertura-prima` |
| 3 | **Il preventivo dalle misure con la stessa configurazione**, in tre cifre, per onda e in percentuale della settimana | Riparazione: l'onda 9 ha preso a memoria il 50% dell'onda 7; il terzo giro è finito a 17,76 $ a chiusa | `preventivo` |
| 4 | **Una novità alla volta.** La ricerca a lotti non è mai stata misurata: la prima onda porta il ricontrollo e al massimo due cercatrici | Regola 10 del 15/11 | `prepara` (onda pilota); la soglia per andare avanti è solo testo |
| 5 | **La regia corta.** Una regista per fase, aperta dalla sessione dell'AD, che passa la mano a 250 mila token e non resta aperta oltre la radiografia | 6/11: regia 1.108 $ in sei giorni; onda 9: 7 regie fino a 650 mila token, il 20% della spesa; settimana dei 700: catena a 7 livelli su 8, la regia nuova non si poteva più aprire | Solo testo |
| 6 | **La sorveglianza muta**: la regia si sveglia solo quando cambia qualcosa | Riparazione: 0,4-0,7 $ per giro a vuoto | `sorveglia --attendi`, `segnali` |
| 7 | **La sessione che non parte si vede.** Primo push entro 10 minuti; dopo 15 senza ramo il segnale «non partita» | Settimana dei 700: C02 ferma 52 minuti, il primo K02 mai partito | `segnali`; il primo push è nel LEGGIMI |
| 8 | **Il costo in dollari nel referto** | 21/11: nessuno dei quattro referti lo aveva | `valida-referto` |
| 9 | **La riga delle misure prima del registro** | Riparazione: `misure.json` fermo dal 17 al 21/11 mentre giravano quattro onde | `applica --scrivi` vuole `misura.json` |
| 10 | **La falla scoperta durante il ricontrollo**: ogni voce che resta aperta dice se è una falla, e se lo è i dettagli vanno solo in chat | 21/11: dettagli di dodici voci aperte nei rami pubblici, visti dal controllore finale dopo il push | `valida-referto` (anche sul referto parziale), `applica` → `da-riservare.txt` |
| 11 | **Il grave visto di passaggio ha un posto**, anche nel ricontrollo | 21/11: il rimborso «1.250,00» letto come 1,25 € non aveva dove andare | profilo `ricontrollo`, `valida-referto` |
| 12 | **Agent, mai Workflow**, e al massimo 12 subagenti per sessione | 21/11: i lotti lanciati con Workflow, 8-12 subagenti per lancio | il freno (`ruolo-freno: cercatore`) dove l'hook è incollato; in `ad-mycity` serve la firma di Nicola, altrimenti solo testo |
| 13 | **Una sessione con ultracode non si riavvia**: se si ferma a metà se ne apre una nuova, «SNN secondo», dalla punta del suo ramo | Onda 9: R01, K01 e K03 hanno perso ultracode al riavvio | Solo testo |
| 14 | **Il tetto non si alza a metà onda.** Se Nicola lo alza, si apre un'onda nuova col suo preventivo | Onda 2: tetto da 435 a 1.650 $, e ha smesso di frenare | Solo testo |
| 15 | **Le firme prima del via**, e la quota letta in app prima di un lavoro sopra i 100 $ | Settimana dei 700: firme a metà giro, circa 13 $ a chiusa; regola ㉗ | Solo testo |

**Cosa ha funzionato, da tenere.** Il ricontrollo: è la chiusura più economica che la casa conosca. Chi trova non
conferma: il 21/11 il controllore finale ha confermato tre chiusure gravi con le mutazioni, e ha trovato i dettagli
delle falle nei referti. I lotti piccoli a subagenti nuovi: le storie sono rimaste corte. Un ramo, un file solo,
guardato da `guardia-ramo`.

---

## Passo 0 — Capire la richiesta (30 secondi, zero agenti)

**Il profilo.** Si ricava dalla frase; se non si deduce, **una** domanda.

| Profilo | Frasi tipo | Cosa fa |
|---|---|---|
| `ricontrollo` | «quali voci aperte non sono più vere», «ripulisci il registro», e il primo passo di ogni radiografia larga | solo S01, diviso fra voci gravi e minori; nessuna ricerca, ma un grave visto di passaggio si scrive |
| `lancio` | «cosa ferma il lancio», «radiografia prima di aprire», e ogni «radiografia del sito» finché i minori aperti sono più di 100 | S01 sui gravi aperti + S02-S08, solo bloccanti e gravi; prima il giro dei flussi che incassano in palestra |
| `tutto` | «analizza tutto il sito», «rifai la radiografia in 12 sessioni» | tutti i 12 temi; i minori nuovi solo con 100 minori aperti o meno |
| `funzione` | «i difetti della funzione X», «della PR N», «del ramo …» | `--diff base..testa`: solo i file cambiati e i temi che li possiedono |
| `scelta` | «guarda solo i pagamenti e la sicurezza» | `--temi S02,S04` |

**Prima il già trovato (regola 1).** Se l'ultimo ricontrollo ha più di una settimana, o da allora sono state unite
riparazioni, la radiografia larga parte col profilo `ricontrollo` e poi, con un altro «via», cerca. Il freno del
tasso di chiusura (`node cervello/tasso-chiusura.mjs --gate`, manuale dell'AD) ferma le ricerche nuove, non il
ricontrollo: chiude voci e non ne apre.

**La regola che sceglie da sola (⑳).** Con più di 100 minori aperti nel registro non si cercano minori nuovi:
`prepara` lo scrive nel piano e `valida-referto` rifiuta un minore nuovo (una falla riservata entra anche se minore).

**La misura.** Con una o due sessioni la regia a parte non serve: la sessione dell'AD fa da regista. Con tre o più,
la regia va in una sessione sua (regola ㉔). Oltre 18 sessioni (`prepara` è rosso) si restringe col profilo
`scelta` o si divide in due radiografie.

## F0 — Preparazione (l'AD, programmi, 15-20 minuti)

Tutti i comandi dalla radice di `ad-mycity`, con `C=consegne/radiografia/AAAA-MM-GG-<profilo>` (il giorno da
`giornoPiacenza()`).

1. **La quota.** `get_session` senza argomenti: con `isUsingOverage` o un blocco non si parte. Sopra i 100 $ di
   preventivo si chiede a Nicola la percentuale che vede nell'app (㉗).
2. **Il codice.** `node cervello/collega-marketplace.mjs`, poi `BASE=$(git -C marketplace rev-parse HEAD)` (40
   caratteri). Tutte le sessioni guardano quel commit e nessun altro. Più storia ha la copia, più voci il prepasso
   toglie: con la storia corta, nel dubbio, le manda agli agenti.
3. **La palestra prima** (se il profilo la chiede): un giro dei flussi che incassano sulla copia del sito, con un
   agente solo (`consegne/audit/2026-11-07-palestra/`). Se la palestra è spenta lo si dice alla fermata 1.
4. **Il piano:**
   `node cervello/radiografia-sessioni.mjs prepara --profilo <…> --base $BASE --cartella $C [--temi …] [--diff a..b] [--ultracode dove-serve|no|tutte]`
   Scrive `piano.json`, `mappa-file.txt`, `registro-compatto.txt`, `prepasso.json`, `prepasso.tsv`,
   `da-ricontrollare.txt` e `lotti/`. `--senza-prepasso` solo se lo dice Nicola.
5. **Il preventivo:** `preventivo --cartella $C`. Dice, sessione per sessione, da quale misura viene ogni cifra; il
   minimo, l'atteso e il massimo; il costo per onda; la percentuale della settimana; le chiusure attese del
   ricontrollo e il loro costo; le sessioni mai misurate. Se un numero viene dalla stima, la prima onda è un pilota.
6. **La soglia del pilota, scritta prima** (solo testo, regola 4). Quando il piano ha `onda_pilota`, la regia scrive
   in `REGIA.md`, prima del via, quando si va avanti: per esempio «la seconda onda parte solo se le cercatrici del
   pilota sono costate al massimo il doppio della stima, e hanno portato almeno un grave o un bloccante verificato».
7. **Le schede:** `schede --cartella $C --ramo <ramo della regista> --regista <id della regista>`. Con la regia in
   una sessione sua, le schede le scrive lei.
8. **I controlli:** `copertura-prima --cartella $C` verde (rifà la scelta delle voci e il prepasso, e guarda
   ultracode e la divisione fra gravi e minori) e `segnaposti --cartella $C` verde.
9. Commit e push di `$C` sul ramo: lo SHA dopo le schede è `SHA_REGISTA`. La PR in bozza su `ad-mycity`.
10. **FERMATA 1**, a Nicola con «Il punto adesso»: il profilo e il perché; quante voci ha tolto il prepasso; le
    sessioni e le onde, con ultracode dove c'è; cosa resta fuori (`lenti_fuori`, `angoli_fuori`); le tre cifre del
    preventivo e la percentuale della settimana; le chiusure attese; la soglia del pilota; lo stato della palestra; le
    firme che servono, tutte adesso (regola 15). Si parte solo col suo «via».

## F1 — La regia e le onde

**Aprire la regista** (con tre sessioni o più). La apre sempre la sessione dell'AD, anche quando passa la mano:
una regista aperta da un'altra regista scende di un livello, e al settimo non se ne apre più una (regola 5).
`create_session` con `source_url` = `ad-mycity`, `outcome_branch` = il ramo della radiografia, `effort: "xhigh"`,
`permission_mode: "auto"`. Il prompt è una riga: *«Sei la regista della radiografia <C>. Leggi
.claude/skills/radiografia-sessioni/SKILL.md e <C>/REGIA.md, poi continua da lì. Nicola parla con l'AD nella
sessione <id>: le fermate e l'esito vanno lì con send_message.»* `<C>/REGIA.md` è il quaderno di bordo, 80 righe al
massimo: le scelte di Nicola, la soglia del pilota, lo stato, il prossimo passo, i comandi esatti.

**La regia corta** (solo testo). A ogni risveglio la regista legge il suo `get_session` senza id: sopra i 250 mila
token scrive `<C>/PASSAGGIO-N.md` (come quello della riparazione), lo manda all'AD, e l'AD apre la regista nuova.
Prima di ogni messaggio a Nicola o all'AD, due costi: quello della sua sessione e quello del lavoro del turno.

**Aprire le cercatrici dell'onda**, una `create_session` per sessione:
- `source_url` = `https://github.com/NicolaeRotaru/ad-mycity`; `source_revision` = `SHA_REGISTA` (dall'onda 2: lo
  SHA del commit con `trovati.txt`); `outcome_branch` = `<ramo della regista>-sNN`;
- `effort: "xhigh"`, `permission_mode: "auto"`, mai `"plan"`; tag `radiografia-<profilo>` e `onda-N-cercatrici`;
  titolo «SNN», mai un dettaglio di una falla;
- **ultracode come dice il piano** (`piano.sessioni[SNN].ultracode`): con ultracode il `prompt` è esattamente
  `/effort ultracode` e il compito arriva subito dopo con `send_message`; poi `get_session` deve dire
  `is_ultracode_active` true. Senza ultracode il compito va direttamente nel `prompt`;
- il compito, due righe: *«ruolo-freno: cercatore
  Sei la sessione SNN della radiografia. Leggi cervello/radiografia/LEGGIMI-cercatore.md e <C>/schede/SNN.md, poi
  lavora: il divieto del §1 vale per te e per ogni subagente. La regista è <id>.»*

Gli id, i rami, le partenze e l'ora d'apertura vanno in `<C>/sessioni.json`:
`{"regista": "<id>", "sessioni": {"S02": {"id": "…", "ramo": "…-s02", "onda": 1, "partenza": "<SHA_REGISTA>", "aperta": "AAAA-MM-GG HH:MM"}}}`.
Senza `aperta` il segnale «non partita» non si può dare.

**La sorveglianza muta** (regola 6). Dopo l'ultima apertura, in sottofondo (`run_in_background`):
`node cervello/radiografia-sessioni.mjs sorveglia --cartella <C> --onda N --attendi`.
- **Esce 1** con un segnale nuovo (ramo, finita, ferma, non partita, attesa, spesa oltre il 70% o il 100% del
  preventivo, quota). La regista guarda: `sorveglia --cartella <C> --onda N` senza `--attendi` fa `guardia-ramo` e
  `valida-referto` su ogni referto e stampa i rossi. Corregge con `send_message`, aggiunge i segnali visti a
  `<C>/rossi-noti.txt` e rilancia l'attesa. Una scrittura sul mondo vero si ferma con `interrupt_session` e si
  avvisa Nicola.
- **Esce 4** al battito (due ore senza novità): `get_session` di sé stessa, `list_sessions` (limit 20), poi scrive
  `<C>/stato-sessioni.json` = `{"aggiornato": "…", "sessioni": {"S02": {"stato": "BLOCKED"}}, "spesa_usd": N,
  "quota": {"status": "…", "isUsingOverage": false}}` con la somma dei `cost_usd` delle figlie. Da bash lo stato delle
  sessioni non si vede: questo file è come il programma lo sa. Poi rilancia l'attesa.
- Una figlia `BLOCKED` su un clic che solo Nicola può dare si dice all'AD subito, col nome della sessione.
- Oltre il preventivo atteso ci si ferma e si dice a Nicola (regola 14).

**Fine onda.** I referti nella cartella (`git checkout origin/<ramo>-sNN -- <C>/referti/SNN.json`), poi
`doppioni --cartella <C>`: scrive `doppioni.json` e `trovati.txt`. Commit e push: l'onda dopo parte da quel commit.
Le figlie finite e verdi si archiviano (`archive_session`). **FERMATA 2** a Nicola: i difetti per sessione e
gravità, le chiusure del ricontrollo, il costo misurato per sessione (`conto.usd` dei referti e `cost_usd` di
`get_session`) contro il preventivo di quell'onda, la soglia del pilota (passata o no), la quota. Si va avanti solo
con «via la seconda».

## F2 — Il controllo finale e la chiusura

1. `doppioni --cartella <C>` su tutti i referti, poi `grezzo --cartella <C> --data <giorno>`: i difetti tenuti, senza
   doppioni né regressioni, con le riservate numerate. Le coppie soltanto simili restano finché il controllore
   finale non le decide.
2. **Il controllore finale** (`CF`): una sessione nuova su `ad-mycity`, ramo `<ramo della regista>-cf`, col prompt
   *«Sei il controllore finale della radiografia <C>. Leggi cervello/radiografia/LEGGIMI-verificatore.md (parte B) e
   controlla la cartella al commit <sha>.»* Rifà `conti` e `copertura-dopo`, fa rileggere la riservatezza a due
   `security` (anche i ricontrolli con `falla: false`), verifica le chiusure gravi rimaste `non_verificabile`,
   rilancia tre prove a sorpresa, decide i simili, scrive `controllo-finale.json` col suo costo. Se toglie dei
   simili, `grezzo … --togli <id,id>`.
3. `conti --cartella <C>` verde. Con `conti` rosso non si scrive niente nel registro.
4. **La riga delle misure** (regola 9): `misura --cartella <C> --usd-regia <somma delle regie> --usd-cf <costo del CF>`,
   poi con `--scrivi`. Va in `cervello/radiografia/misure.json`, una volta sola. È da lì che si farà il prossimo
   preventivo.
5. **Il registro**, nell'ordine: `git merge origin/main`; `applica --cartella <C> --data <giorno>` a vuoto, poi con
   `--scrivi` (vuole `misura.json`). `applica` scrive `<C>/da-riservare.txt`: le voci pubbliche che il ricontrollo ha
   scoperto essere falle, più quelle del CF. Si chiede a Nicola se renderle riservate nel registro, voce per voce.
   Poi il grezzo in `consegne/audit/<giorno>-radiografia-marketplace-raw.json` e
   `node cervello/radiografia-marketplace-digest.mjs` una volta sola, contando le voci prima e dopo; il referto
   `consegne/audit/<giorno>-radiografia.md` con `node cervello/si-capisce.mjs` verde.
6. La memoria (`STATO.md`, `LAVORO-APERTO.md`, `DECISIONI.md`, l'ESITO con `node cervello/chiusura-loop.mjs
   registra …`), poi `node cervello/cancello-lotto.mjs` e la PR fuori dalla bozza. Mai unire. La regista si
   archivia: non resta aperta dopo la radiografia (regola 5).
7. **Il messaggio finale** all'AD, con «Il punto adesso»: i bloccanti nuovi coi titoli detti a voce, i gravi, le
   chiusure, il conto misurato contro il preventivo, le voci da rendere riservate, i buchi del CF, il link della PR.

## Le falle riservate

Il deposito `ad-mycity` è pubblico. Una falla nuova si scrive in una forma sola (`TITOLO_RISERVATO` di
`riparazione-sessioni.mjs`), e `valida-referto` rifiuta ogni altra forma. Una voce pubblica che il ricontrollo scopre
essere una falla porta `falla: true`, con prova, esito e nota `"(nel referto privato)"`. I dettagli viaggiano solo
nelle chat delle sessioni: nel diario si scrive dove stanno (sessione e uuid dell'evento), mai cosa sono. Se un
dettaglio finisce in un ramo pubblico, si avvisa Nicola subito: cancellare o riscrivere un ramo lo decide lui.

## Quando ti fermi e chiedi a Nicola

- extra a pagamento (`isUsingOverage`) o un blocco della quota, prima di ogni onda e prima del CF;
- una sessione che ha scritto, o provato a scrivere, sul mondo vero;
- un bloccante che tocca soldi veri o la legge oggi: non si aspetta la fine;
- la soglia del pilota non passata;
- agenti o costo oltre il preventivo atteso dell'onda (il segnale «spesa oltre il 100%»);
- `conti` rosso, o una chiave che non aggancia una voce sola in `applica`;
- un dettaglio di una falla in un ramo pubblico, e le voci di `da-riservare.txt`;
- qualunque azione 🔴.

## I comandi del programma

| Comando | Cosa controlla | Uscita |
|---|---|---|
| `prepara` | profilo → piano, mappa, registro compatto, prepasso, lotti; ricontrollo diviso fra gravi e minori; ultracode; onda pilota; minori ammessi o no (⑳) | 0 · 1 · 2 |
| `preventivo` | dollari dalle misure con la stessa configurazione, tre cifre, per onda, percentuale, chiusure attese; se serve la firma | 0 · 1 |
| `schede` | le schede dal piano, deterministiche | 0 |
| `copertura-prima` | la mappa rifatta dal sito, la scelta delle voci e il prepasso rifatti, ultracode e divisione gravi/minori, ogni file e voce in un lotto, schede uguali al piano, partenza corta | 0 · 1 · 2 · 3 |
| `segnaposti` | nessun segnaposto nelle schede | 0 · 1 |
| `guardia-ramo` | il ramo cambia solo il suo referto, e nessun difetto già spinto sparisce | 0 · 1 · 3 |
| `valida-referto` | formato, asticella, minori (⑳), verifica (⑲), tetto (⑱), costo in dollari, falla dei ricontrolli, lotti, id, riservate | 0 · 1 · 3 |
| `sorveglia` | guardia e referto per ogni sessione dell'onda; con `--attendi`, la sorveglianza muta | 0 · 1 · 3 · 4 |
| `segnali` | i segnali nuovi: ramo, finita, ferma, non partita, attesa, spesa, quota | 0 · 1 · 2 |
| `doppioni` | stessa chiave contro il registro e fra le sessioni; i soli simili restano da decidere | 0 · 3 |
| `grezzo` | solo referti verdi, riservate a campi chiusi, `--togli` solo fra i simili | 0 · 1 |
| `conti` | ogni difetto trovato è nel grezzo, nei doppioni o fra i simili tolti | 0 · 1 · 3 |
| `misura` | la riga delle misure dai referti e dai costi di regia e CF; con `--scrivi` in `misure.json`, una volta sola | 0 · 1 · 3 |
| `applica` | ricontrolli e regressioni sul registro, per chiave; `da-riservare.txt`; con `--scrivi` vuole `misura.json` | 0 · 1 |
| `copertura-dopo` | i file del perimetro letti o eseguiti | 0 · 3 |

L'uscita 2 vuol dire «non ho potuto misurare»: non è mai un verde. Le prove del programma:
`node --test cervello/test/radiografia-sessioni.test.mjs`, con le mutazioni in `cervello/mutanti.json` (difetti
`radiografia-in-sessioni` e `radiografia-a-onde`). Temi, profili, misure del metodo e stima: `cervello/radiografia/temi.json`.

## Il debito dichiarato

- La ricerca a lotti non è mai stata misurata: il suo preventivo è una stima, e per questo c'è l'onda pilota.
- La soglia del pilota, la regia corta, il tetto che non si alza e le firme prima del via sono solo testo.
- Il freno sugli agenti conta le cercatrici solo dove l'hook è incollato: in `ad-mycity` lo decide Nicola.
- Riconoscere una falla resta un giudizio: il programma obbliga a dichiararlo voce per voce, non lo può decidere.
- Il giro dei flussi che incassano in palestra non ha ancora un comando suo.
- Lo stato delle figlie lo vede solo la regia (`list_sessions`), e lo passa al programma con `stato-sessioni.json`.
- Il controllo del CF (`controllo-finale.json`) non ha ancora un validatore del programma.
