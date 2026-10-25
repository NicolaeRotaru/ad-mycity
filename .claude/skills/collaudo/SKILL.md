---
name: collaudo
description: >-
  Il metodo di collaudo che ha fermato tredici difetti prima della consegna, il 23/8/2026. Aprila
  ogni volta che si costruisce o si ripara qualcosa che deve REGGERE — un freno, un guardiano, un
  fix del marketplace, una funzione che tocca soldi o dati — e prima di dichiararla finita. Vale
  anche quando Nicola dice, in qualunque forma: «controlla bene quello che hai fatto», «sei sicuro
  che funziona?», «non voglio che risolvendo ne crei altri», «verifica prima di consegnare», «fai
  la prova», «l'hai provato davvero?». La regola che tiene tutto: chi ha costruito NON collauda, e
  chi collauda ha il mandato di distruggere. NON è la radiografia (quella TROVA i difetti), non è
  il cantiere (quello li RIPARA): questo dice se la riparazione regge davvero.
---

# Il collaudo — chi ha costruito non collauda

> Nato il 23/8/2026 da Nicola: *«ogni volta che tu risolvi i problemi ne crei altri.»*
> Il conto che gli ha dato ragione: su 787 difetti della macchina, **99 li ha creati il riparare**
> — 25 regressioni dichiarate più 74 trovati mentre si riparava lì accanto.
> Il primo giorno in cui questo metodo è girato davvero, su tre freni nuovi: **tredici bocciature
> su quattordici collaudi**, e ogni singolo costruttore aveva consegnato dicendo «fatto, tutto verde».

## La regola sola, se ti ricordi una cosa sola

**Chi ha costruito il pezzo non lo collauda.** Non per sfiducia: perché chi costruisce cerca
conferme, e mette in scena la variante del difetto che al suo lavoro conviene. Il collaudatore parte
da zero, con un mandato scritto: *dimostra che questa cosa non funziona; nel dubbio, bocciala.*

## I quattro passi

1. **Misura il male prima di curarlo.** Non «trovo difetti»: conta da dove NASCONO. Se non sai se
   il male è che scopri cose vecchie o che ne crei di nuove, curerai quello sbagliato.
2. **Uno costruisce.** Con la spec, il caso vero in mano, e l'obbligo di eseguire davvero: l'output
   vero, mai una promessa.
3. **Un altro prova a distruggere.** Con **due lenti diverse** — non due copie della stessa
   domanda. Le due che funzionano:
   · *sa diventare rosso davvero?* (ricrea il difetto e guarda)
   · *nasce rotto?* (montato sul serio, blocca la macchina per tutti?)
   Le lenti sono sempre due; quanti collaudatori le portano lo dice il dosaggio, qui sotto.
4. **Chi ha costruito ripara, e si torna al 3.** Finché regge, o fino al terzo rosso: lì decide
   Nicola (vedi la regola di arresto).

## Le quattro leggi del collaudatore

- **Ricrea il difetto nella variante SCOMODA.** Quella che capita da sola facendo il lavoro normale,
  non quella che conviene al freno. È la legge che ha trovato più difetti: un freno era verde
  proprio nel caso che succede sempre.
- **Ricalcola i numeri che il pezzo stampa.** Un numero gonfiato dalla parte comoda è peggio di un
  difetto: è una spunta verde sopra una malattia viva. (Misurato: dichiarava 40% di cecità, era 81%.)
- **Il verde deve aver guardato qualcosa.** Zero cose esaminate = ⚪, mai ✅. Il «verde muto» è un
  difetto, non un successo.
- **Monta ed esegui, non ragionare.** «L'ho ragionato» non è una prova. Copia il repo, aggancia,
  lancia il cancello intero. Le scoperte migliori sono arrivate tutte da lì.

## La regola di arresto (senza, il metodo non finisce mai)

Se dici a qualcuno «trova un buco», un buco lo trova sempre. Quindi si dichiara PRIMA:

- si boccia **solo** per una scorciatoia che capita da sola nel lavoro normale; una che richiede
  malafede deliberata si scrive e non blocca;
- **al terzo rosso sullo stesso pezzo non parte un quarto giro**: si porta a Nicola *semplifica,
  restringi o continua*. Per un freno della macchina «restringi» vuol dire che non si aggancia e
  resta uno strumento da lanciare a mano, dichiarato. *Perché:* nella prima ondata del sito (14-17/10)
  una squadra è stata bocciata tre volte e rifatta da capo, un'altra è passata al quinto collaudo. Il
  giro intero che non converge sta nella skill `cantiere`, sezione «Il giro che converge»;
- quello che non si sa misurare **si toglie dal verdetto e si scrive come buco, col numero vero**.
  Meglio stretto e vero che largo e finto.

## Il dosaggio — non tutto merita quattro giri

