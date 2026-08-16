# 📌 Bacheca — da sapere

> La bacheca della Cabina: qui l'AD appunta le informazioni importanti che devono
> restare sott'occhio (costi, regole, decisioni di contesto, cose da non dimenticare).
> Il Pannello la mostra nella home. Formato di ogni avviso:
> `## <emoji> Titolo · AAAA-MM-GG HH:MM` — corpo in markdown; il Pannello ordina
> gli avvisi per data (più recenti in alto). Un avviso superato si toglie da qui.

## 🏗️ Le tre macchine, come sarà MyCity quando è finita · 2026-08-03 22:20

**Come sarà.** Oggi c'è una macchina sola che fa tutto. Domani ce ne saranno tre, ognuna con un
mestiere solo. Una dirige l'azienda. Una manda avanti il marketplace. Una lavora dentro i negozi dei
commercianti. L'ultima è una sola per tutti i negozi, non una per ciascuno.

```
                    NICOLA — una Cabina, una coda di firme
                                   ▲ rapporti · firme 🔴
              ①  CENTRO OPERATIVO  (strategia · soldi · squadra · memoria)
                   ├── obiettivi ▼ rapporto ▲ ──►  ②  PIAZZA   ──► il marketplace
                   └── obiettivi ▼ rapporto ▲ ──►  ③  BOTTEGA  ──► 🥖🥩💐🧀 … × 41 negozi
```

| | Nome | Mestiere | Se sbaglia, il danno è | Chi firma i suoi 🔴 |
|---|---|---|---|---|
| ① | **CENTRO** | dirigere l'azienda | una decisione | Nicola |
| ② | **PIAZZA** | mandare avanti il marketplace | il sito, non l'azienda | Nicola, via CENTRO |
| ③ | **BOTTEGA** | lavorare dentro i negozi | un negozio, non gli altri 40 | il negoziante |

**La tua domanda.** Come fa una macchina sola a servire tutti i negozi. La regola è una. Quello che è
uguale per tutti è codice, e si scrive una volta sola. Quello che è diverso per ognuno è un dato, e
sta in una riga col nome del negozio. Non si duplica mai la macchina per personalizzarla. Si compila
una scheda. Il negoziante numero 41 non fa nascere una macchina. Fa nascere una riga. E una miglioria
scritta una volta ce l'hanno tutti la mattina dopo.

**Il muro dei dati.** Non è il buon senso dell'AI a tenere separati i negozi. È il database che
rifiuta di dare a un negozio le righe di un altro. È lo stesso muro che il marketplace usa già oggi.

**Il piano.** Quattro fasi. Ognuna serve a qualcosa anche da sola. Solo la Fase 1 ha senso adesso.
Fa passare tutte le scritture verso il marketplace da un punto solo. Sono giorni di lavoro. Le altre
tre aspettano Vercel, i primi incassi e una tua parola.

**Il collaudo.** L'architettura è finita quando passano sette prove. Le due che contano di più sono
queste. Un secondo negozio finto non riesce a leggere i dati del primo. E tu vedi una coda di firme
sola invece di tre.

**La BOTTEGA non è un'idea nuova.** È la linea di ricavo numero 2 che hai definito il 29 luglio. Il
listino resta quello. Qui aggiungo solo com'è fatta la macchina che lo eroga. Nessuna mossa
commerciale finché non sei tu ad aprirla. Manca un numero solo. Quanto costa in AI servire un negozio
per un mese. Senza quello, il margine del listino è un'ipotesi.

**Onestà sul quando.** Questa è la forma giusta a 40 negozi e 2 città. Oggi c'è un negozio reale e il
sito è fermo dal 30 luglio. Costruirla tutta adesso sarebbe lavoro pesante su un'ipotesi.

📄 Il documento intero è [[ARCHITETTURA-TRE-MACCHINE]]. Il listino sta in
`consegne/strategia/2026-07-29-listino-worker-negozi.md`. Il fatto a registro è
`architettura.tre-macchine`.

## 🧭 Glossario della macchina — tutte le parole, per famiglie · 2026-08-01 10:54

**Perché esiste questo avviso.** Quasi nessuna parola strana della macchina descrive *come si fa* una
cosa: descrivono **come si dimostra di averla fatta**. Una macchina che lavora da sola ha due modi di
fare danno. Il primo è **agire senza permesso** (spendere, scrivere a un cliente, pubblicare). Il secondo
è **raccontare una bugia** (un numero inventato, un negozio che non esiste, un «fatto» che non è stato
fatto). Tutto il vocabolario qui sotto serve a rendere difficili quelle due cose. Davanti a ogni termine la domanda
giusta non è «cosa fa?», ma **«da quale bugia o da quale sorpresa mi sta proteggendo?»**.

> 🆕 **Versione 2.** La prima (31/7) copriva solo le parole delle *difese*. Mancavano tutte quelle del
> **come si ripara** — pavimento, tetto, potatore, freno, aggancio, regressione, lotto, spazzata, sonda,
> watch-main — ed erano proprio quelle che Nicola ha chiesto due volte di fila. Adesso ci sono tutte.

### ① Le difese: chi guarda cosa

| | 👁️ Sensore | 🛰️ Sentinella | 📡 Radar | 🛡️ Guardiano | 🚦 Cancello |
|---|---|---|---|---|---|
| **Cos'è** | Un occhio | Una sveglia | Un orecchio sul mondo | Un ispettore | Un esame all'uscita |
| **Cosa guarda** | Il reale | I **dati del business** | Il mondo **fuori** | La **macchina stessa** | Il singolo lavoro |
| **Se trova** | Riporta e basta | Sveglia l'AD | Accoda un'occasione | Segnala, e 36 fermano il giro | **Blocca**: non esce |
| **Quanti** | 11 | 10 attive | ~50 fattori | 74 a ogni giro | 3 livelli |

- **Sensore** — sola lettura, sempre. Il concetto importante è il suo contrario: **cieco** (chiave
  scaduta, servizio giù). Quando è cieco lo deve *dichiarare*, e non può scrivere numeri nuovi.
  **Cieco e onesto vale più di sicuro e inventato.** E *spento ≠ non configurato*: mai collegato è una
  scelta, si è rotto è un guasto — confonderli nasconde il guasto dietro la scelta.
- **Sentinella** — costa zero (è codice, non AI): ordine pagato senza payout da 24h → 🔴 · ordini giù
  del 30% → 🟢 · recensione ≤2 stelle → 🟡. **Guardare non costa, pensare costa.** Non può mai far
  partire un'azione reale: accoda solo proposte.
- **Radar** — il gemello esterno: cosa ci influenza (IN) e su cosa possiamo agire noi (OUT).
- **Guardiano** — la sentinella guarda il *business*, il guardiano guarda la *macchina*. In famiglie:
  numeri-veri · rotta · apprendimento · cantiere · sicurezza · squadra · soldi-macchina · tempo · test · mani.
- **Cancello** — non un controllo, un **momento**. *«Dai per scontato che almeno un errore ci sia, e
  trovalo»*: **L1** checklist · **L2** un agente col solo compito di demolirlo (se trova un buco, vince
  lui) · **L3** più revisori con lenti diverse, e si vota.
- **Guardia viva** — *«un verdetto che non arriva a nessuna decisione non è una protezione»*.
- **Sorvegliante** — la revisione che gira **mentre** si lavora, non alla fine.

### ② I limiti: pavimento, tetto, freno
- **Pavimento** — il minimo garantito. Trappola: un pavimento *fisso* smette di misurare. Caso vero: la
  soglia dei kit era 5.200 byte, **82 byte sotto il file più piccolo** — nessuno poteva essere bocciato.
- **Tetto** — due sensi opposti: ① il debito tollerato, che **scende quando curi e non risale mai**;
  ② il soffitto di qualità raggiungibile col carburante che c'è (*«alza il tetto, non abbassare lo standard»*).
- **Soglia** — se non può mai essere superata non è una soglia: *un tetto mai superato è indistinguibile
  da un tetto che non c'è*.
- **Freno** — un impedimento che **scatta da solo**, l'opposto di un promemoria. Il conto di non averlo
  capito: **269 correzioni di Nicola, 0 freni costruiti, 83% su temi già visti**. Il freno va sull'**atto**,
  non sul punto d'ingresso: sennò il bug torna da un'altra strada.

### ③ Il cantiere: le parole della riparazione
**Cantiere** = i difetti trovati su sé stessa · **AR-001, AR-002…** = un difetto col suo codice · **lotto** = i
difetti curati insieme perché **condividono la malattia** · **malattia** = la *forma* di bug che si
ripete · **fratelli** = le altre istanze, altrove · **spazzata** = la caccia ai fratelli · **causa
radice** = si arriva alla quinta domanda, non alla prima · **regressione** = rottura nuova (blocca
subito, e deve dire da cosa) · **debito ereditato** = le magagne vecchie (si misurano, non bloccano).

- **Prova** — tre qualità: **comportamentale** (esegue: buona) · **a pattern** (certifica che una cosa
  *esiste*, non che *funziona*: debole) · **con OR** (passa quasi sempre: non dice niente).
- **Mutazione** — il concetto più raffinato della casa: si **rompe il fix apposta** e si pretende il
  rosso. Se il test resta verde, quella prova non provava niente.
- **Spazzata** — *«l'hai risolto, o hai curato una copia sola?»* Precedenti veri: lotto 3, cinque script
  pubblicavano e **uno solo** aveva il cancello; lotto 10, il freno costi aveva **tre** buchi, non uno.
  **Un difetto è chiuso quando la malattia smette di potersi ripresentare**, non quando quel punto guarisce.

**Le 7 malattie censite, col loro nome vero:** ① l'esito di un guardiano finisce in una pipe e sparisce ·
② un campo assente diventa uno zero, e lo zero rassicura · ③ un errore viene ingoiato e la schermata dice
che va tutto bene · ④ si dichiara «fatto» ciò che nessuno ha confermato · ⑤ una cadenza si costruisce da
sé le protezioni invece di ereditarle · ⑥ il perimetro di un controllo è dedotto dagli esempi invece che
misurato sul codice · ⑦ una fonte letta a metà produce un verdetto intero.

