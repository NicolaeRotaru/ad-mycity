---
data: 2026-07-27 09:40
tipo: auto-radiografia COMPLETA (su comando di Nicola — "radiografia profonda e completa di AD/Pannello/worker/senior") — 24 senior in parallelo, ognuno col proprio agentType
dimensioni: 24 (12 macchina + 8 Pannello + 4 worker mai analizzate prima)
difetti: 170 (33 bloccanti · 107 gravi · 27 minori)
voto_salute_architettura: 0
---

# 🩻 Radiografia della macchina — 2026-07-27 09:40

Perimetro: **AD + Pannello + worker + senior**. 24 dimensioni, ognuna affidata al **senior del mestiere**
(è la prima volta che gli `agentType` veri vengono usati: prima erano revisori generici con un prompt di
ruolo), ognuna con i difetti già aperti in mano per non riscoprirli e per cercarne i fratelli. Ogni difetto
è stato riletto sui file reali prima di entrare qui: i falsi positivi sono stati scartati, e nel dubbio si
scarta.

**Quattro dimensioni non erano mai state analizzate prima**: quelle del worker. Era il buco più grande —
3.219 righe di shell che orchestrano 55 guardiani, coperte fino a ieri da una riga sola.

Archivio: `auto-coscienza/auto-radiografia.json` · nuovi difetti `AR-157`→`AR-326` in `cantiere-difetti.json`.

---

## ⚡ Quello che è rotto ADESSO

**Il giro non pubblica più la memoria dal 25 luglio.** Lo scanner dei segreti trova una chiave dentro un
test — ma è una chiave **finta**: una stringa che dice letteralmente «finta per il test», messa lì apposta
per verificare che l'invio email non parta senza firma. Lo scanner riconosce il prefisso e blocca tutto:
`scan-segreti.mjs` esce 1 → `giro.sh:713` → `giro.sh:785` → il giro si ferma prima di pubblicare.

Quello che continua ad arrivare su `main` passa dalle strade che quel cancello lo saltano. I commit
`recupero: scritture pendenti da un giro interrotto`, ogni due ore da due giorni, sono la firma del
problema. **Fix: una riga.** (AR-270)

**Da domani la macchina inizia a dimenticare.** Il decadimento della memoria è calcolato per *esecuzione*,
non per *tempo*: dal 28/7 le lezioni oltre i 28 giorni muoiono in circa 4 giri — poche ore. Tutto quello
che l'azienda ha imparato a giugno può sparire in una mattinata senza che nessuno lo decida.

**La scheda Apprendimento mostra 0 lezioni su 476, e dice che va tutto bene.** `apprendimento.json` pesa
1.128.689 byte; il Pannello in produzione legge la memoria dalla Contents API di GitHub, che sopra 1 MB
non dà errore — risponde 200 con il contenuto vuoto. `obsidian.ts:97` gestisce 404, 401, 403 e 5xx, ma non
il file troppo grande. Quando il decadimento sgonfierà il file la scheda tornerà a funzionare da sola:
sembrerà risolto, sarà stato risolto buttando via la memoria.

---

## 🔓 Il cancello che non chiude

Alla domanda «esiste un percorso in cui un'azione che tocca soldi o clienti parte senza la firma di
Nicola?» la risposta verificata è **sì, per più strade indipendenti**.

- **Il Pannello non ha serratura** — 33 handler che modificano lo stato in 30 file di route; uno solo ha un
  controllo in ingresso. Nessun `middleware.ts`. Chi ha l'indirizzo può spegnere la PAUSA, accendere
  l'autopilota, e via `POST /api/lavori` iniettare istruzioni nel prompt dell'agente sul VPS. (AR-226)
- **C'è una porta che firma al posto di Nicola** — `POST /api/approva`, route orfana senza un solo
  chiamante, scrive `azione:<id>:firma = "nicola …"`: esattamente il valore che `consenso-azione.mjs:172`
  accetta come consenso umano per l'invio LIVE. Nessuna idempotenza. (AR-227)
- **Chi esegue può scriversi il permesso** — il marcatore nel file, scritto dalla macchina, vince *prima*
  della firma dal Pannello. In coda ci sono già 7 «APPROVATA» e 14 caselle spuntate. (AR-205)
- **Il colore che autorizza è testo libero** — `autopilota.ts:27` usa il 🟢 dichiarato nel markdown come
  unica condizione per eseguire senza firma. La macchina scrive l'azione, ne dichiara il colore, la esegue.
