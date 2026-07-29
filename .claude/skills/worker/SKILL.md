---
name: worker
description: >-
  Aprila per guardare A FONDO il worker e il VPS — l'organo che esegue davvero i lavori della
  macchina. Vale ogni volta che il worker è fermo, lento, in crash, non prende i lavori dalla coda,
  non risponde in chat, non pubblica la memoria, riparte da solo, o quando `salute` ha trovato
  qualcosa di rosso su quell'organo e serve la causa vera. Copre: servizi e timer systemd, coda e
  claim dei lavori, orfani, lock, allineamento git, kill-switch della pausa, quota/credenziali del
  motore AI, log e riavvii. NON è la diagnosi rapida (quella è `salute`), NON è la riparazione
  (quella è `cantiere`), NON è il marketplace.
---

# Radiografia del worker — il mansionario

> Il worker è l'unico organo che **esegue**. Se il cervello sbaglia si vede in un file; se il worker
> si ferma, l'azienda si ferma e basta. Ed è anche l'organo più difficile da guardare: metà delle sue
> prove esistono solo sulla macchina vera.

---

## Prima di tutto: da dove stai guardando

Questa è la domanda che decide cosa puoi affermare. Non saltarla.

| Da dove | Cosa vedi | Cosa NON puoi dire |
|---|---|---|
| **VPS** (`/opt/mycity/ad-mycity`) | tutto: `systemctl`, `journalctl`, `.env`, disco, lock, processi | — |
| **Claude / cloud** | solo il riflesso: coda e battito su Supabase, referto pubblicato in git, la Cabina, i commit del VPS | «il servizio è attivo», «il servizio è morto» — **non hai guardato nessun servizio** |

Da Claude non esiste un accesso al VPS. Quindi da qui ogni affermazione sui servizi vale ⚪ **non
visto**, e la diagnosi si fa **per tracce**: cosa ha scritto il VPS, quando, e cosa ha smesso di
scrivere. Un worker morto lascia sempre la stessa impronta — **il silenzio a orario**: i timer
scrivono a cadenza fissa, e la cadenza che si interrompe è il primo indizio, non l'ultimo.

---

## Le dimensioni da guardare

Non serve farle tutte ogni volta: parti dal sintomo e scendi. Ognuna ha la sua prova.

### 1 · Il servizio è vivo (VPS)
```bash
systemctl is-active mycity-worker mycity-worker-chat
systemctl show mycity-worker -p NRestarts --value      # >20 = crasha all'avvio, non "gira"
journalctl -u mycity-worker -n 60 --no-pager
```
**Attivo non è sano.** Un servizio che riparte ogni 40 secondi è `active` ogni volta che lo guardi.
Il numero dei riavvii dice la verità che lo stato nasconde.

### 2 · La coda scorre (ovunque, se hai le chiavi memoria)
Il punto che conta non è quanti lavori ci sono: è **da quanto** sono lì.
- `in_attesa` più vecchio di ~15 min → nessuno lo prende: claim rotto, worker fermo, o pausa attiva.
- `in_corso` da più di ~45 min → un worker è morto **a metà lavoro** e ha lasciato il lavoro appeso.
- nessun lavoro `completato` nelle ultime ore mentre ce n'erano di pronti → la catena è interrotta.

Lo stato «in corso» che nessuno chiude è il guasto più costoso: da fuori sembra che stia lavorando.

### 3 · Il claim è atomico
Due prese dello stesso lavoro devono lasciarne vincere **una**. Prova reale, non lettura del codice:
`cervello/test/due-worker.bats`. Se il claim si rompe, il sintomo che vedi non è "doppio lavoro": è
**il doppione silenzioso** — due risposte, due commit, due card.

### 4 · Gli orfani non tornano indietro da soli
Un lavoro rimasto a metà (`esegui-azione`, `proposta`) NON deve tornare `in_attesa` da solo: deve
finire in «riapprova». Un orfano che si ri-accoda da solo **riesegue un'azione che Nicola aveva già
firmato una volta** — è la strada più corta per fare due volte una cosa che tocca il mondo.
Prova: `cervello/vps/recupera-lavori-orfani.sh` + i bats del worker.

### 5 · Il lock e il doppio giro
Due giri insieme si pestano sulla stessa memoria. Cerca `flock`, il timeout (un lock senza timeout
appende tutto per sempre) e chi lo rilascia se il processo muore. Un lock lasciato da un morto ferma
la macchina in modo perfettamente silenzioso.

### 6 · L'allineamento git — dove si perde il lavoro
Il worker committa e pubblica la memoria. Qui i guasti non si vedono: **si perdono**.
- `checkout -f -B` che scarta commit non ancora pushati (AR-028)
- `watch-main` che riavvia il worker anche quando il remoto è uguale al locale (AR-027)
- scritture pendenti di un run morto: vanno recuperate **passando dal cancello**, non pubblicate al volo

