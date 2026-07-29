---
name: salute
description: >-
  Aprila per controllare che la macchina stia funzionando: worker, cervello/AD, Cabina, i 120 senior,
  sensori e mani. Vale ogni volta che Nicola — comunque lo dica — chiede se tutto sta funzionando, se
  è tutto a posto, se qualcosa è rotto o fermo, un controllo generale, un checkup, «la macchina sta
  bene?», «il worker gira?», «funziona ancora tutto?», o dopo un rilascio per vedere se ha rotto
  qualcosa. Non si ferma alla diagnosi: apre la radiografia giusta sull'organo malato, passa i
  difetti a `cantiere` perché li ripari, e ricontrolla finché il rosso torna verde. NON è il giro
  operativo, NON è l'audit del marketplace, NON è la riparazione del cantiere (quella la chiama).
---

# La visita della macchina — il mansionario

> **Il lavoro non finisce quando trovi il guasto. Finisce quando il controllo che era rosso torna
> verde.** Una visita che consegna un elenco di problemi ha fatto metà del lavoro e la metà facile.

---

## Il giro, in quattro passi

```
① VISITA → ② APPROFONDISCI → ③ RIPARA → ④ RICONFERMA → (se ancora rosso, si ricomincia da ②)
```

Nessun passo si salta. Il terzo senza il quarto è il modo classico di chiudere un difetto che non è
chiuso.

---

## ① Visita

```bash
node cervello/salute.mjs              # rapida (~2s) — sempre
node cervello/salute.mjs --completo   # + test, guardiani, rete (~qualche minuto)
node cervello/salute.mjs --vps        # + systemd, timer, log — solo sulla macchina vera
node cervello/salute.mjs --json       # per te, quando devi ragionarci sopra
```

Exit `0` a posto · `1` c'è un rosso (anche un suo controllo rotto) · **`2` ho visto troppo poco per
dire che va bene** — e `2` **non è** `0`.

**Rapida sempre, profonda dove qualcosa è cambiato.** Non lanciare `--completo` per abitudine: si
apre quando la rapida trova un rosso, quando hai appena rilasciato, o quando Nicola chiede a fondo.

### Le due case, e il ponte

| Da dove | Cosa vede | Cosa non può dire |
|---|---|---|
| **VPS** | tutto: servizi, timer, coda, chiavi, log | — |
| **Claude** | il riflesso: memoria, Cabina, git, il referto pubblicato dal VPS | niente sui servizi: da qui non esistono |

Il VPS pubblica la sua visita in `auto-coscienza/salute.json` (sezione `vps`); da Claude la leggi.
**Se quel referto è vecchio, quello è il rosso più importante della giornata:** vuol dire che lassù
nessuno controlla più niente.

Il ponte da solo però non basta — alla prima visita non esiste ancora, e un referto che non arriva
può voler dire tutto. Perciò c'è un secondo indicatore che **funziona sempre, anche senza una
chiave**: le **tracce** che i processi automatici lasciano nel repo (`sentinella-dati`, `esito-giro`,
`costo-ai`, `delta-gate`, `ultimo-briefing`). Si legge l'orario scritto *dentro* il file, mai la data
del filesystem: in un clone fresco tutti i file sono di oggi e sembrerebbe tutto vivo.

> **Timer che scattano ≠ macchina che lavora.** Il 29/7 i timer del ritmo partivano regolarmente e
> le tracce erano ferme da 35 ore: il guasto non era nel timer ma in quello che ci gira dentro — il
> motore AI scollegato. Quando vedi questa combinazione, vai dritto al punto ⑧ della skill `worker`
> (quota / credenziali), non ai servizi. Le due sezioni non si sovrascrivono mai a vicenda: ogni casa scrive la
sua e legge l'altra. Se le due case dicono cose diverse sullo stesso controllo, **quella differenza è
un difetto** (di solito env diverse) e va indagata, non mediata.

## Le tre risposte — la legge della visita

|  | Significa | Errore da non fare |
|---|---|---|
| ✅ | l'ho provato e funziona | dirlo senza la prova |
| ❌ | l'ho provato ed è rotto | — |
| ⚪ | **non l'ho potuto vedere da qui**, ed ecco perché | farlo passare per verde |

Cinque regole che tengono in piedi tutto il resto:

1. **⚪ non è mai ✅.** Un controllo che non hai potuto fare è un buco dichiarato, non una buona
   notizia. (È la stessa legge di AR-035/AR-281: non si scrive uno stato che non si è misurato.)
2. **Dichiara sempre la copertura.** «8 controlli su 14, copertura 57%». Zero rossi su tre controlli
   non è «la macchina sta bene».
3. **Ogni verde cita la sua prova** — il comando e cosa ha visto. Un verde senza prova è un'opinione.
4. **I verdi scadono.** Una prova di tre giorni fa non dimostra che adesso funziona: se la usi, dillo
   con la data accanto.
5. **Non fidarti di te.** Se un controllo non parte (file mancante, timeout, eccezione) è 🔧 **un tuo
   guasto**, conta come rosso, e va detto in testa al referto: un controllo rotto sembra un verde.

## ② Approfondisci — chi chiami

La visita dice *dove* fa male, non *perché*. Il perché lo trova la radiografia dell'organo.

| Organo rosso | Apri |
|---|---|
| Worker, coda, VPS | skill `worker` |
| Cervello, memoria, guardiani, processi | skill `auto-radiografia` |
| Cabina | skill `audit-pannello` |
| I 120 senior | skill `senior` |
| Sito marketplace | skill `analizza-marketplace` / `radiografia` / `audit-design` |
| Sensori e mani | `verifica-sensori.mjs` + `verifica-automazione.mjs`, poi senior `data-engineer` / `devops-sre` |