- **La firma può agganciarsi all'azione sbagliata** — il codice cerca l'azione per numero, e il numero
  combacia anche con l'orario scritto nel titolo. (AR-271)
- **Il merge in produzione non passa dal consenso** e ha un'opzione che salta il freno. (AR-272)

**Va detto anche cosa non è:** oggi le mani verso il mondo reale sono in gran parte scollegate — Resend
senza chiave attiva, Telegram non configurato — quindi il danno concreto possibile *ora* è molto minore del
rischio strutturale. Ma è una protezione che deriva dal fatto che la macchina è a metà, non da un cancello.
Il piano è collegare le mani: **queste vanno chiuse prima, non dopo.**

> 🔴 **CONFERMATO ATTIVO — 27/7 10:05.** Nicola ha aperto l'indirizzo del Pannello in una finestra in
> incognito, senza login: **la Cabina si è aperta normalmente.** Non è un rischio strutturale che si
> materializzerà quando le mani saranno collegate — è raggiungibile da chiunque abbia l'indirizzo, adesso.
>
> **Mitigazione immediata, senza codice e senza deploy:** Vercel → progetto `ad-mycity` → Settings →
> Deployment Protection → **Vercel Authentication = Enabled**. Chiude tutti e 33 gli handler in un colpo.
> Il `middleware.ts` resta necessario dopo, perché la protezione Vercel copre l'ingresso ma non la
> segregazione fra chi propone e chi firma — che è l'altra metà del problema.

---

## 🪞 La macchina si dà i voti da sola, con un metro che non può bocciarla

È il filo conduttore, trovato **indipendentemente da tre senior diversi su tre dimensioni diverse**. Non è
un caso isolato: è il modo in cui questa macchina si autovaluta.

| Dove | Il metro | Perché non può fallire |
|---|---|---|
| `giro.sh:894-914` | l'esito del giro | i 15 vincoli hard finiscono solo nel *testo del prompt*; l'exit code non li guarda. Il giro si dichiara completato a controlli tutti rossi (AR-300) |
| `sonda-volano.mjs:104-111` | «il volano si chiude» | conta gli esperimenti aperti come prova — e un altro cancello obbliga ad averne sempre almeno uno (AR-177) |
| `stampo-check.mjs` | i kit dei senior | soglia a 5.200 byte, 82 byte sotto il kit più piccolo esistente: nessun kit può fallire. E conta «installato» anche un quaderno vuoto — 73 su 120 lo sono |
| `north-star-check.mjs:31` | il freno sulla stella polare | una regex che salta gli a-capo e cattura il numero sbagliato: legge «~9h» invece dei giorni di stallo. **Spento da un mese, con 0 ordini pagati** (AR-319) |
| `calibrazione.mjs` | le previsioni | nascono già chiuse: chi le scrive conosce già il risultato — 37 voci su 42 hanno `creato == chiuso_il` (AR-168) |

Su 20 vincoli del giro, **15 sono decorativi**. Dei 5 veri, l'unico che vive dentro il prompt è
`coerenza-fatti`, e solo perché ha un gemello rieseguito dopo l'AI che blocca il push. Gli altri cancelli
veri (scan-segreti, vault-sanità, il kill-switch PAUSA) stanno tutti fuori.

**Conseguenza da tenere a mente leggendo il resto:** finché l'esito del giro non legge i propri controlli,
nessun numero di salute della macchina è affidabile — incluso il voto di questa radiografia.

---

## 📱 Il Pannello — i tre sintomi segnalati da Nicola, tre cause diverse

| Cosa si vede | Dove | Perché |
|---|---|---|
| Il tasto indietro porta altrove | `page.tsx:1011-1014` | il Worker si apre a tutto schermo senza timbrare la cronologia: l'indietro naviga l'area *sotto*, invisibile, e al terzo colpo chiude la PWA. Non c'è nemmeno la X, e non esiste un tasto Esc in tutto il Pannello (AR-240, AR-218) |
| Le risposte spariscono cambiando chat | `page.tsx:1657-1673` | `setConvId` senza guardia sulla chat corrente: la risposta viene salvata **sotto la chat sbagliata**. Non è persa, è nel posto sbagliato (AR-265) |
| Le liste non si aggiornano | `lib/panel-sync.ts:82` | il refresh parte solo se il browser ha *visto* il lavoro cambiare stato: un lavoro nato e finito mentre la scheda è in secondo piano viene scartato (AR-235) |