| Cosa stai facendo | Quanto collaudo |
|---|---|
| Una riga di testo, una nota | Nessuno |
| Un fix o un freno che non tocca soldi, dati o permessi | **Un collaudatore solo**, con tutte e due le lenti + il montaggio vero |
| Qualcosa che tocca soldi, dati o permessi | **Due collaudatori diversi**, uno per lente + il montaggio vero |
| Qualcosa dove sbagliare costa giorni | Il giro intero, fino al terzo rosso |

Tre cose non si dosano mai: **chi ha costruito non collauda**, il **difetto ricreato nella variante
scomoda**, il **montaggio vero** prima della consegna. Sul sito il rischio non si giudica a occhio: è
il campo `rischio` (soldi, dati, permessi o nessuno) che `node cervello/schede-pacchetto.mjs` calcola
per ogni pacchetto dalla mappa delle lenti. Una squadra che ha scritto fuori dal suo territorio conta
come a rischio, qualunque sia il campo. Dopo una bocciatura si ricollauda **solo con la lente che ha
bocciato**: la rete per il resto è il riesame sul diff dell'ondata, che viene dopo. Il ricollaudo è un
lavoratore nuovo, quindi riceve i motivi della bocciatura e i gravi nati da rilanciare: senza, regge
senza averli cercati. Un grave nato nel collaudo esce dal conto solo quando la squadra lo mette fra i
chiusi **e** un collaudo dopo regge (skill `cantiere`, R-F).

*Perché si dosa, col numero.* Ogni collaudatore è un agente che parte da 53.210 gettoni al primo
turno se è un senior come `tech`, da 91.078 se è un `general-purpose`, e li rilegge a ogni turno
(misura del 25/10). Nella
prima ondata del sito le 13 squadre delle prime tre correzioni sono passate tutte al primo collaudo:
lì il secondo collaudatore ha solo confermato. Le bocciature ripetute sono arrivate sui rimborsi — la
squadra dei soldi è passata al quinto collaudo, quella dei testi del rimborso è stata bocciata al
terzo — e sulla parte dell'AI, bocciata tre volte. Il secondo collaudatore si spende dove sbagliare
costa soldi o dati.

## Il catalogo delle scorciatoie — leggilo PRIMA di costruire

È la parte che fa risparmiare i giri: sono i modi veri, misurati, in cui un pezzo «passa» senza
funzionare. Il costruttore che li conosce non li lascia aperti.
**Sta in `cervello/scorciatoie-note.md`. Quando un collaudatore ne trova una nuova, si aggiunge lì.**

## L'ordine sbagliato, per non rifarlo

Radiografia → riparo → controllo alla fine. È l'ordine che produce il male: il controllo arriva
quando il lavoro è già consegnato e nessuno ha voglia di rimetterlo in discussione. Il controllo va
**prima** della consegna, e in mano a un altro.

## Il livello sopra, quando c'è tempo

Questo metodo TROVA i difetti. Il livello sopra è **non farli nascere**: dove c'è una sola porta per
scrivere una cosa, la porta di servizio non esiste e non serve il freno che la cerca. Tre difetti del
23/8 — la porta a mano contro quella automatica, il puntatore che resta indietro, il file scritto in
due modi — sarebbero stati **impossibili** con un punto d'ingresso solo.
La gerarchia: *rendere impossibile* batte *misurare*, che batte *verificare*, che batte *collaudare*.

## Come si esegue in pratica

Il giro completo gira come workflow a squadre separate: una fase che studia e censisce l'esistente,
una che costruisce, una che collauda con le due lenti (in parallelo, quando i collaudatori sono due),
una che monta e lancia il cancello intero. Sul sito il workflow è `.claude/workflows/ondata-sito.js`,
e il tipo del collaudatore segue i permessi della sua lente. La lente A, e la lente unica dei pacchetti
senza rischio, ricreano il difetto con una mutazione in un worktree loro: girano con `tipo_costruisce`,
`tech` se non lo dai. La lente B legge il delta e lancia le prove senza scrivere: gira con
`tipo_controlla`, `qa` se non lo dai, come i revisori del riesame. Il mansionario di `qa` è in sola
lettura e non tocca git, quindi non gli tocca mai una mutazione. Chi ha costruito non collauda resta
vero: ogni collaudo è un lavoratore nuovo, non la squadra che ha scritto. Il tipo snello `squadra-sito`
è una proposta ancora da firmare (skill `cantiere`, R-G). Mai `general-purpose`. Lavorano sul `git diff`. Gli script dei quattro giri del 23/8 sono l'esempio di riferimento, e i referti dei
collaudatori stanno in `consegne/audit/2026-08-23-collaudo-tre-freni/`.

**Prima di far partire il costruttore, dagli sempre tre cose:** il caso vero da leggere (non il
riassunto), il catalogo delle scorciatoie, e il divieto di dichiarare finito senza aver eseguito.
