---
data: 2026-08-11 01:40
tipo: prompt-per-sessione-nuova
oggetto: secondo lotto di conversione delle prove — i 93 gravi
---

# Il prompt da incollare in una sessione nuova

**In due righe:** qui sotto c'è il testo da copiare in una sessione nuova per far convertire i 93 difetti gravi che hanno ancora una prova a parole. Porta con sé le regole che hai approvato, il metodo che funziona, e i cinque errori che ho già pagato io.

## Cosa cambia per te

Non devi rispiegare niente. La sessione nuova parte sapendo già cosa hai deciso, dove sta il lavoro di ieri, e in quali trappole non deve ricadere.

Un esempio di cosa evita. Ieri ho costruito una prova che diceva «riparato» perché il pezzo di programma moriva prima di arrivare al punto pericoloso. Il prompt lo racconta per esteso, così la prossima sessione lo riconosce invece di rifarlo.

## Cosa devi fare

Copia tutto quello che sta fra le righe qui sotto e incollalo in una sessione nuova. Niente altro.

## Cosa non ho verificato

Non ho provato il prompt facendolo girare davvero: lo saprai al primo lotto. I numeri dentro (93 gravi, 7 che puntano al vuoto, 13 su `giro.sh`) li ho contati adesso sul cantiere vero.

---

Fai il **secondo lotto di conversione delle prove del cantiere**: i difetti **gravi** che hanno ancora una prova a grep.

## Cosa è già stato deciso, e da chi

Nicola ha approvato due regole il 10/8 in chat («ok asticella e ok tasso di chiusura»). Sono in `CLAUDE.md`, vicino alla regola della PR, e valgono sempre:

- **L'asticella (AR-564):** un difetto grave o bloccante ha una prova che GIRA. Cioè un comando che diventa rosso se il difetto c'è. In alternativa, `verifica: {tipo:"umano"}` dichiarato. Mai una parola da cercare in un file.
- **Il tasso di chiusura (AR-566):** chiusi ÷ aperti nel mese, obiettivo ≥ 1. Oggi vale **0,18**, quindi il freno è acceso: il giro non apre ricerche nuove. **Questo lavoro è chiudere, non cercare: è esattamente quello che il freno vuole.**

Il primo lotto (5 bloccanti) è già fatto: PR #697, ramo `claude/worker-analysis-m6tydp`. Leggi `consegne/audit/2026-08-10-radiografia-catena-di-lavoro.md` prima di partire.

## Il lavoro

Sono **93 difetti gravi aperti** la cui prova è ancora `{file, pattern}`. Li trovi così:

```bash
node -e '
const d=JSON.parse(require("fs").readFileSync("MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json","utf8"));
const g=d.difetti.filter(x=>x.stato!=="chiuso" && x.verifica?.pattern && x.verifica?.file && !x.verifica?.comando
  && String(x.gravita).toLowerCase()==="grave");
console.log(g.length); g.forEach(x=>console.log(x.id, "|", x.verifica.file, "|", String(x.titolo).slice(0,70)));'
```

**Non farli tutti e 93 in un lotto.** Il primo lotto era 5 e mi ha portato via una sessione intera. Ogni prova va costruita, e poi verificata nei due versi. Fanne **8-12**, bene, e lascia scritto quanti ne restano.

### Da quali partire

**① I 7 che puntano a un file che non esiste** — AR-132, AR-189, AR-216, AR-350, AR-407, AR-418, AR-432. La loro prova indica un file che il fix avrebbe dovuto creare, e che non è mai nato. Sono già stati nominati da AR-567. Per questi la conversione onesta è quasi sempre `tipo: "umano"` con una nota che dice cosa manca: un puntatore al vuoto sembra un piano ed è un buco.

**② I 13 che guardano `cervello/giro.sh`** — AR-133, AR-158, AR-208, AR-215, AR-304, AR-321, AR-323, AR-324, AR-392, AR-395, AR-416, AR-423, AR-428. Stesso file, stesso metodo: si estrae il blocco vero da `giro.sh` e lo si esegue con un motore finto. La tecnica è già scritta e funziona — guarda `eseguiBloccoDelGiro` in `cervello/test/tasso-di-chiusura.test.mjs`.

Poi ci sono 20 su `pannello/src` e il resto sparso.

## Come si converte, in concreto

Le prove nuove vivono in **`cervello/prove-difetti.mjs`**, una funzione per difetto, invocate come `node cervello/prove-difetti.mjs --ar-NNN`. Aggiungi le tue lì: **una casa sola**. Il motivo è vincolante — `cervello/forma-prova.mjs` ammette solo `node cervello/<script>.mjs [--flag]`, senza valori dopo il flag.

Ogni prova deve:
- **eseguire qualcosa** (far girare un guardiano, estrarre ed eseguire un blocco di script, esercitare una funzione in un processo isolato, ricostruire un repo finto);
- uscire **0 riparato · 1 aperto · 2 non misurabile**;
- **dire il perché**, non solo il verdetto.