E tre modi per ritrovarsi lo **schermo bianco**: non esiste alcun `ErrorBoundary`, quindi una sola scheda in
errore porta via tutta la Cabina; se il giro scrive le domande come frase invece che come elenco, bianco; se
nella lista dei difetti c'è una riga vuota, bianco (AR-251, AR-252, AR-253).

Sul telefono, che è come lo usa Nicola: le azioni da firmare si aprono **tutte insieme, 51 schede una sotto
l'altra**, circa 40 schermate di scorrimento — e il pattern accordion preferito esiste già in casa, in altre
due schede (AR-219). La chat si blocca un attimo **ogni 8 secondi** per ricontrollare tutte le conversazioni
sul thread principale (AR-246). La scheda dell'apprendimento si riscarica intera ogni 30 secondi: circa
**41 MB all'ora** di dati del telefono (AR-247). E un solo tap può creare due lavori, perché il ritentativo
dopo 4 secondi non ha chiave di idempotenza — il doppione nasce al confine della creazione, non al bottone.

---

## 💶 I soldi

Con 302 €/mese di burn, 200 dei quali di Claude, e 0 ordini consegnati, questa è la dimensione che paga il
conto — ed è cieca.

- **Il freno del budget legge un contatore sempre a zero** (`giro.sh:479`): `.oggi.token_totali` è 0 in tutti
  i 17 giorni di storico. Il fix è atterrato nel produttore, non nel consumatore. (AR-196)
- **Il worker non conta mai i token spesi**: zero chiamate al contatore in 1.511 righe. Chat, metabolizzazioni,
  lavori e i sotto-agenti di ogni radiografia — tutto fuori misura.
- **La stima di costo è finta dove non sa**: `durata × 5.000` con un pavimento fisso di 50.000 token; oggi
  4 voci su 12 sono *esattamente* il pavimento.
- **I 200 € di Claude non sono in nessun budget**: `budget-reparti.json` sorveglia 9 reparti che spendono 0 €
  e non ha una riga per il 66% del burn.
- **Peso morto in ogni chiamata**: ~9.100 token di organigramma duplicato (76 descrizioni su 120 ricopiate in
  CLAUDE.md) e fino a ~250.000 token di memoria append-only — `STATO.md` è a 437 KB, di cui il 57% note di chat.

Alla domanda «quanto costa un giro e quanto vale?»: **il costo non si sa e il valore non si misura.**

---

## 🎯 Dove sta andando il lavoro

La macchina **non sta più producendo asset inutili** — la produzione business si è quasi azzerata dal 21/7.
Sta facendo una cosa diversa: **lavora al 76,7% su sé stessa**, mentre ogni giro si auto-inietta il vincolo
«produci SOLO azioni che avvicinano il primo ordine». Il sensore che misura quel 76,7% esiste già
(`allocazione-check.mjs`) — ha il cancello spento e non parla con il vincolo. Regola e misura non si
incontrano mai.

Sotto ci sono due difetti che reggono tutto: gli OKR assegnano **123 KPI** (82 aggiunti per chiudere un
guardiano), il che rende la regola del ritorno un filtro che non scarta nulla; e il piano a 12 mesi prometteva
**80 ordini a luglio** — reali: 0 — ed è ancora citato come fonte.

E il difetto più scomodo: **l'unico ordine che proverebbe che i soldi arrivano davvero al negozio** (3-5 €,
dal telefono di Nicola, dichiarato «per testare la macchina end-to-end») è finito congelato dentro il blocco
negozi del 23/7 — che riguardava l'*inserimento* di nuovi negozi, non il test. Il payout a un venditore non è
mai stato eseguito nemmeno una volta. (AR-157)

---

## 📉 Il voto non misura più niente

Il voto di salute è **0/100**. Lo era anche il 23 luglio. Non è un caso: con 170 difetti la penalità calcolata
è **1.976** su una scala che si ferma a 0, e `voto_pieno` risulta 0 in **80 snapshot su 80**.

Significa che il numero in prima pagina non distingue «grave» da «catastrofico», e soprattutto **non può
mostrare se si sta migliorando**: chiudi dieci difetti, resta 0. Il trend ▲▼= è cieco per costruzione. Va
normalizzato, o mostrato come punteggio grezzo con la sua scala.

