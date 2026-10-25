---
data: 2026-10-25 14:40
tipo: analisi-consumo
richiesta: «fai un'analisi approfondita per capire come mai consumi così tanti token» (Nicola, 25/10)
---

# Perché un'ondata del sito si mangia la settimana, e come farne dodici in un mese

**In due righe.** Il costo non sta nel lavoro: sta nel rileggere. Ogni agente rilegge tutto il suo contesto a ogni passo, e l'ondata 1 ha acceso più di 600 agenti. Ho misurato le tre cause e costruito gli attrezzi che le tagliano, restando su Opus.

## In parole semplici

Un agente non ricorda: a ogni passo rilegge da capo tutto quello che ha davanti. Quel «tutto» parte già grosso. Prima ancora di cominciare, un agente generico si porta dietro circa 91.000 gettoni (un gettone è circa una sillaba di testo). Li ho misurati oggi, sul primo passo di agenti veri.

Un esempio vero, di oggi. Uno dei miei analisti ha lavorato per 29 passi in tutto e ha scritto 10.000 gettoni di risposta. Per farlo ne ha riletti 3,6 milioni: per ogni gettone scritto, circa 360 riletti.

Quindi il conto è una moltiplicazione con tre fattori:

- **Quanti agenti.** L'ondata 1, dal 14 al 17 ottobre, ne ha accesi più di 600. Due su tre controllavano il lavoro degli altri: ogni difetto trovato aveva il suo verificatore, anche i piccoli.
- **Quanti passi fa ognuno.** Gli agenti che oggi hanno costruito gli attrezzi ne hanno fatti fra 8 e 71, in media 41.
- **Quanto pesa ogni passo.** C'è il peso di partenza, più tutto quello che l'agente ha letto nel frattempo.

Il primo fattore era impazzito. Il giro «riesame → correzione» non aveva un freno. Riparando nascevano difetti piccoli, i piccoli tornavano nel giro, e ogni giro ne faceva nascere altri. I riesami sono stati sette: dei 123 difetti nati riparando, 109 erano minori.

## Cosa cambia per te

**Il giro adesso si ferma da solo.** Un workflow nuovo fa girare un'ondata intera con un tetto di 45 agenti. Le regole che lo fanno convergere:

- I difetti minori nati riparando vanno nel registro, non nel giro.
- Il secondo verificatore lavora solo sui gravi.
- Due collaudatori solo dove ci sono soldi, dati o permessi.
- Un riesame solo.
- Al massimo due giri di correzione. Poi si ferma e chiede a te.

**Ogni passo pesa meno.** Il manuale dell'AD, cioè il file che ogni agente rilegge a ogni passo, scende da 75 KB a 35 KB. Più di metà era l'elenco dei 120 senior, che stava già in altri due posti. In più squadre e collaudi girano coi senior `tech` e `qa`, che portano solo gli strumenti del mestiere. Partono da circa 57.000 gettoni invece di 91.000: misurato su 26 agenti veri, oggi.

**Il costo si misura, non si stima.** Un comando nuovo legge i registri delle sessioni e stampa i gettoni veri, agente per agente. Fino a ieri il foglio del lotto diceva «stimato e mai misurato».

**La stima per le ondate.** Il conto lo faccio con le misure di oggi, e il metodo nuovo non l'ho ancora fatto girare su un'ondata vera.

| | ondata 1 (14-17/10) | un'ondata col metodo nuovo (stima) |
|---|---:|---:|
| agenti | più di 600 (circa 762 nel modello ricostruito) | al massimo 45, di solito 15-40 |
| peso di partenza di ogni passo | circa 91.000 gettoni | circa 37.000 (57.000 dei senior meno circa 20.000 del manuale tagliato) |

Le dodici ondate sommate fanno meno agenti della prima da sola, e ognuno pesa meno della metà. È una stima con un «se»: regge se il freno a due giri tiene davvero sul campo.

Opus resta, e anche l'ultracode. Il risparmio viene dal metodo, non dal modello.

## Cosa devi fare