### ④ La verità e la misura
- **Cieco (e l'uscita 2)** — ogni guardiano ha tre esiti: **0** passa · **1** violazione vera · **2**
  *non ho potuto misurare*. **Il 2 non è un verde.** Nella visita di salute: ✅ · ❌ · **⚪ non l'ho
  potuto vedere da qui** — e ⚪ non è mai un verde.
- **Misura cieca** — *«una misura che non può dire di no non è una misura»*.
- **Misura parziale** — un voto costruito su un pezzo e mostrato come intero: **il numero migliora
  proprio quando la realtà peggiora**, perché i pezzi peggiori sono quelli che il filtro butta fuori.
- **Perimetro** — il recinto entro cui un controllo guarda, *disegnato a mano una volta e mai più
  confrontato con la realtà*.
- **Numero orfano** — una cifra senza fonte. Vietata. · **Verifica avversariale** — «verificato» senza
  che nessuno abbia provato a smontarlo non vale. · **Pre-mortem** — *«tra un mese è andata male:
  perché?»*, chiesto prima.
- **Carburante** — ciò che manca per lavorare al massimo (foto vere, un dato, una chiave, una decisione):
  *non abbassare lo standard, alza la richiesta*. · **Debito dichiarato** ≠ lavoro finito.

### ⑤ L'apprendimento: dove finisce una correzione di Nicola
**Lezione → gate → mutazione → volano.** La catena serve a una cosa: che una correzione non muoia in una frase.

- **Gate** — il guardiano agganciato alla lezione. **Vero** solo se ① il file esiste ② esiste una
  mutazione che lo fa scattare ③ la mutazione trova ancora il suo pezzo. Senza la ②, scrivere `gate:`
  fa +1 nella pagella **senza nessuna difesa costruita**.
- **Aggancio** — collegare la difesa al **momento che conta**: il cancello del lotto esisteva ed era
  buono, ma *non era agganciato al merge* — e due PR sono entrate con la prova rossa.
- **Volano** — lavora → si controlla → impara → migliora. Era costruito in modo da **non poter mai dire di no**.
- **Quaderno / chiusura del loop** — dopo ogni lavoro serio si scrive cosa ci si aspettava e cosa è
  successo. **Atteso → reale**: chi ci prende guadagna autonomia, chi sbaglia la perde.
- **Previsione verificabile** — *«una previsione che nessuno può smentire è una frase scritta dopo»*.
- **Potatura** — togliere dai file vivi ciò che è morto (va in `Storico/`). *Si pota solo ciò che è già
  morto: una lezione attiva non si tocca mai.*
- **Sonda** — il controllo leggero a ogni giro; se un segnale resta basso 3 giri di fila **chiama la
  radiografia**. *La sonda informa, il gate pretende.* · **Radiografia** — la visita profonda (del sito,
  o di sé stessa). · **Gusto** — il registro dei verdetti di Nicola. · **Pagella** — i 5 numeri che
  dicono se è pronta per il business.

### ⑥ Il corpo: worker, ritmo, economia
**Worker** = le braccia sul VPS, l'unico pezzo che fa succedere le cose · **coda** = `in attesa` → `in
corso` → `fatto`/`errore` · **orfano** = un lavoro il cui padrone è morto · **watch-main** = tiene il VPS
allineato a `main`, sennò il worker gira col cervello di ieri · **battito esterno** = chi controlla che
sia viva **da fuori** (nato da 40 ore di VPS fermo e nessun allarme, perché il controllore abitava
dentro) · **lucchetto** = la protezione sulla cartella condivisa · **porta** = un punto che pubblica ·
**uscita** = un punto che tocca il mondo · **mano** = il canale con cui *cambia* il mondo (5: email,
Telegram, Instagram, Facebook, Google Business) · **pausa** = l'interruttore dal Pannello · **ramo
pulito** = *il ramo porta solo il suo lavoro* (**21 correzioni di Nicola** su questa cosa sola).

**L'economia:** **delta-gate** (niente di nuovo → l'AI non si accende) · **letargo** (spegne il superfluo
in ordine inverso d'importanza e tiene il nucleo vitale: ordini, consegne, firma, sicurezza) ·
**metabolismo** (quanto consuma, per trasformare la quota da vincolo a leva) · **banco AI** (l'AI più
economica capace) · **freno costi** (*se non sa quanto ha speso oggi, non finge che sia zero*).

### ⑦ Il lavoro dei senior
**Doer mode** = si consegna il lavoro fatto, non l'analisi di cosa fare · **consegna** = il file finito ·
**card** = una riga della coda coi due campi che leggi tu (**cosa cambia** / **se va bene**) · **firma** =
il tuo sì, l'unica cosa che trasforma una proposta in un fatto · **scrittura umana** = il titolo si capisce
a voce, senza sigle (*se poteva scriverlo un terminale, riscrivilo*) · **faro** = il negozio su cui va lo
sforzo pesante · **registro della realtà** = confermata / scelta ragionata / da verificare (quest'ultima è
il vero «inventato», e blocca) · **allocazione** = niente lavoro pesante su chi non ha firmato · **caccia** =
il valore vecchio di un fatto, inseguito in tutti i file vivi · **owner unico** = un mandato, un padrone ·
**capacità** = le 53 funzioni di lungo periodo, 46 ancora chiuse dietro un cancello di realtà.

### ⑧ La Cabina: le parole sullo schermo
**Bacheca** (queste schede) · **Cuore** (il battito: consumo, giri, worker) · **Bussola / Stelle Polari**
(dove andiamo e il numero che conta) · **Governo AD** (decisioni e colori) · **Arsenale** (capacità e
strumenti) · **Lettera a Nicola** (il racconto in italiano) · **Memoria viva** (chat e briefing da
qualunque dispositivo) · **Quaderni senior** · **Scoperte e proposte** · **Grafo d'influenza** (cosa muove
cosa) · **Diagnostica worker**.

### Se dimentichi tutto il resto, quattro cose
1. **Sensore = un occhio · sentinella = il business · guardiano = la macchina · cancello = l'uscita.** Le ultime tre sono difese, la prima è un senso.
2. **Il colore comanda su tutto.** Nessun automatismo può far partire un 🔴 al posto tuo.
3. **Cieco e onesto vale più di sicuro e inventato.** Ogni ⚪ e ogni «2» esistono per questo.
4. **Una tua correzione si chiude con un freno, non con una frase.** Tutto il resto del vocabolario serve a rendere quel freno dimostrabile.

> 📖 **Il resto** — il giro spiegato passo per passo (15 passi), i 7 livelli di comprensione e ogni voce
> per esteso stanno in `MyCity-Vault/90-Memoria-AI/GLOSSARIO.md`, la versione completa di questo avviso.
>
> 🔗 **Le tre schede si leggono in quest'ordine** — questa (*cosa vogliono dire le parole*) → «🛡️ I
> guardiani della macchina» (*l'elenco dei singoli controlli, uno per uno*) → «🗺️ Com'è fatta la
> macchina» (*i 9 pezzi e quanto sono grandi*). La prima serve a capire le altre due.
>
> 📊 **Fotografia del 2026-08-01 10:54** — tutti riletti dai comandi adesso, non copiati dal 31/7:
> **74 guardiani a ogni giro, 36 bloccanti**, su **158** script (fonte: `guardiani-check.mjs`) ·
> **120 senior, 11 sensori, 5 mani, 13 servizi, 5 skill, 5 workflow** (fonte: `mappa-macchina.json`) ·
> **28 fatti-chiave** e **North Star a 0** ordini consegnati (fonte: `registro-fatti.json`) ·
> **409 difetti** su sé stessa, **162 aperti** (fonte: `cantiere-difetti.json`) ·
> **487 lezioni**, **31 con un freno vero** (fonte: `apprendimento.json`) ·
> **7 malattie** censite · **53 capacità**, 46 ancora chiuse.
>
> ⚠️ **Tre numeri della fotografia del 31/7 erano già invecchiati in un giorno** — 157 → **158** script,
> 408 → **409** difetti, 27 → **28** fatti-chiave. Non erano bugie: erano fotografie vecchie lasciate in
> un file vivo. **È esattamente il mestiere del guardiano `coerenza-fatti`**, ed è la ragione per cui
> questi numeri vanno riletti dai comandi e mai copiati a memoria.

## 📒 Registro dei fatti — fonte unica della verità · 2026-07-29 16:20

Specchio umano di `registro-fatti.json` (AR-102): qui vivono i fatti-chiave del business già concordati/verificati. Se un fatto cambia nel registro, questa tabella si riscrive nello stesso momento — niente copie vecchie in giro.

| Fatto | Valore | Aggiornato |
| --- | --- | --- |
| Negozio faro | **Pane Quotidiano** — unico negozio reale attivo (demo Casa Linda esclusa) | 06/7 23:55 |
| Cliente core | **Botteghe** (carrello multi-negozio settimanale) — non ristoranti/trattorie | 13/7 22:35 |
| Commissione MyCity | **10%** sul venduto tramite la piattaforma, e **serve a pagare la consegna** (Nicola, 11/8). Non è un margine sull'incasso che il negozio faceva già: sta solo sugli ordini che porta MyCity | 11/8 10:21 |
| Abbonamento venditore | **50 €/mese** | 20/7 12:39 |
| Fonti di reddito | **Due:** ① marketplace (10% + 50 €/m + 3 € fee consegna). ② **Worker per i negozi**, non ancora costruito: prezzo nella riga qui sotto | 11/8 02:18 |
| Le 46 leve di ricavo (lista Nicola 29/7) | **Mappa del potenziale, NON linee attive**: 16 incassabili a zero ordini · 11 ferme al 1° ordine · 12 richiedono pubblico · 7 richiedono un permesso. Nessun prezzo approvato | 29/7 16:20 |
| Worker per i negozi — prezzo | **Incluso nei 50 €/m del marketplace** fino a ~50-100 negozi, poi **+50 €/m** (100 €/m in tutto per negozio). Supera il listino a 3 fasce del 29/7 (99 · 299 · 699-999): non era mai stato venduto a nessuno | 11/8 02:18 |
| Worker per i negozi — i 3 di prova | **Pagano 50 €/m come tutti** (Nicola, 11/8): I Frutti della Terra, Enoteca La Canteina, Il Pollivendolo. Il prezzo bloccato del 29/7 non esiste più. Restano da fondare: non risultano nei dati | 11/8 10:21 |
| Worker per i negozi — stato | **Definito, NON costruito** — si crea in sessioni dedicate future; nessuna azione né pitch finché non lo apre Nicola | 29/7 01:19 |
| Obiettivo di ricavo | **10.000 €/mese** = 100 negozi × 100 €/m; **10-20 fonti di entrata attive entro gennaio 2027** | 11/8 02:18 |
| Costi infrastruttura | **~302 €/mese** fissi (dettaglio nella sezione "💰 Costi infrastruttura" qui sotto) | 21/7 00:37 |
| Soglia costi extra (admin/assicurazioni/app store) | Sospesi finché l'utile netto non arriva a **~5.000 €/mese** | 23/7 17:26 |
| Ripresa lavoro operativo (inserimento negozi) | **Dopo il 24 agosto – 1 settembre 2026** | 23/7 17:36 |
| Bici consegna | Non operativa; riparazione da **~28/7** in poi | 14/7 02:59 |
| Ordini consegnati (North Star) | **0** | 07/7 00:29 |
| Ordine #16 (test 19,05 € del 24/6) | **Annullato** — non riesumare, il primo ordine reale va creato ex-novo | 07/7 00:29 |
| Ristoranti/trattorie | **Esclusi** — MyCity lavora solo con botteghe | 16/7 12:57 |
| Bando Commercio ER (40% fondo perduto) | **Chiuso** il 23/6 (350 domande raggiunte) — nessuna azione possibile | 11/7 11:40 |
| Motore AI del cervello | **Claude Code** — Cursor solo con flag esplicito | 16/7 12:03 |
| Ramo di pubblicazione memoria | **main** (ramo unico) | 07/7 00:29 |
| Deploy Pannello su Vercel | Solo quando cambia `pannello/`, via Deploy Hook | 07/7 00:29 |
| PostHog — regione | Account US (us.posthog.com) | 20/7 20:21 |
| PostHog — project id | **495230** | 20/7 18:49 |
| Venerdì Piacentini (date passate) | 10/7 e 17/7 — nessuna data futura ancora fissata | 07/7 00:29 |
| Visita 6 botteghe food | Nicola c'è andato **di persona** il 13/7 | 06/7 23:55 |

Fonte di ogni riga: campo `fonte` in `MyCity-Vault/90-Memoria-AI/registro-fatti.json` — lì c'è anche la storia delle correzioni.

---

## 💰 Le 46 leve di ricavo — la mappa dei soldi di MyCity al suo apice · 2026-07-29 16:20

Lista di Nicola (chat 29/7 16:0x): *«questa è una parte di tutto ciò che potrà offrire MyCity quando sarà al suo apice»*. Messa in casa perché non finisse fuori — è già successo col listino Worker, nato in una chat claude.ai e assente dal vault per settimane.

> ⚠️ **Cos'è e cosa NON è.** È la mappa del **potenziale**, non un piano e non una coda di lavoro.
> Le linee di ricavo **attive restano DUE** (`strategia.linee-ricavo`): ① marketplace (10% + 50 €/m + 3 € fee consegna) ② Worker per i negozi (99/299/699-999 €/m, definito e **non costruito**, chiuso da Nicola). **Nessuna azione accodata da questa lista, nessun prezzo pubblicato, niente si muove.**

### Dove siamo davvero mentre leggiamo 46 righe di ricavo

| Fatto | Valore | Fonte |
| --- | --- | --- |
| Negozi reali attivi | **1** (Pane Quotidiano) | `negozio.faro` |
| Ordini vivi | **0** (1 solo ordine a DB, annullato il 24/6) | query live 29/7 16:10 |
| Persone registrate · prodotti · recensioni | **7 · 5 · 0** | query live 29/7 16:10 |
| Burn fisso | **~302 €/mese** | `finanza.costi_infrastruttura` |
| Ripresa lavoro operativo sui negozi | **dopo il 24/8 – 1/9** | `ripresa.lavoro-operativo` |

### La cosa più importante: **46 voci, ma 4 portafogli**

Le leve si contano a 46; **i portafogli che devono aprirsi sono quattro**, e il limite non è quante righe inventi ma quanto ognuno di loro può pagare al mese.

| Chi paga | Voci | Il vincolo vero |
| --- | ---: | --- |
| **Il cliente piacentino** | 14 (1-14) | Dentro ci sono **tre abbonamenti diversi** (#5 consegne, #9 box, #14 club): una famiglia ne sottoscrive **uno**, non tre. |
| **Il negozio** | 11 (15-25) **+ i 50 €/m già decisi** | Accese tutte fanno **~223 €/m alla stessa bottega** (50 + 99 + 30 + 19 + 25). La domanda non è quante leve: è **quanto paga al mese una bottega di Piacenza**. |
| **L'azienda / l'istituzione** | 7 (26-32) | L'**unico portafoglio con budget vero oggi** — ma cicli lenti, gare, firma 🔴, e serve l'entità giuridica (dubbio già emerso su PI26). |
| **L'altro builder / l'altra città** | 11 (33-43) | **Non ha bisogno di Piacenza.** È una software house attaccata al marketplace: la parte più facile da vendere subito e quella che può mangiare tutto il tempo che serve al primo ordine. |

Le 3 trasversali (44-46) si appoggiano ai portafogli sopra.

### Quattro cancelli: cosa serve prima di incassare 1 €

| Cancello | Quante | Cosa vuol dire |
| --- | ---: | --- |
| 🟩 **Può incassare ora** | **16** | Non dipende da ordini né da rete — dipende solo dal costruirla. **12 di queste 16 sono servizio/software, non marketplace.** |
| 🟦 **Serve il primo ordine** | **11** | Ferme finché il marketplace non vende: oggi 0 ordini vivi. |
| 🟪 **Serve un pubblico** | **12** | Si vende visibilità o dato: oggi 4 acquirenti registrati, 0 recensioni, newsletter senza lettori. |
| 🟥 **Serve un permesso prima dell'euro** | **7** | Wallet, buoni, welfare, appalti, licenza: qui il blocco è una regola o un contratto, non la fatica. |

#### 🟩 Le 16 che possono incassare senza un solo ordine

| # | Leva | Cosa serve prima |
| --- | --- | --- |
| 15 | Abbonamenti a livelli (Vetrina/Autopilot/Direttore) | **Già a registro** — definita, non costruita, chiusa da Nicola |
| 16 | Setup una tantum | Stessa linea del 15 |
| 19 | Fidelity white-label del negozio | Costruire il modulo (software puro, non serve la rete) |
| 20 | Campagne WhatsApp à la carte | Mano WhatsApp collegata + **base giuridica sui contatti del negozio** (la lista è sua, non nostra) |
| 21 | Servizio contenuti (foto/video/schede) | **La macchina lo sa già fare** — Content Factory + i due cancelli creativi |
| 24 | Formazione in presenza | Il tempo di Nicola, che è la risorsa scarsa |
| 25 | Kit fisico QR + vetrofania | **Grafica pronta su disco**; costa 80-150 € di stampa, margine minimo |
| 29 | Bandi e voucher digitalizzazione | PI26 chiuso per MyCity — non idonea, confermato da Nicola (29/7). Da riprovare al prossimo bando compatibile |
| 30 | Partnership associazioni di categoria | È **canale**, non ricavo — già presidiata |
| 33 | Vetrine self-service per professionisti | Costruire il prodotto |
| 39 | Moduli SaaS standalone | Costruire il prodotto |
| 40 | Boilerplate e template a builder globali | **Zero dipendenza da Piacenza** |
| 41 | Corso registrato | Dipende dal 24 |
| 42 | Hosting e manutenzione siti | Costruire il servizio |
| 43 | Widget e integrazioni | Poco ricavo, molto lock-in — giusto così |
| 44 | Affiliazioni B2B ai negozi | **Con 1 negozio vale 0** — inizia ad avere senso da ~10 |

#### 🟦 Le 11 ferme al primo ordine

| # | Leva | Nota |
| --- | --- | --- |
| 1 | Commissioni sugli ordini | Già decisa: **10%** |
| 2 | Paniere settimanale cluster food | Servono 3-4 botteghe **nello stesso giro** |
| 3 | Consegna prioritaria 1,50-2,50 € | Serve una consegna che regga le fasce — **la bici non è operativa** |
| 4 | Supplemento piccoli ordini +1,50 € | Si somma ai 3 € già in codice: vedi «una sola superficie di prezzo» |
| 5 | Abbonamento consegne 7-9 €/m | Nessuno si abbona a consegne che non usa |
| 8 | Fee prenotazione servizi | Serve un'offerta di servizi: oggi zero |
| 9 | Box «Sapori di Piacenza» | Assortimento + logistica ricorrente; è marchio proprio → rischio di pestare i piedi ai negozi |
| 10 | Gruppi d'acquisto condominiali | Serve densità per via |
| 11 | Preordini stagionali | **Incassi soldi prima di consegnare**: è un impegno, va coperto |
| 12 | Liste regalo locali | Dipende dai buoni (#7) |
| 14 | Club MyCity 5-10 €/m | **In conflitto con #5**: uno solo dei due può vivere |

#### 🟪 Le 12 che chiedono un pubblico che non c'è ancora

**17** analytics premium (oggi 0 ordini = niente da vendere) · **18** visibilità interna (Nicola stesso: 2027) · **22** vetrine temporanee · **23** slot newsletter (serve una newsletter con lettori) · **28** sponsorizzazioni locali · **32** report di mercato (2027, + dati aggregati = GDPR) · **34** biglietteria eventi · **35** annunci premium · **37** job board · **38** directory professionisti · **45** turismo ed esperienze · **46** media locale.

#### 🟥 Le 7 dove il blocco è una regola, non la fatica

| # | Leva | Il vero blocco |
| --- | --- | --- |
| 6 | Wallet / Carta Piacenza | Tenere soldi altrui e farci float è **area servizi di pagamento**. E il bonus non è gratis: **incassi 100, devi 105 di merce** |
| 7 | Buoni regalo | IVA del buono (monouso/multiuso), scadenza, e i non riscattati sono **un debito finché non scadono**, non cassa da spendere |
| 13 | Arrotondamento civico | **Non è ricavo** (lo dice Nicola) — sono soldi di terzi: servono regole e rendiconto |
| 26 | Corporate gifting | Dipende dai buoni (#7) + una rete dove spenderli |
| 27 | Welfare ricorrente | Normativa welfare/fringe benefit + wallet |
| 31 | Progetti DUC / Comune | Gare e appalti: tempi lunghi, entità giuridica, firma 🔴 |
| 36 | Licenza ad altre città | **Non si licenzia un modello a 0 ordini** — prima va provato una volta, poi marchio e contratto |

### I conti che riordinano la lista (burn ~302 €/mese)

| Come lo copri | Quanto serve |
| --- | --- |
| Worker Autopilot (299 €/m) | **1 cliente** ≈ tutto il burn |
| Worker Vetrina (99 €/m) | **4 clienti** (3 fanno 297, quasi) |
| Abbonamento venditore (50 €/m) | **6-7 negozi** che pagano — **senza un solo ordine** |
| Commissione 10% | **3.020 € di venduto/mese** — con scontrino *ipotetico* 25 € fanno ~121 ordini/mese, **~4 al giorno** (lo scontrino è un'ipotesi: non abbiamo un ordine reale su cui misurarlo) |
| Fee consegna 3 € | **~101 consegne/mese** |

**Due righe già decise che nella lista non ci sono:** l'**abbonamento venditore 50 €/m** e la **fee consegna 3 €**. La prima è la cosa più vicina a un ricavo ricorrente che il marketplace abbia già oggi.

### Le 5 decisioni che oggi costano poco e dopo costano care

1. **Un solo abbonamento al cliente.** #5, #9 e #14 chiedono soldi alla stessa famiglia: scegli quale è *l'*abbonamento, gli altri diventano livelli dentro quello.
2. **Una sola superficie di prezzo sul carrello.** Ci sono già 3 € di consegna; la lista ne aggiunge due (#3, #4). Tre balzelli su uno scontrino da 25 € si vedono tutti. Un owner unico del listino.
3. **Reputazione e identità legate alla persona, non allo strato.** È già scritto nella mappa multistrato del 6/7: è ciò che rende possibili #8, #38 e #36 senza rifare tutto da capo.
4. **Se un giorno arrivano wallet e buoni (#6, #7, #12, #26, #27): i soldi caricati sono un debito, non un ricavo.** Registro separato dal giorno zero — dopo si sistema solo con un rifacimento.
5. **Che azienda è MyCity.** Le voci 33-43 (11 su 46) **non hanno bisogno di Piacenza**: sono una software house. Sono le più facili da vendere subito e le più capaci di divorare il tempo che serve al primo ordine. È l'unica scelta della lista che la macchina non può fare al posto di Nicola.

### Rapporto con la mappa che avevamo già

Le 46 voci **non aggiungono strati** alla mappa multistrato del 6/7 (`consegne/strategia/2026-07-06-strategia-citta-online-multistrato.md`): la **riempiono di prezzi**. Le uniche che escono da quella mappa sono la software house (33, 39-42) e la licenza ad altre città (36) — cioè, non a caso, proprio quelle che non hanno bisogno della città.

---

## 💼 La seconda fonte di reddito: il Worker dato ai negozi · 2026-07-29 01:20

MyCity avrà **due modi di guadagnare**, non uno. Il marketplace incassa solo se la gente compra; il
**Worker in abbonamento al negozio** incassa il primo del mese comunque — **Vetrina 99 €/m** (esiste
online senza toccare nulla: Google Business, recensioni, social autopilot), **Autopilot 299 €/m** (+
WhatsApp ai clienti, richiami e loyalty, Report del Lunedì), **Direttore Digitale 699-999 €/m** (+
cruscotto finanziario in sola lettura, watchdog bandi, analisi strategica mensile). Più il setup una
tantum; i primi 3 pilot a **149 €/m bloccato**.

Per capirci sul peso: **un solo cliente Vetrina copre un terzo del burn fisso (~302 €/m); tre Autopilot
lo coprono tutto e avanzano** — senza che sia arrivato un solo ordine sul marketplace.

⛔ **Non è ancora costruita e non si tocca:** Nicola la crea in sessioni dedicate più avanti. Nessuna
azione in coda, nessun pitch, nessun materiale intestato ai 3 pilot (che vanno prima fondati: non
risultano nei dati). Tutto il dettaglio piano per piano, con cosa manca per venderlo:
`consegne/strategia/2026-07-29-listino-worker-negozi.md`.

---

## 📍 Capillarità — kit fisico QR e vetrine · 2026-07-20 23:59

Ogni negozio **confermato** esce dal go-live con kit fisico (QR cassa/vetrina, vetrofania, sacchetti) + mappa presenza in città. **Grafica pronta, stampa e posa bloccate** — non mettere QR in vetrina prima che il fornaio sappia evadere ordini.

### Dove siamo

| Fatto | Valore |
| --- | --- |
| Negozi approvati | **1** (Pane Quotidiano) |
| Ordini consegnati | **0** |
| Kit PQ intestato | **Pronto su disco** (QR live verificato) |
| Template neutri prospect | **Pronti** (Garetti / Peretti / Amendolara — solo dopo firma) |

**Verdetto:** ARMATO, non stampare. Priorità: ordine test PQ → preventivo tipografia → posa in negozio.

### Cosa c'è già (gratis, su disco)

- **Pane Quotidiano:** cartoncino cassa, vetrofania, QR vetrina — file pronti per la tipografia
- **Prospect non firmati:** solo template neutri con segnaposto — niente pacchetto intestato finché non aderiscono
- **Casa Linda:** esclusa (demo)

### Cosa resta in coda (🔴 firma Nicola — costa soldi)

| Passo | Gate |
| --- | --- |
| Preventivo + stampa kit PQ | Dopo **ordine test PQ** chiuso — stima **~80–150 €** tipografia locale |
| Posa vetrina + cassa | Stesso gate + ok titolare |
| QR sparsi in città (bar, edicole) | **≥ 3 negozi** reali che evadono — oggi ne abbiamo 1 |

> Il bando «Vita in Centro rimborsa materiali» **non esiste**. Alternativa stampa: **PI26 CCIAA** (50% digitalizzazione, scade 30/7).

### Prossimo passo (ordine)

1. **Ordine test Pane Quotidiano** — il fornaio deve sapere evadere
2. Chiedi preventivo tipografia con i file PQ → firma stampa
3. Dopo **≥ 3 negozi evadibili:** semina QR in città

Playbook completo: `consegne/vendite/2026-07-20-playbook-capillarita.md` · refresh vendite 20/7 11:24.

---

## 🎟️ Fedeltà di rete — MyCity Punti + Gift Card · 2026-07-20 23:54

Playbook aggiornato (base 6/7). **Meccanica pronta, programma NON acceso** — oggi 1 bottega, 0 ordini pagati: promettere punti su tutta la rete non ha senso finché la rete non c'è.

### Dove siamo

| Fatto | Valore |
| --- | --- |
| Negozi attivi | **1** (Pane Quotidiano) |
| Clienti registrati | **4** |
| Ordini pagati | **0** |
| Commissione MyCity | **10%** venduto + **50 €/mese** abbonamento negozio |

**Verdetto:** ARMATO, non acceso. Priorità adesso: PI26 + primo ordine test PQ.

### MyCity Punti (quando accendiamo)

- **1 punto ogni 1 €** speso, valido su **tutta la rete**
- Valore punto — stima rivista al rialzo 23/7 (Nicola: il costo è più alto di quanto pensavo): proposta lancio **2%** (100 pt = 2 €), può salire a **3–5%** se serve competere con Glovo/altri programmi fedeltà locali — l'1% iniziale era troppo ottimistico, i programmi fedeltà reali che spostano comportamento stanno nella fascia 2–5%
- Riscatto: minimo **100 pt**, max **30%** del carrello, scadenza **12 mesi**
- **Paga MyCity** (dalla commissione), il negozio incassa pieno al riscatto
- **Oggi: 0%** — non accendere con 1 solo negozio

### Gift Card MyCity

- Tagli **10 · 25 · 50 €**, spendibili su tutta la rete
- Incasso subito MyCity, negozio pagato quando il cliente spende
- **Prima di vendere:** parere legale + contabilità (IVA buono multiuso) 🔴
- Serve Stripe collegato in scrittura + tabella dedicata

### Per accendere servono tutte e 5

1. **≥ 5 negozi** con payout ok (oggi: 1)
2. **Primo ordine reale** chiuso end-to-end
3. **Stripe write** collegato
4. **% cashback firmata** (consiglio: 1% al lancio)
5. **Ok legale/fiscale** sulle gift card

### Prossimo passo (ordine)

1. Chiudere ordine test Pane Quotidiano + payout
2. Portare **3–5 botteghe** (Peretti, Garetti, Amendolara…)
3. Collegare Stripe + parere fiscale gift card
4. Firmare lancio Punti (1%) e Gift Card

Bozze post/email/banner già pronte. **Niente da firmare oggi su fedeltà** — card in coda (#44 Punti · #45 Gift Card).

Fonte: refresh growth 20/7 · validazione finanza · playbook base 6/7.

---

## 💰 Costi infrastruttura MyCity · 2026-07-23 17:26

Lista completa per Nicola — **✅ = confermato da te** · **📊 = stima orientativa** (tipografia, listini, mercato PMI — da rifinire col preventivo reale) · **🚫 = sospeso** (Nicola 23/7: niente amministrazione/assicurazioni/app store finché l'utile netto mensile non arriva a **~5.000 €/mese** — si attivano prima solo se un evento le rende obbligatorie, es. bando o assunzione).

### Oggi — confermati (fissi mensili)

| Voce | €/mese | Note |
| --- | ---: | --- |
| **Claude Max** (AD / worker) | **200** ✅ | Abbonamento fisso AI |
| **Vercel** (Pannello Cabina) | **30** ✅ | Oggi solo Pannello |
| **Supabase** (database marketplace) | **50** ✅ | DB + auth + storage |
| **VPS worker** | **20** ✅ | Cervello AD + n8n + sensori |
| **Dominio** | **~2** ✅ | **20 €/anno** ammortizzato |
| **Totale fisso mensile** | **~302** | 300 €/m servizi + dominio |

### In transizione

| Voce | Stima | Note |
| --- | ---: | --- |
| **Render** (marketplace) | **0** (chiusura) | Spegni quando migri — oggi **~7–25 €/m** se ancora attivo 📊 |
| **Vercel totale** (Pannello + sito) | **~50–70 €/m** 📊 | Dopo migrazione marketplace — oggi paghi 30 €; il piano può salire con traffico |

### Materiali fisici, volantini e stampa (🔴 on-demand — non nel burn mensile)

Grafica pronta su disco; paghi solo in tipografia. Gate: **ordine test PQ** prima del QR in vetrina.

| Voce | Stima | Cosa include |
| --- | ---: | --- |
| **Kit negozio** (1° bottega) | **~80–150 €** | QR cassa, vetrofania, adesivi, sacchetti kraft |
| **Volantini quartiere** (200–500 pz A5) | **~50–100 €** 📊 | Tiratura color tipografia Piacenza |
| **Locandine bacheche** (10–20 pz A5) | **~25–40 €** 📊 | Comune, associazioni, partner |
| **Presidio evento** (fiera, Venerdì Piacentini) | **~70–100 €** 📊 | ~200 volantini + QR plastificato |
| **Primo lotto completo** (kit + volantini cluster) | **~150–300 €** | Lancio zona — DECISIONI 24/6 |
| **2°–3° negozio** (kit) | **~80–150 €** ciascuno | Stampa batch |

**PI26 CCIAA** — fino al **50%** digitalizzazione (scadenza **30/7**): può ridurre kit/stampa. Distribuire volantini a mano = **~0 €**.

### App store (🚫 sospeso fino a 5.000 €/mese di utile — Nicola 23/7)

| Store | Costo | Quando |
| --- | ---: | --- |
| **Apple App Store** | **~99 €/anno** 📊 | Rinnovo annuale |
| **Google Play** | **~23 €** una tantum 📊 | Paghi una volta |
| **Primo anno entrambi** | **~120 €** | Poi **~99 €/anno** (solo Apple) |
| **PWA gratis** (alternativa) | **0 €** | Sito installabile — limiti su iPhone — **unica via oggi, resta gratis** |

### Email

| Tipo | Costo | Quando |
| --- | --- | --- |
| **Email automatiche** (Resend) | **0 €** → **~19 €/m** 📊 | Gratis fino 3.000/mese, poi Pro |
| **Casella tua** (Google Workspace) | **~7–8 €/m** per casella 📊 | info@ / nicola@ |

### SMS (Twilio)

**~0,05–0,10 €** a messaggio 📊 — backup urgente. Oggi **0 €** (Telegram + email bastano).

### Amministrazione e professionisti (🚫 sospeso fino a 5.000 €/mese di utile — Nicola 23/7)

| Voce | Stima | Frequenza |
| --- | ---: | --- |
| **PEC** | **~25–35 €/anno** (~3 €/m) 📊 | Obbligatoria per bandi/enti |
| **Firma digitale / SPID** | **~25–40 €/anno** (~3 €/m) 📊 | Se non ce l'hai già |
| **Commercialista** (micro/PMI) | **~800–1.200 €/anno** (~70–100 €/m) 📊 | Bilancio, IVA, dichiarazioni |
| **Visure / pratiche CCIAA** | **~15 €** a visura 📊 | Su richiesta |
| **Notaio** (atti societari) | **~200–500 €** a atto 📊 | Solo quando serve |
| **Consulente del lavoro** | **~50–150 €** a pratica 📊 | Quando assumi rider dipendente |

> Eccezione: se un bando/adempimento impone PEC o firma digitale PRIMA della soglia, si attiva comunque (obbligo, non scelta).

### Operatività consegne (quando parti)

| Voce | Stima | Note |
| --- | ---: | --- |
| **Bici** | **0 €** | Nicola ha già una bici elettrica (in riparazione) — **non calcolare acquisto/noleggio** finché non serve una seconda |
| **Pagamento rider** (freelance) | **~3–5 €** a consegna 📊 | Oppure **~8–12 €/ora** 📊 se a turno |
| **Packaging food extra** (termico) | **~0,30–0,80 €** a ordine 📊 | Oltre sacchetti brand |

### Marketing attivo (🔴 quando accendi)

| Voce | Stima | Note |
| --- | ---: | --- |
| **Meta / Google Ads** | **~300–500 €/m** minimo test 📊 | Tu decidi budget — 🔴 firma |
| **Promo «porta un amico»** | **~15 €** a coppia attivata 📊 | 5 € + 5 € cliente/amico + ~5 € margine per abusi (auto-referral, doppi account) e cannibalizzazione (chi avrebbe comprato comunque) — stima rivista al rialzo 23/7 su richiesta Nicola |
| **Influencer micro locali** | **~50–150 €** o baratto 📊 | Creator food/Piacenza |
| **Comunicato stampa** (invio) | **~0 €** | Email giornalisti — tempo tuo |

### A volume — quando incassi ordini

| Voce | Stima | Note |
| --- | ---: | --- |
| **Stripe** (commissioni carta) | **~1,4% + 0,25 €** / transazione 📊 | Esempio ordine 20 € → **~0,53 €** |
| **Assicurazione RC marketplace** | 🚫 sospesa fino a 5.000 €/m utile | **~500–1.000 €/anno** (~40–85 €/m) 📊 quando riattivata — da preventivo broker 🔴 |
| **Assicurazione RC consegne / rider** | 🚫 sospesa fino a 5.000 €/m utile | **~300–600 €/anno** (~25–50 €/m) 📊 quando riattivata — da preventivo broker 🔴 |

### In stack — oggi a zero o variabile

| Voce | €/mese | Note |
| --- | ---: | --- |
| **PostHog** | **0** (oggi) | Piano free — se superi limiti **~50 €/m** 📊 |
| **Telegram bot** | **0** | Gratis |
| **GitHub** | **0** | Repo attuali |
| **Cursor API** (fallback AI) | **~0–20 €/m** 📊 | Solo se Claude Max satura |
| **Supabase Pro+** | **~23 €/m**+ 📊 | Se superi piano attuale (50 €) |
| **Resend Pro** | **~19 €/m** 📊 | Oltre 3.000 email/mese |

### Riepilogo scenari (solo per orientarti)

| Scenario | €/mese indicativi | Cosa include |
| --- | ---: | --- |
| **Oggi (minimo)** | **~302** ✅ | Solo infrastruttura accesa |
| **+ operativo leggero** | **~320–370** 📊 | + qualche consegna rider (bici già c'è, gratis) |
| **+ marketing test** | **~620–870** 📊 | + ads 300–500 €/m (tu decidi) |
| **One-shot lancio zona** | **+150–300 €** una tantum | Primo lotto stampa + kit negozio |

**Runway:** il burn **certo oggi** resta **~302 €/m**. Amministrazione, assicurazioni e app store sono **fuori da ogni scenario** finché l'utile netto non arriva a **~5.000 €/mese** (Nicola 23/7). Tutto il resto entra solo quando lo accendi.

Fonte: Nicola chat 20–21/7 ✅ e 23/7 17:25 ✅ (soglia 5.000 €/m, bici già presente, referral/punti rivisti al rialzo) · playbook capillarità · DECISIONI 11/7 e 24/6 · listini Resend/Google/Stripe · stime PMI 📊.

---

## 🚀 Versione avanzata — checklist worker · AD · Pannello · 2026-07-20 21:52

Obiettivo: macchina che **vede tutto**, **ti disturba poco**, **agisce dopo il tuo ok**, **impara dagli ordini veri** — non «più AI».

### Livello 1 — Fondamenta (lo fai tu, 1–2 settimane)

- [ ] **Telegram** collegato (avvisi card + sveglia bandi alle 7)
- [ ] **Meta FB + IG** su n8n (post solo dopo Approva)
- [ ] **Email / notifiche** in modalità live (non solo bozze)
- [ ] **Burn mensile** nel file env del server (runway visibile)
- [ ] **Stripe in lettura** (cassa e payout monitorati)
- [ ] **Primo ordine test** su Pane Quotidiano + payout ok

### Livello 2 — Pannello che non stanca

- [ ] In cima solo **3 decisioni al giorno** (priorità automatica)
- [ ] Chat **stesso filo** tra telefono e PC
- [ ] Card che **spariscono sole** dopo merge o fix online
- [ ] Radiografia dice **cosa fare**, non solo rosso/verde

### Livello 3 — AD operatore

- [ ] Il giro **esegue** ciò che hai approvato (non solo accoda)
- [ ] Impara da ogni **ok / no** nelle card
- [ ] **PostHog funnel**: dove si perde il cliente (non solo visite)
- [ ] **Telegram** solo se cambia qualcosa di importante

### Livello 4 — Ultra avanzata (fa molto di più, sempre con firma su soldi/messaggi)

- [ ] **Carrello abbandonato** → recupero automatico (email/push) dopo regole ok
- [ ] **Negozio fermo** → check-in proposto prima che molla
- [ ] **Meteo + eventi città** → post e ops adattati (tu approvi solo eccezioni)
- [ ] **Bandi e scadenze** → promemoria + bozza domanda pronta (PI26, CCIAA…)
- [ ] **Health score negozi** → alert anti-churn automatici
- [ ] **Onboarding negozio** done-for-you end-to-end in meno di 48 ore
- [ ] **Report mattino/sera** su Telegram: 3 numeri + 1 mossa consigliata
- [ ] **Esperimenti prezzo/consegna** guidati dai dati (A/B con PostHog)
- [ ] **Gestionale negozio** collegato (catalogo e stock sincronizzati)
- [ ] **App / push nativa** — il cliente torna senza aspettare email

**Mossa unica consigliata adesso:** Telegram + Meta + ordine test PQ — trasforma la macchina da «assistente che scrive» a «operatore che agisce e misura».

---

## ⚙️ 50 workflow n8n MyCity (catalogo completo) · 2026-07-20 03:36

Bozze importabili in n8n — tutte **spente** finché non le completi. 🔴 messaggi/post · 🟡 avvisi interni · 🟢 solo report.

**1 Social & canali** — 1 FB 🔴 · 2 IG 🔴 · 3 Google Business 🔴 · 4 calendario post 🔴 · 5 report social 🟢

**2 Acquisizione** — 6 nuovo iscritto 🟡 · 7 invito zona live 🔴 · 8 reminder lista 🔴 · 9 referral 🟡 · 10 report iscrizioni 🟢

**3 Carrelli** — 11 abbandonato 1h 🔴 · 12 abbandonato 24h 🔴 · 13 alert alto valore 🟡 · 14 coupon recupero 🔴 · 15 report recupero 🟢

**4 Fidelizzazione** — 16 win-back 30gg 🔴 · 17 win-back 60gg 🔴 · 18 grazie+recensione 🔴 · 19 riordino freschi 🔴 · 20 report retention 🟢

**5 Negozi** — 21 nuovo ordine negozio 🔴 · 22 KYC Stripe 🟡 · 23 health score calo 🟡 · 24 catalogo vuoto 🟡 · 25 check-in settimanale 🔴

**6 Operations** — 26 ordine ritardo 🟡 · 27 negozio non risponde 🔴 · 28 meteo pioggia+ops 🔴 · 29 pagamento fallito 🔴 · 30 report ordini 🟢

**7 Comunicazione AD** — **31 card Da approvare → Telegram 🟡** (59 avvisi) · 32 errore worker 🟡 · 33 email Resend 🔴 · 34 WhatsApp negozio 🔴 · 35 SMS urgente 🔴

**8 Marketing locale** — 36 post pioggia 🔴 · 37 storia bottega 🔴 · 38 Venerdì Piacentini 🔴 · 39 prodotto del giorno 🔴 · 40 report reach 🟢

**9 Intelligence** — **41 RSS bandi Comune 🟢** (PI26 oggi 10:00) · 42 RSS Vita in Centro/CNA 🟢 · 43 promemoria scadenza 🟡 · 44 meteo domani 🟢 · 45 report intelligence 🟢

**10 Back-office** — 46 Stripe payout bloccato 🟡 · 47 alert runway 🟡 · 48 export incassi Sheets 🟢 · 49 health check n8n 🟢 · 50 log uscite social 🟢

**Priorità accensione:** 31 Telegram → 1–2 Meta → 41 RSS bandi → 11 carrello 1h → 21 ordine negozio. File JSON nel repo (50 stub + 2 workflow completi: pubblica post + lista attesa).

---

## 🔌 20 mani n8n utili per MyCity · 2026-07-20 03:25

n8n collega il worker a uscite diverse — ordine per impatto:

1. **Telegram** — avvisi immediati (59 card in attesa senza bot)
2. **Facebook pagina** — post programmati
3. **Instagram feed** — stesso post su IG
4. **Email (Resend)** — welcome, carrelli, promemoria negozi
5. **Marketplace (API)** — notifiche in-app, push, coupon, catalogo
6. **Google Sheets** — report ordini, liste negozi, log uscite
7. **Google Forms** — lista d'attesa iscritti (modello pronto)
8. **Google Business Profile** — post Maps + recensioni
9. **Cron** — sveglie fisse: bandi, report, meteo
10. **RSS Comune/bandi** — riassunto portali istituzionali
11. **Meteo** — trigger post «pioggia + consegna»
12. **WhatsApp Business** — messaggi ai negozi
13. **Stripe (solo lettura)** — alert pagamenti/payout
14. **Gemini (API)** — bozze testi in volume
15. **Google Drive** — PDF, locandine, export
16. **Google Calendar** — PI26, check-in, scadenze
17. **SMS (Twilio)** — backup Telegram/email
18. **Webhook → worker** — n8n sveglia il cervello
19. **Supabase (lettura)** — trigger ordine, iscritto, carrello
20. **Slack/Discord** — opzionale, team separato

**Regola:** messaggi, post e soldi = 🔴 (approvi la card). **Ordine:** Telegram → Meta → post test 🔴 → email welcome → notifica ordine negozio.

---

## 👥 Mani n8n per reparto (cosa chiedono i senior) · 2026-07-20 03:25

**Comunicazione & clienti** — Meta FB+IG, email (welcome/carrelli/win-back/recensioni), Google Business Profile, meteo, Google Forms.

**Negozi & vendite** — WhatsApp follow-up, email onboarding/KYC, Telegram health score, API marketplace (nuovo ordine, catalogo vuoto).

**Operations & consegne** — Supabase trigger (ordine/ritardo), Telegram/SMS alert urgenti, push cliente, WhatsApp rider/negozio 🔴.

**Soldi & pagamenti** — Stripe read (falliti/payout/chargeback), Telegram anomalie cassa, Sheets quadratura.

**Intelligence & istituzioni** — RSS+cron bandi (Comune 403 al worker), Calendar PI26 (**apre oggi 10:00**, scade 30/7), Telegram riassunto mattutino.

**Governance & numeri** — Telegram 59 card bloccate, cron report mattino/sera, Sheets/Drive KPI, webhook worker↔n8n (ok).

**Builder & tech** — webhook bidirezionale, cron health n8n, Gemini bozze.

**Creativi & ads** — Meta post/reel 🔴, email creator, ads solo con budget firmato 🔴.

**NON passa da n8n (umano 🔴):** invio bandi su portale, contratti, trattative, rimborsi, deploy, primo ordine fornaio.

**Ordine condiviso:** Telegram → Meta → RSS bandi → email welcome → notifica ordine negozio.

---

## 🗺️ Mappa negozi Piacenza — ordine di onboarding per MyCity · 2026-07-16 16:55

**L'obiettivo è creare 3 motivi per aprire l'app ogni settimana + 1 impulso emotivo.**

**Non onboardiamo:** ristoranti/trattorie, pizza/sushi/burger (terreno Glovo/Deliveroo).

---

### Subito — mesi 1–6 (costruire l'abitudine settimanale)

| # | Categoria | Perché viene prima |
|---|---|---|
| 1 | **Panifici / forni** | Già avviato (Pane Quotidiano). Acquisto quotidiano. |
| 2 | **Salumerie DOP** | Coppa, Pancetta, Salame Piacentino: le 3 DOP esistono solo qui. È il moat che nessun competitor può copiare. |
| 3 | **Fiorai** | Urgenza alta (compleanno → apri l'app). Scontrino €40–80. Già delivery-native. |
| 4 | **Macellerie / pollerie** | Acquisto settimanale, fiducia alta, scontrino buono. |
| 5 | **Enoteche / bottiglierie** | Piacenza zona DOC Colli Piacentini. Stesso cliente della salumeria. |

### Mesi 6–12 (completare il carrello)

- **Ortofrutta / verdurerie** — volume, completa la spesa settimanale
- **Pescherie** — nicchia fedele, poca concorrenza online
- **Caseifici / fromagerie** — chiude il tris DOP piacentino
- **Gelaterie / pasticcerie** — stagionale; **Bardini** (Largo Battisti 19) è il candidato principale

### Anno 2 (retail non-food)

Profumerie · Erboristerie · Cartolerie/librerie · Gioiellerie · Abbigliamento locale · Calzature · Casa/casalinghi (**Kaefu** Via Genova 31 entra qui)

### Anno 3 (servizi, con massa critica)

Lavanderie · Sartorie · Barbieri/parrucchieri · Studi professionali

---

**Botteghe prioritarie da chiamare** (appena la bici è pronta):
1. Antica Salumeria Garetti — Piazza Duomo 44
2. Peretti Frutta e Verdura — Via Alberici Fratelli
3. Caseificio Amendolara — Via Trento 7
4. Alloni Fiori — Corso V.E. 114
5. Taverna del Gusto (enoteca) — centro

~5.000 PMI totali a Piacenza · ~200 food nel centro · aggredibili in 12 mesi.

---

## 📱 Pubblicare l'app MyCity sugli store (iPhone e Android): costi e cose da sapere · 2026-07-16 12:23

**In breve: su Android è quasi gratis (25 $ una volta), su iPhone no (99 $ ogni anno). E sugli ordini Apple e Google non prendono nulla.**

**Quanto costa**

| Store | Costo | Quando si paga |
| --- | --- | --- |
| Apple App Store (iPhone) | 99 $/anno (~99 € + eventuale IVA) | ogni anno, finché l'app resta sullo store |
| Google Play (Android) | 25 $ una tantum (~23 €) | una volta sola, per sempre |

- Primo anno su entrambi: **~120 €**; dagli anni dopo **~99 €/anno** (solo Apple).
- Se smetti di pagare Apple, l'app sparisce dallo store. Esenzioni solo per nonprofit, scuole ed enti pubblici: MyCity non rientra.
- Oltre all'iscrizione non si paga nient'altro: pubblicazione, aggiornamenti e download sono inclusi.

**La notizia buona: zero commissioni sugli ordini**
La famosa commissione del 15–30% vale solo per i beni digitali comprati dentro l'app. MyCity vende beni fisici con consegna: le regole degli store *obbligano* a usare un pagamento esterno → gli incassi restano al 100% su Stripe, come oggi. Stesso regime di Amazon e Glovo.

**Si può avere gratis?**
- Davvero gratis: trasformare il sito in **PWA** (app installabile dal browser, «Aggiungi a schermata Home»). Zero costi, funziona subito su Android; su iPhone con qualche limite.
- Android quasi gratis: 25 $ una volta.
- iPhone: nessuna scorciatoia seria, i 99 $/anno sono il biglietto d'ingresso.

**Prima di iscriversi (requisiti, non costi)**
1. **Account azienda, non personale**: sullo store deve comparire «MyCity», non un nome privato. Serve il numero **D-U-N-S** (gratuito, ma arriva in giorni/settimane: muoversi in anticipo).
2. **Regola tester di Google**: con un account personale serve un test chiuso con 12 tester per 14 giorni prima di poter pubblicare. Con l'account organizzazione il vincolo non c'è.
3. **Obblighi UE**: dichiarare sullo store lo status di venditore (indirizzo, email e telefono visibili — Digital Services Act) + privacy policy GDPR.

**Il vero costo non sono le fee**
Oggi MyCity è un sito web: per andare sugli store va impacchettato come app (strada a tappe: PWA gratis → TWA su Play → Capacitor/nativa per iOS). Quello è il lavoro vero; le iscrizioni sono spiccioli. Iscrizioni e pagamenti agli store = 🔴 firma di Nicola.

Fonti: [Apple Developer Program](https://developer.apple.com/programs/whats-included/) · [esenzioni Apple](https://developer.apple.com/help/account/membership/fee-waivers/) · [Google Play Console](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en) · [fee Google + regola 12 tester](https://www.iconikai.com/blog/google-play-developer-account-fee-2026)

---

## 🛡️ I guardiani della macchina · 2026-08-16 22:26

A ogni giro, prima che l'AI scriva una riga, girano **87 controlli automatici**. **45** hanno il potere di fermare il giro: se uno dice no, il lavoro non si chiude pulito e il motivo arriva scritto. Gli altri osservano, avvisano o frenano senza bloccare.

Rispondono tutti con la stessa lingua: **verde** (passato), **rosso** (bocciato), **cieco** (non ha potuto misurare). Un guardiano cieco *non* vale come verde — è uno strumento rotto, e la macchina si ferma lo stesso: meglio memoria vecchia che memoria che mente.

### 🔍 I numeri sono veri?

| Controllo | Cosa guarda | Se dice no |
| --- | --- | --- |
| `coerenza-fatti` | Un fatto cambia in un posto solo. Se una copia vecchia resta in giro, la trova e ferma la pubblicazione. | ⛔ ferma il giro · 🚧 blocca la pubblicazione |
| `coerenza-rischi` | Lo stesso per i rischi: il registro è la casa, gli altri file lo citano invece di ricopiarlo. | ℹ️ scrive e basta |
| `errore-motore` | Porta fuori dal server il motivo per cui il motore si è fermato: senza, da fuori si vede che qualcosa è fallito ma mai il perché, e il guasto resta muto per giorni. | ℹ️ scrive e basta |
| `esito-cadenza` | La testa unica delle tre cadenze: decide se il motore si può spegnere e se il lavoro è andato bene, con le stesse regole per tutte e tre. | ℹ️ scrive e basta |
| `freschezza-intelligence` | Misura quanto è vecchia ogni analisi mostrata nella Cabina: un'analisi di tre settimane esposta come se fosse di stamattina fa decidere su una fotografia scaduta. | ⛔ ferma il giro |
| `freschezza-segnali` | Controlla i controllori: se un guardiano è morto a metà giro, il suo verde è vecchio e non vale. | ⛔ ferma il giro |
| `guardiani-check` | Tiene questa tabella agganciata al codice: se nasce un controllo e nessuno spiega cosa fa, il giro non si chiude. | ⛔ ferma il giro |
| `mappa-macchina` | Tiene aggiornata la mappa «Com'è fatta la macchina»: i numeri li riconta a ogni giro, e se nasce un pezzo nuovo (skill, sensore, mano, servizio, area) senza una riga che dica cosa fa, il giro non si chiude. | ⛔ ferma il giro |
| `onesta-check` | Cerca i numeri orfani: una cifra scritta in memoria senza una fonte accanto non deve uscire. | ⚠️ avvisa, non ferma |
| `peso-file-cabina` | Pesa i file che la Cabina rilegge di continuo: quando uno cresce troppo GitHub smette di servirlo e la schermata si svuota fingendo che vada tutto bene. | ℹ️ scrive e basta |
| `piani-verita` | Legge i piani e ci cerca le frasi che il registro-fatti smentisce — un bando chiuso dato per aperto, la commissione vecchia, il negozio-faro sbagliato — e scrive l'avviso in cima al piano, senza toccare il testo di Nicola. Risponde alla domanda che viene dopo «da quanto è fermo»: cosa dice di falso mentre è fermo. | ⚠️ avvisa, non ferma |
| `sensore-cassa` | Guarda cassa e autonomia: quanto è entrato davvero, quanto brucia al mese, quanti mesi restano. | ℹ️ scrive e basta |
| `sensori-spenti-check` | Uno strumento costruito e mai acceso è un buco, non uno stato: pretende un perché scritto. | ⛔ ferma il giro |
| `sentinella-fonti` | Prova le fonti web da cui la macchina si informa: una fonte morta smette di portare notizie senza dirlo. | ℹ️ scrive e basta |
| `valida-contratti` | Verifica che i file di memoria abbiano la forma che il Pannello si aspetta — un campo rinominato spegne una schermata in silenzio. | ⛔ ferma il giro |
| `verifica-sensori` | Controlla che gli occhi sui dati reali siano aperti: se il marketplace non risponde, il giro non può scrivere numeri nuovi. | ⛔ ferma il giro |

### 🎯 Stiamo andando dove volevamo?

| Controllo | Cosa guarda | Se dice no |
| --- | --- | --- |
| `allocazione-check` | Impedisce che lo sforzo pesante vada su un negozio che non ha ancora firmato mentre quello reale resta a zero. | ⛔ ferma il giro |
| `bilancio-vivo` | Dice quanto rende ogni ordine al centesimo, con le commissioni e i costi reali dentro. | ℹ️ scrive e basta |
| `capacita` | Il cruscotto di cosa la macchina sa fare davvero oggi, contro cosa è ancora solo un'intelaiatura. | ℹ️ scrive e basta |
| `freschezza-cadenze` | Controlla che il piano del mattino, il report della sera e il monitoraggio ESCANO davvero: una sveglia che suona su una stanza vuota sembrava un successo. | ⛔ ferma il giro |
| `freschezza-checklist` | La checklist di Nicola invecchia in due giorni; oltre, il giro deve rifarla prima di proporre altro. | ⛔ ferma il giro |
| `freschezza-okr` | Gli obiettivi della squadra scadono: se il documento è stantio o i target sono passati, lo dice. | ⛔ ferma il giro |
| `intelligence-agenda` | Prepara la lista di cosa guardare fuori oggi — concorrenti, eventi, meteo — senza svegliare l'AI. | ℹ️ scrive e basta |
| `north-star-check` | Tiene l'occhio sul numero che conta — ordini pagati, negozi vivi, margine — e alza la voce se il primo ordine è fermo da giorni. | ⛔ ferma il giro |
| `piani-data` | Scrive in cima a ogni piano quando è stato aggiornato l'ultima volta, contando solo le modifiche al testo vero: un piano fermo da un mese si vede a colpo d'occhio invece di sembrare vivo perché la macchina gli tocca il fondo a ogni giro. | ⚠️ avvisa, non ferma |
| `registro-scelte-check` | Ogni prospect nominato in un dossier deve stare anche nel registro, o il Pannello mostra una lista incompleta. | ⛔ ferma il giro |
| `sblocco-capacita` | Veglia i cancelli di realtà: quando arriva il primo ordine o il quinto negozio, avvisa che una capacità nuova è ora costruibile. | ℹ️ scrive e basta |
| `supervisione-negozi` | Passa in rassegna ogni negozio e ogni prodotto, trova i dati mancanti e prepara il riempimento come proposta da firmare. | ℹ️ scrive e basta |

### 🧠 La macchina impara o accumula?

| Controllo | Cosa guarda | Se dice no |
| --- | --- | --- |
| `apprendimento-guardiano` | Misura se le lezioni diventano regole o restano un archivio: accumulare non è imparare. | ⛔ ferma il giro |
| `calibrazione` | Costringe a dire prima cosa ci si aspetta, e poi a confrontarlo col reale: previsioni mai chiuse sono debito. | ⛔ ferma il giro |
| `chiusura-loop` | Un reparto che dice FATTO deve lasciare l'esito nel suo quaderno: senza, il lavoro non ha insegnato niente. | ⛔ ferma il giro |
| `contesto-lezioni` | Rimette in testa alla macchina, all'inizio di ogni sessione, i fatti-chiave e gli errori da non ripetere. | ℹ️ scrive e basta |
| `correzione-nicola-gate` | Conta quante correzioni di Nicola sono ancora senza un freno automatico proprio (gate): l'area più ripetuta della memoria, resa un numero che il giro non può ignorare. | ⛔ ferma il giro |
| `cristallizza-apprendimento` | Prende le lezioni mature e le trasforma in principi scritti nei mansionari, dove valgono sempre. | ℹ️ scrive e basta |
| `macchina-del-tempo` | Ricostruisce la giornata della macchina in ordine: cosa è successo, quando, e perché è stato deciso. | ℹ️ scrive e basta |
| `pota-apprendimento` | Tiene l'archivio delle lezioni sotto il tetto di lettura potando SOLO copie e morti, mai le lezioni vive: senza, il file supera il muro e la scheda Apprendimento smette di leggersi (successo l'11/8). | ℹ️ scrive e basta |
| `sonda-volano` | Controlla che l'anello impara→correggi giri davvero, invece di sembrare che giri. | ⛔ ferma il giro |
| `tasso-chiusura` | Il voto della macchina su sé stessa: quanti difetti chiude diviso quanti ne apre nel mese. Sotto 1 il giro smette di cercare e spende il turno a chiudere, perché ogni ricerca in più allungherebbe la lista invece di accorciarla. | ⛔ ferma il giro |
| `tasso-lezioni` | Conta quante lezioni la macchina ha davvero applicato in questo giro, non quante ne ha in magazzino. | ⛔ ferma il giro |
| `taste-file` | Registra i verdetti di Nicola — cosa gli è piaciuto e cosa no — perché il gusto non si reinventa ogni volta. | ℹ️ scrive e basta |

### 🔧 I difetti si chiudono davvero?

| Controllo | Cosa guarda | Se dice no |
| --- | --- | --- |
| `allinea-scan-cantiere` | Riallinea la vecchia foto della radiografia al cantiere di adesso, così la lista non mostra roba già riparata. | ℹ️ scrive e basta |
| `auto-fix` | Chiude i difetti la cui prova è diventata verde per un fix vero, e lascia gli altri aperti. | ℹ️ scrive e basta |
| `cantiere-prove` | Smaschera i difetti che nessun controllo automatico potrà mai chiudere: un difetto senza prova resta aperto per sempre. | ℹ️ scrive e basta |
| `esperimenti-check` | Senza almeno un esperimento aperto non si misura niente: pretende che ce ne sia uno vivo e chiude quelli scaduti. | ⛔ ferma il giro |
| `gate-veri` | Impedisce di far salire il punteggio delle lezioni con freni finti: un gate dichiarato vale solo se esiste una mutazione che lo fa scattare davvero. | ⛔ ferma il giro |
| `pagella-intelligenza` | I cinque voti che dicono se la macchina è pronta per il business o sta solo girando a vuoto. | ℹ️ scrive e basta |
| `prove-oneste` | Impedisce a un difetto di nascere già chiuso, con una prova scritta apposta per essere verde. | ⛔ ferma il giro |
| `sincronizza-proposte` | Tiene le proposte di auto-riscrittura agganciate allo stato vero del cantiere. | ℹ️ scrive e basta |
| `sistema-immunitario` | Fa il red team su sé stessa: verifica che le difese di base siano ancora in piedi. | ℹ️ scrive e basta |
| `spazzata-fratelli` | Chiede «l'hai risolto o hai curato una copia sola?»: cerca la stessa malattia nei punti accanto. | ⛔ ferma il giro |

### 🛡️ Niente esce che non deve uscire

| Controllo | Cosa guarda | Se dice no |
| --- | --- | --- |
| `firma-check` | Nessuno script può scriversi da solo la firma di Nicola: chi esegue non firma sé stesso. | ⛔ ferma il giro |
| `percorsi-git` | I nomi dei file con l'accento tornano storpiati se li si chiede nel modo sbagliato: controlla che nessuno strumento lavori su file che non esistono, credendo di averli letti. | ⛔ ferma il giro |
| `peso-contesto` | Sorveglia quanto testo la macchina si porta dietro: un contesto gonfio costa soldi e fa perdere il filo. | ⚠️ avvisa, non ferma |
| `porte-check` | Trova i punti che pubblicano scavalcando il cancello: una porta scoperta non si vede, pubblica e basta. | ⛔ ferma il giro |
| `rotte-scriventi-check` | Trova le pagine del Pannello che cambiano qualcosa mentre fingono di leggere: se una tocca lo stato, deve chiedere il permesso come le altre. | ⛔ ferma il giro |
| `scan-segreti` | Cerca chiavi e password nei file che stanno per essere pubblicati, e blocca tutto se ne trova una. | 🚧 blocca la pubblicazione |
| `uscite-check` | Elenca ogni punto in cui la macchina tocca il mondo — email, messaggi, pagamenti — e pretende che ognuno abbia un controllo. | ⛔ ferma il giro |
| `vault-sanita` | Ultima visita alla memoria prima che finisca online: file troncati, link rotti, roba che non deve uscire. | 🚧 blocca la pubblicazione |

### 👥 I 120 senior sono a posto?

| Controllo | Cosa guarda | Se dice no |
| --- | --- | --- |
| `adozione-medicine` | Conta chi usa davvero le cure scritte nei lotti passati: una medicina che nessuno prende è una cura che esiste solo sulla carta. | ⛔ ferma il giro |
| `agent-registry-check` | Confronta i senior che esistono davvero con quelli elencati nei documenti: nessun agente orfano, nessun doppione. | ⛔ ferma il giro |
| `deferral-agenti` | L'organigramma è scritto in due posti: la mappa che leggi tu e la scheda che legge chi smista il lavoro. Se un rimando esiste in uno solo dei due, il lavoro finisce da un senior che non lo rivendica. | ⛔ ferma il giro |
| `guardiano-capacita` | Verifica che i comandi e le capacità promesse nei documenti esistano davvero come file eseguibili. | ℹ️ scrive e basta |
| `keyword-owner-check` | Ogni mandato ha un padrone solo: se due senior rivendicano la stessa cosa, il lavoro va a chi capita. | ⛔ ferma il giro |
| `senior-sola-lettura` | Controlla che i senior che promettono di lavorare in sola lettura non abbiano gli strumenti per scrivere: la promessa e i permessi devono dire la stessa cosa. | ⛔ ferma il giro |
| `stampo-check` | Controlla la qualità dei mansionari: kit fotocopia, quaderni mai scritti, senior più sottili della media. | ⛔ ferma il giro |

### 💶 Quanto costa tenerla accesa

| Controllo | Cosa guarda | Se dice no |
| --- | --- | --- |
| `costo-ai` | Segna il consumo di ogni giro — quanto tempo, quanti token — e tiene il totale del giorno. | ⏭️ spegne il motore AI |
| `freno-costi` | Il freno a mano sulla spesa AI: se non sa quanto è stato speso oggi, non finge che sia zero. | ⛔ ferma il giro · ⏭️ spegne il motore AI |
| `metabolismo` | Dice dove finiscono i soldi dell'AI: quale tipo di lavoro consuma di più e se conviene ancora. | ℹ️ scrive e basta |
| `sentinella-budget` | Un reparto che sfora il suo budget viene fermato con una proposta di STOP da firmare. | ℹ️ scrive e basta |

### ⏰ Tempo, code e scadenze

| Controllo | Cosa guarda | Se dice no |
| --- | --- | --- |
| `cronicita-allarmi` | Dice da quanti giri di fila un controllo sta dicendo no: uno rosso da tre settimane non deve più leggersi come uno rosso da un minuto. | ⚠️ avvisa, non ferma |
| `delta-gate` | Se dall'ultimo giro non è cambiato niente, evita di svegliare l'AI per riscrivere le stesse righe. | ⏭️ spegne il motore AI |
| `freschezza-rischi` | Controlla che i rischi gravi dell'azienda siano stati riguardati di recente, invece di restare fermi per mesi. | ⛔ ferma il giro |
| `guardiano-tempo` | Misura quanto lavoro sta aspettando la firma di Nicola e da quanti giorni: la coda è un costo. | ℹ️ scrive e basta |
| `housekeeping-azioni` | Sposta in archivio le azioni già fatte o rifiutate, così la coda da firmare resta corta e vera. | ℹ️ scrive e basta |
| `letargo` | Se quota, cassa o sensori calano, spegne il superfluo in ordine e tiene vivo solo il nucleo. | ⛔ ferma il giro |
| `midollo-spinale` | I riflessi rapidi: per ogni allarme delle sentinelle propone la reazione pronta, con il suo limite. | ℹ️ scrive e basta |
| `pausa-check` | Una card messa in pausa deve avere una sveglia: senza, dorme per sempre e nessuno se ne accorge. | ⛔ ferma il giro |
| `scadenzario-check` | Nessuna scadenza esterna arriva a sorpresa, e nessun conto alla rovescia trascritto resta a mentire. | ⛔ ferma il giro |

### 🧪 Il codice regge?

| Controllo | Cosa guarda | Se dice no |
| --- | --- | --- |
| `ci-stato` | Guarda come sono finite le prove sulle richieste di unione già aperte, e dice se il guasto l'ha portato quel lavoro o se era già nel ramo principale. | ⛔ ferma il giro |
| `test-cervello` | Lancia tutti i test del cervello a ogni giro: un test che nessuno esegue non è una rete, è un file. | ⛔ ferma il giro |
| `test-pannello` | Lo stesso per i test del Pannello, la parte che Nicola guarda davvero. | ℹ️ scrive e basta |
| `verifica-avversariale` | Smaschera l'auto-verifica finta: se il lavoro dice «verificato» senza che nessuno abbia provato a smontarlo, non vale. | ⛔ ferma il giro |

### 🚦 Le regole scritte in un posto solo

| Controllo | Cosa guarda | Se dice no |
| --- | --- | --- |
| `c4-cancelli` | Tiene in un posto solo le decisioni che prima erano incollate dentro gli script: quando si può saltare il tetto di spesa, con quali soglie è girato il giro, chi rimisura quale vincolo, dove un segreto sta ancora negli argomenti di un comando. | ⛔ ferma il giro |

### 📲 Le mani (non giudicano: agiscono)

| Controllo | Cosa guarda | Se dice no |
| --- | --- | --- |
| `avviso-telegram` | Il canale per un messaggio urgente su Telegram quando qualcosa non può aspettare il prossimo giro. | — |
| `notifica-approvazioni` | Manda a Nicola le cose da firmare invece di aspettare che apra il Pannello. | — |
| `retry-policy` | Decide se un lavoro fallito va ritentato e quando: una sola regola per il worker e per le sentinelle. | — |
| `sync-worker-plugins` | Tiene aggiornati sul server i pezzi approvati, così il worker gira sempre la versione firmata. | — |

Questa tabella non è scritta a mano: la ricava `cervello/guardiani-check.mjs` leggendo `cervello/giro.sh` a ogni giro. Se ne nasce uno nuovo compare qui da solo, e finché nessuno ha scritto cosa fa il giro resta rosso.

## 🗺️ Com'è fatta la macchina · 2026-08-16 07:32

La macchina che manda avanti MyCity, spiegata a chi non l'ha costruita. **Nove parti**: tre fanno il lavoro (la faccia, le braccia, la testa), tre lo controllano (la squadra, i guardiani, la memoria), tre lo collegano al mondo (le mani, i flussi, le estensioni).

Questa sezione non è scritta a mano: i numeri li conta `cervello/mappa-macchina.mjs` a ogni giro leggendo il repo, quindi non possono invecchiare. Se nasce un pezzo nuovo — una skill, un sensore, una mano, un servizio, un'area del Pannello — **il giro resta rosso finché qualcuno non ha scritto cosa fa**. La data qui sopra si muove solo quando cambia la struttura, non a ogni ritocco.

| # | Parte | In una frase | Quanto è grande |
| --- | --- | --- | --- |
| 1 | 🖥️ **Il Pannello — la faccia** | Quello che vedi e dove firmi. | 240 file · 37.508 righe · 15 aree · 77 rotte |
| 2 | 🦾 **Il worker e il VPS — le braccia** | L'unico pezzo che esegue davvero, 24 ore su 24. | 1823 righe · 14 servizi · 12 timer |
| 3 | 🧠 **L'AD — la testa** | Chi decide, delega e scrive in memoria. | mansionario di 482 righe · giro di 1871 righe · 19 manuali |
| 4 | 👥 **I senior — la squadra** | Gli specialisti a cui l'AD passa il lavoro invece di farlo tutto lei. | 120 senior · 125 quaderni di memoria |
| 5 | 🛡️ **Guardiani e sensori — il sistema immunitario** | Quello che impedisce alla macchina di raccontarti una bugia. | 337 script (79 nelle sottocartelle) · 11 sensori · 326 test + 29 prove bash |
| 6 | 📚 **La memoria — quello che ricorda** | Dove vive tutto ciò che la macchina sa e ha deciso. | 9 cartelle · 38 fatti-chiave · 44 file di auto-coscienza |
| 7 | ✋ **Mani e sensi — come tocca il mondo** | Come legge la realtà e come, quando glielo permetti, la cambia. | 5 mani · 13 modelli grafici |
| 8 | 🔄 **I flussi — come le parti si parlano** | I cicli veri: qui non ci sono file nuovi, c'è il «come funziona». | 5 cicli |
| 9 | 🧩 **Le estensioni — i moduli che si aggiungono** | Le capacità che si accendono quando servono, senza gonfiare il resto. | 5 skill · 6 workflow · 46 capacità |

### 1. 🖥️ Il Pannello — la faccia

Un'app web che **non decide niente**: mostra quello che la macchina ha scritto e raccoglie le tue risposte. È fatta così apposta — se il Pannello sparisse, la macchina continuerebbe a lavorare; quello che perderesti è la possibilità di vederla e di firmarle le decisioni.

- **1.1 Le aree (15)** — Le stanze in cui è divisa la Cabina — più 3 vecchie scorciatoie che oggi rimandano altrove. L'elenco qui sotto è letto dal codice, non scritto a mano.
- **1.2 Le caselle (63 componenti)** — I riquadri dentro le aree: bacheca, cuore della macchina, chat, autopilota, quaderni, volano.
- **1.3 Le rotte interne (77)** — Ogni casella ha la sua fonte: memoria, metriche, lavori, marketplace, controllo. Nessuna scrive sul sito dei negozi.
- **1.4 La logica (105 moduli)** — Dove vivono le regole vere: firma di un'azione, chat unificata, autopilota, controllo di onestà, economia.
- **1.5 Il contratto di navigazione** — La regola che fa funzionare il tasto INDIETRO sul telefono: ogni area, scheda e pannello sovrapposto è una tappa di cronologia, non un interruttore nascosto.
- **1.6 Deploy e installazione** — Va online solo quando cambia `pannello/`, via Deploy Hook. È installabile sul telefono come un'app (PWA).
- **1.7 Il database della Cabina (5 file SQL)** — Supabase **separato** da quello del marketplace: coda dei lavori, chat, diario, impostazioni, briefing. I dati dei negozi non si toccano da qui.

**Le aree, una per una:**

| Area | Cosa contiene |
| --- | --- |
| `plancia` | La home: il colpo d'occhio del giorno — cosa è successo, cosa aspetta la tua firma, come sta la macchina. |
| `azioni` | La coda delle decisioni: ogni card è un'azione pronta con «cosa cambia» e «se va bene». Qui si firma. |
| `lavori` | I lavori del cervello in corso o finiti: cosa sta girando adesso, cosa è andato storto, cosa si può ritentare. |
| `cervello` | Come ragiona la macchina: radiografie, salute onesta, utilizzo dei senior, schede dei problemi aperti. |
| `salute-sito` | Lo stato del marketplace vero: cosa non funziona sul sito dei negozi, per gravità. |
| `auto-coscienza` | La macchina che si guarda allo specchio: difetti trovati su sé stessa, cantiere delle riparazioni, storico della salute. |
| `numeri` | I KPI reali: ordini, incassi, negozi, clienti, payout, funnel — solo dati misurati, mai stime travestite. |
| `analisi-report` | Trend, funnel e unit economics: gli stessi numeri di Numeri letti in profondità, più i report scritti dall'AD. |
| `memoria` | Quello che la macchina ricorda: stato, decisioni, fatti chiave, quaderni dei reparti, archivio. |
| `persone` | Chi c'è attorno al marketplace: negozi, clienti, rider, la squadra dei senior, i contatti esterni. |
| `operazioni` | Come gira la macchina operativa: ordini, consegne, catalogo, magazzino, ritmi. |
| `mondo` | Il fuori: concorrenti, eventi in città, bandi, stampa, trend — quello che non dipende da noi. |
| `intelligence` | Alert, concorrenti, eventi, buchi di mercato, leve in uscita e reputazione: le 7 schede di analisi che prima stavano dentro Mercato. |
| `assistente` | La chat con l'AD: da qui gli parli, gli chiedi un lavoro, gli fai una domanda. |
| `contenuti` | I contenuti prodotti e in attesa di pubblicazione: post, grafiche, reel, con il loro colore di rischio. |
| `esplora` *(scorciatoia)* | Vecchia area di esplorazione file — resta come scorciatoia: oggi porta a Memoria/Archivio/GitHub. |
| `report` *(scorciatoia)* | Vecchia area dei report — resta come scorciatoia: oggi i report vivono in Memoria/Archivio. |
| `storico` *(scorciatoia)* | Vecchia area dello storico — resta come scorciatoia: oggi lo storico vive dentro Memoria. |

> 📁 Dove: `pannello/` — ospitato su Vercel · 📏 Quanto: 240 file · 37.508 righe · 15 aree · 77 rotte

### 2. 🦾 Il worker e il VPS — le braccia

Quando premi «Approva» sul Pannello, il Pannello **non fa** la cosa: scrive una riga in una coda. È il worker, sul server, che la prende e la esegue. Questa separazione è voluta: la Cabina può essere chiusa, il telefono spento, la sessione finita — il lavoro parte lo stesso. E se il worker si ferma, non parte niente di nascosto: resta tutto in coda, visibile.

- **2.1 Le due corsie** — Un worker per i lavori lunghi (giro, azioni) e uno per la chat, così una tua domanda non finisce in fila dietro mezz'ora di lavoro.
- **2.2 La coda** — `in attesa` → `in corso` → `fatto` o `errore`. Con ritentativo automatico, recupero dei lavori rimasti orfani e scarto di quelli scaduti.
- **2.3 I servizi e i timer (14 + 12)** — Due sempre accesi (worker e chat); gli altri partono a orario. L'elenco completo è qui sotto.
- **2.4 Il motore AI** — Claude Code è il motore principale. Un instradatore sceglie il modello in base al compito, invece di usare sempre il più costoso.
- **2.5 Le difese** — Non si sostituisce con una versione di sé stesso che non compila; lucchetto sulle scritture git; interruttore di pausa; battito del cuore.
- **2.6 Installazione e diagnosi** — Script di setup, aggiornamento e diagnostica completa. Per guardarci dentro c'è la skill `worker`.

**I servizi del server, uno per uno:**

| Servizio | Quando parte | Cosa fa |
| --- | --- | --- |
| `mycity-giro` | a orario | Fa partire il giro di perlustrazione: legge i dati reali, passa i guardiani, scrive il briefing. |
| `mycity-monitora` | a orario | Il sorvegliante del worker: se la coda si blocca o un lavoro resta orfano, se ne accorge. |
| `mycity-ritmo-mattino` | a orario | Il piano del mattino: cosa conta oggi, in ordine di ritorno. |
| `mycity-ritmo-mezzogiorno` | a orario | Il controllo di metà giornata: cosa si è mosso e cosa si è arenato. |
| `mycity-ritmo-sera` | a orario | Il report della sera: cosa è successo davvero oggi, numeri alla mano. |
| `mycity-ritmo-settimana` | a orario | La review del venerdì: cosa ha funzionato, cosa si taglia, cosa si prova la settimana prossima. |
| `mycity-salute` | a orario | La visita di salute, mattina e sera: worker, cervello, Cabina, senior, sensori — e scrive il referto. |
| `mycity-sentinella-dati` | a orario | La sentinella sui dati veri del marketplace: guarda i numeri, non i file. |
| `mycity-sentinella-motore` | a orario | La veglia sul motore AI: quando il pacchetto di Claude si esaurisce è l'unica cosa che resta sveglia — controlla se il limite è caduto e rimette in coda i lavori saltati, così la macchina si riaccende da sola. |
| `mycity-sentinella` | a orario | Le sentinelle: i segnali che devono svegliare qualcuno (negozio fermo, anomalia, soglia superata). |
| `mycity-verifica` | a orario | La verifica periodica dei sensori: gli occhi sono ancora aperti, o uno si è spento in silenzio? |
| `mycity-watch-main` | a orario | Tiene la copia sul VPS allineata a `main`: senza, il worker lavorerebbe con un cervello vecchio. |
| `mycity-worker-chat` | sempre acceso | Il worker della chat: corsia separata, così una tua domanda non finisce in fila dietro un giro lungo. |
| `mycity-worker` | sempre acceso | Il worker principale: sempre acceso, prende i lavori dalla coda e li fa eseguire all'AD. È quello che si muove quando premi «Approva». |

> 📁 Dove: `cervello/worker.sh` + `cervello/vps/` — su un server sempre acceso · 📏 Quanto: 1823 righe · 14 servizi · 12 timer

### 3. 🧠 L'AD — la testa

L'AD non è un programma: è un **mansionario** che l'intelligenza artificiale rilegge ogni volta prima di lavorare. Dice chi è, cosa può fare da sola, cosa deve chiederti, come parla e a chi delega. Cambiare il comportamento della macchina vuol dire cambiare queste parole — non riscrivere del codice.

- **3.1 La regola d'oro 🟢🟡🔴** — Verde = lo fa e basta. Giallo = lo fa e ti avvisa. Rosso = si ferma e aspetta la tua firma. Nel dubbio sale di colore. Tutto il resto poggia su questo.
- **3.2 Il giro** — La perlustrazione: legge i dati veri, passa i controlli automatici, scrive il briefing e aggiorna lo stato. È il battito che tiene viva l'azienda.
- **3.3 Le cadenze** — Mattino, mezzogiorno, sera, venerdì, mese: ognuna ha uno scopo diverso e un formato diverso.
- **3.4 I comandi** — Le frasi che fanno partire un lavoro («fai un giro», «radiografia», «contenuti pro»). Riconosciute anche dette in modo diverso.
- **3.5 L'auto-coscienza** — Quattro manuali: verificare il proprio lavoro, analizzare sé stessa, confrontarsi coi migliori, estrarre le lezioni.
- **3.6 I cancelli di qualità** — Nessun numero senza fonte · nessuna entità inventata · il titolo di un'azione deve suonare come lo diresti a voce, senza sigle.

> 📁 Dove: `CLAUDE.md` + i documenti in `cervello/` · 📏 Quanto: mansionario di 482 righe · giro di 1871 righe · 19 manuali

### 4. 👥 I senior — la squadra

120 ruoli, ognuno col suo mansionario, i suoi limiti e il suo quaderno. Non sono chatbot diversi: sono lo stesso motore con istruzioni diverse, e il motivo per cui esistono è che un esperto di una cosa sola sbaglia meno di un tuttofare. La regola che li tiene in ordine è **un solo padrone per ogni mandato**: se due potrebbero occuparsene, uno dei due rimanda all'altro per iscritto.

- **4.1 Motori di soldi** — Vendite, onboarding, retention negozi, marketing, growth, CRM, ads, influencer, contenuti, SEO, design, stampa, istituzioni.
- **4.2 Occhi** — Intelligence (il mondo fuori), analista (i numeri), data engineer (le tubature dei dati).
- **4.3 Costruttori** — Chi tocca il codice: tech, backend, frontend, devops, prodotto, automazioni.
- **4.4 Fondamenta** — Finanza, contabilità, legale, sicurezza, antifrode, dispute, QA, consegne, supporto, cura del cliente.
- **4.5 Cancelli creativi** — Direttore creativo e QA design: uccidono il contenuto debole prima che esca. Più UX, CRO e chi ottimizza i prompt.
- **4.6 L'espansione** — Rischio e conformità, governo, innovazione, operazioni a scala, professionisti (commercialista, notaio, avvocati: **preparano, non firmano**), banche e finanziamenti.
- **4.7 Le regole della squadra** — Un padrone per mandato · consegnare il lavoro fatto e non l'analisi di cosa fare · la Sala Operativa come canale comune · chiudere il cerchio scrivendo com'è andata.
- **4.8 I quaderni** — Cosa ha imparato ogni reparto, in un file per reparto. Per guardarli a fondo c'è la skill `senior`.

> 📁 Dove: `.claude/agents/` — un file per specialista · 📏 Quanto: 120 senior · 125 quaderni di memoria

### 5. 🛡️ Guardiani e sensori — il sistema immunitario

Sono controlli automatici che girano **prima** che il lavoro si chiuda. Non danno consigli: molti hanno il potere di fermare tutto. Il principio è uno solo — *meglio memoria vecchia che memoria che mente*: se uno strumento non riesce a misurare, il suo silenzio non vale come un sì. L'elenco completo, con chi ferma cosa, è nella sezione «🛡️ I guardiani della macchina» qui in bacheca: lì vive quella verità, e questa mappa la cita invece di ricopiarla.

- **5.1 I guardiani del giro** — Esempi veri: un fatto cambiato in un posto solo · lo sforzo pesante solo dove c'è un negozio vero · chi esegue non può firmare sé stesso · nessun numero senza fonte.
- **5.2 I sensori (11)** — Gli occhi sul mondo. Un occhio cieco blocca i numeri nuovi: l'elenco è qui sotto.
- **5.3 La visita di salute** — Tre risposte possibili per ogni controllo: ✅ provato, ❌ rotto, ⚪ non l'ho potuto vedere da qui. Il ⚪ non è mai un verde.
- **5.4 Il cantiere dei difetti** — I difetti trovati sulla macchina stessa, con la loro causa radice e una prova che diventa rossa se il difetto torna.
- **5.5 I test e la CI (326 + 29 + 4)** — I test girano a ogni giro, non solo quando qualcuno se li ricorda: un test che nessuno esegue è un file, non una rete.

**I sensori, uno per uno:**

| Sensore | Cosa fa |
| --- | --- |
| `supabase_rest` | L'occhio principale sul marketplace: negozi, prodotti, ordini, clienti veri. Se è cieco, il giro NON può scrivere numeri nuovi. |
| `stripe_api` | L'occhio sui soldi veri: incassi, payout, contestazioni. Finché la chiave non c'è, i payout restano stime dichiarate come tali. |
| `posthog_api` | L'occhio sul comportamento: chi visita, cosa clicca, dove abbandona. Serve a capire il perché dietro i numeri. |
| `resend_api` | Il canale email: dice se la posta può davvero partire. Un canale che non risponde non è una mano attiva. |
| `sito_uptime` | Il battito del marketplace: il sito dei negozi risponde? È il controllo che scopre un sito giù prima dei clienti. |
| `supabase_memoria` | Il battito della memoria: il database separato dove vivono coda, chat, diario e impostazioni della Cabina. |
| `pannello_uptime` | Il battito della Cabina: il Pannello risponde? Se è giù, tu non vedi niente anche se la macchina lavora. |
| `telegram_bot` | Il canale con cui la macchina ti scrive sul telefono quando qualcosa non può aspettare il prossimo giro. |
| `watchdog_esterno` | Il guardiano di fuori: controlla che la macchina batta anche quando la macchina stessa è morta e non può dirlo. |
| `n8n_health` | Lo stato del motore delle automazioni: è lo strumento con cui i senior collegherebbero le mani ai servizi esterni. |
| `mcp_supabase` | Il secondo canale verso i dati (comodità di sessione): utile quando c'è, mai la fonte di verità — quella resta il REST. |

> 📁 Dove: `cervello/*.mjs` — girano prima che l'AI scriva una riga · 📏 Quanto: 337 script (79 nelle sottocartelle) · 11 sensori · 326 test + 29 prove bash

### 6. 📚 La memoria — quello che ricorda

Le cartelle numerate sono **tue**: lì la macchina propone, non riscrive. La cartella `90-Memoria-AI` è sua: lì scrive da sola. La regola che tiene insieme tutto è **una casa sola per ogni fatto** — un prezzo, una data, un obiettivo vivono in un posto e gli altri file li citano. Se una copia vecchia resta in giro, un guardiano la trova e blocca la pubblicazione: una copia vecchia è una bugia che il Pannello ti mostrerebbe come verità.

- **6.1 Le tue cartelle** — Strategia, mercato, clienti, prodotto, soldi e rischi, piani, agenti. Sono tue: lì la macchina chiede prima di toccare.
- **6.2 La memoria dell'AD** — Stato, decisioni (registro che non si riscrive mai), azioni in attesa, bacheca, sala operativa, lezioni, briefing archiviati.
- **6.3 Il registro dei fatti (38)** — La fonte unica: prezzi, date concordate, negozio faro, obiettivi. Quello che leggi nella prima sezione di questa bacheca.
- **6.4 L'auto-coscienza (44 file)** — Difetti, calibrazione, apprendimento, chi è reale e chi è una scelta ragionata, salute, costi, pagella.
- **6.5 La memoria viva** — Chat, diario e briefing anche a database, così il Pannello te li mostra da qualunque dispositivo.
- **6.6 Le consegne** — Dove i senior depositano il lavoro finito, una cartella per reparto. Le grafiche stanno in `creativi/`.

> 📁 Dove: `MyCity-Vault/` — più il database della Cabina · 📏 Quanto: 9 cartelle · 38 fatti-chiave · 44 file di auto-coscienza

### 7. ✋ Mani e sensi — come tocca il mondo

È la parte più delicata, e per questo è quella con più freni. I **sensi** leggono soltanto: sul database del marketplace la macchina non scrive mai. Le **mani** invece toccano il mondo — un'email che parte non torna indietro — e funzionano al contrario di come ci si aspetta: **quello che non è esplicitamente permesso non parte**. Oggi la lista dei destinatari autorizzati contiene 0 email e 0 utenti: finché resta così, anche un'azione firmata gira **a vuoto** e ti mostra cosa avrebbe fatto.

- **7.1 Le mani (5)** — Ogni canale dichiara da sé il proprio rischio minimo e a chi arriva davvero. Un canale nuovo che non lo dichiara è trattato come 🔴 senza destinatario: non può aprirsi per distrazione.
- **7.2 La lista dei permessi** — Vuota = prova a vuoto forzata. È il freno che rende sicura tutta l'automazione: si toglie un destinatario alla volta, di proposito.
- **7.3 I sensi in lettura** — Dati del marketplace, pagamenti, comportamento sul sito. Sola lettura, sempre.
- **7.4 Il codice del sito** — Una copia in sola lettura del marketplace, che i senior tecnici leggono per capire i problemi. Le modifiche vanno in un ramo separato, la messa online resta 🔴.
- **7.5 La fabbrica dei contenuti (13 modelli)** — Trasforma un testo in una grafica vera, con i colori e i caratteri del marchio. Più i collegamenti alle AI per immagini e video.

**Le mani, una per una:**

| Mano | Cosa fa |
| --- | --- |
| `email` | Manda email vere (via Resend) a clienti e negozi. Ferma finché il destinatario non è nell'allowlist. |
| `facebook` | Pubblica un post sulla pagina Facebook. Pubblico: quindi mai sotto 🟡, mai in automatico senza firma. |
| `gbp` | Pubblica sulla scheda Google del negozio (Google Business Profile): post, orari, novità — dove la gente cerca. |
| `instagram` | Pubblica un post o una storia su Instagram. Stesso principio di Facebook: è la voce pubblica di MyCity. |
| `telegram` | Ti scrive sul telefono. È l'unica mano che parla solo con te: nessun estraneo la riceve. |

> 📁 Dove: `cervello/publishers/` per le mani · i sensori per gli occhi · 📏 Quanto: 5 mani · 13 modelli grafici

### 8. 🔄 I flussi — come le parti si parlano

Le prime sette parti sono i pezzi; questa è il movimento. Se dovessi capire una cosa sola di tutta la macchina, capisci questi cinque cicli: spiegano perché tutto il resto esiste.

- **8.1 Il ciclo di un'azione** — Un senior la prepara completa → finisce nella coda delle azioni → il Pannello te la mostra con «cosa cambia» e «se va bene» → tu firmi → il worker la esegue → l'esito torna in memoria. **Senza firma non parte niente.**
- **8.2 Il ciclo di un lavoro** — Scrivi in chat o premi un comando → nasce una riga in coda → il worker la prende → l'AI lavora → la risposta ti arriva mentre si scrive. Se cade: ritenta da solo, e se resta orfana qualcuno la recupera.
- **8.3 Il ciclo del giro** — Un orario fa partire il giro → i sensori aprono gli occhi → i guardiani controllano → l'AD scrive briefing e stato → la memoria viene pubblicata → il Pannello la legge e si aggiorna.
- **8.4 Il ciclo dell'apprendimento** — Com'è andata → lezione (le tue correzioni valgono doppio) → registro delle lezioni → torna nel contesto della sessione dopo. È il motivo per cui a inizio chat vedi «memoria persistente».
- **8.5 Il ciclo della pubblicazione** — Un ramo unico. Il codice ci arriva solo da una revisione, la memoria direttamente. Un lucchetto impedisce a due scritture di pestarsi, e il server tiene la sua copia allineata.

> 📁 Dove: trasversale — tiene insieme le parti da 1 a 7 · 📏 Quanto: 5 cicli

### 9. 🧩 Le estensioni — i moduli che si aggiungono

Tre cose diverse che spesso vengono confuse. Una **skill** è un mansionario che si apre da solo quando serve (chiedi «la macchina sta bene?» e si apre quello della visita). Un **workflow** è una squadra di analisti che parte in parallelo su un problema grosso e verifica ogni scoperta prima di riportarla. Una **capacità** è un'idea di frontiera già scritta come modulo, in attesa del momento in cui avrà senso accenderla.

- **9.1 Le skill (5)** — Si aprono al momento giusto senza che tu debba chiamarle per nome. L'elenco è qui sotto.
- **9.2 I workflow (6)** — Analisi profonde a molte dimensioni, dove ogni problema trovato viene messo alla prova prima di finire nel report.
- **9.3 Le capacità (46)** — Il magazzino del futuro: il gemello digitale del negoziante, il concierge della spesa, il catalogo che si scrive da solo, il sismografo della città.

**Le skill:**

| Skill | Cosa fa |
| --- | --- |
| `cantiere` | La riparazione dei difetti che le radiografie hanno trovato: si sceglie per malattia, non per conteggio. |
| `salute` | La visita: controlla i cinque organi vivi e distingue ✅ provato, ❌ rotto e ⚪ non l'ho potuto vedere da qui. |
| `senior` | La squadra dei 120 a fondo: chi è vivo, chi dorme, chi si sovrappone, chi non consegna nel formato giusto. |
| `verify` | La prova sul campo: guida il Pannello vero con un browser e i test del worker, per dimostrare che un fix funziona. |
| `worker` | Il worker e il VPS a fondo: code, servizi, lock, orfani, riavvii — quando qualcosa è fermo e serve la causa vera. |

**I workflow:**

| Workflow | Cosa fa |
| --- | --- |
| `audit-design` | Audit profondo del design: 11 dimensioni che coprono i 24 punti visivi e di usabilità del sito. |
| `audit-pannello` | Audit del Pannello stesso: bug di navigazione, stato perso, liste vecchie, errori a runtime. |
| `auto-radiografia` | La macchina che analizza sé stessa: 12 dimensioni sull'architettura, più pre-mortem e confronto coi migliori. |
| `giro-operativo` | Il giro fatto da una flotta di senior in parallelo: ognuno propone le mosse a maggior ritorno, poi l'AD ordina. |
| `radiografia-totale` | Tutti gli organi insieme in tre giri: 48 dimensioni su macchina, Pannello, senior, worker, GitHub e codice, dove ogni giro cerca ciò che il precedente non ha visto. |
| `radiografia` | Audit profondo del marketplace: 13 dimensioni in sola lettura, ogni problema verificato prima di essere riportato. |

> 📁 Dove: `.claude/skills/`, `.claude/workflows/`, `cervello/capacita/` · 📏 Quanto: 5 skill · 6 workflow · 46 capacità

### Come approfondire

Ogni voce ha un numero: in chat basta **«approfondisci 5.1»** o «spiegami il 2.2». Se preferisci a voce: «cosa succede quando premo Approva» (è l'8.1), «chi mi protegge dalle bugie» (la parte 5), «dove finiscono i soldi» (la 6.3 e i numeri della parte 1).

> ⚠️ Questa mappa dice **cosa c'è e quanto è grande**, non se funziona. Un pezzo può essere contato, descritto e completamente rotto: qui risulterebbe sano. «Funziona?» è un'altra domanda e ha un altro strumento — la visita di salute.