Poi ogni prova va aggiunta a **`cervello/test/prove-a-due-versi.test.mjs`**, che simula il fix su una copia e pretende che il verdetto **si ribalti**. Usa `PROVE_DIFETTI_RADICE` per puntare la prova su una copia temporanea: non toccare mai file veri in un test.

Infine ogni difetto convertito vuole il suo **mutante** in `cervello/mutanti.json`. Il mutante rompe il *rilevatore*, non il fix: quello non esiste ancora. Rompendolo, la prova a due versi deve diventare rossa.

## Le trappole in cui sono caduta io. Leggile: le hai già pagate

**Due verdi falsi di fila, costruendo le prove del primo lotto.**

1. Ritagliavo un pezzo di script partendo da dentro un `if/else`. Bash moriva su `else` alla decima riga. Il file sporco sopravviveva, e la prova diceva «riparato» — non perché il codice lo protegga, ma perché **non ci era mai arrivato**. Rimedio, già dentro il codice: si ritaglia da un punto bilanciato e si controlla che il pezzo stia in piedi.

2. Ho aggiunto un sigillo per dimostrare l'arrivo al punto pericoloso. Ma il `git` finto intercettava il `checkout -f` senza eseguirlo, quindi il file sopravviveva **per costruzione**. Il sigillo provava l'arrivo, non la salvezza. Rimedio: il finto comando **fotografa lo stato nell'istante** in cui l'operazione distruttiva starebbe per partire, e il verdetto guarda quella fotografia.

**Tre mutanti vuoti su sei**, al primo giro. Colpivano righe che l'esecuzione non raggiunge mai: sembravano difese e non lo erano. Scrivere un mutante non basta — **guarda che rompa qualcosa**, uno per uno.

**Un modulo che ti spegne il processo.** `sentinella-dati.mjs` esegue il suo `main()` al caricamento e chiama `process.exit`. Importarlo dentro una prova uccide chi la sta eseguendo, e tutte le altre prove muoiono con lei sembrando passate. Esercita i moduli in un processo a parte.

**Scrivere JSON con lo strumento sbagliato.** `apprendimento.json` e `mutanti.json` usano **un solo spazio** di rientro. `JSON.stringify(…, 2)` li riscrive interi e l'archivio delle lezioni passa il tetto di lettura di GitHub. Usa sempre `scriviJsonAtomico` da `cervello/scrivi-json.mjs`, che conserva il rientro del file.

**Comandi di sola lettura che scrivono.** Non lanciare `verifica-sensori.mjs`, `conta-blocco-mancante.mjs` o `costo-ai.mjs` da una sessione senza le chiavi: riscrivono la memoria della macchina con la cecità locale, e il voto *migliora* perché la finestra si è ristretta (AR-568). Se ti scappa, ripristina quei file con `git checkout --`.

## Prima di dire «fatto»

```bash
node cervello/prove-difetti.mjs                      # tutte le prove, a voce
node --test cervello/test/prove-a-due-versi.test.mjs # il ribaltamento
node cervello/test-cervello.mjs                      # 157 file, tutti verdi
node cervello/cancello-lotto.mjs --solo-prove        # deve dire SI PUÒ CONSEGNARE
node cervello/cancello-lotto.mjs --aggiorna-tetti    # abbassa prova_debole se è sceso
node cervello/gate-veri.mjs
node cervello/cantiere-integrita.mjs
```

E **verifica ogni mutante a mano**: applicalo, lancia il suo test, pretendi il rosso, ripristina. Se uno resta verde, è vuoto: spostalo su una riga che l'esecuzione raggiunge.

## Come si consegna

Ramo nuovo dal `main` aggiornato. Commit col messaggio scritto in italiano parlato — niente sigle nel titolo. **Apri sempre la PR**, non aspettare che Nicola la chieda.

Registra l'esito nel quaderno: `node cervello/chiusura-loop.mjs registra ad "…" "…" "<atteso>" "<reale>" "#conversione-prove"`. Poi scrivi in `DECISIONI.md` cosa hai convertito, cosa hai dichiarato umano e **quanti ne restano**.

Nel messaggio finale a Nicola: i tre blocchi in cima (*In parole semplici* · *Cosa cambia per te* · *Cosa devi fare*), poi **Cosa non ho verificato**. Le sigle `AR-…` e i percorsi solo sotto la riga *Dettagli tecnici*.

## Il metro per capire se il lotto è riuscito

Non è quante prove hai convertito. È questo: **prendi una prova nuova, simula il fix, e guarda se diventa verde. Poi togli il fix e guarda se torna rossa.** Se non si ribalta, non hai convertito niente — hai solo cambiato la forma del grep.

---

*(fine del prompt)*