- **Prima, leggere e firmare la richiesta di unione.** Cambia il manuale dell'AD, due skill e il foglio del lotto: è un'auto-modifica 🟡, vale solo con la tua firma.
- **Poi, decidere sul tipo snello per le squadre.** È un agente con i soli sei strumenti di lavoro e un mansionario di due pagine. Partirebbe da circa 35.000 gettoni invece dei 57.000 di `tech`, e da circa 24.000 col manuale tagliato: è una stima fatta sommando pezzi misurati. Non l'ho creato: farlo accettare dai guardiani dell'elenco toccava più di otto file, e il freno che avevo messo era proprio quello. Se mi dici sì, lo faccio in una sessione nuova, perché l'elenco dei tipi si carica solo all'avvio.
- **Alla prossima ondata, dirmi «ondata 2».** Parto col metodo nuovo. Alla fine ti porto il conto vero accanto a quello dell'ondata 1.

## Cosa non ho verificato

- **Il workflow dell'ondata non ha mai girato su un'ondata vera.** L'ho provato su un motore finto, con 37 casi, compreso quello dei gravi che spariscono. Non so ancora se le squadre seguono i prompt, né quanto costa davvero un'ondata.
- **Cosa conta il tuo limite settimanale.** Ci sono due contatori possibili: tutti i gettoni, oppure tutti meno quelli riletti dalla memoria veloce. Non so quale usa il piano, e il comando li stampa tutti e due. Il metodo nuovo li abbassa entrambi, ma di quanto lo dirà la prima ondata.
- **Le prove mute delle squadre.** Il comando che fa girare solo i test dei file toccati non ha mai lanciato i test veri del sito. Qui il sito non ha le sue librerie installate.
- **Quanto è costata questa analisi.** È costata parecchio, e lo dico. I tre lavori di squadra di oggi fanno circa 236 milioni di gettoni contando le riletture, e circa 8,5 milioni senza. A questi si aggiunge la mia sessione. Più della metà della costruzione l'ha presa il collaudo: è il prezzo di trovare i difetti prima che arrivino a te.

---

## Dettagli tecnici

### Le misure (25/10, `node cervello/conto-token.mjs`)

Peso di partenza al primo turno, per tipo di agente (sonda `wf_604836fb-b6a`, un turno ciascuno):