**E la prova di chiusura può mentire.** AR-144 risulta chiuso perché il suo controllo cercava un *pattern nel
codice*, non un *comportamento*: la stringa è comparsa, il difetto è stato chiuso da solo, e il freno legge
ancora un contatore a zero. Fra i 72 difetti che risultano chiusi, un numero ignoto può essere nella stessa
condizione. È il meccanismo su cui si regge tutto il cantiere.

---

## ✅ Cosa si chiude (con prova)

- **AR-138, AR-139, AR-114** — chiusi, verificati.
- **AR-108** — proposto chiuso: i sensori di uptime di sito e Cabina sono verdi da 8 giorni (HTTP 200, zero
  giri ciechi). Resta aperto solo per una riga di documentazione mai scritta.
- **AR-105** — ristretto, non chiuso: due sensori su tre ora funzionano, resta Telegram, spento per inerzia
  e non per decisione.
- **AR-145 resta APERTO.** Un senior proponeva di chiuderlo perché il sintomo non si vede da tre giorni,
  dichiarando onestamente che il fix non era stato fatto. Un altro ha trovato la causa viva:
  `sentinella-lavori.mjs:214-216` rimette in coda il lavoro senza contatore né tetto, e `retry-policy.mjs:59-64`
  classifica come «limite di quota» qualunque testo contenga la parola *quota* (provato: «quota di mercato» →
  6 ritentativi → 1+6 = **7 esecuzioni**, esattamente le sette raffiche osservate). Vince chi ha la prova.
- **AR-148** — era stato chiuso dichiarando 14 rischi su 14 con sentinella. Sono **8 su 14**.

---

## 🔭 Cosa resta fuori

Sito e design del **marketplace**: il repo non è collegato in questa sessione. Là ci sono **87 difetti aperti
e zero chiusi da tre settimane** — la macchina si ri-radiografa ogni 10 giorni, il prodotto mai. Servono i
comandi `collega il marketplace` → `radiografia` → `radiografia del design`.

---

## Le mosse, in ordine

0. **🔴 SUBITO — chiudere l'ingresso del Pannello.** Vercel → `ad-mycity` → Settings → Deployment
   Protection → Vercel Authentication = Enabled. Trenta secondi, nessun codice, nessun deploy, e i 33
   handler aperti si chiudono tutti insieme. È l'unica azione che toglie il rischio *oggi*; tutto il
   resto arriva al prossimo merge. Tocca l'account di Nicola: la fa lui.
1. **Sbloccare la pubblicazione della memoria** — una riga nello scanner. Senza, ogni giro continua a non pubblicare.
2. **Mettere la serratura nel codice** — un solo `middleware.ts` chiude i 33 handler in modo permanente,
   e serve comunque dopo il punto 0: la protezione Vercel copre l'ingresso, non la segregazione fra chi
   propone e chi firma.
3. **Congelare la memoria prima del 28/7** — o le lezioni di giugno spariscono in poche ore.
4. **Far leggere al giro i propri controlli** — promuovere a exit code i 3-4 vincoli che contano davvero,
   sullo schema di `MEMORIA_INCOERENTE`, che già funziona.

Dalla 1 alla 4 sono 🟡: stanno in `AZIONI-IN-ATTESA`, pronte, e non parte niente senza la firma di Nicola.

---

## Nota finale: questa radiografia ha faticato a consegnarsi

Due difetti trovati **mentre pubblicavo**, entrambi in `git-github.mjs`, entrambi nel cantiere:

- `git-pr.mjs` muore con `ENOBUFS` sui commit grandi (`execFileSync` senza `maxBuffer`, righe 110-114) —
  cioè si rompe proprio sui giri che valgono di più. Aggirato facendo il rebase a mano. (AR-327)
- `gitAuthUrl` (righe 141-143) punta sempre a `github.com` col token e non ha fallback sul remote già
  autenticato: **una sessione cloud non può pubblicare**, anche se `CLAUDE.md` prevede esplicitamente di
  lanciare il giro da lì. (AR-328)

Messi insieme: esiste un modo documentato di far girare la macchina che è strutturalmente incapace di
consegnare il proprio risultato. Questa radiografia è arrivata a Nicola perché gliel'ho mandata a mano,
fuori da git.