Guarda `git log origin/main --author="AD MyCity" -20` e chiediti: la cadenza è regolare? Un buco
nella serie è un giro morto che nessuno ha notato.

> **La firma dei commit prigionieri** (vista il 29/7): l'aggiornamento del VPS stampa
> `! [rejected] HEAD -> main (non-fast-forward)` e poi *«commit del server non pubblicati: NON
> allineo — N commit restano qui»*. Non è un errore di rete: le due storie sono **divergenti**, il
> VPS ha lavorato e il suo lavoro non è mai uscito di casa. Da fuori la macchina sembra morta pur
> avendo N commit di memoria dentro. Lo script fa la cosa giusta a fermarsi — un `checkout -f` qui
> cancellerebbe quel lavoro — quindi si misura prima (`git log origin/main..HEAD` e il suo
> contrario) e poi si **unisce**, mai si forza. Finché quel push non passa, il VPS resta aggiornato
> a una versione vecchia del codice: ogni `install-*.sh` che lanci installa i file di prima.

### 7 · Il kill-switch della pausa è fail-closed
Se la lettura della pausa **fallisce**, il worker NON deve prendere lavori. Un fail-open qui vuol
dire che la macchina lavora mentre Nicola crede di averla fermata: è il difetto peggiore
dell'organo, perché rompe la fiducia, non il codice.

### 8 · Il motore AI: quota, credenziali, timeout
Un worker sanissimo con la sessione Claude scaduta sembra rotto e non lo è. Le firme stanno già in
`cervello/retry-policy.mjs` (`classificaErrore`) e in `/api/worker-salute`: quota, auth, rete.
**La cura è diversa per ognuna** — ritentare su un `auth` è tempo buttato: serve
`cervello/vps/collega-claude.sh`, cioè le mani di Nicola.

### 9 · I timer fanno quello che dicono (VPS)
```bash
systemctl list-timers 'mycity-*' --all
```
Confronta `NEXT`/`LAST` con quello che la memoria mostra: un timer `enabled` che non ha mai fatto
partire il suo servizio è peggio di un timer spento, perché nessuno lo va a controllare.

### 10 · Il corpo: disco, memoria, processi zombie (VPS)
`df -h`, `free -m`, processi `node` orfani. Un disco pieno si presenta travestito da mille altri
guasti — controllalo presto, costa un secondo.

### 11 · Il ponte verso Claude
Il VPS deve **pubblicare** il proprio referto (`auto-coscienza/salute.json`, sezione `vps`). Se quel
file è vecchio, non è un dettaglio: è la prova che il VPS non si sta più visitando. Da Claude quello
è spesso l'unico rosso che puoi vedere — e vale.

---

## Come si conduce

1. **Parti dal sintomo**, non dall'elenco. «La chat non risponde» → 1, 2, 8. «I dati del Pannello
   sono vecchi» → 6, 9, 11. «Ha rifatto una cosa due volte» → 3, 4.
2. **Ogni ipotesi va rotta prima di crederci.** Trova il fatto che la smentirebbe e cercalo davvero.
   Se non lo trovi, l'ipotesi regge; se non puoi cercarlo da dove sei, l'ipotesi resta **ipotesi** e
   lo scrivi.
3. **Scendi alla causa radice.** «Il worker era fermo» non è una causa: è quello che ha visto Nicola.
   La causa è *perché* si è fermato e *perché nessuno se n'è accorto* — la seconda vale più della prima.
4. **Distingui sempre tre esiti:** ✅ provato · ❌ rotto · ⚪ non l'ho potuto vedere da qui, e perché.
5. **Un difetto che è già in `malattie.json`** ha già la sua cura: applicala, non riscoprirla.

## Cosa consegni

- **I difetti nel cantiere** (`MyCity-Vault/90-Memoria-AI/auto-coscienza/cantiere-difetti.json`): id,
  `causa_radice`, `fix_proposto`, e una `verifica` **comportamentale** (`{"comando": "node
  cervello/test/<nome>.test.mjs"}` o un `.bats`) — mai un pattern cercato in un file. Da lì li
  ripara la skill `cantiere`: è il suo ingresso.
- **Il report** in `consegne/audit/AAAA-MM-GG-worker.md`, ordinato per **impatto sulla crescita**:
  ciò che blocca un incasso → ciò che fa mentire il Pannello a Nicola → ciò che fa sbagliare la
  macchina da sola → il resto.
- **Le card 🔴** per ciò che solo Nicola può fare sul VPS (riavvii, chiavi, `collega-claude.sh`):
  comando esatto, incollabile, titolo detto a voce.

## Cosa NON fai mai

Non riavvii servizi, non tocchi `.env`, non fai deploy, non pubblichi, non svuoti la coda. Sono le
mani di Nicola (🔴). Tu porti la diagnosi e il comando pronto — l'organo è vivo, e si guarda senza
metterci le dita dentro.