| tipo | primo turno | cosa c'è dentro |
|---|---:|---|
| `general-purpose` / subagente di workflow | 91.078 (94.086 sui miei analisti) | 49 strumenti (Artifact da solo 59 KB), CLAUDE.md 73 KB, elenco skill 24 KB, strumenti differiti 24 KB |
| `tech` (senior, strumenti ristretti) | 53.210 | 13 strumenti 29 KB, CLAUDE.md 73 KB, mansionario 21 KB |
| `Explore` | 45.394 | niente CLAUDE.md, 46 strumenti |
| ciclo principale (l'AD) | 162.343 | elenco dei 120 senior 107 KB, CLAUDE.md, strumenti |

I sei strumenti di lavoro (Read, Grep, Glob, Bash, Edit, Write) pesano 14.851 byte su 180.866 del generico. Il CLAUDE.md rende circa 1,95 caratteri per gettone: misurato per differenza fra i tipi, non con un tokenizzatore.

I lavori di oggi:

| run | agenti | turni | con le riletture | senza le riletture |
|---|---:|---:|---:|---:|
| analisi, 4 lenti (`wf_3e744be2-f7b`, general-purpose) | 4 | 183 | 24.450.213 | 800.222 |
| costruzione + collaudo (`wf_b3ed64db-62d`, tech/qa) | 26 | 1.059 | 141.564.331 | 5.192.994 |
| di cui solo collaudo | 14 | 621 | 79.324.693 | 2.646.396 |
| correzione (`wf_9215202d-aa5`, tech/qa) | 12 | 500 | 70.113.925 | 2.528.510 |

Primo turno dei 26 della costruzione: da 55.611 a 63.211. La quota del peso di partenza sulle riletture è al massimo il 44%: è un tetto, perché il primo turno contiene anche il compito. Il resto è contesto accumulato durante il lavoro.

Ondata 1, ricostruita da `consegne/audit/2026-10-16-prima-ondata-sito.md` e dal git log: circa 762 subagenti, di cui 513 verificatori (67%), 102 per 30 passaggi di correzione, 62 revisori. Il referto dichiara 342 subagenti e 64 milioni di gettoni dal quarto riesame in poi. Quel numero è il contatore del motore dei workflow, che non coincide con nessuno dei due di `conto-token.mjs`.

### Cosa è cambiato

- `cervello/conto-token.mjs` (nuovo) e la sua prova: `--workflow <runId>`, `--dir`, `--sessione`, `--json`. Uscita 0 misurato, 2 cieco (mai un verde con zero misure).
- `.claude/workflows/ondata-sito.js` (nuovo). Lo stadio delle schede costa zero agenti, perché arrivano da `cervello/schede-pacchetto.mjs --piano P --ondata N --json`. Ruoli: chi scrive o muta `tech`, chi legge `qa`. Tetti: 45 agenti, 2 rifacimenti per pacchetto, 2 giri di correzione; poi `chiedi_a_nicola`. La prova `cervello/test/ondata-sito.test.mjs` fa 37 casi sul motore finto. L'ultimo l'ho scritto io dopo il collaudo: un grave chiuso e poi dichiarato parziale restava chiuso, perché `unisci()` teneva l'unione dei chiusi. Verificato nei due versi.
- `cervello/schede-pacchetto.mjs` e `cervello/prova-sito.mjs` (nuovi), con le loro prove. Prove mute e mirate, al massimo 30 righe, tetto sotto i 540 secondi dello strumento Bash.
- `CLAUDE.md` da 75.031 a 35.377 byte. L'organigramma è passato senza riscritture in `MyCity-Vault/07-Agenti/ORGANIGRAMMA.md`. Lo leggono `agent-registry-check`, `deferral-agenti`, `keyword-owner-check` e `turno-senior`. Sono riscritti anche sei rimandi al vecchio posto: `senior/SKILL.md`, `auto-radiografia.js`, `radiografia-totale.js`, `auto-radiografia.md`, `sentinelle.md`, i vincoli di `giro.sh`. Il controllo nuovo dei rimandi diventa rosso se uno torna. Il registro esce 0 con 0 scarti.
- Due ritocchi al CLAUDE.md: il passo «Verifica» ha il collaudo proporzionato, e un blocco nuovo «🪙 Il consumo è una moltiplicazione».
- Il protocollo che converge (R-A … R-H) è nella skill `cantiere`, il dosaggio nella skill `collaudo`. La casistica sta in `cervello/lotto-a-pacchetti.md` (sezioni ③, ⑦, ⑨, ⑩) e il mansionario della squadra in `cervello/brief-corsie.md`. La prova `cervello/test/lotto-a-pacchetti-conto.test.mjs` controlla che il conto della sezione ⑨ non dia un verde muto.
- Nei fogli del lotto i numeri come «600 agenti» sono diventati «600 subagenti». Il guardiano dei conteggi li leggeva come un numero di senior sbagliato.
- `cervello/mappa-copertura.mjs`: la voce d'attesa di «Agent» era scaduta il 7/9 e diceva una causa sbagliata. Ora dice quella verificata. Il filtro che nomina «Task» sveglia già `pre-scrittura` su «Agent»: lo mostra il libro mastro del 25/10 alle 12:01:20. Ma la guardia non pianta l'ancora, quindi per Agent si apre e non fa niente. La scadenza nuova è l'8/11, legata al lotto del freno dei senior. Avevo provato a dare Agent per sorvegliato con un'equivalenza fra i due nomi: il riesame del perimetro l'ha bocciata, giustamente, perché era un rosso travestito da verde.
- I pezzi nuovi sono iscritti nei registri della macchina: `cervello/guardiani-motivi.json` (perché `prova-sito` e `schede-pacchetto` li lancia una persona e non il giro), la mappa della bacheca (`cervello/censimento-macchina.mjs`), la consegna dei permessi da applicare (`consegne/sicurezza/2026-07-29-permessi-senza-jolly.md`, rigenerata).
- La carta #212 in «Da approvare» chiede la tua firma su questo lavoro.

### Il riesame del perimetro, e cosa ha trovato

Due revisori in sola lettura hanno riguardato i 17 file toccati, ognuno con la lente della sua dimensione (cadenza-esecuzione e rischio-sicurezza-se). Hanno trovato 12 difetti, e 5 erano gravi nati da questo lavoro. È il caso esatto che il protocollo nuovo deve reggere, e l'ha retto: i minori sono andati nel registro e i gravi a un giro di correzione. Il giro ha avuto un rifacimento e poi si è fermato, a due giri.

- Chiusi, ognuno con la sua prova e la sua mutazione rossa: AR-1014 e AR-1015 (il riesame dell'ondata saltava pacchetti e budget), AR-1019 (l'equivalenza Task-Agent), AR-1020 (il giro senza organigramma), AR-1021 (il rischio dei pacchetti).
- Aperti come debito minore: AR-1016, AR-1017, AR-1018, AR-1022, AR-1023, AR-1024, più AR-1009 che c'era già.

Il cancello del lotto: «si può consegnare dichiarando i buchi». L'unico ⚪ è il controllo dei tipi del Pannello, che qui non gira perché mancano le sue librerie; questo lavoro non tocca il Pannello. La suite della macchina: 0 rossi in Node su 484 file; in bash 1, il debito dichiarato AR-834 sotto il suo tetto.

### Tenuto fuori: il freno dei senior

`cervello/cancello-senior.mjs` blocca un agente a fine lavoro se lascia voci gravi. Il collaudatore ha verificato tre cose:

- l'«ancora» che dice quale senior sta lavorando non si pianta mai, perché `pre-scrittura.mjs` riconosce solo lo strumento «Task» e oggi si chiama «Agent»;
- senza ancora, il freno giudica tutto il lavoro non salvato, anche quello lasciato da altri;
- correggendo il nome, diventa raggiungibile un difetto che c'era già: l'ancora non scade mai, e il contatore conta le partenze, non chi parte.

Al terzo «no» sullo stesso pezzo, la regola nuova dice di restringere. Il lavoro è salvato in `consegne/audit/2026-10-25-freno-senior-rinviato.patch`, con due correzioni e le loro prove, per un lotto suo. Il filtro dell'hook in `.claude/settings.json` porta già la delega «Agent» fino a `pre-scrittura`, perché «Task» è un altro nome di Agent. Quindi la carta #119 non è la leva che accende il freno.

### Debito minore lasciato fuori, per la regola R-B

- `conto-token.mjs`: tre comportamenti dichiarati senza una prova propria, cioè i meta illeggibili, le righe senza id e l'avvio da un percorso con spazi.
- `ondata-sito.js`: due gravi nati con lo stesso inizio di titolo producono lo stesso worktree; un `regge:false` senza difetto nominato resta senza chiave; un grave confermato nella correzione dopo il riesame passa per chiuso se il collaudo boccia senza ritrovarlo.
- Il riconoscitore dell'organigramma non vede «**a / b**», i senior in prosa, l'HTML e il barrato; l'uscita del registro stampa «❌ 0 ORFANI» anche con zero orfani.
- I fogli di metodo: il conto di ⑨ guarda i campi che mancano, non i valori sbagliati; due frasi sui motivi del ricollaudo non hanno una prova.

### Prossimi passi proposti

1. Il tipo snello `squadra-sito`, sei strumenti, dopo la tua firma.
2. Il freno dei senior, da sistemare in un lotto suo partendo dalla patch salvata.
3. La prima ondata col metodo nuovo, misurata con `node cervello/conto-token.mjs --workflow <runId>` e confrontata con questa tabella.
4. I sei workflow di ricerca (radiografia e simili) ancora senza tetto di uscita, né effort per stadio. Fanno 16-60 agenti a lancio: non sono loro la causa del limite, ma la radiografia è l'ingresso delle ondate.