Se l'organo è chiaro ma la causa no, chiama il senior del mestiere (`devops-sre`, `backend-dev`,
`frontend-dev`, `security`, `qa`) invece di scavare da sola: sono già scritti per quello.

**Prima di aprire una radiografia, guarda in `cervello/malattie.json`.** Se questo sintomo lo hai già
avuto, la cura è già scritta: applicala, non riscoprirla.

## ③ Ripara — il cantiere è la porta

Non riparare da sola i difetti strutturali: la riparazione ha un suo mestiere, e ha regole (prova
comportamentale, mutazione, spazzata dei fratelli, cancello) che qui non si improvvisano.

**Come si consegna un difetto al cantiere:** scrivendolo in
`MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json` con
`causa_radice`, `fix_proposto` e una `verifica` **comportamentale**
(`{"comando": "node cervello/test/<nome>.test.mjs"}` — mai un pattern cercato in un file). Poi apri
la skill `cantiere`: lavora da lì, non dai messaggi.

Le regole della riparazione che restano tue:

- **Il colore lo decidi tu:** 🟢 fallo (reversibile, tuo) · 🟡 preparalo e avvisa (codice in branch)
  · 🔴 chiedi (VPS, produzione, chiavi, soldi). Nel dubbio sali di colore.
- **Un fix per volta, poi ricontrolla.** Cinque insieme e non sai quale ha funzionato.
- **Se la riparazione peggiora, torna indietro** e dillo: un rollback dichiarato vale più di un fix
  difeso.
- **Se non sai riparare, non fingere:** scrivi cosa hai provato, cosa hai escluso e cosa serve da
  Nicola.
- **Se un difetto è già tornato due volte, non ripararlo un'altra volta:** mettici un guardiano alla
  radice, o la terza volta arriva da sola.
- **Se il braccio manca** (skill assente, chiave mancante, VPS irraggiungibile) non ti blocchi:
  prepari la card con la diagnosi e il comando pronto, e lo dichiari.

## ④ Riconferma

Rilancia **lo stesso controllo** che era rosso — non un controllo simile, non «ho letto il codice e
sembra a posto». Se il fix tocca la Cabina o uno script `.sh`, la prova è la skill `verify`
(Playwright / bats): quello che si vede a schermo non si dimostra leggendo un diff.

Finché il controllo non torna verde, **il difetto è aperto** e si dice così.

---

## Le regole che le impediscono di diventare teatro

- **Ordina per soldi, non per gravità tecnica:** ciò che blocca un incasso → ciò che fa mentire il
  Pannello a Nicola → ciò che fa sbagliare la macchina da sola → il resto.
- **Se è tutto verde, sta zitta:** una riga. Una macchina che parla molto quando sta bene si impara
  a non leggere.
- **Titoli detti a voce:** «Il worker non prende lavori da sei ore», non sigle, ID o path — quelli
  scendono nel contenuto della card, per chi esegue.
- **Una card per problema, che si aggiorna.** Una card nuova a ogni visita è rumore che si ignora.
- **Guarda cosa è peggiorato da ieri**, non solo com'è oggi: la regressione isola il cambiamento, ed
  è il segnale più forte che hai.
- **Smaschera i tuoi falsi allarmi:** un controllo che grida sempre al lupo va corretto o spento
  **con il motivo scritto**. Un allarme che si impara a ignorare è peggio di nessun allarme.
- **Ogni rosso vero lascia una lezione in memoria**, così tra un mese non lo riscopri da zero.
- **Sotto pressione di tempo o budget taglia il volume delle prove, mai i controlli di verità e
  sicurezza.**

## Cosa tocca

**Controlli che riusa (non li riscrive):** `verifica-sensori` · `verifica-automazione` ·
`test-cervello` · `test-pannello` · `agent-registry-check` · `keyword-owner-check` ·
`coerenza-fatti` · `vault-sanita` · `scan-segreti` · `sensori-spenti-check` · `utilizzo-senior` ·
`chiusura-loop --sonda` · `sistema-immunitario` · `vps/diagnostica-completa.sh`.

**Legge:** `registro-fatti.json` · `cantiere-difetti.json` · `salute.json` · `storico-salute.json` ·
`malattie.json` · `chiusura-loop.json` · `STATO.md`.

**Scrive:** referto in `consegne/salute/` · `auto-coscienza/salute.json` (i semafori della Cabina) ·
card in `AZIONI-IN-ATTESA.md` · difetti nel cantiere · lezione in memoria · ESITO nel quaderno del
reparto (`node cervello/chiusura-loop.mjs registra …`).

**Interroga:** Supabase memoria (coda, battito) · la Cabina (`/api/cuore`, `/api/worker-salute`) ·
GitHub · systemd e journal (solo VPS).

**Chiavi che le servono per vedere:** `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` · `PANNELLO_URL` ·
`GIT_PUSH_TOKEN` · `MARKETPLACE_SUPABASE_*` · `STRIPE_SECRET_KEY`. Ognuna che manca è un ⚪ con il
nome della chiave scritto accanto — così Nicola sa cosa collegare per vedere di più.

## Cosa non fa mai

Non riavvia servizi, non fa deploy, non mergia, non svuota code, non scrive sul database del
marketplace, non manda email o messaggi veri. Le sonde usano dati finti e marcati. Non si modifica da
sola senza la firma di Nicola — nemmeno un fix banale su sé stessa.
